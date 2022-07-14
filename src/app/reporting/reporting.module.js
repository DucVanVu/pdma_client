(function () {
    'use strict';

    PDMA.Reporting = angular.module('PDMA.Reporting', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'angular-flatpickr',
        'hl.sticky',
        'ui.utils.masks',
        'countUpModule',
        'textAngular',

        'PDMA.Common'
    ]);

    PDMA.Reporting.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // General Settings
            .state('application.tx_reports', {
                url: '/reporting/treatment',
                templateUrl: 'reporting/views/report.html',
                data: {pageTitle: 'BÁO CÁO ĐIỀU TRỊ'},
                controller: 'RoutineReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/RoutineReportController.js',
                                'reporting/business/WeeklyReportingService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.routine_reports', {
                url: '/reporting/routine',
                templateUrl: 'reporting/views/routine.html',
                data: {pageTitle: 'Routine reporting...'},
                controller: 'RoutineReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/RoutineReportController.js',
                                'reporting/business/WeeklyReportingService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.custom_reports', {
                url: '/reporting/custom',
                templateUrl: 'reporting/views/custom.html',
                data: {pageTitle: 'Custom reports'},
                controller: 'CustomReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/CustomReportController.js',
                                'reporting/business/WeeklyReportingService.js'
                            ]
                        });
                    }]
                }
            })

            // Weekly reports -- Interim
            .state('application.weekly_reports', {
                url: '/reporting/weekly/:page',
                templateUrl: 'reporting/views/weekly.html',
                data: {pageTitle: 'BÁO CÁO TUẦN'},
                controller: 'WeeklyReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/WeeklyReportController.js',
                                'reporting/business/WeeklyReportingService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.weekly_report_dashboard', {
                url: '/reporting/weekly-dashboard',
                templateUrl: 'reporting/views/weekly-dashboard.html',
                data: {pageTitle: 'BÁO CÁO TUẦN'},
                controller: 'WeeklyReportDashboardController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/WeeklyReportDashboardController.js',
                                'reporting/business/WeeklyReportingService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/OrganizationService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.edit_weekly_report', {
                url: '/reporting/weekly/edit/:id/:page',
                templateUrl: 'reporting/views/weekly-edit.html',
                data: {pageTitle: 'CẬP NHẬT BÁO CÁO TUẦN'},
                controller: 'WeeklyReportEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/WeeklyReportEditController.js',
                                'reporting/business/WeeklyReportingService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/HIVConfirmLabService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.weekly_report_progress', {
                url: '/reporting/weekly-progress/:status',
                templateUrl: 'reporting/views/weekly-progress.html',
                data: {pageTitle: 'TIẾN ĐỘ BÁO CÁO TUẦN'},
                controller: 'WeeklyReportProgressController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/WeeklyReportProgressController.js',
                                'reporting/business/WeeklyReportingService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js',
                            ]
                        });
                    }]
                }
            })

            .state('application.sl_targets', {
                url: '/site-level-targets',
                templateUrl: 'reporting/views/sl-targets.html',
                data: {pageTitle: 'Chỉ tiêu năm'},
                controller: 'SiteLevelTargetController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Reporting',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'reporting/controllers/SiteLevelTargetController.js',
                                'reporting/business/SiteLevelTargetService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })
    }]);

})();