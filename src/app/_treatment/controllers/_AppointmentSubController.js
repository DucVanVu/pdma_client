/**
 * Appointment load
 * @param $scope
 */
let appointmentSubController = function ($state, $stateParams, $timeout, $scope, $q, vm, modal, toastr, blockUI, appService) {

    let deferred = $q.defer();

    // Searching for appointments
    vm.appFilter = {
        isFiltered: false,
        year: null,
        years: [],
        entries: [],
    };

    vm.appFilter.initialize = function () {

        // backup first
        angular.copy(vm.entries, vm.appFilter.entries);

        // create years for the select box
        let years = [];
        angular.forEach(vm.entries, function (obj) {
            let apptDateYear = moment(obj.appointmentDate).year();

            if (!years.find(e => e.id == apptDateYear)) {
                years.push({id: apptDateYear, name: 'Năm ' + apptDateYear});
            }
        });

        vm.appFilter.years = years;
    };

    vm.appFilter.toggle = function () {
        if (!vm.appFilter.isFiltered) {
            vm.appFilter.isFiltered = true;
        } else {
            vm.appFilter.isFiltered = false;
            vm.appFilter.year = null;
        }
    };

    vm.appFilter.filter = function () {
        if (!vm.appFilter.year) {
            vm.entries = [];
            angular.copy(vm.appFilter.entries, vm.entries);
        } else {
            let entries = [];
            angular.forEach(vm.appFilter.entries, function (obj) {
                let apptDateYear = moment(obj.appointmentDate).year();

                if (vm.appFilter.year == apptDateYear) {
                    entries.push(obj);
                }
            });

            vm.entries = [];
            angular.copy(entries, vm.entries);
        }
    };

    vm.editingAppt = {};

    // For appointment date selection
    vm.editingAppt.datePicker = {
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
            disable: [
                function (date) {
                    // return true to disable
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            onChange: [function () {
                const d = this.selectedDates[0];
                if (_.isDate(d)) {
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.editingAppt.entry.appointmentDate = m.add(7, 'hours').toDate();
                }

                if (vm.editingAppt.entry.appointmentDate && vm.editingAppt.submitDisabled) {
                    vm.editingAppt.submitDisabled = false;
                }
            }],
        },
        datePostSetup: function (fpItem) {
            vm.editingAppt.datePicker.fpItem = fpItem;
            if (vm.editingAppt.entry && vm.editingAppt.entry.appointmentDate) {
                fpItem.setDate(moment(vm.editingAppt.entry.appointmentDate).toDate());
            }
        }
    };

    // Enable/disable button
    vm.editingAppt.submitDisabled = false;
    vm.editingAppt.toggleSubmit = function () {
        if (vm.editingAppt.submitDisabled) {
            $timeout(function () {
                vm.editingAppt.submitDisabled = false;
            }, 1000);
        } else {
            vm.editingAppt.submitDisabled = true;
        }
    };

    /**
     * Create an appointment for the current patient
     */
    vm.editingAppt.createNew = function () {
        vm.editingAppt.entry = {};
        vm.editingAppt.entry.isNew = true;
        vm.editingAppt.submitDisabled = true;

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'edit_appointment_modal.html',
            scope: $scope,
            size: 'md'
        });

        vm.modalInstance.closed.then(function () {
            vm.editingAppt.entry = {};
        });
    };

    /**
     * Create an appointment for the current patient
     */
    vm.editingAppt.editEntry = function (id) {

        if (!id) {
            toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
            return;
        }

        blockUI.start();
        vm.editingAppt.entry = {};
        appService.getEntry(id).then(function (data) {
            blockUI.stop();

            if (!data || !data.id) {
                toastr.error('Không tìm thấy bản ghi!', 'Thông báo');
                return;
            }

            angular.copy(data, vm.editingAppt.entry);
            vm.editingAppt.entry.isNew = false;
            vm.editingAppt.submitDisabled = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_appointment_modal.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.editingAppt.entry = {};
            });

        });
    };

    /**
     * Save the appointment with the updated appointment date
     */
    vm.editingAppt.save = function() {
        vm.editingAppt.submitDisabled = true;
        blockUI.start();

        if (!vm.editingAppt.entry.appointmentDate) {
            vm.editingAppt.toggleSubmit();
            toastr.error('Vui lòng chọn ngày hẹn tái khám!', 'Thông báo');
            blockUI.stop();
            return;
        }

        let curStatus = vm.patient.status;
        let endDate = vm.patient.endDate;
        if ((curStatus == 'DEAD' || curStatus == 'LTFU' || curStatus == 'TRANSFERRED_OUT') && endDate) {
            if (moment(vm.editingAppt.entry.appointmentDate).isAfter(endDate, 'day')) {
                vm.editingAppt.toggleSubmit();
                toastr.error('Ngày hẹn tái khám không thể sau ngày kết thúc đợt điều trị của bệnh nhân (' + moment(endDate).format('DD/MM/YYYY') + ').', 'Thông báo');
                blockUI.stop();
                return;
            }
        }

        let submitSaveEntry = function () {
            vm.editingAppt.entry.theCase = {id: vm.patient.theCase.id};
            vm.editingAppt.entry.organization = {id: vm.patient.organization.id};
            vm.editingAppt.entry.currentCaseOrg = {id: vm.patient.id, status: vm.patient.status};

            appService.saveEntry(vm.editingAppt.entry, function success() {
                blockUI.stop();
                $state.go($state.$current, null, {reload: true});
            }, function failure() {
                blockUI.stop();
            });
        };

        // check for existance of another appointment in the date set
        let validatorFilter = {
            theCase: {id: vm.patient.theCase.id},
            organization: {id: vm.patient.organization.id},
            fromDate: moment(vm.editingAppt.entry.appointmentDate).set({hour: 0, minute: 0, second: 0}).toDate(),
            toDate: moment(vm.editingAppt.entry.appointmentDate).set({hour: 23, minute: 59, second: 59}).toDate()
        };

        appService.getEntries4Individual(validatorFilter).then(function (data) {
            if (data && data.length > 0) {
                toastr.error('Đã tồn tại một lượt hẹn khám vào ngày ' + moment(vm.editingAppt.entry.appointmentDate).format('dddd, DD/MM/YYYY'), 'Thông báo');
                blockUI.stop();
                vm.editingAppt.toggleSubmit();
            } else {
                submitSaveEntry();
            }
        });
    };

    $scope.$watch('vm.appFilter.year', function (newVal, oldVal) {
        vm.appFilter.filter();
    });

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};