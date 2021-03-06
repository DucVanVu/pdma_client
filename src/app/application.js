(function () {
    'use strict';

    /* PDMA App */
    if (typeof window.PDMA == 'undefined') {
        let PDMA = angular.module('PDMA', [
            'ui.router',
            'ui.bootstrap',
            'oc.lazyLoad',
            'ngSanitize',
            'ngCookies',
            'angular-oauth2',
            'blockUI',
            'ngFileUpload',
            'uiCropper',
            'toastr',
            'ngIdle',
            'yaru22.angular-timeago',

            // Sub modules
            'PDMA.Common',
            'PDMA.Dashboard',
            'PDMA.Announcement',
            'PDMA.Dictionary',
            'PDMA.Document',
            'PDMA.Settings',
            'PDMA.User',
            'PDMA.Reporting',
            'PDMA.PeerOutreach',
            'PDMA.HTS',
            'PDMA.Treatment',
            'PDMA.PNS',
            'PDMA.UID',
            'PDMA.SNS',
            'PDMA.SELF_TEST',
            'PDMA.PREV_REPORT',
            'PDMA.PNS',
            'PDMA.Import'
        ]);

        window.PDMA = PDMA;

        // Disable logger?
        // console.log = function() {}
    }

    // PDMA.API_SERVER_URL = 'http://pdma.globits.net:8084/pdma/';
    // PDMA.HOST = window.location.hostname;
    // PDMA.PORT = '8084';
//    PDMA.protocol='http';
//    PDMA.PORT='8444';
//     PDMA.protocol='http';
//     PDMA.API_SERVER_URL = PDMA.protocol+'://'+PDMA.HOST+':'+PDMA.PORT+'/pdma/';
//     PDMA.API_SERVER_URL = 'http://demo.epic.org.vn:8444/pdma/';
//     PDMA.API_SERVER_URL = 'https://pdma.epic.org.vn:8443/pdma/';
    PDMA.API_SERVER_URL = 'http://localhost:8084/pdma/';
    PDMA.API_CLIENT_ID = 'pdma_client';
    PDMA.API_CLIENT_KEY = 'password';
    PDMA.API_V1 = 'api/v1/';

    /* Init global settings and run the app */
    PDMA.run(['$rootScope', 'settings', '$http', '$cookies', '$state', '$injector', 'constants', 'OAuth', 'blockUI', 'toastr', 'Idle', '$location',
        function ($rootScope, settings, $http, $cookies, $state, $injector, constants, OAuth, blockUI, toastr, Idle, $location) {
            $rootScope.$state = $state; // state to be accessed from view
            $rootScope.$settings = settings; // state to be accessed from view

            // Moment
            moment.locale(settings.locale);

            // Idle management
            if (OAuth.isAuthenticated()) {
                Idle.watch();
            }

            $rootScope.$on('IdleTimeout', function () {

                blockUI.stop();

                // Remove all cookies
                let cookies = $cookies.getAll();
                angular.forEach(cookies, function (v, k) {
                    $cookies.remove(k);
                });

                $state.go('login');
            });

            // oauth2...
            $rootScope.$on('oauth:error', function (event, rejection) {

                blockUI.stop();

                // Ignore `invalid_grant` error - should be catched on `LoginController`.
                if (angular.isDefined(rejection.data) && 'invalid_grant' === rejection.data.error) {
                    // Remove all cookies
                    let cookies = $cookies.getAll();
                    angular.forEach(cookies, function (v, k) {
                        $cookies.remove(k);
                    });

                    $state.go('login');

                    return;
                }

                // Refresh token when a `invalid_token` error occurs.
                if (angular.isDefined(rejection.data) && 'invalid_token' === rejection.data.error) {
                    return OAuth.getRefreshToken();
                }

                // Redirect to `/login` with the `error_reason`.
                $rootScope.$broadcast('$unauthorized', function (event, data) {
                });
                $state.go('login');
            });

            $rootScope.$on('$locationChangeStart', function () {
                let p = $location.url();
                if (p != '/login') {
                    $rootScope.previousPage = $location.url();
                }
            });

            $rootScope.$on('$locationChangeSuccess', function (event) {

                if (!OAuth.isAuthenticated()) {
                    $rootScope.$broadcast('$unauthorized', function (event, data) {
                    });
                    $state.go('login');
                }

                blockUI.start();
                $http.get(settings.api.baseUrl + settings.api.apiV1Url + 'user/current').success(function (response, status, headers, config) {
                    blockUI.stop();
                    if (response) {
                        $rootScope.$broadcast('$onCurrentUserData', response);

                        // Organizations assigned to the current user
                        blockUI.start();
                        $http.get(settings.api.baseUrl + settings.api.apiV1Url + 'user_org/list/' + response.id).success(function (response, status, headers, config) {
                            blockUI.stop();
                            if (response) {
                                $rootScope.$broadcast('$onOrganizationData', response);
                            }
                        }).error(function (response, status, headers, config) {
                            blockUI.stop();

                            // Remove all cookies
                            let cookies = $cookies.getAll();
                            angular.forEach(cookies, function (v, k) {
                                $cookies.remove(k);
                            });

                            $state.go('login');
                        });

                        // Redirecting to the dashboard upon first logging in
                        if ($state.current.name == 'login') {
                            if (response.opcAssistOnly) {
                                $state.go('application.dashboard');
                            } else if (response.pnsOnly) {
                                $state.go('application.pns_assessment');
                            } else {
                                $state.go('application.dashboard');
                            }
                        }
                    }
                }).error(function (response, status, headers, config) {
                    blockUI.stop();
                    $cookies.remove(constants.oauth2_token);
                    $state.go('login');
                });
            });
        }
    ]);

})(window);
