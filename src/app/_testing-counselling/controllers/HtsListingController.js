/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.HTS').controller('HtsListingController', HtsListingController);

    HtsListingController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'HtsIndexService',
        '$state',
        '$uibModal',
        'blockUI',
        'toastr',
        'focusFlatPick',
        '$stateParams',
    ];

    function HtsListingController($rootScope, $scope, $http, $timeout, settings, service,$state,modal,blockUI,toastr,focusFlatPick,$stateParams) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        var vm = this;

        vm.entries = [];
        vm.selectedEntries = [];
        vm.modalInstance=null;
        
        vm.numberOfDays = 30;
        
        vm.orgsHtsable = [];
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();
            
            // vm.orgsReadable = $scope.assignedOrgs.readable;
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

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };
        
        vm.filter.typeMap = $stateParams.type;
        vm.filter.keyMap = $stateParams.key;
        if(vm.filter.typeMap){
            vm.isFiltered=true;
        }
        if(vm.filter.keyMap){
            service.getAdminisByGsoCode(vm.filter.keyMap, function success() {
            }, function failure() {
              blockUI.stop();
            }).then(function (data) {
                vm.adminisMap = data;
            })
        }
        vm.filterNotInfo = {
            pageIndex: 0,
            pageSize: vm.filter.pageSize,
            keyword: null
        };

        vm.c24Values=[
            {id:1,name:'Khách hàng dương tính mới',isCheck:false,val:'answer1'},
            {id:2,name:'Khách hàng dương tính cũ',isCheck:false,val:'answer2'},
            {id:3,name:'Đang chờ kết quả xác minh',isCheck:false,val:'answer3'}
        ];

        vm.filterTypes = [
            {name:'Tất cả khách hàng',val:10},
            {name:'Khách hàng chưa quay lại nhận KQXN',val:1},
            {name:'Khách hàng có KQXN phản ứng và cần làm XN HIV khẳng định',val:2},
            {name:'Khách hàng có KQXN HIV dương tính trong lần XN gần nhất',val:3},
            {name:'Khách hàng có KQXN khẳng định HIV dương tính',val:4},
            {name:'Khách hàng Dương tính được tính cho chỉ tiêu MER',val:5},
            {name:'Khách hàng sử dụng dịch vụ điều trị PrEP',val:6},
            {name:'Khách hàng sử dụng dịch vụ điều trị ARV',val:7},
            {name:'Khách hàng đang chờ kết quả xác minh HIV dương tính',val:8},
            {name:'Khách hàng xét nghiệm sàng lọc Giang mai',val:9},
        ];

        vm.openAdvancedSearch = function (focusOnElement) {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: '_advance_search_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (answer) {
                if (answer == 'yes') {
                    vm.isFiltered=true;
                    vm.getEntries();
                }
                else if(answer == 'no'){
                    vm.filter = {
                        pageIndex: 0,
                        pageSize: 25,
                        keyword: null
                    };
                    vm.getEntries();
                }
            });

            vm.modalInstance.closed.then(function (data) {
                // TODO
                vm.isFiltered =
                (vm.filter.org)
                || (vm.filter.staff)
                || (vm.filter.c14)
                || (vm.filter.c15)
                || (vm.filter.notComplete);
            });
        };
        vm.clearSearch = function(){
            vm.isFiltered=false;
            vm.filter = {
                pageIndex: 0,
                pageSize: 25,
                keyword: null
            };
            vm.getEntries();
        }
        $scope.$watch('vm.filter', function(newVal, oldVal) {

        });

        vm.openSearch = function() {
            if(vm.filter.fromDate && vm.filter.toDate) {
                if(vm.filter.toDate<vm.filter.fromDate){
                    toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                    return;
                }
            }
            vm.getEntries();
        }

        vm.displayValue = function (field, val) {
            console.log(val);
            switch (field) {
                case 'gender':
                    if (val == 'MALE') {
                        return 'Nam';
                    }
                    else if (val == 'FEMALE') {
                        return 'Nữ';
                    }
                    else if (val == 'OTHER') {
                        return 'Khác';
                    }
                    break;
            }
            return 'Khác';
        }


        $scope.deleteHTS = function (id) {

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
                    // service.getEntry(id, function success() {
                    // }, function failure() {
                    //     blockUI.stop();
                    // }).then(function (data) {
                    //     blockUI.stop();
                    //     let c4ConvertToDate = new Date(data.c4);
                    //     let c4Convert = c4ConvertToDate.getMonth()+1;
                    //     let calculateQuarter = null;
                    //     let changeByQuarter = null;
                    //     if(c4Convert>0 && c4Convert<4) {
                    //         calculateQuarter = 1;
                    //     } else if(c4Convert>3 && c4Convert<7) {
                    //         calculateQuarter = 2;
                    //     } else if(c4Convert>6 && c4Convert<10) {
                    //         calculateQuarter = 3;
                    //     } else if(c4Convert>9 && c4Convert<13) {
                    //         calculateQuarter = 4;
                    //     }
                    //     changeByQuarter = new Date(c4ConvertToDate.getFullYear(), c4ConvertToDate.getMonth(), c4ConvertToDate.getDate());
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
                    //         console.log(changeByQuarter);
                    //         if((new Date()) > changeByQuarter) {
                    //             toastr.warning("Đã quá thời hạn chỉnh sửa phiếu","Thông báo");
                    //             return;
                    //         }
                    //     }
                        service.deleteEntries(id, function success(data) {
                            blockUI.stop();
                        }, function failure(data) {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                        }).then(function (data) {
                            // reload the grid
                            //console.log("mess",data);
                            if(data.code=='YES'){
                                toastr.info(data.message, 'Thông báo');
                            }
                            else {
                                vm.alertContent = data.message;
                                vm.modalInstance = modal.open({
                                    animation: true,
                                    templateUrl: '_alert_modal.html',
                                    scope: $scope,
                                    size: 'md',
                                    backdrop: 'static',
                                    keyboard: false
                                });
    //                            toastr.error(data.message, 'Thông báo');
                            }
                            vm.getEntries();
                        });
                    // })
                }
            });
        };

        $scope.updateHTS = function (id) {
            if(id){
                blockUI.start();
                service.getEntry(id, function success() {
                }, function failure() {
                  blockUI.stop();
                }).then(function (data) {
                    vm.entry=data;
                    blockUI.stop();
                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'update_c24_modal.html',
                        scope: $scope,
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false
                    });
                    vm.modalInstance.result.then(function (answer) {
                        if (answer == 'yes') {
//                            alert('yes');
                            service.updateC24(vm.entry, function success() {
                                blockUI.stop();
                                vm.getEntries();
                                toastr.info('Bạn đã lưu thành công', 'Thông báo');
                            }, function failure() {
                                blockUI.stop();
                                toastr.error('Có lỗi xảy ra khi lưu thông tin', 'Thông báo');
                            }).then(function (data) {
                                blockUI.stop();
                                if(data){
                                    if(!data.id && !data.editAble){
                                        toastr.warning('Bản ghi đã quá thời gian để sửa', 'Thông báo');
                                    }else{
                                        vm.getEntries();
                                        toastr.info('Bạn đã lưu thành công', 'Thông báo');
                                        $state.go('application.hts');
                                    }
                                }
                                
                            });

                        }
                    });
                });
            };
        };

        vm.getEntry = function () {
            // block the view with a loading indicator

            vm.id = $stateParams.id;

        };

        // vm.orgsWritable=[];
        // $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
        //     if (newVal == true) {
        //         vm.orgsWritable = $scope.assignedOrgs.readable;
        //         if (vm.orgsWritable && vm.orgsWritable.length == 1) {
        //             vm.currentOrg = vm.orgsWritable[0];
        //             vm.filter.org=vm.orgsWritable[0];
        //         }
        //     }
        // });
        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.grantedOrgs = [];
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsHtsable = $scope.assignedOrgs.htsable;
                
                if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                    if(vm.orgsHtsable.length == 0 || !vm.orgsHtsable) {
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
                    vm.filter.org = {};

                    angular.copy(vm.grantedOrgs[0], vm.filter.org);
                }

                // load the entries
                vm.getEntries();
            }
        });

        vm.getOrgs = function() {
            vm.filter.org = null;
            vm.grantedOrgs = [];
            vm.grantedOrgsTemp.forEach(element => {
                if(element.address.province.id == vm.filter.provinceId) {
                    vm.grantedOrgs.push(element);
                }
            });
            vm.getEntries();
        }

        vm.c15Values=[
            {id:1,name:'Không',isCheck:true,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'},
            {id:3,name:'Chưa có thông tin',isCheck:false,val:'NO_INFORMATION'}
        ];

        vm.c14Values=[
            {id:1,name:'Âm tính',isCheck:false,val:'answer1'},
            {id:2,name:'Dương tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không xác định',isCheck:false,val:'answer3'},
            {id:4,name:'Không làm xét nghiệm',isCheck:false,val:'answer4'}
        ];

        $scope.$watch('vm.filter.org', function (newVal, oldVal) {
            if(newVal!=oldVal){
                vm.filter.staff =null;
            }
            vm.getListStaff();
            vm.getEntries();
        });
        vm.getListStaff = function () {
            blockUI.start();
            let orgFilter={organization: vm.filter.org};

            service.getListStaff(orgFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                //console.log("c3",data);
                vm.staffs = data.content;
                blockUI.stop();
            });
        };

        vm.openAddHTS = function () {
            $state.go('application.hts_add');
        };

        vm.filterCheckbox=function(){
            vm.filter = {
                ...this.filter,
                pageIndex: 0,
            };
            vm.getEntries();
        };

        vm.getEntries = function () {
            blockUI.start();
            service.getAllEntries(vm.filter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.getListNotComplete();
                //vm.treeData = data.content;
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
                vm.bsTableControl.options.data = data.content;
                vm.bsTableControl.options.totalRows = data.totalElements;
                blockUI.stop();
            });
        }
        vm.getEntries();
        
        vm.getListNotComplete = function () {
            vm.filterNotInfo.notComplete=true;
            service.getAllEntries(vm.filterNotInfo, function success() {
            }, function failure() {
            }).then(function (data) {
                vm.totalElement = data.totalElements;
            })
        };
        vm.getListNotComplete();
        
        vm.fromDateReport = {
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
                    disable: [
                        function(date) {
                            // return true to disable
                            return (date > new Date());
                        }
                    ],
                    onChange: [function() {
                        if(vm.filter.fromDate>new Date()){
                            toastr.warning('Ngày chọn báo cáo không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.filter.fromDate');
                            return;
                        }
                        if(vm.filter.toDate<vm.filter.fromDate && vm.filter.toDate){
                            toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                            focusFlatPick('vm.filter.fromDate');
                            return;
                        }
                        vm.getEntries();
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.fromDateReport.fpItem = fpItem;
                    if (vm.filter.fromDate && fpItem) {
                        fpItem.setDate(moment(vm.filter.fromDate).toDate());
                    }
                },
                clear: function() {
                    if (vm.fromDateReport.fpItem) {
                        vm.fromDateReport.fpItem.clear();
                        vm.filter.fromDate = null;
                    }
                }
        };

        vm.toDateReport = {
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
                    disable: [
                        function(date) {
                            // return true to disable
                            return (date > new Date());
                        }
                    ],
                    onChange: [function() {
                        if(vm.filter.toDate>new Date()){
                            toastr.warning('Ngày chọn báo cáo không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.filter.toDate');
                            return;
                        }
                        if(vm.filter.toDate<vm.filter.fromDate && vm.filter.fromDate){
                            toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                            focusFlatPick('vm.filter.toDate');
                            return;
                        }
                        vm.getEntries();
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.toDateReport.fpItem = fpItem;
                    if (vm.filter.toDate && fpItem) {
                        fpItem.setDate(moment(vm.filter.toDate).toDate());
                    }
                },
                clear: function() {
                    if (vm.toDateReport.fpItem) {
                        vm.toDateReport.fpItem.clear();
                        vm.filter.toDate = null;
                    }
                }
        };

        vm.exportHTS = function () {
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
            service.exportHTS(vm.filter)
            .success(successHandler)
            .error(function () {
                blockUI.stop();
            });
        };
        vm.showInfo = false;
        vm.setShowInfo = function() {
            if(vm.showInfo) {
                vm.showInfo = false;
            } else {
                vm.showInfo = true;
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
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedEntries.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedEntries);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedEntries.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };
    }

})();
