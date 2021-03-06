/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('AppointmentEditController', AppointmentEditController);

    AppointmentEditController.$inject = [
        '$rootScope',
        '$scope',
        '$q',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        '$filter',
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

    function AppointmentEditController($rootScope, $scope, $q, $http, $timeout, settings, modal, $state, $stateParams, $filter, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, bsTableAPI, service, appService) {
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
            pageSize: 10,
            keyword: null,
            sortField: 1
        };

        // For searching patient fo add to calendar
        vm.filter2 = {
            pageIndex: 0,
            pageSize: 5,
            keyword: null
        };

        // -------------------------------------------------
        // BEGIN: Get selected date form session storage
        // -------------------------------------------------
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

        let datePickerOptions = {
            altInput: true,
            altFormat: 'd/m/Y',
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Ch???n ng??y..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: false
        };

        // Selection of appointment date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                disable: [
                    function (date) {
                        // return true to disable
                        // return (date.getDay() === 0 || date.getDay() === 6);
                    }
                ],
                onChange: [function () {
                    focus('fixed_element');
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.selectedDate = m.add(7, 'hours').toDate();

                        vm.isResultEditable = mToday.isSameOrAfter(vm.selectedDate);
                        vm.filter.fromDate = vm.selectedDate;
                        vm.filter.toDate = vm.selectedDate;

                        // Update the storage
                        sessionStorage.setItem(appService.SELECTED_DATE, moment(vm.selectedDate).format('DD/MM/YYYY'));

                        // reload calendar
                        vm.getEntries();
                    }
                }],
                formatDate: function (date, format, locale) {
                    return 'CH???N NG??Y';
                },
                onDayCreate: function (dObj, dStr, fp, dayElem) {
                    // if (Math.random() < 0.15) {
                    //     dayElem.innerHTML += '<span class="calendar event"></span>';
                    // }
                }
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.selectedDate) {
                    fpItem.setDate(moment(vm.selectedDate).toDate());
                }
            }
        };

        /**
         * Table definition for list of daily entries
         */
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
                pagination: false,
                locale: settings.locale,
                sidePagination: 'server',
                columns: appService.getTableDefinition({sortField: vm.filter.sortField}),
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

                            vm.getEntries(false);
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

            if (!sortField || sortField < 0 || sortField > 2) {
                sortField = 1;
            }

            vm.filter.sortField = sortField;
            vm.getEntries();
        };

        /**
         * Get list of appointments for the selected date
         */
        vm.getEntries = function (reloadSearch) {
            blockUI.start();
            appService.getEntries(vm.filter).then(function (data) {

                blockUI.stop();

                vm.entries = [];
                angular.copy(data.content, vm.entries);

                vm.bsTableControl.options.columns = appService.getTableDefinition({sortField: vm.filter.sortField});
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = vm.entries.length;
                vm.bsTableControl.options.lateCount = data.extraCount;

                if (reloadSearch) {
                    let opts = {};
                    angular.copy(vm.bsTableControl4Search.options, opts);
                    opts.iconSize = Math.random();
                    opts.columns = appService.getTableDefinition4Search(vm.entries);

                    bsTableAPI('bsTableControl4Search', 'refreshOptions', opts);
                }
            });
        };

        /**
         * On selection of clinic
         */
        vm.onClinicChange = function () {
            let selOpcId = $cookies.get(service.SELECTED_OPC);
            if (selOpcId) {
                $cookies.remove(selOpcId);
            }

            if (vm.filter.organization && vm.filter.organization.id) {
                $cookies.put(service.SELECTED_OPC, vm.filter.organization.id);
            }

            vm.getEntries();
        };

        /**
         * Table definition for search result
         */
        vm.bsTableControl4Search = {
            options: {
                data: vm.patients,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                sidePagination: 'server',
                columns: appService.getTableDefinition4Search(),
            }
        };

        /**
         * Show setup appointment dialog modal
         */
        vm.showSetupAppointment = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'setup_appointment_modal.html',
                scope: $scope,
                size: 'lg'
            });

            vm.modalInstance.opened.then(function () {
                $timeout(function () {
                    focus('vm.filter2.keyword');
                }, 100);
            });

            vm.modalInstance.closed.then(function () {
            });
        };

        /**
         * Asynchronously loading patients for type-ahead input box
         */
        vm.filterPatients = function () {
            vm.typeaheadLoading = true;

            // Don't put blockUI here!
            if (vm.filter.organization && vm.filter.organization.id) {
                vm.filter2.organization = {id: vm.filter.organization.id};
            }

            service.getPatients4Appointment(vm.filter2).then(function (data) {
                let patients = [];
                if (data && data.totalElements > 0) {
                    angular.copy(data.content, patients);
                }

                vm.typeaheadLoading = false;

                vm.bsTableControl4Search.options.columns = appService.getTableDefinition4Search(vm.entries);
                vm.bsTableControl4Search.options.data = patients;
                vm.bsTableControl4Search.options.totalRows = patients.length;
                vm.bsTableControl4Search.options.actualTotalRows = data.totalElements;
            });
        };

        /**
         * Add patient with ID to the appointment list
         * @param id
         */
        $scope.addPatient2AppointmentList = function (id) {

            if (!id) {
                return;
            }

            id = parseFloat(id);

            let found = false;
            if (vm.entries && vm.entries.length > 0) {
                let length = vm.entries.length;
                let index = -1;

                for (let i = 0; i < length; i++) {
                    if (id == vm.entries[i].theCase.id) {
                        index = i;
                        break;
                    }
                }

                found = index >= 0;
            }

            if (!found) {
                if (!vm.filter.organization || !vm.filter.organization.id) {
                    toastr.warning('Vui l??ng ch???n ph??ng kh??m t??? danh s??ch!', 'Th??ng b??o');
                    openSelectBox('vm.filter.organization');
                    return;
                }

                vm.entry.appointmentDate = vm.selectedDate;
                vm.entry.theCase = {id: id};
                vm.entry.organization = {id: vm.filter.organization.id};
                vm.entry.currentCaseOrg = {status: 'ACTIVE'};

                blockUI.start();
                appService.saveEntry(vm.entry, function success() {
                    blockUI.stop();

                }, function failure() {
                    blockUI.stop();
                    toastr.error('C?? l???i khi th??m b???nh nh??n v??o danh s??ch h???n kh??m.', 'Th??ng b??o');
                }).then(function (data) {
                    if (data && data.id) {
                        toastr.info('B???n ???? th??m th??nh c??ng b???nh nh??n v??o danh s??ch h???n kh??m.', 'Th??ng b??o');
                        vm.getEntries(true);
                    } else {
                        toastr.warning('Ch??a ?????t ???????c l???ch kh??m cho b???nh nh??n. Vui l??ng th??? l???i sau.', 'Th??ng b??o');
                    }
                });
            }
        };

        /**
         * Update appointment results
         */
        vm.updateAppointmentResults = function () {
            if (!vm.isResultEditable) {
                vm.dialog = {
                    icon: 'im im-icon-Lock-3',
                    title: 'Th??ng b??o',
                    message: 'B???n ch??? c?? th??? c???p nh???t k???t qu??? kh??m cho l???ch kh??m c???a ng??y h??m nay ho???c c??c ng??y ???? qua.<br/><br/> L???ch kh??m b???n ??ang xem l?? c???a ng??y <b>' + moment(vm.selectedDate).format('DD/MM/YYYY') + '</b>.',
                    ok: '????ng l???i',
                    callback: function (answer) {
                        if (answer == 'ok') {
                            vm.modalInstance.close();
                        }
                    }
                };

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'information.html',
                    scope: $scope,
                    size: 'md'
                });

                vm.modalInstance.closed.then(function () {
                    vm.dialog = {};
                });

                return;
            }

            $state.go('application.treatment_appointment_result');
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
                        let indx = _.findIndex(vm.grantedOPCs, {'id': selOpcId});

                        if (indx >= 0) {
                            vm.filter.organization = {};
                            angular.copy(vm.grantedOPCs[indx], vm.filter.organization);
                        }
                    }

                    if (!vm.filter.organization.id) {
                        vm.filter.organization = {};
                        angular.copy(vm.orgsWritable[0], vm.filter.organization);
                    }

                    vm.getEntries();
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
        /**
         ---------------------------------------------------
         BEGIN : Export patient
         --------------------------------------------------
         **/
        vm.exportDailyAppointments = function () {
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
            appService.exportDailyAppointments(vm.filter)
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
