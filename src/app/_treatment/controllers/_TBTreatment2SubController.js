/**
 * CD4
 * @param $scope
 */
let tbTreatment2SubController = function ($scope, $state, $q, vm, modal, toastr, blockUI, focusFlatPick, openSelectBox, tb2Service,settings) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
	let patient ={};
    $scope.$on('AppointmentResultController.patient-change', function(event, data) {
        patient=data;
         //alert(vm.patient);
        vm.showTBTreatment2EditForm();
    });

    vm.tb2ScreeningTypes = [
        {id: 'upon_registration_of_the_treatment_facility', name: 'Khi đăng ký CSĐT'},
        {id: 'during_the_management_of_the_Treatment_Facility', name: 'Trong quá trình quản lý CSĐT'},
		{id: 'patients_with_suspected_TB_visit_a_TB_facility', name: 'BN nghi lao đến khám cơ sở lao (do cơ sở HIV chuyển hoặc BN tự đến)'},
        {id: 'HIV_infected_TB_patient_transferred_from_a_TB_facility', name: 'BN lao nhiễm HIV chuyển từ cơ sở lao đến'}
    ];

    vm.tb2Classification1 = [
        {id: 'LAO_PHOI', name: 'Lao phổi'},
        {id: 'LAO_NGOAIPHOI', name: 'Lao ngoài phổi'},
		{id: 'LAO_PHOI_NGOAIPHOI', name: 'Lao phổi & ngoài phổi'},
        {id: 'OTHER', name: 'Khác'}
    ];
    
	vm.tb2YesNoNones = [
        {id: 'YES', name: 'Có'},
        {id: 'NO', name: 'Không'},
		{id: 'NO_INFORMATION', name: 'Không có thông tin'}
		
    ];
	vm.tb2ExtraDiagnosis = [
        {id: 'HACH_DO', name: 'Hạch đồ'},
        {id: 'SPUTUM_CULTURE', name: 'Cấy đờm'},
		{id: 'SOICAY_DICH_MANG_BUNG', name: 'Soi/cấy dịch màng bụng'},
		{id: 'SOICAY_DICH_MANG_PHOI', name: 'Soi/cấy dịch màng phổi'},
        {id: 'SOICAY_DICH_MANG_LAO', name: 'Soi/cấy dịch màng não'},
		{id: 'TB_LAM', name: 'TB_LAM'},
		{id: 'OTHER', name: 'Khác'},
		{id: 'NO_INFORMATION', name: 'Không có thông tin'}
		
    ];
	vm.tb2Classification2s = [
        {id: 'LAO_HACH', name: 'Lao hạch'},
        {id: 'LAO_MANGPHOI', name: 'Lao màng phổi'},
		{id: 'LAO_MANGBUNG', name: 'Lao màng bụng'},
		{id: 'LAO_MANGNAO', name: 'Lao màng não'},
        {id: 'LAO_DAMANG', name: 'Lao đa màng'},
		{id: 'LAO_RUOT', name: 'Lao ruột'},
		{id: 'LAO_XUONG', name: 'Lao xương/khớp'},
		{id: 'LAO_GAN', name: 'Lao gan'},
		{id: 'LAO_LACH', name: 'Lao lách'},
		{id: 'LAO_KE', name: 'Lao kê'},
		{id: 'OTHER', name: 'Khác'},
    ];
	vm.tb2Classification3s = [
        {id: 'MOI', name: 'Mới'},
        {id: 'TAI_PHAT', name: 'Tái phát'},
		{id: 'DIEUTRI_LAI', name: ' Điều trị lại sau bỏ trị'},
		{id: 'THAT_BAI_DIEUTRI', name: 'Thất bại điều trị'},      
		{id: 'OTHER', name: 'Khác'}
		
    ];
	vm.tb2Classification4s = [
        {id: 'VK_XPERT', name: 'VK (+)-Xpert'},
        {id: 'VK_AFB', name: 'VK (+)-AFB'},
		{id: 'VK_CAY', name: 'VK (+)-Cấy'},
		{id: 'VK_LF_LAM', name: 'VK (+)-LF LAM'},
        {id: 'VK_KHANGTHUOC', name: 'VK (+) - Kháng thuốc'},
		{id: 'OTHER', name: 'Khác'}
		
    ];
    vm.tb2Entry = {};
	// For Screening date
    vm.tb2DatepickerScreeningDate = {
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
            onChange: [function () {
                const d = this.selectedDates[0];

                if (d && _.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.tb2Entry.screeningDate = m.add(7, 'hours').toDate();
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.tb2DatepickerScreeningDate.fpItem = fpItem;
            if (vm.tb2Entry.screeningDate) {
                fpItem.setDate(moment(vm.tb2Entry.screeningDate).toDate());
            }
        },
        clear: function () {
            if (vm.tb2DatepickerScreeningDate.fpItem) {
                vm.tb2DatepickerScreeningDate.fpItem.clear();
                vm.tb2Entry.screeningDate = null;
            }
        }
    };
	// For Diagnosis date
    vm.tb2DatepickerDiagnosisDate = {
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
            onChange: [function () {
                const d = this.selectedDates[0];

                if (d && _.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.tb2Entry.tbDiagnosisDate = m.add(7, 'hours').toDate();
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.tb2DatepickerDiagnosisDate.fpItem = fpItem;
            if (vm.tb2Entry.tbDiagnosisDate) {
                fpItem.setDate(moment(vm.tb2Entry.tbDiagnosisDate).toDate());
            }
        },
        clear: function () {
            if (vm.tb2DatepickerDiagnosisDate.fpItem) {
                vm.tb2DatepickerDiagnosisDate.fpItem.clear();
                vm.tb2Entry.tbDiagnosisDate = null;
            }
        }
    };
	
	// For Tx Start date
    vm.tb2DatepickerTxStartDate = {
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
            onChange: [function () {
                const d = this.selectedDates[0];

                if (d && _.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.tb2Entry.tbTxStartDate = m.add(7, 'hours').toDate();
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.tb2DatepickerTxStartDate.fpItem = fpItem;
            if (vm.tb2Entry.tbTxStartDate) {
                fpItem.setDate(moment(vm.tb2Entry.tbTxStartDate).toDate());
            }
        },
        clear: function () {
            if (vm.tb2DatepickerTxStartDate.fpItem) {
                vm.tb2DatepickerTxStartDate.fpItem.clear();
                vm.tb2Entry.tbTxStartDate = null;
            }
        }
    };
    /**
     * Open add entry modal
     */
    vm.showTBTreatment2EditForm = function () {
        patient.editable = true; // because only user can only access to this page for active patient
		/*if(vm.tb==true){
			vm.tb=false;
		}else{
			vm.tb=true;
		}*/
		/**
         * Get all TB Treatment2 tests
         */
        vm.getTBTreatment2Entries = function () {
            vm.filter.theCase = {id: patient.id};
			//alert("ok");
            blockUI.start();
            tb2Service.getAllEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.tbTreatment2Entries = data;
                //vm.bsTableTBTreatment2Control.options.columns = tb2Service.getTableDefinition(patient);
                vm.bsTableTBTreatment2Control.options.data = vm.tbTreatment2Entries;
                vm.bsTableTBTreatment2Control.options.totalRows = vm.tbTreatment2Entries.length;
            });
        };
		vm.getTBTreatment2Entries();
		vm.bsTableTBTreatment2Control = {
            options: {
                data: vm.tbTreatment2Entries,
                idField: 'id',
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
                sidePagination: 'server',
                columns: tb2Service.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getTBTreatment2Entries();
                }
            }
        };
    };
	
	/**
	 * Open add entry modal
	 */
	vm.openAddTBTreatment2 = function () {
        // them moi
		vm.tb2Entry = {};
		vm.tb2Entry.isNew = true;

		vm.modalInstance = modal.open({
			animation: true,
			templateUrl: 'tb_treatment2_entry_edit_modal.html',
			scope: $scope,
			size: 'md',
			backdrop: 'static',
			keyboard: false
		});

        /**
         * Get all TB Treatment2 tests
         */
        vm.getTBSubTreatment2Entries = function () {
            vm.filter.theCase = {id: patient.id};

            blockUI.start();
            tb2Service.getAllEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.tbTreatment2SubEntries = data;
                vm.bsSubTableTBTreatment2Control.options.columns = tb2Service.getSubTableDefinition(patient);
                vm.bsSubTableTBTreatment2Control.options.data = vm.tbTreatment2SubEntries;
                vm.bsSubTableTBTreatment2Control.options.totalRows = vm.tbTreatment2SubEntries.length;
            });
        };
		vm.getTBSubTreatment2Entries();
		vm.bsSubTableTBTreatment2Control = {
            options: {
                data: vm.tbTreatment2SubEntries,
                idField: 'id',
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
                sidePagination: 'server',
                columns: tb2Service.getSubTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getTBSubTreatment2Entries();
                }
            }
        };

		vm.modalInstance.closed.then(function () {
			// TODO
		});
	};
	
	/**
     * Save the test entry
     */
    vm.saveTBTreatment2Entry = function () {
        blockUI.start();
		//regimen
		if (!vm.tb2Entry.screeningType) {
            toastr.error('Vui lòng nhập tình huống lao.', 'Thông báo');
            openSelectBox('vm.tb2Entry.screeningType');
            blockUI.stop();
            return;
        }
        // Validate
        if (!vm.tb2Entry.screeningDate) {
            toastr.error('Vui lòng nhập ngày sàng lọc lao.', 'Thông báo');
            focusFlatPick('vm.tb2Entry.screeningDate');
            blockUI.stop();
            return;
        }

        let mSampleDate = moment(vm.tb2Entry.screeningDate);
        if (mSampleDate.isAfter(new Date())) {
            toastr.error('Ngày sàng lọc lao không thể sau ngày hiện tại.', 'Thông báo');
            focusFlatPick('vm.tb2Entry.screeningDate');
            blockUI.stop();
            return;
        }

        if (!vm.tb2Entry.tbDiagnosed) {
            toastr.error('Vui lòng chọn kết quả chuẩn đoán mắc lao.', 'Thông báo');
            focusFlatPick('vm.tb2Entry.tbDiagnosed');
            blockUI.stop();
            return;
        }
        
        let screeningDate = moment(vm.tb2Entry.screeningDate);
        let tbDiagnosisDate = moment(vm.tb2Entry.tbDiagnosisDate);
        if (screeningDate.isAfter(tbDiagnosisDate)) {
            toastr.error('Ngày chuẩn đoán không thể trước ngày sàng lọc.', 'Thông báo');
            focusFlatPick('vm.tb2Entry.tbDiagnosisDate');
            blockUI.stop();
            return;
        }

        let tbTxStartDate = moment(vm.tb2Entry.tbTxStartDate);
        // let tbDiagnosisDate = moment(vm.tb2Entry.tbDiagnosisDate);
        if (tbDiagnosisDate.isAfter(tbTxStartDate)) {
            toastr.error('Ngày điều trị không thể trước ngày chuẩn đoán.', 'Thông báo');
            focusFlatPick('vm.tb2Entry.tbTxStartDate');
            blockUI.stop();
            return;
        }

        // Copy the active organization
        vm.tb2Entry.organization = {};
        angular.copy(patient.caseOrgs[0].organization, vm.tb2Entry.organization);

        // Copy the case
        vm.tb2Entry.theCase = {};
        angular.copy(patient, vm.tb2Entry.theCase);
     
        // Submit
        tb2Service.saveEntry(vm.tb2Entry, function success() {
            blockUI.stop();
            toastr.info('Bạn đã lưu thành công!', 'Thông báo');
        }, function failure() {
            blockUI.stop();
            toastr.error('Có lỗi xảy ra khi lưu!', 'Thông báo');
        }).then(function (data) {

            // Close the modal
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            // clear the entry
            vm.tb2Entry = {};
			//load data
			vm.getTBTreatment2Entries();
            
        });
    };
	/**
	 * Open edit entry modal
	 */
	$scope.editTBTreatment2Entry = function (id) {
        // debugger
		if (!id) {
			toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
			return;
		}

        // Close the modal
        if (vm.modalInstance) {
            vm.modalInstance.close();
        }

		blockUI.start();
		tb2Service.getEntry(id).then(function (data) {
			blockUI.stop();
			if (data && data.id) {

				vm.tb2Entry = {};

				angular.copy(data, vm.tb2Entry);

				vm.tb2Entry.isNew = false;
				
				vm.modalInstance = modal.open({
					animation: true,
					templateUrl: 'tb_treatment2_entry_edit_modal.html',
					scope: $scope,
					size: 'md',
					backdrop: 'static',
					keyboard: false
				});

				vm.modalInstance.closed.then(function () {
					// TODO
				});
			} else {
				toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
			}
		});

        /**
         * Get all TB Treatment2 tests
         */
        vm.getTBSubTreatment2Entries = function () {
            vm.filter.theCase = {id: patient.id};

            blockUI.start();
            tb2Service.getAllEntries(vm.filter).then(function (data) {
                blockUI.stop();
                vm.tbTreatment2SubEntries = data.filter(treatment => treatment.id != id);
                vm.bsSubTableTBTreatment2Control.options.columns = tb2Service.getSubTableDefinition(patient);
                vm.bsSubTableTBTreatment2Control.options.data = vm.tbTreatment2SubEntries;
                vm.bsSubTableTBTreatment2Control.options.totalRows = vm.tbTreatment2SubEntries.length;
            });
        };
		vm.getTBSubTreatment2Entries();
		vm.bsSubTableTBTreatment2Control = {
            options: {
                data: vm.tbTreatment2SubEntries,
                idField: 'id',
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
                sidePagination: 'server',
                columns: tb2Service.getSubTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getTBSubTreatment2Entries();
                }
            }
        };

	};
	
    /**
	 * Delete an entry
	 * @param id
	 */
	$scope.deleteTBTreatment2Entry = function (id) {
		if (!id) {
			toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
			return;
		}

		vm.modalInstance = modal.open({
			animation: true,
			templateUrl: 'delete_entry_modal.html',
			scope: $scope,
			size: 'md',
			backdrop: 'static',
			keyboard: false
		});

		vm.modalInstance.result.then(function (answer) {
			if (answer == 'yes') {
				blockUI.start();
				tb2Service.deleteEntries([{id: id}], function success() {
					blockUI.stop();
					toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
				}, function failure() {
					blockUI.stop();
					toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
				}).then(function () {
					// reload the grid
					vm.getTBTreatment2Entries();
				});
			}
		});
	};

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};