(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("colorPrixBarrer", function () {
    return {
      scope: {},
      restrict: "A",
      templateUrl: "/color-prix-barrer.twig",
      link: function (scope, el, attrs) {
        const name = attrs.price;
        const hasColor = name.includes("#");
        if (hasColor) {
          scope.name = name.split("#")[0];
          scope.color = "#" + name.split("#")[1];
        } else {
          scope.name = name;
          scope.color = "#E00817";
        }
      },
    };
  });
})(jQuery);
