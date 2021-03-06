/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('HepatitisController', HepatitisController);

    HepatitisController.$inject = [
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
        'focus',
        'focusFlatPick',
        'Utilities',

        'PatientService',
        'HepatitisService'
    ];

    function HepatitisController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, focus, focusFlatPick, utils, service, hepService) {
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

        vm.hepEntry = {};
        vm.entries = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };

        vm.hepTypes = [
            {id: 'HEP_B', name: 'Xét nghiệm HbsAg', diseaseName: 'Viêm gan B'},
            {id: 'HEP_C', name: 'Xét nghiệm Anti-HCV', diseaseName: 'Viêm gan C'}
        ];

        vm.hepTestResults = [
            {id: true, name: 'Dương tính'},
            {id: false, name: 'Âm tính'}
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
            toastr.error('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
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

                    // Get all hep entries
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
         * Get all entry pageable
         */
        vm.getEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            blockUI.start();
            hepService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.entries = data.content;

                vm.bsTableControl.options.columns = hepService.getTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        // Entry grid
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
                columns: hepService.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
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
            allowInput: true,
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ],
        };

        // For test date
        vm.hepTestDatepicker = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.hepEntry.testDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.hepTestDatepicker.fpItem = fpItem;
                if (vm.hepEntry.testDate) {
                    fpItem.setDate(moment(vm.hepEntry.testDate).toDate());
                }
            },
            clear: function () {
                if (vm.hepTestDatepicker.fpItem) {
                    vm.hepTestDatepicker.fpItem.clear();
                    vm.hepEntry.testDate = null;
                }
            }
        };

        // For treatment start date
        vm.hepTxStartDatepicker = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.hepEntry.txStartDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.hepTxStartDatepicker.fpItem = fpItem;
                if (vm.hepEntry.txStartDate) {
                    fpItem.setDate(moment(vm.hepEntry.txStartDate).toDate());
                }
            },
            clear: function () {
                if (vm.hepTxStartDatepicker.fpItem) {
                    vm.hepTxStartDatepicker.fpItem.clear();
                    vm.hepEntry.txStartDate = null;
                }
            }
        };

        // For treatment end date
        vm.hepTxEndDatepicker = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.hepEntry.txEndDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.hepTxEndDatepicker.fpItem = fpItem;
                if (vm.hepEntry.txEndDate) {
                    fpItem.setDate(moment(vm.hepEntry.txEndDate).toDate());
                }
            },
            clear: function () {
                if (vm.hepTxEndDatepicker.fpItem) {
                    vm.hepTxEndDatepicker.fpItem.clear();
                    vm.hepEntry.txEndDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddHepatitis = function () {

            vm.hepEntry = {};
            vm.hepEntry.isNew = true;
            vm.hepEntry.testType = vm.hepTypes[0].id;
            vm.hepEntry.testPositive = false;
            vm.hepEntry.onTreatment = false;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'hep_edit_entry_modal.html',
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
         * Open edit entry modal
         */
        $scope.editEntry = function (id) {

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
            hepService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.hepEntry = {};
                    angular.copy(data, vm.hepEntry);

                    vm.hepEntry.isNew = false;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'hep_edit_entry_modal.html',
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
         * Delete an entry
         * @param id
         */
        $scope.deleteEntry = function (id) {
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
                    hepService.deleteEntries([{id: id}], function success() {
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

        // Watchers
        vm.testTypeString = '';
        $scope.$watch('vm.hepEntry.testType', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            angular.forEach(vm.hepTypes, function (obj) {
                if (obj.id == newVal) {
                    vm.testTypeString = obj.diseaseName;
                }
            });
        });

        $scope.$watch('vm.hepEntry.testPositive', function (newVal, oldVal) {
            if (!newVal) {
                vm.hepEntry.onTreatment = false;
                vm.hepEntry.txStartDate = null;
                vm.hepEntry.txEndDate = null;
            }
        });

        $scope.$watch('vm.hepEntry.onTreatment', function (newVal, oldVal) {
            if (!newVal) {
                vm.hepEntry.txStartDate = null;
                vm.hepEntry.txEndDate = null;
            }
        });

        /**
         * Save the entry
         *
         */
        vm.saveHepEntry = function () {
            blockUI.start();

            // Validate...
            if (!vm.hepEntry.testType) {
                toastr.error('Vui lòng chọn loại bệnh viêm gan.', 'Thông báo');
                blockUI.stop();
                return;
            }

            if (vm.hepEntry.testDate) {
                let mSampleDate = moment(vm.hepEntry.testDate);
                if (mSampleDate.isAfter(new Date())) {
                    toastr.error('Ngày xét nghiệm không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.hepEntry.testDate');
                    blockUI.stop();
                    return;
                }
            }

            if (vm.hepEntry.onTreatment) {
                if (vm.hepEntry.txStartDate) {
                    let mTxStartDate = moment(vm.hepEntry.txStartDate);
                    if (mTxStartDate.isAfter(new Date())) {
                        toastr.error('Ngày bắt đầu điều trị không thể sau ngày hiện tại.', 'Thông báo');
                        focusFlatPick('vm.hepEntry.txStartDate');
                        blockUI.stop();
                        return;
                    }

                    if (vm.hepEntry.testDate && mTxStartDate.isBefore(vm.hepEntry.testDate)) {
                        toastr.error('Ngày bắt đầu điều trị không thể trước ngày xét nghiệm.', 'Thông báo');
                        focusFlatPick('vm.hepEntry.txStartDate');
                        blockUI.stop();
                        return;
                    }

                    if (vm.hepEntry.txEndDate && mTxStartDate.isSameOrAfter(vm.hepEntry.txEndDate)) {
                        toastr.error('Ngày kết thúc điều trị không thể trước ngày bắt đầu điều trị.', 'Thông báo');
                        focusFlatPick('vm.hepEntry.txEndDate');
                        blockUI.stop();
                        return;
                    }
                }
            }

            delete vm.hepEntry.isNew;

            // Copy the active organization
            vm.hepEntry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.hepEntry.theCase = {id: vm.patient.theCase.id};

            // Submit...
            hepService.saveEntry(vm.hepEntry, function success() {
                blockUI.stop();
                toastr.info('Đã lưu thông tin viêm gan.', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin viêm gan.', 'Thông báo');
            }).then(function (data) {
                vm.hepEntry = {};

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh list
                vm.getEntries();
            });
        };
    }

})();
