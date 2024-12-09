(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsCatalogAddToCartConfirmationModalDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.continueShopping = function () {
                scope.modalContentMode = "closing";
                scope.$dismiss();
                window.__change.variantSelected = undefined;
              };
              scope.continueShopping = function () {
                scope.modalContentMode = "closing";
                window.__change.variantSelected = undefined;
                scope.$dismiss();
              };
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
