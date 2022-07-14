/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PNSAEEditController', PNSAEEditController);

    PNSAEEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$state',
        '$stateParams',
        'focus',
        'blockUI',
        'toastr',
        'focusFlatPick',
        'openSelectBox',
        'scrollToElement',
        '$location',
        '$uibModal',

        'PNSAEService'
    ];

    function PNSAEEditController($rootScope, $scope, $http, $timeout, settings, $state, $stateParams, focus, blockUI, toastr, focusFlatPick, openSelectBox, scrollToElement, $location, modal, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.yesNo = [{id: 1, name: 'Có'}, {id: 2, name: 'Không'}];
        vm.yesMaybeNo = [{id: 1, name: 'Có'}, {id: 2, name: 'Có thể'}, {id: 3, name: 'Không'}];
        vm.genders = [{id: 'MALE', name: 'Nam'}, {id: 'FEMALE', name: 'Nữ'}, {id: 'OTHER', name: 'Khác'}];
        vm.facilityTypes = service.facilityTypes;
        vm.eventTypes = service.eventTypes;
        vm.clientTypes = [
            {id: 1, name: 'Khách hàng TVXNHIV'},
            {id: 2, name: 'Bệnh nhân ARV'},
            {id: 3, name: 'NCH trong cộng đồng'},
            {id: 4, name: 'Khác'}
        ];

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        vm.entry = {};

        if ($stateParams.id && $stateParams.id > 0) {
            blockUI.start();
            service.getEntry($stateParams.id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {
                    vm.entry = {};
                    angular.copy(data, vm.entry);
                    vm.entry.locked = vm.entry.submitted || !$scope.currentUser || !$scope.isSiteManager($scope.currentUser);

                    console.log(vm.entry);
                    console.log(vm.entry.locked);
                    console.log('-----------');
                } else {
                    $location.path('/pns-ae-edit/0');
                }
            });
        }

        let datePickerOptions = {
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            placeholder: 'Chọn ngày..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: true
        };

        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                altFormat: 'd/m/Y h:i K',
                enableTime: true,
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.reportDate = m.add(7, 'hours').toDate();
                    console.log(vm.entry.reportDate);
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.reportDate) {
                    fpItem.setDate(moment(vm.entry.reportDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.reportDate = null;
                }
            }
        };

        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                altFormat: 'd/m/Y',
                enableTime: false,
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.investigateDate = m.add(7, 'hours').toDate();
                    console.log(vm.entry.investigateDate);
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.investigateDate) {
                    fpItem.setDate(moment(vm.entry.investigateDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.investigateDate = null;
                }
            }
        };

        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                altFormat: 'd/m/Y',
                enableTime: false,
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.addressDate = m.add(7, 'hours').toDate();
                    console.log(vm.entry.addressDate);
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.entry.addressDate) {
                    fpItem.setDate(moment(vm.entry.addressDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.entry.addressDate = null;
                }
            }
        };

        /**
         * Convert value of an entry's property to numeric
         * @param prop
         */
        vm.convertValue2Numeric = function (prop) {
            if (!prop || !vm.entry[prop]) {
                return;
            }

            vm.entry[prop] = parseFloat(vm.entry[prop]);
        };

        /**
         * Submit entry
         */
        vm.submitEntry = function() {

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'submit_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (answer) {
                if (answer == 'yes') {
                    blockUI.start();
                    service.submitEntry(vm.entry, function success() {
                        blockUI.stop();
                        toastr.info('Đã gửi thành công báo cáo lên tuyến trên!', 'Thông báo');

                        $state.go('application.pns_ae');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi gửi báo cáo lên tuyến trên.', 'Thông báo');
                    });
                }
            });
        };

        /**
         * Save the entry
         */
        vm.saveEntry = function () {
            blockUI.start();
            // Validation
            if (!vm.entry.facility || !vm.entry.facility.id) {
                toastr.error('Vui lòng chọn cơ sở cần thực hiện báo cáo tình huống không mong muốn.', 'Thông báo');
                openSelectBox('vm.entry.facility');
                blockUI.stop();
                return;
            }

            if (!vm.entry.facilityType) {
                toastr.error('Vui lòng cho biết loại hình cơ sở.', 'Thông báo');
                openSelectBox('vm.entry.facilityType');
                blockUI.stop();
                return;
            }

            if (vm.entry.age == null) {
                toastr.error('Vui lòng cho biết tuổi của người có HIV.', 'Thông báo');
                focus('vm.entry.age');
                blockUI.stop();
                return;
            }

            if (!vm.entry.gender) {
                toastr.error('Vui lòng cho biết giới tính của người có HIV.', 'Thông báo');
                openSelectBox('vm.entry.gender');
                blockUI.stop();
                return;
            }

            if (!vm.entry.group) {
                toastr.error('Vui lòng cho biết phân nhóm của người có HIV.', 'Thông báo');
                openSelectBox('vm.entry.group');
                blockUI.stop();
                return;
            }

            if (vm.entry.group == 4 && (!vm.entry.groupText || vm.entry.groupText.trim() == '')) {
                toastr.error('Vui lòng cho biết phân nhóm của người có HIV.', 'Thông báo');
                openSelectBox('vm.entry.groupText');
                blockUI.stop();
                return;
            }

            if (!vm.entry.reportDate) {
                toastr.error('Vui lòng cho biết ngày và thời điểm xảy ra tình huống.', 'Thông báo');
                focusFlatPick('vm.entry.reportDate');
                blockUI.stop();
                return;
            }

            let mtoday = moment();
            let mReportDate = moment(vm.entry.reportDate);
            if (mtoday.isBefore(vm.entry.reportDate)) {
                toastr.error('Ngày xảy ra tình huống không thể sau ngày hôm nay.', 'Thông báo');
                focusFlatPick('vm.entry.reportDate');
                blockUI.stop();
                return;
            }

            if (!vm.entry.eventType) {
                toastr.error('Vui lòng cho biết tình huống xảy ra đối với người có HIV.', 'Thông báo');
                scrollToElement('vm.entry.eventType');
                blockUI.stop();
                return;
            }

            if (!vm.entry.hurt) {
                toastr.error('Vui lòng cho biết tình huống xảy ra có làm tổn thương người có HIV không.', 'Thông báo');
                scrollToElement('vm.entry.hurt');
                blockUI.stop();
                return;
            }

            if (!vm.entry.pnsRootCause) {
                toastr.error('Vui lòng cho biết nguyên nhân trực tiếp có phải do TBXN BT/BC hay không.', 'Thông báo');
                scrollToElement('vm.entry.pnsRootCause');
                blockUI.stop();
                return;
            }

            if (!vm.entry.actionTaken) {
                toastr.error('Vui lòng cho biết có hành động khi xảy ra tình huống không.', 'Thông báo');
                scrollToElement('vm.entry.actionTaken');
                blockUI.stop();
                return;
            }

            if (!vm.entry.investigated) {
                toastr.error('Vui lòng cho biết có tiến hành điều tra khi xảy ra tình huống không.', 'Thông báo');
                scrollToElement('vm.entry.investigated');
                blockUI.stop();
                return;
            }

            if (vm.entry.investigated == 1) {
                if (!vm.entry.investigateDate) {
                    toastr.error('Vui lòng cho biết ngày tiến hành điều tra tình huống không mong muốn.', 'Thông báo');
                    focusFlatPick('vm.entry.investigateDate');
                    blockUI.stop();
                    return;
                }

                if (mReportDate.isAfter(vm.entry.investigateDate)) {
                    toastr.error('Ngày tiến hành điều tra không thể trước ngày xảy ra tình huống.', 'Thông báo');
                    focusFlatPick('vm.entry.investigateDate');
                    blockUI.stop();
                    return;
                }
            }

            if (!vm.entry.discussed) {
                toastr.error('Vui lòng cho biết cơ sở có thảo luận tìm giải pháp không.', 'Thông báo');
                scrollToElement('vm.entry.discussed');
                blockUI.stop();
                return;
            }

            if (!vm.entry.addressed) {
                toastr.error('Vui lòng cho biết tình huống có được xử trí không.', 'Thông báo');
                scrollToElement('vm.entry.addressed');
                blockUI.stop();
                return;
            }

            if (vm.entry.addressed == 1) {
                if (!vm.entry.addressDate) {
                    toastr.error('Vui lòng cho biết ngày tiến hành xử trí tình huống không mong muốn.', 'Thông báo');
                    focusFlatPick('vm.entry.addressDate');
                    blockUI.stop();
                    return;
                }

                if (mReportDate.isAfter(vm.entry.addressDate)) {
                    toastr.error('Ngày tiến hành xử trí không thể trước ngày xảy ra tình huống.', 'Thông báo');
                    focusFlatPick('vm.entry.addressDate');
                    blockUI.stop();
                    return;
                }
            }

            // Save the entry
            service.saveEntry(vm.entry, function success() {
                toastr.info('Đã lưu thành công thông tin tình huống không mong muốn.', 'Thông báo');
                blockUI.stop();
                // $state.go('application.pns_ae');
            }, function failure() {
                toastr.error('Có lỗi khi lưu thông tin tình huống không mong muốn.', 'Thông báo');
                blockUI.stop();
            }).then(function (data) {
                if (!vm.entry.id && data && data.id) {
                    $location.path('/pns-ae-edit/' + data.id);
                }
            });
        };

        // cient type change
        $scope.$watch('vm.entry.group', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            if (newVal == 4) {
                if (!vm.entry.id) {
                    vm.entry.groupText = null;
                }

                focus('vm.entry.groupText');
            } else {
                angular.forEach(vm.clientTypes, function (ct) {
                    if (ct.id == newVal) {
                        vm.entry.groupText = ct.name;
                    }
                });
            }
        });

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                if (vm.orgsWritable && vm.orgsWritable.length == 1 && !vm.entry.id) {
                    vm.entry.facility = {};
                    angular.copy(vm.orgsWritable[0], vm.entry.facility);
                }
            }
        });
    }

})();
