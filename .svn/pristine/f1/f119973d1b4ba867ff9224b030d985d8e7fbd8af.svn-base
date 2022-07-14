(function () {
    'use strict';

    PDMA.PNS = angular.module('PDMA.PNS', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'ngFileUpload',
        'textAngular',

        'PDMA.Common'
    ]);

    PDMA.PNS.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // PNS
            .state('application.pns_assessment', {
                url: '/pns-assess',
                templateUrl: 'pns/views/index.html',
                data: {pageTitle: 'PNS'},
                controller: 'PNSController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'pns/controllers/PNSController.js',
                                'pns/business/PNSService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.pns_assessment_edit', {
                url: '/pns-assess-edit/:id',
                templateUrl: 'pns/views/edit.html',
                data: {pageTitle: 'PNS'},
                controller: 'PNSEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'pns/controllers/PNSEditController.js',
                                'pns/business/PNSService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.pns_ae', {
                url: '/pns-ae',
                templateUrl: 'pns/views/pns-ae.html',
                data: {pageTitle: 'PNS'},
                controller: 'PNSAEController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'pns/controllers/PNSAEController.js',
                                'pns/business/PNSAEService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.pns_ae_edit', {
                url: '/pns-ae-edit/:id',
                templateUrl: 'pns/views/pns-ae-edit.html',
                data: {pageTitle: 'PNS'},
                controller: 'PNSAEEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PNS',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'pns/controllers/PNSAEEditController.js',
                                'pns/business/PNSAEService.js'
                            ]
                        });
                    }]
                }
            });
    }]);

})();