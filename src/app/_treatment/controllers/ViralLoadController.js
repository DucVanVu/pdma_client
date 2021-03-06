/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('ViralLoadController', ViralLoadController);

    ViralLoadController.$inject = [
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

    function ViralLoadController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, labTestService, orgService) {
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

        vm.vlEntry = {};
        vm.entries = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.opcs = [];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            testType: 'VIRAL_LOAD',
            noResultOnly: true
        };

        vm.vlTestingReasons = [
            {id: 'VL_AT_6MONTH', name: 'T???i th???i ??i???m 6 th??ng sau ART'},
            {id: 'VL_AT_12MONTH', name: 'T???i th???i ??i???m 12 th??ng sau ART'},
            {id: 'VL_ROUTINE_12MONTH', name: '?????nh k??? sau 12 th??ng'},
            {id: 'VL_FOLLOWUP_3MONTH', name: 'C?? bi???u hi???n nghi ng??? TB??T'},
            {id: 'VL_PREGNANCY', name: 'Ph??? n??? mang thai, cho con b??'},
            {id: 'VL_RECENCY', name: 'XN TLVR ????? kh???ng ?????nh nhi???m m???i'}
        ];

        vm.vlFundingSources = [
            {id: 'SHI', name: 'B???o hi???m y t???'},
            {id: 'GF', name: 'Qu??? to??n c???u'},
            {id: 'SELF', name: 'T??? chi tr???'},
            {id: 'DRIVE_C', name: 'D??? ??n Drive-C'},
            {id: 'OTHER', name: 'Ngu???n kh??c'}
        ];

        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        /**
         * Get all VL tests
         */
        vm.getEntries = function () {
            if (!vm.filter.noResultOnly && vm.patient && vm.patient.id) {
                vm.filter.theCase = {id: vm.patient.theCase.id};
            }

            labTestService.getEntries(vm.filter).then(function (data) {
                vm.entries = data.content;

                let isSiteManager = $scope.isSiteManager($scope.currentUser);

                vm.bsTableControl.options.columns = labTestService.getVLTableDefinition(isSiteManager, vm.orgsWritable, vm.filter.noResultOnly);
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

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
                columns: labTestService.getVLTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        // For sample date
        vm.vlDatepickerSample = {
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
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.vlEntry.sampleDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.vlDatepickerSample.fpItem = fpItem;
                if (vm.vlEntry.sampleDate) {
                    fpItem.setDate(moment(vm.vlEntry.sampleDate).toDate());
                }
            },
            clear: function () {
                if (vm.vlDatepickerSample.fpItem) {
                    vm.vlDatepickerSample.fpItem.clear();
                    vm.vlEntry.sampleDate = null;
                }
            }
        };

        // For result date
        vm.vlDatepickerResult = {
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
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.vlEntry.resultDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.vlDatepickerResult.fpItem = fpItem;
                if (vm.vlEntry.resultDate) {
                    fpItem.setDate(moment(vm.vlEntry.resultDate).toDate());
                }
            },
            clear: function () {
                if (vm.vlDatepickerResult.fpItem) {
                    vm.vlDatepickerResult.fpItem.clear();
                    vm.vlEntry.resultDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddVLTest = function () {

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

            vm.vlEntry = {};
            vm.vlEntry.isNew = true;
            vm.vlEntry.resultAvailable = true;
            vm.vlEntry.organization = {};

            if (vm.patient && vm.patient.organization) {
                angular.copy(vm.patient.organization, vm.vlEntry.organization);
                vm.vlEntry.sampleSite = vm.patient.organization.name;
            }

            // analyze patient data for suggestion
            labTestService.analyze(vm.vlEntry, vm.patient.theCase, vm.entries);

            // set funding source as previous by default
            if (vm.entries && vm.entries.length > 0) {
                vm.vlEntry.fundingSource = vm.entries[0].fundingSource;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'viralload_entry_edit_modal.html',
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
        $scope.editEntry = function (id, readOnly) {

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

                    vm.vlEntry = {};

                    // tweak to avoid $watcher to change resultText value when there is no resultNumber
                    if (data.resultNumber == null && data.resultText) {
                        delete data.resultNumber;
                    }

                    angular.copy(data, vm.vlEntry);

                    vm.vlEntry.readOnly = readOnly;
                    vm.vlEntry.isNew = false;
                    vm.vlEntry.resultAvailable = vm.vlEntry.resultDate != null;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'viralload_entry_edit_modal.html',
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

        $scope.$watch('vm.vlEntry.resultAvailable', function (newVal, oldVal) {
            if (oldVal == true && newVal == false) {
                vm.vlEntry.resultDate = null;
                vm.vlEntry.resultNumber = null;
                vm.vlEntry.resultText = null;
            }
        });

        $scope.$watch('vm.vlEntry.virusNotFound', function (newVal, oldVal) {
            if (newVal == true) {
                vm.vlEntry.resultNumber = 0;
            }
        });

        /**
         * On result change
         */
        vm.onVLResultChange = function () {
            vm.vlEntry.resultNumber = parseFloat(vm.vlEntry.resultNumber);
            if (isNaN(vm.vlEntry.resultNumber) || vm.vlEntry.resultNumber < 0) {
                vm.vlEntry.resultNumber = null;
            } else if (vm.vlEntry.resultNumber > 0 && vm.vlEntry.resultNumber < 1) {
                vm.vlEntry.resultNumber = 1;
            } else {
                vm.vlEntry.resultNumber = Math.ceil(vm.vlEntry.resultNumber);
            }
        };

        $scope.$watch('vm.vlEntry.resultNumber', function (newVal, oldVal) {
            if (newVal == 0) {
                vm.vlEntry.virusNotFound = true;
            } else {
                vm.vlEntry.virusNotFound = false;
            }

            if (newVal == null) {
                vm.vlEntry.resultText = '-';
            } else if (newVal <= 0) {
                vm.vlEntry.resultText = 'Kh??ng ph??t hi???n';
            } else if (newVal < 200) {
                vm.vlEntry.resultText = 'KPH - <200 b???n sao/ml';
            } else if (newVal < 1000) {
                vm.vlEntry.resultText = '200 - <1000 b???n sao/ml';
            } else {
                vm.vlEntry.resultText = '>=1000 b???n sao/ml';
            }
        });

        /**
         * Save the test entry
         */
        vm.saveVLEntry = function () {
            blockUI.start();

            // Validate
            if (!vm.vlEntry.sampleDate) {
                toastr.error('Vui l??ng nh???p ng??y l???y m???u.', 'Th??ng b??o');
                focusFlatPick('vm.vlEntry.sampleDate');
                blockUI.stop();
                return;
            }

            let mSampleDate = moment(vm.vlEntry.sampleDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ng??y l???y m???u kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                focusFlatPick('vm.vlEntry.sampleDate');
                blockUI.stop();
                return;
            }

            if (!vm.vlEntry.reasonForTesting) {
                toastr.error('Vui l??ng ch???n l?? do x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.vlEntry.reasonForTesting');
                blockUI.stop();
                return;
            }

            if (!vm.vlEntry.fundingSource) {
                toastr.error('Vui l??ng cho bi???t ngu???n kinh ph?? x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.vlEntry.fundingSource');
                blockUI.stop();
                return;
            }

            if (vm.vlEntry.resultAvailable) {
                if (!vm.vlEntry.resultDate) {
                    toastr.error('Vui l??ng nh???p ng??y c?? k???t qu???.', 'Th??ng b??o');
                    focusFlatPick('vm.vlEntry.resultDate');
                    blockUI.stop();
                    return;
                }

                let mResultDate = moment(vm.vlEntry.resultDate);
                if (mResultDate.isAfter(new Date())) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                    focusFlatPick('vm.vlEntry.resultDate');
                    blockUI.stop();
                    return;
                }

                if (mSampleDate.isAfter(vm.vlEntry.resultDate)) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? tr?????c ng??y l???y m???u.', 'Th??ng b??o');
                    focusFlatPick('vm.vlEntry.resultDate');
                    blockUI.stop();
                    return;
                }

                if (vm.vlEntry.resultNumber == null || vm.vlEntry.resultNumber < 0) {
                    toastr.error('Vui l??ng nh???p k???t qu??? ph?? h???p.', 'Th??ng b??o');
                    focus('vm.vlEntry.resultNumber');
                    blockUI.stop();
                    return;
                }
            }

            if (!vm.filter.noResultOnly) {
                // Copy the current organization
                vm.vlEntry.organization = {id: vm.patient.organization.id};

                // Copy the case
                vm.vlEntry.theCase = {id: vm.patient.theCase.id};
            }

            // Assign the test type
            vm.vlEntry.testType = 'VIRAL_LOAD';
            // vm.vlEntry.sampleSite = vm.vlEntry.organization.name;

            // Submit
            labTestService.saveEntry(vm.vlEntry, function success() {
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
                vm.vlEntry = {};
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

        vm.invalidPatientAlert = function () {
            toastr.error('Kh??ng t??m th???y th??ng tin b???nh nh??n ph?? h???p!', 'Th??ng b??o');
            $state.go('application.treatment');
        };

        // Get the previously selected patient
        vm.getSelectedPatient = function () {
            let selPatientId = $stateParams.id || 0;

            if (selPatientId && selPatientId > 0) {

                // Get all VL tests for a specified patient
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
                    service.checkEditable(vm.patient, $scope.isSiteManager($scope.currentUser));
                    $scope.patientEditableChecked = true;
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selPatientId);

            } else {
                $scope.patientEditableChecked = true;
                // get tests that don't have result yet
                vm.getEntries();
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

    }

})();
