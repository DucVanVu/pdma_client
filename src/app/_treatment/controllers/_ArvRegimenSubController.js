/**
 * Social health insurance
 * @param $scope
 */
let arvRegimenSubController = function ($scope, $state, $q, vm, modal, $timeout, toastr, blockUI, focusFlatPick, openSelectBox, utils, arvRegimenService) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
    let otherArvRegimen = {id: 0, name: 'Phác đồ ARV khác', description: '&mdash; Vui lòng ghi rõ'};

    vm.arvRegimens = [];

    // Get all ARV regimens
    blockUI.start();
    arvRegimenService.getAllRegimens({disease: {code: 'HIV'}}).then(function (data) {
        blockUI.stop();
        vm.arvRegimens = data;

        // Add to beginning of the array
        vm.arvRegimens.unshift({id: -1, name: '---'});
        vm.arvRegimens.unshift(otherArvRegimen);
    });

    $scope.$on('AppointmentResultController.arv-regimen-changed', function () {

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

    /**
     * Open edit entry modal
     */
    vm.showArvRegimenForm = function () {

        vm.patient.editable = true; // because only user can only access to this page for active patient
        vm.arvRegimenEntry = {};

        if (vm.entry.arvRegimen && vm.entry.arvRegimen.id) {
            angular.copy(vm.entry.arvRegimen, vm.arvRegimenEntry);
        } else {
            vm.arvRegimenEntry.startDate = vm.entry.arrivalDate;
            vm.arvRegimenEntry.regimen = {id: 13};
        }

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'arv_regimen_edit_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance.closed.then(function () {
            // TODO
        });
    };

    // Enable/disable button
    vm.arvRegimenSubmitDisabled = false;
    vm.toggleArvRegimenSubmit = function () {
        if (vm.arvRegimenSubmitDisabled) {
            toastr.clear();
            $timeout(function () {
                vm.arvRegimenSubmitDisabled = false;
            }, 1000);
        } else {
            vm.arvRegimenSubmitDisabled = true;
        }
    };

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};