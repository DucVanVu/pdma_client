/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PnsEditContactController', PnsEditContactController);

    PnsEditContactController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',
        'PnsEditContactService',
        '$stateParams',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        '$state',
        'PatientService',
        'HtsEditService',
        '$uibModal',
    ];

    function PnsEditContactController($rootScope, $scope, $http, $timeout, settings, $uibModal, toastr, blockUI, $sce, service, $stateParams,focus,focusFlatPick, openSelectBox,Utilities,$state,patientService,htsEditService, modal) {
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
        vm.age = null;
        vm.entryStatus = [];
        vm.numberOfDays = [];
        vm.name = null;
        vm.code = null;

        vm.numberOfDays = 30;
        vm.convertC5 = null;

        //--------------Popup c8HTSCases----------//
        vm.pageIndexc8HTSCase = 1;
        vm.pageSizec8HTSCase = 5;
        vm.selectedc8HTSCases = [];
        vm.c8HTSCasesSelected = {};

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

        vm.c3Values=[
            {id:1,name:'Không',isCheck:false,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.YesNoValuse=[
           {id:1,name:'Không',isCheck:false,val:'NO'},
           {id:2,name:'Có',isCheck:false,val:'YES'}
       ];
        vm.years=[];
        let currentYear = moment().year();
        for(let i=moment().year();i>1919;i--){
            let year={ id: i, name: i};
            vm.years.push(year);
        };
        vm.c1Values=[
            {name:'Vợ/chồng',isCheck:false,val:'answer1'},
            {name:'Bạn tình khác',isCheck:false,val:'answer2'},
            {name:'Bạn TCMT chung',isCheck:false,val:'answer3'},
            {name:'Con đẻ ≤15 tuổi của mẹ HIV+', isCheck:false,val:'answer4'},
            {name:'Mẹ sinh con ≤15 tuổi HIV+',isCheck:false,val:'answer5'}
        ];
        vm.c2Values=[
            {id:1,name:'HIV+ đã được khẳng định',isCheck:false,val:'answer1'},
            {id:2,name:'Không biết hoặc HIV-',isCheck:false,val:'answer2'}
        ];
        vm.c5ReasonValues=[
            {name:'Không ở địa phương',isCheck:false,val:'answer1'},
            {name:'Đã tử vong',isCheck:false,val:'answer2'},
            {name:'Không liên lạc được, từ chối',isCheck:false,val:'answer3'}
        ];
        vm.c6Values=[
            {name:'Người có HIV',isCheck:false,val:'answer1'},
            {name:'Thảo thuận thực hiện',isCheck:false,val:'answer2'},
            {name:'Cùng thực hiện',isCheck:false,val:'answer3'},
            {name:'Nhân viên y tế',isCheck:false,val:'answer4'}
        ];
        vm.c7Values=[
            {name:'Gọi điện thoại',isCheck:false,val:'answer1'},
            {name:'Gửi tin nhắn',isCheck:false,val:'answer2'},
            {name:'Internet (Facebook, Viber, Zalo, Email,...)',isCheck:false,val:'answer3'},
            {name:'Gặp trực tiếp',isCheck:false,val:'answer4'},
            {name:'Khác',isCheck:false,val:'answer5'}
        ];
        vm.c8Values=[
           {name:'Có, tại cơ sở này',isCheck:false,val:'answer1'},
           {name:'Có, tại cơ sở khác',isCheck:false,val:'answer2'},
           {name:'Không',isCheck:false,val:'answer3'}
       ];
       vm.c9Values=[
             {name:'HIV âm tính',isCheck:false,val:'answer1'},
             {name:'Khẳng định HIV dương tính',isCheck:false,val:'answer2'},
             {name:'Không xác định',isCheck:false,val:'answer3'},
             {name:'Từ chối trả lời',isCheck:false,val:'answer4'}
        ];

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }
            //blockUI.stop();

            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }
            let idParam = $stateParams.id;
            if(!idParam){
                service.getListPnsWriteAble().then(function(data){
                    if(data && data.length>0){
                        vm.orgsWritable = data;
                        vm.isWrited = true;
                        blockUI.stop();
                    }else{
                        blockUI.stop();
                        $state.go('application.pns');
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Cảnh báo"); 
                    }
                });
            }else{
                blockUI.stop();
            }
        });
        
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                vm.orgsWritable = $scope.assignedOrgs.writable;
//                if (vm.orgsWritable && vm.orgsWritable.length >= 1 && !vm.entry.id) {
//                    vm.currentOrg = vm.orgsWritable[0];
//                    vm.entry.c2=vm.orgsWritable[0];
//                }
            }
        });

        

        $scope.$watch('vm.entry.c9JoinedPrEP', function (newVal, oldVal) {
            if(newVal){
                vm.alertC9JoinedPrEP=false;
            }
        });
        $scope.$watch('vm.entry.c3', function (newVal, oldVal) {
            if(newVal){
                vm.alertC3=false;
            }
        });
        $scope.$watch('vm.entry.c5', function (newVal, oldVal) {
           if(newVal){
               vm.alertc5=false;
           }
       });

        $scope.$watch('vm.entry.province', function (newVal, oldVal) {
            if(newVal){
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=newVal.id;

//                if(vm.checkDouble==true){
//                    vm.entry.c23CurrentAddressProvince=newVal;
//                    vm.entry.c23CurrentAddressDistrict=vm.entry.c23ResidentAddressDistrict;
//                    vm.entry.c23CurrentAddressWard=vm.entry.c23ResidentAddressWard;
//                    vm.entry.c23CurrentAddressDetail=vm.entry.c23ResidentAddressDetail;
//                }

                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.districts = data;
                });
            }
        });

        $scope.$watch('vm.entry.yearOfBirth', function (newVal, oldVal) {
            if(newVal) {
                vm.age = new Date().getFullYear() - vm.entry.yearOfBirth;
            }
            vm.c1Values[3].isCheck = false;
        });

        $scope.$watch('vm.entry.c4First', function (newVal, oldVal) {
            if(newVal) {
                if(vm.entry.c4First < vm.entry.c1receivedInfoDate) {
                    toastr.warning("Ngày lần 1 không được nhỏ hơn ngày khai thác thông tin");
                }
            }
        });

        $scope.$watch('vm.entry.c4Second', function (newVal, oldVal) {
            if(newVal) {
                if(vm.entry.c4Second != null) {
                    if(vm.entry.c4First != null) {
                        if(vm.entry.c4Second < vm.entry.c4First) {
                            toastr.warning("Ngày lần 2 không được nhỏ hơn ngày lần 1");
                        }
                    } else  {
                        if(vm.entry.c4Second < vm.entry.c1receivedInfoDate) {
                            toastr.warning("Ngày lần 2 không được nhỏ hơn ngày khai thác thông tin");
                        }
                    }
                }
            }
        });

        $scope.$watch('vm.entry.c4Third', function (newVal, oldVal) {
            if(newVal) {
                var temp = null;
                var message = null;
                if(vm.entry.c1receivedInfoDate != null) {
                    temp = vm.entry.c1receivedInfoDate;
                    message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày khai thác thông tin";
                }
                if(vm.entry.c4First != null) {
                    temp = vm.entry.c4First;
                    message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày liên lạc lần 1";
                }
                if(vm.entry.c4Second != null) {
                    temp = vm.entry.c4Second;
                    message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày liên lạc lần 2";
                }
                if(temp != null && message != null) {
                    let c4Third = moment(vm.entry.c4Third,"YYYY-MM-DD").toDate();
                    let tempConvert = moment(temp,"YYYY-MM-DD").toDate();
                    tempConvert.setHours(0);
                    if(c4Third < tempConvert) {
                        toastr.warning(message);
                    }
                }
            }
        });

        // $scope.$watch('vm.entry.c8LabtestDate', function (newVal, oldVal) {
        //     if(newVal) {
        //         var temp = null;
        //         var message = null;
        //         if(vm.entry.c4First != null) {
        //             temp = vm.entry.c4First;
        //             message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 1";
        //         }
        //         if(vm.entry.c4Second != null) {
        //             temp = vm.entry.c4Second;
        //             message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 2";
        //         }
        //         if(vm.entry.c4Third != null) {
        //             temp = vm.entry.c4Third;
        //             message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 3";
        //         }                
        //         if(temp != null && message != null) {
        //             let c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
        //             let tempConvert =  moment(temp,"YYYY-MM-DD").toDate();
        //             tempConvert.setHours(0);    
        //             if(c8LabtestDate < tempConvert) {
        //                 toastr.warning(message);
        //             }
        //         }
        //     }
        // });

        $scope.$watch('vm.entry.c9ARVDate', function (newVal, oldVal) {
            if(newVal) {
                let c9ARVDate =  moment(vm.entry.c9ARVDate,"YYYY-MM-DD").toDate();
                let c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
                if(c9ARVDate < c8LabtestDate) {
                    toastr.warning("Ngày điều trị ARV không được nhỏ hơn ngày XN HIV");
                }
            }
        });

        $scope.$watch('vm.entry.c9PrEPDate', function (newVal, oldVal) {
            if(newVal) {
                let c9PrEPDate =  moment(vm.entry.c9PrEPDate,"YYYY-MM-DD").toDate();
                let c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
                if(c9PrEPDate < c8LabtestDate) {
                    toastr.warning("Ngày điều trị PrEP không được nhỏ hơn ngày XN HIV");
                }
            }
        });
        
        
        //Onchange Region
//        vm.checkCode = function(){
//            if(!vm.entry.c2){
//                toastr.warning('Bạn cần chọn cơ sở trước!');
//            }
//            else{
//                let checkCodeDto={};
//                checkCodeDto.id=vm.entry.id;
//                checkCodeDto.code=vm.entry.c4;
//                checkCodeDto.orgId=vm.entry.c2.id;
//                service.checkCode(checkCodeDto,
//                    function success(data) {
//                        blockUI.stop();
//                    }, function failure() {
//                        blockUI.stop();
//                    }).then(function (data) {
//                    blockUI.stop();
//                    if(data.isDup){
//                        toastr.warning(data.note);
//                        focus('vm.entry.c4');
//                    };
//                });
//            }
//        };
        //Get Data Region
        vm.c1CheckChange = function(e, index){
            let isCheckC1=false;
//            vm.alertC1 = false;
            for(let i=0;i<vm.c1Values.length;i++){
                if(vm.c1Values[i].isCheck==true){
                    isCheckC1=true;
                }
                if(vm.c1Values[0].isCheck==true) {
                    vm.c1Values[3].isCheck=false;
                    vm.c1Values[4].isCheck=false;
                    vm.entryStatus[0] = false;
                } else {
                    vm.entryStatus[0] = true;
                }
                if(vm.c1Values[3].isCheck==true) {
                    vm.c1Values[0].isCheck=false;
                    vm.c1Values[4].isCheck=false;
                    vm.entryStatus[3] = false;
                } else {
                    vm.entryStatus[3] = true;
                }
                if(vm.c1Values[4].isCheck==true) {
                    vm.c1Values[0].isCheck=false;
                    vm.c1Values[3].isCheck=false;
                    vm.entryStatus[4] = false;
                } else {
                    vm.entryStatus[4] = true;
                }
            }
            if(isCheckC1){
                vm.alertC1=false;
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
            let orgFilter={organization: vm.entry.c2};

            service.getListStaff(orgFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.staffs = data.content;
                blockUI.stop();
            });
        };
        vm.checkDouble=false;
        vm.getEntry = function () {
            // block the view with a loading indicator
            vm.id = $stateParams.id;
            vm.pnsId = $stateParams.pnsId;
            if(vm.pnsId){
                blockUI.start();
                service.getPNSEntry(vm.pnsId, function success() {
                }, function failure() {
                  blockUI.stop();
                  if(!vm.pnsEntry){
                      $state.go('application.pns');
                  }
                }).then(function (data) {
                    blockUI.stop();
                    vm.pnsEntry=data;
                    vm.convertC5=new Date(vm.pnsEntry.c5);
                    vm.name=vm.pnsEntry.c7;
                    vm.code=vm.pnsEntry.c4;
                    vm.entry.pnsCase=vm.pnsEntry;
                    if(!vm.pnsEntry){
                        $state.go('application.pns');
                    }
                });
            }
            else if(vm.id){
                blockUI.start();
                service.getEntry(vm.id, function success() {
                }, function failure() {
                  blockUI.stop();
                  if(!vm.pnsEntry){
                      $state.go('application.pns');
                  }
                }).then(function (data) {
                    blockUI.stop();
                    vm.entry=data;
                    vm.isWrited = data.writAble;
                    if(!vm.entry.readAble && !vm.entry.writAble) {
                        toastr.warning("Bạn không có quyền đọc hoặc sửa bản ghi","Thông báo");
                        $state.go('application.pns');
                    }
                    vm.name=vm.entry.pnsCase.c7;
                    vm.code=vm.entry.pnsCase.c4;
                    vm.convertC5 = new Date(vm.entry.c1receivedInfoDate);
                    // vm.code=vm.pnsEntry.c4;
                    vm.c1receivedInfoDate.datePostSetup(vm.c1receivedInfoDate.fpItem);
                    vm.c4FirstDate.datePostSetup(vm.c4FirstDate.fpItem);
                    vm.c8LabtestDate.datePostSetup(vm.c8LabtestDate.fpItem);
                    vm.entry.c8HTSCase = vm.entry.c8HTSCase.c6;
                    vm.filter.disablePaging=true;
                    vm.filter.c15="YES";
                    vm.filter.c14="answer2";
                    if(vm.entry.pnsCase && vm.entry.pnsCase.htsCase && vm.entry.pnsCase.htsCase.id){
                        vm.filter.skipHTS= vm.entry.pnsCase.htsCase.id;
                    }
                    // if(vm.entry.c8=='answer1'){
                    //     service.getListHTSCase(vm.filter, function success() {
                    //     }, function failure() {
                    //     toastr.error('Có lỗi xảy ra khi lưu.', 'Thông báo');
                    //     }).then(function (data) {
                    //         vm.listHTSCase= data.content;
                    //     });
                    // }
                    if(vm.entry.c1!=null && vm.entry.c1.length>0){
                        for(let i=0;i<vm.entry.c1.length;i++){
                            for(let j=0;j<vm.c1Values.length;j++){
                                if(vm.entry.c1[i].val==vm.c1Values[j].val){
                                    vm.c1Values[j].isCheck=true;
                                }
                            }

                        }
                    }
                });

            }
        };

        // Getting Entry for editing
        vm.getEntry();

        vm.cancel = function(){
            if(vm.entry.pnsCase){
                $state.go('application.pns_edit',{id:vm.entry.pnsCase.id});
            }
            else{
                $state.go('application.pns',{id:vm.entry.pnsCase.id});
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
        vm.genderChange=function(){
            vm.alertGender=false;
            if(vm.entry.gender=='FEMALE'){
                vm.c1Values[1].isCheck=false;    
            }
            if(vm.entry.gender=='MALE'){
                vm.c1Values[4].isCheck=false;
            }
        }

        vm.validate=function() {
            // if ((vm.pnsEntry && vm.pnsEntry.id) || (vm.entry && vm.entry.id)) {
            //     let c5Convert = vm.convertC5.getMonth()+1;
            //     let calculateQuarter = null;
            //     if(c5Convert>0 && c5Convert<4) {
            //         calculateQuarter = 1;
            //     } else if(c5Convert>3 && c5Convert<7) {
            //         calculateQuarter = 2;
            //     } else if(c5Convert>6 && c5Convert<10) {
            //         calculateQuarter = 3;
            //     } else if(c5Convert>9 && c5Convert<13) {
            //         calculateQuarter = 4;
            //     }
            //     let changeByQuarter = new Date(vm.convertC5.getFullYear(), vm.convertC5.getMonth(), vm.convertC5.getDate());
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

            if(!vm.entry.fullName){
                toastr.warning("Vui lòng nhập họ tên","Thông báo");
                focus("vm.entry.fullName");
                return;
            }
            if(!vm.entry.yearOfBirth){
                toastr.warning("Vui lòng chọn Ngày đồng ý nhận dịch vụ","Thông báo");
                openSelectBox("vm.entry.yearOfBirth");
                return;
            }
            if(!vm.entry.gender){
                toastr.warning("Vui lòng nhập Giới tính khi sinh","Thông báo");
                focus("vm.entry.gender");
                vm.alertGender=true;
                return;
            }
            if(!vm.entry.phoneNumber){
                toastr.warning("Vui lòng nhập Số điện thoại","Thông báo");
                focus("vm.entry.phoneNumber");
                return;
            }
            let isCheckc1=false;
            for(let i=0;i<vm.c1Values.length;i++){
                if(vm.c1Values[i].isCheck==true){
                    isCheckc1=true;
                }
            }
            if(!isCheckc1){
                toastr.warning("Vui lòng chọn Quan hệ với người có HIV","Thông báo");
                focus("vm.c1Values[0]");
                vm.alertC1=true;
                return;
            }
            if(!vm.entry.c1receivedInfoDate){
                toastr.warning("Vui lòng chọn Ngày tư vấn dịch vụ TBXNBT/BC","Thông báo");
                focusFlatPick("vm.entry.c1receivedInfoDate");
                return;
            }
            if(!vm.entry.c2){
                toastr.warning("Vui lòng chọn Tình trạng HIV","Thông báo");
                openSelectBox('vm.entry.c2');
                return;
            }
            if(vm.entry.c2=='answer2' && !vm.entry.c3){
                toastr.warning("Vui lòng chọn Nguy cơ bạo lực","Thông báo");
                focus('vm.entry.c3');
                vm.alertC3=true;
                return;
            }
            
            if(vm.entry.c2=='answer2' && vm.entry.c3=='NO'){
                if(!vm.entry.c4First){
                    if(vm.entry.c4First != null) {
                        toastr.warning("Vui lòng chọn Ngày liên lạc lần 1","Thông báo");
                        focusFlatPick('vm.entry.c4First');
                        return;
                    }
                }
                if(!vm.entry.c5){
                    toastr.warning("Vui lòng cho biết Đã liên lạc được hay chưa","Thông báo");
                    focus('vm.entry.c5');
                    vm.alertc5=true;
                    return;
                }
            }
            if(vm.entry.c5 && vm.entry.c5 =='NO' && !vm.entry.c5Reason){
                toastr.warning("Vui lòng ghi rõ lý do không liên lạc được","Thông báo");
                openSelectBox('vm.entry.c5Reason');
//                vm.alertc5=true;
                return;
            }
            if(vm.entry.c2=='answer2' && vm.entry.c3=='NO' && vm.entry.c5=='YES'){
                if(!vm.entry.c6){
                    toastr.warning("Vui lòng ghi rõ Biện pháp đã thành công","Thông báo");
                    openSelectBox('vm.entry.c6');
                    return;
                }
                if(!vm.entry.c7){
                    toastr.warning("Vui lòng chọn Cách đã liên lạc thành công","Thông báo");
                    openSelectBox('vm.entry.c7');
                    return;
                }
                if(vm.entry.c7 && vm.entry.c7=='answer5' && !vm.entry.c7Note){
                    toastr.warning("Vui lòng ghi rõ Cách đã liên lạc Khác thành công","Thông báo");
                    focus('vm.entry.c7Note');
                    return;
                }
                if(!vm.entry.c8){
                    toastr.warning("Vui lòng chọn thông tin Xét nghiệm HIV","Thông báo");
                    openSelectBox('vm.entry.c8');
                    return;
                }
                // if(vm.entry.c8 && vm.entry.c8=='answer1'){
                //     if(!vm.entry.c8LabtestCode){
                //         toastr.warning("Vui lòng nhập mã số xét nghiệm","Thông báo");
                //         focus('vm.entry.c8LabtestCode');
                //         return;
                //     }
                // }
                if(vm.entry.c8 && vm.entry.c8=='answer2'){
                    if(!vm.entry.c8LabtestOrg){
                        toastr.warning("Vui lòng nhập Tên cơ sở TVXN HIV","Thông báo");
                        focus('vm.entry.c8LabtestOrg');
                        return;
                    }
                }
                if(vm.entry.c8 && vm.entry.c8!='answer3'){
                    if(!vm.entry.c8LabtestDate){
                        toastr.warning("Vui lòng nhập ngày xét nghiệm","Thông báo");
                        focusFlatPick('vm.entry.c8LabtestDate');
                        return;
                    }
                    if(!vm.entry.c9){
                        toastr.warning("Vui lòng nhập Kết quả XN HIV","Thông báo");
                        openSelectBox('vm.entry.c9');
                        return;
                    }
                    else{
                        if(vm.entry.c9=='answer1'){
                            if(!vm.entry.c9JoinedPrEP){
                                toastr.warning("Bệnh nhân có Có tham gia điều trị PrEP hay không?","Thông báo");
                                focus('vm.entry.c9JoinedPrEP');
                                vm.alertC9JoinedPrEP = true;
                                return;
                            }
                            if(vm.entry.c9JoinedPrEP && vm.entry.c9JoinedPrEP=='YES' && !vm.entry.c9PrEPDate){
                                toastr.warning("Vui lòng nhập Ngày tham gia điều trị PrEP","Thông báo");
                                focusFlatPick('vm.entry.c9PrEPDate');
                                return;
                            }
                        }
                        if(vm.entry.c9=='answer2'){
                            if(!vm.entry.c9JoinedARV){
                                toastr.warning("Bệnh nhân có Có tham gia điều trị PrEP hay không?","Thông báo");
                                focus('vm.entry.c9JoinedARV');
                                vm.alertC9JoinedARV = true;
                                return;
                            }
                            if(vm.entry.c9JoinedARV && vm.entry.c9JoinedARV=='YES' && !vm.entry.c9ARVDate){
                                toastr.warning("Vui lòng nhập Ngày tham gia điều trị PrEP","Thông báo");
                                focusFlatPick('vm.entry.c9ARVDate');
                                return;
                            }
                        }
                    }
                }
                if(vm.entry.c4First < vm.entry.c1receivedInfoDate) {
                    if(vm.entry.c4First != null) {
                        toastr.warning("Ngày lần 1 không được nhỏ hơn ngày khai thác thông tin");
                        focusFlatPick('vm.entry.c4First');
                        return;
                    }
                }
                if(vm.entry.c4Second != null) {
                    if(vm.entry.c4First != null) {
                        let c4First =  moment(vm.entry.c4First,"YYYY-MM-DD").toDate();
                        let c4Second =  moment(vm.entry.c4Second,"YYYY-MM-DD").toDate();
                        if(c4Second < c4First) {
                            toastr.warning("Ngày lần 2 không được nhỏ hơn ngày lần 1");
                            focusFlatPick('vm.entry.c4Second');
                            return;
                        }
                    } else {
                        let c1receivedInfoDate =  moment(vm.entry.c1receivedInfoDate,"YYYY-MM-DD").toDate();
                        let c4Second =  moment(vm.entry.c4Second,"YYYY-MM-DD").toDate();
                        if(c4Second < c1receivedInfoDate) {
                            toastr.warning("Ngày lần 2 không được nhỏ hơn ngày khai thác thông tin");
                            focusFlatPick('vm.entry.c4Second');
                            return;
                        }
                    }
                }
                if(vm.entry.c4Third != null) {
                    var temp = null;
                    var message = null;
                    if(vm.entry.c1receivedInfoDate != null) {
                        temp = vm.entry.c1receivedInfoDate;
                        message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày khai thác thông tin";
                    }
                    if(vm.entry.c4First != null) {
                        temp = vm.entry.c4First;
                        message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày liên lạc lần 1";
                    }
                    if(vm.entry.c4Second != null) {
                        temp = vm.entry.c4Second;
                        message = "Ngày liên lạc lần 3 không được nhỏ hơn ngày liên lạc lần 2";
                    }
                    if(temp != null && message != null) {
                        let c4Third = moment(vm.entry.c4Third,"YYYY-MM-DD").toDate();
                        let tempConvert = moment(temp,"YYYY-MM-DD").toDate();
                        tempConvert.setHours(0);
                        if(c4Third < tempConvert) {
                            toastr.warning(message);
                            focusFlatPick('vm.entry.c4Third');
                            return;
                        }
                    }
                }
                // if(vm.entry.c8LabtestDate != null) {
                //     var temp = null;
                //     var message = null;
                //     if(vm.entry.c4First != null) {
                //         temp = vm.entry.c4First;
                //         message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 1";
                //     }
                //     if(vm.entry.c4Second != null) {
                //         temp = vm.entry.c4Second;
                //         message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 2";
                //     }
                //     if(vm.entry.c4Third != null) {
                //         temp = vm.entry.c4Third;
                //         message = "Ngày XN HIV không được nhỏ hơn ngày liên lạc lần 3";
                //     }
                //     if(temp != null && message != null) {
                //         let c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
                //         let tempConvert =  moment(temp,"YYYY-MM-DD").toDate();
                //         tempConvert.setHours(0);    
                //         if(c8LabtestDate < tempConvert) {
                //             toastr.warning(message);
                //             focusFlatPick('vm.entry.c8LabtestDate');
                //             return;
                //         }
                //     }
                // }
                                
                if(vm.entry.c9ARVDate != null) {
                    var c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
                    var c9ARVDate =  moment(vm.entry.c9ARVDate,"YYYY-MM-DD").toDate();
                    if(c9ARVDate < c8LabtestDate) {
                        toastr.warning("Ngày điều trị ARV không được nhỏ hơn ngày XN HIV");
                        focusFlatPick('vm.entry.c9ARVDate');
                        return;
                    }
                }
                if(vm.entry.c9PrEPDate != null) {
                    var c8LabtestDate =  moment(vm.entry.c8LabtestDate,"YYYY-MM-DD").toDate();
                    var c9PrEPDate =  moment(vm.entry.c9PrEPDate,"YYYY-MM-DD").toDate();
                    if(c9PrEPDate < c8LabtestDate) {
                        toastr.warning("Ngày điều trị PrEP không được nhỏ hơn ngày XN HIV");
                        focusFlatPick('vm.entry.c9PrEPDate');
                        return;
                    }
                }
            }
            return true;
        }
        /**
         * Save a new/existing entry
         */
        // vm.listHTSCase=[];
        vm.c8Change=function(){
            vm.entry.c8HTSCase=null;
            vm.entry.c8LabtestOrg=null;
            vm.entry.c8LabtestDate=null;
            vm.entry.c9=null;
            vm.entry.c9JoinedPrEP=null;
            vm.entry.c9PrEPDate=null;
            vm.entry.c9JoinedARV=null;
            vm.entry.c9ARVDate=null;
            vm.filter.disablePaging=true;
            vm.filter.c15="YES";
            vm.filter.c14="answer2";
            if(vm.entry.pnsCase && vm.entry.pnsCase.htsCase && vm.entry.pnsCase.htsCase.id){
                vm.filter.skipHTS= vm.entry.pnsCase.htsCase.id;
            }
            // if(vm.entry.c8=='answer1'){
            //     service.getListHTSCase(vm.filter, function success() {
            //     }, function failure() {
            //         toastr.error('Có lỗi xảy ra khi lưu.', 'Thông báo');
            //     }).then(function (data) {
            //         vm.listHTSCase= data.content;
                    
            //     });
            // }
        };

        vm.setNullIsHiden=function(){
            if(vm.entry.c2 && vm.entry.c2=="answer2"){
                if(vm.entry.c3=="NO" && vm.entry.c3){
                    if(vm.entry.c5){
                        if(vm.entry.c5=="YES"){
                            vm.entry.c5Reason=null;
                            if(vm.entry.c7 && vm.entry.c7!="answer5"){
                                vm.entry.c7Note=null;
                            }
                            if(vm.entry.c8){
                                if(vm.entry.c8=="answer3"){
                                    vm.entry.c8HTSCase=null;
                                    vm.entry.c8LabtestOrg=null;
                                    vm.entry.c8LabtestDate=null;
                                    vm.entry.c9=null;
                                    vm.entry.c9JoinedPrEP=null;
                                    vm.entry.c9PrEPDate=null;
                                    vm.entry.c9JoinedARV=null;
                                    vm.entry.c9ARVDate=null;
                                }else{
                                    if(vm.entry.c8=="answer2"){
                                        vm.entry.c8HTSCase=null;
                                    }
                                    if(vm.entry.c8=="answer1"){
                                        vm.entry.c8LabtestOrg=null;
                                    }
                                    if(vm.entry.c9){
                                        if(vm.entry.c9=="answer1"){
                                            vm.entry.c9JoinedARV=null;
                                            vm.entry.c9ARVDate=null;
                                            if(vm.entry.c9JoinedPrEP && vm.entry.c9JoinedPrEP=="NO"){
                                                vm.entry.c9PrEPDate=null;
                                            }
                                        }else{
                                            if(vm.entry.c9=="answer2"){
                                                vm.entry.c9JoinedPrEP=null;
                                                vm.entry.c9PrEPDate=null;
                                                if(vm.entry.c9JoinedARV && vm.entry.c9JoinedARV=="NO"){
                                                    vm.entry.c9ARVDate=null;
                                                }
                                            }else{
                                                vm.entry.c9JoinedPrEP=null;
                                                vm.entry.c9PrEPDate=null;
                                                vm.entry.c9JoinedARV=null;
                                                vm.entry.c9ARVDate=null;
                                            }
                                        }
                                        
                                    }else{
                                        vm.entry.c9JoinedPrEP=null;
                                        vm.entry.c9PrEPDate=null;
                                        vm.entry.c9JoinedARV=null;
                                        vm.entry.c9ARVDate=null;
                                    }
                                }
                                
                            }else{
                                vm.entry.c8HTSCase=null;
                                vm.entry.c8LabtestOrg=null;
                                vm.entry.c8LabtestDate=null;
                                vm.entry.c9=null;
                                vm.entry.c9JoinedPrEP=null;
                                vm.entry.c9PrEPDate=null;
                                vm.entry.c9JoinedARV=null;
                                vm.entry.c9ARVDate=null;
                            }
                            
                        }else{
                            vm.entry.c6=null;
                            vm.entry.c7=null;
                            vm.entry.c7Note=null;
                            vm.entry.c8=null;
                            vm.entry.c8HTSCase=null;
                            vm.entry.c8LabtestOrg=null;
                            vm.entry.c8LabtestDate=null;
                            vm.entry.c9=null;
                            vm.entry.c9JoinedPrEP=null;
                            vm.entry.c9PrEPDate=null;
                            vm.entry.c9JoinedARV=null;
                            vm.entry.c9ARVDate=null;
                        }
                    }else{
                        vm.entry.c6=null;
                            vm.entry.c7=null;
                            vm.entry.c7Note=null;
                            vm.entry.c8=null;
                            vm.entry.c8HTSCase=null;
                            vm.entry.c8LabtestOrg=null;
                            vm.entry.c8LabtestDate=null;
                            vm.entry.c9=null;
                            vm.entry.c9JoinedPrEP=null;
                            vm.entry.c9PrEPDate=null;
                            vm.entry.c9JoinedARV=null;
                            vm.entry.c9ARVDate=null;
                    }
                    
                }else{
                    vm.entry.c4First=null;
                    vm.entry.c4Second=null;
                    vm.entry.c4Third=null;
                    vm.entry.c5=null;
                    vm.entry.c5Reason=null;
                    vm.entry.c6=null;
                    vm.entry.c7=null;
                    vm.entry.c7Note=null;
                    vm.entry.c8=null;
                    vm.entry.c8HTSCase=null;
                    vm.entry.c8LabtestOrg=null;
                    vm.entry.c8LabtestDate=null;
                    vm.entry.c9=null;
                    vm.entry.c9JoinedPrEP=null;
                    vm.entry.c9PrEPDate=null;
                    vm.entry.c9JoinedARV=null;
                    vm.entry.c9ARVDate=null;
                }
            }else{
                vm.entry.c3=null;
                vm.entry.c4First=null;
                vm.entry.c4Second=null;
                vm.entry.c4Third=null;
                vm.entry.c5=null;
                vm.entry.c5Reason=null;
                vm.entry.c6=null;
                vm.entry.c7=null;
                vm.entry.c7Note=null;
                vm.entry.c8=null;
                vm.entry.c8HTSCase=null;
                vm.entry.c8LabtestOrg=null;
                vm.entry.c8LabtestDate=null;
                vm.entry.c9=null;
                vm.entry.c9JoinedPrEP=null;
                vm.entry.c9PrEPDate=null;
                vm.entry.c9JoinedARV=null;
                vm.entry.c9ARVDate=null;
            }
        }

        vm.c8HTSChange= function(){
            if(vm.entry.c8HTSCase){
                if(vm.entry.c8HTSCase.c19Date){
                    vm.entry.c8LabtestDate=vm.entry.c8HTSCase.c19Date;
                    vm.c8LabtestDate.datePostSetup(vm.c8LabtestDate.fpItem);
                }
                if(vm.entry.c8HTSCase.c14){
                    vm.entry.c9=vm.entry.c8HTSCase.c14;
                    if(vm.entry.c9){
                        if(vm.entry.c9=="answer1"){
                            vm.entry.c9JoinedARV=null;
                            vm.entry.c9ARVDate=null;
                            if(vm.entry.c9JoinedPrEP && vm.entry.c9JoinedPrEP=="NO"){
                                vm.entry.c9PrEPDate=null;
                            }
                        }else{
                            if(vm.entry.c9=="answer2"){
                                vm.entry.c9JoinedPrEP=null;
                                vm.entry.c9PrEPDate=null;
                                if(vm.entry.c9JoinedARV && vm.entry.c9JoinedARV=="NO"){
                                    vm.entry.c9ARVDate=null;
                                }
                            }else{
                                vm.entry.c9JoinedPrEP=null;
                                vm.entry.c9PrEPDate=null;
                                vm.entry.c9JoinedARV=null;
                                vm.entry.c9ARVDate=null;
                            }
                        }
                        
                    }else{
                        vm.entry.c9JoinedPrEP=null;
                        vm.entry.c9PrEPDate=null;
                        vm.entry.c9JoinedARV=null;
                        vm.entry.c9ARVDate=null;
                    }
                }
                if(!vm.entry.fullName && vm.entry.c8HTSCase.c23FullName){
                    vm.entry.fullName=vm.entry.c8HTSCase.c23FullName;
                }
                if(!vm.entry.yearOfBirth && vm.entry.c8HTSCase.c8){
                    vm.entry.yearOfBirth=vm.entry.c8HTSCase.c8;
                }
                if(!vm.entry.gender && vm.entry.c8HTSCase.c7){
                    vm.entry.gender=vm.entry.c8HTSCase.c7;
                }
                if(!vm.entry.phoneNumber && vm.entry.c8HTSCase.c23PhoneNumber){
                    vm.entry.phoneNumber=vm.entry.c8HTSCase.c23PhoneNumber;
                }
                if(!vm.entry.province && vm.entry.c8HTSCase.c23CurrentAddressProvince){
                    vm.entry.province=vm.entry.c8HTSCase.c23CurrentAddressProvince;
                }
                if(!vm.entry.district && vm.entry.c8HTSCase.c23CurrentAddressDistrict){
                    vm.entry.district=vm.entry.c8HTSCase.c23CurrentAddressDistrict;
                }
                if(!vm.entry.addressDetail && vm.entry.c8HTSCase.c23CurrentAddressDetail){
                    vm.entry.addressDetail=vm.entry.c8HTSCase.c23CurrentAddressDetail;
                }
                
            }
        };
        vm.saveEntry = function () {
            
            // validate the entry title, make sure it is not null or empty
//            if (!vm.entry.title || vm.entry.title.trim().length <= 0) {
//                toastr.error('Vui lòng nhập tiêu đề của thông báo.', 'Thông báo');
//                return;
//            }
            if(vm.validate()){
                blockUI.start();
                vm.entry.c1=[];
                for(let i=0;i<vm.c1Values.length;i++){
//                    if(i==14 && vm.entry.c7=='MALE'){
//                        vm.c1Values[i].isCheck=false;
//                    }
//                    if(i==7 && vm.entry.c7=='MALE'){
//                        vm.c1Values[i].isCheck=false;
//                    }
//                    if(i==1 && vm.entry.c7=='FEMALE'){
//                        vm.c1Values[i].isCheck=false;
//                    }
                    if(vm.c1Values[i].isCheck==true){
                        vm.entry.c1.push(vm.c1Values[i]);
                    }
                }
                vm.entry.c8HTSCase = vm.selectedc8HTSCases[0];
                vm.selectedc8HTSCases = [];
                service.saveEntry(vm.entry, function success() {
                    blockUI.stop();
                    toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                }, function failure() {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi lưu.', 'Thông báo');
                }).then(function (data) {
                    blockUI.stop();
//
                    toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                    $state.go('application.pns_edit',{id:data.pnsCase.id});
//                    $state.go('application.pns');
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
        vm.c1receivedInfoDate = {
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
                        vm.entry.c1receivedInfoDate = m.toDate();
                    }
//                    if(moment(vm.entry.c4).year()<vm.entry.c8){
//                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
//                        focusFlatPick('vm.entry.c4');
//                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c1receivedInfoDate.fpItem = fpItem;
                if (vm.entry.c1receivedInfoDate && fpItem) {
                    fpItem.setDate(moment(vm.entry.c1receivedInfoDate).toDate());
                }
            },
            clear: function() {
                if (vm.c1receivedInfoDate.fpItem) {
                    vm.c1receivedInfoDate.fpItem.clear();
                    vm.entry.c1receivedInfoDate = null;
                }
            }
        };
        vm.c4FirstDate = {
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
                        vm.entry.c4FirstDate = m.toDate();
                    }
//                    if(moment(vm.entry.c4).year()<vm.entry.c8){
//                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
//                        focusFlatPick('vm.entry.c4');
//                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c4FirstDate.fpItem = fpItem;
                if (vm.entry.c4First && fpItem) {
                    fpItem.setDate(moment(vm.entry.c4First).toDate());
                }
            },
            clear: function() {
                if (vm.c4FirstDate.fpItem) {
                    vm.c4FirstDate.fpItem.clear();
                    vm.entry.c4First = null;
                }
            }
        };
        vm.c4SecondDate = {
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
                        vm.entry.c4Second = m.toDate();
                    }
//                    if(moment(vm.entry.c4).year()<vm.entry.c8){
//                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
//                        focusFlatPick('vm.entry.c4');
//                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c4SecondDate.fpItem = fpItem;
                if (vm.entry.c4Second && fpItem) {
                    fpItem.setDate(moment(vm.entry.c4Second).toDate());
                }
            },
            clear: function() {
                if (vm.c4SecondDate.fpItem) {
                    vm.c4SecondDate.fpItem.clear();
                    vm.entry.c4Second = null;
                }
            }
        };
        vm.c4ThirdDate = {
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
                        vm.entry.c4Third = m.toDate();
                    }
//                    if(moment(vm.entry.c4).year()<vm.entry.c8){
//                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
//                        focusFlatPick('vm.entry.c4');
//                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c4ThirdDate.fpItem = fpItem;
                if (vm.entry.c4Third && fpItem) {
                    fpItem.setDate(moment(vm.entry.c4Third).toDate());
                }
            },
            clear: function() {
                if (vm.c4ThirdDate.fpItem) {
                    vm.c4ThirdDate.fpItem.clear();
                    vm.entry.c4Third = null;
                }
            }
        };

        vm.c8LabtestDate = {
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
                       vm.entry.c8LabtestDate = m.toDate();
                   }
//                   if(moment(vm.entry.c4)>vm.entry.c8LabtestDate && vm.entry.c4){
//                    toastr.warning('Ngày nhận dịch vụ đang nhỏ hơn ngày tư vấn trước XN HIV');
//                    focusFlatPick('vm.entry.c8LabtestDate');
//                    }
               }],
           },
           datePostSetup: function(fpItem) {
               vm.c8LabtestDate.fpItem = fpItem;
               if (vm.entry.c8LabtestDate && fpItem) {
                   fpItem.setDate(moment(vm.entry.c8LabtestDate).toDate());
               }
           },
           clear: function() {
               if (vm.c8LabtestDate.fpItem) {
                   vm.c8LabtestDate.fpItem.clear();
                   vm.entry.c8LabtestDate = null;
               }
           }
       };
        vm.c9PrEPDate = {
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
                      vm.entry.c9PrEPDate = m.toDate();
                  }
              }],
          },
          datePostSetup: function(fpItem) {
              vm.c9PrEPDate.fpItem = fpItem;
              if (vm.entry.c9PrEPDate && fpItem) {
                  fpItem.setDate(moment(vm.entry.c9PrEPDate).toDate());
              }
          },
          clear: function() {
              if (vm.c9PrEPDate.fpItem) {
                  vm.c9PrEPDate.fpItem.clear();
                  vm.entry.c9PrEPDate = null;
              }
          }
        };
        vm.c9ARVDate = {
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
                    vm.entry.c9ARVDate = m.toDate();
                    //vm.entry.setHours(0);
                    //add(7, 'hours');
                }
            }],
        },
        datePostSetup: function(fpItem) {
            vm.c9ARVDate.fpItem = fpItem;
            if (vm.entry.c9ARVDate && fpItem) {
                fpItem.setDate(moment(vm.entry.c9ARVDate).toDate());
            }
        },
        clear: function() {
            if (vm.c9ARVDate.fpItem) {
                vm.c9ARVDate.fpItem.clear();
                vm.entry.c9ARVDate = null;
            }
        }
    };

    vm.findByc8HTSCase=function () {
        if(vm.searchDtoc8HTSCase==null) {
            vm.searchDtoc8HTSCase={};
        }
        if(vm.c8HTSCaseCode!=null && vm.c8HTSCaseCode.trim()!="") {
            vm.searchDtoc8HTSCase.keyword = vm.c8HTSCaseCode;
        } else {
            vm.searchDtoc8HTSCase.keyword=null;
        }
        vm.searchDtoc8HTSCase.pageIndex = vm.pageIndexc8HTSCase-1;
        vm.searchDtoc8HTSCase.pageSize = vm.pageSizec8HTSCase;

        service.getListHTSCase(vm.searchDtoc8HTSCase).then(function(data) {
            console.log("ducvu");
            console.log(data);
            vm.c8HTSCases = data.content;
            vm.bsTableControlc8HTSCase.state.pageNumber = 0;
            vm.bsTableControlc8HTSCase.options.data = vm.c8HTSCases;
            vm.bsTableControlc8HTSCase.options.totalRows = data.totalElements;
        });
    }

    vm.enterSearchc8HTSCase = function () {
        if (event.keyCode == 13) {//Phím Enter
            vm.searchByc8HTSCase();
        }
    };

    vm.showPopupc8HTSCase = function() {
        vm.subModalInstance = modal.open({
            animation: true,
            templateUrl: 'choose_c8HTSCase_modal.html',
            scope: $scope,
            size: 'lg'
        });
        vm.code=null;
        vm.selectedc8HTSCases=[];
        vm.c8HTSCasesSelected={};

        vm.findByc8HTSCase();
        
        vm.subModalInstance.result.then(function (confirm) {
            if (confirm == 'yes') {
                
            }
        }, function () {
            vm.farmCode=null;
        });
    }

    vm.searchByc8HTSCase = function () {
        debugger;
        vm.pageIndexc8HTSCase = 1;
        // if(vm.bsTableControlc8HTSCase.state){
        //     vm.bsTableControlc8HTSCase.state.pageNumber = 0;
        // }
        vm.findByc8HTSCase();
    };

    function checkAgreec8HTSCase(){
        if(angular.isUndefined(vm.selectedc8HTSCases)|| vm.selectedc8HTSCases.length==0 ){
            toastr.warning("Bạn chưa chọn mã số KH TVXN HIV", "Cảnh báo");
            return false;
        }
        return true;
    }
    vm.agreec8HTSCase=function () {
        if(checkAgreec8HTSCase()){
            vm.headerInfo = true;
            vm.c8HTSCasesSelected=vm.selectedc8HTSCases[0];
            vm.entry.c8HTSCase=vm.selectedc8HTSCases[0].c6;
            vm.c8HTSCaseCode=null;
            vm.subModalInstance.close();
        }
    }

    vm.bsTableControlc8HTSCase = {
        options: {
            data: vm.c8HTSCases,
            idField: 'id',
            sortable: true,
            striped: true,
            maintainSelected: true,
            clickToSelect: false,
            showColumns: false,
            singleSelect: true,
            showToggle: false,
            pagination: true,
            pageSize: vm.pageSizec8HTSCase,
            pageList: [5, 10, 25, 50, 100],
            locale: settings.locale,
            sidePagination: 'server',
            columns: service.getTableDefinitionc8HTSCase(),
            onCheck: function (row, $element) {
                if(vm.selectedFarms!=null){
                    vm.selectedc8HTSCases=[];
                }
                $scope.$apply(function () {
                    vm.selectedc8HTSCases.push(row);
                });
            },
          
            onUncheck: function (row, $element) {
                if(vm.selectedc8HTSCases!=null){
                    vm.selectedc8HTSCases=[];
                }
            },
            
            onPageChange: function (index, pageSize) {
                vm.pageSizec8HTSCase = pageSize;
                vm.pageIndexc8HTSCase = index;
                vm.findByc8HTSCase();
            }
        }
    };

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
    
    }

})();
