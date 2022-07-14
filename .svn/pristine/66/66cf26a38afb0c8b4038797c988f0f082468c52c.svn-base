(function () {
    'use strict';

    PDMA.Announcement = angular.module('PDMA.Announcement', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'textAngular',
        'ui.select',

        'PDMA.Common'
    ]);

    PDMA.Announcement.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.announcement', {
                url: '/announcements',
                templateUrl: 'announcements/views/index.html',
                data: {pageTitle: 'Thông báo'},
                controller: 'IndexController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Announcement',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'announcements/controllers/IndexController.js',
                                'announcements/business/IndexService.js',
                            ]
                        });
                    }]
                }
            });
    }]);

})();