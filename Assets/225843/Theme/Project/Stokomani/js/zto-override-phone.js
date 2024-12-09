(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("RbsGeo.PhoneService", [
        "$delegate",
        "$rootScope",
        "$q",
        "RbsChange.AjaxAPI",
        function ($delegate, $rootScope, $q, AjaxAPI) {
          var parsedPhoneNumbers = {};
          $delegate.parseNumber = function parseNumber(
            phoneNumber,
            regionCode,
          ) {
            var deferred = $q.defer();
            if (!angular.isString(phoneNumber) || phoneNumber.length === 0) {
              deferred.resolve(null);
            } else if (phoneNumber.length < 5 || !regionCode) {
              deferred.reject("Too short number");
            } else if (
              !angular.isString(regionCode) ||
              regionCode.length != 2
            ) {
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
                    if (common.type === "UNKNOWN") {
                      deferred.reject("Invalid number");
                    } else {
                      deferred.resolve(common);
                    }
                  },
                  function () {
                    parsedPhoneNumbers[key] = false;
                    deferred.reject("Invalid number");
                  },
                );
              }
            }
            return deferred.promise;
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
