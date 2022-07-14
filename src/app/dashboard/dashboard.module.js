(function () {
    'use strict';

    PDMA.Dashboard = angular.module('PDMA.Dashboard', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.Dashboard.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // Dashboard
            .state('application.dashboard', {
                url: '/dashboard',
                templateUrl: 'dashboard/views/general.html',
                data: {pageTitle: 'Dashboard'},
                controller: 'DashboardController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dashboard',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dashboard/controllers/DashboardController.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();