/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Settings').controller('SettingsController', SettingsController);

    SettingsController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$http',
        '$timeout',
        '$uibModal',
        'settings',
        'blockUI',
        'toastr',
        'Upload',
        'AdminUnitService',
        'OrganizationService',
        'SettingsService'
    ];

    function SettingsController($rootScope, $scope, $state, $http, $timeout, modal, settings, blockUI, toastr, Upload, auService, orgService, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            if (!$scope.isAdministrator($scope.currentUser)) {
                $state.go('application.dashboard');
            }
        });

        let vm = this;

        // Get all provinces
        vm.opcassist = {provinces: []};
        vm.provinces = [];
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();
            if (data) {
                vm.provinces = data;
            } else {
                vm.provinces = [];
            }
        });

        /**
         * Get OPCAssist provinces
         */
        vm.getOPCAssistProvinces = function () {
            service.getOPCAssistProvinces().then(function (data) {
                if (data && data.value && data.value.length > 0) {
                    let arr = data.value.split(',');
                    vm.opcassist.provinces = [];
                    angular.forEach(arr, function (obj) {
                        vm.opcassist.provinces.push(parseFloat(obj));
                    });
                }
            });
        };

        // vm.getOPCAssistProvinces();

        /**
         * Reset password of demo users
         */
        vm.resetPassword4DemoUsers = function () {
            blockUI.start();
            service.resetPassword4DemoUsers(function () {
                toastr.info('???? reset m???t kh???u cho ng?????i d??ng demo.', 'Th??ng b??o')
            }, function () {
                toastr.error('C?? l???i x???y ra khi reset m???t kh???u cho ng?????i d??ng demo.', 'Th??ng b??o');
            }).then(function () {
                blockUI.stop();
            });
        };

        /**
         * Force data synthesis
         */
        vm.forceWeeklyDataSynthesis = function () {
            blockUI.start();
            service.forceWeeklyDataSynthesis(function () {
                toastr.info('???? t???ng h???p d??? li???u b??o c??o tu???n th??nh c??ng.', 'Th??ng b??o');
            }, function () {
                toastr.error('C?? l???i x???y ra khi t???ng h???p b??o c??o tu???n.', 'Th??ng b??o');
            }).then(function () {
                blockUI.stop();
            });
        };

        /**
         *
         */
        vm.deleteDemoWeeklyData = function () {
            blockUI.start();
            service.deleteDemoWeeklyData(function () {
                toastr.info('???? xo?? th??nh c??ng d??? li???u b??o c??o tu???n demo.', 'Th??ng b??o');
            }, function () {
                toastr.error('C?? l???i x???y ra khi xo?? d??? li???u b??o c??o tu???n demo.', 'Th??ng b??o');
            }).then(function () {
                blockUI.stop();
            });
        };

        /**
         * Delete opc assist data by OrgID
         * -- some opc need to reset for re-import
         */
        vm.delFilter = {};
        vm.delOpcAssistData = function () {
            blockUI.start();

            if (!vm.delFilter.orgId) {
                blockUI.stop();
                toastr.error('Vui l??ng ch???n c?? s??? c???n x??a d??? li???u b???nh nh??n.', 'Th??ng b??o');
                return;
            }

            if (!vm.delFilter.passcode) {
                blockUI.stop();
                toastr.error('Vui l??ng nh???p m???t m?? ????? th???c hi???n x??a.', 'Th??ng b??o');
                return;
            }

            service.deleteOpcAssistData(vm.delFilter, function success() {
                blockUI.stop();
                vm.delFilter.passcode = null;
                toastr.info('???? x??a th??nh c??ng.', 'Th??ng b??o');
            }, function failure() {
                blockUI.stop();
                vm.delFilter.passcode = null;
                toastr.error('C?? l???i x???y ra.', 'Th??ng b??o');
            });
        };

        /**
         * Save the provinces where online OPC-Assist are already in use
         */
        vm.saveOPCAssistProvinces = function () {
            if (!vm.opcassist.provinces || vm.opcassist.provinces.length <= 0) {
                toastr.warning('Kh??ng c?? t???nh n??o ???????c ch???n!', 'Th??ng b??o');
                return;
            }

            let prefDto = {name: 'opcassist_provinces', value: vm.opcassist.provinces.join(',')};
            service.saveOPCAssistProvinces(prefDto, function success() {
                toastr.info('???? l??u th??ng tin danh s??ch c??c t???nh ???? tri???n khai OPC-Assist online.', 'Th??ng b??o');
            }, function failure() {
                toastr.error('C?? l???i x???y ra khi l??u th??ng tin.', 'Th??ng  b??o');
            }).then(function () {
                vm.getOPCAssistProvinces();
            });
        };

        vm.userObj = {};
        vm.dangerousReset = function () {
            if (!vm.userObj.password || vm.userObj.password.trim() == '') {
                toastr.error('B???n vui l??ng nh???p m???t kh???u.', 'Th??ng b??o');
                return;
            }

            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    blockUI.start();
                    service.dangerousReset(vm.userObj, function () {
                        toastr.info('???? th???c hi???n reset m???t kh???u cho to??n b??? ng?????i d??ng th??nh ' + vm.userObj.password, 'Th??ng b??o');
                    }, function () {
                        toastr.error('C?? l???i x???y ra khi reset m???t kh???u cho t???t c??? ng?????i d??ng.', 'Th??ng b??o');
                    }).then(function () {
                        blockUI.stop();
                        vm.userObj = {};
                    });
                }
            });
        }


        // Import data from OPC-Assist offline
        // Get all OPCs
        vm.opcs = [];
        blockUI.start();
        orgService.getAllOrganizations({activeOnly: true, opcSiteOnly: true}).then(function (data) {
            blockUI.stop();
            angular.copy(data, vm.opcs);
        });

        vm.MAX_FILE_SIZE = settings.upload.maxFilesize;
        vm.uploadedFile = null;
        vm.errorFile = null;
        vm.opcId = 0;
        vm.opcId2 = 0;
        vm.importTbData = false;

        vm.uploadFiles = function (file, errFiles) {
            vm.uploadedFile = file;
            vm.errorFile = errFiles && errFiles[0];
        };

        vm.startUploadFile = function (file, action) {
            if (file) {
                let url = settings.api.baseUrl + settings.api.apiV1Url;

                if (action == 'IMPORT-DB') {

                    if (!vm.opcId) {
                        toastr.warning('Vui l??ng ch???n c?? s??? c???n import.', 'Th??ng b??o');
                        return;
                    }

                    url += 'legacy_data/upload/';
                    url += '/';
                    url += vm.opcId;

                    console.log(url);
                    debugger

                } else if (action == 'IMPORT-HIVINFO-ID') {
                    url += 'legacy_data/hivinfo-id';
                } else if (action == 'IMPORT-DB-MMT') {
                    url += 'legacy_data/mmt';
                } else {
                    toastr.warning('Ch???c n??ng ch??a ???????c th???c hi???n.', 'Th??ng b??o');
                    return;
                }

                console.log(url);

                blockUI.start();
                file.upload = Upload.upload({
                    url: url,
                    data: {file: file}
                }).progress(function (evt) {
                    vm.uploadedFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    blockUI.stop();
                    toastr.info('B???n ???? import th??nh c??ng!');
                }).error(function () {
                    blockUI.stop();
                });
            }
        };
    }

})();
