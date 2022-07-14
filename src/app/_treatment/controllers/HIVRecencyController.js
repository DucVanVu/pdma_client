/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('HIVRecencyController', HIVRecencyController);

    HIVRecencyController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        'blockUI',
        'toastr',
        '$cookies',
        'Utilities',
        'focus',
        'focusFlatPick',
        'openSelectBox',

        'PatientService',
        'RecencyService'
    ];

    function HIVRecencyController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, recencyService) {
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

            if (!$scope.isSiteManager($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                $state.go('application.treatment_reporting');
            }
        });

        let vm = this;

        vm.utils = utils;
        vm.patient = {};

        vm.entry = {};
        vm.entries = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            testType: 'RECENCY'
        };

        vm.results = [
            {id: 'RECENT', name: 'Ca nhiễm mới'},
            {id: 'OLD', name: 'Ca nhiễm cũ'},
            {id: 'NEGATIVE', name: 'Âm tính'},
            {id: 'INDETERMINATE', name: 'Không xác định'}
        ];

        vm.invalidPatientAlert = function () {
            toastr.error('Không tìm thấy thông tin bệnh nhân phù hợp!', 'Thông báo');
            $state.go('application.treatment');
        };

        // Get the previously selected patient
        vm.getSelectedPatient = function () {
            let selPatientId = $stateParams.id || 0;

            if (selPatientId && selPatientId > 0) {
                blockUI.start();
                service.getPatient(selPatientId).then(function (data) {
                    vm.patient = data;
                    blockUI.stop();

                    if (!vm.patient || !vm.patient.id) {
                        vm.invalidPatientAlert();
                        return;
                    }

                    // Get all viral load tests
                    vm.getEntries();

                    // Check if this patient is editable to this user
                    service.checkEditable(vm.patient, $scope.isSiteManager($scope.currentUser));
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selPatientId);

            } else {
                vm.invalidPatientAlert();
            }
        };

        vm.getSelectedPatient();

        // Getting the saved editing patient object
        (function () {
            let entryObj = localStorage.getItem(service.EDIT_PATIENT_ENTRY);

            if (entryObj) {
                entryObj = JSON.parse(entryObj);

                if (entryObj.id) {
                    blockUI.start();
                    service.getPatient(entryObj.id, function failure() {
                        blockUI.stop();
                    }).then(function (data) {
                        vm.editingEntry = data;
                        blockUI.stop();
                    });
                } else {
                    vm.editingEntry = entryObj;
                }
            }
        })();

        /**
         * Get all recency tests
         */
        vm.getEntries = function () {
            vm.filter.theCase = {id: vm.patient.id};

            blockUI.start();
            recencyService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.entries = data.content;

                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
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
                columns: recencyService.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        let datepickerOptions = {
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

        // For screening sample date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.screenSampleDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.screenSampleDate) {
                    fpItem.setDate(moment(vm.entry.screenSampleDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.screenSampleDate = null;
                }
            }
        };

        // For screening test date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.screenTestDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.screenTestDate) {
                    fpItem.setDate(moment(vm.entry.screenTestDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.screenTestDate = null;
                }
            }
        };

        // For VL test date
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.vlTestDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.entry.vlTestDate) {
                    fpItem.setDate(moment(vm.entry.vlTestDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.entry.vlTestDate = null;
                }
            }
        };

        /**
         * On screening result change
         */
        vm.onScreeningResult = function() {
            if (vm.entry.screenResult != 'RECENT') {
                vm.entry.vlTestDate = null;
                vm.entry.vlResult = null;
                vm.entry.confirmResult = null;
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddRecencyTest = function () {

            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.resultAvailable = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                // TODO
            });
        };

        /**
         * Open edit entry modal
         */
        $scope.editEntry = function (id) {

            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            if (!vm.patient.editable) {
                modal.open({
                    animation: true,
                    templateUrl: 'noneditable_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                return;
            }

            blockUI.start();
            recencyService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.entry = {};
                    angular.copy(data, vm.entry);
                    vm.entry.isNew = false;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_entry_modal.html',
                        scope: $scope,
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.closed.then(function () {
                        // TODO
                    });
                } else {
                    toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                }
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

            if (!vm.patient.editable) {
                modal.open({
                    animation: true,
                    templateUrl: 'noneditable_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

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
                    recencyService.deleteEntries([{id: id}], function success() {
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

        /**
         * Save the test entry
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate
            if (!vm.entry.screenSampleDate) {
                toastr.error('Vui lòng nhập ngày lấy mẫu xét nghiệm sàng lọc.', 'Thông báo');
                focusFlatPick('vm.entry.screenSampleDate');
                blockUI.stop();
                return;
            }

            let mSampleDate = moment(vm.entry.screenSampleDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ngày lấy mẫu xét nghiệm sàng lọc không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.entry.screenSampleDate');
                blockUI.stop();
                return;
            }

            if (!vm.entry.screenTestDate) {
                toastr.error('Vui lòng nhập ngày xét nghiệm sàng lọc.', 'Thông báo');
                focusFlatPick('vm.entry.screenTestDate');
                blockUI.stop();
                return;
            }

            let mTestDate = moment(vm.entry.screenTestDate);
            if (mTestDate.isAfter(new Date())) {
                toastr.error('Ngày xét nghiệm sàng lọc không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.entry.screenTestDate');
                blockUI.stop();
                return;
            }

            if (mTestDate.isBefore(mSampleDate)) {
                toastr.error('Ngày xét nghiệm sàng lọc không thể sớm hơn ngày lấy mẫu.', 'Thông báo');
                focusFlatPick('vm.entry.screenTestDate');
                blockUI.stop();
                return;
            }

            if (!vm.entry.screenResult) {
                toastr.error('Vui lòng nhập kết quả xét nghiệm sàng lọc.', 'Thông báo');
                openSelectBox('vm.entry.screenResult');
                blockUI.stop();
                return;
            }

            if (vm.entry.screenResult == 'RECENT') {
                if (!vm.entry.vlTestDate) {
                    toastr.error('Vui lòng nhập ngày xét nghiệm TLVR.', 'Thông báo');
                    focusFlatPick('vm.entry.vlTestDate');
                    blockUI.stop();
                    return;
                }

                mTestDate = moment(vm.entry.vlTestDate);
                if (mTestDate.isAfter(new Date())) {
                    toastr.error('Ngày xét nghiệm TLVR không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.entry.vlTestDate');
                    blockUI.stop();
                    return;
                }

                if (vm.entry.vlResult == null || vm.entry.vlResult.trim().length <= 0) {
                    toastr.error('Vui lòng nhập kết quả xét nghiệm TLVR phù hợp.', 'Thông báo');
                    focus('vm.entry.vlResult');
                    blockUI.stop();
                    return;
                }

                if (vm.entry.confirmResult == null) {
                    toastr.error('Vui lòng nhập kết quả xét nghiệm khẳng định nhiễm mới.', 'Thông báo');
                    openSelectBox('vm.entry.confirmResult');
                    blockUI.stop();
                    return;
                }
            }

            // Copy the active organization
            vm.entry.organization = {};
            angular.copy(vm.patient.caseOrgs[0].organization, vm.entry.organization);

            // Copy the case
            vm.entry.theCase = {};
            angular.copy(vm.patient, vm.entry.theCase);

            // remove unnecessary properties
            delete vm.entry.isNew;

            // Submit
            recencyService.saveEntry(vm.entry, function success() {
                blockUI.stop();
                toastr.info('Bạn đã lưu thông tin xét nghiệm thành công!', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin xét nghiệm!', 'Thông báo');
            }).then(function (data) {

                // Close the modal
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh the data table
                vm.getEntries();

                // clear the entry
                vm.entry = {};
            });
        };
    }

})();
