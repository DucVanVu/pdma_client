/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('CD4Controller', CD4Controller);

    CD4Controller.$inject = [
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
        'LabTestService',
        'OrganizationService'
    ];

    function CD4Controller($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, labTestService, orgService) {
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

        blockUI.start();
        $scope.$watch('patientEditableChecked', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            // now safe to get the entries
            vm.getEntries();
        });

        let vm = this;

        vm.utils = utils;
        vm.patient = {};

        vm.cd4Entry = {};
        vm.entries = [];

        vm.testingReasons = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.opcs = [];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            noResultOnly: true,
            testType: 'CD4'
        };

        vm.cd4TestingReasons = [
            {id: 'CD4_BASELINE', name: 'Tr?????c khi b???t ?????u ARV'},
            {id: 'CD4_ROUTINE', name: 'X??t nghi???m ?????nh k???'}
        ];

        vm.cd4FundingSources = [
            {id: 'SHI', name: 'B???o hi???m y t???'},
            {id: 'GF', name: 'Qu??? to??n c???u'},
            {id: 'SELF', name: 'T??? chi tr???'},
            {id: 'OTHER', name: 'Ngu???n kh??c'}
        ];

        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        blockUI.start();
        orgService.getAllOrganizations({
            opcSiteOnly: true,
            activeOnly: true,
            compact: true
        }).then(function (data) {
            blockUI.stop();

            vm.opcs = [];
            angular.copy(data, vm.opcs);
        });

        /**
         * Get all CD4 tests
         */
        vm.getEntries = function () {
            if (!vm.filter.noResultOnly && vm.patient && vm.patient.id) {
                vm.filter.theCase = {id: vm.patient.theCase.id};
            }

            blockUI.start();
            labTestService.getEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.entries = data.content;

                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = labTestService.getCD4TableDefinition(isSiteManager, vm.orgsWritable, vm.filter.noResultOnly);
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
                columns: labTestService.getCD4TableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        // For sample date
        vm.cd4DatepickerSample = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: false,
                placeholder: 'Ch???n ng??y..',
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
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.cd4Entry.sampleDate = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.cd4DatepickerSample.fpItem = fpItem;
                if (vm.cd4Entry.sampleDate) {
                    fpItem.setDate(moment(vm.cd4Entry.sampleDate).toDate());
                }
            },
            clear: function () {
                if (vm.cd4DatepickerSample.fpItem) {
                    vm.cd4DatepickerSample.fpItem.clear();
                    vm.cd4Entry.sampleDate = null;
                }
            }
        };

        // For result date
        vm.cd4DatepickerResult = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: false,
                placeholder: 'Ch???n ng??y..',
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
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.cd4Entry.resultDate = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.cd4DatepickerResult.fpItem = fpItem;
                if (vm.cd4Entry.resultDate) {
                    fpItem.setDate(moment(vm.cd4Entry.resultDate).toDate());
                }
            },
            clear: function () {
                if (vm.cd4DatepickerResult.fpItem) {
                    vm.cd4DatepickerResult.fpItem.clear();
                    vm.cd4Entry.resultDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddCD4Test = function () {

            vm.cd4Entry = {};
            vm.cd4Entry.isNew = true;
            vm.cd4Entry.resultAvailable = true;
            vm.cd4Entry.organization = {};

            if (vm.patient && vm.patient.organization) {
                angular.copy(vm.patient.organization, vm.cd4Entry.organization);
                vm.cd4Entry.sampleSite = vm.patient.organization.name;
            }

            // set funding source as previous by default
            if (vm.entries && vm.entries.length > 0) {
                vm.cd4Entry.fundingSource = vm.entries[0].fundingSource;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'cd4_entry_edit_modal.html',
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
                toastr.error('Kh??ng t??m th???y b???n ghi!', 'Th??ng b??o');
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
            labTestService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.cd4Entry = {};

                    // tweak to avoid $watcher to change resultText value when there is no resultNumber
                    if (data.resultNumber == null && data.resultText) {
                        delete data.resultNumber;
                    }

                    angular.copy(data, vm.cd4Entry);

                    vm.cd4Entry.isNew = false;
                    vm.cd4Entry.resultAvailable = vm.cd4Entry.resultDate != null;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'cd4_entry_edit_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.closed.then(function () {
                        // TODO
                    });
                } else {
                    toastr.error('Kh??ng t??m th???y b???n ghi!', 'Th??ng b??o');
                }
            });

        };

        /**
         * Delete an entry
         * @param id
         */
        $scope.deleteEntry = function (id) {
            if (!id) {
                toastr.error('Kh??ng t??m th???y b???n ghi!', 'Th??ng b??o');
                return;
            }

            if (!vm.filter.noResultOnly && !vm.patient.editable) {
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
                    labTestService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.info('???? xo?? th??nh c??ng b???n ghi!', 'Th??ng b??o');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
                    }).then(function () {
                        // reload the grid
                        vm.getEntries();
                    });
                }
            });
        };

        /**
         * On result change
         */
        vm.onCD4ResultChange = function () {
            vm.cd4Entry.resultNumber = parseFloat(vm.cd4Entry.resultNumber);
            if (isNaN(vm.cd4Entry.resultNumber) || vm.cd4Entry.resultNumber < 0) {
                vm.cd4Entry.resultNumber = null;
            } else if (vm.cd4Entry.resultNumber > 0 && vm.cd4Entry.resultNumber < 1) {
                vm.cd4Entry.resultNumber = 1;
            } else {
                vm.cd4Entry.resultNumber = Math.ceil(vm.cd4Entry.resultNumber);
            }
        };

        $scope.$watch('vm.cd4Entry.resultAvailable', function (newVal, oldVal) {
            if (oldVal == true && newVal == false) {
                vm.cd4Entry.resultDate = null;
                vm.cd4Entry.resultNumber = null;
                vm.cd4Entry.resultText = null;
            }
        });

        $scope.$watch('vm.cd4Entry.resultNumber', function (newVal, oldVal) {
            if (newVal == null) {
                vm.cd4Entry.resultText = null;
            } else {
                vm.cd4Entry.resultText = vm.cd4Entry.resultNumber + ' t??? b??o CD4';
            }
        });

        /**
         * Save the test entry
         */
        vm.saveCD4Entry = function () {
            blockUI.start();

            // Validate
            if (!vm.cd4Entry.sampleDate) {
                toastr.error('Vui l??ng nh???p ng??y l???y m???u.', 'Th??ng b??o');
                focusFlatPick('vm.cd4Entry.sampleDate');
                blockUI.stop();
                return;
            }

            let mSampleDate = moment(vm.cd4Entry.sampleDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ng??y l???y m???u kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                focusFlatPick('vm.cd4Entry.sampleDate');
                blockUI.stop();
                return;
            }

            // if (mSampleDate.isBefore(vm.patient.arvStartDate)) {
            //     toastr.error('Ng??y l???y m???u kh??ng th??? tr?????c ng??y b???t ?????u ??i???u tr??? ARV.', 'Th??ng b??o');
            //     focusFlatPick('vm.cd4Entry.sampleDate');
            //     blockUI.stop();
            //     return;
            // }

            if (!vm.cd4Entry.reasonForTesting) {
                toastr.error('Vui l??ng nh???p l?? do x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.cd4Entry.reasonForTesting');
                blockUI.stop();
                return;
            }

            if (vm.cd4Entry.resultAvailable) {
                if (!vm.cd4Entry.resultDate) {
                    toastr.error('Vui l??ng nh???p ng??y c?? k???t qu???.', 'Th??ng b??o');
                    focusFlatPick('vm.cd4Entry.resultDate');
                    blockUI.stop();
                    return;
                }

                let mResultDate = moment(vm.cd4Entry.resultDate);
                if (mResultDate.isAfter(new Date())) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                    focusFlatPick('vm.cd4Entry.resultDate');
                    blockUI.stop();
                    return;
                }

                if (mSampleDate.isAfter(vm.cd4Entry.resultDate)) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? tr?????c ng??y l???y m???u.', 'Th??ng b??o');
                    focusFlatPick('vm.cd4Entry.resultDate');
                    blockUI.stop();
                    return;
                }

                if (vm.cd4Entry.resultNumber == null || vm.cd4Entry.resultNumber < 0) {
                    toastr.error('Vui l??ng nh???p k???t qu??? ph?? h???p.', 'Th??ng b??o');
                    focus('vm.cd4Entry.resultNumber');
                    blockUI.stop();
                    return;
                }
            }

            if (!vm.filter.noResultOnly) {
                // Copy the active organization
                vm.cd4Entry.organization = {id: vm.patient.organization.id};

                // Copy the case
                vm.cd4Entry.theCase = {id: vm.patient.theCase.id};
            }

            // Assign the test type
            vm.cd4Entry.testType = 'CD4';
            // vm.cd4Entry.sampleSite = vm.cd4Entry.organization.name;

            // Submit
            labTestService.saveEntry(vm.cd4Entry, function success() {
                blockUI.stop();
                toastr.info('B???n ???? l??u y??u c???u x??t nghi???m th??nh c??ng!', 'Th??ng b??o');
            }, function failure() {
                blockUI.stop();
                toastr.error('C?? l???i x???y ra khi l??u y??u c???u x??t nghi???m!', 'Th??ng b??o');
            }).then(function (data) {

                // Close the modal
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // Refresh the data table
                vm.getEntries();

                // clear the entry
                vm.cd4Entry = {};
            });
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

        /***
         * -------------------------------------------------
         *  Shared functions across controllers
         * -------------------------------------------------
         */

        vm.invalidPatientAlert = function () {
            toastr.error('Kh??ng t??m th???y th??ng tin b???nh nh??n ph?? h???p!', 'Th??ng b??o');
            $state.go('application.treatment');
        };

        // Get the previously selected patient
        vm.getSelectedPatient = function () {

            let selPatientId = $stateParams.id || 0;

            if (selPatientId && selPatientId > 0) {

                // display all CD4 tests for a specified patient
                vm.filter.noResultOnly = false;

                blockUI.start();
                service.getPatient(selPatientId).then(function (data) {
                    vm.patient = data;
                    blockUI.stop();

                    if (!vm.patient || !vm.patient.id) {
                        vm.invalidPatientAlert();
                        return;
                    }

                    // Check if the selected patient is editable
                    service.checkEditable(vm.patient, data, $scope.isSiteManager($scope.currentUser));
                    $scope.patientEditableChecked = true;
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selPatientId);

            } else {
                $scope.patientEditableChecked = true;
                // display tests that don't have results
                vm.getEntries();
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

        /***
         * -------------------------------------------------
         *  End: Shared functions across controllers
         * -------------------------------------------------
         */
    }

})();
