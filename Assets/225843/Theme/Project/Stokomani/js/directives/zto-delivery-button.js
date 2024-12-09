var count = 0;
(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoDeliveryButton", [
    "$window",
    "$rootScope",
    function ($window, $rootScope) {
      return {
        restrict: "A",
        templateUrl: "/zto-delivery-button-v2.twig",
        link: function (scope, el, attrs) {
          if (window.__change.rdnnumber) {
            scope.tabid = window.__change.rdnnumber + 1;
          } else {
            scope.tabid = Math.floor(Math.random() * 1000) + "";
            window.__change.rdnnumber = scope.tabid;
          }
          function searchHide(mode, _el, lv) {
            if (!_el) {
              return false;
            } else if (
              _el.classList &&
              _el.classList.contains &&
              _el.classList.contains("hide-" + mode)
            ) {
              return true;
            } else if (lv++ < 20) {
              return searchHide(mode, _el.parentNode, lv);
            } else {
              return false;
            }
          }
          const onDesktop = searchHide("mobile", el[0], 0);
          const onMobile = searchHide("desktop", el[0], 0);
          scope.cartBox = scope.productData.cartBox;
          if (!scope.cartBox) {
            return;
          }
          scope.ztoDeliveryButton = {};
          function initZtoDeliveryButton(changeMode = true, store = null) {
            scope.linkToMag = store || window.__change.shortStore;
            scope.cartBox = scope.productData.cartBox;
            scope.ztoDeliveryButton.availableShipping = !!(
              scope.cartBox.shippingCategories &&
              scope.cartBox.shippingCategories.allowed
            );
            scope.ztoDeliveryButton.availableStore = !!(
              scope.cartBox.storeCategories &&
              scope.cartBox.storeCategories.allowed
            );
            scope.ztoDeliveryButton.hasStore =
              (scope.cartBox.storeCategories &&
                !!scope.cartBox.storeCategories.storeId) ||
              !!scope.linkToMag;
            if (
              !scope.ztoDeliveryButton.hasStore &&
              window.__change["productAjaxData"] &&
              window.__change["productAjaxData"]["storeId"] !== 0
            ) {
              scope.ztoDeliveryButton.hasStore = true;
            }
            scope.ztoDeliveryButton.hasShippingStock =
              scope.ztoDeliveryButton.availableShipping &&
              scope.cartBox.shippingCategories.stock &&
              scope.cartBox.shippingCategories.stock.available;
            scope.ztoDeliveryButton.hasStoreStock =
              scope.ztoDeliveryButton.availableStore &&
              scope.cartBox.storeCategories.stock &&
              scope.cartBox.storeCategories.stock.available;
            scope.ztoDeliveryButton.hasAnyStoreStock =
              scope.ztoDeliveryButton.availableStore &&
              (scope.cartBox.storeCategories.countStoresWithStock > 0 ||
                scope.ztoDeliveryButton.hasStoreStock);
            scope.ztoDeliveryButton.hasShippingStockAlert =
              scope.ztoDeliveryButton.hasShippingStock &&
              scope.cartBox.shippingCategories.stock &&
              scope.cartBox.shippingCategories.stock.threshold ===
                "ALERT_AVAILABLE";
            scope.ztoDeliveryButton.hasStoreStockAlert =
              scope.ztoDeliveryButton.hasStoreStock &&
              scope.cartBox.storeCategories.stock &&
              scope.cartBox.storeCategories.stock.threshold ===
                "ALERT_AVAILABLE";
            scope.ztoDeliveryButton.notAvailable =
              !scope.ztoDeliveryButton.hasShippingStock &&
              !scope.ztoDeliveryButton.hasAnyStoreStock;
            if (changeMode) {
              scope.ztoDeliveryButton.activeMode =
                scope.ztoDeliveryButton.hasStore &&
                scope.ztoDeliveryButton.hasStoreStock
                  ? "STORE"
                  : "SHIPPING";
              if (scope.rbsCatalogPriceMode !== "dual") {
                scope.rbsCatalogPriceMode =
                  scope.ztoDeliveryButton.activeMode === "SHIPPING"
                    ? "web"
                    : "store";
                $rootScope.$emit("myEvent", scope.rbsCatalogPriceMode);
              }
            }
            scope.storeTitle =
              (store && store.common && store.common.title) ||
              (window.__change.shortStore &&
                window.__change.shortStore.common &&
                window.__change.shortStore.common.title);
          }
          initZtoDeliveryButton();
          scope.$on("rbsCartBoxStoreSelected", function (evt, data) {
            const width = jQuery($window).width();
            if (width >= 768 && onDesktop) {
              initZtoDeliveryButton(true, data);
            } else if (width < 768 && onMobile) {
              initZtoDeliveryButton(true, data);
            } else if (!onDesktop && !onMobile) {
              initZtoDeliveryButton(true, data);
            }
          });
          $rootScope.$on("variantSelected", function (evt, productData) {
            scope.productData = productData;
            scope.productData.cartBox = {
              ...scope.cartBox,
              ...productData.cartBox,
            };
            initZtoDeliveryButton();
          });
          scope.scopeRemoveFilterLastChild = function () {
            if (scope.rbsCatalogPriceMode !== "dual") {
              scope.rbsCatalogPriceMode = "store";
            }
            scope.ztoDeliveryButton.activeMode = "STORE";
            removeFilterLastChild();
            $rootScope.$emit("myEvent", scope.rbsCatalogPriceMode);
          };
          scope.scopeRemoveFilterFirstChild = function () {
            if (scope.rbsCatalogPriceMode !== "dual") {
              scope.rbsCatalogPriceMode = "web";
            }
            scope.ztoDeliveryButton.activeMode = "SHIPPING";
            removeFilterFirstChild();
            $rootScope.$emit("myEvent", scope.rbsCatalogPriceMode);
          };
          scope.addProductToDataLayer = function (mode) {
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
              event: "add_to_cart",
              ecommerce: {
                items: [
                  {
                    item_name: scope.productData.common.title,
                    item_id: scope.productData.common.reference,
                    price: scope.productData.price
                      ? scope.productData.price.valueWithTax
                      : "",
                    item_brand: scope.productData.common.brand
                      ? scope.productData.common.brand.common.title
                      : "",
                    item_category: scope.productData.typology
                      ? scope.productData.typology.name
                      : "",
                    item_variant: "",
                    quantity: scope.cartBox.quantity,
                  },
                ],
              },
            });
          };
          scope.init = function () {
            setTimeout(function () {
              if (scope.ztoDeliveryButton.notAvailable == true) {
                $('a[href="#CandC' + scope.tabid + '"]').tab("show");
                $('a[href="#CandC' + scope.tabid + '"] span img').toggleClass(
                  "active-filter-img",
                );
              } else {
                if (scope.ztoDeliveryButton.activeMode == "SHIPPING") {
                  $('a[href="#profile' + scope.tabid + '"]').tab("show");
                  $(
                    'a[href="#profile' + scope.tabid + '"] span img',
                  ).toggleClass("active-filter-img");
                } else if (scope.ztoDeliveryButton.activeMode == "STORE") {
                  $('a[href="#home' + scope.tabid + '"]').tab("show");
                  $('a[href="#home' + scope.tabid + '"] span img').toggleClass(
                    "active-filter-img",
                  );
                }
              }
            }, 0);
          };
        },
      };
    },
  ]);
})(jQuery);
