/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dashboard').controller('DashboardController', DashboardController);

    DashboardController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'Utilities',
        '$uibModal'
    ];
    
    function DashboardController ($rootScope, $scope, $http, $timeout, settings, utils, modal) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        /**
         * Not available
         */
        vm.na = function() {
            vm.dialog = {
                title: 'Thông báo',
                message: 'Chức năng này hiện tại đang được xây dựng, và sẽ được giới thiệu trong thời gian tới.',
                callback: function () {
                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'information.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };
    }

})();
