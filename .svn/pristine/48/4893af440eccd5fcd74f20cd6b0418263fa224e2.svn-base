(function () {
    'use strict';

    PDMA.Document = angular.module('PDMA.Document', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'ngFileUpload',

        'PDMA.Common'
    ]);

    PDMA.Document.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

            // General Settings
            .state('application.documents', {
                url: '/documents',
                templateUrl: 'documents/views/listing.html',
                data: {pageTitle: 'Documents'},
                controller: 'DocumentController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Document',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'documents/controllers/DocumentController.js',
                                'documents/business/DocumentService.js',
                                'dictionaries/business/DocumentTypeService.js'
                            ]
                        });
                    }]
                }
            });
    }]);

})();