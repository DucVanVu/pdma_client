/**
 * CD4
 * @param $scope
 */
let tbProphylaxisDispense2SubController = function (
  $scope,
  $state,
  $q,
  vm,
  modal,
  toastr,
  blockUI,
  focusFlatPick,
  openSelectBox,
  tbProphylaxisDispense2Service,
  settings,
  tbProphylaxis2Service
) {
  let deferred = $q.defer();

  let mTodayStart = moment().set({ hour: 0, minute: 0, second: 0 });
  let mTodayEnd = moment().set({ hour: 23, minute: 59, second: 59 });

  vm.tbProphylaxis2Entry = {};
  vm.tbProphylaxisDispense2Entry = {};
  vm.totalDose = 0;
  vm.afterTotalDose = 0;
  vm.resumeReasons = [
    { id: "TRANSFERRED_IN", name: "Bệnh nhân chuyển tới tiếp tục DPL" },
    { id: "DRUG_STOCKIN", name: "Có thuốc DPL trở lại" },
    { id: "SIDE_EFFECT_FREE", name: "Hết tác dụng phụ của thuốc" },
    { id: "GOOD_ADHERENCE", name: "Bệnh nhân tuân thủ trở lại" },
    { id: "OTHER", name: "Khác" },
    { id: "NO_INFORMATION", name: "Không có thông tin" },
  ];
  vm.stopReasons = [
    { id: "CONFIRMED_TB", name: "Mắc lao" },
    { id: "PREGNANT", name: "Có thai" },
    { id: "HEP_COINFECTION", name: "Đồng nhiễm VGVR B/C" },
    { id: "DRUG_STOCKOUT", name: "Hết thuốc DPL" },
    { id: "ALLERGIC", name: "Dị ứng" },
    { id: "HIGH_ALT", name: "Men gan tăng" },
    { id: "TRANSFERRED_OUT", name: "Chuyển đi" },
    { id: "LTFU", name: "Bỏ trị" },
    { id: "DEAD", name: "Tử vong" },
    { id: "BAD_ADHERENCE", name: "Không tuân thủ" },
    { id: "ARRESTED", name: "Bị bắt" },
    { id: "OTHER", name: "Khác" },
    { id: "NO_INFORMATION", name: "Không có thông tin" },
  ];
  // For Record date
  vm.tbProphylaxisDispense2DatepickerRecordDate = {
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
            vm.tbProphylaxisDispense2Entry.recordDate = m
              .add(7, "hours")
              .toDate();
          }
        },
      ],
    },
    datePostSetup: function (fpItem) {
      vm.tbProphylaxisDispense2DatepickerRecordDate.fpItem = fpItem;
      if (vm.tbProphylaxisDispense2Entry.recordDate) {
        fpItem.setDate(
          moment(vm.tbProphylaxisDispense2Entry.recordDate).toDate()
        );
      }
    },
    clear: function () {
      if (vm.tbProphylaxisDispense2DatepickerRecordDate.fpItem) {
        vm.tbProphylaxisDispense2DatepickerRecordDate.fpItem.clear();
        vm.tbProphylaxisDispense2Entry.recordDate = null;
      }
    },
  };

  /**
   * Open add entry modal
   */
  $scope.tbProphylaxisDispense2Entry = function (id) {
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

    //vm.patient.editable = true; // because only user can only access to this page for active patient
  };

  /**
   * Get all TB ProphylaxisDispense2 tests
   */
  vm.getTBProphylaxisDispense2Entries = function () {
    if (vm.tbProphylaxis2Entry != null && vm.tbProphylaxis2Entry.id != null) {
      vm.filter.round = { id: vm.tbProphylaxis2Entry.id, dispensed: true };
      vm.totalDose = 0;
      vm.afterTotalDose = 0;
      blockUI.start();
      tbProphylaxisDispense2Service
        .getAllEntries(vm.filter)
        .then(function (data) {
          blockUI.stop();
          vm.tbProphylaxisDispense2Entries = data;
          
          vm.bsTableTBProphylaxisDispense2Control.options.columns = tbProphylaxisDispense2Service.getTableDefinition(
            vm.patient
          );
          vm.bsTableTBProphylaxisDispense2Control.options.data =
            vm.tbProphylaxisDispense2Entries;
          vm.bsTableTBProphylaxisDispense2Control.options.totalRows =
            vm.tbProphylaxisDispense2Entries.length;
          if (
            vm.tbProphylaxisDispense2Entries != null &&
            vm.tbProphylaxisDispense2Entries.length > 0
          ) {
            for (let i = 0; i < vm.tbProphylaxisDispense2Entries.length; i++) {
              if( vm.tbProphylaxisDispense2Entries[i].dispensedDoses>0) {
                vm.totalDose =
                vm.totalDose +
                vm.tbProphylaxisDispense2Entries[i].dispensedDoses;
              }
              
            }
          }
          vm.afterTotalDose = vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;          
          // if (
          //   vm.tbProphylaxisDispense2Entry != null &&
          //   vm.tbProphylaxisDispense2Entry.round != null
          // ) {
          //   //gợi ý số liều có thể dùng
          //   switch (vm.tbProphylaxisDispense2Entry.round.regimen) {
          //     case "_6H":
          //       vm.dose = 180 - vm.totalDose;
          //       if (vm.dose > 30) {
          //         vm.tbProphylaxisDispense2Entry.dispensedDoses = 30;
          //       } else {
          //         vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.dose;
          //       }
          //       vm.afterTotalDose =
          //         vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;
          //       break;
          //     case "_9H":
          //       vm.dose = 270 - vm.totalDose;
          //       if (vm.dose > 30) {
          //         vm.tbProphylaxisDispense2Entry.dispensedDoses = 30;
          //       } else {
          //         vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.dose;
          //       }
          //       vm.afterTotalDose =
          //         vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;
          //       break;
          //     case "_3HP":
          //       break;
          //     case "_3RH":
          //       break;
          //     case "_4R":
          //       break;
          //     case "_1HP":
          //       break;
          //   }
          // }
        });
    }
  };
  vm.bsTableTBProphylaxisDispense2Control = {
    options: {
      data: vm.tbProphylaxisDispense2Entries,
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
      columns: tbProphylaxisDispense2Service.getTableDefinition(),
      onPageChange: function (index, pageSize) {
        vm.filter.pageSize = pageSize;
        vm.filter.pageIndex = index - 1;

        vm.getTBProphylaxisDispense2Entries();
      },
    },
  };

  /**
   * On Dispensed Doses change
   */
  //đang fix lỗi ở đây
  vm.onDispensedDosesChange = function () {
    vm.tbProphylaxisDispense2Entry.dispensedDoses = parseFloat(
      vm.tbProphylaxisDispense2Entry.dispensedDoses
    );

    if (
      isNaN(vm.tbProphylaxisDispense2Entry.dispensedDoses) ||
      vm.tbProphylaxisDispense2Entry.dispensedDoses < 0
    ) {
      vm.tbProphylaxisDispense2Entry.dispensedDoses = null;
    } else if (
      vm.tbProphylaxisDispense2Entry.dispensedDoses > 0 &&
      vm.tbProphylaxisDispense2Entry.dispensedDoses < 1
    ) {
      vm.tbProphylaxisDispense2Entry.dispensedDoses = 1;
      vm.afterTotalDose = vm.totalDose + 1;
    } else {
      vm.tbProphylaxisDispense2Entry.dispensedDoses = Math.ceil(
        vm.tbProphylaxisDispense2Entry.dispensedDoses
      );
      vm.afterTotalDose =
		  vm.totalDose + vm.tbProphylaxisDispense2Entry.dispensedDoses;
    }
  };

  /**
   * Save the test entry
   */
  vm.saveTBProphylaxisDispense2Entry = function () {
    blockUI.start();
    // Validate
    if (!vm.tbProphylaxisDispense2Entry.recordDate) {
      toastr.error("Vui lòng nhập ngày phát thuốc.", "Thông báo");
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }

    // lỗi vượt quá giới hạn số liều thuốc theo phác đồ
    if(vm.afterTotalDose > 270) {
      toastr.error("Vượt quá giới hạn số liều thuốc theo phác đồ.", "Thông báo");
      openSelectBox("vm.tbProphylaxisDispense2Entry.stopReason");
      blockUI.stop();
      return;
    }

    let mSampleDate = moment(vm.tbProphylaxisDispense2Entry.recordDate);
    if (mSampleDate.isAfter(new Date())) {
      toastr.error("Ngày phát thuốc không thể sau ngày hiện tại.", "Thông báo");
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }
    //dispensedDoses
    if (!vm.tbProphylaxisDispense2Entry.dispensedDoses) {
      toastr.error("Vui lòng nhập số liều.", "Thông báo");
      openSelectBox("vm.tbProphylaxisDispense2Entry.dispensedDoses");
      blockUI.stop();
      return;
    }
    //sửa lỗi TC02 
    let arrayDate = vm.tbProphylaxisDispense2Entries;
    if (arrayDate.length >0) {
      let mSampleDate3 = moment(arrayDate[0].recordDate);
      if (mSampleDate3.length != 0 && mSampleDate.isAfter(mSampleDate3) && (mSampleDate.diff(mSampleDate3)/(1000 * 3600 * 24)) >= 30 ) {
        toastr.info("Số liều thuốc lần trước cấp phát đã dùng  hết ", "Thông báo");
      }
      if (mSampleDate3.length != 0 && mSampleDate.isAfter(mSampleDate3) && (mSampleDate.diff(mSampleDate3)/(1000 * 3600 * 24)) < 30 ) {
        toastr.error("Số liều thuốc lần trước cấp phát chưa dùng  hết ", "Thông báo");
        focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
        blockUI.stop();
        return;
      }
    }

    //sửa lỗi phác đồ _3PH
    if (vm.tbProphylaxisDispense2Entry.round.regimen == "_3HP" && vm.afterTotalDose > 12 ) {
        toastr.error("Vượt quá giới hạn số liều thuốc theo phác đồ.", "Thông báo");
        openSelectBox("vm.tbProphylaxisDispense2Entry.stopReason");
        blockUI.stop();
        return;
    }
    if (arrayDate.length >0 &&  vm.tbProphylaxisDispense2Entry.round.regimen == "_3HP" && vm.afterTotalDose < 12) {
      let mSampleDate4 = moment(arrayDate[0].recordDate);
      if (mSampleDate.isAfter(mSampleDate4) && (mSampleDate.diff(mSampleDate4)/(1000 * 3600 * 24*7)) > 4 ) {
        toastr.info("Số liều thuốc lần trước cấp phát đã dùng  hết", "Thông báo");
      }
      if (mSampleDate.isAfter(mSampleDate4) && (mSampleDate.diff(mSampleDate4)/(1000 * 3600 * 24*7)) < 4 ) {
        toastr.error("Số liều thuốc lần trước cấp phát chưa dùng  hết", "Thông báo");
        focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
        blockUI.stop();
        return;
      }
    }


	if(vm.tbProphylaxisDispense2Entry!=null && vm.tbProphylaxisDispense2Entry.round!=null && vm.tbProphylaxisDispense2Entry.round.startDate!=null){
		let mStartDate = moment(vm.tbProphylaxisDispense2Entry.round.startDate);
		if(mStartDate.isAfter(mSampleDate)){
			toastr.error("Ngày phát thuốc không thể trước ngày bắt đầu điều trị dự phòng lao.", "Thông báo");
			focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
			blockUI.stop();
			return;
		}
	}
	if(vm.tbProphylaxisDispense2Entry!=null && vm.tbProphylaxisDispense2Entry.round!=null&& vm.tbProphylaxisDispense2Entry.round.status!=null&& vm.tbProphylaxisDispense2Entry.round.status==3){
		toastr.error("Bạn đã hoàn thành đợt điều trị.", "Thông báo");
		 blockUI.stop();
		 return;
	}
	
    vm.tbProphylaxisDispense2Entry.dispensed = true; //cấp thuốc
	//gọi hàm cảnh báo trước khi cấp thuốc
	/*
	tbProphylaxis2Service.checkComplete(vm.tbProphylaxisDispense2Entry.round.id,vm.tbProphylaxisDispense2Entry.id,vm.tbProphylaxisDispense2Entry.dispensedDoses,vm.tbProphylaxisDispense2Entry.recordDate).then(function (data) {
		if (data && data.code) {
			console.log(data);
		}		
	});*/
	
    // Submit
    tbProphylaxisDispense2Service
      .saveEntry(
        vm.tbProphylaxisDispense2Entry,
        function success() {
          blockUI.stop();
          //toastr.info("Bạn đã phát thuốc thành công!", "Thông báo");
        },
        function failure() {
          blockUI.stop();
          toastr.error("Có lỗi xảy ra khi phát thuốc!", "Thông báo");
        }
      )
      .then(function (data) {
		if(data&& data.code!=null && data.code=="-1"){
			toastr.warning(data.note+ " Không thể cấp thuốc được. Đề nghị chọn ngày cấp thuốc khác.", "Cảnh báo");
			focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
		}else{
			toastr.info("Bạn đã phát thuốc thành công!", "Thông báo");
			// clear the entry
			vm.tbProphylaxisDispense2Entry = {};
			vm.tbProphylaxisDispense2Entry.round = vm.tbProphylaxis2Entry;
			vm.tbProphylaxisDispense2DatepickerRecordDate.clear();
			vm.tbProphylaxisDispense2Entry.dispensedDoses = vm.entry.drugDays;
			//load data
			vm.getTBProphylaxisDispense2Entries();
		}
        
        /*if(vm.tbProphylaxis2Entry && vm.tbProphylaxis2Entry.id) {
          tbProphylaxis2Service.setStatus(vm.tbProphylaxis2Entry.id).then(()=> {
            vm.getTBProphylaxis2Entries();  
          });
        } else {
          vm.getTBProphylaxis2Entries();
        }*/
      });
  };

  /**
   * Open edit entry modal
   */
  $scope.editTBProphylaxisDispense2Entry = function (id) {
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
   * Delete an entry
   * @param id
   */
  $scope.deleteTBProphylaxisDispense2Entry = function (id) {
    if (!id) {
      toastr.error("Không tìm thấy bản ghi!", "Thông báo");
      return;
    }

    /*if (!vm.patient.editable) {
			modal.open({
				animation: true,
				templateUrl: 'noneditable_modal.html',
				scope: $scope,
				size: 'md',
				backdrop: 'static',
				keyboard: false
			});

			return;
		}*/

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
        tbProphylaxisDispense2Service
          .deleteEntries(
            [{ id: id }],
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
            // clear the entry
            vm.tbProphylaxisDispense2Entry = {};
            vm.tbProphylaxisDispense2Entry.round = vm.tbProphylaxis2Entry;
            vm.tbProphylaxisDispense2DatepickerRecordDate.clear();
            //load data
            vm.getTBProphylaxisDispense2Entries();
          });
      }
    });
  };
  /**
   * Open resum entry modal //tiếp tục điều trị dự phòng lao
   */
  $scope.resumeEntry = function (id) {
    if (!id) {
      toastr.error("Không tìm thấy bản ghi!", "Thông báo");
      return;
    }

    blockUI.start();
    //lấy bản ghi cuối cùng của lần cấp phát thuốc
    tbProphylaxisDispense2Service.getLatestEntry(id).then(function (data) {
      blockUI.stop();
      if (data && data.id) {
        //đoạn này nên là thêm mới
        vm.tbProphylaxisDispense2Entry = {};
        vm.tbProphylaxisDispense2Entry.isNew = true;
        //angular.copy(data, vm.tbProphylaxisDispense2Entry);
        vm.tbProphylaxisDispense2Entry.recordDate = new Date();
        vm.tbProphylaxis2Entry = data.round;
        vm.tbProphylaxisDispense2Entry.round = data.round;
        vm.modalInstance = modal.open({
          animation: true,
          templateUrl: "tb_prophylaxis2_dispense_return_modal.html",
          scope: $scope,
          size: "md",
          backdrop: "static",
          keyboard: false,
        });

        vm.modalInstance.closed.then(function () {
          // TODO
        });
      } else {
        //nếu chưa có bản ghi dispense nào thì thêm mới
        tbProphylaxis2Service.getEntry(id).then(function (data) {
          if (data && data.id) {
            //đoạn này nên là thêm mới
            vm.tbProphylaxisDispense2Entry = {};
            vm.tbProphylaxisDispense2Entry.isNew = true;
            //angular.copy(data, vm.tbProphylaxisDispense2Entry);
            vm.tbProphylaxisDispense2Entry.recordDate = new Date();
            vm.tbProphylaxis2Entry = data;
            vm.tbProphylaxisDispense2Entry.round = data;
            vm.modalInstance = modal.open({
              animation: true,
              templateUrl: "tb_prophylaxis2_dispense_return_modal.html",
              scope: $scope,
              size: "md",
              backdrop: "static",
              keyboard: false,
            });

            vm.modalInstance.closed.then(function () {
              // TODO
            });
          }
        });
        //toastr.error('Không tìm thấy bản ghi đợt điều trị tương ứng!', 'Thông báo');
      }
    });
  };
  /**
   * Open stop entry modal //ngừng điều trị dự phòng lao
   */
  $scope.stopEntry = function (id) {
    if (!id) {
      toastr.error("Không tìm thấy bản ghi!", "Thông báo");
      return;
    }

    blockUI.start();
    //lấy bản ghi cuối cùng của lần cấp phát thuốc
    tbProphylaxisDispense2Service.getLatestEntry(id).then(function (data) {
      blockUI.stop();
      if (data && data.id) {
        vm.tbProphylaxisDispense2Entry = {};
        vm.tbProphylaxisDispense2Entry.isNew = false;
        //angular.copy(data, vm.tbProphylaxisDispense2Entry);
        vm.tbProphylaxisDispense2Entry.recordDate = new Date();
        vm.tbProphylaxis2Entry = data.round;
        vm.tbProphylaxisDispense2Entry.round = data.round;
        vm.modalInstance = modal.open({
          animation: true,
          templateUrl: "tb_prophylaxis2_dispense_stop_modal.html",
          scope: $scope,
          size: "md",
          backdrop: "static",
          keyboard: false,
        });

        vm.modalInstance.closed.then(function () {
          // TODO
        });
      } else {
        //nếu chưa có bản ghi dispense nào thì thêm mới
        tbProphylaxis2Service.getEntry(id).then(function (data) {
          if (data && data.id) {
            //đoạn này nên là thêm mới
            vm.tbProphylaxisDispense2Entry = {};
            vm.tbProphylaxisDispense2Entry.isNew = true;
            //angular.copy(data, vm.tbProphylaxisDispense2Entry);
            vm.tbProphylaxisDispense2Entry.recordDate = new Date();
            vm.tbProphylaxis2Entry = data;
            vm.tbProphylaxisDispense2Entry.round = data;
            vm.modalInstance = modal.open({
              animation: true,
              templateUrl: "tb_prophylaxis2_dispense_return_modal.html",
              scope: $scope,
              size: "md",
              backdrop: "static",
              keyboard: false,
            });

            vm.modalInstance.closed.then(function () {
              // TODO
            });
          }
        });
        //toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
      }
    });
  };
  /**
   * Save the test resum entry
   */
  vm.saveTBProphylaxisDispense2ResumeEntry = function () {
    blockUI.start();
    // Validate
    if (!vm.tbProphylaxisDispense2Entry.recordDate) {
      toastr.error(
        "Vui lòng nhập ngày tiếp tục điều trị dự phòng lao.",
        "Thông báo"
      );
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }

    let mSampleDate = moment(vm.tbProphylaxisDispense2Entry.recordDate);
    if (mSampleDate.isAfter(new Date())) {
      toastr.error("Ngày tiếp tục không thể sau ngày hiện tại.", "Thông báo");
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }
    //dispensedDoses

    if (!vm.tbProphylaxisDispense2Entry.resumeReason) {
      toastr.error("Vui lòng nhập lý do tiếp tục điều trị.", "Thông báo");
      openSelectBox("vm.tbProphylaxisDispense2Entry.resumeReason");
      blockUI.stop();
      return;
    }
    vm.tbProphylaxisDispense2Entry.dispensed = true;
    vm.tbProphylaxisDispense2Entry.dispensedDoses = -1;
    
    // Submit
    tbProphylaxisDispense2Service
      .saveEntry(
        vm.tbProphylaxisDispense2Entry,
        function success() {
          blockUI.stop();
          //toastr.info("Bạn đã xác nhận thành công!", "Thông báo");
        },
        function failure() {
          blockUI.stop();
          toastr.error(
            "Có lỗi xảy ra khi tiếp tục điều trị dự phòng lao!",
            "Thông báo"
          );
        }
      )
      .then(function (data) {
		if(data&& data.code!=null && data.code=="-1"){
			toastr.warning(data.note+ " Không thể xác nhận được. Đề nghị chọn ngày tiếp tục khác.", "Cảnh báo");
			focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
		}else{
			toastr.info("Bạn đã xác nhận thành công!", "Thông báo");
			// Close the modal
			if (vm.modalInstance) {
			  vm.modalInstance.close();
			}

			// clear the entry
			vm.tbProphylaxisDispense2Entry = {};
			//load data TBProphylaxis2
			vm.getTBProphylaxis2Entries();
		}
        
        //vm.getTBProphylaxisDispense2Entries();
      });
  };

  /**
   * Save the test stop entry
   */
  vm.saveTBProphylaxisDispense2StopEntry = function () {
    blockUI.start();
    // Validate
    if (!vm.tbProphylaxisDispense2Entry.recordDate) {
      toastr.error(
        "Vui lòng nhập ngày ngừng điều trị dự phòng lao.",
        "Thông báo"
      );
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }

    let mSampleDate = moment(vm.tbProphylaxisDispense2Entry.recordDate);
    if (mSampleDate.isAfter(new Date())) {
      toastr.error(
        "Ngày ngừng điều trị không thể sau ngày hiện tại.",
        "Thông báo"
      );
      focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
      blockUI.stop();
      return;
    }
    //dispensedDoses
    if (!vm.tbProphylaxisDispense2Entry.stopReason) {
      toastr.error("Vui lòng nhập lý do ngừng điều trị.", "Thông báo");
      openSelectBox("vm.tbProphylaxisDispense2Entry.stopReason");
      blockUI.stop();
      return;
    }

    vm.tbProphylaxisDispense2Entry.dispensed = false;
    vm.tbProphylaxisDispense2Entry.dispensedDoses = -2;
    // Submit
    tbProphylaxisDispense2Service
      .saveEntry(
        vm.tbProphylaxisDispense2Entry,
        function success() {
          blockUI.stop();
          //toastr.info("Bạn đã ngừng điều trị dự phòng thành công!","Thông báo");
        },
        function failure() {
          blockUI.stop();
          toastr.error(
            "Có lỗi xảy ra khi ngừng điều trị dự phòng lao!",
            "Thông báo"
          );
        }
      )
      .then(function (data) {
		if(data&& data.code!=null && data.code=="-1"){
			toastr.warning(data.note+ " Không thể ngừng điều trị được. Đề nghị chọn ngày ngừng điều trị dự phòng khác.", "Cảnh báo");
			focusFlatPick("vm.tbProphylaxisDispense2Entry.recordDate");
		}else{
			toastr.info("Bạn đã ngừng điều trị dự phòng thành công!","Thông báo");
			// Close the modal
			if (vm.modalInstance) {
			  vm.modalInstance.close();
			}

			// clear the entry
			vm.tbProphylaxisDispense2Entry = {};
			vm.getTBProphylaxis2Entries();
		}
        

        //load data TBProphylaxis2
        /*if(vm.tbProphylaxis2Entry && vm.tbProphylaxis2Entry.id) {
          tbProphylaxis2Service.setStatus(vm.tbProphylaxis2Entry.id).then(()=> {
            vm.getTBProphylaxis2Entries();
          });
        } else {
          vm.getTBProphylaxis2Entries();
        }*/
		
      });
  };

  /**
   * Get all TB Prophylaxis2 tests
   */
  vm.getTBProphylaxis2Entries = function () {
    vm.filter1.theCase = { id: vm.patient.id };
    blockUI.start();
    tbProphylaxis2Service.getAllEntries(vm.filter1).then(function (data) {
      blockUI.stop();
      vm.tbProphylaxis2Entries = data;

      vm.bsTableTBProphylaxis2Control.options.columns = tbProphylaxis2Service.getTableDefinition(
        vm.patient
      );
      vm.bsTableTBProphylaxis2Control.options.data = vm.tbProphylaxis2Entries;
      vm.bsTableTBProphylaxis2Control.options.totalRows =
        vm.tbProphylaxis2Entries.length;
    });
  };
  // resolve the deferred object
  deferred.resolve(vm);

  return deferred.promise;
};
