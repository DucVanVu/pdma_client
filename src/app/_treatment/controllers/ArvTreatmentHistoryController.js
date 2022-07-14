/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('ArvTreatmentHistoryController', ArvTreatmentHistoryController);

    ArvTreatmentHistoryController.$inject = [
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
        'TreatmentService',
        'DictionaryService',
        'RegimenService'
    ];

    function ArvTreatmentHistoryController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, treatmentService, dicService, regimenService) {
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

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        vm.hasMultipleMissingEndDate = false;
        vm.regimens = [];

        vm.modalInstance = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };
        vm.otherRegimen = {id: 0, name: 'Phác đồ ARV khác', description: '&mdash; Vui lòng ghi rõ'};

        vm.invalidPatientAlert = function () {
            toastr.error('Không tìm thấy thông tin bệnh nhân phù hợp!', 'Thông báo');
            $state.go('application.treatment');
        };

        // Get the previously selected patient
        vm.getSelectedPatient = function () {
            let selCaseOrgId = $stateParams.id || 0;

            if (selCaseOrgId && selCaseOrgId > 0) {
                blockUI.start();
                service.getPatient(selCaseOrgId).then(function (data) {
                    vm.patient = data;
                    blockUI.stop();

                    if (!vm.patient || !vm.patient.id) {
                        vm.invalidPatientAlert();
                        return;
                    }

                    // Get all viral load tests
                    vm.getEntries();

                    // Get case status history
                    service.checkEditable(vm.patient, $scope.isSiteManager($scope.currentUser));
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selCaseOrgId);

            } else {
                vm.invalidPatientAlert();
            }
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.getSelectedPatient();
            }
        });

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

        // Get all ARV regimens
        blockUI.start();
        regimenService.getAllRegimens({disease: {code: 'HIV'}}).then(function (data) {
            blockUI.stop();
            vm.regimens = data;

            // Add to beginning of the array
            vm.regimens.unshift({id: -1, name: '---'});
            vm.regimens.unshift(vm.otherRegimen);
        });

        /**
         * Get all treatments
         */
        vm.getEntries = function () {
            vm.filter.caseId = vm.patient.theCase.id
            vm.filter.diseaseCode = 'HIV';

            blockUI.start();
            treatmentService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();

                vm.entries = data.content;

                vm.bsTableControl.options.columns = treatmentService.getTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;

                // Check if the patient has multiple missing end date for ARV regimens
                treatmentService.hasMultipleMissingEndDate({
                    caseId: vm.patient.theCase.id,
                    diseaseCode: 'HIV'
                }).then(function (result) {
                    vm.hasMultipleMissingEndDate = result;
                });
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
                columns: treatmentService.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        // For regimen start date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: {
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
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.startDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.startDate) {
                    fpItem.setDate(moment(vm.entry.startDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.startDate = null;
                }
            }
        };

        // For end date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: {
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
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.endDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.endDate) {
                    fpItem.setDate(moment(vm.entry.endDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.endDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddARVTreatment = function () {

            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.resultAvailable = true;

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
            treatmentService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.entry = {};

                    angular.copy(data, vm.entry);

                    vm.entry.isNew = false;

                    if (!vm.entry.regimen || !vm.entry.regimen.id) {
                        vm.entry.regimen = {};
                        angular.copy(vm.otherRegimen, vm.entry.regimen);
                    }

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

            if (!vm.patient.editable || vm.entries.length === 1) {
                let templateUrl = null;

                if (!vm.patient.editable) {
                    templateUrl = 'noneditable_modal.html';
                }

                if (vm.entries.length === 1) {
                    vm.dialog = {message: 'Bệnh nhân đã được điều trị ARV, do vậy bạn cần phải giữ ít nhất một phác đồ thuốc cho bệnh nhân hiện tại.'};
                    templateUrl = 'general_error_modal.html';
                }

                modal.open({
                    animation: true,
                    templateUrl: templateUrl,
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
                    treatmentService.deleteEntry({id: id}, function success() {
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
         * Save the arv treatment entry
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate
            if (!vm.entry.regimenName) {
                toastr.error('Vui lòng cho biết phác đồ đang được dùng', 'Thông báo');

                if (vm.entry.regimen && vm.entry.regimen.id === 0) {
                    focus('vm.entry.regimenName');
                } else {
                    openSelectBox('vm.entry.regimen');
                }

                blockUI.stop();
                return;
            }

            if (vm.entry.regimenLine < 1 || vm.entry.regimenLine > 3) {
                toastr.error('Bậc của phác đồ không hợp lệ.', 'Thông báo');
                focus('vm.entry.regimenLine');
                blockUI.stop();
                return;
            }

            if (!vm.entry.startDate) {
                toastr.error('Vui lòng nhập ngày bắt đầu của phác đồ.', 'Thông báo');
                focusFlatPick('vm.entry.startDate');
                blockUI.stop();
                return;
            }

            let mStartDate = moment(vm.entry.startDate);
            if (mStartDate.isAfter(new Date())) {
                toastr.error('Ngày bắt đầu của phác đồ không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.entry.startDate');
                blockUI.stop();
                return;
            }

            if (mStartDate.isBefore(vm.patient.theCase.arvStartDate)) {
                toastr.error('Ngày bắt đầu của phác đồ không thể trước ngày bắt đầu điều trị ARV (' + moment(vm.patient.theCase.arvStartDate).format('DD/MM/YYYY') + ')', 'Thông báo');
                focusFlatPick('vm.entry.startDate');
                blockUI.stop();
                return;
            }

            if (vm.entry.endDate) {
                let mEndDate = moment(vm.entry.endDate);
                if (mEndDate.isAfter(new Date())) {
                    toastr.error('Ngày ghi nhận kết thúc phác đồ không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.entry.endDate');
                    blockUI.stop();
                    return;
                }

                if (mStartDate.isAfter(vm.entry.endDate)) {
                    toastr.error('Ngày kết thúc phác đồ không thể sau ngày bắt đầu phác đồ.', 'Thông báo');
                    focusFlatPick('vm.entry.endDate');
                    blockUI.stop();
                    return;
                }
            }

            // Copy the active organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            // Assign the disease
            vm.entry.disease = {code: 'HIV'};

            // Submit
            treatmentService.saveEntry(vm.entry, function success() {
                blockUI.stop();
                toastr.info('Bạn đã lưu thông tin điều trị thành công!', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin điều trị!', 'Thông báo');
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

        /**
         * On selection of ARV regimen
         */
        vm.onRegimenChange = function () {
            if (vm.entry.regimen && vm.entry.regimen.id == -1) {
                vm.entry.regimen = {};
                angular.copy(vm.regimens[0], vm.entry.regimen);
            }
        };

        // Watchers...

        /**
         * Watcher for regimen
         */
        $scope.$watch('vm.entry.regimen', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            if (newVal.id === 0) {
                focus('vm.entry.regimenName');
            } else {
                vm.entry.regimenName = vm.entry.regimen.name;
                vm.entry.regimenLine = vm.entry.regimen.line;
            }
        });

        $scope.$watch('vm.entry.regimenLine', function (newVal, oldVal) {
            if (newVal < 1) {
                vm.entry.regimenLine = 1;
            }

            if (newVal > 3) {
                vm.entry.regimenLine = 3;
            }
        });
    }

})();
