(function () {
    'use strict';

    PDMA.User = angular.module('PDMA.User', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',

        'PDMA.Common'
    ]);

    PDMA.User.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // User Listing
            .state('application.user_listing', {
                url: '/user/listing',
                templateUrl: 'users/views/users.html',
                data: {pageTitle: 'System Users'},
                controller: 'UserController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.User',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'users/controllers/UserController.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })

            // User Listing
            .state('application.grant_permission', {
                url: '/user/permission/:id',
                templateUrl: 'users/views/permissions.html',
                data: {pageTitle: 'Grant permissions'},
                controller: 'PermissionController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.User',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'users/controllers/PermissionController.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/AdminUnitService.js'
                            ]
                        });
                    }]
                }
            })

            // User Listing
            .state('application.user_groups', {
                url: '/user/groups',
                templateUrl: 'users/views/user_groups.html',
                data: {pageTitle: 'System User Groups'},
                controller: 'UserGroupController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.User',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'users/controllers/UserGroupController.js',
                                'users/business/UserGroupService.js'
                            ]
                        });
                    }]
                }
            });
    }]);

})();