/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('RegimenController', RegimenController);

    RegimenController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'Utilities',
        'RegimenService',
        'DictionaryService'
    ];

    function RegimenController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, service, dicService) {
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
        vm.regimen = {};
        vm.regimens = [];
        vm.selectedRegimens = [];
        vm.diseases = [];
        vm.lines = [{id: 1, name: 'Phác đồ bậc 1'}, {id: 2, name: 'Phác đồ bậc 2'}, {id: 3, name: 'Phác đồ bậc 3'}];

        vm.filter = {
            disease: null,
            pageIndex: 0,
            pageSize: 25
        };

        // Get all diseases
        (function () {
            dicService.getMultipleEntries([{type: 'DISEASE'}]).then(function (data) {
                if (data && data.length > 0) {
                    vm.diseases = data[0].data;
                }
            });
        })();

        vm.getRegimens = function () {
            service.getRegimens(vm.filter).then(function (data) {
                vm.regimens = data.content;
                vm.bsTableControl.options.data = vm.regimens;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getRegimens();

        vm.bsTableControl = {
            options: {
                data: vm.regimens,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedRegimens.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedRegimens = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedRegimens);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedRegimens.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedRegimens = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getRegimens();
                }
            }
        };

        /**
         * New regimen
         */
        vm.newRegimen = function () {

            vm.regimen.isNew = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_regimen_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.regimen = {};
            });
        };

        /**
         * Edit a regimen
         * @param regimenId
         */
        $scope.editRegimen = function (regimenId) {
            service.getRegimen(regimenId).then(function (data) {

                vm.regimen = data;
                vm.regimen.isNew = false;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_regimen_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.regimen = {};
                });
            });
        };

        /**
         * Save the regimen
         */
        vm.saveRegimen = function () {

            if (!vm.regimen.shortName || vm.regimen.shortName.trim() === "") {
                toastr.error('Bạn vui lòng nhập tên rút gọn của phác đồ.', 'Thông báo');
                return;
            }

            if (!vm.regimen.name || vm.regimen.name.trim() === "") {
                toastr.error('Bạn vui lòng nhập tên đầy đủ của phác đồ.', 'Thông báo');
                return;
            }

            if (!vm.regimen.line) {
                toastr.error('Bạn vui lòng chọn bậc của phác đồ.', 'Thông báo');
                return;
            }

            if (!vm.regimen.disease || !vm.regimen.disease.id) {
                toastr.error('Bạn vui lòng chọn loại bệnh được điều trị.', 'Thông báo');
                return;
            }

            service.saveRegimen(vm.regimen, function success() {

                // Refresh list
                vm.getRegimens();

                // Notify
                toastr.info('Bạn đã lưu thành công thông tin một phác đồ thuốc.', 'Thông báo');

            }, function failure() {
                toastr.error('Có lỗi xảy ra khi lưu thông tin phác đồ thuốc.', 'Thông báo');
            }).then(function () {

                // clear object
                vm.regimen = {};

                if (vm.modalInstance != null) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Delete regimens
         */
        vm.deleteRegimens = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteRegimens(vm.selectedRegimens, function success() {

                        // Refresh list
                        vm.getRegimens();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedRegimens.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedRegimens = [];
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
