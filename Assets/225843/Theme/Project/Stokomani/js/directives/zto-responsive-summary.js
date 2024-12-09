(function () {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoResponsiveSummary", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    ztoResponsiveSummary,
  ]);
  function ztoResponsiveSummary(ModalStack, AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/zto-responsive-summary.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          scope.hasStore = !!window.__change.shortStore;
          scope.store = scope.hasStore
            ? window.__change.shortStore["common"]["title"]
            : null;
          scope.storeURL = scope.hasStore
            ? window.__change.shortStore["common"]["URL"]
              ? window.__change.shortStore["common"]["URL"]["canonical"]
              : ""
            : null;
          scope.menu = AjaxAPI.globalVar("mainMenu");
          scope.level = 0;
          scope.stack = [];
          scope.select = function (child) {
            scope.level += 1;
            scope.selected = child;
            scope.stack.push(child);
          };
          scope.goBack = function () {
            scope.level -= 1;
            scope.stack.pop();
            scope.selected = scope.stack[scope.stack.length - 1];
          };
          var options = {
            templateUrl: "/zto-responsive-summary-modal.twig",
            backdropClass:
              "modal-backdrop-data-rbs-website-menu-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-data-rbs-website-menu-responsive-summary modal-menu-mobile",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
})();
