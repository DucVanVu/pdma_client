(function () {
    'use strict';

    PDMA.Dictionary = angular.module('PDMA.Dictionary', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'ui.select',
        'ui.sortable',

        'PDMA.Common'
    ]);

    PDMA.Dictionary.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // Services
            .state('application.dictionary_services', {
                url: '/dictionary/services',
                templateUrl: 'dictionaries/views/services.html',
                data: {pageTitle: 'Từ điển dữ liệu - Dịch vụ'},
                controller: 'ServiceController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/ServiceController.js',
                                'dictionaries/business/ServiceService.js'
                            ]
                        });
                    }]
                }
            })

            // Regimens
            .state('application.dictionary_regimens', {
                url: '/dictionary/regimens',
                templateUrl: 'dictionaries/views/regimens.html',
                data: {pageTitle: 'Từ điển dữ liệu - Phác đồ thuốc'},
                controller: 'RegimenController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/RegimenController.js',
                                'dictionaries/business/RegimenService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            // Admin Unit Editable
            .state('application.dictionary_adminunitedittable', {
                url: '/dictionary/admin-unit-edit-table',
                templateUrl: 'dictionaries/views/admin_unit_edit_table.html',
                data: {pageTitle: 'Từ điển dữ liệu - Quản lý đơn vị hành chính'},
                controller: 'AdminUnitEditTableController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/AdminUnitEditTableController.js',
                                'dictionaries/business/AdminUnitEditTableService.js'
                            ]
                        });
                    }]
                }
            })
            
            // Admin Unit
            .state('application.dictionary_adminunits', {
                url: '/dictionary/admin-units',
                templateUrl: 'dictionaries/views/admin-units.html',
                data: {pageTitle: 'Từ điển dữ liệu - Đơn vị hành chính'},
                controller: 'AdminUnitController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/AdminUnitController.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })

            // Organization
            .state('application.dictionary_organizations', {
                url: '/dictionary/organizations',
                templateUrl: 'dictionaries/views/organizations.html',
                data: {pageTitle: 'Từ điển dữ liệu - Cơ sở y tế'},
                controller: 'OrganizationController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/OrganizationController.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/ServiceService.js'
                            ]
                        });
                    }]
                }
            })

            // Dictionary - HIV Confirm Labs
            .state('application.dictionary_hivconfirmlabs', {
                url: '/dictionary/hiv-confirm-labs',
                templateUrl: 'dictionaries/views/hivconfirmlabs.html',
                data: {pageTitle: 'Từ điển dữ liệu - Phòng xét nghiệm khẳng định HIV'},
                controller: 'HIVConfirmLabController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/HIVConfirmLabController.js',
                                'dictionaries/business/HIVConfirmLabService.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })

            // Dictionary entries
            .state('application.dictionary_entries', {
                url: '/dictionary/entries',
                templateUrl: 'dictionaries/views/dictionary_entries.html',
                data: {pageTitle: 'Từ điển dữ liệu - Dữ liệu danh sách khác'},
                controller: 'DictionaryController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/DictionaryController.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            // Document types
            .state('application.dictionary_doctypes', {
                url: '/dictionary/doc-types',
                templateUrl: 'dictionaries/views/doc_types.html',
                data: {pageTitle: 'Từ điển dữ liệu - Loại tài liệu'},
                controller: 'DocumentTypeController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/DocumentTypeController.js',
                                'dictionaries/business/DocumentTypeService.js'
                            ]
                        });
                    }]
                }
            })

            // Staff
            .state('application.dictionary_staff', {
                url: '/dictionary/staff',
                templateUrl: 'dictionaries/views/staff.html',
                data: {pageTitle: 'Từ điển dữ liệu - Cán bộ y tế'},
                controller: 'StaffController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Dictionary',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'dictionaries/controllers/StaffController.js',
                                'dictionaries/business/StaffService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/OrganizationService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();