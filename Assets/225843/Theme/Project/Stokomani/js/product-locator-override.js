(function () {
  "use strict";
  var app = angular.module("RbsChangeApp");
  var cfg = window.__change.Rbs_Geo_Config;
  var useGoogleMap = !!(
    cfg &&
    cfg.Google &&
    (cfg.Google.client || cfg.Google.APIKey)
  );
  app.directive("rbsStoreshippingProductLocatorOverride", [
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
                  {
                    types: ["geocode"],
                    ComponentRestrictions: { country: ["fr", "ch"] },
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
