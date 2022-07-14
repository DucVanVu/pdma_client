(function () {
    'use strict';

    PDMA.Common = angular.module('PDMA.Common', [
        'ui.router',
        'oc.lazyLoad',
        'toastr',
        'ngCookies',
        'blockUI'
    ]);

    PDMA.Common.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // Login page
            .state('login', {
                url: '/login',
                templateUrl: 'common/views/login/login.html',
                data: {pageTitle: 'Đăng nhập'},
                controller: 'LoginController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Common',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'common/controllers/LoginController.js',
                                'common/business/LoginService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();