/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('MMTController', MMTController);

    MMTController.$inject = [
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
        'bsTableAPI',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',

        'PatientService',
        'MMTService',
        'DictionaryService'
    ];

    function MMTController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, bsTableAPI, focus, focusFlatPick, openSelectBox, utils, service, mmtService, dicService) {
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

        vm.reasons = [];

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.getSelectedPatient();
            }
        });

        /**
         * Get dictionary entries
         */
        // blockUI.start();
        // dicService.getMultipleEntries([{type: 'REASON_FOR_MMT_STOP'}]).then(function (data) {
        //     blockUI.stop();
        //
        //     angular.forEach(data, function (obj) {
        //         switch (obj.type) {
        //             case 'REASON_FOR_MMT_STOP':
        //                 vm.reasons = obj.data;
        //
        //                 // angular.copy(obj.data, vm.testingReasons);
        //                 dicService.sortEntries(vm.reasons);
        //
        //                 break;
        //             default:
        //                 break;
        //         }
        //     });
        // });

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
            mmtService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();

                if (data && data.content) {
                    vm.entries = data.content;
                }

                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = vm.entries.length;
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
                columns: mmtService.getTableDefinition(),
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
        };

        // For start date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.startDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
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
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.endDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
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
         * Open edit entry modal
         */
        vm.openEditMMT = function () {

            vm.entry = {};
            vm.entry.onMMT = true;

            if (vm.entries.length > 0) {
                vm.entry = {};
                angular.copy(vm.entries[0], vm.entry);

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
        };

        /**
         * Delete an entry
         * @param id
         */
        vm.deleteEntry = function () {

            if (!vm.entries || vm.entries.length <= 0) {
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
                    mmtService.deleteEntries([{
                        id: vm.entries[0].id,
                        theCase: {id: vm.patient.id}
                    }], function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');

                        // remove the table
                        bsTableAPI('bsTableControl', 'destroy');

                    }, function failure() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
                        vm.getEntries();
                    });
                }
            });
        };

        // Watchers
        $scope.$watch('vm.entry.onMMT', function (newVal, oldVal) {
            if (!newVal) {
                vm.entry.onMMT = true;
            }
        });

        /**
         * Save the entry
         *
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate...
            if (!vm.entry.startDate) {
                toastr.error('Vui lòng nhập ngày bắt đầu điều trị Methadone.', 'Thông báo');
                focusFlatPick('vm.entry.startDate');
                blockUI.stop();
                return;
            }

            if (vm.entry.startDate) {
                let mStartDate = moment(vm.entry.startDate);
                if (mStartDate.isAfter(new Date())) {
                    toastr.error('Ngày bắt đầu điều trị không thể sau ngày hiện tại.', 'Thông báo');
                    focusFlatPick('vm.entry.startDate');
                    blockUI.stop();
                    return;
                }
            }

            if (vm.entry.endDate) {
                let mEndDate = moment(vm.entry.endDate);
                if (mEndDate.isSameOrBefore(vm.entry.startDate)) {
                    toastr.error('Ngày kết thúc điều trị không thể trước ngày bắt đầu điều trị.', 'Thông báo');
                    focusFlatPick('vm.entry.endDate');
                    blockUI.stop();
                    return;
                }
            }

            // Organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            // Submit...
            mmtService.saveEntry(vm.entry, function success() {
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
