/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Reporting').controller('RoutineReportController', RoutineReportController);

    RoutineReportController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$http',
        '$timeout',
        'settings',
        'Utilities',
        '$uibModal',
        'ReportingService'
    ];

    function RoutineReportController($rootScope, $scope, $state, $http, $timeout, settings, utils, modal, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        let vm = this;

        /// -------------------------------
        /// EXISTING REPORTS
        /// -------------------------------
        vm.existingReports = {
            pageIndex: 0,
            pageSize: 25,
            currentItem: null,
            selectedItems: [],
            allItems: [],
            getAllReports: function () {
                service.getAllReports(vm.existingReports.pageIndex, vm.existingReports.pageSize).then(function (data) {
                    vm.existingReports.allItems = data.content;
                    vm.bsTableControl.options.data = vm.existingReports.allItems;
                    vm.bsTableControl.options.totalRows = data.totalElements;
                });
            }
        };

        vm.bsTableControl = {
            options: {
                data: vm.existingReports.allItems,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.existingReports.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.existingReports.selectedItems.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.existingReports.selectedItems = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.existingReports.selectedItems);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.existingReports.selectedItems.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.existingReports.selectedItems = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.existingReports.pageSize = pageSize;
                    vm.existingReports.pageIndex = index - 1;

                    vm.existingReports.getAllReports();
                }
            }
        };

        vm.selectReportType = function (type) {
            if (type == 0) {
                // Listing report
                $state.go('application.listing_reports');
            } else if (type == 1) {
                // Indicator report
                $state.go('application.indicator_reports');
            }
        };

        /**
         * Handling new report wizard button
         */
        vm.newReportWizard = function () {
            modal.open({
                animation: true,
                templateUrl: 'new_report_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
        };
    }

})();
