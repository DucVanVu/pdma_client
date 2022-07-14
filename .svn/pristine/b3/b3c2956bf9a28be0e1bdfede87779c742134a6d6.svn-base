/**
 * Viral load
 * @param $scope
 */
let viralLoadSubController = function ($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, labTestService, mmdService) {

    let deferred = $q.defer();

    vm.vlTestingReasons = [
        {id: 'VL_AT_6MONTH', name: 'Tại thời điểm 6 tháng sau ART'},
        {id: 'VL_AT_12MONTH', name: 'Tại thời điểm 12 tháng sau ART'},
        {id: 'VL_ROUTINE_12MONTH', name: 'Định kỳ sau 12 tháng'},
        {id: 'VL_FOLLOWUP_3MONTH', name: 'Có biểu hiện nghi ngờ TBĐT'},
        {id: 'VL_PREGNANCY', name: 'Phụ nữ mang thai, cho con bú'},
        {id: 'VL_RECENCY', name: 'XN TLVR để khẳng định nhiễm mới'}
    ];

    vm.vlFundingSources = [
        {id: 'SHI', name: 'Bảo hiểm y tế'},
        {id: 'GF', name: 'Quỹ toàn cầu'},
        {id: 'SELF', name: 'Tự chi trả'},
        {id: 'DRIVE_C', name: 'Dự án Drive-C'},
        {id: 'OTHER', name: 'Nguồn khác'}
    ];

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

    vm.vlEntry = {};
    let vlTestReason = null;

    vm.checkVLEligibility = function () {

        if (!vm.patient.id || !vm.entry.appointmentDate) {
            return;
        }

        let cutpointDate = vm.entry.arrivalDate == null ? vm.entry.appointmentDate : vm.entry.arrivalDate;
        vm.patient.vlTestEligibility = null;

        blockUI.start();
        labTestService.checkVLEligibility({
            theCase: {id: vm.patient.theCase.id},
            organization: {id: vm.patient.organization.id},
            cutpoint: cutpointDate,
            checkTestExistance: true
        }).then(function (data) {
            blockUI.stop();

            switch (data) {
                case 1:
                    vm.patient.vlTestEligibility = 'tại thời điểm 6 tháng sau điều trị ARV';
                    vlTestReason = 'VL_AT_6MONTH';
                    break;
                case 2:
                    vm.patient.vlTestEligibility = 'tại thời điểm 12 tháng sau điều trị ARV';
                    vlTestReason = 'VL_AT_12MONTH';
                    break;
                case 3:
                    vm.patient.vlTestEligibility = 'thường qui sau 12 tháng';
                    vlTestReason = 'VL_ROUTINE_12MONTH';
                    break;
                case 4:
                    vm.patient.vlTestEligibility = 'sau 3 tháng do kết quả tải lượng HIV của lần xét nghiệm trước >= 200 bản sao/ml';
                    vlTestReason = 'VL_FOLLOWUP_3MONTH';
                    break;
            }
        });
    };

    $scope.$on('AppointmentResultController.patient-data-available', function () {

        vm.checkVLEligibility();

        // if (vm.entry.isLatestAppointment || vm.entry.isLatestEditableAppointment) {
        blockUI.start();
        mmdService.isHardEligible({
            organization: {id: vm.patient.organization.id},
            theCase: {id: vm.patient.theCase.id},
            cutpoint: vm.entry.arrivalDate
        }).then(function (result) {
            blockUI.stop();
            vm.entry.hardMmdEligible = result;
        });
        // }
    });

    $scope.$on('AppointmentResultController.viralload-test-changed', function () {
        // normalization of test data
        if (!vm.entry.vlTest || !vm.entry.vlTest.id) {
            return;
        }

        vm.checkVLEligibility();

        vm.entry.vlTest.fundingSourceLabel = '';
        switch (vm.entry.vlTest.fundingSource) {
            case 'SHI':
                vm.entry.vlTest.fundingSourceLabel = 'Bảo hiểm y tế';
                break;
            case 'GF':
                vm.entry.vlTest.fundingSourceLabel = 'Quỹ toàn cầu';
                break;
            case 'SELF':
                vm.entry.vlTest.fundingSourceLabel = 'Tự chi trả';
                break;
            case 'DRIVE_C':
                vm.entry.vlTest.fundingSourceLabel = 'Dự án Drive-C';
                break;
            case 'OTHER':
                vm.entry.vlTest.fundingSourceLabel = 'Nguồn khác';
                break;
        }

        vm.entry.vlTest.reasonForTestingLabel = '';
        switch (vm.entry.vlTest.reasonForTesting) {
            case 'VL_AT_6MONTH':
                vm.entry.vlTest.reasonForTestingLabel = 'Tại thời điểm 6 tháng';
                break;
            case 'VL_AT_12MONTH':
                vm.entry.vlTest.reasonForTestingLabel = 'Tại thời điểm 12 tháng';
                break;
            case 'VL_ROUTINE_12MONTH':
                vm.entry.vlTest.reasonForTestingLabel = 'Định kỳ 12 tháng';
                break;
            case 'VL_FOLLOWUP_3MONTH':
                vm.entry.vlTest.reasonForTestingLabel = 'XN lại sau 3 tháng';
                break;
            case 'VL_PREGNANCY':
                vm.entry.vlTest.reasonForTestingLabel = 'Bệnh nhân mang thai';
                break;
            case 'VL_RECENCY':
                vm.entry.vlTest.reasonForTestingLabel = 'Để khẳng định nhiễm mới';
                break;
        }
    });

    // For sample date
    vm.vlDatepickerSample = {
        fpItem: null,
        dateOpts: {
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
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ],
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.vlEntry.sampleDate = m.add(7, 'hours').toDate();
                }
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
            placeholder: 'Chọn ngày..',
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
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.vlEntry.resultDate = m.add(7, 'hours').toDate();
                }
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

    vm.showVLEditForm = function () {

        vm.patient.editable = true; // because only user can only access to this page for active patient

        if (vm.entry.vlTest && vm.entry.vlTest.id) {
            let data = vm.entry.vlTest;
            // tweak to avoid $watcher to change resultText value when there is no resultNumber
            if (data.resultNumber == null && data.resultText) {
                delete data.resultNumber;
            }

            vm.vlEntry = {};
            angular.copy(data, vm.vlEntry);

            // vm.vlEntry.readOnly = readOnly;
            vm.vlEntry.isNew = false;
            vm.vlEntry.resultAvailable = vm.vlEntry.resultDate != null;
            vm.vlEntry.virusNotFound = (vm.vlEntry.resultNumber == 0);
        } else {
            vm.vlEntry = {};
            vm.vlEntry.isNew = true;
            vm.vlEntry.resultAvailable = false;
            vm.vlEntry.reasonForTesting = vlTestReason;
            vm.vlEntry.fundingSource = 'SHI';
            vm.vlEntry.sampleSite = vm.patient.organization.name;

            vm.vlEntry.sampleDate = vm.entry.arrivalDate; // same as arrival date
        }

        vm.vlEntry.blockSampleDate = true;

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
     * Save the test entry
     * @param parent - The form that triggers the save event
     */
    vm.saveVLEntry = function (parent) {
        blockUI.start();

        // Validate
        if (!vm.vlEntry.sampleDate) {
            toastr.error('Vui lòng nhập ngày lấy mẫu.', 'Thông báo');
            focusFlatPick('vm.vlEntry.sampleDate');
            blockUI.stop();
            return;
        }

        let mSampleDate = moment(vm.vlEntry.sampleDate);
        if (mSampleDate.isAfter(new Date())) {
            toastr.error('Ngày lấy mẫu không thể sau ngày hiện tại.', 'Thông báo');
            focusFlatPick('vm.vlEntry.sampleDate');
            blockUI.stop();
            return;
        }

        if (!vm.vlEntry.reasonForTesting) {
            toastr.error('Vui lòng chọn lý do xét nghiệm.', 'Thông báo');
            openSelectBox('vm.vlEntry.reasonForTesting');
            blockUI.stop();
            return;
        }

        if (!vm.vlEntry.fundingSource) {
            toastr.error('Vui lòng cho biết nguồn kinh phí xét nghiệm.', 'Thông báo');
            openSelectBox('vm.vlEntry.fundingSource');
            blockUI.stop();
            return;
        }

        if (vm.vlEntry.resultAvailable) {
            if (!vm.vlEntry.resultDate) {
                toastr.error('Vui lòng nhập ngày có kết quả.', 'Thông báo');
                focusFlatPick('vm.vlEntry.resultDate');
                blockUI.stop();
                return;
            }

            let mResultDate = moment(vm.vlEntry.resultDate);
            if (mResultDate.isAfter(new Date())) {
                toastr.error('Ngày có kết quả không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.vlEntry.resultDate');
                blockUI.stop();
                return;
            }

            if (mSampleDate.isAfter(vm.vlEntry.resultDate)) {
                toastr.error('Ngày có kết quả không thể trước ngày lấy mẫu.', 'Thông báo');
                focusFlatPick('vm.vlEntry.resultDate');
                blockUI.stop();
                return;
            }

            if (vm.vlEntry.resultNumber == null || vm.vlEntry.resultNumber < 0) {
                toastr.error('Vui lòng nhập kết quả phù hợp.', 'Thông báo');
                focus('vm.vlEntry.resultNumber');
                blockUI.stop();
                return;
            }
        } else {
            vm.vlEntry.resultDate = null;
            vm.vlEntry.resultNumber = null;
            vm.vlEntry.resultText = null;
        }

        // Copy the current organization
        vm.vlEntry.organization = {id: vm.patient.organization.id};

        // Copy the case
        vm.vlEntry.theCase = {id: vm.patient.theCase.id};

        // Assign the test type
        vm.vlEntry.testType = 'VIRAL_LOAD';

        // Submit
        labTestService.saveEntry(vm.vlEntry, function success() {
            blockUI.stop();
            toastr.clear();
            toastr.info('Bạn đã lưu yêu cầu xét nghiệm thành công!', 'Thông báo');

            // $state.go($state.$current, null, {reload: true});
        }, function failure() {
            blockUI.stop();
            toastr.clear();
            toastr.error('Có lỗi xảy ra khi lưu yêu cầu xét nghiệm!', 'Thông báo');
        }).then(function (data) {
            // Close the modal
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            // clear the entry
            vm.vlEntry = {};

            // set the VL test data for the entries
            if (data.id) {
                vm.entry.vlTest = {};
                vm.originEntry.vlTest = {};

                angular.copy(data, vm.entry.vlTest);
                angular.copy(data, vm.originEntry.vlTest);

                $scope.$broadcast('AppointmentResultController.viralload-test-changed');
            }
        });
    };

    vm.deleteVLEntry = function (id) {
        if (!id) {
            toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
            return;
        }

        vm.dialog = {
            icon: 'im im-icon-Flash',
            title: 'Xóa xét nghiệm TLVR?',
            message: 'Bạn có thực sự muốn xóa thông tin xét nghiệm tải lượng virus của lần khám này không?',
            callback: function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    labTestService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');

                        // $state.go($state.$current, null, {reload: true});
                        vm.entry.vlTest = null;
                        vm.originEntry.vlTest = null;

                    }, function failure() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
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
            vm.vlEntry.resultText = 'Không phát hiện';
        } else if (newVal < 200) {
            vm.vlEntry.resultText = 'KPH - <200 bản sao/ml';
        } else if (newVal < 1000) {
            vm.vlEntry.resultText = '200 - <1000 bản sao/ml';
        } else {
            vm.vlEntry.resultText = '>=1000 bản sao/ml';
        }
    });

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};