/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('HIVDRController', HIVDRController);

    HIVDRController.$inject = [
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
        'DictionaryService'
    ];

    function HIVDRController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, service, labTestService, dicService) {
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

        vm.testingReasons = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            testType: 'ARV_DR'
        };

        vm.results = [
            {id: 1, name: 'NRTI'},
            {id: 2, name: 'NNRTI'},
            {id: 3, name: 'PI'},
            {id: 4, name: 'INI'}
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
            toastr.error('Kh??ng t??m th???y th??ng tin b???nh nh??n ph?? h???p!', 'Th??ng b??o');
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
         * Get all VL tests
         */
        vm.getEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            labTestService.getEntries(vm.filter).then(function (data) {
                vm.entries = data.content;

                vm.bsTableControl.options.columns = labTestService.getDRTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
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
                columns: labTestService.getDRTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        // For sample date
        vm.datepicker1 = {
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

                    vm.entry.sampleDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.sampleDate) {
                    fpItem.setDate(moment(vm.entry.sampleDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.sampleDate = null;
                }
            }
        };

        // For result date
        vm.datepicker2 = {
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

                    vm.entry.resultDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.resultDate) {
                    fpItem.setDate(moment(vm.entry.resultDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.resultDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddDRTest = function () {

            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.resultAvailable = true;
            vm.entry.tmpResults = {};
            vm.entry.otherMutations = false;
            vm.entry.otherMutationsText = null;

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

                    vm.entry = {};

                    angular.copy(data, vm.entry);

                    vm.entry.isNew = false;
                    vm.entry.resultAvailable = vm.entry.resultDate != null;
                    vm.entry.otherMutations = false;
                    vm.entry.otherMutationsText = null;
                    vm.entry.tmpResults = {};

                    if (vm.entry.resultAvailable) {
                        if (vm.entry.resultText && vm.entry.resultText.length > 0) {
                            let arr = vm.entry.resultText.split('$$');
                            let lastMutation = arr[arr.length - 1];
                            let resultNames = [];

                            angular.forEach(vm.results, function (obj) {
                                resultNames.push(obj.name);
                            });

                            if (!resultNames.includes(lastMutation)) {
                                vm.entry.otherMutations = true;
                                vm.entry.otherMutationsText = lastMutation;
                                arr.length = arr.length - 1;
                            }

                            angular.forEach(arr, function (obj) {
                                vm.entry.tmpResults[obj] = true;
                            });
                        } else {
                            vm.entry.resultNegative = true;
                        }
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

        $scope.$watch('vm.entry.resultAvailable', function (newVal, oldVal) {
            if (oldVal == true && newVal == false) {
                vm.entry.resultDate = null;
                vm.entry.resultText = null;

                vm.entry.otherMutations = false;
            }
        });

        $scope.$watch('vm.entry.otherMutations', function (newVal, oldVal) {
            if (oldVal == true && newVal == false) {
                vm.entry.otherMutationsText = null;
            } else {
                focus('vm.entry.otherMutationsText');
            }
        });

        $scope.$watch('vm.entry.resultNegative', function (newVal, oldVal) {
            if (newVal) {
                vm.entry.tmpResults = {};
                vm.resultText = null;
                vm.entry.otherMutations = false;
                vm.entry.otherMutationsText = null;
            }
        });

        /**
         * Save the test entry
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate
            if (!vm.entry.sampleDate) {
                toastr.error('Vui l??ng nh???p ng??y l???y m???u.', 'Th??ng b??o');
                focusFlatPick('vm.entry.sampleDate');
                blockUI.stop();
                return;
            }

            let mSampleDate = moment(vm.entry.sampleDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ng??y l???y m???u kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                focusFlatPick('vm.entry.sampleDate');
                blockUI.stop();
                return;
            }

            if (vm.entry.resultAvailable) {
                if (!vm.entry.resultDate) {
                    toastr.error('Vui l??ng nh???p ng??y c?? k???t qu???.', 'Th??ng b??o');
                    focusFlatPick('vm.entry.resultDate');
                    blockUI.stop();
                    return;
                }

                let mResultDate = moment(vm.entry.resultDate);
                if (mResultDate.isAfter(new Date())) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                    focusFlatPick('vm.entry.resultDate');
                    blockUI.stop();
                    return;
                }

                if (mSampleDate.isAfter(vm.entry.resultDate)) {
                    toastr.error('Ng??y c?? k???t qu??? kh??ng th??? tr?????c ng??y l???y m???u.', 'Th??ng b??o');
                    focusFlatPick('vm.entry.resultDate');
                    blockUI.stop();
                    return;
                }

                // Convert results to string
                vm.entry.resultText = '';
                angular.forEach(vm.entry.tmpResults, function (val, key) {
                    if (val == true) {
                        vm.entry.resultText += key;
                        vm.entry.resultText += '$$';
                    }
                });

                if (vm.entry.otherMutations) {
                    if (!vm.entry.otherMutationsText || vm.entry.otherMutationsText.length <= 0) {
                        toastr.error('Vui l??ng ghi r?? k???t qu??? kh??c.', 'Th??ng b??o');
                        focus('vm.entry.otherMutationsText');
                        blockUI.stop();
                        return;
                    }

                    vm.entry.resultText += vm.entry.otherMutationsText.toUpperCase();
                }

                let rt = vm.entry.resultText;
                if (rt.endsWith('$$')) {
                    vm.entry.resultText = rt.substring(0, rt.length - 2);
                }

                if (vm.entry.resultNegative) {
                    vm.entry.resultText = null;
                } else {
                    if (!vm.entry.resultText || vm.entry.resultText.length <= 0) {
                        toastr.error('Vui l??ng ch???n k???t qu??? x??t nghi???m.', 'Th??ng b??o');
                        blockUI.stop();
                        return;
                    }
                }
            }

            // Copy the active organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            // Assign the test type
            vm.entry.reasonForTesting = null;
            vm.entry.resultNumber = 0;
            vm.entry.testType = 'ARV_DR';

            // Submit
            labTestService.saveEntry(vm.entry, function success() {
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
                vm.entry = {};
            });
        };
    }

})();
