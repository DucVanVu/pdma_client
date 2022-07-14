/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PnsListingController', PnsListingController);

    PnsListingController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',

        'PnsIndexService',
        '$state',
        '$uibModal',
        'blockUI',
        'toastr',
        'focusFlatPick'
    ];

    function PnsListingController($rootScope, $scope, $http, $timeout, settings, service,$state,modal,blockUI,toastr,focusFlatPick) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        var vm = this;
        // $scope.isSiteManager = $scope.isSiteManager($scope.currentUser);

        vm.entries = [];
        vm.selectedEntries = [];
        vm.modalInstance=null;
        vm.isContact = false;

        vm.numberOfDays = 30;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };

        blockUI.start();
        vm.orgsPnsable = [];
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

        vm.openSearch = function() {
            if(vm.filter.fromDate && vm.filter.toDate) {
                if(vm.filter.toDate<vm.filter.fromDate){
                    toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                    return;
                }
            }
            vm.getEntries();
            vm.getEntriesContact();
        }

        vm.onFilterRemoved = function(o){
            vm.filter[o]=null;
            vm.isFiltered =
            (vm.filter.org)
            || (vm.filter.staff)
            vm.getEntries();
        }
        $scope.$watch('vm.filter', function(newVal, oldVal) {
            // alert('watch filter');
            vm.isFiltered =
            (vm.filter.org)
            || (vm.filter.staff)
        });



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

        vm.filterTypes = [
            {name:'Tất cả khách hàng',val:2},
            {name:'Khách hàng đồng ý nhận dịch vụ',val:1},
        ];


        $scope.deletePNS = function (id) {

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
                    //     let c5ConvertToDate = new Date(data.c5);
                    //     let c5Convert = c5ConvertToDate.getMonth()+1;
                    //     let calculateQuarter = null;
                    //     let changeByQuarter = null;
                    //     if(c5Convert>0 && c5Convert<4) {
                    //         calculateQuarter = 1;
                    //     } else if(c5Convert>3 && c5Convert<7) {
                    //         calculateQuarter = 2;
                    //     } else if(c5Convert>6 && c5Convert<10) {
                    //         calculateQuarter = 3;
                    //     } else if(c5Convert>9 && c5Convert<13) {
                    //         calculateQuarter = 4;
                    //     }
                    //     changeByQuarter = new Date(c5ConvertToDate.getFullYear(), c5ConvertToDate.getMonth(), c5ConvertToDate.getDate());
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
                            }
                            vm.getEntries();
                        });
                    // });
                }
            });
        };

        /**
         * Delete selected entries
         */
         $scope.deleteContactEntry = function (id) {

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
                    // service.getPNSContactEntry(id, function success() {
                    // }, function failure() {
                    //     blockUI.stop();
                    // }).then(function (data) {
                    //     blockUI.stop();
                    //     let c5ConvertToDate = new Date(data.c5);
                    //     let c5Convert = c5ConvertToDate.getMonth()+1;
                    //     let calculateQuarter = null;
                    //     let changeByQuarter = null;
                    //     if(c5Convert>0 && c5Convert<4) {
                    //         calculateQuarter = 1;
                    //     } else if(c5Convert>3 && c5Convert<7) {
                    //         calculateQuarter = 2;
                    //     } else if(c5Convert>6 && c5Convert<10) {
                    //         calculateQuarter = 3;
                    //     } else if(c5Convert>9 && c5Convert<13) {
                    //         calculateQuarter = 4;
                    //     }
                    //     changeByQuarter = new Date(c5ConvertToDate.getFullYear(), c5ConvertToDate.getMonth(), c5ConvertToDate.getDate());
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
                        service.deleteContactEntry(id, function success(data) {
                            blockUI.stop();
                        }, function failure(data) {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                        }).then(function (data) {
                            // reload the grid
                            //console.log("mess",data);
                            blockUI.stop();
                            toastr.info('Xóa thành công', 'Thông báo');                   
                            vm.getEntriesContact();
                        });
                    // });
                }
            });
        };

        vm.getEntry = function () {
            // block the view with a loading indicator

            vm.id = $stateParams.id;

        };

        vm.getOrgs = function() {
            vm.filter.org = null;
            vm.grantedOrgs = [];
            vm.grantedOrgsTemp.forEach(element => {
                if(element.address.province.id == vm.filter.provinceId) {
                    vm.grantedOrgs.push(element);
                }
            });
            vm.getEntries();
            vm.getEntriesContact();
        }

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
                vm.orgsPnsable = $scope.assignedOrgs.pnsable;
                
                if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                    if(vm.orgsPnsable.length == 0 || !vm.orgsPnsable) {
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
                vm.getEntriesContact();
            }
        });

        $scope.$watch('vm.filter.org', function (newVal, oldVal) {
            if(newVal!=oldVal){
                vm.filter.staff =null;
            }
            vm.getListStaff();
            vm.openSearch();
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

        vm.openAddPNS = function () {
            $state.go('application.pns_add');
        };

        vm.getEntries = function () {
            blockUI.start();
            service.getAllEntries(vm.filter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                //vm.treeData = data.content;
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
                vm.bsTableControl.options.data = data.content;
                vm.bsTableControl.options.totalRows = data.totalElements;
                blockUI.stop();
            });
        };
        vm.getEntries();
        
        vm.getEntriesContact = function () {
            blockUI.start();
            service.getAllEntriesContact(vm.filter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                //vm.treeData = data.content;
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControlContact.options.columns = service.getTableDefinitionContact(isSiteManager);
                vm.bsTableControlContact.options.data = data.content;
                vm.bsTableControlContact.options.totalRows = data.totalElements;
                blockUI.stop();
            });
        };
        vm.getEntriesContact();

        vm.getEntries1 = function() {
            vm.getEntries();
            vm.getEntriesContact();
        }

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
                        }
                        vm.getEntries();
                        vm.getEntriesContact();
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
                        }
                        if(vm.filter.toDate<vm.filter.fromDate && vm.filter.fromDate){
                            toastr.warning('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
                            focusFlatPick('vm.filter.toDate');
                        }
                        vm.getEntries();
                        vm.getEntriesContact();
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

        vm.exportPNS = function () {
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
            service.exportPNS(vm.filter)
            .success(successHandler)
            .error(function () {
                blockUI.stop();
            });
        };

        //them tìm kiếm
        vm.filterModal={
            pageIndex: 0,
            pageSize: 10,
            keyword: null
        };
        vm.checkSearch=function(number){
            if(vm.checkRadioPopup=="hts"){
                vm.htsSearch=true;
                vm.opcSearch=false;
                vm.newCase=false;
            }
            if(vm.checkRadioPopup=="opc"){
                vm.htsSearch=false;
                vm.opcSearch=true;
                vm.newCase=false;
            }
            if(vm.checkRadioPopup=="new"){
                vm.htsSearch=false;
                vm.opcSearch=false;
                vm.newCase=true;
                $state.go('application.pns_add', { "mapId": 0,"type":0});
                    vm.modalInstance.close();
                    return;
            }
            if(!vm.checkRadioPopup){
                vm.htsSearch=false;
                vm.opcSearch=false;
                vm.newCase=false;
            }

            // if(number==1){
            //     if(vm.htsSearch==true){
            //         vm.opcSearch=false;
            //     }
            //     if(vm.htsSearch==false){
            //         vm.opcSearch=true;
            //     }
            // }
            // if(number==2){
            //     if(vm.opcSearch==true){
            //         vm.htsSearch=false;
            //     }
            //     if(vm.opcSearch==false){
            //         vm.htsSearch=true;
            //     }
            // }
            // if(number==3){
            //     vm.htsSearch=false;
            //     vm.opcSearch=false;
            // }
            vm.searchModal();
            
        };

        vm.searchModal=function(){
            vm.selectedItem=null;
            if(vm.htsSearch==true){
                if(vm.filterHTS){
                    vm.filterModal.pageIndex=vm.filterHTS-1;
                }
                vm.filterModal.c15="YES";
                vm.filterModal.c14="answer2";
                vm.filterModal.skipPNS=true;
                blockUI.start();
                service.searchHTS(vm.filterModal, function success(data) {
                    blockUI.stop();
                }, function failure(data) {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi tìm kiếm bản ghi.', 'Thông báo');
                }).then(function (data) {
                    vm.dataModalHTS=data;
                    vm.valuesHTS=[];
                    console.log("hts",vm.dataModalHTS);
                    //vm.totalElements=data.totalElements;
                    blockUI.stop();
                });
            }
            if(vm.opcSearch==true){
                if(vm.filterOPC){
                    vm.filterModal.pageIndex=vm.filterOPC-1;
                }
                vm.filterModal.exportPatient=true;
                vm.filterModal.includeDeleted=false;
                vm.filterModal.includeOnART=true;
                vm.filterModal.includePreART= true;
                vm.filterModal.isFiltered= true;
                vm.filterModal.patientStatus= "ACTIVE";
                vm.filterModal.patientStatusLabel= "Bệnh nhân đang quản lý";
                vm.filterModal.sortField= 1;
                blockUI.start();
                service.searchOPC(vm.filterModal, function success(data) {
                    blockUI.stop();
                }, function failure(data) {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi tìm kiếm bản ghi.', 'Thông báo');
                }).then(function (data) {
                    vm.dataModalOPC=data;
                    //vm.totalElements=data.totalElements;
                    vm.valuesOPC=[];
                    console.log("opc",vm.dataModalOPC);
                    blockUI.stop();
                });
            }
        };

        vm.selectItem=function(){
            if(!vm.selectedItem && !vm.newCase){
                toastr.warning("Bạn chưa chọn bệnh nhân ","Thông báo");
                return;
            }else{
                if(vm.htsSearch==true){
                    
                    vm.modalInstance.close();
                    vm.checkHTSOROPC={
                        idHTS: vm.selectedItem.id,
                        type: 1
                    }
                    service.checkHTSOPC(vm.checkHTSOROPC, function success() {
                    }, function failure() {
                    }).then(function (data) {
                        if(data.code=="YES"){
                            console.log("adasdas");
                            vm.modalInstance = modal.open({
                                animation: true,
                                templateUrl: 'select_entry_modal.html',
                                scope: $scope,
                                size: 'md',
                                backdrop: 'static',
                                keyboard: false
                            });
                
                            vm.modalInstance.result.then(function (answer) {
                                if (answer == 'yes') {
                                    $state.go('application.pns_edit', { "id": data.responseObject.id});
                                    return;
                                }
                            });
                        }else{
                            toastr.info("Bạn đã chọn bệnh nhân "+vm.selectedItem.c23FullName,"Thông báo");
                            $state.go('application.pns_add', { "mapId": vm.selectedItem.id,"type":1});
                            return;
                        }
                    });

                    
                    
                }
                else if(vm.opcSearch==true){
                    
                    vm.modalInstance.close();
                    vm.checkHTSOROPC={
                        idOPC: vm.selectedItem.id,
                        type: 2
                    }
                    service.checkHTSOPC(vm.checkHTSOROPC, function success() {
                    }, function failure() {
                    }).then(function (data) {
                        console.log(data);
                        if(data.code=="YES"){
                            console.log("adasdas");
                            vm.modalInstance = modal.open({
                                animation: true,
                                templateUrl: 'select_entry_modal.html',
                                scope: $scope,
                                size: 'md',
                                backdrop: 'static',
                                keyboard: false
                            });
                
                            vm.modalInstance.result.then(function (answer) {
                                if (answer == 'yes') {
                                    $state.go('application.pns_edit', { "id": data.responseObject.id});
                                    return;
                                }
                            });
                        }else{
                            toastr.info("Bạn đã chọn bệnh nhân "+vm.selectedItem.theCase.person.fullname,"Thông báo");
                            $state.go('application.pns_add', { "mapId": vm.selectedItem.id,"type":2});
                            return;
                        }
                    });
                }
                else if(vm.newCase==true){
                    $state.go('application.pns_add', { "mapId": 0,"type":0});
                    vm.modalInstance.close();
                    return;
                }
            }
        };

        vm.cancel=function(){
            vm.htsSearch=false;
            vm.opcSearch=false;
            vm.newCase=false;
            vm.dataModalOPC=null;
            vm.dataModalHTS=null;
            vm.checkRadioPopup=null;
            vm.modalInstance.close();
        };

        vm.checkItem=function(index){
            if(vm.htsSearch==true){
                for(let i=0;i<vm.dataModalHTS.content.length;i++){
                    if(i!=index){
                        vm.valuesHTS[i]=false;
                    }else{
                        if(vm.valuesHTS[i]==true){
                            vm.selectedItem=vm.dataModalHTS.content[i];
                        }
                    }

                }
            }else{
                for(let i=0;i<vm.dataModalOPC.content.length;i++){
                    if(i!=index){
                        vm.valuesOPC[i]=false;
                    }else{
                        if(vm.valuesOPC[i]==true){
                            vm.selectedItem=vm.dataModalOPC.content[i];
                        }
                    }

                }
            }
        };

        document.getElementById("tab-line1").classList.add("active");

        vm.getTable1 = function () {
            vm.isContact = false;
            let element = document.getElementById("tab-line1");
            element.classList.add("active");
            let element2 = document.getElementById("tab-line2");
            element2.classList.remove("active");
        }
        
        vm.getTable2 = function () {
            vm.isContact = true;
            let element = document.getElementById("tab-line2");
            element.classList.add("active");
            let element2 = document.getElementById("tab-line1");
            element2.classList.remove("active");
        }

        vm.showModalSearch=function(){
            vm.selectedItem=null;
            vm.filterModal={
                pageIndex: 0,
                pageSize: 10,
                keyword: null
            };
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'search.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });
        };

        //them tim kiem
        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
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

        vm.bsTableControlContact = {
            options: {
                data: [],
                idField: 'id',
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
                columns: service.getTableDefinitionContact(),
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

                    vm.getEntriesContact();
                }
            }
        };
    }

})();
