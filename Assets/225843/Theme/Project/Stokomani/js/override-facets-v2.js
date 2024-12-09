(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsElasticsearchFacetContainerV2Directive", [
        "$delegate",
        "RbsChange.ModalStack",
        "$window",
        "ZtoSharedScope",
        "$interval",
        function ($delegate, ModalStack, $window, ZtoSharedScope, $interval) {
          var directive = $delegate[0];
          directive.compile = function () {
            return function (scope, element, attrs) {
              scope.responsiveModal = function () {
                var options = {
                  templateUrl:
                    attrs["responsiveModalTemplate"] ||
                    "/rbs-elasticsearch-facet-responsive-modal.twig",
                  backdropClass:
                    "modal-backdrop-rbs-elasticsearch-facet-responsive",
                  windowClass:
                    "modal-responsive-summary modal-rbs-elasticsearch-facet-responsive modal-responsive-filters-container",
                  scope: scope,
                };
                ModalStack.open(options);
              };
              scope.sortOptions = ZtoSharedScope.get(
                "rbsCatalogProductsListV3",
                "sortOptions",
              );
              scope.currentSortBy = ZtoSharedScope.get(
                "rbsCatalogProductsListV3",
                "currentSortBy",
              );
              const originalSortBy = ZtoSharedScope.get(
                "rbsCatalogProductsListV3",
                "sortBy",
              );
              scope.sortBy = function (sortBy) {
                originalSortBy(sortBy);
              };
              ZtoSharedScope.set(
                "rbsElasticsearchFacetContainerV2",
                "resetSortBy",
                function (sortBy) {
                  scope.currentSortBy = sortBy;
                },
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
