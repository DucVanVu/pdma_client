/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('RiskInterviewController', RiskInterviewController);

    RiskInterviewController.$inject = [
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
        'Utilities',

        'PatientService',
        'RiskInterviewService',
        'DictionaryService'
    ];

    function RiskInterviewController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, focus, utils, service, riskService, dicService) {
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

        vm.risks = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };

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

        vm.invalidPatientAlert = function () {
            toastr.error('Kh??ng t??m th???y th??ng tin b???nh nh??n!', 'Th??ng b??o');
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
         * Get dictionary entries
         */
        blockUI.start();
        dicService.getMultipleEntries([{type: 'RISK'}]).then(function (data) {
            blockUI.stop();

            angular.forEach(data, function (obj) {
                switch (obj.type) {
                    case 'RISK':
                        vm.risks = obj.data;
                        break;
                    default:
                        break;
                }
            });
        });

        /**
         * Get all entry pageable
         */
        vm.getEntries = function () {
            vm.filter.theCase = {id: vm.patient.theCase.id};

            riskService.getEntries(vm.filter).then(function (data) {
                vm.entries = data.content;

                vm.bsTableControl.options.columns = riskService.getTableDefinition(vm.orgsWritable, $scope.isSiteManager($scope.currentUser));
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
                columns: riskService.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        // For interview date
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
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.entry.interviewDate = m.add(7, 'hours').toDate();
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.interviewDate) {
                    fpItem.setDate(moment(vm.entry.interviewDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.interviewDate = null;
                }
            }
        };

        /**
         * Open add entry modal
         */
        vm.openAddRiskInterview = function () {

            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.riskIdentified = true;
            vm.entry.tmpRisks = {};
            vm.entry.otherRiskGroup = false;
            vm.entry.otherRiskGroupText = null;

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
            riskService.getEntry(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.entry = {};
                    angular.copy(data, vm.entry);

                    vm.entry.isNew = false;
                    vm.entry.otherRiskGroup = (vm.entry.otherRiskGroupText != null) && (vm.entry.otherRiskGroupText.trim().length > 0);
                    vm.entry.tmpRisks = {};

                    if (vm.entry.risks && vm.entry.risks.length > 0) {
                        utils.arr2KeyValues(vm.entry.risks, vm.entry.tmpRisks);
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
                    riskService.deleteEntries([{id: id}], function success() {
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

        // Watchers
        $scope.$watch('vm.entry.otherRiskGroup', function (newVal, oldVal) {
            if (newVal == true) {
                focus('vm.entry.otherRiskGroupText');
            } else {
                vm.entry.otherRiskGroupText = null;
            }
        });

        $scope.$watch('vm.entry.riskIdentified', function (newVal, oldVal) {
            if (!newVal) {
                vm.entry.tmpRisks = {};
                vm.entry.risks = [];
                vm.entry.otherRiskGroup = false;
                vm.entry.otherRiskGroupText = null;
            }
        });

        /**
         * Save the entry
         *
         */
        vm.saveEntry = function () {
            blockUI.start();

            // Validate...
            if (!vm.entry.interviewDate) {
                toastr.error('Vui l??ng nh???p ng??y l???y m???u.', 'Th??ng b??o');
                blockUI.stop();
                return;
            }

            let mSampleDate = moment(vm.entry.interviewDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ng??y l???y m???u kh??ng th??? sau ng??y hi???n t???i.', 'Th??ng b??o');
                blockUI.stop();
                return;
            }

            vm.entry.risks = [];
            angular.forEach(vm.entry.tmpRisks, function (val, key) {
                if (val == true) {
                    vm.entry.risks.push({id: key});
                }
            });

            if (vm.entry.riskIdentified) {
                if (vm.entry.risks.length <= 0 && !vm.entry.otherRiskGroup) {
                    toastr.error('Vui l??ng ghi nh???n nh??m nguy c?? c???a b???nh nh??n.', 'Th??ng b??o');
                    blockUI.stop();
                    return;
                }

                if (vm.entry.otherRiskGroup && (!vm.entry.otherRiskGroupText || vm.entry.otherRiskGroupText.trim().length <= 0)) {
                    toastr.error('Vui l??ng ghi nh???n nh??m nguy c?? c???a b???nh nh??n.', 'Th??ng b??o');
                    focus('vm.entry.otherRiskGroupText');
                    blockUI.stop();
                    return;
                }
            }

            delete vm.entry.isNew;
            delete vm.entry.otherRiskGroup;
            delete vm.entry.tmpRisks;

            // Copy the active organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            // Submit...
            riskService.saveEntry(vm.entry, function success() {
                blockUI.stop();
                toastr.info('???? l??u th??ng tin k???t qu??? ph???ng v???n.', 'Th??ng b??o');
            }, function failure() {
                blockUI.stop();
                toastr.error('C?? l???i x???y ra khi l??u th??ng tin k???t qu??? ph???ng v???n.', 'Th??ng b??o');
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
