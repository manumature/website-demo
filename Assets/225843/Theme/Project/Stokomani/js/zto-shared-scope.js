(function () {
  let app = angular.module("RbsChangeApp");
  app.provider("ZtoSharedScope", function ZtoSharedScopeProvider() {
    this.$get = function () {
      const sharedValues = {};
      function initPoolFrom(from) {
        if (!sharedValues[from]) sharedValues[from] = {};
      }
      return {
        set: (from, key, value) => {
          initPoolFrom(from);
          sharedValues[from][key] = value;
        },
        get: (from, key) => {
          if (sharedValues[from]) {
            return sharedValues[from][key];
          } else {
            return undefined;
          }
        },
      };
    };
  });
})();
