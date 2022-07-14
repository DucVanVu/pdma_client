/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Reporting').controller('CustomReportController', CustomReportController);

    CustomReportController.$inject = [
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
        'ReportingService'
    ];

    function CustomReportController($rootScope, $scope, $http, $timeout, settings, utils, modal, toastr, blockUI, bsTableAPI, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        let vm = this;

        vm.reports = [];
        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };

        vm.bsTableControl = {
            options: {
                data: vm.reports,
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
                paginationFirstText: '<i class="fa fa-angle-double-left"></i>',
                paginationLastText: '<i class="fa fa-angle-double-right"></i>',
                paginationNextText: '<i class="fa fa-angle-right"></i>',
                paginationPreText: '<i class="fa fa-angle-left"></i>',
                columns: service.getTableDef4Events(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {

                    });
                },
                onUncheck: function (row, $element) {
                    $scope.$apply(function () {

                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;
                }
            }
        };

    }

})();
