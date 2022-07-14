/**
 * CD4
 * @param $scope
 */
let tbProphylaxis2SubController = function (
    $scope,
    $state,
    $q,
    vm,
    modal,
    toastr,
    blockUI,
    focusFlatPick,
    openSelectBox,
    tbProphylaxis2Service,
    settings,
    tbProphylaxisDispense2Service
) {
    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
    let patient = {};
    $scope.$on(
        "AppointmentResultController.patient-tbprophylaxisdispense-change",
        function (event, data) {
            patient = data;
            //alert(vm.patient);
            vm.showTBProphylaxis2EditForm();
        }
    );
    vm.regimens = [
        {id: "_6H", name: "_6H"},
        {id: "_9H", name: "_9H"},
        {id: "_3HP", name: "_3HP"},
        {id: "_3RH", name: "_3RH"},
        {id: "_4R", name: "_4R"},
        {id: "_1HP", name: "_1HP"},
        {id: "OTHER", name: "Khác"},
    ];
    vm.statusType = [
        {id: 0, name: "Chưa bắt đầu"},
        {id: 1, name: "Đang điều trị"},
        {id: 2, name: "Ngưng điều trị"},
        {id: 3, name: "Hoàn thành điều trị"},
        {id: 4, name: "Bỏ điều trị"},
    ];
    vm.tbProphylaxis2Entry = {};
    // For sample date
    vm.tbProphylaxis2DatepickerStartDate = {
        fpItem: null,
        dateOpts: {
            altFormat: "d/m/Y",
            altInput: true,
            dateFormat: "Y-m-dTH:i:S",
            enableTime: false,
            placeholder: "Chọn ngày..",
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: "vn",
            position: "auto",
            allowInput: true,
            onChange: [
                function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, "YYYY-MM-DD");
                        vm.tbProphylaxis2Entry.startDate = m.add(7, "hours").toDate();
                    }
                },
            ],
        },
        datePostSetup: function (fpItem) {
            vm.tbProphylaxis2DatepickerStartDate.fpItem = fpItem;
            if (vm.tbProphylaxis2Entry.startDate) {
                fpItem.setDate(moment(vm.tbProphylaxis2Entry.startDate).toDate());
            }
        },
        clear: function () {
            if (vm.tbProphylaxis2DatepickerStartDate.fpItem) {
                vm.tbProphylaxis2DatepickerStartDate.fpItem.clear();
                vm.tbProphylaxis2Entry.startDate = null;
            }
        },
    };

    vm.tbProphylaxis2DatepickerEndDate = {
        fpItem: null,
        dateOpts: {
            altFormat: "d/m/Y",
            altInput: true,
            dateFormat: "Y-m-dTH:i:S",
            enableTime: false,
            placeholder: "Chọn ngày..",
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: "vn",
            position: "auto",
            allowInput: true,
            onChange: [
                function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, "YYYY-MM-DD");
                        vm.tbProphylaxis2Entry.endDate = m.add(7, "hours").toDate();
                    }
                },
            ],
        },
        datePostSetup: function (fpItem) {
            vm.tbProphylaxis2DatepickerEndDate.fpItem = fpItem;
            if (vm.tbProphylaxis2Entry.endDate) {
                fpItem.setDate(moment(vm.tbProphylaxis2Entry.endDate).toDate());
            }
        },
        clear: function () {
            if (vm.tbProphylaxis2DatepickerEndDate.fpItem) {
                vm.tbProphylaxis2DatepickerEndDate.fpItem.clear();
                vm.tbProphylaxis2Entry.endDate = null;
            }
        },
    };
    /**
     * Open add entry modal
     */
    vm.showTBProphylaxis2EditForm = function () {
        patient.editable = true; // because only user can only access to this page for active patient

        /**
         * Get all TB Prophylaxis2 tests
         */
        vm.getTBProphylaxis2Entries = function () {
            vm.filter.theCase = {id: patient.id};

            blockUI.start();
            tbProphylaxis2Service.getAllEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.tbProphylaxis2Entries = data;

                /*vm.bsTableTBProphylaxis2Control.options.columns = tbProphylaxis2Service.getTableDefinition(
                  vm.patient
                );*/
                vm.bsTableTBProphylaxis2Control.options.data = vm.tbProphylaxis2Entries;
                vm.bsTableTBProphylaxis2Control.options.totalRows =
                    vm.tbProphylaxis2Entries.length;
            });
        };
        vm.getTBProphylaxis2Entries();
        vm.bsTableTBProphylaxis2Control = {
            options: {
                data: vm.tbProphylaxis2Entries,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: "server",
                columns: tbProphylaxis2Service.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getTBProphylaxis2Entries();
                },
            },
        };
    };

    /**
     * Open add entry modal
     */
    vm.openAddTBProphylaxis2 = function () {
        vm.tbProphylaxis2Entry = {};
        vm.tbProphylaxis2Entry.isNew = true;

        vm.tbProphylaxis2Entry.addDispense = true;

        vm.bsTableTBProphylaxisDispense2Control.options.data = [];
        vm.onEndTimeChange();
        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: "tb_prophylaxis2_entry_edit_modal.html",
            scope: $scope,
            size: "md",
            backdrop: "static",
            keyboard: false,
        });

        vm.modalInstance.closed.then(function () {
            // TODO
        });
    };
    // Thời điểm hoàn thành dự phòng lao
    vm.onEndTimeChange = function () {
        if (vm.tbProphylaxis2Entry.status != null && vm.tbProphylaxis2Entry.status == 3) {
            vm.endTime = true;
        } else {
            vm.endTime = false;
        }
    };

    /**
     * Delete an dispense
     */
    vm.deleteAnDispense = function (index, id) {
        console.log(index);
        if (index == null) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }

        vm.modalInstanceDelete = modal.open({
            animation: true,
            templateUrl: "delete_entry_modal.html",
            scope: $scope,
            size: "md",
            backdrop: "static",
            keyboard: false,
        });

        vm.modalInstanceDelete.result.then(function (answer) {
            if (answer == "yes") {
                blockUI.start();
                tbProphylaxisDispense2Service
                    .deleteEntries(
                        [{id: id}],
                        function success() {
                            blockUI.stop();
                            vm.tbProphylaxis2Entry.dispenses.splice(index, 1);
                            toastr.info("Đã xoá thành công bản ghi!", "Thông báo");
                            tbProphylaxis2Service.getEntry(vm.tbProphylaxis2Entry.id).then(function (data) {
                                if (data && data.id) {
                                    vm.tbProphylaxis2Entry = data;
                                }
                            });
                        },
                        function failure() {
                            blockUI.stop();
                            toastr.error("Có lỗi xảy ra khi xoá bản ghi.", "Thông báo");
                        }
                    )
                    .then(function () {

                    });


            }
        });
    };

    /**
     * edit an dispense
     */
    vm.beginEditDispense = function (index) {
        console.log(vm.tbProphylaxis2Entry.dispenses);
        if (
            vm.tbProphylaxis2Entry.dispenses &&
            vm.tbProphylaxis2Entry.dispenses.length > 0
        ) {
            if (vm.tbProphylaxis2Entry.dispenses[0].dispensed == false) {
                toastr.error("Đã ngưng điều trị!", "Thông báo");
                return;
            }
        }
        if (index === null) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }
        let id = vm.tbProphylaxis2Entry.dispenses[index].id;
        if (!id) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }

        vm.getTBProphylaxisDispense2Entries();

        blockUI.start();
        tbProphylaxisDispense2Service.getEntry(id).then(function (data) {
            blockUI.stop();
            if (data && data.id) {
                vm.tbProphylaxisDispense2Entry = {};
                vm.totalDose = 0;
                for (let i = 0; i < vm.tbProphylaxisDispense2Entries.length; i++) {
                    if (vm.tbProphylaxisDispense2Entries[i].id != id) {
                        vm.totalDose =
                            vm.totalDose + vm.tbProphylaxisDispense2Entries[i].dispensedDoses;
                    }
                }
                vm.afterTotalDose = vm.totalDose;

                vm.bsTableTBProphylaxisDispense2Control.options.data = vm.tbProphylaxisDispense2Entries.filter(
                    (dispense) => dispense.id != id
                );
                angular.copy(data, vm.tbProphylaxisDispense2Entry);

                vm.tbProphylaxisDispense2Entry.isNew = false;
                vm.tbProphylaxisDispense2Entry.dispensed = true;
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: "tb_prophylaxis2_dispense_entry_edit_modal.html",
                    scope: $scope,
                    size: "md",
                    backdrop: "static",
                    keyboard: false,
                });

                vm.modalInstance.closed.then(function () {
                    // load TBProphylaxis2
                    vm.getTBProphylaxis2Entries();
                });
            } else {
                toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            }
        });
    };

    /**
     * add an dispense
     */
    vm.openAddDispense = function () {
        if (!vm.tbProphylaxis2Entry.id) {
            vm.modalInstanceAdd = modal.open({
                animation: true,
                templateUrl: "tb_prophylaxis2_dispense_entry_edit_modal.html",
                scope: $scope,
                size: "md",
                backdrop: "static",
                keyboard: false,
            });
            return;
        }

        let id = vm.tbProphylaxis2Entry.id;
        if (!id) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }
        blockUI.start();
        tbProphylaxis2Service.getEntry(id).then(function (data) {
            blockUI.stop();
            if (data && data.id) {
                vm.tbProphylaxisDispense2Entry = {};
                vm.tbProphylaxisDispense2Entry.isNew = true;
                angular.copy(data, vm.tbProphylaxis2Entry);
                if (
                    vm.tbProphylaxis2Entry.dispenses &&
                    vm.tbProphylaxis2Entry.dispenses.length > 0 &&
                    !vm.tbProphylaxis2Entry.dispenses[0].dispensed
                ) {
                    toastr.error("Đợt đã ngưng điều trị!", "Thông báo");
                    return;
                }
                vm.tbProphylaxisDispense2Entry.round = vm.tbProphylaxis2Entry;
                vm.tbProphylaxisDispense2Entry.dispensed = true;
                vm.tbProphylaxisDispense2Entry.recordDate = vm.entry.arrivalDate;
                vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.entry.drugDays;

                vm.getTBProphylaxisDispense2Entries();
                vm.modalInstanceAdd = modal.open({
                    animation: true,
                    templateUrl: "tb_prophylaxis2_dispense_entry_edit_modal.html",
                    scope: $scope,
                    size: "md",
                    backdrop: "static",
                    keyboard: false,
                });

                if (vm.modalInstanceEdit) {
                    vm.modalInstanceEdit.close();
                }

                vm.modalInstanceAdd.closed.then(function () {
                    // load TBProphylaxis2
                    vm.getTBProphylaxis2Entries();
                });
            } else {
                toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            }
        });
    };

    /**
     * add an dispense
     */
    vm.getDataTBProphylaxisDispense2Entry = function () {
        //alert("a");
        console.log(vm.tbProphylaxisDispense2Entry);
        console.log(vm.tbProphylaxis2Entry);
        if (!vm.tbProphylaxis2Entry.dispenses) {
            vm.tbProphylaxis2Entry.dispenses = [];
        }
        vm.tbProphylaxisDispense2Entry.dispensed = true;
        vm.tbProphylaxis2Entry.dispenses.push(vm.tbProphylaxisDispense2Entry);
        console.log(vm.tbProphylaxis2Entry);

        vm.tbProphylaxisDispense2Entry = {};
        vm.tbProphylaxisDispense2Entry.round = vm.tbProphylaxis2Entry;
        vm.tbProphylaxisDispense2DatepickerRecordDate.clear();
        vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.entry.drugDays;

        vm.modalInstanceAdd.closed.then(function () {
            // load TBProphylaxis2
            //alert("b");
        });
    };

    /**
     * Get all TB ProphylaxisDispense2 tests
     */
    vm.getTBProphylaxisDispense2Entries = function () {
        if (vm.tbProphylaxis2Entry != null && vm.tbProphylaxis2Entry.id != null) {
            vm.filter.round = {id: vm.tbProphylaxis2Entry.id};
            vm.totalDose = 0;
            vm.afterTotalDose = 0;
            blockUI.start();
            tbProphylaxisDispense2Service
                .getAllEntries(vm.filter)
                .then(function (data) {
                    blockUI.stop();
                    vm.tbProphylaxisDispense2Entries = data;

                    /*vm.bsTableTBProphylaxisDispense2Control.options.columns = tbProphylaxisDispense2Service.getTableDefinition(
                      vm.patient
                    );*/
                    vm.bsTableTBProphylaxisDispense2Control.options.data =
                        vm.tbProphylaxisDispense2Entries;
                    vm.bsTableTBProphylaxisDispense2Control.options.totalRows =
                        vm.tbProphylaxisDispense2Entries.length;
                    if (
                        vm.tbProphylaxisDispense2Entries != null &&
                        vm.tbProphylaxisDispense2Entries.length > 0
                    ) {
                        for (let i = 0; i < vm.tbProphylaxisDispense2Entries.length; i++) {
                            vm.totalDose =
                                vm.totalDose +
                                vm.tbProphylaxisDispense2Entries[i].dispensedDoses;
                        }
                        vm.afterTotalDose = vm.totalDose;
                    }
                    if (
                        vm.tbProphylaxisDispense2Entry != null &&
                        vm.tbProphylaxisDispense2Entry.round != null
                    ) {
                        //gợi ý số liều có thể dùng
                        /*switch (vm.tbProphylaxisDispense2Entry.round.regimen) {
                          case "_6H":
                            vm.dose = 180 - vm.totalDose;
                            if (vm.dose > 30) {
                              vm.tbProphylaxisDispense2Entry.dispensedDoses = 30;
                            } else {
                              vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.dose;
                            }
                            vm.afterTotalDose =
                              vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;
                            break;
                          case "_9H":
                            vm.dose = 270 - vm.totalDose;
                            if (vm.dose > 30) {
                              vm.tbProphylaxisDispense2Entry.dispensedDoses = 30;
                            } else {
                              vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.dose;
                            }
                            vm.afterTotalDose =
                              vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;
                            break;
                          case "_3HP":
                            break;
                          case "_3RH":
                            break;
                          case "_4R":
                            break;
                          case "_1HP":
                            break;
                        }*/
                    }
                });
        }
    };

    /**
     * Save the test entry
     */
    vm.saveTBProphylaxis2Entry = function () {
        blockUI.start();
        //regimen
        if (!vm.tbProphylaxis2Entry.regimen) {
            toastr.error("Vui lòng nhập phác đồ.", "Thông báo");
            openSelectBox("vm.tbProphylaxis2Entry.regimen");
            blockUI.stop();
            return;
        }
        if (vm.tbProphylaxis2Entry.regimen != null && vm.tbProphylaxis2Entry.regimen == 'OTHER' && vm.tbProphylaxis2Entry.note == null) {
            toastr.error("Vui lòng ghi rõ phác đồ khác.", "Thông báo");
            openSelectBox("vm.tbProphylaxis2Entry.note");
            blockUI.stop();
            return;
        }

        // Validate
        if (!vm.tbProphylaxis2Entry.startDate) {
            toastr.error("Vui lòng nhập ngày bắt đầu dự phòng lao.", "Thông báo");
            focusFlatPick("vm.tbProphylaxis2Entry.startDate");
            blockUI.stop();
            return;
        }

        //status
        // if (!vm.tbProphylaxis2Entry.status) {
        //   toastr.error("Vui lòng chọn trạng thái.", "Thông báo");
        //   openSelectBox("vm.tbProphylaxis2Entry.status");
        //   blockUI.stop();
        //   return;
        // }

        if (vm.endTime) {
            if (!vm.tbProphylaxis2Entry.endDate) {
                toastr.error("Chưa nhập thời điểm hoàn thành dự phòng lao.", "Thông báo");
                focusFlatPick("vm.tbProphylaxis2Entry.endDate");
                blockUI.stop();
                return;
            }
            let mEndDate = moment(vm.tbProphylaxis2Entry.endDate);
            let mStartDate = moment(vm.tbProphylaxis2Entry.startDate);
            if (!mEndDate.isAfter(mStartDate)) {
                toastr.error("Ngày hoàn thành không thể trước ngày bắt đầu.", "Thông báo");
                focusFlatPick("vm.tbProphylaxis2Entry.endDate");
                blockUI.stop();
                return;
            }
        }

        let mSampleDate = moment(vm.tbProphylaxis2Entry.startDate);
        if (mSampleDate.isAfter(new Date())) {
            toastr.error("Ngày bắt đầu không thể sau ngày hiện tại.", "Thông báo");
            focusFlatPick("vm.tbProphylaxis2Entry.startDate");
            blockUI.stop();
            return;
        }

        // Copy the active organization
        vm.tbProphylaxis2Entry.organization = {};
        angular.copy(
            patient.caseOrgs[0].organization,
            vm.tbProphylaxis2Entry.organization
        );

        // Copy the case
        vm.tbProphylaxis2Entry.theCase = {};
        angular.copy(patient, vm.tbProphylaxis2Entry.theCase);
        if (vm.tbProphylaxis2Entry.regimen != null && vm.tbProphylaxis2Entry.theCase != null && vm.tbProphylaxis2Entry.theCase.id != null) {
            tbProphylaxis2Service.checkAgeByRegimen(vm.tbProphylaxis2Entry.theCase.id, vm.tbProphylaxis2Entry.regimen).then(function (data) {
                if (data && data.code) {
                    console.log(data);
                    toastr.warning(data.note, "Cảnh báo");
                    openSelectBox("vm.tbProphylaxis2Entry.regimen");
                    blockUI.stop();
                    return;
                }
                // Submit
                tbProphylaxis2Service
                    .saveEntry(
                        vm.tbProphylaxis2Entry,
                        function success() {
                            blockUI.stop();
                            toastr.info("Bạn đã lưu dự phòng lao thành công!", "Thông báo");
                        },
                        function failure() {
                            blockUI.stop();
                            toastr.error("Có lỗi xảy ra khi lưu dự phòng lao!", "Thông báo");
                        }
                    )
                    .then(function (data) {
                        // Close the modal
                        if (vm.modalInstance) {
                            vm.modalInstance.close();
                        }

                        if (vm.modalInstanceEdit) {
                            vm.modalInstanceEdit.close();
                        }
                        // clear the entry
                        vm.tbProphylaxis2Entry = {};
                        //set Status
                        /*if (data && data.id) {
                          tbProphylaxis2Service.setStatus(data.id).then(()=> {
                            vm.getTBProphylaxis2Entries();
                          });
                        } else {
                          //load data
                          vm.getTBProphylaxis2Entries();
                        }*/
                        vm.getTBProphylaxis2Entries();
                    });
            });
        }


    };

    /**
     * Open edit entry modal
     */
    $scope.editTBProphylaxis2Entry = function (id) {
        if (!id) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }
        blockUI.start();
        tbProphylaxis2Service
            .getEntry(id)
            .then(function (data) {
                blockUI.stop();
                if (data && data.id) {
                    vm.tbProphylaxis2Entry = {};

                    angular.copy(data, vm.tbProphylaxis2Entry);

                    vm.tbProphylaxis2Entry.isNew = false;

                    vm.modalInstanceEdit = modal.open({
                        animation: true,
                        templateUrl: "tb_prophylaxis2_entry_edit_modal.html",
                        scope: $scope,
                        size: "md",
                        backdrop: "static",
                        keyboard: false,
                    });

                    vm.modalInstanceEdit.closed.then(function () {
                        // TODO
                        //vm.getTBProphylaxis2Entries();
                    });
                } else {
                    toastr.error("Không tìm thấy bản ghi!", "Thông báo");
                }
            }).then(() => {
            vm.onEndTimeChange();
        });

    };

    /**
     * Delete an entry
     * @param id
     */
    $scope.deleteTBProphylaxis2Entry = function (id) {
        if (!id) {
            toastr.error("Không tìm thấy bản ghi!", "Thông báo");
            return;
        }

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: "delete_entry_modal.html",
            scope: $scope,
            size: "md",
            backdrop: "static",
            keyboard: false,
        });

        vm.modalInstance.result.then(function (answer) {
            if (answer == "yes") {
                blockUI.start();
                tbProphylaxis2Service
                    .deleteEntries(
                        [{id: id}],
                        function success() {
                            blockUI.stop();
                            toastr.info("Đã xoá thành công bản ghi!", "Thông báo");
                        },
                        function failure() {
                            blockUI.stop();
                            toastr.error("Có lỗi xảy ra khi xoá bản ghi.", "Thông báo");
                        }
                    )
                    .then(function () {
                        // reload the grid
                        vm.getTBProphylaxis2Entries();
                    });
            }
        });
    };
    vm.close = function () {
        vm.modalInstance.closed();
    };
    //cảnh báo phác đồ theo độ tuổi
    vm.onRegimenChange = function () {
        /*if(vm.tbProphylaxis2Entry.regimen!=null && vm.tbProphylaxis2Entry.theCase!=null && vm.tbProphylaxis2Entry.theCase.id!=null){
            tbProphylaxis2Service.checkAgeByRegimen(vm.tbProphylaxis2Entry.theCase.id,vm.tbProphylaxis2Entry.regimen).then(function (data) {
                if (data && data.code) {
                    console.log(data);
                    toastr.warning(data.note, "Cảnh báo");
                }
            });
        }*/
    }
    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};
