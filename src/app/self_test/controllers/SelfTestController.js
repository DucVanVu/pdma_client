/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SELF_TEST').controller('SelfTestController', SelfTestController);

    SelfTestController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'Utilities',
        'bsTableAPI',
        'focusFlatPick',
        'SelfTestService'
    ];

    function SelfTestController($rootScope, $scope, $state, blockUI, $timeout, settings, modal, toastr, utils, bsTableAPI, focusFlatPick, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.specimens = [
            {code: 'ORAQUICK', name: 'OraQuick'},
            {code: 'INSTI', name: 'INSTI'},
            {code: 'OTHER', name: 'Sinh phẩm khác'}
        ];

        vm.entry = {};
        vm.entries = [];

        vm.numberOfDays = 30;
        
        vm.filter = {
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.grantedOrgs = [];

        // wait for current user object
        blockUI.start();
        vm.orgsSelfTestable = [];
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }

            if ($scope.isAdministrator($scope.currentUser)) {
                let filter = {};
                service.getAllOrganizations(filter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    angular.forEach(data, function (obj) {
                        vm.grantedOrgs = data;
                        vm.grantedOrgsTemp = vm.grantedOrgs;
                    });
                    
                    blockUI.stop();
                });
            }
            // vm.provinces = [];
            vm.adminUnitFilter = {};
            vm.adminUnitFilter.excludeVoided=true;
            vm.adminUnitFilter.parentCode="country_1";
            blockUI.start();
            service.getAdminUnit(vm.adminUnitFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.provinces = data;
                blockUI.stop();
            });
        });

        vm.filterSelector = {
            storageKey: '__self_test_filter',
            props: ['organization', 'dispensingStaff', 'keyword', 'specimen', 'dispensingDateFrom', 'dispensingDateTo', 'provinceId'],
            organization: null,
            dispensingStaff: null,
            specimen: null,
            dispensingDateFrom: null,
            dispensingDateTo: null,
            provinceId: null,
        };

        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
        vm.modalInstance = null;

        // Resume the filter
        (function () {
            let data = localStorage.getItem(vm.filterSelector.storageKey);
            if (data) {
                vm.filter = JSON.parse(data);
                // replicate to the selector
                angular.forEach(vm.filterSelector.props, function (obj) {
                    vm.filterSelector[obj] = vm.filter[obj];
                });

                vm.filter.pageIndex = 0;
                vm.filter.pageSize = 25;
            }
        })();

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
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ]
        };

        // For dispensing date from
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.dispensingDateFrom = m.add(7, 'hours').toDate();
                    }
                    if(new Date(vm.filterSelector.dispensingDateTo)<new Date(vm.filterSelector.dispensingDateFrom) && vm.filterSelector.dispensingDateTo){
                        toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                        focusFlatPick('vm.filterSelector.dispensingDateFrom');
                        return;
                    }
                    vm.openSearch();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.filterSelector.dispensingDateFrom) {
                    fpItem.setDate(moment(vm.filterSelector.dispensingDateFrom).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function() {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.filterSelector.dispensingDateFrom = null;
                }
            }
        };

        // For dispensing date to
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.dispensingDateTo = m.add(7, 'hours').toDate();
                    }
                    if(new Date(vm.filterSelector.dispensingDateTo)<new Date(vm.filterSelector.dispensingDateFrom) && vm.filterSelector.dispensingDateFrom){
                        toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                        focusFlatPick('vm.filterSelector.dispensingDateTo');
                        return;
                    }
                    vm.openSearch();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.filterSelector.dispensingDateTo) {
                    fpItem.setDate(moment(vm.filterSelector.dispensingDateTo).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function() {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.filterSelector.dispensingDateTo = null;
                }
            }
        };

        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
                // height: 400,
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        /**
         * Update the status of filter: Are there any filter criteria
         */
        // vm.updateFilterStatus = function () {
        //     vm.filter.isFiltered = false;

        //     angular.forEach(vm.filterSelector.props, function (obj) {
        //         if (vm.filter[obj] != null) {
        //             vm.filter.isFiltered = true;
        //         }
        //     });

        //     if (vm.filter.isFiltered) {
        //         localStorage.setItem(vm.filterSelector.storageKey, JSON.stringify(vm.filter));
        //     } else {
        //         localStorage.removeItem(vm.filterSelector.storageKey);
        //     }
        // };

        /**
         * On filter removed
         * @param prop
         */
        vm.onFilterRemoved = function (prop) {
            if (prop === 'organization' && vm.grantedOrgs.length === 1) {
                return;
            }

            delete vm.filter[prop];
            delete vm.filterSelector[prop];

            // reset page index
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getEntries();
        };

        $scope.$watch('vm.filterSelector.keyword', function (newVal, oldVal) {
            if ((!newVal || newVal.trim() == '') && oldVal && oldVal.trim() != '') {
                $timeout(function () {
                    vm.getEntries(true);
                }, 500);
            }
        });

        vm.openSearch = function() {
            if(vm.filterSelector.dispensingDateFrom && vm.filterSelector.dispensingDateTo) {
                if(new Date(vm.filterSelector.dispensingDateTo) < new Date(vm.filterSelector.dispensingDateFrom)) {
                    toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                    return;     
                }
            }
            vm.getEntries(true);
        }
        vm.getOrgs = function() {
            vm.filterSelector.org = null;
            vm.grantedOrgs = [];
            vm.grantedOrgsTemp.forEach(element => {
                if(element.address.province.id == vm.filterSelector.provinceId) {
                    vm.grantedOrgs.push(element);
                }
            });
            vm.getEntries(true);
        }

        // Get all entries
        vm.getEntries = function (updateFilter) {
            if (updateFilter) {

                angular.forEach(vm.filterSelector.props, function (obj) {
                    vm.filter[obj] = vm.filterSelector[obj];
                });

                if (!vm.filter.keyword || vm.filter.keyword.trim().length <= 0) {
                    vm.filter.keyword = null;
                }

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // reset page index
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);
            }

            // vm.updateFilterStatus();

            vm.entries = [];
            blockUI.start();
            service.getEntries(vm.filter).then(function (data) {
                blockUI.stop();
                angular.copy(data.content, vm.entries);
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };
        vm.getEntries();

        /**
         * Open the advanced search modal dialog
         */
        // vm.openAdvancedSearch = function () {
        //     vm.modalInstance = modal.open({
        //         animation: true,
        //         templateUrl: 'advanced_search_modal.html',
        //         scope: $scope,
        //         size: 'md'
        //     });

        //     vm.modalInstance.closed.then(function () {
        //         vm.dialog = {};
        //     });
        // };

        /**
         * New entry
         */
        vm.newEntry = function () {
            $state.go('application.self_test_edit');
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsSelfTestable = $scope.assignedOrgs.selfTestable;

                if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                    if(vm.orgsSelfTestable.length == 0 || !vm.orgsSelfTestable) {
                        $state.go('application.prev_dashboard');
                    }
                }
                vm.grantedOrgs = [];
                
                angular.forEach(vm.orgsReadable, function (obj) {
                    vm.grantedOrgs.push({
                        id: obj.id,
                        name: obj.name,
                        address: obj.address,
                        province: (obj.address && obj.address.province) ? obj.address.province.name : 'Không rõ tỉnh'
                    });
                });
                vm.grantedOrgsTemp = vm.grantedOrgs;
                if (vm.grantedOrgs.length === 1) {
                    vm.filterSelector.organization = {};
                    vm.filter.organization = {};

                    angular.copy(vm.grantedOrgs[0], vm.filterSelector.organization);
                    angular.copy(vm.grantedOrgs[0], vm.filter.organization);
                }
                
                // load the entries
                vm.getEntries();
            }
        });

        /**
         * Delete an entry
         */
        $scope.deleteEntry = function (id) {

            if (!id) {
                toastr.warning('Không tìm thấy thông tin bản ghi.', 'Thông báo');
            }

            if (!$scope.isSiteManager($scope.currentUser)) {
                return;
            }

            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'Xóa bản ghi?',
                message: 'Bạn có thực sự muốn xóa thông tin một bản ghi cấp phát sinh phẩm tự xét nghiệm cho khách hàng không?',
                callback: function (answer) {
                    if (answer === 'yes') {
                        blockUI.start();
                        // service.getEntry(id, function success() {
                        // }, function failure() {
                        //     blockUI.stop();
                        // }).then(function (data) {
                        //     blockUI.stop();
                        //     let convertDispensingDate = new Date(data.dispensingDate);
                        //     let dispensingDateConvert = convertDispensingDate.getMonth()+1;
                        //     let calculateQuarter = null;
                        //     if(dispensingDateConvert>0 && dispensingDateConvert<4) {
                        //         calculateQuarter = 1;
                        //     } else if(dispensingDateConvert>3 && dispensingDateConvert<7) {
                        //         calculateQuarter = 2;
                        //     } else if(dispensingDateConvert>6 && dispensingDateConvert<10) {
                        //         calculateQuarter = 3;
                        //     } else if(dispensingDateConvert>9 && dispensingDateConvert<13) {
                        //         calculateQuarter = 4;
                        //     }
                        //     let changeByQuarter = new Date(convertDispensingDate.getFullYear(), convertDispensingDate.getMonth(), convertDispensingDate.getDate());
                        //     if(calculateQuarter == 1) {
                        //         changeByQuarter.setMonth(2);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 2) {
                        //         changeByQuarter.setMonth(5);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 3) {
                        //         changeByQuarter.setMonth(8);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 4) {
                        //         changeByQuarter.setMonth(11);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     }
                        //     let isAdministrator = $scope.isAdministrator($scope.currentUser);
                        //     if(!isAdministrator) {
                        //         if((new Date()) > changeByQuarter) {
                        //             toastr.warning("Đã quá thời hạn chỉnh sửa phiếu","Thông báo");
                        //             return;
                        //         }
                        //     }
                            service.deleteEntries([{id: id}], function success() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.info('Bạn đã xóa thành công bản ghi!', 'Thông báo');

                                $state.go($state.$current, null, {reload: true});

                            }, function failure() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.error('Có lỗi xảy ra khi xóa bản ghi!', 'Thông báo');
                            })
                        // })
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Start export entries to Excel
         */
        vm.startExport2Excel = function (opt) {

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
            service.export2Excel(vm.filter).success(successHandler).error(function (data) {
                blockUI.stop();
            });
        };
    }

})();
