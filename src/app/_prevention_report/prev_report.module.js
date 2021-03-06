(function () {
    'use strict';

    PDMA.SNS = angular.module('PDMA.PREV_REPORT', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'textAngular',
        'ui.select',
        'PDMA.Common'
    ]);

    PDMA.SNS.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // Dashboard
            .state('application.prev_dashboard', {
                url: '/prevention/dashboard',
                templateUrl: '_prevention_report/views/dashboard.html',
                data: {pageTitle: 'Tổng hợp chương trình dự phòng'},
                controller: 'PrevDashboardController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PREV_REPORT',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_prevention_report/controllers/PrevDashboardController.js',
                                '_prevention_report/controllers/_Charts4DashboardController.js',
                                '_prevention_report/business/PrevDashboardService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.prev_report', {
                url: '/prevention/report',
                templateUrl: '_prevention_report/views/report.html',
                data: {pageTitle: 'Báo cáo chương trình dự phòng'},
                controller: 'PrevReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PREV_REPORT',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_prevention_report/controllers/PrevReportController.js',
                                '_prevention_report/business/PrevReportService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();