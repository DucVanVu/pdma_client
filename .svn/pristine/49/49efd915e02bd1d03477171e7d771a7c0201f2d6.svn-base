/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('HIVConfirmLabController', HIVConfirmLabController);

    HIVConfirmLabController.$inject = [
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

        'HIVConfirmLabService',
        'AdminUnitService'
    ];

    function HIVConfirmLabController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, bsTableAPI, service, auService) {
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

            if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                $state.go('application.dashboard');
            }
        });

        let vm = this;

        vm.modalInstance = null;
        vm.lab = {address: {}};
        vm.labs = [];
        vm.selectedLabs = [];

        vm.provinces = [];
        vm.districts = [];

        vm.filter = {
            province: null,
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };
        vm.provinceIds =[];

        // Get all provinces
        // auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
        //     if (data) {
        //         vm.provinces = data;
        //     } else {
        //         vm.provinces = [];
        //     }
        // });
        blockUI.start();
        if($scope.isAdministrator($scope.currentUser)){
            auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
                if (data) {
                    vm.provinceIds =[];
                    vm.provinces = data;
                    for(let i=0;i<data.length;i++){
                        if(data[i].id){
                            vm.provinceIds.push(data[i].id);
                        }
                    }
                } else {
                    vm.provinceIds =[];
                    vm.provinces = [];
                }
                blockUI.stop();
                vm.getLabs();
            });
        }else{
            if($scope.isProvincialManager($scope.currentUser)){
                auService.getAllProvinceByUser().then(function (data) {
                    
                    if (data) {
                        vm.provinceIds =[];
                        vm.provinces = data;
                        for(let i=0;i<data.length;i++){
                            if(data[i].id){
                                vm.provinceIds.push(data[i].id);
                            }
                        }
                    } else {
                        vm.provinceIds =[];
                        vm.provinces = [];
                    }
                    if(vm.provinces.length==1){
                        vm.lab.address.province = vm.provinces[0];
                    }
                    blockUI.stop();
                    vm.getLabs();
                });
            }else{
                auService.getAllProvinceByUser().then(function (data) {
                    
                    if (data) {
                        vm.provinceIds =[];
                        vm.provinces = data;
                        for(let i=0;i<data.length;i++){
                            if(data[i].id){
                                vm.provinceIds.push(data[i].id);
                            }
                        }
                    } else {
                        vm.provinceIds =[];
                        vm.provinces = [];
                    }
                    if(vm.provinces.length==1){
                        vm.lab.address.province = vm.provinces[0];
                    }
                    blockUI.stop();
                    vm.getLabs();
                });
            }
        }

        // Update districts when province changes
        $scope.$watch('vm.lab.address.province', function (newVal, oldVal) {
            vm.lab.address.district = null;
            vm.districts = [];

            if (vm.lab.address.province && vm.lab.address.province.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.lab.address.province.id,
                    excludeVoided: true
                }).then(function (data) {
                    console.log(data);
                    if (data) {
                        vm.districts = data;
                        if (utils.indexOf(vm.lab.address.tempDistrict, vm.districts) >= 0) {
                            vm.lab.address.district = {};
                            angular.copy(vm.lab.address.tempDistrict, vm.lab.address.district);
                        }
                    } else {
                        vm.districts = [];
                    }
                });
            }
        });

        /**
         * Free text search by keyword
         */
        vm.freeTextSearch = function () {

            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getLabs();
        };

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getLabs();
                }, 300);
            }
        });

        vm.getLabs = function () {
            vm.filter.provinceIds = vm.provinceIds.length==0?null:vm.provinceIds
            service.getLabs(vm.filter).then(function (data) {
                vm.labs = data.content;
                vm.bsTableControl.options.data = vm.labs;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        

        vm.bsTableControl = {
            options: {
                data: vm.labs,
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
                        vm.selectedLabs.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedLabs = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedLabs);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedLabs.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedLabs = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getLabs();
                }
            }
        };

        /**
         * New lab
         */
        vm.newLab = function () {

            vm.lab.isNew = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_lab_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.lab = {address: {}};
            });
        };

        /**
         * Edit a lab
         * @param labId
         */
        $scope.editLab = function (labId) {
            service.getLab(labId).then(function (data) {

                vm.lab = data;
                vm.lab.isNew = false;

                if (vm.lab.address.district) {
                    vm.lab.address.tempDistrict = {};
                    angular.copy(vm.lab.address.district, vm.lab.address.tempDistrict);
                }

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_lab_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.lab = {address: {}};
                });
            });
        };

        /**
         * Save the lab
         */
        vm.saveLab = function () {

            if (!vm.lab.name || vm.lab.name.trim() === "") {
                toastr.error('Bạn vui lòng nhập tên của phòng xét nghiệm.', 'Thông báo');
                return;
            }

            if (!vm.lab.address || !vm.lab.address.province || !vm.lab.address.province.id) {
                toastr.error('Bạn vui lòng nhập thông tin địa chỉ của phòng xét nghiệm.', 'Thông báo');
                return;
            }

            service.saveLab(vm.lab, function success() {

                // Refresh list
                vm.getLabs();

                // Notify
                toastr.info('Bạn đã lưu thành công thông tin một phòng xét nghiệm khẳng định HIV.', 'Thông báo');

            }, function failure() {
                toastr.error('Có lỗi xảy ra khi lưu thông tin phòng xét nghiệm.', 'Thông báo');
            }).then(function () {

                // clear object
                vm.lab = {address: {}};

                if (vm.modalInstance != null) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Delete labs
         */
        vm.deleteLabs = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteLabs(vm.selectedLabs, function success() {

                        // Refresh list
                        vm.getLabs();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedLabs.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedLabs = [];
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
