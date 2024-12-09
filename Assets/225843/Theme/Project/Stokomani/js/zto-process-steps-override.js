(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsCommerceIdentificationStepDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.handleNewsletter = true;
              scope.accountProperties = ["email", "mobilePhone", "newPassword"];
              this.initMailingLists = function () {
                scope.error = null;
                var request = AjaxAPI.getData(
                  "Rbs/Mailinglist/GetMailingLists",
                );
                request.then(
                  function (result) {
                    scope.mailingLists = result.data.dataSets.mailingLists;
                  },
                  function (result) {
                    if (result.data && result.data.message) {
                      scope.error = result.data.message;
                    }
                    console.error("GetMailingLists", result);
                    scope.handleNewsletter = false;
                  },
                );
                return request;
              };
              if (scope.handleNewsletter) {
                this.initMailingLists();
              }
              scope.checkOptinSMS = function (optin_title) {
                if (!scope.mailingLists) {
                  return false;
                }
                if (
                  scope.profiles.zto_newsletter &&
                  scope.profiles.zto_newsletter.optsIn
                ) {
                  for (const [key, value] of Object.entries(
                    scope.profiles.zto_newsletter.optsIn,
                  )) {
                    if (
                      value &&
                      scope.mailingLists[key] &&
                      scope.mailingLists[key].common &&
                      scope.mailingLists[key].common.title == optin_title
                    ) {
                      return true;
                    }
                  }
                }
                return false;
              };
            };
          };
          return $delegate;
        },
      ]);
      $provide.decorator("rbsCommerceShippingStepDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          const directive = $delegate[0];
          const link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              const allLines = scope.processData.shippingModes
                .map((shippingMode) => shippingMode.delivery.lines)
                .reduce((_allLines, lines) => _allLines.concat(...lines), []);
              window.dataLayer.push({ ecommerce: null });
              window.dataLayer.push({
                event: "begin_checkout",
                ecommerce: {
                  items: allLines.map((line) => {
                    const ref = window.localStorage.getItem(
                      line.product.common.id,
                    );
                    return {
                      item_name: line.product.common.title,
                      item_id: ref ? ref : line.codeSKU,
                      price: line.unitAmountWithTaxes
                        ? line.unitAmountWithTaxes
                        : "",
                      item_brand: line.product.common.brand
                        ? line.product.common.brand.common.title
                        : "",
                      item_category: line.product.typology
                        ? line.product.typology.name
                        : "",
                      item_variant: "",
                      quantity: line.quantity,
                    };
                  }),
                },
              });
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
