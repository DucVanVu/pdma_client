/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('AppointmentCalController', AppointmentCalController);

    AppointmentCalController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$stateParams',
        '$cookies',
        '$timeout',
        '$location',
        'settings',
        'blockUI',
        '$uibModal',
        'toastr',
        'Utilities',
        'focus',
        'bsTableAPI',

        'AppointmentService',
        'PatientService'
    ];

    function AppointmentCalController($rootScope, $scope, $state, $stateParams, $cookies, $timeout, $location, settings, blockUI, modal, toastr, utils, focus, bsTableAPI, appService, service) {
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

        vm.eventFilter = {
            organization: null,
            fromDate: null,
            toDate: null
        };

        vm.calendarItems = [];

        // Date selection to jump to
        vm.modalInstance = null;

        // Month view
        vm.fcControl = {};

        /**
         * Calendar options
         * @type {{header: boolean, defaultView: string, editable: boolean, locale: *, weekNumbers: boolean, weekNumbersWithinDays: boolean, timeFormat: string, dayNamesShort: string[], dayClick: dayClick}}
         */
        vm.fullCalendarOptions = {
            header: false,
            defaultView: 'month',
            editable: true,
            locale: settings.locale,
            weekNumbers: true,
            weekNumbersWithinDays: true,
            showNonCurrentDates: false,
            timeFormat: 'HH:mm',
            dayNamesShort: ['Ch??? Nh???t', 'Th??? Hai', 'Th??? Ba', 'Th??? T??', 'Th??? N??m', 'Th??? S??u', 'Th??? B???y']
        };

        vm.eventSources = [];

        /**
         * Click on an event in the month view
         *
         * @param calEvent
         * @param jsEvent
         * @param view
         */
        vm.fullCalendarOptions.eventClick = function (calEvent, jsEvent, view) {
            vm.selectedDate = calEvent.start._d;
            vm.openDailyAppointmentEdit();
        };

        /**
         * Click on a date in the month-view calendar
         *
         * @param date
         * @param jsEvent
         * @param view
         */
        vm.fullCalendarOptions.dayClick = function (date, jsEvent, view) {
            vm.selectedDate = date._d;
            let day = vm.selectedDate.getDay();

            // Saturday/Sunday is not applicable
            if (day == 0 || day == 6) {
                vm.dialog = {
                    title: 'Th??ng b??o',
                    message: 'Kh??ng th??? t???o ???????c l???ch kh??m v??o ng??y th??? B???y v?? Ch??? Nh???t h??ng tu???n.',
                    callback: function (confirm) {
                        if (confirm == 'ok' && vm.modalInstance) {
                            vm.modalInstance.close();
                        }
                    }
                };

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'information.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance.closed.then(function () {
                    vm.dialog = {};
                });

                return;
            }

            vm.openDailyAppointmentEdit();
        };

        vm.openDailyAppointmentEdit = function () {
            // put the date in session storage
            sessionStorage.setItem(appService.SELECTED_DATE, moment(vm.selectedDate).format('DD/MM/YYYY'));

            $state.go('application.treatment_calendar_edit');
        };

        /**
         * Get calendar events
         */
        vm.getCalendarEvents = function () {
            blockUI.start();
            appService.getCalendarEvents(vm.eventFilter).then(function (data) {

                blockUI.stop();

                vm.calendarItems = data;
                vm.countAppointments = 0;

                // Pending events
                let _AllAppointments = [];

                // Completed events
                let _ArrivedPatients = [];

                angular.forEach(vm.calendarItems, function (obj) {
                    vm.countAppointments += obj.count;
                    if (obj.arrived) {
                        _ArrivedPatients.push({
                            // eventId: obj.id,
                            title: 'BN ???? t???i: ' + obj.count,
                            start: moment(obj.appointmentDate).add(9, 'hours').set({minute: 0, second: 0}).toDate(),
                            end: moment(obj.appointmentDate).add(9, 'hours').set({minute: 0, second: 0}).toDate()
                        });
                    } else {

                        _AllAppointments.push({
                            // eventId: obj.id,
                            title: 'BN ch??a t???i: ' + obj.count,
                            start: moment(obj.appointmentDate).add(8, 'hours').set({minute: 0, second: 0}).toDate(),
                            end: moment(obj.appointmentDate).add(8, 'hours').set({minute: 0, second: 0}).toDate()
                        });
                    }
                });

                vm.eventSources = [{
                    events: _AllAppointments,
                    borderColor: '#dddddd',
                    color: '#f2f2f2',
                    textColor: '#555555'
                }, {
                    events: _ArrivedPatients,
                    borderColor: '#0d75c4',
                    color: '#8cc6f2',
                    textColor: '#333333'
                }];

                console.log(vm.eventSources);

                $timeout(function () {
                    vm.fcControl.invokeAPI('gotoDate', vm.eventFilter.fromDate);
                }, 100);
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

            if (vm.eventFilter.organization && vm.eventFilter.organization.id) {
                $cookies.put(service.SELECTED_OPC, vm.eventFilter.organization.id);
            }

            vm.getCalendarEvents();
        };

        /**
         * Get date range for calendar
         *
         * @param step
         */
        vm.getCalendarData = function (step) {
            if (!vm.currentDay) {
                vm.currentDay = moment();
            }

            vm.currentDay.add(step, 'month');
            vm.eventFilter.fromDate = vm.currentDay.startOf('month').toDate();
            vm.eventFilter.toDate = vm.currentDay.endOf('month').toDate();

            if (!vm.eventFilter.organization && !vm.eventFilter.organization.id) {
                vm.eventFilter.organization = (vm.orgsWritable && vm.orgsWritable.length > 0) ? vm.orgsWritable[0] : {id: 0};
            }

            // Get calendar items
            vm.getCalendarEvents();
        };

        // For month selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: {
                inline: true,
                altFormat: 'd/m/Y',
                altInput: true,
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({}), new monthSelectPlugin({
                    shorthand: true, //defaults to false
                    dateFormat: "Y-m-dTH:i:S", //defaults to "F Y"
                    altFormat: "F Y", //defaults to "F Y"
                })],
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                enable: [],
                disable: [],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');

                    vm.tmpSelection = m.add(7, 'hours').toDate();
                }]
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.appointmentMonth) {
                    fpItem.setDate(moment(vm.appointmentMonth).add(7, 'hours').toDate());
                }
            },
            selectMonth: function () {
                if (vm.tmpSelection) {
                    vm.appointmentMonth = vm.tmpSelection;

                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }

                    if (vm.currentDay && vm.currentDay.diff(vm.appointmentMonth, 'months', true)) {
                        $timeout(function () {
                            vm.currentDay = moment(vm.appointmentMonth);
                            vm.fcControl.invokeAPI('gotoDate', vm.appointmentMonth);

                            vm.getCalendarData(0);
                        }, 0);
                    }

                } else {
                    toastr.warning('Vui l??ng ch???n th??ng m?? b???n c???n xem l???ch kh??m.', 'Th??ng b??o');
                }
            }
        };

        /**
         * Jump to a specified month
         */
        vm.quickMonthSelection = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'select_month_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                if (vm.appointmentMonth) {
                    vm.tmpSelection = vm.appointmentMonth;
                }
            });

            vm.modalInstance.closed.then(function () {
                vm.tmpSelection = null;
            });
        };

        /**
         * Table definition for list of daily entries
         *  @application Popup dialog when clicking on a date in the calendar
         */
        vm.bsTableControl = {
            options: {
                data: [],
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                columns: appService.getTableDefinition4QuickView(vm.selectedDate),
            }
        };

        /**
         * Quick view appointments of a selected date
         */
        vm.quickViewAppointments = function (date) {

            // put the date in session storage
            sessionStorage.setItem(appService.SELECTED_DATE, moment(vm.selectedDate).format('DD/MM/YYYY'));

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'daily_appointments.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                // query for appointments today
                let filter = {
                    fromDate: vm.selectedDate,
                    toDate: vm.selectedDate,
                    organization: (vm.orgsWritable && vm.orgsWritable.length > 0) ? vm.orgsWritable[0] : {id: 0},
                    includeLate: true
                };

                blockUI.start();
                appService.getEntries(filter).then(function (data) {

                    blockUI.stop();

                    vm.bsTableControl.options.columns = appService.getTableDefinition4QuickView(vm.selectedDate);
                    vm.bsTableControl.options.data = data.content;
                    vm.bsTableControl.options.totalRows = data.totalElements;

                    vm.bsTableControl.options.todayCount = data.totalElements;
                    vm.bsTableControl.options.lateCount = data.lateCount;
                });
            });

            vm.modalInstance.closed.then(function () {
            });
        };

        /**
         * Update appointment results
         */
        vm.updateAppointmentResults = function () {
            let mToday = moment().add(7, 'hours');
            vm.dialog = {
                icon: 'im im-icon-Lock-3',
                title: 'Th??ng b??o',
                ok: '????ng l???i',
                needed: false,
                callback: function (answer) {
                    if (answer == 'ok') {
                        vm.modalInstance2.close();
                    }
                }
            };

            if (!mToday.isSameOrAfter(vm.selectedDate)) {
                vm.dialog.needed = true;
                vm.dialog.message = 'B???n ch??? c?? th??? c???p nh???t k???t qu??? kh??m cho l???ch kh??m c???a ng??y h??m nay ho???c c??c ng??y ???? qua.<br/><br/> L???ch kh??m b???n ??ang xem l?? c???a ng??y <b>' + moment(vm.selectedDate).format('DD/MM/YYYY') + '</b>.';
            } else if (vm.bsTableControl.options.totalRows <= 0) {
                vm.dialog.needed = true;
                vm.dialog.message = 'B???n ch??a ?????t h???n cho b???nh nh??n n??o v??o ng??y <b>' + moment(vm.selectedDate).format('DD/MM/YYYY') + '</b>. ????? c???p nh???t l???ch h???n, b???n c?? th??? <a href="#/opc/appointment-cal/edit">nh???n v??o ????y</a>.';
            }

            if (vm.dialog.needed == true) {
                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'information.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance2.closed.then(function () {
                    vm.dialog = {};
                });

                return;
            } else {
                vm.dialog = {};
            }


            $state.go('application.treatment_appointment_result');
        };

        /**
         * Redirect to editing
         */
        vm.redirect2AppointmentEdit = function () {
            $state.go('application.treatment_calendar_edit');
        };

        /**
         * Export daily appointments for the month to Excel file
         */
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

            // get start/end date of the month
            let mSelectedDate = moment(vm.eventFilter.fromDate);
            let monthStart = moment([mSelectedDate.year(), mSelectedDate.month()]).add(7, 'hour'); // as GMT+7 may cause trouble
            let monthEnd = moment(monthStart).endOf('month');

            let filter = {
                fromDate: monthStart.toDate(),
                toDate: monthEnd.toDate(),
                organization: vm.eventFilter.organization,
                includeLate: true
            };

            blockUI.start();
            appService.exportDailyAppointments(filter)
                .success(successHandler)
                .error(function () {
                    blockUI.stop();
                });
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.grantedOPCs = [];

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
                            vm.eventFilter.organization = {};
                            angular.copy(vm.grantedOPCs[indx], vm.eventFilter.organization);
                        }
                    }

                    if (!vm.eventFilter.organization || !vm.eventFilter.organization.id) {
                        vm.eventFilter.organization = {};
                        angular.copy(vm.orgsWritable[0], vm.eventFilter.organization);
                    }
                } else {
                    vm.eventFilter.organization = {id: 0};
                }

                vm.getCalendarData(0);
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
    }

})();
