/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('ServiceController', ServiceController);

    ServiceController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'Utilities',
        'ServiceService'
    ];

    function ServiceController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, service, dicService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

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

        vm.modalInstance = null;
        vm.service = {};
        vm.services = [];
        vm.selectedServices = [];

        vm.pageIndex = 0;
        vm.pageSize = 25;

        vm.getServices = function () {
            service.getServices(vm.pageIndex, vm.pageSize).then(function (data) {
                console.log(data);
                vm.services = data.content;
                vm.bsTableControl.options.data = vm.services;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getServices();

        vm.bsTableControl = {
            options: {
                data: vm.services,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                pageSize: vm.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedServices.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedServices = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedServices);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedServices.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedServices = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.pageSize = pageSize;
                    vm.pageIndex = index - 1;

                    vm.getServices();
                }
            }
        };

        /**
         * New service
         */
        vm.newService = function () {

            vm.service.isNew = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_service_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.service = {};
            });
        };

        /**
         * Edit a service
         * @param serviceId
         */
        $scope.editService = function (serviceId) {
            service.getService(serviceId).then(function (data) {

                vm.service = data;
                vm.service.isNew = false;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_service_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.service = {};
                });
            });
        };

        /**
         * Save the service
         */
        vm.saveService = function () {

            if (!vm.service.code || vm.service.code.trim() === "") {
                toastr.error('Bạn vui lòng nhập mã dịch vụ.', 'Thông báo');
                return;
            }

            service.codeExists(vm.service).then(function (result) {
                if (result) {
                    toastr.error('Mã dịch vụ đã tồn tại. Bạn vui lòng chọn một mã khác.', 'Thông báo');
                } else {

                    if (!vm.service.name || vm.service.name.trim() === "") {
                        toastr.error('Bạn vui lòng nhập tên dịch vụ.', 'Thông báo');
                        return;
                    }

                    service.saveService(vm.service, function success() {

                        // Refresh list
                        vm.getServices();

                        // Notify
                        toastr.info('Bạn đã lưu thành công thông tin một dịch vụ cho HIV.', 'Thông báo');

                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi lưu thông tin dịch vụ cho HIV.', 'Thông báo');
                    }).then(function () {

                        // clear object
                        vm.service = {};

                        if (vm.modalInstance != null) {
                            vm.modalInstance.close();
                        }
                    });
                }
            });
        };

        /**
         * Delete admin units
         */
        vm.deleteOrganizations = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteOrganizations(vm.selectedServices, function success() {

                        // Refresh list
                        vm.getServices();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedServices.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedServices = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

})();
