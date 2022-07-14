(function () {
    'use strict';

    angular.module('PDMA.HTS').controller('ReportController', ReportController);

    ReportController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'HtsIndexService',
        '$state',
        '$uibModal',
        'blockUI',
        'toastr'
    ];

    function ReportController($rootScope, $scope, $http, $timeout, settings, service,$state,modal,blockUI,toastr) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        var vm = this;

        vm.entries = [];
        vm.selectedEntries = [];
        vm.modalInstance=null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };

        // vm.openAdvancedSearch = function (focusOnElement) {
        //     vm.modalInstance = modal.open({
        //         animation: true,
        //         templateUrl: '_advance_search_modal.html',
        //         scope: $scope,
        //         size: 'md',
        //         backdrop: 'static',
        //         keyboard: false
        //     });

        //     vm.modalInstance.result.then(function (answer) {
        //         if (answer == 'yes') {
        //             vm.isFiltered=true;
        //             vm.getEntries();
        //         }
        //         else if(answer == 'no'){
        //             vm.filter = {
        //                 pageIndex: 0,
        //                 pageSize: 25,
        //                 keyword: null
        //             };
        //             vm.getEntries();
        //         }
        //     });

        //     vm.modalInstance.closed.then(function (data) {
        //         // TODO
        //         vm.isFiltered =
        //         (vm.filter.riskGroup && vm.filter.riskGroup.length>0)
        //         || (vm.filter.hivStatus && vm.filter.hivStatus.length>0)
        //         || (vm.filter.customerSource && vm.filter.customerSource.length>0)
        //         || (vm.filter.approachMethod && vm.filter.approachMethod.length>0)
        //         || (vm.filter.fromYear && vm.filter.fromYear>0)
        //         || (vm.filter.toYear && vm.filter.toYear>0)
        //         || vm.filter.prepDateFrom
        //         || vm.filter.prepDateTo
        //         || vm.filter.arvDateFrom
        //         || vm.filter.arvDateTo;
        //     });
        // };
        // vm.clearSearch = function(){
        //     vm.isFiltered=false;
        //     vm.filter = {
        //         pageIndex: 0,
        //         pageSize: 25,
        //         keyword: null
        //     };
        //     vm.getEntries();
        // }
        // $scope.$watch('vm.filter', function(newVal, oldVal) {

        // });

        vm.displayValue = function (field, val) {
            console.log(val);
            switch (field) {
                case 'gender':
                    if (val == 'MALE') {
                        return 'Nam';
                    }
                    else if (val == 'FEMALE') {
                        return 'Nữ';
                    }
                    else if (val == 'OTHER') {
                        return 'Khác';
                    }
                    break;
            }
            return 'Khác';
        }

        vm.openAddHTS = function () {
            $state.go('application.hts_add');
        };
    }

})();
