(function () {

    'use strict';

    let PDMA = angular.module('PDMA');

    /* OAuth2 configuration */
    PDMA.config(['OAuthProvider', 'OAuthTokenProvider', 'constants', function (OAuthProvider, OAuthTokenProvider, constants) {

        OAuthProvider.configure({
            baseUrl: PDMA.API_SERVER_URL,
            clientId: PDMA.API_CLIENT_ID,
            clientSecret: PDMA.API_CLIENT_KEY,
            grantPath: '/oauth/token',
            revokePath: '/oauth/logout'
        });

        OAuthTokenProvider.configure({
            name: constants.oauth2_token,
            options: {
                secure: false
            }
        });
    }]);

    PDMA.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|ftp|blob):|data:image\//); // prevent being marked as unsafe by angular
    }]);

    /* Block UI configuration */
    PDMA.config(['blockUIConfig', function (blockUIConfig) {

        // Change the default overlay message
        blockUIConfig.message = 'Vui lòng chờ...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 10;
        blockUIConfig.autoBlock = false;

    }]);

    PDMA.config(['timeAgoSettings', function (timeAgoSettings) {
        timeAgoSettings.allowFuture = true;
        timeAgoSettings.overrideLang = 'vi_VN';
    }]);

    /* Ng-Idle configuration*/
    PDMA.config(['IdleProvider', 'KeepaliveProvider', function (IdleProvider, KeepaliveProvider) {
        IdleProvider.idle(3600); // in seconds
        IdleProvider.timeout(10); // in seconds

        KeepaliveProvider.interval(60); // heartbeat every 1 min
        KeepaliveProvider.http(PDMA.API_SERVER_URL + PDMA.API_V1 + 'user/heartbeat'); // URL that makes sure session is alive
    }]);

    /* Toastr configuration */
    PDMA.config(['toastrConfig', function (toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: true,
            closeButton: true,
            containerId: 'toast-container',
            maxOpened: 0,
            newestOnTop: true,
            positionClass: 'toast-top-right',
            progressBar: true,
            preventDuplicates: false,
            preventOpenDuplicates: true,
            target: 'body',
            timeOut: 8000,
            showEasing: 'swing',
            hideEasing: 'linear',
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'
        });
    }]);

    /* HTTP Provider configuration */
    PDMA.config(['$httpProvider', function ($httpProvider) {
        // $httpProvider.defaults.withCredentials = true;
        // $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
        // $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
        // $httpProvider.defaults.useXDomain = true;
        //
        // $httpProvider.interceptors.push('XSRFInterceptor');
        $httpProvider.interceptors.push('ServerExceptionHandlerInterceptor');
    }]);

    /* Location provider */
    PDMA.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(false);
    }]);

    /* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
    PDMA.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            // global configs go here
        });
    }]);

    /* AngularJS v1.3.x workaround for old style controller declarition in HTML */
    PDMA.config(['$controllerProvider', function ($controllerProvider) {
    }]);

    PDMA.config(['$urlRouterProvider', '$stateProvider', 'constants',
        function ($urlRouterProvider, $stateProvider, constants) {
            // Redirect any unmatched url

            // Member area
            $stateProvider.state('application', {
                templateUrl: 'common/views/application.html',
                abstract: true
            });

            // Guest area
            $urlRouterProvider.otherwise(function (a, b) {
                let $injector = a, $location = b; // To support for minification

                let $cookies = $injector.get('$cookies');
                let user = $cookies.getObject(constants.cookies_user);

                if (user) {
                    // $location.path('/dashboard');
                    if (user.opcAssistOnly) {
                        $location.path('/dashboard');
                    } else if (user.pnsOnly) {
                        $location.path('/pns-assess');
                    } else {
                        $location.path('/dashboard');
                    }
                } else {
                    $location.path('/login');
                }
            });
        }
    ]);
})();