/**
 * Created by bizic on 28/8/2016.
 */
 (function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('AdminUnitEditTableController', AdminUnitEditTableController);

    AdminUnitEditTableController.$inject = [
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
        'AdminUnitEditTableService'
    ];

    function AdminUnitEditTableController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, bsTableAPI, service) {
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
        vm.adminUnitEditTable = {};
        vm.adminUnit = {};
        vm.adminUnits = [];
        vm.breadcrumb = [];
        vm.selectedAdminUnits = [];
        vm.adminUnitFilter = {};
        vm.tempRoles = [];

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

        // Get all roles
        blockUI.start();
        service.getAllRoles().then(function (data) {
            blockUI.stop();
            if (data && data.length > 0) {
                vm.roles = data;
            } else {
                vm.roles = [];
            }
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

        vm.editTable = {
            choices: [{
                    id: 1,
                    text: "C??",
                    isEditable: "true"
                }, {
                    id: 2,
                    text: "Kh??ng",
                    isEditable: "false"
                }]
        };

        vm.getAllProvinces = function(){
            vm.adminUnitFilter.excludeVoided=true;
            vm.adminUnitFilter.parentCode="country_1";
            blockUI.start();
            service.getAllAdminUnits(vm.adminUnitFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.provinces = data;
                blockUI.stop();
            });
        };
        vm.getAllProvinces();

        vm.selectAdminUnitEditTable = function(item){
            vm.adminUnitEditTable.adminUnit = item;
        }

        vm.onSelectIsEditTable = function(choice){
            vm.adminUnitEditTable.editTable = choice;
        }

        vm.selectRoles = () => {
            vm.adminUnitEditTable.roles="";
            vm.arrRoles = vm.tempRoles;
            var str="";
            for(var x in vm.arrRoles){
                str+=vm.arrRoles[x].name;
                if(x<vm.arrRoles.length-1){
                    str+=",";
                }
                
            }
            vm.adminUnitEditTable.roles=str;
            console.log("roles after select:"+vm.adminUnitEditTable.roles);
        }

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
        vm.newAdminUnitEditTable = function () {

            vm.adminUnitEditTable.isNew = true;
            vm.tempRoles=[];
            // vm.listSelectedFmsAdmin=[];
            let role = {};
            role.name = "ROLE_ADMIN";
            vm.tempRoles.push(role);
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
         vm.saveAdminUnitEditTable = function () {

            // if (!vm.adminUnit.code || vm.adminUnit.code.trim() === "") {
            //     toastr.error('B???n vui l??ng nh???p m?? ????n v??? h??nh ch??nh.', 'Th??ng b??o');
            //     return;
            // }

            // if (!vm.adminUnit.name || vm.adminUnit.name.trim() === "") {
            //     toastr.error('B???n vui l??ng nh???p t??n ????n v??? h??nh ch??nh.', 'Th??ng b??o');
            //     return;
            // }
            var arr=[];
            vm.adminUnitEditTable.listSelectedAdminUnit = [];
            vm.adminUnitEditTable.listSelectedAdminUnit = arr.concat(vm.listSelectedAdminUnit);
            console.log("adu");
            console.log(vm.adminUnitEditTable);
            blockUI.start();
            // service.getAdminUnitAlt(vm.adminUnit.code).then(function (data) {
            //     blockUI.stop();
            //     if (data && data.id) {
            //         if (vm.adminUnit.id && vm.adminUnit.id != data.id) {
            //             toastr.error('M?? ????n v??? h??nh ch??nh ???? t???n t???i. B???n vui l??ng ch???n m?? kh??c!', 'Th??ng b??o');
            //             return;
            //         }
            //     }

            //     // Assign parent
            //     if ((!vm.adminUnit.parent || !vm.adminUnit.parent.id) && vm.breadcrumb.length > 0) {
            //         vm.adminUnit.parent = vm.breadcrumb[vm.breadcrumb.length - 1];
            //     }

                // Save the admin unit
                service.saveOrUpdate(vm.adminUnitEditTable, function success() {

                    // Refresh list
                    // vm.getAdminUnits();

                    // Notify
                    
                    blockUI.stop();
                    toastr.info('B???n ???? l??u th??nh c??ng th??ng tin m???t qu???n l?? ????n v??? h??nh ch??nh.', 'Th??ng b??o');

                }, function failure() {
                    blockUI.stop();
                    toastr.error('C?? l???i x???y ra khi l??u th??ng tin ????n v??? qu???n l?? ????n v??? h??nh ch??nh.', 'Th??ng b??o');
                }).then(function () {

                    // clear object
                    // vm.adminUnit = {
                    //     address: {}
                    // };

                    if (vm.modalInstance != null) {
                        vm.modalInstance.close();
                    }
                });
            // });
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
                        toastr.info('B???n ???? xo?? th??nh c??ng ' + vm.selectedAdminUnits.length + ' b???n ghi.', 'Th??ng b??o');

                        // Clear selected productTypes
                        vm.selectedAdminUnits = [];
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

})();
