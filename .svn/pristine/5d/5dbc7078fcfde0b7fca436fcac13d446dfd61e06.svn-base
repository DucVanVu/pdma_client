(function () {
    'use strict';

    PDMA.Import = angular.module('PDMA.Import', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.Import.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.import', {
                url: '/prevention/import',
                templateUrl: 'import/views/index.html',
                data: {pageTitle: 'Import'},
                controller: 'ImportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Import',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'import/controllers/ImportController.js',
                                'import/business/ImportService.js',
                            ]
                        });
                    }]
                }
            })
    }]);

})();