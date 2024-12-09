(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsCatalogProductsListV3Directive", [
        "$delegate",
        "RbsChange.AjaxAPI",
        "$location",
        "$rootScope",
        "$timeout",
        "$compile",
        "$window",
        "ZtoSharedScope",
        function (
          $delegate,
          AjaxAPI,
          $location,
          $rootScope,
          $timeout,
          $compile,
          $window,
          ZtoSharedScope,
        ) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, element, attrs) {
              link.apply($delegate[0], arguments);
              const originalSortBy = scope.sortBy;
              scope.sortBy = function (sortBy) {
                originalSortBy(sortBy);
                const resetSortBy = ZtoSharedScope.get(
                  "rbsElasticsearchFacetContainerV2",
                  "resetSortBy",
                );
                resetSortBy(sortBy);
              };
              ZtoSharedScope.set(
                "rbsCatalogProductsListV3",
                "sortBy",
                function (sortBy) {
                  scope.sortBy(sortBy);
                },
              );
              ZtoSharedScope.set(
                "rbsCatalogProductsListV3",
                "sortOptions",
                scope.blockData.sortOptions,
              );
              ZtoSharedScope.set(
                "rbsCatalogProductsListV3",
                "currentSortBy",
                scope.blockData.currentSortBy,
              );
              function getFilteredProductCount() {
                const el = document.getElementById("pagination-product-count");
                return el && el.dataset && el.dataset.paginationProductCount
                  ? Number(el.dataset.paginationProductCount)
                  : 0;
              }
              scope.filteredProductCount = getFilteredProductCount();
              ZtoSharedScope.set(
                "rbsElasticsearchFacetContainerV2",
                "filteredProductCount",
                scope.filteredProductCount,
              );
              scope.itv = null;
              scope.$on("RbsElasticsearchUpdateAppliedCount", function () {
                if (scope.itv) {
                  $interval.cancel(scope.itv);
                }
                scope.itv = $interval(() => {
                  const newCont = getFilteredProductCount();
                  if (newCont != scope.filteredProductCount) {
                    scope.filteredProductCount = getFilteredProductCount();
                    ZtoSharedScope.set(
                      "rbsElasticsearchFacetContainerV2",
                      "filteredProductCount",
                      scope.filteredProductCount,
                    );
                  }
                }, 1000);
              });
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
