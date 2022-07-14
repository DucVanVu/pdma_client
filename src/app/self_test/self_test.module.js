(function () {
    'use strict';

    PDMA.SNS = angular.module('PDMA.SELF_TEST', [
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

            // Listing
            .state('application.self_test', {
                url: '/prevention/self_test',
                templateUrl: 'self_test/views/listing.html',
                data: {pageTitle: 'Thông tin chung'},
                controller: 'SelfTestController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SELF_TEST',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'self_test/controllers/SelfTestController.js',
                                'self_test/business/SelfTestService.js',
                            ]
                        });
                    }]
                }
            })

            .state('application.self_test_edit', {
                url: '/prevention/st_edit/:id',
                templateUrl: 'self_test/views/edit.html',
                data: {pageTitle: 'Tự xét nghiệm - cập nhật thông tin'},
                controller: 'SelfTestEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.SELF_TEST',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'self_test/controllers/SelfTestEditController.js',
                                'self_test/business/SelfTestService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/StaffService.js'
                            ]
                        });
                    }]
                }
            });
    }]);

})();