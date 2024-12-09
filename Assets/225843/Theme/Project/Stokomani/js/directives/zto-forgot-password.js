(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoForgotPassword", [
    "$window",
    "$rootScope",
    "RbsChange.AjaxAPI",
    function ($window, $rootScope, AjaxAPI) {
      return {
        restrict: "A",
        templateUrl: "/zto-forgot-password.twig",
        link: function (scope, el, attrs) {
          function createResetPasswordRequest(data) {
            scope.passwordError = null;
            scope.sending = true;
            AjaxAPI.postData("Rbs/User/User/ResetPasswordRequest", data).then(
              function () {
                scope.sending = false;
                scope.successSending = true;
              },
              function (result) {
                scope.sending = false;
                scope.successSending = false;
                scope.passwordError =
                  result && result.data && result.data.message;
                console.error("rbsUserCreateAccount", result);
              },
            );
          }
          scope.diplayResetBox = false;
          scope.sending = false;
          scope.successSending = false;
          scope.resetPasswordEmail = null;
          scope.passwordError = null;
          scope.openBox = function () {
            jQuery("#reset-password-modal-main-content-zento").modal({});
          };
          scope.invalidMail = function () {
            return !scope.resetPasswordEmail || scope.resetPasswordEmail == "";
          };
          scope.askReset = function () {
            createResetPasswordRequest({ email: scope.resetPasswordEmail });
          };
        },
      };
    },
  ]);
})(jQuery, window.localStorage);
