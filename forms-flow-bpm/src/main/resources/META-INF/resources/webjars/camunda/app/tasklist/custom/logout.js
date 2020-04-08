'use strict';
define('custom-logout', ['angular'], function (angular) {
    var customLogoutModule = angular.module('custom-logout', []).run(
        ['$rootScope', function ($rootScope) {

            $rootScope.$on('$viewContentLoaded', function (event) {
                // Get the HTML element of the header widget.
                var div = document.querySelector("[cam-widget-header]");

                // Get the only property on it, its key is jQuery<many numbers> and its value
                // contains the controller ($camWidgetHeaderController) and the isolated
                // Scope ($isolateScope). The logout function is defined in this scope.
                var jQueryKey = Object.getOwnPropertyNames(div)[0];
                var $isolateScope = div[jQueryKey]['$isolateScope'];
                $isolateScope.logout = function () {
                    // Do whatever you want to do on logout.
                    window.location.href = "logout"
                }

            })
        }]);
});