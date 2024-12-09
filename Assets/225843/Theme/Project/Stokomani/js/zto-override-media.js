(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsMediaSliderVisualsDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elm, attrs) {
              link.apply($delegate[0], arguments);
              var carouselElm = elm.find(".carousel");
              scope.$watch("mediaVisuals", function (visuals) {
                if (
                  scope.lastVisualsLength &&
                  visuals.length < scope.lastVisualsLength
                ) {
                  scope.goTo(0);
                }
                scope.lastVisualsLength = visuals.length;
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
                if (
                  angular.isArray(scope.visuals) &&
                  scope.visuals.length > 1
                ) {
                  scope.ngClasses.main["media-slider-visuals-multiple"] = true;
                } else {
                  scope.ngClasses.main["media-slider-visuals-single"] = true;
                }
                scope.ngClasses.main[
                  "media-slider-visuals-format-" + scope.visualFormat
                ] = true;
              });
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
