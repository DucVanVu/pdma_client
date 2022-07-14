/**
 * Multimonth dispensing
 * @param $scope
 */
let mmdSubController = function ($scope, $state, $q, $timeout, settings, vm, modal, toastr, blockUI, focus, service, mmdService) {

        let deferred = $q.defer();

        vm.mmdEntry = {};

        vm.mmdFilter = {
            pageSize: 12,
            includeDeleted: true,
        };

        $scope.$on('AppointmentResultController.mmd-status-changed', function () {
            if (vm.entry.mmdEval && vm.entry.mmdEval.id) {
                vm.entry.onMMD = vm.entry.mmdEval.onMmd;
                vm.entry.eligible4MMD = vm.entry.mmdEval.eligible;

                vm.mmdEntry = {};
                angular.copy(vm.entry.mmdEval, vm.mmdEntry);
            } else {
                if (vm.entry.isLatestAppointment || vm.entry.isLatestEditableAppointment) {
                    if (vm.entry.prevMmdEval && vm.entry.prevMmdEval.id) {
                        vm.entry.onMMD = vm.entry.prevMmdEval.onMmd;

                        vm.mmdEntry = {};
                        angular.copy(vm.entry.prevMmdEval, vm.mmdEntry);
                    } else {
                        vm.entry.onMMD = false;
                        vm.mmdEntry = {};
                    }
                }
            }
        });

        /**
         * Put patient on MMD
         */
        vm.putPatientOnMMD = function () {
            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'Cấp thuốc nhiều tháng',
                message: 'Bạn có thực sự muốn cấp thuốc nhiều tháng cho bệnh nhân này không?',
                callback: function (answer) {
                    if (answer == 'yes') {
                        let entry = {
                            evaluationDate: vm.entry.arrivalDate,
                            eligible: true,
                            onMmd: true,
                            organization: {id: vm.patient.organization.id},
                            theCase: {id: vm.patient.theCase.id}
                        };

                        blockUI.start();
                        mmdService.saveEntry(entry, function success() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.info('Đã ghi nhận cấp thuốc nhiều tháng cho bệnh nhân!', 'Thông báo');
                        }, function failure() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.error('Có lỗi xảy ra khi ghi nhận cấp thuốc nhiều tháng cho bệnh nhân.', 'Thông báo');
                        }).then(function (data) {
                            if (data && data.id) {
                                vm.entry.mmdEval = {};
                                vm.originEntry.mmdEval = {};

                                angular.copy(data, vm.entry.mmdEval);
                                angular.copy(data, vm.originEntry.mmdEval);

                                $scope.$broadcast('AppointmentResultController.mmd-status-changed');
                            }
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
            });
        };

        /**
         * Retire patient from MMD
         */
        vm.retirePatientFromMMD = function () {
            if (!vm.entry.onMMD || !((vm.entry.mmdEval && vm.entry.mmdEval.id) || (vm.entry.prevMmdEval && vm.entry.prevMmdEval.id))) {
                return;
            }

            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'Hủy cấp thuốc nhiều tháng',
                message: 'Bạn có thực sự muốn hủy cấp thuốc nhiều tháng cho bệnh nhân này không?',
                callback: function (answer) {
                    if (answer == 'yes') {
                        let entry = {};

                        if (vm.entry.mmdEval && vm.entry.mmdEval.id) {
                            angular.copy(vm.entry.mmdEval, entry);
                        } else if (vm.entry.prevMmdEval && vm.entry.prevMmdEval.id) {
                            angular.copy(vm.entry.prevMmdEval, entry);
                        }

                        entry.onMmd = false;
                        entry.organization = {id: vm.patient.organization.id};
                        entry.theCase = {id: vm.patient.theCase.id};

                        blockUI.start();
                        mmdService.saveEntry(entry, function success() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.info('Đã ghi nhận hủy cấp thuốc nhiều tháng cho bệnh nhân!', 'Thông báo');
                        }, function failure() {
                            blockUI.stop();
                            toastr.clear();
                            toastr.error('Có lỗi xảy ra khi ghi nhận hủy cấp thuốc nhiều tháng cho bệnh nhân.', 'Thông báo');
                        }).then(function (data) {
                            if (data && data.id) {
                                vm.entry.mmdEval = {};
                                vm.originEntry.mmdEval = {};

                                angular.copy(data, vm.entry.mmdEval);
                                angular.copy(data, vm.originEntry.mmdEval);

                                $scope.$broadcast('AppointmentResultController.mmd-status-changed');
                            }
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
            });
        };

        // For appointment date selection
        vm.mmdDatePicker1 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'l, d/m/Y',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: false,
                placeholder: 'Chọn ngày..',
                plugins: [new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                allowInput: false,
                disable: [function (date) {
                    let todayEnd = moment().set({
                        hour: 23,
                        minute: 59,
                        second: 59
                    });

                    return (date.getDay() === 0 || date.getDay() === 6 || todayEnd.isSameOrBefore(date));
                }],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.mmdEntry4Update.evaluationDate = m.add(7, 'hours').toDate();

                        // avoid focusing on the datepicker
                        focus('mmd_update_modal_closebtn');

                        // Update hard eligibility
                        let filter = {
                            theCase: {id: vm.patient.theCase.id},
                            organization: {id: vm.patient.organization.id},
                            cutpoint: vm.mmdEntry4Update.evaluationDate
                        };

                        blockUI.start();
                        mmdService.getHardEligible(filter).then(function (data) {
                            blockUI.stop();
                            vm.mmdEntry4Update.adult = data.adult;
                            vm.mmdEntry4Update.arvGt12Month = data.onARVGt12Months;
                            vm.mmdEntry4Update.vlLt200 = data.vlLt200CD4Ge500;
                        });
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.mmdDatePicker1.fpItem = fpItem;
                if (vm.mmdEntry4Update && vm.mmdEntry4Update.evaluationDate) {
                    fpItem.setDate(moment(vm.mmdEntry4Update.evaluationDate).toDate());
                    console.log(vm.mmdEntry4Update.evaluationDate);
                }
            }
        };

        // get table definition
        vm.bsTableControlMMDHistory = {
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
                columns: mmdService.getTableDefinitionForHistory(),
            }
        };

        // get data
        vm.getMMDEvaluationHistory = function () {

            // putting this in here to make sure patient has been initiated
            vm.mmdFilter.theCase = {id: vm.patient.theCase.id};

            blockUI.start();
            mmdService.getAllEntries(vm.mmdFilter).then(function (data) {
                blockUI.stop();

                let isSiteManager = $scope.isSiteManager($scope.currentUser);

                vm.bsTableControlMMDHistory.options.columns = mmdService.getTableDefinitionForHistory(isSiteManager);
                vm.bsTableControlMMDHistory.options.data = data;
                vm.bsTableControlMMDHistory.options.totalRows = data.length;
            });
        };

        /**
         * Updating the MMD evals list
         */
        vm.onIncludeDeleteSelected = function () {
            vm.getMMDEvaluationHistory();
        };

        /**
         * Show MMD overview for one patient
         */
        vm.showMMDOverview = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'mmd_overview_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                vm.getMMDEvaluationHistory();
            });

            vm.modalInstance.closed.then(function (data) {
                if (!vm.entry.dirty) {
                    $state.go($state.$current, null, {reload: true});
                }
            });
        };

        /**
         * Soft delete an MMD entry
         */
        $scope.mmdDeleteEntry = function (id, patientId) {

            if (!id || !patientId) {
                toastr.error('Không tìm thấy thông tin bản ghi!', 'Thông báo');
                return;
            }

            vm.dialog = {
                title: 'Xoá bản ghi cấp thuốc nhiều tháng',
                message: '<div class="font-weight-500">Bạn có chắc chắn muốn xoá bản ghi đã chọn không?</div><div class="margin-top-10 font-weight-500"><span class="font-weight-600 margin-right-10">LƯU Ý:</span>Bản ghi sẽ không bị xoá hoàn toàn khỏi cơ sở dữ liệu. Bạn vẫn có thể khôi phục lại khi cần.</div>',
                callback: function (answer) {
                    if (answer === 'yes') {
                        blockUI.start();
                        mmdService.updateDeletionStatus({id: id, deleted: true}, function success() {
                            blockUI.stop();
                            toastr.info('Bạn đã xoá thành công bản ghi.', 'Thông báo');

                            // reload
                            // vm.showMMDOverview();
                            vm.getMMDEvaluationHistory();
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi!', 'Thông báo');
                        });
                    }

                    vm.modalInstance2.close();
                }
            };

            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Restore a deleted entry
         * @param id
         * @param patientId
         */
        $scope.mmdRestoreEntry = function (id, patientId) {

            if (!id || !patientId) {
                toastr.error('Không tìm thấy thông tin bản ghi!', 'Thông báo');
                return;
            }

            vm.dialog = {
                title: 'Khôi phục bản ghi cấp thuốc nhiều tháng',
                message: 'Bạn có chắc chắn muốn khôi phục một bản ghi đã xoá không?',
                callback: function (answer) {
                    if (answer === 'yes') {
                        blockUI.start();
                        mmdService.updateDeletionStatus({id: id, deleted: null}, function success() {
                            blockUI.stop();
                            toastr.info('Bạn đã khôi phục thành công bản ghi.', 'Thông báo');

                            // reload
                            // vm.showMMDOverview();
                            vm.getMMDEvaluationHistory();
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi khôi phục bản ghi!', 'Thông báo');
                        });
                    }

                    vm.modalInstance2.close();
                }
            };

            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.closed.then(function () {
                vm.dialog = {};
            });
        };

        vm.addMMDEntry = function () {
            let cutpoint = moment().set({hour: 7, minute: 0, second: 0});

            if (cutpoint.day() == 6 || cutpoint.day() == 7) {
                cutpoint = cutpoint.subtract(cutpoint.day() - 5, 'days');
            }

            let filter = {
                theCase: {id: vm.patient.theCase.id},
                organization: {id: vm.patient.organization.id},
                cutpoint: cutpoint.toDate()
            };

            mmdService.getHardEligible(filter).then(function (data) {

                vm.mmdEntry4Update = {
                    theCase: {id: vm.patient.theCase.id},
                    organization: {id: vm.patient.organization.id},
                    evaluationDate: cutpoint.toDate(),
                    adult: data.adult,
                    arvGt12Month: data.onARVGt12Months,
                    vlLt200: data.vlLt200CD4Ge500
                };

                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'mmd_update_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance2.result.then(function (res) {
                    if (res === 'yes') {

                        if (!vm.mmdEntry4Update.evaluationDate) {
                            toastr.error('Vui lòng cho biết ngày đánh giá.', 'Thông báo');
                        }

                        // conversion
                        vm.mmdEntry4Update.noOIs = !vm.mmdEntry4Update.hasOI;
                        vm.mmdEntry4Update.noDrugAdvEvent = !vm.mmdEntry4Update.hasDrugAE;
                        vm.mmdEntry4Update.noPregnancy = !vm.mmdEntry4Update.pregnant;

                        mmdService.saveEntry(vm.mmdEntry4Update, function success() {
                            toastr.info('Bạn đã ghi nhận thành công bản ghi!', 'Thông báo');

                            // Refresh the mmd history
                            // vm.showMMDOverview();
                            vm.getMMDEvaluationHistory();

                        }, function failure() {
                            toastr.error('Có lỗi xảy ra khi thêm mới bản ghi.', 'Thông báo');
                        });
                    }
                });
            });
        };

        /**
         * Update the MMD entry
         */
        $scope.updateMMDEntry = function (id) {

            if (!id) {
                toastr.error('Không tìm thấy thông tin bản ghi!', 'Thông báo');
                return;
            }

            mmdService.getEntry(id).then(function (data) {

                if (!data || !data.id) {
                    toastr.error('Không tìm thấy thông tin bản ghi!', 'Thông báo');
                    return;
                }

                vm.mmdEntry4Update = {};
                angular.copy(data, vm.mmdEntry4Update);

                // conversion
                vm.mmdEntry4Update.hasOI = !vm.mmdEntry4Update.noOIs;
                vm.mmdEntry4Update.hasDrugAE = !vm.mmdEntry4Update.noDrugAdvEvent;
                vm.mmdEntry4Update.pregnant = !vm.mmdEntry4Update.noPregnancy;

                // update editability
                vm.mmdUpdateEligibleStatus();

                vm.modalInstance2 = modal.open({
                    animation: true,
                    templateUrl: 'mmd_update_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance2.result.then(function (res) {
                    if (res === 'yes') {

                        // conversion
                        vm.mmdEntry4Update.noOIs = !vm.mmdEntry4Update.hasOI;
                        vm.mmdEntry4Update.noDrugAdvEvent = !vm.mmdEntry4Update.hasDrugAE;
                        vm.mmdEntry4Update.noPregnancy = !vm.mmdEntry4Update.pregnant;

                        mmdService.saveEntry(vm.mmdEntry4Update, function success() {
                            toastr.info('Bạn đã cập nhật thành công bản ghi!', 'Thông báo');

                            // Refresh the mmd history
                            // vm.showMMDOverview();
                            vm.getMMDEvaluationHistory();

                        }, function failure() {
                            toastr.error('Có lỗi xảy ra khi cập nhật bản ghi.', 'Thông báo');
                        });
                    }
                });
            });
        };

        /**
         * Update eligibility and mmd status
         */
        vm.mmdUpdateEligibleStatus = function () {
            if (!vm.mmdEntry4Update) {
                return;
            }

            let eligible = vm.mmdEntry4Update.adult;
            eligible = eligible && vm.mmdEntry4Update.arvGt12Month;
            eligible = eligible && vm.mmdEntry4Update.vlLt200;
            eligible = eligible && vm.mmdEntry4Update.goodAdherence;

            eligible = eligible && !vm.mmdEntry4Update.hasOI;
            eligible = eligible && !vm.mmdEntry4Update.hasDrugAE;
            eligible = eligible && !vm.mmdEntry4Update.pregnant;

            vm.mmdEntry4Update.eligibleEditable = eligible;
            vm.mmdEntry4Update.eligible = eligible;

            if (!eligible) {
                vm.mmdEntry4Update.onMmd = false;
            }
        };

        /**
         * Check boolean prop
         * @param prop
         */
        vm.onBooleanPropertyChanged4Mmd = function (prop) {

            if (!vm.mmdEntry4Update[prop]) {
                vm.mmdEntry4Update[prop] = null;
            }

            vm.mmdUpdateEligibleStatus();
        };

// Enable/disable button
        vm.mmdEntrySubmitDisabled = true;
        vm.toggleMmdEntrySubmit = function () {
            if (vm.mmdEntrySubmitDisabled) {
                $timeout(function () {
                    vm.mmdEntrySubmitDisabled = false;
                }, 1000);
            } else {
                vm.mmdEntrySubmitDisabled = true;
            }
        };

// resolve the deferred object
        deferred.resolve(vm);

        return deferred.promise;
    }
;