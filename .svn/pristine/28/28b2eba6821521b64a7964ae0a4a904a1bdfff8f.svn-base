(function () {
    'use strict';

    PDMA.UID = angular.module('PDMA.UID', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.UID.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.uid', {
                url: '/uid',
                templateUrl: 'uid/views/index.html',
                data: {pageTitle: 'HIV Unique ID'},
                controller: 'UidController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.UID',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'uid/controllers/UidController.js',
                                'uid/business/UidService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();