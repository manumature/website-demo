(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsUserShortAccountDirective", [
        "$delegate",
        "$rootScope",
        "RbsChange.AjaxAPI",
        "$window",
        "RbsChange.ResponsiveSummaries",
        function (
          $delegate,
          $rootScope,
          AjaxAPI,
          $window,
          ResponsiveSummaries,
        ) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              var blockId = scope.blockId;
              ResponsiveSummaries.registerItem(
                blockId,
                scope,
                '<div data-rbs-user-short-account-responsive-summary=""></div>',
              );
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
