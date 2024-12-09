(function () {
  let app = angular.module("RbsChangeApp");
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsUserShortAccountDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.logout = function () {
                AjaxAPI.getData("Rbs/User/Logout").then(
                  function () {
                    window.location = window.location.origin;
                  },
                  function (result) {
                    scope.error = result.data.message;
                  },
                );
              };
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
  app.filter("validMonths", function () {
    return function (months, year) {
      var filtered = [];
      if (months) filtered.push(months[0]);
      var now = new Date();
      var over18Month = now.getUTCMonth() + 1;
      var over18Year = now.getUTCFullYear() - 18;
      if (!year) {
        return [];
      }
      if (year.value != "Année") {
        if (year.value == over18Year) {
          angular.forEach(months, function (month) {
            if (month.name != "Mois" && month.id <= over18Month) {
              filtered.push(month);
            }
          });
        } else {
          angular.forEach(months, function (month) {
            if (month.name != "Mois") {
              filtered.push(month);
            }
          });
        }
      }
      return filtered;
    };
  });
  app.filter("daysInMonth", function () {
    return function (days, year, month) {
      var filtered = [];
      if (days) filtered.push(days[0]);
      angular.forEach(days, function (day) {
        if (month.name != "Mois") {
          if (
            month.id == 1 ||
            month.id == 3 ||
            month.id == 5 ||
            month.id == 7 ||
            month.id == 8 ||
            month.id == 10 ||
            month.id == 12
          ) {
            filtered.push(day);
          } else if (
            (month.id == 4 ||
              month.id == 6 ||
              month.id == 9 ||
              month.id == 11) &&
            day.value <= 30
          ) {
            filtered.push(day);
          } else if (month.id == 2) {
            if (year.value % 4 == 0 && day.value <= 29) {
              filtered.push(day);
            } else if (day.value <= 28) {
              filtered.push(day);
            }
          }
        }
      });
      return filtered;
    };
  });
  app.filter("validDays", function () {
    return function (days, year, month) {
      var filtered = [];
      if (days) filtered.push(days[0]);
      var now = new Date();
      var over18Day = now.getUTCDate();
      var over18Month = now.getUTCMonth() + 1;
      var over18Year = now.getUTCFullYear() - 18;
      if (!year) {
        return [];
      }
      if (year.value == over18Year && month.id == over18Month) {
        angular.forEach(days, function (day) {
          if (day.value != "Jour" && day.value <= over18Day) {
            filtered.push(day);
          }
        });
      } else {
        angular.forEach(days, function (day) {
          if (day.value != "Jour") {
            filtered.push(day);
          }
        });
      }
      return filtered;
    };
  });
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsUserCreateAccountDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.allowedOptins = [
                {
                  name: "fan_deco",
                  id: "fan_deco",
                  model: "profiles.centre_interet.fan_deco",
                  i18n: "t.project.stokomani.front.user_create_account_interest_fan_deco",
                },
                {
                  name: "fan_bons_plan_economies_promos",
                  id: "fan_bons_plan_economies_promos",
                  model:
                    "profiles.centre_interet.fan_bons_plan_economies_promos",
                  i18n: "t.project.stokomani.front.user_create_account_interest_fan_bons_plan_economies_promos",
                },
                {
                  name: "fan_shopping",
                  id: "fan_shopping",
                  model: "profiles.centre_interet.fan_shopping",
                  i18n: "t.project.stokomani.front.user_create_account_interest_fan_shopping",
                },
                {
                  name: "fan_mode",
                  id: "fan_mode",
                  model: "profiles.centre_interet.fan_mode",
                  i18n: "t.project.stokomani.front.user_create_account_interest_fan_mode",
                },
                {
                  name: "fan_beaute",
                  id: "fan_beaute",
                  model: "profiles.centre_interet.fan_beaute",
                  i18n: "t.project.stokomani.front.user_create_account_interest_fan_beaute",
                },
              ];
              scope.allowedTitles.sort(function (a, b) {
                if (a.title < b.title) {
                  return -1;
                }
                if (a.title > b.title) {
                  return 1;
                }
                return 0;
              });
              scope.radioChange = function (event) {};
              scope.togglePassword = function (event) {
                console.log(event);
                target = event.target;
                elem = target.previousElementSibling;
                if (elem) {
                  if (elem.type == "password") {
                    elem.type = "text";
                  } else {
                    elem.type = "password";
                  }
                }
              };
              scope.checkOptinSMS = function (optin_title) {
                if (!scope.mailingLists) {
                  return false;
                }
                if (scope.data.optsIn) {
                  for (const [key, value] of Object.entries(
                    scope.data.optsIn,
                  )) {
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
              for (
                var i = d.getFullYear() - 18;
                i > d.getFullYear() - 100;
                i--
              ) {
                scope.years.push({ value: i, disabled: false });
              }
              scope.year = scope.years[0];
              scope.month = scope.months[0];
              scope.day = scope.days[0];
              scope.updateDate = function (input) {
                if (!scope.profiles.Rbs_User) {
                  scope.profiles.Rbs_User = {};
                }
                scope.profiles.Rbs_User.birthDate = null;
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
                  temp_date = new Date(
                    scope.year.value,
                    scope.month.id - 1,
                    scope.day.value,
                  );
                  temp_date.setHours(0, -temp_date.getTimezoneOffset(), 0, 0);
                  scope.profiles.Rbs_User.birthDate = temp_date.toISOString();
                }
              };
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsUserLoginDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        function ($delegate, AjaxAPI) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.togglePassword = function (event) {
                target = event.target;
                elem = target.previousElementSibling;
                if (elem) {
                  if (elem.type == "password") {
                    elem.type = "text";
                  } else {
                    elem.type = "password";
                  }
                }
              };
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
  app.config([
    "$provide",
    function ($provide) {
      $provide.decorator("rbsUserAccountDirective", [
        "$delegate",
        "RbsChange.AjaxAPI",
        "$rootScope",
        function ($delegate, AjaxAPI, $rootScope) {
          var directive = $delegate[0];
          var link = directive.link;
          directive.compile = function () {
            return function (scope, elem, attrs) {
              link.apply($delegate[0], arguments);
              scope.dataData = { year: null, month: null, day: null };
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
              for (
                var i = d.getFullYear() - 18;
                i > d.getFullYear() - 100;
                i--
              ) {
                scope.years.push({ value: i, disabled: false });
              }
              scope.year = scope.years[0];
              scope.month = scope.months[0];
              scope.day = scope.days[0];
              scope.dataData.year = scope.years[0];
              scope.dataData.month = scope.months[0];
              scope.dataData.day = scope.days[0];
              scope.updateDate = function (input) {
                scope.day = scope.dataData.day;
                scope.month = scope.dataData.month;
                scope.year = scope.dataData.year;
                if (!scope.profiles.Rbs_User) {
                  scope.profiles.Rbs_User = {};
                }
                scope.profiles.Rbs_User.birthDate = null;
                if (input == "year") {
                  scope.month = scope.months[0];
                  scope.day = scope.days[0];
                  scope.dataData.month = scope.months[0];
                  scope.dataData.day = scope.days[0];
                } else if (input == "month") {
                  scope.day = scope.days[0];
                  scope.dataData.day = scope.days[0];
                }
                if (
                  scope.year &&
                  scope.month &&
                  scope.day &&
                  scope.year.value != "Année" &&
                  scope.month.name != "Mois" &&
                  scope.day.value != "Jour"
                ) {
                  temp_date = new Date(
                    scope.year.value,
                    scope.month.id - 1,
                    scope.day.value,
                  );
                  temp_date.setHours(0, -temp_date.getTimezoneOffset(), 0, 0);
                  scope.profiles.Rbs_User.birthDate = temp_date.toISOString();
                } else {
                }
              };
              scope.openEdit = function () {
                scope.success = false;
                scope.readonly = false;
                scope.dataBackup = angular.copy(scope.data);
                if (!scope.profiles.Rbs_User) {
                  scope.profiles.Rbs_User = {};
                }
                if (scope.profiles.Rbs_User.birthDate) {
                  var current_birthDate_timestamp = Date.parse(
                    scope.profiles.Rbs_User.birthDate,
                  );
                  var current_birthDate = new Date(current_birthDate_timestamp);
                  scope.dataData.year =
                    scope.years[
                      d.getFullYear() -
                        18 -
                        current_birthDate.getUTCFullYear() +
                        1
                    ];
                  scope.updateDate("year");
                  scope.dataData.month =
                    scope.months[current_birthDate.getUTCMonth() + 1];
                  scope.updateDate("month");
                  scope.dataData.day =
                    scope.days[current_birthDate.getUTCDate()];
                  scope.updateDate("day");
                }
              };
            };
          };
          return $delegate;
        },
      ]);
    },
  ]);
})();
