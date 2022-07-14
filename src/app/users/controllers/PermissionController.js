/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.User').controller('PermissionController', PermissionController);

    PermissionController.$inject = [
        '$rootScope',
        '$scope',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        'toastr',
        'blockUI',
        'bsTableAPI',
        'Utilities',
        'UserService',
        'OrganizationService',
        'AdminUnitService'
    ];

    function PermissionController($rootScope, $scope, $timeout, settings, modal, $state, $stateParams, toastr, blockUI, bsTableAPI, utils, service, orgService, auService) {
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

        vm.dirty = false;
        vm.dataLoaded = false;

        vm.user = {id: $stateParams.id ? $stateParams.id : 0};
        vm.userOrgs = [];

        vm.orgs = [];
        vm.selectedOrgs = [];
        vm.orgFilter = {
            parentId: null,
            activeOnly: true,
            pepfarOnly: false,
            province: null,
            district: null,
            keyword: null,
            pageIndex: 0,
            pageSize: 5
        };

        vm.provinces = [];
        vm.districts = [];

        // Get the selected user
        blockUI.start();
        service.getUser(vm.user.id).then(function (data) {
            blockUI.stop();

            if (!data || !data.id) {
                toastr.warning('Không tìm thấy người dùng hệ thống!');
                $state.go('application.user_listing');
            }

            angular.copy(data, vm.user);

            // Get all permissions
            vm.getPermissions();
        });

        // Get all permissions of the user
        vm.getPermissions = function () {
            blockUI.start();
            service.getPermissions(vm.user).then(function (data) {
                blockUI.stop();
                if (data && data.length > 0) {
                    angular.copy(data, vm.userOrgs);
                } else {
                    vm.userOrgs = [];
                }

                vm.dataLoaded = true;
            });
        };

        // Get all organizations
        vm.getOrgs = function () {
            orgService.getOrganizations(vm.orgFilter).then(function (data) {
                vm.orgs = data.content;
                vm.bsTableControl.options.data = vm.orgs;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        // Get all provinces
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            vm.provinces = data;
        });

        // Get all districts based on province
        $scope.$watch('vm.orgFilter.province', function (newVal, oldVal) {

            vm.orgFilter.district = null;
            vm.districts = [];

            if (newVal && newVal.id) {
                auService.getAllAdminUnits({parentId: newVal.id, excludeVoided: true}).then(function (data) {
                    vm.districts = data;
                });
            }

            // Refresh the org list
            vm.getOrgs();
        });

        // Handle district change
        $scope.$watch('vm.orgFilter.district', function (newVal, oldVal) {

            // Refresh the org list
            vm.getOrgs();
        });

        $scope.$watch('vm.orgFilter.pepfarSiteOnly', function (newVal, oldVal) {
            vm.getOrgs();
        });

        $scope.$watch('vm.orgFilter.opcSiteOnly', function (newVal, oldVal) {
            vm.getOrgs();
        });

        $scope.$watch('vm.orgFilter.htsSiteOnly', function (newVal, oldVal) {
            vm.getOrgs();
        });

        vm.getOrgs();

        vm.bsTableControl = {
            options: {
                data: vm.orgs,
                idField: 'id',
                sortable: false,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.orgFilter.pageSize,
                pageList: [5],
                locale: settings.locale,
                onlyInfoPagination: false,
                paginationLoop: true,
                sidePagination: 'server',
                columns: orgService.getTableDefinition2(),
                onPageChange: function (index, pageSize) {
                    vm.orgFilter.pageSize = pageSize;
                    vm.orgFilter.pageIndex = index - 1;

                    vm.getOrgs();
                }
            }
        };

        /**
         * Select an organization
         * @param id
         */
        $scope.selectOrganization = function (id) {
            if (!id) {
                return;
            }

            if (utils.findById(vm.selectedOrgs, id).id) {
                return;
            }

            let obj = utils.findById(vm.orgs, id);
            if (obj.id) {
                vm.selectedOrgs.push(obj);
            }
        };

        /**
         * Remove an organization
         * @param id
         */
        vm.removeOrganization = function (org) {
            let pos = utils.indexOf(org, vm.selectedOrgs);

            if (pos >= 0) {
                vm.selectedOrgs.splice(pos, 1);
            }
        };

        /**
         * Select organizations to grant permissions
         */
        vm.addOrganizations = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'select_organizations_modal.html',
                scope: $scope,
                size: 'lg'
            });

            modalInstance.result.then(function (confirm) {

                if (!vm.userOrgs) {
                    vm.userOrgs = [];
                }

                angular.forEach(vm.selectedOrgs, function (org) {
                    let found = false;
                    for (let i = 0; i < vm.userOrgs.length; i++) {
                        if (org.id == vm.userOrgs[i].organization.id) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        vm.dirty = true;
                        vm.userOrgs.push({
                            user: vm.user,
                            organization: org,
                            readAccess: true,
                            writeAccess: false,
                            deleteAccess: false,
                            htsRole: false,
                            peRole: false,
                            pnsRole: false,
                            selfTestRole: false,
                            snsRole: false,
                        });
                    }
                });

                vm.selectedOrgs = [];
            }, function () {
                vm.selectedOrgs = [];
            });
        };

        /**
         * Save all changes
         */
        vm.saveChanges = function () {

            if (!vm.userOrgs) {
                vm.userOrgs = [];
            }

            service.savePermissions(vm.userOrgs).then(function () {
                toastr.info('Bạn đã thực hiện phân quyền thành công.', 'Thông báo');

                // Reload permissions
                vm.getPermissions();

                // Dirty
                vm.dirty = false;
            });
        };

        /**
         * Revoke permission
         * @param item
         */
        vm.revokePermission = function (item) {
            if (!item || !item.user || !item.organization) {
                return;
            }

            service.revokePermission([item]).then(function (data) {
                toastr.info('Bạn đã thực hiện huỷ quyền thành công.', 'Thông báo');

                // Reload permissions
                vm.getPermissions();
            });
        };

        $scope.$watch('vm.userOrgs', function (newVal, oldVal) {
            if (vm.dataLoaded) {
                vm.dataLoaded = false;
                vm.dirty = false;
            } else {
                vm.dirty = true;
            }
        }, true);
    }

})();
