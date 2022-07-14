(function () {
    'use strict';

    PDMA.SNS = angular.module('PDMA.SNS', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'textAngular',
        'ui.select',
        'treeGrid',
        'PDMA.Common'
    ]);

    PDMA.SNS.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.sns', {
                url: '/prevention/sns',
                templateUrl: 'sns/views/index.html',
                data: {pageTitle: 'Sổ khách hàng SNS'},
                controller: 'SNSController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'sns/controllers/SNSController.js',
                                'sns/business/SNSService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.sns_summary', {
                url: '/prevention/sns_summary',
                templateUrl: 'sns/views/summary.html',
                data: {pageTitle: 'Tổng quan sổ khách hàng SNS'},
                controller: 'SNSSummaryController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SNS_Summary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'sns/controllers/SNSSummaryController.js',
                                'sns/business/SNSService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.sns_report', {
                url: '/prevention/sns_report',
                templateUrl: 'sns/views/report.html',
                data: {pageTitle: 'Báo cáo SNS'},
                controller: 'SNSReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SNS_Report',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'sns/controllers/SNSReportController.js',
                                'sns/business/SNSService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.sns-add', {
                url: '/prevention/sns-add',
                templateUrl: 'sns/views/edit-sns.html',
                data: {pageTitle: 'Thêm mới thông tin khách hàng'},
                controller: 'SNSEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'sns/controllers/SNSEditController.js',
                                'sns/business/SNSService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.sns-edit', {
                url: '/prevention/sns-edit/:id',
                templateUrl: 'sns/views/edit-sns.html',
                data: {pageTitle: 'Sửa thông tin khách hàng'},
                controller: 'SNSEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'sns/controllers/SNSEditController.js',
                                'sns/business/SNSService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();