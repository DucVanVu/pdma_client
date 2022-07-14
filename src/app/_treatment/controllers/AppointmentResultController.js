/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('AppointmentResultController', AppointmentResultController);

    AppointmentResultController.$inject = [
        '$rootScope',
        '$scope',
        '$q',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        '$location',
        'blockUI',
        'toastr',
        '$cookies',
        'Utilities',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'bsTableAPI',
        'hotkeys',
        'scrollToElement',
        '$window',

        'PatientService',
        'AppointmentService',
        'MMDispensingService',
        'ClinicalStageService',
        'LabTestService',
        'HepatitisService',
        'SHIInterviewService',
        'OrganizationService',
        'TreatmentService',
        'RegimenService',
        'TBTreatment2Service',
        'TBProphylaxis2Service',
        'TBProphylaxisDispense2Service'
    ];

    function AppointmentResultController($rootScope, $scope, $q, $http, $timeout, settings, modal, $state, $stateParams, $location, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, bsTableAPI, hotkeys, scrollToElement, $window, service, appService, mmdService, cStageService, labTestService, hepService, shiService, orgService, treatmentService, regimenService, tb2Service, tbProphylaxis2Service, tbProphylaxisDispense2Service) {
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

        vm.initialized = false;
        vm.patient = {};
        vm.originEntry = {};
        vm.entry = {};
        vm.entries = []; // all appointments

        vm.regimens = []; // this patient's regimens

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.filter = {
            keyword: '',
            includeLate: true
        };

        vm.whoStages = [
            {id: 1, name: 'GĐLS 1'},
            {id: 2, name: 'GĐLS 2'},
            {id: 3, name: 'GĐLS 3'},
            {id: 4, name: 'GĐLS 4'}
        ];

        vm.tbScreenResults = [
            {id: 1, name: 'Dương tính'},
            {id: 2, name: 'Âm tính'}
        ];

        vm.drugSources = [
            {id: 'SHI', name: 'Bảo hiểm'},
            {id: 'PEPFAR', name: 'PEPFAR'},
            {id: 'GF', name: 'Quỹ toàn cầu'},
            {id: 'NATIONAL', name: 'Ngân sách'},
            {id: 'SELF', name: 'Tự chi trả'},
            {id: 'OTHER', name: 'Nguồn khác'}
        ];

        vm.originScreen = $stateParams.origin ? $stateParams.origin : 'edit';

        // ---------------------------------------------------------------------
        // BEGIN: Confirm the user before leaving the page if the entry is dirty
        // ---------------------------------------------------------------------

        let windowElement = angular.element($window);
        /**
         * When selecting an appointment
         * @param entryId
         */
        vm.selectAppointment = function (entryId) {
            if (!entryId) {
                toastr.warning('Không tìm thấy thông tin lịch hẹn khám.', 'Thông báo');
                return;
            }

            if (vm.entry.dirty) {
                let ret = confirm('Bạn chưa lưu thông tin lần khám. Bạn có thực sự muốn thoát khỏi màn hình khám bệnh không?');

                if (!ret) {
                    return;
                } else {
                    $timeout(function () {
                        windowElement.off('beforeunload');
                    }, 100);
                }
            }

            $state.go('application.treatment_appointment_result', {caseOrgId: vm.patient.id, appId: entryId});
        };

        /**
         * When click on other links
         */
        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (vm.entry.dirty) {
                let ret = confirm('Bạn chưa lưu thông tin lần khám. Bạn có thực sự muốn thoát khỏi màn hình khám bệnh không?');

                if (!ret) {
                    event.preventDefault();
                } else {
                    $timeout(function () {
                        windowElement.off('beforeunload');
                    }, 100);
                }
            }
        });

        // When refresh the page
        windowElement.on('beforeunload', function (e) {
            if (vm.entry.dirty) {
                return 'Bạn chưa lưu thông tin lần khám. Bạn có thực sự muốn thoát khỏi màn hình khám bệnh không?';
            }
        });

        // ---------------------------------------------------------------------
        // END: Confirm the user before leaving the page if the entry is dirty
        // ---------------------------------------------------------------------

        // -------------------------------------------------
        // BEGIN: Get selected date form session storage
        // -------------------------------------------------

        // let selDate = sessionStorage.getItem(appService.SELECTED_DATE);
        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        vm.filter.fromDate = vm.selectedDate;
        vm.filter.toDate = vm.selectedDate;

        // -------------------------------------------------
        // END: Get selected date form session storage
        // -------------------------------------------------

        /**
         * ------------------------------------------------
         * BEGIN: Date pickers
         * ------------------------------------------------
         */
        let datePickerOptions = {
            altFormat: 'l, d/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Chọn ngày..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto'
        };

        // Selection of arrival date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                allowInput: false,
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onChange: [function () {
                    // focus('fixed_element');
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.arrivalDate = m.add(7, 'hours').toDate();
                    }

                    // disable next appointment dates
                    if (vm.datepicker2 && vm.datepicker2.fpItem && vm.entry.arrivalDate) {
                        let dayAfterArrival = moment(vm.entry.arrivalDate).add(1, 'day').set({
                            hour: 0,
                            minute: 0,
                            second: 0
                        }).toDate();
                        vm.datepicker2.fpItem.set('minDate', dayAfterArrival);
                    }
                }]
            }, datePickerOptions),
            setDate: function (date) {
                if (date && vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.setDate(moment(date).toDate());
                }
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;

                if (vm.entry.arrivalDate) {
                    vm.entry.arrivalDateDiffs = moment(vm.entry.arrivalDate).diff(vm.entry.appointmentDate, 'days');
                    fpItem.setDate(moment(vm.entry.arrivalDate).add(7, 'hours').toDate());
                }
            }
        };

        // Selection of next appointment date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                allowInput: false,
                disable: [function (date) {
                    let dayAfterArrival = null;
                    if (vm.entry.arrivalDate) {
                        dayAfterArrival = moment(vm.entry.arrivalDate).set({
                            hour: 0,
                            minute: 0,
                            second: 0
                        });
                    }

                    // return (date.getDay() === 0 || date.getDay() === 6 || (dayAfterArrival && dayAfterArrival.isSameOrAfter(date)));
                }],
                onChange: [function () {
                    // focus('fixed_element');
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.nextAppointmentDate = m.add(7, 'hours').toDate();
                    }
                }]
            }, datePickerOptions),
            setDate: function (date) {
                if (date && vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.setDate(moment(date).toDate());
                }
            },
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.nextAppointmentDate) {
                    fpItem.setDate(moment(vm.entry.nextAppointmentDate).add(7, 'hours').toDate());
                }
            }
        };

        /**
         * ------------------------------------------------
         * END: Date pickers
         * ------------------------------------------------
         */

        /**
         * Get selected patient, appointment and normalize properties as needed
         vm.initialize */
        vm.initialize = function () {

            if (vm.initialized) {
                return;
            } else {
                vm.initialized = true;
            }

            let patientId = parseFloat($stateParams.caseOrgId);

            if (!patientId) {
                toastr.error('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
                $state.go('application.treatment_calendar');
                return;
            }

            blockUI.start();
            service.getPatient(patientId).then(function (data) {
                blockUI.stop();
                if (!data || !data.id) {
                    toastr.error('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
                    $state.go('application.treatment_calendar');
                } else {
                    angular.copy(data, vm.patient);

                    // check and see if the patient is active, otherwise return to the patient list
                    if ((vm.patient.status != 'ACTIVE' && vm.patient.status != 'TRANSFERRED_OUT' && vm.patient.status != 'DEAD' && vm.patient.status != 'LTFU') || vm.patient.theCase.deleted) {
                        let statusLabel = '';

                        if (vm.patient.theCase.deleted) {
                            statusLabel = 'đã bị xóa hồ sơ. Bạn không thể tiếp tục cập nhật thông tin thăm khám. Vui lòng liên hệ với tuyến tỉnh để phục hồi hồ sơ nếu muốn tiếp tục.';
                        } else {
                            let status = vm.patient.status;
                            switch (status) {
                                case 'TRANSFERRED_OUT':
                                    statusLabel = 'đã chuyển đi. Bạn không thể tiếp tục cập nhật thông tin thăm khám.';
                                    break;
                                case 'PENDING_ENROLLMENT':
                                    statusLabel = 'đang chờ tiếp nhận. Vui lòng tiếp nhận để có thể nhập thông tin thăm khám.';
                                    break;
                                case 'LTFU':
                                    statusLabel = 'đã bỏ trị. Bạn không thể tiếp tục cập nhật thông tin thăm khám.';
                                    break;
                                case 'DEAD':
                                    statusLabel = 'đã tử vong. Bạn không thể tiếp tục cập nhật thông tin thăm khám.'
                                    break;
                                default:
                                    statusLabel = 'hiện đang không còn điều trị. Bạn không thể tiếp tục cập nhật thông tin thăm khám.';
                                    break;
                            }
                        }

                        // Notify user
                        alert('Bệnh nhân này ' + statusLabel);

                        $state.go('application.treatment');
                    }

                    // get all ARV regimens of this patient
                    treatmentService.getEntries({
                        caseId: vm.patient.theCase.id,
                        diseaseCode: 'HIV',
                        pageIndex: 0,
                        pageSize: 100
                    }).then(function (data) {
                        vm.regimens = [];
                        if (data.content && data.content.length > 0) {
                            vm.regimens = data.content;
                        }
                    });

                    // get appointments
                    blockUI.start();
                    appService.getAllEntries4Individual(vm.patient.theCase.id).then(function (data) {
                        blockUI.stop();
                        vm.entries = [];
                        vm.entry = {};

                        if (data && data.length > 0) {
                            angular.copy(data, vm.entries);

                            let mNext14Days = mTodayStart.add(14, 'days');
                            let selectedEntryId = parseFloat($stateParams.appId);
                            let i = 0;
                            let tmpEntry = {};

                            angular.forEach(vm.entries, function (obj) {
                                if (obj.id == selectedEntryId) {
                                    angular.copy(obj, tmpEntry);
                                }

                                // If the appointment date is <= 14 days after today than allow editable, otherwise disable
                                vm.entries[i].editable = true;
                                if (mNext14Days.isBefore(obj.appointmentDate)) {
                                    vm.entries[i].editable = false;
                                }

                                i++;
                            });

                            // If no appointment is specified then select the first in the list
                            if (!tmpEntry.id && vm.entries.length > 0) {
                                for (let i = 0; i < vm.entries.length; i++) {
                                    if (mTodayStart.isSameOrAfter(vm.entries[i].appointmentDate)) {
                                        angular.copy(vm.entries[i], tmpEntry);
                                        break;
                                    }
                                }
                            }

                            // Appointment years initialization
                            vm.appFilter.initialize();

                            // making sure the entry has appropriate data set up
                            if (!tmpEntry.id) {
                                tmpEntry.id = 0;
                            }

                            blockUI.start();
                            appService.getEntry(tmpEntry.id).then(function (data) {

                                if (data && data.id) {
                                    angular.copy(data, vm.entry);
                                    angular.copy(data, vm.originEntry);
                                }

                                if (vm.entry.id) {
                                    // Entry editable?
                                    vm.entry.editable = mNext14Days.isAfter(vm.entry.appointmentDate);

                                    // arrival date notation
                                    if (vm.entry.arrivalDate) {
                                        let arrivalDate = moment(vm.entry.arrivalDate).set({
                                            hour: 7,
                                            munite: 0,
                                            second: 0
                                        }).toDate();
                                        vm.entry.arrivalDateDiffs = moment(arrivalDate).diff(vm.entry.appointmentDate, 'days');
                                    } else {
                                        vm.entry.arrivalDateDiffs = 0;
                                    }

                                    // is this the latest entry?
                                    vm.handleAutoGenNextAppointment();

                                    // assign drug source to prev drug source if the entry arrival is not set
                                    if (!vm.originEntry.arrived && !vm.entry.drugSource && vm.entry.prevDrugSource) {
                                        vm.originEntry.drugSource = vm.originEntry.prevDrugSource; // to keep for default drugSource in the entry
                                        vm.entry.drugSource = vm.originEntry.drugSource;
                                    }

                                    // calculate the drug days/next appointment date
                                    if (vm.originEntry.clinicalStage) {
                                        vm.entry.clinicalStage = vm.originEntry.clinicalStage.stage;
                                    }

                                    // arrival date picker
                                    // set min date
                                    if (vm.datepicker1.fpItem) {
                                        let minArrivalDate = moment(vm.originEntry.appointmentDate).subtract(28, 'days').toDate();
                                        let maxArrivalDate = moment(vm.originEntry.appointmentDate).add(28, 'days').toDate();

                                        vm.datepicker1.fpItem.set('minDate', minArrivalDate);
                                        vm.datepicker1.fpItem.set('maxDate', maxArrivalDate);
                                    }

                                    if (vm.originEntry.arrivalDate) {
                                        vm.datepicker1.setDate(moment(vm.originEntry.arrivalDate).add(7, 'hours').toDate());
                                    }

                                    // Broadcast the availability of patient data
                                    $scope.$broadcast('AppointmentResultController.patient-data-available');
                                    $scope.$broadcast('AppointmentResultController.viralload-test-changed');
                                    $scope.$broadcast('AppointmentResultController.cd4-test-changed');
                                    $scope.$broadcast('AppointmentResultController.mmd-status-changed');
                                    $scope.$broadcast('AppointmentResultController.hep-changed');
                                    $scope.$broadcast('AppointmentResultController.shi-changed');
                                    $scope.$broadcast('AppointmentResultController.patient-change', vm.patient);
                                    $scope.$broadcast('AppointmentResultController.patient-tbprophylaxisdispense-change', vm.patient);
                                }

                                blockUI.stop();
                            });
                        }
                    });
                }
            });
        };

        vm.showPatientNotActiveWarning = function () {

            vm.dialog = {
                icon: 'im im-icon-Information',
                title: 'Không thể lưu thông tin',
                message: '<div class="entry-guide"><div>Bệnh nhân đã không còn điều trị từ ngày ' + moment(vm.patient.endDate).format('DD/MM/YYYY') + ', nhưng bạn lại đang chọn ngày bệnh nhân tới khám là ngày ' + moment(vm.arrivalDate).format('DD/MM/YYYY') + '. Bạn vui lòng kiểm tra lại!</div></div>',
                ok: 'OK',
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
        };

        /**
         * Save all entries for the selected dates
         */
        vm.saveEntry = function () {
            vm.submitDisabled = true;
            blockUI.start();

            if (vm.entry.arrived) {
                if (!vm.entry.arrivalDate) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Ngày bệnh nhân tới khám không hợp lệ!', 'Thông báo');
                    focusFlatPick('vm.entry.arrivalDate');
                    return;
                }

                if (!vm.entry.clinicalStage) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Vui lòng cho biết giai đoạn lâm sàng của bệnh nhân.', 'Thông báo');
                    openSelectBox('vm.entry.clinicalStage');
                    return;
                }

                if (!vm.entry.tbScreenResult) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Vui lòng cho biết kết quả sàng lọc lao của bệnh nhân.', 'Thông báo');
                    openSelectBox('vm.entry.tbScreenResult');
                    return;
                }

                if (vm.entry.theCase.arvStartDate) {

                    if (!vm.entry.drugDays) {
                        vm.toggleSubmit();
                        blockUI.stop();
                        toastr.error('Vui lòng cho biết số ngày thuốc cấp cho bệnh nhân.', 'Thông báo');
                        focus('vm.entry.drugDays');
                        return;
                    }

                    if (!vm.entry.drugSource) {
                        vm.toggleSubmit();
                        blockUI.stop();
                        toastr.error('Vui lòng cho biết nguồn thuốc ARV cấp cho bệnh nhân.', 'Thông báo');
                        openSelectBox('vm.entry.drugSource');
                        return;
                    }
                }

                if (!vm.entry.nextAppointmentDate) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Vui lòng chọn ngày hẹn tái khám cho bệnh nhân!', 'Thông báo');
                    focusFlatPick('vm.entry.nextAppointmentDate');
                    return;
                }

                // next app date
                if (vm.entry.nextAppointmentDate) {
                    let mNextAppointmentDate = moment(vm.entry.nextAppointmentDate);
                    if (mNextAppointmentDate.day() == 0 || mNextAppointmentDate.day() == 6) {
                        vm.toggleSubmit();
                        blockUI.stop();
                        toastr.error('Ngày hẹn tái khám sẽ là ' + utils.toTitleCase(mNextAppointmentDate.format('dddd, DD/MM/YYYY')) + '. Vui lòng điều chỉnh lại ngày thuốc hoặc ngày hẹn tái khám.', 'Thông báo');
                        focusFlatPick('vm.entry.nextAppointmentDate');
                        return;
                    }
                }

                // form the clinical stage object
                vm.entry.clinicalStage = {
                    stage: vm.entry.clinicalStage,
                    evalDate: vm.entry.arrivalDate
                };
            } else {
                // remove all arrival properties
                let props = ['arrivalDate', 'goodAdherence', 'hasOI', 'hasDrugAE', 'pregnant', 'clinicalStage', 'tbScreenResult', 'arvRegimenName', 'arvRegimenLine', 'drugDays', 'drugSource', 'nextAppointmentDate'];
                angular.forEach(props, function (prop) {
                    vm.entry[prop] = null;
                });
            }

            // Check data integrity with patient status
            let curStatus = vm.patient.status;
            let endDate = vm.patient.endDate;
            if ((curStatus == 'DEAD' || curStatus == 'LTFU' || curStatus == 'TRANSFERRED_OUT') && endDate) {
                if (vm.entry.arrivalDate && moment(vm.entry.arrivalDate).isAfter(endDate, 'day')) {
                    blockUI.stop();
                    vm.showPatientNotActiveWarning();
                    return;
                }

                if (moment(vm.entry.nextAppointmentDate).isAfter(endDate, 'day')) {
                    // do not create next appointment
                    vm.entry.autoGenNextAppointment = false;
                }
            }

            // arv regimen data
            if (vm.entry.arvRegimenName) {
                angular.forEach(vm.regimens, function (obj) {
                    if (obj.regimenName == vm.entry.arvRegimenName) {
                        vm.entry.arvRegimenLine = obj.regimenLine;
                    }
                });
            } else {
                vm.entry.arvRegimenName = null;
                vm.entry.arvRegimenLine = null;
            }

            // current case-org
            vm.entry.currentCaseOrg = {id: vm.patient.id, status: vm.patient.status};

            // Submission
            appService.saveEntry(vm.entry, function success() {
                toastr.clear();
                toastr.info('Bạn đã lưu thành công thông tin kết quả khám.', 'Thông báo');
                $state.go($state.$current, null, {reload: true});

                blockUI.stop();
            }, function failure() {
                // if (!silent) {
                toastr.clear();
                toastr.error('Có lỗi xảy ra khi lưu thông tin kết quả khám.', 'Thông báo');
                // }

                blockUI.stop();

                // re-enable the submit button
                vm.toggleSubmit();
            });
        };

        /**
         * Delete the current entry
         */
        vm.deleteEntry = function () {
            if (!vm.originEntry.id) {
                toastr.error('Không tìm thấy thông tin bản ghi!', 'Thông báo');
                return;
            }

            if (vm.originEntry.arrivalDate) {
                toastr.error('Không thể xóa bản ghi này vì đã ghi nhận thông tin thăm khám!', 'Thông báo');
                return;
            }

            let fullname = vm.patient.theCase.person.fullname;
            let appDate = utils.toTitleCase(moment(vm.originEntry.appointmentDate).format('dddd, DD/MM/YYYY'));
            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'Xóa lịch hẹn?',
                message: 'Bạn có thực sự muốn xóa lịch hẹn khám của bệnh nhân <span class="font-weight-600">' + fullname + '</span> vào ngày <span class="font-weight-600">' + appDate + '</span> không?',
                callback: function (answer) {
                    if (answer == 'yes') {
                        blockUI.start();
                        appService.deleteEntries([{id: vm.originEntry.id}], function success() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.info('Bạn đã xóa thành công bản ghi!', 'Thông báo');

                            $state.go($state.$current, null, {reload: true});

                        }, function failure() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.error('Có lỗi xảy ra khi xóa bản ghi!', 'Thông báo');
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
         * Temporarily disable the LTFU notification
         */
        vm.ltfuNotiDismissed = false;
        vm.dismissLTFUNotification = function () {
            if (!vm.ltfuNotiDismissed) {
                toastr.warning('Nếu không có gì thay đổi về lịch hẹn khám của bệnh nhân thì bạn sẽ vẫn nhìn thấy thông báo này lần tới.', 'Thông báo');
                vm.ltfuNotiDismissed = true;
            }
        };

        /**
         * Listen to a boolean property change event and set the value to null if the value is FALSE
         *
         * @apply for checkbox
         * @param prop
         * @constructor
         */
        vm.onBooleanPropertyChanged = function (prop) {
            if (!vm.entry[prop]) {
                vm.entry[prop] = null;
            }

            if (prop == 'vlTested' || prop == 'cd4Tested' || prop == 'hepScreened') {

                if (!vm.originEntry.id) {
                    return;
                }

                vm.originEntry[prop] = vm.entry[prop];

                $timeout(function () {
                    // silently save the entry

                    // current case-org
                    vm.originEntry.currentCaseOrg = {id: vm.patient.id, status: vm.patient.status};

                    appService.saveEntry(vm.originEntry, function success() {
                        toastr.clear();
                        toastr.info('Dữ liệu đã được lưu.', 'Thông báo');
                    }, function failure() {
                        toastr.clear();
                        toastr.error('Có lỗi xảy ra. Không lưu được dữ liệu.', 'Thông báo');
                    });
                }, 50);
            }
        };

        // fix lỗi mang thai và cho con bú
        vm.checkDateAndGender = function () {
            vm.test = vm.patient.theCase.person;
            let dateDob = moment(vm.test.dob);
            let toDay = moment();

            if (vm.test.gender == 'MALE') {
                toastr.warning('Giới tính không phù hợp.', 'Thông báo');
                return;
            }

            if ((toDay.diff(dateDob)) / (1000 * 3600 * 24 * 365) <= 13) {
                toastr.warning('Độ tuổi không phù hợp.', 'Thông báo');
                return;
            }

        };

        /**
         * Update the checkbox to auto-generate next appointment based on criteria
         */
        vm.handleAutoGenNextAppointment = function () {
            vm.entry.shouldDisableAutoGenNextApp = null;
            if (vm.entries.length > 0) {
                vm.entry.isLatestAppointment = (vm.entries[0].id == vm.entry.id);
                vm.entry.autoGenNextAppointment = vm.entry.isLatestAppointment && vm.entry.nextAppointmentDate && !vm.entry.nextAppointmentDateWarning;

                // check end date of dead/ltfu/transed out patient
                let curStatus = vm.patient.status;
                if (curStatus == 'LTFU' || curStatus == 'DEAD' || curStatus == 'TRANSFERRED_OUT') {
                    let endDate = vm.patient.endDate;
                    if (endDate && moment(endDate).isBefore(vm.entry.nextAppointmentDate, 'day')) {
                        vm.entry.autoGenNextAppointment = false;
                        vm.entry.shouldDisableAutoGenNextApp = true;
                    }
                }
            }

            if (!vm.entry.isLatestAppointment && vm.entries.length > 1) {
                if (mTodayEnd.isBefore(vm.entries[0].appointmentDate)) {
                    vm.entry.isLatestEditableAppointment = (vm.entries[1].id == vm.entry.id);
                }
            }
        };

        /**
         * On arrival change
         */
        vm.onArrivalChange = function () {
            if (!vm.entry.arrived) {
                if (!vm.originEntry.arrived) {
                    // reload page
                    $state.go($state.$current, null, {reload: true});
                }
            } else {
                if (vm.originEntry.id) {
                    // default arrival date
                    let m = moment(vm.entry.appointmentDate).set({hour: 7, minute: 0, second: 0});
                    if (m.isAfter(mTodayEnd)) {
                        m = moment().set({hour: 7, minute: 0, second: 0});
                    }

                    if (!vm.originEntry.arrived) {
                        if (m.day() == 0) {
                            m.add(-2, 'days');
                        } else if (m.day() == 6) {
                            m.add(-1, 'days');
                        }

                        vm.entry.arrivalDate = m.toDate();
                        vm.datepicker1.setDate(vm.entry.arrivalDate);
                    }

                    // default arv regimen data
                    if (!vm.originEntry.arvRegimenName) {
                        vm.entry.arvRegimenName = vm.patient.theCase.currentArvRegimenName;
                    }

                    if (!vm.originEntry.arvRegimenLine) {
                        vm.entry.arvRegimenLine = vm.patient.theCase.currentArvRegimenLine;
                    }

                    if (vm.originEntry.drugSource) {
                        vm.entry.drugSource = vm.originEntry.drugSource;
                    }
                }

                vm.calcNextAppointmentDate();
            }
        };

        /**
         * Calculate the drug days
         */
        vm.calcDrugDays = function () {
            if (vm.entry.arrived) {
                // only automatically set the drug-days if the drug days of the original entry is not set
                if (!vm.originEntry.drugDays) {
                    if (vm.entry.onMMD) {
                        vm.entry.drugDays = 84;
                    } else {
                        vm.entry.drugDays = 28;
                    }
                }
            } else {
                vm.entry.drugDays = null;
            }

            vm.calcNextAppointmentDate();
        };

        /**
         * Calculate and assign next appointment date
         */
        vm.calcNextAppointmentDate = function () {
            let ddays = parseFloat(vm.entry.drugDays);
            if (!ddays) {
                vm.entry.nextAppointmentDate = null;
            }

            if (vm.entry.arrived) {

                let mNextAppointmentDate = moment(vm.entry.appointmentDate).add(7, 'hours').add(ddays, 'days');

                if (moment(vm.entry.appointmentDate).isBefore(vm.entry.arrivalDate, 'day')) {
                    mNextAppointmentDate = moment(vm.entry.arrivalDate).add(7, 'hours').add(ddays, 'days');
                }

                if (mNextAppointmentDate.day() == 0 || mNextAppointmentDate.day() == 6) {
                    if (vm.patient.theCase.arvStartDate != null) {
                        let nextAppDate = vm.entry.nextAppointmentDate;
                        let shouldWarn = false;
                        if (nextAppDate) {
                            let mNextAppDate = moment(nextAppDate);
                            if (mNextAppDate.day() == 0 || mNextAppDate.day() == 6) {
                                shouldWarn = true;
                            }
                        } else {
                            shouldWarn = true;
                        }

                        if (shouldWarn) {
                            vm.entry.nextAppointmentDateWarning = 'Ngày hẹn tái khám sẽ là <span class="font-weight-600">' + utils.toTitleCase(mNextAppointmentDate.format('dddd, DD/MM/YYYY')) + '</span>. Vui lòng điều chỉnh lại ngày thuốc hoặc ngày hẹn tái khám.';
                        }
                    } else {
                        if (mNextAppointmentDate.day() == 0) {
                            mNextAppointmentDate.add(-2, 'days');
                        } else if (mNextAppointmentDate.day() == 6) {
                            mNextAppointmentDate.add(-1, 'days');
                        }
                    }
                } else {
                    vm.entry.nextAppointmentDateWarning = null;
                }

                if (!vm.originEntry.arrived || vm.entry.dirty) {
                    vm.entry.nextAppointmentDate = mNextAppointmentDate.toDate();
                    vm.datepicker2.setDate(vm.entry.nextAppointmentDate);
                }
            } else {
                vm.entry.nextAppointmentDate = null;
            }

            vm.handleAutoGenNextAppointment();
        };

        /**
         * ------------------------------------------------
         * BEGIN: Watchers
         * ------------------------------------------------
         */

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                vm.filter.organization = {};

                if (vm.orgsWritable && vm.orgsWritable.length > 0) {
                    angular.copy(vm.orgsWritable[0], vm.filter.organization);
                    vm.initialize();
                }
            }
        });

        $scope.$watchGroup([
            'vm.entry.arrived',
            'vm.entry.goodAdherence',
            'vm.entry.hasOI',
            'vm.entry.hasDrugAE',
            'vm.entry.pregnant',
            'vm.entry.clinicalStage',
            'vm.entry.tbScreenResult',
            'vm.entry.arvRegimenName',
            'vm.entry.drugSource',
            'vm.entry.vlTested',
            'vm.entry.cd4Tested',
            'vm.entry.note',
            'vm.entry.hepScreened'], function (newValues, oldValues, scope) {

            // MMD checking
            let goodAdherence = newValues[1];
            let hasOI = newValues[2];
            let hasDrugAE = newValues[3];
            let pregnant = newValues[4];

            vm.entry.softMmdEligible = goodAdherence && !hasOI && !hasDrugAE && !pregnant;

            vm.checkEntryDirtiness();
        });

        $scope.$watch('vm.entry.arrivalDate', function (newVal, oldVal) {
            // auto calculate drug days
            vm.calcDrugDays();

            vm.checkEntryDirtiness();

            if (vm.entry.arrivalDate) {
                vm.entry.arrivalDateDiffs = moment(vm.entry.arrivalDate).diff(vm.entry.appointmentDate, 'days');
            } else {
                vm.entry.arrivalDateDiffs = 0;
            }

            vm.entry.arrivalDateNotation = appService.getArrivalDateNotation(vm.entry.appointmentDate, newVal);

            // auto set the adherence
            if (vm.entry.arrived && vm.entry.arrivalDateDiffs <= 1 && !vm.entry.goodAdherence) {
                vm.entry.goodAdherence = true;
            }

            // Check MMD hard eligibility check
            if (vm.entry.arrivalDate) {
                let filter = {
                    organization: {id: vm.patient.organization.id},
                    theCase: {id: vm.patient.theCase.id},
                    cutpoint: vm.entry.arrivalDate
                };

                mmdService.isHardEligible(filter).then(function (result) {
                    vm.entry.hardMmdEligible = result;
                });
            }
        });

        // only calc the next appointment date when typing in the drug days
        vm.onDrugDaysChanged = function () {
            vm.calcNextAppointmentDate();
        };

        $scope.$watch('vm.entry.drugDays', function (newVal, oldVal) {
            // calculate the next appointment date
            if (newVal != oldVal) {
                vm.checkEntryDirtiness();
            }
        });

        $scope.$watch('vm.entry.nextAppointmentDate', function (newVal, oldVal) {

            vm.checkEntryDirtiness();

            if (!newVal) {
                vm.entry.nextAppointmentDateWarning = 'Bạn vui lòng cho biết ngày hẹn tái khám của bệnh nhân.';
                return;
            }

            // warning 1, the next appointment date recorded in this encounter does not match with that of the next appointment record
            let len = vm.entries.length;
            let notMatched = false;
            for (let i = 0; i < len; i++) {
                if (vm.entry.id == vm.entries[i].id) {
                    if (i > 0) {
                        let nextAppt = vm.entries[i - 1];
                        if (!moment(nextAppt.appointmentDate).isSame(vm.entry.nextAppointmentDate, 'day')) {
                            notMatched = true;
                            vm.entry.nextAppointmentDateWarning = 'Ngày hẹn tại khám đang khác với lịch tái khám đã thiết lập cho bệnh nhân (xem trong danh sách các lần hẹn khám). Vui lòng điều chỉnh lại cho khớp.';
                        }
                        break;
                    }
                }
            }

            // warning 2
            let mNextAppointmentDate = moment(newVal);
            if (mNextAppointmentDate.day() == 0 || mNextAppointmentDate.day() == 6) {
                vm.entry.nextAppointmentDateWarning = 'Ngày hẹn tái khám sẽ là <span class="font-weight-600">' + utils.toTitleCase(mNextAppointmentDate.format('dddd, DD/MM/YYYY')) + '</span>. Vui lòng điều chỉnh lại ngày thuốc hoặc ngày hẹn tái khám.';
            } else if (!notMatched) {
                vm.entry.nextAppointmentDateWarning = null;
            }
        });

        /**
         * ------------------------------------------------
         * END: Watchers
         * ------------------------------------------------
         */

        vm.checkEntryDirtiness = function () {
            let props = [
                'arrived',
                'vlTested',
                'cd4Tested',
                'hepScreened',
                'drugDays',
                'drugSource',
                'arvRegimenName',
                'arrivalDate',
                'goodAdherence',
                'clinicalStage',
                'tbScreenResult',
                'hasOI',
                'hasDrugAE',
                'pregnant',
                'nextAppointmentDate',
                'note'
            ];

            vm.entry.dirty = false;
            for (let i = 0; i < props.length; i++) {
                let prop = props[i];
                if (prop == 'arrivalDate' || prop == 'nextAppointmentDate') {
                    if (!vm.entry[prop] && !vm.originEntry[prop]) {
                        continue;
                    } else if ((!vm.entry[prop] && vm.originEntry[prop]) || (vm.entry[prop] && !vm.originEntry[prop])) {
                        vm.entry.dirty = true;
                        break;
                    } else if (!moment(vm.entry[prop]).isSame(vm.originEntry[prop], 'day')) {
                        vm.entry.dirty = true;
                        break;
                    } else {
                        vm.entry.dirty = false;
                        continue;
                    }
                } else if (prop == 'clinicalStage') {
                    if (vm.entry[prop]) {
                        if (vm.originEntry[prop]) {
                            if (vm.originEntry[prop].stage != vm.entry[prop]) {
                                vm.entry.dirty = true;
                                break;
                            }
                        } else {
                            vm.entry.dirty = true;
                            break;
                        }
                    }
                } else if (prop == 'note') {
                    if (vm.entry[prop] == null || vm.entry[prop] == "") {
                        if (vm.originEntry[prop]) {
                            vm.entry.dirty = true;
                            break;
                        }
                    } else {
                        if (vm.originEntry[prop] == null || vm.originEntry[prop] == "") {
                            vm.entry.dirty = true;
                            break;
                        } else {
                            if (vm.originEntry[prop] != vm.entry[prop]) {
                                vm.entry.dirty = true;
                                break;
                            }
                        }
                    }
                } else if (vm.entry[prop] != vm.originEntry[prop]) {
                    vm.entry.dirty = true;
                    break;
                }
            }
        };

        // Enable/disable button
        vm.submitDisabled = false;
        vm.toggleSubmit = function () {
            if (vm.submitDisabled) {
                toastr.clear();
                $timeout(function () {
                    vm.submitDisabled = false;
                }, 1000);
            } else {
                vm.submitDisabled = true;
            }
        };

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
         * -------------------------------------------------
         * BEGIN: Subcontrollers
         * -------------------------------------------------
         */
        // include viral load sub controller
        viralLoadSubController($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, labTestService, mmdService).then(function (data) {
            // post processing as needed..
        });

        // include CD4 sub controller
        cd4SubController($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, labTestService, mmdService).then(function (data) {
            // post processing as needed..
        });

        // include SHI sub controller
        shiSubController($scope, $state, $q, vm, modal, $timeout, toastr, blockUI, focusFlatPick, openSelectBox, utils, shiService, orgService).then(function (data) {
            // post processing as needed..R
        });

        // include CD4 sub controller
        hepSubController($scope, $state, $q, vm, modal, $timeout, toastr, blockUI, focusFlatPick, openSelectBox, hepService).then(function (data) {
            // post processing as needed..
        });

        // include the clinical stage sub controller
        clinicalStageSubController($state, $scope, $q, vm, modal, toastr, blockUI, $timeout, settings, cStageService).then(function (data) {
            // post processing as needed..
        });

        // include the appointment sub controller
        appointmentSubController($state, $stateParams, $timeout, $scope, $q, vm, modal, toastr, blockUI, appService).then(function (data) {
            // post processing as needed..
        });

        // include the MMD sub controller
        mmdSubController($scope, $state, $q, $timeout, settings, vm, modal, toastr, blockUI, focus, service, mmdService).then(function (data) {
            // post processing as needed..
        });

        // include TB treatment2 sub controller
        tbTreatment2SubController($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, tb2Service, settings).then(function (data) {
            // post processing as needed..
        });

        // include TB prophylaxis2 sub controller
        tbProphylaxis2SubController($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, tbProphylaxis2Service, settings, tbProphylaxisDispense2Service).then(function (data) {
            // post processing as needed..
        });

        // include TB prophylaxisDispense2 sub controller
        tbProphylaxisDispense2SubController($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, tbProphylaxisDispense2Service, settings, tbProphylaxis2Service).then(function (data) {
            // post processing as needed..
        });
        /**
         * -------------------------------------------------
         * END: Subcontrollers
         * -------------------------------------------------
         */

        /**
         * -------------------------------------------------
         * BEGIN: Hot keys
         * -------------------------------------------------
         */

        // hotkeys.add({
        //     combo: 'shift+1',
        //     description: 'Toggle arrival checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.arrived = !vm.entry.arrived;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+2',
        //     description: 'Toggle ARV dispensing checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.drugDispensed = !vm.entry.drugDispensed;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+3',
        //     description: 'Toggle VL testing checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.vlTested = !vm.entry.vlTested;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+4',
        //     description: 'Toggle CD4 testing checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.cd4Tested = !vm.entry.cd4Tested;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+5',
        //     description: 'Toggle Hep testing checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.hepScreened = !vm.entry.hepScreened;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+6',
        //     description: 'Toggle ARV DR testing checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.arvDrTested = !vm.entry.arvDrTested;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+7',
        //     description: 'Toggle TB screening checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.tbScreened = !vm.entry.tbScreened;
        //     }
        // });
        //
        // hotkeys.add({
        //     combo: 'shift+8',
        //     description: 'Toggle clinical stage checkbox',
        //     callback: function () {
        //         if (!vm.entry.editable) {
        //             return;
        //         }
        //         vm.entry.clinicalStageEvaled = !vm.entry.clinicalStageEvaled;
        //     }
        // });
        /**
         * -------------------------------------------------
         * END: Hot keys
         * -------------------------------------------------
         */

    }

})();