/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Common').controller('LoginController', LoginController);

    LoginController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$cookies',
        '$http',
        '$location',
        'settings',
        'constants',
        'LoginService',
        'toastr',
        'focus',
        'blockUI',
        '$uibModal'
    ];

    function LoginController($rootScope, $scope, $state, $cookies, $http, $location, settings, constants, service, toastr, focus, blockUI, modal) {
        let vm = this;

        blockUI.stop();

        // -------------
        // notice start
        // -------------
        vm.showNewVersion = true;
        vm.countDisplay = parseFloat(localStorage.getItem('_new_version_display'));
        if (isNaN(vm.countDisplay)) {
            vm.countDisplay = 0;
        }

        vm.countDisplay += 1;
        if (vm.countDisplay >= 5) {
            vm.showNewVersion = false;
        } else {
            localStorage.setItem('_new_version_display', vm.countDisplay.toString());
        }
        // -------------
        // notice end
        // -------------

        vm.user = {};
        vm.currentYear = new Date().getFullYear();

        vm.login = function () {

            // Username?
            if (!vm.user.username || vm.user.username.trim() == '') {
                toastr.error('Vui lòng nhập tên đăng nhập.', 'Thông báo');
                focus('username');
                return;
            }

            // Password?
            if (!vm.user.password || vm.user.password.trim() == '') {
                toastr.error('Vui lòng nhập mật khẩu.', 'Thông báo');
                focus('password');
                return;
            }

            blockUI.start();

            service.performLogin(vm.user).then(function (response) {
                if (response && angular.isObject(response.data)) {

                    $http.get(settings.api.baseUrl + 'api/v1/user/current').success(function (response, status, headers, config) {
                        $rootScope.currentUser = response;
                        $cookies.putObject(constants.cookies_user, $rootScope.currentUser);

                        blockUI.stop();
                        if ($rootScope.previousPage) {
                            $location.url($rootScope.previousPage);
                        } else {
                            $state.go('application.dashboard');
                        }
                    });
                } else {
                    blockUI.stop();
                    toastr.error('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.', 'Thông báo');
                }
            }).catch(function () {
                blockUI.stop();
            });
        };

        // Focus on username field
        focus('username');

        /**
         * Registration
         */
        vm.registration = function () {
            modal.open({
                animation: true,
                templateUrl: 'request-account-modal.html',
                scope: $scope,
                size: 'md'
            });
        };

        /**
         * Forgot password
         */
        vm.forgotPassword = function () {
            modal.open({
                animation: true,
                templateUrl: 'forgot-password-modal.html',
                scope: $scope,
                size: 'md'
            });
        };
    }

})();