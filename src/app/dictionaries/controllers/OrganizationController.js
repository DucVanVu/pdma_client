/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('OrganizationController', OrganizationController);

    OrganizationController.$inject = [
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
        'focus',

        'OrganizationService',
        'AdminUnitService',
        'ServiceService'
    ];

    function OrganizationController($rootScope, $scope, $state, $timeout, settings, modal, toastr, blockUI, utils, bsTableAPI, focus, service, auService, serService) {
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
        vm.organization = {
            address: {}
        };

        vm.organizations = [];
        vm.selectedOrganizations = [];

        vm.filter = {
            parentId: null,
            activeOnly: false,
            pepfarSiteOnly: false,
            htsSiteOnly: false,
            opcSiteOnly: false,
            pnsSiteOnly: false,
            province: null,
            district: null,
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };

        vm.editTab = 1;
        vm.changeEditTab = function (tab) {
            vm.editTab = tab;
        };
        vm.provinces=[];
        service.getAllProvince({parentId:1}).then(function(data){
            if(data){
                vm.provinces=data;
            }
        });

        vm.services = [];
        vm.provinces = [];
        vm.districts = [];
        vm.accuracies = [
            {id: 0, name: 'Độ chính xác cao'},
            {id: 1, name: 'Độ chính xác trung bình'},
            {id: 2, name: 'Độ chính xác thấp'}
        ];

        // Get all provinces
        (function GetAllProvinces() {
            auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
                vm.provinces = data;
            });
        })();

        // Get all services
        (function GetAllServices() {
            serService.getAllServices().then(function (data) {
                vm.services = data;
            });
        })();

        vm.getOrganizations = function () {
            blockUI.start();
            service.getOrganizations(vm.filter).then(function (data) {
                blockUI.stop();
                vm.organizations = data.content;
                vm.bsTableControl.options.data = vm.organizations;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getOrganizations();

        /**
         * Free text search by keyword
         */
        vm.freeTextSearch = function () {

            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getOrganizations();
        };

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getOrganizations();
                }, 300);
            }
        });

        $scope.$watch('vm.filter.province', function (newVal, oldVal) {
            vm.getOrganizations();
        });

        $scope.$watch('vm.filter.pepfarSiteOnly', function (newVal, oldVal) {
            if (newVal != oldVal) {
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);

                $timeout(function () {
                    vm.getOrganizations();
                }, 300);
            }
        });

        $scope.$watch('vm.filter.htsSiteOnly', function (newVal, oldVal) {
            if (newVal != oldVal) {
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);

                $timeout(function () {
                    vm.getOrganizations();
                }, 300);
            }
        });

        $scope.$watch('vm.filter.opcSiteOnly', function (newVal, oldVal) {
            if (newVal != oldVal) {
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);

                $timeout(function () {
                    vm.getOrganizations();
                }, 300);
            }
        });

        $scope.$watch('vm.filter.pnsSiteOnly', function (newVal, oldVal) {
            if (newVal != oldVal) {
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);

                $timeout(function () {
                    vm.getOrganizations();
                }, 300);
            }
        });

        vm.bsTableControl = {
            options: {
                data: vm.organizations,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedOrganizations.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedOrganizations = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedOrganizations);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedOrganizations.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedOrganizations = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getOrganizations();
                }
            }
        };

        /**
         * New organization
         */
        vm.newOrganization = function () {

            vm.organization.isNew = true;
            vm.organization.active = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_organization_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.editTab = 1;
                vm.organization = {
                    address: {}
                };
            });
        };

        /**
         * Edit a organization
         * @param organizationId
         */
        $scope.editOrganization = function (organizationId) {
            service.getOrganization(organizationId).then(function (data) {

                vm.organization = data;
                vm.organization.isNew = false;

                if (!vm.organization.address) {
                    vm.organization.address = {};
                }

                switch (vm.organization.address.accuracy) {
                    case "ROOF_TOP":
                        vm.organization.address.accuracy = 0;
                        break;
                    case "APPROXIMATE":
                        vm.organization.address.accuracy = 1;
                        break;
                    case "CENTROID":
                        vm.organization.address.accuracy = 2;
                        break;
                }

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_organization_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.editTab = 1;
                    vm.organization = {
                        address: {}
                    };
                });
            });
        };

        /**
         * Save the organization
         */
        vm.saveOrganization = function () {

            if (!vm.organization.name || vm.organization.name.trim() === "") {
                toastr.error('Bạn vui lòng nhập tên cơ sở cung cấp dịch vụ.', 'Thông báo');
                return;
            }

            if (!vm.organization.address) {
                vm.organization.address = {};
            }

            if (!vm.organization.address.province || !vm.organization.address.province.id) {
                toastr.error('Bạn vui lòng cho biết cơ sở này thuộc tỉnh/thành phố nào.', 'Thông báo');
                if (vm.editTab != 2) {
                    vm.editTab = 2;
                }
                return;
            }

            if (!vm.organization.address.district || !vm.organization.address.district.id) {
                toastr.error('Bạn vui lòng cho biết cơ sở này thuộc huyện/quận nào.', 'Thông báo');
                if (vm.editTab != 2) {
                    vm.editTab = 2;
                }
                return;
            }

            if (vm.organization.pepfarSite == null) {
                vm.organization.pepfarSite = 0; // inactive
            }

            let submission = function () {
                service.saveOrganization(vm.organization, function success() {

                    // Refresh list
                    vm.getOrganizations();

                    // Notify
                    toastr.info('Bạn đã lưu thành công thông tin cơ sở cung cấp dịch vụ.', 'Thông báo');

                }, function failure() {
                    toastr.error('Có lỗi xảy ra khi lưu thông tin cơ sở dịch vụ.', 'Thông báo');
                }).then(function () {

                    // clear object
                    vm.editTab = 1;
                    vm.organization = {
                        address: {}
                    };

                    if (vm.modalInstance != null) {
                        vm.modalInstance.close();
                    }
                });
            };

            // check for org code duplication
            if (vm.organization.code) {
                service.getOrgByCode(vm.organization.code).then(function (data) {
                    if (data && data.id !== vm.organization.id) {
                        // code already exists
                        vm.dialog = {
                            icon: 'im im-icon-Flash',
                            title: 'Mã đã tồn tại',
                            message: 'Mã <span class="font-weight-600">' + vm.organization.code + '</span> đã được dùng cho cơ sở dịch vụ <span class="font-weight-600">' + data.name + '</span>. Vui lòng chọn mã khác.',
                            callback: function (answer) {
                                if (vm.modalInstance2) {
                                    vm.modalInstance2.close();
                                }
                            }
                        };

                        vm.modalInstance2 = modal.open({
                            animation: true,
                            templateUrl: 'information.html',
                            scope: $scope,
                            size: 'md'
                        });

                        vm.modalInstance2.closed.then(function () {
                            vm.dialog = {};
                            focus('vm.organization.code');
                        });
                    } else {
                        submission();
                    }
                });
            } else {
                submission();
            }
        };

        /**
         * Delete organizations
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
                    service.deleteOrganizations(vm.selectedOrganizations, function success() {

                        // Refresh list
                        vm.getOrganizations();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedOrganizations.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedOrganizations = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Watch for province change
         */
        $scope.$watch('vm.organization.address.province', function (newVal, oldVal) {
            if (!vm.organization.address) {
                vm.organization.address = {};
            }

            if (!newVal) {
                vm.districts = [];
                vm.organization.address.district = null;
            } else if (newVal.id) {

                if (oldVal && newVal.id !== oldVal.id) {
                    vm.organization.address.district = null;
                }

                blockUI.start();
                auService.getAllAdminUnits({parentId: newVal.id, excludeVoided: true}).then(function (data) {
                    blockUI.stop();
                    vm.districts = data;
                });
            }
        });
    }

})();
