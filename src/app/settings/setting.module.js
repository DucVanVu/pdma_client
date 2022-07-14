(function () {
    'use strict';

    PDMA.Settings = angular.module('PDMA.Settings', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'ngFileUpload',

        'PDMA.Common'
    ]);

    PDMA.Settings.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // General Settings
            .state('application.settings', {
                url: '/settings',
                templateUrl: 'settings/views/general.html',
                data: {pageTitle: 'Settings'},
                controller: 'SettingsController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Settings',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'settings/controllers/SettingsController.js',
                                'settings/business/SettingsService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/OrganizationService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();