(function () {
    'use strict';

    PDMA.HTS = angular.module('PDMA.HTS', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.HTS.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.hts', {
                url: '/prevention/hts',
                templateUrl: '_testing-counselling/views/index.html',
                data: {pageTitle: 'Tư vấn - xét nghiệm HIV'},
                controller: 'HtsListingController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.HTS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_testing-counselling/controllers/HtsListingController.js',
                                '_testing-counselling/business/HtsIndexService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.hts_map', {
                url: '/prevention/hts/:type/:key',
                templateUrl: '_testing-counselling/views/index.html',
                data: {pageTitle: 'Tư vấn - xét nghiệm HIV'},
                controller: 'HtsListingController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.HTS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_testing-counselling/controllers/HtsListingController.js',
                                '_testing-counselling/business/HtsIndexService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.hts_add', {
                url: '/prevention/hts-add',
                templateUrl: '_testing-counselling/views/edit.html',
                data: {pageTitle: 'Tư vấn - xét nghiệm HIV - Thêm mới'},
                controller: 'HtsEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.HTS-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_testing-counselling/controllers/HtsEditController.js',
                                '_testing-counselling/business/HtsEditService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.hts_edit', {
                url: '/prevention/hts-edit/:id',
                templateUrl: '_testing-counselling/views/edit.html',
                data: {pageTitle: 'Tư vấn - xét nghiệm HIV - Thêm mới'},
                controller: 'HtsEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.HTS-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_testing-counselling/controllers/HtsEditController.js',
                                '_testing-counselling/business/HtsEditService.js',
                            ]
                        });
                    }]
                }
            })
            // .state('application.hts_report', {
            //     url: '/prevention/hts-report',
            //     templateUrl: '_testing-counselling/views/report.html',
            //     data: {pageTitle: 'Tư vấn - xét nghiệm HIV - Báo cáo'},
            //     controller: 'ReportController as vm',
            //     resolve: {
            //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load({
            //                 name: 'PDMA.HTS-REPORT',
            //                 insertBefore: '#ng_load_plugins_before',
            //                 files: [
            //                     '_testing-counselling/controllers/ReportController.js',
            //                     '_testing-counselling/business/HtsIndexService.js',
            //                 ]
            //             });
            //         }]
            //     }
            // })
            ;
    }]);

})();