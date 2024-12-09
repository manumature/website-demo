(function () {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoDatalayerPaymentSuccess", [ztoDatalayer]);
  function ztoDatalayer() {
    return {
      restrict: "A",
      link: function (scope, $element, attrs) {
        if (!scope.blockData.orders) {
          return;
        }
        scope.blockData.orders.forEach((data) => {
          let isShippingFeeOffered = false;
          if (data.shippingMode && data.shippingMode.category === "atHome") {
            const option =
              data.shippingMode.options.notAppliedModifiers &&
              data.shippingMode.options.notAppliedModifiers.find(
                (notAppliedModifier) =>
                  notAppliedModifier.technicalName === "franco",
              );
            if (option) {
              const deliveryLinesAmout = option.cartFilterData.filters.find(
                (filter) => filter.nema === "deliveryLinesAmount",
              );
              if (deliveryLinesAmout) {
                isShippingFeeOffered =
                  data.linesAmountWithTaxes >
                  deliveryLinesAmout.parameters.value;
              }
            }
          }
          setTimeout(() => {
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
              event: "purchase",
              ecommerce: {
                transaction_id:
                  data.context &&
                  data.context.transactionIds &&
                  data.context.transactionIds[0],
                affiliation:
                  data.shippingMode && data.shippingMode.options.store
                    ? data.shippingMode.options.store.common.title
                    : "webstore",
                value: data.totalAmountWithTaxes,
                tax: undefined,
                shipping: isShippingFeeOffered
                  ? 0
                  : data.shippingFeesAmountWithTaxes,
                currency: "EUR",
                coupon: "",
                items: data.lines.map((line) => {
                  return {
                    item_name: line.designation,
                    item_id: line.options.skuNumbers.partNumber,
                    price: line.amountWithTaxes,
                    item_brand: line.options.brand
                      ? line.options.brand.label
                      : "",
                    item_category: "",
                    item_variant: line.options.axesInfo
                      ? line.options.axesInfo
                          .map((info) => info.value)
                          .join(",")
                      : "",
                    quantity: line.quantity,
                  };
                }),
              },
            });
          }, 500);
        });
      },
    };
  }
})();
