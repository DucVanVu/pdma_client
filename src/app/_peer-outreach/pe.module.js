(function () {
    'use strict';

    PDMA.PeerOutreach = angular.module('PDMA.PeerOutreach', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.PeerOutreach.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.peer_outreach', {
                url: '/prevention/pe',
                templateUrl: '_peer-outreach/views/index.html',
                data: {pageTitle: 'Tiếp cận cộng đồng'},
                controller: 'PEIndexController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PeerOutreach',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_peer-outreach/controllers/PEIndexController.js',
                                '_peer-outreach/business/PEIndexService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pe_add', {
                url: '/prevention/pe-add',
                templateUrl: '_peer-outreach/views/edit.html',
                data: {pageTitle: 'Tiếp cận cộng đồng - Thêm mới'},
                controller: 'PEEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PeerOutreach-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_peer-outreach/controllers/PEEditController.js',
                                '_peer-outreach/business/PEEditService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pe_edit', {
                url: '/prevention/pe-edit/:id',
                templateUrl: '_peer-outreach/views/edit.html',
                data: {pageTitle: 'Tiếp cận cộng đồng - Cập nhật'},
                controller: 'PEEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PeerOutreach-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_peer-outreach/controllers/PEEditController.js',
                                '_peer-outreach/business/PEEditService.js',
                            ]
                        });
                    }]
                }
            })
            .state('application.pe_add_contact', {
                url: '/prevention/pe-add-contact/:peId',
                templateUrl: '_peer-outreach/views/edit.html',
                data: {pageTitle: 'Tiếp cận cộng đồng - Thêm thông tin bạn tình-bạn chích'},
                controller: 'PEEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.PeerOutreach-ADD',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_peer-outreach/controllers/PEEditController.js',
                                '_peer-outreach/business/PEEditService.js',
                            ]
                        });
                    }]
                }
            });;
    }]);

})();