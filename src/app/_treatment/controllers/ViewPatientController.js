/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('ViewPatientController', ViewPatientController);

    ViewPatientController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        'blockUI',
        'toastr',
        '$cookies',
        'Utilities',
        'Upload',
        'focus',
        'focusFlatPick',
        'openSelectBox',

        'AdminUnitService',
        'HIVConfirmLabService',
        'RegimenService',
        'LabTestService',
        'HepatitisService',
        'SHIInterviewService',
        'ClinicalStageService',
        'OrganizationService',
        'SettingsService',
        'AppointmentService',
        'MMDispensingService',
        'PatientService'
    ];

    function ViewPatientController($rootScope, $scope, $http, $q, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, Upload, focus, focusFlatPick, openSelectBox, auService, confirmLabService, regimenService, labTestService, hepService, shiService, cStageService, orgService, settingsService, appService, mmdService, service) {
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
        vm.entry = {theCase: {person: {}}};
        vm.prevEntry = {};
        vm.nextEntry = {};
        vm.patient = {};

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.currentCaseOrg = {};
        vm.caseOrgUpdate = {currentObj: {}, newObj: {}};
        vm.caseOrgUpdate2 = {currentObj: {}, newObj: {}};

        vm.otherOPC = {};

        vm.clinicalStage = {};

        vm.filter = {
            pageIndex: 0,
            pageSize: 10
        };

        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        vm.fullStatusHistory = [];
        vm.patientStatuses = [
            {id: 'ACTIVE', name: 'Đang được quản lý', cssClass: 'normal'},
            {id: 'LTFU', name: 'Đã bỏ trị', cssClass: 'ltfu'},
            {id: 'DEAD', name: 'Đã tử vong', cssClass: 'dead'},
            {id: 'TRANSFERRED_OUT', name: 'Đã chuyển đi', cssClass: 'trans-out'},
            {id: 'PENDING_ENROLLMENT', name: 'Chờ tiếp nhận', cssClass: 'pending-enrollment'}
        ];

        vm.patientStatuses4Backlog = [
            {id: 'LTFU', name: 'Đã bỏ trị', cssClass: 'ltfu'},
            {id: 'DEAD', name: 'Đã tử vong', cssClass: 'dead'},
            {id: 'TRANSFERRED_OUT', name: 'Đã chuyển đi', cssClass: 'trans-out'},
        ];

        vm.originStatuses = [
            {id: 'LTFU', name: 'Bỏ trị ở cơ sở cũ'},
            {id: 'TRANSFERRED_OUT', name: 'Được cơ sở cũ chuyển đi'}
        ];

        vm.enrollmentTypes = [
            {id: 'NEWLY_ENROLLED', name: 'Đăng ký mới'},
            {id: 'RETURNED', name: 'Điều trị lại'},
            {id: 'TRANSFERRED_IN', name: 'Chuyển tới'}
        ];

        vm.statuses4Update = [];

        vm.referral = {};
        vm.referralResults = [
            {id: 1, name: 'Đã tới cơ sở tiếp nhận'},
            {id: 3, name: 'Đã tới một cơ sở khác'},
            // {id: 4, name: 'Đã quay lại cơ sở chuyển gửi'},
            {id: 2, name: 'Đã mất dấu'},
            {id: 5, name: 'Đổi cơ sở tiếp nhận'}
        ];

        vm.clinicalStages = [
            {id: 1, name: 'Giai đoạn lâm sàng 1'},
            {id: 2, name: 'Giai đoạn lâm sàng 2'},
            {id: 3, name: 'Giai đoạn lâm sàng 3'},
            {id: 4, name: 'Giai đoạn lâm sàng 4'}
        ];

        // Get other OPC
        orgService.getOrgByCode('organization_other_specified').then(function (data) {
            if (data && data.id) {
                angular.copy(data, vm.otherOPC);
            }
        });

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
            disable: [
                function (date) {
                    return moment(date).isAfter(mTodayEnd);
                }
            ],
        };

        // For patient status change date selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrgUpdate.currentObj.endDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.caseOrgUpdate.currentObj.endDate) {
                    fpItem.setDate(moment(vm.caseOrgUpdate.currentObj.endDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.caseOrgUpdate.currentObj.endDate = null;
                }
            }
        };

        // For selection of WHO stage diagnosis
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.clinicalStage.evalDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.clinicalStage.evalDate) {
                    fpItem.setDate(moment(vm.clinicalStage.evalDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.clinicalStage.evalDate = null;
                }
            }
        };

        // For arrival date to a new facility, when a patient is transed out, and the sending facility confirm the trans result
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrgUpdate.newObj.startDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.caseOrgUpdate.newObj.startDate) {
                    fpItem.setDate(moment(vm.caseOrgUpdate.newObj.startDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.caseOrgUpdate.newObj.startDate = null;
                }
            }
        };

        // For selection start date when enrolling a transferred-in patient
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: $.extend({
                inline: false,
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrgUpdate.currentObj.startDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            clear: function () {
                if (vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.clear();
                    vm.caseOrgUpdate.currentObj.startDate = null;
                }
            }
        };

        // For patient referral result date selection
        vm.datepicker5 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.referral.resultDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker5.fpItem = fpItem;
                if (vm.referral.resultDate) {
                    fpItem.setDate(moment(vm.referral.resultDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker5.fpItem) {
                    vm.datepicker5.fpItem.clear();
                    vm.referral.resultDate = null;
                }
            }
        };

        // For selection start date when re-enrolling a patient
        vm.datepicker6 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrgUpdate2.newObj.startDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            clear: function () {
                if (vm.datepicker6.fpItem) {
                    vm.datepicker6.fpItem.clear();
                    vm.caseOrgUpdate2.newObj.startDate = null;
                }
            }
        };

        // For selection end date at origin facility when re-enrolling a patient
        vm.datepicker7 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrgUpdate2.currentObj.endDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            clear: function () {
                if (vm.datepicker7.fpItem) {
                    vm.datepicker7.fpItem.clear();
                    vm.caseOrgUpdate2.currentObj.endDate = null;
                }
            }
        };

        // For case-org update: startDate
        vm.datepicker8 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrg.startDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker8.fpItem = fpItem;
                if (vm.caseOrg.startDate) {
                    fpItem.setDate(moment(vm.caseOrg.startDate).toDate());
                }
            }
        };

        // For case-org update: endDate
        vm.datepicker9 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrg.endDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker9.fpItem = fpItem;
                if (vm.caseOrg.endDate) {
                    fpItem.setDate(moment(vm.caseOrg.endDate).toDate());
                }
            }
        };

        // For case-org update: arv start date
        vm.datepicker10 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.caseOrg.arvStartDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker10.fpItem = fpItem;
                if (vm.caseOrg.arvStartDate) {
                    fpItem.setDate(moment(vm.caseOrg.arvStartDate).toDate());
                }
            }
        };

        vm.bsTableControl4Status = {
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
                sidePagination: 'server',
                columns: service.getTableDefinition4StatusHistory(),
            }
        };

        vm.bsTableControl4ClinicalStages = {
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
                singleSelect: true,
                locale: settings.locale,
                sidePagination: 'server',
                columns: cStageService.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selClinicalStage = row;
                    });
                },
                onUncheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selClinicalStage = null;
                    });
                },
            }
        };

        vm.invalidPatientAlert = function () {
            blockUI.stop();
            toastr.error('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
            $state.go('application.treatment');
        };

        // Get the previously selected patient
        vm.getSelectedPatient = function () {
            let selCaseOrgId = $stateParams.id || 0;

            if (selCaseOrgId && selCaseOrgId > 0) {
                blockUI.start();
                service.getPatient(selCaseOrgId).then(function (data) {
                    vm.entry = data;

                    if (!vm.entry || !vm.entry.id) {
                        vm.invalidPatientAlert();
                        return;
                    }

                    // replicate the entry -> vm.patient for use in the MMD sub-controller
                    angular.copy(vm.entry, vm.patient);

                    // patient status
                    vm.statuses4Update = [];
                    angular.forEach(vm.patientStatuses, function (obj) {
                        if (vm.entry.status == obj.id) {
                            vm.entry.patientStatusName = obj.name.toLowerCase();
                        } else if (obj.id !== 'PENDING_ENROLLMENT') {
                            // A valid set of statuses for patient status update
                            if (vm.entry.status == 'LTFU') {
                                if (obj.id === 'ACTIVE' || obj.id === 'DEAD') {
                                    vm.statuses4Update.push(obj);
                                }
                            } else {
                                vm.statuses4Update.push(obj);
                            }
                        }
                    });

                    // --> initialize the current obj
                    angular.copy(vm.entry, vm.caseOrgUpdate.currentObj);

                    // CD4/VL tests
                    vm.entry.theCase.cd4Values = [];
                    vm.entry.theCase.cd4SampleDates = [];

                    vm.entry.theCase.vlValues = [];
                    vm.entry.theCase.vlSampleDates = [];

                    angular.forEach(vm.entry.theCase.labTests, function (obj) {
                        switch (obj.testType) {
                            case 'CD4':
                                if (vm.entry.theCase.cd4Values.length < 6) {
                                    vm.entry.theCase.cd4Values.unshift(obj.resultNumber);
                                    vm.entry.theCase.cd4SampleDates.unshift(moment(obj.sampleDate).format('DD/MM/YYYY'));
                                }
                                break;
                            case 'VIRAL_LOAD':
                                if (vm.entry.theCase.vlValues.length < 6) {
                                    vm.entry.theCase.vlValues.unshift(obj.resultNumber);
                                    vm.entry.theCase.vlSampleDates.unshift(moment(obj.sampleDate).format('DD/MM/YYYY'));
                                }
                                break;
                            case 'ARV_DR':
                                if (!vm.entry.theCase.dr) {
                                    vm.entry.theCase.dr = {};
                                    angular.copy(obj, vm.entry.theCase.dr);
                                    if (vm.entry.theCase.dr.resultDate) {
                                        if (vm.entry.theCase.dr.resultText) {
                                            vm.entry.theCase.dr.resultText = vm.entry.theCase.dr.resultText.replace(/\$\$/g, '/');
                                        } else {
                                            vm.entry.theCase.dr.resultText = 'Không kháng thuốc ARV';
                                        }
                                    } else {
                                        vm.entry.theCase.dr.resultText = 'Chưa có kết quả';
                                    }
                                }
                                break;
                        }
                    });

                    vm.drawVLChart();
                    vm.drawCD4Chart();
                    vm.getFullTxHistory(true);

                    // clinical stages
                    vm.entry.theCase.csValues = [];
                    vm.entry.theCase.csEvalDates = [];
                    angular.forEach(vm.entry.theCase.whoStages, function (obj) {
                        vm.entry.theCase.csValues.unshift(obj.stage);
                        vm.entry.theCase.csEvalDates.unshift(moment(obj.evalDate).format('DD/MM/YYYY'));
                    });

                    vm.drawCSChart();

                    // TB information
                    if (vm.entry.theCase.tbpros && vm.entry.theCase.tbpros.length > 0) {
                        vm.entry.theCase.tbProphylaxis = {};
                        angular.copy(vm.entry.theCase.tbpros[0], vm.entry.theCase.tbProphylaxis);
                        switch (vm.entry.theCase.tbProphylaxis.result) {
                            case 1:
                                vm.entry.theCase.tbProphylaxis.resultText = 'Bỏ trị';
                                break;
                            case 2:
                                vm.entry.theCase.tbProphylaxis.resultText = 'Chưa hoàn thành';
                                break;
                            case 3:
                                vm.entry.theCase.tbProphylaxis.resultText = 'Đã hoàn thành';
                                break;
                        }
                    }

                    if (vm.entry.theCase.tbtxs && vm.entry.theCase.tbtxs.length > 0) {
                        vm.entry.theCase.tbTreatment = {};
                        angular.copy(vm.entry.theCase.tbtxs[0], vm.entry.theCase.tbTreatment);
                    }

                    vm.normalizeProperties();

                    // Hepatitis
                    if (vm.entry.theCase.hepatitises && vm.entry.theCase.hepatitises.length > 0) {
                        angular.forEach(vm.entry.theCase.hepatitises, function (obj) {
                            switch (obj.testType) {
                                case 'HEP_B':
                                    if (!vm.entry.theCase.hepB) {
                                        vm.entry.theCase.hepB = {};
                                        angular.copy(obj, vm.entry.theCase.hepB);
                                    }
                                    break;
                                case 'HEP_C':
                                    if (!vm.entry.theCase.hepC) {
                                        vm.entry.theCase.hepC = {};
                                        angular.copy(obj, vm.entry.theCase.hepC);
                                    }
                                    break;
                            }
                        });
                    }

                    // SHI Data for this case
                    if (vm.entry.theCase.shiInterviews && vm.entry.theCase.shiInterviews.length > 0) {
                        vm.entry.theCase.shi = {};
                        angular.copy(vm.entry.theCase.shiInterviews[0], vm.entry.theCase.shi);
                    }

                    service.checkEditable(vm.entry, $scope.isSiteManager($scope.currentUser));

                    blockUI.stop();
                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selCaseOrgId);

            } else {
                vm.invalidPatientAlert();
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
         * Clear the selected patient from $cookies
         */
        vm.clearSelectedPatient = function () {
            $cookies.remove(service.SELECTED_PATIENT_ID);

            // -> then return to the main page
            $state.go('application.treatment');
        };

        /**
         * For patient summary purpose
         */
        vm.normalizeProperties = function () {
            if (!vm.entry) {
                return;
            }

            // Refresh photo...
            // vm.patientPhoto.refreshPhoto();
            vm.refreshBarcode();

            // Status CSS class
            angular.forEach(vm.patientStatuses, function (obj) {
                if (obj.id == vm.entry.status) {
                    vm.entry.patientStatusCssClass = obj.cssClass;
                    return;
                }
            });

            vm.currentCaseOrg = {};
            angular.copy(vm.entry, vm.currentCaseOrg);

            // Current address
            let curAddress = {};
            let resAddress = {};
            angular.forEach(vm.entry.theCase.person.locations, function (loc) {
                if (loc.addressType == 'CURRENT_ADDRESS') {
                    angular.copy(loc, curAddress);
                } else if (loc.addressType == 'RESIDENT_ADDRESS') {
                    angular.copy(loc, resAddress);
                }
            });

            let address = '';
            if (curAddress && curAddress.id) {
                if (curAddress.streetAddress) {
                    address += curAddress.streetAddress;
                    address += ', ';
                }

                if (curAddress.commune) {
                    address += curAddress.commune.name;
                    address += ', ';
                }

                if (curAddress.district) {
                    address += curAddress.district.name;
                    address += ', ';
                }

                if (curAddress.province) {
                    address += curAddress.province.name;
                }
            }

            vm.entry.theCase.currentAddress = address.length > 0 ? address : '&mdash;';

            // Permanent address
            address = '';
            if (resAddress && resAddress.id) {
                if (resAddress.streetAddress) {
                    address += resAddress.streetAddress;
                    address += ', ';
                }

                if (resAddress.commune) {
                    address += resAddress.commune.name;
                    address += ', ';
                }

                if (resAddress.district) {
                    address += resAddress.district.name;
                    address += ', ';
                }

                if (resAddress.province) {
                    address += resAddress.province.name;
                }
            }

            vm.entry.theCase.residentAddress = address.length > 0 ? address : '&mdash;';

            // Age
            vm.entry.theCase.person.age = moment().diff(vm.entry.theCase.person.dob, 'years');

            // Gender icon
            if (vm.entry.theCase.person.gender == 'MALE') {
                vm.entry.theCase.person.genderIcon = 'fa-mars';
            } else if (vm.entry.theCase.person.gender == 'FEMALE') {
                vm.entry.theCase.person.genderIcon = 'fa-venus';
            } else {
                vm.entry.theCase.person.genderIcon = 'fa-genderless';
            }

            // MMD
            if (vm.entry.status === 'ACTIVE') {
                let s = '';
                let firstMmd = ((vm.entry.theCase.mmdEvals && vm.entry.theCase.mmdEvals.length > 0) ? vm.entry.theCase.mmdEvals[0] : null);
                if (firstMmd) {
                    if (firstMmd.onMmd) {
                        s += '<span><span class="font-weight-600 underline-alt">Đang nhận</span> thuốc nhiều tháng</span>';
                        s += '<br />&mdash; <span class="font-weight-500">Lần gần nhất:</span> ';
                        s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                    } else {
                        if (firstMmd.eligible) {
                            s += '<span>Được đánh giá <span class="font-weight-600 underline-alt">ổn định</span></span>';
                            if (firstMmd.evaluationDate) {
                                s += ' &mdash; Ngày: ';
                                s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                            }
                        } else {
                            s += 'Chưa ổn định';
                        }
                    }
                } else {
                    s += 'Không có thông tin';
                }

                vm.entry.theCase.mmdStatusLabel = s;
            }

            // status history
            vm.getFullTxHistory();
        };

        /**
         * Edit the patient's general information
         */
        vm.openEditPatientProfile = function () {
            $state.go('application.treatment_edit_patient', {id: vm.entry.id});
        };

        /**
         * When selecting a facility to refer patient to...
         */
        vm.onNewFacilitySelection = function () {
            if (vm.caseOrgUpdate.newObj.organization && vm.caseOrgUpdate.newObj.organization.id == 0) {
                vm.caseOrgUpdate.newObj.organization = {};
                angular.copy(vm.otherOPC, vm.caseOrgUpdate.newObj.organization);
            }
        };

        /**
         * When selecting a facility to update referral result...
         */
        vm.onNewFacilitySelection2 = function () {
            if (vm.referral.newOrg && vm.referral.newOrg.id == 0) {
                vm.referral.newOrg = {};
                angular.copy(vm.otherOPC, vm.referral.newOrg);
                return;
            }

            if (vm.referral.newOrg && vm.referral.newOrg.id != vm.otherOPC.id) {
                vm.referral.newOrgName = null;
            }
        };

        /**
         * Get full patient treatment history
         * @param patientId
         */
        vm.getFullTxHistory = function (drawChart) {

            vm.prevEntry = {};

            // patient status history
            blockUI.start();
            service.getFullCaseStatusHistory(vm.entry.id).then(function (data) {
                blockUI.stop();

                vm.fullStatusHistory = [];
                angular.copy(data, vm.fullStatusHistory);

                if (vm.bsTableControl4Status) {
                    let isProvincialManager = $scope.isProvincialManager($scope.currentUser);
                    vm.bsTableControl4Status.options.columns = service.getTableDefinition4StatusHistory(isProvincialManager, vm.orgsWritable, vm.orgsReadable, vm.fullStatusHistory);
                    vm.bsTableControl4Status.options.data = data;
                }

                // Check if the patient is deletable
                // deleteable - if the patient is associated with only one organization
                let firstOrgId = null;
                let indx = 0;
                angular.forEach(vm.fullStatusHistory, function (obj) {
                    if (firstOrgId) {
                        if (firstOrgId !== obj.organization.id) {
                            vm.entry.undeleteable = true;
                        }
                    } else {
                        firstOrgId = obj.organization.id;
                    }

                    if (obj.id === vm.entry.id) {
                        // get prev case-org
                        if (vm.entry.status === 'PENDING_ENROLLMENT') {
                            let indx1 = indx + 1;
                            while (true) {
                                let nextObj = vm.fullStatusHistory[indx1++];
                                if (!nextObj || vm.prevEntry.id) {
                                    break;
                                }

                                if (nextObj.status === 'TRANSFERRED_OUT') {
                                    vm.prevEntry = {};
                                    angular.copy(nextObj, vm.prevEntry);
                                    break;
                                }
                            }
                        }

                        // get next case-org
                        if (vm.entry.status === 'TRANSFERRED_OUT' && indx > 0) {
                            let indx1 = indx - 1;
                            while (true) {
                                let nextObj = vm.fullStatusHistory[indx1--];
                                if (!nextObj || vm.nextEntry.id) {
                                    break;
                                }

                                if (nextObj.status !== 'CANCELLED_ENROLLMENT') {
                                    vm.nextEntry = {};
                                    angular.copy(nextObj, vm.nextEntry);
                                    break;
                                }
                            }
                        }
                    }

                    indx++;
                });

                // draw chart
                if (drawChart) {
                    vm.displayHistoryChart();
                }

                // Check if the entry is editable
                service.checkEditable(vm.entry, $scope.isSiteManager($scope.currentUser), vm.fullStatusHistory);

                // Check overlaps
                let ranges = [];
                angular.copy(vm.fullStatusHistory, ranges);

                let overlaps = utils.dateRangeOverlap(ranges);
                if (overlaps.overlap) {
                    vm.fullStatusHistory[0].foundOverlapsInList = true;
                }
            });
        };

        // $timeout(function () {
        //     modal.open({
        //         animation: true,
        //         templateUrl: 'record_found_confirmation.html',
        //         scope: $scope,
        //         backdrop: 'static',
        //         keyboard: false,
        //         size: 'lg'
        //     });
        // }, 1000);

        /**
         * Open the patient status history table
         */
        vm.openPatientStatusHistory = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'patient_status_history_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                vm.getFullTxHistory();
            });

            vm.modalInstance.closed.then(function () {
                vm.fullStatusHistory = [];
                vm.getSelectedPatient();
            });
        };

        /**
         * Edit patient status
         */
        vm.openEditPatientStatus = function () {

            // OPCs
            blockUI.start();
            orgService.getAllOrganizations({activeOnly: true, opcSiteOnly: true}).then(function (data) {
                blockUI.stop();

                // remove the current organization from the list
                if (data && data.length > 0) {
                    let foundIndex = -1;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].id == vm.entry.organization.id) {
                            foundIndex = i;
                            break;
                        }
                    }

                    if (foundIndex >= 0) {
                        data.splice(foundIndex, 1);
                    }
                }

                vm.opcs = [];
                angular.copy(data, vm.opcs);

                // Add 'other' to the list
                vm.opcs.unshift({id: 0, name: '--'});
                vm.opcs.unshift(vm.otherOPC);

                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'update_patient_status_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance2.closed.then(function () {
                    vm.opcs = [];
                    vm.caseOrgUpdate = {currentObj: {}, newObj: {}};
                    vm.getSelectedPatient();
                });
            });

        };

        /**
         * Save patient status
         */
        vm.savePatientStatus = function () {
            vm.submitDisabled = true;
            blockUI.stop();

            if (!vm.entry.statusEditable) {
                blockUI.stop();
                vm.toggleSubmit();

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

            // validate
            if (!vm.caseOrgUpdate.targetStatus) {
                toastr.error('Vui lòng chọn trạng thái điều trị mới.', 'Thông báo');
                openSelectBox('vm.caseOrgUpdate.targetStatus');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            if (!vm.caseOrgUpdate.currentObj.endDate) {
                toastr.error('Vui lòng chọn ' + vm.caseOrgUpdate.dateLabel, 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.endDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            let mEndDate = moment(vm.caseOrgUpdate.currentObj.endDate);
            if (mEndDate.isAfter(new Date(), 'day')) {
                toastr.error(vm.caseOrgUpdate.dateLabel + ' không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.endDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            if (mEndDate.isBefore(vm.caseOrgUpdate.currentObj.startDate, 'day')) {
                alert(vm.caseOrgUpdate.currentObj.startDate);
                toastr.error(vm.caseOrgUpdate.dateLabel + ' không thể trước ngày bệnh nhân bắt đầu điều trị.', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.endDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            // In case the patient is transferred out
            if (vm.caseOrgUpdate.targetStatus == 'TRANSFERRED_OUT') {
                vm.caseOrgUpdate.newObj.status = 'PENDING_ENROLLMENT';

                if (!vm.caseOrgUpdate.newObj.organization || !vm.caseOrgUpdate.newObj.organization.id) {
                    toastr.error('Vui lòng chọn cơ sở điều trị mới.', 'Thông báo');
                    openSelectBox('vm.caseOrgUpdate.newObj.organization');
                    blockUI.stop();
                    vm.toggleSubmit();
                    return;
                }

                if (vm.caseOrgUpdate.newObj.organization && vm.caseOrgUpdate.newObj.organization.code == 'organization_other_specified') {
                    if (!vm.caseOrgUpdate.newObj.organizationName || vm.caseOrgUpdate.newObj.organizationName.trim() == '') {
                        toastr.error('Vui lòng cho biết tên cơ sở điều trị mới.', 'Thông báo');
                        focus('vm.caseOrgUpdate.newObj.organizationName');
                        blockUI.stop();
                        vm.toggleSubmit();
                        return;
                    }
                }

                if (!vm.caseOrgUpdate.newObj.startDate) {
                    vm.caseOrgUpdate.newObj.startDate = vm.caseOrgUpdate.currentObj.endDate;
                }

                // Hai Phong request
                // If a patient is transferred to (Trai giam Gia Minh, Trai tam giam CA Hai Phong)
                // -> redirect to OPC Thuy Nguyen (650)
                if (vm.caseOrgUpdate.newObj.organization.id && (vm.caseOrgUpdate.newObj.organization.id == 654 || vm.caseOrgUpdate.newObj.organization.id == 792)) {
                    vm.caseOrgUpdate.newObj.organization.id = 650;
                }
            }

            // In case the patient return to treatment after LTFU
            if (vm.caseOrgUpdate.targetStatus == 'ACTIVE') {
                vm.caseOrgUpdate.currentObj.startDate = vm.caseOrgUpdate.currentObj.endDate;
                vm.caseOrgUpdate.currentObj.endDate = null;
            }

            service.updatePatientStatus(vm.caseOrgUpdate, function success() {
                blockUI.stop();
                vm.toggleSubmit();
            }, function failure() {
                blockUI.stop();
                vm.toggleSubmit();
                // unexpected error
                toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
            }).then(function (result) {

                switch (result) {
                    case -1:
                        // expected error
                        toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
                        break;
                    case 0:
                        toastr.info('Đã cập nhật thành công trạng thái điều trị của bệnh nhân.', 'Thông báo');

                        // reload patient record
                        vm.getSelectedPatient();
                        break;
                    case 1:
                        toastr.warning('Bạn không thể thực hiện cập nhật trạng thái cho hồ sơ bệnh án này.', 'Thông báo');
                        break;
                }

                // close the modal
                if (vm.modalInstance2) {
                    vm.modalInstance2.close();
                }

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Remove a case-org
         * @param id
         */
        $scope.removeCaseOrg = function (id) {
            if (!id) {
                toastr.warning('Mã ID của bản ghi không hợp lệ!', 'Thông báo');
                return;
            }

            blockUI.start();
            service.getCaseOrg(id).then(function (data) {

                blockUI.stop();

                if (!data || !data.id) {
                    return;
                }

                vm.dialog = {
                    icon: 'im im-icon-Flash',
                    title: 'Xóa đợt điều trị?',
                    message: 'Bạn có thực sự muốn xóa thông tin một đợt điều trị của bệnh nhân <span class="font-weight-600">' + data.theCase.person.fullname + '</span> không?',
                    callback: function (answer) {
                        if (answer == 'no') {
                            if (vm.modalInstance2) {
                                vm.modalInstance2.close();
                            }
                        }

                        if (answer == 'yes') {
                            blockUI.start();
                            service.deleteCaseOrg({id: data.id}, function success() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.info('Bạn đã xóa thành công bản ghi!', 'Thông báo');
                            }, function failure() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.error('Có lỗi xảy ra khi xóa bản ghi!', 'Thông báo');
                            }).finally(function () {

                                if (vm.modalInstance2) {
                                    vm.modalInstance2.close();
                                }

                                // if (vm.modalInstance) {
                                //     vm.modalInstance.close();
                                // }

                                $timeout(function () {
                                    vm.getFullTxHistory();
                                }, 300);
                            });
                        }
                    }
                };

                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'confirmation.html',
                    scope: $scope,
                    size: 'md'
                });

                vm.modalInstance2.closed.then(function () {
                    vm.dialog = {};
                });

            });
        };

        /**
         * Edit a case-org record
         * @param id
         */
        $scope.editCaseOrg = function (id) {
            if (!id) {
                toastr.warning('Mã ID của bản ghi không hợp lệ!', 'Thông báo');
                return;
            }

            service.getCaseOrg(id).then(function (data) {

                if (!data || !data.id) {
                    return;
                }

                vm.caseOrg = {};
                angular.copy(data, vm.caseOrg);

                function setStartDateLabel() {
                    switch (vm.caseOrg.enrollmentType) {
                        case 'NEWLY_ENROLLED':
                            vm.caseOrg.startDateLabel = 'Ngày đăng ký vào phòng khám';
                            break;
                        case 'RETURNED':
                            vm.caseOrg.startDateLabel = 'Ngày điều trị lại';
                            break;
                        case 'TRANSFERRED_IN':
                            vm.caseOrg.startDateLabel = 'Ngày tiếp nhận bệnh nhân';
                            break;
                        default:
                            vm.caseOrg.startDateLabel = 'Ngày bắt đầu tại phòng khám';
                    }
                }

                switch (data.status) {
                    case 'ACTIVE':
                        setStartDateLabel();
                        vm.caseOrg.endDateLocked = true;
                        vm.caseOrg.endDateLabel = 'Ngày kết thúc điều trị';
                        vm.caseOrg.noteLabel = 'Lý do kết thúc điều trị';
                        break;
                    case 'LTFU':
                        setStartDateLabel();
                        vm.caseOrg.endDateLabel = 'Ngày xác định bỏ trị';
                        vm.caseOrg.noteLabel = 'Lý do bỏ trị';
                        break;
                    case 'DEAD':
                        vm.caseOrg.endDateLabel = 'Ngày bệnh nhân tử vong';
                        vm.caseOrg.noteLabel = 'Nguyên nhân tử vong';
                        setStartDateLabel();
                        break;
                    case 'TRANSFERRED_OUT':
                        vm.caseOrg.endDateLabel = 'Ngày chuyển bệnh nhân đi';
                        vm.caseOrg.noteLabel = 'Lý do chuyển đi';
                        setStartDateLabel();
                        break;
                    default:
                        setStartDateLabel();
                        vm.caseOrg.endDateLabel = 'Ngày kết thúc điều trị';
                        vm.caseOrg.noteLabel = 'Lý do kết thúc điều trị';
                        break;
                }

                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'edit_case_org_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance2.closed.then(function () {
                    vm.getSelectedPatient();
                });
            });
        };

        vm.openEditPatientStatusRetrospective = function () {

            if (!vm.entry.organization) {
                toastr.error('Không tìm thấy thông tin cơ sở điều trị.', 'Thông báo');
                return;
            }

            if (!vm.entry.theCase || !vm.entry.theCase.id) {
                toastr.error('Không tìm thấy thông tin bệnh nhân.', 'Thông báo');
                return;
            }

            vm.caseOrg = {};
            vm.caseOrg.endDateLocked = false;

            vm.caseOrg.organization = {};
            vm.caseOrg.theCase = {id: vm.entry.theCase.id};

            angular.copy(vm.entry.organization, vm.caseOrg.organization);

            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'edit_case_org_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.closed.then(function () {
                vm.getSelectedPatient();
            });
        };

        /**
         * Save case-org edited data
         */
        vm.saveCaseOrg = function (opt) {
            vm.submitDisabled = true;
            blockUI.start();

            if (!vm.caseOrg) {
                vm.toggleSubmit();
                blockUI.stop();
                return;
            }

            if (!vm.caseOrg.id) {
                if (!vm.caseOrg.enrollmentType) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Vui lòng cho biết loại đăng ký vào cơ sở!', 'Thông báo');
                    openSelectBox('enrollmentType');
                    return;
                }
            }

            if (!vm.caseOrg.startDate) {
                vm.toggleSubmit();
                blockUI.stop();
                toastr.error('Ngày bắt đầu đăng ký vào cơ sở không hợp lệ!', 'Thông báo');
                focusFlatPick('caseOrgStartDate');
                return;
            }

            let mStartDate = moment(vm.caseOrg.startDate);

            if (mStartDate.isAfter(mTodayEnd, 'day')) {
                vm.toggleSubmit();
                blockUI.stop();
                toastr.error('Ngày bắt đầu đăng ký vào cơ sở không thể sau ngày hiện tại!', 'Thông báo');
                focusFlatPick('caseOrgStartDate');
                return;
            }

            if (vm.caseOrg.arvStartDate && mStartDate.isAfter(vm.caseOrg.arvStartDate, 'day')) {
                vm.toggleSubmit();
                blockUI.stop();
                toastr.error('Ngày bắt đầu nhận ARV của đợt điều trị không thể trước ngày bắt đầu đợt điều trị!', 'Thông báo');
                focusFlatPick('caseOrgArvStartDate');
                focusFlatPick('prov_caseOrgArvStartDate'); // for provincial edit
                return;
            }

            if (vm.caseOrg.status != 'ACTIVE' && vm.caseOrg.status != 'PENDING_ENROLLMENT') {
                if (!vm.caseOrg.endDate) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Ngày kết thúc điều trị tại cơ sở không hợp lệ!', 'Thông báo');
                    focusFlatPick('caseOrgEndDate'); // site manager edit
                    focusFlatPick('prov_caseOrgEndDate'); // provincial edit
                    return;
                }

                if (mStartDate.isAfter(vm.caseOrg.endDate, 'day')) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Ngày kết thúc điều trị không thể trước ngày bắt đầu điều trị tại cơ sở!', 'Thông báo');
                    focusFlatPick('caseOrgEndDate');
                    return;
                }
            } else {
                vm.caseOrg.endDate = null;
                vm.caseOrg.endingReason = null;
            }

            if (!vm.caseOrg.id) {
                // reason for ending the treatment when back log entry
                if (!vm.caseOrg.status) {
                    vm.toggleSubmit();
                    blockUI.stop();
                    toastr.error('Vui lòng cho biết lý do kết thúc đợt điều trị!', 'Thông báo');
                    openSelectBox('patientStatus');
                    return;
                }
            }

            let submission = function () {

                // console.log(vm.caseOrg);
                // blockUI.stop();
                // return;

                service.updateCaseOrg(vm.caseOrg, function success() {
                    if (vm.submitDisabled) {
                        vm.toggleSubmit();
                    }
                    blockUI.stop();
                    toastr.info('Đã cập nhật thành công thông tin thay đổi tình trạng điều trị.', 'Thông báo');

                    // reload patient
                    vm.getSelectedPatient();
                }, function failure() {
                    if (vm.submitDisabled) {
                        vm.toggleSubmit();
                    }
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi cập nhật thông tin!', 'Thông báo')
                }).finally(function (data) {

                    if (vm.modalInstance2) {
                        vm.modalInstance2.close();
                    }

                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }

                    $timeout(function () {
                        vm.getSelectedPatient();
                    }, 300);
                });
            };

            // check for date range overlapping
            let ranges = [];
            angular.copy(vm.fullStatusHistory, ranges);
            if (vm.caseOrg.id) {
                let idx = utils.indexOf(vm.caseOrg, ranges);
                if (idx >= 0) {
                    ranges.splice(idx, 1);
                }
            }

            ranges.push(vm.caseOrg);

            let overlaps = utils.dateRangeOverlap(ranges);
            if (overlaps.overlap) {
                let overlapRanges = [];
                angular.forEach(overlaps.ranges, function (obj) {
                    if (vm.caseOrg.id) {
                        if (obj.current.id == vm.caseOrg.id || obj.previous.id == vm.caseOrg.id) {
                            // found
                            overlapRanges.push(obj);
                        }
                    } else {
                        if (!obj.current.id || !obj.previous.id) {
                            // found
                            overlapRanges.push(obj);
                        }
                    }
                });

                if (overlapRanges.length > 0) {
                    blockUI.stop();
                    if (vm.submitDisabled) {
                        vm.toggleSubmit();
                    }

                    vm.dialog = {
                        title: 'Cảnh báo',
                        message: 'Ngày bắt đầu/kết thúc của đợt điều trị chồng chéo với ' + (overlapRanges.length == 1 ? 'một' : 'nhiều') + ' đợt điều trị khác. Bạn có chắc chắn muốn lưu thông tin không?',
                        callback: function (answer) {
                            vm.modalInstance3.close();
                            if (answer == 'yes') {
                                submission();
                            }
                        }
                    };

                    vm.modalInstance3 = modal.open({
                        animation: true,
                        templateUrl: 'confirmation.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance3.closed.then(function () {
                        vm.dialog = {};
                    });
                } else {
                    submission();
                }
            } else {
                submission();
            }
        };

        /**
         * Redirect to the appointment result form
         */
        vm.captureAppointmentResult = function () {
            if (vm.entry.status != 'ACTIVE') {
                toastr.error('Bệnh nhân không còn tiếp tục điều trị nên không thể cập nhật kết quả khám - cấp thuốc.', 'Thông báo');
                return;
            }

            let appId = 0;

            if (vm.entry.theCase.appointments && vm.entry.theCase.appointments.length > 0) {
                appId = vm.entry.theCase.appointments[0].id;
            }

            $state.go('application.treatment_appointment_result', {
                origin: 'view-patient',
                caseOrgId: vm.entry.id,
                appId: appId
            });
        };

        /**
         * Show clinical stages
         */
        vm.openClinicalStages = function () {

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'clinical_stages_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                blockUI.start();
                cStageService.getEntries({caseId: vm.entry.theCase.id}).then(function (data) {
                    blockUI.stop();
                    vm.bsTableControl4ClinicalStages.options.data = data;
                });
            });

            vm.modalInstance.closed.then(function () {
                vm.getSelectedPatient();
            });
        };

        /**
         * Add clinical stage
         */
        vm.addClinicalStage = function () {
            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'edit_clinical_stage_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.closed.then(function () {
                vm.clinicalStage = {};
            });
        };

        /**
         * Save clinical stage
         */
        vm.saveClinicalStage = function () {
            blockUI.start();

            if (!vm.entry.editable) {
                blockUI.stop();

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

            if (!vm.clinicalStage.stage) {
                toastr.error('Vui lòng chọn giai đoạn lâm sàng.', 'Thông báo');
                openSelectBox('vm.clinicalStage.stage');
                blockUI.stop();
                return;
            }

            if (!vm.clinicalStage.evalDate) {
                toastr.error('Vui lòng chọn ngày đánh giá giai đoạn lâm sàng.', 'Thông báo');
                focusFlatPick('vm.clinicalStage.evalDate');
                blockUI.stop();
                return;
            }

            if (moment(vm.clinicalStage.evalDate).isAfter(new Date(), 'day')) {
                toastr.error('Ngày đánh giá giai đoạn lâm sàng không được sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.clinicalStage.evalDate');
                blockUI.stop();
                return;
            }

            vm.clinicalStage.theCase = {id: vm.entry.theCase.id};
            vm.clinicalStage.organization = {id: vm.entry.organization.id};

            cStageService.saveEntry(vm.clinicalStage, function success() {
                blockUI.stop();
                toastr.info('Bạn đã lưu thành công thông tin giai đoạn lâm sàng.', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi xảy ra khi lưu thông tin giai đoạn lâm sàng.', 'Thông báo');
                vm.clinicalStage = {};
            }).then(function (data) {

                if (vm.modalInstance2) {
                    vm.modalInstance2.close();
                }

                // reload the list
                cStageService.getEntries({caseId: vm.entry.theCase.id}).then(function (data2) {
                    vm.bsTableControl4ClinicalStages.options.data = data2;
                });
            });
        };

        /**
         * Delete clinical stage
         */
        vm.deleteClinicalStage = function () {

            if (!vm.entry.editable) {
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

            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'delete_clinical_stage_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.result.then(function (confirm) {
                if (confirm == 'yes') {
                    blockUI.start();
                    cStageService.deleteEntries([vm.selClinicalStage], function success() {
                        blockUI.stop();
                        toastr.info('Bạn đã xoá thành công thông tin giai đoạn lâm sàng đã chọn.', 'Thông báo');

                        // reload the list
                        cStageService.getEntries({caseId: vm.entry.theCase.id}).then(function (data) {
                            vm.bsTableControl4ClinicalStages.options.data = data;
                        });

                        vm.selClinicalStage = null;

                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá thông tin giai đoạn lâm sàng của bệnh nhân!', 'Thông báo');

                        vm.selClinicalStage = null;
                    });
                }
            });

            vm.modalInstance2.closed.then(function () {
                //
            });
        };

        /**
         * Confirm delete of patient record
         */
        vm.confirmDeletePatient = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_patient_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    blockUI.start();
                    service.softDeletePatient(vm.entry, function success() {
                        blockUI.stop();
                        toastr.info('Bạn đã xoá thành công thông tin của bệnh nhân.', 'Thông báo');

                        $cookies.remove(service.SELECTED_PATIENT_ID);
                        $state.go($state.$current, null, {reload: true});
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá thông tin của bệnh nhân!', 'Thông báo');
                    });
                }
            });

            vm.modalInstance.closed.then(function () {
                //
            });
        };

        /**
         * restore a deleted patient record
         */
        vm.restorePatientRecord = function () {
            vm.dialog = {
                title: 'Khôi phục hồ sơ bệnh án',
                message: 'Bạn có chắc chắn muốn khôi phục hồ sơ bệnh án này không?',
                callback: function (answer) {
                    if (answer === 'yes') {
                        blockUI.start();
                        service.restorePatient(vm.entry, function success() {
                            blockUI.stop();
                            toastr.info('Bạn đã khôi phục thành công hồ sơ bệnh án của bệnh nhân.', 'Thông báo');

                            // reload patient
                            vm.getSelectedPatient();
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi khôi phục thông tin bệnh nhân!', 'Thông báo');
                        });
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Update HIVInfo ID
         */
        vm.updateHIVInfoID = function (opt) {

            if (!$scope.isProvincialManager($scope.currentUser)) {
                toastr.warning('Chỉ cán bộ tuyến tỉnh mới được phép cập nhật mã HIVInfo tại màn hình này.', 'Thông báo');
                return;
            }

            vm.dialog = {};

            if (opt == 1) {
                vm.dialog = {
                    title: 'Cập nhật mã HIVInfo',
                    message: 'Vui lòng nhập mã HIVInfo cho bệnh nhân <b>' + vm.entry.theCase.person.fullname + '</b>',
                    ok: 'Lưu lại',
                    masked: true,
                    cancel: 'Đóng lại',
                    callback: function (answer) {
                        blockUI.start();
                        if (answer == 'cancel') {
                            blockUI.stop();
                            if (vm.modalInstance) {
                                vm.modalInstance.close();
                            }

                            return;
                        }

                        if (answer == 'ok') {
                            let valid = true;
                            vm.dialog.input = vm.dialog.input ? vm.dialog.input.trim() : null;
                            if (!vm.dialog.input) {
                                valid = false;
                            } else {
                                vm.dialog.input = vm.dialog.input.replace('_', '');
                                if (!vm.dialog.input || vm.dialog.input.length != 20) {
                                    valid = false;
                                }
                            }

                            if (!valid) {
                                blockUI.stop();
                                focus('vm.dialog.input');
                                toastr.error('Mã HIVInfo không hợp lệ!', 'Thông báo');
                                return;
                            }

                            service.updateHIVInfoID({
                                id: vm.entry.theCase.id,
                                hivInfoId: vm.dialog.input
                            }, function success() {
                                toastr.clear();
                                toastr.info('Mã HIVInfo đã được cập nhật thành công.', 'Thông báo');
                                blockUI.stop();

                                // update at client site only
                                vm.entry.theCase.hivInfoId = vm.dialog.input;

                                if (vm.modalInstance) {
                                    vm.modalInstance.close();
                                }

                            }, function failure() {
                                toastr.clear();
                                toastr.error('Có lỗi xảy ra khi cập nhật mã HIVInfo.', 'Thông báo');
                                blockUI.stop();
                            });
                        }
                    }
                };

                if (vm.entry.theCase.hivInfoId) {
                    vm.dialog.input = vm.entry.theCase.hivInfoId;
                }

            } else {
                vm.dialog = {
                    title: 'Xóa mã HIVInfo',
                    message: 'Bạn có chắc chắn muốn xóa mã HIVInfo của bệnh nhân <b>' + vm.entry.theCase.person.fullname + '</b> không?',
                    callback: function (answer) {
                        blockUI.start();
                        if (answer == 'no') {
                            blockUI.stop();
                            if (vm.modalInstance) {
                                vm.modalInstance.close();
                            }

                            return;
                        }

                        if (answer == 'yes') {
                            service.removeHIVInfoID({
                                id: vm.entry.theCase.id,
                                hivInfoId: null
                            }, function success() {
                                toastr.clear();
                                toastr.info('Mã HIVInfo đã được xóa thành công.', 'Thông báo');
                                blockUI.stop();

                                // update at client site only
                                vm.entry.theCase.hivInfoId = null;

                                if (vm.modalInstance) {
                                    vm.modalInstance.close();
                                }

                            }, function failure() {
                                toastr.clear();
                                toastr.error('Có lỗi xảy ra khi xóa mã HIVInfo.', 'Thông báo');
                                blockUI.stop();
                            });
                        }
                    }
                };
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: opt == 1 ? 'input.html' : 'confirmation.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                if (opt == 1) {
                    focus('vm.dialog.input');
                }
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Patient barcode
         */
        vm.refreshBarcode = function () {
            if (!vm.entry.id) {
                return;
            }

            blockUI.start();
            service.getBarcode(vm.entry.id).success(function (data, status, headers, config) {
                blockUI.stop();

                headers = headers();
                let contentType = headers['content-type'];

                try {
                    if (data && data.byteLength > 0) {
                        let blob = new Blob([data], {type: contentType});
                        let url = window.URL.createObjectURL(blob);
                        let photoElement = angular.element(document.querySelector('#_patient_photo'));
                        photoElement.css('background-image', 'url(' + url + ')');
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }).error(function (data) {
                // console.log(data);
            });
        };

        vm.patientPhoto = {
            uploadedFile: null,
            errorFile: null,
            modalDialog: null,
            loadedImageData: '',
            cropper: {x: 0, y: 0, w: 0, h: 0, cropWidth: 300, cropHeight: 300},
            croppedImage: '',
            photoUrl: '',
            refreshPhoto: function () {
                blockUI.start();
                service.getPhoto(vm.entry.theCase.person.id).success(function (data, status, headers, config) {
                    blockUI.stop();

                    headers = headers();
                    let contentType = headers['content-type'];

                    try {
                        if (data && data.byteLength > 0) {
                            let blob = new Blob([data], {type: contentType});
                            let url = window.URL.createObjectURL(blob);
                            let photoElement = angular.element(document.querySelector('#_patient_photo'));
                            photoElement.css('background-image', 'url(' + url + ')');
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                }).error(function (data) {
                    // console.log(data);
                });
            },
            showUploadModal: function () {
                if (!$scope.currentUser || !$scope.currentUser.id) {
                    return;
                }

                vm.patientPhoto.modalDialog = modal.open({
                    animation: true,
                    templateUrl: 'upload_patient_photo_modal.html',
                    scope: $scope,
                    backdrop: 'static',
                    keyboard: false,
                    size: 'md'
                });
            },
            triggerUpload: function (file, errFiles) {
                vm.patientPhoto.uploadedFile = file;
                vm.patientPhoto.errorFile = errFiles && errFiles[0];
            },
            startUploadFile: function (file) {
                if (file) {
                    let url = settings.api.baseUrl + settings.api.apiV1Url + 'case/photo/upload/' + vm.entry.theCase.person.id;

                    file.upload = Upload.upload({
                        url: url,
                        data: {file: file}
                    }).progress(function (evt) {
                        vm.patientPhoto.uploadedFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    }).success(function (data, status, headers, config) {
                        $timeout(function () {
                            vm.patientPhoto.uploadedFile = null;
                            vm.patientPhoto.errorFile = null;
                            vm.patientPhoto.modalDialog.close();

                            blockUI.start();
                            service.getPhoto(vm.entry.theCase.person.id).success(function (data, status, headers, config) {
                                blockUI.stop();

                                headers = headers();
                                let contentType = headers['content-type'];

                                try {
                                    if (data) {
                                        let blob = new Blob([data], {type: contentType});
                                        vm.patientPhoto.photoUrl = window.URL.createObjectURL(blob);

                                        // Start cropping...
                                        vm.patientPhoto.modalDialog = modal.open({
                                            animation: true,
                                            templateUrl: 'crop_patient_photo_modal.html',
                                            scope: $scope,
                                            backdrop: 'static',
                                            keyboard: false,
                                            size: 'md'
                                        });

                                        vm.patientPhoto.modalDialog.result.then(function (confirm) {
                                            vm.patientPhoto.cropper.x = vm.patientPhoto.cropper.cropImageLeft;
                                            vm.patientPhoto.cropper.y = vm.patientPhoto.cropper.cropImageTop;
                                            vm.patientPhoto.cropper.w = vm.patientPhoto.cropper.cropImageWidth;
                                            vm.patientPhoto.cropper.h = vm.patientPhoto.cropper.cropImageHeight;
                                            vm.patientPhoto.cropper.user = $scope.currentUser;

                                            service.cropPhoto(vm.patientPhoto.cropper, vm.entry.theCase.person.id).then(function (data) {
                                                vm.patientPhoto.refreshPhoto();
                                            });
                                        });
                                    }
                                } catch (ex) {
                                    console.log(ex);
                                }
                            }).error(function (data) {
                                // console.log(data);
                            });

                        }, 500);
                    });
                }
            },
            closeUploadFile: function () {
                vm.patientPhoto.uploadedFile = null;
                vm.patientPhoto.errorFile = null;

                if (vm.patientPhoto.modalDialog) {
                    vm.patientPhoto.modalDialog.close();
                }
            }
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
            }
        });

        $scope.$watch('vm.caseOrgUpdate.targetStatus', function (newVal, oldVal) {

            // Clear vm.caseOrgUpdate.newObj
            if (oldVal == 'TRANSFERRED_OUT' && newVal != 'TRANSFERRED_OUT') {
                vm.caseOrgUpdate.newObj = {};
            }

            if (newVal) {
                switch (newVal) {
                    case 'ACTIVE':
                        vm.caseOrgUpdate.dateLabel = 'Ngày BN quay lại điều trị';
                        vm.caseOrgUpdate.noteLabel = 'Lý do bệnh nhân quay lại điều trị';
                        break;
                    case 'LTFU':
                        vm.caseOrgUpdate.dateLabel = 'Ngày xác định BN bỏ trị';
                        vm.caseOrgUpdate.noteLabel = 'Lý do bệnh nhân bỏ trị';
                        break;
                    case 'DEAD':
                        vm.caseOrgUpdate.dateLabel = 'Ngày BN tử vong';
                        vm.caseOrgUpdate.noteLabel = 'Nguyên nhân tử vong';
                        break;
                    case 'TRANSFERRED_OUT':
                        vm.caseOrgUpdate.dateLabel = 'Ngày BN được chuyển đi';
                        vm.caseOrgUpdate.noteLabel = 'Lý do chuyển bệnh nhân';
                        break;
                    default:
                        vm.caseOrgUpdate.dateLabel = 'Ngày thay đổi trạng thái';
                        vm.caseOrgUpdate.noteLabel = 'Lý do thay đổi trạng thái';
                        break;
                }
            } else {
                vm.caseOrgUpdate.dateLabel = 'Ngày thay đổi trạng thái';
                vm.caseOrgUpdate.noteLabel = 'Lý do thay đổi trạng thái';
            }
        });

        $scope.$watch('vm.caseOrgUpdate.newObj.organization', function (newVal, oldVal) {
            if (!newVal || !newVal.code || newVal.code != 'organization_other_specified') {
                vm.caseOrgUpdate.newObj.organizationName = null;
            } else {
                $timeout(function () {
                    focus('vm.caseOrgUpdate.newObj.organizationName');
                }, 100);
            }
        });

        $scope.$watch('vm.referral.newOrg', function (newVal, oldVal) {
            if (!newVal || !newVal.code || newVal.code != 'organization_other_specified') {
                vm.referral.newOrgName = null;
            } else {
                $timeout(function () {
                    focus('vm.referral.newOrgName');
                }, 100);
            }
        });

        $scope.$watch('vm.referral.result', function (newVal, oldVal) {
            switch (newVal) {
                case 1:
                    vm.referral.dateLabel = 'Ngày bệnh nhân tới cơ sở';
                    break;
                case 2:
                    vm.referral.dateLabel = 'Ngày ghi nhận thông tin';
                    break;
                case 3:
                    vm.referral.dateLabel = 'Ngày bệnh nhân tới cơ sở mới';
                    break;
                case 4:
                    vm.referral.dateLabel = 'Ngày bệnh nhân quay lại';
                    break;
                case 5:
                    vm.referral.dateLabel = 'Ngày ghi nhận thông tin';
                    break;
            }
        });

        // include the MMD sub controller
        mmdSubController($scope, $state, $q, $timeout, settings, vm, modal, toastr, blockUI, focus, service, mmdService).then(function (data) {
            // post processing as needed..
        });

        // include the treatment interruption sub controller
        txInterruptionSubController($scope, $state, $q, focus, settings, vm, modal, toastr, blockUI, $timeout, focusFlatPick, openSelectBox, orgService, service).then(function (data) {
            // post processing as needed...
        });

        // Chart for viral load
        vm.drawVLChart = function () {
            Highcharts.chart('vl_chart', {
                chart: {
                    // type: 'column',
                    height: 300,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: null,
                },
                xAxis: {
                    categories: vm.entry.theCase.vlSampleDates,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Tải lượng HIV'
                    },
                    stackLabels: {
                        enabled: false,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: true
                },
                colors: ['#2f7ed8', '#c42525', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        // stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    id: 1,
                    name: 'Tải lượng virus HIV',
                    type: 'line',
                    data: vm.entry.theCase.vlValues,
                    tooltip: {
                        valueSuffix: ' bản sao',
                        valueDecimals: 0
                    }

                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xuất tệp tin ảnh .PNG',
                    downloadJPEG: 'Xuất tệp tin ảnh .JPG',
                    downloadPDF: 'Xuất tệp tin .PDF'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF']
                        }
                    }
                }
            });
        };

        // Chart for CD4
        vm.drawCD4Chart = function () {
            Highcharts.chart('cd4_chart', {
                chart: {
                    height: 300,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: null,
                },
                xAxis: {
                    categories: vm.entry.theCase.cd4SampleDates,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Tế bào CD4'
                    },
                    stackLabels: {
                        enabled: false,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: true
                },
                colors: ['#8bbc21', '#0d233a', '#c42525', '#2f7ed8', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    id: 1,
                    name: 'Tế bào CD4',
                    type: 'line',
                    data: vm.entry.theCase.cd4Values,
                    tooltip: {
                        valueSuffix: ' tế bào',
                        valueDecimals: 0
                    }

                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xuất tệp tin ảnh .PNG',
                    downloadJPEG: 'Xuất tệp tin ảnh .JPG',
                    downloadPDF: 'Xuất tệp tin .PDF'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF']
                        }
                    }
                }
            });
        };

        // Chart for clinical stage
        vm.drawCSChart = function () {
            Highcharts.chart('clinical_stage', {
                chart: {
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: null,
                },
                xAxis: {
                    categories: vm.entry.theCase.csEvalDates,
                    crosshair: true
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: 'Giai đoạn lâm sàng'
                    },
                    stackLabels: {
                        enabled: false,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: true
                },
                colors: ['#DC143C', '#0d233a', '#c42525', '#2f7ed8', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    id: 1,
                    name: 'Giai đoạn lâm sàng',
                    type: 'line',
                    data: vm.entry.theCase.csValues,
                    tooltip: {
                        valueSuffix: '',
                        valueDecimals: 0
                    }

                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xuất tệp tin ảnh .PNG',
                    downloadJPEG: 'Xuất tệp tin ảnh .JPG',
                    downloadPDF: 'Xuất tệp tin .PDF'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF']
                        }
                    }
                }
            });
        };

        // Enable/disable button
        vm.submitDisabled = false;
        vm.toggleSubmit = function () {
            if (vm.submitDisabled) {
                $timeout(function () {
                    vm.submitDisabled = false;
                }, 1000);
            } else {
                vm.submitDisabled = true;
            }
        };
    }

})();
