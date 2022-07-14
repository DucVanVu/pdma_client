/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.User').controller('UserGroupController', UserGroupController);

    UserGroupController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$timeout',
        'settings',
        'Utilities',
        '$uibModal',
        'bsTableAPI',
        'blockUI',
        'toastr',
        'UserGroupService'
    ];
    
    function UserGroupController ($rootScope, $scope, $state, $timeout,settings, utils, modal, tableAPI, blockUI, toastr, service) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            if (!$scope.isAdministrator($scope.currentUser)) {
                $state.go('application.dashboard');
            }
        });

        let vm = this;

        vm.group = {};
        vm.groups = [];
        vm.selectedGroups = [];

        vm.bsTableControl = {
            options: {
                data: vm.groups,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                pageSize: 25,
                pageList: [5, 10, 25, 50, 100, 200],
                locale: settings.locale,
                sidePagination: 'server',
                //totalRows:100,
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedGroups.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedGroups = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedGroups);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedGroups.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedGroups = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.pageSize = pageSize;
                    vm.pageIndex = index - 1;

                    // Reload user list on page change
                    getGroups(vm.pageSize, vm.pageIndex);
                }
            }
        };

        vm.pageIndex = 0;
        vm.pageSize = vm.bsTableControl.options.pageSize;

        /**
         * Get list of user groups
         */
        function getGroups(pageIndex, pageSize) {
            service.getGroups(pageIndex, pageSize).then(function (data) {
                vm.groups = data.content;
                vm.bsTableControl.options.data = vm.groups;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        }

        // Load first page of user groups list
        getGroups(vm.pageIndex, vm.pageSize);

        vm.newGroup = function () {
            vm.group.isNew = true;

            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_group_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {

                    blockUI.start();

                    if (!vm.group.groupName || vm.group.groupName.trim() == "") {
                        toastr.error('Please enter group name.', 'Error');
                        return;
                    }

                    service.saveGroup(vm.group, function success() {

                        // Refresh list
                        getGroups(vm.pageIndex, vm.pageSize);

                        blockUI.stop();

                        // Notify
                        toastr.info('You have successfully added a new user group.', 'Information');

                        // clear object
                        vm.group = {};
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('An error occurred while adding a new user group.', 'Error');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.editGroup = function (groupId) {
            blockUI.start();
            service.getGroup(groupId).then(function(data) {

                blockUI.stop();

                vm.group = data;
                vm.group.isNew = false;

                let modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_group_modal.html',
                    scope: $scope,
                    size: 'md'
                });

                modalInstance.result.then(function (confirm) {
                    if (confirm == 'yes') {
                        blockUI.start();

                        if (!vm.group.groupName || vm.group.groupName.trim() == "") {
                            toastr.error('Please enter group name.', 'Error');
                            return;
                        }

                        service.saveGroup(vm.group, function success() {

                            // Refresh list
                            getGroups(vm.pageIndex, vm.pageSize);

                            blockUI.stop();

                            // Notify
                            toastr.info('You have successfully updated a record.', 'Information');

                            // clear object
                            vm.group = {};
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('An error occurred while updating a record.', 'Error');
                        });
                    }
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            });
        };

        /**
         * Delete user groups
         */
        vm.deleteGroups = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    blockUI.start();
                    service.deleteGroups(vm.selectedGroups, function success() {
                        // Refresh list
                        getGroups(vm.pageIndex, vm.pageSize);

                        // Block UI
                        blockUI.stop();

                        // Notify
                        toastr.info('You have successfully deleted ' + vm.selectedGroups.length + ' records.', 'Information');

                        // Clear selected tags
                        vm.selectedGroups = [];
                    }, function failure() {
                        // Block UI
                        blockUI.stop();

                        toastr.error('An error occurred while deleting the selected records.', 'Error');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

})();
