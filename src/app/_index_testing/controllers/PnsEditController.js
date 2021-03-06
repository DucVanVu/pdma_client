/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PnsEditController', PnsEditController);

    PnsEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',
        'PnsEditService',
        '$stateParams',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        '$state',
        'PatientService',
        'HtsEditService'
    ];

    function PnsEditController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service, $stateParams,focus,focusFlatPick, openSelectBox,Utilities,$state,patientService,htsEditService) {
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

        vm.numberOfDays = 30;
        vm.convertC5 = null;

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

        vm.c6Values=[
            {id:1,name:'Không',isCheck:false,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.years=[];
        let currentYear = moment().year();
        for(let i=moment().year();i>1919;i--){
            let year={ id: i, name: i};
            vm.years.push(year);
        };
        vm.c12Values=[
            {name:'Người nghiện chích ma túy',isCheck:false,val:'answer1'},
            {name:'Nam giới có QHTD đồng giới',isCheck:false,val:'answer2'},
            {name:'Người bán dâm',isCheck:false,val:'answer3'},
            {name:'Người chuyển giới',isCheck:false,val:'answer4'},
            {name:'Vợ/chồng/BT/con đẻ ≤15 tuổi của NCH',isCheck:false,val:'answer5'},
            {name:'Bạn chích chung của NCH',isCheck:false,val:'answer6'},
            {name:'Vợ/chồng/bạn tình của người nghiện chích ma túy',isCheck:false,val:'answer7'},
            {name:'Vợ/bạn tình nữ của nam có QHTD đồng giới',isCheck:false,val:'answer8'},
            {name:'Người mua dâm',isCheck:false,val:'answer9'},
            {name:'Người có nhiều bạn tình',isCheck:false,val:'answer10'},
            {name:'Bệnh nhân nghi AIDS',isCheck:false,val:'answer11'},
            {name:'Bệnh nhân lao',isCheck:false,val:'answer12'},
            {name:'Người mắc nhiễm trùng LTQĐTD',isCheck:false,val:'answer13'},
            {name:'Phạm nhân',isCheck:false,val:'answer14'},
            {name:'Phụ nữ mang thai',isCheck:false,val:'answer15'},
            {name:'Khác (Ghi rõ)',isCheck:false,val:'answer16'}
        ];
        vm.c11Values=[
            {id:1,name:'Mới nhiễm HIV và chưa điều trị',isCheck:false,val:'answer1'},
            {id:2,name:'Chưa điều trị ARV',isCheck:false,val:'answer2'},
            {id:3,name:'Điều trị ARV < 6 tháng',isCheck:false,val:'answer3'},
            {id:4,name:'Điều trị ARV &#8805; 6 tháng, TLVR >200 bản sao/ml',isCheck:false,val:'answer4'},
            {id:5,name:'Điều trị ARV &#8805; 6 tháng, nghi ngờ thất bại',isCheck:false,val:'answer5'},
            {id:6,name:'Điều trị ARV &#8805; 6 tháng, TLVR &#8804; 200 bản sao/ml',isCheck:false,val:'answer6'},
            {id:7,name:'Bỏ trị ARV',isCheck:false,val:'answer7'},
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
            // if (newVal == true) {
                vm.getEntry();
            // }
        });
        $scope.$watch('vm.entry.c6', function (newVal, oldVal) {
            if(newVal){
                vm.alertC6=false;
                if(vm.entry.c6 == "NO") {
                    vm.entry.c6Date = null;
                }
            }
        });

        $scope.$watch('vm.entry.c2', function (newVal, oldVal) {
            vm.getListStaff();
        });
        //Onchange Region
        vm.checkCode = function(){
            if(!vm.entry.c2){
                toastr.warning('Bạn cần chọn cơ sở trước!');
            }
            else{
                let checkCodeDto={};
                checkCodeDto.id=vm.entry.id;
                checkCodeDto.code=vm.entry.c4;
                checkCodeDto.orgId=vm.entry.c2.id;
                service.checkCode(checkCodeDto,
                    function success(data) {
                        blockUI.stop();
                    }, function failure() {
                        blockUI.stop();
                    }).then(function (data) {
                    blockUI.stop();
                    if(data.isDup){
                        toastr.warning(data.note);
                        focus('vm.entry.c4');
                    };
                });
            }
        };
        vm.c1Format= function(c1){
            let str="";
            if(c1 && c1.length>0){
                for(let item of c1){
                    if(str.length>0){
                        str+=", "+item.name;
                    }else{
                        str+=item.name
                    }
                }
            }
            return str;
        }
        //Get Data Region
        vm.c12CheckChange = function(e,index){
            let isCheckC12=false;
//            vm.alertC12 = false;
            for(let i=0;i<16;i++){
                if(vm.c12Values[i].isCheck==true){
                    isCheckC12=true;
                }
            }
            if(isCheckC12){
                vm.alertC12=false;
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
                //console.log("c3",data);
                vm.staffs = data.content;
                blockUI.stop();
            });
        };
        vm.checkDouble=false;

        vm.getListPnsWriteAble = function(isReadAble) {
            blockUI.start();
            service.getListPnsWriteAble(function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                vm.id = $stateParams.id;
                if(data && data.length > 0) {
                    vm.orgsWritable = data;
                    if(!vm.id){
                        vm.entry.c2=vm.orgsWritable[0];
                    }
                    
                } else {
                    if(!isReadable && !vm.id) {
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Thông báo");
                        $state.go('application.pns');
                    }
                }
            });
        };

        vm.getEntry = function () {
            // debugger;
            // block the view with a loading indicator
            vm.id = $stateParams.id;
            vm.type = $stateParams.type;
            vm.mapId = $stateParams.mapId;
            // if(!vm.id) {
            //     vm.getListPnsWriteAble();
            //     vm.entry.writAble = true;
            // }
            if(vm.id){
                blockUI.start();
                service.getEntry(vm.id, function success() {
                }, function failure() {
                  blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    // vm.checkReadOrWriteOrNull(data.c2.id);
                    vm.entry=data;
                    vm.isWrited = data.writAble;
                    if(!vm.entry.readAble && !vm.entry.writAble) {
                        toastr.warning("Bạn không có quyền đọc hoặc sửa bản ghi","Thông báo");
                        $state.go('application.pns');
                    }
                    vm.convertC5 = new Date(vm.entry.c5);
                    vm.c5Date.datePostSetup(vm.c5Date.fpItem);
                    vm.c6Date.datePostSetup(vm.c6Date.fpItem);
                    vm.c10Date.datePostSetup(vm.c10Date.fpItem);
                    if(vm.entry.c12 && vm.entry.c12.length>0){
                        for(let j=0;j<vm.entry.c12.length;j++){
                            for(let i=0;i<16;i++){
                                if(vm.c12Values[i].val==vm.entry.c12[j].val){
                                    vm.c12Values[i].isCheck=true;
                                    vm.c12Values[i].id=vm.entry.c12[j].id;
                                }
                            }
                        }
                    }
                    let isSiteManager = $scope.isSiteManager($scope.currentUser);
                    vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
                    // debugger;
                    vm.bsTableControl.options.data = vm.entry.contacts;
                    vm.bsTableControl.options.totalRows = data.totalElements;
                    
                    vm.getListPnsWriteAble(vm.isWrited);
                });
            }
            else if(vm.type && vm.mapId){
                //Nguồn HTS
                vm.entry.writAble = true;
                if(vm.type==1){
//                    vm.entry.htsCase={id:vm.mapId};
                    blockUI.start();
                    vm.checkHTSOROPC={
                        idHTS: vm.mapId,
                        type: 1
                    }
                    service.checkHTSOPC(vm.checkHTSOROPC, function success() {
                    }, function failure() {
                      blockUI.stop();
                    }).then(function (data) {
                        if(data.code=="YES"){
                            blockUI.stop();
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
                                }else{
                                    $state.go('application.pns');
                                    return;
                                }
                            });
                            
                        }else{
                            htsEditService.getEntry(vm.mapId, function success() {
                            }, function failure() {
                              blockUI.stop();
                            }).then(function (data) {
                                blockUI.stop();
                                vm.entry.htsCase = data;
                                vm.entry.c2 = data.c2;
                                vm.entry.c3 = data.c3;
                                vm.entry.c7 = data.c23FullName;
                                vm.entry.c8 = data.c7;
                                vm.entry.c9 = data.c8;
                                vm.entry.c6 = data.c22;
                                vm.entry.c12 = data.c9;
                                if(vm.entry.c12 && vm.entry.c12.length>0){
                                    for(let j=0;j<vm.entry.c12.length;j++){
                                        for(let i=0;i<16;i++){
                                            if(vm.c12Values[i].val==vm.entry.c12[j].val){
                                                vm.c12Values[i].isCheck=true;
                                                vm.c12Values[i].id=vm.entry.c12[j].id;
                                            }
                                        }
                                    }
                                }
                                vm.c5Date.datePostSetup(vm.c5Date.fpItem);
                                vm.c6Date.datePostSetup(vm.c5Date.fpItem);
                                vm.c10Date.datePostSetup(vm.c10Date.fpItem);
                            });
                        }
                    });
                    
                }
                //Nguồn OPC-ASSIT
                else if(vm.type==2){
                    vm.entry.writAble = true;
//                    vm.entry.hivCase={id:vm.mapId};
                    blockUI.start();
                    vm.checkHTSOROPC={
                        idOPC: vm.mapId,
                        type: 2
                    }
                    service.checkHTSOPC(vm.checkHTSOROPC, function success() {
                    }, function failure() {
                      blockUI.stop();
                    }).then(function (data) {
                        if(data.code=="YES"){
                            blockUI.stop();
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
                            patientService.getPatient(vm.mapId, function success() {
                            }, function failure() {
                              blockUI.stop();
                            }).then(function (data) {
                                blockUI.stop();
                                vm.entry.hivCase = data;
                                vm.entry.c7 = data.theCase.person.fullname;
                                vm.entry.c8 = data.theCase.person.gender;
                                vm.entry.c10 = data.theCase.hivConfirmDate;
                                vm.c5Date.datePostSetup(vm.c5Date.fpItem);
                                vm.c6Date.datePostSetup(vm.c5Date.fpItem);
                                vm.c10Date.datePostSetup(vm.c10Date.fpItem);
                            });
                        }
                    });
                }
                //Ca mới
                else{
                    vm.entry={};
                    vm.entry.writAble = true;
                }
            };
        };

        vm.cancel = function(){
            $state.go('application.pns');
        };

        $scope.viewEntry = function(id) {
            // debugger
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
            // debugger;
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
        vm.addContact = function(){
            $state.go('application.pns_add_contact',{pnsId:vm.entry.id});
        }
        vm.addPNS = function(){
            $state.go('application.pns_add');
            vm.modalInstance.close();
            window.scrollTo(0, 0);
            let c2OrgTemp = vm.entry.c2;
            let c3StaffTemp = vm.entry.c3;
            vm.entry = {};
            vm.entry.c2 = c2OrgTemp;
            vm.entry.c3 = c3StaffTemp;
            vm.c10Date.clear();
            vm.c5Date.clear();
            for(let i=0;i<16;i++){
                vm.c12Values[i].isCheck=false;
            }
        }
        vm.c8Change=function(){
            vm.alertC8=false;
            if(vm.entry.c8=='FEMALE'){
                vm.c12Values[1].isCheck=false;
            }
            if(vm.entry.c8=='MALE'){
                vm.c12Values[7].isCheck=false;
                vm.c12Values[14].isCheck=false;
            }
        }

        vm.validate=function(){
            // if(vm.entry.id || (vm.entry.parent && vm.entry.parent.id)) {
            //     console.log("vanduc");
            //     console.log(vm.convertC5);
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

            if(!vm.entry.c2){
                toastr.warning("Vui lòng chọn tên cơ sở","Thông báo");
                openSelectBox('vm.entry.c2');
                //focusFlatPick('vm.entry.c2');
                return;
            }
            if(!vm.entry.c3){
                toastr.warning("Vui lòng chọn họ tên tư vấn viên","Thông báo");
                openSelectBox('vm.entry.c3');
                //focus("vm.entry.c3");
                return;
            }
            if(!vm.entry.c4){
                toastr.warning("Vui lòng nhập mã số khách hàng","Thông báo");
                focus("vm.entry.c4");
                return;
            }
            if(!vm.entry.c5){
                toastr.warning("Vui lòng chọn Ngày tư vấn dịch vụ TBXNBT/BC","Thông báo");
                focusFlatPick("vm.entry.c5");
                return;
            }
            if(!vm.entry.c6){
                toastr.warning("Vui lòng nhập thông tin Đồng ý nhận dịch vụ TBXNBT/BC của khách hàng","Thông báo");
                focus("vm.entry.c6");
                vm.alertC6=true;
                return;
            }
            if(!vm.entry.c6Date && vm.entry.c6=="YES"){
                toastr.warning("Vui lòng chọn Ngày đồng ý nhận dịch vụ","Thông báo");
                focusFlatPick("vm.entry.c6Date");
                return;
            }
            if(!vm.entry.c7){
                toastr.warning("Vui lòng nhập Họ tên người có HIV","Thông báo");
                focus("vm.entry.c7");
                return;
            }
            if(!vm.entry.c8){
                toastr.warning("Vui lòng nhập Giới tính khi sinh","Thông báo");
                focus("vm.entry.c8");
                vm.alertC8=true;
                return;
            }
            if(!vm.entry.c9){
                toastr.warning("Vui lòng chọn Ngày đồng ý nhận dịch vụ","Thông báo");
                openSelectBox("vm.entry.c9");
                return;
            }
            if(!vm.entry.c10){
                toastr.warning("Vui lòng nhập Ngày XN khẳng định HIV+","Thông báo");
                focusFlatPick("vm.entry.c10");
                return;
            }
            if(!vm.entry.c11){
                toastr.warning("Vui lòng nhập Tình trạng ĐT ARV","Thông báo");
                openSelectBox("vm.entry.c11");
                return;
            }
            let isCheckC12=false;
            for(let i=0;i<16;i++){
                if(vm.c12Values[i].isCheck==true){
                    isCheckC12=true;
                }
            }
            if(!isCheckC12){
                toastr.warning("Vui lòng chọn 1 trong các nhóm nguy cơ của khách hàng","Thông báo");
                focus("vm.c12Values[0]");
                vm.alertC12=true;
                return;
            }
            if(vm.c12Values[15].isCheck==true && !vm.entry.c12Note){
                toastr.warning("Vui lòng ghi rõ lí do","Thông báo");
                focus("vm.entry.c12Note");
                return;
            }
            return true;
        }
        /**
         * Save a new/existing entry
         */
        vm.saveEntry = function () {
            
            // validate the entry title, make sure it is not null or empty
//            if (!vm.entry.title || vm.entry.title.trim().length <= 0) {
//                toastr.error('Vui lòng nhập tiêu đề của thông báo.', 'Thông báo');
//                return;
//            }
            if(vm.validate()){
                blockUI.start();
                //console.log(vm.entry);
                vm.entry.c12=[];
                for(let i=0;i<16;i++){
                    if(i==14 && vm.entry.c7=='MALE'){
                        vm.c12Values[i].isCheck=false;
                    }
                    if(i==7 && vm.entry.c7=='MALE'){
                        vm.c12Values[i].isCheck=false;
                    }
                    if(i==1 && vm.entry.c7=='FEMALE'){
                        vm.c12Values[i].isCheck=false;
                    }
                    if(vm.c12Values[i].isCheck==true){
                        vm.entry.c12.push(vm.c12Values[i]);
                    }
                }
                //console.log("c9",vm.entry.c12);
                service.saveEntry(vm.entry, function success() {
                    blockUI.stop();
                    toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                }, function failure() {
                    blockUI.stop();
                    toastr.error('Có lỗi xảy ra khi lưu.', 'Thông báo');
                }).then(function (data) {
                    vm.entry=data;
                    blockUI.stop();
                    toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: '_alert_add_contact_modal.html',
                        scope: $scope,
                        size: 'lg'
                    });
//                    if(vm.entry!=null && vm.entry.c6=='YES'){
//                        $state.go('application.pns_add_contact',{pnsId:vm.entry.id})
//                    }
//                    else{
//                        $state.go('application.pns');
//                    }
                });
            }
            
        };

        $scope.deleteContactEntry = function (id) {
            debugger;

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
                            vm.getEntry();
                        });
                    // });
                }
            });
        };

        /**
        DateTime Region
        **/
        vm.c5Date = {
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
                        vm.entry.c5 = m.add(7, 'hours').toDate();
                    }
//                    if(moment(vm.entry.c4).year()<vm.entry.c8){
//                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
//                        focusFlatPick('vm.entry.c4');
//                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c5Date.fpItem = fpItem;
                if (vm.entry.c5 && fpItem) {
                    fpItem.setDate(moment(vm.entry.c5).toDate());
                }
            },
            clear: function() {
                if (vm.c5Date.fpItem) {
                    vm.c5Date.fpItem.clear();
                    vm.entry.c5 = null;
                }
            }
        };
        vm.c10Date = {
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
                       vm.entry.c10 = m.add(7, 'hours').toDate();
                   }
//                   if(moment(vm.entry.c4)>vm.entry.c10 && vm.entry.c4){
//                    toastr.warning('Ngày nhận dịch vụ đang nhỏ hơn ngày tư vấn trước XN HIV');
//                    focusFlatPick('vm.entry.c10');
//                    }
               }],
           },
           datePostSetup: function(fpItem) {
               vm.c10Date.fpItem = fpItem;
               if (vm.entry.c10 && fpItem) {
                   fpItem.setDate(moment(vm.entry.c10).toDate());
               }
           },
           clear: function() {
               if (vm.c10Date.fpItem) {
                   vm.c10Date.fpItem.clear();
                   vm.entry.c10 = null;
               }
           }
       };


        vm.c6Date = {
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
                           vm.entry.c6Date = m.add(7, 'hours').toDate();
                        }
//                        if(moment(vm.entry.c4)>vm.entry.c6Date && vm.entry.c4){
//                            toastr.warning('Ngày quay lại nhận KQXN đang nhỏ hơn ngày tư vấn ');
//                            focusFlatPick('vm.entry.c6Date');
//                        }
                   }],
               },
               datePostSetup: function(fpItem) {
                   vm.c6Date.fpItem = fpItem;
                   if (vm.entry.c6Date && fpItem) {
                       fpItem.setDate(moment(vm.entry.c6Date).toDate());
                   }
               },
               clear: function() {
                   if (vm.c6Date.fpItem) {
                       vm.c6Date.fpItem.clear();
                       vm.entry.c6Date = null;
                   }
               }
        };

        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
                height: 400,
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
    }

})();
