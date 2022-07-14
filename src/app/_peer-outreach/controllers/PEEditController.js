/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PeerOutreach').controller('PEEditController', PEEditController);

    PEEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',
        'PEEditService',
        '$stateParams',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        '$state'
    ];

    function PEEditController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service, $stateParams, focus, focusFlatPick, openSelectBox, utils, $state) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.entry = {};           // placeholder for an entry
        vm.entries = [];         // all entries queried for the grid
        vm.selectedEntries = []; // selected entries on the grid
        vm.name = null;
        vm.calculateAge = 15;
        vm.numberOfDays = 30;
        vm.convertC1 = null;
        // Entry statuses
        vm.statuses = [{id: 0, name: 'ĐANG SOẠN THẢO'}, {id: 1, name: 'ĐÃ XUẤT BẢN'}];

        vm.modalInstance = null; // the modal dialog

        // For querying list of entries
        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };
        //Administrative Unit Filter
        vm.adminUnitFilter={};

        // Option for the editor
        vm.editorOptions = {
            toolbar: [
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'clear'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
            ]
        };

        //Option for question
        vm.orgsWritable=[];
        vm.orgsReadable=[];
        
        vm.years=[];
        let currentYear = moment().year();
        for(let i=moment().year();i>1919;i--){
            let year={ id: i, name: i};
            vm.years.push(year);
        };
        vm.months=[];
        for(let i=1;i<13;i++){
            let month={ id: i, name: i};
            vm.months.push(month);
        };
        vm.now= new Date();
        vm.entry.c1ReportYear=vm.now.getFullYear();
        vm.entry.c1Report = vm.now.getMonth()+1;
        vm.c6Values=[
            {name:'Người nghiện chích ma túy',isCheck:false,val:'answer1'},
            {name:'Nam giới có QHTD đồng giới',isCheck:false,val:'answer2'},
            {name:'Người bán dâm',isCheck:false,val:'answer3'},
            {name:'Người chuyển giới',isCheck:false,val:'answer4'},
            {name:'Vợ/chồng/BT/con đẻ ≤15 tuổi của NCH',isCheck:false,val:'answer5'},
            {name:'Bạn chích chung của NCH',isCheck:false,val:'answer6'}
        ];
        vm.c7Values=[
            {id:1,name:'Trực tiếp',isCheck:false,val:'answer1'},
            {id:2,name:'Thông qua mạng xã hội (online)',isCheck:false,val:'answer2'},
            {id:3,name:'Thông qua mạng lưới (PDI)',isCheck:false,val:'answer3'},
            {id:4,name:'Người có HIV',isCheck:false,val:'answer4'},
            {id:5,name:'Chưa tiếp cận được',isCheck:false,val:'answer5'}
        ];
        vm.c8Values=[
            {id:1,name:'HIV dương tính',isCheck:false,val:'answer1'},
            {id:2,name:'HIV âm tính trong lần XN gần nhất',isCheck:false,val:'answer2'},
            {id:3,name:'Không biết',isCheck:false,val:'answer3'}
        ];
        vm.c8ARVValues=[
            {id:1,name:'Đang điều trị ARV',isCheck:false,val:'answer1'},
            {id:2,name:'Chưa từng điều trị ARV ',isCheck:false,val:'answer2'},
            {id:3,name:'Bỏ điều trị ARV',isCheck:false,val:'answer3'}
        ];
        vm.yesNoNone=[
            {id:1,name:'Không',isCheck:false,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'},
            {id:3,name:'Không biết',isCheck:false,val:'NO_INFORMATION'}
        ];
        vm.c12Values=[
            {id:1,name:'Nhân viên cộng đồng thực hiện',isCheck:true,val:'answer1'},
            {id:2,name:'Tự xét nghiệm HIV có hỗ trợ',isCheck:false,val:'answer2'},
            {id:3,name:'Tự xét nghiệm HIV không có hỗ trợ',isCheck:false,val:'answer3'},
            {id:4,name:'Cơ sở y tế thực hiện',isCheck:false,val:'answer4'}
        ];
        vm.c12BTBCValues=[
            {id:1,name:'Bản thân',isCheck:false,val:'answer1'},
            {id:2,name:'Bạn tình',isCheck:false,val:'answer2'},
            {id:3,name:'Bạn chích',isCheck:false,val:'answer3'}
        ];
        vm.c132Values=[
            {id:1,name:'Âm tính',isCheck:false,val:'answer1'},
            {id:2,name:'Dương tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không làm xét nghiệm Giang mai',isCheck:false,val:'answer3'}
        ];
        vm.c13Values=[
            {id:1,name:'Có phản ứng HIV dương tính',isCheck:false,val:'answer1'},
            {id:2,name:'HIV âm tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không xác định',isCheck:false,val:'answer3'},
            {id:4,name:'Không biết',isCheck:false,val:'answer4'}
        ];
        vm.c131Values=[
            {id:1,name:'HIV âm tính',isCheck:false,val:'answer1'},
            {id:2,name:'Khẳng định HIV dương tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không xác định',isCheck:false,val:'answer3'},
            {id:4,name:'Không biết',isCheck:false,val:'answer4'}
        ];
        vm.c131CodeValues=[
            {id:1,name:'3a',isCheck:false,val:'3a'},
            {id:2,name:'3b',isCheck:false,val:'3b'},
            {id:3,name:'3c',isCheck:false,val:'3c'},
        ];
        vm.c16Values=[
            {id:1,name:'Khách hàng dương tính mới',isCheck:false,val:'answer1'},
            {id:2,name:'Khách hàng dương tính cũ',isCheck:false,val:'answer2'},
            {id:3,name:'Đang chờ kết quả xác minh',isCheck:false,val:'answer3'}
        ];
        
        // wait for current user object
        vm.isWrited=false;
        vm.isReaded=false;
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();
            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }
            // vm.checkReadOrWriteOrNull();
        });

        // vm.grantedOrgs1 = []; // write
        // vm.grantedOrgs2 = []; // read
        // vm.checkReadOrWriteOrNull = function(orgId) {
        //     if(!orgId) {
        //         return null;
        //     }
        //     vm.isWrited=false;
        //     vm.isReaded=false;
        //     if($scope.isAdministrator($scope.currentUser) || $scope.isProvincialManager($scope.currentUser)) {
        //         vm.isReaded=true;
        //         vm.isWrited=false;
        //     }
        //     vm.orgsWritable.forEach(element1 => {
        //         if(element1.id == orgId) {
        //             vm.isWrited = true;
        //         }
        //     });
            
        //     vm.orgsReadable.forEach(element2 => {
        //         if(element2.id == orgId) {
        //             vm.isReaded = true;
        //         }
        //     });

        //     if(!vm.isReaded && !vm.isWrited) {
        //         $state.go('application.prev_dashboard');
        //     }
        // }

        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            // if (newVal == true) {
                // if(!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                //     if (!$scope.isPeRole) {
                //         $state.go('application.prev_dashboard');
                //     }
                // }
                // vm.orgsWritable = $scope.assignedOrgs.writable;
                // if (vm.orgsWritable && vm.orgsWritable.length == 1 && !vm.entry.id) {
                //     vm.currentOrg = vm.orgsWritable[0];
                //     vm.entry.c1Org=vm.orgsWritable[0];
                // }
                vm.getEntry();
            // }
        });

        $scope.$watch('vm.entry.c1Org', function (newVal, oldVal) {
            vm.getListStaff();
        });

        // $scope.$watch('vm.entry.c5Province', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.reDistricts = [];
        //         let adminUnitFilter={};
        //         adminUnitFilter.excludeVoided=true;
        //         adminUnitFilter.parentId=newVal.id;

        //         if(vm.checkDouble==true){
        //             vm.entry.c23CurrentAddressProvince=newVal;
        //             vm.entry.c23CurrentAddressDistrict=vm.entry.c23ResidentAddressDistrict;
        //             vm.entry.c23CurrentAddressWard=vm.entry.c23ResidentAddressWard;
        //             vm.entry.c23CurrentAddressDetail=vm.entry.c23ResidentAddressDetail;
        //         }

        //         blockUI.start();
        //         service.getAdminUnit(adminUnitFilter, function success() {
        //         }, function failure() {
        //             blockUI.stop();
        //         }).then(function (data) {
        //             blockUI.stop();
        //             vm.reDistricts = data;
        //         });
        //     }
        // });

        $scope.$watch('vm.entry.c5Province', function (newVal, oldVal) {
            vm.reDistricts = [];
            if (vm.entry.c5Province && vm.entry.c5Province.id) {
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=vm.entry.c5Province.id;

                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    if (data) {
                        vm.reDistricts = data;
                    } else {
                        vm.reDistricts = [];
                    }
                    // Set selected district
                    if (vm.entry.c5District && vm.entry.c5District.id) {
                        if (utils.indexOf(vm.entry.c5District, vm.reDistricts) < 0) {
                            vm.entry.c5District = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.entry.c4', function (newVal, oldVal) {
            if (newVal) {
                vm.calculateAge = (new Date()).getFullYear() - vm.entry.c4;
            }
        });
        

        //Onchange Region
        vm.changeOrg = function(){

        };
        //Get Data Region
        vm.c6CheckChange = function(e,index){
            let isCheckC6=false;
            for(let i=0;i<6;i++){
                if(vm.c6Values[i].isCheck==true){
                    isCheckC6=true;
                }
            }
            if(isCheckC6){
                vm.alertC6=false;
            }
        };
        vm.getAllProvinces = function(){
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
        };
        vm.getAllProvinces();
        vm.getListStaff = function () {
            blockUI.start();
            let orgFilter={organization: vm.entry.c1Org};

            service.getListStaff(orgFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                //console.log("c3",data);
                vm.staffs = data.content;
                blockUI.stop();
            });
        };
        vm.checkDouble=false;
        vm.getEntry = function () {
            // block the view with a loading indicator
            vm.id = $stateParams.id;
            vm.peId = $stateParams.peId;
            if(vm.id){
                blockUI.start();
                service.getEntry(vm.id, function success() {
                }, function failure() {
                  blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    // vm.checkReadOrWriteOrNull(data.c1Org.id);
                    vm.entry=data;
                    if(!vm.entry.readAble && !vm.entry.writAble) {
                        toastr.warning("Bạn không có quyền đọc hoặc sửa bản ghi","Thông báo");
                        $state.go('application.peer_outreach');
                    }
                    vm.entry.c11Date = new Date(vm.entry.c11Date);
                    let c1ConvertToDate = new Date(vm.entry.c1);
                    vm.convertC1 = c1ConvertToDate;
                    if(vm.entry.c1) {
                        vm.entry.c1 = c1ConvertToDate.getMonth()+1 + "/" + c1ConvertToDate.getFullYear();
                    }
                    vm.name=vm.entry.c2;
                    let isSiteManager = $scope.isSiteManager($scope.currentUser);
                    vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
                    vm.bsTableControl.options.data = vm.entry.childs;

                    //vm.c4Date.datePostSetup(vm.c4Date.fpItem);
                    if(vm.entry.c6 && vm.entry.c6.length>0){
                        for(let j=0;j<vm.entry.c6.length;j++){
                            for(let i=0;i<6;i++){
                                if(vm.c6Values[i].val==vm.entry.c6[j].val){
                                    vm.c6Values[i].isCheck=true;
                                    vm.c6Values[i].id=vm.entry.c6[j].id;
                                }
                            }
                        }
                    }
                    vm.getListPeWriteAble(vm.entry.readAble);
                });
            }
            else if(vm.peId){
                blockUI.start();
                service.getEntry(vm.peId, function success() {
                }, function failure() {
                  blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    console.log(data);
                    vm.entry.parent=data;
                    vm.entry.editAble = true;
                    vm.convertC1=new Date(vm.entry.parent.c1);
                    vm.name=vm.entry.parent.c2;
                    vm.getListPeWriteAblePeId(vm.entry.parent.readAble);
                });
            } else {
                vm.entry.writAble = true;
                vm.entry.editAble = true;
                vm.getListPeWriteAble();
            }
        };

        vm.getListPeWriteAble = function (isReadable) {
            blockUI.start();
            service.getListPeWriteAble(function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                let id = $stateParams.id;
                if(data && data.length > 0) {
                    vm.orgsWritable = data;
                    if(!id){
                        vm.entry.c1Org=vm.orgsWritable[0];
                    }
                } else {
                    if(!isReadable && !id) {
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Thông báo");
                        $state.go('application.peer_outreach');
                    }
                }
            });
        }
        
        vm.getListPeWriteAblePeId = function (isReadable) {
            blockUI.start();
            service.getListPeWriteAble(function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                let peId = $stateParams.peId;
                if(data && data.length > 0) {
                    vm.orgsWritable = data;
                    if(!peId){
                        vm.entry.c1Org=vm.orgsWritable[0];
                    }
                } else {
                    if(!isReadable && !peId) {
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Thông báo");
                        $state.go('application.peer_outreach');
                    }
                }
            });
        }

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
//                    vm.getEntries();
                }, 300);
            }
        });
        vm.cancel = function(){
            $state.go('application.peer_outreach');
        };
        // Grid definition
        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
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

                    // Reloading entries upon page change
                    vm.getEntries();
                }
            }
        };


        $scope.viewEntry = function(id) {
            blockUI.start();

            service.getEntry(id).then(function (data) {

                blockUI.stop();

                // Only continue when we can get the entry with a given ID
                if (!data || !data.id) {
                    return;
                }

                vm.entry = data;
                vm.entry.content =  $sce.trustAsHtml(vm.entry.content);

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'view_entry_modal.html',
                    scope: $scope,
                    size: 'md'
                });

                // When modal dialog is closed
                vm.modalInstance.closed.then(function () {
                    vm.entry = {};
                });
            });
        };

        /**
         * Create a new entry
         */
        vm.newEntry = function () {

            vm.entry.isNew = true; // to inform the view
            vm.entry.status = 0; // default to DRAFTING

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            // When modal dialog is closed
            vm.modalInstance.closed.then(function () {
                vm.entry = {};
            });
        };

        /**
         * Edit an entry
         * @param id
         */
        $scope.editEntry = function (id) {

            blockUI.start();

            service.getEntry(id).then(function (data) {

                blockUI.stop();

                // Only continue when we can get the entry with a given ID
                if (!data || !data.id) {
                    return;
                }

                vm.entry = data;
                vm.entry.isNew = false;       // to inform the view

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_entry_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                // When modal dialog is closed
                vm.modalInstance.closed.then(function () {
                    vm.entry = {};
                });
            });
        };
        vm.c3Change=function(){
            vm.alertC3=false;
            if(vm.entry.c3=='FEMALE'){
                vm.c6Values[1].isCheck=false;
            }
        }
        // vm.setNullIsHidenC10= function(){
        //     if(vm.entry.c10){
        //         vm.entry.c10Note=null;
        //     }
        // }

        vm.addContact = function(){
            $state.go('application.pe_add_contact',{peId:vm.entry.id});
        }
        
        vm.addPE = function(){
            $state.go('application.pe_add');
            vm.modalInstance.close();
            window.scrollTo(0, 0);
            let c1OrgTemp = vm.entry.c1Org;
            let c1StaffTemp = vm.entry.c1Staff;
            vm.entry = {};
            vm.entry.writAble = true;
            vm.entry.editAble = true;
            vm.entry.c1Org = c1OrgTemp;
            vm.entry.c1Staff = c1StaffTemp;
            for(let i=0;i<6;i++){
                vm.c6Values[i].isCheck=false;
            }
        }

        vm.setNullIsHiden= function(){
            if(!vm.entry.c7 || vm.entry.c7=="answer5"){
                vm.entry.c8=null;
                vm.entry.c8ARV=null;
                vm.entry.c9=null;
                vm.entry.c9Date=null;
                vm.entry.c10=null;
                vm.entry.c11=null;
                vm.entry.c11Date=null;
                vm.entry.c12=null;
                vm.entry.c12Code=null;
                vm.entry.c12Note=null;
                vm.entry.c13=null;
                vm.entry.c131=null;
                vm.entry.c131Code=null;
                vm.entry.c131Result=null;
                vm.entry.c132=null;
                vm.entry.c14=null;
                vm.entry.c14Date=null;
                vm.entry.c14Code=null;
                vm.entry.c14Name=null;
                vm.entry.c15=null;
                vm.entry.c15Date=null;
                vm.entry.c15Code=null;
                vm.entry.c15Name=null;
                vm.entry.c16=null;
            }else{
                if(!vm.entry.c8){
                    vm.entry.c8ARV=null;
                    vm.entry.c9=null;
                    vm.entry.c9Date=null;
                    vm.entry.c10=null;
                    vm.entry.c11=null;
                    vm.entry.c11Date=null;
                    vm.entry.c12=null;
                    vm.entry.c12Code=null;
                    vm.entry.c12Note=null;
                    vm.entry.c13=null;
                    vm.entry.c131=null;
                    vm.entry.c131Code=null;
                    vm.entry.c131Result=null;
                    vm.entry.c132=null;
                    vm.entry.c14=null;
                    vm.entry.c14Date=null;
                    vm.entry.c14Code=null;
                    vm.entry.c14Name=null;
                    vm.entry.c15=null;
                    vm.entry.c15Date=null;
                    vm.entry.c15Code=null;
                    vm.entry.c15Name=null;
                    vm.entry.c16=null;
                }else{
                    if(vm.entry.c8=="answer1"){
                         vm.entry.c11=null;
                        vm.entry.c11Date=null;
                        vm.entry.c12=null;
                        vm.entry.c12Code=null;
                    vm.entry.c12Note=null;
                    vm.entry.c13=null;
                    vm.entry.c131=null;
                    vm.entry.c131Code=null;
                    vm.entry.c131Result=null;
                    vm.entry.c132=null;
                    vm.entry.c14=null;
                    vm.entry.c14Date=null;
                    vm.entry.c14Code=null;
                    vm.entry.c14Name=null;
                    
                        if(!vm.entry.c9){
                            vm.entry.c9Date=null;
                            vm.entry.c10=null;
                        }else{
                            vm.alertC9=false;
                            if(vm.entry.c9!="YES"){
                                vm.entry.c9Date=null;
                                vm.entry.c10=null;
                            }else{
                                if(vm.entry.c10){
                                    vm.alertC10=false;
                                }
                            }
                        }
                        if(vm.entry.c8ARV=="answer1"){
                            vm.entry.c15=null;
                            vm.entry.c15Date=null;
                            vm.entry.c15Code=null;
                            vm.entry.c15Name=null;
                            vm.entry.c16=null;
                        }else{
                            if(!vm.entry.c15){
                                vm.entry.c15Date=null;
                                vm.entry.c15Code=null;
                                vm.entry.c15Name=null;
                            }else{
                                vm.alertC15=false;
                                if(vm.entry.c15!="YES"){
                                    vm.entry.c15Date=null;
                                    vm.entry.c15Code=null;
                                    vm.entry.c15Name=null;
                                }
                            }
                            if(vm.entry.c16){
                                vm.alertC16=false;
                            }
                        }

                    }else{
                        vm.entry.c8ARV=null;
                        vm.entry.c9=null;
                        vm.entry.c9Date=null;
                        vm.entry.c10=null;
                        if(!vm.entry.c11 || vm.entry.c11=="NO"){
                            vm.entry.c11Date=null;
                            vm.entry.c12=null;
                            vm.entry.c12Code=null;
                            vm.entry.c12Note=null;
                            vm.entry.c13=null;
                            vm.entry.c131=null;
                            vm.entry.c131Code=null;
                            vm.entry.c131Result=null;
                            vm.entry.c132=null;
                            vm.entry.c14=null;
                            vm.entry.c14Date=null;
                            vm.entry.c14Code=null;
                            vm.entry.c14Name=null;
                            vm.entry.c15=null;
                            vm.entry.c15Date=null;
                            vm.entry.c15Code=null;
                            vm.entry.c15Name=null;
                            vm.entry.c16=null;
                            if(vm.entry.c11=="NO"){
                                vm.alertC11=false;
                            }
                        }else{
                            if(!vm.entry.c12){
                                vm.entry.c12Code=null;
                                vm.entry.c12Note=null;
                            }else{
                                if(vm.entry.c12=="answer3"){
                                    vm.entry.c12Code=null;
                                    if(vm.entry.c12Note){
                                        vm.alertC121=false;
                                    }
                                }
                                if(vm.entry.c12=="answer2"){
                                    vm.entry.c12Code=null;
                                    vm.entry.c12Note=null;
                                }
                                if(vm.entry.c12=="answer1" || vm.entry.c12=="answer4"){
                                    vm.entry.c12Note=null;
                                }
                            }
                            vm.alertC11=false;
                            if(!vm.entry.c13 || vm.entry.c13=="answer3" || vm.entry.c13=="answer4"){
                                vm.entry.c131=null;
                                vm.entry.c131Code=null;
                                vm.entry.c131Result=null;
                            
                                vm.entry.c14=null;
                                vm.entry.c14Date=null;
                                vm.entry.c14Code=null;
                                vm.entry.c14Name=null;
                                vm.entry.c15=null;
                                vm.entry.c15Date=null;
                                vm.entry.c15Code=null;
                                vm.entry.c15Name=null;
                                vm.entry.c16=null;
                            }else{
                                if(vm.entry.c13=="answer1"){
                                    
                                    if(!vm.entry.c131 || vm.entry.c131=="NO"){
                                        vm.entry.c131Code=null;
                                        vm.entry.c131Result=null;
                                        vm.entry.c14=null;
                                        vm.entry.c14Date=null;
                                        vm.entry.c14Code=null;
                                        vm.entry.c14Name=null;
                                        vm.entry.c15=null;
                                        vm.entry.c15Date=null;
                                        vm.entry.c15Code=null;
                                        vm.entry.c15Name=null;
                                        vm.entry.c16=null;
                                        if(vm.entry.c131=="NO"){
                                            vm.alertC131=false;
                                        }
                                    }else{
                                        vm.alertC131=false;
                                        if(!vm.entry.c131Result || vm.entry.c131Result =="answer3" || vm.entry.c131Result =="answer4"){
                                            vm.entry.c14=null;
                                            vm.entry.c14Date=null;
                                            vm.entry.c14Code=null;
                                            vm.entry.c14Name=null;
                                            vm.entry.c15=null;
                                            vm.entry.c15Date=null;
                                            vm.entry.c15Code=null;
                                            vm.entry.c15Name=null;
                                            vm.entry.c16=null;
                                        }else{
                                            if(vm.entry.c131Result =="answer1"){
                                                vm.entry.c15=null;
                                                vm.entry.c15Date=null;
                                                vm.entry.c15Code=null;
                                                vm.entry.c15Name=null;
                                                vm.entry.c16=null;
                                                if(!vm.entry.c14){
                                                    vm.entry.c14Date=null;
                                                    vm.entry.c14Code=null;
                                                    vm.entry.c14Name=null;
                                                }else{
                                                    vm.alertC14=false;
                                                    if(vm.entry.c14!="YES"){
                                                        vm.entry.c14Date=null;
                                                        vm.entry.c14Code=null;
                                                        vm.entry.c14Name=null;
                                                    }
                                                }
                                            }
                                            if(vm.entry.c131Result =="answer2"){
                                                vm.entry.c14=null;
                                                vm.entry.c14Date=null;
                                                vm.entry.c14Code=null;
                                                vm.entry.c14Name=null;
                                                if(!vm.entry.c15){
                                                    vm.entry.c15Date=null;
                                                    vm.entry.c15Code=null;
                                                    vm.entry.c15Name=null;
                                                }else{
                                                    vm.alertC15=false;
                                                    if(vm.entry.c15!="YES"){
                                                        vm.entry.c15Date=null;
                                                        vm.entry.c15Code=null;
                                                        vm.entry.c15Name=null;
                                                    }
                                                }
                                                if(vm.entry.c16){
                                                    vm.alertC16=false;
                                                }
                                            }
                                        }
                                    }
                                }
                                if(vm.entry.c13=="answer2"){
                                    vm.entry.c131=null;
                                    vm.entry.c131Code=null;
                                    vm.entry.c131Result=null;
                                    vm.entry.c15=null;
                                    vm.entry.c15Date=null;
                                    vm.entry.c15Code=null;
                                    vm.entry.c15Name=null;
                                    if(!vm.entry.c14){
                                        vm.entry.c14Date=null;
                                        vm.entry.c14Code=null;
                                        vm.entry.c14Name=null;
                                    }else{
                                        vm.alertC14=false;
                                        if(vm.entry.c14!="YES"){
                                            vm.entry.c14Date=null;
                                            vm.entry.c14Code=null;
                                            vm.entry.c14Name=null;
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

        vm.validate=function() {
            // if(vm.entry.id || (vm.entry.parent && vm.entry.parent.id)) {
            //     console.log("vanduc");
            //     console.log(vm.convertC1);
            //     let c1Convert = vm.convertC1.getMonth()+1;
            //     let calculateQuarter = null;
            //     if(c1Convert>0 && c1Convert<4) {
            //         calculateQuarter = 1;
            //     } else if(c1Convert>3 && c1Convert<7) {
            //         calculateQuarter = 2;
            //     } else if(c1Convert>6 && c1Convert<10) {
            //         calculateQuarter = 3;
            //     } else if(c1Convert>9 && c1Convert<13) {
            //         calculateQuarter = 4;
            //     }
            //     let changeByQuarter = new Date(vm.convertC1.getFullYear(), vm.convertC1.getMonth(), vm.convertC1.getDate());
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
            // }
            
            if(!vm.entry.c1){
                toastr.warning("Vui lòng chọn kỳ báo cáo","Thông báo");
                openSelectBox("vm.entry.c1");
                return;
            }
            if(!vm.entry.c1Org){
                toastr.warning("Vui lòng chọn cơ sở báo cáo","Thông báo");
                openSelectBox("vm.entry.c1Org");
                return;
            }
            if(!vm.entry.c1Staff){
                toastr.warning("Vui lòng chọn họ tên người báo cáo","Thông báo");
                openSelectBox("vm.entry.c1Staff");
                return;
            }
            if(!vm.entry.c2){
                toastr.warning("Vui lòng nhập họ tên người được tiếp cận","Thông báo");
                focus("vm.entry.c2");
                return;
            }
            if(!vm.entry.c3){
                toastr.warning("Vui lòng chọn giới tính khi sinh ở mục C3","Thông báo");
                vm.alertC3=true;
                return;
            }
            if(!vm.entry.c4){
                toastr.warning("Vui lòng chọn năm sinh","Thông báo");
                openSelectBox("vm.entry.c4");
                return;
            }
            if(!vm.entry.c5Province){
                toastr.warning("Vui lòng chọn Tỉnh/Thành phố","Thông báo");
                openSelectBox("vm.entry.c5Province");
                return;
            }
            if(!vm.entry.c5District){
                toastr.warning("Vui lòng chọn Quận/Huyện","Thông báo");
                openSelectBox("vm.entry.c5District");
                return;
            }
            let isCheckC6=false;
            for(let i=0;i<6;i++){
                if(vm.c6Values[i].isCheck==true){
                    isCheckC6=true;
                }
            }
            if(!isCheckC6){
                toastr.warning("Vui lòng chọn 1 trong các nhóm nguy cơ của khách hàng","Thông báo");
                vm.alertC6=true;
                return;
            }
            if(!vm.entry.c7){
                toastr.warning("Vui lòng chọn cách thức tiếp cận","Thông báo");
                openSelectBox("vm.entry.c7");
                return;
            }else{
                if(vm.entry.c7!='answer5'){
                    if(!vm.entry.c8){
                        toastr.warning("Vui lòng chọn tình trạng tiếp cận","Thông báo");
                        openSelectBox("vm.entry.c8");
                        return;
                    }else{
                        if(vm.entry.c8=='answer1'){
                            if(!vm.entry.c8ARV){
                                toastr.warning("Vui lòng chọn tình trạng điều trị ARV khi tiếp cận","Thông báo");
                                openSelectBox("vm.entry.c8ARV");
                                return;
                            }
                            if(!vm.entry.c9){
                                toastr.warning("Vui lòng chọn khách hàng được tư vấn dịch vụ TBXNBT/BC","Thông báo");
                                vm.alertC9=true;
                                return;
                            }else{
                                if(vm.entry.c9=="YES"){
                                    if(!vm.entry.c9Date){
                                        toastr.warning("Vui lòng chọn ngày tư vấn","Thông báo");
                                        focusFlatPick('vm.entry.c9Date');
                                        return;
                                    }
                                    if(!vm.entry.c10){
                                        toastr.warning("Vui lòng chọn khách hàng đồng ý cung cấp tên BT/BC","Thông báo");
                                        vm.alertC10=true;
                                        return;
                                    }
                                }
                            }
                            if(vm.entry.c8ARV!="answer1"){
                                if(!vm.entry.c15){
                                    toastr.warning("Vui lòng chọn khách hàng sử dụng dịch vụ điều trị ARV","Thông báo");
                                    vm.alertC15=true;
                                    return;
                                }else{
                                    if(vm.entry.c15=="YES"){
                                        if(!vm.entry.c15Date){
                                            toastr.warning("Vui lòng chọn ngày nhận dịch vụ","Thông báo");
                                            focusFlatPick('vm.entry.c15Date');
                                            return;
                                        }
                                        if(!vm.entry.c15Code){
                                            toastr.warning("Vui lòng nhập mã số điều trị","Thông báo");
                                            focus("vm.entry.c15Code");
                                            return;
                                        }
                                        if(!vm.entry.c15Name){
                                            toastr.warning("Vui lòng nhập tên cơ sở điều trị","Thông báo");
                                            focus("vm.entry.c15Name");
                                            return;
                                        }
                                    }
                                }
                                if(!vm.entry.c16){
                                    toastr.warning("Vui lòng chọn kết quả xác minh ca HIV dương tính?","Thông báo");
                                    vm.alertC16=true;
                                    return;
                                }
                            }

                        }else{
                            if(!vm.entry.c11){
                                toastr.warning("Vui lòng chọn khách hàng có xét nghiệm HIV lần này:?","Thông báo");
                                vm.alertC11=true;
                                return;
                            }else{
                                if(vm.entry.c11=="YES"){
                                    if(!vm.entry.c11Date){
                                        toastr.warning("Vui lòng chọn ngày xét nghiệm","Thông báo");
                                        focusFlatPick('vm.entry.c11Date');
                                        return;
                                    }
                                    if(!vm.entry.c12){
                                        toastr.warning("Vui lòng chọn tình trạng điều trị ARV khi tiếp cận","Thông báo");
                                        openSelectBox("vm.entry.c12");
                                        return;
                                    }else{
                                        if(vm.entry.c12=='answer1' || vm.entry.c12=='answer4'){
                                            if(!vm.entry.c12Code){
                                                toastr.warning("Vui lòng nhập mã số XN tại cộng đồng/CSYT","Thông báo");
                                                focus("vm.entry.c12Code");
                                                return;
                                            }
                                            
                                        }
                                        if(vm.entry.c12=='answer3'){
                                            if(!vm.entry.c12Note){
                                                toastr.warning("Vui lòng chọn tự XN HIV không có hỗ trợ cho?","Thông báo");
                                                vm.alertC121=true;
                                                return;
                                            }
                                            
                                        }
                                    }
                                    if(!vm.entry.c13){
                                        toastr.warning("Vui lòng chọn Kết quả XN HIV lần này?","Thông báo");
                                        openSelectBox("vm.entry.c13");
                                        return;
                                    }else{
                                        if(vm.entry.c13=='answer1'){
                                            if(!vm.entry.c131){
                                                toastr.warning("Vui lòng chọn chuyển đi XN khẳng định HIV:?","Thông báo");
                                                vm.alertC131=true;
                                                return;
                                            }else{
                                                if(vm.entry.c131=="YES"){
                                                    if(!vm.entry.c131Code){
                                                        toastr.warning("Vui lòng nhập mã số xét nghiệm khẳng định","Thông báo");
                                                        focus("vm.entry.c131Code");
                                                        return;
                                                    }
                                                    if(!vm.entry.c131Result){
                                                        toastr.warning("Vui lòng chọn kết quả XN khẳng định HIV?","Thông báo");
                                                        openSelectBox("vm.entry.c131Result");
                                                        return;
                                                    }else{
                                                        if(vm.entry.c131Result == "answer2"){
                                                            if(!vm.entry.c15){
                                                                toastr.warning("Vui lòng chọn khách hàng sử dụng dịch vụ điều trị ARV","Thông báo");
                                                                vm.alertC15=true;
                                                                return;
                                                            }else{
                                                                if(vm.entry.c15=="YES"){
                                                                    if(!vm.entry.c15Date){
                                                                        toastr.warning("Vui lòng chọn ngày nhận dịch vụ","Thông báo");
                                                                        focusFlatPick('vm.entry.c15Date');
                                                                        return;
                                                                    }
                                                                    if(!vm.entry.c15Code){
                                                                        toastr.warning("Vui lòng nhập mã số điều trị","Thông báo");
                                                                        focus("vm.entry.c15Code");
                                                                        return;
                                                                    }
                                                                    if(!vm.entry.c15Name){
                                                                        toastr.warning("Vui lòng nhập tên cơ sở điều trị","Thông báo");
                                                                        focus("vm.entry.c15Name");
                                                                        return;
                                                                    }
                                                                }
                                                            }
                                                            if(!vm.entry.c16){
                                                                toastr.warning("Vui lòng chọn kết quả xác minh ca HIV dương tính?","Thông báo");
                                                                vm.alertC16=true;
                                                                return;
                                                            }
                                                        }else{
                                                            if(vm.entry.c131Result == "answer1"){
                                                                if(!vm.entry.c14){
                                                                    toastr.warning("Vui lòng chọn Khách hàng sử dụng dịch vụ điều trị PrEP?","Thông báo");
                                                                    vm.alertC14=true;
                                                                    return;
                                                                }else{
                                                                    if(vm.entry.c14=="YES"){
                                                                        if(!vm.entry.c14Date){
                                                                            toastr.warning("Vui lòng chọn ngày nhận dịch vụ","Thông báo");
                                                                            focusFlatPick('vm.entry.c14Date');
                                                                            return;
                                                                        }
                                                                        if(!vm.entry.c14Code){
                                                                            toastr.warning("Vui lòng nhập mã số điều trị","Thông báo");
                                                                            focus("vm.entry.c14Code");
                                                                            return;
                                                                        }
                                                                        if(!vm.entry.c14Name){
                                                                            toastr.warning("Vui lòng nhập tên cơ sở điều trị","Thông báo");
                                                                            focus("vm.entry.c14Name");
                                                                            return;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            
                                        }
                                        if(vm.entry.c13=='answer2'){
                                            if(!vm.entry.c14){
                                                toastr.warning("Vui lòng chọn Khách hàng sử dụng dịch vụ điều trị PrEP?","Thông báo");
                                                vm.alertC14=true;
                                                return;
                                            }else{
                                                if(vm.entry.c14=="YES"){
                                                    if(!vm.entry.c14Date){
                                                        toastr.warning("Vui lòng chọn ngày nhận dịch vụ","Thông báo");
                                                        focusFlatPick('vm.entry.c14Date');
                                                        return;
                                                    }
                                                    if(!vm.entry.c14Code){
                                                        toastr.warning("Vui lòng nhập mã số điều trị","Thông báo");
                                                        focus("vm.entry.c14Code");
                                                        return;
                                                    }
                                                    if(!vm.entry.c14Name){
                                                        toastr.warning("Vui lòng nhập tên cơ sở điều trị","Thông báo");
                                                        focus("vm.entry.c14Name");
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if(!vm.entry.c132){
                                        toastr.warning("Vui lòng chọn KQXN sàng lọc Giang mai?","Thông báo");
                                        openSelectBox("vm.entry.c132");
                                        return;
                                    }

                                }
                            }
                        }
                    }
                }
                if(vm.entry.c1) {
                    let newDataOfC1 = (vm.entry.c1).split("/");
                    if(newDataOfC1[0] > 12 || (newDataOfC1.length == 0 || !newDataOfC1)) {
                        toastr.warning("Kỳ báo cáo không hợp lệ","Thông báo");
                        openSelectBox("vm.entry.c1");
                        return;
                    }
                    let d1 = new Date(newDataOfC1[1], newDataOfC1[0], 0);
                    if(!d1 || d1 == "Invalid Date") {
                        toastr.warning("Kỳ báo cáo không hợp lệ","Thông báo");
                        openSelectBox("vm.entry.c1");
                        return;
                    }

                    let currentDate = new Date();
                    currentDate.setDate(d1.getDate());
                    currentDate.setHours(0, 0, 0);

                    if(d1 > currentDate) {
                        toastr.warning("Kỳ báo cáo không được lớn hơn ngày hiện tại","Thông báo");
                        openSelectBox("vm.entry.c1");
                        return;
                    }
                    vm.entry.c1 = d1;
                }
            }

            if(vm.entry.c11Date && vm.entry.c14Date) {
                if(vm.entry.c14Date < vm.entry.c11Date) {
                    toastr.warning("Ngày nhận dịch vụ PrEP không được nhỏ hơn ngày xét nghiệm HIV","Thông báo");
                    openSelectBox("vm.entry.c14Date");
                    // focusFlatPick('vm.entry.c14Date');
                    return;
                }
            }

            if(vm.entry.c11Date && vm.entry.c15Date) {
                if(vm.entry.c15Date < vm.entry.c11Date) {
                    toastr.warning("Ngày nhận dịch vụ ARV không được nhỏ hơn ngày xét nghiệm HIV","Thông báo");
                    openSelectBox("vm.entry.c15Date");
                    return;
                }
            }

            return true;
        }

        /**
         * Save a new/existing entry
         */
        vm.saveEntry = function () {
            if(vm.validate()) {
                //vm.c4Date.datePostSetup(vm.c4Date.fpItem);
                blockUI.start();
                //console.log(vm.entry);
                vm.entry.c6=[];
                for(let i=0;i<6;i++){
                    
                    if(i==1 && vm.entry.c3=='FEMALE'){
                        vm.c6Values[i].isCheck=false;
                    }
                    if(vm.c6Values[i].isCheck==true){
                        vm.entry.c6.push(vm.c6Values[i]);
                    }
                }
                //console.log("c9",vm.entry.c9);
                service.saveEntry(vm.entry, function success() {
                    blockUI.stop();
                    toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                    
                }, function failure() {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi lưu.', 'Thông báo');
                }).then(function (data) {
                    blockUI.stop();
                    if(data){
                        if(!data.id && !data.editAble && vm.id){
                            toastr.warning('Bản ghi đã quá thời gian để sửa', 'Thông báo');
                        }else{
                            vm.entry = data;
                            toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                            $state.go('application.hts');
                            if(!vm.id && !vm.peId) {
                                vm.modalInstance = modal.open({
                                    animation: true,
                                    templateUrl: '_alert_add_contact_modal.html',
                                    scope: $scope,
                                    size: 'lg',
                                });
                            }
                            // if(vm.peId) {
                            //     $state.go('application.pe_edit',{id:vm.entry.parent.id});
                            // }
                            else if(vm.entry.parent && vm.entry.parent.id){
                                $state.go('application.pe_edit',{id:vm.entry.parent.id});
                            }
                            else {
                                $state.go('application.peer_outreach');
                            }
                        }
                    }
                    
                });
            }            
        };

        /**
         * Delete selected entries
         */
        vm.deleteEntries = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteEntries(vm.selectedEntries, function success() {

                        // Refresh the grid
                        vm.getEntries();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedEntries.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedEntries = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá các bản ghi đã chọn.', 'Thông báo');
                    });
                }
            });
        };

        /**
        DateTime Region
        **/

        vm.quickMonthSelection = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'select_month_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                if (vm.entry.c1) {
                    vm.tmpSelection = vm.entry.c1;
                }
            });

            vm.modalInstance.closed.then(function () {
                vm.tmpSelection = null;
            });
        };

        /**
         * Get date range for calendar
         *
         * @param step
         */
         vm.getCalendarData = function (step) {
            if (!vm.currentDay) {
                vm.currentDay = moment();
            }

            vm.currentDay.add(step, 'month');
            vm.eventFilter.fromDate = vm.currentDay.startOf('month').toDate();
            vm.eventFilter.toDate = vm.currentDay.endOf('month').toDate();

            if (!vm.eventFilter.organization && !vm.eventFilter.organization.id) {
                vm.eventFilter.organization = (vm.orgsWritable && vm.orgsWritable.length > 0) ? vm.orgsWritable[0] : {id: 0};
            }

            // Get calendar items
            vm.getCalendarEvents();
        };
        
        // For month selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: {
                inline: true,
                altFormat: 'm/Y',
                altInput: true,
                placeholder: 'Chọn ngày..',
                plugins: [new scrollPlugin({}), new monthSelectPlugin({
                    shorthand: true, //defaults to false
                    dateFormat: 'm/Y', //defaults to "F Y"
                    altFormat: 'm/Y', //defaults to "F Y"
                })],
                maxDate: new Date(),
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                enable: [],
                disable: [
                    function(date) {
                        return (date > new Date());
                    }
                ],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    // const m = moment(d, 'm/Y');
                    vm.tmpSelection = m.add(7, 'hours').toDate();
                }]
            },
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.c1) {
                    fpItem.setDate(moment(vm.entry.c1).add(7, 'hours').toDate());
                }
            },
            selectMonth: function () {
                if (vm.tmpSelection && vm.tmpSelection!="Invalid Date") {
                    let checkTmpSelection = new Date(vm.tmpSelection);
                    if(checkTmpSelection && checkTmpSelection!="Invalid Date") {
                        vm.entry.c1 = checkTmpSelection.getMonth() + 1 + "/" + checkTmpSelection.getFullYear();
                    } else {
                        vm.entry.c1 = vm.tmpSelection;
                    }
                    
                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }
                    
                    // if (vm.currentDay && vm.currentDay.diff(vm.appointmentMonth, 'months', true)) {
                    //     $timeout(function () {
                    //         vm.currentDay = moment(vm.appointmentMonth);
                    //         vm.fcControl.invokeAPI('gotoDate', vm.appointmentMonth);

                    //         vm.getCalendarData(0);
                    //     }, 0);
                    // }

                } else {
                    toastr.warning('Vui lòng chọn ngày báo cáo.', 'Thông báo');
                }
            },
            clear: function () {
                if (vm.entry.c1 || (vm.datepicker1.fpItem)) {
                    // vm.datepicker1.fpItem.clear();
                    vm.entry.c1 = null;
                }
            }
        };

        // vm.c4Date = {
        //     fpItem: null,
        //     dateOpts: {
        //         altFormat: 'd/m/Y',
        //         altInput: true,
        //         dateFormat: 'Y-m-dTH:i:S',
        //         enableTime: false,
        //         placeholder: 'Chọn ngày..',
        //         plugins: [new scrollPlugin({})],
        //         weekNumbers: true,
        //         shorthandCurrentMonth: false,
        //         locale: 'vn',
        //         position: 'auto',
        //         allowInput: true,
        //         disable: [
        //              function(date) {
        //                  // return true to disable
        //                  return (date > new Date());

        //              }
        //          ],
        //         onChange: [function() {
        //             angular.element(document.querySelector('#fixed_element')).focus();
        //             const d = this.selectedDates[0];
        //             if (d && _.isDate(d)) {
        //                 const m = moment(d, 'YYYY-MM-DD');
        //                 vm.entry.c4 = m.add(7, 'hours').toDate();
        //             }
        //             if(moment(vm.entry.c4).year()<vm.entry.c8){
        //                 toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
        //                 focusFlatPick('vm.entry.c4');
        //             }
        //         }],
        //     },
        //     datePostSetup: function(fpItem) {
        //         vm.c4Date.fpItem = fpItem;
        //         if (vm.entry.c4 && fpItem) {
        //             fpItem.setDate(moment(vm.entry.c4).toDate());
        //         }
        //     },
        //     clear: function() {
        //         if (vm.c4Date.fpItem) {
        //             vm.c4Date.fpItem.clear();
        //             vm.entry.c4 = null;
        //         }
        //     }
        // };

        vm.bsTableControl = {
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
        
        vm.c9Date = {
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
                    },
                    function(date) {
                        // return true to disable
                        if(vm.entry.c1) {
                            var newData = (vm.entry.c1).split("/");
                            var d1 = new Date(newData[1], newData[0]-1, 0);
                            return (date <= d1);
                        }
                    }
                 ],
                onChange: [function() {
                    angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.c9Date = m.add(7, 'hours').toDate();
                    }
                    // if(moment(vm.entry.c4).year()<vm.entry.c8){
                    //     toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
                    //     focusFlatPick('vm.entry.c4');
                    // }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c9Date.fpItem = fpItem;
                if (vm.entry.c9Date && fpItem) {
                    fpItem.setDate(moment(vm.entry.c9Date).toDate());
                }
            },
            clear: function() {
                if (vm.c9Date.fpItem) {
                    vm.c9Date.fpItem.clear();
                    vm.entry.c9Date = null;
                }
            }
        };
        
        vm.c14Date = {
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
                        angular.element(document.querySelector('#fixed_element')).focus();
                        const d = this.selectedDates[0];
                        if (d && _.isDate(d)) {
                            const m = moment(d, 'YYYY-MM-DD');
                            vm.entry.c14Date = m.add(7, 'hours').toDate();
                            if(vm.entry.c11Date && vm.entry.c14Date) {
                                if(vm.entry.c14Date < vm.entry.c11Date) {
                                    toastr.warning("Ngày nhận dịch vụ PrEP không được nhỏ hơn ngày xét nghiệm HIV","Thông báo");
                                    openSelectBox("vm.entry.c14Date");
                                    return;
                                }
                            }
                        }
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.c14Date.fpItem = fpItem;
                    if (vm.entry.c14Date && fpItem) {
                        fpItem.setDate(moment(vm.entry.c14Date).toDate());
                    }
                },
                clear: function() {
                    if (vm.c14Date.fpItem) {
                        vm.c14Date.fpItem.clear();
                        vm.entry.c14Date = null;
                    }
                }
         };

        vm.c15Date = {
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
                        angular.element(document.querySelector('#fixed_element')).focus();
                        const d = this.selectedDates[0];
                        if (d && _.isDate(d)) {
                           const m = moment(d, 'YYYY-MM-DD');
                           vm.entry.c15Date = m.add(7, 'hours').toDate();
                           if(vm.entry.c11Date && vm.entry.c15Date) {
                                if(vm.entry.c15Date < vm.entry.c11Date) {
                                    toastr.warning("Ngày nhận dịch vụ ARV không được nhỏ hơn ngày xét nghiệm HIV","Thông báo");
                                    openSelectBox("vm.entry.c15Date");
                                    return;
                                }
                            }
                        }
                   }],
               },
               datePostSetup: function(fpItem) {
                   vm.c15Date.fpItem = fpItem;
                   if (vm.entry.c15Date && fpItem) {
                       fpItem.setDate(moment(vm.entry.c15Date).toDate());
                   }
               },
               clear: function() {
                   if (vm.c15Date.fpItem) {
                       vm.c15Date.fpItem.clear();
                       vm.entry.c15Date = null;
                   }
               }
        };
        vm.c11Date = {
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
                   },
                   function(date) {
                       // return true to disable
                       if(vm.entry.c1) {
                           var newData = (vm.entry.c1).split("/");
                           var d1 = new Date(newData[1], newData[0]-1, 0);
                           return (date <= d1);
                       }
                   },
                   function(date) {
                       // return true to disable
                       if(vm.entry.c1) {
                           var newData = (vm.entry.c1).split("/");
                           var d2 = new Date(newData[1], newData[0], 0);
                           return (date > d2);
                       }
                   }
               ],
              onChange: [function() {
                  angular.element(document.querySelector('#fixed_element')).focus();
                  const d = this.selectedDates[0];
                  if (d && _.isDate(d)) {
                      const m = moment(d, 'YYYY-MM-DD');
                      vm.entry.c11Date = m.add(7, 'hours').toDate();
                  } 
              }],
          },
          datePostSetup: function(fpItem) {
              vm.c11Date.fpItem = fpItem;
              if (vm.entry.c11Date && fpItem) {
                  fpItem.setDate(moment(vm.entry.c11Date).toDate());
              }
          },
          clear: function() {
              if (vm.c11Date.fpItem) {
                vm.c11Date.fpItem.clear();
                vm.entry.c11Date = null;
              }
          }
       };
       
      
    }

})();
