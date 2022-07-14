/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PNSAEController', PNSAEController);

    PNSAEController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$state',
        'settings',
        'blockUI',
        'toastr',
        '$uibModal',
        'focusFlatPick',

        'PNSAEService'
    ];

    function PNSAEController($rootScope, $scope, $http, $timeout, $state, settings, blockUI, toastr, modal, focusFlatPick, service) {
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

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };

        vm.report = {};

        vm.getEntries = function () {
            blockUI.start();
            service.getEntries(vm.filter).then(function (data) {
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
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedEntries.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedEntries);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedEntries.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        vm.getEntries();

        /**
         * Add an entry
         */
        vm.addEntry = function() {
            $state.go('application.pns_ae_edit', {id: 0});
        };

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
            allowInput: true
        };

        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.report.fromDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;

                if (vm.report.fromDate) {
                    fpItem.setDate(moment(vm.report.fromDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.report.fromDate = null;
                }
            }
        };

        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.report.toDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;

                if (vm.report.toDate) {
                    fpItem.setDate(moment(vm.report.toDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.report.toDate = null;
                }
            }
        };

        /**
         * Export the PNS AE report for download
         */
        vm.exportReport = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'report_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.report = {};
            });
        };

        /**
         * Generate the report
         */
        vm.generateReport = function() {
            blockUI.start();

            // Validate
            if (!vm.report.fromDate) {
                toastr.error('Vui lòng chọn ngày bắt đầu giai đoạn báo cáo.', 'Thông báo');
                focusFlatPick('vm.report.fromDate');
                blockUI.stop();
                return;
            }

            if (!vm.report.toDate) {
                toastr.error('Vui lòng chọn ngày kết thúc giai đoạn báo cáo.', 'Thông báo');
                focusFlatPick('vm.report.toDate');
                blockUI.stop();
                return;
            }

            let mToDate = moment(vm.report.toDate);
            if (mToDate.isBefore(vm.report.fromDate)) {
                toastr.error('Ngày kết thúc không thể trước ngày bắt đầu giai đoạn báo cáo.', 'Thông báo');
                focusFlatPick('vm.report.toDate');
                blockUI.stop();
                return;
            }

            service.downloadReport(vm.report).success(function (data, status, headers, config) {

                if (vm.modalInstance != null) {
                    vm.modalInstance.close();
                }

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
            });
        };

        /**
         * Delete an entry
         * @param id
         */
        $scope.deleteEntry = function (id) {
            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    service.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
                        vm.getEntries();
                    });
                }
            });
        };
    }

})();
