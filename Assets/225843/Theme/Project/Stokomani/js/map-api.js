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
        return "http://maps.google.cn/maps/api/js?";
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
      query.push("region=FR");
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
      link.href =
        assetBasePath + "Theme/Rbs/Base/lib/leaflet-1.7.1/leaflet.css";
      link.media = "all";
      document.head.appendChild(link);
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.onload = options.callback;
      script.src =
        assetBasePath + "Theme/Rbs/Base/lib/leaflet-1.7.1/leaflet.js";
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
