/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('TBController', TBController);

    TBController.$inject = [
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
        'TBProphylaxisService',
        'TBTreatmentService'
    ];

    function TBController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, proService, txService) {
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

        vm.proEntry = {};
        vm.proEntries = [];

        vm.txEntry = {};
        vm.txEntries = [];

        vm.modalInstance = null;

        vm.filter = {
            theCase: null
        };

        vm.prophylaxisResults = [
            {id: 1, name: 'Bỏ trị'},
            {id: 2, name: 'Chưa hoàn thành'},
            {id: 3, name: 'Đã hoàn thành'}
        ];

        vm.prophylaxisRegimens = [
            {id: '_9H', name: 'Phác đồ 9H'},
            {id: '_3HP', name: 'Phác đồ 3HP'},
            {id: '_6H', name: 'Phác đồ 6H'},
            {id: '_3RH', name: 'Phác đồ 3RH'},
            {id: '_4R', name: 'Phác đồ 4R'},
            {id: '_1HP', name: 'Phác đồ 1HP'},
            {id: 'OTHER', name: 'Phác đồ khác'}
        ];

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.getSelectedPatient();
            }
        });

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

                    // Get TB prophylaxis records
                    vm.getTBProphyalxisEntries();

                    // Get TB treatment records
                    vm.getTBTreatmentEntries();

                    // Check if the selected patient is editable
                    service.checkEditable(vm.patient, $scope.isSiteManager($scope.currentUser));
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selPatientId);

            } else {
                vm.invalidPatientAlert();
            }
        };

        // Getting the saved editing patient object
        (function () {
            let entryObj = localStorage.getItem(service.EDIT_PATIENT_ENTRY);

            if (entryObj) {
                entryObj = JSON.parse(entryObj);

                if (entryObj.id) {
                    blockUI.start();
                    service.getPatient(entryObj.id, function failure() {
                        localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
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
         * Get all TB prophylaxis tests
         */
        vm.getTBProphyalxisEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            proService.getEntries(vm.filter).then(function (data) {
                vm.proEntries = data.content;

                vm.bsTBProphylaxisTableControl.options.columns = proService.getTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
                vm.bsTBProphylaxisTableControl.options.data = vm.proEntries;
                vm.bsTBProphylaxisTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.bsTBProphylaxisTableControl = {
            options: {
                data: vm.proEntries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                columns: proService.getTableDefinition()
            }
        };

        /**
         * Get all TB treatment tests
         */
        vm.getTBTreatmentEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            txService.getEntries(vm.filter).then(function (data) {
                vm.txEntries = data.content;

                vm.bsTBTreatmentTableControl.options.columns = txService.getTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
                vm.bsTBTreatmentTableControl.options.data = vm.txEntries;
                vm.bsTBTreatmentTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.bsTBTreatmentTableControl = {
            options: {
                data: vm.txEntries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                columns: txService.getTableDefinition()
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
            allowInput: true,
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ],
        };

        // For prophylaxis start date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.proEntry.startDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.proEntry.startDate) {
                    fpItem.setDate(moment(vm.proEntry.startDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.proEntry.startDate = null;
                }
            }
        };

        // For prophylaxis end date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.proEntry.resultDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.proEntry.resultDate) {
                    fpItem.setDate(moment(vm.proEntry.resultDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.proEntry.resultDate = null;
                }
            }
        };

        // For TB diagnose date
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.txEntry.diagnoseDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.txEntry.diagnoseDate) {
                    fpItem.setDate(moment(vm.txEntry.diagnoseDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.txEntry.diagnoseDate = null;
                }
            }
        };

        // For TB start date
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.txEntry.txStartDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;
                if (vm.txEntry.txStartDate) {
                    fpItem.setDate(moment(vm.txEntry.txStartDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.clear();
                    vm.txEntry.txStartDate = null;
                }
            }
        };

        // For TB end date
        vm.datepicker5 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.txEntry.txEndDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker5.fpItem = fpItem;
                if (vm.txEntry.txEndDate) {
                    fpItem.setDate(moment(vm.txEntry.txEndDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker5.fpItem) {
                    vm.datepicker5.fpItem.clear();
                    vm.txEntry.txEndDate = null;
                }
            }
        };

        // For TB test date
        vm.datepicker6 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.txEntry.testDate = m.add(7, 'hours').toDate();
                }],
            }, datepickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker6.fpItem = fpItem;
                if (vm.txEntry.testDate) {
                    fpItem.setDate(moment(vm.txEntry.testDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker6.fpItem) {
                    vm.datepicker6.fpItem.clear();
                    vm.txEntry.testDate = null;
                }
            }
        };

        /**
         * Open add TB prophylaxis entry modal
         */
        vm.openAddTBProphylaxis = function () {

            vm.proEntry = {};
            vm.proEntry.isNew = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_pro_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                // TODO
            });
        };

        /**
         * Open edit TB prophylaxis entry modal
         */
        $scope.editProEntry = function (id) {

            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            // if (!vm.patient.editable) {
            //     modal.open({
            //         animation: true,
            //         templateUrl: 'noneditable_modal.html',
            //         scope: $scope,
            //         size: 'md',
            //         backdrop: 'static',
            //         keyboard: false
            //     });
            //
            //     return;
            // }

            blockUI.start();
            proService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.proEntry = {};
                    angular.copy(data, vm.proEntry);
                    vm.proEntry.isNew = false;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_pro_entry_modal.html',
                        scope: $scope,
                        size: 'md',
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
         * Delete a prophylaxis entry
         * @param id
         */
        $scope.deleteProEntry = function (id) {
            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            // if (!vm.patient.editable) {
            //     modal.open({
            //         animation: true,
            //         templateUrl: 'noneditable_modal.html',
            //         scope: $scope,
            //         size: 'md',
            //         backdrop: 'static',
            //         keyboard: false
            //     });
            //
            //     return;
            // }

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

                    proService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.info('Đã xoá thành công bản ghi điều trị dự phòng lao!', 'Thông báo');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
                        vm.getTBProphyalxisEntries();
                    });
                }
            });
        };

        /**
         * Save the prophylaxis entry
         */
        vm.saveProEntry = function () {
            blockUI.start();

            // Validate

            if (!vm.proEntry.regimen) {
                toastr.error('Vui lòng chọn phác đồ thuốc dự phòng lao.', 'Thông báo');
                openSelectBox('vm.proEntry.regimen');
                blockUI.stop();
                return;
            }

            if (!vm.proEntry.startDate) {
                toastr.error('Vui lòng nhập ngày bắt đầu.', 'Thông báo');
                focusFlatPick('vm.proEntry.startDate');
                blockUI.stop();
                return;
            }

            let mStartDate = moment(vm.proEntry.startDate);
            if (mStartDate.isAfter(new Date())) {
                toastr.error('Ngày bắt đầu không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.proEntry.startDate');
                blockUI.stop();
                return;
            }

            if (vm.proEntry.endDate) {
                let mEndDate = moment(vm.proEntry.endDate);
                if (mEndDate.isBefore(mStartDate)) {
                    toastr.error('Ngày kết thúc không thể trước ngày bắt đầu.', 'Thông báo');
                    focusFlatPick('vm.proEntry.endDate');
                    blockUI.stop();
                    return;
                }
            }

            // Copy the active organization
            vm.proEntry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.proEntry.theCase = {id: vm.patient.theCase.id};

            // Submit
            proService.saveEntry(vm.proEntry, function success() {
                blockUI.stop();
                toastr.info('Bạn đã lưu yêu cầu xét nghiệm thành công!', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu yêu cầu xét nghiệm!', 'Thông báo');
            }).then(function (data) {
                // Close the modal
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh the data table
                vm.getTBProphyalxisEntries();

                // clear the entry
                vm.proEntry = {};
            });
        };

        /**
         * Open add TB Tx entry modal
         */
        vm.openAddTBTreatment = function () {

            vm.txEntry = {};
            vm.txEntry.isNew = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_tx_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                // TODO
            });
        };

        /**
         * Open edit TB Tx entry modal
         */
        $scope.editTreatmentEntry = function (id) {

            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            // if (!vm.patient.editable) {
            //     modal.open({
            //         animation: true,
            //         templateUrl: 'noneditable_modal.html',
            //         scope: $scope,
            //         size: 'md',
            //         backdrop: 'static',
            //         keyboard: false
            //     });
            //
            //     return;
            // }

            blockUI.start();
            txService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.txEntry = {};
                    angular.copy(data, vm.txEntry);
                    vm.txEntry.isNew = false;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_tx_entry_modal.html',
                        scope: $scope,
                        size: 'md',
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
         * Delete a TB Tx entry
         * @param id
         */
        $scope.deleteTreatmentEntry = function (id) {
            if (!id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            // if (!vm.patient.editable) {
            //     modal.open({
            //         animation: true,
            //         templateUrl: 'noneditable_modal.html',
            //         scope: $scope,
            //         size: 'md',
            //         backdrop: 'static',
            //         keyboard: false
            //     });
            //
            //     return;
            // }

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
                    txService.deleteEntries([{id: id}], function success() {
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
                        vm.getTBTreatmentEntries();
                    });
                }
            });
        };

        /**
         * Save the TB Tx entry
         */
        vm.saveTreatmentEntry = function () {

            blockUI.start();

            // Validate
            if (!vm.txEntry.diagnoseDate) {
                toastr.error('Vui lòng nhập ngày chẩn đoán lao.', 'Thông báo');
                focusFlatPick('vm.txEntry.diagnoseDate');
                blockUI.stop();
                return;
            }

            let mDiagnoseDate = moment(vm.txEntry.diagnoseDate);
            if (mDiagnoseDate.isAfter(new Date())) {
                toastr.error('Ngày chẩn đoán lao không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.txEntry.diagnoseDate');
                blockUI.stop();
                return;
            }

            if (vm.txEntry.txStartDate) {
                let mStartDate = moment(vm.txEntry.txStartDate);

                if (mStartDate.isAfter(new Date())) {
                    toastr.error('Ngày bắt đầu điều trị lao không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.txEntry.txStartDate');
                    blockUI.stop();
                    return;
                }

                if (mStartDate.isBefore(mDiagnoseDate)) {
                    toastr.error('Ngày bắt đầu điều trị lao không thể trước ngày chẩn đoán mắc lao.', 'Thông báo');
                    focusFlatPick('vm.txEntry.txStartDate');
                    blockUI.stop();
                    return;
                }
            }

            if (vm.txEntry.txEndDate) {

                if (!vm.txEntry.txStartDate) {
                    toastr.error('Vui lòng nhập ngày bắt đầu điều trị lao.', 'Thông báo');
                    focusFlatPick('vm.txEntry.txStartDate');
                    blockUI.stop();
                    return;
                }

                let mStartDate = moment(vm.txEntry.txStartDate);
                if (mStartDate.isBefore(mDiagnoseDate)) {
                    toastr.error('Ngày bắt đầu điều trị lao không thể trước ngày chẩn đoán mắc lao.', 'Thông báo');
                    focusFlatPick('vm.txEntry.txStartDate');
                    blockUI.stop();
                    return;
                }

                let mEndDate = moment(vm.txEntry.txEndDate);
                if (mEndDate.isBefore(mStartDate)) {
                    toastr.error('Ngày kết thúc điều trị lao không thể trước ngày bắt đầu.', 'Thông báo');
                    focusFlatPick('vm.txEntry.txEndDate');
                    blockUI.stop();
                    return;
                }
            }

            // Copy the active organization
            vm.txEntry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.txEntry.theCase = {id: vm.patient.theCase.id};

            // Submit
            txService.saveEntry(vm.txEntry, function success() {
                blockUI.stop();
                toastr.info('Bạn đã lưu thành công thông tin chẩn đoán - điều trị lao!', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin!', 'Thông báo');
            }).then(function (data) {
                // Close the modal
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh the data table
                vm.getTBTreatmentEntries();

                // clear the entry
                vm.txEntry = {};
            });
        };
    }

})();
