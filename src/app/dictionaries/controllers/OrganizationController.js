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
            {id: 0, name: '????? ch??nh x??c cao'},
            {id: 1, name: '????? ch??nh x??c trung b??nh'},
            {id: 2, name: '????? ch??nh x??c th???p'}
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
                toastr.error('B???n vui l??ng nh???p t??n c?? s??? cung c???p d???ch v???.', 'Th??ng b??o');
                return;
            }

            if (!vm.organization.address) {
                vm.organization.address = {};
            }

            if (!vm.organization.address.province || !vm.organization.address.province.id) {
                toastr.error('B???n vui l??ng cho bi???t c?? s??? n??y thu???c t???nh/th??nh ph??? n??o.', 'Th??ng b??o');
                if (vm.editTab != 2) {
                    vm.editTab = 2;
                }
                return;
            }

            if (!vm.organization.address.district || !vm.organization.address.district.id) {
                toastr.error('B???n vui l??ng cho bi???t c?? s??? n??y thu???c huy???n/qu???n n??o.', 'Th??ng b??o');
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
                    toastr.info('B???n ???? l??u th??nh c??ng th??ng tin c?? s??? cung c???p d???ch v???.', 'Th??ng b??o');

                }, function failure() {
                    toastr.error('C?? l???i x???y ra khi l??u th??ng tin c?? s??? d???ch v???.', 'Th??ng b??o');
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
                            title: 'M?? ???? t???n t???i',
                            message: 'M?? <span class="font-weight-600">' + vm.organization.code + '</span> ???? ???????c d??ng cho c?? s??? d???ch v??? <span class="font-weight-600">' + data.name + '</span>. Vui l??ng ch???n m?? kh??c.',
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
                        toastr.info('B???n ???? xo?? th??nh c??ng ' + vm.selectedOrganizations.length + ' b???n ghi.', 'Th??ng b??o');

                        // Clear selected productTypes
                        vm.selectedOrganizations = [];
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
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
