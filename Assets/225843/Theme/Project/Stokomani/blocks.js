(function (window) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommercePaymentConnectorDeferred", [
    "RbsChange.AjaxAPI",
    rbsCommercePaymentConnectorDeferred,
  ]);
  function rbsCommercePaymentConnectorDeferred(AjaxAPI) {
    return {
      restrict: "A",
      scope: { processData: "=", transaction: "=", connectorInfo: "=" },
      templateUrl: "/rbs-payment-deferred-connector.twig",
      link: function (scope) {
        scope.processing = false;
        scope.paymentData = scope.connectorInfo.transaction;
        scope.confirmOrder = function () {
          scope.processing = true;
          var postData = {
            connectorId: scope.connectorInfo.common.id,
            transactionId: scope.transaction.transactionId,
          };
          AjaxAPI.putData("Rbs/Payment/Deferred/confirm", postData).then(
            function (result) {
              var dataSets = result.data.dataSets;
              var redirectURL =
                dataSets && dataSets.common && dataSets.common.redirectURL;
              if (redirectURL) {
                window.location.assign(redirectURL);
              } else {
                window.location.reload(true);
              }
            },
            function (result) {
              scope.submitError = result.data;
              scope.processData.paymentError = [result.data.message];
              scope.processing = false;
              console.error(result);
            },
          );
        };
      },
    };
  }
  app.directive(
    "rbsCommercePaymentConnectorHtml",
    rbsCommercePaymentConnectorHtml,
  );
  function rbsCommercePaymentConnectorHtml() {
    return {
      restrict: "A",
      scope: { processData: "=", transaction: "=", connectorInfo: "=" },
      template:
        '<div data-ng-bind-html="connectorInfo.transaction.html | rbsTrustHtml"></div>',
      link: function (scope) {},
    };
  }
  app.directive("rbsCommercePaymentConnectorOgone", [
    "$sce",
    rbsCommercePaymentConnectorOgone,
  ]);
  function rbsCommercePaymentConnectorOgone($sce) {
    console.warn(
      "rbsCommercePaymentConnectorOgone is deprecated since 6.11.0 without replacement.",
    );
    return {
      restrict: "A",
      scope: { processData: "=", transaction: "=", connectorInfo: "=" },
      templateUrl: "/rbs-payment-ogone-connector.twig",
      link: function (scope, elem) {
        scope.paymentData = scope.connectorInfo.transaction;
        scope.action = $sce.trustAsResourceUrl(scope.paymentData.postAction);
        scope.processing = false;
        scope.submit = function ($event) {
          if (!scope.processing) {
            scope.processing = true;
            scope.processData
              .processTransaction(scope.transaction, scope.connectorInfo)
              .then(
                function (result) {
                  scope.processing = result.data;
                  var jqForm = elem.find(
                    "#Rbs_Payment_OgoneConnector_Form-" +
                      scope.connectorInfo.common.id,
                  );
                  jqForm[0].submit();
                },
                function (result) {
                  scope.submitError = result.data;
                  scope.processData.paymentError = [result.data.message];
                  console.error("processTransaction", result);
                  scope.processing = false;
                },
              );
          }
          $event.returnValue = false;
          $event.preventDefault();
          return false;
        };
      },
    };
  }
})(window);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsMediaPictograms", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-media-pictograms.twig",
      scope: { mediaPictograms: "=rbsMediaPictograms" },
      link: function (scope, elm, attrs) {
        scope.format = angular.isString(attrs["pictogramFormat"])
          ? attrs["pictogramFormat"]
          : "pictogram";
        scope.position = { vertical: "bottom", horizontal: "right" };
        scope.$watch("mediaPictograms", function (pictograms) {
          scope.pictograms = [];
          angular.forEach(pictograms, function (pictogram) {
            if (!angular.isObject(pictogram)) {
              return;
            }
            if (angular.isObject(pictogram["formats"])) {
              pictogram = pictogram["formats"];
            }
            if (angular.isString(pictogram[scope.format])) {
              scope.pictograms.push({
                src: pictogram[scope.format],
                alt: angular.isString(pictogram.alt) ? pictogram.alt : null,
              });
            }
          });
        });
        scope.ngClasses = { main: {}, size: {}, maxSize: {} };
        scope.ngClasses.size["image-format-" + scope.format + "-size"] = true;
        scope.ngClasses.maxSize["image-format-" + scope.format + "-max-size"] =
          true;
        var positionParts = angular.isString(attrs["pictogramPosition"])
          ? attrs["pictogramPosition"].split(" ")
          : [];
        if (positionParts.length === 1 && positionParts[0] === "none") {
          return;
        }
        for (var i = 0; i < positionParts.length; i++) {
          switch (positionParts[i]) {
            case "top":
            case "bottom":
              scope.position.vertical = positionParts[i];
              break;
            case "left":
            case "center":
            case "right":
              scope.position.horizontal = positionParts[i];
              break;
          }
        }
        scope.ngClasses.main["media-pictograms-position"] = true;
        scope.ngClasses.main["media-pictograms-format-" + scope.format] = true;
        scope.ngClasses.main["media-pictograms-" + scope.position.vertical] =
          true;
        scope.ngClasses.main["media-pictograms-" + scope.position.horizontal] =
          true;
      },
    };
  });
  app.directive("rbsMediaVisuals", [
    "RbsChange.ModalStack",
    "$timeout",
    function (ModalStack, $timeout) {
      return {
        restrict: "A",
        templateUrl: "/rbs-media-visuals.twig",
        scope: {
          mediaVisuals: "=rbsMediaVisuals",
          pictograms: "=",
          animations: "=",
        },
        link: function (scope, elm, attrs) {
          scope.visualFormat = angular.isString(attrs["visualFormat"])
            ? attrs["visualFormat"]
            : "detail";
          scope.thumbnailFormat = angular.isString(attrs["thumbnailFormat"])
            ? attrs["thumbnailFormat"]
            : "detailThumbnail";
          scope.thumbnailPosition = angular.isString(attrs["thumbnailPosition"])
            ? attrs["thumbnailPosition"]
            : "right";
          scope.pictogramFormat = angular.isString(attrs["pictogramFormat"])
            ? attrs["pictogramFormat"]
            : "pictogram";
          scope.pictogramPosition = angular.isString(attrs["pictogramPosition"])
            ? attrs["pictogramPosition"]
            : null;
          scope.animationPosition = angular.isString(attrs["animationPosition"])
            ? attrs["animationPosition"]
            : null;
          scope.shownIndex = 0;
          attrs.zoomType = attrs.zoomType ? attrs.zoomType : "hover";
          scope.zoom = {
            enabled:
              attrs["enableZoom"] &&
              attrs["enableZoom"] !== "false" &&
              attrs.zoomType !== "none",
            type: attrs.zoomType,
            shown: false,
          };
          scope.disableLinkClick = function () {
            return scope.zoom.type === "hover" || scope.zoom.type === "modal";
          };
          $timeout(function () {
            if (scope.disableLinkClick()) {
              var linkNodes = elm.find(".media-visuals-main [data-index] a");
              linkNodes.click(function (event) {
                event.preventDefault();
              });
            }
          }, 250);
          scope.$watch("mediaVisuals", function (visuals) {
            scope.shownIndex = 0;
            scope.visuals = [];
            angular.forEach(visuals, function (visual) {
              if (!angular.isObject(visual)) {
                return;
              }
              if (angular.isObject(visual["formats"])) {
                visual = visual["formats"];
              }
              if (
                angular.isString(visual[scope.visualFormat]) &&
                angular.isString(visual[scope.thumbnailFormat])
              ) {
                scope.visuals.push({
                  title: angular.isString(visual.title)
                    ? visual.title
                    : angular.isString(visual.alt)
                      ? visual.alt
                      : null,
                  src: visual[scope.visualFormat],
                  thumbnailSrc: visual[scope.thumbnailFormat],
                  originalSrc: angular.isString(visual["original"])
                    ? visual["original"]
                    : null,
                  alt: angular.isString(visual.alt)
                    ? visual.alt
                    : angular.isString(visual.title)
                      ? visual.title
                      : null,
                });
              }
            });
            scope.ngClasses = { main: {} };
            if (angular.isArray(scope.visuals) && scope.visuals.length > 1) {
              scope.ngClasses.main["media-visuals-multiple"] = true;
              scope.ngClasses.main[
                "media-visuals-multiple-" + scope.thumbnailPosition
              ] = true;
            } else {
              scope.ngClasses.main["media-visuals-single"] = true;
            }
            scope.ngClasses.main[
              "media-visuals-format-" +
                scope.visualFormat +
                "-" +
                scope.thumbnailFormat
            ] = true;
          });
          scope.showVisual = function (event, index) {
            scope.shownIndex = index;
            event.preventDefault();
          };
          scope.startZoom = function () {
            scope.zoom.shown = true;
            var linkNode = elm.find(
              ".media-visuals-main [data-index=" + scope.shownIndex + "] a",
            );
            var image = linkNode.find("img");
            var zoomDiv = elm.find(".media-visuals-zoom");
            var bigImage = jQuery(
              '<img src="' + linkNode.attr("href") + '" alt="" />',
            );
            zoomDiv.append(bigImage);
            image.mousemove(function (event) {
              var scaleX = bigImage.width() / image.width();
              var scaleY = bigImage.height() / image.height();
              var offset = image.offset();
              bigImage.css({
                top: Math.max(
                  zoomDiv.height() - bigImage.height(),
                  Math.min(
                    0,
                    zoomDiv.height() / 2 - (event.pageY - offset.top) * scaleY,
                  ),
                ),
                left: Math.max(
                  zoomDiv.width() - bigImage.width(),
                  Math.min(
                    0,
                    zoomDiv.width() / 2 - (event.pageX - offset.left) * scaleX,
                  ),
                ),
              });
            });
            image.mouseout(function () {
              scope.zoom.shown = false;
              bigImage.remove();
              scope.$digest();
              image.unbind("mousemove");
              image.unbind("mouseout");
            });
          };
          scope.startModalZoom = function () {
            var options = {
              templateUrl: "/rbs-media-zoom-modal.twig",
              backdropClass: "modal-backdrop-rbs-media-zoom",
              windowClass: "modal-rbs-media-zoom",
              controller: "RbsMediaZoomModalController",
              size: "lg",
              resolve: {
                visualsData: function () {
                  return {
                    visuals: scope.mediaVisuals,
                    pictograms: scope.pictograms,
                    animations: scope.animations,
                    startIndex: scope.shownIndex,
                  };
                },
              },
            };
            ModalStack.open(options);
          };
        },
      };
    },
  ]);
  app.directive("rbsMediaSliderVisuals", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-media-slider-visuals.twig",
      scope: {
        mediaVisuals: "=rbsMediaSliderVisuals",
        pictograms: "=",
        animations: "=",
      },
      link: function (scope, elm, attrs) {
        scope.interval = angular.isString(attrs["interval"])
          ? attrs["interval"]
          : 5000;
        scope.visualFormat = angular.isString(attrs["visualFormat"])
          ? attrs["visualFormat"]
          : "detailCompact";
        scope.pictogramFormat = angular.isString(attrs["pictogramFormat"])
          ? attrs["pictogramFormat"]
          : "pictogram";
        scope.pictogramPosition = angular.isString(attrs["pictogramPosition"])
          ? attrs["pictogramPosition"]
          : null;
        scope.animationPosition = angular.isString(attrs["animationPosition"])
          ? attrs["animationPosition"]
          : null;
        scope.startIndex = angular.isString(attrs["startIndex"])
          ? attrs["startIndex"]
          : 0;
        var carouselElm = elm.find(".carousel");
        scope.left = function (event) {
          event.preventDefault();
          carouselElm.carousel("prev");
        };
        scope.right = function (event) {
          event.preventDefault();
          carouselElm.carousel("next");
        };
        scope.goTo = function (index) {
          carouselElm.carousel(index);
        };
        scope.$watch("mediaVisuals", function (visuals) {
          scope.visuals = [];
          angular.forEach(visuals, function (visual) {
            if (!angular.isObject(visual)) {
              return;
            }
            if (angular.isObject(visual["formats"])) {
              visual = visual["formats"];
            }
            if (angular.isString(visual[scope.visualFormat])) {
              scope.visuals.push({
                src: visual[scope.visualFormat],
                alt: angular.isString(visual.alt) ? visual.alt : null,
              });
            }
          });
          scope.ngClasses = { main: {} };
          if (angular.isArray(scope.visuals) && scope.visuals.length > 1) {
            scope.ngClasses.main["media-slider-visuals-multiple"] = true;
          } else {
            scope.ngClasses.main["media-slider-visuals-single"] = true;
          }
          scope.ngClasses.main[
            "media-slider-visuals-format-" + scope.visualFormat
          ] = true;
        });
      },
    };
  });
  app.controller("RbsMediaZoomModalController", [
    "$scope",
    "visualsData",
    function (scope, visualsData) {
      scope.visuals = visualsData.visuals;
      scope.pictograms = visualsData.pictograms;
      scope.animations = visualsData.animations;
      scope.startIndex = visualsData.startIndex;
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsMediaPreloadedVisuals", function () {
    return {
      restrict: "A",
      scope: true,
      link: function (scope, elm) {
        scope.showVisual = function (event, index) {
          elm.find(".media-visuals-main-item").each(function () {
            var node = jQuery(this);
            if (node.attr("data-index") === index + "") {
              node.show();
            } else {
              node.hide();
            }
          });
          event.preventDefault();
        };
        scope.startHoverZoom = function (event, shownIndex) {
          var linkNode = elm.find(
            ".media-visuals-main [data-index=" + shownIndex + "] a",
          );
          var image = linkNode.find("img");
          var zoomDiv = elm.find(".media-visuals-zoom");
          var bigImage = jQuery(
            '<img src="' + linkNode.attr("href") + '" alt="" />',
          );
          zoomDiv.append(bigImage);
          zoomDiv.removeClass("hidden");
          image.mousemove(function (event) {
            var scaleX = bigImage.width() / image.width();
            var scaleY = bigImage.height() / image.height();
            var offset = image.offset();
            bigImage.css({
              top: Math.max(
                zoomDiv.height() - bigImage.height(),
                Math.min(
                  0,
                  zoomDiv.height() / 2 - (event.pageY - offset.top) * scaleY,
                ),
              ),
              left: Math.max(
                zoomDiv.width() - bigImage.width(),
                Math.min(
                  0,
                  zoomDiv.width() / 2 - (event.pageX - offset.left) * scaleX,
                ),
              ),
            });
          });
          image.mouseout(function () {
            zoomDiv.addClass("hidden");
            bigImage.remove();
            scope.$digest();
            image.unbind("mousemove");
            image.unbind("mouseout");
          });
        };
      },
    };
  });
})(jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsEventContextualList", [
    "RbsChange.AjaxAPI",
    "$location",
    "$rootScope",
    rbsEventContextualList,
  ]);
  function rbsEventContextualList(AjaxAPI, $location, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-event-contextual-list.twig",
      scope: { blockId: "=", blockParameters: "=", blockData: "=" },
      controller: [
        "$scope",
        function (scope) {
          scope.loading = false;
          scope.useInfiniteScroll =
            scope.blockParameters.useInfiniteScroll || false;
          var data = scope.blockData;
          scope.eventsData = data.eventsData;
          scope.context = data.context;
          scope.contextData = data.context.data;
          delete scope.context.data;
          scope.pagination = scope.context.pagination;
          scope.updateOffset = function (newOffset) {
            AjaxAPI.openWaitingModal();
            scope.context.pagination.offset = newOffset;
            AjaxAPI.getData(
              "Rbs/Event/BaseEvent/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.eventsData = [];
                scope.pagination = scope.context.pagination =
                  result.data.pagination;
                angular.forEach(result.data.items, function (event) {
                  scope.eventsData.push(event);
                });
                $location.search(
                  "pageNumber-" + scope.blockId,
                  Math.floor(scope.pagination.offset / scope.pagination.limit) +
                    1,
                );
                AjaxAPI.closeWaitingModal();
              },
              function () {
                scope.productsData = [];
                AjaxAPI.closeWaitingModal();
              },
            );
          };
          $rootScope.$on(
            "RbsElasticsearchFacetFilters",
            function (event, args) {
              scope.contextData.facetFilters = args.facetFilters;
              scope.context.pagination.offset = 0;
              if (args.instantSearch) {
                scope.reload("instantSearch");
              } else {
                scope.reload("facetFilters");
              }
            },
          );
          scope.reload = function (reason) {
            var useModal = reason !== "instantSearch";
            if (useModal) {
              AjaxAPI.openWaitingModal();
            }
            AjaxAPI.getData(
              "Rbs/Event/BaseEvent/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.eventsData = [];
                scope.pagination = scope.context.pagination =
                  result.data.pagination;
                angular.forEach(result.data.items, function (event) {
                  scope.eventsData.push(event);
                });
                if (useModal) {
                  AjaxAPI.closeWaitingModal();
                }
              },
              function () {
                scope.eventsData = [];
                if (useModal) {
                  AjaxAPI.closeWaitingModal();
                }
              },
            );
          };
          scope.addMoreEvents = function () {
            if (!scope.useInfiniteScroll || scope.loading) {
              return;
            }
            scope.context.pagination.offset = scope.eventsData.length;
            scope.loading = true;
            AjaxAPI.getData(
              "Rbs/Event/BaseEvent/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.pagination.count = result.data.pagination.count;
                if (data.pagination.offset === scope.eventsData.length) {
                  angular.forEach(result.data.items, function (event) {
                    scope.eventsData.push(event);
                  });
                }
                scope.loading = false;
              },
              function () {
                scope.loading = false;
              },
            );
          };
        },
      ],
      link: function (scope) {
        scope.scrollDisabled = function () {
          if (!scope.useInfiniteScroll) {
            return true;
          }
          return (
            scope.loading || scope.eventsData.length >= scope.pagination.count
          );
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsEventSearchResultItem", function () {
    return {
      restrict: "A",
      scope: { item: "=" },
      templateUrl: "/rbs-event-search-result-item.twig",
      require: "^rbsElasticsearchResult",
      link: function (scope, elem, attrs, controller) {},
    };
  });
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var cfg = window.__change.Rbs_Geo_Config;
  var useGoogleMap = !!(
    cfg &&
    cfg.Google &&
    (cfg.Google.client || cfg.Google.APIKey)
  );
  app.directive("rbsStoreshippingProductLocator", [
    "RbsChange.AjaxAPI",
    "$timeout",
    "RbsGeo.GoogleMapService",
    function (AjaxAPI, $timeout, GoogleMapService) {
      return {
        restrict: "A",
        templateUrl: "/rbs-storeshipping-product-locator.twig",
        scope: false,
        link: function (scope, elem) {
          scope.useGoogleMap = useGoogleMap;
          scope.countries = [];
          scope.search = {
            address: null,
            country: null,
            coordinates: null,
            processId: 0,
            storeId: null,
            useAsDefault: true,
          };
          if (!useGoogleMap) {
            AjaxAPI.getData("Rbs/Storelocator/StoreCountries/", {
              forReservation: scope.forReservation === true,
            }).then(function (result) {
              if (result.data["items"].length) {
                for (var i = 0; i < result.data["items"].length; i++) {
                  scope.countries.push(result.data["items"][i].title);
                }
                scope.search.country = scope.countries[0];
              }
            });
            scope.$watch("search.country", function (value, oldValue) {
              if (value && value !== oldValue && scope.search.address) {
                scope.locateByAddress();
              }
            });
          }
          scope.loading = false;
          scope.locateMeLoading = false;
          scope.locateByAddressLoading = false;
          scope.emptySearch = false;
          scope.noSearch = true;
          scope.$watch("search.address", function (address) {
            scope.locateByAddressError = false;
            if (address) {
              scope.search.coordinates = null;
            }
          });
          scope.locateMe = function () {
            if (scope.loading || scope.locateMeLoading) {
              return;
            }
            scope.locateMeLoading = true;
            scope.emptySearch = false;
            navigator.geolocation.getCurrentPosition(
              function (position) {
                scope.locateMeLoading = false;
                scope.search.coordinates = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                };
                scope.search.address = null;
                scope.$digest();
                scope.launchSearch();
              },
              function (error) {
                console.error(error);
                scope.locateMeLoading = false;
                scope.locateMeError = true;
                scope.applyStoresResult([], {});
                scope.$digest();
                $timeout(function () {
                  scope.locateMeError = false;
                }, 5000);
              },
              { timeout: 5000, maximumAge: 0 },
            );
          };
          scope.locateByAddress = function () {
            if (
              scope.loading ||
              scope.locateByAddressLoading ||
              !scope.search.address
            ) {
              return;
            }
            scope.locateByAddressLoading = true;
            scope.emptySearch = false;
            var address = {
              lines: ["", scope.search.address, scope.search.country],
            };
            AjaxAPI.getData("Rbs/Geo/CoordinatesByAddress", {
              address: address,
            }).then(
              function (result) {
                scope.locateByAddressLoading = false;
                if (result.data.dataSets && result.data.dataSets.latitude) {
                  scope.search.coordinates = {
                    latitude: result.data.dataSets.latitude,
                    longitude: result.data.dataSets.longitude,
                  };
                  scope.launchSearch();
                } else {
                  scope.locateByAddressError = true;
                  scope.applyStoresResult([], {});
                }
              },
              function () {
                scope.locateByAddressLoading = false;
                scope.locateByAddressError = true;
                scope.applyStoresResult([], {});
              },
            );
          };
          scope.launchSearch = function () {
            scope.loading = true;
            scope.emptySearch = false;
            scope.noSearch = false;
            var data = {
              search: scope.search,
              skuQuantities: scope.skuQuantities,
              forReservation: scope.forReservation === true,
              forPickUp: scope.forPickUp === true,
              allowSelect: scope.allowSelect,
            };
            var params = {
              URLFormats: "canonical",
              dataSetNames: "address,coordinates,hoursSummary",
            };
            AjaxAPI.getData("Rbs/Storeshipping/Store/", data, params).then(
              function (result) {
                scope.applyStoresResult(
                  result.data.items,
                  result.data.pagination,
                );
                scope.loading = false;
                scope.emptySearch = !result.data.items.length;
              },
              function (result) {
                console.log("launchSearch error", result);
                scope.applyStoresResult([], {});
                scope.loading = false;
                scope.emptySearch = true;
              },
            );
          };
          if (scope.storeId) {
            scope.search.storeId = scope.storeId;
          }
          scope.totalSkuQuantity = 0;
          if (
            angular.isObject(scope.skuQuantities) &&
            !angular.isArray(scope.skuQuantities)
          ) {
            angular.forEach(scope.skuQuantities, function (skuQuantity) {
              scope.totalSkuQuantity += skuQuantity;
            });
            if (scope.search.storeId) {
              scope.launchSearch();
            }
          } else {
            scope.skuQuantities = {};
          }
          if (useGoogleMap) {
            GoogleMapService.maps().then(function (maps) {
              $timeout(function () {
                var autoCompleteInput = elem.find(
                  '[data-role="address-auto-complete"]',
                );
                scope.autocomplete = new maps.places.Autocomplete(
                  autoCompleteInput[0],
                  { types: ["geocode"] },
                );
                maps.event.addListener(
                  scope.autocomplete,
                  "place_changed",
                  function () {
                    var place = scope.autocomplete.getPlace();
                    if (!place.geometry) {
                      return;
                    }
                    var location = place.geometry.location;
                    scope.search.coordinates = {
                      latitude: location.lat(),
                      longitude: location.lng(),
                    };
                    scope.search.address = null;
                    scope.$digest();
                    scope.launchSearch();
                  },
                );
              });
            });
          }
          scope.applyStoresResult = function (storesData, pagination) {
            scope.formattedMinPickUpDateTime =
              pagination.formattedMinPickUpDateTime;
            scope.formattedMinRelayDateTime =
              pagination.formattedMinRelayDateTime;
            scope.pickUpStores = [];
            scope.relayStores = [];
            angular.forEach(storesData, function (storeData) {
              if (storeData.storeShipping.hasStoreStock) {
                scope.pickUpStores.push(storeData);
              } else {
                scope.relayStores.push(storeData);
              }
            });
          };
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsStoreshippingStoreModeEditor", [
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsGeo.GoogleMapService",
    rbsStoreshippingStoreModeEditor,
  ]);
  app.directive("rbsStoreshippingReservationModeEditor", [
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsGeo.GoogleMapService",
    rbsStoreshippingStoreModeEditor,
  ]);
  function rbsStoreshippingStoreModeEditor(
    AjaxAPI,
    ModalStack,
    GoogleMapService,
  ) {
    return {
      restrict: "A",
      templateUrl: "/rbs-storeshipping-store-shipping.twig",
      scope: {
        shippingMode: "=",
        shippingModeInfo: "=",
        userAddresses: "=",
        processEngine: "=",
        giftCapabilities: "=",
        pricesConfiguration: "=showPrices",
      },
      link: function (scope) {
        scope.loading = false;
        scope.edition = null;
        scope.countries = [];
        scope.store = null;
        scope.useGoogleMap = GoogleMapService.valid();
        function storeValid(returnData) {
          if (returnData) {
            var store = angular.copy(scope.store);
            delete store.address;
            var returnObj = {
              id: scope.shippingModeInfo.common.id,
              title: scope.shippingModeInfo.common.title,
              wishCustomerReceiptDate:
                scope.shippingMode.wishCustomerReceiptDate,
              storeId: scope.store.common.id,
              address: scope.store.address,
              options: {
                store: store,
                category: scope.shippingModeInfo.common.category,
              },
            };
            if (scope.shippingMode.options.message) {
              returnObj.options.message = scope.shippingMode.options.message;
            }
            if (scope.shippingMode.options.containsGift) {
              returnObj.options.containsGift =
                scope.shippingMode.options.containsGift;
              if (scope.shippingMode.options.giftAddMessage) {
                returnObj.options.giftAddMessage =
                  scope.shippingMode.options.giftAddMessage;
              }
              if (scope.shippingMode.options.giftMessage) {
                returnObj.options.giftMessage =
                  scope.shippingMode.options.giftMessage;
              }
              if (scope.shippingMode.options.giftAddWrap) {
                returnObj.options.giftAddWrap =
                  scope.shippingMode.options.giftAddWrap;
              }
            }
            return returnObj;
          }
          return (
            scope.shippingModeInfo.common.id == scope.shippingMode.id &&
            scope.store &&
            scope.store.common.id &&
            !scope.shippingMode.options.invalidMessage
          );
        }
        scope.$watch("shippingMode.shippingZone", function (zoneCode) {
          AjaxAPI.getData("Rbs/Geo/AddressFieldsCountries/", {
            zoneCode: zoneCode,
          }).then(
            function (result) {
              scope.countries = result.data.items;
            },
            function (result) {
              console.error("addressFieldsCountries", result);
              scope.countries = [];
            },
          );
        });
        scope.$watch("shippingMode.id", function (id) {
          if (id == scope.shippingModeInfo.common.id) {
            scope.shippingMode.valid = storeValid;
          }
        });
        scope.inEdition = function (inEdition) {
          if (inEdition === true) {
            scope.edition = true;
            scope.forReservation =
              scope.shippingMode.category === "reservation";
            scope.forPickUp = scope.shippingMode.category === "store";
            scope.allowSelect = true;
            scope.storeId = scope.shippingMode.storeId;
          }
          return scope.edition;
        };
        scope.openStorePopup = function (store) {
          var options = {
            templateUrl: "/rbs-storeshipping-store-popin.twig",
            backdropClass: "modal-backdrop-rbs-storeshipping-store",
            windowClass: "modal-rbs-storeshipping-store",
            size: "lg",
            controller: "RbsStoreshippingStoreModalCtrl",
            resolve: {
              store: function () {
                return store;
              },
            },
          };
          ModalStack.open(options);
        };
        scope.selectStore = function (store) {
          scope.edition = false;
          scope.setDeliveryInformation(store);
        };
        scope.setDeliveryInformation = function (store) {
          scope.shippingMode.valid = storeValid;
          if (!store) {
            scope.store = null;
            delete scope.shippingMode.options.store;
          } else {
            scope.store = store;
            scope.shippingMode.storeId = store.common.id;
            scope.shippingMode.options.store = store;
          }
        };
        scope.$watch("shippingModeInfo", function (shippingModeInfo) {
          if (shippingModeInfo) {
            scope.skuQuantities = {};
            var delivery = scope.shippingMode.delivery;
            angular.forEach(delivery.lines, function (line) {
              if (line.quantity) {
                if (scope.skuQuantities.hasOwnProperty(line.codeSKU)) {
                  scope.skuQuantities[line.codeSKU] += line.quantity;
                } else {
                  scope.skuQuantities[line.codeSKU] = line.quantity;
                }
              }
            });
            if (scope.shippingMode.id == shippingModeInfo.common.id) {
              scope.shippingMode.valid = storeValid;
              var options = scope.shippingMode.options;
              if (scope.shippingMode.storeId) {
                if (
                  options &&
                  options.store &&
                  options.store.common.id == scope.shippingMode.storeId
                ) {
                  scope.store = scope.shippingMode.options.store;
                  scope.store.address = scope.shippingMode.address;
                }
              } else {
                var storeId = scope.processEngine.parameters("storeId");
                if (storeId) {
                  scope.shippingMode.storeId = storeId;
                }
              }
            }
            scope.inEdition(!scope.store);
          }
        });
        function selectStoreOnInitialization() {
          if (scope.processEngine.type === "return") {
            var selectDefaultStore = function () {
              AjaxAPI.getData(
                "Rbs/Storeshipping/Store/Default",
                {},
                { URLFormats: "canonical" },
              ).then(function (result) {
                var storeData = result.data.dataSets;
                if (
                  !angular.isArray(storeData) &&
                  angular.isObject(storeData) &&
                  storeData.allow.allowPickUp
                ) {
                  scope.selectStore(storeData);
                }
              }, angular.noop);
            };
            var objectData = scope.processEngine.getObjectData();
            if (objectData.returnMode.storeId) {
              AjaxAPI.getData(
                "Rbs/Storelocator/Store/" + objectData.returnMode.storeId,
              ).then(function (result) {
                var storeData = result.data.dataSets;
                if (
                  !angular.isArray(storeData) &&
                  angular.isObject(storeData) &&
                  storeData.allow.allowPickUp
                ) {
                  scope.selectStore(storeData);
                  return;
                }
                selectDefaultStore();
              });
            } else {
              selectDefaultStore();
            }
          }
        }
        selectStoreOnInitialization();
      },
    };
  }
  app.controller("RbsStoreshippingStoreModalCtrl", [
    "$timeout",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "$scope",
    "$uibModalInstance",
    "store",
    "RbsGeo.GoogleMapService",
    "RbsGeo.LeafletMapService",
    RbsStoreshippingStoreModalCtrl,
  ]);
  function RbsStoreshippingStoreModalCtrl(
    $timeout,
    AjaxAPI,
    ModalStack,
    scope,
    $uibModalInstance,
    store,
    GoogleMapService,
    LeafletMapService,
  ) {
    function loadMap() {
      var latLng, mapOptions, markerOptions;
      var id = "storeshipping-map-store-" + store.common.id;
      if (GoogleMapService.valid()) {
        GoogleMapService.maps().then(function (maps) {
          latLng = new maps.LatLng(
            store.coordinates.latitude,
            store.coordinates.longitude,
          );
          mapOptions = { center: latLng, zoom: 11 };
          scope.map = new maps.Map(document.getElementById(id), mapOptions);
          markerOptions = { position: latLng, map: scope.map };
          if (store.coordinates.marker && store.coordinates.marker.original) {
            var width = store.coordinates.marker.size
              ? store.coordinates.marker.size[0]
              : 30;
            var height = store.coordinates.marker.size
              ? store.coordinates.marker.size[1]
              : 36;
            markerOptions.icon = {
              url: store.coordinates.marker.original,
              size: new maps.Size(width, height),
              origin: new maps.Point(0, 0),
              anchor: new maps.Point(width / 2, height),
            };
          }
          scope.marker = new maps.Marker(markerOptions);
        });
      } else if (LeafletMapService.valid()) {
        LeafletMapService.maps().then(function (maps) {
          markerOptions = {};
          if (store.coordinates.marker && store.coordinates.marker.original) {
            markerOptions.icon = maps.icon({
              iconUrl: store.coordinates.marker.original,
              iconSize: store.coordinates.marker.size
                ? store.coordinates.marker.size
                : [30, 36],
            });
          }
          latLng = {
            lat: store.coordinates.latitude,
            lng: store.coordinates.longitude,
          };
          mapOptions = { center: latLng, zoom: 11 };
          scope.map = maps.map(id, mapOptions);
          var l = new maps.TileLayer(LeafletMapService.defaultTileLayerName(), {
            attribution: LeafletMapService.getAttribution(),
          });
          scope.map.addLayer(l);
          scope.marker = maps.marker(latLng, markerOptions).addTo(scope.map);
        });
      } else {
        console.warn("No valid map configuration.");
      }
    }
    scope.loadMap = false;
    scope.map = null;
    scope.store = store;
    if (!store.card) {
      AjaxAPI.getData("Rbs/Storelocator/Store/" + store.common.id).then(
        function (result) {
          scope.store = result.data.dataSets;
        },
      );
    }
    scope.showMap = function () {
      if (!scope.loadMap && store.coordinates) {
        scope.loadMap = true;
        $timeout(loadMap, 750);
      }
      return true;
    };
    scope.closed = function (openingHour) {
      return (
        !openingHour.amBegin &&
        !openingHour.amEnd &&
        !openingHour.pmBegin &&
        !openingHour.pmEnd
      );
    };
    scope.continuousDay = function (openingHour) {
      return (
        openingHour.amBegin &&
        !openingHour.amEnd &&
        !openingHour.pmBegin &&
        openingHour.pmEnd
      );
    };
    scope.amOpen = function (openingHour) {
      return openingHour.amBegin && openingHour.amEnd;
    };
    scope.amClosed = function (openingHour) {
      return (
        !openingHour.amBegin &&
        !openingHour.amEnd &&
        openingHour.pmBegin &&
        openingHour.pmEnd
      );
    };
    scope.pmOpen = function (openingHour) {
      return openingHour.pmBegin && openingHour.pmEnd;
    };
    scope.pmClosed = function (openingHour) {
      return (
        openingHour.amBegin &&
        openingHour.amEnd &&
        !openingHour.pmBegin &&
        !openingHour.pmEnd
      );
    };
    function closeFunction() {
      ModalStack.showPrevious();
    }
    $uibModalInstance.result.then(closeFunction, closeFunction);
    scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
  app.directive(
    "rbsStoreshippingStoreModeSummary",
    rbsStoreshippingStoreModeSummary,
  );
  app.directive(
    "rbsStoreshippingReservationModeSummary",
    rbsStoreshippingStoreModeSummary,
  );
  function rbsStoreshippingStoreModeSummary() {
    return {
      restrict: "A",
      templateUrl: "/rbs-storeshipping-store-shipping-readonly.twig",
      scope: { shippingMode: "=", shippingModeInfo: "=" },
      link: function (scope) {
        scope.store = scope.shippingMode.options.store;
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsStoreshippingShortStore", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "RbsChange.ResponsiveSummaries",
    rbsStoreshippingShortStore,
  ]);
  function rbsStoreshippingShortStore(
    $rootScope,
    AjaxAPI,
    ResponsiveSummaries,
  ) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.storeData = scope.blockData;
          $rootScope.$on(
            "rbsStorelocatorDefaultStore",
            function (event, storeData) {
              scope.storeData = storeData || null;
            },
          );
          this.search = function (data) {
            var request = AjaxAPI.getData("Rbs/Storelocator/Store/", data);
            request.then(function (result) {
              if (result.data.items.length) {
                scope.$emit(
                  "rbsStorelocatorChooseStore",
                  result.data.items[0].common.id,
                );
              }
            });
            return request;
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.chooseStoreUrl = attrs.chooseStoreUrl;
        if (
          !angular.isString(scope.chooseStoreUrl) ||
          !scope.chooseStoreUrl.length
        ) {
          scope.chooseStoreUrl = null;
        }
        if (scope.parameters.autoSelect && !scope.storeData) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              var coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              controller.search({
                coordinates: coordinates,
                distance: "50km",
                allow: { pickUp: 1, reservation: 1 },
              });
            },
            function () {
              console.error("unable to locate");
            },
            { timeout: 5000, maximumAge: 0 },
          );
        }
        ResponsiveSummaries.registerItem(
          scope.blockId,
          scope,
          '<div data-rbs-storeshipping-short-store-responsive-summary=""></div>',
        );
      },
    };
  }
  app.directive("rbsStoreshippingShortStoreResponsiveSummary", [
    "RbsChange.ModalStack",
    rbsStoreshippingShortStoreResponsiveSummary,
  ]);
  function rbsStoreshippingShortStoreResponsiveSummary(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-storeshipping-short-store-responsive-summary.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          var user = window.__change.userContext.accessorId;
          if (user != 0) {
            var options = {
              templateUrl:
                "/rbs-storeshipping-short-store-responsive-summary-modal.twig",
              backdropClass:
                "modal-backdrop-rbs-storeshipping-short-store-responsive-summary",
              windowClass:
                "modal-responsive-summary modal-rbs-storeshipping-short-store-responsive-summary",
              scope: scope,
            };
            ModalStack.open(options);
          } else {
            window.location.href = "/nos-magasins.html";
          }
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsStoreshippingCancelReservation", [
    "RbsChange.AjaxAPI",
    function (AjaxAPI) {
      return {
        link: function (scope) {
          scope.confirmCancel = function () {
            console.log(scope);
            AjaxAPI.openWaitingModal();
            AjaxAPI.closeWaitingModal();
            var data = {
              accessorId: scope.blockParameters.accessorId,
              reservationId: scope.blockParameters.reservationId,
              targetIdentifier: scope.blockParameters.targetIdentifier,
            };
            AjaxAPI.postData("Rbs/Storeshipping/CancelReservation/", data).then(
              function () {
                window.location.reload(true);
              },
              function (result) {
                console.error("CancelReservation", result);
              },
            );
          };
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsReviewReviewPreloaded", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    "RbsChange.Cookies",
    function (scope, element, attrs, $rootScope, $compile, AjaxAPI, Cookies) {
      var authorId = parseInt(attrs.authorId || "0", 10);
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.data = { voting: false, editing: false, form: {} };
      scope.vote = function (reviewId, vote) {
        scope.data.voting = true;
        parameters.canVote = false;
        var ajaxData = { vote: vote };
        AjaxAPI.postData(
          "Rbs/Review/Review/" + reviewId + "/Votes",
          ajaxData,
          [],
        ).then(
          function () {
            if (Cookies.get("reviewVotes")) {
              var reviewVotes = Cookies.getObject("reviewVotes");
              reviewVotes.push(reviewId);
              Cookies.putObject("technical", "reviewVotes", reviewVotes);
            } else {
              Cookies.putObject("technical", "reviewVotes", [reviewId]);
            }
            parameters.voted = true;
            reloadBlock();
            parameters.voted = false;
          },
          function (result) {
            scope.data.voting = false;
            scope.error = result.data.message;
            console.error(result);
          },
        );
      };
      var userContext = AjaxAPI.globalVar("userContext");
      if (angular.isObject(userContext)) {
        if (userContext.accessorId && userContext.accessorId === authorId) {
          parameters.renderEdition = true;
          reloadBlock();
        }
      } else {
        AjaxAPI.getData("Rbs/User/Info", null, null).then(
          function (result) {
            if (
              result.data.dataSets.user.accessorId &&
              result.data.dataSets.user.accessorId === authorId
            ) {
              parameters.renderEdition = true;
              reloadBlock();
            }
          },
          function (result) {
            console.error(
              "[RbsReviewReviewPreloaded] Can't load user info:",
              result,
            );
          },
        );
      }
      scope.editReview = function editReview() {
        scope.data.editing = true;
      };
      scope.cancelEdition = function cancelEdition() {
        scope.data.editing = false;
      };
      scope.saveReview = function saveReview(reviewId) {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        var postData = {
          setData: {
            content: { raw: scope.data.form.content },
            rating: scope.data.form.rating,
          },
        };
        AjaxAPI.putData("Rbs/Review/Review/" + reviewId, postData, {}).then(
          function () {
            scope.data.editing = false;
            reloadBlock(true);
          },
          function (result) {
            scope.error = result.data.message;
            console.log("error", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      scope.deleteReview = function deleteReview(reviewId, event) {
        if (!confirm(event.target.getAttribute("data-confirm-message"))) {
          return;
        }
        AjaxAPI.openWaitingModal();
        scope.error = null;
        AjaxAPI.deleteData("Rbs/Review/Review/" + reviewId, {}, {}).then(
          function () {
            parameters.deleted = true;
            reloadBlock(true);
          },
          function (result) {
            scope.error = result.data.message;
            console.log("error", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      function reloadBlock(closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsReviewReviewPreloaded] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsReviewReviewsForDocument", [
    "$scope",
    "$element",
    "$attrs",
    "$compile",
    "RbsChange.AjaxAPI",
    "RbsChange.Cookies",
    function (scope, element, attrs, $compile, AjaxAPI, Cookies) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.TTL = 0;
      parameters.reviewPageNumber = parameters.reviewPageNumber || 1;
      scope.error = null;
      scope.adding = false;
      scope.editing = false;
      scope.data = { voting: false, form: {} };
      var userContext = AjaxAPI.globalVar("userContext");
      scope.saveReview = function (reviewId) {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        var postData = {
          setData: {
            content: { raw: scope.data.form.content },
            rating: scope.data.form.rating,
          },
        };
        var url;
        if (reviewId === 0) {
          url = "Rbs/Review/CurrentReviewForTarget/" + attrs.targetId;
        } else {
          url = "Rbs/Review/Review/" + reviewId;
        }
        AjaxAPI.putData(url, postData, {}).then(
          function () {
            scope.editing = false;
            scope.adding = false;
            reloadReviews({ userInteractionOnly: true });
            AjaxAPI.closeWaitingModal();
          },
          function (result) {
            scope.error = result.data.message;
            console.error(result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      scope.deleteReview = function (reviewId, event) {
        if (!confirm(event.target.getAttribute("data-confirm-message"))) {
          return;
        }
        AjaxAPI.openWaitingModal();
        scope.error = null;
        AjaxAPI.deleteData("Rbs/Review/Review/" + reviewId, {}, {}).then(
          function () {
            scope.editing = false;
            reloadReviews();
            AjaxAPI.closeWaitingModal();
          },
          function (result) {
            scope.error = result.data.message;
            console.error(result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      scope.addReview = function () {
        scope.adding = true;
      };
      scope.editReview = function () {
        scope.editing = true;
      };
      scope.cancelEdition = function () {
        scope.editing = false;
        scope.adding = false;
      };
      scope.onPaginationLinkClick = function ($event) {
        $event.originalEvent.stopPropagation();
        $event.originalEvent.preventDefault();
        if (scope.changingPage) {
          return;
        }
        scope.changingPage = true;
        parameters.reviewPageNumber = parseInt(
          $event.target.getAttribute("data-page-number"),
          10,
        );
        reloadReviews({ listOnly: true }).then(function () {
          scope.changingPage = false;
        });
      };
      scope.vote = function (reviewId, vote) {
        scope.data.voting = true;
        parameters.canVote = false;
        var ajaxData = { vote: vote };
        AjaxAPI.postData(
          "Rbs/Review/Review/" + reviewId + "/Votes",
          ajaxData,
          [],
        ).then(
          function () {
            if (Cookies.get("reviewVotes")) {
              var reviewVotes = Cookies.getObject("reviewVotes");
              reviewVotes.push(reviewId);
              Cookies.putObject("technical", "reviewVotes", reviewVotes);
            } else {
              Cookies.putObject("technical", "reviewVotes", [reviewId]);
            }
            var blockParameters = angular.copy(parameters);
            blockParameters.votedOn = reviewId;
            reloadReviews({ votedOn: reviewId }, blockParameters).then(
              function () {
                scope.data.voting = false;
              },
            );
          },
          function (result) {
            scope.data.voting = false;
            scope.error = result.data.message;
            console.error(result);
          },
        );
      };
      if (angular.isObject(userContext) && userContext.accessorId) {
        reloadReviews({ userInteractionOnly: true });
      }
      function reloadReviews(options, blockParameters) {
        blockParameters = blockParameters || angular.copy(parameters);
        var contentToReplace = ".reviews";
        options = options || {};
        blockParameters.listOnly = false;
        blockParameters.userInteractionOnly = false;
        if (options.userInteractionOnly) {
          contentToReplace = ".user-interaction";
          blockParameters.userInteractionOnly = true;
        } else if (options.listOnly) {
          contentToReplace = ".reviews-list";
          blockParameters.listOnly = true;
        }
        return AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          blockParameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resultHtml = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            );
            element
              .find(contentToReplace)
              .html($resultHtml.filter(contentToReplace).html());
            $compile(element.find(contentToReplace))(scope);
          },
          function (error) {
            console.error(
              "[RbsCatalogProductDetail] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsReviewInputStarRating", rbsReviewInputStarRating);
  function rbsReviewInputStarRating() {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-input-star-rating.twig",
      require: "?ngModel",
      scope: { scale: "@" },
      link: function (scope, elm, attrs, ngModel) {
        if (!ngModel) {
          return;
        }
        scope.stars = [];
        for (var i = 0; i < scope.scale; i++) {
          scope.stars.push(i + 1);
        }
        scope.scaled = {};
        ngModel.$render = function () {
          scope.scaled.rating = Math.floor(
            ngModel.$viewValue / (100 / scope.scale),
          );
        };
        scope.$watch("scaled.rating", function (value, oldValue) {
          if (value !== oldValue && !isNaN(value)) {
            ngModel.$setViewValue(
              Math.ceil(scope.scaled.rating * (100 / scope.scale)),
            );
          }
        });
      },
    };
  }
  app.directive("rbsReviewInputStarRatingItem", rbsReviewInputStarRatingItem);
  function rbsReviewInputStarRatingItem() {
    return {
      restrict: "A",
      scope: false,
      link: function (scope, elm, attrs) {
        var handlerIn = function handlerIn() {
          scope.scaled.hover = parseInt(attrs["rbsReviewInputStarRatingItem"]);
          scope.$digest();
        };
        var handlerOut = function handlerOut() {
          scope.scaled.hover = -1;
          scope.$digest();
        };
        elm.hover(handlerIn, handlerOut);
      },
    };
  }
  function addAvatarSize(ajaxData, size) {
    if (angular.isArray(ajaxData["avatarSizes"])) {
      ajaxData["avatarSizes"].push(size);
    } else {
      ajaxData["avatarSizes"] = [size];
    }
  }
  function addUrlFormat(ajaxParams, format) {
    if (!ajaxParams["urlFormats"]) {
      ajaxParams["urlFormats"] = format;
    } else if (angular.isArray(ajaxParams["urlFormats"])) {
      ajaxParams["urlFormats"].push(format);
    } else if (angular.isString(ajaxParams["urlFormats"])) {
      ajaxParams["urlFormats"] += "," + format;
    }
  }
  function addDataSetName(ajaxParams, name) {
    if (!ajaxParams["dataSetNames"]) {
      ajaxParams["dataSetNames"] = name;
    } else if (angular.isArray(ajaxParams["dataSetNames"])) {
      ajaxParams["dataSetNames"].push(name);
    } else if (angular.isString(ajaxParams["dataSetNames"])) {
      ajaxParams["dataSetNames"] += "," + name;
    }
  }
  app.directive("rbsReviewStarRating", rbsReviewStarRating);
  function rbsReviewStarRating() {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-star-rating.twig",
      scope: { rating: "=rbsReviewStarRating", scale: "@" },
      link: function (scope, elm, attrs) {
        scope.stars = [];
        for (var i = 0; i < scope.scale; i++) {
          scope.stars.push(i);
        }
        scope.$watch("rating", function () {
          if (attrs["scaled"] != "true") {
            scope.scaledRating = Math.floor(scope.rating / (100 / scope.scale));
          } else {
            scope.scaledRating = scope.rating;
          }
        });
      },
    };
  }
  app.directive("rbsReviewReviewsSummary", rbsReviewReviewsSummary);
  function rbsReviewReviewsSummary() {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-reviews-summary.twig",
      scope: {
        data: "=rbsReviewReviewsSummary",
        showReviews: "=showReviewsCallback",
        scale: "@",
      },
      link: function (scope, elm, attrs) {},
    };
  }
  app.directive("rbsReviewReviewsDetails", [
    "RbsChange.AjaxAPI",
    rbsReviewReviewsDetails,
  ]);
  function rbsReviewReviewsDetails(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-reviews-details.twig",
      scope: {
        targetId: "=",
        ajaxData: "=",
        ajaxParams: "=",
        handleVotes: "=",
        reviewsPerPage: "=",
        scale: "=",
      },
      link: function (scope, elm, attrs) {
        var ajaxData = angular.isObject(scope.ajaxData) ? scope.ajaxData : {};
        addAvatarSize(ajaxData, "60");
        var ajaxParams = angular.isObject(scope.ajaxParams)
          ? scope.ajaxParams
          : {};
        ajaxParams.detailed = true;
        addUrlFormat(ajaxParams, "canonical");
        var cacheKey = attrs["cacheKey"];
        if (
          cacheKey &&
          angular.isObject($window["__change"]) &&
          $window["__change"][cacheKey]
        ) {
          if (angular.isObject($window["__change"][cacheKey]["stats"])) {
            scope.statsData = $window["__change"][cacheKey]["stats"];
            refreshScaledDistribution();
          } else {
            loadStats();
          }
          if (angular.isObject($window["__change"][cacheKey]["list"])) {
            scope.listData = $window["__change"][cacheKey]["list"];
          }
        } else {
          loadStats();
        }
        function loadStats() {
          AjaxAPI.getData(
            "Rbs/Review/ReviewsForTarget/" + scope.targetId + "/Stats",
            ajaxData,
            ajaxParams,
          ).then(
            function (result) {
              scope.statsData = result.data.dataSets;
              refreshScaledDistribution();
            },
            function (result) {
              scope.error = result.data.message;
              console.log("error", result);
            },
          );
        }
        function refreshScaledDistribution() {
          scope.scaledAverage =
            scope.statsData.common.rating / (100 / scope.scale);
          scope.scaledDistribution = [];
          for (var i = 0; i <= scope.scale; i++) {
            scope.scaledDistribution.push({ rating: i, count: 0, percent: 0 });
          }
          for (i = 0; i < scope.statsData["distribution"].length; i++) {
            var row = scope.statsData["distribution"][i];
            var rating = Math.floor(row.rating / (100 / scope.scale));
            scope.scaledDistribution[rating].count += row.count;
            scope.scaledDistribution[rating].percent += row.percent;
          }
          scope.scaledDistribution.reverse();
          for (i = 0; i < scope.scaledDistribution.length; i++) {
            scope.scaledDistribution[i].ngStyle = {
              width: scope.scaledDistribution[i].percent + "%",
            };
          }
        }
      },
    };
  }
  app.directive("rbsReviewReviewsList", [
    "RbsChange.AjaxAPI",
    rbsReviewReviewsList,
  ]);
  function rbsReviewReviewsList(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-reviews-list.twig",
      scope: {
        targetId: "=",
        listData: "=",
        ajaxData: "=",
        ajaxParams: "=",
        handleVotes: "=",
        reviewsPerPage: "=",
        scale: "@",
      },
      link: function (scope) {
        scope.reviewsPerPage = scope.reviewsPerPage ? scope.reviewsPerPage : 10;
        var ajaxData = angular.isObject(scope.ajaxData) ? scope.ajaxData : {};
        addAvatarSize(ajaxData, "60");
        var ajaxParams = angular.isObject(scope.ajaxParams)
          ? scope.ajaxParams
          : {};
        ajaxParams.detailed = true;
        addUrlFormat(ajaxParams, "canonical");
        if (!angular.isObject(scope.listData)) {
          loadList(0, scope.reviewsPerPage);
        }
        function loadList(offset, limit) {
          scope.loading = true;
          ajaxParams.pagination = { offset: offset, limit: limit };
          AjaxAPI.getData(
            "Rbs/Review/ReviewsForTarget/" + scope.targetId,
            ajaxData,
            ajaxParams,
          ).then(
            function (result) {
              scope.listData = result.data;
              scope.loading = false;
            },
            function (result) {
              scope.error = result.data.message;
              scope.loading = false;
              console.log("error", result);
            },
          );
        }
        scope.updateListDataOffset = function (offset) {
          loadList(offset, scope.reviewsPerPage);
        };
      },
    };
  }
  app.directive("rbsReviewEdit", ["RbsChange.AjaxAPI", rbsReviewEdit]);
  function rbsReviewEdit(AjaxAPI) {
    var reviewUniqueId = 1;
    return {
      restrict: "A",
      templateUrl: "/rbs-review-edit.twig",
      scope: { data: "=rbsReviewEdit", scale: "@" },
      controller: [
        "$scope",
        function (scope) {
          scope.reviewUniqueId = reviewUniqueId++;
        },
      ],
      link: function (scope) {
        scope.identified = false;
        var refreshEditingData = function refreshEditingData(pseudonym) {
          if (
            angular.isObject(scope.data.editableReview) &&
            angular.isObject(scope.data.editableReview.common)
          ) {
            scope.editingData = {
              isNew: false,
              pseudonym: scope.data.editableReview.author.pseudonym,
              rating: scope.data.editableReview.common.rating,
              content: {
                raw: scope.data.editableReview.edition.content.raw,
                editor: "PlainText",
              },
            };
          } else {
            scope.editingData = {
              isNew: true,
              pseudonym: pseudonym,
              rating: null,
              content: { raw: "", editor: "PlainText" },
            };
          }
        };
        var ajaxPath;
        if (scope.data.targetId) {
          ajaxPath = "Rbs/Review/CurrentReviewForTarget/" + scope.data.targetId;
        } else if (
          angular.isObject(scope.data.editableReview) &&
          angular.isObject(scope.data.editableReview.common) &&
          scope.data.editableReview.common.id
        ) {
          ajaxPath = "Rbs/Review/Review/" + scope.data.editableReview.common.id;
        } else {
          console.error(
            "rbsReviewEdit",
            "Bad parameters: no target id and no review id",
          );
        }
        var ajaxData = angular.isObject(scope.data.ajaxData)
          ? angular.copy(scope.data.ajaxData)
          : {};
        var ajaxParams = angular.isObject(scope.data.ajaxParams)
          ? angular.copy(scope.data.ajaxParams)
          : {};
        ajaxParams.detailed = true;
        addDataSetName(ajaxParams, "edition");
        scope.cancelEdition = function cancelEdition() {
          scope.data.isEditing = false;
        };
        scope.saveReview = function saveReview() {
          AjaxAPI.openWaitingModal();
          scope.error = null;
          var postData = angular.copy(ajaxData);
          postData.setData = scope.editingData;
          AjaxAPI.putData(ajaxPath, postData, ajaxParams).then(
            function (result) {
              scope.data.editableReview = result.data.dataSets;
              scope.data.isEditing = false;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              scope.error = result.data.message;
              console.log("error", result);
              AjaxAPI.closeWaitingModal();
            },
          );
        };
        scope.deleteReview = function deleteReview(event) {
          if (!confirm(event.target.getAttribute("data-confirm-message"))) {
            return;
          }
          AjaxAPI.openWaitingModal();
          scope.error = null;
          AjaxAPI.deleteData(ajaxPath, ajaxData, ajaxParams).then(
            function () {
              scope.data.review = null;
              scope.data.editableReview = {
                author: scope.data.editableReview.author,
              };
              refreshEditingData(scope.editingData.pseudonym);
              scope.data.isEditing = true;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              scope.error = result.data.message;
              console.log("error", result);
              AjaxAPI.closeWaitingModal();
            },
          );
        };
        scope.$watch("data.isEditing", function () {
          if (
            angular.isObject(scope.data.editableReview) &&
            angular.isObject(scope.data.editableReview.author)
          ) {
            refreshEditingData(scope.data.editableReview.author["pseudonym"]);
          } else {
            refreshEditingData(null);
          }
        });
      },
    };
  }
  app.directive("rbsReviewDisplay", [
    "RbsChange.Cookies",
    "RbsChange.AjaxAPI",
    rbsReviewDisplay,
  ]);
  function rbsReviewDisplay(cookies, AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-display.twig",
      scope: { data: "=rbsReviewDisplay", handleVotes: "=", scale: "@" },
      link: function (scope, elm, attrs) {
        scope.number = attrs["number"] ? attrs["number"] : null;
        scope.idPrefix = attrs["idPrefix"] ? attrs["idPrefix"] : "review";
        scope.voted = false;
        scope.canVote = true;
        var reviewVotes = cookies.getObject("reviewVotes");
        if (reviewVotes) {
          angular.forEach(reviewVotes, function (reviewVote) {
            if (reviewVote === scope.data.common.id) {
              scope.canVote = false;
            }
          });
        }
        scope.url = null;
        if (
          angular.isObject(scope.data.common) &&
          angular.isObject(scope.data.common.URL)
        ) {
          scope.url =
            scope.data.common.URL["contextual"] ||
            scope.data.common.URL["canonical"];
        }
        scope.vote = function (vote) {
          scope.canVote = false;
          var ajaxData = { vote: vote };
          AjaxAPI.postData(
            "Rbs/Review/Review/" + scope.data.common.id + "/Votes",
            ajaxData,
            [],
          ).then(
            function (result) {
              scope.voted = true;
              scope.data.votes = result.data.dataSets.votes;
              if (cookies.get("reviewVotes")) {
                var reviewVotes = cookies.getObject("reviewVotes");
                reviewVotes.push(scope.data.common.id);
                cookies.putObject("technical", "reviewVotes", reviewVotes);
              } else {
                cookies.putObject("technical", "reviewVotes", [
                  scope.data.common.id,
                ]);
              }
            },
            function (result) {
              scope.error = result.data.message;
              console.error(result);
            },
          );
        };
      },
    };
  }
  app.directive("rbsReviewReviewDetails", [
    "RbsChange.AjaxAPI",
    "$window",
    rbsReviewReviewDetails,
  ]);
  function rbsReviewReviewDetails(AjaxAPI, $window) {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-review-details.twig",
      scope: { reviewId: "@", ajaxData: "=", ajaxParams: "=" },
      link: function (scope, elm, attrs) {
        scope.loading = true;
        scope.loadingEdition = false;
        var cacheKey = attrs["cacheKey"];
        if (cacheKey) {
          scope.parameters = AjaxAPI.getBlockParameters(cacheKey);
        }
        scope.handleVotes = scope.parameters.handleVotes || false;
        scope.scale = scope.parameters.scale || 5;
        angular.forEach(
          (scope.parameters.avatarSizes || "60").split(","),
          function (size) {
            addAvatarSize(scope.ajaxData, size);
          },
        );
        scope.data = {
          review: null,
          editableReview: null,
          isEditing: false,
          ajaxData: scope.ajaxData,
          ajaxParams: scope.ajaxParams,
        };
        scope.editReview = function editReview() {
          scope.data.isEditing = true;
        };
        if (
          cacheKey &&
          angular.isObject($window["__change"]) &&
          $window["__change"][cacheKey]
        ) {
          scope.data.review = $window["__change"][cacheKey];
          loadUserContext();
          scope.loading = false;
        } else {
          var ajaxData = angular.isObject(scope.ajaxData) ? scope.ajaxData : {};
          var ajaxParams = angular.isObject(scope.ajaxParams)
            ? scope.ajaxParams
            : {};
          ajaxParams.detailed = true;
          addUrlFormat(ajaxParams, "canonical");
          AjaxAPI.getData(
            "Rbs/Review/Review/" + scope.reviewId,
            ajaxData,
            ajaxParams,
          ).then(
            function (result) {
              scope.data.review = result.data.dataSets;
              loadUserContext();
              scope.loading = false;
            },
            function (result) {
              scope.error = result.data.message;
              console.log("error", result);
              scope.loading = false;
            },
          );
        }
        function loadUserContext() {
          var userContext = AjaxAPI.globalVar("userContext");
          if (angular.isObject(userContext)) {
            refreshDataForEdition(userContext);
          }
          if (!angular.isObject(userContext)) {
            AjaxAPI.getData("Rbs/User/Info", null, null).then(
              function (result) {
                userContext = AjaxAPI.globalVar(
                  "userContext",
                  result.data.dataSets.user,
                );
                refreshDataForEdition(userContext);
              },
              function (result) {
                if (status != 403) {
                  scope.error = result.data.message;
                  console.log("error", result);
                }
                userContext = AjaxAPI.globalVar("userContext", {
                  accessorId: 0,
                });
              },
            );
          }
        }
        function refreshDataForEdition(userContext) {
          scope.loadingEdition = true;
          var reviewAuthorId = 0;
          if (
            angular.isObject(scope.data.review) &&
            angular.isObject(scope.data.review.author)
          ) {
            reviewAuthorId = scope.data.review.author.id;
          }
          var accessorId = 0;
          if (angular.isObject(userContext) && userContext.accessorId) {
            accessorId = userContext.accessorId;
          }
          if (reviewAuthorId && reviewAuthorId == accessorId) {
            var ajaxData = angular.isObject(scope.ajaxData)
              ? scope.ajaxData
              : {};
            var ajaxParams = angular.isObject(scope.ajaxParams)
              ? scope.ajaxParams
              : {};
            ajaxParams.detailed = true;
            addUrlFormat(ajaxParams, "canonical");
            addDataSetName(ajaxParams, "edition");
            AjaxAPI.getData(
              "Rbs/Review/Review/" + scope.reviewId,
              ajaxData,
              ajaxParams,
            ).then(
              function (result) {
                scope.data.editableReview = result.data.dataSets;
                scope.loadingEdition = false;
              },
              function (result) {
                scope.error = result.data.message;
                console.log("error", result);
                scope.loadingEdition = false;
              },
            );
          } else {
            scope.data.editableReview = null;
            scope.loadingEdition = false;
          }
        }
      },
    };
  }
  app.directive("rbsReviewCurrentReview", [
    "RbsChange.AjaxAPI",
    rbsReviewCurrentReview,
  ]);
  function rbsReviewCurrentReview(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-review-current-review.twig",
      scope: { targetId: "=", ajaxData: "=", ajaxParams: "=", scale: "@" },
      link: function (scope) {
        scope.identified = false;
        scope.loading = true;
        scope.loadingEdition = false;
        scope.data = {
          review: null,
          editableReview: null,
          targetId: scope.targetId,
          isEditing: false,
          ajaxData: scope.ajaxData,
          ajaxParams: scope.ajaxParams,
        };
        scope.editReview = function editReview() {
          scope.data.isEditing = true;
        };
        var userContext = AjaxAPI.globalVar("userContext");
        if (angular.isObject(userContext)) {
          refreshData(userContext);
        }
        if (!angular.isObject(userContext)) {
          AjaxAPI.getData("Rbs/User/Info", null, null).then(
            function (result) {
              userContext = AjaxAPI.globalVar(
                "userContext",
                result.data.dataSets.user,
              );
              refreshData(userContext);
            },
            function (result) {
              if (result.status != 403) {
                scope.error = result.data.message;
                console.log("error", result);
              }
              userContext = AjaxAPI.globalVar("userContext", { accessorId: 0 });
              scope.loading = false;
            },
          );
        }
        function refreshData(userContext) {
          var accessorId = 0;
          if (angular.isObject(userContext) && userContext.accessorId) {
            accessorId = userContext.accessorId;
          }
          if (accessorId) {
            scope.identified = true;
            refreshDataForDisplay();
            refreshDataForEdition();
          } else {
            scope.data.review = null;
            scope.data.editableReview = null;
            scope.loading = false;
          }
        }
        function refreshDataForDisplay() {
          var ajaxData = angular.isObject(scope.ajaxData)
            ? angular.copy(scope.ajaxData)
            : {};
          var ajaxParams = angular.isObject(scope.ajaxParams)
            ? angular.copy(scope.ajaxParams)
            : {};
          ajaxParams.detailed = true;
          AjaxAPI.getData(
            "Rbs/Review/CurrentReviewForTarget/" + scope.targetId,
            ajaxData,
            ajaxParams,
          ).then(
            function (result) {
              if (result.data.dataSets.common) {
                scope.data.review = result.data.dataSets;
              } else {
                scope.data.review = null;
              }
              scope.loading = false;
            },
            function (result) {
              if (result.status != 401) {
                scope.error = result.data.message;
                console.error(result);
              }
              scope.data.review = null;
              scope.loading = false;
            },
          );
        }
        function refreshDataForEdition() {
          scope.loadingEdition = true;
          var ajaxData = angular.isObject(scope.ajaxData) ? scope.ajaxData : {};
          var ajaxParams = angular.isObject(scope.ajaxParams)
            ? scope.ajaxParams
            : {};
          ajaxParams.detailed = true;
          addUrlFormat(ajaxParams, "canonical");
          addDataSetName(ajaxParams, "edition");
          AjaxAPI.getData(
            "Rbs/Review/CurrentReviewForTarget/" + scope.targetId,
            ajaxData,
            ajaxParams,
          ).then(
            function (result) {
              scope.data.editableReview = result.data.dataSets;
              if (!angular.isObject(scope.data.editableReview.common)) {
                scope.data.isEditing = true;
              }
              scope.loadingEdition = false;
            },
            function (result) {
              scope.error = result.data.message;
              console.log("error", result);
              scope.loadingEdition = false;
            },
          );
        }
      },
    };
  }
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("head", [
    "$rootScope",
    function ($rootScope) {
      return {
        restrict: "E",
        scope: false,
        link: function () {
          var jqTitle;
          $rootScope.$on("RbsSeoUpdateMetas", function (event, args) {
            if (angular.isObject(args) && args.title) {
              if (!jqTitle) {
                jqTitle = jQuery("head title");
              }
              jqTitle.text(args.title);
            }
          });
        },
      };
    },
  ]);
})(window.jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsSeoFacetUrlDecorator", [
    "$rootScope",
    "$filter",
    "RbsChange.AjaxAPI",
    function ($rootScope, $filter, AjaxAPI) {
      return {
        restrict: "A",
        scope: false,
        link: function (scope) {
          var visibility = scope.blockParameters.visibility || "list";
          var attributesMode = scope.blockParameters.attributesMode || "flat";
          scope.imageFormat =
            scope.blockParameters.defaultImageFormat || "attribute";
          if (scope.blockData.decoratorData) {
            scope.decoratorId = scope.blockData.decoratorData.common.id;
            scope.attributes = $filter("rbsVisibleAttributes")(
              scope.blockData.decoratorData,
              visibility,
              attributesMode,
            );
          } else {
            scope.decoratorId = 0;
            scope.attributes = [];
          }
          var attributesCache = {};
          attributesCache["attr" + scope.decoratorId] = scope.attributes;
          $rootScope.$on("RbsSeoUpdateDecorator", function (event, args) {
            var newDecoratorId = args.decoratorId || 0;
            scope.decoratorId = newDecoratorId;
            scope.attributes = [];
            if (newDecoratorId) {
              var key = "attr" + newDecoratorId;
              if (attributesCache.hasOwnProperty(key)) {
                scope.attributes = attributesCache[key];
              } else {
                AjaxAPI.getData(
                  "Rbs/Seo/FacetUrlDecorator/" + newDecoratorId,
                  null,
                  scope.blockData.context,
                ).then(function (result) {
                  scope.attributes = $filter("rbsVisibleAttributes")(
                    result.data.dataSets,
                    visibility,
                    attributesMode,
                  );
                  attributesCache[key] = scope.attributes;
                });
              }
            }
          });
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsSeoFacetUrlDecoratorPreloaded", [
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    function ($rootScope, $compile, AjaxAPI) {
      return {
        restrict: "A",
        scope: false,
        link: function (scope, elem) {
          $rootScope.$on("RbsSeoUpdateDecorator", function (event, args) {
            var newDecoratorId = args.decoratorId || 0;
            if (newDecoratorId) {
              var parameters = angular.copy(scope.blockParameters);
              parameters.decoratorId = newDecoratorId;
              AjaxAPI.reloadBlock(
                scope.blockName,
                scope.blockId,
                parameters,
                scope.blockNavigationContext,
              ).then(
                function (result) {
                  elem.html(
                    jQuery(jQuery.parseHTML(result.data.dataSets.html))
                      .filter(".content")
                      .html(),
                  );
                  $compile(elem.find(".facet-url-attributes"))(scope);
                },
                function (error) {
                  console.error(
                    "[rbsSeoFacetUrlDecoratorPreloaded] error reloading block:",
                    error,
                  );
                },
              );
            } else {
              elem.html("");
            }
          });
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsOrderLineAddToCart", [
    "RbsChange.ModalStack",
    function (ModalStack) {
      return {
        restrict: "A",
        templateUrl: "/rbs-order-line-add-to-cart.twig",
        scope: { line: "<rbsOrderLineAddToCart" },
        link: function (scope) {
          scope.openDialog = function () {
            var options = {
              templateUrl: "/rbs-catalog-quick-buy-modal-dialog.twig",
              backdropClass: "modal-backdrop-rbs-catalog-quick-buy",
              windowClass: "modal-rbs-catalog-quick-buy",
              size: "lg",
              controller: "RbsCatalogQuickBuyModalCtrl",
              resolve: {
                quickBuyURL: function () {
                  return scope.line.product.common.quickBuyURL;
                },
              },
            };
            ModalStack.open(options);
          };
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function RbsOrderAttachController(scope, $window, AjaxAPI) {
    scope.submit = function submit() {
      AjaxAPI.openWaitingModal();
      AjaxAPI.postData("Rbs/Order/AttachOrder", {
        orderNumber: scope.orderNumber,
      }).then(
        function (result) {
          AjaxAPI.closeWaitingModal();
          if (result.data.dataSets.isSuccess) {
            scope.error = null;
            scope.orderNumber = "";
            $window.location.reload();
          } else {
            scope.error = result.data.dataSets.message;
          }
        },
        function (result) {
          AjaxAPI.closeWaitingModal();
          console.error(result);
        },
      );
    };
  }
  app.controller("RbsOrderAttachController", [
    "$scope",
    "$window",
    "RbsChange.AjaxAPI",
    RbsOrderAttachController,
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var TIME_TO_SHOW_MESSAGE = 5000;
  var TO = null;
  app.directive("rbsCommerceCartDeliveries", [
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    "$window",
    "RbsChange.ModalStack",
    rbsCommerceCartDeliveries,
  ]);
  function rbsCommerceCartDeliveries(
    $rootScope,
    $compile,
    AjaxAPI,
    $window,
    ModalStack,
  ) {
    var cacheCartDataKey = "cartData";
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-deliveries.twig",
      controller: [
        "$scope",
        function (scope) {
          var self = this;
          var modifications = {};
          this.loadCartData = function () {
            AjaxAPI.openWaitingModal();
            AjaxAPI.getData("Rbs/Commerce/Cart", null, {
              detailed: true,
              URLFormats: "canonical",
              visualFormats: scope.parameters["imageFormats"],
            }).then(
              function (result) {
                var cartData = result.data.dataSets;
                if (cartData && !angular.isArray(cartData)) {
                  self.setCartData(cartData);
                }
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                console.error("loadCartData", result);
                AjaxAPI.closeWaitingModal();
              },
            );
          };
          this.updateCartData = function (actions, parentModalsToClose) {
            AjaxAPI.openWaitingModal();
            var request = AjaxAPI.putData("Rbs/Commerce/Cart", actions, {
              detailed: true,
              URLFormats: "canonical",
              visualFormats: scope.parameters["imageFormats"],
            });
            request.then(
              function (result) {
                var cartData = result.data.dataSets;
                if (
                  cartData &&
                  !angular.isArray(cartData) &&
                  cartData.deliveries.length
                ) {
                  self.setCartData(cartData);
                  AjaxAPI.closeWaitingModal(parentModalsToClose);
                } else {
                  location.reload();
                }
              },
              function (result) {
                console.error("updateCartData", result);
                AjaxAPI.closeWaitingModal(parentModalsToClose);
              },
            );
            return request;
          };
          this.updateCartLinesData = function (
            updateLinesData,
            parentModalsToClose,
          ) {
            AjaxAPI.openWaitingModal();
            var request = AjaxAPI.putData(
              "Rbs/Commerce/Cart/Lines",
              { lines: updateLinesData },
              {
                detailed: true,
                URLFormats: "canonical",
                visualFormats: scope.parameters["imageFormats"],
              },
            );
            request.then(
              function (result) {
                var cartData = result.data.dataSets;
                if (
                  cartData &&
                  !angular.isArray(cartData) &&
                  cartData.deliveries.length
                ) {
                  self.setCartData(cartData);
                  AjaxAPI.closeWaitingModal(parentModalsToClose);
                } else {
                  location.reload();
                }
              },
              function (result) {
                console.error("updateCartData", result);
                AjaxAPI.closeWaitingModal(parentModalsToClose);
              },
            );
            return request;
          };
          scope.cancelPayment = function (parentModalsToClose) {
            var data = { mergeProductsConflict: true };
            var url = "Rbs/Commerce/Payment/cancel";
            AjaxAPI.openWaitingModal();
            return AjaxAPI.putData(url, data).then(
              function () {
                AjaxAPI.closeWaitingModal(parentModalsToClose);
                $window.location.reload(true);
              },
              function (error) {
                console.error("cancelPayment", error);
                AjaxAPI.closeWaitingModal(parentModalsToClose);
              },
            );
          };
          this.moveLineTo = function (
            deliveryIndex,
            key,
            storeId,
            reservation,
            parentModalsToClose,
          ) {
            var actions = {
              moveLines: [
                {
                  key: key,
                  deliveryIndex: deliveryIndex,
                  storeId: storeId,
                  reservation: reservation == true,
                },
              ],
            };
            return this.updateCartData(actions, parentModalsToClose);
          };
          this.showPrices = function (asObject) {
            var showPrices =
              scope.parameters &&
              (scope.parameters.displayPricesWithTax ||
                scope.parameters.displayPricesWithoutTax);
            if (asObject && showPrices) {
              return {
                currencyCode: this.getCurrencyCode(),
                displayPricesWithTax: this.parameters("displayPricesWithTax"),
                displayPricesWithoutTax: this.parameters(
                  "displayPricesWithoutTax",
                ),
                handleWebStorePrices: this.parameters("handleWebStorePrices"),
                handleStorePrices: this.parameters("handleStorePrices"),
              };
            }
            return showPrices;
          };
          this.getCurrencyCode = function () {
            return scope.currencyCode;
          };
          this.parameters = function (name) {
            if (scope.parameters) {
              if (angular.isUndefined(name)) {
                return scope.parameters;
              } else {
                return scope.parameters[name];
              }
            }
            return null;
          };
          this.getCartData = function () {
            return scope.cartData;
          };
          this.setCartData = function (cartData) {
            scope.cartData = cartData;
            scope.currencyCode = null;
            modifications = {};
            if (cartData) {
              if (this.showPrices()) {
                scope.currencyCode = cartData.common.currencyCode;
                var displayPricesWithTax =
                  scope.parameters.displayPricesWithTax;
                if (displayPricesWithTax) {
                  cartData.amounts = {
                    linesAmountWithTaxes: 0.0,
                    displayTotalWithTaxes: true,
                  };
                } else {
                  cartData.amounts = {
                    linesAmountWithoutTaxes: 0.0,
                    displayTotalWithTaxes: false,
                  };
                }
                cartData.amounts.displayTaxes =
                  cartData.processData &&
                  cartData.processData.capabilities &&
                  cartData.processData.capabilities.useTax &&
                  !cartData.processData.capabilities.taxByZone;
                angular.forEach(cartData.deliveries, function (delivery, idx) {
                  delivery.deliveryIndex = idx;
                  if (displayPricesWithTax) {
                    cartData.amounts.linesAmountWithTaxes +=
                      delivery.linesAmountWithTaxes;
                  } else {
                    cartData.amounts.linesAmountWithoutTaxes +=
                      delivery.linesAmountWithoutTaxes;
                  }
                });
              }
            }
            $rootScope.$broadcast("rbsRefreshCart", { cart: cartData });
          };
          var contentScopes = {};
          this.replaceChildren = function (parentNode, scope, html) {
            var id = scope.$id;
            if (contentScopes[id]) {
              contentScopes[id].$destroy();
              contentScopes[id] = null;
            }
            parentNode.children().remove();
            contentScopes[id] = scope.$new();
            $compile(html)(contentScopes[id], function (clone) {
              parentNode.append(clone);
            });
          };
          this.redrawLines = function (lines, elem, scope) {
            var linesContainer = elem.find('[data-role="cart-lines"]');
            var directiveName = angular.isFunction(this.getLineDirectiveName)
              ? this.getLineDirectiveName
              : function (line) {
                  return line.options && line.options.directiveName
                    ? line.options.directiveName
                    : "rbs-commerce-cart-line-default";
                };
            var html = [];
            angular.forEach(lines, function (line, idx) {
              html.push(
                '<tr data-line="delivery.lines[' +
                  idx +
                  ']" data-delivery="delivery" ' +
                  directiveName(line) +
                  '=""></tr>',
              );
            });
            this.replaceChildren(linesContainer, scope, html.join(""));
          };
          this.hasModifications = function () {
            var modified = false;
            angular.forEach(modifications, function (modification) {
              if (modification) {
                modified = true;
              }
            });
            return modified;
          };
          this.setModification = function (key, modified) {
            if (modified) {
              modifications[key] = true;
            } else {
              delete modifications[key];
            }
          };
          scope.$watch("cartData", function (cartData) {
            if (cartData) {
              let canOrderStore = true;
              const storeDelivery = cartData.deliveries.find(
                (delivery) => delivery.category == "store",
              );
              if (storeDelivery) {
                canOrderStore = storeDelivery.totalAmountWithTaxes >= 10;
              }
              scope.acceptTermsAndConditions =
                scope.cartData.options.acceptTermsAndConditions;
              scope.cartData.processData.canOrder =
                scope.cartData.processData.canOrder &&
                scope.acceptTermsAndConditions &&
                canOrderStore;
            }
          });
          scope.parameters = scope.blockParameters;
          var cartData = AjaxAPI.globalVar(cacheCartDataKey);
          if (!cartData) {
            this.loadCartData();
          } else {
            this.setCartData(cartData);
          }
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.cartData.options.acceptTermsAndConditions = false;
        scope.acceptTermsAndConditions = false;
        scope.cartData.processData.canOrder =
          scope.cartData.processData.canOrder && scope.acceptTermsAndConditions;
        scope.showPrices = controller.showPrices();
        scope.text_point =
          window.__change.blockParameters[scope.blockId].textePoint;
        scope.currencyCode = controller.getCurrencyCode();
        scope.$watch("acceptTermsAndConditions", function (newValue, oldValue) {
          if (newValue !== oldValue && angular.isDefined(newValue)) {
            var actions = {
              updateContext: { acceptTermsAndConditions: newValue == true },
            };
            controller.updateCartData(actions);
          }
        });
        scope.hasModifications = function () {
          return controller.hasModifications();
        };
        scope.countLines = function () {
          var lines = 0;
          angular.forEach(scope.cartData.deliveries, function (delivery) {
            lines += delivery.lines.length;
          });
          return lines;
        };
        scope.canOrder = function () {
          var cartData = scope.cartData;
          if (
            !cartData ||
            !cartData.processData ||
            !cartData.processData.canOrder
          ) {
            return false;
          }
          return !scope.hasModifications();
        };
        scope.coupons = {
          newCode: null,
          add: addCoupon,
          remove: removeCoupon,
          addSuggestion: addSuggestion,
          maximumUsableCoupon:
            scope.cartData.processData.capabilities.maximumUsableCoupon || null,
          submit: submitCoupon,
        };
        scope.$watch("cartData", function () {
          refreshAmounts(scope.cartData);
        });
        function addCoupon() {
          return doAddCoupon(scope.coupons.newCode);
        }
        function addSuggestion(coupon) {
          return doAddCoupon(coupon.code);
        }
        function submitCoupon(event) {
          if (
            event !== undefined &&
            event.keyCode === 13 &&
            scope.coupons.newCode
          ) {
            addCoupon();
          }
        }
        function doAddCoupon(code) {
          var coupons = angular.copy(scope.cartData["coupons"]);
          coupons.push({ code: code });
          var actions = { setCoupons: coupons };
          var request = controller.updateCartData(actions);
          if (request) {
            request.then(
              function () {
                var cartData = controller.getCartData();
                refreshAmounts(cartData);
                scope.coupons.couponsNotFound = coupons.filter(function (val) {
                  for (var i in cartData.updated.setCoupons) {
                    if (
                      cartData.updated.setCoupons.hasOwnProperty(i) &&
                      val.code.toLowerCase() ===
                        cartData.updated.setCoupons[i].code.toLowerCase()
                    ) {
                      return false;
                    }
                  }
                  return true;
                });
                if (
                  !scope.coupons.couponsNotFound.length &&
                  code === scope.coupons.newCode
                ) {
                  scope.coupons.newCode = null;
                }
                if (TO) {
                  clearTimeout(TO);
                }
              },
              function (result) {
                console.error("doAddCoupon", result);
              },
            );
          } else {
            var cartData = controller.getCartData();
            refreshAmounts(cartData);
          }
          return request;
        }
        function removeCoupon(couponIndex) {
          var coupons = [];
          angular.forEach(scope.cartData["coupons"], function (coupon, i) {
            if (i !== couponIndex) {
              coupons.push(coupon);
            }
          });
          var actions = { setCoupons: coupons };
          var request = controller.updateCartData(actions);
          if (request) {
            request.then(
              function () {
                var cartData = controller.getCartData();
                refreshAmounts(cartData);
              },
              function (result) {
                console.error("removeCoupon", result);
              },
            );
          } else {
            var cartData = controller.getCartData();
            refreshAmounts(cartData);
          }
          return request;
        }
        function refreshAmounts(cartData) {
          scope.amountLines = [];
          if (scope.showPrices && scope.cartData.amounts) {
            var displayTotalWithTaxes = cartData.amounts.displayTotalWithTaxes;
            var deliveries = cartData.deliveries;
            angular.forEach(deliveries, function (delivery, key) {
              angular.forEach(delivery.modifiers, function (modifier) {
                var amount = displayTotalWithTaxes
                  ? modifier["amountWithTaxes"]
                  : modifier["amountWithoutTaxes"];
                if (amount && modifier.title) {
                  var line = { amount: amount, title: modifier.title };
                  scope.amountLines.push(line);
                }
              });
            });
            if (!displayTotalWithTaxes) {
              scope.cartData.amounts.totalAmountWithoutTaxes =
                delivery.totalAmountWithoutTaxes;
            }
          }
          scope.showFeesEvaluation = calculateShowFeesEvaluation(cartData);
        }
        function calculateShowFeesEvaluation(cartData) {
          if (cartData.processData.options.simplified) {
            return false;
          }
          for (var i = 0; i < cartData.deliveries.length; i++) {
            if (
              !cartData.deliveries[i].mode ||
              !cartData.deliveries[i].mode.common ||
              !cartData.deliveries[i].mode.common.id
            ) {
              return true;
            }
          }
          return false;
        }
      },
    };
  }
  app.directive("rbsCommerceCartDelivery", [
    "RbsChange.ModalStack",
    "$rootScope",
    rbsCommerceCartDelivery,
  ]);
  function rbsCommerceCartDelivery(ModalStack, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-delivery.twig",
      require: "^rbsCommerceCartDeliveries",
      scope: { delivery: "=", cartData: "=", showAllAmounts: "=" },
      link: function (scope, elem, attrs, controller) {
        scope.showPrices = controller.showPrices();
        scope.currencyCode = controller.getCurrencyCode();
        scope.showToOtherStore = !!scope.delivery.storeId;
        scope.$watchCollection("delivery.lines", function (lines) {
          if (lines && lines.length) {
            controller.redrawLines(lines, elem, scope);
          } else {
            controller.redrawLines([], elem, scope);
          }
        });
        scope.selectStore = function (forReservation) {
          var options = {
            templateUrl: "/rbs-catalog-show-store-availability-modal.twig",
            backdropClass: "modal-backdrop-rbs-catalog-show-store-availability",
            windowClass: "modal-rbs-catalog-show-store-availability",
            size: "lg",
            controller: "RbsCatalogShowStoreAvailabilityModalDeliveryCtrl",
            resolve: {
              delivery: function () {
                return scope.delivery;
              },
              forReservation: function () {
                return forReservation === true;
              },
              forPickUp: function () {
                return forReservation === false;
              },
              cartController: function () {
                return controller;
              },
              pricesConfiguration: function () {
                return controller.showPrices(true);
              },
            },
          };
          ModalStack.open(options);
        };
        function canProcessStoreDelivery(delivery) {
          if (delivery) {
            scope.canProcessStoreDeliveryCache =
              delivery.totalAmountWithTaxes >= 10;
            return scope.canProcessStoreDeliveryCache;
          }
        }
        function evaluateShippingFee(cartData) {
          scope.amountValue = window.__change["amountValue"];
          const storeDelivery = cartData.deliveries.find(
            (delivery) => delivery.category == "store",
          );
          if (storeDelivery) {
            canProcessStoreDelivery(storeDelivery);
          }
          scope.francoAmountLeft = null;
          angular.forEach(cartData.deliveries, function (delivery) {
            if (delivery.options.notAppliedModifiers) {
              angular.forEach(
                delivery.options.notAppliedModifiers,
                function (notAppliedModifier) {
                  if (notAppliedModifier.technicalName === "franco") {
                    var cartFilterdata = notAppliedModifier.cartFilterData;
                    if (
                      cartFilterdata.name === "group" &&
                      cartFilterdata.parameters.operator === "AND"
                    ) {
                      var filtersOk = true;
                      var filterAmountOk = false;
                      var amountValue = 0;
                      angular.forEach(
                        cartFilterdata.filters,
                        function (filter) {
                          if (filter.name !== "group") {
                            if (
                              filter.name === "deliveryLinesAmount" ||
                              filter.name === "deliveryTotalAmount"
                            ) {
                              amountValue = filter.parameters.value;
                              if (!scope.amountValue) {
                                scope.amountValue = amountValue;
                                window.__change["amountValue"] = amountValue;
                              }
                              if (filter.__isValid) {
                                filterAmountOk = true;
                                return;
                              }
                            } else if (!filter.__isValid) {
                              filtersOk = false;
                            }
                          }
                        },
                      );
                      if (filtersOk && !filterAmountOk) {
                        scope.francoAmountLeft =
                          amountValue - delivery.linesAmountWithTaxes;
                      }
                    }
                  }
                },
              );
            } else {
            }
          });
        }
        evaluateShippingFee(scope.cartData);
      },
    };
  }
  app.directive("rbsCommerceCartDeliveryMessages", [
    rbsCommerceCartDeliveryMessages,
  ]);
  function rbsCommerceCartDeliveryMessages() {
    return {
      restrict: "A",
      templateUrl: function (elem, attrs) {
        return (
          "/rbs-commerce-cart-messages" +
          (attrs.templateSuffix ? attrs.templateSuffix : "") +
          ".twig"
        );
      },
      scope: { messages: "<rbsCommerceCartDeliveryMessages", delivery: "<?" },
      link: function (scope) {
        scope.$watch("delivery.messages", function (messages) {
          if (angular.isArray(messages)) {
            scope.messages = messages;
          }
        });
      },
    };
  }
  app.directive("rbsCommerceCartGlobalMessages", [
    rbsCommerceCartGlobalMessages,
  ]);
  function rbsCommerceCartGlobalMessages() {
    return {
      restrict: "A",
      templateUrl: function (elem, attrs) {
        return (
          "/rbs-commerce-cart-messages" +
          (attrs.templateSuffix ? attrs.templateSuffix : "") +
          ".twig"
        );
      },
      scope: { messages: "<rbsCommerceCartGlobalMessages", cart: "<?" },
      link: function (scope) {
        scope.$watch("cart.common.messages", function (messages) {
          if (angular.isArray(messages)) {
            scope.messages = messages;
          }
        });
      },
    };
  }
  app.directive("rbsCommerceSuggestCoupons", [rbsCommerceSuggestCoupons]);
  function rbsCommerceSuggestCoupons() {
    return {
      restrict: "A",
      templateUrl: function (elem, attrs) {
        return (
          "/rbs-commerce-suggest-coupons" +
          (attrs.templateSuffix ? attrs.templateSuffix : "") +
          ".twig"
        );
      },
      scope: {
        suggestedCoupons: "<rbsCommerceSuggestCoupons",
        usedCoupons: "<",
        addSuggestion: "<",
      },
      link: function (scope) {
        var suggestedCoupons = [];
        scope.$watchCollection("suggestedCoupons", function (coupons) {
          if (angular.isArray(coupons)) {
            suggestedCoupons = coupons;
            refreshList();
          }
        });
        scope.$watchCollection("usedCoupons", refreshList);
        function refreshList() {
          if (
            suggestedCoupons.length &&
            scope.usedCoupons &&
            scope.usedCoupons.length
          ) {
            scope.coupons = [];
            angular.forEach(suggestedCoupons, function (suggestedCoupon) {
              var alreadyUsed = false;
              angular.forEach(scope.usedCoupons, function (coupon) {
                if (suggestedCoupon.code === coupon.code) {
                  alreadyUsed = true;
                }
              });
              if (!alreadyUsed) {
                scope.coupons.push(suggestedCoupon);
              }
            });
          } else {
            scope.coupons = suggestedCoupons;
          }
        }
      },
    };
  }
  app.controller("RbsCatalogShowStoreAvailabilityModalDeliveryCtrl", [
    "RbsChange.ModalStack",
    "$scope",
    "$uibModalInstance",
    "delivery",
    "forReservation",
    "forPickUp",
    "cartController",
    "pricesConfiguration",
    RbsCatalogShowStoreAvailabilityModalDeliveryCtrl,
  ]);
  function RbsCatalogShowStoreAvailabilityModalDeliveryCtrl(
    ModalStack,
    scope,
    $uibModalInstance,
    delivery,
    forReservation,
    forPickUp,
    cartController,
    pricesConfiguration,
  ) {
    scope.allowSelect = true;
    scope.forReservation = forReservation;
    scope.forPickUp = forPickUp;
    scope.storeId = delivery.storeId;
    scope.skuQuantities = {};
    scope.pricesConfiguration = pricesConfiguration;
    angular.forEach(delivery.lines, function (line) {
      if (line.codeSKU) {
        if (scope.skuQuantities.hasOwnProperty(line.codeSKU)) {
          scope.skuQuantities[line.codeSKU] += line.quantity;
        } else {
          scope.skuQuantities[line.codeSKU] = line.quantity;
        }
      }
    });
    scope.selectStore = function (storeData) {
      var storeId = storeData.common.id;
      var actions = {
        updateDeliveries: [
          {
            index: delivery.deliveryIndex,
            storeId: storeId,
            reservation: forReservation,
            store: storeData,
          },
        ],
      };
      cartController.updateCartData(actions, 1);
    };
    var closeFunction = function () {
      ModalStack.showPrevious();
    };
    $uibModalInstance.result.then(closeFunction, closeFunction);
    scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
  app.directive("rbsCommerceCartLineDefault", [
    "RbsChange.ModalStack",
    rbsCommerceCartLineDefault,
  ]);
  function rbsCommerceCartLineDefault(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-line-default.twig",
      require: ["?^rbsCommerceCart", "?^rbsCommerceCartDeliveries"],
      scope: { line: "=", delivery: "=" },
      link: function (scope, elem, attrs, cartControllers) {
        var cartController = cartControllers[0] || cartControllers[1];
        var lineKey = scope.line.key;
        var cart = cartController.getCartData();
        scope.line.errors = {};
        scope.line.errorsCount = 0;
        angular.forEach(cart.processData.errors, function (error) {
          for (var i = 0; i < error.lineKeys.length; i++) {
            if (error.lineKeys[i] === lineKey) {
              scope.line.errors[error.code] = error;
              scope.line.errorsCount++;
              break;
            }
          }
        });
        if (scope.line.errorsCount) {
          elem.addClass("contains-error");
        }
        scope.showPrices = cartController.showPrices();
        scope.currencyCode = cartController.getCurrencyCode();
        scope.parameters = cartController.parameters();
        scope.quantity = scope.line.quantity;
        scope.cartController = cartController;
        if (
          !scope.line.unitBaseAmountWithTaxes &&
          scope.line["baseAmountWithTaxes"]
        ) {
          scope.line.unitBaseAmountWithTaxes =
            scope.line["baseAmountWithTaxes"] / scope.quantity;
        }
        if (
          !scope.line.unitBaseAmountWithoutTaxes &&
          scope.line["baseAmountWithoutTaxes"]
        ) {
          scope.line.unitBaseAmountWithoutTaxes =
            scope.line["baseAmountWithoutTaxes"] / scope.quantity;
        }
        scope.updateQuantity = function () {
          cartController.updateCartLinesData([
            { key: scope.line.key, quantity: scope.quantity },
          ]);
        };
        scope.remove = function () {
          const ref = window.localStorage.getItem(scope.line.product.common.id);
          window.dataLayer.push({ ecommerce: null });
          window.dataLayer.push({
            event: "remove_from_cart",
            ecommerce: {
              items: [
                {
                  item_name: scope.line.product.common.title,
                  item_id: ref ? ref : scope.line.codeSKU,
                  price: scope.line.unitAmountWithTaxes
                    ? scope.line.unitAmountWithTaxes
                    : "",
                  item_brand: scope.line.product.common.brand
                    ? scope.line.product.common.brand.common.title
                    : "",
                  item_category: scope.line.product.typology
                    ? scope.line.product.typology.name
                    : "",
                  item_variant: "",
                  quantity: scope.line.quantity,
                },
              ],
            },
          });
          cartController.updateCartLinesData([
            { key: scope.line.key, quantity: 0 },
          ]);
        };
        scope.$watch("quantity", function (quantity) {
          cartController.setModification(
            "line_" + scope.line.key,
            quantity != scope.line.quantity,
          );
        });
        scope.disabledQuantity = function () {
          return (
            scope.quantity == scope.line.quantity &&
            cartController.hasModifications()
          );
        };
        scope.openUpdateVariantPopup = function () {
          var options = {
            templateUrl: "/rbs-commerce-cart-line-update-variant-modal.twig",
            backdropClass: "modal-backdrop-rbs-commerce-cart-line-update",
            windowClass: "modal-rbs-commerce-cart-line-update",
            size: "lg",
            controller: "RbsCommerceCartLineUpdateVariantController",
            scope: scope,
          };
          ModalStack.open(options);
        };
        scope.openUpdateDeliveryPopup = function (e) {
          scope.actionMag = e;
          var options = {
            templateUrl: "/rbs-commerce-cart-line-update-delivery-modal.twig",
            backdropClass: "modal-backdrop-rbs-commerce-cart-line-update",
            windowClass: "modal-rbs-commerce-cart-line-update",
            size: "lg",
            controller: "RbsCommerceCartLineUpdateDeliveryController",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
  app.controller("RbsCommerceCartLineUpdateVariantController", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    "$scope",
    "$uibModalInstance",
    RbsCommerceCartLineUpdateVariantController,
  ]);
  function RbsCommerceCartLineUpdateVariantController(
    ModalStack,
    AjaxAPI,
    scope,
    $uibModalInstance,
  ) {
    var cartController = scope.cartController;
    scope.productData = null;
    scope.rootProductData = null;
    var product = scope.line.product;
    var processData = cartController.getCartData().processData;
    scope.formatProductData = function () {
      var productData = scope.productData;
      var rootProductData = productData.rootProduct;
      if (!scope.rootProductData) {
        scope.rootProductData = rootProductData;
      } else {
        rootProductData = scope.rootProductData;
      }
      scope.visuals = productData.common.visuals || [];
      scope.pictograms = [];
      var pictograms;
      if (productData.typology && productData.typology.attributes) {
        pictograms = productData.typology.pictograms;
        if (pictograms && pictograms.value && pictograms.value.length) {
          scope.pictograms = pictograms.value;
        }
      }
      if (
        !scope.pictograms.length &&
        rootProductData &&
        rootProductData.typology &&
        rootProductData.typology.attributes
      ) {
        pictograms = rootProductData.typology.attributes.pictograms;
        if (pictograms && pictograms.value && pictograms.value.length) {
          scope.pictograms = pictograms.value;
        }
      }
    };
    scope.ajaxData = {
      webStoreId: processData.webStoreId,
      billingAreaId: processData.billingAreaId,
      zone: scope.delivery.zone || processData.billingZone,
      storeId: scope.delivery.storeId || scope.parameters.storeId,
    };
    var visualFormats = angular.isDefined(scope.parameters.modalImageFormats)
      ? scope.parameters.modalImageFormats
      : "detailCompact,pictogram";
    scope.ajaxParams = { visualFormats: visualFormats };
    var customParams = {
      visualFormats: visualFormats,
      dataSetNames: "rootProduct",
    };
    AjaxAPI.getData(
      "Rbs/Catalog/Product/" + product.common.id,
      scope.ajaxData,
      customParams,
    ).then(
      function (result) {
        scope.productData = result.data.dataSets;
      },
      function (result) {
        console.error("Rbs/Catalog/Product/" + product.common.id, result);
        scope.cancel();
      },
    );
    scope.$watch("productData", function (productData) {
      if (productData) {
        scope.formatProductData();
      }
    });
    var closeFunction = function () {
      ModalStack.showPrevious();
    };
    scope.updateProduct = function () {
      var productData = scope.productData;
      if (!productData || !productData.cart) {
        return;
      }
      var data = { key: scope.line.key, productId: productData.common.id };
      cartController.updateCartLinesData([data], 1);
    };
    $uibModalInstance.result.then(closeFunction, closeFunction);
    scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
  app.controller("RbsCommerceCartLineUpdateDeliveryController", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    "$scope",
    "$uibModalInstance",
    RbsCommerceCartLineUpdateDeliveryController,
  ]);
  function RbsCommerceCartLineUpdateDeliveryController(
    ModalStack,
    AjaxAPI,
    scope,
    $uibModalInstance,
  ) {
    scope.extendedCartBox = null;
    scope.selectStoreForReservation = null;
    var cartController = scope.cartController;
    var line = scope.line;
    var lineData = { key: line.key };
    AjaxAPI.getData("Rbs/Commerce/Cart/Lines", { lines: [lineData] }).then(
      function (result) {
        var categories = result.data.items[0].categories;
        scope.extendedCartBox = categories;
        scope.extendedCartBox.dualColumns = !!categories.allCategories;
        scope.extendedCartBox.dualStore = !!(
          categories.hasOwnProperty.store &&
          categories.hasOwnProperty.reservation
        );
        scope.extendedCartBox.prices = result.data.items[0].prices;
      },
      function (result) {
        console.error("Rbs/Commerce/Cart/Lines", line.key, result);
        scope.cancel();
      },
    );
    scope.getStoreAvailabilityModalOption = function (
      selectStoreCallBack,
      forReservation,
    ) {
      return {
        templateUrl: "/rbs-catalog-show-store-availability-modal.twig",
        backdropClass: "modal-backdrop-rbs-catalog-show-store-availability",
        windowClass: "modal-rbs-catalog-show-store-availability",
        size: "lg",
        controller: "RbsCatalogShowStoreAvailabilityModalCtrl",
        resolve: {
          skuQuantities: function () {
            var skuQuantities = {};
            skuQuantities[line.skuCapabilities.codeSKU] = line.quantity;
            return skuQuantities;
          },
          selectStoreCallBack: function () {
            return selectStoreCallBack;
          },
          forReservation: function () {
            return forReservation === true;
          },
          forPickUp: function () {
            return forReservation === false;
          },
          currentStoreId: function () {
            return (
              scope.extendedCartBox.storeCategories.storeId ||
              scope.parameters.storeId
            );
          },
          pricesConfiguration: function () {
            return cartController.showPrices(true);
          },
        },
      };
    };
    scope.selectStore = function (forReservation) {
      scope.selectStoreForReservation = forReservation;
      var options = scope.getStoreAvailabilityModalOption(
        scope.onCartBoxSelectStore,
        forReservation,
      );
      ModalStack.open(options);
    };
    scope.onCartBoxSelectStore = function (storeData) {
      var cartBox = scope.extendedCartBox.storeCategories;
      if (cartBox) {
        cartBox.storeId = storeData.common.id;
        cartBox.storeTitle = storeData.common.title;
        var subCartBox = scope.extendedCartBox.store;
        if (
          subCartBox &&
          subCartBox.allowed &&
          storeData.storeShipping.storePickUpDateTime
        ) {
          subCartBox.storeId = cartBox.storeId;
          subCartBox.storeTitle = cartBox.storeTitle;
          subCartBox.pickUpDateTime = subCartBox.formattedPickUpDateTime = null;
          if (
            !storeData.totalPrice ||
            storeData.totalPrice.hasPrice ||
            storeData.totalPrice.hasStorePrice
          ) {
            subCartBox.pickUpDateTime = storeData.storeShipping.pickUpDateTime;
            subCartBox.formattedPickUpDateTime =
              storeData.storeShipping.formattedPickUpDateTime;
            cartBox.oldCountStoresWithStock = subCartBox.countStoresWithStock;
            subCartBox.countStoresWithStock = 0;
          } else if (angular.isDefined(cartBox.oldCountStoresWithStock)) {
            subCartBox.countStoresWithStock = cartBox.oldCountStoresWithStock;
          }
          subCartBox.disabled = !subCartBox.pickUpDateTime;
          if (
            storeData.totalPrice &&
            !storeData.totalPrice.hasPrice &&
            !storeData.totalPrice.hasStorePrice
          ) {
            subCartBox.disabled = true;
          }
        }
        subCartBox = scope.extendedCartBox.reservation;
        if (
          subCartBox &&
          subCartBox.allowed &&
          storeData.storeShipping.reservationPickUpDateTime
        ) {
          subCartBox.storeId = cartBox.storeId;
          subCartBox.storeTitle = cartBox.storeTitle;
          subCartBox.pickUpDateTime = subCartBox.formattedPickUpDateTime = null;
          if (
            !storeData.totalPrice ||
            storeData.totalPrice.hasPrice ||
            storeData.totalPrice.hasStorePrice
          ) {
            subCartBox.pickUpDateTime =
              storeData.storeShipping.reservationPickUpDateTime;
            subCartBox.formattedPickUpDateTime =
              storeData.storeShipping.reservationFormattedPickUpDateTime;
            cartBox.oldCountStoresWithStock = subCartBox.countStoresWithStock;
            subCartBox.countStoresWithStock = 0;
          } else if (angular.isDefined(cartBox.oldCountStoresWithStock)) {
            subCartBox.countStoresWithStock = cartBox.oldCountStoresWithStock;
          }
          subCartBox.disabled = !subCartBox.pickUpDateTime;
          if (
            storeData.totalPrice &&
            !storeData.totalPrice.hasPrice &&
            !storeData.totalPrice.hasStorePrice
          ) {
            subCartBox.disabled = true;
          }
        }
      }
    };
    scope.addProductExtended = function (category) {
      lineData.category = category;
      lineData.storeId = 0;
      if (category === "store" && scope.extendedCartBox.store.storeId) {
        lineData.storeId = scope.extendedCartBox.store.storeId;
      } else if (
        category === "reservation" &&
        scope.extendedCartBox.reservation.storeId
      ) {
        lineData.storeId = scope.extendedCartBox.reservation.storeId;
      } else if (scope.extendedCartBox.storeCategories) {
        lineData.storeId = scope.extendedCartBox.storeCategories.storeId || 0;
      }
      return cartController.updateCartLinesData([lineData], 1);
    };
    var closeFunction = function () {
      ModalStack.showPrevious();
    };
    $uibModalInstance.result.then(closeFunction, closeFunction);
    scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
    scope.buttonTitle = function (categoryData) {
      if (categoryData && categoryData.button) {
        if (categoryData.disabled && categoryData.disabledButton) {
          return categoryData.disabledButton;
        }
        if (
          !categoryData.disabled &&
          categoryData.restockDate &&
          categoryData.restockButton
        ) {
          return categoryData.restockButton;
        }
        return categoryData.button;
      }
      return "";
    };
  }
  app.directive("rbsCommerceLineActions", rbsCommerceLineActions);
  function rbsCommerceLineActions() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-line-actions.twig",
      require: "?^rbsCommerceCartDeliveries",
      link: function (scope, elem, attrs, cartController) {
        scope.showToOtherStore = scope.showModify = false;
        if (
          cartController &&
          scope.delivery &&
          scope.line &&
          scope.line["skuCapabilities"]
        ) {
          var capabilities = scope.line["skuCapabilities"];
          var countCategories = capabilities.countDeliveries;
          var category = scope.delivery.category;
          if (category == "store") {
            scope.showToOtherStore = capabilities.multipleStoreDeliveries;
          } else if (category == "reservation") {
            scope.showToOtherStore = capabilities.multipleReservationDeliveries;
          }
          scope.showModify = scope.showToOtherStore || countCategories > 1;
        }
      },
    };
  }
  app.directive("rbsCommerceCartLineReadonly", rbsCommerceCartLineReadonly);
  function rbsCommerceCartLineReadonly() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-line-readonly.twig",
      require: ["?^rbsCommerceCart", "?^rbsCommerceCartDeliveries"],
      replace: true,
      scope: { line: "=" },
      link: function (scope, elem, attrs, cartControllers) {
        var cartController = cartControllers[0] || cartControllers[1];
        scope.showPrices = cartController.showPrices();
        scope.currencyCode = cartController.getCurrencyCode();
        scope.parameters = cartController.parameters();
        scope.quantity = scope.line.quantity;
        if (
          !scope.line.unitBaseAmountWithTaxes &&
          scope.line["baseAmountWithTaxes"]
        ) {
          scope.line.unitBaseAmountWithTaxes =
            scope.line["baseAmountWithTaxes"] / scope.quantity;
        }
        if (
          !scope.line.unitBaseAmountWithoutTaxes &&
          scope.line["baseAmountWithoutTaxes"]
        ) {
          scope.line.unitBaseAmountWithoutTaxes =
            scope.line["baseAmountWithoutTaxes"] / scope.quantity;
        }
      },
    };
  }
  app.directive(
    "rbsCommerceCartProductConflict",
    rbsCommerceCartProductConflict,
  );
  function rbsCommerceCartProductConflict() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-product-conflict.twig",
      scope: false,
      link: function (scope) {
        scope.product = scope.productConflict.product;
      },
    };
  }
  app.directive("rbsCommerceCartLineVisual", rbsCommerceCartLineVisual);
  function rbsCommerceCartLineVisual() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-line-visual.twig",
      scope: { product: "=" },
      link: function (scope, elem, attrs) {
        scope.format = angular.isString(attrs["format"])
          ? attrs["format"]
          : "cartItem";
        scope.ngClasses = { size: {}, maxSize: {}, iconSize: {} };
        scope.ngClasses.size["image-format-" + scope.format + "-size"] = true;
        scope.ngClasses.maxSize["image-format-" + scope.format + "-max-size"] =
          true;
        scope.ngClasses.iconSize[
          "image-format-" + scope.format + "-icon-size"
        ] = true;
      },
    };
  }
  app.directive("rbsCommerceShippingFeesEvaluation", [
    "RbsChange.AjaxAPI",
    rbsCommerceShippingFeesEvaluation,
  ]);
  function rbsCommerceShippingFeesEvaluation(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-fees-evaluation.twig",
      replace: false,
      scope: false,
      link: function (scope, elm, attrs) {
        var visualFormats = attrs.hasOwnProperty("visualFormats")
          ? attrs.visualFormats
          : "modeThumbnail";
        scope.displayPricesWithoutTax =
          scope.parameters.displayPricesWithoutTax;
        scope.displayPricesWithTax = scope.parameters.displayPricesWithTax;
        scope.data = null;
        scope.evaluateFees = function () {
          AjaxAPI.openWaitingModal();
          AjaxAPI.getData(
            "Rbs/Commerce/Cart/ShippingFeesEvaluation",
            {},
            { visualFormats: visualFormats },
          ).then(
            function (result) {
              scope.data = result.data.dataSets;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              console.error("shippingFeesEvaluation", result);
              scope.data = null;
              AjaxAPI.closeWaitingModal();
            },
          );
        };
      },
    };
  }
  app.directive("rbsCommerceShortCart", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "RbsChange.ResponsiveSummaries",
    rbsCommerceShortCart,
  ]);
  function rbsCommerceShortCart($rootScope, AjaxAPI, ResponsiveSummaries) {
    var cacheCartDataKey = "cartData";
    return {
      restrict: "A",
      link: function (scope, elem, attrs) {
        var cacheKey = scope.blockId;
        function getCartLength(cartData) {
          scope.cartLength =
            cartData && cartData.lines
              ? cartData.lines.reduce((t, line) => t + line.quantity, 0)
              : 0;
        }
        function setCartData(cartData) {
          if (!cartData) {
            scope.readOnly = false;
            scope.cartData = cartData;
            return;
          }
          scope.readOnly = cartData.processData.locked;
          scope.cartLength = 0;
          if (!cartData.amounts) {
            var displayPricesWithTax =
              scope.parameters && scope.parameters.displayPricesWithTax;
            var displayPricesWithoutTax =
              scope.parameters && scope.parameters.displayPricesWithoutTax;
            if (displayPricesWithTax || displayPricesWithoutTax) {
              if (displayPricesWithTax) {
                cartData.amounts = { linesAmountWithTaxes: 0.0 };
              } else {
                cartData.amounts = { linesAmountWithoutTaxes: 0.0 };
              }
              angular.forEach(cartData.deliveries, function (delivery) {
                if (displayPricesWithTax) {
                  cartData.amounts.linesAmountWithTaxes +=
                    delivery.linesAmountWithTaxes;
                } else {
                  cartData.amounts.linesAmountWithoutTaxes +=
                    delivery.linesAmountWithoutTaxes;
                }
              });
            }
          }
          if (!cartData.lines) {
            cartData.lines = [];
            angular.forEach(cartData.deliveries, function (delivery) {
              angular.forEach(delivery.lines, function (line) {
                cartData.lines.push(line);
              });
            });
          }
          scope.cartData = cartData;
          getCartLength(cartData);
        }
        scope.parameters = AjaxAPI.getBlockParameters(cacheKey);
        setCartData(AjaxAPI.globalVar(cacheCartDataKey));
        var cartParams = {
          detailed: false,
          URLFormats: "canonical",
          visualFormats: scope.parameters["imageFormats"],
        };
        scope.loading = false;
        if (angular.isUndefined(scope.cartData)) {
          loadCurrentCart();
        } else {
          scope.readOnly = scope.cartData.processData.locked;
        }
        function loadCurrentCart() {
          scope.loading = true;
          AjaxAPI.getData("Rbs/Commerce/Cart", null, cartParams).then(
            function (result) {
              var cart = result.data.dataSets;
              if (!cart || angular.isArray(cart)) {
                setCartData(null);
              } else {
                setCartData(cart);
              }
              scope.loading = false;
            },
            function (result) {
              setCartData(null);
              scope.loading = false;
              console.error("loadCurrentCart", result);
            },
          );
        }
        function updateCartData(actions) {
          scope.loading = true;
          AjaxAPI.openWaitingModal(attrs["deleteProductWaitingMessage"]);
          var request = AjaxAPI.putData(
            "Rbs/Commerce/Cart",
            actions,
            cartParams,
          );
          request.then(
            function (result) {
              var cartData = result.data.dataSets;
              if (cartData && !angular.isArray(cartData)) {
                setCartData(cartData);
              }
              elem.find(".dropdown-toggle").dropdown("toggle");
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              console.error("updateCartData", result);
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
          );
          return request;
        }
        function updateCartLinesData(updateLinesData) {
          scope.loading = true;
          AjaxAPI.openWaitingModal(attrs["deleteProductWaitingMessage"]);
          var request = AjaxAPI.putData(
            "Rbs/Commerce/Cart/Lines",
            { lines: updateLinesData },
            cartParams,
          );
          request.then(
            function (result) {
              var cartData = result.data.dataSets;
              if (cartData && !angular.isArray(cartData)) {
                setCartData(cartData);
              }
              elem.find(".dropdown-toggle").dropdown("toggle");
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              console.error("updateCartData", result);
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
          );
          return request;
        }
        scope.updateLineQuantity = function (key, newQuantity) {
          var lineData = { key: key, quantity: newQuantity };
          updateCartLinesData([lineData]);
        };
        $rootScope.$on("rbsRefreshCart", function (event, params) {
          if (params && params.hasOwnProperty("cart")) {
            setCartData(params["cart"]);
            scope.loading = false;
          } else {
            loadCurrentCart();
          }
        });
        $rootScope.$on("rbsUserConnected", function onRbsUserConnected() {
          loadCurrentCart();
        });
        ResponsiveSummaries.registerItem(
          cacheKey,
          scope,
          '<div data-rbs-commerce-short-cart-responsive-summary=""></div>',
        );
      },
    };
  }
  app.directive("rbsCommerceShortCartResponsiveSummary", [
    "RbsChange.ModalStack",
    rbsCommerceShortCartResponsiveSummary,
  ]);
  function rbsCommerceShortCartResponsiveSummary(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-short-cart-responsive-summary.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          var options = {
            templateUrl:
              "/rbs-commerce-short-cart-responsive-summary-modal.twig",
            backdropClass:
              "modal-backdrop-rbs-commerce-short-cart-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-rbs-commerce-short-cart-responsive-summary zento-modal-panier",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("ztoSort", ["$rootScope", ztoSort]);
  function ztoSort($rootScope) {
    return {
      restrict: "A",
      link: function (scope, $element, attrs) {
        scope.facet.values = scope.facet
          ? scope.facet.values
            ? scope.facet.values.sort((s1, s2) =>
                s1.title.localeCompare(s2.title),
              )
            : []
          : [];
        $rootScope.$on("RbsElasticsearchFacetFilters", function () {
          setTimeout(() => {
            scope.facet.values = scope.facet
              ? scope.facet.values
                ? scope.facet.values.sort((s1, s2) =>
                    s1.title.localeCompare(s2.title),
                  )
                : []
              : [];
            scope.$apply();
          }, 0);
        });
      },
    };
  }
  app.directive("ztoElasticsearchFacetContainerV2", [
    "$location",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    rbsElasticsearchFacetContainerV2,
  ]);
  function rbsElasticsearchFacetContainerV2($location, AjaxAPI, ModalStack) {
    return {
      restrict: "A",
      scope: true,
      controllerAs: "controller",
      controller: [
        "$scope",
        "$element",
        "$attrs",
        "$rootScope",
        function (scope, $element, $attrs, $rootScope) {
          scope.responsiveModalUnivers = function () {
            var options = {
              templateUrl: "/zto-elasticsearch-univers-responsive-modal.twig",
              backdropClass:
                "modal-backdrop-rbs-elasticsearch-facet-responsive",
              windowClass:
                "modal-responsive-summary modal-rbs-elasticsearch-facet-responsive",
              scope: scope,
            };
            ModalStack.open(options);
          };
        },
      ],
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsCommerceShortCartPreloaded", [
    "$rootScope",
    "$scope",
    "RbsChange.AjaxAPI",
    "RbsChange.ResponsiveSummaries",
    "$compile",
    "$element",
    "$attrs",
    "$timeout",
    RbsCommerceShortCartPreloaded,
  ]);
  function RbsCommerceShortCartPreloaded(
    $rootScope,
    scope,
    AjaxAPI,
    ResponsiveSummaries,
    $compile,
    $element,
    $attrs,
    $timeout,
  ) {
    scope.data = { productCount: $attrs.productCount };
    var cacheKey = scope.blockId;
    $rootScope.$on("rbsRefreshCart", function (event, params) {
      scope.reloadBlock(false);
    });
    $rootScope.$on("rbsUserConnected", function () {
      scope.reloadBlock(false);
    });
    scope.updateLineQuantity = function (key, newQuantity) {
      var lineData = { key: key, quantity: newQuantity };
      AjaxAPI.openWaitingModal($attrs["deleteProductWaitingMessage"]);
      var cartParams = {
        detailed: false,
        URLFormats: "canonical",
        visualFormats: scope.blockParameters["imageFormats"],
      };
      var request = AjaxAPI.putData(
        "Rbs/Commerce/Cart/Lines",
        { lines: [lineData] },
        cartParams,
      );
      request.then(
        function (result) {
          scope.reloadBlock(true);
        },
        function (result) {
          console.error("updateCartData", result);
          AjaxAPI.closeWaitingModal();
        },
      );
    };
    ResponsiveSummaries.registerItem(
      cacheKey,
      scope,
      '<li data-rbs-commerce-short-cart-responsive-summary-preloaded=""></li>',
    );
    var reloadShortCartTimer;
    scope.reloadBlock = function (fromDelete) {
      if (reloadShortCartTimer) {
        $timeout.cancel(reloadShortCartTimer);
      }
      reloadShortCartTimer = $timeout(function () {
        reloadShortCartTimer = null;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          scope.blockParameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var content = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            ).filter(".content");
            scope.injectContent(content, $element.find(".content"));
            if (scope.data.modalTarget) {
              var modalContent = jQuery(
                jQuery.parseHTML(result.data.dataSets.html),
              ).filter(".modal-content");
              scope.injectContent(modalContent, scope.data.modalTarget);
            }
            scope.data.productCount = content.attr("data-product-count");
            if (fromDelete) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error("[RbsShortCart] error reloading block:", error);
            if (fromDelete) {
              AjaxAPI.closeWaitingModal();
            }
          },
        );
        scope.injectContent = function (content, target) {
          target.html(content.html());
          $compile(target)(scope);
        };
      }, 200);
    };
  }
  app.directive("rbsCommerceShortCartResponsiveSummaryPreloaded", [
    "RbsChange.ModalStack",
    rbsCommerceShortCartResponsiveSummary,
  ]);
  function rbsCommerceShortCartResponsiveSummary(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-short-cart-responsive-summary-preloaded.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          var options = {
            templateUrl:
              "/rbs-commerce-short-cart-responsive-summary-modal-preloaded.twig",
            backdropClass:
              "modal-backdrop-rbs-commerce-short-cart-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-rbs-commerce-short-cart-responsive-summary",
            scope: scope,
          };
          var modalInstance = ModalStack.open(options);
          modalInstance.closed.then(
            function () {
              scope.data.modalTarget = null;
            },
            function () {
              scope.data.modalTarget = null;
            },
          );
        };
      },
    };
  }
  app.controller("RbsCommerceShortCartModalPreloaded", [
    "$scope",
    "$element",
    function (scope, $element) {
      scope.data.modalTarget = $element.find(".content");
      scope.reloadBlock(true);
    },
  ]);
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommerceProcess", [
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    "$timeout",
    "RbsChange.ModalStack",
    rbsCommerceProcess,
  ]);
  function rbsCommerceProcess(
    $rootScope,
    $compile,
    AjaxAPI,
    $timeout,
    ModalStack,
  ) {
    var cacheCartDataKey = "cartData";
    return {
      restrict: "A",
      templateUrl: function (elem, attrs) {
        return "/rbs-commerce-process" + attrs.templateSuffix + ".twig";
      },
      controllerAs: "processEngine",
      controller: [
        "$scope",
        function (scope) {
          var self = this;
          var processConfigurationInfo = null;
          scope.currentStep = null;
          scope.steps = [
            "identification",
            "shipping",
            "gift",
            "premium",
            "payment",
            "confirm",
          ];
          scope.localStepsData = {};
          scope.loading = false;
          scope.simplifiedProcess = false;
          this.type = "order";
          function openRemovedModifiersModal(cartData) {
            var options = {
              templateUrl: "/rbs-commerce-removed-modifiers-in-cart-modal.twig",
              backdropClass:
                "modal-backdrop-rbs-commerce-old-modifiers-in-cart",
              windowClass: "modal-rbs-commerce-old-modifiers-in-cart",
              size: "lg",
              controller:
                "rbsCommerceRemovedModifiersInCartConfirmationModalCtrl",
              resolve: {
                deliveries: function () {
                  return cartData.deliveries;
                },
                currencyCode: function () {
                  return cartData.common.currencyCode;
                },
                controller: function () {
                  return scope.processEngine;
                },
              },
            };
            ModalStack.open(options);
          }
          function lockProcess(lock) {
            angular.forEach(scope.localStepsData, function (step) {
              step.isLocked = !!lock;
            });
          }
          function setObjectData(cartData) {
            scope.cartData = cartData;
            if (!cartData) {
              return;
            }
            if (
              scope.cartData.options.hasRemovedModifiers &&
              scope.parameters.handleRemovedModifiersModal
            ) {
              openRemovedModifiersModal(scope.cartData);
            }
            lockProcess(cartData.processData.locked);
            scope.simplifiedProcess =
              cartData.processData.options.simplified || false;
            if (scope.simplifiedProcess) {
              scope.allowGift = false;
              scope.allowPremium = false;
              scope.steps = ["shipping", "identification", "confirm"];
            } else {
              scope.allowGift =
                cartData.processData.capabilities.allowGift || false;
              scope.allowPremium =
                cartData.processData.capabilities.allowPremium || false;
              var steps = scope.steps;
              scope.steps = [];
              for (var s = 0; s < steps.length; s++) {
                var allow = true;
                if (steps[s] === "gift") {
                  allow = scope.allowGift;
                } else if (steps[s] === "premium") {
                  allow = scope.allowPremium;
                }
                if (allow) {
                  scope.steps.push(steps[s]);
                }
              }
            }
            if (cartData.process) {
              processConfigurationInfo = cartData.process;
            } else if (processConfigurationInfo) {
              cartData.process = processConfigurationInfo;
            }
            if (!scope.currentStep && cartData.processData) {
              if (
                cartData.processData.locked &&
                !cartData.processData.transactionId
              ) {
                self.setCurrentStep("payment");
              } else if (cartData.processData.currentStep) {
                self.setCurrentStep(cartData.processData.currentStep);
              } else if (scope.simplifiedProcess) {
                var currentStep = "identification";
                if (
                  processConfigurationInfo &&
                  processConfigurationInfo.shippingModes
                ) {
                  for (
                    var i = 0;
                    i < processConfigurationInfo.shippingModes.length;
                    i++
                  ) {
                    var modesByDelivery =
                      processConfigurationInfo.shippingModes[i];
                    if (modesByDelivery && modesByDelivery.reservation) {
                      for (
                        var j = 0;
                        j < modesByDelivery.reservation.length;
                        j++
                      ) {
                        var modeInfo = modesByDelivery.reservation[j];
                        if (
                          (modeInfo &&
                            modeInfo.customerReceiptDate &&
                            modeInfo.customerReceiptDate.date) ||
                          (modeInfo.messageCapabilities &&
                            modeInfo.messageCapabilities.allow)
                        ) {
                          currentStep = "shipping";
                          break;
                        }
                      }
                      if (currentStep === "shipping") {
                        break;
                      }
                    }
                  }
                }
                self.setCurrentStep(currentStep);
              }
            }
            if (self.showPrices()) {
              scope.currencyCode = cartData.common.currencyCode;
            } else {
              scope.currencyCode = null;
            }
            $rootScope.$broadcast("rbsRefreshCart", { cart: cartData });
          }
          this.loading = function (loading) {
            if (
              angular.isDefined(loading) &&
              scope.loading != (loading == true)
            ) {
              scope.loading = loading == true;
              if (scope.loading) {
                AjaxAPI.openWaitingModal();
              } else {
                AjaxAPI.closeWaitingModal();
              }
            }
            return scope.loading;
          };
          function getCartParams() {
            return {
              detailed: true,
              dataSets: "process",
              visualFormats: scope.parameters["imageFormats"],
              URLFormats: "canonical",
            };
          }
          this.loadObjectData = function () {
            var controller = this;
            controller.loading(true);
            var params = getCartParams();
            var request = AjaxAPI.getData("Rbs/Commerce/Cart", null, params);
            request.then(
              function (result) {
                var cartData = result.data.dataSets;
                if (cartData && !angular.isArray(cartData)) {
                  setObjectData(cartData);
                }
                controller.loading(false);
              },
              function (result) {
                console.log("loadObjectData error", result);
                setObjectData(null);
                controller.loading(false);
              },
            );
            return request;
          };
          this.updateObjectData = function (actions) {
            var controller = this;
            controller.loading(true);
            var request = AjaxAPI.putData(
              "Rbs/Commerce/Cart",
              actions,
              getCartParams(),
            );
            request.then(
              function (result) {
                var cartData = result.data.dataSets;
                if (cartData && !angular.isArray(cartData)) {
                  setObjectData(cartData);
                }
                controller.loading(false);
                scope.$broadcast("objectDataUpdated", scope.cartData);
              },
              function (result) {
                console.error("updateObjectData", result);
                if (
                  result.status == 409 &&
                  result.data.code === "CART_LOCKED"
                ) {
                  location.reload();
                }
                controller.loading(false);
                if (
                  result.status == 409 &&
                  result.data.data &&
                  result.data.code === "CART_EXPIRED"
                ) {
                  var options = {
                    templateUrl: "/rbs-commerce-cart-expired-modal.twig",
                    backdropClass:
                      "modal-backdrop-rbs-commerce-cart-line-update",
                    windowClass: "modal-rbs-commerce-cart-line-update",
                    size: "sm",
                  };
                  ModalStack.open(options).closed.then(function () {
                    if (result.data.data.redirectUrl) {
                      window.location.href = result.data.data.redirectUrl;
                    } else {
                      location.reload();
                    }
                  });
                }
              },
            );
            return request;
          };
          this.getObjectData = function () {
            return scope.cartData;
          };
          this.showPrices = function (asObject) {
            var showPrices =
              scope.parameters &&
              (scope.parameters.displayPricesWithTax ||
                scope.parameters.displayPricesWithoutTax);
            if (asObject && showPrices) {
              return {
                currencyCode: this.getCurrencyCode(),
                displayPricesWithTax: this.parameters("displayPricesWithTax"),
                displayPricesWithoutTax: this.parameters(
                  "displayPricesWithoutTax",
                ),
                handleWebStorePrices: this.parameters("handleWebStorePrices"),
                handleStorePrices: this.parameters("handleStorePrices"),
              };
            }
            return showPrices;
          };
          this.getCurrencyCode = function () {
            return scope.currencyCode;
          };
          this.parameters = function (name) {
            if (scope.parameters) {
              if (angular.isUndefined(name)) {
                return scope.parameters;
              } else {
                return scope.parameters[name];
              }
            }
            return null;
          };
          this.getProcessConfigurationInfo = function () {
            return processConfigurationInfo;
          };
          var contentScopes = {};
          this.replaceChildren = function (parentNode, scope, html) {
            var id = scope.$id;
            if (contentScopes[id]) {
              contentScopes[id].$destroy();
              contentScopes[id] = null;
            }
            parentNode.html(html);
            if (html != "") {
              contentScopes[id] = scope.$new();
              $compile(parentNode.contents())(contentScopes[id]);
            }
          };
          scope.$watch("cartData", function (cartData) {
            if (cartData) {
              if (!scope.currentStep) {
                self.nextStep();
              }
            }
          });
          this.nextStep = function () {
            this.setCurrentStep(this.getNextStep(scope.currentStep));
          };
          this.getNextStep = function (step) {
            if (!step) {
              return scope.steps[0];
            }
            for (var i = 0; i < scope.steps.length - 1; i++) {
              if (step == scope.steps[i]) {
                return scope.steps[i + 1];
              }
            }
            return null;
          };
          function locateCurrentStep() {
            var offset = jQuery("#" + scope.currentStep).offset();
            if (offset && offset.hasOwnProperty("top")) {
              jQuery("html, body").animate({ scrollTop: offset.top - 20 }, 500);
            } else if (scope.currentStep) {
              $timeout(locateCurrentStep, 100);
            }
          }
          this.setCurrentStep = function (currentStep) {
            scope.currentStep = currentStep;
            var enabled = currentStep !== null,
              checked = enabled;
            for (var i = 0; i < scope.steps.length; i++) {
              var step = scope.steps[i];
              var stepProcessData = this.getStepProcessData(step);
              if (step == currentStep) {
                checked = false;
                stepProcessData.isCurrent = true;
                stepProcessData.isChecked = checked;
                stepProcessData.isEnabled = enabled;
                enabled = false;
              } else {
                stepProcessData.isCurrent = false;
                stepProcessData.isChecked = checked;
                stepProcessData.isEnabled = enabled;
              }
            }
            if (currentStep) {
              scope.$emit("analytics", {
                category: "process",
                action: "setCurrentStep",
                label: currentStep,
              });
              $timeout(locateCurrentStep, 100);
            }
          };
          this.getCurrentStep = function () {
            return scope.currentStep;
          };
          this.getStepProcessData = function (step) {
            var isLocked =
              scope.cartData &&
              scope.cartData.processData &&
              scope.cartData.processData.locked;
            if (step === null) {
              return {
                name: step,
                isCurrent: false,
                isEnabled: false,
                isChecked: false,
                isLocked: isLocked,
                processId: processConfigurationInfo.common.id,
              };
            }
            if (!angular.isObject(scope.localStepsData[step])) {
              scope.localStepsData[step] = {
                name: step,
                isCurrent: false,
                isEnabled: false,
                isChecked: false,
                isLocked: isLocked,
                processId: processConfigurationInfo.common.id,
              };
            }
            return scope.localStepsData[step];
          };
          scope.parameters = scope.blockParameters;
          var cartData = AjaxAPI.globalVar(cacheCartDataKey);
          if (!cartData) {
            this.loadObjectData();
          } else {
            setObjectData(cartData);
          }
          this.lockProcess = lockProcess;
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.showPrices = controller.showPrices();
        scope.isStepCurrent = function (step) {
          return controller.getStepProcessData(step).isCurrent;
        };
        scope.isStepEnabled = function (step) {
          return controller.getStepProcessData(step).isEnabled;
        };
        scope.isStepChecked = function (step) {
          return controller.getStepProcessData(step).isChecked;
        };
        scope.isStepLocked = function (step) {
          return controller.getStepProcessData(step).isLocked;
        };
      },
    };
  }
  app.directive("rbsCommerceProcessCartLines", rbsCommerceProcessCartLines);
  function rbsCommerceProcessCartLines() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-process-cart-lines.twig",
      scope: { cartData: "=", getLineDirectiveName: "=", processEngine: "=" },
      link: function (scope, elem) {
        scope.showPrices = scope.processEngine.showPrices();
        function redrawLines() {
          var linesContainer = elem.find('[data-role="cart-lines"]');
          var directiveName = angular.isFunction(scope.getLineDirectiveName)
            ? scope.getLineDirectiveName
            : function (line) {
                return "rbs-commerce-process-line-default";
              };
          var lines = scope.cartData.lines;
          var html = [];
          angular.forEach(lines, function (line, idx) {
            html.push(
              '<tr data-line="cartData.lines[' +
                idx +
                ']" data-process-engine="processEngine" ' +
                directiveName(line) +
                '=""></tr>',
            );
          });
          scope.processEngine.replaceChildren(
            linesContainer,
            scope,
            html.join(""),
          );
        }
        scope.$watch("cartData", function (cartData) {
          if (cartData) {
            redrawLines();
          }
        });
      },
    };
  }
  app.directive(
    "rbsCommerceProcessDeliveryLines",
    rbsCommerceProcessDeliveryLines,
  );
  function rbsCommerceProcessDeliveryLines() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-process-delivery-lines.twig",
      scope: {
        delivery: "=",
        getLineDirectiveName: "=",
        processEngine: "=",
        giftCapabilities: "=",
        isLocked: "=",
      },
      link: function (scope, elm) {
        scope.showPrices = scope.processEngine.showPrices();
        scope.currencyCode = scope.processEngine.getCurrencyCode();
        scope.$watch("delivery", function (delivery) {
          if (delivery) {
            redrawLines(
              scope,
              elm,
              "data-rbs-commerce-process-line-default",
              false,
            );
          }
        });
        scope.parameters = scope.processEngine.parameters();
      },
    };
  }
  app.directive(
    "rbsCommerceProcessDeliveryLinesForGift",
    rbsCommerceProcessDeliveryLinesForGift,
  );
  function rbsCommerceProcessDeliveryLinesForGift() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-process-delivery-lines-for-gift.twig",
      scope: {
        delivery: "=",
        getLineDirectiveName: "=",
        processEngine: "=",
        giftCapabilities: "=",
        shippingModeInfo: "=",
      },
      link: function (scope, elm) {
        scope.showPrices = scope.processEngine.showPrices();
        scope.currencyCode = scope.processEngine.getCurrencyCode();
        scope.$watch("delivery", function (delivery) {
          if (delivery) {
            redrawLines(
              scope,
              elm,
              "data-rbs-commerce-process-line-for-gift",
              true,
            );
          }
        });
      },
    };
  }
  function redrawLines(scope, elm, defaultDirective, excludeLocked) {
    scope.linesProducts = 0;
    scope.taxesAmount = 0;
    var linesContainer = elm.find('[data-role="delivery-lines"]');
    var directiveName = angular.isFunction(scope.getLineDirectiveName)
      ? scope.getLineDirectiveName
      : function () {
          return defaultDirective;
        };
    var lines = scope.delivery.lines;
    var html = [];
    angular.forEach(lines, function (line, idx) {
      if (excludeLocked && line.options.keyLocked) {
        return;
      }
      html.push(
        '<tr data-line="delivery.lines[' +
          idx +
          ']" data-delivery="delivery" data-process-engine="processEngine"' +
          ' data-shipping-mode-info="shippingModeInfo"' +
          ' data-gift-capabilities="giftCapabilities" ' +
          directiveName(line) +
          '=""></tr>',
      );
      scope.linesProducts += line.quantity;
    });
    angular.forEach(scope.delivery["totalTaxes"], function (tax) {
      scope.taxesAmount += tax.amount;
    });
    scope.processEngine.replaceChildren(linesContainer, scope, html.join(""));
  }
  app.controller("rbsCommerceRemovedModifiersInCartConfirmationModalCtrl", [
    "RbsChange.ModalStack",
    "$scope",
    "$uibModalInstance",
    "deliveries",
    "currencyCode",
    "controller",
    function (
      ModalStack,
      $scope,
      $uibModalInstance,
      deliveries,
      currencyCode,
      controller,
    ) {
      $scope.removedModifiers = {};
      $scope.currencyCode = currencyCode;
      $scope.controller = controller;
      function sortModifier(modifiers) {
        var modifierByType = [];
        angular.forEach(modifiers, function (modifier) {
          if (!modifierByType[modifier.options.applicationType]) {
            modifierByType[modifier.options.applicationType] = [];
          }
          if (modifier.options.freeLines) {
            angular.forEach(
              modifier.options.freeLines,
              function (freeLine, index) {
                modifier.options.freeLines[index].product =
                  freeLine.options.product;
              },
            );
          }
          modifierByType[modifier.options.applicationType].push(modifier);
        });
        return modifierByType;
      }
      $scope.removedModifiersCount = 0;
      angular.forEach(deliveries, function (delivery) {
        if (delivery.options.removedModifiers) {
          $scope.removedModifiersCount += Object.keys(
            delivery.options.removedModifiers,
          ).length;
          angular.extend(
            $scope.removedModifiers,
            sortModifier(delivery.options.removedModifiers),
          );
        }
      });
    },
  ]);
  app.directive("rbsCommerceCartLineReadonlyModal", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-cart-line-readonly.twig",
      replace: true,
      link: function ($scope) {
        $scope.showPrices = false;
        $scope.quantity = $scope.line.quantity;
        if (
          !$scope.line.unitBaseAmountWithTaxes &&
          $scope.line.baseAmountWithTaxes
        ) {
          $scope.line.unitBaseAmountWithTaxes =
            $scope.line.baseAmountWithTaxes / $scope.quantity;
        }
        if (
          !$scope.line.unitBaseAmountWithoutTaxes &&
          $scope.line.baseAmountWithoutTaxes
        ) {
          $scope.line.unitBaseAmountWithoutTaxes =
            $scope.line.baseAmountWithoutTaxes / $scope.quantity;
        }
      },
    };
  });
})(window.jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommerceProcessLineDefault", rbsCommerceProcessLineDefault);
  function rbsCommerceProcessLineDefault() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-process-line-default.twig",
      replace: true,
      scope: {
        line: "=",
        delivery: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
      link: function (scope) {
        scope.showPrices = scope.processEngine.showPrices();
        scope.currencyCode = scope.processEngine.getCurrencyCode();
        scope.parameters = scope.processEngine.parameters();
        scope.quantity = scope.line.quantity;
        if (
          !scope.line.unitBaseAmountWithTaxes &&
          scope.line["baseAmountWithTaxes"]
        ) {
          scope.line.unitBaseAmountWithTaxes =
            scope.line["baseAmountWithTaxes"] / scope.quantity;
        }
        if (
          !scope.line.unitBaseAmountWithoutTaxes &&
          scope.line["baseAmountWithoutTaxes"]
        ) {
          scope.line.unitBaseAmountWithoutTaxes =
            scope.line["baseAmountWithoutTaxes"] / scope.quantity;
        }
      },
    };
  }
  app.directive("rbsCommerceProcessLineForGift", rbsCommerceProcessLineForGift);
  function rbsCommerceProcessLineForGift() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-process-line-for-gift.twig",
      replace: true,
      scope: {
        line: "=",
        delivery: "=",
        processEngine: "=",
        giftCapabilities: "=",
        shippingModeInfo: "=",
      },
      link: function (scope) {
        scope.showPrices = false;
        scope.currencyCode = scope.processEngine.getCurrencyCode();
        scope.parameters = scope.processEngine.parameters();
        scope.quantity = scope.line.quantity;
      },
    };
  }
  app.directive(
    "rbsCommerceCustomerGenericFields",
    rbsCommerceCustomerGenericFields,
  );
  function rbsCommerceCustomerGenericFields() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-customer-generic-fields.twig",
      link: function (scope) {
        scope.requireNames = scope.processData.hasStoreDelivery;
        scope.displayTitleCode = true;
        scope.allowedTitles = scope.processData.allowedTitles;
      },
    };
  }
  app.directive(
    "rbsCommerceIdentificationStepValidation",
    rbsCommerceIdentificationStepValidation,
  );
  function rbsCommerceIdentificationStepValidation() {
    return {
      restrict: "A",
      link: function (scope) {
        var onRefreshScopeByCart = scope.onRefreshScopeByCart;
        scope.onRefreshScopeByCart = function () {
          if (onRefreshScopeByCart) {
            onRefreshScopeByCart();
          }
          scope.processData.hasRequiredProperties =
            scope.processData.hasRequiredProperties &&
            !!(
              !scope.processData.hasStoreDelivery ||
              (scope.profiles.Rbs_User.firstName &&
                scope.profiles.Rbs_User.lastName)
            );
          scope.processData.fullName = buildFullName(scope.processData);
        };
        function buildFullName(processData) {
          if (processData.profiles && processData.profiles.Rbs_User) {
            var viewName = "";
            if (processData.profiles.Rbs_User.titleCode) {
              angular.forEach(processData.allowedTitles, function (t) {
                if (t.value === processData.profiles.Rbs_User.titleCode) {
                  viewName = t.title + " ";
                }
              });
            }
            if (
              processData.profiles.Rbs_User.firstName ||
              processData.profiles.Rbs_User.lastName
            ) {
              return (
                viewName +
                (processData.profiles.Rbs_User.firstName
                  ? processData.profiles.Rbs_User.firstName
                  : "") +
                " " +
                (processData.profiles.Rbs_User.lastName
                  ? processData.profiles.Rbs_User.lastName
                  : "")
              );
            }
          }
          return null;
        }
      },
    };
  }
  app.directive(
    "rbsCommerceCustomerGenericFieldsReadonly",
    rbsCommerceCustomerGenericFieldsReadonly,
  );
  function rbsCommerceCustomerGenericFieldsReadonly() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-customer-generic-fields-readonly.twig",
      link: function (scope) {},
    };
  }
  app.directive("rbsCommerceIdentificationStep", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "$timeout",
    rbsCommerceIdentificationStep,
  ]);
  function rbsCommerceIdentificationStep($rootScope, AjaxAPI, $timeout) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-identification-step.twig",
      scope: {
        processEngine: "=",
        hideStepTitle: "=",
        hideStepAction: "=",
        blockData: "=",
      },
      link: function (scope) {
        var cartData = scope.processEngine.getObjectData();
        var countTokenRequested = 0;
        var tokenValidationPromise = null;
        scope.processData =
          scope.processEngine.getStepProcessData("identification");
        scope.processData.realm = scope.processEngine.parameters("realm");
        scope.processData.canRequestNewCode = false;
        scope.allowedTitles = null;
        scope.profiles = {};
        scope.userSocialId = null;
        scope.allowShowPassword =
          scope.processEngine.parameters("allowShowPassword");
        function refreshScopeByCart(cartData) {
          var processData = angular.extend(
            scope.processData,
            cartData.process.identification,
            cartData.customer,
          );
          if (!processData.hasOwnProperty("rememberMe")) {
            scope.processData.rememberMe = true;
          }
          if (processData.options.socialId) {
            scope.userSocialId = processData.options.socialId;
          }
          if (processData.options) {
            if (processData.options.profiles) {
              processData.profiles = {};
              angular.extend(
                processData.profiles,
                processData.options.profiles,
              );
              scope.profiles = processData.profiles;
            }
            scope.processData.requireTokenValidation =
              !!processData.options.mobilePhoneRequestId;
            delete processData.options;
          }
          if (processData.billingAddress) {
            delete processData.billingAddress;
          }
          processData.requireMobilePhone =
            (cartData.processData.capabilities.allowMobilePhone &&
              cartData.processData.hasStoreDelivery) ||
            false;
          processData.mobilePhoneValidation =
            cartData.processData.capabilities.mobilePhoneValidation !== false;
          processData.hasStoreDelivery =
            cartData.processData.hasStoreDelivery || false;
          processData.anonymousProcess =
            cartData.processData.capabilities.anonymousProcess || false;
          processData.precheckPersistAccount =
            cartData.processData.capabilities.precheckPersistAccount || false;
          if (
            !processData.anonymousProcess ||
            processData.precheckPersistAccount
          ) {
            processData.persistAccount = true;
          }
          processData.customerFields =
            cartData.processData.capabilities.customerFields;
          processData.hasRequiredProperties = !!(
            processData.email &&
            (!processData.requireMobilePhone || processData.mobilePhone)
          );
          if (angular.isFunction(scope.onRefreshScopeByCart)) {
            scope.onRefreshScopeByCart();
          }
        }
        refreshScopeByCart(cartData);
        if (
          (scope.processData.userId && scope.processData.confirmed) ||
          scope.userSocialId
        ) {
          if (
            scope.processData.hasRequiredProperties &&
            scope.processData.isCurrent
          ) {
            scope.processEngine.nextStep();
          }
        }
        scope.login = function () {
          scope.processData.errors = [];
          var data = {
            login: scope.processData.login,
            password: scope.processData.password,
            realm: scope.processData.realm,
            rememberMe: scope.processData.rememberMe || false,
            ignoreProfileCart: true,
          };
          AjaxAPI.putData("Rbs/User/Login", data).then(
            function (result) {
              var params = {
                accessorId: result.data.dataSets.user.accessorId,
                accessorName: result.data.dataSets.user.name,
              };
              $rootScope.$broadcast("rbsUserConnected", params);
              scope.processEngine.loadObjectData().then(function () {
                var cartData = scope.processEngine.getObjectData();
                refreshScopeByCart(cartData);
                if (scope.processData.hasRequiredProperties) {
                  scope.processEngine.nextStep();
                }
              });
            },
            function (result) {
              scope.processData.errors = [result.data.message];
              scope.processData.password = null;
              console.log("login error", result);
            },
          );
        };
        scope.confirm = function () {
          scope.processData.errors = [];
          var data = {
            login: scope.processData.login || scope.processData.email,
            password: scope.processData.password,
            realm: scope.processData.realm,
          };
          AjaxAPI.putData("Rbs/User/Login", data).then(
            function () {
              var cartData = scope.processEngine.getObjectData();
              scope.processData.confirmed = true;
              cartData.process.identification.confirmed = true;
              if (scope.processData.hasRequiredProperties) {
                scope.processEngine.nextStep();
              }
            },
            function (result) {
              scope.processData.errors = [result.data.message];
              scope.processData.password = null;
              console.log("login error", result);
            },
          );
        };
        if (
          !scope.processData.requireMobilePhone &&
          scope.processData.requireTokenValidation
        ) {
          scope.processData.requireTokenValidation = false;
        }
        if (scope.processData.requireTokenValidation) {
          waitForNextRequest();
        }
        scope.accountProperties = ["email", "mobilePhone", "newPassword"];
        scope.saveAccount = function () {
          scope.processData.errors = [];
          var accountData = {};
          angular.forEach(scope.accountProperties, function (name) {
            if (name !== "email" && name !== "newPassword") {
              accountData[name] = scope.processData[name] || null;
            }
          });
          accountData["profiles"] = scope.profiles || null;
          var actions = { setAccount: accountData };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(
              function () {
                var cartData = scope.processEngine.getObjectData();
                refreshScopeByCart(cartData);
                if (scope.processData.hasRequiredProperties) {
                  scope.processEngine.nextStep();
                }
              },
              function () {},
            );
          } else {
            scope.processEngine.nextStep();
          }
        };
        scope.submitNewAccount = function () {
          scope.processData.errors = [];
          if (!scope.processData.requireMobilePhone) {
            scope.processData.mobilePhone = null;
          }
          var accountData = {};
          angular.forEach(scope.accountProperties, function (name) {
            accountData[name] = scope.processData[name] || null;
          });
          accountData["profiles"] = scope.profiles || null;
          var actions = { setAccount: accountData };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(
              function () {
                var cartData = scope.processEngine.getObjectData();
                refreshScopeByCart(cartData);
                if (scope.processData.hasRequiredProperties) {
                  scope.processEngine.nextStep();
                }
              },
              function (result) {
                if (
                  result.status === 412 &&
                  result.data.code === "INVALID_PASSWORD"
                ) {
                  scope.blockData.invalidPassword = true;
                  scope.blockData.invalidPasswordMessage = result.data.message;
                  scope.blockData.invalidPasswordMessages = (result.data.data &&
                    result.data.data.errorMessages) || [result.data.message];
                }
              },
            );
          } else {
            scope.processEngine.nextStep();
          }
        };
        scope.clearPasswordError = function () {
          scope.blockData.invalidPassword = false;
          scope.blockData.invalidPasswordMessage = null;
          scope.blockData.invalidPasswordMessages = null;
        };
        scope.changeUser = function () {
          scope.processData.errors = [];
          AjaxAPI.getData("Rbs/User/Logout", { keepCart: true }).then(
            function () {
              var params = { accessorId: null, accessorName: null };
              $rootScope.$broadcast("rbsUserConnected", params);
              scope.processData.userId = 0;
              scope.processData.login = null;
              scope.processData.email = null;
              scope.processData.confirmed = false;
              var actions = {
                updateContext: { acceptTermsAndConditions: true },
              };
              scope.processEngine.updateObjectData(actions);
            },
            function (result) {
              scope.processData.errors = [result.data.message];
              console.log("changeUser error", result);
            },
          );
        };
        scope.setCurrentStep = function () {
          scope.processEngine.setCurrentStep("identification");
        };
        scope.cancelPayment = function () {
          var promise = cancelPayment(scope.processEngine, $rootScope, AjaxAPI);
          promise.then(
            function () {
              scope.setCurrentStep();
            },
            function () {},
          );
          return promise;
        };
        scope.sendValidationToken = function () {
          var currentProcess = scope.processEngine.getStepProcessData(
            scope.processEngine.getCurrentStep(),
          );
          currentProcess.errors = [];
          var actions = {
            updateToken: { validateToken: scope.processData.tokenValidation },
          };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            scope.tokenError = null;
            request.then(
              function () {
                var cartData = scope.processEngine.getObjectData();
                for (var i in cartData.updated.setAccount) {
                  if (
                    cartData.updated.setAccount[i].key === "tokenValidation"
                  ) {
                    scope.tokenError = cartData.updated.setAccount[i].value;
                    break;
                  }
                }
                refreshScopeByCart(cartData);
              },
              function () {
                if (scope.processData.newValidationToken) {
                  delete scope.processData.newValidationToken;
                }
              },
            );
          }
        };
        scope.newValidationToken = function () {
          scope.processData.errors = [];
          scope.processData.canRequestNewCode = false;
          scope.processData.newValidationToken = true;
          var actions = { updateToken: { requestNewToken: true } };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(function () {
              countTokenRequested++;
              var cartData = scope.processEngine.getObjectData();
              refreshScopeByCart(cartData);
            });
          }
          waitForNextRequest();
        };
        scope.next = function () {
          scope.processEngine.nextStep();
        };
        scope.$watch("processData.persistAccount", function (persistAccount) {
          if (!persistAccount && scope.processData.newPassword) {
            scope.processData.newPassword = scope.processData.confirmPassword =
              null;
          }
        });
        function waitForNextRequest() {
          if (tokenValidationPromise) {
            $timeout.cancel(tokenValidationPromise);
            tokenValidationPromise = null;
          }
          if (countTokenRequested <= 2) {
            tokenValidationPromise = $timeout(function () {
              scope.processData.canRequestNewCode = true;
            }, 120000);
          }
        }
      },
    };
  }
  function buildShippingModes(cartData, scope) {
    var shippingModes = [];
    var capabilities = cartData.processData.capabilities;
    angular.forEach(cartData["deliveries"], function (delivery, deliveryIndex) {
      var shippingMode = {
        id: delivery.modeId,
        category: delivery.category,
        storeId: delivery.storeId,
        address: delivery.address,
        zone: delivery.zone,
        options: delivery.options ? delivery.options : {},
        shippingZone: capabilities.requiredTax
          ? delivery.zone
          : capabilities.taxByZone
            ? scope.taxesZones
            : scope.shippingZone,
        taxesZones: scope.taxesZones,
        delivery: delivery,
        deliveryIndex: deliveryIndex,
        processId: cartData.processData.capabilities.id,
        webStoreId: cartData.processData.webStoreId,
      };
      shippingModes.push(shippingMode);
    });
    return shippingModes;
  }
  app.directive("rbsCommerceShippingStep", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    rbsCommerceShippingStep,
  ]);
  function rbsCommerceShippingStep(AjaxAPI, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-step.twig",
      scope: { processEngine: "=" },
      controller: [
        "$scope",
        function (scope) {
          scope.processData =
            scope.processEngine.getStepProcessData("shipping");
          scope.processData.errors = [];
          scope.userAddresses = [];
          scope.shippingZone = null;
          scope.taxesZones = null;
          var cartData = scope.processEngine.getObjectData();
          scope.cartData = cartData;
          var capabilities = cartData.processData.capabilities;
          scope.giftCapabilities = {
            allow: capabilities.allowGift,
            allowMessage: capabilities.allowGiftMessage,
            allowWrap: capabilities.allowGiftWrap,
            messageMaxLength: capabilities.giftMessageMaxLength,
            presentation: cartData.process.gift || {},
            giftSelectionMode: capabilities.giftSelectionMode,
          };
          scope.processData.userId = cartData.customer.userId;
          scope.simplifiedProcess =
            cartData.processData.options.simplified || false;
          var processInfo = scope.processEngine.getProcessConfigurationInfo();
          scope.shippingModesInfo =
            processInfo && processInfo["shippingModes"]
              ? processInfo["shippingModes"]
              : {};
          scope.shippingZone = processInfo.shippingZone;
          scope.taxesZones =
            capabilities.taxBehavior > 1 ? processInfo.taxesZones : null;
          scope.processData.shippingModes = buildShippingModes(cartData, scope);
          scope.processData.gift = cartData.gift;
          if (
            scope.processData.userId &&
            (capabilities.atHomeDelivery || capabilities.storeAtHomeDelivery)
          ) {
            AjaxAPI.getData("Rbs/Geo/Address/", {
              userId: scope.processData.userId,
              matchingZone: scope.shippingZone || scope.taxesZones,
            }).then(
              function (result) {
                scope.userAddresses = result.data.items;
              },
              function (result) {
                console.error("Rbs/Geo/Address/", result);
              },
            );
          }
        },
      ],
      link: function (scope) {
        scope.isCategory = function (shippingMode, category, delivery) {
          if (!delivery) {
            return false;
          }
          var index = delivery.index;
          if (
            scope.shippingModesInfo[index] &&
            scope.shippingModesInfo[index].hasOwnProperty(category)
          ) {
            var shippingModes = scope.shippingModesInfo[index][category];
            for (var i = 0; i < shippingModes.length; i++) {
              if (shippingModes[i].common.id == shippingMode.id) {
                return true;
              }
            }
          }
          return false;
        };
        scope.hasCategory = function (category, delivery) {
          if (!delivery) {
            return false;
          }
          var index = delivery.index;
          if (
            !scope.shippingModesInfo[index] ||
            !scope.shippingModesInfo[index].hasOwnProperty(category)
          ) {
            return false;
          }
          var modes = scope.shippingModesInfo[index][category];
          if (
            !modes.length &&
            category !== "atHome" &&
            category !== "storeAtHome"
          ) {
            return false;
          }
          if (delivery.category === "store") {
            return category === "store";
          } else if (delivery.category === "reservation") {
            return category === "reservation";
          }
          return category !== "store" && category !== "reservation";
        };
        scope.hasNoCategory = function (delivery) {
          return (
            !scope.hasCategory("reservation", delivery) &&
            !scope.hasCategory("store", delivery) &&
            !scope.hasCategory("relay", delivery) &&
            !scope.hasCategory("atHome", delivery) &&
            !scope.hasCategory("storeAtHome", delivery)
          );
        };
        scope.setCurrentStep = function () {
          scope.processEngine.setCurrentStep("shipping");
        };
        scope.cancelPayment = function () {
          var promise = cancelPayment(scope.processEngine, $rootScope, AjaxAPI);
          promise.then(
            function () {
              scope.setCurrentStep();
            },
            function () {},
          );
          return promise;
        };
        scope.shippingModesValid = function () {
          for (var i = 0; i < scope.processData.shippingModes.length; i++) {
            var shippingMode = scope.processData.shippingModes[i];
            if (
              !angular.isFunction(shippingMode.valid) ||
              !shippingMode.valid() ||
              (angular.isFunction(shippingMode.isTransportable) &&
                !shippingMode.isTransportable())
            ) {
              return false;
            }
          }
          return true;
        };
        function nextStep() {
          var cartData = scope.processEngine.getObjectData();
          scope.processData.shippingModes = buildShippingModes(cartData, scope);
          scope.processData.gift = cartData.gift;
          scope.processEngine.nextStep();
          if (
            scope.processEngine.getCurrentStep() === "gift" &&
            !cartData.gift.containsGift
          ) {
            scope.processEngine.nextStep();
          }
          if (
            scope.processEngine.getCurrentStep() === "premium" &&
            cartData.premium &&
            cartData.premium.active
          ) {
            scope.processEngine.nextStep();
          }
        }
        scope.next = function () {
          var request = scope.saveMode();
          if (request) {
            request.then(function () {
              nextStep();
            });
          } else {
            nextStep();
          }
        };
        scope.$on("objectDataUpdated", function (event, cartData) {
          if (!scope.processData.isCurrent) {
            scope.processData.shippingModes = buildShippingModes(
              cartData,
              scope,
            );
            scope.processData.gift = cartData.gift;
          }
        });
        scope.saveMode = function () {
          var actions = { setShippingModes: [], updateGifts: [] };
          angular.forEach(
            scope.processData.shippingModes,
            function (shippingMode) {
              if (
                angular.isFunction(shippingMode.valid) &&
                shippingMode.valid()
              ) {
                actions.setShippingModes.push(shippingMode.valid(true));
              }
              actions.updateGifts.push({
                index: shippingMode.delivery.index,
                containsGift:
                  shippingMode.delivery.options.containsGift || false,
                giftSelectionMode:
                  scope.giftCapabilities.giftSelectionMode || false,
              });
            },
          );
          return scope.processEngine.updateObjectData(actions);
        };
      },
    };
  }
  app.directive("rbsCommerceModeSelector", rbsCommerceModeSelector);
  function rbsCommerceModeSelector() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-mode-selector.twig",
      scope: {
        shippingMode: "=",
        shippingModeInfo: "=",
        showPrices: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
      link: function (scope, element, attrs) {
        scope.showRadio = attrs.showRadio;
        scope.$watch("shippingMode.id", function (id) {
          if (id == scope.shippingModeInfo.common.id) {
            scope.shippingMode.category =
              scope.shippingModeInfo.common.category;
          }
        });
      },
    };
  }
  app.directive("rbsCommerceShippingAtHomeStep", [
    "RbsChange.AjaxAPI",
    rbsCommerceShippingAtHomeStep,
  ]);
  function rbsCommerceShippingAtHomeStep(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-at-home-step.twig",
      scope: {
        processId: "=",
        shippingMode: "=",
        shippingModesInfo: "=",
        userId: "=",
        userAddresses: "=",
        hasOtherModes: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
      link: function (scope) {
        scope.loadShippingModes = true;
        scope.atHomeAddress = { common: {}, fields: {}, lines: [] };
        scope.atHomeAddressIsValid = false;
        scope.modeIds = {};
        scope.edition = false;
        scope.editionForm = false;
        scope.shippingModesInfo = [];
        scope.precheckSaveAddress = false;
        scope.copyDeliveryToBillingAddress = true;
        scope.copyDeliveryToBillingChoice = { value: false };
        scope.accountRequest = false;
        var processEngineData = scope.processEngine.getObjectData();
        if (processEngineData && processEngineData.process) {
          scope.precheckSaveAddress =
            processEngineData.process.common.precheckSaveAddress;
          if (scope.processEngine.type === "order") {
            scope.copyDeliveryToBillingAddress =
              processEngineData.process.common.copyDeliveryToBillingAddress;
          }
        }
        if (processEngineData && processEngineData.customer) {
          scope.accountRequest =
            processEngineData.customer.options.accountRequest;
        }
        function cleanupAddress(address) {
          var returnAddress = {
            common: { addressFieldsId: address.common.addressFieldsId },
            fields: address.fields,
            lines: address.lines,
          };
          if (address.common.id) {
            returnAddress.common.id = address.common.id;
          }
          if (address.common.useName && address.common.name) {
            returnAddress.common.useName = address.common.useName;
            returnAddress.common.name = address.common.name;
          }
          if (address.default) {
            returnAddress.default = address.default;
          }
          return returnAddress;
        }
        function atHomeValid(returnData) {
          var shippingMode = scope.shippingMode;
          if (returnData) {
            var returnObj = {
              id: shippingMode.id,
              title: shippingMode.title,
              lineKeys: shippingMode.lineKeys,
              wishCustomerReceiptDate: shippingMode.wishCustomerReceiptDate,
              address: cleanupAddress(scope.atHomeAddress),
              options: {},
            };
            if (angular.isFunction(shippingMode.getTransportableOptions)) {
              returnObj.options = shippingMode.getTransportableOptions();
            }
            if (scope.copyDeliveryToBillingChoice.value) {
              returnObj.options.copyDeliveryToBillingChoice =
                scope.copyDeliveryToBillingChoice.value;
            }
            if (shippingMode.options.message) {
              returnObj.options.message = shippingMode.options.message;
            }
            if (shippingMode.options.containsGift) {
              returnObj.options.containsGift =
                shippingMode.options.containsGift;
              if (shippingMode.options.giftAddMessage) {
                returnObj.options.giftAddMessage =
                  shippingMode.options.giftAddMessage;
              }
              if (shippingMode.options.giftMessage) {
                returnObj.options.giftMessage =
                  shippingMode.options.giftMessage;
              }
              if (shippingMode.options.giftAddWrap) {
                returnObj.options.giftAddWrap =
                  shippingMode.options.giftAddWrap;
              }
            }
            return returnObj;
          }
          return (
            !scope.edition &&
            scope.modeIds[shippingMode.id] &&
            !scope.isEmptyAddress(scope.atHomeAddress) &&
            !shippingMode.options.invalidMessage
          );
        }
        scope.getDefaultUserAddress = function (userAddresses) {
          var defaultUserAddress = null,
            address;
          if (angular.isArray(userAddresses)) {
            for (var i = 0; i < userAddresses.length; i++) {
              address = userAddresses[i];
              if (address["default"]) {
                if (address["default"]["shipping"]) {
                  return address;
                } else if (address["default"]["default"]) {
                  defaultUserAddress = address;
                }
              }
            }
          }
          return defaultUserAddress;
        };
        scope.isEmptyAddress = function (address) {
          if (angular.isObject(address) && !angular.isArray(address)) {
            if (
              address.fields &&
              address.fields.countryCode &&
              address.lines &&
              address.lines.length > 1
            ) {
              return false;
            }
          }
          return true;
        };
        scope.isInvalidAddress = function (address) {
          return (
            angular.isObject(address) &&
            address.fields &&
            address.fields.countryCode &&
            address.lines &&
            address.lines.length === 0
          );
        };
        scope.showPrices = scope.processEngine.showPrices(true);
        scope.$watch("atHomeAddress", function (address) {
          if (!scope.isEmptyAddress(address)) {
            scope.processEngine.loading(true);
            scope.loadShippingModes = true;
            var params = {
              dataSets: "fee",
              visualFormats: scope.processEngine.parameters("imageFormats"),
            };
            var delivery = scope.shippingMode.delivery;
            AjaxAPI.getData(
              "Rbs/Commerce/Process/" +
                scope.processId +
                "/ShippingModesByAddress/",
              {
                address: address,
                deliveryIndex: delivery ? delivery.index : null,
              },
              params,
            ).then(
              function (result) {
                if (scope.atHomeAddress !== address) {
                  return;
                }
                var validCurrentMode = false;
                scope.shippingModesInfo = result.data.items;
                scope.modeIds = {};
                angular.forEach(result.data.items, function (modeData) {
                  scope.modeIds[modeData.common.id] = true;
                  if (modeData.common.id == scope.shippingMode.id) {
                    scope.shippingMode.valid = atHomeValid;
                    validCurrentMode = true;
                  }
                });
                if (!validCurrentMode && !scope.hasOtherModes) {
                  if (result.data.items.length) {
                    scope.shippingMode.id = result.data.items[0].common.id;
                    scope.shippingMode.valid = atHomeValid;
                  } else {
                    scope.shippingMode.id = 0;
                  }
                }
                scope.loadShippingModes = false;
                scope.processEngine.loading(false);
              },
              function (result) {
                scope.loadShippingModes = false;
                if (scope.atHomeAddress !== address) {
                  return;
                }
                console.error("shippingModesByAddress", result);
                if (!scope.hasOtherModes) {
                  scope.shippingMode.id = 0;
                }
                scope.processEngine.loading(false);
              },
            );
          }
        });
        scope.$watch("shippingMode.id", function (id) {
          if (id) {
            var found = false;
            angular.forEach(scope.shippingModesInfo, function (modeInfo) {
              if (modeInfo.common.id == id) {
                found = true;
                scope.shippingMode.title = modeInfo.common.title;
                if (
                  !angular.isObject(scope.shippingMode.options) ||
                  angular.isArray(scope.shippingMode.options)
                ) {
                  scope.shippingMode.options = {};
                }
                scope.setAddress(scope.atHomeAddress);
                scope.shippingMode.options.category = modeInfo.common.category;
                scope.shippingMode.valid = atHomeValid;
              }
            });
            if (!found && scope.edition) {
              scope.setAddress(scope.atHomeAddress);
            }
          }
        });
        scope.setAddress = function (address) {
          if (scope.shippingMode) {
            scope.shippingMode.atHomeAddress = address;
          }
          scope.atHomeAddress = address;
          scope.edition = false;
          scope.editionForm = false;
          scope.matchingZoneError = null;
          scope.normalizeAddresses = [];
        };
        scope.editAddress = function (currentAddress) {
          scope.shippingMode.id = 0;
          scope.matchingZoneError = null;
          scope.edition = true;
          scope.editionForm = !!currentAddress;
          scope.normalizeAddresses = [];
        };
        scope.chooseAddress = function () {
          scope.newAddress();
          if (scope.userAddresses.length === 0) {
            scope.newAddress();
          } else {
            scope.shippingMode.id = 0;
            scope.matchingZoneError = null;
            scope.edition = true;
            scope.editionForm = false;
          }
        };
        scope.newAddress = function () {
          scope.shippingMode.id = 0;
          scope.matchingZoneError = null;
          scope.edition = true;
          scope.editionForm = true;
          var processEngineData = scope.processEngine.getObjectData();
          var profile =
            processEngineData &&
            processEngineData.customer &&
            processEngineData.customer.options &&
            processEngineData.customer.options.profiles &&
            processEngineData.customer.options.profiles.Rbs_User;
          scope.atHomeAddress = {
            common: {
              addressFieldsId: scope.atHomeAddress.common.addressFieldsId,
              useName:
                scope.precheckSaveAddress &&
                (scope.userId || scope.accountRequest),
            },
            fields: {
              firstName: profile && profile.firstName,
              lastName: profile && profile.lastName,
              titleCode: profile && profile.titleCode,
              countryCode: scope.atHomeAddress.fields.countryCode,
            },
            lines: [],
          };
        };
        scope.selectUserAddress = function (address, skipNormalize) {
          scope.validateAddress(address, skipNormalize);
        };
        scope.useAddress = function (addressToUse) {
          var address = addressToUse
            ? addressToUse
            : angular.copy(scope.atHomeAddress);
          if (
            scope.userId &&
            address.common &&
            address.common["useName"] &&
            address.common.name
          ) {
            if (!address.common.id) {
              address.default = { default: true, shipping: true };
              angular.forEach(scope.userAddresses, function (userAddress) {
                if (userAddress.default) {
                  if (userAddress.default.default) {
                    delete address.default.default;
                  }
                  if (userAddress.default.shipping) {
                    delete address.default.shipping;
                  }
                }
              });
              scope.processEngine.loading(true);
              AjaxAPI.postData("Rbs/Geo/Address/", address).then(
                function (result) {
                  var addedAddress = result.data.dataSets;
                  scope.setAddress(addedAddress);
                  scope.userAddresses.push(addedAddress);
                  scope.processEngine.loading(false);
                },
                function (result) {
                  console.log("useAddress error", result);
                  scope.processEngine.loading(false);
                },
              );
            } else {
              scope.processEngine.loading(true);
              AjaxAPI.putData(
                "Rbs/Geo/Address/" + address.common.id,
                address,
              ).then(
                function (result) {
                  var updatedAddress = result.data.dataSets;
                  scope.setAddress(updatedAddress);
                  angular.forEach(
                    scope.userAddresses,
                    function (userAddress, index) {
                      if (userAddress.common.id === address.common.id) {
                        scope.userAddresses[index] = updatedAddress;
                      }
                    },
                  );
                  scope.processEngine.loading(false);
                },
                function (result) {
                  console.log("useAddress error", result);
                  scope.processEngine.loading(false);
                },
              );
            }
          } else {
            scope.setAddress(address);
          }
        };
        scope.setTaxZone = function (taxZone) {
          if (scope.processEngine.getObjectData().common.zone !== taxZone) {
            var actions = {
              setZone: {
                zone: taxZone,
                deliveryIndex: scope.shippingMode.deliveryIndex,
              },
            };
            scope.processEngine.updateObjectData(actions);
          }
        };
        scope.validateAddress = function (address, skipNormalize) {
          scope.validAddress = null;
          scope.normalizeAddresses = [];
          scope.isAddressFromBook = address.common && address.common.id;
          var params = {
            address: address,
            contextCode: "shipping",
            skipNormalize: !!skipNormalize,
          };
          var shippingZone = scope.shippingMode.shippingZone;
          if (shippingZone) {
            params.matchingZone = shippingZone;
          }
          var taxesZones = scope.shippingMode.taxesZones;
          if (taxesZones) {
            params.compatibleZones = taxesZones;
          }
          if (scope.processEngine.getObjectData().common) {
            params.targetIdentifier =
              scope.processEngine.getObjectData().common.identifier;
            params.targetType = "cart";
          }
          scope.matchingZoneError = null;
          scope.processEngine.loading(true);
          var request = AjaxAPI.postData("Rbs/Geo/ValidateAddress", params);
          request.then(
            function (result) {
              scope.validAddress = result.data.dataSets.address;
              scope.normalizeAddresses =
                result.data.dataSets.normalizeAddresses || [];
              scope.isOriginalAddressValid =
                result.data.dataSets.isOriginalAddressValid || false;
              scope.errorMessages = result.data.dataSets.errorMessages || [];
              if (scope.normalizeAddresses.length) {
                scope.editionForm = false;
                if (scope.validAddress.common && scope.validAddress.common.id) {
                  angular.forEach(
                    scope.normalizeAddresses,
                    function (normalizeAddress) {
                      normalizeAddress.common.useName = true;
                    },
                  );
                }
              }
              if (taxesZones && taxesZones.length) {
                if (
                  angular.isArray(scope.validAddress.compatibleZones) &&
                  scope.validAddress.compatibleZones.length
                ) {
                  if (!scope.normalizeAddresses.length) {
                    scope.useAddress(scope.validAddress);
                  }
                  var taxZone = scope.validAddress.compatibleZones[0];
                  scope.setTaxZone(taxZone);
                } else {
                  scope.setTaxZone(null);
                }
              } else if (!scope.normalizeAddresses.length) {
                scope.useAddress(scope.validAddress);
              }
              scope.processEngine.loading(false);
            },
            function (result) {
              if (
                result.status === 409 &&
                result.data &&
                result.data.error &&
                (result.data.code === "matchingZone" ||
                  result.data.code === "compatibleZones" ||
                  result.data.code === "normalizeAddress")
              ) {
                scope.errorMessages = [result.data.message];
              } else {
                console.error("validateAddress error", result);
              }
              scope.processEngine.loading(false);
            },
          );
          return request;
        };
        var category = scope.shippingMode && scope.shippingMode.category;
        if (
          (category === "atHome" || category === "storeAtHome") &&
          !scope.isEmptyAddress(scope.shippingMode.address)
        ) {
          if (scope.shippingMode.options.copyDeliveryToBillingChoice) {
            scope.copyDeliveryToBillingChoice.value =
              scope.shippingMode.options.copyDeliveryToBillingChoice;
          }
          scope.setAddress(scope.shippingMode.address);
        } else if (scope.userId) {
          scope.$watchCollection("userAddresses", function (userAddresses) {
            if (scope.isEmptyAddress(scope.atHomeAddress)) {
              var defAddress = scope.getDefaultUserAddress(userAddresses);
              if (defAddress) {
                scope.setAddress(defAddress);
              } else if (!scope.hasOtherModes) {
                scope.chooseAddress();
              }
            }
          });
        } else if (
          !scope.hasOtherModes &&
          scope.isEmptyAddress(scope.atHomeAddress)
        ) {
          scope.chooseAddress();
        }
      },
    };
  }
  app.directive(
    "rbsCommerceSummaryShippingAtHomeStep",
    rbsCommerceSummaryShippingAtHomeStep,
  );
  function rbsCommerceSummaryShippingAtHomeStep() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-summary-shipping-at-home-step.twig",
      scope: {
        shippingMode: "=",
        shippingModesInfo: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
      link: function (scope) {},
    };
  }
  app.directive("rbsCommerceShippingOtherStep", rbsCommerceShippingOtherStep);
  function rbsCommerceShippingOtherStep() {
    return {
      restrict: "A",
      template: "<div></div>",
      scope: {
        processId: "=",
        shippingMode: "=",
        shippingModesInfo: "=",
        userId: "=",
        userAddresses: "=",
        hasOtherModes: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
      link: function (scope, elem, attrs) {
        var summary = attrs.summary === "true";
        scope.showPrices = scope.processEngine.showPrices(true);
        if (scope.processEngine && scope.processEngine.type === "return") {
          scope.showPrices = false;
        }
        scope.$watchCollection(
          "shippingModesInfo",
          function (shippingModesInfo) {
            var html = [];
            angular.forEach(
              shippingModesInfo,
              function (shippingModeInfo, index) {
                var directiveName;
                if (summary) {
                  if (shippingModeInfo.common.id == scope.shippingMode.id) {
                    directiveName = shippingModeInfo["directiveNames"]
                      ? shippingModeInfo["directiveNames"].summary
                      : null;
                    if (directiveName) {
                      html.push("<div " + directiveName + '=""');
                      html.push(' data-shipping-mode="shippingMode"');
                      html.push(
                        ' data-shipping-mode-info="shippingModesInfo[' +
                          index +
                          ']"',
                      );
                      html.push(' data-process-engine="processEngine"');
                      html.push("></div>");
                    }
                  }
                } else {
                  directiveName = shippingModeInfo["directiveNames"]
                    ? shippingModeInfo["directiveNames"].editor
                    : null;
                  if (directiveName) {
                    html.push('<div class="mode-selector">');
                    html.push('<div data-rbs-commerce-mode-selector=""');
                    html.push(' class="mode-selector-main"');
                    if (shippingModesInfo.length > 1 || scope.hasOtherModes) {
                      html.push(' data-show-radio="true"');
                    }
                    html.push(' data-show-prices="showPrices"');
                    html.push(' data-shipping-mode="shippingMode"');
                    html.push(
                      ' data-shipping-mode-info="shippingModesInfo[' +
                        index +
                        ']"',
                    );
                    html.push(' data-process-engine="processEngine"');
                    html.push(' data-gift-capabilities="giftCapabilities"');
                    html.push("></div>");
                    html.push("<div " + directiveName + '=""');
                    html.push(' class="mode-selector-options"');
                    html.push(
                      ' data-ng-if="shippingMode.id == shippingModesInfo[' +
                        index +
                        '].common.id"',
                    );
                    html.push(' data-process-id="processId"');
                    html.push(' data-show-prices="showPrices"');
                    html.push(' data-shipping-mode="shippingMode"');
                    html.push(
                      ' data-shipping-mode-info="shippingModesInfo[' +
                        index +
                        ']"',
                    );
                    html.push(' data-user-id="userId"');
                    html.push(' data-user-addresses="userAddresses"');
                    html.push(' data-process-engine="processEngine"');
                    html.push(' data-gift-capabilities="giftCapabilities"');
                    html.push("></div>");
                    html.push("</div>");
                  }
                }
              },
            );
            scope.processEngine.replaceChildren(elem, scope, html.join(""));
          },
        );
      },
    };
  }
  app.directive("rbsCommerceWishCustomerReceiptDate", [
    "RbsChange.AjaxAPI",
    rbsCommerceWishCustomerReceiptDate,
  ]);
  function rbsCommerceWishCustomerReceiptDate(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-wish-customer-receipt-date.twig",
      scope: true,
      link: function (scope) {
        scope.dates = {
          customerDates: null,
          customerDate: null,
          customerDateTime: null,
        };
        scope.state = "hidden";
        if (
          !scope.shippingModeInfo ||
          !scope.shippingModeInfo.customerReceiptDate ||
          !scope.shippingMode ||
          !scope.shippingMode.delivery
        ) {
          return;
        }
        var customerReceiptDate = scope.shippingModeInfo.customerReceiptDate;
        if (!customerReceiptDate.date) {
          return;
        }
        scope.state = "loading";
        if (scope.shippingMode.delivery.wishCustomerReceiptDate) {
          scope.shippingMode.wishCustomerReceiptDate =
            scope.shippingMode.delivery.wishCustomerReceiptDate;
        }
        scope.method = {
          value: scope.shippingMode.wishCustomerReceiptDate
            ? "specific"
            : "asap",
        };
        var category = scope.shippingModeInfo.common.category;
        scope.customerPickUp =
          category === "store" ||
          category === "reservation" ||
          category === "relay";
        var params = {
          mode: scope.shippingModeInfo.common.id,
          deliveryIndex: scope.shippingMode.delivery.index,
        };
        if (scope.shippingMode.storeId) {
          params.store = scope.shippingMode.storeId;
        }
        scope.$watch("dates.customerDates", function (customerDates) {
          if (scope.shippingMode.category === "storeAtHome") {
            scope.shippingMode.options.invalidMessage =
              customerDates &&
              Array.isArray(customerDates) &&
              !(customerDates.length > 0);
          } else {
            scope.shippingMode.options.invalidMessage = false;
          }
        });
        AjaxAPI.getData("Rbs/Commerce/WishCustomerReceiptDates", params).then(
          function (result) {
            scope.state = "noDates";
            var customerDates = result.data.dataSets.dates;
            scope.dates.customerDates = customerDates;
            scope.asapDate = result.data.dataSets.asapDate;
            var nbDates = (customerDates && customerDates.length) || 0;
            if (nbDates) {
              scope.state = "asDates";
              var checkDate = scope.shippingMode.wishCustomerReceiptDate;
              scope.dates.customerDate = customerDates[0];
              if (checkDate) {
                chooseHour(checkDate, customerDates[0]);
                for (var di = 1; di < nbDates; di++) {
                  var d = customerDates[di];
                  if (checkDate >= d.value) {
                    scope.dates.customerDate = d;
                    chooseHour(checkDate, d);
                  } else {
                    break;
                  }
                }
              }
            } else {
              scope.state = "noDates";
              scope.shippingMode.wishCustomerReceiptDate = null;
            }
          },
          function () {
            scope.state = "noDates";
            scope.shippingMode.wishCustomerReceiptDate = null;
          },
        );
        function chooseHour(checkDate, d) {
          var nbHours = (d.hours && d.hours.length) || 0;
          if (nbHours) {
            scope.dates.customerDateTime = d.hours[0];
            for (var ti = 1; ti < nbHours; ti++) {
              var t = d.hours[ti];
              if (checkDate >= t.value) {
                scope.dates.customerDateTime = t;
              } else {
                break;
              }
            }
          }
        }
        var timeTitle = null;
        scope.$watch("dates.customerDate", function (date) {
          if (date) {
            if (!date.hours || !date.hours.length) {
              if (scope.method.value === "specific") {
                scope.shippingMode.wishCustomerReceiptDate = date.value;
              }
              scope.dates.customerDateTime = null;
            } else if (!scope.dates.customerDateTime) {
              scope.dates.customerDateTime = date.hours[0];
              if (timeTitle && timeTitle !== date.hours[0].title) {
                for (var i = 1; i < date.hours.length; i++) {
                  if (timeTitle === date.hours[i].title) {
                    scope.dates.customerDateTime = date.hours[i];
                    return;
                  }
                }
              }
            }
          }
        });
        scope.$watch("dates.customerDateTime", function (time) {
          if (time) {
            timeTitle = time.title;
            if (scope.method.value === "specific") {
              scope.shippingMode.wishCustomerReceiptDate = time.value;
            }
          }
        });
        scope.$watch("method.value", function (method) {
          if (method === "asap") {
            scope.shippingMode.wishCustomerReceiptDate = null;
          } else if (method === "specific") {
            if (scope.dates.customerDateTime) {
              scope.shippingMode.wishCustomerReceiptDate =
                scope.dates.customerDateTime.value;
            } else if (scope.dates.customerDate) {
              scope.shippingMode.wishCustomerReceiptDate =
                scope.dates.customerDate.value;
            }
          }
        });
        scope.onDateChange = function () {
          scope.method.value = "specific";
          if (scope.dates.customerDateTime) {
            scope.shippingMode.wishCustomerReceiptDate =
              scope.dates.customerDateTime.value;
          } else if (scope.dates.customerDate) {
            scope.shippingMode.wishCustomerReceiptDate =
              scope.dates.customerDate.value;
          }
        };
      },
    };
  }
  app.directive("rbsCommerceShippingModeGift", rbsCommerceShippingModeGift);
  function rbsCommerceShippingModeGift() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-mode-gift.twig",
      scope: true,
      link: function (scope) {
        scope.allowGift = false;
        if (
          !scope.shippingModeInfo ||
          !scope.shippingMode ||
          !scope.shippingMode.delivery
        ) {
          return;
        }
        scope.allowGift =
          scope.giftCapabilities.allow &&
          scope.shippingModeInfo.giftCapabilities.allow;
        scope.shippingMode.containsGift =
          scope.shippingMode.containsGift || false;
      },
    };
  }
  app.directive(
    "rbsCommerceShippingModeMessage",
    rbsCommerceShippingModeMessage,
  );
  function rbsCommerceShippingModeMessage() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-mode-message.twig",
      scope: true,
      link: function (scope) {
        scope.messageCapabilities = scope.shippingModeInfo.messageCapabilities;
        if (!scope.messageCapabilities.allow) {
          scope.shippingMode.options.message = null;
        }
        scope.$watch("shippingMode.options.message", function (msg) {
          if (msg) {
            scope.shippingMode.options.invalidMessage =
              msg.length > scope.messageCapabilities.messageMaxLength;
          } else {
            scope.shippingMode.options.invalidMessage = false;
          }
        });
      },
    };
  }
  app.directive("rbsCommerceReceiverCompiler", [
    "$compile",
    function ($compile) {
      return {
        restrict: "A",
        link: function (scope, elm) {
          scope.$watch("shippingModeInfo", function (selectedMode) {
            if (
              selectedMode &&
              selectedMode.directiveNames &&
              selectedMode.directiveNames.informationEditor
            ) {
              redrawShippingModeInformation(
                $compile,
                scope,
                selectedMode.directiveNames.informationEditor,
              );
            }
          });
          function redrawShippingModeInformation(
            $compile,
            scope,
            directiveName,
          ) {
            var container = elm.find("#RbsShippingModeInformation");
            container.children().remove();
            container.html("<div " + directiveName + '=""></div>');
            $compile(container.children())(scope);
          }
        },
      };
    },
  ]);
  app.directive("rbsCommerceShippingReceiverInformationEditor", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-shipping-receiver-information-editor.twig",
      link: function (scope) {
        scope.data = {
          mobilePhone: null,
          email: null,
          firstName: null,
          lastName: null,
          showFirstName: true,
          showLastName: true,
        };
        var shippingMode = scope.shippingMode;
        if (!shippingMode) {
          console.warn("Require shippingMode");
          return;
        }
        if (shippingMode.atHomeAddress && shippingMode.atHomeAddress.fields) {
          scope.data.showLastName = !shippingMode.atHomeAddress.fields.lastName;
          scope.data.showFirstName =
            !shippingMode.atHomeAddress.fields.firstName;
        }
        shippingMode.isTransportable = function () {
          return (
            scope.data.mobilePhone != null &&
            (!scope.data.showLastName || scope.data.lastName != null) &&
            (!scope.data.showFirstName || scope.data.firstName != null)
          );
        };
        shippingMode.getTransportableOptions = function () {
          return {
            mobilePhone: scope.data.mobilePhone,
            firstName: scope.data.showFirstName ? scope.data.firstName : null,
            lastName: scope.data.showLastName ? scope.data.lastName : null,
          };
        };
        var options = shippingMode.options;
        if (options) {
          if (options.mobilePhone) {
            scope.data.mobilePhone = options.mobilePhone;
          }
          if (options.email) {
            scope.data.email = options.email;
          }
          if (options.lastName && scope.data.showLastName) {
            scope.data.lastName = options.lastName;
          }
          if (options.firstName && scope.data.showFirstName) {
            scope.data.firstName = options.firstName;
          }
        }
        var cartData = scope.processEngine.getObjectData();
        var customer = cartData ? cartData.customer : null;
        if (customer) {
          if (!scope.data.mobilePhone && customer.mobilePhone) {
            scope.data.mobilePhone = customer.mobilePhone;
          }
          if (!scope.data.email && customer.email) {
            scope.data.email = customer.email;
          }
          var profile =
            customer.options.profiles && customer.options.profiles.Rbs_User;
          if (profile) {
            if (
              !scope.data.lastName &&
              profile.lastName &&
              scope.data.showLastName
            ) {
              scope.data.lastName = profile.lastName;
            }
            if (
              !scope.data.firstName &&
              profile.firstName &&
              scope.data.showFirstName
            ) {
              scope.data.firstName = profile.firstName;
            }
          }
        }
        scope.$on("$destroy", function () {
          scope.shippingMode.isTransportable = null;
          scope.shippingMode.getTransportableOptions = null;
        });
      },
    };
  });
  app.directive("rbsCommerceGiftStep", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    rbsCommerceGiftStep,
  ]);
  function rbsCommerceGiftStep(AjaxAPI, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-gift-step.twig",
      scope: { processEngine: "=" },
      controller: [
        "$scope",
        function (scope) {
          scope.processData = scope.processEngine.getStepProcessData("gift");
          scope.processData.errors = [];
          if (!scope.processData.id) {
            scope.processData.id = 0;
          }
          var processInfo = scope.processEngine.getProcessConfigurationInfo();
          scope.shippingModesInfo =
            processInfo && processInfo["shippingModes"]
              ? processInfo["shippingModes"]
              : {};
          scope.resolveShippingModeInfo = function (shippingModeData) {
            if (!shippingModeData || !shippingModeData.category) {
              return null;
            }
            var modes =
              scope.shippingModesInfo[shippingModeData.delivery.index][
                shippingModeData.category
              ];
            for (var i = 0; i < modes.length; i++) {
              if (modes[i].common.id == shippingModeData.id) {
                return modes[i];
              }
            }
            return null;
          };
          var cartData = scope.processEngine.getObjectData();
          var capabilities = cartData.processData.capabilities;
          scope.giftCapabilities = {
            allow: capabilities.allowGift,
            allowMessage: capabilities.allowGiftMessage,
            allowWrap: capabilities.allowGiftWrap,
            messageMaxLength: capabilities.giftMessageMaxLength,
            presentation: cartData.process.gift || {},
            giftSelectionMode: capabilities.giftSelectionMode,
          };
          scope.processData.shippingModes = buildShippingModes(cartData, scope);
          scope.processData.gift = cartData.gift;
        },
      ],
      link: function (scope) {
        scope.showPrices = scope.processEngine.showPrices();
        scope.currencyCode = scope.processEngine.getCurrencyCode();
        scope.setCurrentStep = function () {
          scope.processEngine.setCurrentStep("gift");
        };
        scope.cancelPayment = function () {
          var promise = cancelPayment(scope.processEngine, $rootScope, AjaxAPI);
          promise.then(
            function () {
              scope.setCurrentStep();
            },
            function () {},
          );
          return promise;
        };
        scope.skuGiftValid = function (delivery, type) {
          for (var j = 0; j < delivery.lines.length; j++) {
            var line = delivery.lines[j];
            if (line.skuCapabilities[type]) {
              return true;
            }
          }
          return false;
        };
        scope.giftsValid = function () {
          var maxLength = scope.giftCapabilities.messageMaxLength || null;
          for (var i = 0; i < scope.processData.shippingModes.length; i++) {
            var shippingMode = scope.processData.shippingModes[i];
            var message = true;
            if (scope.giftCapabilities.giftSelectionMode === "line") {
              for (var j = 0; j < shippingMode.delivery.lines.length; j++) {
                var line = shippingMode.delivery.lines[j];
                if (line.options["giftAddMessage"]) {
                  message = line.options["giftMessage"];
                }
              }
            } else if (
              scope.giftCapabilities.giftSelectionMode === "delivery"
            ) {
              if (shippingMode.options["giftAddMessage"]) {
                message = shippingMode.options["giftMessage"];
              }
            }
            if (!message) {
              return false;
            }
            if (maxLength && maxLength < message.length) {
              return false;
            }
          }
          return true;
        };
        function nextStep() {
          var cartData = scope.processEngine.getObjectData();
          scope.processData.shippingModes = buildShippingModes(cartData, scope);
          scope.processData.gift = cartData.gift;
          scope.processEngine.nextStep();
          if (
            scope.processEngine.getCurrentStep() === "premium" &&
            cartData.premium &&
            cartData.premium.active
          ) {
            scope.processEngine.nextStep();
          }
        }
        scope.next = function () {
          var request = scope.saveMode();
          if (request) {
            request.then(function () {
              nextStep();
            });
          } else {
            nextStep();
          }
        };
        scope.saveMode = function () {
          var actions = { updateGifts: [], updateGiftsLines: [] };
          angular.forEach(
            scope.processData.shippingModes,
            function (shippingMode) {
              var containsGift =
                shippingMode.delivery.options.containsGift || false;
              var deliveryData = {
                index: shippingMode.delivery.index,
                lines: [],
              };
              actions.updateGifts.push({
                index: shippingMode.delivery.index,
                containsGift:
                  shippingMode.delivery.options.containsGift || false,
                giftSelectionMode:
                  scope.giftCapabilities.giftSelectionMode || false,
              });
              if (scope.giftCapabilities.giftSelectionMode === "delivery") {
                deliveryData.giftAddMessage = containsGift
                  ? shippingMode.delivery.options.giftAddMessage
                  : false;
                deliveryData.giftMessage = containsGift
                  ? shippingMode.delivery.options.giftMessage
                  : null;
                deliveryData.giftAddWrap = containsGift
                  ? shippingMode.delivery.options.giftAddWrap
                  : false;
              }
              for (var i = 0; i < shippingMode.delivery.lines.length; i++) {
                var line = shippingMode.delivery.lines[i];
                deliveryData.lines.push({
                  key: line.key,
                  giftAddMessage: containsGift
                    ? line.options["giftAddMessage"]
                    : false,
                  giftMessage: containsGift
                    ? line.options["giftMessage"]
                    : null,
                  giftAddWrap: containsGift
                    ? line.options["giftAddWrap"]
                    : false,
                });
              }
              actions.updateGiftsLines.push(deliveryData);
            },
          );
          return scope.processEngine.updateObjectData(actions);
        };
      },
    };
  }
  app.directive("rbsCommercePremiumStep", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    rbsCommercePremiumStep,
  ]);
  function rbsCommercePremiumStep(AjaxAPI, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-premium-step.twig",
      scope: { processEngine: "=" },
      controller: [
        "$scope",
        function (scope) {
          scope.processData = scope.processEngine.getStepProcessData("premium");
          scope.processData.errors = [];
          if (!scope.processData.id) {
            scope.processData.id = 0;
          }
          var processInfo = scope.processEngine.getProcessConfigurationInfo();
          scope.processData.premiumTypes = processInfo.premiumTypes || [];
          var cartData = scope.processEngine.getObjectData();
          if (cartData.premium) {
            scope.processData.premium = cartData.premium;
            scope.processData.id = cartData.premium.common.id;
          }
          var premiumEnabled = cartData.customer.userId !== 0;
          if (!premiumEnabled && cartData.customer.options) {
            premiumEnabled = cartData.customer.options.accountRequest || false;
          }
          scope.processData.premiumEnabled = premiumEnabled;
        },
      ],
      link: function (scope) {
        scope.showPrices = scope.processEngine.showPrices(true);
        scope.setCurrentStep = function (currentStep) {
          var step = currentStep || "premium";
          scope.processEngine.setCurrentStep(step);
        };
        scope.cancelPayment = function () {
          var promise = cancelPayment(scope.processEngine, $rootScope, AjaxAPI);
          promise.then(
            function () {
              scope.setCurrentStep();
            },
            function () {},
          );
          return promise;
        };
        scope.selectPremiumType = function (premiumType) {
          scope.processData.id = premiumType.common.id || 0;
          scope.processData.premiumType = premiumType;
        };
        scope.next = function () {
          var actions = { setPremium: { newId: scope.processData.id } };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(function () {
              var cartData = scope.processEngine.getObjectData();
              if (cartData.premium) {
                scope.processData.premium = cartData.premium;
                scope.processData.id = cartData.premium.common.id || 0;
              }
              scope.processEngine.nextStep();
            });
          } else {
            var cartData = scope.processEngine.getObjectData();
            scope.processData.premium = cartData.premium;
            scope.processData.id = cartData.premium.common.id;
            scope.processEngine.nextStep();
          }
        };
        scope.nextWithoutPremium = function () {
          scope.processData.id = 0;
          scope.processData.premium = null;
          scope.next();
        };
      },
    };
  }
  app.directive("rbsCommercePaymentStep", [
    "RbsChange.AjaxAPI",
    "$location",
    "$rootScope",
    rbsCommercePaymentStep,
  ]);
  function rbsCommercePaymentStep(AjaxAPI, $location, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-payment-step.twig",
      scope: { processEngine: "=" },
      link: function (scope) {
        scope.processData = scope.processEngine.getStepProcessData("payment");
        scope.processData.errors = [];
        if (!scope.processData.id) {
          scope.processData.id = 0;
        }
        scope.userAddresses = null;
        scope.transactions = [];
        scope.failedReason = $location.search().failedReason || false;
        $location.search("failedReason", null);
        scope.handleCoupons = scope.processEngine.parameters("handleCoupons");
        scope.precheckSaveAddress = false;
        scope.copyDeliveryToBillingAddress = false;
        scope.accountRequest = false;
        scope.processing = false;
        var currentCartData = scope.processEngine.getObjectData();
        scope.cartIdentifier =
          currentCartData &&
          currentCartData.common &&
          currentCartData.common.identifier;
        scope.paymentInfo = currentCartData.payment || {};
        scope.cartMessages = currentCartData.common.messages || {};
        scope.suggestedCoupons = currentCartData.suggestedCoupons || {};
        scope.maximumUsableCoupon =
          currentCartData.processData.capabilities.maximumUsableCoupon;
        if (currentCartData && currentCartData.process) {
          scope.precheckSaveAddress =
            currentCartData.process.common.precheckSaveAddress;
          scope.copyDeliveryToBillingAddress =
            currentCartData.process.common.copyDeliveryToBillingAddress;
        }
        scope.$on("objectDataUpdated", function (event, cartData) {
          currentCartData = cartData;
          var customer = cartData.customer;
          scope.processData.requireTokenValidation = !!(
            customer.options && customer.options.mobilePhoneRequestId
          );
          scope.processData.requireMobilePhone =
            (cartData.processData.capabilities.allowMobilePhone &&
              cartData.processData.hasStoreDelivery) ||
            false;
          scope.cartMessages = currentCartData.common.messages || {};
          scope.suggestedCoupons = currentCartData.suggestedCoupons || {};
        });
        scope.loadUserAddresses = function () {
          if (scope.processData.userId) {
            AjaxAPI.getData("Rbs/Geo/Address/", {
              userId: scope.processData.userId,
            }).then(
              function (result) {
                scope.userAddresses = result.data.items;
              },
              function () {
                scope.userAddresses = [];
              },
            );
          } else {
            scope.userAddresses = [];
          }
        };
        scope.getDefaultUserAddress = function (userAddresses) {
          var defaultUserAddress = null,
            address;
          var deliveryAddress = null;
          var returnAddress = null;
          var deliveries = scope.processEngine.getObjectData()["deliveries"];
          angular.forEach(deliveries, function (delivery) {
            if (
              (delivery.category === "atHome" ||
                delivery.category === "storeAtHome") &&
              !scope.isEmptyAddress(delivery.address) &&
              (scope.copyDeliveryToBillingAddress ||
                (!scope.copyDeliveryToBillingAddress &&
                  delivery.options.copyDeliveryToBillingChoice))
            ) {
              deliveryAddress = delivery.address;
            }
          });
          if (angular.isArray(userAddresses) && !defaultUserAddress) {
            for (var i = 0; i < userAddresses.length; i++) {
              address = userAddresses[i];
              if (address["default"]) {
                if (address["default"]["billing"]) {
                  defaultUserAddress = address;
                } else if (address["default"]["default"]) {
                  defaultUserAddress = address;
                }
              }
            }
          }
          if (!scope.copyDeliveryToBillingAddress && deliveryAddress) {
            returnAddress = deliveryAddress;
          } else if (defaultUserAddress) {
            returnAddress = defaultUserAddress;
          } else if (scope.copyDeliveryToBillingAddress && deliveryAddress) {
            returnAddress = deliveryAddress;
          }
          return returnAddress;
        };
        scope.isEmptyAddress = function (address) {
          if (angular.isObject(address) && !angular.isArray(address)) {
            if (
              address.fields &&
              address.fields.countryCode &&
              address.lines &&
              address.lines.length
            ) {
              return false;
            }
          }
          return true;
        };
        scope.$watchCollection("userAddresses", function (userAddresses) {
          if (angular.isArray(userAddresses)) {
            if (scope.isEmptyAddress(scope.processData.address)) {
              var defaultUserShippingAddress =
                scope.getDefaultUserAddress(userAddresses);
              if (defaultUserShippingAddress) {
                scope.selectUserAddress(defaultUserShippingAddress);
                return;
              }
              scope.editAddress();
            }
          }
        });
        scope.editAddress = function (currentAddress) {
          scope.processData.errors = [];
          scope.processData.addressEdition = true;
          scope.processData.addressEditionForm = !!currentAddress;
        };
        scope.newAddress = function () {
          scope.processData.address = {
            common: {
              addressFieldsId: scope.processData.address.common.addressFieldsId,
              useName:
                scope.precheckSaveAddress &&
                (scope.processData.userId || scope.accountRequest),
            },
            fields: {
              countryCode: scope.processData.address.fields.countryCode,
            },
            lines: [],
          };
          scope.processData.addressEditionForm = true;
        };
        scope.selectUserAddress = function (address) {
          scope.processData.address = angular.copy(address);
          scope.processData.addressEdition = false;
          scope.processData.addressEditionForm = false;
        };
        scope.useAddress = function () {
          var address = angular.copy(scope.processData.address);
          scope.processEngine.loading(true);
          if (
            scope.processData.userId &&
            address.common &&
            address.common["useName"] &&
            address.common.name
          ) {
            address.default = { default: true, billing: true };
            angular.forEach(scope.userAddresses, function (userAddress) {
              if (userAddress.default) {
                if (userAddress.default.default) {
                  delete address.default.default;
                }
                if (userAddress.default.billing) {
                  delete address.default.billing;
                }
              }
            });
            AjaxAPI.postData("Rbs/Geo/Address/", address).then(
              function (result) {
                var addedAddress = result.data.dataSets;
                scope.userAddresses.push(addedAddress);
                scope.selectUserAddress(addedAddress);
                scope.processEngine.loading(false);
              },
              function (result) {
                console.log("useAddress error", result);
                scope.processEngine.loading(false);
              },
            );
          } else {
            AjaxAPI.postData("Rbs/Geo/ValidateAddress", {
              address: address,
            }).then(
              function (result) {
                scope.selectUserAddress(result.data.dataSets.address);
                scope.processEngine.loading(false);
              },
              function (result) {
                console.log("validateAddress error", result);
                scope.processEngine.loading(false);
              },
            );
          }
        };
        scope.addCoupon = function () {
          return doAddCoupon(scope.processData.newCouponCode);
        };
        scope.addSuggestion = function (coupon) {
          return doAddCoupon(coupon.code);
        };
        scope.submitCoupon = function (event) {
          if (
            event !== undefined &&
            event.keyCode === 13 &&
            scope.processData.newCouponCode
          ) {
            scope.addCoupon();
          }
        };
        function doAddCoupon(code) {
          var coupons = angular.copy(scope.processData.coupons);
          coupons.push({ code: code });
          var actions = { setCoupons: coupons };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(
              function () {
                scope.processData.errors = [];
                var cartData = scope.processEngine.getObjectData();
                refreshAmounts(cartData);
                scope.processData.coupons = cartData["coupons"];
                scope.processData.couponsNotFound = coupons.filter(
                  function (val) {
                    for (var i in cartData.updated.setCoupons) {
                      if (
                        cartData.updated.setCoupons.hasOwnProperty(i) &&
                        val.code.toLowerCase() ===
                          cartData.updated.setCoupons[i].code.toLowerCase()
                      ) {
                        return false;
                      }
                    }
                    return true;
                  },
                );
                if (!scope.processData.couponsNotFound.length) {
                  scope.processData.newCouponCode = null;
                }
              },
              function (result) {
                console.error("addCoupon", result);
              },
            );
          } else {
            var cartData = scope.processEngine.getObjectData();
            refreshAmounts(cartData);
            scope.processData.coupons = cartData["coupons"];
          }
          return request;
        }
        scope.removeCoupon = function (couponIndex) {
          var coupons = [];
          angular.forEach(scope.processData.coupons, function (coupon, i) {
            if (i != couponIndex) {
              coupons.push(coupon);
            }
          });
          var actions = { setCoupons: coupons };
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(
              function () {
                var cartData = scope.processEngine.getObjectData();
                refreshAmounts(cartData);
                scope.processData.coupons = cartData["coupons"];
                scope.processData.errors = [];
              },
              function (result) {
                console.error("removeCoupon", result);
              },
            );
          } else {
            var cartData = scope.processEngine.getObjectData();
            refreshAmounts(cartData);
            scope.processData.coupons = cartData["coupons"];
          }
          return request;
        };
        scope.cleanupAddress = function (address) {
          if (address) {
            if (address.common) {
              address.common = {
                addressFieldsId: address.common.addressFieldsId,
              };
            }
            if (address.default) {
              delete address.default;
            }
          }
          return address;
        };
        scope.savePaymentDisabled = function () {
          return (
            scope.processData.addressEdition ||
            scope.processData.errors.length ||
            scope.isEmptyAddress(scope.processData.address) ||
            (scope.processData.requireTokenValidation &&
              scope.processData.requireMobilePhone)
          );
        };
        scope.savePayment = function () {
          var actions = {
            setCoupons: scope.processData.coupons,
            setAddress: scope.processData.address,
          };
          if (scope.processData.hasOwnProperty("invoice")) {
            actions.updateContext = { invoice: scope.processData.invoice };
          }
          var request = scope.processEngine.updateObjectData(actions);
          if (request) {
            request.then(
              function () {
                refreshAmounts(scope.processEngine.getObjectData());
                scope.makePayment();
              },
              function (result) {
                console.log("savePayment error", result);
              },
            );
          } else {
            refreshAmounts(scope.processEngine.getObjectData());
            scope.makePayment();
          }
        };
        scope.makePayment = function () {
          scope.processEngine.loading(true);
          scope.processData.errors = [];
          var options = {};
          var params = {
            visualFormats: scope.processEngine.parameters("imageFormats"),
          };
          scope.$emit("analytics", options);
          AjaxAPI.postData(
            "Rbs/Commerce/Payment/",
            { options: options },
            params,
          ).then(
            function (result) {
              scope.processEngine.lockProcess(true);
              var cartData = scope.processEngine.getObjectData();
              cartData.processData.locked = true;
              $rootScope.$broadcast("rbsRefreshCart", { cart: cartData });
              scope.transactions = result.data.dataSets.transactions || [];
              scope.paymentInfo = result.data.dataSets.common || {};
              scope.$emit("analytics", {
                category: "process",
                action: "setCurrentStep",
                label: "paymentConnectorSelect",
                value: scope.paymentInfo.paymentAmount,
              });
              scope.processEngine.loading(false);
            },
            function (result) {
              console.error("makePayment", result);
              if (result.status == 409 && result.data && result.data.data) {
                angular.forEach(result.data.data, function (error) {
                  scope.processData.errors.push(error.message);
                });
              }
              scope.transactions = [];
              scope.processEngine.loading(false);
            },
          );
        };
        function refreshAmounts(cartData) {
          var common = cartData.common;
          scope.displayTaxDetail = cartData.process.common.displayTaxDetail;
          scope.currencyCode = common.currencyCode;
          scope.totalAmount = common.totalAmount;
          scope.totalTaxesAmount = common.totalTaxesAmount;
          scope.totalTaxes = common.totalTaxes;
          scope.paymentAmount = common.paymentAmount;
          scope.creditNotesAmount = common.creditNotesAmount;
          scope.creditNotesClosestExpiryDate =
            common.creditNotesClosestExpiryDate;
        }
        function processTransaction(transaction, connector) {
          var transactionId = transaction.transactionId;
          var data = {
            connectorId: connector.common.id,
            cartIdentifier: scope.cartIdentifier || "",
          };
          var url = "Rbs/Commerce/Transaction/" + transactionId + "/processing";
          return AjaxAPI.putData(url, data);
        }
        scope.cancelPayment = function () {
          var promise = cancelPayment(scope.processEngine, $rootScope, AjaxAPI);
          promise.then(
            function (result) {
              scope.transactions = result.data.dataSets.transactions || [];
              scope.paymentInfo = result.data.dataSets.common || {};
            },
            function () {},
          );
          return promise;
        };
        function confirmPayment() {
          var data = {};
          var url = "Rbs/Commerce/Payment/finalise";
          scope.processEngine.loading(true);
          return AjaxAPI.putData(url, data).then(
            function (result) {
              scope.processing = true;
              scope.transactions = result.data.dataSets.transactions || [];
              scope.paymentInfo = result.data.dataSets.common || {};
              if (scope.paymentInfo.redirectURL) {
                window.location.assign(scope.paymentInfo.redirectURL);
              } else {
                window.location.reload(true);
              }
            },
            function () {
              window.location.reload(true);
            },
          );
        }
        scope.confirmPayment = confirmPayment;
        function initializeProcessData() {
          refreshAmounts(currentCartData);
          scope.processData.processTransaction = processTransaction;
          scope.processData.processId = currentCartData.process.common.id;
          scope.processData.requireMobilePhone =
            (currentCartData.processData.capabilities.allowMobilePhone &&
              currentCartData.processData.hasStoreDelivery) ||
            false;
          if (currentCartData && currentCartData.customer) {
            scope.processData.userId = currentCartData.customer.userId;
            scope.processData.address = currentCartData.customer.billingAddress;
            if (currentCartData.customer.options) {
              scope.accountRequest =
                currentCartData.customer.options.accountRequest;
              scope.processData.requireTokenValidation =
                !!currentCartData.customer.options.mobilePhoneRequestId;
            }
          }
          if (!scope.processData.address) {
            scope.processData.address = { common: {}, fields: {} };
          }
          scope.processData.coupons = currentCartData.coupons;
          if (currentCartData.processData.locked) {
            scope.makePayment();
          } else {
            scope.loadUserAddresses();
          }
        }
        initializeProcessData();
      },
    };
  }
  app.directive("rbsCommercePaymentStepTransaction", [
    "$timeout",
    rbsCommercePaymentStepTransaction,
  ]);
  function rbsCommercePaymentStepTransaction($timeout) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-payment-step-transaction.twig",
      scope: true,
      link: function (scope, elem) {
        if (!scope.transaction || !scope.transaction.connectors) {
          return;
        }
        scope.selectConnector = function (connector) {
          var linesContainer = elem.find(
            '[data-role="connector-configuration-zone"]',
          );
          if (!connector) {
            scope.processData.id = 0;
            scope.selectedConnector = null;
            scope.processEngine.replaceChildren(linesContainer, scope, null);
            return;
          }
          scope.processData.id = connector.common.id;
          scope.selectedConnector = connector;
          var html = [];
          html.push("<div data-" + connector.transaction.directiveName + '=""');
          html.push(' data-process-data="processData"');
          html.push(' data-transaction="transaction"');
          html.push(' data-connector-configuration="selectedConnector"');
          html.push(' data-connector-info="selectedConnector"');
          html.push("></div>");
          scope.processEngine.replaceChildren(
            linesContainer,
            scope,
            html.join(""),
          );
        };
        $timeout(function () {
          var selected = false;
          if (scope.transaction.connectors.length === 1) {
            scope.selectConnector(scope.transaction.connectors[0]);
            selected = true;
          } else if (scope.processData.id) {
            angular.forEach(scope.transaction.connectors, function (connector) {
              if (scope.processData.id === connector.common.id) {
                scope.selectConnector(connector);
                selected = true;
              }
            });
          }
          if (!selected && scope.transaction.connectors.length) {
            scope.selectConnector(scope.transaction.connectors[0]);
          }
        });
      },
    };
  }
  app.directive(
    "rbsCommerceInvoiceConfiguration",
    rbsCommerceInvoiceConfiguration,
  );
  function rbsCommerceInvoiceConfiguration() {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-invoice-configuration.twig",
      link: function (scope) {
        var objectData = scope.processEngine.getObjectData();
        scope.invoiceGenerationMode =
          objectData && objectData.process
            ? objectData.process.invoiceGenerationMode
            : "auto";
        if (scope.invoiceGenerationMode === "checkout" && scope.processData) {
          if (!scope.processData.hasOwnProperty("invoice")) {
            if (objectData.options.invoice) {
              scope.processData.invoice = objectData.options.invoice;
            } else {
              scope.processData.invoice = { generate: false };
            }
          }
        }
        scope.generateInvoiceDisabled = function () {
          return scope.paymentInfo.started;
        };
      },
    };
  }
  app.directive("rbsCommerceConfirmStep", [
    "RbsChange.AjaxAPI",
    "$window",
    rbsCommerceConfirmStep,
  ]);
  function rbsCommerceConfirmStep(AjaxAPI, $window) {
    return {
      restrict: "A",
      templateUrl: "/rbs-commerce-confirm-step.twig",
      scope: { processEngine: "=" },
      link: function (scope) {
        scope.processData = scope.processEngine.getStepProcessData("confirm");
        var cartData = scope.processEngine.getObjectData();
        var customer = cartData.customer;
        scope.processData.requireTokenValidation = !!(
          customer.options && customer.options.mobilePhoneRequestId
        );
        scope.$on("objectDataUpdated", function (event, cartData) {
          var customer = cartData.customer;
          scope.processData.requireTokenValidation = !!(
            customer.options && customer.options.mobilePhoneRequestId
          );
        });
        scope.canSendReservation = function () {
          return (
            !scope.processData.requireTokenValidation &&
            !cartData.processData.errors.length
          );
        };
        scope.sendReservation = function () {
          scope.processEngine.loading(true);
          var targetIdentifier =
            scope.processEngine.getObjectData().common.identifier;
          AjaxAPI.postData("Rbs/Commerce/Cart/Reservation", {}, {}).then(
            function (result) {
              var dataSets = result.data.dataSets;
              if (dataSets && dataSets.common && dataSets.common.redirectURL) {
                $window.location = dataSets.common.redirectURL;
              } else {
                $window.location.search =
                  "?targetIdentifier=" + targetIdentifier;
              }
            },
            function () {
              scope.processEngine.loading(false);
            },
          );
        };
      },
    };
  }
  function cancelPayment(processEngine, $rootScope, AjaxAPI) {
    var data = {};
    var url = "Rbs/Commerce/Payment/cancel";
    processEngine.loading(true);
    var promise = AjaxAPI.putData(url, data);
    promise.then(
      function () {
        processEngine.lockProcess(false);
        var cartData = processEngine.getObjectData();
        cartData.processData.locked = false;
        $rootScope.$broadcast("rbsRefreshCart", { cart: cartData });
        processEngine.loading(false);
      },
      function (error) {
        console.error(error);
        processEngine.loading(false);
      },
    );
    return promise;
  }
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommerceSidebarProcess", function () {
    return {
      restrict: "A",
      link: function (scope, element) {
        var offset = element.offset();
        var container = angular.element(
          document.querySelector('[data-name="Rbs_Commerce_OrderProcess"]'),
        );
        var bodyHeight = angular
          .element(document.querySelector("body"))
          .prop("offsetHeight");
        scope.offsetTopPosition = offset.top - 60;
        scope.offsetBottomPosition =
          bodyHeight - element.height() - container.height();
      },
    };
  });
  jQuery(function () {
    var menu = jQuery(".process-menu");
    var parent = menu.parent();
    function resize() {
      menu.width(parent.width());
    }
    menu.on("affixed.bs.affix", function () {
      jQuery(window).resize(resize);
      resize();
    });
  });
})(window.jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommerceTopMenuProcess", function () {
    return {
      restrict: "A",
      link: function (scope, element) {
        var offset = element.offset();
        scope.offsetTopPosition = offset.top;
        var processTopMenu = element.find(".process-top-menu");
        if (processTopMenu) {
          scope.topMenuHeight = processTopMenu.height();
        }
      },
    };
  });
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCommerceCreateAccount", rbsCommerceCreateAccount);
  function rbsCommerceCreateAccount() {
    return {
      restrict: "A",
      require: "rbsUserCreateAccount",
      link: function (scope, elem, attrs, createAccountController) {
        var data = createAccountController.getData();
        if (attrs.hasOwnProperty("transactionId")) {
          data.transactionId = parseInt(attrs.transactionId);
        }
        if (attrs.hasOwnProperty("cartIdentifier")) {
          data.cartIdentifier = attrs.cartIdentifier;
        }
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsUserPasswordToggle", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-password-toggle.twig",
      transclude: true,
      scope: { enabled: "<rbsUserPasswordToggle" },
      link: function (scope, elem, attrs, ctrl, transclude) {
        transclude(function (clone) {
          if (clone.length) {
            elem.find(".transclude").replaceWith(clone);
          } else {
            elem.find(".transclude").remove();
          }
        });
        if (scope.enabled) {
          var field = elem.find("input[type='password']");
          scope.visible = false;
          scope.toggle = function () {
            scope.visible = !scope.visible;
            field.attr("type", scope.visible ? "text" : "password");
          };
        }
      },
    };
  });
  app.directive("rbsUserForgotPassword", [
    "RbsChange.AjaxAPI",
    rbsUserForgotPassword,
  ]);
  function rbsUserForgotPassword(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-forgot-password.twig",
      link: function (scope) {
        function createResetPasswordRequest(data) {
          scope.passwordError = null;
          scope.sending = true;
          AjaxAPI.postData("Rbs/User/User/ResetPasswordRequest", data).then(
            function () {
              scope.sending = false;
              scope.successSending = true;
            },
            function (result) {
              scope.sending = false;
              scope.successSending = false;
              scope.passwordError =
                result && result.data && result.data.message;
              console.error("rbsUserCreateAccount", result);
            },
          );
        }
        scope.diplayResetBox = false;
        scope.sending = false;
        scope.successSending = false;
        scope.resetPasswordEmail = null;
        scope.passwordError = null;
        scope.openBox = function () {
          jQuery("#reset-password-modal-main-content").modal({});
        };
        scope.invalidMail = function () {
          return !scope.resetPasswordEmail || scope.resetPasswordEmail == "";
        };
        scope.askReset = function () {
          createResetPasswordRequest({ email: scope.resetPasswordEmail });
        };
      },
    };
  }
  app.directive("rbsUserShortAccount", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "$window",
    "RbsChange.ResponsiveSummaries",
    rbsUserShortAccount,
  ]);
  function rbsUserShortAccount(
    $rootScope,
    AjaxAPI,
    window,
    ResponsiveSummaries,
  ) {
    return {
      restrict: "A",
      link: function (scope) {
        var blockId = scope.blockId;
        var blockData = scope.blockData;
        scope.parameters = scope.blockParameters;
        scope.accessorId = scope.parameters.accessorId;
        scope.accessorName = scope.parameters.accessorName;
        if (blockData) {
          scope.userAccountPageUrl = blockData.userAccountPageUrl;
          scope.rootMenuEntry = blockData.rootMenuEntry;
        }
        $rootScope.$on("rbsUserConnected", function (event, params) {
          scope.accessorId = params["accessorId"];
          scope.accessorName = params["accessorName"];
        });
        $rootScope.$on("rbsUserProfileUpdated", function (event, params) {
          var fullName = params["profile"]["profiles"]["Rbs_User"]["fullName"];
          if (fullName) {
            scope.accessorId = params["userId"];
            scope.accessorName = fullName;
          }
        });
        scope.logout = function () {
          AjaxAPI.getData("Rbs/User/Logout").then(
            function () {
              localStorage.setItem(
                "PROXIMIS_FRONT_LOGOUT",
                Date.now().toString(),
              );
              window.location.reload(true);
            },
            function (result) {
              scope.error = result.data.message;
              console.log("logout error", result);
            },
          );
        };
        ResponsiveSummaries.registerItem(
          blockId,
          scope,
          '<li data-rbs-user-short-account-responsive-summary=""></li>',
        );
      },
    };
  }
  app.directive("rbsUserShortAccountResponsiveSummary", [
    "RbsChange.ModalStack",
    rbsUserShortAccountResponsiveSummary,
  ]);
  function rbsUserShortAccountResponsiveSummary(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-short-account-responsive-summary.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          var options = {
            templateUrl:
              "/rbs-user-short-account-responsive-summary-modal.twig",
            backdropClass:
              "modal-backdrop-rbs-user-short-account-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-rbs-user-short-account-responsive-summary",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
  app.directive("rbsUserUniqueEmail", [
    "$q",
    "RbsChange.AjaxAPI",
    rbsUserUniqueEmail,
  ]);
  function rbsUserUniqueEmail($q, AjaxAPI) {
    return {
      require: "ngModel",
      link: function (scope, element, attributes, ngModel) {
        var lastValid;
        ngModel.$asyncValidators.uniqueEmail = function (
          modelValue,
          viewValue,
        ) {
          if (viewValue && viewValue.length && viewValue !== lastValid) {
            return AjaxAPI.getData("Rbs/User/CheckEmailAvailability", {
              email: viewValue,
            }).then(
              function (result) {
                lastValid = result.data.dataSets.user["availableEmail"];
              },
              function (result) {
                lastValid = undefined;
                if (
                  result.status === 409 &&
                  result.data &&
                  result.data.message &&
                  result.data.code
                ) {
                  ngModel.errorMessage = result.data.message;
                  ngModel.errorCode = result.data.code;
                  return $q.reject("uniqueEmail");
                } else {
                  console.error(result);
                }
              },
            );
          }
          var deferred = $q.defer();
          deferred.resolve(true);
          return deferred.promise;
        };
      },
    };
  }
  app.directive("rbsUserManageAutoLogin", [
    "RbsChange.AjaxAPI",
    rbsUserManageAutoLogin,
  ]);
  function rbsUserManageAutoLogin(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-manage-auto-login.twig",
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.tokens = scope.blockData;
        },
      ],
      link: function (scope) {
        scope.errors = null;
        scope.deleteToken = function (index) {
          var data = { tokenId: scope.tokens[index].id };
          AjaxAPI.openWaitingModal();
          scope.errors = null;
          AjaxAPI.deleteData("Rbs/User/RevokeToken", data).then(
            function () {
              AjaxAPI.closeWaitingModal();
              scope.tokens.splice(index, 1);
              scope.errors = null;
              if (scope.tokens.length === 0) {
                scope.tokens = null;
              }
            },
            function (result) {
              AjaxAPI.closeWaitingModal();
              console.log("deleteToken error", result);
            },
          );
        };
      },
    };
  }
  app.directive("rbsUserLogin", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    "$window",
    rbsUserLogin,
  ]);
  function rbsUserLogin(AjaxAPI, $rootScope, window) {
    function buildDevice() {
      var parser = new UAParser();
      var ua = parser.getResult();
      return ua.browser.name + " - " + ua.os.name;
    }
    return {
      restrict: "A",
      templateUrl: "/rbs-user-login.twig",
      scope: false,
      controller: [
        "$scope",
        function (scope) {
          scope.error = null;
          scope.parameters = scope.blockParameters;
          scope.data = {
            login: null,
            password: null,
            realm: scope.parameters.realm,
            rememberMe: true,
            device: buildDevice(),
          };
          this.getData = function () {
            return scope.data;
          };
          this.login = function (loginData) {
            scope.error = null;
            AjaxAPI.putData("Rbs/User/Login", loginData).then(
              function (result) {
                var user = result.data.dataSets.user;
                scope.parameters.accessorId = user.accessorId;
                scope.parameters.accessorName = user.name;
                var onLogin =
                  scope.blockData["onLogin"] || scope.parameters["onLogin"];
                if (onLogin === "reload") {
                  window.location.reload(true);
                } else if (onLogin === "redirectToTarget") {
                  window.location =
                    scope.blockData["redirectionUrl"] ||
                    scope.parameters["redirectionUrl"];
                } else {
                  var params = {
                    accessorId: user.accessorId,
                    accessorName: user.name,
                  };
                  $rootScope.$broadcast("rbsUserConnected", params);
                }
              },
              function (result) {
                scope.error = result.data.message;
                scope.parameters.password = scope.parameters.login = null;
                console.log("login error", result);
              },
            );
          };
          this.logout = function () {
            AjaxAPI.getData("Rbs/User/Logout").then(
              function () {
                localStorage.setItem(
                  "PROXIMIS_FRONT_LOGOUT",
                  Date.now().toString(),
                );
                window.location.reload(true);
              },
              function (result) {
                scope.error = result.data.message;
                console.log("logout error", result);
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showTitle = attrs["showTitle"] !== "false";
        scope.login = function () {
          controller.login(scope.data);
        };
        scope.logout = function () {
          controller.logout();
        };
      },
    };
  }
  app.directive("rbsUserCreateAccount", [
    "RbsChange.AjaxAPI",
    rbsUserCreateAccount,
  ]);
  function rbsUserCreateAccount(AjaxAPI) {
    function buildDevice() {
      var parser = new UAParser();
      var ua = parser.getResult();
      return ua.browser.name + " - " + ua.os.name;
    }
    return {
      restrict: "A",
      templateUrl: "/rbs-user-create-account.twig",
      scope: false,
      controllerAs: "createAccountController",
      controller: [
        "$scope",
        "$element",
        "$attrs",
        function (scope, elem, attrs) {
          scope.parameters = scope.blockParameters;
          scope.hideTitle = attrs.hideTitle === "true";
          scope.ignoreExistingRequest = attrs.ignoreExistingRequest === "true";
          scope.fixedEmail = attrs.fixedEmail;
          scope.confirmationPage = scope.parameters.confirmationPage
            ? parseInt(scope.parameters.confirmationPage)
            : 0;
          scope.handleNewsletter = scope.parameters.handleNewsletter;
          scope.customerFields = scope.parameters.customerFields;
          scope.allowedTitles = scope.parameters.allowedTitles;
          if (scope.parameters.socialEmail) {
            scope.fixedEmail = scope.parameters.socialEmail;
          }
          scope.data = {
            email: scope.fixedEmail ? scope.fixedEmail : null,
            password: null,
            confirmationPage: scope.confirmationPage,
          };
          scope.profiles = scope.blockData
            ? scope.blockData.profiles || {}
            : {};
          this.getData = function () {
            return scope.data;
          };
          this.checkAccountRequest = function (data) {
            scope.requestAccountCreated = true;
            scope.error = null;
            scope.errors = null;
            var request = AjaxAPI.getData("Rbs/User/User/AccountRequest", data);
            request.then(
              function (result) {
                scope.requestAccountCreated =
                  result.data.dataSets &&
                  result.data.dataSets.common &&
                  result.data.dataSets.common.hasRequest;
              },
              function () {
                scope.requestAccountCreated = false;
              },
            );
            return request;
          };
          this.createAccountRequest = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            scope.errors = null;
            var request = AjaxAPI.postData(
              "Rbs/User/User/AccountRequest",
              data,
            );
            request.then(
              function (result) {
                delete data.password;
                scope.requestAccountCreated = true;
                if (result.data.dataSets.accountConfirmed) {
                  scope.accountConfirmed = true;
                }
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                  scope.errors = (result.data.data &&
                    result.data.data.errorMessages) || [result.data.message];
                }
                console.error("createAccountRequest", result);
                scope.requestAccountCreated = false;
                AjaxAPI.closeWaitingModal();
              },
            );
            return request;
          };
          this.confirmAccountRequest = function (data) {
            var request = AjaxAPI.putData("Rbs/User/User/AccountRequest", data);
            AjaxAPI.openWaitingModal();
            scope.error = null;
            scope.errors = null;
            request.then(
              function (result) {
                if (
                  result.data &&
                  result.data.dataSets &&
                  result.data.dataSets.confirmationPage
                ) {
                  window.location.href =
                    result.data.dataSets.confirmationPage.url;
                } else {
                  scope.accountConfirmed = true;
                  scope.parameters.socialRequestAccountCreated = false;
                  AjaxAPI.closeWaitingModal();
                }
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                  scope.errors = (result.data.data &&
                    result.data.data.errorMessages) || [result.data.message];
                }
                console.error("rbsUserConfirmAccount", result);
                scope.accountConfirmed = true;
                AjaxAPI.closeWaitingModal();
              },
            );
            return request;
          };
          this.initMailingLists = function () {
            scope.error = null;
            scope.errors = null;
            var request = AjaxAPI.getData("Rbs/Mailinglist/GetMailingLists", {
              transactionId: scope.blockParameters.transactionId,
              mailingListsIds: scope.blockParameters.displayedMailinglists,
            });
            request.then(
              function (result) {
                scope.mailingLists = result.data.dataSets.mailingLists;
                scope.data.profileData = result.data.dataSets.profileData;
                scope.data.device = buildDevice();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                  scope.errors = (result.data.data &&
                    result.data.data.errorMessages) || [result.data.message];
                }
                console.error("GetMailingLists", result);
                scope.handleNewsletter = false;
              },
            );
            return request;
          };
          if (scope.parameters.token && scope.parameters.email) {
            this.confirmAccountRequest({
              token: scope.parameters.token,
              email: scope.parameters.email,
              confirmationPage: scope.data.confirmationPage,
            });
          }
          if (scope.handleNewsletter && !scope.parameters.token) {
            this.initMailingLists();
          }
          if (scope.data.email && !scope.ignoreExistingRequest) {
            this.checkAccountRequest(scope.data);
          }
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showCreationForm = function () {
          return !scope.requestAccountCreated && !scope.parameters.token;
        };
        scope.showConfirmationForm = function () {
          return (
            (scope.requestAccountCreated && !scope.accountConfirmed) ||
            (scope.accountConfirmed && scope.error)
          );
        };
        scope.submit = function () {
          scope.data.profiles = scope.profiles;
          scope.data.profileData = scope.profiles.Rbs_User || {};
          controller.createAccountRequest(scope.data);
        };
      },
    };
  }
  app.controller("RbsUserFinalizeAccountController", [
    "$scope",
    "$element",
    "RbsChange.AjaxAPI",
    RbsUserFinalizeAccountController,
  ]);
  function RbsUserFinalizeAccountController(scope, elem, AjaxAPI) {
    scope.parameters = scope.blockParameters;
    scope.data = {
      token: scope.parameters.token,
      email: scope.parameters.email,
      password: null,
      confirmationPage: scope.parameters.confirmationPage
        ? parseInt(scope.parameters.confirmationPage)
        : 0,
    };
    scope.submit = function () {
      var request = AjaxAPI.putData(
        "Rbs/User/User/AccountSuggestion",
        scope.data,
      );
      AjaxAPI.openWaitingModal();
      scope.error = null;
      request.then(
        function (result) {
          if (
            result.data &&
            result.data.dataSets &&
            result.data.dataSets.confirmationPage
          ) {
            window.location.href = result.data.dataSets.confirmationPage.url;
          } else {
            scope.accountConfirmed = true;
            AjaxAPI.closeWaitingModal();
          }
        },
        function (result) {
          if (result.data && result.data.message) {
            scope.error = result.data.message;
          }
          console.error("rbsUserConfirmAccount", result);
          scope.accountConfirmed = true;
          AjaxAPI.closeWaitingModal();
        },
      );
      return request;
    };
  }
  app.directive("rbsUserGenericFields", rbsUserGenericFields);
  function rbsUserGenericFields() {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-generic-fields.twig",
      link: function (scope) {
        scope.displayTitleCode = true;
      },
    };
  }
  app.directive("rbsUserChangeEmail", [
    "$rootScope",
    "$location",
    "RbsChange.AjaxAPI",
    rbsUserChangeEmail,
  ]);
  function rbsUserChangeEmail($rootScope, $location, AjaxAPI) {
    return {
      restrict: "A",
      scope: false,
      controllerAs: "changeEmailController",
      controller: [
        "$rootScope",
        "$scope",
        "$attrs",
        function ($rootScope, scope, attrs) {
          scope.data = {
            password: null,
            email: null,
            confirmationUrl: attrs.confirmationUrl || $location.absUrl(),
          };
          $rootScope.$on("isPasswordRequired", function (event, value) {
            scope.blockParameters.isPasswordRequired = value;
          });
          this.getData = function () {
            return scope.data;
          };
          this.createChangeEmailRequest = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            AjaxAPI.postData("Rbs/User/User/ChangeEmail", data).then(
              function () {
                delete data.password;
                delete data.confirmationUrl;
                scope.requestEmailCreated = true;
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("rbsUserChangeEmail - request creation", result);
                scope.requestEmailCreated = false;
                AjaxAPI.closeWaitingModal();
              },
            );
          };
          this.confirmChangeEmailRequest = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            AjaxAPI.putData("Rbs/User/User/ChangeEmail", data).then(
              function () {
                scope.emailConfirmed = true;
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error(
                  "rbsUserChangeEmail - request confirmation",
                  result,
                );
                scope.emailConfirmed = true;
                AjaxAPI.closeWaitingModal();
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.authenticated = scope.blockParameters.authenticated;
        scope.showTitle = scope.blockParameters.showTitle;
        if (scope.blockParameters.token && scope.blockParameters.email) {
          controller.confirmChangeEmailRequest({
            token: scope.blockParameters.token,
            email: scope.blockParameters.email,
          });
        }
        scope.showCreationForm = function () {
          return (
            scope.authenticated &&
            !scope.requestEmailCreated &&
            !scope.blockParameters.token
          );
        };
        scope.showConfirmationForm = function () {
          return (
            (scope.requestEmailCreated && !scope.emailConfirmed) ||
            (scope.emailConfirmed && scope.error)
          );
        };
      },
    };
  }
  app.directive("rbsUserChangeMobilePhone", [
    "RbsChange.AjaxAPI",
    rbsUserChangeMobilePhone,
  ]);
  function rbsUserChangeMobilePhone(AjaxAPI) {
    return {
      restrict: "A",
      controllerAs: "changeMobilePhoneController",
      controller: [
        "$rootScope",
        "$scope",
        function ($rootScope, scope) {
          scope.inputNumber = true;
          scope.confirmNumber = false;
          scope.success = false;
          scope.data = {
            password: null,
            mobilePhone: null,
            tokenValidation: null,
          };
          $rootScope.$on("isPasswordRequired", function (event, value) {
            scope.blockParameters.isPasswordRequired = value;
          });
          this.getData = function () {
            return scope.data;
          };
          this.changeMobilePhoneNumber = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            scope.success = false;
            AjaxAPI.postData(
              "Rbs/User/User/ChangeMobilePhoneNumber",
              data,
            ).then(
              function (result) {
                delete scope.data.password;
                if (result.data.dataSets.common.id) {
                  scope.inputNumber = false;
                  scope.confirmNumber = true;
                } else {
                  scope.success = true;
                }
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("ChangeMobilePhoneNumber", result);
                AjaxAPI.closeWaitingModal();
              },
            );
          };
          this.confirmMobilePhoneNumber = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            scope.success = false;
            AjaxAPI.putData("Rbs/User/User/ChangeMobilePhoneNumber", data).then(
              function () {
                delete scope.data.password;
                delete scope.data.tokenValidation;
                scope.inputNumber = true;
                scope.confirmNumber = false;
                scope.success = true;
                AjaxAPI.closeWaitingModal();
              },
              function (result) {
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("ChangeMobilePhoneNumber", result);
                AjaxAPI.closeWaitingModal();
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showTitle = scope.blockParameters.showTitle;
        scope.submit = function () {
          if (scope.inputNumber) {
            if (scope.data.mobilePhone) {
              controller.changeMobilePhoneNumber(scope.data);
            }
          }
          if (scope.confirmNumber) {
            if (scope.data.tokenValidation) {
              controller.confirmMobilePhoneNumber(scope.data);
            }
          }
        };
      },
    };
  }
  app.directive("rbsUserResetPassword", [
    "RbsChange.AjaxAPI",
    rbsUserResetPassword,
  ]);
  function rbsUserResetPassword(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-reset-password.twig",
      scope: false,
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.data = {
            token: scope.parameters.token ? scope.parameters.token : null,
            password: null,
          };
          this.getData = function () {
            return scope.data;
          };
          this.confirmResetPassword = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            AjaxAPI.putData("Rbs/User/User/ResetPasswordRequest", data).then(
              function () {
                AjaxAPI.closeWaitingModal();
                scope.passwordConfirmed = true;
              },
              function (result) {
                AjaxAPI.closeWaitingModal();
                scope.passwordConfirmed = false;
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("rbsUserResetPassword", result);
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showTitle = scope.parameters.showTitle;
        scope.showForm = function () {
          return scope.data.token && !scope.passwordConfirmed;
        };
        scope.submit = function () {
          controller.confirmResetPassword(scope.data);
        };
      },
    };
  }
  app.directive("rbsUserChangePassword", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "$timeout",
    rbsUserChangePassword,
  ]);
  function rbsUserChangePassword($rootScope, AjaxAPI, timeout) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-change-password.twig",
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.data = { currentPassword: null, password: null };
          $rootScope.$on("isPasswordRequired", function (event, value) {
            scope.parameters.isPasswordRequired = value;
          });
          this.getData = function () {
            return scope.data;
          };
          this.changePassword = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            AjaxAPI.putData("Rbs/User/User/ChangePassword", data).then(
              function () {
                AjaxAPI.closeWaitingModal();
                scope.passwordConfirmed = true;
                scope.data = { currentPassword: null, password: null };
                scope.confirmPassword = null;
                if (!scope.parameters.isPasswordRequired) {
                  $rootScope.$emit("isPasswordRequired", true);
                }
                if (angular.isObject(scope.rbsUserChangePassword)) {
                  scope.rbsUserChangePassword.$setPristine();
                  scope.rbsUserChangePassword.$setUntouched();
                }
              },
              function (result) {
                AjaxAPI.closeWaitingModal();
                scope.passwordConfirmed = false;
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("changePassword", result);
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showTitle = scope.blockParameters.showTitle;
        scope.showForm = function () {
          return scope.parameters["authenticated"];
        };
        scope.submit = function () {
          controller.changePassword(scope.data);
        };
      },
    };
  }
  app.directive("rbsUserAccount", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    rbsUserAccount,
  ]);
  function rbsUserAccount(AjaxAPI, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-user-account.twig",
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.customerFields = scope.parameters.customerFields;
          scope.data = null;
          scope.profiles = {};
          if (scope.parameters.authenticated) {
            scope.parameters.authenticated = false;
            AjaxAPI.getData("Rbs/User/User/Profiles").then(function (result) {
              scope.parameters.authenticated = true;
              scope.data = result.data.dataSets;
              scope.profiles = scope.data.profiles;
              scope.allowedTitles = scope.profiles.Rbs_User.allowedTitles;
            });
          }
          this.saveProfiles = function (data) {
            AjaxAPI.openWaitingModal();
            scope.error = null;
            AjaxAPI.putData("Rbs/User/User/Profiles", data).then(
              function (result) {
                AjaxAPI.closeWaitingModal();
                scope.readonly = true;
                scope.success = true;
                scope.data = result.data.dataSets;
                scope.profiles = result.data.dataSets.profiles;
                var params = {
                  profile: scope.data,
                  userId: scope.data.common.id,
                };
                $rootScope.$broadcast("rbsUserProfileUpdated", params);
              },
              function (result) {
                AjaxAPI.closeWaitingModal();
                if (result.data && result.data.message) {
                  scope.error = result.data.message;
                }
                console.error("saveProfiles", result);
              },
            );
          };
        },
      ],
      link: function (scope, elm, attrs, controller) {
        scope.showTitle = attrs["showTitle"] !== "false";
        scope.success = false;
        scope.readonly = true;
        scope.openEdit = function () {
          scope.success = false;
          scope.readonly = false;
          scope.dataBackup = angular.copy(scope.data);
        };
        scope.saveAccount = function () {
          scope.data.profiles = scope.profiles;
          controller.saveProfiles(scope.data);
        };
        scope.cancelEdit = function () {
          scope.readonly = true;
          scope.data = scope.dataBackup;
          scope.profiles = scope.data.profiles;
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserChangeEmail", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.data = {};
      $rootScope.$on("isPasswordRequired", function (event, value) {
        parameters.isPasswordRequired = value;
        reloadBlock();
      });
      scope.createChangeEmailRequest = function () {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        var ajaxData = {
          password: scope.data.password,
          email: scope.data.email,
          confirmationUrl: attrs.confirmationUrl || $location.absUrl(),
        };
        AjaxAPI.postData("Rbs/User/User/ChangeEmail", ajaxData).then(
          function () {
            delete scope.data.password;
            parameters.requestCreated = true;
            reloadBlock(true);
            parameters.requestCreated = false;
            parameters.email = ajaxData.email;
          },
          function (result) {
            if (result.data && result.data.message) {
              scope.error = result.data.message;
            }
            console.error("rbsUserChangeEmail - request creation", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      scope.confirmChangeEmailRequest = function () {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        var ajaxData = { token: scope.data.token, email: parameters.email };
        AjaxAPI.putData("Rbs/User/User/ChangeEmail", ajaxData).then(
          function () {
            parameters.requestCreated = false;
            parameters.emailConfirmed = true;
            reloadBlock(true);
            parameters.emailConfirmed = false;
          },
          function (result) {
            if (result.data && result.data.message) {
              scope.error = result.data.message;
            }
            console.error("rbsUserChangeEmail - request confirmation", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      if (parameters.token && parameters.email) {
        scope.data.token = parameters.token;
        scope.confirmChangeEmailRequest();
      }
      function reloadBlock(closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error("[RbsUserChangeEmail] error reloading block:", error);
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserChangeMobilePhone", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      scope.data = { password: null, mobilePhone: null, tokenValidation: null };
      $rootScope.$on("isPasswordRequired", function (event, value) {
        parameters.isPasswordRequired = value;
        reloadBlock();
      });
      scope.submitRequest = function () {
        if (scope.data.mobilePhone) {
          AjaxAPI.openWaitingModal();
          scope.error = null;
          AjaxAPI.postData(
            "Rbs/User/User/ChangeMobilePhoneNumber",
            scope.data,
          ).then(
            function (result) {
              delete scope.data.password;
              if (result.data.dataSets.common.id) {
                parameters.mobilePhone = scope.data.mobilePhone;
                reloadBlock(true, "confirm");
              } else {
                reloadBlock(true, "success");
              }
            },
            function (result) {
              if (result.data && result.data.message) {
                scope.error = result.data.message;
              }
              console.error("ChangeMobilePhoneNumber", result);
              AjaxAPI.closeWaitingModal();
            },
          );
        }
      };
      scope.submitConfirmation = function () {
        if (scope.data.tokenValidation) {
          AjaxAPI.openWaitingModal();
          scope.error = null;
          AjaxAPI.putData(
            "Rbs/User/User/ChangeMobilePhoneNumber",
            scope.data,
          ).then(
            function () {
              delete scope.data.tokenValidation;
              reloadBlock(true, "success");
            },
            function (result) {
              if (result.data && result.data.message) {
                scope.error = result.data.message;
              }
              console.error("ChangeMobilePhoneNumber", result);
              AjaxAPI.closeWaitingModal();
            },
          );
        }
      };
      function reloadBlock(closeWaitingModal, processingStep) {
        parameters.processingStep = processingStep
          ? processingStep
          : parameters.processingStep;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsUserChangeMobilePhone] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserAccountShort", [
    "$scope",
    "$element",
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    "RbsChange.ResponsiveSummaries",
    function (
      scope,
      element,
      $rootScope,
      $compile,
      AjaxAPI,
      ResponsiveSummaries,
    ) {
      scope.logout = function () {
        AjaxAPI.getData("Rbs/User/Logout").then(
          function () {
            localStorage.setItem(
              "PROXIMIS_FRONT_LOGOUT",
              Date.now().toString(),
            );
            window.location.reload(true);
          },
          function (result) {
            scope.error = result.data.message;
            console.error("[" + scope.blockName + "] logout error", result);
          },
        );
      };
      $rootScope.$on("rbsUserConnected", function (event, params) {
        var reloadParams = angular.merge(scope.blockParameters, params);
        reloadBlock(reloadParams);
      });
      $rootScope.$on("rbsUserProfileUpdated", function (event, params) {
        var reloadParams = angular.copy(scope.blockParameters);
        reloadParams.accessorId = params.profile.common.id;
        var fullName = null;
        if (params.profile.profiles.Rbs_User) {
          fullName = params.profile.profiles.Rbs_User.fullName;
        }
        if (!fullName) {
          fullName = params.profile.common.login || params.profile.common.email;
        }
        reloadParams.accessorName = fullName;
        reloadBlock(reloadParams);
      });
      function reloadBlock(parameters) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            scope.accessorId = result.data.dataSets.parameters.accessorId;
            scope.accessorName = result.data.dataSets.parameters.accessorName;
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
          },
          function (error) {
            console.error(
              "[RbsUserAccountShort] error reloading block:",
              error,
            );
          },
        );
      }
      var blockData = scope.blockData;
      scope.parameters = scope.blockParameters;
      scope.accessorId = scope.parameters.accessorId;
      scope.accessorName = scope.parameters.accessorName;
      if (blockData) {
        scope.userAccountPageUrl = blockData.userAccountPageUrl;
        scope.rootMenuEntry = blockData.rootMenuEntry;
      }
      ResponsiveSummaries.registerItem(
        scope.blockId,
        scope,
        '<li data-rbs-user-short-account-responsive-summary=""></li>',
      );
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserManageAutoLoginToken", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.deleteToken = function (tokenId) {
        element.find(".error-message").addClass("hidden");
        AjaxAPI.openWaitingModal();
        AjaxAPI.deleteData("Rbs/User/RevokeToken", { tokenId: tokenId }).then(
          function () {
            AjaxAPI.reloadBlock(
              scope.blockName,
              scope.blockId,
              parameters,
              scope.blockNavigationContext,
            ).then(
              function (result) {
                element
                  .find(".token-list")
                  .html(
                    jQuery(jQuery.parseHTML(result.data.dataSets.html))
                      .filter(".token-list")
                      .html(),
                  );
                $compile(element.find(".token-list"))(scope);
                AjaxAPI.closeWaitingModal();
              },
              function (error) {
                console.error(
                  "[RbsUserManageAutoLoginToken] error reloading block:",
                  error,
                );
              },
            );
          },
          function (result) {
            element.find(".error-message").removeClass("hidden");
            AjaxAPI.closeWaitingModal();
            console.error(
              "[RbsUserManageAutoLoginToken] deleteToken error:",
              result,
            );
          },
        );
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserResetPassword", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.data = { token: parameters.token || null, password: null };
      scope.confirmResetPassword = function () {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        scope.errors = null;
        AjaxAPI.putData("Rbs/User/User/ResetPasswordRequest", scope.data).then(
          function () {
            delete scope.data.password;
            parameters.passwordConfirmed = true;
            reloadBlock(true);
            parameters.passwordConfirmed = false;
          },
          function (result) {
            if (result.data && result.data.message) {
              scope.error = result.data.message;
              scope.errors = (result.data.data &&
                result.data.data.errorMessages) || [result.data.message];
            }
            console.error("rbsUserResetPassword", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      function reloadBlock(closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsUserResetPassword] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserLogin", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parser = new UAParser();
      var ua = parser.getResult();
      scope.error = null;
      scope.data = {
        login: null,
        password: null,
        realm: scope.blockParameters.realm,
        rememberMe: true,
        device: ua.browser.name + " - " + ua.os.name,
      };
      scope.login = function () {
        scope.error = null;
        AjaxAPI.openWaitingModal();
        AjaxAPI.putData("Rbs/User/Login", scope.data).then(
          function (result) {
            var user = result.data.dataSets.user;
            var onLogin = attrs["onLogin"] || scope.blockParameters["onLogin"];
            if (onLogin === "reload") {
              window.location.reload(true);
            } else if (onLogin === "redirectToTarget") {
              window.location =
                attrs["redirectionUrl"] ||
                scope.blockParameters["redirectionUrl"];
            } else {
              var params = {
                accessorId: user.accessorId,
                accessorName: user.name,
              };
              $rootScope.$broadcast("rbsUserConnected", params);
              var parameters = angular.copy(scope.blockParameters);
              parameters.accessorId = user.accessorId;
              parameters.accessorName = user.name;
              reloadBlock(parameters, true);
            }
          },
          function (result) {
            AjaxAPI.closeWaitingModal();
            scope.error = result.data.message;
            scope.blockParameters.password = scope.blockParameters.login = null;
            console.error("[RbsUserLogin] login error", result);
          },
        );
      };
      scope.logout = function () {
        AjaxAPI.getData("Rbs/User/Logout").then(
          function () {
            localStorage.setItem(
              "PROXIMIS_FRONT_LOGOUT",
              Date.now().toString(),
            );
            window.location.reload(true);
          },
          function (result) {
            scope.error = result.data.message;
            console.error("[RbsUserLogin] logout error", result);
          },
        );
      };
      function reloadBlock(parameters, closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error("[RbsUserLogin] error reloading block:", error);
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserChangePassword", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "RbsChange.AjaxAPI",
    function (scope, element, attrs, $rootScope, $compile, $location, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.data = { currentPassword: null, password: null };
      scope.changePassword = function () {
        AjaxAPI.openWaitingModal();
        scope.error = null;
        scope.errors = null;
        AjaxAPI.putData("Rbs/User/User/ChangePassword", scope.data).then(
          function () {
            scope.data = { currentPassword: null, password: null };
            scope.confirmPassword = null;
            parameters.passwordConfirmed = true;
            reloadBlock(true);
            parameters.passwordConfirmed = false;
          },
          function (result) {
            if (result.data && result.data.message) {
              scope.error = result.data.message;
              scope.errors = (result.data.data &&
                result.data.data.errorMessages) || [result.data.message];
            }
            console.error("changePassword", result);
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      function reloadBlock(closeWaitingModal) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsUserChangePassword] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsUserFinalizeAccount", [
    "$scope",
    "$element",
    "$compile",
    "RbsChange.AjaxAPI",
    function (scope, element, $compile, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      parameters.tTL = 0;
      scope.data = {
        token: parameters.token,
        email: parameters.email,
        password: null,
        confirmationPage: parameters.confirmationPage
          ? parseInt(parameters.confirmationPage)
          : 0,
      };
      scope.submit = function () {
        AjaxAPI.openWaitingModal();
        AjaxAPI.putData("Rbs/User/User/AccountSuggestion", scope.data).then(
          function () {
            reloadBlock(true, parameters);
          },
          function (result) {
            if (result.data && result.data.message) {
              var errorParameters = angular.copy(parameters);
              errorParameters.error = result.data.message;
              errorParameters.errors = (result.data.data &&
                result.data.data.errorMessages) || [result.data.message];
              reloadBlock(true, errorParameters);
            }
            AjaxAPI.closeWaitingModal();
          },
        );
      };
      function reloadBlock(closeWaitingModal, parameters) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
            if (closeWaitingModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsUserFinalizeAccount] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsShippingModeEditor", [rbsShippingModeEditor]);
  function rbsShippingModeEditor() {
    return {
      restrict: "A",
      templateUrl: "/rbs-shipping-mode-editor.twig",
      scope: {
        shippingMode: "=",
        shippingModeInfo: "=",
        userAddresses: "=",
        processEngine: "=",
        giftCapabilities: "=",
      },
    };
  }
  app.directive("rbsShippingModeSummary", rbsShippingModeSummary);
  function rbsShippingModeSummary() {
    return {
      restrict: "A",
      templateUrl: "/rbs-shipping-mode-summary.twig",
      scope: { shippingMode: "=", shippingModeInfo: "=" },
    };
  }
  app.directive(
    "rbsShippingModeCarbonFootprint",
    rbsShippingModeCarbonFootprint,
  );
  function rbsShippingModeCarbonFootprint() {
    return {
      restrict: "E",
      templateUrl: "/rbs-shipping-mode-carbon-footprint.twig",
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsSocialConnectorsProcess", [
    "RbsChange.AjaxAPI",
    "$location",
    rbsSocialAuthProcess,
  ]);
  function rbsSocialAuthProcess(AjaxAPI, $location) {
    return {
      restrict: "A",
      templateUrl: "/rbs-social-connectors-process.twig",
      scope: true,
      link: function (scope) {
        var locationSearch = $location.search();
        scope.socialError = locationSearch.socialError || null;
        AjaxAPI.getData("Rbs/Social/Connectors", "GET", {
          visualFormats: ["pictogram"],
        }).then(function (result) {
          scope.connectors = [];
          if (result.data.dataSets) {
            scope.connectors = result.data.dataSets.connectors;
          }
        });
      },
    };
  }
})();
(function (__change) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsSocialButtons", [
    "$location",
    function ($location) {
      return {
        restrict: "A",
        templateUrl: "/rbs-social-buttons.twig",
        scope: {},
        link: function (scope, elem, attrs) {
          var sites = ["twitter", "facebook", "pinterest"];
          scope.shareUrl = attrs.shareUrl
            ? attrs.shareUrl
            : encodeURIComponent($location.absUrl());
          scope.shareTitle = attrs.shareTitle
            ? attrs.shareTitle
            : document.title;
          scope.shareTitleUri = encodeURIComponent(scope.shareTitle);
          scope.items = [];
          var networkNames = attrs["networks"]
            ? attrs["networks"].toLowerCase().split(",")
            : sites;
          for (var i = 0; i < networkNames.length; i++) {
            var key = networkNames[i].trim();
            if (sites.indexOf(key) < 0) {
              continue;
            }
            var item = { name: key };
            switch (key) {
              case "twitter":
                item.type = "link";
                item.title = "Twitter";
                item.href =
                  "https://twitter.com/intent/tweet?text=" +
                  scope.shareTitleUri +
                  "%20" +
                  scope.shareUrl;
                break;
              case "facebook":
                item.type = "link";
                item.title = "Facebook";
                item.href =
                  "https://facebook.com/sharer.php?u=" + scope.shareUrl;
                break;
              case "pinterest":
                item.type = "button";
                item.title = "Pinterest";
                item.ngClick = function () {
                  var e = document.createElement("script");
                  e.setAttribute("type", "text/javascript");
                  e.setAttribute("charset", "UTF-8");
                  e.setAttribute(
                    "src",
                    "//assets.pinterest.com/js/pinmarklet.js?r=" +
                      Math.random() * 99999999,
                  );
                  document.body.appendChild(e);
                };
                break;
            }
            scope.items.push(item);
          }
        },
      };
    },
  ]);
})(window.__change);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsSocialConnectors", [
    "$scope",
    "$element",
    "$rootScope",
    "$attrs",
    "RbsChange.AjaxAPI",
    "$compile",
    RbsSocialConnectors,
  ]);
  function RbsSocialConnectors(
    scope,
    element,
    $rootScope,
    $attrs,
    AjaxAPI,
    $compile,
  ) {
    scope.isUserConnected = !!$attrs.accessorId;
    scope.accessorName = $attrs.accessorName || "";
    scope.socialConnect = function (connectorId, parameters, openTarget) {
      parameters = parameters || {};
      parameters.connectorId = connectorId;
      parameters.clearAdapter = true;
      var queryString = Object.keys(parameters)
        .map(function (key) {
          return (
            encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
          );
        })
        .join("&");
      var url = "Action/Rbs/Social/Authentication?" + queryString;
      handleSocialAuthenticationDisplay(url, openTarget);
    };
    var handleSocialAuthenticationDisplay = function (url, target) {
      switch (target) {
        case "tab":
          var socialTab = window.open(url, "_blank");
          if (!socialTab) {
            window.location.href = url;
          }
          break;
        case "current":
          window.location.href = url;
          break;
        case "popup":
        default:
          var screenX =
              typeof window.screenX != "undefined"
                ? window.screenX
                : window.screenLeft,
            screenY =
              typeof window.screenY != "undefined"
                ? window.screenY
                : window.screenTop,
            outerWidth =
              typeof window.outerWidth != "undefined"
                ? window.outerWidth
                : document.body.clientWidth,
            outerHeight =
              typeof window.outerHeight != "undefined"
                ? window.outerHeight
                : document.body.clientHeight,
            width = 600,
            height = 600,
            left = parseInt(screenX + (outerWidth - width) / 2, 10),
            top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
            features =
              "width=" +
              width +
              ",height=" +
              height +
              ",left=" +
              left +
              ",top=" +
              top;
          var socialWindow = window.open("", "socialWindow", features);
          if (socialWindow) {
            socialWindow.location.href = url;
          } else {
            window.location.href = url;
          }
      }
    };
    $rootScope.$on("rbsUserConnected", function (event, params) {
      scope.isUserConnected = true;
      scope.accessorName = params.accessorName;
      if ($attrs.reloadBlock) {
        var parameters = angular.copy(scope.blockParameters);
        parameters.accessorId = params.accessorId;
        parameters.accessorName = params.accessorName;
        reloadBlock(parameters);
      }
    });
    function reloadBlock(parameters, closeWaitingModal) {
      AjaxAPI.reloadBlock(
        scope.blockName,
        scope.blockId,
        parameters,
        scope.blockNavigationContext,
      ).then(
        function (result) {
          element
            .find(".content-scl")
            .html(
              jQuery(jQuery.parseHTML(result.data.dataSets.html))
                .filter(".content-scl")
                .html(),
            );
          $compile(element.find(".content-scl"))(scope);
          if (closeWaitingModal) {
            AjaxAPI.closeWaitingModal();
          }
        },
        function (error) {
          console.error("[RbsSocialConnectors] error reloading block:", error);
        },
      );
    }
    scope.logout = function () {
      AjaxAPI.getData("Rbs/User/Logout").then(
        function () {
          window.location.reload(true);
        },
        function (result) {
          scope.error = result.data.message;
          console.error("[RbsSocialConnectors] logout error", result);
        },
      );
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsSocialConnectorLinkAccountController", [
    "$scope",
    "$timeout",
    "RbsChange.AjaxAPI",
    "$attrs",
    "$element",
    "$compile",
    function (scope, $timeout, AjaxAPI, $attrs, element, $compile) {
      scope.isRunning = false;
      scope.socialLinks = [];
      if (!$attrs.reloadBlock) {
        updateSocialLinksStatus();
      }
      scope.changeLinkStatus = function (
        connectorId,
        providerName,
        method,
        openTarget,
      ) {
        scope.isRunning = true;
        if (!$attrs.reloadBlock) {
          scope.socialLinks.indexOf(providerName) >= 0
            ? unlinkAccount(connectorId)
            : linkAccount(connectorId, openTarget);
        } else {
          if (method === "link") {
            linkAccount(connectorId, openTarget);
          } else {
            unlinkAccount(connectorId);
          }
        }
        scope.isRunning = false;
      };
      function linkAccount(connectorId, openTarget) {
        var url =
          "Action/Rbs/Social/Authentication?&connectorId=" + connectorId;
        handleSocialAuthenticationDisplay(url, openTarget);
      }
      function unlinkAccount(connectorId) {
        AjaxAPI.postData("Rbs/Social/SocialLinkUnlink", {
          connectorId: connectorId,
        })
          .catch(function (error) {
            console.error(error);
          })
          .finally(function () {
            if (!$attrs.reloadBlock) {
              $timeout(updateSocialLinksStatus, 150);
            } else {
              reloadBlock(scope.blockParameters);
            }
          });
      }
      function updateSocialLinksStatus() {
        AjaxAPI.getData("Rbs/Social/SocialLinks").then(
          function (result) {
            scope.socialLinks = [];
            angular.forEach(result.data.dataSets, function (socialLink) {
              scope.socialLinks.push(socialLink.provider);
            });
          },
          function (error) {
            console.error(error);
          },
        );
      }
      function handleSocialAuthenticationDisplay(url, target) {
        switch (target) {
          case "tab":
            var socialTab = window.open(url, "_blank");
            if (!socialTab) {
              window.location.href = url;
            }
            break;
          case "current":
            window.location.href = url;
            break;
          case "popup":
          default:
            var screenX =
                typeof window.screenX != "undefined"
                  ? window.screenX
                  : window.screenLeft,
              screenY =
                typeof window.screenY != "undefined"
                  ? window.screenY
                  : window.screenTop,
              outerWidth =
                typeof window.outerWidth != "undefined"
                  ? window.outerWidth
                  : document.body.clientWidth,
              outerHeight =
                typeof window.outerHeight != "undefined"
                  ? window.outerHeight
                  : document.body.clientHeight,
              width = 600,
              height = 600,
              left = parseInt(screenX + (outerWidth - width) / 2, 10),
              top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
              features =
                "width=" +
                width +
                ",height=" +
                height +
                ",left=" +
                left +
                ",top=" +
                top;
            var socialWindow = window.open("", "socialWindow", features);
            if (socialWindow) {
              socialWindow.location.href = url;
            } else {
              window.location.href = url;
            }
        }
      }
      function reloadBlock(parameters) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
          },
          function (error) {
            console.error(
              "[RbsSocialConnectors] error reloading block:",
              error,
            );
          },
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsSocialSharingButtons", [
    "$scope",
    "$element",
    function (scope, element) {
      scope.onPinterestButtonClick = function () {
        var e = document.createElement("script");
        e.setAttribute("type", "text/javascript");
        e.setAttribute("charset", "UTF-8");
        e.setAttribute(
          "src",
          "//assets.pinterest.com/js/pinmarklet.js?r=" +
            Math.random() * 99999999,
        );
        document.body.appendChild(e);
      };
    },
  ]);
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchResultList", [
    "$scope",
    "$element",
    "$attrs",
    "RbsChange.AjaxAPI",
    "$location",
    "$rootScope",
    "$timeout",
    "$compile",
    "$window",
    function (
      scope,
      element,
      attrs,
      AjaxAPI,
      $location,
      $rootScope,
      $timeout,
      $compile,
      $window,
    ) {
      var blockId = scope.blockId;
      var paginationMode = attrs.paginationMode || "default";
      var isSearchResult = attrs.searchResult || false;
      var pageCount = parseInt(attrs.pageCount || "0", 10);
      var parameters = angular.copy(scope.blockParameters);
      parameters.pageNumber = parseInt(attrs.pageNumber || "0", 10);
      delete parameters.forceClassicPagination;
      if (paginationMode === "infinite-click" && pageCount > 1) {
        var locationSearch = $location.search();
        var locationPageNumber = Math.min(
          locationSearch["page-" + blockId] || 1,
          pageCount,
        );
        var locationPosition = locationSearch["position"];
        loadPages();
      }
      scope.loading = false;
      scope.changingPage = false;
      scope.sortBy = function (sortBy) {
        parameters.sortBy = sortBy;
        $location.search("sortBy-" + blockId, sortBy);
        setPage(1);
        scope.reload("sortBy");
      };
      scope.reload = function (reason) {
        var useModal = reason !== "instantSearch";
        if (useModal) {
          AjaxAPI.openWaitingModal();
        }
        var promise = AjaxAPI.reloadBlock(
          scope.blockName,
          blockId,
          parameters,
          scope.blockNavigationContext,
        );
        promise.then(
          function (result) {
            applyResult(result.data.dataSets.html, true);
            if (useModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
          function (error) {
            console.error(
              "[RbsElasticsearchShortSearchPreloaded] error reloading block:",
              error,
            );
            if (useModal) {
              AjaxAPI.closeWaitingModal();
            }
          },
        );
        return promise;
      };
      scope.onPaginationLinkClick = function ($event) {
        $event.originalEvent.stopPropagation();
        $event.originalEvent.preventDefault();
        if (scope.changingPage) {
          return;
        }
        scope.changingPage = true;
        if (paginationMode === "classic") {
          setPage(parseInt($event.target.getAttribute("data-page-number"), 10));
          scope.reload().then(
            function () {
              scope.changingPage = false;
            },
            function () {
              scope.changingPage = false;
            },
          );
        }
      };
      scope.addMoreItems = function () {
        if (scope.loading) {
          return;
        }
        if (paginationMode === "infinite-click") {
          loadNextPage();
        }
      };
      $rootScope.$on("RbsElasticsearchSearchText", onSearchTextUpdated);
      $rootScope.$on("RbsElasticsearchFacetFilters", onFacetFiltersUpdated);
      function onSearchTextUpdated(event, args) {
        if (
          isSearchResult &&
          (args.resultFunction === undefined ||
            parameters.resultFunction === args.resultFunction)
        ) {
          args.redirect = false;
          if (parameters.searchText !== args.searchText) {
            parameters.searchText = args.searchText || null;
            setPage(1);
            scope.reload(args.instantSearch ? "instantSearch" : "searchText");
          }
        }
      }
      function onFacetFiltersUpdated(event, args) {
        if (!args.facetFilters) {
          args.facetFilters = [];
        }
        parameters.facetFilters = args.facetFilters;
        parameters.searchText = args.searchText || null;
        setPage(1);
        scope.reload(args.instantSearch ? "instantSearch" : "facetFilters");
      }
      function loadNextPage() {
        scope.loading = true;
        setPage(parameters.pageNumber + 1);
        return AjaxAPI.reloadBlock(
          scope.blockName,
          blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            applyResult(result.data.dataSets.html, false);
            $timeout(function () {
              scope.loading = false;
            });
          },
          function () {
            setPage(parameters.pageNumber - 1);
            scope.loading = false;
          },
        );
      }
      function applyResult(html, replaceItems) {
        var pageClass = "list-items-" + parameters.pageNumber;
        var items = jQuery(jQuery.parseHTML(html)).filter(".list-items").html();
        if (replaceItems) {
          element
            .find(".list-items")
            .html('<div class="' + pageClass + '">' + items + "</div>");
        } else {
          element
            .find(".list-items")
            .append('<div class="' + pageClass + '">' + items + "</div>");
        }
        $compile(element.find("." + pageClass))(scope);
        var pagination = jQuery(jQuery.parseHTML(html))
          .filter(".list-pagination")
          .html();
        element.find(".list-pagination").html(pagination);
        $compile(element.find(".list-pagination > *"))(scope);
      }
      function loadPages() {
        if (locationPageNumber > parameters.pageNumber) {
          loadNextPage().then(loadPages);
        } else {
          jQuery("html, body").animate({ scrollTop: locationPosition }, 1000);
          var throttled = false;
          var windowElement = angular.element($window);
          windowElement.on("scroll", function () {
            if (!throttled) {
              throttled = true;
              $timeout(function () {
                throttled = false;
              }, 500);
              $location.search("position", windowElement.scrollTop()).replace();
              scope.$apply();
            }
          });
        }
      }
      function setPage(number) {
        parameters.pageNumber = number;
        var paramName = paginationMode === "classic" ? "pageNumber" : "page";
        var paramValue =
          parameters.pageNumber > 1 ? parameters.pageNumber : null;
        $location.search(paramName + "-" + blockId, paramValue).replace();
      }
    },
  ]);
})(jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchResultHeaderPreloaded", [
    "$scope",
    "$element",
    "$rootScope",
    "$compile",
    "RbsChange.AjaxAPI",
    function (scope, element, $rootScope, $compile, AjaxAPI) {
      $rootScope.$on("RbsElasticsearchSearchText", function (event, args) {
        var parameters = angular.copy(scope.blockParameters);
        parameters.searchText = args.searchText;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
          },
          function (error) {
            console.error(
              "[RbsElasticsearchResultHeaderPreloaded] error reloading block:",
              error,
            );
          },
        );
      });
    },
  ]);
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsElasticsearchShortSearch", [
    "RbsChange.AjaxAPI",
    "$timeout",
    "RbsChange.ResponsiveSummaries",
    "$sce",
    "$location",
    rbsElasticsearchShortSearch,
  ]);
  function rbsElasticsearchShortSearch(
    AjaxAPI,
    $timeout,
    ResponsiveSummaries,
    $sce,
    $location,
  ) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        function (scope) {
          scope.suggester = {};
          scope.suggester.search = function (searchText) {
            return AjaxAPI.getData(
              "Rbs/Elasticsearch/Suggest",
              {
                searchText: searchText,
                nbElement: scope.blockParameters.nbElement,
              },
              { visualFormats: scope.blockParameters.thumbnailFormat },
            ).then(
              function (res) {
                if (scope.searching) {
                  scope.searching = false;
                } else if (
                  res.data.categories &&
                  res.data.categories.length > 0
                ) {
                  jQuery(".short-search-listbox").show();
                  scope.categories = res.data.categories;
                }
              },
              function (error) {},
            );
          };
        },
      ],
      link: function (scope, elm, attrs) {
        var data = scope.blockData;
        scope.waitMs = attrs.waitMs;
        scope.minLength = attrs.minLength;
        scope.timeoutPromise = null;
        var search = $location.search();
        scope.suggester.searchText = search.searchText || null;
        scope.searching = false;
        var resetMatches = function () {
          scope.categories = null;
          if (jQuery) {
            jQuery(".short-search-listbox").hide();
          } else {
          }
          if ($) {
            $(".short-search-listbox").hide();
          } else {
          }
        };
        var getMatches = function (searchText) {
          resetMatches();
          if (searchText.length >= scope.minLength) {
            scope.suggester.search(searchText);
          }
        };
        var scheduleSearchWithTimeout = function (inputValue) {
          scope.timeoutPromise = $timeout(function () {
            getMatches(inputValue);
          }, scope.waitMs);
        };
        var cancelPreviousTimeout = function () {
          if (scope.timeoutPromise) {
            $timeout.cancel(scope.timeoutPromise);
            scope.timeoutPromise = null;
          }
        };
        scope.loadSuggestions = function loadSuggestions() {
          if (
            scope.minLength === 0 ||
            (scope.suggester.searchText &&
              scope.suggester.searchText.length >= scope.minLength)
          ) {
            if (scope.waitMs > 0) {
              cancelPreviousTimeout();
              scheduleSearchWithTimeout(scope.suggester.searchText);
            } else {
              getMatches(scope.suggester.searchText);
            }
          } else {
            cancelPreviousTimeout();
            resetMatches();
          }
        };
        scope.highlightSuggestion = function highlightSuggestion(item) {
          if (scope.suggester.searchText) {
            var pattern = new RegExp(scope.suggester.searchText, "i");
            var exactToken = item.match(pattern);
            return $sce.trustAsHtml(
              item.replace(pattern, "<strong>" + exactToken + "</strong>"),
            );
          }
          return $sce.trustAsHtml(item);
        };
        scope.searchItem = function searchItem($type, $url) {
          if (scope.suggester.searchText && scope.suggester.searchText.length) {
            cancelPreviousTimeout();
            resetMatches();
            scope.searching = true;
            var RBS_Elasticsearch =
              AjaxAPI.globalVar("RBS_Elasticsearch") || {};
            RBS_Elasticsearch.searchText = scope.suggester.searchText;
            RBS_Elasticsearch.redirect = true;
            RBS_Elasticsearch.instantSearch = false;
            RBS_Elasticsearch.resultFunction = $type || false;
            RBS_Elasticsearch.models = scope.blockParameters.models;
            AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
            scope.$emit("RbsElasticsearchSearchText", RBS_Elasticsearch);
            if (RBS_Elasticsearch.redirect) {
              window.location.href =
                $url +
                "?searchText=" +
                encodeURIComponent(scope.suggester.searchText);
            } else {
              $location.search("searchText", scope.suggester.searchText);
            }
          }
        };
        scope.submitForm = function submitForm() {
          if (scope.suggester.searchText && scope.suggester.searchText.length) {
            cancelPreviousTimeout();
            resetMatches();
            scope.searching = true;
            var RBS_Elasticsearch =
              AjaxAPI.globalVar("RBS_Elasticsearch") || {};
            RBS_Elasticsearch.searchText = scope.suggester.searchText;
            RBS_Elasticsearch.redirect = true;
            RBS_Elasticsearch.instantSearch = false;
            RBS_Elasticsearch.models = scope.blockParameters.models;
            AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
            scope.$emit("RbsElasticsearchSearchText", RBS_Elasticsearch);
            if (RBS_Elasticsearch.redirect) {
              AjaxAPI.getData("Rbs/Elasticsearch/Header", {
                searchText: scope.suggester.searchText,
                typoSearch: scope.blockParameters.typoSearch,
              }).then(function (res) {
                if (res.data && res.data.length) {
                  var url = null,
                    count = -1;
                  angular.forEach(res.data, function (d) {
                    if (!url && count < d.count) {
                      count = d.count;
                      RBS_Elasticsearch.resultFunction = d.resultFunction;
                      url = d.url;
                    }
                  });
                  if (url) {
                    window.location.href = url;
                  }
                }
              });
            } else {
              $location.search("searchText", scope.suggester.searchText);
            }
          }
        };
        scope.getPromiseDocumentSuggest = function (searchText) {
          var parameters = scope.blockParameters;
          parameters["searchText"] = searchText;
          if (parameters.models.length > 0) {
            return AjaxAPI.getData(
              "Rbs/Elasticsearch/SuggestDocuments",
              parameters,
              { visualFormats: parameters.thumbnailFormat },
            );
          }
          return null;
        };
        if (!scope.inResponsiveSummary) {
          var template =
            "/rbs-elasticsearch-short-search-responsive-summary-modal.twig";
          if (
            scope.blockParameters.fullyQualifiedTemplateName &&
            scope.blockParameters.fullyQualifiedTemplateName ===
              "Rbs_Catalog:product-short-search.twig"
          ) {
            template = "/rbs-catalog-product-short-search.twig";
          } else if (
            scope.blockParameters.fullyQualifiedTemplateName &&
            scope.blockParameters.fullyQualifiedTemplateName ===
              "Rbs_Elasticsearch:documents-short-search.twig"
          ) {
            template = "/rbs-elasticsearch-suggest-short-search.twig";
          }
          ResponsiveSummaries.registerItem(
            scope.blockId,
            scope,
            '<div data-rbs-elasticsearch-short-search-responsive-summary="" data-template="' +
              template +
              '"></div>',
          );
        }
      },
    };
  }
  app.directive("rbsElasticsearchShortSearchResponsiveSummary", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    rbsElasticsearchShortSearchResponsiveSummary,
  ]);
  function rbsElasticsearchShortSearchResponsiveSummary(ModalStack, AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-elasticsearch-short-search-responsive-summary.twig",
      link: function (scope, elm, attrs) {
        scope.inResponsiveSummary = true;
        scope.onResponsiveSummaryClick = function () {
          setTimeout(() => {
            function simulateClick() {
              var evt = document.createEvent("MouseEvents");
              evt.initMouseEvent(
                "click",
                true,
                true,
                window,
                0,
                0,
                0,
                0,
                0,
                false,
                false,
                false,
                false,
                0,
                null,
              );
              var a = document.getElementById("search-text-zento");
              a.dispatchEvent(evt);
            }
            simulateClick();
            $("#search-text-zento").focus();
            setTimeout(() => {
              $("#search-text-zento").focus();
            }, 300);
          }, 300);
          var options = {
            templateUrl: attrs.template,
            backdropClass:
              "modal-backdrop-rbs-elasticsearch-short-search-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-rbs-elasticsearch-short-search-responsive-summary zento-modal-short-search",
            scope: scope,
          };
          var modalInstance = ModalStack.open(options);
          scope.$on("RbsElasticsearchSearchText", function () {
            modalInstance.close();
          });
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchDocumentShortSearch", [
    "$scope",
    RbsElasticsearchDocumentShortSearch,
  ]);
  function RbsElasticsearchDocumentShortSearch(scope) {
    scope.suggester.search = function (searchText) {
      scope.documents = null;
      scope.columns = 0;
      var documentPromise = scope.getPromiseDocumentSuggest(searchText);
      if (documentPromise) {
        documentPromise.then(
          function (res) {
            if (scope.searching) {
              scope.searching = false;
            } else if (
              res &&
              res.data.documents &&
              res.data.documents.length > 0
            ) {
              jQuery(".short-search-listbox").show();
              scope.documents = res.data.documents;
              scope.columns++;
            }
          },
          function (error) {},
        );
      }
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchShortSearchPreloaded", [
    "$scope",
    "RbsChange.AjaxAPI",
    "$element",
    "$compile",
    "RbsChange.ResponsiveSummaries",
    "RbsChange.ModalStack",
    "$location",
    function (
      scope,
      AjaxAPI,
      elem,
      $compile,
      ResponsiveSummaries,
      ModalStack,
      $location,
    ) {
      scope.suggester = {};
      var search = $location.search();
      if (search.searchText) {
        search.searchText = search.searchText
          .replace(/</g, "")
          .replace(/>/g, "");
      }
      scope.suggester.searchText = search.searchText || null;
      scope.suggester.search = function (searchText) {
        var parameters = angular.copy(scope.blockParameters);
        if (parameters.models.length > 0) {
          parameters.searchText = searchText;
          parameters.renderSuggestions = true;
          AjaxAPI.reloadBlock(
            scope.blockName,
            scope.blockId,
            parameters,
            scope.blockNavigationContext,
          ).then(
            function (res) {
              if (scope.searching) {
                scope.searching = false;
              } else {
                var items = jQuery(jQuery.parseHTML(res.data.dataSets.html))
                  .filter(".suggestions")
                  .html();
                elem
                  .find(".suggestions")
                  .html('<div class="suggestions-content">' + items + "</div>");
                $compile(elem.find(".suggestions-content"))(scope);
                elem.find(".short-search-listbox").show();
              }
            },
            function (error) {
              console.error(
                "[RbsElasticsearchShortSearchPreloaded] error reloading block:",
                error,
              );
            },
          );
        }
      };
      scope.loadSuggestions = function loadSuggestions() {
        jQuery(".short-search-listbox").hide();
        if (scope.suggester.searchText) {
          scope.suggester.search(scope.suggester.searchText);
        }
      };
      scope.searchItem = function searchItem($type, $url) {
        if (scope.suggester.searchText && scope.suggester.searchText.length) {
          scope.searching = true;
          var RBS_Elasticsearch = AjaxAPI.globalVar("RBS_Elasticsearch") || {};
          RBS_Elasticsearch.searchText = scope.suggester.searchText;
          RBS_Elasticsearch.redirect = true;
          RBS_Elasticsearch.instantSearch = false;
          RBS_Elasticsearch.resultFunction = $type || false;
          RBS_Elasticsearch.models = scope.blockParameters.models;
          AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
          scope.$emit("RbsElasticsearchSearchText", RBS_Elasticsearch);
          if (RBS_Elasticsearch.redirect) {
            window.location.href =
              $url +
              "?searchText=" +
              encodeURIComponent(scope.suggester.searchText);
          } else {
            $location.search("searchText", scope.suggester.searchText);
          }
        }
      };
      scope.submitForm = function submitForm() {
        scope.suggester.searchText =
          $("#search-text-zento").val() || scope.suggester.searchText;
        if (scope.suggester.searchText && scope.suggester.searchText.length) {
          scope.searching = true;
          var RBS_Elasticsearch = AjaxAPI.globalVar("RBS_Elasticsearch") || {};
          RBS_Elasticsearch.searchText = scope.suggester.searchText;
          RBS_Elasticsearch.redirect = true;
          RBS_Elasticsearch.instantSearch = false;
          RBS_Elasticsearch.models = scope.blockParameters.models;
          AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
          scope.$emit("RbsElasticsearchSearchText", RBS_Elasticsearch);
          if (RBS_Elasticsearch.redirect) {
            AjaxAPI.getData("Rbs/Elasticsearch/Header", {
              searchText: scope.suggester.searchText,
              typoSearch: scope.blockParameters.typoSearch,
            }).then(function (res) {
              if (res.data && res.data.length) {
                var url = null,
                  count = -1;
                angular.forEach(res.data, function (d) {
                  if (!url && count < d.count) {
                    count = d.count;
                    RBS_Elasticsearch.resultFunction = d.resultFunction;
                    url = d.url;
                  }
                });
                if (url) {
                  window.location.href = url;
                }
              }
            });
          } else {
            $location.search("searchText", scope.suggester.searchText);
          }
        }
      };
      scope.openShortSearchModal = function openShortSearchModal() {
        var options = {
          templateUrl: "/rbs-elasticsearch-short-search-modal.twig",
          backdropClass: "modal-backdrop-rbs-elasticsearch-short-search-modal",
          windowClass: "modal-backdrop-rbs-elasticsearch-short-search-modal",
          scope: scope,
        };
        scope.inModal = true;
        ModalStack.open(options);
      };
      if (scope.inModal === false || typeof scope.inModal === "undefined") {
        var template = "/rbs-elasticsearch-suggest-short-search.twig";
        if (
          scope.blockParameters.fullyQualifiedTemplateName &&
          scope.blockParameters.fullyQualifiedTemplateName ===
            "Rbs_Catalog:product-short-search-preloaded.twig"
        ) {
          template = "/rbs-catalog-product-short-search.twig";
        }
        scope.parameters = scope.blockParameters;
        scope.accessorId = scope.parameters.accessorId;
        scope.accessorName = scope.parameters.accessorName;
        ResponsiveSummaries.registerItem(
          scope.blockId,
          scope,
          '<li data-rbs-elasticsearch-short-search-responsive-summary="" data-template="' +
            template +
            '"></li>',
        );
      }
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchResultHeaderController", [
    "$scope",
    "$rootScope",
    "RbsChange.AjaxAPI",
    function (scope, $rootScope, AjaxAPI) {
      scope.searchText =
        scope.blockParameters && scope.blockParameters.searchText;
      scope.result = scope.blockData && scope.blockData.result;
      $rootScope.$on("RbsElasticsearchSearchText", function (event, args) {
        var data = (scope.blockData && scope.blockData.contextData) || {};
        data.searchText = args.searchText;
        data.typoSearch = scope.blockParameters.typoSearch;
        data.models = args.models;
        AjaxAPI.getData(
          "Rbs/Elasticsearch/Header",
          data,
          scope.blockData && scope.blockData.contextParams,
        ).then(function (res) {
          if (res.data && res.data.length) {
            scope.searchText = args.searchText;
            scope.result = res.data;
          }
        });
      });
      scope.$watchCollection("result", function (result) {
        scope.totalCount = 0;
        if (result && result.length) {
          var currentFunction =
            scope.blockParameters && scope.blockParameters.resultFunction;
          angular.forEach(result, function (r) {
            scope.totalCount += r.count;
            r.active = currentFunction == r.resultFunction;
          });
        }
      });
    },
  ]);
  app.directive("rbsElasticsearchResult", [
    "$compile",
    function ($compile) {
      return {
        restrict: "A",
        scope: false,
        controller: [
          "$scope",
          "$element",
          "$rootScope",
          "RbsChange.AjaxAPI",
          function (scope, $element, $rootScope, AjaxAPI) {
            scope.contextData =
              (scope.blockData && scope.blockData.contextData) || {};
            scope.items = scope.blockData && scope.blockData.items;
            scope.pagination = (scope.blockData &&
              scope.blockData.pagination) || {
              offset: 0,
              count: 0,
              limit: scope.blockParameters.itemsPerPage,
            };
            scope.updateOffset = function (offset) {
              var data = scope.contextData;
              if (data.offset != offset) {
                data.offset = offset;
                AjaxAPI.getData(
                  "Rbs/Elasticsearch/Search",
                  scope.contextData,
                  scope.blockData && scope.blockData.contextParams,
                ).then(function (res) {
                  if (res.data && res.data.pagination && res.data.items) {
                    scope.items = res.data.items;
                    scope.pagination = res.data.pagination;
                  }
                });
              }
            };
            $rootScope.$on(
              "RbsElasticsearchSearchText",
              function (event, args) {
                var data = scope.contextData;
                if (
                  data.resultFunction === args.resultFunction ||
                  args.instantSearch
                ) {
                  args.redirect = false;
                  if (data.searchText !== args.searchText) {
                    data.searchText = args.searchText;
                    data.offset = 0;
                    AjaxAPI.getData(
                      "Rbs/Elasticsearch/Search",
                      data,
                      scope.blockData && scope.blockData.contextParams,
                    ).then(function (res) {
                      if (res.data && res.data.pagination && res.data.items) {
                        scope.items = res.data.items;
                        scope.pagination = res.data.pagination;
                      }
                    });
                  }
                }
              },
            );
            $rootScope.$on(
              "RbsElasticsearchFacetFilters",
              function (event, args) {
                var data = scope.contextData;
                data.facetFilters = args.facetFilters;
                data.offset = 0;
                AjaxAPI.getData(
                  "Rbs/Elasticsearch/Search",
                  data,
                  scope.blockData && scope.blockData.contextParams,
                ).then(function (res) {
                  if (res.data && res.data.pagination && res.data.items) {
                    scope.items = res.data.items;
                    scope.pagination = res.data.pagination;
                  }
                });
              },
            );
            this.getBlockParameters = function () {
              return scope.blockParameters;
            };
            this.getBlockData = function () {
              return scope.blockData;
            };
            this.refresh = function () {
              var data = scope.contextData;
              AjaxAPI.getData(
                "Rbs/Elasticsearch/Search",
                data,
                scope.blockData && scope.blockData.contextParams,
              ).then(function (res) {
                if (res.data && res.data.pagination && res.data.items) {
                  scope.items = res.data.items;
                  scope.pagination = res.data.pagination;
                }
              });
            };
          },
        ],
        link: function (scope, elem, attrs, controller) {
          var itemsScope = null;
          var itemsContainer = elem.find('[data-role="items-container"]');
          function directiveName(item) {
            return (
              (item.document &&
                item.document.searchResult &&
                item.document.searchResult.directiveName) ||
              "data-rbs-elasticsearch-result-item"
            );
          }
          scope.$watchCollection("items", function (items) {
            var html = [];
            if (items && items.length) {
              angular.forEach(scope.items, function (item, idx) {
                html.push(
                  '<div data-item="items[' +
                    idx +
                    ']" ' +
                    directiveName(item) +
                    '=""></div>',
                );
              });
            }
            if (itemsScope) {
              itemsScope.$destroy();
              itemsScope = null;
            }
            itemsContainer.children().remove();
            if (html.length) {
              itemsScope = scope.$new();
              $compile(html.join(""))(itemsScope, function (clone) {
                itemsContainer.append(clone);
              });
            }
          });
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchResultItem", function () {
    return {
      restrict: "A",
      scope: { item: "=" },
      templateUrl: "/rbs-elasticsearch-result-item.twig",
      require: "^rbsElasticsearchResult",
      link: function (scope, elem, attrs, controller) {},
    };
  });
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsElasticsearchInstantSearch", [
    "$scope",
    "RbsChange.AjaxAPI",
    "$location",
    RbsElasticsearchInstantSearch,
  ]);
  function RbsElasticsearchInstantSearch(scope, AjaxAPI, $location) {
    scope.instantSearchText = $location.search().searchText || null;
    scope.$on("$locationChangeSuccess", function () {
      scope.instantSearchText = $location.search().searchText;
    });
    scope.instantSearch = function instantSearch() {
      if (scope.instantSearchText && scope.instantSearchText.length) {
        var RBS_Elasticsearch = AjaxAPI.globalVar("RBS_Elasticsearch") || {};
        RBS_Elasticsearch.searchText = scope.instantSearchText;
        RBS_Elasticsearch.instantSearch = true;
        RBS_Elasticsearch.redirect = false;
        RBS_Elasticsearch.models = scope.blockParameters.models || [];
        AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
        scope.$emit("RbsElasticsearchSearchText", RBS_Elasticsearch);
        $location.search("searchText", scope.instantSearchText);
      }
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsElasticsearchFacetContainerV2", [
    "$location",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    rbsElasticsearchFacetContainerV2,
  ]);
  function rbsElasticsearchFacetContainerV2($location, AjaxAPI, ModalStack) {
    return {
      restrict: "A",
      scope: true,
      controllerAs: "controller",
      controller: [
        "$scope",
        "$element",
        "$attrs",
        "$rootScope",
        function (scope, $element, $attrs, $rootScope) {
          scope.parameters = scope.blockParameters;
          var data = scope.blockData;
          scope.facets = (data && data.facetValues) || null;
          if (scope.facets) {
            setParentProperty(scope.facets);
            var facetFilters = buildFacetFilters(scope.facets);
            scope.appliedCount = facetFilters
              ? Object.keys(facetFilters).length
              : 0;
          } else {
            scope.appliedCount = 0;
          }
          $rootScope.$on(
            "RbsElasticsearchUpdateAppliedCount",
            function (event, args) {
              scope.appliedCount = args.appliedCount || 0;
            },
          );
          scope.viewButton = function () {
            var view = false;
            angular.forEach(scope.facets, function (facet) {
              if (!view && facet.values && facet.values.length) {
                view = true;
              }
            });
            return view;
          };
          scope.reset = function () {
            unSelectDescendant(scope.facets);
            refresh();
          };
          scope.responsiveModal = function () {
            var options = {
              templateUrl:
                $attrs["responsiveModalTemplate"] ||
                "/rbs-elasticsearch-facet-responsive-modal.twig",
              backdropClass:
                "modal-backdrop-rbs-elasticsearch-facet-responsive",
              windowClass:
                "modal-responsive-summary modal-rbs-elasticsearch-facet-responsive",
              scope: scope,
            };
            ModalStack.open(options);
          };
          if (scope.blockParameters.resultFunction) {
            $rootScope.$on(
              "RbsElasticsearchSearchText",
              function (event, args) {
                var data = scope.blockData && scope.blockData.contextData;
                if (data) {
                  data.searchText = args.searchText;
                  refresh();
                }
              },
            );
          }
          function refresh() {
            var data = (scope.blockData && scope.blockData.contextData) || {};
            var emitFacetFilterImmediately = true;
            data.facetFilters = [];
            if (scope.facets && scope.facets.length) {
              emitFacetFilterImmediately = false;
              var facetFilters = buildFacetFilters(scope.facets);
              scope.appliedCount = facetFilters
                ? Object.keys(facetFilters).length
                : 0;
              data.facetFilters = facetFilters;
              data.typoSearch = scope.blockParameters.typoSearch;
              var actionPath =
                scope.parameters.ajaxPath || "Rbs/Elasticsearch/Facets";
              var params =
                (scope.blockData && scope.blockData.contextParams) || {};
              AjaxAPI.getData(actionPath, data, params).then(
                function (result) {
                  var RBS_Elasticsearch =
                    AjaxAPI.globalVar("RBS_Elasticsearch") || {};
                  scope.facets = result.data.facetValues || null;
                  setParentProperty(scope.facets);
                  if (result.data.location) {
                    $location.url(result.data.location);
                    scope.$emit("RbsSeoUpdateMetas", result.data.metas);
                    scope.$emit("RbsSeoUpdateDecorator", {
                      decoratorId: result.data.decoratorId,
                    });
                    RBS_Elasticsearch.decoratorId = result.data.decoratorId;
                    AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
                  } else if (result.data.hasOwnProperty("search")) {
                    $location.search(result.data.search);
                  }
                  scope.$emit(
                    "RbsElasticsearchFacetFilters",
                    RBS_Elasticsearch,
                  );
                },
                function (result) {
                  console.log("error", result);
                  scope.$emit(
                    "RbsElasticsearchFacetFilters",
                    AjaxAPI.globalVar("RBS_Elasticsearch") || {},
                  );
                },
              );
              scope.$emit("RbsElasticsearchUpdateAppliedCount", {
                appliedCount: scope.appliedCount,
              });
            }
            var RBS_Elasticsearch =
              AjaxAPI.globalVar("RBS_Elasticsearch") || {};
            RBS_Elasticsearch.facetFilters = data.facetFilters;
            RBS_Elasticsearch.webStoreStockFilter = data.webStoreStockFilter;
            RBS_Elasticsearch.storeStockFilter = data.storeStockFilter;
            RBS_Elasticsearch.searchText = data.searchText || null;
            RBS_Elasticsearch.redirect = true;
            AjaxAPI.globalVar("RBS_Elasticsearch", RBS_Elasticsearch);
            if (emitFacetFilterImmediately) {
              scope.$emit("RbsElasticsearchFacetFilters", RBS_Elasticsearch);
            }
          }
          function setParentProperty(facets, parentFieldName) {
            if (facets) {
              angular.forEach(facets, function (facet) {
                if (parentFieldName) {
                  facet.parent = parentFieldName;
                }
                if (facet.hasChildren && facet.values && facet.values.length) {
                  angular.forEach(facet.values, function (value) {
                    setParentProperty(value.aggregationValues, facet.fieldName);
                  });
                }
              });
            }
          }
          this.refresh = refresh;
          this.getFacets = function () {
            return scope.facets;
          };
          this.getFacetData = function (facet) {
            if (facet && facet.fieldName) {
              var name = facet.fieldName;
              var id = parseInt(name.replace("f_", ""), 10);
              if (scope.blockData.facets[id]) {
                return scope.blockData.facets[id];
              }
            }
            return null;
          };
          function selectAncestors(facet) {
            var parent = getFacetByFieldName(facet.parent);
            if (!parent) {
              return;
            }
            for (var z = 0; z < parent.values.length; z++) {
              var value = parent.values[z];
              for (var i = 0; i < value["aggregationValues"].length; i++) {
                if (value["aggregationValues"][i] === facet) {
                  value.selected = true;
                  if (angular.isFunction(parent.selectionChange)) {
                    parent.selectionChange(value, true);
                  }
                  return;
                }
              }
            }
          }
          this.selectAncestors = selectAncestors;
          function unSelectDescendant(facets) {
            for (var i = 0; i < facets.length; i++) {
              var facet = facets[i];
              if (angular.isFunction(facet.reset)) {
                facet.reset();
              }
              if (facet.values) {
                for (var z = 0; z < facet.values.length; z++) {
                  var value = facet.values[z];
                  value.selected = false;
                  if (value["aggregationValues"]) {
                    unSelectDescendant(value["aggregationValues"]);
                  }
                }
              }
            }
            var data = scope.blockData && scope.blockData.contextData;
            if (data && data.showStockFilter) {
              data.webStoreStockFilter = false;
              data.storeStockFilter = false;
            }
          }
          this.unSelectDescendant = unSelectDescendant;
          function getFacetByFieldName(fieldName, facets) {
            if (facets === undefined) {
              facets = scope.facets;
            }
            for (var i = 0; i < facets.length; i++) {
              var facet = facets[i];
              if (facet.fieldName === fieldName) {
                return facet;
              }
              if (facet.values) {
                for (var z = 0; z < facet.values.length; z++) {
                  var value = facet.values[z];
                  if (value.aggregationValues) {
                    var subFacet = getFacetByFieldName(
                      fieldName,
                      value.aggregationValues,
                    );
                    if (subFacet) {
                      return subFacet;
                    }
                  }
                }
              }
            }
            return null;
          }
          function buildFacetFilters(facets) {
            var facetFilters = null;
            for (var i = 0; i < facets.length; i++) {
              var facet = facets[i];
              if (angular.isFunction(facet.buildFilter)) {
                var filters = facet.buildFilter();
                if (filters) {
                  if (!facetFilters) {
                    facetFilters = {};
                  }
                  facetFilters[facet.fieldName] = filters;
                }
              } else if (facet.values) {
                for (var z = 0; z < facet.values.length; z++) {
                  var value = facet.values[z];
                  if (value.selected) {
                    var key = "" + value.key;
                    if (!facetFilters) {
                      facetFilters = {};
                    }
                    if (!facetFilters[facet.fieldName]) {
                      facetFilters[facet.fieldName] = {};
                    }
                    facetFilters[facet.fieldName][key] = 1;
                    var filter = null;
                    if (
                      value.aggregationValues &&
                      value.aggregationValues.length
                    ) {
                      filter = buildFacetFilters(value.aggregationValues);
                      if (filter) {
                        facetFilters[facet.fieldName][key] = filter;
                      }
                    }
                  }
                }
              }
            }
            return facetFilters;
          }
        },
      ],
    };
  }
  app.directive("rbsElasticsearchFacetV2", [
    "RbsChange.RecursionHelper",
    "$timeout",
    function (RecursionHelper, $timeout) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-v2.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(
            element,
            function (scope, element, attrs) {
              scope.isCollapsed = false;
              scope.showContent = true;
              if (attrs["collapseNotSelected"] === "true") {
                scope.isCollapsed = true;
                if (scope.facet && scope.facet.values) {
                  for (var i = 0; i < scope.facet.values.length; i++) {
                    if (scope.facet.values[i].selected) {
                      scope.isCollapsed = false;
                      break;
                    }
                  }
                }
                if (scope.isCollapsed) {
                  scope.showContent = false;
                  $timeout(function () {
                    scope.showContent = true;
                  }, 600);
                }
              }
              var directiveName = scope.facet.parameters.renderingMode;
              if (!directiveName) {
                console.error("No rendering mode for facet!", scope.facet);
              } else if (directiveName.indexOf("-") < 0) {
                directiveName = "rbs-elasticsearch-facet-" + directiveName;
              }
              var container = element.find(".facet-values-container");
              container.html("<div data-" + directiveName + "></div>");
              RecursionHelper.baseCompile(container.contents())(scope);
              scope.facetData = scope.controller.getFacetData(scope.facet);
            },
          );
        },
      };
    },
  ]);
})();
(function (noUiSlider) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function linkFacetRadio(scope) {
    scope.selectionChange = function (value, ignoreRefresh) {
      for (var z = 0; z < scope.facet.values.length; z++) {
        if (value !== scope.facet.values[z]) {
          scope.facet.values[z].selected = false;
        }
      }
      if (!value.selected && value["aggregationValues"]) {
        scope.controller.unSelectDescendant(value["aggregationValues"]);
      } else if (value.selected && scope.facet.parent) {
        scope.controller.selectAncestors(scope.facet);
      }
      if (ignoreRefresh !== true) {
        scope.controller.refresh();
      }
    };
    scope.hasValue = function () {
      return scope.facet.values && scope.facet.values.length;
    };
  }
  app.directive("rbsElasticsearchFacetRadio", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-radio.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetRadio);
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchFacetButtonssingle", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-buttons-single.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetRadio);
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchFacetSwatchsingle", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-swatch-single.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetRadio);
        },
      };
    },
  ]);
  function linkFacetCheckbox(scope) {
    scope.selectionChange = function (value, ignoreRefresh) {
      if (!value.selected && value["aggregationValues"]) {
        scope.controller.unSelectDescendant(value["aggregationValues"]);
      } else if (value.selected && scope.facet.parent) {
        scope.controller.selectAncestors(scope.facet);
      }
      if (ignoreRefresh !== true) {
        scope.controller.refresh();
      }
    };
    scope.hasValue = function () {
      return scope.facet.values && scope.facet.values.length;
    };
  }
  app.directive("rbsElasticsearchFacetCheckbox", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-checkbox.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetCheckbox);
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchFacetButtonsmultiple", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-buttons-multiple.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetCheckbox);
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchFacetSwatchmultiple", [
    "RbsChange.RecursionHelper",
    function (RecursionHelper) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-swatch-multiple.twig",
        scope: false,
        compile: function (element) {
          return RecursionHelper.compile(element, linkFacetCheckbox);
        },
      };
    },
  ]);
  app.directive("rbsElasticsearchFacetSwatchItem", function () {
    return {
      restrict: "A",
      link: function (scope, element, attributes) {
        if (!angular.isObject(scope.value.skin)) {
          return;
        }
        var visualFormat = attributes["visualFormat"] || "selectorItem";
        var background = scope.value.skin.colorCode || "";
        if (scope.value.skin.visual) {
          background +=
            ' url("' +
            scope.value.skin.visual[visualFormat] +
            '") no-repeat center center';
        }
        scope.ngStyle = { background: background };
      },
    };
  });
  app.directive("rbsElasticsearchFacetInterval", [
    "$filter",
    function ($filter) {
      return {
        restrict: "A",
        templateUrl: "/rbs-elasticsearch-facet-interval.twig",
        scope: false,
        link: function (scope, element) {
          var intervalChangedByUser = false;
          scope.selectionChange = function (value, ignoreRefresh) {
            if (value.selected && scope.facet.parent) {
              scope.controller.selectAncestors(scope.facet);
            }
            if (ignoreRefresh !== true) {
              scope.controller.refresh();
              intervalChangedByUser = true;
            }
          };
          scope.hasValue = function () {
            return scope.facet.values && scope.facet.values.length;
          };
          var lastMin, lastMax, options, slider;
          var initialRange = {
            interval: scope.facet.parameters.interval,
            absMin: null,
            absMax: null,
            min: null,
            max: null,
          };
          scope.range = angular.copy(initialRange);
          refreshRange();
          options = {
            start: [scope.range.min, scope.range.max],
            behaviour: "drag-tap",
            connect: true,
            margin: scope.range.interval,
            step: scope.range.interval,
            range: {
              min: [scope.range.absMin ? scope.range.absMin : 0],
              max: [
                scope.range.absMax ? scope.range.absMax : scope.range.interval,
              ],
            },
          };
          if (scope.facet.parameters["sliderShowTooltips"] !== false) {
            scope.showTooltips = true;
            var currencyCode = scope.blockData.contextData.currencyCode;
            var formatter = {
              to: function (value) {
                return (
                  '<div class="tooltip-arrow"></div>' +
                  '<div class="tooltip-inner">' +
                  "<span>" +
                  $filter("rbsFormatPrice")(value, currencyCode, 0) +
                  "</span>" +
                  "</div>"
                );
              },
            };
            options.tooltips = [formatter, formatter];
          }
          if (scope.facet.parameters["sliderShowLabels"] == true) {
            scope.showLabels = true;
          }
          if (scope.facet.parameters["sliderShowPips"] == true) {
            scope.showPips = true;
            options.pips = {
              mode: "steps",
              values: countValues(),
              density: scope.range.interval,
            };
          }
          createSlider();
          scope.$watch("facet", onFacetChanged);
          scope.$watch("facet.values", onFacetValuesChanged);
          function createSlider() {
            var classes = "range-slider";
            if (scope.showTooltips) {
              classes += " range-slider-tooltips";
            }
            if (scope.showPips) {
              classes += " range-slider-pips";
            }
            element
              .find(".range-slider")
              .replaceWith('<div class="' + classes + '"></div>');
            slider = element.find(".range-slider").get(0);
            noUiSlider.create(slider, options);
            slider.noUiSlider.on("slide", synchronizeValues);
            slider.noUiSlider.on("change", synchronizeValuesAndRefresh);
            element
              .find(".noUi-tooltip")
              .addClass("tooltip top")
              .removeClass("noUi-tooltip");
          }
          function synchronizeValues() {
            var values = slider.noUiSlider.get();
            var newMin = parseInt(values[0]);
            var newMax = parseInt(values[1]);
            if (scope.range.min != newMin || scope.range.max != newMax) {
              scope.range.min = newMin;
              scope.range.max = newMax;
              scope.$digest();
            }
          }
          function synchronizeValuesAndRefresh() {
            var values = slider.noUiSlider.get();
            var newMin = parseInt(values[0]);
            var newMax = parseInt(values[1]);
            if (lastMin != newMin || lastMax != newMax) {
              scope.range.min = lastMin = newMin;
              scope.range.max = lastMax = newMax;
              scope.$digest();
              for (var i = 0; i < scope.facet.values.length; i++) {
                var key = scope.facet.values[i].key;
                scope.facet.values[i].selected =
                  key >= scope.range.min && key < scope.range.max;
              }
              scope.facet.customValues = [
                { key: "min", selected: true, value: scope.range.min },
                { key: "max", selected: true, value: scope.range.max },
              ];
              scope.controller.refresh();
            }
          }
          function onFacetChanged(facet) {
            facet.buildFilter = function () {
              if (
                scope.range.min !== scope.range.absMin ||
                scope.range.max !== scope.range.absMax
              ) {
                return { min: scope.range.min, max: scope.range.max };
              }
              return null;
            };
            facet.reset = function () {
              var range = scope.range;
              range.min = range.absMin;
              range.max = range.absMax;
              slider.noUiSlider.set([range.min, range.max]);
            };
          }
          function onFacetValuesChanged() {
            var updateRange = refreshRange();
            if (updateRange) {
              options.start = [scope.range.min, scope.range.max];
              options.range = {
                min: [scope.range.absMin ? scope.range.absMin : 0],
                max: [
                  scope.range.absMax
                    ? scope.range.absMax
                    : scope.range.interval,
                ],
              };
              if (scope.showPips) {
                options.pips.values = countValues();
              }
              createSlider();
            }
          }
          function refreshRange() {
            if (!scope.hasValue()) {
              return false;
            }
            var rangeUpdated = false;
            if (!intervalChangedByUser) {
              var tempRange = angular.copy(initialRange);
              for (var i = 0; i < scope.facet.values.length; i++) {
                var value = scope.facet.values[i].key;
                var upValue = value + scope.range.interval;
                if (tempRange.absMin === null || value < tempRange.absMin) {
                  tempRange.absMin = value;
                  rangeUpdated = true;
                }
                if (tempRange.absMax === null || upValue > tempRange.absMax) {
                  tempRange.absMax = upValue;
                  rangeUpdated = true;
                }
                if (scope.facet.values[i].selected) {
                  if (tempRange.min === null || value < tempRange.min) {
                    tempRange.min = value;
                    rangeUpdated = true;
                  }
                  if (tempRange.max === null || upValue > tempRange.max) {
                    tempRange.max = upValue;
                    rangeUpdated = true;
                  }
                }
              }
              if (rangeUpdated) {
                scope.range = tempRange;
              }
            }
            if (
              scope.range.min === null ||
              scope.range.min < scope.range.absMin
            ) {
              if (
                scope.facet.parameters["minFilter"] !== undefined &&
                scope.facet.parameters["minFilter"] !== null
              ) {
                scope.range.min = parseInt(scope.facet.parameters["minFilter"]);
              } else {
                scope.range.min = scope.range.absMin;
              }
            }
            if (
              scope.range.max === null ||
              scope.range.max > scope.range.absMax
            ) {
              if (
                scope.facet.parameters["maxFilter"] !== undefined &&
                scope.facet.parameters["maxFilter"] !== null
              ) {
                scope.range.max = parseInt(scope.facet.parameters["maxFilter"]);
              } else {
                scope.range.max = scope.range.absMax;
              }
            }
            lastMin = scope.range.min;
            lastMax = scope.range.max;
            intervalChangedByUser = false;
            return rangeUpdated;
          }
          function countValues() {
            return scope.facet.values ? scope.facet.values.length : 0;
          }
        },
      };
    },
  ]);
})(window.noUiSlider);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function rbsVerticalIfAnimation() {
    return {
      enter: function (element, done) {
        jQuery(element).css({ overflow: "hidden", height: 0 });
        jQuery(element).animate(
          { height: element.find(".vertical-if-animation-content").height() },
          500,
          function () {
            element.css("height", "auto");
            done();
          },
        );
      },
      leave: function (element, done) {
        jQuery(element).css({
          height: element.find(".vertical-if-animation-content").height(),
        });
        jQuery(element).animate({ overflow: "hidden", height: 0 }, 500, done);
      },
    };
  }
  app.animation(".vertical-if-animation", rbsVerticalIfAnimation);
  function rbsVerticalShowHideAnimation() {
    return {
      beforeAddClass: function (element, className, done) {
        if (className == "ng-hide") {
          jQuery(element).animate({ overflow: "hidden", height: 0 }, done);
        } else {
          done();
        }
      },
      removeClass: function (element, className, done) {
        if (className == "ng-hide") {
          element.css({ height: 0, overflow: "hidden" });
          jQuery(element).animate(
            {
              height: element
                .find(".vertical-show-hide-animation-content")
                .height(),
            },
            function () {
              element.css({ height: "auto", overflow: "visible" });
              done();
            },
          );
        } else {
          done();
        }
      },
    };
  }
  app.animation(".vertical-show-hide-animation", rbsVerticalShowHideAnimation);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsWebsiteInterstitial", [
    "RbsChange.AjaxAPI",
    "$http",
    "$compile",
    "$timeout",
    "RbsChange.Cookies",
    rbsWebsiteInterstitial,
  ]);
  function rbsWebsiteInterstitial(AjaxAPI, $http, $compile, $timeout, cookies) {
    return {
      restrict: "A",
      link: function (scope, elem, attrs) {
        scope.modalId = attrs.modalId;
        scope.contentUrl = attrs.contentUrl;
        scope.parameters = scope.blockParameters || {};
        if (!scope.modalId || !scope.contentUrl) {
          return;
        }
        var allowClosing = scope.parameters["allowClosing"];
        var frequency = scope.parameters["displayFrequency"];
        var modalNode = jQuery("#" + scope.modalId);
        var mainContentElement = jQuery(
          "#" + scope.modalId + " .modal-main-content",
        );
        var closeDialog = function () {
          modalNode.modal("hide");
        };
        var loadContentSuccess = function (resultData) {
          mainContentElement.html(resultData.data);
          $compile(mainContentElement.contents())(scope);
          scope.modalContentMode = "success";
          var autoCloseDelay = parseInt(scope.parameters["autoCloseDelay"]);
          if (autoCloseDelay > 1) {
            $timeout(closeDialog, autoCloseDelay * 1000);
          }
        };
        var loadContentError = function (data, status, headers) {
          scope.modalContentMode = "error";
          console.error("Interstitial", data, status, headers);
        };
        var showDialog = function () {
          scope.modalContentMode = "loading";
          $http
            .get(scope.contentUrl, {
              params: { themeName: AjaxAPI.getThemeName() },
            })
            .then(loadContentSuccess, loadContentError);
          modalNode.modal({
            keyboard: allowClosing,
            backdrop: allowClosing ? true : "static",
          });
        };
        if (frequency === "always") {
          showDialog();
        } else {
          var cookieName =
            "rbsWebsiteInterstitial-" + scope.parameters["displayedPage"];
          if (cookies.get(cookieName)) {
            return;
          }
          var getCookieExpireDate = function (cookieTimeout) {
            var date = new Date();
            date.setTime(date.getTime() + cookieTimeout);
            return date.toGMTString();
          };
          switch (frequency) {
            case "session":
              cookies.put("technical", cookieName, true);
              showDialog();
              break;
            case "reprieve":
              var expire = getCookieExpireDate(
                scope.parameters["displayReprieve"] * 24 * 3600 * 1000,
              );
              cookies.put("technical", cookieName, true, { expires: expire });
              showDialog();
              break;
            case "once":
              expire = getCookieExpireDate(10 * 365 * 24 * 3600 * 1000);
              cookies.put("technical", cookieName, true, { expires: expire });
              showDialog();
              break;
            default:
              break;
          }
        }
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("rbsWebsiteManageTrackersGdpr", [
    "$scope",
    "$rootScope",
    "RbsChange.Cookies",
    "RbsChange.ModalStack",
    "$attrs",
    function (scope, rootScope, Cookies, ModalStack, attrs) {
      scope.cookiesCategories = JSON.parse(attrs.cookiesCategories);
      scope.hideConsent = false;
      scope.running = false;
      var consent = Cookies.getConsent().acceptedCookies;
      if (consent) {
        var consentedCategories = {};
        scope.hideConsent = true;
        for (var i = 0; i < scope.cookiesCategories.length; i++) {
          var _id = scope.cookiesCategories[i].id;
          if (typeof consent[_id] !== "boolean") {
            scope.hideConsent = false;
          } else {
            consentedCategories[_id] = consent[_id];
          }
        }
        if (!scope.hideConsent) {
          Cookies.removeConsent();
        }
      }
      scope.showCookies = function () {
        var options = {
          templateUrl: "/rbs-website-trackers-ask-consent-modal.twig",
          windowClass: "",
          controller: "rbsWebsiteManageTrackersGdprModalCtrl",
          size: "lg",
          resolve: {
            cookiesCategories: function () {
              return scope.cookiesCategories;
            },
          },
        };
        ModalStack.open(options);
      };
      scope.selectAll = function () {
        try {
          var acceptedCookies = {};
          var categories = scope.cookiesCategories;
          for (var i = 0; i < categories.length; i++) {
            acceptedCookies[categories[i].id] = true;
          }
          setConsent(acceptedCookies, "all", "banner");
        } catch (e) {
          console.error(e);
        }
      };
      scope.deselectAll = function () {
        try {
          var acceptedCookies = {};
          var categories = scope.cookiesCategories;
          for (var i = 0; i < categories.length; i++) {
            acceptedCookies[categories[i].id] =
              categories[i].readOnly === "true";
          }
          setConsent(acceptedCookies, "none", "banner");
        } catch (e) {
          console.error(e);
        }
      };
      function setConsent(acceptedCookies, consentMode, consentSource) {
        scope.running = true;
        Cookies.setConsent(acceptedCookies, consentMode, consentSource).then(
          function () {
            scope.running = false;
          },
          function (response) {
            scope.running = false;
            if (response.status === 429) {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-too-many-requests-modal.twig",
              });
            } else {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-ask-consent-error-modal.twig",
              });
            }
          },
        );
      }
      rootScope.$on("RbsWebsiteCookies:set", function () {
        scope.hideConsent = true;
      });
    },
  ]);
  app.controller("rbsWebsiteManageTrackersGdprModalCtrl", [
    "$scope",
    "$rootScope",
    "RbsChange.Cookies",
    "RbsChange.ModalStack",
    "cookiesCategories",
    function (scope, rootScope, Cookies, ModalStack, cookiesCategories) {
      scope.acceptedCookies = {};
      scope.running = false;
      var listCookies = Cookies.getConsent().acceptedCookies || {};
      setDefaultAcceptedCookies(true);
      scope.selectAll = function () {
        angular.forEach(scope.acceptedCookies, function (value, cookie) {
          scope.acceptedCookies[cookie] = true;
        });
        scope.validate("all");
      };
      scope.deselectAll = function () {
        setDefaultAcceptedCookies(false);
        scope.validate("none");
      };
      scope.validate = function (mode) {
        scope.running = true;
        Cookies.setConsent(
          scope.acceptedCookies,
          mode || "custom",
          "modal",
        ).then(
          function () {
            scope.$dismiss();
            scope.running = false;
          },
          function (response) {
            scope.running = false;
            if (response.status === 429) {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-too-many-requests-modal.twig",
              });
            } else {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-ask-consent-error-modal.twig",
              });
            }
          },
        );
      };
      function setDefaultAcceptedCookies(keepExisting) {
        for (var i = 0; i < cookiesCategories.length; i++) {
          var _id = cookiesCategories[i].id;
          var readOnlyCookieCategory = cookiesCategories[i].readOnly === "true";
          scope.acceptedCookies[_id] =
            typeof listCookies[_id] === "boolean" && keepExisting
              ? listCookies[_id]
              : readOnlyCookieCategory;
        }
      }
      $("body").on("click", ".trackersModalCollapseIcon", function () {
        $($(this).data("icon")).toggleClass("dropup");
      });
    },
  ]);
})();
(function (window) {
  "use strict";
  (function (i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
      i[r] ||
      function () {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    "script",
    "//www.google-analytics.com/analytics.js",
    "ga",
  );
  var app = angular.module("RbsChangeApp");
  app.provider("RbsChange.GoogleAnalytics", function () {
    this.$get = [
      "RbsChange.Cookies",
      function (cookies) {
        var trackingID;
        function send(data) {
          if (angular.isObject(data) && data.hitType) {
            window.ga("send", data);
          }
        }
        function sendEvent(category, action, label, value) {
          var data = {
            hitType: "event",
            eventCategory: category,
            eventAction: action,
          };
          if (label) {
            data.eventLabel = label;
          }
          if (value) {
            data.eventValue = value;
          }
          send(data);
        }
        function create(identifier, options) {
          trackingID = identifier;
          if (cookies.isAccepted("analytics")) {
            window.ga(
              "create",
              trackingID,
              options || { cookieExpires: 31536000 },
            );
          }
        }
        function getContext() {
          var context = { href: window.location.href, trackingID: trackingID };
          if (window.ga.getByName) {
            var tracker = window.ga.getByName("t0");
            if (tracker) {
              context.clientID = tracker.get("clientId");
            } else {
              console.warn("No tracker found, possibly due to an add blocker.");
            }
          }
          return context;
        }
        return {
          create: create,
          send: send,
          sendEvent: sendEvent,
          getContext: getContext,
        };
      },
    ];
  });
  app.directive("rbsWebsiteGoogleAnalytics", [
    "RbsChange.GoogleAnalytics",
    "$rootScope",
    "$timeout",
    function (GoogleAnalytics, $rootScope, $timeout) {
      return {
        restrict: "A",
        link: function (scope, elm, attr) {
          GoogleAnalytics.create(attr.identifier);
          $rootScope.$on("analytics", function (event, args) {
            if (args && args.category && args.action) {
              GoogleAnalytics.sendEvent(
                args.category,
                args.action,
                args.label,
                args.value,
              );
            } else if (angular.isObject(args)) {
              angular.copy(GoogleAnalytics.getContext(), args);
            }
          });
          $timeout(function () {
            GoogleAnalytics.send({ hitType: "pageview" });
            GoogleAnalytics.getContext();
          });
        },
      };
    },
  ]);
  app.directive("rbsWebsiteEventAnalytics", [
    "RbsChange.GoogleAnalytics",
    function (GoogleAnalytics) {
      return {
        restrict: "A",
        link: function (scope, elm, attr) {
          if (attr.analyticsTrigger === "link") {
            var category = attr.analyticsCategory || "element";
            var action = "" + attr.rbsWebsiteEventAnalytics;
            if (action === "") {
              action = "view";
            }
            var label = "" + attr.analyticsLabel;
            var value = parseInt(attr.analyticsValue);
            GoogleAnalytics.sendEvent(
              category,
              action,
              label !== "" ? label : null,
              isNaN(value) ? null : value,
            );
          } else {
            elm.on("click", function () {
              var category = attr.analyticsCategory || "element";
              var action = "" + attr.rbsWebsiteEventAnalytics;
              if (action === "") {
                action = "click";
              }
              var label = "" + attr.analyticsLabel;
              var value = parseInt(attr.analyticsValue);
              GoogleAnalytics.sendEvent(
                category,
                action,
                label !== "" ? label : null,
                isNaN(value) ? null : value,
              );
            });
          }
        },
      };
    },
  ]);
})(window);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsWebsiteResponsiveSummary", [
    "$rootScope",
    "$compile",
    "$q",
    "RbsChange.ResponsiveSummaries",
    rbsWebsiteResponsiveSummary,
  ]);
  function rbsWebsiteResponsiveSummary(
    $rootScope,
    $compile,
    $q,
    ResponsiveSummaries,
  ) {
    return {
      restrict: "A",
      scope: { blockNames: "@" },
      link: function (scope, elm, attrs) {
        scope.myvar = attrs.myvar;
        if (!scope.blockNames) {
          console.warn(
            "rbsWebsiteResponsiveSummary",
            "No defined block names!",
          );
          return;
        }
        var blockNames = scope.blockNames.split(/[\s,]+/);
        var container = elm.find(".responsive-summary");
        var compiledItems = {};
        scope.items = [];
        refreshItems();
        $rootScope.$on("ResponsiveSummaries.updated", refreshItems);
        function refreshItems() {
          var promises = [];
          scope.items = [];
          container.empty();
          var items = ResponsiveSummaries.getItems(blockNames);
          angular.forEach(items, function (item) {
            if (!item.name || !item.toCompile || !item.scope) {
              console.warn(
                "rbsWebsiteResponsiveSummary",
                "Invalid item!",
                item,
              );
              return;
            }
            var itemCopy = { name: item.name, options: item.options };
            if (compiledItems[item.name]) {
              itemCopy.compiledItem = compiledItems[item.name];
            } else {
              var promise = $q.defer();
              promises.push(promise);
              $compile(item.toCompile)(item.scope, function (element) {
                compiledItems[item.name] = element;
                itemCopy.compiledItem = element;
                promise.resolve(true);
              });
            }
            scope.items.push(itemCopy);
          });
          if (!promises.length) {
            appendCompiledItems();
          } else {
            $q.all(promises).then(function () {
              appendCompiledItems();
            });
          }
        }
        function appendCompiledItems() {
          for (var i = 0; i < scope.items.length; i++) {
            var item = scope.items[i];
            container.append(item.compiledItem);
          }
        }
      },
    };
  }
  app.directive("rbsWebsiteSwitchLang", [
    "RbsChange.ResponsiveSummaries",
    rbsWebsiteSwitchLang,
  ]);
  function rbsWebsiteSwitchLang(ResponsiveSummaries) {
    return {
      restrict: "A",
      link: function (scope) {
        if (scope.blockId) {
          scope.available = scope.available ? scope.available.split(",") : [];
          ResponsiveSummaries.registerItem(
            scope.blockId,
            scope,
            '<div data-rbs-website-switch-lang-responsive-summary=""></div>',
          );
        }
      },
    };
  }
  app.directive("rbsWebsiteSwitchLangResponsiveSummary", [
    "RbsChange.ModalStack",
    rbsWebsiteSwitchLangResponsiveSummary,
  ]);
  function rbsWebsiteSwitchLangResponsiveSummary(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/rbs-website-switch-lang-responsive-summary.twig",
      link: function (scope) {
        scope.onResponsiveSummaryClick = function () {
          var options = {
            templateUrl:
              "/rbs-website-switch-lang-responsive-summary-modal.twig",
            backdropClass:
              "modal-backdrop-rbs-website-switch-lang-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-rbs-website-switch-lang-responsive-summary",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
  app.directive("rbsWebsiteMenu", [
    "RbsChange.ResponsiveSummaries",
    "RbsChange.AjaxAPI",
    rbsWebsiteMenu,
  ]);
  function rbsWebsiteMenu(ResponsiveSummaries, AjaxAPI) {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        var blockId = attrs.blockId;
        if (blockId) {
          scope.menu = AjaxAPI.globalVar(blockId);
          scope.menu.typology =
            scope.menu.typology || AjaxAPI.globalVar(blockId + "-typology");
          scope.menu.croot =
            scope.menu.croot || AjaxAPI.globalVar(blockId + "-croot");
          ResponsiveSummaries.registerItem(
            blockId,
            scope,
            '<div data-rbs-website-menu-responsive-summary=""></div>',
          );
        }
      },
    };
  }
  app.directive("rbsWebsiteMenuResponsiveSummary", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    "$window",
    rbsWebsiteMenuResponsiveSummary,
  ]);
  function rbsWebsiteMenuResponsiveSummary(ModalStack, AjaxAPI, $window) {
    return {
      restrict: "A",
      templateUrl: "/rbs-website-menu-responsive-summary.twig",
      link: function (scope) {
        var userContext = window.__change.userContext;
        scope.accessorId = 0;
        if (userContext) {
          scope.accessorId = userContext.accessorId;
        }
        scope.logout = function () {
          AjaxAPI.getData("Rbs/User/Logout").then(
            function () {
              window.location.reload(true);
            },
            function (result) {
              scope.error = result.data.message;
            },
          );
        };
        scope.onResponsiveSummaryClick = function () {
          var options = {
            templateUrl: "/rbs-website-menu-responsive-summary-modal.twig",
            backdropClass:
              "modal-backdrop-data-rbs-website-menu-responsive-summary",
            windowClass:
              "modal-responsive-summary modal-data-rbs-website-menu-responsive-summary zento-modal",
            scope: scope,
          };
          ModalStack.open(options);
        };
      },
    };
  }
  app.directive("zentoMenuContextualMobileChild", [
    "RbsChange.ModalStack",
    zentoMenuContextualMobileChild,
  ]);
  function zentoMenuContextualMobileChild(ModalStack) {
    return {
      restrict: "A",
      templateUrl: "/zento-menu-contextual-mobile-child.twig",
      link: function (scope, element, attrs) {
        scope.toggle = function (evt) {
          scope.$emit("toggle", scope.child);
        };
      },
    };
  }
  app.directive("zentoMenuContextualMobile", [
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    zentoMenuContextualMobile,
  ]);
  function zentoMenuContextualMobile(ModalStack, AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/zento-menu-contextual-mobile.twig",
      link: function (scope, element, attrs) {
        var blockId = scope.blockId;
        scope.menu = AjaxAPI.globalVar("contextualMenu");
        scope.tmpPath = [];
        function resetChildsState(root, init = false) {
          if (!root.children) {
            return;
          }
          root.children.forEach((child) => {
            if (init) {
              child.isInTmpPath = child.isInPath;
              if (child.isInTmpPath) scope.tmpPath.push(child.documentId);
            } else {
              child.isInTmpPath = scope.tmpPath.some(
                (id) => id === child.documentId,
              );
            }
            resetChildsState(child, init);
          });
        }
        resetChildsState(scope.menu.croot, true);
        scope.$on("toggle", function (payload) {
          if (
            scope.tmpPath.find(
              (id) => id === payload.targetScope.child.documentId,
            )
          ) {
            scope.tmpPath = scope.tmpPath.filter(
              (id) => id !== payload.targetScope.child.documentId,
            );
          } else {
            scope.tmpPath.push(payload.targetScope.child.documentId);
          }
          resetChildsState(scope.menu.croot, false);
        });
      },
    };
  }
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsCatalogSimpleProductController", [
    "$scope",
    "$element",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    RbsCatalogSimpleProductController,
  ]);
  function RbsCatalogSimpleProductController(
    scope,
    $element,
    ModalStack,
    ProductService,
  ) {
    initProductDetailScope(scope, $element, ModalStack, ProductService);
  }
  app.controller("RbsCatalogVariantProductController", [
    "$scope",
    "$element",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    RbsCatalogVariantProductController,
  ]);
  function RbsCatalogVariantProductController(
    scope,
    $element,
    ModalStack,
    ProductService,
  ) {
    initProductDetailScope(scope, $element, ModalStack, ProductService);
  }
  app.directive("rbsCatalogVariantSelector", [
    "RbsChange.AjaxAPI",
    "$rootScope",
    rbsCatalogVariantSelector,
  ]);
  function rbsCatalogVariantSelector(AjaxAPI, $rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-variant-selector.twig",
      replace: false,
      scope: {
        productData: "=",
        ajaxData: "=",
        ajaxParams: "=",
        parameters: "=",
      },
      link: function (scope) {
        scope.visualReady = true;
        scope.selectedAxesValues = [];
        scope.axesItems = [];
        scope.loadProductId = null;
        scope.loadedProducts = {};
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
          if (
            scope.originalProductData === null &&
            angular.isObject(productData) &&
            angular.isObject(productData.common)
          ) {
            scope.productData = productData;
            scope.originalProductData = scope.productData;
            scope.rootProductData =
              scope.productData.rootProduct || scope.productData;
            if (productData["typology"]["attributes"]["guide_tailles"]) {
              scope.guidTails =
                productData["typology"]["attributes"]["guide_tailles"];
              scope.valueGuidTails =
                productData["typology"]["attributes"]["guide_tailles"]["value"];
            }
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
        function compareAxesValues(axesValues, expectedValues, compareType) {
          var i;
          if (!compareType || compareType === "=") {
            if (axesValues.length === expectedValues.length) {
              for (i = 0; i < axesValues.length; i++) {
                if (axesValues[i] != expectedValues[i]) {
                  return false;
                }
              }
              return true;
            }
            return false;
          } else if (compareType === "<") {
            if (axesValues.length === expectedValues.length - 1) {
              for (i = 0; i < axesValues.length; i++) {
                if (axesValues[i] != expectedValues[i]) {
                  return false;
                }
              }
              return true;
            }
            return false;
          } else if (compareType === "<<") {
            if (axesValues.length < expectedValues.length) {
              for (i = 0; i < axesValues.length; i++) {
                if (axesValues[i] != expectedValues[i]) {
                  return false;
                }
              }
              return true;
            }
            return false;
          }
          return false;
        }
        function getChildrenAxesValues(axesValue) {
          var indexedValues = {},
            childrenValues = [],
            childAxisIndex = axesValue.length,
            variantProducts = scope.rootProductData.variants.products;
          for (var i = 0; i < variantProducts.length; i++) {
            var variantAxesValue = variantProducts[i].axesValues;
            if (compareAxesValues(axesValue, variantAxesValue, "<<")) {
              var axisValue = variantAxesValue[childAxisIndex];
              if (!indexedValues.hasOwnProperty(axisValue)) {
                indexedValues[axisValue] = true;
                childrenValues.push(axisValue);
              }
            }
          }
          return childrenValues;
        }
        function getAxisItem(axesValue) {
          var index = axesValue.length - 1;
          var axisItem = {
            value: axesValue[index],
            title: axesValue[index],
            lastAxis:
              axesValue.length ===
              scope.rootProductData.variants["axes"].length,
          };
          var variantProducts = scope.rootProductData.variants.products;
          var variantAxesValue;
          for (var i = 0; i < variantProducts.length; i++) {
            if (
              compareAxesValues(axesValue, variantProducts[i].axesValues, "=")
            ) {
              variantAxesValue = variantProducts[i];
              angular.extend(axisItem, variantAxesValue);
            }
          }
          var axis = scope.rootProductData.variants["axes"][index];
          if (axis["defaultItems"] && axis["defaultItems"].length) {
            for (i = 0; i < axis["defaultItems"].length; i++) {
              if (axis["defaultItems"][i].value == axisItem.value) {
                axisItem.title = axis["defaultItems"][i].title;
                break;
              }
            }
          }
          return axisItem;
        }
        function getAxisItems(axesValue, values) {
          var axisItems = [];
          for (var i = 0; i < values.length; i++) {
            axesValue.push(values[i]);
            axisItems.push(getAxisItem(axesValue));
            axesValue.pop();
          }
          return axisItems;
        }
        scope.variantChanged = function (axisIndex) {
          scope.selectedAxesValues.length =
            axisIndex + (scope.selectedAxesValues[axisIndex] !== null ? 1 : 0);
        };
        function selectProduct(productId) {
          scope.visualReady = false;
          if (scope.loadedProducts[productId]) {
            destroySliderSlick();
            scope.productData = scope.loadedProducts[productId];
            window.__change.variantSelected = scope.productData;
            $rootScope.$emit("variantSelected", scope.productData);
          } else if (productId == scope.originalProductData.common.id) {
            scope.productData = scope.originalProductData;
            window.__change.variantSelected = scope.productData;
            $rootScope.$emit("variantSelected", scope.productData);
          } else if (productId == scope.rootProductData.common.id) {
            scope.productData = scope.rootProductData;
            window.__change.variantSelected = scope.productData;
            $rootScope.$emit("variantSelected", scope.productData);
          } else if (scope.loadProductId != productId) {
            destroySliderSlick();
            scope.loadProductId = productId;
            AjaxAPI.getData(
              "Rbs/Catalog/Product/" + productId,
              scope.ajaxData,
              scope.ajaxParams,
            ).then(
              function (result) {
                var productData = result.data.dataSets,
                  loadProductId = productData.common.id;
                productData.rootProduct = scope.rootProductData;
                scope.loadedProducts[loadProductId] = productData;
                if (loadProductId == scope.loadProductId) {
                  scope.productData = productData;
                }
                window.__change.variantSelected = productData;
                $rootScope.$emit("variantSelected", productData);
              },
              function (result) {
                scope.error = result.data.message;
                console.error("Rbs/Catalog/Product/" + productId, result);
              },
            );
          }
        }
        function getVariantByAxesValue(axesValue) {
          var variantProducts = scope.rootProductData.variants.products;
          for (var i = 0; i < variantProducts.length; i++) {
            if (
              compareAxesValues(axesValue, variantProducts[i].axesValues, "=")
            ) {
              return variantProducts[i];
            }
          }
          return null;
        }
      },
    };
  }
  app.directive("rbsCatalogAxisValueSelector", [
    "$compile",
    rbsCatalogAxisValueSelector,
  ]);
  function rbsCatalogAxisValueSelector($compile) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-axis-value-selector.twig",
      scope: true,
      link: function (scope, element) {
        var directiveName = scope.axis.renderingMode || "select";
        if (!directiveName) {
          console.error("No rendering mode for axis!", scope.facet);
        } else if (directiveName.indexOf("-") < 0) {
          directiveName = "rbs-catalog-axis-value-selector-" + directiveName;
        }
        var container = element.find(".axis-value-selector-container");
        container.html("<div data-" + directiveName + '=""></div>');
        $compile(container.contents())(scope);
      },
    };
  }
  app.directive(
    "rbsCatalogAxisValueSelectorSelect",
    rbsCatalogAxisValueSelectorSelect,
  );
  function rbsCatalogAxisValueSelectorSelect() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-axis-value-selector-select.twig",
      scope: false,
    };
  }
  app.directive(
    "rbsCatalogAxisValueSelectorSwatch",
    rbsCatalogAxisValueSelectorSwatch,
  );
  function rbsCatalogAxisValueSelectorSwatch() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-axis-value-selector-swatch.twig",
      scope: false,
    };
  }
  app.directive(
    "rbsCatalogAxisValueSelectorSwatchItem",
    rbsCatalogAxisValueSelectorSwatchItem,
  );
  function rbsCatalogAxisValueSelectorSwatchItem() {
    return {
      restrict: "A",
      scope: true,
      link: function (scope, element, attributes) {
        var value = scope.option.value;
        var item;
        if (scope.axis.defaultItems) {
          for (var i = 0; i < scope.axis.defaultItems.length; i++) {
            if (scope.axis.defaultItems[i].value == value) {
              item = scope.axis.defaultItems[i];
              break;
            }
          }
        }
        if (!angular.isObject(item) || !angular.isObject(item.skin)) {
          if (angular.isObject(scope.option)) {
            scope.ngTooltip = scope.option.title || scope.option.value;
          }
          return;
        }
        scope.item = item;
        var visualFormat = attributes["visualFormat"] || "selectorItem";
        var background = item.skin.colorCode || "";
        if (item.skin.visual && item.skin.visual[visualFormat]) {
          background +=
            ' url("' +
            item.skin.visual[visualFormat] +
            '") no-repeat center center / contain';
        }
        scope.ngStyle = { background: background };
        scope.ngTooltip = item.title || item.value;
      },
    };
  }
  app.directive(
    "rbsCatalogAxisValueSelectorButtons",
    rbsCatalogAxisValueSelectorButtons,
  );
  function rbsCatalogAxisValueSelectorButtons() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-axis-value-selector-buttons.twig",
      scope: false,
    };
  }
  app.directive(
    "rbsCatalogAxisValueSelectorButtonsItem",
    rbsCatalogAxisValueSelectorButtonsItem,
  );
  function rbsCatalogAxisValueSelectorButtonsItem() {
    return {
      restrict: "A",
      scope: true,
      link: function (scope) {
        var item;
        if (scope.axis.defaultItems) {
          var value = scope.option.value;
          for (var i = 0; i < scope.axis.defaultItems.length; i++) {
            if (scope.axis.defaultItems[i].value == value) {
              item = scope.axis.defaultItems[i];
              break;
            }
          }
        }
        if (angular.isObject(item)) {
          scope.item = item;
          scope.ngTooltip = item.title || item.value;
        } else {
          scope.ngTooltip = scope.option.title || scope.option.value;
        }
      },
    };
  }
  app.directive("rbsCatalogAxisOptionClass", [
    "$parse",
    rbsCatalogAxisOptionClass,
  ]);
  function rbsCatalogAxisOptionClass($parse) {
    return {
      require: "select",
      link: function (scope, elem, attrs) {
        var optionsSourceStr = attrs.ngOptions.split(" ").pop();
        var getOptionsClass = $parse(attrs["rbsCatalogAxisOptionClass"]);
        scope.$watchCollection(optionsSourceStr, function (items) {
          scope.$$postDigest(function () {
            angular.forEach(items, function (item, index) {
              var classes = getOptionsClass(item);
              var option = elem.find(
                'option[value="string:' + item.value + '"]',
              );
              angular.forEach(classes, function (add, className) {
                if (add) {
                  option.addClass(className);
                } else {
                  option.removeClass(className);
                }
              });
            });
          });
        });
      },
    };
  }
  app.controller("RbsCatalogProductSetController", [
    "$scope",
    "$element",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    "RbsChange.AjaxAPI",
    RbsCatalogProductSetController,
  ]);
  function RbsCatalogProductSetController(
    scope,
    $element,
    ModalStack,
    ProductService,
    AjaxAPI,
  ) {
    initProductDetailScope(scope, $element, ModalStack, ProductService);
    scope.itemsToAdd = [];
    scope.addToCartData = {};
    function disableCheck(productData) {
      if (
        !productData ||
        !productData.cartBox ||
        !productData.cartBox.allCategories.allowed
      ) {
        return true;
      }
      return productData.cartBox.allCategories.disabled;
    }
    if (scope.productData.productSet && scope.productData.productSet.products) {
      angular.forEach(
        scope.productData.productSet.products,
        function (productData) {
          if (disableCheck(productData)) {
            scope.itemsToAdd.push(null);
            productData.cartBox.allCategories.checked = false;
          } else {
            productData.cartBox.allCategories.checked = true;
            scope.itemsToAdd.push(productData);
          }
        },
      );
      refreshData(scope);
    }
    scope.$on("setItemChanged", function (event, itemIndex, productData) {
      if (angular.isFunction(event.stopPropagation)) {
        event.stopPropagation();
        if (
          disableCheck(productData) ||
          !productData.cartBox.allCategories.checked
        ) {
          scope.itemsToAdd[itemIndex] = null;
        } else {
          scope.itemsToAdd[itemIndex] = productData;
        }
        refreshData(scope);
      }
    });
    var modalOption = scope.getStoreAvailabilityModalOption;
    scope.getStoreAvailabilityModalOption = function (
      allowSelect,
      forReservation,
    ) {
      var result = modalOption(allowSelect, forReservation);
      result.resolve.skuQuantities = function () {
        return scope.productData.cartBox.skuQuantities;
      };
      return result;
    };
    scope.populateAddProductData = function (addProductData) {
      var line = addProductData.lines[0];
      angular.forEach(scope.itemsToAdd, function (productData) {
        if (productData && productData.cartBox.allCategories.checked) {
          var lineData = angular.extend({}, line, {
            productId: productData.common.id,
            quantity: productData.cartBox.quantity || 0,
          });
          addProductData.lines.push(lineData);
        }
      });
    };
    scope.onAddProductSuccess = function (response) {
      var categories = null,
        successModalUrl = null;
      var items = response.data.items;
      if (items && items.length > 1) {
        angular.forEach(items, function (item) {
          if (!categories && item.categories) {
            categories = item.categories;
          }
        });
        if (categories) {
          scope.openExtendedCartBoxModal(categories);
        }
      } else {
        var cart = response.data.dataSets;
        if (cart && cart.linesAdded && cart.linesAdded.length) {
          angular.forEach(cart.linesAdded, function (item) {
            if (!successModalUrl && item.successModalURL) {
              successModalUrl = item.successModalURL;
            }
          });
          if (successModalUrl) {
            scope.openAddedToCartModal(
              successModalUrl + "&itemCount=" + cart.linesAdded.length,
            );
          }
        }
      }
    };
    function refreshData(scope) {
      scope.addToCartData.hasItemsToAdd = false;
      scope.productData.price.baseValueWithTax = 0;
      scope.productData.price.baseValueWithoutTax = 0;
      scope.productData.price.valueWithTax = 0;
      scope.productData.price.valueWithoutTax = 0;
      scope.productData.price.hasDifferentPrices = false;
      if (scope.productData.storePrice) {
        scope.productData.storePrice.baseValueWithTax = 0;
        scope.productData.storePrice.baseValueWithoutTax = 0;
        scope.productData.storePrice.valueWithTax = 0;
        scope.productData.storePrice.valueWithoutTax = 0;
        scope.productData.storePrice.hasDifferentPrices = false;
      }
      scope.productData.mergedPrice.baseValueWithTax = 0;
      scope.productData.mergedPrice.baseValueWithoutTax = 0;
      scope.productData.mergedPrice.valueWithTax = 0;
      scope.productData.mergedPrice.valueWithoutTax = 0;
      scope.productData.mergedPrice.hasDifferentPrices = false;
      scope.productData.stock = { minQuantity: 0, maxQuantity: 1, step: 1 };
      var cartBox = scope.productData.cartBox;
      cartBox.allCategories = { allowed: false };
      cartBox.shippingCategories = { allowed: false };
      cartBox.storeCategories = { allowed: false };
      var skuQuantities = {};
      var skuQuantitiesById = {};
      var init = false;
      for (var i = 0; i < scope.itemsToAdd.length; i++) {
        var itemData = scope.itemsToAdd[i];
        if (!itemData || !itemData.cartBox.allCategories.allowed) {
          continue;
        }
        if (!init) {
          init = true;
          angular.extend(cartBox.allCategories, itemData.cartBox.allCategories);
          angular.extend(
            cartBox.shippingCategories,
            itemData.cartBox.shippingCategories || {},
          );
          angular.extend(
            cartBox.storeCategories,
            itemData.cartBox.storeCategories || {},
          );
        }
        if (
          cartBox.shippingCategories.allowed &&
          !cartBox.shippingCategories.disabled
        ) {
          if (!itemData.cartBox.shippingCategories) {
            cartBox.shippingCategories.allowed = false;
            cartBox.shippingCategories.disabled = true;
          } else {
            cartBox.shippingCategories.allowed =
              itemData.cartBox.shippingCategories.allowed;
            cartBox.shippingCategories.disabled =
              itemData.cartBox.shippingCategories.disabled;
          }
          cartBox.allCategories.allowed =
            itemData.cartBox.allCategories.allowed;
          cartBox.allCategories.disabled =
            itemData.cartBox.allCategories.disabled;
        }
        if (
          cartBox.storeCategories.allowed &&
          !cartBox.storeCategories.disabled
        ) {
          if (!itemData.cartBox.storeCategories) {
            cartBox.storeCategories.allowed = false;
            cartBox.storeCategories.disabled = true;
          } else {
            cartBox.storeCategories.allowed =
              itemData.cartBox.storeCategories.allowed;
            cartBox.storeCategories.disabled =
              itemData.cartBox.storeCategories.disabled;
          }
          cartBox.allCategories.allowed =
            itemData.cartBox.allCategories.allowed;
          cartBox.allCategories.disabled =
            itemData.cartBox.allCategories.disabled;
        }
        var quantity = itemData.cartBox.quantity || itemData.stock.minQuantity;
        if (!itemData.cartBox.allCategories.disabled) {
          skuQuantities[itemData.stock.sku] = quantity;
          skuQuantitiesById[itemData.stock.skuId] = quantity;
        }
        scope.addToCartData.hasItemsToAdd = true;
      }
      var data = {
        skuQuantities: skuQuantitiesById,
        webStoreId: scope.parameters.webStoreId,
        storeId: scope.parameters.storeId,
        billingAreaId: scope.parameters.billingAreaId,
        zone: scope.parameters.zone,
      };
      var params = {};
      AjaxAPI.getData(
        "Rbs/Catalog/EstimatePriceForSkuQuantities",
        data,
        params,
      ).then(
        function (result) {
          var dataSets = result.data.dataSets || {};
          if (dataSets.webStoreData && dataSets.webStoreData.totalAmounts) {
            scope.productData.price.baseValueWithTax =
              dataSets.webStoreData.totalAmounts.baseValueWithTax;
            scope.productData.price.baseValueWithoutTax =
              dataSets.webStoreData.totalAmounts.baseValueWithoutTax;
            scope.productData.price.valueWithTax =
              dataSets.webStoreData.totalAmounts.valueWithTax;
            scope.productData.price.valueWithoutTax =
              dataSets.webStoreData.totalAmounts.valueWithoutTax;
          }
          if (dataSets.storeData && dataSets.storeData.totalAmounts) {
            scope.productData.storePrice.baseValueWithTax =
              dataSets.storeData.totalAmounts.baseValueWithTax;
            scope.productData.storePrice.baseValueWithoutTax =
              dataSets.storeData.totalAmounts.baseValueWithoutTax;
            scope.productData.storePrice.valueWithTax =
              dataSets.storeData.totalAmounts.valueWithTax;
            scope.productData.storePrice.valueWithoutTax =
              dataSets.storeData.totalAmounts.valueWithoutTax;
          }
          if (dataSets.mergedData && dataSets.mergedData.totalAmounts) {
            scope.productData.mergedPrice.baseValueWithTax =
              dataSets.mergedData.totalAmounts.baseValueWithTax;
            scope.productData.mergedPrice.baseValueWithoutTax =
              dataSets.mergedData.totalAmounts.baseValueWithoutTax;
            scope.productData.mergedPrice.valueWithTax =
              dataSets.mergedData.totalAmounts.valueWithTax;
            scope.productData.mergedPrice.valueWithoutTax =
              dataSets.mergedData.totalAmounts.valueWithoutTax;
          }
        },
        function (result) {
          console.error("Rbs/Catalog/EstimatePriceForSkuQuantities", result);
        },
      );
      if (
        scope.productData.price.valueWithTax ===
        scope.productData.price.baseValueWithTax
      ) {
        scope.productData.price.baseValueWithTax = null;
      }
      if (
        scope.productData.price.valueWithoutTax ===
        scope.productData.price.baseValueWithoutTax
      ) {
        scope.productData.price.baseValueWithoutTax = null;
      }
      cartBox.skuQuantities = skuQuantities;
    }
  }
  app.directive("rbsCatalogProductSetItemSimple", [
    "RbsChange.ProductService",
    rbsCatalogProductSetItemSimple,
  ]);
  function rbsCatalogProductSetItemSimple(ProductService) {
    return {
      restrict: "A",
      scope: true,
      link: function (scope, elm, attrs) {
        var itemIndex = attrs["itemIndex"];
        scope.productSetData = scope.productData;
        scope.productData =
          scope.productSetData["productSet"]["products"][itemIndex];
        scope.rootProductData = scope.productData;
        scope.pictograms = ProductService.extractPictogram(scope.productData);
        scope.animations = ProductService.extractAnimations(scope.productData);
        scope.visuals = ProductService.extractVisuals(scope.productData);
        scope.brand = ProductService.extractBrand(scope.productData);
        scope.url = ProductService.extractURL(scope.productData);
        scope.disableCheck = function () {
          var productData = scope.productData;
          if (
            !productData ||
            !productData.cartBox ||
            !productData.cartBox.allCategories.allowed
          ) {
            return true;
          }
          return productData.cartBox.allCategories.disabled;
        };
        var cartBox = scope.productData.cartBox;
        if (cartBox) {
          cartBox.quantity =
            cartBox.quantity ||
            (scope.productData.stock && scope.productData.stock.minQuantity);
        }
        if (
          !scope.productData.cartBox.allCategories.hasOwnProperty("checked")
        ) {
          scope.productData.cartBox.allCategories.checked =
            !scope.disableCheck();
        }
        scope.onCheck = function () {
          scope.$emit("setItemChanged", itemIndex, scope.productData);
        };
      },
    };
  }
  app.directive("rbsCatalogProductSetItemVariant", [
    "RbsChange.ProductService",
    rbsCatalogProductSetItemVariant,
  ]);
  function rbsCatalogProductSetItemVariant(ProductService) {
    return {
      restrict: "A",
      scope: true,
      link: function (scope, elm, attrs) {
        var itemIndex = attrs["itemIndex"];
        scope.productSetData = scope.productData;
        scope.productData =
          scope.productSetData["productSet"]["products"][itemIndex];
        scope.rootProductData =
          scope.productData.rootProduct || scope.productData;
        scope.pictograms = ProductService.extractPictogram(scope.productData);
        scope.animations = ProductService.extractAnimations(scope.productData);
        scope.visuals = null;
        scope.brand = null;
        scope.url = null;
        scope.disableCheck = function () {
          var productData = scope.productData;
          if (
            !productData ||
            !productData.cartBox ||
            !productData.cartBox.allCategories.allowed
          ) {
            return true;
          }
          return productData.cartBox.allCategories.disabled;
        };
        scope.$watch("productData", function (productData, oldValue) {
          if (productData) {
            scope.visuals = ProductService.extractVisuals(productData);
            scope.brand = ProductService.extractBrand(scope.productData);
            scope.pictograms = ProductService.extractPictogram(productData);
            scope.animations = ProductService.extractAnimations(productData);
            scope.url = ProductService.extractURL(productData);
            if (
              !scope.productData.cartBox.allCategories.hasOwnProperty("checked")
            ) {
              scope.productData.cartBox.allCategories.checked =
                !scope.disableCheck();
            }
            var cartBox = productData.cartBox;
            if (cartBox) {
              cartBox.quantity =
                cartBox.quantity ||
                (productData.stock && productData.stock.minQuantity);
            }
          }
          if (productData !== oldValue) {
            scope.$emit("setItemChanged", itemIndex, productData);
          }
        });
        scope.onCheck = function () {
          scope.$emit("setItemChanged", itemIndex, scope.productData);
        };
      },
    };
  }
  app.directive("rbsCatalogProductPrice", [
    "$rootScope",
    rbsCatalogProductPrice,
  ]);
  function rbsCatalogProductPrice($rootScope) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-price.twig",
      link: function (scope, elm, attrs) {
        if (!scope.rbsCatalogPriceMode) {
          scope.rbsCatalogPriceMode = attrs.mode || "web";
        }
        $rootScope.$on("myEvent", function (evt, mode) {
          scope.rbsCatalogPriceMode = mode;
        });
      },
    };
  }
  app.directive("rbsCatalogProductSpecifications", [
    "$filter",
    rbsCatalogProductSpecifications,
  ]);
  function rbsCatalogProductSpecifications($filter) {
    return {
      restrict: "A",
      scope: true,
      link: function (scope) {
        scope.sections = [];
        scope.$watch("productData", function (productData) {
          scope.sections = $filter("rbsVisibleAttributes")(
            productData,
            "specifications",
            "group",
          );
        });
      },
    };
  }
  app.directive(
    "rbsCatalogProductSpecificationsTable",
    rbsCatalogProductSpecificationsTable,
  );
  function rbsCatalogProductSpecificationsTable() {
    return {
      restrict: "A",
      link: function (scope) {
        scope.tableRows = [];
        scope.$watch(
          "sections",
          function (sections) {
            scope.tableRows = [];
            angular.forEach(sections, function (section) {
              scope.tableRows.push({ isSectionTitle: true, section: section });
              angular.forEach(section.attributes, function (attribute) {
                scope.tableRows.push(attribute);
              });
            });
          },
          true,
        );
      },
    };
  }
  app.directive(
    "rbsCatalogProductSpecificationsFlat",
    rbsCatalogProductSpecificationsFlat,
  );
  function rbsCatalogProductSpecificationsFlat() {
    return {
      restrict: "A",
      link: function (scope) {
        scope.flatRows = [];
        scope.$watch(
          "sections",
          function (sections) {
            scope.flatRows = [];
            scope.flatRowsFormatted = [];
            scope.flatRowsImages = [];
            if (scope.productData.common.brand) {
              scope.brand = scope.productData.common.brand.common;
            }
            var index = 0;
            var index_formatted = 0;
            angular.forEach(sections, function (section) {
              angular.forEach(section.attributes, function (attribute) {
                if (index != 0 && index % 9 == 0) index_formatted++;
                if (!scope.flatRowsFormatted[index_formatted])
                  scope.flatRowsFormatted[index_formatted] = [];
                if (attribute.type != "DocumentId") {
                  scope.flatRowsFormatted[index_formatted].push(attribute);
                  index++;
                } else {
                  scope.flatRowsImages.push(attribute);
                }
                scope.flatRows.push(attribute);
              });
            });
            angular.forEach(scope.flatRowsFormatted, function (attributes) {
              angular.forEach(attributes, function (attribute) {
                if (
                  attribute.key == "attr_102043" &&
                  attribute.value.indexOf("à partir de ") === -1
                ) {
                  attribute.value = "à partir de " + attribute.value;
                }
              });
            });
          },
          true,
        );
      },
    };
  }
  app.controller("RbsCatalogProductInformationController", [
    "$filter",
    "$scope",
    "RbsChange.ProductService",
    function ($filter, scope, ProductService) {
      scope.$watch("productData", function () {
        scope.specificInformation = $filter("rbsVisibleAttributes")(
          scope.productData,
          "information",
          "flat",
        );
        scope.specificationsDisplayMode =
          scope.blockParameters.specificationsDisplayMode || "table";
        if (
          scope.specificationsDisplayMode &&
          scope.specificationsDisplayMode !== "none"
        ) {
          scope.specifications = $filter("rbsVisibleAttributes")(
            scope.productData,
            "specifications",
            "group",
          );
        }
        scope.specificationsTitle = ProductService.extractSpecificationsTitle(
          scope.productData,
        );
      });
    },
  ]);
  app.directive(
    "rbsCatalogProductInformationAccordion",
    rbsCatalogProductInformationAccordion,
  );
  function rbsCatalogProductInformationAccordion() {
    return {
      restrict: "A",
      link: function (scope, elm) {
        scope.baseId = "block-" + scope.blockId + "-information-accordion";
        var selector = "#" + scope.baseId + "-reviews";
        scope.$on("showReviews", function (event, blockId) {
          if (blockId == scope.blockId) {
            elm.find(selector).collapse("show");
            jQuery("html, body").animate(
              {
                scrollTop:
                  elm.find('a[href="' + selector + '"]').offset().top - 20,
              },
              1000,
            );
          }
        });
      },
    };
  }
  app.directive(
    "rbsCatalogProductInformationFlat",
    rbsCatalogProductInformationFlat,
  );
  function rbsCatalogProductInformationFlat() {
    return {
      restrict: "A",
      link: function (scope, elm) {
        scope.baseId = "block-" + scope.blockId + "-information-flat";
        var selector = "#" + scope.baseId + "-reviews";
        scope.$on("showReviews", function (event, blockId) {
          if (blockId == scope.blockId) {
            jQuery("html, body").animate(
              { scrollTop: elm.find(selector).offset().top - 20 },
              1000,
            );
          }
        });
      },
    };
  }
  app.directive(
    "rbsCatalogProductInformationTabs",
    rbsCatalogProductInformationTabs,
  );
  function rbsCatalogProductInformationTabs() {
    return {
      restrict: "A",
      link: function (scope, elm) {
        scope.baseId = "block-" + scope.blockId + "-information-tab";
        var selector = 'a[href="#' + scope.baseId + '-reviews"]';
        scope.$on("showReviews", function (event, blockId) {
          if (blockId == scope.blockId) {
            elm.find(selector).tab("show");
            jQuery("html, body").animate(
              { scrollTop: elm.find(selector).offset().top - 20 },
              1000,
            );
          }
        });
      },
    };
  }
  app.directive("rbsCatalogProductAnimations", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-animations.twig",
      link: function (scope, elm) {},
    };
  });
  function initProductDetailScope(scope, $element, ModalStack, ProductService) {
    scope.parameters = scope.blockParameters;
    scope.productData = scope.blockData;
    scope.productAjaxData = {};
    scope.productAjaxParams = {};
    scope.pricesConfiguration = {};
    if (scope.parameters) {
      delete scope.blockParameters;
      delete scope.blockData;
      scope.productAjaxData.webStoreId = scope.parameters.webStoreId;
      scope.productAjaxData.billingAreaId = scope.parameters.billingAreaId;
      scope.productAjaxData.zone = scope.parameters.zone;
      scope.productAjaxData.storeId = scope.parameters.storeId;
      scope.productAjaxData.quickBuyPageFunction =
        scope.parameters.quickBuyPageFunction;
      scope.productAjaxData.productAvailabilityNotificationPageFunction =
        scope.parameters.productAvailabilityNotificationPageFunction;
      scope.productAjaxData.handleWebStorePrices =
        scope.parameters.handleWebStorePrices;
      scope.productAjaxData.handleStorePrices =
        scope.parameters.handleStorePrices;
      scope.productAjaxParams.visualFormats = scope.parameters["imageFormats"];
      scope.productAjaxParams.URLFormats = "canonical,contextual";
      window.__change["productAjaxData"] = scope.productAjaxData;
      scope.pricesConfiguration.handleWebStorePrices =
        scope.parameters.handleWebStorePrices;
      scope.pricesConfiguration.handleStorePrices =
        scope.parameters.handleStorePrices;
      scope.pricesConfiguration.displayPricesWithTax =
        scope.parameters.displayPricesWithTax;
      scope.pricesConfiguration.displayPricesWithoutTax =
        scope.parameters.displayPricesWithoutTax;
    }
    scope.pictograms = null;
    scope.visuals = null;
    scope.$watch("productData", function (productData) {
      if (productData) {
        scope.pictograms = ProductService.extractPictogram(productData);
        scope.visuals = ProductService.extractVisuals(productData);
        var bp = scope.blockParameters;
        scope.animations = ProductService.extractAnimations(
          productData,
          bp && bp["showAnimationPictogram"],
        );
      }
    });
    scope.onSelectStore = function (storeData) {
      if (!scope.productAjaxData.storeId) {
        scope.$emit("rbsStorelocatorChooseStore", storeData.common.id);
      }
    };
    scope.getStoreAvailabilityModalOption = function (
      selectStoreCallBack,
      forReservation,
    ) {
      return {
        templateUrl: "/rbs-catalog-show-store-availability-modal.twig",
        backdropClass: "modal-backdrop-rbs-catalog-show-store-availability",
        windowClass: "modal-rbs-catalog-show-store-availability",
        size: "lg",
        controller: "RbsCatalogShowStoreAvailabilityModalCtrl",
        resolve: {
          skuQuantities: function () {
            var skuQuantities = {};
            skuQuantities[scope.productData.stock.sku] =
              scope.productData.stock.minQuantity;
            return skuQuantities;
          },
          selectStoreCallBack: function () {
            function resetZtoDeliveryButton() {
              selectStoreCallBack();
            }
            return selectStoreCallBack;
          },
          forReservation: function () {
            return forReservation === true;
          },
          forPickUp: function () {
            return forReservation === false;
          },
          currentStoreId: function () {
            return (
              (scope.productData.cartBox &&
                scope.productData.cartBox.storeCategories &&
                scope.productData.cartBox.storeCategories.storeId) ||
              scope.productAjaxData.storeId
            );
          },
          pricesConfiguration: function () {
            return scope.pricesConfiguration;
          },
        },
      };
    };
    scope.showStoreAvailability = function () {
      var options = scope.getStoreAvailabilityModalOption(false);
      ModalStack.open(options);
    };
    scope.reviewsAjaxData = {};
    scope.reviewsAjaxParams = {};
    scope.showReviews = function () {
      scope.$broadcast("showReviews", $element.attr("data-block-id"));
    };
    scope.__change = window.__change;
    if (scope.productData.common.reference) {
      window.localStorage.setItem(
        scope.productData.common.id,
        scope.productData.common.reference,
      );
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: "view_item",
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
              quantity: "1",
            },
          ],
        },
      });
    }
  }
})(jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsCatalogProductCartBoxController", [
    "$rootScope",
    "$scope",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    RbsCatalogProductCartBoxController,
  ]);
  function RbsCatalogProductCartBoxController(
    rootScope,
    scope,
    AjaxAPI,
    ModalStack,
    ProductService,
  ) {
    var productCartBoxHandler = new ProductCartBoxHandler(
      rootScope,
      scope,
      AjaxAPI,
      ModalStack,
      ProductService,
    );
    this.emptyCartBox = function () {
      return ProductCartBoxHandler.emptyCartBox;
    };
    this.buildAddedToCartModalContext = function (modalContentUrl) {
      return productCartBoxHandler.buildAddedToCartModalContext(
        modalContentUrl,
      );
    };
    this.buildExtendedCartBoxModalContext = function (category) {
      return productCartBoxHandler.buildExtendedCartBoxModalContext(category);
    };
    this.buildAddProductData = function (category, productData) {
      return productCartBoxHandler.buildAddProductData(category, productData);
    };
    this.addProduct = function (productData, category) {
      productCartBoxHandler.addProduct(productData, category);
    };
    scope.addAllCategoriesProduct = function () {
      return productCartBoxHandler.addProduct(
        scope.productData,
        "allCategories",
      );
    };
    scope.addShippingCategoriesProduct = function () {
      return productCartBoxHandler.addShippingCategoriesProduct();
    };
    scope.addStoreCategoriesProduct = function () {
      return productCartBoxHandler.addStoreCategoriesProduct();
    };
    scope.selectStore = function (forReservation) {
      productCartBoxHandler.selectStore(forReservation);
    };
    scope.openAddedToCartModal = function (modalContentUrl) {
      productCartBoxHandler.openAddedToCartModal(modalContentUrl);
    };
    scope.openExtendedCartBoxModal = function (categories) {
      productCartBoxHandler.openExtendedCartBoxModal(categories);
    };
    scope.addProductExtended = function (category) {
      return productCartBoxHandler.addProductExtended(category);
    };
    scope.buttonTitle = function (categoryData) {
      return productCartBoxHandler.buttonTitle(categoryData);
    };
    scope.currentDescription = function (categoryData) {
      if (categoryData && categoryData.description) {
        if (categoryData.disabled && categoryData.disabledDescription) {
          return categoryData.disabledDescription;
        }
        if (
          !categoryData.disabled &&
          categoryData.restockDescription &&
          isCategoryDataInRestockingMode(categoryData)
        ) {
          return categoryData.restockDescription;
        }
        return categoryData.description;
      }
      return "";
    };
  }
  app.directive("rbsCatalogProductCartBoxDual", rbsCatalogProductCartBoxDual);
  function rbsCatalogProductCartBoxDual() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-cart-box-dual.twig",
      controller: "RbsCatalogProductCartBoxController",
      controllerAs: "cartBoxController",
      link: {
        pre: function (scope) {
          scope.$watch("productData", function (productData, old) {
            if (productData !== old) {
              ProductCartBoxHandler.checkCapabilities(scope, productData);
            }
          });
          ProductCartBoxHandler.checkCapabilities(scope, scope.productData);
        },
      },
    };
  }
  app.directive(
    "rbsCatalogProductCartBoxSimple",
    rbsCatalogProductCartBoxSimple,
  );
  function rbsCatalogProductCartBoxSimple() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-cart-box-simple.twig",
      controller: "RbsCatalogProductCartBoxController",
      controllerAs: "cartBoxController",
      link: {
        pre: function (scope) {
          function checkCapabilities(productData) {
            if (
              !productData ||
              !productData.cartBox ||
              !productData.cartBox.allCategories
            ) {
              scope.cartBox = scope.cartBoxController.emptyCartBox();
              return;
            }
            var currentQuantity = scope.cartBox && scope.cartBox.quantity;
            scope.cartBox = productData.cartBox;
            scope.cartBox.minQuantity = productData.stock.minQuantity;
            scope.cartBox.step = productData.stock.step;
            scope.cartBox.maxQuantity = productData.stock.maxQuantity;
            if (scope.parameters.showQuantity) {
              scope.cartBox.quantity =
                currentQuantity || scope.cartBox.minQuantity;
            }
          }
          scope.$watch("productData", function (productData, old) {
            if (productData !== old) {
              checkCapabilities(productData);
            }
          });
          checkCapabilities(scope.productData);
        },
      },
    };
  }
  app.controller("RbsCatalogShowStoreAvailabilityModalCtrl", [
    "RbsChange.ModalStack",
    "$scope",
    "$uibModalInstance",
    "skuQuantities",
    "selectStoreCallBack",
    "forReservation",
    "forPickUp",
    "currentStoreId",
    "pricesConfiguration",
    RbsCatalogShowStoreAvailabilityModalCtrl,
  ]);
  function RbsCatalogShowStoreAvailabilityModalCtrl(
    ModalStack,
    scope,
    $uibModalInstance,
    skuQuantities,
    selectStoreCallBack,
    forReservation,
    forPickUp,
    currentStoreId,
    pricesConfiguration,
  ) {
    scope.allowSelect = angular.isFunction(selectStoreCallBack);
    scope.forReservation = forReservation;
    scope.forPickUp = forPickUp;
    scope.skuQuantities = skuQuantities;
    scope.storeId = currentStoreId;
    scope.pricesConfiguration = pricesConfiguration;
    scope.selectStore = function (storeData) {
      selectStoreCallBack(storeData);
      $uibModalInstance.close(storeData);
    };
    scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
  app.directive("rbsCatalogAddToCartConfirmationModal", [
    "$http",
    "$compile",
    rbsCatalogAddToCartConfirmationModal,
  ]);
  function rbsCatalogAddToCartConfirmationModal($http, $compile) {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        if (scope.modalContentUrl) {
          scope.modalContentMode = "loading";
          $http.get(scope.modalContentUrl).then(
            function (result) {
              if (scope.modalContentMode !== "closing") {
                var mainSelector = ".modal-main-content";
                element
                  .find(mainSelector)
                  .replaceWith(
                    '<div class="modal-main-content">' + result.data + "</div>",
                  );
                $compile(element.find(mainSelector).contents())(scope);
                scope.modalContentMode = "success";
              }
            },
            function (result) {
              scope.modalContentMode = "error";
              console.error("Can't load modal content:", result);
            },
          );
          scope.inCart = function () {
            return window.location.href === attrs.cartUrl;
          };
          scope.continueShopping = function () {
            scope.modalContentMode = "closing";
            scope.$dismiss();
          };
          scope.viewCart = function () {
            scope.modalContentMode = "closing";
            if (window.location.href === attrs.cartUrl) {
              window.location.reload(true);
            } else {
              window.location.href = attrs.cartUrl;
            }
          };
        } else {
          scope.modalContentMode = "error";
          console.warn("No modalContentUrl for product.");
        }
        scope.$on("modal.closing", function () {
          if (window.location.href === attrs.cartUrl) {
            window.location.reload(true);
          }
        });
      },
    };
  }
  app.directive("storeAtHomeAddressCheck", [
    "RbsChange.Cookies",
    "RbsChange.AjaxAPI",
    storeAtHomeAddressCheck,
  ]);
  function storeAtHomeAddressCheck(cookies, AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/store-at-home-address-check.twig",
      link: function (scope, element, attrs) {
        var category = attrs.category || "storeAtHome";
        scope.resetZipCode = function () {
          scope.checking = false;
          scope.zipCode = null;
          scope.checkedZipCode = null;
          scope.error = false;
        };
        scope.resetZipCode();
        if (cookies.get("rbsCheckedZipCode")) {
          scope.checkedZipCode = cookies.get("rbsCheckedZipCode");
        }
        scope.checkZipCode = function () {
          scope.checking = true;
          scope.error = false;
          scope.checkedZipCode = null;
          var data = {
            category: category,
            address: {
              countryCode: scope.countryCode || "FR",
              zipCode: scope.zipCode,
            },
          };
          AjaxAPI.getData("Rbs/Commerce/ShippingModesByCategory", data).then(
            function (result) {
              scope.checking = false;
              if (
                result.data.pagination &&
                result.data.pagination.errorCount &&
                !result.data.pagination.eligibleCount
              ) {
                scope.error = true;
                cookies.remove("rbsCheckedZipCode");
              } else {
                var expire = new Date();
                expire.setMonth(expire.getMonth() + 6);
                cookies.put("technical", "rbsCheckedZipCode", scope.zipCode, {
                  expires: expire,
                });
                scope.checkedZipCode = scope.zipCode;
                scope.zipCode = null;
              }
            },
            function (result) {
              console.error(result);
              scope.checking = false;
              scope.error = true;
            },
          );
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function rbsCatalogProductAnimationsSlider() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-animation-list-slider.twig",
      scope: { blockId: "=", animationsData: "=", visualFormat: "=" },
      link: function (scope, elem, attrs) {
        scope.itemsPerSlide = attrs.itemsPerSlide || 3;
        scope.interval = attrs.interval || 5000;
        scope.controls = {
          prev: function (event, sliderId) {
            event.preventDefault();
            elem.find("#" + sliderId).carousel("prev");
          },
          next: function (event, sliderId) {
            event.preventDefault();
            elem.find("#" + sliderId).carousel("next");
          },
        };
        scope.$watch("animationsData", function () {
          scope.slides = { size1: [], size2: [], size3: [], size4: [] };
          if (scope.animationsData) {
            var slide = [];
            for (var i = 0; i < scope.animationsData.length; i++) {
              for (var j = 0; j < 4; j++) {
                if (i % (j + 1) === 0) {
                  if (slide[j]) {
                    scope.slides["size" + (j + 1)].push(slide[j]);
                  }
                  slide[j] = { animationsData: [] };
                }
                slide[j].animationsData.push(scope.animationsData[i]);
              }
            }
            for (var k = 0; k < 4; k++) {
              if (slide[k] && slide[k].animationsData.length) {
                scope.slides["size" + (k + 1)].push(slide[k]);
              }
            }
          }
        });
      },
    };
  }
  app.directive(
    "rbsCatalogProductAnimationsSlider",
    rbsCatalogProductAnimationsSlider,
  );
})();
function ProductDetailHandler(
  scope,
  element,
  ModalStack,
  ProductService,
  AjaxAPI,
) {
  this.scope = scope;
  this.element = element;
  this.ModalStack = ModalStack;
  this.ProductService = ProductService;
  this.AjaxAPI = AjaxAPI || null;
  this.refreshDataTimer = null;
}
ProductDetailHandler.prototype.initProductDetailScope = function () {
  this.scope.parameters = this.scope.blockParameters;
  this.scope.productData = this.scope.blockData;
  this.scope.productAjaxData = {};
  this.scope.productAjaxParams = {};
  this.scope.pricesConfiguration = {};
  if (this.scope.parameters) {
    delete this.scope.blockParameters;
    delete this.scope.blockData;
    this.scope.productAjaxData.webStoreId = this.scope.parameters.webStoreId;
    this.scope.productAjaxData.billingAreaId =
      this.scope.parameters.billingAreaId;
    this.scope.productAjaxData.zone = this.scope.parameters.zone;
    this.scope.productAjaxData.storeId = this.scope.parameters.storeId;
    this.scope.productAjaxData.quickBuyPageFunction =
      this.scope.parameters.quickBuyPageFunction;
    this.scope.productAjaxData.productAvailabilityNotificationPageFunction =
      this.scope.parameters.productAvailabilityNotificationPageFunction;
    this.scope.productAjaxData.handleWebStorePrices =
      this.scope.parameters.handleWebStorePrices;
    this.scope.productAjaxData.handleStorePrices =
      this.scope.parameters.handleStorePrices;
    this.scope.productAjaxParams.visualFormats =
      this.scope.parameters["imageFormats"];
    this.scope.productAjaxParams.URLFormats = "canonical,contextual";
    this.scope.pricesConfiguration.handleWebStorePrices =
      this.scope.parameters.handleWebStorePrices;
    this.scope.pricesConfiguration.handleStorePrices =
      this.scope.parameters.handleStorePrices;
    this.scope.pricesConfiguration.displayPricesWithTax =
      this.scope.parameters.displayPricesWithTax;
    this.scope.pricesConfiguration.displayPricesWithoutTax =
      this.scope.parameters.displayPricesWithoutTax;
  }
  this.scope.pictograms = null;
  this.scope.visuals = null;
  var self = this;
  this.scope.$watch("productData", function (productData) {
    if (productData) {
      self.scope.pictograms = self.ProductService.extractPictogram(productData);
      self.scope.visuals = self.ProductService.extractVisuals(productData);
      var bp = self.scope.blockParameters;
      self.scope.animations = self.ProductService.extractAnimations(
        productData,
        bp && bp["showAnimationPictogram"],
      );
    }
  });
  this.scope.onSelectStore = function (storeData) {
    if (!self.scope.productAjaxData.storeId) {
      self.scope.$emit("rbsStorelocatorChooseStore", storeData.common.id);
    }
  };
  this.scope.getStoreAvailabilityModalOption = function (
    selectStoreCallBack,
    forReservation,
  ) {
    return {
      templateUrl: "/rbs-catalog-show-store-availability-modal.twig",
      backdropClass: "modal-backdrop-rbs-catalog-show-store-availability",
      windowClass: "modal-rbs-catalog-show-store-availability",
      size: "lg",
      controller: "RbsCatalogShowStoreAvailabilityModalCtrl",
      resolve: {
        skuQuantities: function () {
          var skuQuantities = {};
          skuQuantities[self.scope.productData.stock.sku] =
            self.scope.productData.stock.minQuantity;
          return skuQuantities;
        },
        selectStoreCallBack: function () {
          return selectStoreCallBack;
        },
        forReservation: function () {
          return forReservation === true;
        },
        forPickUp: function () {
          return forReservation === false;
        },
        currentStoreId: function () {
          return (
            (self.scope.productData.cartBox &&
              self.scope.productData.cartBox.storeCategories &&
              self.scope.productData.cartBox.storeCategories.storeId) ||
            self.scope.productAjaxData.storeId
          );
        },
        pricesConfiguration: function () {
          return self.scope.pricesConfiguration;
        },
      },
    };
  };
  this.scope.showStoreAvailability = function () {
    var options = self.scope.getStoreAvailabilityModalOption(false);
    self.ModalStack.open(options);
  };
  this.scope.reviewsAjaxData = {};
  this.scope.reviewsAjaxParams = {};
  this.scope.showReviews = function () {
    self.scope.$broadcast("showReviews", self.element.attr("data-block-id"));
  };
};
ProductDetailHandler.prototype.refreshData = function () {
  var scope = this.scope;
  var self = this;
  self.resetProductSetPrices();
  var cartBox = scope.productData.cartBox;
  cartBox.allCategories = { allowed: false };
  cartBox.shippingCategories = { allowed: false };
  cartBox.storeCategories = { allowed: false };
  var skuQuantities = {};
  var skuQuantitiesById = {};
  var init = false;
  angular.forEach(scope.itemsToAdd, function (itemData) {
    if (!itemData || !itemData.cartBox.allCategories.allowed) {
      return;
    }
    if (!init) {
      init = true;
      angular.extend(cartBox.allCategories, itemData.cartBox.allCategories);
      angular.extend(
        cartBox.shippingCategories,
        itemData.cartBox.shippingCategories || {},
      );
      angular.extend(
        cartBox.storeCategories,
        itemData.cartBox.storeCategories || {},
      );
    }
    self.consolidateProductSetCartBoxData(itemData, cartBox);
    var quantity = itemData.cartBox.quantity || itemData.stock.minQuantity;
    if (!itemData.cartBox.allCategories.disabled) {
      skuQuantities[itemData.stock.sku] = quantity;
      skuQuantitiesById[itemData.stock.skuId] = quantity;
    }
    self.scope.addToCartData.hasItemsToAdd = true;
  });
  cartBox.skuQuantities = skuQuantities;
  if (self.refreshDataTimer) {
    clearTimeout(self.refreshDataTimer);
  }
  self.refreshDataTimer = setTimeout(function () {
    self.refreshDataTimer = null;
    self.updateProductSetPrice(skuQuantitiesById);
  }, 200);
};
ProductDetailHandler.prototype.resetProductSetPrices = function () {
  this.scope.addToCartData.hasItemsToAdd = false;
  this.scope.productData.price.baseValueWithTax = 0;
  this.scope.productData.price.baseValueWithoutTax = 0;
  this.scope.productData.price.valueWithTax = 0;
  this.scope.productData.price.valueWithoutTax = 0;
  this.scope.productData.price.hasDifferentPrices = false;
  if (this.scope.productData.storePrice) {
    this.scope.productData.storePrice.baseValueWithTax = 0;
    this.scope.productData.storePrice.baseValueWithoutTax = 0;
    this.scope.productData.storePrice.valueWithTax = 0;
    this.scope.productData.storePrice.valueWithoutTax = 0;
    this.scope.productData.storePrice.hasDifferentPrices = false;
  }
  this.scope.productData.mergedPrice.baseValueWithTax = 0;
  this.scope.productData.mergedPrice.baseValueWithoutTax = 0;
  this.scope.productData.mergedPrice.valueWithTax = 0;
  this.scope.productData.mergedPrice.valueWithoutTax = 0;
  this.scope.productData.mergedPrice.hasDifferentPrices = false;
  this.scope.productData.stock = { minQuantity: 0, maxQuantity: 1, step: 1 };
};
ProductDetailHandler.prototype.consolidateProductSetCartBoxData = function (
  itemData,
  cartBox,
) {
  if (
    cartBox.shippingCategories.allowed &&
    !cartBox.shippingCategories.disabled
  ) {
    if (!itemData.cartBox.shippingCategories) {
      cartBox.shippingCategories.allowed = false;
      cartBox.shippingCategories.disabled = true;
    } else {
      cartBox.shippingCategories.allowed =
        itemData.cartBox.shippingCategories.allowed;
      cartBox.shippingCategories.disabled =
        itemData.cartBox.shippingCategories.disabled;
    }
    cartBox.allCategories.allowed = itemData.cartBox.allCategories.allowed;
    cartBox.allCategories.disabled = itemData.cartBox.allCategories.disabled;
  }
  if (cartBox.storeCategories.allowed && !cartBox.storeCategories.disabled) {
    if (!itemData.cartBox.storeCategories) {
      cartBox.storeCategories.allowed = false;
      cartBox.storeCategories.disabled = true;
    } else {
      cartBox.storeCategories.allowed =
        itemData.cartBox.storeCategories.allowed;
      cartBox.storeCategories.disabled =
        itemData.cartBox.storeCategories.disabled;
    }
    cartBox.allCategories.allowed = itemData.cartBox.allCategories.allowed;
    cartBox.allCategories.disabled = itemData.cartBox.allCategories.disabled;
  }
};
ProductDetailHandler.prototype.updateProductSetPrice = function (
  skuQuantitiesById,
) {
  var self = this;
  var data = {
    skuQuantities: skuQuantitiesById,
    webStoreId: this.scope.parameters.webStoreId,
    storeId: this.scope.parameters.storeId,
    billingAreaId: this.scope.parameters.billingAreaId,
    zone: this.scope.parameters.zone,
  };
  if (self.scope.productData.price && self.scope.productData.price.options) {
    delete self.scope.productData.price.options.discountDetail;
  }
  if (
    self.scope.productData.storePrice &&
    self.scope.productData.storePrice.options
  ) {
    delete self.scope.productData.storePrice.options.discountDetail;
  }
  if (
    self.scope.productData.mergedPrice &&
    self.scope.productData.mergedPrice.options
  ) {
    delete self.scope.productData.mergedPrice.options.discountDetail;
  }
  var params = {};
  this.AjaxAPI.getData(
    "Rbs/Catalog/EstimatePriceForSkuQuantities",
    data,
    params,
  ).then(
    function (result) {
      var dataSets = result.data.dataSets || {};
      if (dataSets.webStoreData && dataSets.webStoreData.totalAmounts) {
        self.scope.productData.price.currencyCode =
          dataSets.webStoreData.totalAmounts.currencyCode;
        self.scope.productData.price.baseValueWithTax =
          dataSets.webStoreData.totalAmounts.baseValueWithTax;
        self.scope.productData.price.baseValueWithoutTax =
          dataSets.webStoreData.totalAmounts.baseValueWithoutTax;
        self.scope.productData.price.valueWithTax =
          dataSets.webStoreData.totalAmounts.valueWithTax;
        self.scope.productData.price.valueWithoutTax =
          dataSets.webStoreData.totalAmounts.valueWithoutTax;
        self.scope.productData.price = angular.copy(
          self.scope.productData.price,
        );
      }
      if (dataSets.storeData && dataSets.storeData.totalAmounts) {
        self.scope.productData.storePrice.currencyCode =
          dataSets.storeData.totalAmounts.currencyCode;
        self.scope.productData.storePrice.baseValueWithTax =
          dataSets.storeData.totalAmounts.baseValueWithTax;
        self.scope.productData.storePrice.baseValueWithoutTax =
          dataSets.storeData.totalAmounts.baseValueWithoutTax;
        self.scope.productData.storePrice.valueWithTax =
          dataSets.storeData.totalAmounts.valueWithTax;
        self.scope.productData.storePrice.valueWithoutTax =
          dataSets.storeData.totalAmounts.valueWithoutTax;
        self.scope.productData.storePrice = angular.copy(
          self.scope.productData.storePrice,
        );
      }
      if (dataSets.mergedData && dataSets.mergedData.totalAmounts) {
        self.scope.productData.mergedPrice.currencyCode =
          dataSets.mergedData.totalAmounts.currencyCode;
        self.scope.productData.mergedPrice.baseValueWithTax =
          dataSets.mergedData.totalAmounts.baseValueWithTax;
        self.scope.productData.mergedPrice.baseValueWithoutTax =
          dataSets.mergedData.totalAmounts.baseValueWithoutTax;
        self.scope.productData.mergedPrice.valueWithTax =
          dataSets.mergedData.totalAmounts.valueWithTax;
        self.scope.productData.mergedPrice.valueWithoutTax =
          dataSets.mergedData.totalAmounts.valueWithoutTax;
        self.scope.productData.mergedPrice.hasDifferentPriceForStore =
          !!dataSets.mergedData.hasDifferentPriceForStore;
        self.scope.productData.mergedPrice = angular.copy(
          self.scope.productData.mergedPrice,
        );
      }
    },
    function (result) {
      console.error("Rbs/Catalog/EstimatePriceForSkuQuantities", result);
    },
  );
  if (
    this.scope.productData.price.valueWithTax ===
    this.scope.productData.price.baseValueWithTax
  ) {
    this.scope.productData.price.baseValueWithTax = null;
  }
  if (
    this.scope.productData.price.valueWithoutTax ===
    this.scope.productData.price.baseValueWithoutTax
  ) {
    this.scope.productData.price.baseValueWithoutTax = null;
  }
};
ProductDetailHandler.prototype.refreshSetItem = function () {
  var itemData = this.scope.productData;
  if (!itemData || !itemData.cartBox.allCategories.allowed) {
    return;
  }
  var cartBox = itemData.cartBox;
  cartBox.allCategories = cartBox.allCategories || { allowed: false };
  cartBox.shippingCategories = cartBox.shippingCategories || { allowed: false };
  cartBox.storeCategories = cartBox.storeCategories || { allowed: false };
  cartBox.quantity = cartBox.quantity || itemData.stock.minQuantity;
  this.scope.cartBox = cartBox;
};
ProductDetailHandler.prototype.initQuantity = function () {
  this.scope.isSelect = true;
  var selector =
    "add-to-web-cart-quantity-select-" + this.scope.productData.common.id;
  var selectElem = document.getElementById(selector);
  var maxValueShown = document.getElementById("maxValueShown");
  var self = this;
  if (selectElem) {
    var transformSelect = function (select) {
      select.className = select.className + " hidden";
      self.scope.isSelect = false;
    };
    var onChangeHandler = function () {
      self.scope.cartBox.quantity = parseInt(selectElem.value);
      applyQuantity();
    };
    var applyQuantity = function () {
      if (
        maxValueShown &&
        self.scope.cartBox.quantity === parseInt(maxValueShown.value)
      ) {
        transformSelect(selectElem);
      } else {
        selectElem.value = self.scope.cartBox.quantity;
      }
      self.scope.$apply();
    };
    selectElem.onchange = onChangeHandler;
    window.setTimeout(applyQuantity);
  }
};
ProductDetailHandler.prototype.populateAddProductData = function (
  addProductData,
) {
  var line = addProductData.lines[0];
  angular.forEach(this.scope.itemsToAdd, function (productData) {
    var lineData = angular.extend({}, line, {
      productId: productData.common.id,
      quantity: productData.cartBox.quantity || 0,
    });
    addProductData.lines.push(lineData);
  });
};
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var UpdateAxesValuesEvent = "RbsCatalogProductDetail.updateAxesValues";
  app.controller("RbsCatalogProductDetail", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "$http",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      $compile,
      $location,
      $http,
      AjaxAPI,
      ModalStack,
      ProductService,
    ) {
      scope.productData = scope.blockData;
      scope.cartBox = scope.productData.cartBox || {};
      scope.cartBox.quantity = scope.productData.stock.minQuantity;
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
      );
      productDetailHandler.initProductDetailScope();
      scope.rootElement = element;
      var isProductSet = attrs.productType === "set";
      scope.showProductInformation = function (event, name) {
        if (event) {
          event.preventDefault();
        }
        $rootScope.$broadcast("showProductInformation", { name: name });
      };
      var reviewsUrl = attrs.reviewsUrl;
      initReviews();
      function initReviews() {
        if (scope.blockParameters.handleReviews) {
          if (reviewsUrl) {
            return $http.get(reviewsUrl).then(
              function (result) {
                AjaxAPI.replaceElementContent(
                  element.find(".reviews-panel"),
                  result.data,
                  scope,
                );
              },
              function (result) {
                console.error(
                  "[RbsCatalogProductDetail] error initiating reviews content:",
                  result,
                );
              },
            );
          } else {
            console.warn(
              "[RbsCatalogProductDetail] No reviewsURL for product.",
            );
          }
        }
      }
      scope.$on(UpdateAxesValuesEvent, function (event, params) {
        if (params.contextKey !== scope.blockParameters.contextKey) {
          return;
        }
        scope.currentDisplayedDocumentId = params.variantId;
        scope.currentSelectedAxesValues = params.axesValues;
        if (isProductSet) {
          return;
        }
        var parameters = angular.copy(scope.blockParameters);
        parameters.documentIdWithReviews =
          parameters.variantId !== 0
            ? parameters.variantId
            : parameters.toDisplayDocumentId;
        parameters.toDisplayDocumentId = scope.currentDisplayedDocumentId;
        parameters.selectedAxesValues = scope.currentSelectedAxesValues;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resultHtml = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            );
            scope.productData = JSON.parse(
              $resultHtml.filter(".data-container").text(),
            );
            AjaxAPI.replaceElementContent(
              element.find(".product-content"),
              $resultHtml.filter(".product-content").html(),
              scope,
            );
            initReviews();
          },
          function (error) {
            console.error(
              "[RbsCatalogProductDetail] error reloading block:",
              error,
            );
          },
        );
      });
    },
  ]);
  app.controller("RbsCatalogProductDetailAxes", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    function (scope, element, attrs, $rootScope) {
      scope.updateAxesValues = function (
        axesValues,
        variantId,
        contextKey,
        currentId,
      ) {
        $rootScope.$broadcast(UpdateAxesValuesEvent, {
          axesValues: axesValues,
          variantId: variantId,
          contextKey: contextKey,
          currentId: currentId,
          productSetItemIndex: attrs.productSetItemIndex,
        });
      };
      scope.updateAxesValuesFromSelect = function (
        options,
        selectId,
        contextKey,
        currentId,
      ) {
        var option = options[scope[selectId]];
        if (option) {
          scope.updateAxesValues(
            option.axesValues,
            option.variantId,
            contextKey,
            currentId,
          );
        }
      };
      var axesData = scope.productData.axes;
      if (
        axesData.values.length < axesData.definitions.length &&
        axesData.definitions[axesData.values.length].items.length === 1
      ) {
        var item = axesData.definitions[axesData.values.length].items[0];
        scope.updateAxesValues(
          item.axesValues,
          item.id,
          scope.blockParameters.contextKey,
          scope.productData.common.id,
        );
      }
    },
  ]);
  app.controller("RbsCatalogProductDetailInformationFlat", [
    "$scope",
    "$element",
    function (scope, element) {
      scope.$on("showProductInformation", function (event, params) {
        if (params.name) {
          jQuery("html, body")
            .stop()
            .animate(
              { scrollTop: element.find("#" + params.name).offset().top - 20 },
              1000,
            );
        }
      });
    },
  ]);
  app.controller("RbsCatalogProductDetailInformationTabs", [
    "$scope",
    "$element",
    function (scope, element) {
      scope.$on("showProductInformation", function (event, params) {
        if (params.name) {
          var selector = 'a[href="#' + params.name + '"]';
          element.find(selector).tab("show");
          jQuery("html, body")
            .stop()
            .animate(
              { scrollTop: element.find(selector).offset().top - 20 },
              1000,
            );
        }
      });
    },
  ]);
  app.controller("ProductCartBox", [
    "$rootScope",
    "$scope",
    "$element",
    "$timeout",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    function (
      $rootScope,
      scope,
      element,
      $timeout,
      AjaxAPI,
      ModalStack,
      ProductService,
    ) {
      var productCartBoxHandler = new ProductCartBoxHandler(
        $rootScope,
        scope,
        AjaxAPI,
        ModalStack,
        ProductService,
      );
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      scope.$watch("productData", function (productData, old) {
        if (productData !== old) {
          ProductCartBoxHandler.checkCapabilities(scope, productData);
        }
      });
      ProductCartBoxHandler.checkCapabilities(scope, scope.productData);
      productDetailHandler.initQuantity();
      scope.addShippingCategoriesProduct = function () {
        return productCartBoxHandler.addShippingCategoriesProduct();
      };
      scope.addStoreCategoriesProduct = function () {
        return productCartBoxHandler.addStoreCategoriesProduct();
      };
      scope.selectStore = function (forReservation) {
        productCartBoxHandler.selectStore(forReservation);
      };
      scope.addProductExtended = function (category) {
        return productCartBoxHandler.addProductExtended(category);
      };
      scope.buttonTitle = function (categoryData) {
        return productCartBoxHandler.buttonTitle(categoryData);
      };
      scope.$on("rbsCartBoxStoreSelected", function (event, storeData) {
        var parameters = scope.parameters;
        parameters.storeId = storeData.common.id;
        if (scope.currentDisplayedDocumentId) {
          parameters.toDisplayDocumentId = scope.currentDisplayedDocumentId;
        }
        if (scope.currentSelectedAxesValues) {
          parameters.selectedAxesValues = scope.currentSelectedAxesValues;
        }
        parameters = angular.copy(parameters);
        parameters.consolidatedProductData = scope.productData;
        parameters.renderPart = "cart-box";
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resHtml = jQuery(jQuery.parseHTML(result.data.dataSets.html));
            AjaxAPI.replaceElementContent(
              element.find(".add-to-cart-store"),
              $resHtml.find(".add-to-cart-store").html(),
              scope,
            );
          },
          function (error) {
            console.error("[ProductCartBox] error reloading block:", error);
          },
        );
      });
      var reloadCartBoxTimer = null;
      scope.$on("reloadCartBox", function (event, parameters) {
        if (reloadCartBoxTimer) {
          $timeout.cancel(reloadCartBoxTimer);
        }
        reloadCartBoxTimer = $timeout(function () {
          reloadCartBoxTimer = null;
          AjaxAPI.reloadBlock(
            scope.blockName,
            scope.blockId,
            parameters,
            scope.blockNavigationContext,
          ).then(
            function (result) {
              var $resHtml = jQuery(
                jQuery.parseHTML(result.data.dataSets.html),
              );
              AjaxAPI.replaceElementContent(
                element.find(".cart-box-content"),
                $resHtml.find(".cart-box-content").html(),
                scope,
              );
            },
            function (error) {
              console.error("[ProductCartBox] error reloading block:", error);
            },
          );
        }, 200);
      });
    },
  ]);
  app.controller("ProductSetController", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "RbsChange.ProductService",
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      ProductService,
      ModalStack,
      AjaxAPI,
    ) {
      scope.itemsToAdd = [];
      scope.addToCartData = {};
      scope.checkedItems = {};
      angular.forEach(
        scope.productData.productSet.products,
        function (itemData) {
          scope.checkedItems["i" + itemData.common.id] = !!(
            itemData.stock &&
            itemData.stock.sku &&
            itemData.cartBox &&
            itemData.cartBox.allCategories.disabled === false
          );
        },
      );
      scope.updateCheckedItem = function (itemData, index, itemId) {
        if (scope.checkedItems["i" + itemId]) {
          scope.itemsToAdd[index] = itemData;
        } else {
          delete scope.itemsToAdd[index];
        }
        productDetailHandler.refreshData();
        var parameters = angular.copy(scope.parameters);
        parameters.consolidatedProductData = scope.productData;
        parameters.renderPart = "cart-box";
        parameters.tTL = 0;
        scope.$broadcast("reloadCartBox", parameters);
      };
      scope.refreshHandlerData = function () {
        productDetailHandler.refreshData();
      };
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      var productCartBoxHandler = new ProductCartBoxHandler(
        $rootScope,
        scope,
        AjaxAPI,
        ModalStack,
        ProductService,
      );
      productDetailHandler.initProductDetailScope();
      productDetailHandler.refreshData();
      var modalOption = scope.getStoreAvailabilityModalOption;
      scope.getStoreAvailabilityModalOption = function (
        allowSelect,
        forReservation,
      ) {
        var result = modalOption(allowSelect, forReservation);
        result.resolve.skuQuantities = function () {
          return scope.productData.cartBox.skuQuantities;
        };
        return result;
      };
      scope.populateAddProductData = function (addProductData) {
        return productDetailHandler.populateAddProductData(addProductData);
      };
      scope.onAddProductSuccess = function (response) {
        return productCartBoxHandler.onAddProductSuccess(response);
      };
      scope.addShippingCategoriesProduct = function () {
        return productCartBoxHandler.addShippingCategoriesProduct();
      };
      scope.addStoreCategoriesProduct = function () {
        return productCartBoxHandler.addStoreCategoriesProduct();
      };
      scope.addProductExtended = function (category) {
        return productCartBoxHandler.addProductExtended(category);
      };
      scope.buttonTitle = function (categoryData) {
        return productCartBoxHandler.buttonTitle(categoryData);
      };
    },
  ]);
  app.controller("ProductSetItemController", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "RbsChange.ProductService",
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      ProductService,
      ModalStack,
      AjaxAPI,
    ) {
      scope.productData =
        scope.productData.productSet.products[attrs.index] || {};
      var itemId = scope.productData.common.id;
      var currentDisplayedDocumentId = scope.productData.common.id;
      var currentSelectedAxesValues = [];
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      productDetailHandler.refreshSetItem();
      productDetailHandler.initQuantity();
      scope.$watch("checkedItems.i" + itemId, function () {
        scope.updateCheckedItem(scope.productData, attrs.index, itemId);
      });
      scope.$watch("cartBox.quantity", function (val, oldVal) {
        if (val && val !== oldVal && scope.checkedItems["i" + itemId]) {
          scope.refreshHandlerData();
        }
      });
      scope.$on("rbsCartBoxStoreSelected", function (event, storeData) {
        refresh(storeData.common.id);
      });
      var refresh = function (storeId) {
        var parameters = angular.copy(scope.blockParameters);
        parameters.toDisplayDocumentId = currentDisplayedDocumentId;
        parameters.selectedAxesValues = currentSelectedAxesValues;
        parameters.renderPart = "variant-in-product-set";
        parameters.itemId = itemId;
        parameters.storeId = storeId || scope.blockParameters.storeId;
        parameters.productSetItemIndex = attrs.index;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resultHtml = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            );
            scope.productData = JSON.parse(
              $resultHtml.filter(".data-container").text(),
            );
            if (scope.checkedItems["i" + itemId]) {
              scope.itemsToAdd[attrs.index] = scope.productData;
              scope.productData.cartBox.quantity = scope.cartBox.quantity;
            }
            if (!storeId) {
              if (
                scope.productData.cartBox &&
                scope.productData.cartBox.allCategories.disabled === false
              ) {
                if (!scope.checkedItems["i" + itemId]) {
                  scope.checkedItems["i" + itemId] = true;
                } else {
                  scope.updateCheckedItem(
                    scope.productData,
                    attrs.index,
                    itemId,
                  );
                }
              } else {
                scope.checkedItems["i" + itemId] = false;
              }
            }
            AjaxAPI.replaceElementContent(
              element.find(".product-set-item-container"),
              $resultHtml.filter(".product-set-item-container").html(),
              scope,
            );
            productDetailHandler.refreshSetItem();
            productDetailHandler.initQuantity();
            if (scope.checkedItems["i" + itemId]) {
              scope.refreshHandlerData();
            }
          },
          function (error) {
            console.error(
              "[RbsCatalogProductDetail] error reloading block:",
              error,
            );
          },
        );
      };
      scope.$on(UpdateAxesValuesEvent, function (event, params) {
        if (params.contextKey !== scope.blockParameters.contextKey) {
          return;
        }
        if (params.productSetItemIndex !== attrs.index) {
          return;
        }
        currentDisplayedDocumentId = params.variantId;
        currentSelectedAxesValues = params.axesValues;
        refresh();
      });
    },
  ]);
})();
function ProductCartBoxHandler(
  rootScope,
  scope,
  AjaxAPI,
  ModalStack,
  ProductService,
) {
  scope.cartBox = ProductCartBoxHandler.emptyCartBox;
  this.rootScope = rootScope;
  this.scope = scope;
  this.AjaxAPI = AjaxAPI;
  this.ModalStack = ModalStack;
  this.ProductService = ProductService;
}
ProductCartBoxHandler.emptyCartBox = {
  shippingCategories: { allowed: false },
  storeCategories: { allowed: false },
  allCategories: { allowed: false },
  handleStorePrices: false,
};
ProductCartBoxHandler.prototype.addShippingCategoriesProduct = function () {
  return this.addProduct(this.scope.productData, "shippingCategories");
};
ProductCartBoxHandler.prototype.addStoreCategoriesProduct = function () {
  return this.addProduct(this.scope.productData, "storeCategories");
};
ProductCartBoxHandler.prototype.onAddProductSuccess = function (response) {
  var categories = null,
    successModalUrl = null;
  var items = response.data.items;
  if (items && items.length > 1) {
    angular.forEach(items, function (item) {
      if (!categories && item.categories) {
        categories = item.categories;
      }
    });
    if (categories) {
      this.openExtendedCartBoxModal(categories);
    }
  } else {
    var cart = response.data.dataSets;
    if (cart && cart.linesAdded && cart.linesAdded.length) {
      angular.forEach(cart.linesAdded, function (item) {
        if (!successModalUrl && item.successModalURL) {
          successModalUrl = item.successModalURL;
        }
      });
      if (successModalUrl) {
        this.openAddedToCartModal(
          successModalUrl + "&itemCount=" + cart.linesAdded.length,
        );
      }
    }
  }
};
ProductCartBoxHandler.prototype.addProduct = function (productData, category) {
  var self = this;
  var scope = this.scope;
  var addProductData = this.buildAddProductData(category, productData);
  return this.ProductService.addToCart(addProductData).then(
    function (response) {
      if (angular.isFunction(scope.onAddProductSuccess)) {
        scope.onAddProductSuccess(response);
      } else {
        var item, cart, items;
        items = response.data.items;
        if (items && items.length) {
          item = items[0];
          if (item.categories) {
            self.openExtendedCartBoxModal(item.categories);
          }
        } else {
          cart = response.data.dataSets;
          if (cart && cart.linesAdded && cart.linesAdded.length) {
            item = cart.linesAdded[0];
            if (item.successModalURL) {
              self.openAddedToCartModal(item.successModalURL);
            }
          }
        }
      }
    },
    function (error) {
      if (angular.isFunction(scope.onAddProductError)) {
        scope.onAddProductError(error);
      } else {
        console.error("onAddProductError::error", error);
      }
    },
  );
};
ProductCartBoxHandler.prototype.buildExtendedCartBoxModalContext = function (
  categories,
) {
  this.scope.extendedCartBox = categories;
  this.scope.extendedCartBox.dualColumns =
    categories.storeCategories &&
    categories.storeCategories.allowed &&
    categories.shippingCategories &&
    categories.shippingCategories.allowed;
  this.scope.extendedCartBox.dualStore = !!(
    categories.hasOwnProperty.store && categories.hasOwnProperty.reservation
  );
  var options = {
    templateUrl: "/rbs-catalog-cart-box-modal-dialog.twig",
    backdropClass: "modal-backdrop-rbs-catalog-cart-box",
    windowClass: "modal-rbs-catalog-cart-box",
    scope: this.scope,
  };
  if (this.scope.extendedCartBox.dualColumns) {
    options.size = "lg";
  }
  return options;
};
ProductCartBoxHandler.prototype.openExtendedCartBoxModal = function (
  categories,
) {
  var options = this.buildExtendedCartBoxModalContext(categories);
  this.ModalStack.open(options);
};
ProductCartBoxHandler.prototype.buildAddedToCartModalContext = function (
  modalContentUrl,
) {
  this.scope.modalContentUrl = modalContentUrl;
  return {
    templateUrl: "/rbs-catalog-add-to-cart-confirmation-modal-dialog.twig",
    backdropClass: "modal-backdrop-rbs-catalog-add-to-cart-confirmation",
    windowClass: "modal-rbs-catalog-add-to-cart-confirmation",
    scope: this.scope,
  };
};
ProductCartBoxHandler.prototype.openAddedToCartModal = function (
  modalContentUrl,
) {
  var options = this.buildAddedToCartModalContext(modalContentUrl);
  this.ModalStack.open(options);
};
ProductCartBoxHandler.prototype.buildAddProductData = function (
  category,
  productData,
) {
  var lineData = {
    productId: productData.common.id,
    category: category || "allCategories",
    successModal: {
      pageFunction: "Rbs_Catalog_ProductAddedToCart",
      themeName: this.AjaxAPI.getThemeName(),
    },
  };
  if (this.scope.cartBox.quantity != null) {
    lineData["quantity"] = this.scope.cartBox.quantity;
  }
  if (this.scope.cartBox.storeCategories) {
    lineData.storeId = this.scope.cartBox.storeCategories.storeId || 0;
  }
  var addProductData = { lines: [lineData] };
  if (angular.isFunction(this.scope.populateAddProductData)) {
    this.scope.populateAddProductData(addProductData);
  }
  return addProductData;
};
ProductCartBoxHandler.prototype.selectStore = function (forReservation) {
  this.scope.selectStoreForReservation = forReservation;
  var self = this;
  var options = this.scope.getStoreAvailabilityModalOption(function (
    storeData,
  ) {
    return self.onCartBoxSelectStore(storeData);
  }, forReservation);
  this.ModalStack.open(options);
};
ProductCartBoxHandler.prototype.onCartBoxSelectStore = function (storeData) {
  var cartBox = this.scope.cartBox && this.scope.cartBox.storeCategories;
  if (cartBox) {
    cartBox.stock = storeData.storeShipping.stock;
    cartBox.storeId = storeData.common.id;
    cartBox.storeTitle = storeData.common.title;
    cartBox.pickUpDateTime = cartBox.formattedPickUpDateTime = null;
    if (
      !storeData.totalPrice ||
      storeData.totalPrice.hasPrice ||
      storeData.totalPrice.hasStorePrice
    ) {
      cartBox.pickUpDateTime = storeData.storeShipping.pickUpDateTime;
      cartBox.formattedPickUpDateTime =
        storeData.storeShipping.formattedPickUpDateTime;
      this.scope.cartBox.storeCategories.oldCountStoresWithStock =
        cartBox.countStoresWithStock;
      cartBox.countStoresWithStock = 0;
    } else if (
      angular.isDefined(
        this.scope.cartBox.storeCategories.oldCountStoresWithStock,
      )
    ) {
      cartBox.countStoresWithStock =
        this.scope.cartBox.storeCategories.oldCountStoresWithStock;
    }
    cartBox.disabled = false;
    if (storeData.totalPrice) {
      cartBox.disabled =
        !storeData.totalPrice.hasPrice && !storeData.totalPrice.hasStorePrice;
      if (this.scope.productData) {
        this.scope.productData.storePrice = {};
        this.scope.productData.mergedPrice.hasDifferentPriceForStore = false;
        if (storeData.totalPrice.hasStorePrice) {
          this.scope.productData.storePrice = storeData.totalPrice;
          this.scope.productData.mergedPrice.hasDifferentPriceForStore =
            this.scope.productData.price.valueWithTax !==
            storeData.totalPrice.valueWithTax;
        }
      }
    }
    if (this.scope.cartBox.allCategories) {
      this.scope.cartBox.allCategories.disabled = cartBox.disabled;
    }
  }
  cartBox =
    this.scope.extendedCartBox && this.scope.extendedCartBox.storeCategories;
  if (cartBox) {
    cartBox.storeId = storeData.common.id;
    cartBox.storeTitle = storeData.common.title;
    var subCartBox = this.scope.extendedCartBox.store;
    if (
      subCartBox &&
      subCartBox.allowed &&
      storeData.storeShipping.storePickUpDateTime
    ) {
      subCartBox.storeId = cartBox.storeId;
      subCartBox.storeTitle = cartBox.storeTitle;
      subCartBox.pickUpDateTime = subCartBox.formattedPickUpDateTime = null;
      if (
        !storeData.totalPrice ||
        storeData.totalPrice.hasPrice ||
        storeData.totalPrice.hasStorePrice
      ) {
        subCartBox.pickUpDateTime = storeData.storeShipping.pickUpDateTime;
        subCartBox.formattedPickUpDateTime =
          storeData.storeShipping.formattedPickUpDateTime;
        this.scope.cartBox.storeCategories.oldCountStoresWithStock =
          subCartBox.countStoresWithStock;
        subCartBox.countStoresWithStock = 0;
      } else if (
        angular.isDefined(
          this.scope.cartBox.storeCategories.oldCountStoresWithStock,
        )
      ) {
        subCartBox.countStoresWithStock =
          this.scope.cartBox.storeCategories.oldCountStoresWithStock;
      }
      subCartBox.disabled = !subCartBox.pickUpDateTime;
      if (
        storeData.totalPrice &&
        !storeData.totalPrice.hasPrice &&
        !storeData.totalPrice.hasStorePrice
      ) {
        subCartBox.disabled = true;
      }
    }
    subCartBox = this.scope.extendedCartBox.reservation;
    if (
      subCartBox &&
      subCartBox.allowed &&
      storeData.storeShipping.reservationPickUpDateTime
    ) {
      subCartBox.storeId = cartBox.storeId;
      subCartBox.storeTitle = cartBox.storeTitle;
      subCartBox.pickUpDateTime = subCartBox.formattedPickUpDateTime = null;
      if (
        !storeData.totalPrice ||
        storeData.totalPrice.hasPrice ||
        storeData.totalPrice.hasStorePrice
      ) {
        subCartBox.pickUpDateTime =
          storeData.storeShipping.reservationPickUpDateTime;
        subCartBox.formattedPickUpDateTime =
          storeData.storeShipping.reservationFormattedPickUpDateTime;
        this.scope.cartBox.storeCategories.oldCountStoresWithStock =
          subCartBox.countStoresWithStock;
        subCartBox.countStoresWithStock = 0;
      } else if (
        angular.isDefined(
          this.scope.cartBox.storeCategories.oldCountStoresWithStock,
        )
      ) {
        subCartBox.countStoresWithStock =
          this.scope.cartBox.storeCategories.oldCountStoresWithStock;
      }
      subCartBox.disabled = !subCartBox.pickUpDateTime;
      if (
        storeData.totalPrice &&
        !storeData.totalPrice.hasPrice &&
        !storeData.totalPrice.hasStorePrice
      ) {
        subCartBox.disabled = true;
      }
    }
  }
  this.rootScope.$broadcast("rbsCartBoxStoreSelected", storeData);
  this.scope.onSelectStore(storeData);
};
ProductCartBoxHandler.checkCapabilities = function (scope, productData) {
  if (
    !productData ||
    !productData.cartBox ||
    (!scope.cartBox.shippingCategories && !scope.cartBox.storeCategories)
  ) {
    scope.cartBox = ProductCartBoxHandler.emptyCartBox;
    return;
  }
  var currentQuantity = scope.cartBox && scope.cartBox.quantity;
  scope.cartBox = productData.cartBox;
  scope.cartBox.minQuantity = productData.stock.minQuantity;
  scope.cartBox.step = productData.stock.step;
  scope.cartBox.maxQuantity = productData.stock.maxQuantity;
  if (scope.parameters.showQuantity) {
    scope.cartBox.quantity = currentQuantity || scope.cartBox.minQuantity;
  }
  if (!scope.cartBox.shippingCategories) {
    scope.cartBox.shippingCategories = { allowed: false };
  }
  if (!scope.cartBox.storeCategories) {
    scope.cartBox.storeCategories = { allowed: false };
  }
};
ProductCartBoxHandler.prototype.addProductExtended = function (category) {
  if (category === "store") {
    if (this.scope.extendedCartBox && this.scope.extendedCartBox.store) {
      this.scope.cartBox.storeCategories.storeId =
        this.scope.extendedCartBox.store.storeId;
    }
  } else if (category === "reservation") {
    if (this.scope.extendedCartBox && this.scope.extendedCartBox.reservation) {
      this.scope.cartBox.storeCategories.storeId =
        this.scope.extendedCartBox.reservation.storeId;
    }
  }
  return this.addProduct(this.scope.productData, category);
};
ProductCartBoxHandler.prototype.buttonTitle = function (categoryData) {
  if (categoryData && categoryData.button) {
    if (categoryData.disabled && categoryData.disabledButton) {
      return categoryData.disabledButton;
    }
    if (
      !categoryData.disabled &&
      categoryData.restockButton &&
      this.isCategoryDataInRestockingMode(categoryData)
    ) {
      return categoryData.restockButton;
    }
    return categoryData.button;
  }
  return "";
};
ProductCartBoxHandler.prototype.isCategoryDataInRestockingMode = function (
  categoryData,
) {
  var currentCategoryIsAllCategory =
    this.scope.cartBox && this.scope.cartBox.allCategories === categoryData;
  var shippingCategoryStockStateIsRestocking =
    this.scope.cartBox &&
    this.scope.cartBox.shippingCategories &&
    this.scope.cartBox.shippingCategories.stock.threshold === "RESTOCKING";
  return !!(
    categoryData.restockDate ||
    (currentCategoryIsAllCategory && shippingCategoryStockStateIsRestocking)
  );
};
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsCatalogProductsListV3", [
    "RbsChange.AjaxAPI",
    "$location",
    "$rootScope",
    "$timeout",
    "$compile",
    "$window",
    rbsCatalogProductsListV3,
  ]);
  function rbsCatalogProductsListV3(
    AjaxAPI,
    $location,
    $rootScope,
    $timeout,
    $compile,
    $window,
  ) {
    return {
      restrict: "A",
      link: function (scope, elem, attrs) {
        var cacheKey = scope.blockId;
        scope.loading = false;
        scope.paginationMode = attrs.paginationMode || "default";
        scope.parameters = scope.blockParameters;
        scope.parameters.blockId = cacheKey;
        var data = scope.blockData;
        scope.contextData = data.context.data;
        scope.contextData.layout = {
          name: scope.blockName,
          id: scope.parameters.blockId,
        };
        scope.contextData.parameters = angular.copy(scope.parameters);
        scope.contextData.parameters.pageNumber = data.pagination.pageNumber;
        delete scope.contextData.parameters.forceClassicPagination;
        scope.context = {
          URLFormats: data.context.URLFormats,
          visualFormats: scope.parameters.imageFormats,
          dataSetNames: scope.parameters.dataSetNames,
          cacheTTL: scope.parameters.tTL || scope.parameters.TTL,
        };
        scope.sortBy = function (sortBy) {
          scope.contextData.parameters.sortBy = sortBy;
          $location.search("sortBy-" + cacheKey, sortBy);
          setPage(1);
          scope.reload("sortBy");
        };
        $rootScope.$on("RbsElasticsearchFacetFilters", function (event, args) {
          if (!args.facetFilters) {
            args.facetFilters = [];
          }
          scope.contextData.parameters.facetFilters = args.facetFilters;
          scope.contextData.parameters.searchText = args.searchText || null;
          scope.contextData.parameters.webStoreStockFilter =
            args.webStoreStockFilter || null;
          scope.contextData.parameters.storeStockFilter =
            args.storeStockFilter || null;
          if (scope.contextData.announcementData) {
            scope.contextData.parameters.decoratorId = args.decoratorId || 0;
          }
          setPage(1);
          scope.reload(args.instantSearch ? "instantSearch" : "facetFilters");
        });
        $rootScope.$on("RbsElasticsearchSearchText", function (event, args) {
          var productResult = !scope.contextData.listId;
          if (
            productResult &&
            (args.resultFunction === undefined ||
              scope.contextData.resultFunction === args.resultFunction)
          ) {
            args.redirect = false;
            if (scope.contextData.parameters.searchText !== args.searchText) {
              scope.contextData.parameters.searchText = args.searchText || null;
              setPage(1);
              scope.reload(args.instantSearch ? "instantSearch" : "searchText");
            }
          }
        });
        scope.reload = function (reason) {
          var useModal = reason !== "instantSearch";
          if (useModal) {
            AjaxAPI.openWaitingModal();
          }
          var promise = AjaxAPI.reloadBlock(
            scope.blockName,
            scope.blockId,
            scope.contextData.parameters,
            scope.blockNavigationContext,
          );
          promise.then(
            function (result) {
              applyResult(result.data.dataSets.html, true);
              if (useModal) {
                AjaxAPI.closeWaitingModal();
              }
            },
            function (error) {
              console.error(
                "[rbsCatalogProductsListV3] error reloading block:",
                error,
              );
              if (useModal) {
                AjaxAPI.closeWaitingModal();
              }
            },
          );
          return promise;
        };
        scope.onPaginationLinkClick = function ($event) {
          $event.originalEvent.stopPropagation();
          $event.originalEvent.preventDefault();
          if (scope.changingPage) {
            return;
          }
          scope.changingPage = true;
          if (scope.paginationMode === "classic") {
            setPage(
              parseInt($event.target.getAttribute("data-page-number"), 10),
            );
            scope.reload().then(
              function () {
                scope.changingPage = false;
                itemClickEvent();
              },
              function () {
                scope.changingPage = false;
                itemClickEvent();
              },
            );
          }
        };
        scope.addMoreProducts = function () {
          if (scope.loading) {
            return;
          }
          if (scope.paginationMode === "infinite-click") {
            loadNextPage();
          }
        };
        function loadNextPage() {
          scope.loading = true;
          setPage(scope.contextData.parameters.pageNumber + 1);
          return AjaxAPI.reloadBlock(
            scope.blockName,
            scope.blockId,
            scope.contextData.parameters,
            scope.blockNavigationContext,
          ).then(
            function (result) {
              applyResult(result.data.dataSets.html, false);
              $timeout(function () {
                scope.loading = false;
              });
            },
            function (error) {
              console.error(
                "[rbsCatalogProductsListV3] error reloading block:",
                error,
              );
              setPage(scope.contextData.parameters.pageNumber - 1);
              scope.loading = false;
            },
          );
        }
        function applyResult(html, replaceProducts) {
          var pageClass =
            "product-list-" + scope.contextData.parameters.pageNumber;
          var items = jQuery(jQuery.parseHTML(html)).filter(".items").html();
          if (replaceProducts) {
            elem
              .find(".product-list")
              .html('<div class="' + pageClass + '">' + items + "</div>");
          } else {
            elem
              .find(".product-list")
              .append('<div class="' + pageClass + '">' + items + "</div>");
          }
          $compile(elem.find("." + pageClass))(scope);
          var pagination = jQuery(jQuery.parseHTML(html))
            .filter(".pagination")
            .html();
          elem.find(".pagination").html(pagination);
          $compile(elem.find(".pagination"))(scope);
        }
        if (
          scope.paginationMode === "infinite-click" &&
          data.pagination.pageCount > 1
        ) {
          var locationSearch = $location.search();
          var locationPageNumber = Math.min(
            locationSearch["page-" + cacheKey] || 1,
            data.pagination.pageCount,
          );
          var locationPosition = locationSearch["position"];
          loadPages();
        }
        function loadPages() {
          if (locationPageNumber > scope.contextData.parameters.pageNumber) {
            loadNextPage().then(loadPages);
          } else {
            jQuery("html, body").animate({ scrollTop: locationPosition }, 1000);
            var throttled = false;
            var windowElement = angular.element($window);
            windowElement.on("scroll", function () {
              if (!throttled) {
                throttled = true;
                $timeout(function () {
                  throttled = false;
                }, 500);
                $location
                  .search("position", windowElement.scrollTop())
                  .replace();
                scope.$apply();
              }
            });
          }
        }
        function setPage(number) {
          scope.contextData.parameters.pageNumber = number;
          var paramName =
            scope.paginationMode === "classic" ? "pageNumber" : "page";
          var paramValue =
            scope.contextData.parameters.pageNumber > 1
              ? scope.contextData.parameters.pageNumber
              : null;
          $location.search(paramName + "-" + cacheKey, paramValue).replace();
        }
      },
    };
  }
  app.directive("rbsCatalogProductListItemAddToCartButtonsV3", [
    "RbsChange.ModalStack",
    rbsCatalogProductListItemAddToCartButtonsV3,
  ]);
  function rbsCatalogProductListItemAddToCartButtonsV3(ModalStack) {
    return {
      restrict: "A",
      scope: true,
      link: function (scope, elm, attrs) {
        scope.openDialog = function () {
          var options = {
            templateUrl: "/rbs-catalog-quick-buy-modal-dialog.twig",
            backdropClass: "modal-backdrop-rbs-catalog-quick-buy",
            windowClass: "modal-rbs-catalog-quick-buy",
            size: "lg",
            controller: "RbsCatalogQuickBuyModalCtrl",
            resolve: {
              quickBuyURL: function () {
                return attrs.quickBuyUrl;
              },
            },
          };
          ModalStack.open(options);
        };
      },
    };
  }
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsCatalogQuickBuyModalCtrl", [
    "$scope",
    "quickBuyURL",
    function (scope, quickBuyURL) {
      scope.quickBuyURL = quickBuyURL;
    },
  ]);
  app.directive("rbsCatalogQuickBuyModal", [
    "$http",
    "$compile",
    rbsCatalogQuickBuyModal,
  ]);
  function rbsCatalogQuickBuyModal($http, $compile) {
    return {
      restrict: "A",
      link: function (scope, element) {
        var quickBuyURL = scope.quickBuyURL;
        if (quickBuyURL) {
          scope.modalContentMode = "loading";
          $http.get(quickBuyURL).then(
            function (result) {
              var mainSelector = ".modal-main-content";
              element
                .find(mainSelector)
                .replaceWith(
                  '<div class="modal-main-content">' + result.data + "</div>",
                );
              $compile(element.find(mainSelector).contents())(scope);
              scope.modalContentMode = "success";
            },
            function (result) {
              scope.modalContentMode = "error";
              console.error("Can't load modal content:", result);
            },
          );
        } else {
          scope.modalContentMode = "error";
          console.warn("No quickBuyURL for product.");
        }
      },
    };
  }
  app.controller("RbsCatalogProductItemController", [
    "$scope",
    "$element",
    "RbsChange.AjaxAPI",
    RbsCatalogProductItemController,
  ]);
  function RbsCatalogProductItemController(scope, $element, AjaxAPI) {
    scope.productData = {};
    scope.parameters = {};
    var cacheKey = $element.attr("data-cache-key");
    if (cacheKey) {
      scope.productData = AjaxAPI.globalVar(cacheKey);
    }
    scope.viewDetailTitleMask =
      $element.attr("data-view-detail-title-mask") || "PRODUCT_TITLE";
    cacheKey = $element.attr("data-block-cache-key");
    if (cacheKey) {
      scope.parameters = AjaxAPI.getBlockParameters(cacheKey);
    }
  }
  app.directive("rbsCatalogProductItem", [
    "RbsChange.ProductService",
    rbsCatalogProductItem,
  ]);
  function rbsCatalogProductItem(ProductService) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-product-item.twig",
      link: function (scope) {
        var productData = scope.productData;
        scope.pictograms = null;
        scope.url = null;
        scope.visual = null;
        scope.viewDetailTitle = null;
        if (!productData || !productData.common) {
          return;
        }
        scope.viewDetailTitle = scope.viewDetailTitleMask.replace(
          "PRODUCT_TITLE",
          productData.common.title,
        );
        scope.pictograms = ProductService.extractPictogram(productData);
        var bp = scope.blockParameters;
        scope.animations = ProductService.extractAnimations(
          productData,
          bp && bp["showAnimationPictogram"],
        );
        scope.url = ProductService.extractURL(productData);
        scope.visuals = ProductService.extractVisuals(productData);
        if (scope.visuals && scope.visuals.length) {
          scope.visual = scope.visuals[0];
        }
        scope.addToCart = function (data) {
          return ProductService.addToCart(data);
        };
      },
    };
  }
  app.directive("rbsCatalogAnnouncementItem", rbsCatalogAnnouncementItem);
  function rbsCatalogAnnouncementItem() {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-announcement-item.twig",
      link: function (scope) {
        scope.announcementData = scope.productData;
      },
    };
  }
  app.directive("rbsCatalogProductListItemAddToCartButtons", [
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    rbsCatalogProductListItemAddToCartButtons,
  ]);
  function rbsCatalogProductListItemAddToCartButtons(
    ModalStack,
    ProductService,
  ) {
    return {
      restrict: "A",
      link: function (scope) {
        scope.openDialog = function () {
          var options = {
            templateUrl: "/rbs-catalog-quick-buy-modal-dialog.twig",
            backdropClass: "modal-backdrop-rbs-catalog-quick-buy",
            windowClass: "modal-rbs-catalog-quick-buy",
            size: "lg",
            controller: "RbsCatalogQuickBuyModalCtrl",
            resolve: {
              quickBuyURL: function () {
                return scope.productData["common"]["quickBuyURL"];
              },
            },
          };
          ModalStack.open(options);
        };
        scope.quickBuyEnabled = false;
        scope.detailURL = "";
        var productData = scope.productData;
        if (productData) {
          scope.quickBuyEnabled = enableQuickBuy(productData);
          scope.detailURL = productData
            ? ProductService.extractURL(productData, productData.rootProduct)
            : "";
        } else {
          scope.$watch("productData", function (productData) {
            if (productData) {
              scope.quickBuyEnabled = enableQuickBuy(productData);
              scope.detailURL = productData
                ? ProductService.extractURL(
                    productData,
                    productData.rootProduct,
                  )
                : "";
            }
          });
        }
        function enableQuickBuy(productData) {
          var quickBuyOnSimple = scope.parameters["quickBuyOnSimple"];
          var quickBuyOnVariant = scope.parameters["quickBuyOnVariant"];
          if (
            !productData ||
            !productData.common["quickBuyURL"] ||
            !productData.cartBox
          ) {
            return false;
          } else if (productData.cartBox.allCategories.allowed) {
            if (productData.common.type === "simple" && quickBuyOnSimple) {
              return true;
            } else if (
              productData.common.type === "variant" &&
              quickBuyOnVariant
            ) {
              return true;
            }
          } else if (
            productData.common.type === "variant" &&
            quickBuyOnVariant
          ) {
            return true;
          }
          return false;
        }
      },
    };
  }
  app.directive("rbsCatalogProductsListSlider", [
    "RbsChange.AjaxAPI",
    rbsCatalogProductsListSlider,
  ]);
  function rbsCatalogProductsListSlider(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-products-list-slider.twig",
      scope: { blockId: "=", blockParameters: "=", blockData: "=" },
      controller: [
        "$scope",
        function (scope) {
          scope.parameters = scope.blockParameters;
          scope.productsData = scope.blockData.productsData;
        },
      ],
      link: function (scope, elem, attrs) {
        var asynchronousMode = scope.blockParameters.asynchronousMode || false;
        scope.viewDetailTitleMask =
          attrs.viewDetailTitleMask || "PRODUCT_TITLE";
        scope.itemsPerSlide = attrs["itemsPerSlide"] || 3;
        scope.interval = attrs["interval"] || 1000;
        scope.controls = {
          prev: function (event, sliderId) {
            event.preventDefault();
            elem.find("#" + sliderId).carousel("prev");
          },
          next: function (event, sliderId) {
            event.preventDefault();
            elem.find("#" + sliderId).carousel("next");
          },
        };
        scope.slides = { size1: [], size2: [], size3: [], size4: [] };
        var slide = [];
        if (asynchronousMode && scope.blockData.context) {
          var params = {
            product: scope.blockParameters.toDisplayDocumentId,
            csParams: scope.blockData.context,
          };
          AjaxAPI.getData("Rbs/Catalog/CrossSelling", params).then(
            function (result) {
              angular.forEach(result.data.items, function (product) {
                scope.productsData.push(product);
              });
              populateSlider();
            },
            function () {
              scope.productsData.length = 0;
            },
          );
        } else {
          populateSlider();
        }
        function populateSlider() {
          for (var i = 0; i < scope.productsData.length; i++) {
            for (var j = 0; j < 4; j++) {
              if (i % (j + 1) == 0) {
                if (slide[j]) {
                  scope.slides["size" + (j + 1)].push(slide[j]);
                }
                slide[j] = { productsData: [] };
              }
              slide[j].productsData.push(scope.productsData[i]);
            }
          }
          for (var k = 0; k < 4; k++) {
            if (slide[k] && slide[k].productsData.length) {
              scope.slides["size" + (k + 1)].push(slide[k]);
            }
          }
        }
      },
    };
  }
  app.directive("rbsCatalogProductsListV2", [
    "RbsChange.AjaxAPI",
    "$location",
    "$rootScope",
    "$anchorScroll",
    "$timeout",
    "$window",
    rbsCatalogProductsListV2,
  ]);
  function rbsCatalogProductsListV2(
    AjaxAPI,
    $location,
    $rootScope,
    $anchorScroll,
    $timeout,
    $window,
  ) {
    return {
      restrict: "A",
      templateUrl: "/rbs-catalog-products-list-v2.twig",
      scope: { blockId: "=", blockParameters: "=", blockData: "=" },
      controller: [
        "$scope",
        "$element",
        function (scope, elem) {
          var cacheKey = scope.blockId;
          scope.loading = false;
          scope.errorLoading = false;
          scope.paginationMode = elem.attr("data-pagination-mode") || "default";
          scope.useInfiniteScroll = scope.paginationMode === "infinite-scroll";
          scope.parameters = scope.blockParameters;
          scope.parameters.blockId = cacheKey;
          var data = scope.blockData;
          scope.productsData = data.productsData;
          scope.contextData = data.context.data;
          scope.pagination = data.pagination;
          scope.context = {
            URLFormats: data.context.URLFormats,
            pagination: data.context.pagination,
            visualFormats: scope.parameters.imageFormats,
            dataSetNames: scope.parameters.dataSetNames,
            cacheTTL: scope.parameters.tTL || scope.parameters.TTL,
          };
          setNextPageURL();
          updateCanonicalURL();
          scope.sortBy = function (sortBy) {
            scope.contextData.sortBy = scope.parameters.sortBy = sortBy;
            $location.search("sortBy-" + cacheKey, sortBy);
            scope.context.pagination.offset = 0;
            scope.reload("sortBy");
          };
          scope.updateOffset = function (newOffset) {
            AjaxAPI.openWaitingModal();
            scope.context.pagination.offset = newOffset;
            AjaxAPI.getData(
              "Rbs/Catalog/Product/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.productsData = [];
                scope.pagination = result.data.pagination;
                angular.forEach(result.data.items, function (product) {
                  scope.productsData.push(product);
                });
                $location.search(
                  "pageNumber-" + cacheKey,
                  Math.floor(scope.pagination.offset / scope.pagination.limit) +
                    1,
                );
                setNextPageURL();
                updateCanonicalURL();
                AjaxAPI.closeWaitingModal();
                $timeout(function () {
                  var scrollTo = "top-" + scope.blockId;
                  if ($location.hash() !== scrollTo) {
                    $location.hash(scrollTo);
                  }
                  $anchorScroll();
                });
              },
              function () {
                scope.productsData = [];
                AjaxAPI.closeWaitingModal();
              },
            );
          };
          $rootScope.$on(
            "RbsElasticsearchFacetFilters",
            function (event, args) {
              if (!args.facetFilters) {
                args.facetFilters = [];
              }
              scope.contextData.facetFilters = args.facetFilters;
              scope.contextData.searchText = args.searchText || null;
              scope.contextData.webStoreStockFilter =
                args.webStoreStockFilter || null;
              scope.contextData.storeStockFilter =
                args.storeStockFilter || null;
              if (scope.contextData.announcementData) {
                scope.contextData.announcementData.decoratorId =
                  args.decoratorId || 0;
              }
              scope.context.pagination.offset = 0;
              if (args.instantSearch) {
                scope.reload("instantSearch");
              } else {
                scope.reload("facetFilters");
              }
            },
          );
          $rootScope.$on("RbsElasticsearchSearchText", function (event, args) {
            var productResult = !scope.contextData.listId;
            if (
              productResult &&
              (args.resultFunction === undefined ||
                scope.contextData.resultFunction === args.resultFunction)
            ) {
              args.redirect = false;
              if (scope.contextData.searchText !== args.searchText) {
                scope.contextData.searchText = args.searchText || null;
                scope.context.pagination.offset = 0;
                if (args.instantSearch) {
                  scope.reload("instantSearch");
                } else {
                  scope.reload("searchText");
                }
              }
            }
          });
          scope.reload = function (reason) {
            var useModal = reason !== "instantSearch";
            if (useModal) {
              AjaxAPI.openWaitingModal();
            }
            scope.errorLoading = false;
            AjaxAPI.getData(
              "Rbs/Catalog/Product/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.productsData = [];
                scope.pagination = result.data.pagination;
                angular.forEach(result.data.items, function (product) {
                  scope.productsData.push(product);
                });
                if (useModal) {
                  AjaxAPI.closeWaitingModal();
                }
              },
              function () {
                scope.productsData = [];
                if (useModal) {
                  AjaxAPI.closeWaitingModal();
                }
              },
            );
          };
          scope.addMoreProducts = function () {
            if (scope.loading) {
              return;
            }
            if (
              scope.paginationMode === "infinite-scroll" ||
              scope.paginationMode === "infinite-click"
            ) {
              loadNextPage();
            }
            if (scope.paginationMode === "infinite-click") {
              $location
                .search(
                  "page-" + cacheKey,
                  Math.floor(
                    scope.context.pagination.offset /
                      scope.context.pagination.limit,
                  ) + 1,
                )
                .replace();
            }
          };
          function setNextPageURL() {
            if (
              scope.pagination.offset + scope.pagination.limit <
              scope.pagination.count
            ) {
              var pageNumber =
                Math.floor(
                  scope.context.pagination.offset /
                    scope.context.pagination.limit,
                ) + 2;
              if (
                scope.paginationMode === "infinite-scroll" ||
                scope.paginationMode === "infinite-click"
              ) {
                scope.nextPage =
                  $location.path() + "?page-" + cacheKey + "=" + pageNumber;
              } else {
                scope.nextPage =
                  $location.path() +
                  "?pageNumber-" +
                  cacheKey +
                  "=" +
                  pageNumber;
              }
            } else {
              scope.nextPage = null;
            }
          }
          function updateCanonicalURL() {
            if (scope.pagination.offset > 0) {
              var pageNumber =
                Math.floor(
                  scope.context.pagination.offset /
                    scope.context.pagination.limit,
                ) + 1;
              if (
                scope.paginationMode === "infinite-scroll" ||
                scope.paginationMode === "infinite-click"
              ) {
                $('link[rel="canonical"]').attr(
                  "href",
                  window.location.origin +
                    window.location.pathname +
                    "?page-" +
                    cacheKey +
                    "=" +
                    pageNumber,
                );
              } else {
                $('link[rel="canonical"]').attr(
                  "href",
                  window.location.origin +
                    window.location.pathname +
                    "?pageNumber-" +
                    cacheKey +
                    "=" +
                    pageNumber,
                );
              }
            } else {
              $('link[rel="canonical"]').attr(
                "href",
                window.location.origin + window.location.pathname,
              );
            }
          }
          function loadNextPage() {
            scope.context.pagination.offset = scope.productsData.length;
            scope.loading = true;
            return AjaxAPI.getData(
              "Rbs/Catalog/Product/",
              scope.contextData,
              scope.context,
            ).then(
              function (result) {
                scope.pagination = result.data.pagination;
                if (
                  result.data.pagination.offset === scope.productsData.length
                ) {
                  angular.forEach(result.data.items, function (product) {
                    scope.productsData.push(product);
                  });
                  setNextPageURL();
                  updateCanonicalURL();
                }
                $timeout(function () {
                  scope.loading = false;
                });
              },
              function () {
                scope.loading = false;
                scope.errorLoading = true;
              },
            );
          }
          if (
            (scope.paginationMode === "infinite-scroll" ||
              scope.paginationMode === "infinite-click") &&
            scope.pagination.pageCount > 1
          ) {
            var throttled = false;
            var windowElement = angular.element($window);
            var locationSearch = $location.search();
            var locationPageNumber = Math.min(
              locationSearch["page-" + cacheKey] || 1,
              scope.pagination.pageCount,
            );
            var locationPosition = locationSearch["position"];
            var locationOffset =
              (locationPageNumber - 1) * scope.context.pagination.limit;
            if (locationPageNumber) {
              if (!loadPages()) {
                listenScroll();
              }
            } else {
              listenScroll();
            }
          }
          function loadPages() {
            if (locationOffset > scope.context.pagination.offset) {
              loadNextPage().then(function () {
                if (!loadPages()) {
                  jQuery("html, body").animate(
                    { scrollTop: locationPosition },
                    1000,
                  );
                  listenScroll();
                }
              });
              return true;
            }
            return false;
          }
          function listenScroll() {
            windowElement.on("scroll", function () {
              if (!throttled) {
                throttled = true;
                $timeout(function () {
                  throttled = false;
                }, 500);
                if (
                  !navigator.userAgent.match(
                    /.+compatible; Google-Read-Aloud;.+/i,
                  )
                ) {
                  $location
                    .search("position", windowElement.scrollTop())
                    .replace();
                }
                $location
                  .search(
                    "page-" + cacheKey,
                    Math.floor(
                      scope.context.pagination.offset /
                        scope.context.pagination.limit,
                    ) + 1,
                  )
                  .replace();
                scope.$apply();
              }
            });
          }
        },
      ],
      link: function (scope, elem, attrs) {
        scope.viewDetailTitleMask =
          attrs.viewDetailTitleMask || "PRODUCT_TITLE";
        scope.scrollDisabled = function () {
          if (scope.paginationMode !== "infinite-scroll") {
            return true;
          }
          return (
            scope.loading ||
            scope.productsData.length >= scope.pagination.count ||
            scope.errorLoading
          );
        };
      },
    };
  }
})(jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsAvailabilityAlertLink", [
    "$rootScope",
    "RbsChange.ModalStack",
    rbsAvailabilityAlertLink,
  ]);
  function rbsAvailabilityAlertLink(rootScope, ModalStack) {
    return {
      restrict: "A",
      link: function (scope, elem, attr) {
        scope.productWebNotificationEnabled = false;
        scope.productStoreNotificationEnabled = false;
        scope.useWebStore = attr["selectedStock"] === "webStore";
        if (scope.productData) {
          enableProductAvailabilityNotification(scope.productData.cartBox);
        }
        function enableProductAvailabilityNotification(cartBox) {
          var productAvailabilityNotificationURL =
            scope.productData.common["productAvailabilityNotificationURL"];
          var shippingStock = cartBox.shippingCategories.stock;
          scope.productWebNotificationEnabled =
            productAvailabilityNotificationURL &&
            shippingStock &&
            shippingStock.threshold !== "AVAILABLE";
          var storeStock = cartBox.storeCategories.stock;
          scope.productStoreNotificationEnabled =
            productAvailabilityNotificationURL &&
            storeStock &&
            storeStock.threshold !== "AVAILABLE";
        }
        scope.openDialog = function () {
          var options = {
            templateUrl: "/rbs-catalog-availability-notification-modal.twig",
            backdropClass:
              "modal-backdrop-rbs-catalog-availability-notification",
            windowClass: "modal-rbs-catalog-availability-notification",
            size: "lg",
            scope: scope,
          };
          ModalStack.open(options);
        };
        scope.$watch("productData", function (productData) {
          if (productData) {
            enableProductAvailabilityNotification(productData.cartBox);
          }
        });
        rootScope.$on("rbsCartBoxStoreSelected", function () {
          enableProductAvailabilityNotification(scope.cartBox);
        });
      },
    };
  }
  app.directive("rbsAvailabilityAlertModal", [
    "$http",
    "$compile",
    "RbsChange.AjaxAPI",
    rbsAvailabilityAlertModal,
  ]);
  function rbsAvailabilityAlertModal($http, $compile, AjaxAPI) {
    return {
      restrict: "A",
      link: function (scope, element) {
        scope.callbackStatus = null;
        if (scope.productData["common"]["productAvailabilityNotificationURL"]) {
          scope.modalContentMode = "loading";
          $http
            .get(
              scope.productData["common"]["productAvailabilityNotificationURL"],
            )
            .then(
              function (result) {
                var mainSelector = ".modal-main-content";
                element
                  .find(mainSelector)
                  .replaceWith(
                    '<div class="modal-main-content">' + result.data + "</div>",
                  );
                $compile(element.find(mainSelector).contents())(scope);
                scope.modalContentMode = "success";
              },
              function (result) {
                scope.modalContentMode = "error";
                console.error("Can't load modal content:", result);
              },
            );
        } else {
          scope.modalContentMode = "error";
          console.warn("No productAvailabilityNotificationURL for product.");
        }
        scope.requestNotification = function (email, userId) {
          var data = {
            skuId: scope.productData.stock.skuId,
            productId: scope.productData.common.id,
            customerMail: email,
            storeId: scope.parameters.webStoreId,
            customerId: userId || 0,
          };
          if (!scope.useWebStore) {
            var cartBox = scope.productData.cartBox;
            data["storeId"] = cartBox.storeCategories.storeId;
          }
          AjaxAPI.postData(
            "Rbs/Commerce/Availability/AlertSubscription",
            data,
          ).then(
            function (result) {
              if (result.status === 200) {
                scope.callbackStatus = "success";
              } else {
                scope.callbackStatus = "warning";
              }
              scope.callbackText = result.data.message;
            },
            function (result) {
              scope.callbackStatus = "danger";
              scope.callbackText = result.data.error;
              console.error(
                "on rbsStockAvailabilityNotificationSubscription",
                result,
              );
            },
          );
        };
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsCatalogShortSearch", [
    "$scope",
    "$element",
    "RbsChange.AjaxAPI",
    "$q",
    RbsCatalogShortSearch,
  ]);
  function RbsCatalogShortSearch(scope, $element, AjaxAPI, $q) {
    scope.suggester.search = function (searchText) {
      var promises = [];
      scope.columns = 0;
      scope.documents = scope.products = null;
      var parameters = scope.blockParameters;
      parameters["searchText"] = searchText;
      promises.push(
        AjaxAPI.getData("Rbs/Catalog/Suggest", parameters, {
          visualFormats: parameters.thumbnailFormat,
        }),
      );
      var documentPromise = scope.getPromiseDocumentSuggest(searchText);
      if (documentPromise) {
        promises.push(documentPromise);
      }
      $q.all(promises).then(
        function (res) {
          if (scope.searching) {
            scope.searching = false;
          } else if (res) {
            if (
              res[0] &&
              res[0].data.products &&
              res[0].data.products.items &&
              res[0].data.products.items.length > 0
            ) {
              scope.products = res[0].data.products;
              scope.columns++;
            }
            if (
              res[1] &&
              res[1].data.documents &&
              res[1].data.documents.length > 0
            ) {
              scope.documents = res[1].data.documents;
              scope.columns++;
            }
            jQuery(".short-search-listbox").show();
          }
        },
        function (error) {},
      );
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsBrandBrandsList", [
    "RbsChange.AjaxAPI",
    rbsBrandBrandsList,
  ]);
  function rbsBrandBrandsList(AjaxAPI) {
    return {
      restrict: "A",
      link: function (scope) {
        scope.currentLetter = scope.blockData.currentLetter;
        scope.letters = scope.blockData.letters;
        scope.count = scope.blockData.count;
        scope.selectedLetter = null;
        scope.context = {
          URLFormats: scope.blockData.context.URLFormats.join(","),
          pagination: scope.blockData.context.pagination,
          imageFormats: scope.blockParameters.imageFormats,
          dataSetNames: scope.blockParameters.dataSetNames,
        };
        scope.setCurrentLetter = function (data) {
          if (data.count) {
            var offset = jQuery("#" + data.letter).offset();
            if (offset) {
              jQuery("html, body").animate(
                { scrollTop: offset.top - 20 },
                1000,
              );
            }
          }
        };
        var errors = 0;
        var successCallback = function (result) {
          angular.forEach(result.data.items, function (item) {
            var category = item.common.category;
            if (category) {
              scope.letters[category].data.push(item);
            }
          });
          if (result.data.items.length === scope.context.pagination.limit) {
            scope.context.pagination = result.data.pagination;
            scope.count.loaded += result.data.items.length;
            loadMoreBrands();
          }
        };
        var errorCallback = function (error) {
          if (errors <= 4) {
            console.error(error.data.code + ": " + error.data.message);
            loadMoreBrands();
          }
          errors++;
        };
        var loadMoreBrands = function () {
          var params = {
            imageFormats: scope.blockParameters.imageFormats,
            pagination: scope.context.pagination,
            context: scope.context,
          };
          AjaxAPI.getData("Rbs/Brand/Brand", params).then(
            successCallback,
            errorCallback,
          );
        };
        loadMoreBrands();
      },
    };
  }
})();
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistButtonCtrl", [
    "$scope",
    "$http",
    function ($scope, $http) {
      $scope.$watch("blockId", function () {
        start();
      });
      function start() {
        $scope.reset();
      }
      $scope.reset = function () {
        $scope.addWishlistSuccess = false;
        $scope.sucessMessage = false;
        $scope.error = false;
        $scope.wishlists = $scope.data.wishlists;
      };
      $scope.addToWishlist = function (wishlist, modalId) {
        if ($scope.data.defaultWishlist) {
          $http
            .post("Action/Rbs/Wishlist/UpdateWishlist", {
              wishlistId: wishlist.id,
              userId: $scope.data.userId,
              productIdsToAdd: $scope.data.productIds,
            })
            .then(
              function (result) {
                $scope.successMessage = result.data.success;
                $scope.warning = result.data.warnings;
              },
              function (result) {
                $scope.error = result.data.error;
              },
            );
        } else {
          $scope.addNewWishlist(modalId);
        }
      };
      $scope.addNewWishlist = function (modalId) {
        $scope.newWishlist = {
          public: false,
          userId: $scope.data.userId,
          storeId: $scope.data.storeId,
          productIds: $scope.data.productIds,
        };
        jQuery("#" + modalId).modal({});
      };
      $scope.confirmNewWishlist = function () {
        if (angular.isObject($scope.newWishlist)) {
          $http
            .post("Action/Rbs/Wishlist/AddWishlist", {
              title: $scope.newWishlist.title,
              public: false,
              storeId: $scope.newWishlist.storeId,
              userId: $scope.newWishlist.userId,
              productIds: $scope.newWishlist.productIds || null,
            })
            .then(
              function (result) {
                $scope.successMessage = result.data.success;
                $scope.warning = result.data.warnings;
                $scope.error = false;
                $scope.addWishlistSuccess = true;
              },
              function (result) {
                $scope.error = result.data.error;
              },
            );
        }
      };
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistButtonPreloaded", [
    "$scope",
    "$element",
    "$http",
    "$compile",
    "RbsChange.AjaxAPI",
    function (scope, element, $http, $compile, AjaxAPI) {
      var parameters = angular.copy(scope.blockParameters);
      scope.reset = function () {
        scope.addWishlistSuccess = false;
        scope.error = false;
      };
      scope.isProductInWishlist = function (id) {
        let wishlists = null;
        if (!scope.wishlists) {
          wishlists = window.__change["wishlistDatas"];
          scope.wishlists = wishlists;
        } else {
          wishlists = scope.wishlists;
        }
        scope.productWishlistId = id;
        if (wishlists) {
          scope.productIsInWishlist = wishlists.some((wishlist) =>
            wishlist.productIds.includes(id),
          );
        } else {
        }
        const el = jQuery(".when-doc-ready-" + id);
        if (el) {
          el.removeClass("hide-zento");
        }
      };
      setTimeout(() => {
        scope.isProductInWishlist(scope.productWishlistId);
      }, 100);
      scope.addToWishlist = function (wishlistId, modalId, productIds) {
        parameters.productIds = parameters.productIds
          ? parameters.productIds
          : [productIds];
        parameters.userId = parameters.userId
          ? parameters.userId
          : window.__change["userContext"]["accessorId"];
        parameters.storeId = window.__change["blockParameters"]["wishlistList"]
          ? window.__change["blockParameters"]["wishlistList"]["storeId"]
          : window.__change["productAjaxData"]
            ? window.__change["productAjaxData"]["webStoreId"]
            : 0;
        if (wishlistId) {
          $http
            .post("Action/Rbs/Wishlist/UpdateWishlist", {
              wishlistId: wishlistId,
              userId: parameters.userId,
              productIdsToAdd: parameters.productIds,
            })
            .then(
              function (result) {
                var updateParameters = angular.copy(parameters);
                updateParameters.successMessage = result.data.success;
                updateParameters.warning = result.data.warnings;
                reloadBlock(updateParameters);
                scope.successMessage = result.data.success;
                scope.warning = result.data.warnings;
                if (scope.wishlists[0]) {
                  scope.wishlists[0].productIds.push(productIds);
                } else {
                  scope.wishlists.push({ productIds: [productIds] });
                }
                scope.isProductInWishlist(scope.productWishlistId);
              },
              function (result) {
                var errorParameters = angular.copy(parameters);
                errorParameters.error = result.data.error;
                reloadBlock(errorParameters);
                scope.error = result.data.error;
                scope.isProductInWishlist(scope.productWishlistId);
              },
            );
        } else {
        }
      };
      scope.addNewWishlist = function (modalId) {
        scope.newWishlist = {
          public: false,
          userId: parameters.userId,
          storeId: parameters.storeId,
          productIds: parameters.productIds,
        };
        jQuery("#" + modalId).modal({});
      };
      scope.confirmNewWishlist = function () {
        if (angular.isObject(scope.newWishlist)) {
          $http
            .post("Action/Rbs/Wishlist/AddWishlist", {
              title: scope.newWishlist.title,
              public: false,
              storeId: parameters.storeId,
              userId: parameters.userId,
              productIds: parameters.productIds || null,
            })
            .then(
              function (result) {
                console.log("::: 3 :::");
                scope.error = false;
                scope.addWishlistSuccess = true;
                var updateParameters = angular.copy(parameters);
                updateParameters.successMessage = result.data.success;
                updateParameters.warning = result.data.warnings;
                updateParameters.error = false;
                reloadBlock(updateParameters);
                if (scope.wishlists[0]) {
                  scope.wishlists[0].productIds.push(parameters.productIds[0]);
                } else {
                  scope.wishlists.push({ productIds: parameters.productIds });
                }
                scope.isProductInWishlist(scope.productWishlistId);
              },
              function (result) {
                scope.error = result.data.error;
              },
            );
        }
      };
      function reloadBlock(parameters) {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            element
              .find(".content")
              .html(
                jQuery(jQuery.parseHTML(result.data.dataSets.html))
                  .filter(".content")
                  .html(),
              );
            $compile(element.find(".content"))(scope);
          },
          function (error) {
            console.error("[RbsWishlistButton] error reloading block:", error);
          },
        );
      }
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistDetailCtrl", [
    "$scope",
    "$http",
    function ($scope, $http) {
      $scope.changingTitle = false;
      $scope.loading = true;
      $scope.selectedProducts = {};
      $scope.errorMessage = null;
      $scope.$watch("blockId", function () {
        start();
      });
      function start() {
        $scope.loading = false;
        angular.forEach($scope.data.productIds, function (productId) {
          $scope.selectedProducts[productId] = false;
        });
      }
      $scope.openChangeTitle = function () {
        $scope.errorMessage = null;
        $scope.changingTitle = true;
        $scope.oldTitle = $scope.data.title;
      };
      $scope.cancelTitleEdition = function () {
        $scope.errorMessage = null;
        $scope.changingTitle = false;
        $scope.data.title = $scope.oldTitle;
      };
      $scope.changeTitle = function () {
        $scope.errorMessage = null;
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            title: $scope.data.title,
            wishlistId: $scope.data.wishlistId,
            userId: $scope.data.userId,
          })
          .then(
            function (result) {
              $scope.changingTitle = false;
              $scope.data = result.data;
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
      $scope.removeSelectedProducts = function () {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: $scope.data.wishlistId,
            userId: $scope.data.userId,
            productIdsToRemove: $scope.selectedProducts,
          })
          .then(
            function () {
              window.location.reload();
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
      $scope.changeIsPublic = function () {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: $scope.data.wishlistId,
            userId: $scope.data.userId,
            changeIsPublic: !$scope.data.isPublic,
          })
          .then(
            function () {
              window.location.reload();
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
      $scope.deleteWishlist = function (modalId) {
        jQuery("#" + modalId).modal({});
      };
      $scope.confirmDeleteWishlist = function () {
        $http
          .post("Action/Rbs/Wishlist/DeleteWishlist", {
            wishlistId: $scope.data.wishlistId,
            userId: $scope.data.userId,
          })
          .then(
            function () {
              window.location.href = $scope.wishlistListUrl;
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistDetailPreloaded", [
    "$scope",
    "$element",
    "$http",
    "$compile",
    "RbsChange.AjaxAPI",
    function ($scope, element, $http, $compile, AjaxAPI) {
      $scope.selectedProducts = {};
      angular.forEach($scope.blockData.productIds, function (productId) {
        $scope.selectedProducts[productId] = false;
      });
      $scope.openChangeTitle = function () {
        var parameters = angular.copy($scope.blockParameters);
        parameters.renderPart = "title-form";
        reloadBlock(parameters, ".list-title");
      };
      $scope.cancelTitleEdition = function () {
        var parameters = angular.copy($scope.blockParameters);
        parameters.renderPart = "list-header";
        reloadBlock(parameters, ".list-title");
      };
      $scope.changeTitle = function () {
        $scope.errorMessage = null;
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            title: $scope.blockData.title,
            wishlistId: $scope.blockData.wishlistId,
            userId: $scope.blockData.userId,
          })
          .then(
            function () {
              var parameters = angular.copy($scope.blockParameters);
              parameters.renderPart = "list-header";
              reloadBlock(parameters, ".list-title");
            },
            function (result) {
              var parameters = angular.copy($scope.blockParameters);
              parameters.errorMessage = result.data.error;
              parameters.renderPart = "title-form";
              reloadBlock(parameters, ".list-title");
            },
          );
      };
      $scope.removeSelectedProducts = function () {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: $scope.blockData.wishlistId,
            userId: $scope.blockData.userId,
            productIdsToRemove: $scope.selectedProducts,
          })
          .then(
            function () {
              reloadBlock($scope.blockParameters, ".content");
            },
            function (result) {
              var parameters = angular.copy($scope.blockParameters);
              parameters.errorMessage = result.data.error;
              parameters.renderPart = "list-header";
              reloadBlock(parameters, ".list-title");
            },
          );
      };
      $scope.changeIsPublic = function () {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: $scope.blockData.wishlistId,
            userId: $scope.blockData.userId,
            changeIsPublic: !$scope.blockData.isPublic,
          })
          .then(
            function () {
              $scope.blockData.isPublic = !$scope.blockData.isPublic;
              reloadBlock($scope.blockParameters, ".content");
            },
            function (result) {
              var parameters = angular.copy($scope.blockParameters);
              parameters.errorMessage = result.data.error;
              parameters.renderPart = "list-header";
              reloadBlock(parameters, ".list-title");
            },
          );
      };
      $scope.deleteWishlist = function (modalId) {
        jQuery("#" + modalId).modal({});
      };
      $scope.confirmDeleteWishlist = function (wishlistListUri) {
        $http
          .post("Action/Rbs/Wishlist/DeleteWishlist", {
            wishlistId: $scope.blockData.wishlistId,
            userId: $scope.blockData.userId,
          })
          .then(
            function () {
              window.location.href = wishlistListUri;
            },
            function (result) {
              var parameters = angular.copy($scope.blockParameters);
              parameters.errorMessage = result.data.error;
              parameters.renderPart = "list-header";
              reloadBlock(parameters, ".list-title");
            },
          );
      };
      function reloadBlock(parameters, selector) {
        AjaxAPI.reloadBlock(
          $scope.blockName,
          $scope.blockId,
          parameters,
          $scope.blockNavigationContext,
        ).then(
          function (result) {
            var content = jQuery(jQuery.parseHTML(result.data.dataSets.html))
              .filter(selector)
              .html();
            element.find(selector).html(content);
            $compile(element.find(selector))($scope);
          },
          function (error) {
            console.error("[RbsWishlistDetail] error reloading block:", error);
          },
        );
      }
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistListCtrl", [
    "$scope",
    "$http",
    function ($scope, $http) {
      $scope.setDefaultWishlist = function (wishlistId) {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: wishlistId,
            userId: $scope.data.userId,
            setDefault: true,
          })
          .then(
            function () {
              window.location.reload();
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
    },
  ]);
})(jQuery);
(function (jQuery) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsWishlistListPreloaded", [
    "$scope",
    "$http",
    "$compile",
    "$element",
    "RbsChange.AjaxAPI",
    function ($scope, $http, $compile, $element, AjaxAPI) {
      var parameters = angular.copy($scope.blockParameters);
      $scope.setDefaultWishlist = function (wishlistId) {
        $http
          .post("Action/Rbs/Wishlist/UpdateWishlist", {
            wishlistId: wishlistId,
            userId: parameters.userId,
            setDefault: true,
          })
          .then(
            function () {
              AjaxAPI.reloadBlock(
                $scope.blockName,
                $scope.blockId,
                parameters,
                $scope.blockNavigationContext,
              ).then(
                function (result) {
                  $element
                    .find(".wishlist-list")
                    .html(
                      jQuery(jQuery.parseHTML(result.data.dataSets.html))
                        .filter(".wishlist-list")
                        .html(),
                    );
                  $compile($element.find(".wishlist-list"))($scope);
                },
                function (error) {
                  console.error(
                    "[RbsWishlistListPreloaded] error reloading block:",
                    error,
                  );
                },
              );
            },
            function (result) {
              $scope.errorMessage = result.data.error;
            },
          );
      };
    },
  ]);
})(jQuery);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsBaseStorelocatorSearch", [
    "$scope",
    "$element",
    "$attrs",
    "$compile",
    "RbsChange.AjaxAPI",
    function (scope, elem, attrs, $compile, AjaxAPI) {
      var controller = this;
      var controllerInit = scope.blockData;
      var parameters = angular.copy(scope.blockParameters);
      scope.maps = null;
      scope.markers = null;
      scope.markerIcon = null;
      scope.markerIconUrl = null;
      scope.stores = null;
      scope.searchAddress = null;
      scope.formattedAddress = null;
      scope.filteredAddress = null;
      scope.myCoordinates = null;
      scope.addressCoordinates = null;
      scope.error = null;
      scope.loadingAddresses = false;
      scope.options = {};
      scope.searchRadius = 10;
      if (controllerInit.searchRadiusSelected) {
        scope.searchRadius = parseInt(controllerInit.searchRadiusSelected);
      }
      scope.searchRadiusUnit = "km";
      if (controllerInit.searchRadiusUnit) {
        scope.searchRadiusUnit = controllerInit.searchRadiusUnit;
      }
      scope.searchRadiusArray = [scope.searchRadius + scope.searchRadiusUnit];
      if (
        controllerInit.searchRadiusArray &&
        controllerInit.searchRadiusArray.length
      ) {
        scope.searchRadiusArray = controllerInit.searchRadiusArray;
      }
      scope.blockParameters.currentStoreId = null;
      if (controllerInit && controllerInit.currentStoreId) {
        scope.blockParameters.currentStoreId = controllerInit.currentStoreId;
      }
      angular.element("select#searchRadius").on("change", function () {
        if (scope.searchAddress) {
          scope.updateDistance(this.value);
        }
      });
      scope.updateDistance = function (distance) {
        scope.searchRadius = distance;
        scope.distance = scope.searchRadius + scope.searchRadiusUnit;
        angular.element("select#searchRadius").val(distance);
        scope.search();
      };
      this.getSearchContext = function () {
        return controllerInit ? controllerInit["searchContext"] : null;
      };
      scope.searchContext = controller.getSearchContext();
      this.getInitialStoresData = function () {
        return controllerInit && controllerInit["storesData"]
          ? controllerInit["storesData"]
          : null;
      };
      this.search = function (data) {
        var params = controller.getSearchContext();
        var request = AjaxAPI.getData("Rbs/Storelocator/Store/", data, params);
        request.then(function () {
          parameters.showHome = false;
        });
        return request;
      };
      this.handleSearchResults = function (result, coordinates) {
        scope.addressLoading = false;
        angular.forEach(result.data.items, function (item) {
          if (item.common.id === scope.blockParameters.currentStoreId) {
            item.common.currentStore = true;
            return true;
          }
        });
        scope.stores = result.data.items;
        parameters.searchRadius = scope.searchRadius;
        parameters.formattedAddress = scope.formattedAddress;
        parameters.addressCoordinates = scope.addressCoordinates;
        parameters.myCoordinates = scope.myCoordinates;
        parameters.filteredAddress = scope.filteredAddress;
        parameters.commercialSignIdValue = scope.commercialSignId;
        return this.reloadBlock(parameters);
      };
      this.reloadBlock = function (parameters) {
        parameters.userActionReload = true;
        parameters.stores = scope.stores;
        parameters.error = scope.error;
        return AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var content = jQuery(jQuery.parseHTML(result.data.dataSets.html))
              .filter(".content")
              .html();
            elem.find(".content").html(content);
            $compile(elem.find(".content"))(scope);
          },
          function (error) {
            console.error(
              "[RbsStorelocatorSearchPreloaded] error reloading block:",
              error,
            );
          },
        );
      };
      if (scope.blockParameters.commercialSignId) {
        scope.commercialSignId = scope.blockParameters.commercialSignId;
      } else {
        scope.commercialSignId = null;
      }
      scope.searchInSignStores = function () {
        scope.commercialSignId = scope.blockParameters.commercialSignId;
        scope.search();
      };
      scope.searchInAllStores = function () {
        scope.commercialSignId = null;
        scope.search();
      };
      scope.locateMe = function () {
        scope.error = null;
        scope.addressLoading = true;
        navigator.geolocation.getCurrentPosition(
          function (position) {
            scope.addressLoading = false;
            scope.filteredAddress = null;
            scope.formattedAddress = null;
            scope.addressCoordinates = null;
            scope.myCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            scope.distance = scope.searchRadius + scope.searchRadiusUnit;
            scope.search();
          },
          function (error) {
            console.error(
              "Localisation failed : [" + error.code + "] " + error.message,
            );
            scope.addressLoading = false;
            scope.error = 2;
            scope.stores = [];
            parameters.showHome = false;
            controller.reloadBlock(parameters);
          },
          { timeout: 5000, maximumAge: 0 },
        );
      };
      scope.chooseStore = function (storeId) {
        var store = null;
        angular.forEach(scope.stores, function (item) {
          if (item.common.id === parseInt(storeId)) {
            store = item;
          } else {
            item.common.currentStore = false;
          }
        });
        store.common.currentStore = true;
        scope.blockParameters.currentStoreId = store.common.id;
        scope.$emit("rbsStorelocatorChooseStore", store.common.id);
      };
    },
  ]);
  app.controller("RbsStorelocatorLeafletSearch", [
    "$scope",
    "$element",
    "$attrs",
    "$compile",
    "RbsChange.AjaxAPI",
    "$timeout",
    "$http",
    "$controller",
    "RbsGeo.LeafletMapService",
    function (
      scope,
      elem,
      attrs,
      $compile,
      AjaxAPI,
      $timeout,
      $http,
      $controller,
      LeafletMapService,
    ) {
      angular.extend(
        this,
        $controller("RbsBaseStorelocatorSearch", {
          $scope: scope,
          $element: elem,
          $attrs: attrs,
        }),
      );
      var controller = this;
      var controllerInit = scope.blockData;
      var parameters = angular.copy(scope.blockParameters);
      scope.countries = [];
      scope.searchCountry = null;
      scope.mapzenKey = controllerInit.mapzenKey;
      if (controllerInit.countries && controllerInit.countries.length) {
        scope.countries = controllerInit.countries;
        scope.searchCountry = scope.countries[0];
      }
      angular.element("select#searchCountry").on("change", function () {
        scope.searchCountry = scope.countries[this.value];
        if (scope.searchAddress) {
          scope.selectLoadedAddress();
        }
      });
      function setMarkers(stores, viewCenter) {
        var maps = scope.maps;
        var latLngCenter = maps.latLng(viewCenter[0], viewCenter[1]);
        if (scope.markers) {
          scope.markers.clearLayers();
        }
        if (stores.length) {
          scope.map = maps.map("map-" + scope.blockId, {
            center: latLngCenter,
            zoom: 11,
          });
          var l = new maps.TileLayer(LeafletMapService.defaultTileLayerName(), {
            attribution: LeafletMapService.getAttribution(),
          });
          scope.map.addLayer(l);
          controller.buildMarkersLayer(stores);
          scope.bounds.push(latLngCenter);
          $timeout(function () {
            scope.map.invalidateSize(false);
            scope.map.panTo(latLngCenter);
            scope.map.fitBounds(scope.bounds, { padding: [40, 30] });
          }, 200);
        }
      }
      this.buildMarkersLayer = function (stores) {
        var maps = scope.maps;
        var options = scope.markerIcon ? { icon: scope.markerIcon } : {};
        var storeOptions;
        scope.markers = new maps.FeatureGroup();
        scope.bounds = [];
        angular.forEach(stores, function (store) {
          var latLng = maps.latLng(
            store.coordinates.latitude,
            store.coordinates.longitude,
          );
          if (store.coordinates.marker) {
            var markerIcon = maps.icon({
              iconUrl: store.coordinates.marker.original,
              iconAnchor: maps.point(
                store.coordinates.marker.size[0] / 2,
                store.coordinates.marker.size[1],
              ),
            });
            storeOptions = { icon: markerIcon };
          } else {
            storeOptions = options;
          }
          var marker = maps.marker(latLng, storeOptions);
          var html =
            '<div class="marker-popup-content" id="store-marker-' +
            store.common.id +
            '"></div>';
          marker.bindPopup(html, {
            minWidth: 220,
            offset: maps.point(
              0,
              -(scope.markerIcon ? controllerInit.markerIcon.size[1] - 5 : 30),
            ),
            keepInView: false,
          });
          var contentScope = null;
          marker.on("popupopen", function () {
            var html = '<div data-rbs-storelocator-store-popup=""></div>';
            scope.popupStore = store;
            var popupContent = elem.find("#store-marker-" + store.common.id);
            contentScope = scope.$new();
            $compile(html)(contentScope, function (clone) {
              popupContent.append(clone);
            });
          });
          marker.on("popupclose", function () {
            scope.popupStore = null;
            if (contentScope) {
              contentScope.$destroy();
              contentScope = null;
            }
            elem
              .find("#store-marker-" + store.common.id)
              .children()
              .remove();
          });
          scope.bounds.push(latLng);
          store.coordinates.marker = marker;
          scope.markers.addLayer(marker);
        });
        scope.map.addLayer(scope.markers);
      };
      scope.getLocation = function (val) {
        if (scope.mapzenKey) {
          var params = { text: val, api_key: scope.mapzenKey };
          if (
            scope.myCoordinates &&
            scope.myCoordinates.latitude &&
            scope.myCoordinates.longitude
          ) {
            params["focus.point.lat"] = scope.myCoordinates.latitude;
            params["focus.point.lon"] = scope.myCoordinates.longitude;
          }
          if (scope.searchCountry && scope.searchCountry.isoCode) {
            params["boundary.country"] = scope.searchCountry.isoCode;
          }
          return $http
            .get("https://search.mapzen.com/v1/autocomplete", {
              params: params,
              timeout: 500,
            })
            .then(function (response) {
              if (response.status === 200) {
                var suggestions = [{ label: val }];
                var labelList = [];
                angular.forEach(response.data.features, function (item) {
                  var label = item.properties.label;
                  if (labelList.indexOf(label) === -1) {
                    labelList.push(label);
                    suggestions.push({
                      label: label,
                      longitude: item.geometry.coordinates[0],
                      latitude: item.geometry.coordinates[1],
                    });
                  }
                });
                return suggestions;
              } else {
                console.error(
                  "Mapzen autocomplete failed : ",
                  response.data,
                  response.status,
                );
                return "";
              }
            });
        } else {
          return "";
        }
      };
      scope.search = function () {
        var coordinates = null;
        if (scope.myCoordinates) {
          coordinates = scope.myCoordinates;
        } else if (scope.addressCoordinates) {
          coordinates = scope.addressCoordinates;
        }
        if (coordinates) {
          var maps = scope.maps;
          if (scope.map) {
            var latLng = maps.latLng(
              coordinates.latitude,
              coordinates.longitude,
            );
            scope.map.setView(latLng);
          }
          scope.addressLoading = true;
          controller
            .search({
              coordinates: coordinates,
              distance:
                scope.distance || scope.searchRadius + scope.searchRadiusUnit,
              commercialSign: scope.commercialSignId
                ? scope.commercialSignId
                : 0,
            })
            .then(
              function (result) {
                controller
                  .handleSearchResults(result, coordinates)
                  .then(function () {
                    setMarkers(scope.stores, [
                      coordinates.latitude,
                      coordinates.longitude,
                    ]);
                  });
              },
              function (result) {
                scope.addressLoading = false;
                scope.stores = [];
                console.error("Search store", result);
              },
            );
        }
      };
      scope.viewStoreOnMap = function (storeIndex) {
        var store = scope.stores[storeIndex];
        var latLng = scope.maps.latLng(
          store.coordinates.latitude,
          store.coordinates.longitude,
        );
        scope.map.setView(latLng, 15);
        if (!store.coordinates.marker.isPopupOpen()) {
          store.coordinates.marker.openPopup();
        }
      };
      scope.getLoadedAddresses = function (val) {
        return AjaxAPI.getData("Rbs/Geo/AddressCompletion/", {
          address: val,
          countryCode: scope.country,
          options: scope.options,
        }).then(function (res) {
          if (res.status === 200) {
            var searchAddress = scope.searchAddress,
              items = res.data.items;
            angular.forEach(items, function (item) {
              if (item.title === searchAddress) {
                searchAddress = null;
              }
            });
            if (searchAddress) {
              items.splice(0, 0, { title: searchAddress });
            }
            return items;
          }
          return [];
        });
      };
      scope.selectLoadedAddress = function ($event) {
        if (scope.addressLoading || ($event && $event.keyCode !== 13)) {
          return;
        }
        scope.addressLoading = true;
        scope.error = null;
        var address = {
          lines: ["", scope.searchAddress, scope.searchCountry.label],
          countryCode: scope.searchCountry.code,
        };
        AjaxAPI.getData("Rbs/Geo/CoordinatesByAddress", {
          address: address,
        }).then(
          function (result) {
            scope.addressLoading = false;
            if (result.data.dataSets && result.data.dataSets.latitude) {
              scope.myCoordinates = null;
              scope.filteredAddress = null;
              scope.addressCoordinates = {
                latitude: result.data.dataSets.latitude,
                longitude: result.data.dataSets.longitude,
              };
              scope.formattedAddress =
                result.data.dataSets.formattedAddress || address.lines[1];
              scope.distance = scope.searchRadius + scope.searchRadiusUnit;
              scope.search();
            } else {
              scope.stores = [];
              scope.error = 1;
              controller.reloadBlock(parameters);
            }
          },
          function (result) {
            scope.addressLoading = false;
            scope.error = 1;
            console.error("GET Rbs/Geo/CoordinatesByAddress", result);
            controller.reloadBlock(parameters);
          },
        );
      };
      scope.selectAutocompleteAddress = function (item, model, label) {
        if (scope.addressLoading) {
          return;
        }
        if (item.latitude && item.longitude) {
          scope.addressLoading = true;
          scope.error = null;
          scope.myCoordinates = null;
          scope.filteredAddress = null;
          scope.addressCoordinates = {
            latitude: item.latitude,
            longitude: item.longitude,
          };
          scope.formattedAddress = item.label;
          scope.distance = scope.searchRadius + scope.searchRadiusUnit;
          scope.addressLoading = false;
          scope.search();
        } else {
          scope.selectLoadedAddress();
        }
      };
      LeafletMapService.maps().then(function (maps) {
        scope.maps = maps;
        var controllerInit = scope.blockData || {};
        if (controllerInit.markerIcon) {
          scope.markerIconUrl = controllerInit.markerIcon.original;
          scope.markerIcon = maps.icon({
            iconUrl: scope.markerIconUrl,
            iconAnchor: maps.point(
              controllerInit.markerIcon.size[0] / 2,
              controllerInit.markerIcon.size[1],
            ),
          });
        }
        var initialStoresData = controller.getInitialStoresData();
        if (angular.isArray(initialStoresData)) {
          scope.stores = initialStoresData;
          scope.filteredAddress = controllerInit.facetValueTitle;
          if (scope.stores.length) {
            parameters.filteredAddress = scope.filteredAddress;
            parameters.showHome = false;
            controller.reloadBlock(parameters).then(function () {
              setMarkers(scope.stores, [
                scope.stores[0].coordinates.latitude,
                scope.stores[0].coordinates.longitude,
              ]);
              var bounds = [],
                fitBounds = null;
              angular.forEach(initialStoresData, function (store) {
                bounds.push(
                  maps.latLng(
                    store.coordinates.latitude,
                    store.coordinates.longitude,
                  ),
                );
              });
              fitBounds = maps.latLngBounds(bounds);
              $timeout(function () {
                scope.map.fitBounds(fitBounds, { padding: maps.point(0, 30) });
              }, 250);
            });
          }
        }
      });
    },
  ]);
  app.controller("RbsStorelocatorGoogleSearch", [
    "$scope",
    "$element",
    "$attrs",
    "$compile",
    "RbsChange.AjaxAPI",
    "RbsGeo.GoogleMapService",
    "$timeout",
    "$controller",
    function (
      scope,
      elem,
      attrs,
      $compile,
      AjaxAPI,
      GoogleMapService,
      $timeout,
      $controller,
    ) {
      angular.extend(
        this,
        $controller("RbsBaseStorelocatorSearch", {
          $scope: scope,
          $element: elem,
          $attrs: attrs,
        }),
      );
      var controller = this;
      var controllerInit = scope.blockData;
      var parameters = angular.copy(scope.blockParameters);
      function setMarkers(stores, viewCenter) {
        if (scope.markers) {
          for (var i = 0; i < scope.markers.length; i++) {
            scope.markers[i].setMap(null);
          }
        }
        scope.markers = [];
        if (stores.length) {
          var mapOptions = {
            center: new scope.maps.LatLng(viewCenter[0], viewCenter[1]),
            zoom: 11,
            minZoom: 7,
            maxZoom: 15,
          };
          scope.map = new scope.maps.Map(
            document.getElementById("map-" + scope.blockId),
            mapOptions,
          );
          scope.bounds = new scope.maps.LatLngBounds();
          scope.bounds.extend(
            new scope.maps.LatLng(viewCenter[0], viewCenter[1]),
          );
          angular.forEach(stores, function (store) {
            var latLng = new scope.maps.LatLng(
              store.coordinates.latitude,
              store.coordinates.longitude,
            );
            var markerOptions = { position: latLng, map: scope.map };
            var markerImg = store.coordinates.marker;
            if (
              markerImg &&
              (!controllerInit.markerIcon ||
                markerImg.id !== controllerInit.markerIcon.id)
            ) {
              markerOptions.icon = {
                url: markerImg.original,
                size: new scope.maps.Size(markerImg.size[0], markerImg.size[1]),
                origin: new scope.maps.Point(0, 0),
                anchor: new scope.maps.Point(
                  markerImg.size[0] / 2,
                  markerImg.size[1],
                ),
              };
            } else if (scope.markerIcon) {
              markerOptions.icon = scope.markerIcon;
            }
            var marker = new scope.maps.Marker(markerOptions);
            scope.markers.push(marker);
            scope.bounds.extend(latLng);
            store.coordinates.openPopup = function () {
              if (scope.infoWindow) {
                scope.infoWindow.close();
                scope.popupStore = null;
              }
              var html = '<div data-rbs-storelocator-store-popup=""></div>';
              scope.infoWindow = new scope.maps.InfoWindow({
                content: $compile(html)(scope)[0],
              });
              scope.maps.event.addListener(
                scope.infoWindow,
                "domready",
                function () {
                  scope.popupStore = store;
                  scope.$digest();
                },
              );
              scope.infoWindow.open(scope.map, marker);
            };
            scope.maps.event.addListener(marker, "click", function () {
              store.coordinates.openPopup();
            });
          });
          scope.map.fitBounds(scope.bounds);
        }
      }
      scope.search = function () {
        var coordinates = null;
        if (scope.myCoordinates) {
          coordinates = scope.myCoordinates;
        } else if (scope.addressCoordinates) {
          coordinates = scope.addressCoordinates;
        }
        if (coordinates) {
          if (scope.map) {
            scope.map.setCenter(
              new scope.maps.LatLng(
                coordinates.latitude,
                coordinates.longitude,
              ),
            );
          }
          scope.addressLoading = true;
          controller
            .search({
              coordinates: coordinates,
              distance:
                scope.distance || scope.searchRadius + scope.searchRadiusUnit,
              commercialSign: scope.commercialSignId
                ? scope.commercialSignId
                : 0,
            })
            .then(
              function (result) {
                controller
                  .handleSearchResults(result, coordinates)
                  .then(function () {
                    setMarkers(scope.stores, [
                      coordinates.latitude,
                      coordinates.longitude,
                    ]);
                  });
              },
              function (result) {
                scope.addressLoading = false;
                scope.stores = [];
                console.error("search store", result);
              },
            );
        }
      };
      scope.viewStoreOnMap = function (storeIndex) {
        var store = scope.stores[storeIndex];
        var latLng = new scope.maps.LatLng(
          store.coordinates.latitude,
          store.coordinates.longitude,
        );
        scope.map.setCenter(latLng);
        scope.map.setZoom(15);
        store.coordinates.openPopup();
      };
      scope.selectLoadedAddress = function () {
        var place = scope.autocomplete.getPlace();
        if (!place.geometry) {
          return;
        }
        scope.error = null;
        scope.myCoordinates = null;
        scope.filteredAddress = null;
        var location = place.geometry.location;
        scope.addressCoordinates = {
          latitude: location.lat(),
          longitude: location.lng(),
        };
        scope.formattedAddress = place.formatted_address;
        scope.distance = scope.searchRadius + scope.searchRadiusUnit;
        scope.search();
      };
      GoogleMapService.maps().then(function (maps) {
        scope.maps = maps;
        var controllerInit = scope.blockData || {};
        if (controllerInit.markerIcon) {
          scope.markerIconUrl = controllerInit.markerIcon.original;
          scope.markerIcon = {
            url: scope.markerIconUrl,
            size: new maps.Size(
              controllerInit.markerIcon.size[0],
              controllerInit.markerIcon.size[1],
            ),
            origin: new maps.Point(0, 0),
            anchor: new maps.Point(
              controllerInit.markerIcon.size[0] / 2,
              controllerInit.markerIcon.size[1],
            ),
          };
        }
        scope.autocomplete = new maps.places.Autocomplete(
          document.getElementById(scope.blockId + "_autocomplete"),
          {
            types: ["geocode"],
            componentRestrictions: { country: ["fr", "ch"] },
          },
        );
        maps.event.addListener(
          scope.autocomplete,
          "place_changed",
          function () {
            scope.searchAddress = true;
            scope.selectLoadedAddress();
          },
        );
        var initialStoresData = controller.getInitialStoresData();
        if (angular.isArray(initialStoresData)) {
          scope.stores = initialStoresData;
          scope.filteredAddress = controllerInit.facetValueTitle;
          if (scope.stores.length) {
            $timeout(function () {
              parameters.filteredAddress = scope.filteredAddress;
              parameters.showHome = false;
              controller.reloadBlock(parameters).then(function () {
                var bounds = new maps.LatLngBounds();
                angular.forEach(initialStoresData, function (store) {
                  bounds.extend(
                    new maps.LatLng(
                      store.coordinates.latitude,
                      store.coordinates.longitude,
                    ),
                  );
                });
                var center = bounds.getCenter();
                setMarkers(scope.stores, [center.lat(), center.lng()]);
                scope.map.fitBounds(bounds);
              });
            });
          }
        }
      });
    },
  ]);
  app.directive("rbsStorelocatorStorePopup", rbsStorelocatorStorePopup);
  function rbsStorelocatorStorePopup() {
    return {
      restrict: "A",
      templateUrl: "/rbs-storelocator-store-popup.twig",
      link: function (scope, elem, attrs, controler) {},
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var cfg = window.__change.Rbs_Geo_Config;
  var locationMode = !!(
    cfg &&
    cfg.Google &&
    (cfg.Google.client || cfg.Google.APIKey)
  )
    ? "google"
    : "default";
  app.directive("rbsStorelocatorStoreSelector", [
    "RbsChange.AjaxAPI",
    "$timeout",
    "RbsGeo.GoogleMapService",
    function (AjaxAPI, $timeout, GoogleMapService) {
      return {
        restrict: "A",
        templateUrl: "/rbs-storelocator-store-selector.twig",
        scope: {
          ajaxService: "<",
          ajaxData: "<?",
          ajaxParams: "<?",
          selectStore: "<?",
          currentStore: "<?",
        },
        link: function (scope, elem) {
          scope.stores = [];
          scope.allowSelect = !!scope.selectStore;
          scope.locationMode = locationMode;
          scope.countries = [];
          scope.search = {
            address: null,
            country: null,
            coordinates: null,
            processId: 0,
            storeId: null,
            useAsDefault: true,
          };
          if (locationMode === "default") {
            AjaxAPI.getData("Rbs/Storelocator/StoreCountries/").then(
              function (result) {
                if (result.data["items"].length) {
                  for (var i = 0; i < result.data["items"].length; i++) {
                    scope.countries.push(result.data["items"][i].title);
                  }
                  scope.search.country = scope.countries[0];
                }
              },
            );
            scope.$watch("search.country", function (value, oldValue) {
              if (value && value !== oldValue && scope.search.address) {
                scope.locateByAddress();
              }
            });
          }
          scope.loading = false;
          scope.locateMeLoading = false;
          scope.locateByAddressLoading = false;
          scope.emptySearch = false;
          scope.$watch("search.address", function (address) {
            scope.locateByAddressError = false;
            if (address) {
              scope.search.coordinates = null;
            }
          });
          scope.locateMe = function () {
            if (scope.loading || scope.locateMeLoading) {
              return;
            }
            scope.locateMeLoading = true;
            scope.emptySearch = false;
            navigator.geolocation.getCurrentPosition(
              function (position) {
                scope.locateMeLoading = false;
                scope.search.coordinates = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                };
                scope.search.address = null;
                scope.$digest();
                scope.launchSearch();
              },
              function (error) {
                console.error(error);
                scope.locateMeLoading = false;
                scope.locateMeError = true;
                scope.stores = [];
                scope.$digest();
                $timeout(function () {
                  scope.locateMeError = false;
                }, 5000);
              },
              { timeout: 5000, maximumAge: 0 },
            );
          };
          scope.locateByAddress = function () {
            if (
              scope.loading ||
              scope.locateByAddressLoading ||
              !scope.search.address
            ) {
              return;
            }
            scope.locateByAddressLoading = true;
            scope.emptySearch = false;
            var address = {
              lines: ["", scope.search.address, scope.search.country],
            };
            AjaxAPI.getData("Rbs/Geo/CoordinatesByAddress", {
              address: address,
            }).then(
              function (result) {
                scope.locateByAddressLoading = false;
                if (result.data.dataSets && result.data.dataSets.latitude) {
                  scope.search.coordinates = {
                    latitude: result.data.dataSets.latitude,
                    longitude: result.data.dataSets.longitude,
                  };
                  scope.launchSearch();
                } else {
                  scope.locateByAddressError = true;
                  scope.stores = [];
                }
              },
              function () {
                scope.locateByAddressLoading = false;
                scope.locateByAddressError = true;
                scope.stores = [];
              },
            );
          };
          scope.launchSearch = function () {
            scope.loading = true;
            scope.emptySearch = false;
            var data = angular.copy(scope.ajaxData) || {};
            data.coordinates = scope.search.coordinates;
            AjaxAPI.getData(scope.ajaxService, data, scope.ajaxParams).then(
              function (result) {
                scope.stores = result.data.items;
                scope.loading = false;
                scope.emptySearch = result.data.items.length === 0;
              },
              function (result) {
                scope.stores = [];
                scope.loading = false;
                scope.emptySearch = true;
              },
            );
          };
          if (locationMode === "google") {
            GoogleMapService.maps().then(function (maps) {
              $timeout(function () {
                var autoCompleteInput = elem.find(
                  '[data-role="address-auto-complete"]',
                );
                scope.autocomplete = new maps.places.Autocomplete(
                  autoCompleteInput[0],
                  {
                    types: ["geocode"],
                    componentRestrictions: { country: ["fr", "ch"] },
                  },
                );
                maps.event.addListener(
                  scope.autocomplete,
                  "place_changed",
                  function () {
                    var place = scope.autocomplete.getPlace();
                    if (!place.geometry) {
                      return;
                    }
                    var location = place.geometry.location;
                    scope.search.coordinates = {
                      latitude: location.lat(),
                      longitude: location.lng(),
                    };
                    scope.search.address = null;
                    scope.$digest();
                    scope.launchSearch();
                  },
                );
              });
            });
          }
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsStorelocatorZoomMapModalCtrl", [
    "$scope",
    "storeData",
    "loadMap",
    "$http",
    function (scope, storeData, loadMap, $http) {
      scope.storeData = storeData;
      scope.loadMap = loadMap;
    },
  ]);
  app.directive("rbsStorelocatorZoomMap", [
    "$timeout",
    function ($timeout) {
      return {
        restrict: "A",
        scope: false,
        link: function (scope, element, attr) {
          $timeout(function () {
            scope.loadMap(attr.id);
          }, 500);
        },
      };
    },
  ]);
  function zoomMap(scope, ModalStack, loadMap) {
    var options = {
      templateUrl: "/rbs-storelocator-zoom-map-modal.twig",
      backdropClass: "modal-backdrop-rbs-storelocator-zoom-map",
      windowClass: "modal-rbs-storelocator-zoom-map",
      size: "lg",
      controller: "RbsStorelocatorZoomMapModalCtrl",
      resolve: {
        storeData: function () {
          return scope.storeData;
        },
        loadMap: function () {
          return loadMap;
        },
      },
    };
    ModalStack.open(options);
  }
  app.directive("rbsStorelocatorStore", [
    "RbsChange.ModalStack",
    "RbsGeo.LeafletMapService",
    rbsStorelocatorStore,
  ]);
  function rbsStorelocatorStore(ModalStack, LeafletMapService) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        function (scope) {
          var init = scope.blockData;
          scope.parameters = scope.blockParameters;
          this.getStoreData = function () {
            return init.storeData;
          };
          this.getMarkerIconData = function () {
            if (init.storeData.coordinates.marker) {
              return init.storeData.coordinates.marker;
            }
            return init.markerIcon;
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.storeData = controller.getStoreData();
        LeafletMapService.maps().then(function (maps) {
          loadMap("map-" + scope.blockId, maps);
          scope.zoomMap = function () {
            zoomMap(scope, ModalStack, function (id) {
              loadMap(id, maps);
            });
          };
        });
        function loadMap(id, maps) {
          if (scope.storeData.coordinates) {
            var latLng = {
              lat: scope.storeData.coordinates.latitude,
              lng: scope.storeData.coordinates.longitude,
            };
            scope.map = maps.map(id, { center: latLng, zoom: 15 });
            var l = new maps.TileLayer(
              LeafletMapService.defaultTileLayerName(),
              { attribution: LeafletMapService.getAttribution() },
            );
            scope.map.addLayer(l);
            var options = {};
            var markerImg = controller.getMarkerIconData();
            if (markerImg) {
              options.icon = maps.icon({
                iconUrl: markerImg.original,
                iconAnchor: maps.point(
                  markerImg.size[0] / 2,
                  markerImg.size[1],
                ),
              });
            }
            scope.marker = maps.marker(latLng, options).addTo(scope.map);
          }
        }
        scope.chooseStore = function (store) {
          scope.storeData.common.currentStore =
            store.common.id == scope.storeData.common.id;
          scope.$emit("rbsStorelocatorChooseStore", store.common.id);
        };
        scope.zoomMap = function () {
          zoomMap(scope, ModalStack, loadMap);
        };
      },
    };
  }
  app.directive("rbsStorelocatorGoogleStore", [
    "RbsChange.ModalStack",
    "RbsGeo.GoogleMapService",
    rbsStorelocatorGoogleStore,
  ]);
  function rbsStorelocatorGoogleStore(ModalStack, GoogleMapService) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        function (scope) {
          var init = scope.blockData;
          scope.parameters = scope.blockParameters;
          this.getStoreData = function () {
            return init.storeData;
          };
          this.getMarkerIconData = function () {
            if (init.storeData.coordinates.marker) {
              return init.storeData.coordinates.marker;
            }
            return init.markerIcon;
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.storeData = controller.getStoreData();
        GoogleMapService.maps().then(function (maps) {
          loadMap("map-" + scope.blockId, maps);
          scope.zoomMap = function () {
            zoomMap(scope, ModalStack, function (id) {
              loadMap(id, maps);
            });
          };
        });
        function loadMap(id, maps) {
          if (scope.storeData.coordinates) {
            var latLng = new maps.LatLng(
              scope.storeData.coordinates.latitude,
              scope.storeData.coordinates.longitude,
            );
            var mapOptions = { center: latLng, zoom: 15 };
            scope.map = new maps.Map(document.getElementById(id), mapOptions);
            var markerOptions = { position: latLng, map: scope.map };
            var markerImg = controller.getMarkerIconData();
            if (angular.isObject(markerImg)) {
              markerOptions.icon = {
                url: markerImg.original,
                size: new maps.Size(markerImg.size[0], markerImg.size[1]),
                origin: new maps.Point(0, 0),
                anchor: new maps.Point(
                  markerImg.size[0] / 2,
                  markerImg.size[1],
                ),
              };
            }
            scope.marker = new maps.Marker(markerOptions);
          }
        }
        scope.chooseStore = function (store) {
          scope.storeData.common.currentStore =
            store.common.id == scope.storeData.common.id;
          scope.$emit("rbsStorelocatorChooseStore", store.common.id);
        };
      },
    };
  }
  app.directive("rbsStorelocatorSearch", [
    "$compile",
    "RbsChange.AjaxAPI",
    "$timeout",
    "$http",
    "RbsGeo.LeafletMapService",
    rbsStorelocatorSearch,
  ]);
  function rbsStorelocatorSearch(
    $compile,
    AjaxAPI,
    $timeout,
    $http,
    LeafletMapService,
  ) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        "$element",
        function (scope, elem) {
          var controllerInit = scope.blockData;
          scope.parameters = scope.blockParameters;
          scope.maps = null;
          scope.markers = null;
          scope.markerIcon = null;
          scope.markerIconUrl = null;
          scope.countries = [];
          scope.searchCountry = null;
          scope.mapzenKey = controllerInit.mapzenKey;
          if (controllerInit.countries && controllerInit.countries.length) {
            scope.countries = controllerInit.countries;
            scope.searchCountry = scope.countries[0];
          }
          scope.searchRadius = 10;
          if (controllerInit.searchRadiusSelected) {
            scope.searchRadius = parseInt(controllerInit.searchRadiusSelected);
          }
          scope.searchRadiusUnit = "km";
          if (controllerInit.searchRadiusUnit) {
            scope.searchRadiusUnit = controllerInit.searchRadiusUnit;
          }
          scope.searchRadiusArray = [
            scope.searchRadius + scope.searchRadiusUnit,
          ];
          if (
            controllerInit.searchRadiusArray &&
            controllerInit.searchRadiusArray.length
          ) {
            scope.searchRadiusArray = controllerInit.searchRadiusArray;
          }
          scope.parameters.currentStoreId = null;
          if (controllerInit && controllerInit.currentStoreId) {
            scope.parameters.currentStoreId = controllerInit.currentStoreId;
          }
          this.getSearchContext = function () {
            return controllerInit ? controllerInit["searchContext"] : null;
          };
          this.getInitialStoresData = function () {
            return controllerInit && controllerInit["storesData"]
              ? controllerInit["storesData"]
              : null;
          };
          this.search = function (data) {
            var params = this.getSearchContext();
            var request = AjaxAPI.getData(
              "Rbs/Storelocator/Store/",
              data,
              params,
            );
            request.then(function () {
              scope.$emit("rbsStorelocatorSearchHome", true);
            });
            return request;
          };
          this.setMarkers = function (stores, viewCenter) {
            var maps = scope.maps;
            var latLngCenter = maps.latLng(viewCenter[0], viewCenter[1]);
            if (scope.markers) {
              scope.markers.clearLayers();
            }
            if (stores.length) {
              if (!scope.map) {
                scope.map = maps.map("map-" + scope.blockId, {
                  center: latLngCenter,
                  zoom: 11,
                });
                var l = new maps.TileLayer(
                  LeafletMapService.defaultTileLayerName(),
                  { attribution: LeafletMapService.getAttribution() },
                );
                scope.map.addLayer(l);
              }
              this.buildMarkersLayer(stores);
              scope.bounds.push(latLngCenter);
              $timeout(function () {
                scope.map.invalidateSize(false);
                scope.map.panTo(latLngCenter);
                scope.map.fitBounds(scope.bounds, { padding: [40, 30] });
              }, 200);
            }
          };
          this.buildMarkersLayer = function (stores) {
            var maps = scope.maps;
            var options = scope.markerIcon ? { icon: scope.markerIcon } : {};
            var storeOptions;
            scope.markers = new maps.FeatureGroup();
            scope.bounds = [];
            angular.forEach(stores, function (store) {
              var latLng = maps.latLng(
                store.coordinates.latitude,
                store.coordinates.longitude,
              );
              if (store.coordinates.marker) {
                var markerIcon = maps.icon({
                  iconUrl: store.coordinates.marker.original,
                  iconAnchor: maps.point(
                    store.coordinates.marker.size[0] / 2,
                    store.coordinates.marker.size[1],
                  ),
                });
                storeOptions = { icon: markerIcon };
              } else {
                storeOptions = options;
              }
              var marker = maps.marker(latLng, storeOptions);
              var html =
                '<div class="marker-popup-content" id="store-marker-' +
                store.common.id +
                '"></div>';
              marker.bindPopup(html, {
                minWidth: 220,
                offset: maps.point(
                  0,
                  -(scope.markerIcon
                    ? controllerInit.markerIcon.size[1] - 5
                    : 30),
                ),
                keepInView: false,
              });
              var contentScope = null;
              marker.on("popupopen", function () {
                var html = '<div data-rbs-storelocator-store-popup=""></div>';
                scope.popupStore = store;
                var popupContent = elem.find(
                  "#store-marker-" + store.common.id,
                );
                contentScope = scope.$new();
                $compile(html)(contentScope, function (clone) {
                  popupContent.append(clone);
                });
              });
              marker.on("popupclose", function () {
                scope.popupStore = null;
                if (contentScope) {
                  contentScope.$destroy();
                  contentScope = null;
                }
                elem
                  .find("#store-marker-" + store.common.id)
                  .children()
                  .remove();
              });
              scope.bounds.push(latLng);
              store.coordinates.marker = marker;
              scope.markers.addLayer(marker);
            });
            scope.map.addLayer(scope.markers);
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.stores = null;
        scope.searchAddress = null;
        scope.formattedAddress = null;
        scope.filteredAddress = null;
        scope.myCoordinates = null;
        scope.addressCoordinates = null;
        scope.error = null;
        scope.searchContext = controller.getSearchContext();
        scope.loadingAddresses = false;
        scope.options = {};
        scope.$watch("searchCountry", function (value, oldValue) {
          if (value && value !== oldValue && scope.searchAddress) {
            scope.selectLoadedAddress();
          }
        });
        scope.$watch("searchRadius", function (value, oldValue) {
          if (value && value !== oldValue && scope.searchAddress) {
            scope.selectLoadedAddress();
          }
        });
        if (scope.parameters.commercialSignId) {
          scope.commercialSignId = scope.parameters.commercialSignId;
        } else {
          scope.commercialSignId = null;
        }
        scope.showHome = function () {
          return scope.stores === null;
        };
        scope.getLocation = function (val) {
          if (scope.mapzenKey) {
            var params = { text: val, api_key: scope.mapzenKey };
            if (
              scope.myCoordinates &&
              scope.myCoordinates.latitude &&
              scope.myCoordinates.longitude
            ) {
              params["focus.point.lat"] = scope.myCoordinates.latitude;
              params["focus.point.lon"] = scope.myCoordinates.longitude;
            }
            if (scope.searchCountry && scope.searchCountry.isoCode) {
              params["boundary.country"] = scope.searchCountry.isoCode;
            }
            return $http
              .get("https://search.mapzen.com/v1/autocomplete", {
                params: params,
                timeout: 500,
              })
              .then(function (response) {
                if (response.status === 200) {
                  var suggestions = [{ label: val }];
                  var labelList = [];
                  angular.forEach(response.data.features, function (item) {
                    var label = item.properties.label;
                    if (labelList.indexOf(label) == -1) {
                      labelList.push(label);
                      suggestions.push({
                        label: label,
                        longitude: item.geometry.coordinates[0],
                        latitude: item.geometry.coordinates[1],
                      });
                    }
                  });
                  return suggestions;
                } else {
                  console.error(
                    "Mapzen autocomplete failed : ",
                    response.data,
                    response.status,
                  );
                  return "";
                }
              });
          } else {
            return "";
          }
        };
        scope.searchInSignStores = function () {
          scope.commercialSignId = scope.parameters.commercialSignId;
          scope.search();
        };
        scope.searchInAllStores = function () {
          scope.commercialSignId = null;
          scope.search();
        };
        scope.search = function () {
          var coordinates = null;
          if (scope.myCoordinates) {
            coordinates = scope.myCoordinates;
          } else if (scope.addressCoordinates) {
            coordinates = scope.addressCoordinates;
          }
          if (coordinates) {
            var maps = scope.maps;
            if (scope.map) {
              var latLng = maps.latLng(
                coordinates.latitude,
                coordinates.longitude,
              );
              scope.map.setView(latLng);
            }
            scope.addressLoading = true;
            controller
              .search({
                coordinates: coordinates,
                distance:
                  scope.distance || scope.searchRadius + scope.searchRadiusUnit,
                commercialSign: scope.commercialSignId
                  ? scope.commercialSignId
                  : 0,
              })
              .then(
                function (result) {
                  scope.addressLoading = false;
                  angular.forEach(result.data.items, function (item) {
                    if (item.common.id == scope.parameters.currentStoreId) {
                      item.common.currentStore = true;
                    }
                  });
                  scope.stores = result.data.items;
                  controller.setMarkers(scope.stores, [
                    coordinates.latitude,
                    coordinates.longitude,
                  ]);
                },
                function (result) {
                  scope.addressLoading = false;
                  scope.stores = [];
                  console.error("Search store", result);
                },
              );
          }
        };
        scope.locateMe = function () {
          scope.error = null;
          scope.addressLoading = true;
          navigator.geolocation.getCurrentPosition(
            function (position) {
              scope.addressLoading = false;
              scope.filteredAddress = null;
              scope.formattedAddress = null;
              scope.addressCoordinates = null;
              scope.myCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              scope.distance = scope.searchRadius + scope.searchRadiusUnit;
              scope.search();
            },
            function (error) {
              console.error(
                "Localisation failed : [" + error.code + "] " + error.message,
              );
              scope.addressLoading = false;
              scope.error = 2;
              scope.stores = [];
              scope.$emit("rbsStorelocatorSearchHome", true);
              scope.$apply();
            },
            { timeout: 5000, maximumAge: 0 },
          );
        };
        scope.viewStoreOnMap = function (store) {
          var latLng = scope.maps.latLng(
            store.coordinates.latitude,
            store.coordinates.longitude,
          );
          scope.map.setView(latLng, 15);
          if (!store.coordinates.marker.isPopupOpen()) {
            store.coordinates.marker.openPopup();
          }
        };
        scope.showStoreDetail = function (store) {
          window.location.href = store.common.URL.canonical;
        };
        scope.chooseStore = function (store) {
          angular.forEach(scope.stores, function (item) {
            item.common.currentStore = false;
          });
          store.common.currentStore = true;
          scope.parameters.currentStoreId = store.common.id;
          scope.$emit("rbsStorelocatorChooseStore", store.common.id);
        };
        scope.getLoadedAddresses = function (val) {
          return AjaxAPI.getData("Rbs/Geo/AddressCompletion/", {
            address: val,
            countryCode: scope.country,
            options: scope.options,
          }).then(function (res) {
            if (res.status == 200) {
              var searchAddress = scope.searchAddress,
                items = res.data.items;
              angular.forEach(items, function (item) {
                if (item.title == searchAddress) {
                  searchAddress = null;
                }
              });
              if (searchAddress) {
                items.splice(0, 0, { title: searchAddress });
              }
              return items;
            }
            return [];
          });
        };
        scope.selectLoadedAddress = function ($event) {
          if (scope.addressLoading) {
            return;
          }
          if ($event) {
            if ($event.keyCode != 13) {
              return;
            }
          }
          scope.addressLoading = true;
          scope.error = null;
          var address = {
            lines: ["", scope.searchAddress, scope.searchCountry.label],
            countryCode: scope.searchCountry.code,
          };
          AjaxAPI.getData("Rbs/Geo/CoordinatesByAddress", {
            address: address,
          }).then(
            function (result) {
              scope.addressLoading = false;
              if (result.data.dataSets && result.data.dataSets.latitude) {
                scope.myCoordinates = null;
                scope.filteredAddress = null;
                scope.addressCoordinates = {
                  latitude: result.data.dataSets.latitude,
                  longitude: result.data.dataSets.longitude,
                };
                scope.formattedAddress =
                  result.data.dataSets.formattedAddress || address.lines[1];
                scope.distance = scope.searchRadius + scope.searchRadiusUnit;
                scope.search();
              } else {
                scope.stores = [];
                scope.error = 1;
              }
            },
            function (result) {
              scope.addressLoading = false;
              scope.error = 1;
              console.error("GET Rbs/Geo/CoordinatesByAddress", result);
            },
          );
        };
        scope.selectAutocompleteAddress = function (item, model, label) {
          if (scope.addressLoading) {
            return;
          }
          if (item.latitude && item.longitude) {
            scope.addressLoading = true;
            scope.error = null;
            scope.myCoordinates = null;
            scope.filteredAddress = null;
            scope.addressCoordinates = {
              latitude: item.latitude,
              longitude: item.longitude,
            };
            scope.formattedAddress = item.label;
            scope.distance = scope.searchRadius + scope.searchRadiusUnit;
            scope.addressLoading = false;
            scope.search();
          } else {
            scope.selectLoadedAddress();
          }
        };
        scope.updateDistance = function (distance) {
          scope.searchRadius = distance;
          scope.distance = scope.searchRadius + scope.searchRadiusUnit;
          scope.search();
        };
        LeafletMapService.maps().then(function (maps) {
          scope.maps = maps;
          var controllerInit = scope.blockData || {};
          if (controllerInit.markerIcon) {
            scope.markerIconUrl = controllerInit.markerIcon.original;
            scope.markerIcon = maps.icon({
              iconUrl: scope.markerIconUrl,
              iconAnchor: maps.point(
                controllerInit.markerIcon.size[0] / 2,
                controllerInit.markerIcon.size[1],
              ),
            });
          }
          var initialStoresData = controller.getInitialStoresData();
          if (angular.isArray(initialStoresData)) {
            scope.stores = initialStoresData;
            scope.filteredAddress = attrs.facetValueTitle;
            scope.$emit("rbsStorelocatorSearchHome", true);
            if (scope.stores.length) {
              controller.setMarkers(scope.stores, [
                scope.stores[0].coordinates.latitude,
                scope.stores[0].coordinates.longitude,
              ]);
              var bounds = [],
                fitBounds = null;
              angular.forEach(initialStoresData, function (store) {
                bounds.push(
                  maps.latLng(
                    store.coordinates.latitude,
                    store.coordinates.longitude,
                  ),
                );
              });
              fitBounds = maps.latLngBounds(bounds);
              $timeout(function () {
                scope.map.fitBounds(fitBounds, { padding: maps.point(0, 30) });
              }, 250);
            }
          }
        });
      },
    };
  }
  app.directive("rbsStorelocatorSearchHome", [
    "$rootScope",
    rbsStorelocatorSearchHome,
  ]);
  function rbsStorelocatorSearchHome($rootScope) {
    return {
      restrict: "A",
      link: function (scope) {
        scope.hideStorelocatorSearchHome = false;
        $rootScope.$on("rbsStorelocatorSearchHome", function (e, hideHome) {
          scope.hideStorelocatorSearchHome = hideHome;
        });
      },
    };
  }
  app.directive("rbsStorelocatorStoreItem", rbsStorelocatorStoreItem);
  function rbsStorelocatorStoreItem() {
    return { restrict: "A", templateUrl: "/rbs-storelocator-store-item.twig" };
  }
  app.directive("rbsStorelocatorGoogleSearch", [
    "$compile",
    "RbsChange.AjaxAPI",
    "RbsGeo.GoogleMapService",
    "$timeout",
    rbsStorelocatorGoogleSearch,
  ]);
  function rbsStorelocatorGoogleSearch(
    $compile,
    AjaxAPI,
    GoogleMapService,
    $timeout,
  ) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        function (scope) {
          var controllerInit = scope.blockData;
          scope.parameters = scope.blockParameters;
          scope.maps = null;
          scope.markers = null;
          scope.markerIcon = null;
          scope.markerIconUrl = null;
          scope.searchRadius = 10;
          if (controllerInit.searchRadiusSelected) {
            scope.searchRadius = parseInt(controllerInit.searchRadiusSelected);
          }
          scope.searchRadiusUnit = "km";
          if (controllerInit.searchRadiusUnit) {
            scope.searchRadiusUnit = controllerInit.searchRadiusUnit;
          }
          scope.searchRadiusArray = [
            scope.searchRadius + scope.searchRadiusUnit,
          ];
          if (
            controllerInit.searchRadiusArray &&
            controllerInit.searchRadiusArray.length
          ) {
            scope.searchRadiusArray = controllerInit.searchRadiusArray;
          }
          scope.parameters.currentStoreId = null;
          if (controllerInit && controllerInit.currentStoreId) {
            scope.parameters.currentStoreId = controllerInit.currentStoreId;
          }
          this.getSearchContext = function () {
            return controllerInit ? controllerInit["searchContext"] : null;
          };
          this.getInitialStoresData = function () {
            return controllerInit && controllerInit["storesData"]
              ? controllerInit["storesData"]
              : null;
          };
          this.search = function (data) {
            var params = this.getSearchContext();
            var request = AjaxAPI.getData(
              "Rbs/Storelocator/Store/",
              data,
              params,
            );
            request.then(function () {
              scope.$emit("rbsStorelocatorSearchHome", true);
            });
            return request;
          };
          this.setMarkers = function (stores, viewCenter) {
            if (scope.markers) {
              for (var i = 0; i < scope.markers.length; i++) {
                scope.markers[i].setMap(null);
              }
            }
            scope.markers = [];
            if (stores.length) {
              if (!scope.map) {
                var mapOptions = {
                  center: new scope.maps.LatLng(viewCenter[0], viewCenter[1]),
                  zoom: 11,
                  minZoom: 7,
                  maxZoom: 15,
                };
                scope.map = new scope.maps.Map(
                  document.getElementById("map-" + scope.blockId),
                  mapOptions,
                );
              } else {
                scope.map.setCenter(
                  new scope.maps.LatLng(viewCenter[0], viewCenter[1]),
                );
              }
              scope.bounds = new scope.maps.LatLngBounds();
              scope.bounds.extend(
                new scope.maps.LatLng(viewCenter[0], viewCenter[1]),
              );
              angular.forEach(stores, function (store) {
                var latLng = new scope.maps.LatLng(
                  store.coordinates.latitude,
                  store.coordinates.longitude,
                );
                var markerOptions = { position: latLng, map: scope.map };
                var markerImg = store.coordinates.marker;
                if (
                  markerImg &&
                  (!controllerInit.markerIcon ||
                    markerImg.id != controllerInit.markerIcon.id)
                ) {
                  markerOptions.icon = {
                    url: markerImg.original,
                    size: new scope.maps.Size(
                      markerImg.size[0],
                      markerImg.size[1],
                    ),
                    origin: new scope.maps.Point(0, 0),
                    anchor: new scope.maps.Point(
                      markerImg.size[0] / 2,
                      markerImg.size[1],
                    ),
                  };
                } else if (scope.markerIcon) {
                  markerOptions.icon = scope.markerIcon;
                }
                var marker = new scope.maps.Marker(markerOptions);
                scope.markers.push(marker);
                scope.bounds.extend(latLng);
                store.coordinates.openPopup = function () {
                  if (scope.infoWindow) {
                    scope.infoWindow.close();
                    scope.popupStore = null;
                  }
                  var html = '<div data-rbs-storelocator-store-popup=""></div>';
                  scope.infoWindow = new scope.maps.InfoWindow({
                    content: $compile(html)(scope)[0],
                  });
                  scope.maps.event.addListener(
                    scope.infoWindow,
                    "domready",
                    function () {
                      scope.popupStore = store;
                      scope.$digest();
                    },
                  );
                  scope.infoWindow.open(scope.map, marker);
                };
                scope.maps.event.addListener(marker, "click", function () {
                  store.coordinates.openPopup();
                });
              });
              scope.map.fitBounds(scope.bounds);
            }
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.stores = null;
        scope.searchAddress = null;
        scope.formattedAddress = null;
        scope.filteredAddress = null;
        scope.myCoordinates = null;
        scope.addressCoordinates = null;
        scope.error = null;
        scope.searchContext = controller.getSearchContext();
        scope.loadingAddresses = false;
        scope.options = {};
        if (scope.parameters.commercialSignId) {
          scope.commercialSignId = scope.parameters.commercialSignId;
        } else {
          scope.commercialSignId = null;
        }
        scope.showHome = function () {
          return scope.stores === null;
        };
        scope.searchInSignStores = function () {
          scope.commercialSignId = scope.parameters.commercialSignId;
          scope.search();
        };
        scope.searchInAllStores = function () {
          scope.commercialSignId = null;
          scope.search();
        };
        scope.search = function () {
          var coordinates = null;
          if (scope.myCoordinates) {
            coordinates = scope.myCoordinates;
          } else if (scope.addressCoordinates) {
            coordinates = scope.addressCoordinates;
          }
          if (coordinates) {
            if (scope.map) {
              scope.map.setCenter(
                new scope.maps.LatLng(
                  coordinates.latitude,
                  coordinates.longitude,
                ),
              );
            }
            scope.addressLoading = true;
            controller
              .search({
                coordinates: coordinates,
                distance:
                  scope.distance || scope.searchRadius + scope.searchRadiusUnit,
                commercialSign: scope.commercialSignId
                  ? scope.commercialSignId
                  : 0,
              })
              .then(
                function (result) {
                  scope.addressLoading = false;
                  angular.forEach(result.data.items, function (item) {
                    if (item.common.id == scope.parameters.currentStoreId) {
                      item.common.currentStore = true;
                    }
                  });
                  scope.stores = result.data.items;
                  controller.setMarkers(scope.stores, [
                    coordinates.latitude,
                    coordinates.longitude,
                  ]);
                },
                function (result) {
                  scope.addressLoading = false;
                  scope.stores = [];
                  console.error("search store", result);
                },
              );
          }
        };
        scope.locateMe = function () {
          scope.error = null;
          scope.addressLoading = true;
          navigator.geolocation.getCurrentPosition(
            function (position) {
              scope.addressLoading = false;
              scope.filteredAddress = null;
              scope.formattedAddress = null;
              scope.addressCoordinates = null;
              scope.myCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              scope.distance = scope.searchRadius + scope.searchRadiusUnit;
              scope.search();
            },
            function (error) {
              console.error(
                "Localisation failed : [" + error.code + "] " + error.message,
              );
              scope.addressLoading = false;
              scope.error = 2;
              scope.stores = [];
              scope.$emit("rbsStorelocatorSearchHome", true);
              scope.$apply();
            },
            { timeout: 5000, maximumAge: 0 },
          );
        };
        scope.viewStoreOnMap = function (store) {
          var latLng = new scope.maps.LatLng(
            store.coordinates.latitude,
            store.coordinates.longitude,
          );
          scope.map.setCenter(latLng);
          scope.map.setZoom(15);
          store.coordinates.openPopup();
        };
        scope.showStoreDetail = function (store) {
          window.location.href = store.common.URL.canonical;
        };
        scope.chooseStore = function (store) {
          angular.forEach(scope.stores, function (item) {
            item.common.currentStore = false;
          });
          store.common.currentStore = true;
          scope.parameters.currentStoreId = store.common.id;
          scope.$emit("rbsStorelocatorChooseStore", store.common.id);
        };
        scope.$watch("searchRadius", function (value, oldValue) {
          if (value && value !== oldValue && scope.searchAddress) {
            scope.updateDistance(value);
          }
        });
        scope.selectLoadedAddress = function () {
          var place = scope.autocomplete.getPlace();
          if (!place.geometry) {
            return;
          }
          scope.error = null;
          scope.myCoordinates = null;
          scope.filteredAddress = null;
          var location = place.geometry.location;
          scope.addressCoordinates = {
            latitude: location.lat(),
            longitude: location.lng(),
          };
          scope.formattedAddress = place.formatted_address;
          scope.distance = scope.searchRadius + scope.searchRadiusUnit;
          scope.search();
        };
        scope.updateDistance = function (distance) {
          scope.searchRadius = distance;
          scope.distance = scope.searchRadius + scope.searchRadiusUnit;
          scope.search();
        };
        GoogleMapService.maps().then(function (maps) {
          scope.maps = maps;
          var controllerInit = scope.blockData || {};
          if (controllerInit.markerIcon) {
            scope.markerIconUrl = controllerInit.markerIcon.original;
            scope.markerIcon = {
              url: scope.markerIconUrl,
              size: new maps.Size(
                controllerInit.markerIcon.size[0],
                controllerInit.markerIcon.size[1],
              ),
              origin: new maps.Point(0, 0),
              anchor: new maps.Point(
                controllerInit.markerIcon.size[0] / 2,
                controllerInit.markerIcon.size[1],
              ),
            };
          }
          scope.autocomplete = new maps.places.Autocomplete(
            document.getElementById(scope.blockId + "_autocomplete"),
            {
              types: ["geocode"],
              componentRestrictions: { country: ["fr", "ch"] },
            },
          );
          maps.event.addListener(
            scope.autocomplete,
            "place_changed",
            function () {
              scope.searchAddress = true;
              scope.selectLoadedAddress();
            },
          );
          var initialStoresData = controller.getInitialStoresData();
          if (angular.isArray(initialStoresData)) {
            scope.stores = initialStoresData;
            scope.filteredAddress = attrs.facetValueTitle;
            scope.$emit("rbsStorelocatorSearchHome", true);
            if (scope.stores.length) {
              $timeout(function () {
                var bounds = new maps.LatLngBounds();
                angular.forEach(initialStoresData, function (store) {
                  bounds.extend(
                    new maps.LatLng(
                      store.coordinates.latitude,
                      store.coordinates.longitude,
                    ),
                  );
                });
                var center = bounds.getCenter();
                controller.setMarkers(scope.stores, [
                  center.lat(),
                  center.lng(),
                ]);
                scope.map.fitBounds(bounds);
              });
            }
          }
        });
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsProductreturnReturnProcessController", [
    "$scope",
    "$element",
    "RbsChange.AjaxAPI",
    RbsProductreturnReturnProcessController,
  ]);
  function RbsProductreturnReturnProcessController(scope, $element, AjaxAPI) {
    scope.returnData = {
      shipments: [],
      returnMode: { id: null },
      reshippingData: { mode: { id: null }, address: null },
      orderData: {},
    };
    scope.returnRequest = null;
    scope.returnRequestError = false;
    scope.orderData = {};
    scope.data = {
      editingLine: null,
      productAjaxData: {},
      productAjaxParams: {},
    };
    var reasons = {};
    var processingModes = {};
    var processingRequest = false;
    scope.getOrderLineByKey = function (key) {
      for (var i = 0; i < scope.orderData.lines.length; i++) {
        var line = scope.orderData.lines[i];
        if (line.key === key) {
          return line;
        }
      }
      return null;
    };
    var cacheKey = $element.attr("data-cache-key");
    if (cacheKey) {
      scope.parameters = AjaxAPI.getBlockParameters(cacheKey);
      scope.data.productAjaxData.webStoreId = scope.parameters.webStoreId;
      scope.data.productAjaxData.billingAreaId = scope.parameters.billingAreaId;
      scope.data.productAjaxData.zone = scope.parameters.zone;
      scope.data.productAjaxParams.visualFormats =
        scope.parameters["imageFormats"];
      if (angular.isObject(scope.blockData)) {
        var data = scope.blockData;
        scope.orderData = data.orderData;
        scope.returnData.orderData = data.orderData;
        scope.processData = data.processData;
        scope.columnCount = data.columnCount;
        if (scope.processData["returnModes"].length === 1) {
          scope.returnData.returnMode.id =
            scope.processData["returnModes"][0].id;
        }
        for (
          var reasonIndex = 0;
          reasonIndex < scope.processData["reasons"].length;
          reasonIndex++
        ) {
          var reason = scope.processData["reasons"][reasonIndex];
          reasons[reason.id] = reason;
          for (
            var lineIndex = 0;
            lineIndex < reason["processingModes"].length;
            lineIndex++
          ) {
            var mode = reason["processingModes"][lineIndex];
            processingModes[mode.id] = mode;
          }
        }
        for (
          var shipmentIndex = 0;
          shipmentIndex < scope.orderData.shipments.length;
          shipmentIndex++
        ) {
          var shipment = scope.orderData.shipments[shipmentIndex];
          if (
            !shipment.hasOwnProperty("common") ||
            !shipment.common.hasOwnProperty("shippingDate")
          ) {
            continue;
          }
          var lines = [];
          for (lineIndex = 0; lineIndex < shipment.lines.length; lineIndex++) {
            var shipmentLine = angular.copy(shipment.lines[lineIndex]);
            var line = {
              lineIndex: lineIndex,
              returnLines: [],
              shipmentLine: shipmentLine,
            };
            line.product = shipmentLine.product;
            line.alreadyReturned = 0;
            for (
              var returnIndex = 0;
              returnIndex < scope.orderData.returns.length;
              returnIndex++
            ) {
              var returnData = scope.orderData.returns[returnIndex];
              if (
                returnData.common["statusInfos"].code === "CANCELED" ||
                returnData.common["statusInfos"].code === "REFUSED" ||
                returnData.common["statusInfos"].code === "EDITION"
              ) {
                continue;
              }
              for (
                var returnLineIndex = 0;
                returnLineIndex < returnData.lines.length;
                returnLineIndex++
              ) {
                var returnLine = returnData.lines[returnLineIndex];
                if (
                  returnLine.shipmentId == shipment.common.id &&
                  returnLine.shipmentLineIndex == lineIndex
                ) {
                  if (
                    returnLine.options.hasOwnProperty("receivedQuantity") &&
                    angular.isNumber(returnLine.options["receivedQuantity"])
                  ) {
                    line.alreadyReturned +=
                      returnLine.options["receivedQuantity"];
                  } else {
                    line.alreadyReturned += returnLine.quantity;
                  }
                }
              }
            }
            lines.push(line);
          }
          scope.returnData.shipments.push({
            lines: lines,
            shipmentData: angular.copy(shipment),
          });
        }
      }
    }
    scope.hasReturnLine = function (shipmentIndex, lineIndex) {
      if (lineIndex !== undefined) {
        return (
          scope.returnData.shipments[shipmentIndex].lines[lineIndex].returnLines
            .length > 0
        );
      } else {
        for (var i = 0; i < scope.returnData.shipments.length; i++) {
          for (var j = 0; j < scope.returnData.shipments[i].lines.length; j++) {
            if (scope.returnData.shipments[i].lines[j].returnLines.length > 0) {
              return true;
            }
          }
        }
        return false;
      }
    };
    scope.needsReshipment = function () {
      for (
        var shipmentIndex = 0;
        shipmentIndex < scope.returnData.shipments.length;
        shipmentIndex++
      ) {
        for (
          var lineIndex = 0;
          lineIndex < scope.returnData.shipments[shipmentIndex].lines.length;
          lineIndex++
        ) {
          var line = scope.returnData.shipments[shipmentIndex].lines[lineIndex];
          for (
            var returnLineIndex = 0;
            returnLineIndex < line.returnLines.length;
            returnLineIndex++
          ) {
            var mode = scope.getProcessingModeById(
              line.returnLines[returnLineIndex]["preferredProcessingMode"],
            );
            if (mode && mode["impliesReshipment"]) {
              return true;
            }
          }
        }
      }
      return false;
    };
    scope.$watch(
      "returnData.shipments",
      function () {
        scope.stepsData.reshipping.isEnabled = scope.needsReshipment();
      },
      true,
    );
    scope.editLine = function (shipmentIndex, lineIndex, returnLineIndex) {
      scope.data.editingLine =
        shipmentIndex + "_" + lineIndex + "_" + returnLineIndex;
    };
    scope.isEditing = function () {
      var editingStep = false;
      angular.forEach(scope.stepsData, function (step) {
        if (step.isEnabled && (!step.isChecked || step.isCurrent)) {
          editingStep = true;
        }
      });
      return processingRequest || editingStep || scope.isEditingLine();
    };
    scope.isEditingLine = function (shipmentIndex, lineIndex, returnLineIndex) {
      if (lineIndex === undefined) {
        return scope.data.editingLine !== null;
      } else if (returnLineIndex === undefined) {
        var value = shipmentIndex + "_" + lineIndex + "_";
        return (
          angular.isString(scope.data.editingLine) &&
          scope.data.editingLine.substr(0, value.length) == value
        );
      } else {
        return (
          scope.data.editingLine ==
          shipmentIndex + "_" + lineIndex + "_" + returnLineIndex
        );
      }
    };
    scope.newReturnLine = function (shipmentIndex, lineIndex) {
      var newIndex =
        scope.returnData.shipments[shipmentIndex].lines[lineIndex].returnLines
          .length;
      scope.data.editingLine = shipmentIndex + "_" + lineIndex + "_" + newIndex;
      var returnLine = {
        expanded: true,
        productData: {},
        options: {},
        attachedFiles: [],
      };
      if (
        scope.getLineRemainingQuantity(shipmentIndex, lineIndex, newIndex) == 1
      ) {
        returnLine.quantity = 1;
      }
      if (scope.processData["reasons"].length == 1) {
        returnLine.reason = scope.processData["reasons"][0].id;
      }
      scope.returnData.shipments[shipmentIndex].lines[
        lineIndex
      ].returnLines.push(returnLine);
    };
    scope.getReasonById = function (reasonId) {
      return reasons.hasOwnProperty(reasonId) ? reasons[reasonId] : null;
    };
    scope.getProcessingModeById = function (modeId) {
      return processingModes.hasOwnProperty(modeId)
        ? processingModes[modeId]
        : null;
    };
    scope.getProcessingMode = function (returnLine) {
      var processingMode = returnLine.preferredProcessingMode
        ? scope.getProcessingModeById(returnLine.preferredProcessingMode)
        : null;
      if (processingMode === null) {
        processingMode = {
          title: returnLine.options && returnLine.options.processingModeTitle,
        };
      }
      return processingMode;
    };
    scope.getAvailableProcessingModes = function (reason, product) {
      if (angular.isNumber(reason)) {
        reason = scope.getReasonById(reason);
      }
      var availableModes = [];
      if (angular.isObject(reason)) {
        for (
          var modeId = 0;
          modeId < reason["processingModes"].length;
          modeId++
        ) {
          if (
            reason["processingModes"][modeId]["allowVariantSelection"] &&
            !angular.isObject(product)
          ) {
            continue;
          }
          availableModes.push(reason["processingModes"][modeId]);
        }
      }
      return availableModes;
    };
    scope.getLineRemainingQuantity = function (
      shipmentIndex,
      lineIndex,
      returnLineIndex,
    ) {
      var quantity =
        scope.returnData.shipments[shipmentIndex].lines[lineIndex].shipmentLine
          .quantity;
      quantity -=
        scope.returnData.shipments[shipmentIndex].lines[lineIndex]
          .alreadyReturned;
      for (
        var i = 0;
        i <
        scope.returnData.shipments[shipmentIndex].lines[lineIndex].returnLines
          .length;
        i++
      ) {
        if (returnLineIndex === undefined || returnLineIndex != i) {
          quantity -=
            scope.returnData.shipments[shipmentIndex].lines[lineIndex]
              .returnLines[i].quantity;
        }
      }
      return quantity;
    };
    scope.getAvailableQuantities = function (
      shipmentIndex,
      lineIndex,
      returnLineIndex,
    ) {
      var array = [];
      var remainingQuantity = scope.getLineRemainingQuantity(
        shipmentIndex,
        lineIndex,
        returnLineIndex,
      );
      for (var i = 0; i < remainingQuantity; i++) {
        array.push(i + 1);
      }
      return array;
    };
    scope.canChooseOtherVariant = function (line, returnLine) {
      if (
        !angular.isObject(line) ||
        !line.product ||
        line.product.common.type !== "variant"
      ) {
        return false;
      }
      if (
        !angular.isObject(returnLine) ||
        !returnLine["preferredProcessingMode"]
      ) {
        return false;
      }
      var mode = scope.getProcessingModeById(
        returnLine["preferredProcessingMode"],
      );
      if (
        !angular.isObject(mode) ||
        !mode.hasOwnProperty("allowVariantSelection")
      ) {
        return false;
      }
      if (
        !mode.hasOwnProperty("impliesReshipment") ||
        !mode["impliesReshipment"]
      ) {
        return false;
      }
      return mode["allowVariantSelection"] === true;
    };
    scope.sendReturnRequest = function (waitingMessage) {
      var linesData = [];
      processingRequest = true;
      for (
        var shipmentIndex = 0;
        shipmentIndex < scope.returnData.shipments.length;
        shipmentIndex++
      ) {
        var shipment = scope.returnData.shipments[shipmentIndex];
        for (
          var lineIndex = 0;
          lineIndex < shipment.lines.length;
          lineIndex++
        ) {
          var line = shipment.lines[lineIndex];
          for (
            var returnLineIndex = 0;
            returnLineIndex < line.returnLines.length;
            returnLineIndex++
          ) {
            var returnLine = line.returnLines[returnLineIndex];
            var lineData = {
              shipmentId: shipment.shipmentData.common.id,
              shipmentLineIndex: line.lineIndex,
              quantity: returnLine.quantity,
              reasonId: returnLine.reason,
              reasonPrecisions: returnLine["precisions"],
              attachedFiles: returnLine["attachedFiles"],
              preferredProcessingModeId: returnLine["preferredProcessingMode"],
            };
            if (
              scope.canChooseOtherVariant(line, returnLine) &&
              angular.isObject(returnLine.productData)
            ) {
              returnLine.options.reshippingProductId =
                returnLine.productData.common.id;
            }
            returnLine.options.unitAmountWithoutTaxes =
              line.unitAmountWithoutTaxes;
            returnLine.options.unitAmountWithTaxes = line.unitAmountWithTaxes;
            lineData.options = returnLine.options;
            linesData.push(lineData);
          }
        }
      }
      var data = {
        common: {
          orderId: scope.orderData.common.id,
          returnMode: scope.returnData.returnMode,
        },
        lines: linesData,
      };
      if (scope.needsReshipment()) {
        data.reshippingData = scope.returnData.reshippingData;
      }
      AjaxAPI.openWaitingModal(waitingMessage);
      AjaxAPI.postData("Rbs/Productreturn/ProductReturn/", data, {
        detailed: false,
        URLFormats: ["canonical"],
        dataSets: "returnMode",
      }).then(
        function (result) {
          var URL = result.data.dataSets.common.URL["canonical"];
          if (URL) {
            AjaxAPI.closeWaitingModal();
            scope.returnRequest = result.data.dataSets;
          } else {
            AjaxAPI.closeWaitingModal();
          }
          scope.returnRequestError = false;
        },
        function (result) {
          processingRequest = false;
          AjaxAPI.closeWaitingModal();
          scope.returnRequestError = true;
          console.error(result);
        },
      );
    };
    scope.$watch("returnData.returnMode.id", function (returnModeId) {
      var linesContainer = $element.find(
        '[data-role="return-mode-configuration-zone"]',
      );
      var returnMode = null;
      var returnModeIdx = null;
      angular.forEach(scope.processData["returnModes"], function (m, idx) {
        if (m && m.id === returnModeId) {
          returnMode = m;
          returnModeIdx = idx;
        }
      });
      if (!returnMode || !returnMode.directiveName) {
        scope.processEngine.replaceChildren(linesContainer, scope, null);
        return;
      }
      var html = [];
      html.push("<div data-" + returnMode.directiveName + '=""');
      html.push(' data-process-data="processData"');
      html.push(
        ' data-return-mode="processData.returnModes[' + returnModeIdx + ']"',
      );
      html.push(' data-return-data="returnData"');
      html.push("></div>");
      scope.processEngine.replaceChildren(linesContainer, scope, html.join(""));
    });
  }
  app.directive("rbsProductreturnProcess", [
    "$compile",
    rbsProductreturnProcess,
  ]);
  function rbsProductreturnProcess($compile) {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-process.twig",
      controllerAs: "processEngine",
      controller: [
        "$scope",
        function (scope) {
          scope.loading = false;
          scope.stepsData = {
            reshipping: {
              name: "reshipping",
              isCurrent: true,
              isEnabled: false,
              isChecked: false,
            },
          };
          this.type = "return";
          this.loading = function (loading) {
            if (angular.isDefined(loading)) {
              scope.loading = loading == true;
            }
            return scope.loading;
          };
          this.loadObjectData = function () {
            return null;
          };
          this.updateObjectData = function (actions) {
            if (actions.hasOwnProperty("setReshippingData")) {
              scope.returnData.reshippingData = actions.setReshippingData;
            }
            if (actions.hasOwnProperty("setStepValid")) {
              scope.stepsData[actions.setStepValid].isChecked = true;
            }
            if (actions.hasOwnProperty("setNotCurrentStep")) {
              scope.stepsData[actions.setStepValid].isCurrent = false;
            }
            return null;
          };
          this.getObjectData = function () {
            return scope.returnData;
          };
          this.showPrices = function () {
            return scope.blockData && scope.blockData.showPrices;
          };
          this.getCurrencyCode = function () {
            return null;
          };
          this.parameters = function (name) {
            if (scope.parameters) {
              if (angular.isUndefined(name)) {
                return scope.parameters;
              } else {
                return scope.parameters[name];
              }
            }
            return null;
          };
          this.getProcessConfigurationInfo = function () {
            return scope.processData;
          };
          var contentScopes = {};
          this.replaceChildren = function (parentNode, scope, html) {
            var id = scope.$id;
            if (contentScopes[id]) {
              contentScopes[id].$destroy();
              contentScopes[id] = null;
            }
            parentNode.children().remove();
            if (html != "") {
              contentScopes[id] = scope.$new();
              $compile(html)(contentScopes[id], function (clone) {
                parentNode.append(clone);
              });
            }
          };
          this.nextStep = function () {
            return null;
          };
          this.getNextStep = function () {
            return null;
          };
          this.setCurrentStep = function (currentStep) {
            scope.stepsData[currentStep].isCurrent = true;
          };
          this.getStepProcessData = function (step) {
            if (scope.stepsData.hasOwnProperty(step)) {
              return scope.stepsData[step];
            }
            return {
              name: step,
              isCurrent: false,
              isEnabled: false,
              isChecked: false,
            };
          };
        },
      ],
      link: function (scope, elem, attrs, controller) {
        scope.showPrices = controller.showPrices();
        scope.isStepEnabled = function (step) {
          return controller.getStepProcessData(step).isEnabled;
        };
        scope.isStepChecked = function (step) {
          return controller.getStepProcessData(step).isChecked;
        };
      },
    };
  }
  app.directive(
    "rbsProductreturnReturnLineSummary",
    rbsProductreturnReturnLineSummary,
  );
  function rbsProductreturnReturnLineSummary() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-return-line-summary.twig",
      scope: true,
      link: function (scope, element, attrs) {},
    };
  }
  app.directive(
    "rbsProductreturnReturnLineEdition",
    rbsProductreturnReturnLineEdition,
  );
  function rbsProductreturnReturnLineEdition() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-return-line-edition.twig",
      scope: true,
      link: function (scope, element, attrs) {
        var formName = attrs["formName"];
        scope.isLineValid = function (line, returnLine) {
          if (scope[formName].$invalid) {
            return false;
          }
          if (returnLine.timeLimitExceeded) {
            return false;
          }
          if (!scope.canChooseOtherVariant(line, returnLine)) {
            return true;
          }
          return scope.isSelectedVariantAvailable(returnLine);
        };
        scope.isSelectedVariantAvailable = function (returnLine) {
          var cartBox = returnLine.productData["cartBox"];
          return (
            angular.isObject(cartBox) &&
            cartBox.allCategories &&
            cartBox.allCategories.allowed &&
            !cartBox.allCategories.disabled
          );
        };
        scope.validateLine = function (
          shipmentIndex,
          lineIndex,
          returnLineIndex,
        ) {
          var line = scope.returnData.shipments[shipmentIndex].lines[lineIndex];
          var returnLine = line.returnLines[returnLineIndex];
          if (scope.isLineValid(line, returnLine)) {
            scope.data.editingLine = null;
          }
        };
        scope.cancelLine = function (
          shipmentIndex,
          lineIndex,
          returnLineIndex,
        ) {
          scope.data.editingLine = null;
          scope.returnData.shipments[shipmentIndex].lines[
            lineIndex
          ].returnLines.splice(returnLineIndex, 1);
        };
        function isTimeLimitExceeded(reason) {
          if (!reason || !reason["timeLimitAfterReceipt"]) {
            return false;
          } else if (!reason["timeoutMessage"]) {
            console.error(
              "A reason with a time limit requires a timeout message!",
            );
          }
          var dateNow = new Date();
          var dateToCheck;
          var timeLimit = reason["timeLimitAfterReceipt"];
          if (scope["shipment"].shipmentData.common["deliveryDate"]) {
            dateToCheck = new Date(
              scope["shipment"].shipmentData.common["deliveryDate"],
            );
            dateToCheck.setDate(dateToCheck.getDate() + timeLimit);
          } else {
            dateToCheck = new Date(
              scope["shipment"].shipmentData.common["shippingDate"],
            );
            dateToCheck.setDate(
              dateToCheck.getDate() +
                timeLimit +
                reason["extraTimeAfterShipping"],
            );
          }
          return dateNow.getTime() > dateToCheck.getTime();
        }
        function autoSelectReturnModeId(reason, returnModeId) {
          if (!reason) {
            return null;
          }
          var processingModes = scope.getAvailableProcessingModes(
            reason,
            scope.line.product,
          );
          if (reason["processingModes"].length == 1) {
            return reason["processingModes"][0].id;
          }
          for (var i = 0; i < reason["processingModes"].length; i++) {
            if (reason["processingModes"][i].id == returnModeId) {
              return returnModeId;
            }
          }
          return null;
        }
        scope.$watch("returnLine.reason", function (reasonId) {
          var reason = scope.getReasonById(reasonId);
          if (reason && isTimeLimitExceeded(reason)) {
            scope["returnLine"].timeLimitExceeded = true;
            scope["returnLine"].timeLimitErrorMessage =
              reason["timeoutMessage"];
          } else {
            scope["returnLine"].timeLimitExceeded = false;
            scope["returnLine"].timeLimitErrorMessage = null;
          }
          var modeId = autoSelectReturnModeId(
            reason,
            scope["returnLine"].preferredProcessingMode,
          );
          if (modeId !== scope["returnLine"].preferredProcessingMode) {
            scope["returnLine"].preferredProcessingMode = modeId;
          }
        });
      },
    };
  }
  app.directive("rbsProductreturnVariantSelectorContainer", [
    "RbsChange.AjaxAPI",
    rbsProductreturnVariantSelectorContainer,
  ]);
  function rbsProductreturnVariantSelectorContainer(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-variant-selector-container.twig",
      scope: true,
      link: function (scope, elment, attrs) {
        var productId = scope.line.product.common.id;
        var params = angular.copy(scope.data.productAjaxParams);
        if (!angular.isArray(params.dataSetNames)) {
          params.dataSetNames = [];
        }
        params.dataSetNames.push("rootProduct");
        AjaxAPI.openWaitingModal(attrs["waitingMessage"]);
        AjaxAPI.getData(
          "Rbs/Catalog/Product/" + productId,
          scope.data.productAjaxData,
          params,
        ).then(
          function (result) {
            scope["returnLine"].productData = result.data["dataSets"];
            AjaxAPI.closeWaitingModal();
          },
          function (result) {
            scope.error = result.data.message;
            console.error(result);
            AjaxAPI.closeWaitingModal();
          },
        );
      },
    };
  }
  app.directive("rbsProductreturnShipmentLines", [
    "$compile",
    rbsProductreturnShipmentLines,
  ]);
  function rbsProductreturnShipmentLines($compile) {
    return {
      restrict: "A",
      controller: function () {
        this.getLineDirectiveName = function (line) {
          return "data-rbs-productreturn-shipment-line-details-default";
        };
      },
      link: function (scope, elment, attrs, controller) {
        var html = [];
        angular.forEach(scope["shipment"].lines, function (line, lineIndex) {
          html.push(
            '<tr data-line-index="' +
              lineIndex +
              '" ' +
              controller.getLineDirectiveName(line) +
              '=""></tr>',
          );
          html.push(
            '<tr data-line-index="' +
              lineIndex +
              '" data-rbs-productreturn-shipment-line-return=""></tr>',
          );
          html.push(
            '<tr data-line-index="' +
              lineIndex +
              '" data-rbs-productreturn-shipment-line-footer=""></tr>',
          );
        });
        if (html.length) {
          $compile(html.join(""))(scope, function (clone) {
            elment.append(clone);
          });
        }
      },
    };
  }
  app.directive(
    "rbsProductreturnShipmentLineDetailsDefault",
    rbsProductreturnShipmentLineDetailsDefault,
  );
  function rbsProductreturnShipmentLineDetailsDefault() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-shipment-line-details-default.twig",
      scope: true,
      replace: true,
      link: function (scope, elment, attrs) {
        scope.lineIndex = attrs["lineIndex"];
        scope.line = scope["shipment"].lines[scope.lineIndex];
      },
    };
  }
  app.directive(
    "rbsProductreturnShipmentLineReturn",
    rbsProductreturnShipmentLineReturn,
  );
  function rbsProductreturnShipmentLineReturn() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-shipment-line-return.twig",
      scope: true,
      replace: true,
      link: function (scope, elment, attrs) {
        scope.lineIndex = attrs["lineIndex"];
        scope.line = scope["shipment"].lines[scope.lineIndex];
      },
    };
  }
  app.directive(
    "rbsProductreturnShipmentLineFooter",
    rbsProductreturnShipmentLineFooter,
  );
  function rbsProductreturnShipmentLineFooter() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-shipment-line-footer.twig",
      scope: true,
      replace: true,
      link: function (scope, elment, attrs) {
        scope.lineIndex = attrs["lineIndex"];
        scope.line = scope["shipment"].lines[scope.lineIndex];
      },
    };
  }
  app.directive(
    "rbsProductreturnProductAvailability",
    rbsProductreturnProductAvailability,
  );
  function rbsProductreturnProductAvailability() {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-product-availability.twig",
      scope: { productData: "=" },
      link: function (scope, elment, attrs) {},
    };
  }
  app.directive("rbsProductreturnFileReader", [
    "$http",
    function ($http) {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function (scope, element, attrs, ngModel) {
          if (!ngModel || !attrs.uploadFileUrl) {
            return;
          }
          var fileMimeTypes = [];
          angular.forEach(
            (attrs.fileMimeTypes || "").split(","),
            function (mimType) {
              if ((mimType = mimType.trim()) !== "") {
                fileMimeTypes.push(mimType);
              }
            },
          );
          var maxFileSize = parseInt(attrs.maxFileSize, 10);
          if (isNaN(maxFileSize)) {
            maxFileSize = 0;
          }
          ngModel.$render = function () {};
          element.on("change", function (e) {
            var element = e.target;
            scope.fileError = null;
            if (element.files && element.files.length) {
              var file = element.files[0];
              if (maxFileSize && file.size > maxFileSize) {
                scope.fileError = "size";
                scope.$digest();
                return;
              }
              if (fileMimeTypes.length) {
                var ok = false;
                fileMimeTypes.forEach(function (v) {
                  ok = ok || v === file.type;
                });
                if (!ok) {
                  scope.fileError = "mime_type";
                  scope.$digest();
                  return;
                }
              }
              scope.uploadingFile = true;
              var fd = new FormData();
              fd.append("file", file);
              var config = {
                transformRequest: angular.identity,
                headers: { "Content-Type": undefined },
              };
              $http.post(attrs.uploadFileUrl, fd, config).then(
                function (response) {
                  delete scope.uploadingFile;
                  ngModel.$setViewValue({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    tmpURI: response.data.tmpURI,
                  });
                },
                function (response) {
                  console.error(response.status, file.name, file.type);
                  scope.fileError = "upload";
                  delete scope.uploadingFile;
                  ngModel.$setViewValue(null);
                },
              );
            } else {
              ngModel.$setViewValue(null);
            }
          });
        },
      };
    },
  ]);
  app.directive("rbsProductreturnReshippingStep", [
    "RbsChange.AjaxAPI",
    rbsProductreturnReshippingStep,
  ]);
  function rbsProductreturnReshippingStep(AjaxAPI) {
    return {
      restrict: "A",
      templateUrl: "/rbs-productreturn-reshipping-step.twig",
      scope: { processEngine: "=" },
      link: function (scope) {
        scope.processData =
          scope.processEngine.getStepProcessData("reshipping");
        scope.processData.errors = [];
        var objectData = scope.processEngine.getObjectData();
        if (!objectData.customer) {
          var orderProcess = objectData.orderData.process;
          objectData.customer = {
            email: orderProcess.email,
            mobilePhone: orderProcess.mobilePhone,
            options: {
              profiles: {
                Rbs_User: {
                  firstName: orderProcess.firstName,
                  lastName: orderProcess.lastName,
                },
              },
            },
          };
        }
        scope.userAddresses = [];
        scope.shippingZone = null;
        scope.taxesZones = null;
        scope.giftCapabilities = {
          allow: false,
          allowMessage: false,
          allowWrap: false,
        };
        scope.isCategory = function (shippingMode, category) {
          if (scope.shippingModesInfo.hasOwnProperty(category)) {
            var shippingModes = scope.shippingModesInfo[category];
            for (var i = 0; i < shippingModes.length; i++) {
              if (shippingModes[i].common.id == shippingMode.id) {
                return true;
              }
            }
          }
          return false;
        };
        scope.hasCategory = function (category) {
          return scope.shippingModesInfo.hasOwnProperty(category);
        };
        scope.getModesByCategory = function (category) {
          return scope.shippingModesInfo.hasOwnProperty(category)
            ? scope.shippingModesInfo[category]
            : [];
        };
        scope.loadUserAddresses = function () {
          if (scope.processData.userId) {
            AjaxAPI.getData("Rbs/Geo/Address/", {
              userId: scope.processData.userId,
              matchingZone: scope.shippingZone,
            }).then(
              function (result) {
                scope.userAddresses = result.data.items;
              },
              function (result) {
                console.error("loadUserAddresses", result);
                scope.userAddresses = [];
              },
            );
          } else {
            scope.userAddresses = [];
          }
        };
        scope.setCurrentStep = function () {
          scope.processEngine.setCurrentStep("reshipping");
        };
        scope.shippingModesValid = function () {
          for (var i = 0; i < scope.processData.shippingModes.length; i++) {
            var shippingMode = scope.processData.shippingModes[i];
            if (
              !angular.isFunction(shippingMode.valid) ||
              !shippingMode.valid()
            ) {
              return false;
            }
          }
          return true;
        };
        scope.next = function () {
          scope.saveMode();
        };
        scope.saveMode = function () {
          var shippingMode = scope.processData.shippingModes[0];
          if (
            !angular.isFunction(shippingMode.valid) ||
            !shippingMode.valid()
          ) {
            return;
          }
          var validData = shippingMode.valid(true);
          shippingMode.address = validData.address;
          shippingMode.options = validData.options;
          var actions = {
            setReshippingData: {
              mode: { id: validData.id, title: validData.title },
              address: validData.address,
              options: validData.options,
            },
            setStepValid: "reshipping",
            setNotCurrentStep: "reshipping",
          };
          return scope.processEngine.updateObjectData(actions);
        };
        function initializeProcessData() {
          var returnData = scope.processEngine.getObjectData();
          scope.processData.userId = returnData.orderData.common.userId;
          var processInfo = scope.processEngine.getProcessConfigurationInfo();
          scope.processData.processId = processInfo.common.id;
          scope.shippingModesInfo =
            processInfo && processInfo["reshippingModes"]
              ? processInfo["reshippingModes"]
              : {};
          scope.shippingZone = returnData.orderData.common.zone;
          if (!scope.processData.shippingModes) {
            var shippingMode = angular.copy(returnData["reshippingData"]);
            shippingMode.shippingZone = scope.shippingZone;
            shippingMode.options = {};
            scope.processData.shippingModes = [shippingMode];
          }
          var delivery = { lines: [] };
          for (var i = 0; i < returnData.shipments.length; i++) {
            var shipment = returnData.shipments[i];
            for (var j = 0; j < shipment.lines.length; j++) {
              var line = shipment.lines[j];
              if (line.returnLines && line.returnLines.length) {
                for (var k = 0; k < line.returnLines.length; k++) {
                  var returnLine = line.returnLines[k];
                  var mode = getMode(
                    processInfo,
                    returnLine.reason,
                    returnLine.preferredProcessingMode,
                  );
                  if (mode.impliesReshipment) {
                    var SKU =
                      mode.allowVariantSelection && returnLine.productData.stock
                        ? returnLine.productData.stock.sku
                        : line.shipmentLine.codeSKU;
                    delivery.lines.push({
                      quantity: returnLine.quantity,
                      codeSKU: SKU,
                    });
                  }
                }
              }
            }
          }
          scope.processData.shippingModes[0].delivery = delivery;
        }
        function getMode(processInfo, reasonId, modeId) {
          for (var i = 0; i < processInfo.reasons.length; i++) {
            var reason = processInfo.reasons[i];
            if (reason.id === reasonId) {
              for (var j = 0; j < reason.processingModes.length; j++) {
                var mode = reason.processingModes[j];
                if (mode.id === modeId) {
                  return mode;
                }
              }
            }
          }
          return {};
        }
        initializeProcessData();
        scope.loadUserAddresses();
      },
    };
  }
  app.directive("rbsProductreturnStoreReturnMode", [
    "RbsChange.AjaxAPI",
    function (AjaxAPI) {
      return {
        restrict: "A",
        templateUrl: "/rbs-productreturn-store-return-mode.twig",
        scope: { processData: "=", returnMode: "=", returnData: "=" },
        link: function (scope) {
          scope.currentStore = null;
          AjaxAPI.getData(
            "Rbs/Storeshipping/Store/Default",
            {},
            { URLFormats: "canonical" },
          ).then(function (result) {
            var storeData = result.data.dataSets;
            if (
              !angular.isArray(storeData) &&
              angular.isObject(storeData) &&
              storeData.allow.allowProductReturn
            ) {
              scope.selectStore(storeData);
            }
          }, angular.noop);
          scope.selectStore = function (store) {
            scope.currentStore = store;
            scope.returnData.returnMode.storeId = store.common.id;
          };
          scope.selectOtherStore = function () {
            scope.currentStore = null;
            scope.returnData.returnMode.storeId = null;
          };
          scope.storeSelectorData = { allow: { productReturn: true } };
          scope.storeSelectorParams = {
            URLFormats: "canonical",
            dataSetNames: "address,coordinates,hoursSummary",
          };
        },
      };
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function RbsProductreturnReturnListController(scope, $window, AjaxAPI) {
    scope.cancelReturn = function cancelReturn(returnId, waitingMessage) {
      AjaxAPI.openWaitingModal(waitingMessage);
      AjaxAPI.putData(
        "Rbs/Productreturn/ProductReturn/" + returnId,
        { cancelRequest: true },
        { detailed: false },
      ).then(
        function () {
          $window.location.reload();
        },
        function (result) {
          AjaxAPI.closeWaitingModal();
          console.error(result);
        },
      );
    };
  }
  RbsProductreturnReturnListController.$inject = [
    "$scope",
    "$window",
    "RbsChange.AjaxAPI",
  ];
  app.controller(
    "RbsProductreturnReturnListController",
    RbsProductreturnReturnListController,
  );
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsDiscountExternal", rbsDiscountExternal);
  function rbsDiscountExternal() {
    return {
      restrict: "A",
      templateUrl: "/rbs-discount-external.twig",
      require: ["?^rbsCommerceCart", "?^rbsCommerceCartDeliveries"],
      scope: { line: "=", delivery: "=" },
      link: function (scope, elem, attrs, cartControllers) {
        var cartController = cartControllers[0] || cartControllers[1];
        scope.showPrices = cartController.showPrices();
        scope.currencyCode = cartController.getCurrencyCode();
        scope.parameters = cartController.parameters();
        scope.quantity = scope.line.quantity;
        scope.cartController = cartController;
        if (
          !scope.line.unitBaseAmountWithTaxes &&
          scope.line["baseAmountWithTaxes"]
        ) {
          scope.line.unitBaseAmountWithTaxes =
            scope.line["baseAmountWithTaxes"] / scope.quantity;
        }
        if (
          !scope.line.unitBaseAmountWithoutTaxes &&
          scope.line["baseAmountWithoutTaxes"]
        ) {
          scope.line.unitBaseAmountWithoutTaxes =
            scope.line["baseAmountWithoutTaxes"] / scope.quantity;
        }
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsDataprotectionErasureRequest", [
    "$scope",
    "RbsChange.AjaxAPI",
    RbsDataprotectionErasureRequestController,
  ]);
  function RbsDataprotectionErasureRequestController(scope, AjaxAPI) {
    scope.submit = function () {
      scope.disabled = true;
      AjaxAPI.openWaitingModal();
      var data = { email: scope.email, request: scope.request };
      AjaxAPI.postData("Rbs/Dataprotection/CreateErasureRequest", data).then(
        function (result) {
          scope.success = result.data.dataSets.success;
          scope.errors = null;
          AjaxAPI.closeWaitingModal();
          scope.disabled = true;
        },
        function (error) {
          scope.errors = error.data.message;
          AjaxAPI.closeWaitingModal();
          scope.disabled = false;
        },
      );
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("rbsMailinglistShortSubscription", [
    "$scope",
    "RbsChange.AjaxAPI",
    rbsMailinglistShortSubscriptionController,
  ]);
  function rbsMailinglistShortSubscriptionController(scope, AjaxAPI) {
    var userId = __change.userContext.accessorId;
    if (userId) {
      scope.mode = "loading";
      AjaxAPI.getData("Rbs/Mailinglist/HasSubscription").then(
        function (result) {
          scope.mode = result.data.dataSets.common.hasSubscription
            ? "manage"
            : "subscription";
        },
        function () {
          scope.mode = "subscription";
        },
      );
    } else {
      scope.mode = "subscription";
    }
  }
  app.controller("rbsMailinglistSubscription", [
    "$scope",
    "RbsChange.AjaxAPI",
    "RbsChange.Cookies",
    "$element",
    rbsMailinglistSubscriptionController,
  ]);
  function rbsMailinglistSubscriptionController(
    scope,
    AjaxAPI,
    cookies,
    element,
  ) {
    scope.mailingLists = {};
    scope.profileData = {};
    scope.optsIn = {};
    scope.requestToken = scope.blockParameters.requestToken;
    scope.disabled = false;
    scope.isConnected = false;
    scope.hasSubscriberId = window.__change["hasSubscriberId"];
    if (
      scope.blockData.hasOwnProperty("profileData") &&
      angular.isObject(scope.blockData.profileData)
    ) {
      scope.profileData = scope.blockData.profileData;
      window.__change["profileData"] = scope.profileData;
      scope.isConnected = scope.profileData.hasOwnProperty("email");
    } else if (element.attr("data-email")) {
      scope.profileData = { email: element.attr("data-email") };
      scope.isConnected = true;
    }
    scope.showComplementaryFields =
      scope.blockParameters.showComplementaryFields;
    scope.mailingLists = scope.blockData.mailingLists;
    if (scope.blockParameters.token) {
      scope.token = scope.blockParameters.token;
      if (scope.blockParameters.email) {
        if (!scope.isConnected) {
          scope.profileData = { email: scope.blockParameters.email };
        }
      }
      if (scope.blockParameters.requestKey) {
        scope.requestKey = scope.blockParameters.requestKey;
      }
      confirmSubscription();
    }
    scope.checkOptinSMS = function (optin_title) {
      if (!scope.mailingLists) {
        return false;
      }
      if (scope.optsIn) {
        for (const [key, value] of Object.entries(scope.optsIn)) {
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
    scope.days = [];
    scope.days.push({ value: "Jour", disabled: true });
    for (var d = 1; d <= 31; d++) {
      scope.days.push({ value: d, disabled: false });
    }
    scope.months = [
      { id: 0, name: "Mois", disabled: true },
      { id: 1, name: "Janvier", disabled: false },
      { id: 2, name: "Février", disabled: false },
      { id: 3, name: "Mars", disabled: false },
      { id: 4, name: "Avril", disabled: false },
      { id: 5, name: "Mai", disabled: false },
      { id: 6, name: "Juin", disabled: false },
      { id: 7, name: "Juillet", disabled: false },
      { id: 8, name: "Août", disabled: false },
      { id: 9, name: "Septembre", disabled: false },
      { id: 10, name: "Octobre", disabled: false },
      { id: 11, name: "Novembre", disabled: false },
      { id: 12, name: "Decembre", disabled: false },
    ];
    scope.years = [];
    scope.years.push({ value: "Année", disabled: true });
    var d = new Date();
    for (var i = d.getFullYear() - 18; i > d.getFullYear() - 100; i--) {
      scope.years.push({ value: i, disabled: false });
    }
    scope.year = scope.years[0];
    scope.month = scope.months[0];
    scope.day = scope.days[0];
    scope.updateDate = function (input) {
      if (!scope.profileData) {
        scope.profileData = {};
      }
      scope.profileData.birthDate = null;
      if (input == "year") {
        scope.month = scope.months[0];
        scope.day = scope.days[0];
      } else if (input == "month") {
        scope.day = scope.days[0];
      }
      if (
        scope.year &&
        scope.month &&
        scope.day &&
        scope.year.value != "Année" &&
        scope.month.name != "Mois" &&
        scope.day.value != "Jour"
      ) {
        var temp_date = new Date(
          scope.year.value,
          scope.month.id - 1,
          scope.day.value,
        );
        temp_date.setHours(0, -temp_date.getTimezoneOffset(), 0, 0);
        scope.profileData.birthDate = temp_date.toISOString();
      }
    };
    scope.submit = function () {
      if (scope.requestToken !== null) {
        scope.disabled = true;
        AjaxAPI.openWaitingModal();
        var data = {
          email: scope.profileData.email,
          userId: scope.blockParameters.userId,
          profileData: scope.profileData,
          optsIn: extractOptsInValues(),
          device: buildDevice(),
          LCID: scope.blockParameters._LCID,
          requestToken: scope.requestToken,
        };
        AjaxAPI.postData("Rbs/Mailinglist/Subscribe", data).then(
          function (result) {
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
            if (!scope.isConnected) {
              var cookieName =
                "rbsMailinglistSubscription-" +
                scope.blockParameters.website +
                "-" +
                scope.blockParameters._LCID;
              var subscriptionLists = result.data.dataSets.optsIn;
              cookies.put(
                "technical",
                cookieName,
                JSON.stringify(subscriptionLists),
              );
            }
            scope.success = result.data.dataSets.success;
            scope.errors = null;
          },
          function (result) {
            scope.errors = result.data.message;
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
          },
        );
      }
    };
    scope.confirmSubscriptionRequest = function () {
      confirmSubscription();
    };
    function confirmSubscription() {
      scope.disabled = true;
      AjaxAPI.openWaitingModal();
      var data = { token: scope.token };
      if (scope.requestKey) {
        data.requestKey = scope.requestKey;
      } else if (scope.profileData.email) {
        data.email = scope.profileData.email;
      }
      AjaxAPI.postData("Rbs/Mailinglist/ConfirmSubscription", data).then(
        function (result) {
          AjaxAPI.closeWaitingModal();
          scope.disabled = false;
          scope.success = result.data.dataSets.success;
          scope.errors = null;
        },
        function (result) {
          scope.errors = result.data.message;
          AjaxAPI.closeWaitingModal();
          scope.disabled = false;
        },
      );
    }
    function extractOptsInValues() {
      var optsIn = [];
      angular.forEach(scope.optsIn, function (optIn) {
        if (optIn !== false) {
          optsIn.push(optIn);
        }
      });
      return optsIn;
    }
    function buildDevice() {
      var parser = new UAParser();
      var ua = parser.getResult();
      return ua.browser.name + " - " + ua.os.name;
    }
  }
  app.controller("rbsMailinglistManageSubscription", [
    "$scope",
    "RbsChange.AjaxAPI",
    "RbsChange.Cookies",
    rbsMailinglistManageSubscriptionController,
  ]);
  function rbsMailinglistManageSubscriptionController(scope, AjaxAPI, cookies) {
    scope.optsIn = [];
    scope.mailingLists = {};
    scope.profileData = {};
    scope.isConnected = !!scope.blockParameters.userId;
    scope.successMessage = null;
    scope.showComplementaryFields =
      scope.blockParameters.showComplementaryFields;
    scope.requestToken = scope.blockParameters.requestToken;
    scope.subscriberId = scope.blockData.subscriberId
      ? scope.blockData.subscriberId + ""
      : null;
    scope.subscribers = scope.blockData.subscribers;
    scope.showSelector = false;
    scope.disabled = false;
    scope.success = {};
    scope.errors = null;
    scope.email = scope.blockParameters.email || null;
    if (scope.subscriberId || (scope.isConnected && scope.email)) {
      if (
        scope.blockData.hasOwnProperty("mailingLists") &&
        angular.isObject(scope.blockData.mailingLists)
      ) {
        scope.mailingLists = scope.blockData.mailingLists;
        fillOptIns();
      }
      if (
        scope.blockData.hasOwnProperty("profileData") &&
        angular.isObject(scope.blockData.profileData)
      ) {
        scope.profileData = angular.copy(scope.blockData.profileData);
        scope.showSelector = Object.keys(scope.profileData).length > 1;
      }
    }
    scope.phonePattern = /^0[1-9][0-9]{8}$/;
    scope.match = true;
    if (scope.profileData[scope.subscriberId]) {
      scope.d = { phone: scope.profileData[scope.subscriberId].phone };
      setTimeout(
        () =>
          (scope.d = {
            phone:
              scope.profileData[scope.subscriberId].phone ||
              window.__change["profileData"].phone.replace("+33", "0"),
          }),
        0,
      );
    } else {
      scope.d = { phone: "" };
    }
    scope.validatePhone = function () {
      if (scope.showPhone) {
        return scope.phonePattern.test(scope.d.phone);
      }
      return true;
    };
    scope.changeOptins = function () {
      scope.showPhone = false;
      scope.match = true;
      const allMailing = Object.values(scope.mailingLists[scope.subscriberId]);
      const optin = allMailing.find(
        (mailing) => mailing.common.title === "SMS Stokomani",
      );
      const found = scope.optsIn.find((opt) => opt === optin.common.id);
      if (found) {
        const profile = scope.profileData[scope.subscriberId];
        if (!profile || !window.__change["profileData"]) {
          return;
        }
        if (!profile.phone && !window.__change["profileData"].phone) {
          scope.showPhone = true;
          scope.match = false;
        }
      }
    };
    window.__change["hasSubscriberId"] = !!scope.subscriberId;
    scope.submit = function () {
      if (scope.subscriberId) {
        scope.disabled = true;
        AjaxAPI.openWaitingModal();
        var data = {
          profileData: scope.profileData[scope.subscriberId],
          optsIn: scope.optsIn,
          email: scope.profileData[scope.subscriberId].email,
          subscriberId: scope.subscriberId,
        };
        if (scope.d.phone) {
          data.profileData["phone"] = scope.d.phone;
        }
        AjaxAPI.postData("Rbs/Mailinglist/UpdateSubscriptions", data).then(
          function (result) {
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
            scope.success = result.data.dataSets.success;
            scope.errors = null;
            scope.mailingLists[scope.subscriberId] =
              result.data.dataSets.mailingLists[scope.subscriberId];
            if (!scope.blockParameters.userId) {
              var cookieName =
                "rbsMailinglistSubscription-" +
                scope.blockParameters.website +
                "-" +
                scope.blockParameters._LCID;
              var subscriptionLists = result.data.dataSets.optsIn;
              cookies.put(
                "technical",
                cookieName,
                JSON.stringify(subscriptionLists),
              );
            }
          },
          function (result) {
            scope.success = null;
            scope.errors = result.data.message;
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
          },
        );
      }
    };
    scope.request = function () {
      if (scope.email) {
        scope.disabled = true;
        AjaxAPI.openWaitingModal();
        var data = {
          email: scope.email,
          requestToken: scope.requestToken,
          request: true,
        };
        AjaxAPI.postData("Rbs/Mailinglist/RequestSubscriptions", data).then(
          function (result) {
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
            scope.success = result.data.dataSets.success;
            scope.errors = null;
          },
          function (result) {
            scope.success = null;
            scope.errors = result.data.message;
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
          },
        );
      }
    };
    scope.confirmSubscriptionRequest = function () {
      if (scope.email || scope.requestKey) {
        scope.disabled = true;
        AjaxAPI.openWaitingModal();
        var data = { token: scope.token };
        if (scope.requestKey) {
          data.requestKey = scope.requestKey;
        } else if (scope.email) {
          data.email = scope.email;
        }
        AjaxAPI.postData("Rbs/Mailinglist/RequestSubscriptions", data).then(
          function (result) {
            scope.success = result.data.dataSets;
            scope.errors = null;
            scope.subscriberId = result.data.dataSets.subscriberId;
            scope.profileData = result.data.dataSets.profileData;
            scope.profileData[scope.subscriberId].email =
              result.data.dataSets.email;
            scope.mailingLists = result.data.dataSets.mailingLists;
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
            fillOptIns();
          },
          function (result) {
            scope.success = null;
            scope.errors = result.data.message;
            AjaxAPI.closeWaitingModal();
            scope.disabled = false;
          },
        );
      }
    };
    function fillOptIns() {
      scope.optsIn = [];
      if (scope.mailingLists && scope.mailingLists[scope.subscriberId]) {
        angular.forEach(
          scope.mailingLists[scope.subscriberId],
          function (mailingList) {
            if (mailingList.common.subscribed === true) {
              scope.optsIn.push(mailingList.common.id);
            } else {
              scope.optsIn.push(null);
            }
          },
        );
      }
    }
    scope.fillOptIns = fillOptIns;
    if (
      (scope.blockParameters.email || scope.blockParameters.requestKey) &&
      scope.blockParameters.token
    ) {
      scope.email = scope.blockParameters.email || null;
      scope.token = scope.blockParameters.token;
      scope.requestKey = scope.blockParameters.requestKey;
      scope.confirmSubscriptionRequest();
    }
  }
})();
(function (__change) {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.provider("RbsGeo.GoogleMapService", GoogleMapServiceProvider);
  function GoogleMapServiceProvider() {
    this.googleConfig =
      (__change.Rbs_Geo_Config && __change.Rbs_Geo_Config.Google) || {};
    this.googleConfig.transport = "auto";
    this.googleLoadedPromise = null;
    this.configure = function (options) {
      angular.extend(this.googleConfig, options);
    };
    function isGoogleMapsLoaded() {
      return (
        angular.isDefined(window.google) &&
        angular.isDefined(window.google.maps)
      );
    }
    function getScriptUrl(options) {
      if (options.china) {
        return "https://maps.google.cn/maps/api/js?";
      } else {
        if (options.transport === "auto") {
          return "//maps.googleapis.com/maps/api/js?";
        } else {
          return options.transport + "://maps.googleapis.com/maps/api/js?";
        }
      }
    }
    function includeScript(options) {
      var query = ["v=3", "libraries=places"];
      if (options.client) {
        query.push("client=" + options.client);
      } else if (options.APIKey) {
        query.push("key=" + options.APIKey);
      } else {
        console.error("GoogleMap authentication not provided");
        return null;
      }
      if (options.callback) {
        query.push("callback=" + options.callback);
      }
      query = query.join("&");
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = getScriptUrl(options) + query;
      return document.head.appendChild(script);
    }
    var _this = this;
    this.$get = [
      "$rootScope",
      "$q",
      function ($rootScope, $q) {
        function valid() {
          return !!(_this.googleConfig.client || _this.googleConfig.APIKey);
        }
        function maps() {
          if (_this.googleLoadedPromise) {
            return _this.googleLoadedPromise;
          }
          var options = _this.googleConfig;
          var deferred, randomFn;
          deferred = $q.defer();
          _this.googleLoadedPromise = deferred.promise;
          if (isGoogleMapsLoaded()) {
            deferred.resolve(window.google.maps);
            return _this.googleLoadedPromise;
          } else if (options.preventLoad) {
            deferred.reject("window.google.maps not defined");
            return _this.googleLoadedPromise;
          }
          randomFn = options.callback =
            "onGoogleMapsReady" + Math.round(Math.random() * 1000);
          window[randomFn] = function () {
            delete window[randomFn];
            deferred.resolve(window.google.maps);
          };
          if (
            window.navigator.connection &&
            window.Connection &&
            window.navigator.connection.type === window.Connection.NONE
          ) {
            document.addEventListener("online", function () {
              if (!isGoogleMapsLoaded()) {
                return includeScript(options);
              }
            });
          } else {
            includeScript(options);
          }
          return _this.googleLoadedPromise;
        }
        function resolveAddress(coordinates) {
          var maps = window.google.maps;
          var geocoder = new maps.Geocoder();
          return $q(function (resolve, reject) {
            geocoder.geocode({ location: coordinates }, function (results) {
              if (results.length) {
                var address = {};
                angular.forEach(
                  results[0].address_components,
                  function (component) {
                    switch (component.types[0]) {
                      case "street_number":
                        address.street_number = component.short_name;
                        break;
                      case "route":
                        address.street = component.short_name;
                        break;
                      case "locality":
                        address.city = component.short_name;
                        break;
                      case "country":
                        address.country_code = component.short_name;
                        break;
                      case "postal_code":
                        address.postcode = component.short_name;
                        break;
                      default:
                        break;
                    }
                  },
                );
                if (address.country_code) {
                  return resolve(address);
                }
              }
              console.warn(
                "[RbsGeo.GoogleMapService.resolveAddress] No data found",
              );
              return reject("no address found");
            });
          });
        }
        return { maps: maps, valid: valid, resolveAddress: resolveAddress };
      },
    ];
  }
  app.provider("RbsGeo.LeafletMapService", LeafletMapServiceProvider);
  function LeafletMapServiceProvider() {
    this.leafletConfig =
      (__change.Rbs_Geo_Config && __change.Rbs_Geo_Config.OSM) || {};
    this.leafletLoadedPromise = null;
    this.configure = function (options) {
      angular.extend(this.leafletConfig, options);
    };
    function isLeafletMapLoaded() {
      return angular.isDefined(window.L);
    }
    function includeScript(options) {
      var assetBasePath =
        __change.navigationContext.assetBasePath || "/Assets/";
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = assetBasePath + "Theme/Rbs/Base/lib/leaflet/leaflet.css";
      link.media = "all";
      document.head.appendChild(link);
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.onload = options.callback;
      script.src = assetBasePath + "Theme/Rbs/Base/lib/leaflet/leaflet.js";
      return document.head.appendChild(script);
    }
    var _this = this;
    this.$get = [
      "$rootScope",
      "$q",
      "$http",
      function ($rootScope, $q, $http) {
        function maps() {
          if (_this.leafletLoadedPromise) {
            return _this.leafletLoadedPromise;
          }
          var options = _this.leafletConfig;
          var deferred, randomFn;
          deferred = $q.defer();
          _this.leafletLoadedPromise = deferred.promise;
          if (isLeafletMapLoaded()) {
            deferred.resolve(window.L);
            return _this.leafletLoadedPromise;
          } else if (options.preventLoad) {
            deferred.reject("window.L not defined");
            return _this.leafletLoadedPromise;
          }
          options.randomFn = randomFn =
            "onLeafletMapsReady" + Math.round(Math.random() * 1000);
          options.callback = window[randomFn] = function () {
            delete window[randomFn];
            deferred.resolve(window.L);
          };
          if (
            window.navigator.connection &&
            window.Connection &&
            window.navigator.connection.type === window.Connection.NONE
          ) {
            document.addEventListener("online", function () {
              if (!isLeafletMapLoaded()) {
                return includeScript(options);
              }
            });
          } else {
            includeScript(options);
          }
          return _this.leafletLoadedPromise;
        }
        function defaultTileLayerName() {
          var tileLayerName = null;
          if (_this.leafletConfig && _this.leafletConfig.tileLayerName) {
            tileLayerName = _this.leafletConfig.tileLayerName;
            if (_this.leafletConfig.APIKey) {
              tileLayerName += "?key=" + _this.leafletConfig.APIKey;
            }
          }
          return tileLayerName;
        }
        function getAttribution() {
          return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        }
        function valid() {
          return (
            _this.leafletConfig &&
            _this.leafletConfig.url &&
            !!this.defaultTileLayerName()
          );
        }
        function resolveAddress(coordinates) {
          var params =
            "format=json&addressdetails=1&lat=" +
            coordinates.latitude +
            "&lon=" +
            coordinates.longitude;
          if (_this.leafletConfig.APIKey) {
            params += "&key=" + _this.leafletConfig.APIKey;
          }
          return $http
            .get(_this.leafletConfig.url + "reverse.php?" + params)
            .then(
              function (result) {
                if (!result.data.address || !result.data.address.country_code) {
                  console.warn(
                    "[RbsGeo.LeafletMapService.resolveAddress] No data found",
                  );
                  return $q.reject("no address found");
                }
                return result.data.address;
              },
              function (error) {
                console.error(
                  "[RbsGeo.LeafletMapService.resolveAddress]",
                  error,
                );
                return $q.reject("service not found");
              },
            );
        }
        return {
          maps: maps,
          defaultTileLayerName: defaultTileLayerName,
          valid: valid,
          resolveAddress: resolveAddress,
          getAttribution: getAttribution,
        };
      },
    ];
  }
})(window.__change);
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.provider("RbsGeo.PhoneService", PhoneProvider);
  function PhoneProvider() {
    var regionNumberConfig = null;
    var parsedPhoneNumbers = {};
    this.$get = [
      "$rootScope",
      "$q",
      "RbsChange.AjaxAPI",
      function ($rootScope, $q, AjaxAPI) {
        function getRegionNumberConfig() {
          var deferred = $q.defer();
          if (regionNumberConfig !== null) {
            if (angular.isArray(regionNumberConfig)) {
              deferred.resolve(regionNumberConfig);
            } else {
              return regionNumberConfig.promise;
            }
          } else {
            regionNumberConfig = deferred;
            AjaxAPI.getData("Rbs/Geo/Phone/NumberConfiguration/").then(
              function (result) {
                regionNumberConfig = result.data.items;
                deferred.resolve(regionNumberConfig);
              },
              function (result) {
                console.error("getRegionNumberConfig", result);
                regionNumberConfig = [];
                deferred.resolve(regionNumberConfig);
              },
            );
          }
          return deferred.promise;
        }
        function parseNumber(phoneNumber, regionCode) {
          var deferred = $q.defer();
          if (!angular.isString(phoneNumber) || phoneNumber.length === 0) {
            deferred.resolve(null);
          } else if (phoneNumber.length < 5 || !regionCode) {
            deferred.reject("Too short number");
          } else if (!angular.isString(regionCode) || regionCode.length !== 2) {
            deferred.reject("Invalid region code");
          } else {
            var key = phoneNumber + "." + regionCode;
            if (parsedPhoneNumbers.hasOwnProperty(key)) {
              var parsedNumber = parsedPhoneNumbers[key];
              if (parsedNumber) {
                if (parsedNumber.promise) {
                  return parsedNumber.promise;
                }
                deferred.resolve(parsedNumber);
              } else {
                deferred.reject("Invalid number");
              }
            } else {
              parsedPhoneNumbers[key] = deferred;
              AjaxAPI.getData("Rbs/Geo/Phone/ParsePhoneNumber", {
                number: phoneNumber,
                regionCode: regionCode,
              }).then(
                function (result) {
                  var common = result.data.dataSets.common;
                  parsedPhoneNumbers[key] = common;
                  parsedPhoneNumbers[
                    common.national + "." + common.regionCode
                  ] = common;
                  deferred.resolve(common);
                },
                function () {
                  parsedPhoneNumbers[key] = false;
                  deferred.reject("Invalid number");
                },
              );
            }
          }
          return deferred.promise;
        }
        function parseMobileNumber(phoneNumber, regionCode) {
          return parseNumber(phoneNumber, regionCode).then(
            function (parsedNumber) {
              if (
                !parsedNumber ||
                parsedNumber.type === "MOBILE" ||
                parsedNumber.type === "FIXED_LINE_OR_MOBILE"
              ) {
                return parsedNumber;
              }
              return $q.reject("Invalid mobile number");
            },
          );
        }
        function parseFixedLineNumber(phoneNumber, regionCode) {
          return parseNumber(phoneNumber, regionCode).then(
            function (parsedNumber) {
              if (
                !parsedNumber ||
                parsedNumber.type === "FIXED_LINE" ||
                parsedNumber.type === "FIXED_LINE_OR_MOBILE" ||
                parsedNumber.type === "VOIP"
              ) {
                return parsedNumber;
              }
              return $q.reject("Invalid fixed line number");
            },
          );
        }
        var parseMobileOrFixedLineNumber = function (phoneNumber, regionCode) {
          return parseNumber(phoneNumber, regionCode).then(
            function (parsedNumber) {
              if (
                !parsedNumber ||
                parsedNumber.type === "MOBILE" ||
                parsedNumber.type === "FIXED_LINE" ||
                parsedNumber.type === "FIXED_LINE_OR_MOBILE" ||
                parsedNumber.type === "VOIP"
              ) {
                return parsedNumber;
              }
              return $q.reject("Invalid mobile or fixed line number");
            },
          );
        };
        return {
          getRegionNumberConfig: getRegionNumberConfig,
          parseNumber: parseNumber,
          parseMobileNumber: parseMobileNumber,
          parseFixedLineNumber: parseFixedLineNumber,
          parseMobileOrFixedLineNumber: parseMobileOrFixedLineNumber,
        };
      },
    ];
  }
  app.directive("rbsGeoInputPhoneNumber", [
    "RbsChange.AjaxAPI",
    "$q",
    "RbsGeo.PhoneService",
    "$timeout",
    rbsGeoInputPhoneNumber,
  ]);
  function rbsGeoInputPhoneNumber(AjaxAPI, $q, PhoneService, $timeout) {
    var defaultCode = AjaxAPI.getLCID().substr(3);
    return {
      restrict: "A",
      templateUrl: "/rbs-geo-input-phone-number.twig",
      require: "ngModel",
      scope: {
        required: "=",
        mobileOnly: "@",
        fixedLineOnly: "@",
        mobileOrFixedLineOnly: "@",
      },
      controller: [
        "$scope",
        function (scope) {
          if (scope.mobileOnly) {
            scope.numberType = "MOBILE";
          } else if (scope.fixedLineOnly) {
            scope.numberType = "FIXED_LINE";
          } else {
            scope.numberType = "FIXED_LINE_OR_MOBILE";
          }
          scope.currentCfg = null;
          scope.regionNumberConfig = [];
          PhoneService.getRegionNumberConfig().then(
            function (regionNumberConfig) {
              scope.regionNumberConfig = regionNumberConfig;
              angular.forEach(regionNumberConfig, function (cfg) {
                if (scope.currentCfg === null || cfg[0] === defaultCode) {
                  scope.currentCfg = cfg;
                }
              });
            },
          );
        },
      ],
      link: function (scope, element, attributes, ngModel) {
        scope.parsedNumber = null;
        scope.name = attributes.name;
        scope.getCurrentPlaceHolder = function () {
          if (scope.currentCfg) {
            if (scope.mobileOnly) {
              return scope.currentCfg[4];
            } else if (scope.fixedLineOnly) {
              return scope.currentCfg[3];
            } else {
              return scope.currentCfg[3] || scope.currentCfg[4] || "";
            }
          }
          return "";
        };
        ngModel.$render = function () {
          scope.rawNumber = ngModel.$viewValue;
          if (scope.rawNumber) {
            PhoneService.parseNumber(scope.rawNumber, defaultCode).then(
              function (parsedNumber) {
                scope.parsedNumber = parsedNumber;
                if (parsedNumber) {
                  scope.rawNumber = parsedNumber.national;
                  angular.forEach(scope.regionNumberConfig, function (cfg) {
                    if (cfg[0] === parsedNumber.regionCode) {
                      scope.currentCfg = cfg;
                    }
                  });
                }
              },
              function () {
                scope.parsedNumber = null;
              },
            );
          }
        };
        scope.setCurrentCfg = function (cfg) {
          scope.currentCfg = cfg;
          ngModel.$setViewValue(scope.rawNumber);
          ngModel.$validate();
        };
        var delayedPromise = null;
        scope.validateRawNumber = function (delayed) {
          if (scope.rawNumber) {
            ngModel.$setTouched();
          }
          if (delayedPromise) {
            $timeout.cancel(delayedPromise);
            delayedPromise = null;
          }
          if (delayed) {
            delayedPromise = $timeout(function () {
              ngModel.$setViewValue(scope.rawNumber);
            }, 500);
          } else {
            ngModel.$setViewValue(scope.rawNumber);
          }
        };
        var errorCallback = function (error) {
          scope.parsedNumber = null;
          return $q.reject(error);
        };
        var successCallback = function (parsedNumber) {
          scope.parsedNumber = parsedNumber;
          if (parsedNumber) {
            scope.rawNumber = parsedNumber.national;
            ngModel.$setViewValue(parsedNumber.E164);
          }
          return parsedNumber;
        };
        ngModel.$asyncValidators.mobileNumber = function (
          modelValue,
          viewValue,
        ) {
          var regionCode = scope.currentCfg ? scope.currentCfg[0] : defaultCode;
          if (scope.mobileOnly) {
            return PhoneService.parseMobileNumber(viewValue, regionCode).then(
              successCallback,
              errorCallback,
            );
          } else if (scope.fixedLineOnly) {
            return PhoneService.parseFixedLineNumber(
              viewValue,
              regionCode,
            ).then(successCallback, errorCallback);
          } else if (scope.mobileOrFixedLineOnly) {
            return PhoneService.parseMobileOrFixedLineNumber(
              viewValue,
              regionCode,
            ).then(successCallback, errorCallback);
          } else {
            return PhoneService.parseNumber(viewValue, regionCode).then(
              successCallback,
              errorCallback,
            );
          }
        };
      },
    };
  }
  app.directive("rbsGeoPhoneFormatter", [
    "RbsChange.AjaxAPI",
    "RbsGeo.PhoneService",
    rbsGeoPhoneFormatter,
  ]);
  function rbsGeoPhoneFormatter(AjaxAPI, PhoneService) {
    var defaultCode = AjaxAPI.getLCID().substr(3);
    return {
      restrict: "A",
      templateUrl: "/rbs-geo-phone-formatter.twig",
      scope: { number: "=", regionCode: "=" },
      link: function (scope, element, attributes) {
        scope.addLink = attributes.addLink === "true";
        scope.$watch("number", function (number) {
          if (number) {
            PhoneService.parseNumber(
              number,
              scope.regionCode || defaultCode,
            ).then(
              function (parsedNumber) {
                if (parsedNumber) {
                  scope.data = parsedNumber;
                  parsedNumber.flagCountry =
                    parsedNumber.regionCode.toLowerCase();
                  parsedNumber.country = parsedNumber.regionCode;
                  parsedNumber.class =
                    parsedNumber.type === "MOBILE" ||
                    parsedNumber.type === "FIXED_LINE_OR_MOBILE"
                      ? "phone"
                      : "earphone";
                  PhoneService.getRegionNumberConfig().then(
                    function (regionNumberConfig) {
                      angular.forEach(regionNumberConfig, function (cfg) {
                        if (cfg[0] === scope.data.regionCode) {
                          scope.data.country = cfg[2];
                        }
                      });
                    },
                  );
                } else {
                  scope.data = { empty: true };
                }
              },
              function (error) {
                scope.data = { invalid: true, error: error };
              },
            );
          } else {
            scope.data = { empty: true };
          }
        });
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsGeoAddressDisplay", rbsGeoAddressEditor);
  function rbsGeoAddressEditor() {
    return {
      restrict: "A",
      scope: { address: "<rbsGeoAddressDisplay", reference: "<?" },
      templateUrl: "/rbs-geo-address-display.twig",
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsGeoAddressEditor", [
    "RbsChange.AjaxAPI",
    rbsGeoAddressEditor,
  ]);
  var blockId = 0;
  function rbsGeoAddressEditor(AjaxAPI) {
    return {
      restrict: "A",
      scope: {
        address: "=",
        valid: "=",
        zoneCode: "=",
        addresses: "<?",
        precheckSaveAddress: "<?",
      },
      templateUrl: "/rbs-geo-address-editor.twig",
      link: function (scope, element, attributes) {
        scope.blockId = blockId++;
        scope.manageName = "none";
        scope.countries = [];
        scope.fieldsDef = [];
        if (!scope.address) {
          scope.address = {
            common: { addressFieldsId: null },
            fields: { countryCode: null },
          };
        } else {
          if (!angular.isObject(scope.address.common)) {
            scope.address.common = { addressFieldsId: null };
          }
          if (!angular.isObject(scope.address.fields)) {
            scope.address.fields = { countryCode: null };
          }
        }
        if (attributes.hasOwnProperty("manageName")) {
          if (
            attributes.manageName == "optional" ||
            attributes.manageName == "none"
          ) {
            scope.manageName = attributes.manageName;
            if (
              scope.precheckSaveAddress &&
              attributes.manageName == "optional"
            ) {
              scope.address.common.useName = true;
            }
          } else {
            scope.manageName = "required";
          }
        } else {
          scope.manageName = "none";
        }
        if (scope.precheckSaveAddress) {
          if (!scope.address.common.name) {
            var defaultAddressName = element
              .find("[data-default-address-name]")
              .attr("data-default-address-name");
            scope.address.common.name = generateAddressName(
              defaultAddressName,
              1,
            );
          }
        }
        scope.saveAvailable = false;
        AjaxAPI.getData("Rbs/Geo/CheckNewAddressEligibility").then(
          function (result) {
            scope.saveAvailable = result.data.items[0].isEligible;
          },
          function () {},
        );
        function generateAddressName(defaultAddressName, increment) {
          var addressName =
            defaultAddressName + (increment > 1 ? " " + increment : "");
          if (angular.isArray(scope.addresses)) {
            for (var i = 0; i < scope.addresses.length; i++) {
              if (addressName == scope.addresses[i].common.name) {
                return generateAddressName(defaultAddressName, increment + 1);
              }
            }
          }
          return addressName;
        }
        scope.$watch("zoneCode", function (zoneCode) {
          AjaxAPI.getData("Rbs/Geo/AddressFieldsCountries/", {
            zoneCode: zoneCode,
          }).then(
            function (result) {
              scope.countries = result.data.items;
              var countryCode = scope.address.fields.countryCode;
              if (countryCode) {
                scope.address.common.addressFieldsId =
                  scope.getAddressFieldsId(countryCode);
              }
            },
            function (result) {
              console.log("addressFieldsCountries error", result);
              scope.countries = [];
            },
          );
        });
        scope.countryTitle = function (countryCode) {
          for (var i = 0; i < scope.countries.length; i++) {
            if (scope.countries[i]["common"].code == countryCode) {
              return scope.countries[i]["common"].title;
            }
          }
          return countryCode;
        };
        scope.getAddressFieldsId = function (countryCode) {
          for (var i = 0; i < scope.countries.length; i++) {
            if (scope.countries[i]["common"].code == countryCode) {
              return scope.countries[i]["common"].addressFieldsId;
            }
          }
          return null;
        };
        scope.$watch("countries", function (newValue) {
          if (angular.isArray(newValue) && newValue.length) {
            var addressFieldsId = null,
              code = null;
            angular.forEach(newValue, function (country) {
              if (code === null) {
                code = country.common.code;
              } else if (code !== country.common.code) {
                code = false;
              }
              if (addressFieldsId === null) {
                addressFieldsId = country.common.addressFieldsId;
              } else if (addressFieldsId !== country.common.addressFieldsId) {
                addressFieldsId = false;
              }
            });
            if (code) {
              scope.address.fields.countryCode = code;
            } else if (addressFieldsId) {
              scope.address.common.addressFieldsId = addressFieldsId;
            }
          }
        });
        scope.$watch("address.fields.countryCode", function (newValue) {
          if (newValue) {
            var addressFieldsId = scope.getAddressFieldsId(newValue);
            if (addressFieldsId) {
              scope.address.common.addressFieldsId = addressFieldsId;
            }
          }
        });
        scope.$watch("address.common.addressFieldsId", function (newValue) {
          if (newValue) {
            AjaxAPI.getData("Rbs/Geo/AddressFields/" + newValue, {}).then(
              function (result) {
                scope.generateFieldsEditor(result.data.dataSets);
              },
              function (result) {
                console.log("addressFields error", result);
                scope.fieldsDef = [];
              },
            );
          }
        });
        scope.$watch("addressForm.$invalid", function (newValue) {
          scope.valid = !newValue;
        });
        scope.generateFieldsEditor = function (addressFields) {
          var fieldsDef = addressFields.fields;
          if (angular.isObject(fieldsDef)) {
            scope.fieldsDef = [];
            var field;
            for (var i = 0; i < fieldsDef.length; i++) {
              field = fieldsDef[i];
              if (field.name != "countryCode") {
                scope.fieldsDef.push(field);
                var v = null;
                if (scope.address.fields.hasOwnProperty(field.name)) {
                  v = scope.address.fields[field.name];
                }
                if (v === null) {
                  v = field.defaultValue;
                  scope.address.fields[field.name] = v;
                }
              }
            }
          }
        };
      },
    };
  }
  app.directive("rbsGeoAddressUniqueName", function () {
    return {
      restrict: "A",
      scope: false,
      require: "ngModel",
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$validators.geoAddressUniqueName = function (modelValue) {
          if (!angular.isArray(scope.addresses)) {
            return true;
          }
          for (var i = 0; i < scope.addresses.length; i++) {
            if (scope.address == scope.addresses[i]) {
              continue;
            }
            if (modelValue == scope.addresses[i].common.name) {
              return false;
            }
          }
          return true;
        };
      },
    };
  });
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("rbsGeoManageAddressesController", [
    "$scope",
    "RbsChange.AjaxAPI",
    "$element",
    "RbsChange.ModalStack",
    rbsGeoManageAddressesController,
  ]);
  function rbsGeoManageAddressesController(
    scope,
    AjaxAPI,
    element,
    ModalStack,
  ) {
    scope.data = {
      addresses: [],
      newAddress: null,
      isNewAddressValid: false,
      editedAddress: null,
      backupAddress: null,
      isEditedAddressValid: false,
      addressToDelete: null,
    };
    scope.openedModal = null;
    scope.errors = [];
    function loadAddresses() {
      AjaxAPI.getData("Rbs/Geo/Address/", {}).then(
        function (result) {
          scope.data.addresses = result.data.items;
        },
        function (result) {
          scope.data.addresses = [];
          console.log("loadAddresses error", result);
        },
      );
    }
    scope.openEditAddressForm = function (address) {
      scope.data.editedAddress = address;
      scope.data.backupAddress = angular.copy(address);
    };
    scope.cancelEdition = function () {
      var addresses = [];
      angular.forEach(scope.data.addresses, function (address) {
        if (address.common.id === scope.data.backupAddress.common.id) {
          addresses.push(scope.data.backupAddress);
        } else {
          addresses.push(address);
        }
      });
      scope.data.addresses = addresses;
      scope.data.editedAddress = null;
      scope.data.backupAddress = null;
    };
    scope.setDefaultAddress = function (address, defaultFor) {
      var id = address.common.id;
      address.default[defaultFor] = true;
      AjaxAPI.putData("Rbs/Geo/Address/" + id, address).then(
        function () {
          loadAddresses();
        },
        function (result) {
          console.log("setDefaultAddress error", result);
        },
      );
    };
    scope.updateAddress = function () {
      var id = scope.data.editedAddress.common.id;
      AjaxAPI.putData("Rbs/Geo/Address/" + id, scope.data.editedAddress).then(
        function (result) {
          var addedAddress = result.data.dataSets;
          var addresses = [];
          angular.forEach(scope.data.addresses, function (address) {
            if (address.common.id == id) {
              addresses.push(addedAddress);
            } else {
              addresses.push(address);
            }
          });
          scope.data.addresses = addresses;
          scope.data.editedAddress = null;
          scope.data.backupAddress = null;
        },
        function (result) {
          console.log("updateAddress error", result);
        },
      );
    };
    scope.openDialog = function (address) {
      scope.data.addressToDelete = address;
      var options = {
        templateUrl: "/rbs-geo-delete-address-confirm-modal.twig",
        backdropClass: "modal-backdrop-rbs-geo-delete-address-confirmation",
        windowClass: "modal-rbs-geo-delete-address-confirmation",
        size: "lg",
        scope: scope,
      };
      scope.data.openedModal = ModalStack.open(options);
    };
    scope.confirmDelete = function () {
      scope.deleteAddress(scope.data.addressToDelete);
      ModalStack.close(scope.openedModal);
      scope.openedModal = null;
      scope.data.addressToDelete = null;
    };
    scope.deleteAddress = function (address) {
      var id = address.common.id;
      AjaxAPI.deleteData(
        "Rbs/Geo/Address/" + id,
        scope.data.editedAddress,
      ).then(
        function () {
          var addresses = [];
          angular.forEach(scope.data.addresses, function (address) {
            if (address.common.id != id) {
              addresses.push(address);
            }
          });
          scope.data.addresses = addresses;
        },
        function (result) {
          console.log("deleteAddress error", result);
        },
      );
    };
    scope.openNewAddressForm = function () {
      scope.data.newAddress = { common: { name: null }, fields: {} };
      var offset = element.offset();
      if (offset && offset.hasOwnProperty("top")) {
        jQuery("html, body").animate({ scrollTop: offset.top - 20 }, 500);
      }
    };
    scope.clearAddress = function () {
      scope.data.newAddress = { common: { name: null }, fields: {} };
    };
    scope.cancelCreation = function () {
      scope.data.newAddress = null;
    };
    scope.addNewAddress = function () {
      AjaxAPI.postData("Rbs/Geo/Address/", scope.data.newAddress).then(
        function (result) {
          var addedAddress = result.data.dataSets;
          scope.data.addresses.push(addedAddress);
          scope.data.newAddress = null;
        },
        function (result) {
          scope.errors.push(result.data.message);
        },
      );
    };
    loadAddresses();
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.controller("RbsGeoManageAddressesControllerPreloaded", [
    "$scope",
    "RbsChange.AjaxAPI",
    "$element",
    "RbsChange.ModalStack",
    "$compile",
    rbsGeoManageAddressesControllerPreloaded,
  ]);
  function rbsGeoManageAddressesControllerPreloaded(
    $scope,
    AjaxAPI,
    element,
    ModalStack,
    $compile,
  ) {
    var hasPendingRequest = false;
    $scope.data = {
      newAddress: null,
      isNewAddressValid: false,
      editedAddress: null,
      isEditedAddressValid: false,
      addressToDelete: null,
    };
    $scope.openedModal = null;
    $scope.openEditAddressForm = function (addressFormSelector) {
      $scope.data.editedAddress = getAddressData(addressFormSelector);
    };
    $scope.cancelEdition = function () {
      $scope.data.editedAddress = null;
    };
    $scope.setDefaultAddress = function (addressFormSelector, defaultFor) {
      if (!hasPendingRequest) {
        hasPendingRequest = true;
        var address = getAddressData(addressFormSelector);
        address.default[defaultFor] = true;
        AjaxAPI.putData("Rbs/Geo/Address/" + address.common.id, address).then(
          function () {
            reloadBlock($scope.blockParameters, ".content");
            hasPendingRequest = false;
          },
          function (result) {
            console.error("setDefaultAddress error", result);
            hasPendingRequest = false;
          },
        );
      }
    };
    $scope.updateAddress = function () {
      if (!hasPendingRequest) {
        hasPendingRequest = true;
        var id = $scope.data.editedAddress.common.id;
        AjaxAPI.putData(
          "Rbs/Geo/Address/" + id,
          $scope.data.editedAddress,
        ).then(
          function () {
            $scope.data.editedAddress = null;
            reloadBlock($scope.blockParameters, ".content");
            hasPendingRequest = false;
          },
          function (result) {
            console.error("updateAddress error", result);
            hasPendingRequest = false;
          },
        );
      }
    };
    $scope.openDialog = function (addressFormSelector) {
      $scope.data.addressToDelete = getAddressData(addressFormSelector);
      var options = {
        templateUrl: "/rbs-geo-delete-address-confirm-modal.twig",
        backdropClass: "modal-backdrop-rbs-geo-delete-address-confirmation",
        windowClass: "modal-rbs-geo-delete-address-confirmation",
        size: "lg",
        scope: $scope,
      };
      $scope.data.openedModal = ModalStack.open(options);
    };
    $scope.confirmDelete = function () {
      $scope.deleteAddress($scope.data.addressToDelete);
      ModalStack.close($scope.openedModal);
      $scope.data.addressToDelete = null;
      $scope.openedModal = null;
    };
    $scope.deleteAddress = function (address) {
      if (!hasPendingRequest) {
        hasPendingRequest = true;
        var id = address.common.id;
        AjaxAPI.deleteData(
          "Rbs/Geo/Address/" + id,
          $scope.data.editedAddress,
        ).then(
          function () {
            reloadBlock($scope.blockParameters, ".content");
            hasPendingRequest = false;
          },
          function (result) {
            console.error("deleteAddress error", result);
            hasPendingRequest = false;
          },
        );
      }
    };
    $scope.openNewAddressForm = function () {
      $scope.data.newAddress = { common: { name: null }, fields: {} };
      var offset = element.offset();
      if (offset && offset.hasOwnProperty("top")) {
        jQuery("html, body").animate({ scrollTop: offset.top - 20 }, 500);
      }
    };
    $scope.clearAddress = function () {
      $scope.data.newAddress = { common: { name: null }, fields: {} };
    };
    $scope.cancelCreation = function () {
      $scope.data.newAddress = null;
    };
    $scope.addNewAddress = function () {
      if (!hasPendingRequest) {
        hasPendingRequest = true;
        AjaxAPI.postData("Rbs/Geo/Address/", $scope.data.newAddress).then(
          function () {
            $scope.data.newAddress = null;
            reloadBlock($scope.blockParameters, ".content");
            hasPendingRequest = false;
          },
          function (result) {
            var parameters = angular.copy($scope.blockParameters);
            parameters.errorMessage = result.data.message;
            parameters.renderPart = "errorMessage";
            reloadBlock(parameters, ".error-message");
            hasPendingRequest = false;
          },
        );
      }
    };
    function getAddressData(addressFormSelector) {
      return JSON.parse(
        document.querySelector(
          "#" + addressFormSelector + ' input[name="addressData"]',
        ).value,
      );
    }
    function reloadBlock(parameters, selector) {
      AjaxAPI.reloadBlock(
        $scope.blockName,
        $scope.blockId,
        parameters,
        $scope.blockNavigationContext,
      ).then(
        function (result) {
          var content = jQuery(jQuery.parseHTML(result.data.dataSets.html))
            .filter(selector)
            .html();
          element.find(selector).html(content);
          $compile(element.find(selector))($scope);
        },
        function (error) {
          console.error(
            "[RbsGeoManageAddresses] error reloading block:",
            error,
          );
        },
      );
    }
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsStoreWebStoreSelectorInit", [
    "RbsChange.AjaxAPI",
    rbsStoreWebStoreSelectorInit,
  ]);
  function rbsStoreWebStoreSelectorInit(AjaxAPI) {
    return {
      restrict: "A",
      link: function (scope) {
        scope.parameters = scope.blockParameters;
        var data = scope.blockData;
        scope.webStoreData = data.webStores;
        scope.originalSelection = angular.copy(data.common);
        scope.selection = data.common;
        function buildSelection(selection) {
          scope.billingAreaData = [];
          scope.zoneData = [];
          if (selection) {
            if (scope.webStoreData.length === 1) {
              selection.webStoreId = scope.webStoreData[0].common.id;
            }
            if (selection.webStoreId) {
              var validWebStoreId = false;
              for (var i = 0; i < scope.webStoreData.length; i++) {
                var store = scope.webStoreData[i];
                if (store.common.id == selection.webStoreId) {
                  validWebStoreId = true;
                  scope.billingAreaData = store.billingAreas;
                  if (store.billingAreas.length === 1) {
                    selection.billingAreaId = store.billingAreas[0].common.id;
                  }
                  if (selection.billingAreaId) {
                    var validBillingAreaId = false;
                    for (var j = 0; j < store.billingAreas.length; j++) {
                      var area = store.billingAreas[j];
                      if (area.common.id == selection.billingAreaId) {
                        validBillingAreaId = true;
                        scope.zoneData = area.zones;
                        if (area.zones.length === 1) {
                          selection.zone = area.zones[0].common.code;
                        }
                        var validZone = false;
                        for (var k = 0; k < area.zones.length; k++) {
                          if (selection.zone == area.zones[k].common.code) {
                            validZone = true;
                          }
                        }
                        if (!validZone) {
                          selection.zone = null;
                        }
                      }
                    }
                    if (!validBillingAreaId) {
                      selection.billingAreaId = 0;
                    }
                  }
                }
              }
              if (!validWebStoreId) {
                selection.webStoreId = 0;
              }
            }
          }
        }
        buildSelection(scope.selection);
        scope.$watch(
          "selection",
          function (selection) {
            buildSelection(selection);
          },
          true,
        );
        scope.canSubmit = function () {
          return (
            scope.selection.webStoreId != scope.originalSelection.webStoreId ||
            scope.selection.billingAreaId !=
              scope.originalSelection.billingAreaId ||
            scope.selection.zone != scope.originalSelection.zone
          );
        };
        scope.submit = function () {
          AjaxAPI.putData("Rbs/Commerce/Context", scope.selection).then(
            function () {
              window.location.reload();
            },
            function (result) {
              console.log("SelectWebStore error", result);
            },
          );
        };
        scope.show = scope.webStoreData.length > 1;
        angular.forEach(scope.webStoreData, function (store) {
          if (store.billingAreas.length > 1) {
            scope.show = true;
          }
          angular.forEach(store.billingAreas, function (billingArea) {
            if (billingArea.zones.length > 1) {
              scope.show = true;
            }
          });
        });
      },
    };
  }
})();
(() => {
  "use strict";
  const app = angular.module("RbsChangeApp");
  app.directive("cleverageIngenicoDirectHostedCheckout", [
    "$window",
    "$location",
    "$rootScope",
    "$timeout",
    "RbsChange.AjaxAPI",
    ($window, $location, $rootScope, $timeout, AjaxAPI) => ({
      restrict: "A",
      scope: { processData: "=", transaction: "=", connectorInfo: "=" },
      templateUrl: "/cleverage-ingenico-direct-hosted-checkout.twig",
      link: (scope) => {
        scope.paymentData = scope.connectorInfo.transaction;
        scope.processing = false;
        scope.errorMessage = null;
        scope.submitCheckout = ($event) => {
          if (!scope.processing || !scope.isValid) {
            scope.processing = true;
            AjaxAPI.openWaitingModal();
            scope.processData.paymentError = [];
            const data = {
              connectorId: scope.connectorInfo.common.id,
              transactionId: scope.transaction.transactionId,
            };
            AjaxAPI.postData(scope.paymentData.actionName, data)
              .then((result) =>
                $window.location.assign(result.data.dataSets.redirectUrl),
              )
              .catch((error) => {
                console.error(error);
                const errorMessage =
                  error?.data?.message ?? error?.message ?? "Error";
                scope.processData.paymentError = [errorMessage];
                scope.errorMessage = errorMessage;
              })
              .finally(() => {
                scope.processing = false;
                AjaxAPI.closeWaitingModal();
              });
          }
        };
      },
    }),
  ]);
  app.directive("cleverageIngenicoDirectHostedTokenization", [
    "$window",
    "$location",
    "$rootScope",
    "$timeout",
    "RbsChange.AjaxAPI",
    ($window, $location, $rootScope, $timeout, AjaxAPI) => ({
      restrict: "A",
      scope: { processData: "=", transaction: "=", connectorInfo: "=" },
      templateUrl: "/cleverage-ingenico-direct-hosted-tokenization.twig",
      link: (scope, element) => {
        AjaxAPI.openWaitingModal();
        scope.paymentData = scope.connectorInfo.transaction;
        scope.customConsumerConsent = !scope.paymentData.askConsumerConsent;
        scope.oneClickEnabled = scope.paymentData.oneClickEnabled;
        scope.tokenizedCards = scope.paymentData.tokenizedCards;
        scope.selectedCard = { token: null };
        scope.citToken = scope.paymentData.citToken;
        scope.storePermanently = false;
        scope.libraryIsLoaded = false;
        scope.processing = false;
        scope.isValid = false;
        scope.errorMessage = null;
        const handleError = (error) => {
          console.error(error);
          const errorMessage =
            error?.data?.message ?? error?.message ?? "Error";
          scope.processData.paymentError = [errorMessage];
          scope.errorMessage = errorMessage;
          scope.isValid = false;
          IngenicoDirectTokenizer.destroy();
        };
        const validationCallback = (result) => {
          scope.isValid = result.valid;
          $rootScope.$emit("Cleverage:IngenicoDirect:validation", result);
          scope.$apply();
        };
        const paymentProductUpdatedCallback = (result) => {
          $rootScope.$emit(
            "Cleverage:IngenicoDirect:paymentProductUpdated",
            result,
          );
          scope.$apply();
        };
        scope.toggleStorePermanently = () => {
          scope.storePermanently = !scope.storePermanently;
        };
        scope.useToken = (citToken) => {
          IngenicoDirectTokenizer.useToken(citToken);
          if (citToken === null) {
            scope.selectedCard.token = null;
            if (
              scope.paymentData.hideCardholderName &&
              scope.paymentData.cardHolderName
            ) {
              IngenicoDirectTokenizer.useCardholderName(
                scope.paymentData.cardHolderName,
              );
            }
          }
        };
        let IngenicoDirectTokenizer;
        const initIngenicoDirectTokenizer = (event) => {
          IngenicoDirectTokenizer = new $window.Tokenizer(
            scope.paymentData.hostedTokenizationUrl,
            "ingenico-direct-hosted-tokenization",
            {
              hideCardholderName: scope.paymentData.hideCardholderName,
              hideTokenFields: scope.paymentData.hideTokenFields,
              validationCallback: validationCallback,
              paymentProductUpdatedCallback: paymentProductUpdatedCallback,
            },
          );
          IngenicoDirectTokenizer.initialize()
            .then(() => (scope.libraryIsLoaded = true))
            .catch(handleError)
            .finally(AjaxAPI.closeWaitingModal);
          if (
            scope.paymentData.hideCardholderName &&
            scope.paymentData.cardHolderName
          ) {
            IngenicoDirectTokenizer.useCardholderName(
              scope.paymentData.cardHolderName,
            );
          }
          element.on("$destroy", () => IngenicoDirectTokenizer.destroy());
        };
        if ($window.Tokenizer == null) {
          const script = document.createElement("script");
          script.async;
          script.onload = initIngenicoDirectTokenizer;
          document.head.appendChild(script);
          script.src = scope.paymentData.scriptUrl;
        } else {
          initIngenicoDirectTokenizer();
        }
        scope.submitTokenization = ($event) => {
          if (!scope.processing || !scope.isValid) {
            scope.processing = true;
            const submitTokenizationParameters = scope.customConsumerConsent
              ? { storePermanently: scope.storePermanently }
              : {};
            AjaxAPI.openWaitingModal();
            scope.processData.paymentError = [];
            IngenicoDirectTokenizer.submitTokenization(
              submitTokenizationParameters,
            )
              .then((result) => {
                if (result.success) {
                  const data = {
                    connectorId: scope.connectorInfo.common.id,
                    transactionId: scope.transaction.transactionId,
                    hostedTokenizationId: result.hostedTokenizationId,
                    browserData: {
                      customerEmail: scope.paymentData.customerEmail,
                      colorDepth: $window.screen.colorDepth,
                      javaEnabled: $window.navigator.javaEnabled(),
                      locale: $window.navigator.language,
                      screenHeight: $window.screen.height,
                      screenWidth: $window.screen.width,
                      timezoneOffsetUtcMinutes: new Date().getTimezoneOffset(),
                      userAgent: $window.navigator.userAgent,
                    },
                  };
                  return AjaxAPI.postData(scope.paymentData.actionName, data);
                }
                throw result.error;
              })
              .then((result) =>
                $window.location.assign(result.data.dataSets.redirectUrl),
              )
              .catch(handleError)
              .finally(() => {
                scope.processing = false;
                AjaxAPI.closeWaitingModal();
              });
          }
        };
      },
    }),
  ]);
})();
(() => {
  "use strict";
  const app = angular.module("RbsChangeApp");
  app.controller("CleverageIngenicodirectManageTokenizedCardsController", [
    "$scope",
    "RbsChange.AjaxAPI",
    "$element",
    "RbsChange.ModalStack",
    "$compile",
    (scope, AjaxAPI, element, ModalStack, $compile) => {
      let hasPendingRequest = false;
      let tokenizedCardToDelete = null;
      const deleteTokenizedCard = () => {
        if (!hasPendingRequest) {
          hasPendingRequest = true;
          AjaxAPI.deleteData("Cleverage/Ingenicodirect/TokenizedCardAction", {
            tokenizedCardId: tokenizedCardToDelete,
          }).then(
            (result) => {
              const parameters = angular.copy(scope.blockParameters);
              parameters.statusMessage = result.data?.dataSets?.status.message;
              parameters.statusMessageSeverity = "success";
              reloadBlock(parameters, 'div[data-ajax-render-content="true"]');
              hasPendingRequest = false;
            },
            (error) => {
              console.error("deleteTokenizedCard error", error);
              const parameters = angular.copy(scope.blockParameters);
              parameters.statusMessage = error.data.message;
              parameters.statusMessageSeverity = "danger";
              parameters.renderPart = "errorMessage";
              reloadBlock(
                parameters,
                'div[data-ajax-render-status-message="true"]',
              );
              hasPendingRequest = false;
            },
          );
          tokenizedCardToDelete = null;
        }
      };
      const reloadBlock = (parameters, selector) => {
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          (result) => {
            const content = jQuery(jQuery.parseHTML(result.data.dataSets.html))
              .filter(selector)
              .html();
            element.find(selector).html(content);
            $compile(element.find(selector))(scope);
          },
          (error) => {
            console.error(
              "[ManageTokenizedCards] error reloading block:",
              error,
            );
          },
        );
      };
      scope.openConfirmationModal = (id) => {
        tokenizedCardToDelete = id;
        const options = {
          templateUrl:
            "/cleverage-ingenicodirect-delete-tokenized-card-confirm-modal.twig",
          backdropClass:
            "modal-backdrop-cleverage-ingenicodirect-delete-tokenized-card-confirmation",
          windowClass:
            "modal-cleverage-ingenicodirect-delete-tokenized-card-confirmation",
          size: "lg",
          scope: scope,
        };
        const confirmationModal = ModalStack.open(options);
        confirmationModal.result.then(deleteTokenizedCard, angular.noop);
      };
    },
  ]);
})();

(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("setUpSlider", ["RbsChange.AjaxAPI", myFunction]);
  function myFunction() {
    return {
      restrict: "A",
      scope: {},
      link: function (scope, _, attrs) {
        $(".autoplayActualiter").removeClass("hide-zento");
        $(".autoplayActualiter").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          prevArrow:
            "<button type='button' class='slick-prev pull-left'></button>",
          nextArrow:
            "<button type='button' class='slick-next pull-right'></button>",
          responsive: [
            {
              breakpoint: 1239,
              settings: { slidesToShow: 3, slidesToScroll: 1 },
            },
            {
              breakpoint: 992,
              settings: { slidesToShow: 2, slidesToScroll: 1 },
            },
            {
              breakpoint: 560,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                prevArrow:
                  "<button type='button' class='slick-prev pull-left'></button>",
                nextArrow:
                  "<button type='button' class='slick-next pull-right'></button>",
              },
            },
          ],
        });
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("projectZtofrancoportFrancoport", [
    "$rootScope",
    "RbsChange.AjaxAPI",
    "RbsChange.ResponsiveSummaries",
    projectZtofrancoportFrancoport,
  ]);
  function projectZtofrancoportFrancoport(
    $rootScope,
    AjaxAPI,
    ResponsiveSummaries,
  ) {
    var cacheCartDataKey = "cartData";
    return {
      restrict: "A",
      link: function (scope, elem, attrs) {
        var cacheKey = scope.blockId;
        function setCartData(cartData) {
          if (!cartData) {
            scope.cartData = cartData;
            return;
          }
          scope.readOnly = cartData.processData.locked;
          if (!cartData.amounts) {
            var displayPricesWithTax =
              scope.parameters && scope.parameters.displayPricesWithTax;
            var displayPricesWithoutTax =
              scope.parameters && scope.parameters.displayPricesWithoutTax;
            if (displayPricesWithTax || displayPricesWithoutTax) {
              if (displayPricesWithTax) {
                cartData.amounts = { linesAmountWithTaxes: 0.0 };
              } else {
                cartData.amounts = { linesAmountWithoutTaxes: 0.0 };
              }
              angular.forEach(cartData.deliveries, function (delivery) {
                if (displayPricesWithTax) {
                  cartData.amounts.linesAmountWithTaxes +=
                    delivery.linesAmountWithTaxes;
                } else {
                  cartData.amounts.linesAmountWithoutTaxes +=
                    delivery.linesAmountWithoutTaxes;
                }
              });
            }
          }
          if (!cartData.lines) {
            cartData.lines = [];
            angular.forEach(cartData.deliveries, function (delivery) {
              angular.forEach(delivery.lines, function (line) {
                cartData.lines.push(line);
              });
            });
          }
          scope.cartData = cartData;
        }
        scope.parameters = AjaxAPI.getBlockParameters(cacheKey);
        setCartData(AjaxAPI.globalVar(cacheCartDataKey));
        var cartParams = {
          detailed: false,
          URLFormats: "canonical",
          visualFormats: scope.parameters["imageFormats"],
        };
        scope.loading = false;
        if (angular.isUndefined(scope.cartData)) {
          loadCurrentCart();
        } else {
          scope.readOnly = scope.cartData.processData.locked;
        }
        if (!angular.isUndefined(scope.cartData)) {
          evaluateShippingFee(scope.cartData);
        }
        function evaluateShippingFee(cartData) {
          scope.francoAmountLeft = null;
          angular.forEach(cartData.deliveries, function (delivery) {
            if (delivery.options.notAppliedModifiers) {
              angular.forEach(
                delivery.options.notAppliedModifiers,
                function (notAppliedModifier) {
                  if (notAppliedModifier.technicalName === "franco") {
                    var cartFilterdata = notAppliedModifier.cartFilterData;
                    if (
                      cartFilterdata.name === "group" &&
                      cartFilterdata.parameters.operator === "AND"
                    ) {
                      var filtersOk = true;
                      var filterAmountOk = false;
                      var amountValue = 0;
                      angular.forEach(
                        cartFilterdata.filters,
                        function (filter) {
                          if (filter.name !== "group") {
                            if (filter.name === "deliveryLinesAmount") {
                              amountValue = filter.parameters.value;
                              if (filter.__isValid) {
                                filterAmountOk = true;
                                return;
                              }
                            } else if (!filter.__isValid) {
                              filtersOk = false;
                            }
                          }
                        },
                      );
                      if (filtersOk && !filterAmountOk) {
                        scope.francoAmountLeft =
                          amountValue - delivery.linesAmountWithTaxes;
                      }
                    }
                  }
                },
              );
            }
          });
        }
        function loadCurrentCart() {
          scope.loading = true;
          AjaxAPI.getData("Rbs/Commerce/Cart", null, cartParams).then(
            function (result) {
              var cart = result.data.dataSets;
              if (!cart || angular.isArray(cart)) {
                setCartData(null);
              } else {
                setCartData(cart);
              }
              scope.loading = false;
            },
            function (result) {
              setCartData(null);
              scope.loading = false;
            },
          );
        }
        $rootScope.$on("rbsRefreshCart", function (event, params) {
          if (params && params.hasOwnProperty("cart")) {
            setCartData(params["cart"]);
            scope.loading = false;
          } else {
            loadCurrentCart();
          }
          evaluateShippingFee(scope.cartData);
        });
        function updateCartLinesData(updateLinesData) {
          scope.loading = true;
          AjaxAPI.openWaitingModal(attrs["deleteProductWaitingMessage"]);
          var request = AjaxAPI.putData(
            "Rbs/Commerce/Cart/Lines",
            { lines: updateLinesData },
            cartParams,
          );
          request.then(
            function (result) {
              var cartData = result.data.dataSets;
              if (cartData && !angular.isArray(cartData)) {
                setCartData(cartData);
              }
              elem.find(".dropdown-toggle").dropdown("toggle");
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
            function (result) {
              scope.loading = false;
              AjaxAPI.closeWaitingModal();
            },
          );
          return request;
        }
        scope.updateLineQuantity = function (key, newQuantity) {
          var lineData = { key: key, quantity: newQuantity };
          updateCartLinesData([lineData]);
        };
        ResponsiveSummaries.registerItem(
          cacheKey,
          scope,
          '<li data-project-ztofrancoport-francoport=""></li>',
        );
      },
    };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  app.directive("rbsAttributeValueZtoRenderAttrAtout", [
    "RbsChange.AjaxAPI",
    myFunction,
  ]);
  function myFunction() {
    return {
      restrict: "A",
      templateUrl: "/attribute-value-zto-render-attr-atout.twig",
      scope: {},
      link: function (scope, _, attrs) {
        if (!attrs.product) {
          return;
        }
        const product = JSON.parse(attrs.product);
        if (
          !(
            product &&
            product.typology &&
            product.typology.visibilities &&
            product.typology.visibilities.atouts
          )
        ) {
          return;
        }
        if (
          product.typology.attributes &&
          product.typology.attributes[attrs.key]
        ) {
          scope.value = product.typology.attributes[attrs.key].value;
        }
        scope.imageURL = attrs.picto;
      },
    };
  }
})();
(function () {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoInsta", ["$http", ztoInsta]);
  function ztoInsta($http) {
    return { restrict: "A", link: function (scope, $element, attrs) {} };
  }
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var UpdateAxesValuesEvent = "RbsCatalogProductDetail.updateAxesValues";
  app.controller("RbsCatalogProductDetail", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "$compile",
    "$location",
    "$http",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      $compile,
      $location,
      $http,
      AjaxAPI,
      ModalStack,
      ProductService,
    ) {
      scope.productData = scope.blockData;
      scope.cartBox = scope.productData.cartBox || {};
      scope.cartBox.quantity = scope.productData.stock.minQuantity;
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
      );
      productDetailHandler.initProductDetailScope();
      scope.rootElement = element;
      var isProductSet = attrs.productType === "set";
      scope.showProductInformation = function (event, name) {
        if (event) {
          event.preventDefault();
        }
        $rootScope.$broadcast("showProductInformation", { name: name });
      };
      var reviewsUrl = attrs.reviewsUrl;
      initReviews();
      function initReviews() {
        if (scope.blockParameters.handleReviews) {
          if (reviewsUrl) {
            return $http.get(reviewsUrl).then(
              function (result) {
                AjaxAPI.replaceElementContent(
                  element.find(".reviews-panel"),
                  result.data,
                  scope,
                );
              },
              function (result) {
                console.error(
                  "[RbsCatalogProductDetail] error initiating reviews content:",
                  result,
                );
              },
            );
          } else {
            console.warn(
              "[RbsCatalogProductDetail] No reviewsURL for product.",
            );
          }
        }
      }
      scope.$on(UpdateAxesValuesEvent, function (event, params) {
        if (params.contextKey !== scope.blockParameters.contextKey) {
          return;
        }
        scope.currentDisplayedDocumentId = params.variantId;
        scope.currentSelectedAxesValues = params.axesValues;
        if (isProductSet) {
          return;
        }
        var parameters = angular.copy(scope.blockParameters);
        parameters.documentIdWithReviews =
          parameters.variantId !== 0
            ? parameters.variantId
            : parameters.toDisplayDocumentId;
        parameters.toDisplayDocumentId = scope.currentDisplayedDocumentId;
        parameters.selectedAxesValues = scope.currentSelectedAxesValues;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resultHtml = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            );
            scope.productData = JSON.parse(
              $resultHtml.filter(".data-container").text(),
            );
            AjaxAPI.replaceElementContent(
              element.find(".product-content"),
              $resultHtml.filter(".product-content").html(),
              scope,
            );
            initReviews();
          },
          function (error) {
            console.error(
              "[RbsCatalogProductDetail] error reloading block:",
              error,
            );
          },
        );
      });
    },
  ]);
  app.controller("RbsCatalogProductDetailAxes", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    function (scope, element, attrs, $rootScope) {
      scope.updateAxesValues = function (
        axesValues,
        variantId,
        contextKey,
        currentId,
      ) {
        $rootScope.$broadcast(UpdateAxesValuesEvent, {
          axesValues: axesValues,
          variantId: variantId,
          contextKey: contextKey,
          currentId: currentId,
          productSetItemIndex: attrs.productSetItemIndex,
        });
      };
      scope.updateAxesValuesFromSelect = function (
        options,
        selectId,
        contextKey,
        currentId,
      ) {
        var option = options[scope[selectId]];
        if (option) {
          scope.updateAxesValues(
            option.axesValues,
            option.variantId,
            contextKey,
            currentId,
          );
        }
      };
      var axesData = scope.productData.axes;
      if (
        axesData.values.length < axesData.definitions.length &&
        axesData.definitions[axesData.values.length].items.length === 1
      ) {
        var item = axesData.definitions[axesData.values.length].items[0];
        scope.updateAxesValues(
          item.axesValues,
          item.id,
          scope.blockParameters.contextKey,
          scope.productData.common.id,
        );
      }
    },
  ]);
  app.controller("RbsCatalogProductDetailInformationFlat", [
    "$scope",
    "$element",
    function (scope, element) {
      scope.$on("showProductInformation", function (event, params) {
        if (params.name) {
          jQuery("html, body")
            .stop()
            .animate(
              { scrollTop: element.find("#" + params.name).offset().top - 20 },
              1000,
            );
        }
      });
    },
  ]);
  app.controller("RbsCatalogProductDetailInformationTabs", [
    "$scope",
    "$element",
    function (scope, element) {
      scope.$on("showProductInformation", function (event, params) {
        if (params.name) {
          var selector = 'a[href="#' + params.name + '"]';
          element.find(selector).tab("show");
          jQuery("html, body")
            .stop()
            .animate(
              { scrollTop: element.find(selector).offset().top - 20 },
              1000,
            );
        }
      });
    },
  ]);
  app.controller("ProductCartBox", [
    "$rootScope",
    "$scope",
    "$element",
    "$timeout",
    "RbsChange.AjaxAPI",
    "RbsChange.ModalStack",
    "RbsChange.ProductService",
    function (
      $rootScope,
      scope,
      element,
      $timeout,
      AjaxAPI,
      ModalStack,
      ProductService,
    ) {
      var productCartBoxHandler = new ProductCartBoxHandler(
        $rootScope,
        scope,
        AjaxAPI,
        ModalStack,
        ProductService,
      );
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      scope.$watch("productData", function (productData, old) {
        if (productData !== old) {
          ProductCartBoxHandler.checkCapabilities(scope, productData);
        }
      });
      ProductCartBoxHandler.checkCapabilities(scope, scope.productData);
      productDetailHandler.initQuantity();
      scope.addShippingCategoriesProduct = function () {
        return productCartBoxHandler.addShippingCategoriesProduct();
      };
      scope.addStoreCategoriesProduct = function () {
        return productCartBoxHandler.addStoreCategoriesProduct();
      };
      scope.selectStore = function (forReservation) {
        productCartBoxHandler.selectStore(forReservation);
      };
      scope.addProductExtended = function (category) {
        return productCartBoxHandler.addProductExtended(category);
      };
      scope.buttonTitle = function (categoryData) {
        return productCartBoxHandler.buttonTitle(categoryData);
      };
      scope.$on("rbsCartBoxStoreSelected", function (event, storeData) {
        var parameters = scope.parameters;
        parameters.storeId = storeData.common.id;
        if (scope.currentDisplayedDocumentId) {
          parameters.toDisplayDocumentId = scope.currentDisplayedDocumentId;
        }
        if (scope.currentSelectedAxesValues) {
          parameters.selectedAxesValues = scope.currentSelectedAxesValues;
        }
        parameters = angular.copy(parameters);
        parameters.consolidatedProductData = scope.productData;
        parameters.renderPart = "cart-box";
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resHtml = jQuery(jQuery.parseHTML(result.data.dataSets.html));
            AjaxAPI.replaceElementContent(
              element.find(".add-to-cart-store"),
              $resHtml.find(".add-to-cart-store").html(),
              scope,
            );
          },
          function (error) {
            console.error("[ProductCartBox] error reloading block:", error);
          },
        );
      });
      var reloadCartBoxTimer = null;
      scope.$on("reloadCartBox", function (event, parameters) {
        if (reloadCartBoxTimer) {
          $timeout.cancel(reloadCartBoxTimer);
        }
        reloadCartBoxTimer = $timeout(function () {
          reloadCartBoxTimer = null;
          AjaxAPI.reloadBlock(
            scope.blockName,
            scope.blockId,
            parameters,
            scope.blockNavigationContext,
          ).then(
            function (result) {
              var $resHtml = jQuery(
                jQuery.parseHTML(result.data.dataSets.html),
              );
              AjaxAPI.replaceElementContent(
                element.find(".cart-box-content"),
                $resHtml.find(".cart-box-content").html(),
                scope,
              );
            },
            function (error) {
              console.error("[ProductCartBox] error reloading block:", error);
            },
          );
        }, 200);
      });
    },
  ]);
  app.controller("ProductSetController", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "RbsChange.ProductService",
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      ProductService,
      ModalStack,
      AjaxAPI,
    ) {
      scope.itemsToAdd = [];
      scope.addToCartData = {};
      scope.checkedItems = {};
      angular.forEach(
        scope.productData.productSet.products,
        function (itemData) {
          scope.checkedItems["i" + itemData.common.id] = !!(
            itemData.stock &&
            itemData.stock.sku &&
            itemData.cartBox &&
            itemData.cartBox.allCategories.disabled === false
          );
        },
      );
      scope.updateCheckedItem = function (itemData, index, itemId) {
        if (scope.checkedItems["i" + itemId]) {
          scope.itemsToAdd[index] = itemData;
        } else {
          delete scope.itemsToAdd[index];
        }
        productDetailHandler.refreshData();
        var parameters = angular.copy(scope.parameters);
        parameters.consolidatedProductData = scope.productData;
        parameters.renderPart = "cart-box";
        parameters.tTL = 0;
        scope.$broadcast("reloadCartBox", parameters);
      };
      scope.refreshHandlerData = function () {
        productDetailHandler.refreshData();
      };
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      var productCartBoxHandler = new ProductCartBoxHandler(
        $rootScope,
        scope,
        AjaxAPI,
        ModalStack,
        ProductService,
      );
      productDetailHandler.initProductDetailScope();
      productDetailHandler.refreshData();
      var modalOption = scope.getStoreAvailabilityModalOption;
      scope.getStoreAvailabilityModalOption = function (
        allowSelect,
        forReservation,
      ) {
        var result = modalOption(allowSelect, forReservation);
        result.resolve.skuQuantities = function () {
          return scope.productData.cartBox.skuQuantities;
        };
        return result;
      };
      scope.populateAddProductData = function (addProductData) {
        return productDetailHandler.populateAddProductData(addProductData);
      };
      scope.onAddProductSuccess = function (response) {
        return productCartBoxHandler.onAddProductSuccess(response);
      };
      scope.addShippingCategoriesProduct = function () {
        return productCartBoxHandler.addShippingCategoriesProduct();
      };
      scope.addStoreCategoriesProduct = function () {
        return productCartBoxHandler.addStoreCategoriesProduct();
      };
      scope.addProductExtended = function (category) {
        return productCartBoxHandler.addProductExtended(category);
      };
      scope.buttonTitle = function (categoryData) {
        return productCartBoxHandler.buttonTitle(categoryData);
      };
    },
  ]);
  app.controller("ProductSetItemController", [
    "$scope",
    "$element",
    "$attrs",
    "$rootScope",
    "RbsChange.ProductService",
    "RbsChange.ModalStack",
    "RbsChange.AjaxAPI",
    function (
      scope,
      element,
      attrs,
      $rootScope,
      ProductService,
      ModalStack,
      AjaxAPI,
    ) {
      scope.productData =
        scope.productData.productSet.products[attrs.index] || {};
      var itemId = scope.productData.common.id;
      var currentDisplayedDocumentId = scope.productData.common.id;
      var currentSelectedAxesValues = [];
      var productDetailHandler = new ProductDetailHandler(
        scope,
        element,
        ModalStack,
        ProductService,
        AjaxAPI,
      );
      productDetailHandler.refreshSetItem();
      productDetailHandler.initQuantity();
      scope.$watch("checkedItems.i" + itemId, function () {
        scope.updateCheckedItem(scope.productData, attrs.index, itemId);
      });
      scope.$watch("cartBox.quantity", function (val, oldVal) {
        if (val && val !== oldVal && scope.checkedItems["i" + itemId]) {
          scope.refreshHandlerData();
        }
      });
      scope.$on("rbsCartBoxStoreSelected", function (event, storeData) {
        refresh(storeData.common.id);
      });
      var refresh = function (storeId) {
        var parameters = angular.copy(scope.blockParameters);
        parameters.toDisplayDocumentId = currentDisplayedDocumentId;
        parameters.selectedAxesValues = currentSelectedAxesValues;
        parameters.renderPart = "variant-in-product-set";
        parameters.itemId = itemId;
        parameters.storeId = storeId || scope.blockParameters.storeId;
        parameters.productSetItemIndex = attrs.index;
        AjaxAPI.reloadBlock(
          scope.blockName,
          scope.blockId,
          parameters,
          scope.blockNavigationContext,
        ).then(
          function (result) {
            var $resultHtml = jQuery(
              jQuery.parseHTML(result.data.dataSets.html),
            );
            scope.productData = JSON.parse(
              $resultHtml.filter(".data-container").text(),
            );
            if (scope.checkedItems["i" + itemId]) {
              scope.itemsToAdd[attrs.index] = scope.productData;
              scope.productData.cartBox.quantity = scope.cartBox.quantity;
            }
            if (!storeId) {
              if (
                scope.productData.cartBox &&
                scope.productData.cartBox.allCategories.disabled === false
              ) {
                if (!scope.checkedItems["i" + itemId]) {
                  scope.checkedItems["i" + itemId] = true;
                } else {
                  scope.updateCheckedItem(
                    scope.productData,
                    attrs.index,
                    itemId,
                  );
                }
              } else {
                scope.checkedItems["i" + itemId] = false;
              }
            }
            AjaxAPI.replaceElementContent(
              element.find(".product-set-item-container"),
              $resultHtml.filter(".product-set-item-container").html(),
              scope,
            );
            productDetailHandler.refreshSetItem();
            productDetailHandler.initQuantity();
            if (scope.checkedItems["i" + itemId]) {
              scope.refreshHandlerData();
            }
          },
          function (error) {
            console.error(
              "[RbsCatalogProductDetail] error reloading block:",
              error,
            );
          },
        );
      };
      scope.$on(UpdateAxesValuesEvent, function (event, params) {
        if (params.contextKey !== scope.blockParameters.contextKey) {
          return;
        }
        if (params.productSetItemIndex !== attrs.index) {
          return;
        }
        currentDisplayedDocumentId = params.variantId;
        currentSelectedAxesValues = params.axesValues;
        refresh();
      });
    },
  ]);
})();
(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  function keepInformationConsent() {
    var dataBind = $("body").data("armis");
    trackerConsent(dataBind);
  }
  function trackerConsent(getdatabind) {
    (function (d, s) {
      const rawCookies = document.cookie.split(";");
      const cookies = rawCookies.map((cookie) => cookie.split("="));
      const gdprCookie = cookies.find(
        (cookie) => cookie[0].trim() === "rbsWebsiteTrackerConsentGdpr",
      );
      let CONSENT_STRING = null;
      if (gdprCookie) {
        const gdprCookieValue = JSON.parse(decodeURIComponent(gdprCookie[1]));
        CONSENT_STRING = gdprCookieValue.identifier;
      }
      var find = d.getElementsByTagName.bind(d),
        tag = d.createElement(s);
      tag.async = true;
      (find("head")[0] || find("body")[0] || find(s)[0].parentNode).appendChild(
        tag,
      );
      tag.onload = function () {
        const data = Armis.sendEvent({
          nbSec: 5,
          accId: 50,
          tagId: getdatabind,
          constr: CONSENT_STRING,
        });
      };
      tag.src = "https://content.acotedemoi.com/bundle.js";
    })(window.document, "script");
  }
  app.controller("rbsWebsiteManageTrackersGdpr", [
    "$scope",
    "$rootScope",
    "RbsChange.Cookies",
    "RbsChange.ModalStack",
    "$attrs",
    function (scope, rootScope, Cookies, ModalStack, attrs) {
      scope.cookiesCategories = JSON.parse(attrs.cookiesCategories);
      scope.hideConsent = false;
      scope.running = false;
      var consent = Cookies.getConsent().acceptedCookies;
      if (consent) {
        var consentedCategories = {};
        scope.hideConsent = true;
        for (var i = 0; i < scope.cookiesCategories.length; i++) {
          var _id = scope.cookiesCategories[i].id;
          if (typeof consent[_id] !== "boolean") {
            scope.hideConsent = false;
          } else {
            consentedCategories[_id] = consent[_id];
          }
        }
        if (!scope.hideConsent) {
          Cookies.removeConsent();
        }
      }
      scope.showCookies = function () {
        var options = {
          templateUrl: "/rbs-website-trackers-ask-consent-modal.twig",
          windowClass: "",
          controller: "rbsWebsiteManageTrackersGdprModalCtrl",
          size: "lg",
          resolve: {
            cookiesCategories: function () {
              return scope.cookiesCategories;
            },
          },
        };
        ModalStack.open(options);
      };
      scope.selectAll = function () {
        try {
          var acceptedCookies = {};
          var categories = scope.cookiesCategories;
          for (var i = 0; i < categories.length; i++) {
            acceptedCookies[categories[i].id] = true;
          }
          setConsent(acceptedCookies, "all", "banner");
        } catch (e) {
          console.error(e);
        }
      };
      scope.deselectAll = function () {
        try {
          var acceptedCookies = {};
          var categories = scope.cookiesCategories;
          for (var i = 0; i < categories.length; i++) {
            acceptedCookies[categories[i].id] =
              categories[i].readOnly === "true";
          }
          setConsent(acceptedCookies, "none", "banner");
        } catch (e) {
          console.error(e);
        }
      };
      function setConsent(acceptedCookies, consentMode, consentSource) {
        scope.running = true;
        Cookies.setConsent(acceptedCookies, consentMode, consentSource).then(
          function () {
            scope.running = false;
            keepInformationConsent();
          },
          function (response) {
            scope.running = false;
            if (response.status === 429) {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-too-many-requests-modal.twig",
              });
            } else {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-ask-consent-error-modal.twig",
              });
            }
            keepInformationConsent();
          },
        );
      }
      rootScope.$on("RbsWebsiteCookies:set", function () {
        scope.hideConsent = true;
      });
    },
  ]);
  app.controller("rbsWebsiteManageTrackersGdprModalCtrl", [
    "$scope",
    "$rootScope",
    "RbsChange.Cookies",
    "RbsChange.ModalStack",
    "cookiesCategories",
    function (scope, rootScope, Cookies, ModalStack, cookiesCategories) {
      scope.acceptedCookies = {};
      scope.running = false;
      var listCookies = Cookies.getConsent().acceptedCookies || {};
      setDefaultAcceptedCookies(true);
      scope.selectAll = function () {
        angular.forEach(scope.acceptedCookies, function (value, cookie) {
          scope.acceptedCookies[cookie] = true;
        });
        scope.validate("all");
      };
      scope.deselectAll = function () {
        setDefaultAcceptedCookies(false);
        scope.validate("none");
      };
      scope.validate = function (mode) {
        scope.running = true;
        Cookies.setConsent(
          scope.acceptedCookies,
          mode || "custom",
          "modal",
        ).then(
          function () {
            scope.$dismiss();
            scope.running = false;
            keepInformationConsent();
          },
          function (response) {
            scope.running = false;
            if (response.status === 429) {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-too-many-requests-modal.twig",
              });
            } else {
              ModalStack.open({
                controller: "RbsMinimalModal",
                templateUrl:
                  "/rbs-website-trackers-ask-consent-error-modal.twig",
              });
            }
            keepInformationConsent();
          },
        );
      };
      function setDefaultAcceptedCookies(keepExisting) {
        for (var i = 0; i < cookiesCategories.length; i++) {
          var _id = cookiesCategories[i].id;
          var readOnlyCookieCategory = cookiesCategories[i].readOnly === "true";
          scope.acceptedCookies[_id] =
            typeof listCookies[_id] === "boolean" && keepExisting
              ? listCookies[_id]
              : readOnlyCookieCategory;
        }
      }
      $("body").on("click", ".trackersModalCollapseIcon", function () {
        $($(this).data("icon")).toggleClass("dropup");
      });
    },
  ]);
})();
