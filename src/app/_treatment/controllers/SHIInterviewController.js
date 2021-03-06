/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('SHIInterviewController', SHIInterviewController);

    SHIInterviewController.$inject = [
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
        '$filter',

        'PatientService',
        'SHIInterviewService',
        'DictionaryService',
        'OrganizationService'
    ];

    function SHIInterviewController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, $filter, service, shiService, dicService, orgService) {
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
        vm.organization = null;

        vm.modalInstance = null;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            instance: null, // for selection of interview date
            interviewDatePlaceholder: 'Ch???n ng??y ph???ng v???n...'
        };

        // SHI Interviews instances
        vm.instances = [];

        vm.options = {
            reportingYears: [],
            reportingPeriods: [
                {id: 1, name: 'S??u th??ng ?????u n??m'},
                {id: 2, name: 'S??u th??ng cu???i n??m'}
            ],
            residencies: [
                {id: 1, name: 'Th?????ng tr?? c?? h??? kh???u (KT1)'},
                {id: 2, name: 'T???m tr?? c?? ????ng k?? (KT2, KT3)'},
                {id: 3, name: 'T???m tr?? kh??ng ????ng k??'}
            ],
            occupations: [
                {id: 1, name: 'D?????i 6 tu???i'},
                {id: 2, name: 'H???c sinh/sinh vi??n'},
                {id: 3, name: 'Ngh??? h???c'},
                {id: 4, name: 'L???c l?????ng v?? trang'},
                {id: 5, name: 'C??ng nh??n vi??n ch???c'},
                {id: 6, name: '??i l??m c??ng ty c?? h???p ?????ng'},
                {id: 7, name: 'L??m ngh??? t??? do'},
                {id: 8, name: 'Th???t nghi???p'},
                {id: 9, name: 'Ngh??? kh??c'}
            ],
            monthlyIncomes: [
                {id: 1, name: '<500.000 ?????ng'},
                {id: 2, name: '500.000 - 1 tri???u ?????ng'},
                {id: 3, name: '>1 - 2 tri???u ?????ng'},
                {id: 4, name: '>2 - 4 tri???u ?????ng'},
                {id: 5, name: '>4 - 10 tri???u ?????ng'},
                {id: 6, name: '>10 tri???u ?????ng'}
            ],
            wealthStatuses: [
                {id: 1, name: 'H??? ngh??o'},
                {id: 2, name: 'C???n ngh??o'},
                {id: 3, name: 'Kh?? kh??n ???????c ?????a ph????ng h??? tr???'},
                {id: 4, name: 'T??nh tr???ng kh??c'}
            ],
            shiAvailability: [
                {id: true, name: 'C?? th??? BHYT'},
                {id: false, name: 'Kh??ng c?? th??? BHYT'}
            ],
            shiRoutes: [
                {id: 1, name: '????ng tuy???n'},
                {id: 2, name: 'Kh??ng ????ng tuy???n (n???i t???nh)'},
                {id: 3, name: 'Kh??ng ????ng tuy???n (ngo???i t???nh)'}
            ],
            shiForArvPrefs: [
                {id: 1, name: 'Ti???p t???c ??/tr??? t???i c?? s??? hi???n t???i'},
                {id: 2, name: 'V??? ????ng tuy???n'},
                {id: 3, name: 'V??? ????ng t???nh'}
            ],
            arvTreatmentPrefs: [
                {id: 1, name: '??/tr??? ARV t??? t??c t???i c?? s??? c??ng'},
                {id: 2, name: '??/tr??? ARV t??? t??c t???i c?? s??? t??'},
                {id: 3, name: 'T??? t??m ph????ng ??n ??/tr??? ARV'},
                {id: 4, name: 'H??nh th???c kh??c'}
            ],
            noSHIReasons: [],
            servicesUsedPaidBySHI: [],
            opcs: []
        };

        /**
         * Get dictionary entries
         */
        blockUI.start();
        dicService.getMultipleEntries([
            {type: 'NO_SHI_REASON'},
            {type: 'SERVICE_USED_PAIDBY_SHI'}
        ]).then(function (data) {
            blockUI.stop();

            angular.forEach(data, function (obj) {
                switch (obj.type) {
                    case 'NO_SHI_REASON':
                        vm.options.noSHIReasons = [];
                        angular.copy(obj.data, vm.options.noSHIReasons);
                        break;
                    case 'SERVICE_USED_PAIDBY_SHI':
                        vm.options.servicesUsedPaidBySHI = [];
                        angular.copy(obj.data, vm.options.servicesUsedPaidBySHI);
                        break;
                }
            });

            // Get selected patient after dictionary data are loaded
            vm.getSelectedPatient();

        });

        // OPCs
        blockUI.start();
        orgService.getAllOrganizations({activeOnly: true, opcSiteOnly: true}).then(function (data) {
            blockUI.stop();

            vm.options.opcs = [];
            angular.copy(data, vm.options.opcs);

            // ----------
            vm.options.opcs.unshift({id: -1, name: '---'});
            vm.options.opcs.unshift({id: 0, name: 'C?? s??? kh??c'});
        });

        // Getting the saved editing patient object
        (function () {
            let entryObj = localStorage.getItem(service.EDIT_PATIENT_ENTRY);

            if (entryObj) {
                entryObj = JSON.parse(entryObj);

                if (entryObj.id) {
                    blockUI.start();
                    service.getPatient(entryObj.id, function failure() {
                        blockUI.stop();
                        localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
                    }).then(function (data) {
                        vm.editingEntry = data;
                        blockUI.stop();
                    });
                } else {
                    vm.editingEntry = entryObj;
                }
            }
        })();

        let datePickerOptions = {
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
        };

        // For SHIExpiry selection
        vm.datepicker = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.shiExpiryDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker.fpItem = fpItem;

                if (vm.entry.shiExpiryDate) {
                    fpItem.setDate(moment(vm.entry.shiExpiryDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker.fpItem) {
                    vm.datepicker.fpItem.clear();
                    vm.entry.shiExpiryDate = null;
                }
            },
            setDate: function (input) {
                if (vm.datepicker.fpItem && input) {
                    vm.datepicker.fpItem.setDate(input);
                }
            }
        };

        // For interview date selection
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                inline: true,
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.interviewDate = m.add(7, 'hours').toDate();

                    // @TODO lookup for existing instance
                    // ....
                    // ----
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker.fpItem = fpItem;

                if (vm.entry.interviewDate) {
                    fpItem.setDate(moment(vm.entry.interviewDate).toDate());
                }
            }
        };

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
                    blockUI.stop();

                    vm.patient = data;

                    if (!vm.patient || !vm.patient.id) {
                        vm.invalidPatientAlert();
                        return;
                    }

                    // Check if the patient is editable
                    service.checkEditable(vm.patient, $scope.isSiteManager($scope.currentUser));

                    // Get the latest SHI record for this patient
                    shiService.getLatestEntry(vm.patient.theCase.id).then(function (data) {
                        vm.entry = {};

                        if (data) {
                            angular.copy(data, vm.entry);

                            // remove the interview date --> save as a new instance
                            vm.entry.interviewDate = null;
                            vm.entry.createDate = null;
                            vm.entry.createdBy = null;
                            vm.entry.modifyDate = null;
                            vm.entry.modifiedBy = null;

                            vm.normalizeEntry();

                        } else {
                            // permanent residency?
                            let sameAddress = false;
                            if (vm.patient.person) {
                                sameAddress = service.isSameAddress(vm.patient.person);
                            }

                            if (sameAddress) {
                                vm.entry.residentStatus = 1;
                            }
                        }

                        // Update the SHI number

                    });

                    vm.organization = {};
                    angular.copy(vm.patient.organization, vm.organization);

                    // Get all SHI interview instances
                    vm.getAllInstances();

                });

                // Store ID of the selected patient
                $cookies.put(service.SELECTED_PATIENT_ID, selPatientId);

            } else {
                vm.invalidPatientAlert();
            }
        };

        // Normalize entry properties
        vm.normalizeEntry = function () {

            if (!vm.entry) {
                return;
            }

            // SHI expiration date
            if (vm.entry.shiExpiryDate) {
                vm.datepicker.setDate(vm.entry.shiExpiryDate);
            }

            // Other services used
            if (vm.entry.otherUsedShiService) {
                vm.entry.tmpOtherServiceUsedPaidBySHI = true;
            }

            // SHI services
            if (vm.entry.usedShiServices && vm.entry.usedShiServices.length > 0) {
                vm.entry.usedShiServices_tmp = {};
                angular.forEach(vm.entry.usedShiServices, function (obj) {
                    vm.entry.usedShiServices_tmp[obj.id] = true;
                });
            }

            // Other no shi reasons
            if (vm.entry.otherNoShiReason) {
                vm.entry.tmpOtherNoSHIReason = true;
            }

            // No SHI reasons
            if (vm.entry.noShiReasons && vm.entry.noShiReasons.length > 0) {
                vm.entry.noShiReasons_tmp = {};
                angular.forEach(vm.entry.noShiReasons, function (obj) {
                    vm.entry.noShiReasons_tmp[obj.id] = true;
                });
            }

            // Primary care facility
            if (!vm.entry.primaryCareFacility && vm.entry.primaryCareFacilityName) {
                vm.entry.primaryCareFacility = {};
                angular.copy({id: 0, name: 'C?? s??? kh??c'}, vm.entry.primaryCareFacility);
            }

            // Continuing care facility
            if (!vm.entry.continuingFacility && vm.entry.continuingFacilityName) {
                vm.entry.continuingFacility = {};
                angular.copy({id: 0, name: 'C?? s??? kh??c'}, vm.entry.continuingFacility);
            }
        };

        /**
         * Get all update instances
         */
        vm.getAllInstances = function () {
            if (vm.patient && vm.patient.id) {
                shiService.getAllInstances(vm.patient.theCase.id).then(function (data) {
                    vm.instances = [];
                    if (data && data.length > 0) {
                        angular.copy(data, vm.instances);
                    }

                    // format date label
                    for (let i = 0; i < vm.instances.length; i++) {
                        vm.instances[i].interviewDateLabel = utils.formatLocalTime(vm.instances[i].interviewDate);
                    }

                    vm.instances.unshift({id: -1, interviewDateLabel: '-'});
                    vm.instances.unshift({id: 0, interviewDateLabel: 'Ng??y ph???ng v???n m???i'});
                });
            }
        };

        /**
         * Open the date picker modal
         */
        vm.openInterviewDateSelection = function () {
            // create a new interview day
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'select_interview_date_modal.html',
                scope: $scope,
                size: 'auto',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    if (vm.entry.interviewDate && moment(vm.entry.interviewDate).isAfter(new Date())) {
                        toastr.warning('Ng??y ph???ng v???n kh??ng th??? sau ng??y hi???n t???i!', 'Th??ng b??o');
                        vm.openInterviewDateSelection();
                    }
                }
            });

            vm.modalInstance.closed.then(function () {
                vm.filter.instance = null; // clear the selection

                // make sure interviewDate is not after the current date
                if (vm.entry.interviewDate) {
                    if (moment(vm.entry.interviewDate).isAfter(new Date())) {
                        vm.entry.interviewDate = null;
                    } else {
                        vm.filter.interviewDatePlaceholder = 'Ng??y P.V???n [' + moment(vm.entry.interviewDate).format('DD/MM/YYYY') + ']';
                    }
                }
            });
        };

        /**
         * On selection of interview date
         */
        vm.onInterviewDateChange = function () {
            if (vm.filter.instance && vm.filter.instance.id == -1) {
                vm.filter.instance = {};
                angular.copy(vm.instances[0], vm.filter.instance);
            }

            if (vm.filter.instance) {
                if (vm.filter.instance.id == 0) {
                    vm.openInterviewDateSelection();
                } else {
                    // get the interview
                    blockUI.start();
                    shiService.getEntry(vm.filter.instance.id).then(function (data) {
                        blockUI.stop();
                        if (data) {
                            vm.entry = {};
                            angular.copy(data, vm.entry);

                            vm.normalizeEntry();
                        }
                    });
                }
            }
        };

        /**
         * On selection of primary care facility
         */
        vm.onPrimaryCareFacilityChange = function () {
            if (vm.entry.primaryCareFacility && vm.entry.primaryCareFacility.id == -1) {
                vm.entry.primaryCareFacility = {};
                angular.copy(vm.options.opcs[0], vm.entry.primaryCareFacility);
            }
        };

        /**
         * On selection of continuing facility
         */
        vm.onContinuingFacilityChange = function () {
            if (vm.entry.continuingFacility && vm.entry.continuingFacility.id == -1) {
                vm.entry.continuingFacility = {};
                angular.copy(vm.options.opcs[0], vm.entry.continuingFacility);
            }
        };

        /**
         * Update selectbox values
         */
        vm.updateSelectBoxValues = function (q) {
            if (!q) {
                return;
            }

            vm.entry[q] = [];
            angular.forEach(vm.entry[q + '_tmp'], function (val, key) {
                if (val == true) {
                    let key2 = parseFloat(key);
                    if (key2 > 0) {
                        vm.entry[q].push({id: key2});
                    }
                }
            });
        };

        /**
         * Save the entry
         */
        vm.saveInterview = function () {

            blockUI.start();

            // Validation

            if (!vm.entry.interviewDate) {
                toastr.error('Vui l??ng nh???p ng??y ph???ng v???n.', 'Th??ng b??o');
                vm.openInterviewDateSelection();
                blockUI.stop();
                return;
            }
            //
            // if (!vm.entry.residentStatus) {
            //     toastr.error('Vui l??ng ch???n t??nh tr???ng ????ng k?? ch??? ???.', 'Th??ng b??o');
            //     openSelectBox('vm.entry.residentStatus');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.occupation) {
            //     toastr.error('Vui l??ng ch???n c??ng vi???c hi???n t???i.', 'Th??ng b??o');
            //     openSelectBox('vm.entry.occupation');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (vm.entry.occupation == 9 && !vm.entry.occupationName) {
            //     // other occupation
            //     toastr.error('Vui l??ng cho bi???t c??ng vi???c hi???n t???i.', 'Th??ng b??o');
            //     focus('vm.entry.occupationName');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.monthlyIncome) {
            //     toastr.error('Vui l??ng ch???n thu nh???p trung b??nh h??ng th??ng.', 'Th??ng b??o');
            //     openSelectBox('vm.entry.monthlyIncome');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.wealthStatus) {
            //     toastr.error('Vui l??ng ch???n t??nh tr???ng kinh t???.', 'Th??ng b??o');
            //     openSelectBox('vm.entry.wealthStatus');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (vm.entry.wealthStatus == 4 && !vm.entry.wealthStatusName) {
            //     toastr.error('Vui l??ng ghi r?? t??nh tr???ng kinh t???.', 'Th??ng b??o');
            //     focus('vm.entry.wealthStatusName');
            //     blockUI.stop();
            //     return;
            // }

            if (vm.entry.hasShiCard == null) {
                toastr.error('Vui l??ng cho bi???t b???nh nh??n c?? th??? BHYT hay kh??ng.')
                openSelectBox('vm.entry.hasShiCard');
                blockUI.stop();
                return;
            }

            if (vm.entry.hasShiCard == true) {

                if (!vm.entry.shiCardNumber) {
                    toastr.error('Vui l??ng nh???p m?? th??? b???o hi???m y t???.', 'Th??ng b??o');
                    focus('vm.entry.shiCardNumber');
                    blockUI.stop();
                    return;
                }

                vm.entry.shiCardNumber = vm.entry.shiCardNumber.replace(/\s+/g, '');

                if (!utils.isValidSHINumber(vm.entry.shiCardNumber)) {
                    toastr.error('M?? th??? b???o hi???m y t??? kh??ng h???p l???.', 'Th??ng b??o');
                    focus('vm.entry.shiCardNumber');
                    blockUI.stop();
                    return;
                }

                if (!vm.entry.shiExpiryDate) {
                    toastr.error('Vui l??ng nh???p ng??y h???t h???n th??? b???o hi???m y t???.', 'Th??ng b??o');
                    focusFlatPick('vm.entry.shiExpiryDate');
                    blockUI.stop();
                    return;
                }

                // if (!vm.entry.shiRoute) {
                //     toastr.error('Vui l??ng ch???n tuy???n c???a th??? b???o hi???m y t???.', 'Th??ng b??o');
                //     openSelectBox('vm.entry.shiRoute');
                //     blockUI.stop();
                //     return;
                // }

                // if (!vm.entry.primaryCareFacility || vm.entry.primaryCareFacility.id == null || (vm.entry.primaryCareFacility.id == 0 && !vm.entry.primaryCareFacilityName)) {
                //     toastr.error('Vui l??ng ch???n n??i ????ng k?? kh??m ch???a b???nh ban ?????u.', 'Th??ng b??o');
                //
                //     if (!vm.entry.primaryCareFacility || vm.entry.primaryCareFacility.id == null) {
                //         openSelectBox('vm.entry.primaryCareFacility');
                //     } else {
                //         focus('vm.entry.primaryCareFacilityName');
                //     }
                //     blockUI.stop();
                //     return;
                // }

                // if (vm.entry.tmpOtherServiceUsedPaidBySHI && !vm.entry.otherUsedShiService) {
                //     toastr.error('Vui l??ng cho bi???t t??n d???ch v??? kh??c m?? b???nh nh??n ???? ???????c chi tr??? qua BHYT.', 'Th??ng b??o');
                //     focus('vm.entry.otherUsedShiService');
                //     blockUI.stop();
                //     return;
                // }
                //
                // if (!vm.entry.shiForArvPref) {
                //     toastr.error('Vui l??ng cho bi???t nhu c???u s??? d???ng th??? b???o hi???m trong ??i???u tr??? ARV.', 'Th??ng b??o');
                //     openSelectBox('vm.entry.shiForArvPref');
                //     blockUI.stop();
                //     return;
                // }

                // if (!vm.entry.continuingFacility || vm.entry.continuingFacility.id == null || (vm.entry.continuingFacility.id == 0 && !vm.entry.continuingFacilityName)) {
                //     toastr.error('Vui l??ng cho bi???t n??i ??i???u tr??? ARV mong mu???n.', 'Th??ng b??o');
                //
                //     if (!vm.entry.continuingFacility || vm.entry.continuingFacility.id == null) {
                //         openSelectBox('vm.entry.continuingFacility');
                //     } else {
                //         focus('vm.entry.continuingFacilityName');
                //     }
                //     blockUI.stop();
                //     return;
                // }

            } else {
                // if (!vm.entry.noShiReasons || vm.entry.noShiReasons.length <= 0 || (vm.entry.tmpOtherNoSHIReason && !vm.entry.otherNoShiReason)) {
                //     toastr.error('Vui l??ng cho bi???t l?? do b???nh nh??n kh??ng c?? th??? b???o hi???m y t???.', 'Th??ng b??o');
                //
                //     if (vm.entry.tmpOtherNoSHIReason && !vm.entry.otherNoShiReason) {
                //         focus('vm.entry.otherNoShiReason');
                //     }
                //     blockUI.stop();
                //     return;
                // }
            }

            // if (!vm.entry.wantShiForArv) {
            //     if (!vm.entry.arvTreatmentPref || (vm.entry.arvTreatmentPref.id == 4 && !vm.entry.arvTreatmentPrefName)) {
            //         toastr.error('Vui l??ng cho bi???t h??nh th???c ??i???u tr??? ARV mong mu???n khi kh??ng d??ng BHYT.', 'Th??ng b??o');
            //
            //         if (!vm.entry.arvTreatmentPref) {
            //             openSelectBox('vm.entry.arvTreatmentPref');
            //         } else {
            //             focus('vm.entry.arvTreatmentPrefName');
            //         }
            //         blockUI.stop();
            //         return;
            //     }
            // }
            //
            // if (vm.entry.needSupportForShi && (!vm.entry.needSupportDetails || vm.entry.needSupportDetails.trim() == '')) {
            //     toastr.error('Vui l??ng cho bi???t nhu c???u c???n h??? tr???.', 'Th??ng b??o');
            //     focus('vm.entry.needSupportDetails');
            //     blockUI.stop();
            //     return;
            // }

            if (vm.entry.hasShiCard) {
                vm.entry.shiCardNumber = vm.entry.shiCardNumber.replace(/\s/g, '');
            }

            // Copy the active organization
            vm.entry.organization = {id: vm.patient.organization.id};

            // Copy the case
            vm.entry.theCase = {id: vm.patient.theCase.id};

            shiService.saveEntry(vm.entry, function success() {
                blockUI.stop();
                toastr.info('???? l??u th??nh c??ng th??ng tin l???n ph???ng v???n BHYT.', 'Th??ng b??o');
            }, function failure() {
                blockUI.stop();
                toastr.error('C?? l???i khi l??u th??ng tin l???n ph???ng v???n BHYT.', 'Th??ng b??o');
            }).then(function (data) {
                $state.go('application.treatment_view_patient', {id: vm.patient.id});
            });
        };

        /**
         * Delete the currently selected SHI record
         */
        vm.deleteShiRecord = function () {
            if (!vm.entry.id) {
                return;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_record_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    shiService.deleteEntries([vm.entry], function success() {
                        toastr.info('B???n ???? x??a th??nh c??ng b???n ghi v??? nhu c???u s??? d???ng BHYT.', 'Th??ng b??o');
                        $state.go('application.treatment_view_patient', {id: vm.patient.id});
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi x??a b???n ghi.', 'Th??ng b??o');
                    });
                }
            });
        };

        // Watchers

        $scope.$watch('vm.entry.hasShiCard', function (newVal, oldVal) {
            if (newVal == true) {
                vm.entry.noShiReasons = [];
                vm.entry.noShiReasons_tmp = {};
                vm.entry.otherNoShiReason = null;
            } else if (newVal == false) {
                vm.entry.shiCardNumber = null;
                vm.entry.shiExpiryDate = null;
                vm.entry.shiRoute = null;
                vm.entry.primaryCareFacility = null;
                vm.entry.primaryCareFacilityName = null;

                vm.entry.usedShiServices = [];
                vm.entry.usedShiServices_tmp = {};
                vm.entry.otherUsedShiService = null;

                vm.entry.usedShiForArv = null;

                vm.entry.shiForArvPref = null;
                vm.entry.continuingFacility = null;
                vm.entry.continuingFacilityName = null;
            }
        });

        $scope.$watch('vm.entry.occupation', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // Other occupation
            if (newVal == 9) {
                if (oldVal > 0) {
                    vm.entry.occupationName = null;
                }

                // focus('vm.entry.occupationName');
            } else {
                angular.forEach(vm.options.occupations, function (obj) {
                    if (obj.id == newVal) {
                        vm.entry.occupationName = obj.name;
                    }
                });
            }
        });

        $scope.$watch('vm.entry.wealthStatus', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // Other wealth status
            if (newVal == 4) {

                if (oldVal > 0) {
                    vm.entry.wealthStatusName = null;
                }

                // focus('vm.entry.wealthStatusName');
            } else {
                angular.forEach(vm.options.wealthStatuses, function (obj) {
                    if (obj.id == newVal) {
                        vm.entry.wealthStatusName = obj.name;
                    }
                });
            }
        });

        $scope.$watch('vm.entry.primaryCareFacility', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // Other primary care facility
            if (newVal.id == 0) {

                if (oldVal && oldVal.id > 0) {
                    vm.entry.primaryCareFacilityName = null;
                }

                // focus('vm.entry.primaryCareFacilityName');
            } else {
                vm.entry.primaryCareFacilityName = newVal.value;
            }
        });

        $scope.$watch('vm.entry.wantShiForArv', function (newVal, oldVal) {
            if (newVal) {
                vm.entry.arvTreatmentPref = null;
                vm.entry.arvTreatmentPrefName = null;
            }
        });

        $scope.$watch('vm.entry.continuingFacility', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            // Other continuing facility
            if (newVal.id == 0) {

                if (oldVal && oldVal.id > 0) {
                    vm.entry.continuingFacilityName = null;
                }

                // focus('vm.entry.continuingFacilityName');
            } else {
                vm.entry.continuingFacilityName = newVal.value;
            }
        });

        $scope.$watch('vm.entry.arvTreatmentPref', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            if (newVal == 4) {
                focus('vm.entry.arvTreatmentPrefName');
            } else {
                angular.forEach(vm.options.arvTreatmentPrefs, function (obj) {
                    if (obj.id == newVal) {
                        vm.entry.arvTreatmentPrefName = obj.name;
                    }
                });
            }
        });

        $scope.$watch('vm.entry.tmpOtherNoSHIReason', function (newVal, oldVal) {
            if (newVal) {
                focus('vm.entry.otherNoShiReason');
            } else {
                vm.entry.otherNoShiReason = null;
            }
        });

        $scope.$watch('vm.entry.tmpOtherServiceUsedPaidBySHI', function (newVal, oldVal) {
            if (newVal) {
                focus('vm.entry.otherUsedShiService');
            }
        });

        $scope.$watch('vm.entry.usedShiForArv', function (newVal, oldVal) {
            if (!newVal) {
                vm.entry.usedShiServices = [];
                vm.entry.usedShiServices_tmp = {};

                vm.entry.tmpOtherServiceUsedPaidBySHI = null;
                vm.entry.otherUsedShiService = null;
            }
        });

        $scope.$watch('vm.entry.shiForArvPref', function (newVal, oldVal) {
            if (newVal && newVal == 1) {
                if (!vm.entry.continuingFacility || !vm.entry.continuingFacility.id) {
                    vm.entry.continuingFacility = {};
                    angular.forEach(vm.options.opcs, function (obj) {
                        if (obj.id == vm.patient.caseOrgs[0].organization.id) {
                            angular.copy(obj, vm.entry.continuingFacility);
                        }
                    });
                }
            }
        });

        $scope.$watch('vm.entry.needSupportForShi', function (newVal, oldVal) {
            if (newVal) {
                focus('vm.entry.needSupportDetails');
            } else {
                vm.entry.needSupportDetails = null;
            }
        });

    }

})();
