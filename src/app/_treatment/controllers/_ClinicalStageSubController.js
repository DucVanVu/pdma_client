/**
 * Clinical stage
 * @param $scope
 */
let clinicalStageSubController = function ($state, $scope, $q, vm, modal, toastr, blockUI, $timeout, settings, cStageService) {

    let deferred = $q.defer();

    let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
    let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

    vm.bsTableControl4ClinicalStages = {
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
            singleSelect: true,
            locale: settings.locale,
            sidePagination: 'server',
            columns: cStageService.getTableDefinition(),
            onCheck: function (row, $element) {
                $scope.$apply(function () {
                    vm.selClinicalStage = row;
                });
            },
            onUncheck: function (row, $element) {
                $scope.$apply(function () {
                    vm.selClinicalStage = null;
                });
            },
        }
    };

    vm.openClinicalStages = function () {

        vm.selClinicalStage = {};

        vm.modalInstance = modal.open({
            animation: true,
            templateUrl: 'clinical_stages_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance.opened.then(function () {
            blockUI.start();
            cStageService.getEntries({caseId: vm.entry.theCase.id}).then(function (data) {
                vm.bsTableControl4ClinicalStages.options.data = data;
                blockUI.stop();
            });
        });

        vm.modalInstance.closed.then(function () {
            // reload the current page
            if (!vm.entry.dirty) {
                $state.go($state.$current, null, {reload: true});
            }
        });
    };

    /**
     * Delete clinical stage
     */
    vm.deleteClinicalStage = function () {

        vm.modalInstance2 = modal.open({
            animation: true,
            templateUrl: 'delete_clinical_stage_modal.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static',
            keyboard: false
        });

        vm.modalInstance2.result.then(function (confirm) {
            if (confirm == 'yes') {
                blockUI.start();
                cStageService.deleteEntries([vm.selClinicalStage], function success() {
                    blockUI.stop();
                    toastr.info('Bạn đã xoá thành công thông tin giai đoạn lâm sàng đã chọn.', 'Thông báo');

                    // reload the list
                    cStageService.getEntries({caseId: vm.entry.theCase.id}).then(function (data) {
                        vm.bsTableControl4ClinicalStages.options.data = data;
                    });

                    vm.selClinicalStage = null;

                }, function failure() {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi xoá thông tin giai đoạn lâm sàng của bệnh nhân!', 'Thông báo');

                    vm.selClinicalStage = null;
                });
            }
        });

        vm.modalInstance2.closed.then(function () {
            //
        });
    };

    // Enable/disable button
    vm.submitDisabled = false;
    vm.toggleSubmit = function () {
        if (vm.submitDisabled) {
            toastr.clear();
            $timeout(function () {
                vm.submitDisabled = false;
            }, 1000);
        } else {
            vm.submitDisabled = true;
        }
    };

    // resolve the deferred object
    deferred.resolve(vm);

    return deferred.promise;
};