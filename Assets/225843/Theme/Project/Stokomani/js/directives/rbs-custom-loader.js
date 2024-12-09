(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("customRbsLoading", function () {
    return {
      restrict: "A",
      templateUrl: "/rbs-custom-loader.twig",
      link: function (scope) {},
    };
  });
})(jQuery);
