(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsCatalogVariantSelectorDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        "$rootScope",
        function ($delegate, AjaxAPI, $rootScope) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.originalProductData = null;
              scope.rootProductData = {};
              scope.$watch("productData", function (productData) {
                if (productData.common.reference) {
                  window.localStorage.setItem(
                    productData.common.id,
                    productData.common.reference,
                  );
                  window.dataLayer.push({ ecommerce: null });
                  window.dataLayer.push({
                    event: "view_item",
                    ecommerce: {
                      items: [
                        {
                          item_name: productData.common.title,
                          item_id: productData.common.reference,
                          price: productData.price
                            ? productData.price.valueWithTax
                            : "",
                          item_brand: productData.common.brand
                            ? productData.common.brand.common.title
                            : "",
                          item_category: productData.typology
                            ? productData.typology.name
                            : "",
                          item_variant: "",
                          quantity: "1",
                        },
                      ],
                    },
                  });
                }
                scope.visualReady = true;
                function slider() {
                  setTimeout(function () {
                    sliderProduitDétails();
                  }, 500);
                }
                if (productData["typology"]["attributes"]["guide_tailles"]) {
                  scope.guidTails =
                    productData["typology"]["attributes"]["guide_tailles"];
                  scope.valueGuidTails =
                    productData["typology"]["attributes"]["guide_tailles"][
                      "value"
                    ];
                }
                if (
                  scope.originalProductData === null &&
                  angular.isObject(productData) &&
                  angular.isObject(productData.common)
                ) {
                  scope.productData = productData;
                  scope.originalProductData = scope.productData;
                  scope.rootProductData =
                    scope.productData.rootProduct || scope.productData;
                  scope.$watchCollection(
                    "selectedAxesValues",
                    function (definedAxes) {
                      var axesDefinition = scope.rootProductData.variants
                        ? scope.rootProductData.variants["axes"]
                        : [];
                      scope.axesItems = [];
                      var currentAxesValue = [],
                        axisIndex,
                        values,
                        axisItems;
                      for (
                        axisIndex = 0;
                        axisIndex < axesDefinition.length;
                        axisIndex++
                      ) {
                        if (definedAxes[axisIndex]) {
                          values = getChildrenAxesValues(currentAxesValue);
                          axisItems = getAxisItems(currentAxesValue, values);
                          scope.axesItems.push(axisItems);
                          currentAxesValue.push(definedAxes[axisIndex]);
                        } else if (axisIndex == definedAxes.length) {
                          values = getChildrenAxesValues(currentAxesValue);
                          axisItems = getAxisItems(currentAxesValue, values);
                          scope.axesItems.push(axisItems);
                          if (values.length == 1) {
                            definedAxes.push(values[0]);
                            currentAxesValue.push(definedAxes[axisIndex]);
                          }
                        } else {
                          scope.axesItems.push([]);
                        }
                      }
                      if (definedAxes.length) {
                        var variant = getVariantByAxesValue(definedAxes);
                        if (variant) {
                          if (variant.id != scope.productData.common.id) {
                            selectProduct(variant.id);
                          }
                          return;
                        }
                      }
                      scope.productData = scope.rootProductData;
                    },
                  );
                  if (scope.rootProductData !== scope.productData) {
                    for (
                      var i = 0;
                      i < scope.rootProductData.variants.products.length;
                      i++
                    ) {
                      if (
                        scope.rootProductData.variants.products[i].id ==
                        scope.productData.common.id
                      ) {
                        scope.selectedAxesValues = angular.copy(
                          scope.rootProductData.variants.products[i].axesValues,
                        );
                        break;
                      }
                    }
                  }
                }
                setTimeout(() => slider(), 0);
              });
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
