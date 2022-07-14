/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PNSController', PNSController);

    PNSController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'blockUI',
        'toastr',
        '$uibModal',
        'focusFlatPick',

        'PNSService'
    ];

    function PNSController($rootScope, $scope, $http, $timeout, settings, blockUI, toastr, modal, focusFlatPick, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.entries = [];
        vm.selectedEntry = null;
        vm.modalInstance = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            facilityIds: []
        };

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                if (vm.orgsReadable && vm.orgsReadable.length == 1) {
                    vm.filter.facilityIds = [vm.orgsWritable[0].id];
                } else {
                    vm.filter.facilityIds = [];
                    angular.forEach(vm.orgsReadable, function (obj) {
                        vm.filter.facilityIds.push(obj.id);
                    });
                }

                vm.getEntries();
            }
        });

        vm.getEntries = function() {
            blockUI.start();
            service.getEntries(vm.filter).then(function(data) {
                vm.entries = data.content;

                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;

                blockUI.stop();
            });
        };

        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                singleSelect: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedEntry = row;
                    });
                },
                onUncheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedEntry = null;
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        /**
         * Delete selected assessments
         */
        vm.deleteAssessments = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_assessments_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    blockUI.start();
                    service.deleteEntries([vm.selectedEntry], function success() {
                        blockUI.stop();
                        toastr.info('Bạn đã xoá thành công thông tin lần đánh giá đã chọn.', 'Thông báo');

                        // reload the list
                        vm.getEntries();

                        vm.selectedEntry = null;

                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá thông tin lần đánh giá đã chọn!', 'Thông báo');
                    });
                }
            });

            vm.modalInstance.closed.then(function () {
            });
        };

        /**
         * Show introduction
         */
        vm.showIntro = function () {
            modal.open({
                animation: true,
                templateUrl: 'intro_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
        };

        // preferences
        vm.prefs = {};

        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Chọn ngày..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
        };

        // For baseline end date selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.prefs.baselineToDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;

                if (vm.prefs.baselineToDate) {
                    fpItem.setDate(moment(vm.prefs.baselineToDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.prefs.baselineToDate = null;
                }
            }
        };

        // For post intervention start date selection
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.prefs.postFromDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;

                if (vm.prefs.postFromDate) {
                    fpItem.setDate(moment(vm.prefs.postFromDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.prefs.postFromDate = null;
                }
            }
        };

        // For post intervention end date selection
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.prefs.postToDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;

                if (vm.prefs.postToDate) {
                    fpItem.setDate(moment(vm.prefs.postToDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.prefs.postToDate = null;
                }
            }
        };

        /**
         * Show preferences
         */
        vm.settings = function () {

            vm.prefs = {};
            service.getPrefs().then(function (data) {

                angular.copy(data, vm.prefs);
                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'preferences_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance.closed.then(function () {
                });
            });
        };

        /**
         * Reporting...
         */
        vm.report = function () {
            modal.open({
                animation: true,
                templateUrl: 'report_na_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
        };

        /**
         * Export data...
         */
        vm.exportData = function() {
            vm.assmtTypes = [
                {id: -1, name: 'Tất cả các loại đánh giá'},
                {id: 0, name: 'Đánh giá đầu vào'},
                {id: 1, name: 'Đánh giá giữa kỳ'},
                {id: 2, name: 'Đánh giá sau can thiệp'},
                {id: 3, name: 'Đánh giá định kỳ'}
            ];

            vm.exportFilter = {type: -1};
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'data_export_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
            });

            vm.modalInstance.result.then(function (confirm) {

                if (confirm == 'yes') {
                    blockUI.start();
                    service.exportRawData(vm.exportFilter).success(function (data, status, headers, config) {
                        blockUI.stop();

                        headers = headers();

                        let filename = headers['x-filename'];
                        let contentType = headers['content-type'];

                        let linkElement = document.createElement('a');
                        try {
                            let blob = new Blob([data], {type: contentType});
                            let url = window.URL.createObjectURL(blob);

                            linkElement.setAttribute('href', url);
                            linkElement.setAttribute("download", filename);

                            let clickEvent = new MouseEvent("click", {
                                "view": window,
                                "bubbles": true,
                                "cancelable": false
                            });
                            linkElement.dispatchEvent(clickEvent);
                        } catch (ex) {
                            console.log(ex);
                        }
                    }).error(function (data) {
                        // console.log(data);
                        blockUI.stop();
                    });
                }

            });
        };

        /**
         * Save preferences
         */
        vm.savePreferences = function () {
            // validation
            if (!vm.prefs) {
                return;
            }

            if (!vm.prefs.baselineToDate) {
                toastr.error('Vui lòng nhập ngày kết thúc đánh giá đầu vào!', 'Thông báo');
                focusFlatPick('vm.prefs.baselineToDate');
                return;
            }

            if (!vm.prefs.postFromDate) {
                toastr.error('Vui lòng nhập ngày bắt đầu đánh giá sau can thiệp!', 'Thông báo');
                focusFlatPick('vm.prefs.postFromDate');
                return;
            }

            let mPFD = moment(vm.prefs.postFromDate);
            if (mPFD.isSameOrBefore(vm.prefs.baselineToDate)) {
                toastr.error('Ngày bắt đầu đánh giá sau can thiệp phải sau ngày kết thúc đánh giá đầu vào!', 'Thông báo');
                focusFlatPick('vm.prefs.postFromDate');
                return;
            }

            if (!vm.prefs.postToDate) {
                toastr.error('Vui lòng nhập ngày kết thúc đánh giá sau can thiệp!', 'Thông báo');
                focusFlatPick('vm.prefs.postToDate');
                return;
            }

            let mPTD = moment(vm.prefs.postToDate);
            if (mPTD.isSameOrBefore(vm.prefs.postFromDate)) {
                toastr.error('Ngày kết thúc đánh giá sau can thiệp phải sau ngày bắt đầu đánh giá sau can thiệp!', 'Thông báo');
                focusFlatPick('vm.prefs.postToDate');
                return;
            }

            service.setPrefs(vm.prefs, function success() {
                toastr.info('Bạn đã thiết lập thành công các tùy chọn.', 'Thông báo');
            }, function failure() {
                toastr.error('Có lỗi xảy ra khi thiếp lập các tùy chọn.', 'Thông báo');
            }).then(function (data) {
                vm.prefs = {};
                angular.copy(data, vm.prefs);

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };
    }

})();
