/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Reporting').controller('SiteLevelTargetController', SiteLevelTargetController);

    SiteLevelTargetController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'Utilities',
        '$uibModal',
        'toastr',
        'blockUI',
        'bsTableAPI',
        'SiteLevelTargetService',
        'OrganizationService',
        'AdminUnitService'
    ];

    function SiteLevelTargetController($rootScope, $scope, $http, $timeout, settings, utils, modal, toastr, blockUI, bsTableAPI, service, orgService, auService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.pageJustLoaded = [true, true];
        vm.indicators = [{id: 0, name: 'HTS_TST'}, {id: 1, name: 'HTS_POS'}, {id: 2, name: 'TX_NEW'}];
        vm.years = [{id: 2019, name: 'FY2019'}, {id: 2020, name: 'FY2020'}, {id: 2021, name: 'FY2021'}, {
            id: 2022,
            name: 'FY2022'
        }, {id: 2023, name: 'FY2023'}];

        $scope.container = {};
        vm.provinces = [];
        vm.sites = [];
        vm.filter = {
            fiscalYear: vm.years[0],
            province: null,
            indicator: vm.indicators[0],
            pepfarSiteOnly: true,
            activeOnly: true,
            pageIndex: 0,
            pageSize: 25
        };

        $scope.$watch('vm.filter.province', function (newVal, oldVal) {
            if (newVal && newVal.id) {
                vm.getSites();
            }
        });

        $scope.$watch('vm.filter.fiscalYear', function (newVal, oldVal) {
            if (newVal && typeof(newVal.id) != 'undefined') {
                if (!vm.pageJustLoaded[0]) {
                    vm.getSites();
                }
            }

            vm.pageJustLoaded[0] = false;
        });

        $scope.$watch('vm.filter.indicator', function (newVal, oldVal) {
            if (newVal && typeof(newVal.id) != 'undefined') {
                if (!vm.pageJustLoaded[1]) {
                    vm.getSites();
                }
            }

            vm.pageJustLoaded[1] = false;
        });

        // Get all provinces
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();

            if (data) {
                $timeout(function () {
                    vm.provinces = data;
                    let index = utils.indexOfAlt({code: 'province_1'}, vm.provinces);

                    if (index >= 0) {
                        vm.filter.province = vm.provinces[index];
                    } else {
                        vm.filter.province = vm.provinces[0];
                    }
                }, 300);
            } else {
                vm.provinces = [];
            }
        });

        // Get sites by filter
        vm.getSites = function () {
            orgService.getAllOrganizations(vm.filter).then(function (data) {
                vm.sites = data;
                for (let i = 0; i < vm.sites.length; i++) {
                    vm.sites[i].target = 0;
                }

                // Get targets
                service.getAllTargets({
                    indicator: vm.filter.indicator.id,
                    fiscalYear: vm.filter.fiscalYear.id,
                    sites: vm.filter.sites
                }).then(function (data) {
                    for (let i = 0; i < vm.sites.length; i++) {
                        angular.forEach(data, function (obj) {
                            if (obj.site && obj.site.id && obj.site.id == vm.sites[i].id) {
                                vm.sites[i].target = obj.target;
                            }
                        });
                    }
                });
            });
        };

        vm.saveTargets = function () {
            let targets = [];
            angular.forEach(vm.sites, function (obj) {
                let target = {
                    site: obj,
                    indicator: vm.filter.indicator.id,
                    fiscalYear: vm.filter.fiscalYear.id,
                    target: typeof(obj.target) != 'undefined' ? obj.target : 0
                };

                targets.push(target);
            });

            if (targets.length > 0) {
                service.saveTargets(targets, function success() {
                    toastr.info('Bạn đã lưu thành công các chỉ tiêu của chỉ số ' + vm.filter.indicator.name + ' cho tỉnh ' + vm.filter.province.name);
                    $scope.container.frmEditTargets.$setPristine();

                    // reload data
                    vm.getSites();
                }, function failure() {
                    toastr.error('Có lỗi xảy ra khi lưu thông tin.', 'Thông báo');
                });
            }
        };
    }

})();
