/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('PregnancyController', PregnancyController);

    PregnancyController.$inject = [
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
        'openSelectBox',
        'Utilities',

        'PatientService',
        'PregnancyService',
        'DictionaryService'
    ];

    function PregnancyController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, focus, focusFlatPick, openSelectBox, utils, service, pregService, dicService) {
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
            pageSize: 25
        };

        vm.hivStatuses = [
            {id: 1, name: 'Nhiễm HIV'},
            {id: 2, name: 'Không nhiễm'},
            {id: 3, name: 'Không rõ'}
        ];

        vm.prophylaxisOptions = [
            {id: 1, name: 'Có điều trị'},
            {id: 2, name: 'Không điều trị'},
            {id: 3, name: 'Không rõ'}
        ];

        vm.pregnancyResults = [
            {id: 'STILLBIRTH', name: 'Chưa sinh'},
            {id: 'GAVEBIRTH', name: 'Đã sinh'},
            {id: 'MISCARRIAGE', name: 'Bị sẩy thai'},
            {id: 'ABORTION', name: 'Đã nạo/hút thai'},
            {id: 'UNKNOWN', name: 'Không rõ'}
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
         * Get all entry pageable
         */
        vm.getEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            blockUI.start();
            pregService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();

                vm.entries = data.content;

                let isSiteManager = $scope.isSiteManager($scope.currentUser);

                vm.bsTableControl.options.columns = pregService.getTableDefinition(vm.orgsWritable, isSiteManager);
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
                columns: pregService.getTableDefinition(),
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

        // For last menstrual date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.entry.lastMenstrualPeriod = m.add(7, 'hours').toDate();

                        // calculate the due date
                        let dueDate = m.add(280, 'days').toDate();
                        vm.datepicker2.setValue(dueDate);
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.lastMenstrualPeriod) {
                    fpItem.setDate(moment(vm.entry.lastMenstrualPeriod).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.datepicker2.clear();
                    vm.entry.lastMenstrualPeriod = null;
                }
            }
        };

        // For due date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.entry.dueDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.dueDate) {
                    fpItem.setDate(moment(vm.entry.dueDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.dueDate = null;
                }
            },
            setValue: function (d) {
                if (d) {
                    vm.entry.dueDate = d;
                    vm.datepicker2.fpItem.setDate(d);
                }
            }
        };

        // For child date of date
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.entry.childDob = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.entry.childDob) {
                    fpItem.setDate(moment(vm.entry.childDob).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.entry.childDob = null;
                }
            }
        };

        // For child date of HIV+ diagnosis
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.entry.childDiagnosedDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;
                if (vm.entry.childDiagnosedDate) {
                    fpItem.setDate(moment(vm.entry.childDiagnosedDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.clear();
                    vm.entry.childDiagnosedDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddPregnancy = function () {

            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.pregnant = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
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
            pregService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.entry = {};
                    angular.copy(data, vm.entry);

                    vm.entry.isNew = false;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_entry_modal.html',
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

                    pregService.deleteEntries([{id: id}], function success() {
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

        $scope.$watch('vm.entry.pregnant', function (newVal, oldVal) {
            if (!newVal) {
                vm.entry.pregnant = true;
            }
        });

        $scope.$watch('vm.entry.pregResult', function (newVal, oldVal) {
            if (!newVal || newVal != 'GAVEBIRTH') {
                vm.entry.childDob = null;
                vm.entry.birthWeight = null;
                vm.entry.childHIVStatus = null;
                vm.entry.childDiagnosedDate = null;
                vm.entry.childInitiatedOnART = null;

                vm.datepicker3.clear();
                vm.datepicker4.clear();
            }
        });

        $scope.$watch('vm.entry.childHIVStatus', function (newVal, oldVal) {
            if (newVal && newVal != 1) {
                vm.entry.childDiagnosedDate = null;
                vm.entry.childInitiatedOnART = null;

                vm.datepicker4.clear();
            }
        });

        $scope.$watch('vm.entry.birthWeight', function (newVal, oldVal) {
            if (newVal && newVal < 0) {
                vm.entry.birthWeight = 0;
            }

            if (newVal && newVal > 10) {
                vm.entry.birthWeight = 10;
            }
        });

        /**
         * Save the entry
         *
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate...
            if (vm.entry.lastMenstrualPeriod) {
                let mMenstrual = moment(vm.entry.lastMenstrualPeriod);
                if (mMenstrual.isAfter(new Date())) {
                    toastr.error('Ngày của kỳ kinh cuối không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.entry.lastMenstrualPeriod');
                    blockUI.stop();
                    return;
                }
            }

            if (vm.entry.dueDate) {
                let mDueDate = moment(vm.entry.dueDate);
                if (vm.entry.lastMenstrualPeriod && mDueDate.isSameOrBefore(vm.entry.lastMenstrualPeriod)) {
                    toastr.error('Ngày dự sinh phải sau ngày của kỳ kinh cuối.', 'Thông báo');
                    focusFlatPick('vm.entry.dueDate');
                    blockUI.stop();
                    return;
                }
            }

            if (!vm.entry.pregResult) {
                toastr.error('Vui lòng cho biết tình trạng sinh nở của bệnh nhân.', 'Thông báo');
                openSelectBox('vm.entry.pregResult');
                blockUI.stop();
                return;
            }

            if (vm.entry.pregResult == 'GAVEBIRTH') {

                if (vm.entry.childDob) {
                    let mchildDob = moment(vm.entry.childDob);
                    if (mchildDob.isAfter(new Date())) {
                        toastr.error('Ngày sinh không thể sau ngày hiện tại.', 'Thông báo');
                        focusFlatPick('vm.entry.childDob');
                        blockUI.stop();
                        return;
                    }

                    if (vm.entry.lastMenstrualPeriod && mchildDob.isSameOrBefore(vm.entry.lastMenstrualPeriod)) {
                        toastr.error('Ngày sinh phải sau ngày của kỳ kinh cuối.', 'Thông báo');
                        focusFlatPick('vm.entry.childDob');
                        blockUI.stop();
                        return;
                    }
                }

                if (vm.entry.childDiagnosedDate) {
                    let mchildDiagnosedDate = moment(vm.entry.childDiagnosedDate);
                    if (mchildDiagnosedDate.isAfter(new Date())) {
                        toastr.error('Ngày chẩn đoán nhiễm HIV không thể sau ngày hiện tại.', 'Thông báo');
                        focusFlatPick('vm.entry.childDiagnosedDate');
                        blockUI.stop();
                        return;
                    }

                    if (vm.entry.lastMenstrualPeriod && mchildDiagnosedDate.isSameOrBefore(vm.entry.lastMenstrualPeriod)) {
                        toastr.error('Ngày chẩn đoán nhiễm HIV phải sau ngày của kỳ kinh cuối.', 'Thông báo');
                        focusFlatPick('vm.entry.childDiagnosedDate');
                        blockUI.stop();
                        return;
                    }

                    if (vm.entry.childDob && mchildDiagnosedDate.isBefore(vm.entry.childDob)) {
                        toastr.error('Ngày chẩn đoán nhiễm HIV phải sau ngày sinh của trẻ.', 'Thông báo');
                        focusFlatPick('vm.entry.childDiagnosedDate');
                        blockUI.stop();
                        return;
                    }
                }
            }

            delete vm.entry.isNew;

            // Copy the active organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            // Submit...
            pregService.saveEntry(vm.entry, function success() {
                blockUI.stop();
                toastr.info('Đã lưu thông tin kết quả phỏng vấn.', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin kết quả phỏng vấn.', 'Thông báo');
            }).then(function (data) {
                vm.entry = {};

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh list
                vm.getEntries();
            });
        };
    }

})();
