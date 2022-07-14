/**
 * CD4
 * @param $scope
 */
let cd4SubController = function ($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, labTestService, mmdService) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

    vm.cd4TestingReasons = [
        {id: 'CD4_BASELINE', name: 'Trước khi bắt đầu ARV'},
        {id: 'CD4_ROUTINE', name: 'Xét nghiệm định kỳ'}
    ];

    vm.cd4FundingSources = [
        {id: 'SHI', name: 'Bảo hiểm y tế'},
        {id: 'GF', name: 'Quỹ toàn cầu'},
        {id: 'SELF', name: 'Tự chi trả'},
        {id: 'OTHER', name: 'Nguồn khác'}
    ];

    vm.cd4Entry = {};

    $scope.$on('AppointmentResultController.cd4-test-changed', function () {
        // normalization of test data
        if (!vm.entry.cd4Test || !vm.entry.cd4Test.id) {
            return;
        }

        vm.entry.cd4Test.fundingSourceLabel = '';
        switch (vm.entry.cd4Test.fundingSource) {
            case 'SHI':
                vm.entry.cd4Test.fundingSourceLabel = 'Bảo hiểm y tế';
                break;
            case 'GF':
                vm.entry.cd4Test.fundingSourceLabel = 'Quỹ toàn cầu';
                break;
            case 'SELF':
                vm.entry.cd4Test.fundingSourceLabel = 'Tự chi trả';
                break;
            case 'OTHER':
                vm.entry.cd4Test.fundingSourceLabel = 'Nguồn khác';
                break;
        }

        vm.entry.cd4Test.reasonForTestingLabel = '';
        switch (vm.entry.cd4Test.reasonForTesting) {
            case 'CD4_BASELINE':
                vm.entry.cd4Test.reasonForTestingLabel = 'Trước điều trị ARV';
                break;
            case 'CD4_ROUTINE':
                vm.entry.cd4Test.reasonForTestingLabel = 'Xét nghiệm định kỳ';
                break;
        }

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

    // For sample date
    vm.cd4DatepickerSample = {
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

                if (d && _.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.cd4Entry.sampleDate = m.add(7, 'hours').toDate();
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.cd4DatepickerSample.fpItem = fpItem;
            if (vm.cd4Entry.sampleDate) {
                fpItem.setDate(moment(vm.cd4Entry.sampleDate).toDate());
            }
        },
        clear: function () {
            if (vm.cd4DatepickerSample.fpItem) {
                vm.cd4DatepickerSample.fpItem.clear();
                vm.cd4Entry.sampleDate = null;
            }
        }
    };

    // For result date
    vm.cd4DatepickerResult = {
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

                if (d && _.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.cd4Entry.resultDate = m.add(7, 'hours').toDate();
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.cd4DatepickerResult.fpItem = fpItem;
            if (vm.cd4Entry.resultDate) {
                fpItem.setDate(moment(vm.cd4Entry.resultDate).toDate());
            }
        },
        clear: function () {
            if (vm.cd4DatepickerResult.fpItem) {
                vm.cd4DatepickerResult.fpItem.clear();
                vm.cd4Entry.resultDate = null;
            }
        }
    };

    /**
     * Open add entry modal
     */
    vm.showCD4EditForm = function () {

        vm.patient.editable = true; // because only user can only access to this page for active patient

        if (vm.entry.cd4Test && vm.entry.cd4Test.id) {
            vm.cd4Entry = {};
            angular.copy(vm.entry.cd4Test, vm.cd4Entry);

            // vm.vlEntry.readOnly = readOnly;
            vm.cd4Entry.isNew = false;
            vm.cd4Entry.resultAvailable = vm.cd4Entry.resultDate != null;
        } else {
            vm.cd4Entry = {};
            vm.cd4Entry.isNew = true;
            vm.cd4Entry.resultAvailable = false;
            vm.cd4Entry.fundingSource = 'SHI';
            vm.cd4Entry.sampleSite = vm.patient.organization.name;
            vm.cd4Entry.sampleDate = vm.entry.arrivalDate; // same as arrival date

            // test reasons

        }

        vm.cd4Entry.blockSampleDate = true;

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'cd4_entry_edit_modal.html',
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
     */
    vm.saveCD4Entry = function () {
        blockUI.start();

        // Validate
        if (!vm.cd4Entry.sampleDate) {
            toastr.error('Vui lòng nhập ngày lấy mẫu.', 'Thông báo');
            focusFlatPick('vm.cd4Entry.sampleDate');
            blockUI.stop();
            return;
        }

        let mSampleDate = moment(vm.cd4Entry.sampleDate);
        if (mSampleDate.isAfter(new Date())) {
            toastr.error('Ngày lấy mẫu không thể sau ngày hiện tại.', 'Thông báo');
            focusFlatPick('vm.cd4Entry.sampleDate');
            blockUI.stop();
            return;
        }

        // if (mSampleDate.isBefore(vm.patient.arvStartDate)) {
        //     toastr.error('Ngày lấy mẫu không thể trước ngày bắt đầu điều trị ARV.', 'Thông báo');
        //     focusFlatPick('vm.cd4Entry.sampleDate');
        //     blockUI.stop();
        //     return;
        // }

        if (!vm.cd4Entry.reasonForTesting) {
            toastr.error('Vui lòng nhập lý do xét nghiệm.', 'Thông báo');
            openSelectBox('vm.cd4Entry.reasonForTesting');
            blockUI.stop();
            return;
        }

        if (vm.cd4Entry.resultAvailable) {
            if (!vm.cd4Entry.resultDate) {
                toastr.error('Vui lòng nhập ngày có kết quả.', 'Thông báo');
                focusFlatPick('vm.cd4Entry.resultDate');
                blockUI.stop();
                return;
            }

            let mResultDate = moment(vm.cd4Entry.resultDate);
            if (mResultDate.isAfter(new Date())) {
                toastr.error('Ngày có kết quả không thể sau ngày hiện tại.', 'Thông báo');
                focusFlatPick('vm.cd4Entry.resultDate');
                blockUI.stop();
                return;
            }

            if (mSampleDate.isAfter(vm.cd4Entry.resultDate)) {
                toastr.error('Ngày có kết quả không thể trước ngày lấy mẫu.', 'Thông báo');
                focusFlatPick('vm.cd4Entry.resultDate');
                blockUI.stop();
                return;
            }

            if (vm.cd4Entry.resultNumber == null || vm.cd4Entry.resultNumber < 0) {
                toastr.error('Vui lòng nhập kết quả phù hợp.', 'Thông báo');
                focus('vm.cd4Entry.resultNumber');
                blockUI.stop();
                return;
            }
        } else {
            vm.cd4Entry.resultDate = null;
            vm.cd4Entry.resultNumber = null;
            vm.cd4Entry.resultText = null;
        }

        // Copy the active organization
        vm.cd4Entry.organization = {id: vm.patient.organization.id};

        // Copy the case
        vm.cd4Entry.theCase = {id: vm.patient.theCase.id};

        // Assign the test type
        vm.cd4Entry.testType = 'CD4';

        // Submit
        labTestService.saveEntry(vm.cd4Entry, function success() {
            blockUI.stop();
            toastr.info('Bạn đã lưu yêu cầu xét nghiệm thành công!', 'Thông báo');
        }, function failure() {
            blockUI.stop();
            toastr.error('Có lỗi xảy ra khi lưu yêu cầu xét nghiệm!', 'Thông báo');
        }).then(function (data) {

            // Close the modal
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            // clear the entry
            vm.cd4Entry = {};

            // set the CD4 test data for the entries
            if (data.id) {
                vm.entry.cd4Test = {};
                vm.originEntry.cd4Test = {};

                angular.copy(data, vm.entry.cd4Test);
                angular.copy(data, vm.originEntry.cd4Test);

                $scope.$broadcast('AppointmentResultController.cd4-test-changed');
            }
        });
    };

    /**
     * Delete an entry
     * @param id
     */
    vm.deleteCD4Entry = function (id) {
        if (!id) {
            toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
            return;
        }

        vm.dialog = {
            icon: 'im im-icon-Flash',
            title: 'Xóa xét nghiệm CD4?',
            message: 'Bạn có thực sự muốn xóa thông tin xét nghiệm CD4 của lần khám này không?',
            callback: function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    labTestService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');

                        vm.entry.cd4Test = null;
                        vm.originEntry.cd4Test = null;

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
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance.result.then(function (answer) {
            vm.cd4Entry = {};
        });
    };

    /**
     * On result change
     */
    vm.onCD4ResultChange = function () {
        vm.cd4Entry.resultNumber = parseFloat(vm.cd4Entry.resultNumber);
        if (isNaN(vm.cd4Entry.resultNumber) || vm.cd4Entry.resultNumber < 0) {
            vm.cd4Entry.resultNumber = null;
        } else if (vm.cd4Entry.resultNumber > 0 && vm.cd4Entry.resultNumber < 1) {
            vm.cd4Entry.resultNumber = 1;
        } else {
            vm.cd4Entry.resultNumber = Math.ceil(vm.cd4Entry.resultNumber);
        }
    };

    $scope.$watch('vm.cd4Entry.resultNumber', function (newVal, oldVal) {
        if (newVal == null) {
            vm.cd4Entry.resultText = null;
        } else {
            vm.cd4Entry.resultText = vm.cd4Entry.resultNumber + ' tế bào CD4';
        }
    });

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};