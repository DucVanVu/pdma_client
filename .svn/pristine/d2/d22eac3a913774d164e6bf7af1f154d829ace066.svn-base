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
            interviewDatePlaceholder: 'Chọn ngày phỏng vấn...'
        };

        // SHI Interviews instances
        vm.instances = [];

        vm.options = {
            reportingYears: [],
            reportingPeriods: [
                {id: 1, name: 'Sáu tháng đầu năm'},
                {id: 2, name: 'Sáu tháng cuối năm'}
            ],
            residencies: [
                {id: 1, name: 'Thường trú có hộ khẩu (KT1)'},
                {id: 2, name: 'Tạm trú có đăng ký (KT2, KT3)'},
                {id: 3, name: 'Tạm trú không đăng ký'}
            ],
            occupations: [
                {id: 1, name: 'Dưới 6 tuổi'},
                {id: 2, name: 'Học sinh/sinh viên'},
                {id: 3, name: 'Nghỉ học'},
                {id: 4, name: 'Lực lượng vũ trang'},
                {id: 5, name: 'Công nhân viên chức'},
                {id: 6, name: 'Đi làm công ty có hợp đồng'},
                {id: 7, name: 'Làm nghề tự do'},
                {id: 8, name: 'Thất nghiệp'},
                {id: 9, name: 'Nghề khác'}
            ],
            monthlyIncomes: [
                {id: 1, name: '<500.000 đồng'},
                {id: 2, name: '500.000 - 1 triệu đồng'},
                {id: 3, name: '>1 - 2 triệu đồng'},
                {id: 4, name: '>2 - 4 triệu đồng'},
                {id: 5, name: '>4 - 10 triệu đồng'},
                {id: 6, name: '>10 triệu đồng'}
            ],
            wealthStatuses: [
                {id: 1, name: 'Hộ nghèo'},
                {id: 2, name: 'Cận nghèo'},
                {id: 3, name: 'Khó khăn được địa phương hỗ trợ'},
                {id: 4, name: 'Tình trạng khác'}
            ],
            shiAvailability: [
                {id: true, name: 'Có thẻ BHYT'},
                {id: false, name: 'Không có thẻ BHYT'}
            ],
            shiRoutes: [
                {id: 1, name: 'Đúng tuyến'},
                {id: 2, name: 'Không đúng tuyến (nội tỉnh)'},
                {id: 3, name: 'Không đúng tuyến (ngoại tỉnh)'}
            ],
            shiForArvPrefs: [
                {id: 1, name: 'Tiếp tục đ/trị tại cơ sở hiện tại'},
                {id: 2, name: 'Về đúng tuyến'},
                {id: 3, name: 'Về đúng tỉnh'}
            ],
            arvTreatmentPrefs: [
                {id: 1, name: 'Đ/trị ARV tự túc tại cơ sở công'},
                {id: 2, name: 'Đ/trị ARV tự túc tại cơ sở tư'},
                {id: 3, name: 'Tự tìm phương án đ/trị ARV'},
                {id: 4, name: 'Hình thức khác'}
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
            vm.options.opcs.unshift({id: 0, name: 'Cơ sở khác'});
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
            placeholder: 'Chọn ngày..',
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
            toastr.error('Không tìm thấy thông tin bệnh nhân!', 'Thông báo');
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
                angular.copy({id: 0, name: 'Cơ sở khác'}, vm.entry.primaryCareFacility);
            }

            // Continuing care facility
            if (!vm.entry.continuingFacility && vm.entry.continuingFacilityName) {
                vm.entry.continuingFacility = {};
                angular.copy({id: 0, name: 'Cơ sở khác'}, vm.entry.continuingFacility);
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
                    vm.instances.unshift({id: 0, interviewDateLabel: 'Ngày phỏng vấn mới'});
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
                        toastr.warning('Ngày phỏng vấn không thể sau ngày hiện tại!', 'Thông báo');
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
                        vm.filter.interviewDatePlaceholder = 'Ngày P.Vấn [' + moment(vm.entry.interviewDate).format('DD/MM/YYYY') + ']';
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
                toastr.error('Vui lòng nhập ngày phỏng vấn.', 'Thông báo');
                vm.openInterviewDateSelection();
                blockUI.stop();
                return;
            }
            //
            // if (!vm.entry.residentStatus) {
            //     toastr.error('Vui lòng chọn tình trạng đăng ký chỗ ở.', 'Thông báo');
            //     openSelectBox('vm.entry.residentStatus');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.occupation) {
            //     toastr.error('Vui lòng chọn công việc hiện tại.', 'Thông báo');
            //     openSelectBox('vm.entry.occupation');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (vm.entry.occupation == 9 && !vm.entry.occupationName) {
            //     // other occupation
            //     toastr.error('Vui lòng cho biết công việc hiện tại.', 'Thông báo');
            //     focus('vm.entry.occupationName');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.monthlyIncome) {
            //     toastr.error('Vui lòng chọn thu nhập trung bình hàng tháng.', 'Thông báo');
            //     openSelectBox('vm.entry.monthlyIncome');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (!vm.entry.wealthStatus) {
            //     toastr.error('Vui lòng chọn tình trạng kinh tế.', 'Thông báo');
            //     openSelectBox('vm.entry.wealthStatus');
            //     blockUI.stop();
            //     return;
            // }
            //
            // if (vm.entry.wealthStatus == 4 && !vm.entry.wealthStatusName) {
            //     toastr.error('Vui lòng ghi rõ tình trạng kinh tế.', 'Thông báo');
            //     focus('vm.entry.wealthStatusName');
            //     blockUI.stop();
            //     return;
            // }

            if (vm.entry.hasShiCard == null) {
                toastr.error('Vui lòng cho biết bệnh nhân có thẻ BHYT hay không.')
                openSelectBox('vm.entry.hasShiCard');
                blockUI.stop();
                return;
            }

            if (vm.entry.hasShiCard == true) {

                if (!vm.entry.shiCardNumber) {
                    toastr.error('Vui lòng nhập mã thẻ bảo hiểm y tế.', 'Thông báo');
                    focus('vm.entry.shiCardNumber');
                    blockUI.stop();
                    return;
                }

                vm.entry.shiCardNumber = vm.entry.shiCardNumber.replace(/\s+/g, '');

                if (!utils.isValidSHINumber(vm.entry.shiCardNumber)) {
                    toastr.error('Mã thẻ bảo hiểm y tế không hợp lệ.', 'Thông báo');
                    focus('vm.entry.shiCardNumber');
                    blockUI.stop();
                    return;
                }

                if (!vm.entry.shiExpiryDate) {
                    toastr.error('Vui lòng nhập ngày hết hạn thẻ bảo hiểm y tế.', 'Thông báo');
                    focusFlatPick('vm.entry.shiExpiryDate');
                    blockUI.stop();
                    return;
                }

                // if (!vm.entry.shiRoute) {
                //     toastr.error('Vui lòng chọn tuyến của thẻ bảo hiểm y tế.', 'Thông báo');
                //     openSelectBox('vm.entry.shiRoute');
                //     blockUI.stop();
                //     return;
                // }

                // if (!vm.entry.primaryCareFacility || vm.entry.primaryCareFacility.id == null || (vm.entry.primaryCareFacility.id == 0 && !vm.entry.primaryCareFacilityName)) {
                //     toastr.error('Vui lòng chọn nơi đăng ký khám chữa bệnh ban đầu.', 'Thông báo');
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
                //     toastr.error('Vui lòng cho biết tên dịch vụ khác mà bệnh nhân đã được chi trả qua BHYT.', 'Thông báo');
                //     focus('vm.entry.otherUsedShiService');
                //     blockUI.stop();
                //     return;
                // }
                //
                // if (!vm.entry.shiForArvPref) {
                //     toastr.error('Vui lòng cho biết nhu cầu sử dụng thẻ bảo hiểm trong điều trị ARV.', 'Thông báo');
                //     openSelectBox('vm.entry.shiForArvPref');
                //     blockUI.stop();
                //     return;
                // }

                // if (!vm.entry.continuingFacility || vm.entry.continuingFacility.id == null || (vm.entry.continuingFacility.id == 0 && !vm.entry.continuingFacilityName)) {
                //     toastr.error('Vui lòng cho biết nơi điều trị ARV mong muốn.', 'Thông báo');
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
                //     toastr.error('Vui lòng cho biết lý do bệnh nhân không có thẻ bảo hiểm y tế.', 'Thông báo');
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
            //         toastr.error('Vui lòng cho biết hình thức điều trị ARV mong muốn khi không dùng BHYT.', 'Thông báo');
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
            //     toastr.error('Vui lòng cho biết nhu cầu cần hỗ trợ.', 'Thông báo');
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
                toastr.info('Đã lưu thành công thông tin lần phỏng vấn BHYT.', 'Thông báo');
            }, function failure() {
                blockUI.stop();
                toastr.error('Có lỗi khi lưu thông tin lần phỏng vấn BHYT.', 'Thông báo');
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
                        toastr.info('Bạn đã xóa thành công bản ghi về nhu cầu sử dụng BHYT.', 'Thông báo');
                        $state.go('application.treatment_view_patient', {id: vm.patient.id});
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xóa bản ghi.', 'Thông báo');
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
