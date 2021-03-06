/**
 * Social health insurance
 * @param $scope
 */
let shiSubController = function ($scope, $state, $q, vm, modal, $timeout, toastr, blockUI, focusFlatPick, openSelectBox, utils, shiService, orgService) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

    vm.options = {
        shiAvailability: [
            {id: true, name: 'Có thẻ bảo hiểm y tế'},
            {id: false, name: 'Không có thẻ bảo hiểm y tế'}
        ],
        shiRoutes: [
            {id: 1, name: 'Đúng tuyến'},
            {id: 2, name: 'Không đúng tuyến (nội tỉnh)'},
            {id: 3, name: 'Không đúng tuyến (ngoại tỉnh)'}
        ],
        opcs: []
    };

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

    $scope.$on('AppointmentResultController.shi-changed', function () {
        vm.entry.shiView = {};
        if (!vm.entry.shi || !vm.entry.shi.id) {
            if (vm.entry.prevShi) {
                angular.copy(vm.entry.prevShi, vm.entry.shiView);
            }
        } else {
            angular.copy(vm.entry.shi, vm.entry.shiView);
        }

        if (vm.entry.shiView && vm.entry.shiView.shiExpiryDate) {
            vm.entry.shiView.expiryWarning = null;
            let mCutpoint = moment(vm.entry.appointmentDate);

            if (vm.entry.id && vm.entry.arrivalDate) {
                mCutpoint = moment(vm.entry.arrivalDate);
            }

            if (mCutpoint.isAfter(vm.entry.shiView.shiExpiryDate)) {
                vm.entry.shiView.expiryWarning = 'Thẻ bảo hiểm của bệnh nhân đã hết hạn ở lần tái khám này.';
            }
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
    };

    // For test date
    vm.shiExpireDatepicker = {
        fpItem: null,
        dateOpts: $.extend({
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.shiEntry.shiExpiryDate = m.add(7, 'hours').toDate();
                }
            }],
        }, datePickerOptions),
        datePostSetup: function (fpItem) {
            vm.shiExpireDatepicker.fpItem = fpItem;
            if (vm.shiEntry.shiExpiryDate) {
                fpItem.setDate(moment(vm.shiEntry.shiExpiryDate).toDate());
            }
        },
        clear: function () {
            if (vm.shiExpireDatepicker.fpItem) {
                vm.shiExpireDatepicker.fpItem.clear();
                vm.shiEntry.shiExpiryDate = null;
            }
        }
    };

    /**
     * On selection of primary care facility
     */
    vm.onPrimaryCareFacilityChange = function () {
        if (vm.shiEntry.primaryCareFacility && vm.shiEntry.primaryCareFacility.id == -1) {
            vm.shiEntry.primaryCareFacility = {};
            angular.copy(vm.options.opcs[0], vm.shiEntry.primaryCareFacility);
        }
    };

    /**
     * Open add entry modal
     */
    vm.showShiEditForm = function () {

        vm.patient.editable = true; // because only user can only access to this page for active patient
        vm.shiEntry = {};

        if (vm.entry.shi && vm.entry.shi.id) {
            angular.copy(vm.entry.shi, vm.shiEntry);
        } else if (vm.entry.prevShi && vm.entry.prevShi.id) {
            angular.copy(vm.entry.prevShi, vm.shiEntry);
        }

        // primary care facility
        if (!vm.shiEntry.primaryCareFacility && vm.shiEntry.primaryCareFacilityName) {
            vm.shiEntry.primaryCareFacility = {};
            angular.copy(vm.options.opcs[0], vm.shiEntry.primaryCareFacility);
        }

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'shi_entry_edit_modal.html',
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
    vm.saveShiEntry = function () {
        vm.shiSubmitDisabled = true;
        blockUI.start();

        if (!vm.shiEntry.hasShiCard) {
            vm.shiEntry.hasShiCard = false;
            vm.shiEntry.shiCardNumber = null;
            vm.shiEntry.shiExpiryDate = null;
            vm.shiEntry.primaryCareFacility = null;
            vm.shiEntry.primaryCareFacilityName = null;
        } else {

            // Validate...
            if (!vm.shiEntry.shiCardNumber) {
                toastr.error('Vui lòng nhập mã thẻ bảo hiểm y tế.', 'Thông báo');
                blockUI.stop();
                focus('vm.shiEntry.shiCardNumber');
                vm.toggleShiSubmit();
                return;
            }

            vm.shiEntry.shiCardNumber = vm.shiEntry.shiCardNumber.replace(/\s+/g, '');

            if (!utils.isValidSHINumber(vm.shiEntry.shiCardNumber)) {
                toastr.error('Mã thẻ bảo hiểm y tế không hợp lệ.', 'Thông báo');
                blockUI.stop();
                focus('vm.shiEntry.shiCardNumber');
                vm.toggleShiSubmit();
                return;
            }

            if (!vm.shiEntry.shiExpiryDate) {
                toastr.error('Vui lòng nhập ngày hết hạn thẻ bảo hiểm y tế.', 'Thông báo');
                blockUI.stop();
                focusFlatPick('vm.shiEntry.shiExpiryDate');
                vm.toggleShiSubmit();
                return;
            }

            // if (!vm.shiEntry.primaryCareFacility || vm.shiEntry.primaryCareFacility.id == null || (vm.shiEntry.primaryCareFacility.id == 0 && !vm.shiEntry.primaryCareFacilityName)) {
            //     blockUI.stop();
            //     toastr.error('Vui lòng chọn nơi đăng ký khám chữa bệnh ban đầu.', 'Thông báo');
            //
            //     if (!vm.shiEntry.primaryCareFacility || vm.shiEntry.primaryCareFacility.id == null) {
            //         openSelectBox('vm.shiEntry.primaryCareFacility');
            //     } else {
            //         focus('vm.shiEntry.primaryCareFacilityName');
            //     }
            //
            //     vm.toggleShiSubmit();
            //     return;
            // }
        }

        // Interview date is mandatory
        vm.shiEntry.interviewDate = vm.entry.arrivalDate;

        // Copy the active organization
        vm.shiEntry.organization = {id: vm.patient.organization.id};

        // Copy the case
        vm.shiEntry.theCase = {id: vm.patient.theCase.id};

        // Submit...
        shiService.saveEntry(vm.shiEntry, function success() {
            blockUI.stop();
            toastr.clear();
            toastr.info('Đã lưu thông tin thẻ bảo hiểm y tế.', 'Thông báo');
        }, function failure() {
            blockUI.stop();
            toastr.clear();
            toastr.error('Có lỗi xảy ra khi lưu thông tin thẻ bảo hiểm y tế.', 'Thông báo');
        }).then(function (data) {
            vm.toggleShiSubmit();
            vm.shiEntry = {};

            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            if (data.id) {
                vm.entry.shi = {};
                vm.originEntry.shi = {};

                angular.copy(data, vm.entry.shi);
                angular.copy(data, vm.originEntry.shi);

                $scope.$broadcast('AppointmentResultController.shi-changed');
            }
        });
    };

    // Watchers
    $scope.$watch('vm.shiEntry.hasShiCard', function (newVal, oldVal) {
        if (!newVal && vm.shiEntry) {
            vm.shiEntry.shiCardNumber = null;
            vm.shiEntry.shiExpiryDate = null;
            vm.shiEntry.primaryCareFacility = null;
            vm.shiEntry.primaryCareFacilityName = null;
        } else {
            let tmp = {};
            if (vm.entry.shi && vm.entry.shi.id) {
                angular.copy(vm.entry.shi, tmp);
            } else if (vm.entry.prevShi && vm.entry.prevShi.id) {
                angular.copy(vm.entry.prevShi, tmp);
            }

            if (tmp.id) {
                vm.shiEntry.shiCardNumber = tmp.shiCardNumber;
                vm.shiEntry.shiExpiryDate = tmp.shiExpiryDate;

                if (tmp.primaryCareFacility && tmp.primaryCareFacility.id) {
                    vm.shiEntry.primaryCareFacility = {};
                    angular.copy(tmp.primaryCareFacility, vm.shiEntry.primaryCareFacility);
                }

                vm.shiEntry.primaryCareFacilityName = tmp.primaryCareFacilityName;
            }

            // primary care facility
            if (vm.shiEntry && !vm.shiEntry.primaryCareFacility && vm.shiEntry.primaryCareFacilityName) {
                vm.shiEntry.primaryCareFacility = {id: 0, name: 'Cơ sở khác'};
            }
        }
    });

    /**
     * Delete an entry
     * @param id
     */
    vm.deleteShiEntry = function (id) {
        if (!id) {
            toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
            return;
        }

        vm.dialog = {
            icon: 'im im-icon-Flash',
            title: 'Xóa thông tin bảo hiểm y tế?',
            message: 'Bạn có thực sự muốn xóa thông tin thẻ bảo hiểm y tế của bệnh nhân không?',
            callback: function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    shiService.deleteEntries([{id: id}], function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');

                        vm.entry.shi = null;
                        vm.originEntry.shi = null;

                        $scope.$broadcast('AppointmentResultController.shi-changed');
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
            vm.shiEntry = {};
        });
    };

    // Enable/disable button
    vm.shiSubmitDisabled = false;
    vm.toggleShiSubmit = function () {
        if (vm.shiSubmitDisabled) {
            toastr.clear();
            $timeout(function () {
                vm.shiSubmitDisabled = false;
            }, 1000);
        } else {
            vm.shiSubmitDisabled = true;
        }
    };

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};