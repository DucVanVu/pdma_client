/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('AppointmentLateController', AppointmentLateController);

    AppointmentLateController.$inject = [
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
        'bsTableAPI',

        'PatientService',
        'AppointmentService'
    ];

    function AppointmentLateController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, bsTableAPI, service, appService) {
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

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.grantedOPCs = [];

        vm.utils = utils;
        vm.entry = {}; // A new appointment entry for a patient
        vm.entries = []; // List of appointments set for the date
        vm.selectedEntries = [];

        vm.lateEntries = []; // list o late appointments to selected date

        vm.patients = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null,
            sortField: 1
        };

        // -------------------------------------------------
        // BEGIN: Get selected date form session storage
        // -------------------------------------------------
        let lateDays = parseFloat(sessionStorage.getItem(appService.LATE_DAYS));
        sessionStorage.removeItem(appService.LATE_DAYS);

        lateDays = !lateDays ? 0 : lateDays;

        let selDate = sessionStorage.getItem(appService.SELECTED_DATE);
        let mToday = moment().set({hour: 7, minute: 0, second: 0});

        if (!selDate) {
            vm.selectedDate = mToday.toDate();
        } else {
            vm.selectedDate = moment(selDate, 'DD/MM/YYYY').add(7, 'hours').toDate();
        }

        vm.isResultEditable = mToday.isSameOrAfter(vm.selectedDate);
        vm.filter.fromDate = vm.selectedDate;
        vm.filter.toDate = vm.selectedDate;

        // -------------------------------------------------
        // END: Get selected date form session storage
        // -------------------------------------------------

        vm.lateSelector = {
            value: 0,
            change: function (newMode) {
                vm.lateSelector.value = newMode;

                switch (vm.lateSelector.value) {
                    case 0:
                        vm.filter.lateDays = null;
                        break;
                    case 1:
                        vm.filter.lateDays = 84;
                        break;
                    case 2:
                        if (vm.filter.lateDays <= 0) {
                            vm.filter.value = 0;
                        }

                        if (vm.modalInstance) {
                            vm.modalInstance.close();
                        }

                        break;
                }

                vm.getEntries();
            }
        };

        /**
         * filter patients late to appointment by entering the # of late days
         */
        vm.filterLatePatients = function () {

            vm.filter.lateDays = 28;

            vm.dialog = {
                title: 'L???c b???nh nh??n mu???n kh??m',
                yesButton: 'L???c d??? li???u',
                yesButtonIcon: 'fa-filter',
                callback: function () {
                    if (typeof vm.filter.lateDays == 'undefined') {
                        toastr.warning('Vui l??ng ch???n s??? ng??y mu???n kh??m ph?? h???p!', 'Th??ng b??o');
                        return;
                    }

                    vm.lateSelector.change(2);
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'patients_missing_appointments.html',
                scope: $scope,
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        vm.bsTableControl = {
            options: {
                data: vm.lateEntries,
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
                columns: appService.getTableDefinition4Late({sortField: vm.filter.sortField}),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        /**
         * Remove an appointment
         * @param id
         */
        $scope.removeAppointment = function (id, name, date) {
            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'X??a l???ch h???n?',
                message: 'B???n c?? th???c s??? mu???n x??a l???ch h???n kh??m c???a b???nh nh??n <b>' + name + '</b> v??o ng??y ' + date + ' kh??ng?',
                callback: function (answer) {
                    if (answer == 'yes') {
                        blockUI.start();
                        appService.deleteEntries([{id: id}], function success() {
                            blockUI.stop();
                            toastr.info('B???n ???? x??a th??nh c??ng b???n ghi!', 'Th??ng b??o');

                            vm.getEntries();
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('C?? l???i x???y ra khi x??a b???n ghi!', 'Th??ng b??o');
                        })
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Mark a patient as LTFU
         * @param id
         */
        $scope.markAsLTFU = function (patientId, name) {
            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'C???p nh???t t??nh tr???ng b??? tr???',
                message: 'B???n c?? ch???c ch???n chuy???n tr???ng th??i c???a b???nh nh??n <b>' + name + '</b> th??nh b??? tr??? kh??ng?',
                callback: function (answer) {
                    if (answer == 'yes') {
                        blockUI.start();
                        service.getPatient(patientId).then(function (data) {
                            blockUI.stop();
                            if (!data || !data.id || data.status != 'ACTIVE') {
                                return;
                            }

                            vm.caseOrgUpdate = {currentObj: {}};
                            angular.copy(data, vm.caseOrgUpdate.currentObj);

                            let endDate = moment().set({'hour': 7, 'minute': 0, 'second': 0}).toDate();
                            vm.caseOrgUpdate.targetStatus = 'LTFU';
                            vm.caseOrgUpdate.currentObj.endDate = endDate;
                            vm.caseOrgUpdate.currentObj.endingReason = 'B???nh nh??n kh??ng ?????n kh??m sau 3 th??ng k??? t??? l???n h???n cu???i.';

                            blockUI.start();
                            service.updatePatientStatus(vm.caseOrgUpdate, function success() {
                                blockUI.stop();
                            }, function failure() {
                                blockUI.stop();
                                // unexpected error
                                toastr.error('C?? l???i x???y ra khi c???p nh???t tr???ng th??i ??i???u tr??? c???a b???nh nh??n.', 'Th??ng b??o');
                            }).then(function (result) {
                                switch (result) {
                                    case -1:
                                        toastr.error('C?? l???i x???y ra khi c???p nh???t tr???ng th??i ??i???u tr??? c???a b???nh nh??n.', 'Th??ng b??o');
                                        break;
                                    case 0:
                                        toastr.info('???? c???p nh???t th??nh c??ng tr???ng th??i ??i???u tr??? c???a b???nh nh??n.', 'Th??ng b??o');

                                        // reload the list
                                        vm.getEntries();

                                        break;
                                    case 1:
                                        toastr.warning('B???n kh??ng th??? th???c hi???n c???p nh???t tr???ng th??i cho h??? s?? b???nh ??n n??y.', 'Th??ng b??o');
                                        break;
                                }
                            });
                        });
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Calling API to search for patients
         *
         * @type {boolean}
         */
        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal) {
                $timeout(function () {
                    vm.getEntries();
                }, 500);
            }
        });

        /**
         * Sort the appointment list
         * @param sortField
         */
        $scope.sort = function (sortField) {

            if (!sortField || sortField < 0 || sortField > 3) {
                sortField = 1;
            }

            vm.filter.sortField = sortField;
            vm.getEntries();
        };

        /**
         * Get list of appointments for the selected date
         */
        vm.getEntries = function () {
            // get late entries
            blockUI.start();
            appService.getLateEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.lateEntries = [];
                angular.copy(data.content, vm.lateEntries);

                vm.bsTableControl.options.columns = appService.getTableDefinition4Late({sortField: vm.filter.sortField});
                vm.bsTableControl.options.data = vm.lateEntries;
                vm.bsTableControl.options.totalRows = data.totalElements;
                vm.bsTableControl.options.appointmentCount = data.extraCount;
            });
        };

        /**
         * On selection of clinic
         */
        vm.onClinicChange = function() {
            let selOpcId = $cookies.get(service.SELECTED_OPC);
            if (selOpcId) {
                $cookies.remove(selOpcId);
            }

            if (vm.filter.organization && vm.filter.organization.id) {
                $cookies.put(service.SELECTED_OPC, vm.filter.organization.id);
            }

            vm.getEntries();
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.grantedOPCs = [];

                vm.filter.organization = {};

                if (vm.orgsWritable && vm.orgsWritable.length > 0) {
                    angular.forEach(vm.orgsWritable, function (obj) {
                        if (obj.opcSite === true) {
                            vm.grantedOPCs.push({
                                id: obj.id,
                                name: obj.name,
                                province: (obj.address && obj.address.province) ? obj.address.province.name : 'Kh??ng r?? t???nh'
                            });
                        }
                    });

                    // resume
                    let selOpcId = parseFloat($cookies.get(service.SELECTED_OPC));
                    if (selOpcId && vm.grantedOPCs.length) {
                        let indx = _.findIndex(vm.grantedOPCs, {'id' : selOpcId});

                        if (indx >= 0) {
                            vm.filter.organization = {};
                            angular.copy(vm.grantedOPCs[indx], vm.filter.organization);
                        }
                    }

                    if (!vm.filter.organization || !vm.filter.organization.id) {
                        vm.filter.organization = {};
                        angular.copy(vm.orgsWritable[0], vm.filter.organization);
                    }

                    if (lateDays > 0) {
                        vm.lateSelector.change(1);
                    } else {
                        vm.getEntries();
                    }
                }
            }
        });

        /**
         * -------------------------------------------------
         * BEGIN: Shared functions
         * -------------------------------------------------
         */

        // Get the previously selected patient
        (function () {
            let selPatientId = $cookies.get(service.SELECTED_PATIENT_ID);

            if (selPatientId) {
                blockUI.start();
                service.getPatient(selPatientId, function failure() {
                    $cookies.remove(service.SELECTED_PATIENT_ID);
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();

                    if (!data || !data.id) {
                        $cookies.remove(service.SELECTED_PATIENT_ID);
                        return;
                    }

                    vm.selectedEntry = data;

                    // Age
                    vm.selectedEntry.theCase.person.age = moment().diff(vm.selectedEntry.theCase.person.dob, 'years');

                    // Gender icon
                    if (vm.selectedEntry.theCase.person.gender == 'MALE') {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-mars';
                    } else if (vm.selectedEntry.theCase.person.gender == 'FEMALE') {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-venus';
                    } else {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-genderless';
                    }
                });
            }
        })();

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
         * -------------------------------------------------
         * END: Shared functions
         * -------------------------------------------------
         */
        /**---------------------------------------------------
         BEGIN : Export patient
         --------------------------------------------------
         **/
        vm.exportLateAppointment = function () {
            let successHandler = function (data, status, headers, config) {
                blockUI.stop();

                headers = headers();

                let filename = headers['x-filename'];
                let contentType = headers['content-type'];

                let linkElement = document.createElement('a');
                try {
                    let blob = new Blob([data], {type: contentType});
                    let url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", filename);

                    let clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    console.log(ex);
                }
            };

            blockUI.start();
            appService.exportLateAppointments(vm.filter)
                .success(successHandler)
                .error(function () {
                    blockUI.stop();
                });
        };
        /**
         * -------------------------------------------------
         * END: Export patient
         * -------------------------------------------------
         */
    }

})();
