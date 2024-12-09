(function (jQuery) {
  var app = angular.module("RbsChangeApp");
  app.directive("ztoNewsletterBtn", [
    "$window",
    "$rootScope",
    function ($window, $rootScope) {
      return {
        restrict: "A",
        templateUrl: "/zto-newsletter-btn.twig",
        link: function (scope, el, attrs) {
          scope.data = {
            titre: scope.blockParameters?.titre || "inscrivez-vous",
            sousTitre:
              scope.blockParameters?.sousTitre || "à notre newsletter !",
            phrase: scope.blockParameters?.phrase || "10€ offerts",
            phrase2:
              scope.blockParameters?.phrase2 || "lors de votre prochain achat",
            libelle: scope.blockParameters?.libelle || "je m'inscris",
          };
          scope.data.email = "";
          scope.ztoTemplate = attrs["ztoTemplate"];
          scope.submit = function () {
            localStorage.setItem("zto_newsletter_email", scope.data.email);
            location.href = "/newsletter.html";
          };
        },
      };
    },
  ]);
})(jQuery, window.localStorage);
