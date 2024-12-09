(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("wishlistModal", [
    "RbsChange.ModalStack",
    "$http",
    "$window",
    "$compile",
    "RbsChange.AjaxAPI",
    function (ModalStack, $http, $window, $compile, AjaxAPI) {
      return {
        restrict: "A",
        link: function (scope, el, attrs) {
          var parameters = angular.copy(scope.blockParameters);
          if (parameters.userId == false) {
            jQuery(".content-wishlist").addClass("hide-zento");
          }
          scope.reset = function () {
            scope.addWishlistSuccess = false;
            scope.error = false;
            scope.modal.close();
          };
          scope.openWishlistModal = function (productId) {
            scope.blockParameters.productIds = [productId];
            scope.productId = productId;
            scope.newWishlist = {
              public: false,
              userId: parameters.userId,
              storeId: parameters.webStoreId,
              productIds: [productId],
            };
            scope.confirmNewWishlist = function () {
              if (angular.isObject(scope.newWishlist)) {
                $http
                  .post("Action/Rbs/Wishlist/AddWishlist", scope.newWishlist)
                  .then(
                    function (result) {
                      scope.error = false;
                      scope.addWishlistSuccess = true;
                      var updateParameters = angular.copy(parameters);
                      updateParameters.successMessage = result.data.success;
                      updateParameters.warning = result.data.warnings;
                      updateParameters.error = false;
                      if (scope.wishlists[0]) {
                        scope.wishlists[0].productIds.push(productId);
                      } else {
                        scope.wishlists.push({ productIds: [productId] });
                      }
                      scope.isProductInWishlist(scope.productWishlistId);
                    },
                    function (result) {
                      scope.error = result.data.error;
                    },
                  );
              }
            };
            var options = {
              templateUrl: "/wishlist-modal.twig",
              backdropClass: "",
              windowClass: "",
              scope: scope,
            };
            scope.modal = ModalStack.open(options);
            function reloadBlock(parameters) {
              AjaxAPI.reloadBlock(
                scope.blockName,
                scope.blockId,
                parameters,
                scope.blockNavigationContext,
              )
                .then(
                  function (result) {
                    $window.location.reload();
                  },
                  function (error) {
                    console.error(
                      "[RbsWishlistButton] error reloading block:",
                      error,
                    );
                  },
                )
                .catch(function (error) {
                  return errorService.handleError(error);
                });
            }
          };
        },
      };
    },
  ]);
})(jQuery);
