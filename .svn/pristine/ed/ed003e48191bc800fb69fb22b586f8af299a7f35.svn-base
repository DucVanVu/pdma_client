/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('AdminUnitController', AdminUnitController);

    AdminUnitController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'Utilities',
        'bsTableAPI',

        'AdminUnitService'
    ];

    function AdminUnitController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, bsTableAPI, service) {
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
        vm.adminUnit = {};
        vm.adminUnits = [];
        vm.breadcrumb = [];
        vm.selectedAdminUnits = [];

        vm.filter = {
            parentId: null,
            parentCode: 'country_1',
            keyword: null,
            excludeVoided: false,
            pageIndex: 0,
            pageSize: 25
        };

        // first breadcrumb item
        blockUI.start();
        service.getAdminUnitAlt(vm.filter.parentCode).then(function (data) {
            blockUI.stop();

            vm.breadcrumb = [];
            vm.breadcrumb.push(data);
        });

        vm.getAdminUnits = function () {
            service.getAdminUnits(vm.filter).then(function (data) {
                console.log(vm.filter);
                console.log(data);
                vm.adminUnits = data.content;
                vm.bsTableControl.options.data = vm.adminUnits;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getAdminUnits();

        /**
         * Free text search by keyword
         */
        vm.freeTextSearch = function() {
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getAdminUnits();
        };

        // Watch keyword
        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getAdminUnits();
                }, 300);
            }
        });

        vm.bsTableControl = {
            options: {
                data: vm.adminUnits,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                singleSelect: true,
                showToggle: false,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedAdminUnits.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    // $scope.$apply(function () {
                    //     vm.selectedAdminUnits = rows;
                    // });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedAdminUnits);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedAdminUnits.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    // $scope.$apply(function () {
                    //     vm.selectedAdminUnits = [];
                    // });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getAdminUnits();
                }
            }
        };

        /**
         * Select an admin unit
         */
        $scope.selectAdminUnit = function (id) {
            vm.filter.parentCode = null;
            vm.filter.keyword = null;
            vm.filter.pageIndex = 0;
            vm.filter.parentId = id;
            vm.getAdminUnits();

            // update breadcrumb
            if (id) {
                let pos = utils.indexOf({id: id}, vm.breadcrumb);
                if (pos >= 0) {
                    vm.breadcrumb.splice(pos + 1, vm.breadcrumb.length - pos - 1);
                } else {
                    // get breadcrumb item
                    blockUI.start();
                    service.getAdminUnit(id).then(function (data) {
                        console.log(data);
                        blockUI.stop();
                        if (data && data.id) {
                            vm.breadcrumb.push(data);
                        }
                    });

                }

            }
        };

        /**
         * New adminUnit
         */
        vm.newAdminUnit = function () {

            vm.adminUnit.isNew = true;
            vm.adminUnit.voided = false;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_admin_unit_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.adminUnit = {};
            });
        };

        /**
         * Edit a adminUnit
         * @param adminUnitId
         */
        $scope.editAdminUnit = function (adminUnitId) {
            service.getAdminUnit(adminUnitId).then(function (data) {

                vm.adminUnit = data;
                vm.adminUnit.isNew = false;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_admin_unit_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.adminUnit = {};
                });
            });
        };

        /**
         * Save the adminUnit
         */
        vm.saveAdminUnit = function () {

            if (!vm.adminUnit.code || vm.adminUnit.code.trim() === "") {
                toastr.error('Bạn vui lòng nhập mã đơn vị hành chính.', 'Thông báo');
                return;
            }

            if (!vm.adminUnit.name || vm.adminUnit.name.trim() === "") {
                toastr.error('Bạn vui lòng nhập tên đơn vị hành chính.', 'Thông báo');
                return;
            }

            blockUI.start();
            service.getAdminUnitAlt(vm.adminUnit.code).then(function (data) {
                blockUI.stop();
                if (data && data.id) {
                    if (vm.adminUnit.id && vm.adminUnit.id != data.id) {
                        toastr.error('Mã đơn vị hành chính đã tồn tại. Bạn vui lòng chọn mã khác!', 'Thông báo');
                        return;
                    }
                }

                // Assign parent
                if ((!vm.adminUnit.parent || !vm.adminUnit.parent.id) && vm.breadcrumb.length > 0) {
                    vm.adminUnit.parent = vm.breadcrumb[vm.breadcrumb.length - 1];
                }

                // Save the admin unit
                service.saveAdminUnit(vm.adminUnit, function success() {

                    // Refresh list
                    vm.getAdminUnits();

                    // Notify
                    toastr.info('Bạn đã lưu thành công thông tin một đơn vị hành chính.', 'Thông báo');

                }, function failure() {
                    toastr.error('Có lỗi xảy ra khi lưu thông tin đơn vị hành chính.', 'Thông báo');
                }).then(function () {

                    // clear object
                    vm.adminUnit = {
                        address: {}
                    };

                    if (vm.modalInstance != null) {
                        vm.modalInstance.close();
                    }
                });
            });
        };

        /**
         * Delete admin units
         */
        vm.deleteAdminUnits = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteAdminUnits(vm.selectedAdminUnits, function success() {

                        // Refresh list
                        vm.getAdminUnits();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedAdminUnits.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedAdminUnits = [];
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
