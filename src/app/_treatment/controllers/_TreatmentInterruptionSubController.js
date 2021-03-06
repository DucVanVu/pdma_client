/**
 * Treatment interruption
 * @param $scope
 */
let txInterruptionSubController = function ($scope, $state, $q, focus, settings, vm, modal, toastr, blockUI, $timeout, focusFlatPick, openSelectBox, orgService, service) {

    let deferred = $q.defer();

    vm.displayHistoryChart = function () {
        let opcs = [];
        let ranges = [];
        let today = moment().valueOf();
        let y = [];
        angular.forEach(vm.fullStatusHistory, function (obj) {
            if (obj.status == 'CANCELLED_ENROLLMENT') { //obj.status == 'PENDING_ENROLLMENT' ||
                return;
            }

            if (!y.includes(obj.organization.id)) {
                y.push(obj.organization.id);
            }

            let statusStr = '';
            let colorStr = '#d6d6d6';
            switch (obj.status) {
                case 'ACTIVE':
                    colorStr = '#337AB7';
                    statusStr = 'Bệnh nhân đang được quản lý';
                    break;
                case 'TRANSFERRED_OUT':
                    colorStr = '#9500ff';
                    statusStr = 'Bệnh nhân đã chuyển đi';
                    break;
                case 'LTFU':
                    colorStr = '#e02222';
                    statusStr = 'Bệnh nhân đã bỏ trị';
                    break;
                case 'DEAD':
                    colorStr = '#888';
                    statusStr = 'Bệnh nhân đã tử vong';
                    break;
                case 'PENDING_ENROLLMENT':
                    colorStr = '#2c4762';
                    statusStr = 'Đang chờ tiếp nhận';
            }

            if (obj.organization.id == 779) {
                opcs.push(obj.organizationName);
            } else {
                opcs.push(obj.organization.name);
            }
            let range = {
                x: moment(obj.startDate).add(7, 'hour').valueOf(),
                x2: moment(obj.endDate).add(7, 'hour').valueOf(),
                y: y.indexOf(obj.organization.id),
                toPresent: false,
                status: statusStr,
                color: colorStr
            };

            if (!obj.endDate) {
                range.x2 = today;
                range.toPresent = true;
            }

            ranges.push(range);
        });

        Highcharts.chart('interruption', {
            chart: {
                type: 'xrange',
                height: 400,
                style: {
                    fontFamily: 'Quicksand'
                }
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                max: moment().add(2, 'month').toDate(),
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        fontWeight: 'bold',
                        fontSize: '12px'
                    }
                },
                categories: opcs,
                reversed: true
            },
            plotOptions: {
                series: {
                    cursor: 'col-resize',
                }
            },
            series: [{
                name: 'Cơ sở',
                // pointPadding: 0,
                // groupPadding: 0,
                pointWidth: 20,
                borderRadius: 0,
                data: ranges,
                dataLabels: {
                    enabled: true
                }
            }],
            legend: {
                enabled: false
            },
            tooltip: {
                crosshairs: true,
                formatter: function () {
                    let category = this.yCategory,
                        from = new Date(this.x),
                        to = new Date(this.x2);
                    let s = '<div><b>' + category + '</b>';
                    s += '</div><br />';
                    s += '<div>&mdash; Giai đoạn: <b>';
                    s +=  moment(from).format('DD/MM/YYYY')
                    if (this.point.toPresent) {
                        s += ' - hiện tại';
                    } else {
                        s += ' - ' + moment(to).format('DD/MM/YYYY');
                    }
                    s += '</b></div><br />';
                    s += '<div style="margin-top: 5px">';
                    s += '&mdash; Tình trạng: <b>' + this.point.status + '</b>';
                    s += '</div>';

                    return s;
                }
            },
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

    /**
     * On facility selection
     */
    vm.onFacilitySelection = function () {
        if (vm.caseOrg.organization && vm.caseOrg.organization.id == 0) {
            vm.caseOrg.organization = {};
            angular.copy(vm.otherOPC, vm.caseOrg.organization);
        }

        if (vm.caseOrg.organization && vm.caseOrg.organization.id != vm.otherOPC.id) {
            vm.caseOrg.organizationName = null;
        }
    };

    /**
     * Cancel the transfer out of the patient
     */
    vm.cancelTransferOut = function () {
        vm.dialog = {
            icon: 'im im-icon-Eraser',
            title: 'Huỷ bỏ chuyển gửi bệnh nhân?',
            message: 'Bạn có chắc chắn là bạn đã thực hiện chuyển gửi nhầm bệnh nhân này và muốn huỷ thao tác chuyển gửi đó không?',
            callback: function (answer) {
                if (answer == 'no') {
                    if (vm.modalInstance2) {
                        vm.modalInstance2.close();
                    }
                }

                if (answer == 'yes') {

                    vm.referral.theCase = {};
                    angular.copy(vm.entry.theCase, vm.referral.theCase);

                    blockUI.start();
                    service.cancelReferral(vm.referral, function success() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.info('Bạn đã huỷ chuyển gửi thành công!', 'Thông báo');
                    }, function failure() {
                        blockUI.stop();
                        toastr.clear();
                        toastr.error('Có lỗi xảy ra khi cập nhật thông tin!', 'Thông báo');
                    }).finally(function () {

                        if (vm.modalInstance2) {
                            vm.modalInstance2.close();
                        }

                        if (vm.modalInstance) {
                            vm.modalInstance.close();
                        }

                        $timeout(function () {
                            // vm.getFullTxHistory();
                            vm.getSelectedPatient();
                        }, 300);
                    });
                }
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
            vm.referral = {};
        });
    };

    /**
     * Update referral status when the receiving OPC is not using the software,
     * or there are unexpected changes during referral
     * @param disableResultOption
     */
    vm.updateReferralResult = function (disableResultOption) {
        // OPCs
        blockUI.start();
        orgService.getAllOrganizations({activeOnly: true, opcSiteOnly: true}).then(function (data) {
            blockUI.stop();

            if (data && data.length > 0) {

                // remove the current organization from the list
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

                // remove the receiving organization from the list
                foundIndex = -1;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].id == vm.fullStatusHistory[0].organization.id) {
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

            // add other opc
            vm.opcs.unshift({id: 0, name: '--'});
            vm.opcs.unshift(vm.otherOPC);

            vm.referral.currentCaseOrg = {};

            vm.filteredReferralResults = [];
            angular.copy(vm.referralResults, vm.filteredReferralResults);
            if (disableResultOption) {
                vm.referral.disableResultOption = disableResultOption;
                vm.referral.result = vm.referralResults[3].id;
            } else {
                vm.filteredReferralResults.splice(3, 1);
            }

            vm.modalInstance2 = modal.open({
                animation: true,
                templateUrl: 'update_referral_result_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance2.closed.then(function () {
                vm.opcs = [];
                vm.referral = {};
                // vm.getSelectedPatient();
            });
        });
    };

    /**
     * On change of referral result change
     */
    vm.onReferralResultChange = function () {
        if (vm.referral.result != 3) {
            vm.referral.newOrg = null;
            vm.referral.newOrgName = null;
        }
    };

    /**
     * Save the referral result
     */
    vm.saveReferralResult = function () {
        vm.submitDisabled = true;
        blockUI.start();

        if (!vm.referral.result) {
            toastr.error('Vui lòng chọn kết quả chuyển gửi.', 'Thông báo');
            openSelectBox('vm.referral.result');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        if (!vm.referral.resultDate) {
            toastr.error('Vui lòng chọn ngày ghi nhận kết quả chuyển gửi.', 'Thông báo');
            focusFlatPick('vm.referral.resultDate');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        let mResultDate = moment(vm.referral.resultDate);
        if (mResultDate.isAfter(new Date(), 'day')) {
            toastr.error('Ngày ghi nhận kết quả chuyển gửi không thể sau ngày hiện tại.', 'Thông báo');
            focusFlatPick('vm.referral.resultDate');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        if (vm.referral.result == 3) {
            if (!vm.referral.newOrg || !vm.referral.newOrg.id) {
                toastr.error('Vui lòng chọn cơ sở đã tiếp nhận bệnh nhân.', 'Thông báo');
                openSelectBox('vm.referral.newOrg');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }
        }

        if (vm.referral.result == 4) {
            vm.referral.newOrg = {id: vm.entry.organization.id};
            // angular.copy(vm.entry.organization, vm.referral.newOrg);

            vm.referral.currentCaseOrg = {};
            angular.copy(vm.entry, vm.referral.currentCaseOrg);
        }

        vm.referral.theCase = {id: vm.entry.theCase.id};
        // angular.copy(vm.entry.theCase, vm.referral.theCase);

        service.updateReferralResult(vm.referral, function success() {
            blockUI.stop();
            vm.toggleSubmit();
            toastr.info('Bạn đã lưu thành công kết quả chuyển gửi.', 'Thông báo');
        }, function failure() {
            blockUI.stop();
            vm.toggleSubmit();
            toastr.error('Có lỗi xảy ra khi cập nhật kết quả chuyển gửi.', 'Thông báo');
        }).then(function (data) {
            if (!data) {
                toastr.error('Dữ liệu không hợp lệ.', 'Thông báo');
            }

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

    /**
     * Print out the referral sheet
     * @param id
     */
    $scope.printReferralSheet = function (id) {
        if (!id) {
            toastr.error('Không tìm thấy thông tin!', 'Thông báo');
            return;
        }

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

        blockUI.start();
        service.downloadReferralSheet(id).success(successHandler).error(function (data) {
            blockUI.stop();
        }).finally(function () {
            // todo
        });
    };

    /**
     * Select an option to enroll a patient
     */
    vm.preEnrollPatient = function () {

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'pre_enroll_patient_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance.closed.then(function () {
            vm.enrollPatientOpts = {};
        });
    };

    vm.enrollPatientOpts = {0: false, 1: false};

    /**
     * Watch the enrollment types when enrolling a transferred-in patient
     */
    vm.onEnrollmentOptSelected = function (opt) {
        if (vm.enrollPatientOpts[opt]) {
            vm.enrollPatientOpts[1 - opt] = false;
        }

        let prevVal = !vm.enrollPatientOpts[opt];
        if (prevVal) {
            vm.enrollPatientOpts[opt] = true;
        }
    };


    /**
     * Enroll a transferred-in patient
     */
    vm.enrollPatient = function () {
        // if (!vm.enrollPatientOpts || vm.enrollPatientOpts.length < 2) {
        //     return;
        // }
        //
        // if (vm.modalInstance) {
        //     vm.modalInstance.close();
        // }

        // if (vm.enrollPatientOpts[1]) {
        //     vm.caseOrgUpdate.targetStatus = 'ACTIVE';
        //     vm.caseOrgUpdate.currentObj.refTrackingOnly = true;
        //
        //     service.updatePatientStatus(vm.caseOrgUpdate, function success() {
        //         blockUI.stop();
        //     }, function failure() {
        //         blockUI.stop();
        //         // unexpected error
        //         toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
        //     }).then(function (result) {
        //         switch (result) {
        //             case -1:
        //                 // expected error
        //                 toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
        //                 break;
        //             case 0:
        //                 vm.caseOrgUpdate = {currentObj: {}, newObj: {}};
        //                 vm.clearSelectedPatient();
        //                 toastr.info('Đã cập nhật thành công trạng thái điều trị của bệnh nhân.', 'Thông báo');
        //                 break;
        //             case 1:
        //                 toastr.warning('Bạn không thể thực hiện cập nhật trạng thái cho hồ sơ bệnh án này.', 'Thông báo');
        //                 break;
        //         }
        //     });
        // } else if (vm.enrollPatientOpts[0]) {
        // clear the default start date
        vm.caseOrgUpdate.currentObj.startDate = null;

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'enroll_patient_modal.html',
            scope: $scope,
            size: 'auto',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance.opened.then(function () {
            $timeout(function () {
                focusFlatPick('vm.caseOrgUpdate.currentObj.startDate');
            }, 120);
        });

        vm.modalInstance.closed.then(function () {
            vm.getSelectedPatient();
            vm.caseOrgUpdate = {currentObj: {}, newObj: {}};
        });
        // }
    };

    /**
     * Save patient enrollment data for a transferred-in patient
     */
    vm.savePatientEnrollment = function () {
        vm.submitDisabled = true;
        blockUI.start();

        // validation
        if (!vm.caseOrgUpdate.currentObj.refTrackingOnly) {
            if (!vm.caseOrgUpdate.currentObj.startDate) {
                toastr.error('Vui lòng chọn ngày tiếp nhận bệnh nhân!', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.startDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            let mStartDate = moment(vm.caseOrgUpdate.currentObj.startDate);
            if (mStartDate.isAfter(new Date(), 'day')) {
                toastr.error('Ngày tiếp nhận bệnh nhân không thể sau ngày hiện tại!', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.startDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            // check and compare with the date the patient was transferred out
            // vm.entry.startDate is by default assigned to transferred out date
            if (mStartDate.isBefore(vm.entry.startDate, 'day')) {
                toastr.error('Ngày tiếp nhận bệnh nhân không thể trước ngày chuyển gửi (' + moment(vm.entry.startDate).format('DD/MM/YYYY') + ')', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate.currentObj.startDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            if (!vm.caseOrgUpdate.currentObj.patientChartId || vm.caseOrgUpdate.currentObj.patientChartId.trim() == '') {
                toastr.error('Vui lòng nhập mã bệnh án của bệnh nhân!', 'Thông báo');
                focus('vm.caseOrgUpdate.currentObj.patientChartId');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }
        }

        vm.caseOrgUpdate.targetStatus = 'ACTIVE';

        let submission = function () {
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

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        let co = {
            id: vm.entry.id,
            patientChartId: vm.caseOrgUpdate.currentObj.patientChartId,
            organization: {id: vm.entry.organization.id},
        };
        if (!vm.caseOrgUpdate.currentObj.refTrackingOnly) {
            service.patientChartIdExists(co).then(function (data) {
                if (data && data.id) {
                    vm.dialog = {message: 'Mã bệnh án đã được sử dụng cho bệnh nhân khác có tên <b>' + data.theCase.person.fullname + '</b>. Vui lòng kiểm tra lại.'};
                    blockUI.stop();

                    vm.modalInstance2 = modal.open({
                        animation: true,
                        templateUrl: 'general_error_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance2.closed.then(function () {
                        vm.toggleSubmit();
                        vm.dialog = null;
                        focus('vm.caseOrgUpdate.currentObj.patientChartId');
                    });
                } else {
                    // finally, submit data after validation...
                    submission();
                }
            });
        } else {
            submission();
        }
    };


    /**
     * This patient was referred to another OPC where may not be using OPC Assist.
     * Now he or she comes back to the current OPC for continuum  of care
     */
    vm.reEnrollPatient = function () {
        vm.opcs = [];
        vm.caseOrgUpdate2 = {
            currentObj: {},
            newObj: {
                patientChartId: vm.entry.patientChartId,
                organization: {}
            }
        };

        if ($scope.isSiteManager($scope.currentUser)) {
            angular.copy(vm.orgsWritable, vm.opcs);
        } else if ($scope.isProvincialManager($scope.currentUser)) {
            angular.copy(vm.orgsReadable, vm.opcs);
        }

        if (vm.opcs && vm.opcs.length > 0) {
            angular.copy(vm.opcs[0], vm.caseOrgUpdate2.newObj.organization);
        }

        vm.modalInstance2 = modal.open({
            animation: true,
            templateUrl: 're-enroll_patient_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance2.closed.then(function () {
            vm.caseOrgUpdate2 = {currentObj: {}, newObj: {}};
            vm.getSelectedPatient();
        });
    };

    /**
     * Save patient enrollment data for a transferred-in patient
     */
    vm.savePatientReEnrollment = function () {
        vm.submitDisabled = true;
        blockUI.start();

        // validation
        if (!vm.caseOrgUpdate2.newObj.startDate) {
            toastr.error('Vui lòng chọn ngày bệnh nhân tới đăng ký điều trị!', 'Thông báo');
            focusFlatPick('vm.caseOrgUpdate2.newObj.startDate');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        let mStartDate = moment(vm.caseOrgUpdate2.newObj.startDate);
        if (mStartDate.isAfter(new Date(), 'day')) {
            toastr.error('Ngày bệnh nhân tới đăng ký điều trị không thể sau ngày hiện tại!', 'Thông báo');
            focusFlatPick('vm.caseOrgUpdate2.newObj.startDate');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        let startDateAtPrevOrg = vm.fullStatusHistory[0].startDate;
        if (startDateAtPrevOrg && mStartDate.isBefore(startDateAtPrevOrg, 'day')) {
            toastr.error('Ngày bệnh nhân tới đăng ký không hợp lệ! Vui lòng kiểm tra lại.', 'Thông báo');
            focusFlatPick('vm.caseOrgUpdate2.newObj.startDate');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        if (!vm.caseOrgUpdate2.originStatus) {
            toastr.error('Vui lòng chọn lý do bệnh nhân quay lại!', 'Thông báo');
            openSelectBox('vm.caseOrgUpdate2.originStatus');
            blockUI.stop();
            vm.toggleSubmit();
            return;
        }

        if (vm.caseOrgUpdate2.currentObj.endDate) {
            let mEndDate = moment(vm.caseOrgUpdate2.currentObj.endDate);

            if (startDateAtPrevOrg && mEndDate.isBefore(startDateAtPrevOrg, 'day')) {
                toastr.error('Ngày bệnh nhân được chuyển đi không hợp lệ! Vui lòng kiểm tra lại.', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate2.currentObj.endDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }

            if (mStartDate.isBefore(vm.caseOrgUpdate2.currentObj.endDate, 'day')) {
                toastr.error('Ngày bệnh nhân được chuyển đi không thể sau ngày bệnh nhân đến đăng ký điều trị!', 'Thông báo');
                focusFlatPick('vm.caseOrgUpdate2.currentObj.endDate');
                blockUI.stop();
                vm.toggleSubmit();
                return;
            }
        }

        // vm.caseOrgUpdate2.newObj.organization = {id: vm.entry.organization.id};
        vm.caseOrgUpdate2.newObj.theCase = {id: vm.entry.theCase.id};
        // if (vm.entry.organization.id === vm.caseOrgUpdate2.newObj.organization.id) {
        //     vm.caseOrgUpdate2.newObj.patientChartId = vm.entry.patientChartId;
        // }

        service.reEnrollPatient(vm.caseOrgUpdate2, function success() {
            blockUI.stop();
            vm.toggleSubmit();
        }, function failure() {
            blockUI.stop();
            vm.toggleSubmit();
            // unexpected error
            toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
        }).then(function (result) {
            if (result) {
                toastr.info('Đã cập nhật thành công trạng thái điều trị của bệnh nhân.', 'Thông báo');
            } else {
                // expected error
                toastr.error('Có lỗi xảy ra khi cập nhật trạng thái điều trị của bệnh nhân.', 'Thông báo');
            }

            if (vm.modalInstance2) {
                vm.modalInstance2.close();
            }

            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            // redirect to the patient list
            $state.go('application.treatment');
        });
    };

    /**
     * Allowing the provincial staff to fully edit the case-org entry
     * @param id
     */
    $scope.provincialEditCaseOrg = function (id) {

        if (!id || !vm.fullStatusHistory || vm.fullStatusHistory.length <= 0) {
            return;
        }

        let caseOrgObj = null;
        let foundIndex = 0;

        for (let i = 0; i < vm.fullStatusHistory.length; i++) {
            let obj = vm.fullStatusHistory[i];

            if (obj.id == id) {
                caseOrgObj = {};
                angular.copy(obj, caseOrgObj);
                foundIndex = i;
                break;
            }
        }

        if (!caseOrgObj) {
            return;
        }

        vm.caseOrg = {};
        angular.copy(caseOrgObj, vm.caseOrg);

        vm.allowedStatuses = [];

        if (foundIndex == 0) {
            angular.copy(vm.patientStatuses, vm.allowedStatuses);
        } else {
            angular.copy(vm.patientStatuses4Backlog, vm.allowedStatuses);
        }

        vm.modalInstance2 = modal.open({
            animation: true,
            templateUrl: 'provincial_edit_case_org_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance2.opened.then(function () {
        });

        vm.modalInstance2.closed.then(function (data) {
            vm.caseOrg = {};
        });
    };

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};