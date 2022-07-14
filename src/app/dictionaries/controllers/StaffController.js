/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('StaffController', StaffController);

    StaffController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$location',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'focus',
        'openSelectBox',
        'Utilities',
        'StaffService',
        'AdminUnitService',
        'OrganizationService'
    ];

    function StaffController($rootScope, $scope, $state, $location, blockUI, $timeout, settings, modal, toastr, focus, openSelectBox, utils, service, auService, orgService) {
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
                $location.path('/dashboard');
            }
        });

        let vm = this;

        vm.entry = {person: {}};
        vm.entries = [];

        vm.provinces = [];
        vm.orgs = [];
        vm.orgs2 = [];
        vm.provinceIds = [];

        vm.pageIndex = 0;
        vm.pageSize = 25;

        vm.modalInstance = null;

        vm.filter = {
            organization: null
        };

        // for editing entry
        
        //if($scope.isProvincialManager($scope.currentUser)){
            auService.getAllProvinceByUser().then(function (data) {
                if (data) {
                    vm.provinceIds = [];
                    for(let i =0;i<data.length;i++){
                        vm.provinceIds.push(data[i].id);
                    }
                } else {
                    vm.provinceIds = [];
                }
                orgService.getAllOrganizations({activeOnly: true,provinceIds: vm.provinceIds}).then(function (data) {
                    vm.orgs2 = [];
                    if (data && data.length > 0) {
                        angular.copy(data, vm.orgs2);
                    }
                    blockUI.stop();
                });
                
            });
        // }else{
        //     orgService.getAllOrganizations({activeOnly: true}).then(function (data) {
        //         blockUI.stop();
        //         vm.orgs2 = [];
        //         if (data && data.length > 0) {
        //             angular.copy(data, vm.orgs2);
        //         }
        //     });
        // }

        vm.getEntries = function () {
            blockUI.start();
            service.getEntries(vm.filter).then(function (data) {
                vm.entries = data.content;
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;

                blockUI.stop();
            });
        };

        vm.getEntries();

        // Get all provinces
        blockUI.start();
        if($scope.isAdministrator($scope.currentUser)){
            auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
                blockUI.stop();
                if (data) {
                    vm.provinces = data;
                } else {
                    vm.provinces = [];
                }
            });
        }else{
            if($scope.isProvincialManager($scope.currentUser)){
                auService.getAllProvinceByUser().then(function (data) {
                    blockUI.stop();
                    if (data) {
                        vm.provinces = data;
                    } else {
                        vm.provinces = [];
                    }
                    if(vm.provinces.length==1){
                        vm.filter.province = vm.provinces[0];
                        vm.onProvinceChange()
                    }
                });
            }else{
                auService.getAllProvinceByUser().then(function (data) {
                    blockUI.stop();
                    if (data) {
                        vm.provinces = data;
                    } else {
                        vm.provinces = [];
                    }
                    if(vm.provinces.length==1){
                        vm.filter.province = vm.provinces[0];
                        vm.onProvinceChange()
                    }
                });
            }
        }
        

        /**
         * On selection of a province
         */
        vm.onProvinceChange = function () {
            blockUI.start();
            orgService.getAllOrganizations({
                province: vm.filter.province,
                activeOnly: true,
            }).then(function (data) {
                blockUI.stop();

                vm.filter.organization = null;
                vm.orgs = [];

                if (data && data.length > 0) {
                    angular.copy(data, vm.orgs);
                }

                if (vm.orgs.length > 0) {
                    vm.filter.organization = {};
                    angular.copy(vm.orgs[0], vm.filter.organization);
                }

                vm.getEntries();
            });
        };

        /**
         * On selection of an organization
         */
        vm.onOrganizationChange = function () {
            if (!vm.filter.organization || vm.filter.organization.id == -1) {
                vm.filter.organization = {};
                angular.copy(vm.allOpc, vm.filter.organization);
            }

            vm.getEntries();
        };

        vm.bsTableControl = {
            options: {
                data: vm.docTypes,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.pageSize = pageSize;
                    vm.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        /**
         * New staff entry
         */
        vm.newEntry = function () {
            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.active = true;

            if (vm.filter.organization && vm.filter.organization.id) {
                vm.entry.organization = {};
                angular.copy(vm.filter.organization, vm.entry.organization);
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_staff_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

        };

        /**
         * Edit a staff entry
         * @param id
         */
        $scope.editEntry = function (id) {

            if (!id) {
                toastr.warning('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
                return;
            }

            service.getEntry(id).then(function (data) {

                vm.entry = data;
                vm.entry.isNew = false;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_staff_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

            });
        };

        /**
         * Delete an entry
         * @param id
         */
        $scope.deleteEntry = function (id) {

            if (!id) {
                toastr.warning('Không tìm thấy thông tin!', 'Thông báo');
                return;
            }

            // code already exists
            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'Xoá thông tin cán bộ y tế',
                message: 'Bạn có thực sự muốn xoá thông tin của cán bộ y tế đã chọn không?',
                callback: function (answer) {

                    if (answer === 'yes') {
                        service.deleteEntries([{id: id}], function success() {
                            toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                            vm.getEntries();
                        }, function failure() {
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi!', 'Thông báo');
                        });
                    }

                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Save staff entry
         */
        vm.saveEntry = function () {
            // validate
            if (!vm.entry.organization || !vm.entry.organization.id) {
                toastr.error('Vui lòng chọn cơ sở dịch vụ!', 'Thông báo');
                openSelectBox('vm.entry.organization');
                return;
            }

            if (!vm.entry.person.fullname || vm.entry.person.fullname.trim() === '') {
                toastr.error('Vui lòng nhập họ tên cán bộ y tế!', 'Thông báo');
                focus('vm.entry.person.fullname');
                return;
            }

            // save
            service.saveEntry(vm.entry, function success() {
                toastr.info('Bạn đã lưu thành công thông tin cán bộ y tế!', 'Thông báo');

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                vm.getEntries();
            }, function failure() {
                toastr.error('Có lỗi khi lưu thông tin!', 'Thông báo');
            });
        };
    }

})();
