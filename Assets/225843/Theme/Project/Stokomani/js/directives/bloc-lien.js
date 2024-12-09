(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("blocLien", [
    "$window",
    "$rootScope",
    function ($window, $rootScope) {
      return {
        restrict: "A",
        templateUrl: "",
        link: function (scope, el, attrs) {
          const pageEnCours =
            $window.__change.navigationContext.detailDocumentId;
          const linkBuy = $window.__change.blockParameters.LinkHeader.linkBuy;
          const linkMag = $window.__change.blockParameters.LinkHeader.linkMag;
          if (pageEnCours == linkBuy || pageEnCours == 100457) {
            angular.element(".linkBuy").addClass("active-linkBuy");
          } else if (pageEnCours == linkMag) {
            angular.element(".linkMag").addClass("active-linkMag");
          }
        },
      };
    },
  ]);
})(jQuery);
