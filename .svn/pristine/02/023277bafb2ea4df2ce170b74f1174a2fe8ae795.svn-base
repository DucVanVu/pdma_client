(function () {
    'use strict';

    PDMA.PNS = angular.module('PDMA.PNS', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.PNS.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.pns', {
                url: '/prevention/pns',
                templateUrl: '_index_testing/views/index.html',
                data: {pageTitle: 'Thông báo XN BT/BC'},
                controller: 'PnsListingController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsListingController.js',
                                '_index_testing/business/PnsIndexService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pns_add', {
                url: '/prevention/pns-add/:type/:mapId',
                templateUrl: '_index_testing/views/edit.html',
                data: {pageTitle: 'Thông báo XN BT/BC'},
                controller: 'PnsEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsEditController.js',
                                '_index_testing/business/PnsEditService.js',
                                '_treatment/business/PatientService.js',
                                '_testing-counselling/business/HtsEditService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pns_edit', {
                url: '/prevention/pns-edit/:id',
                templateUrl: '_index_testing/views/edit.html',
                data: {pageTitle: 'Thông báo XN BT/BC'},
                controller: 'PnsEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS-EDIT',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsEditController.js',
                                '_index_testing/business/PnsEditService.js',
                                '_treatment/business/PatientService.js',
                                '_testing-counselling/business/HtsEditService.js'
                            ]
                        });
                    }]
                }
            })
            .state('application.pns_add_contact', {
                url: '/prevention/pns-add-contact/:pnsId',
                templateUrl: '_index_testing/views/pns_edit_contact.html',
                data: {pageTitle: 'Thông báo XN BT/BC'},
                controller: 'PnsEditContactController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsEditContactController.js',
                                '_index_testing/business/PnsEditContactService.js',
                                '_treatment/business/PatientService.js',
                                '_testing-counselling/business/HtsEditService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pns_edit_contact', {
                url: '/prevention/pns-edit-contact/:id',
                templateUrl: '_index_testing/views/pns_edit_contact.html',
                data: {pageTitle: 'Thông báo XN BT/BC'},
                controller: 'PnsEditContactController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS-EDIT',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsEditContactController.js',
                                '_index_testing/business/PnsEditContactService.js',
                                '_treatment/business/PatientService.js',
                                '_testing-counselling/business/HtsEditService.js'
                            ]
                        });
                    }]
                }
            })
            .state('application.pns_report', {
                url: '/prevention/pns-report',
                templateUrl: '_index_testing/views/report.html',
                data: {pageTitle: 'Thông báo XN BT/BC - Báo cáo'},
                controller: 'ReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS-REPORT',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_index_testing/controllers/PnsReportController.js',
                                '_index_testing/business/PnsIndexService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();