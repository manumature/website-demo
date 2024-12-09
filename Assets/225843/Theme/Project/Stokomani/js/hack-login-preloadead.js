(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserLoginZento", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parser = new UAParser();
      var ua = parser.getResult();
      scope.error = null;
      scope.data = {
        login: null,
        password: null,
        realm: scope.blockParameters.realm,
        rememberMe: true,
        device: ua.browser.name + " - " + ua.os.name,
      };
      scope.login = function () {
        scope.error = null;
        AjaxAPI.openWaitingModal();
        AjaxAPI.putData("Rbs/User/Login", scope.data).then(
          function (result) {
            var user = result.data.dataSets.user;
            var onLogin = attrs["onLogin"] || scope.blockParameters["onLogin"];
            if (onLogin === "reload") {
              window.location.reload(true);
            } else if (onLogin === "redirectToTarget") {
              window.location =
                attrs["redirectionUrl"] ||
                scope.blockParameters["redirectionUrl"];
            } else {
              var params = {
                accessorId: user.accessorId,
                accessorName: user.name,
              };
              $rootScope.$broadcast("rbsUserConnected", params);
              var parameters = angular.copy(scope.blockParameters);
              parameters.accessorId = user.accessorId;
              parameters.accessorName = user.name;
              window.location.reload(true);
            }
          },
          function (result) {
            AjaxAPI.closeWaitingModal();
            scope.error = result.data.message;
            scope.blockParameters.password = scope.blockParameters.login = null;
            console.error("[RbsUserLogin] login error", result);
          },
        );
      };
      scope.logout = function () {
        AjaxAPI.getData("Rbs/User/Logout").then(
          function () {
            window.location.reload(true);
          },
          function (result) {
            scope.error = result.data.message;
            console.error("[RbsUserLogin] logout error", result);
          },
        );
      };
      function reloadBlock(parameters, closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error("[RbsUserLogin] error reloading block:", error);
          },
        );
      }
      scope.togglePassword = function (event) {
        let target = event.target;
        let elem = target.previousElementSibling;
        if (elem) {
          if (elem.type == "password") {
            elem.type = "text";
          } else {
            elem.type = "password";
          }
        }
      };
    },
  ]);
})();
