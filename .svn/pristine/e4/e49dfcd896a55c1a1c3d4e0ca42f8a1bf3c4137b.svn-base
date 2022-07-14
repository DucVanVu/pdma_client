/**
 * Hepatitis
 * @param $scope
 */
let hepSubController = function ($scope, $state, $q, vm, modal, $timeout, toastr, blockUI, focusFlatPick, openSelectBox, hepService) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

    vm.hepTypes = [
        {id: 'HEP_B', name: 'Xét nghiệm HbsAg', diseaseName: 'Viêm gan B'},
        {id: 'HEP_C', name: 'Xét nghiệm Anti-HCV', diseaseName: 'Viêm gan C'}
    ];

    vm.hepTestResults = [
        {id: true, name: 'Dương tính'},
        {id: false, name: 'Âm tính'}
    ];

    $scope.$on('AppointmentResultController.hep-changed', function() {
        if (!vm.entry.hep || !vm.entry.hep.id) {
            return;
        }

        switch (vm.entry.hep.testType) {
            case 'HEP_B':
                vm.entry.hep.testTypeLabel = 'HbsAg';
                break;
            case 'HEP_C':
                vm.entry.hep.testTypeLabel = 'Anti-HCV';
                break;
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
                // return true to disable
                return moment(date).isAfter(mTodayEnd);
            }
        ],
    };

    // For test date
    vm.hepTestDatepicker = {
        fpItem: null,
        dateOpts: $.extend({
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.hepEntry.testDate = m.add(7, 'hours').toDate();
                }
            }],
        }, datePickerOptions),
        datePostSetup: function (fpItem) {
            vm.hepTestDatepicker.fpItem = fpItem;
            if (vm.hepEntry.testDate) {
                fpItem.setDate(moment(vm.hepEntry.testDate).toDate());
            }
        },
        clear: function () {
            if (vm.hepTestDatepicker.fpItem) {
                vm.hepTestDatepicker.fpItem.clear();
                vm.hepEntry.testDate = null;
            }
        }
    };

    // For treatment start date
    vm.hepTxStartDatepicker = {
        fpItem: null,
        dateOpts: $.extend({
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.hepEntry.txStartDate = m.add(7, 'hours').toDate();
                }
            }],
        }, datePickerOptions),
        datePostSetup: function (fpItem) {
            vm.hepTxStartDatepicker.fpItem = fpItem;
            if (vm.hepEntry.txStartDate) {
                fpItem.setDate(moment(vm.hepEntry.txStartDate).toDate());
            }
        },
        clear: function () {
            if (vm.hepTxStartDatepicker.fpItem) {
                vm.hepTxStartDatepicker.fpItem.clear();
                vm.hepEntry.txStartDate = null;
            }
        }
    };

    // For treatment end date
    vm.hepTxEndDatepicker = {
        fpItem: null,
        dateOpts: $.extend({
            disable: [function (date) {
                let dayAfterArrival = null;
                if (vm.entry.arrivalDate) {
                    dayAfterArrival = moment(vm.entry.arrivalDate).set({
                        hour: 0,
                        minute: 0,
                        second: 0
                    });
                }

                return (date.getDay() === 0 || date.getDay() === 6 || (dayAfterArrival && dayAfterArrival.isAfter(date)));
            }],
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.hepEntry.txEndDate = m.add(7, 'hours').toDate();
                }
            }],
        }, datePickerOptions),
        datePostSetup: function (fpItem) {
            vm.hepTxEndDatepicker.fpItem = fpItem;
            if (vm.hepEntry.txEndDate) {
                fpItem.setDate(moment(vm.hepEntry.txEndDate).toDate());
            }
        },
        clear: function () {
            if (vm.hepTxEndDatepicker.fpItem) {
                vm.hepTxEndDatepicker.fpItem.clear();
                vm.hepEntry.txEndDate = null;
            }
        }
    };

    /**
     * Open add entry modal
     */
    vm.showHepEditForm = function () {

        vm.patient.editable = true; // because only user can only access to this page for active patient

        if (vm.entry.hep && vm.entry.hep.id) {
            vm.hepEntry = {};
            angular.copy(vm.entry.hep, vm.hepEntry);
            vm.hepEntry.isNew = false;
        } else {
            vm.hepEntry = {};
            vm.hepEntry.isNew = true;
            vm.hepEntry.testType = vm.hepTypes[0].id;
            vm.hepEntry.testPositive = false;
            vm.hepEntry.onTreatment = false;
            vm.hepEntry.testDate = vm.entry.arrivalDate; // same as arrival date
        }

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'hep_edit_entry_modal.html',
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
     * Save the entry
     *
     */
    vm.saveHepEntry = function () {
        vm.hepSubmitDisabled = true;
        blockUI.start();

        // Validate...
        if (!vm.hepEntry.testType) {
            toastr.error('Vui lòng chọn loại bệnh viêm gan.', 'Thông báo');
            blockUI.stop();
            openSelectBox('vm.hepEntry.testType');
            vm.toggleHepSubmit();
            return;
        }

        if (vm.hepEntry.testDate) {
            let mSampleDate = moment(vm.hepEntry.testDate);
            if (mSampleDate.isAfter(new Date())) {
                toastr.error('Ngày xét nghiệm không thể sau ngày hiện tại.', 'Thông báo');
                blockUI.stop();
                focusFlatPick('vm.hepEntry.testDate');
                vm.toggleHepSubmit();
                return;
            }
        }

        if (!vm.hepEntry.testPositive) {
            vm.hepEntry.onTreatment = false;
            vm.hepEntry.txStartDate = null;
            vm.hepEntry.txEndDate = null;
        }

        if (vm.hepEntry.onTreatment) {
            if (vm.hepEntry.txStartDate) {
                let mTxStartDate = moment(vm.hepEntry.txStartDate);
                if (mTxStartDate.isAfter(new Date())) {
                    toastr.error('Ngày bắt đầu điều trị không thể sau ngày hiện tại.', 'Thông báo');
                    blockUI.stop();
                    focusFlatPick('vm.hepEntry.txStartDate');
                    vm.toggleHepSubmit();
                    return;
                }

                if (vm.hepEntry.testDate && mTxStartDate.isBefore(vm.hepEntry.testDate)) {
                    toastr.error('Ngày bắt đầu điều trị không thể trước ngày xét nghiệm.', 'Thông báo');
                    blockUI.stop();
                    focusFlatPick('vm.hepEntry.txStartDate');
                    vm.toggleHepSubmit();
                    return;
                }

                if (vm.hepEntry.txEndDate && mTxStartDate.isSameOrAfter(vm.hepEntry.txEndDate)) {
                    toastr.error('Ngày kết thúc điều trị không thể trước ngày bắt đầu điều trị.', 'Thông báo');
                    blockUI.stop();
                    focusFlatPick('vm.hepEntry.txEndDate');
                    vm.toggleHepSubmit();
                    return;
                }
            }
        } else {
            vm.hepEntry.txStartDate = null;
            vm.hepEntry.txEndDate = null;
        }

        delete vm.hepEntry.isNew;

        // Copy the active organization
        vm.hepEntry.organization = {id: vm.patient.organization.id};

        // Copy the case
        vm.hepEntry.theCase = {id: vm.patient.theCase.id};

        // Submit...
        hepService.saveEntry(vm.hepEntry, function success() {
            blockUI.stop();
            toastr.clear();
            toastr.info('Đã lưu thông tin viêm gan.', 'Thông báo');
        }, function failure() {
            blockUI.stop();
            toastr.clear();
            toastr.error('Có lỗi xảy ra khi lưu thông tin viêm gan.', 'Thông báo');
        }).then(function (data) {
            vm.toggleHepSubmit();
            vm.hepEntry = {};

            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            if (data.id) {
                vm.entry.hep = {};
                vm.originEntry.hep = {};

                angular.copy(data, vm.entry.hep);
                angular.copy(data, vm.originEntry.hep);

                $scope.$broadcast('AppointmentResultController.hep-changed');
            }
        });
    };

    // Watchers
    vm.testTypeString = '';
    $scope.$watch('vm.hepEntry.testType', function (newVal, oldVal) {
        if (!newVal) {
            return;
        }

        angular.forEach(vm.hepTypes, function (obj) {
            if (obj.id == newVal) {
                vm.testTypeString = obj.diseaseName;
            }
        });
    });

    $scope.$watch('vm.hepEntry.testDate', function (newVal, oldVal) {
        if (!newVal) {
            return;
        }

        if (vm.hepTxStartDatepicker && vm.hepTxStartDatepicker.fpItem) {
            let testDate = moment(newVal).set({
                hour: 0,
                minute: 0,
                second: 0
            }).toDate();
            vm.hepTxStartDatepicker.fpItem.set('minDate', testDate);
        }

    });

    /**
     * Delete an entry
     * @param id
     */
    vm.deleteHepEntry = function (id) {
        if (!id) {
            toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
            return;
        }

        vm.dialog = {
            icon: 'im im-icon-Flash',
            title: 'Xóa xét nghiệm sàng lọc viêm gan?',
            message: 'Bạn có thực sự muốn xóa thông tin xét nghiệm sàng lọc viêm gan của lần khám này không?',
            callback: function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    hepService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');

                        vm.entry.hep = null;
                        vm.originEntry.hep = null;

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
            vm.hepEntry = {};
        });
    };

    // Enable/disable button
    vm.hepSubmitDisabled = false;
    vm.toggleHepSubmit = function () {
        if (vm.hepSubmitDisabled) {
            toastr.clear();
            $timeout(function () {
                vm.hepSubmitDisabled = false;
            }, 1000);
        } else {
            vm.hepSubmitDisabled = true;
        }
    };

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};