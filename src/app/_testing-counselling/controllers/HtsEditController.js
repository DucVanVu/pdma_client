/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.HTS').controller('HtsEditController', HtsEditController);

    HtsEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',
        'HtsEditService',
        '$stateParams',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        '$state',
        '$uibModal'
    ];

    function HtsEditController($rootScope, $scope, $http, $timeout, settings, $uibModal, toastr, blockUI, $sce, service, $stateParams,focus,focusFlatPick, openSelectBox,Utilities,$state,modal) {
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
        vm.convertC4Date = null;
        
        vm.tempAge = null;

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
        vm.orgsDeleteable=[];

        vm.c5Values=[
            {id:1,name:'Khoa phòng bệnh viện (không bao gồm PKNT HIV)',isCheck:false,val:'answer1'},
            {id:2,name:'Cơ sở TVXN HIV (VCT, PKNT, MMT, PrEP, trại giam)',isCheck:false,val:'answer2'},
            {id:3,name:'Mô hình tiếp cận mạng lưới xã hội (SNS)',isCheck:false,val:'answer3'}
        ];

        vm.c5NoteValues=[
            {id:1,name:'Tư vấn xét nghiệm tự nguyện (VCT)',isCheck:false,val:'answer1'},
            {id:2,name:'TVXN HIV tại phòng khám ngoại trú',isCheck:false,val:'answer2'},
            {id:3,name:'TVXN HIV tại cơ sở điều trị Methadone',isCheck:false,val:'answer3'},
            {id:4,name:'TVXN HIV tại cơ sở điều trị PrEP',isCheck:false,val:'answer4'},
            {id:5,name:'TVXN HIV tại trại giam, trại tạm giam',isCheck:false,val:'answer5'},
            {id:6,name:'TVXN HIV tại các cơ sở khác',isCheck:false,val:'answer6'}
        ];

        vm.years=[];
        let currentYear = moment().year();
        for(let i=moment().year();i>1919;i--){
            let year={ id: i, name: i};
            vm.years.push(year);
        };
        vm.c9Values=[
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
        vm.c10Values=[
            {id:1,name:'Khách hàng tự đến',isCheck:false,val:'answer1'},
            {id:2,name:'Dịch vụ TBXNBT/BC của người có HIV',isCheck:false,val:'answer2'},
            {id:3,name:'Chương trình tiếp cận cộng đồng',isCheck:false,val:'answer3'},
            {id:4,name:'Khác (ghi rõ)',isCheck:false,val:'answer4'}
        ];
//        vm.c10Values=[
//            {id:1,name:'Khách hàng tự đến',isCheck:false,val:'answer1'},
//            {id:2,name:'Dịch vụ TBXNBT/BC của người có HIV',isCheck:false,val:'answer2'},
//            {id:3,name:'Chương trình tiếp cận cộng đồng',isCheck:false,val:'answer3'},
//            {id:4,name:'Khác (ghi rõ)',isCheck:false,val:'answer4'}
//        ];
//        vm.c11Values=[
//            {id:1,name:'Có',isCheck:false,val:'YES'},
//            {id:2,name:'Không',isCheck:false,val:'NO'}
//        ];
        vm.c11aValues=[
            {id:1,name:'Dịch miệng',isCheck:false,val:'answer1'},
            {id:2,name:'Máu mao mạch đầu ngón tay',isCheck:false,val:'answer2'},
            {id:3,name:'Khác (ghi rõ)',isCheck:false,val:'answer3'}
        ];
        vm.c11bValues=[
            {id:1,name:'Tự làm xét nghiệm',isCheck:false,val:'answer1'},
            {id:2,name:'XN do nhóm cộng đồng thực hiện bao gồm tự XN có hỗ trợ',isCheck:false,val:'answer2'},
            {id:3,name:'Xét nghiệm do y tế xã/phường thực hiện',isCheck:false,val:'answer3'}
        ];
        vm.c11cValues=[
            {id:1,name:'Không',isCheck:false,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'answer1',val:'YES'}
        ];
        vm.c12Values=[
            {id:1,name:'Chưa bao giờ XN HIV',isCheck:true,val:'answer1'},
            {id:2,name:'Có, kết quả XN âm tính',isCheck:false,val:'answer2'},
            {id:3,name:'Có, kết quả XN dương tính',isCheck:false,val:'answer3'},
            {id:4,name:'Có, không xác định hoặc không biết kết quả XN',isCheck:false,val:'answer4'}
        ];
        vm.c131Values=[
            {id:1,name:'a. ≤ 12 tháng',isCheck:false,val:'answer1'},
            {id:2,name:'b. > 12 tháng',isCheck:false,val:'answer2'}
        ];
        vm.c132Values=[
            {id:1,name:'Chưa bao giờ điều trị ARV',isCheck:false,val:'answer1'},
            {id:2,name:'Đang điều trị ARV',isCheck:false,val:'answer2'},
            {id:3,name:'Đã bỏ điều trị ARV',isCheck:false,val:'answer3'}
        ];
        vm.c14Values=[
            {id:1,name:'Âm tính',isCheck:false,val:'answer1'},
            {id:2,name:'Dương tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không xác định',isCheck:false,val:'answer3'},
            {id:4,name:'Không làm xét nghiệm',isCheck:false,val:'answer4'}
        ];
        vm.c15Values=[
            {id:1,name:'Không',isCheck:true,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'},
            {id:3,name:'Chưa có thông tin',isCheck:false,val:'NO_INFORMATION'}
        ];
        vm.c1627Values=[
            {id:1,name:'Không',isCheck:true,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.c17Values=[
            {id:1,name:'Mới nhiễm HIV',isCheck:false,val:'answer1'},
            {id:2,name:'Nhiễm HIV đã lâu',isCheck:false,val:'answer2'},
            {id:3,name:'KH không đủ tiêu chuẩn làm XN nhiễm mới',isCheck:false,val:'answer3'},
            {id:4,name:'KH từ chối không làm XN nhiễm mới',isCheck:false,val:'answer4'},
            {id:5,name:'Cơ sở không thực hiện XN nhiễm mới',isCheck:false,val:'answer5'}
        ];
        vm.c18Values=[
            {id:1,name:'< 1.000 bản sao/ml',isCheck:false,val:'answer1'},
            {id:2,name:'≥ 1.000 bản sao/ml',isCheck:false,val:'answer2'},
            {id:3,name:'Không làm XN tải lượng vi-rút',isCheck:false,val:'answer3'},
            {id:3,name:'Đang chờ kết quả XN Tải lượng virus',isCheck:false,val:'answer4'}
        ];
        vm.c20Values=[
            {id:1,name:'Chưa có thông tin',isCheck:false,val:'answer1'},
            {id:2,name:'Không',isCheck:false,val:'answer2'},
            {id:3,name:'Có',isCheck:false,val:'answer3'}
        ];
        vm.c21Values = [
            {id:1,name:'Không',isCheck:true,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.c22Values= [
            {id:1,name:'Không',isCheck:true,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.c24Values=[
            {id:1,name:'Khách hàng dương tính mới',isCheck:false,val:'answer1'},
            {id:2,name:'Khách hàng dương tính cũ',isCheck:false,val:'answer2'},
            {id:3,name:'Đang chờ kết quả xác minh',isCheck:false,val:'answer3'}
        ];
        vm.c25Values=[
            {id:1,name:'Không',isCheck:false,val:'NO'},
            {id:2,name:'Có',isCheck:false,val:'YES'}
        ];
        vm.c26Values=[
            {id:1,name:'Âm tính',isCheck:false,val:'answer1'},
            {id:2,name:'Dương tính',isCheck:false,val:'answer2'},
            {id:3,name:'Không làm xét nghiệm Giang mai',isCheck:false,val:'answer3'}
        ];

        vm.c28Values=[
            {id:1,name:'Để XN HIV',isCheck:false,val:'answer1'},
            {id:2,name:'Để XN giang mai',isCheck:false,val:'answer2'},
            {id:3,name:'Để XN cả HIV và giang mai',isCheck:false,val:'answer3'},
            {id:4,name:'Do dịch vụ PrEP chuyển gửi XN',isCheck:false,val:'answer4'}
        ];

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();
        });

        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            // if (newVal == true) {
                // vm.orgsWritable = $scope.assignedOrgs.writable;
                // vm.orgsReadable = $scope.assignedOrgs.readable;
                // vm.orgsDeleteable = $scope.assignedOrgs.deletable;
                // if ((!vm.orgsWritable || vm.orgsWritable.length == 0) && 
                //     (!vm.orgsReadable || vm.orgsReadable.length == 0) && 
                //     (!vm.orgsDeleteable || vm.orgsDeleteable.length == 0)) {
                //         $state.go('application.prev_dashboard');
                // }
                // Getting Entry for editing
                vm.getEntry();
            // }
        });

        $scope.$watch('vm.entry.c2', function (newVal, oldVal) {
            vm.getListStaff();
        });
        
        $scope.$watch('vm.entry.c8', function (newVal, oldVal) {
            if(newVal) {
                vm.tempAge = new Date().getFullYear() - vm.entry.c8;
                if(vm.tempAge<15) {
                    for(let i=0; i<4; i++) {
                        if(vm.c9Values[i].isCheck==true){
                            vm.c9Values[i].isCheck=false;
                        }
                    }
                    if(vm.c9Values[6].isCheck==true){
                        vm.c9Values[6].isCheck=false;
                    }
                }
            }
        });

        $scope.$watch('vm.entry.c12', function (newVal, oldVal) {
            if(vm.entry.c12 && vm.entry.c12 == 'answer3' && vm.entry.c24 && vm.entry.c24 == 'answer1') {
                vm.entry.c24 = null;
            }
        });

        $scope.$watch('vm.entry.c23ResidentAddressProvince', function (newVal, oldVal) {
            if(newVal){
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=newVal.id;

                if(vm.checkDouble==true){
                    vm.entry.c23CurrentAddressProvince=newVal;
                    vm.entry.c23CurrentAddressDistrict=vm.entry.c23ResidentAddressDistrict;
                    vm.entry.c23CurrentAddressWard=vm.entry.c23ResidentAddressWard;
                    vm.entry.c23CurrentAddressDetail=vm.entry.c23ResidentAddressDetail;
                }

                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.reDistricts = data;
                });
            }
        });
        $scope.$watch('vm.entry.c23ResidentAddressDistrict', function (newVal, oldVal) {
            if(newVal){
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=vm.entry.c23ResidentAddressDistrict.id;

                if(vm.checkDouble==true){
                    vm.entry.c23CurrentAddressProvince=vm.entry.c23ResidentAddressProvince;
                    vm.entry.c23CurrentAddressDistrict=vm.entry.c23ResidentAddressDistrict;
                    vm.entry.c23CurrentAddressWard=vm.entry.c23ResidentAddressWard;
                    vm.entry.c23CurrentAddressDetail=vm.entry.c23ResidentAddressDetail;
                }

                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.reCommunes = data;
                });
            }
        });

        $scope.$watch('vm.entry.c23CurrentAddressProvince', function (newVal, oldVal) {
            if(newVal){
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=vm.entry.c23CurrentAddressProvince.id;
                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.curDistricts = data;
                });
            }
        });
        $scope.$watch('vm.entry.c23CurrentAddressDistrict', function (newVal, oldVal) {
            if(newVal){
                let adminUnitFilter={};
                adminUnitFilter.excludeVoided=true;
                adminUnitFilter.parentId=vm.entry.c23CurrentAddressDistrict.id;
                blockUI.start();
                service.getAdminUnit(adminUnitFilter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.curCommunes = data;
                });
            }
        });


        vm.getEthnic = function(){
            blockUI.start();
            service.getDictionary(13, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.ethnics = data;
                blockUI.stop();
            });
        }
        vm.getEthnic();
        vm.getProfessions = function(){
            blockUI.start();
            service.getDictionary(1, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.professions = data;
                blockUI.stop();
            });
        }
        vm.getProfessions();


        //Onchange Region
        vm.changeOrg = function(){

        };
        vm.checkCode = function(){
            if(!vm.entry.c2){
                toastr.warning('Bạn cần chọn cơ sở trước!');
            }
            else{
                let checkCodeDto={};
                checkCodeDto.id=vm.entry.id;
                checkCodeDto.code=vm.entry.c6;
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
                        focus('vm.entry.c6');
                    };
                });
            }
        };
        //Get Data Region
        vm.c9CheckChange = function(e,index){
            let isCheckC9=false;
            for(let i=0;i<16;i++){
                if(vm.c9Values[i].isCheck==true){
                    isCheckC9=true;
                }
            }
            if(isCheckC9){
                vm.alertC9=false;
            }
        };
        vm.c28CheckChange = function(e,index){
            let isCheckC28=false;
            for(let i=0;i<4;i++){
                if(vm.c28Values[i].isCheck==true){
                    isCheckC28=true;
                }
            }
            if(isCheckC28){
                vm.alertC28=false;
            }
            if(e.isCheck==true){
                for(let i=0;i<4;i++){
                    if(i != index){
                        vm.c28Values[i].isCheck=false;
                    }
                }
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
            if(vm.id){
                blockUI.start();
                service.getEntry(vm.id, function success() {
                }, function failure() {
                  blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();
                    vm.entry=data;
                    if(!vm.entry.readAble && !vm.entry.writAble) {
                        toastr.warning("Bạn không có quyền đọc hoặc sửa bản ghi","Thông báo");
                        $state.go('application.hts');
                    }
                    vm.tempAge = new Date().getFullYear() - vm.entry.c8;
                    // vm.convertC4Date = new Date(vm.entry.c4);
                    vm.c4Date.datePostSetup(vm.c4Date.fpItem);
                    if(vm.entry.c9 && vm.entry.c9.length>0){
                        for(let j=0;j<vm.entry.c9.length;j++){
                            for(let i=0;i<16;i++){
                                if(vm.c9Values[i].val==vm.entry.c9[j].val){
                                    vm.c9Values[i].isCheck=true;
                                    vm.c9Values[i].id=vm.entry.c9[j].id;
                                }
                            }
                        }
                    }
                    if(vm.entry.c28){
                        for(let i=0;i<4;i++){
                            if(vm.c28Values[i].val==vm.entry.c28){
                                vm.c28Values[i].isCheck=true;
                                //vm.c28Values[i].id=vm.entry.c28;
                            }
                        }
                    }
                    
                    if((vm.entry.c23CurrentAddressProvince && vm.entry.c23ResidentAddressProvince && vm.entry.c23CurrentAddressProvince.id==vm.entry.c23ResidentAddressProvince.id )
                        && (vm.entry.c23CurrentAddressDistrict && vm.entry.c23ResidentAddressDistrict && vm.entry.c23CurrentAddressDistrict.id==vm.entry.c23ResidentAddressDistrict.id )
                        && vm.entry.c23CurrentAddressWard==vm.entry.c23ResidentAddressWard 
                        && vm.entry.c23CurrentAddressDetail==vm.entry.c23ResidentAddressDetail){
                        vm.checkDouble=true;
                    }
                    
                    if(vm.entry.c15 == 'NO_INFORMATION'){
                        vm.alertC15=true;
                    }
                    if(vm.entry.c18 == 'answer4'){
                        vm.alertC18=true;
                    }
                    if(vm.entry.c24 == 'answer3'){
                        vm.alertC24=true;
                    }
                    if(vm.entry.c14 == 'answer1' && vm.entry.c15 == 'YES' && !vm.entry.c1627){
                        vm.alertC1627=true;
                    }
                    if(vm.entry.c20 == 'answer1'){
                        vm.alertC20=true;
                    }
                    if(vm.entry.c15 == 'NO_INFORMATION' || vm.entry.c18 == 'answer4' ||
                    vm.entry.c24 == 'answer3' || vm.entry.c20 == 'answer1' ||
                    (vm.entry.c14 == 'answer1' && vm.entry.c15 == 'YES' && !vm.entry.c1627)){
                        toastr.warning("Cần bổ sung các câu trả lời có cảnh báo để hoàn thành phiếu!","Thông báo");
                    }
                    vm.getListHtsWriteAble(vm.entry.readAble);
                });
            } else {
                vm.entry.writAble = true;
                vm.entry.editAble = true;
                vm.getListHtsWriteAble();
            }
        };

        vm.getListHtsWriteAble = function(isReadAble) {
            blockUI.start();
            service.getListHtsWriteAble(function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                let id = $stateParams.id;
                if(data && data.length > 0) {
                    vm.orgsWritable = data;
                    if(!id){
                        vm.entry.c2=vm.orgsWritable[0];
                    }
                    // vm.entry.writAble = true;
                    
                } else {
                    if(!isReadAble && !id) {
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Thông báo");
                        $state.go('application.hts');
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
            $state.go('application.hts');
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
        vm.c7Change=function(){
            vm.alertC7=false;
            if(vm.entry.c7=='FEMALE'){
                vm.c9Values[1].isCheck=false;
            }
            if(vm.entry.c7=='MALE'){
                vm.c9Values[7].isCheck=false;
                vm.c9Values[14].isCheck=false;
            }
        }
        vm.popupC17=false;
        vm.setNullIsHidenC10= function(){
            if(vm.entry.c10){
                vm.entry.c10Note=null;
            }
        }
        vm.setNullIsHiden= function(){
            if(vm.entry.c5!='answer2'){
                vm.entry.c5Note=null;
            }
            if(vm.c9Values[15].isCheck!=true){
                vm.entry.c9Note=null;
            }
            if(vm.entry.c11=="NO"){
                vm.entry.c11a=null;
                vm.entry.c11aNote=null;
                vm.entry.c11b=null;
                vm.entry.c11c=null;
                vm.entry.c11cNote=null;
            }
            if(vm.entry.c11){
                vm.alertC11=false;
            }
            if(vm.entry.c11=="YES"){
                if(vm.entry.c11a!='answer3' &&  vm.entry.c11a){
                    vm.entry.c11aNote=null;
                }
                if(vm.entry.c11c!='YES'){
                    vm.entry.c11cNote=null;
                }
                if(vm.entry.c11c){
                    vm.alertC11c=false;
                }
            }
            if(vm.entry.c12!='answer3'){
                vm.entry.c131=null;
                vm.entry.c132=null;
            }
            if(vm.entry.c131){
                vm.alertC131=false;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer4'){
                vm.entry.c15=null;
                vm.entry.c15Date=null;
                vm.c28Values[0].isCheck=false;
                vm.c28Values[2].isCheck=false;
            }
            if(vm.entry.c14!='answer4' && vm.entry.c15!='YES'){
                vm.entry.c15Date=null;
            }
            if(!(vm.entry.c14 && ( (vm.entry.c14=='answer1'  && vm.entry.c15=='YES') || (vm.entry.c26 && vm.entry.c26!='answer3' && vm.entry.c14!='answer2')))){
                vm.entry.c1627=null;
                vm.entry.c1627Note=null;
                vm.entry.c1627Date=null;
            }
            if(vm.entry.c14 && ( (vm.entry.c14=='answer1'  && vm.entry.c15=='YES') || (vm.entry.c26 && vm.entry.c26!='answer3' && vm.entry.c14!='answer2')) && vm.entry.c1627!="YES"){
                vm.entry.c1627Note=null;
                vm.entry.c1627Date=null;
            }
            if(vm.entry.c14!='answer2'){
                vm.entry.c17=null;
                vm.entry.c19=null;
                vm.entry.c19Date=null;
                vm.entry.c19Note=null;
            }
            if(vm.entry.c17!='answer1'){
                vm.entry.c18=null;
            }
            if(vm.entry.c18 && vm.entry.c18!='answer4' && vm.id){
                vm.alertC18=false;
            }
            if(vm.entry.c18=='answer4' && vm.id){
                vm.alertC18=true;
            }
            if(vm.entry.c17=='answer3' && vm.popupC17 == false){
                vm.popupC17=true;
                vm.modalC17 = modal.open({
                    animation: true,
                    templateUrl: 'c17Popup.html',
                    scope: $scope,
                    size: 'md'
                });
            }
            if(!(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES')){
                vm.entry.c20=null;
                vm.entry.c20Reason=null;
                vm.entry.c20Org=null;
                vm.entry.c20RegDate=null;
                vm.entry.c20Code=null;
                vm.entry.c21=null;
                vm.entry.c21Date=null;
                vm.entry.c22=null;
                vm.entry.c23FullName=null;
                vm.entry.c23Ethnic=null;
                vm.entry.c23Profession=null;
                vm.entry.c23HealthNumber=null;
                vm.entry.c23IdNumber=null;
                vm.entry.c23PhoneNumber=null;
                vm.entry.c23Note=null;
                vm.entry.c23ResidentAddressProvince=null;
                vm.entry.c23ResidentAddressDistrict=null;
                vm.entry.c23ResidentAddressWard=null;
                vm.entry.c23ResidentAddressDetail=null;
                vm.checkDouble=false;
                vm.entry.c23CurrentAddressProvince=null;
                vm.entry.c23CurrentAddressDistrict=null;
                vm.entry.c23CurrentAddressWard=null;
                vm.entry.c23CurrentAddressDetail=null;
                vm.entry.c24=null;
            }
            if((vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES')){
                if(vm.entry.c20!='answer2'){
                    vm.entry.c20Reason=null;
                }
                if(vm.entry.c20!='answer3'){
                    vm.entry.c20Org=null;
                    vm.entry.c20RegDate=null;
                    vm.entry.c20Code=null;
                }
                if(vm.entry.c21!='YES'){
                    vm.entry.c21Date=null;
                    vm.entry.c22=null;
                }
                if(vm.entry.c20 != 'answer1' && vm.entry.c20 && vm.id){
                    vm.alertC20=false;
                }
                if(vm.entry.c20 == 'answer1' && vm.id){
                    vm.alertC20=true;
                }
                
            }
            if(vm.entry.c26=='answer3'){
                vm.entry.c25=null;
                vm.c28Values[1].isCheck=false;
                vm.c28Values[2].isCheck=false;
            }
            if((vm.entry.c15 && !vm.id) || (vm.entry.c15 && vm.entry.c15!='NO_INFORMATION' && vm.id)){
                vm.alertC15=false;
            }
            if(vm.entry.c1627){
                vm.alertC1627=false;
            }
            if(vm.entry.c21){
                vm.alertC21=false;
            }
            if(vm.entry.c22){
                vm.alertC22=false;
            }
            if((vm.entry.c24 && !vm.id) || (vm.entry.c24 && vm.entry.c24!='answer3' && vm.id)){
                vm.alertC24=false;
            }
            if(vm.entry.c25){
                vm.alertC25=false;
            }
            if(vm.entry.c26 && vm.entry.c14 && ( (vm.entry.c26!="answer3") || (vm.entry.c14!="answer4") )){
                vm.alertC26=false;
                vm.alertC14=false;
            } 
                          
        }
        
        vm.checkDoubleAddress = function(){
            //vm.checkDouble= !(vm.checkDouble);
            if(vm.checkDouble==true){
                vm.entry.c23CurrentAddressProvince=vm.entry.c23ResidentAddressProvince;
                vm.entry.c23CurrentAddressDistrict=vm.entry.c23ResidentAddressDistrict;
                vm.entry.c23CurrentAddressWard=vm.entry.c23ResidentAddressWard;
                vm.entry.c23CurrentAddressDetail=vm.entry.c23ResidentAddressDetail;
            }
        }

        vm.validate=function() {
            // if(vm.entry.id) {
            //     let c4Convert = vm.convertC4Date.getMonth()+1;
            //     let calculateQuarter = null;
            //     if(c4Convert>0 && c4Convert<4) {
            //         calculateQuarter = 1;
            //     } else if(c4Convert>3 && c4Convert<7) {
            //         calculateQuarter = 2;
            //     } else if(c4Convert>6 && c4Convert<10) {
            //         calculateQuarter = 3;
            //     } else if(c4Convert>9 && c4Convert<13) {
            //         calculateQuarter = 4;
            //     }
            //     let changeByQuarter = new Date(vm.convertC4Date.getFullYear(), vm.convertC4Date.getMonth(), vm.convertC4Date.getDate());
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
                toastr.warning("Vui lòng chọn ngày tư vấn trước XN HIV","Thông báo");
                focusFlatPick("vm.entry.c4");
                return;
            }
            if(!vm.entry.c5){
                toastr.warning("Vui lòng chọn loại hình dịch vụ TVXN HIV","Thông báo");
                openSelectBox("vm.entry.c5");
                return;
            }
            if(vm.entry.c5=='answer2' && !vm.entry.c5Note){
                toastr.warning("Vui lòng chọn lí do của loại hình dịch vụ TVXN HIV","Thông báo");
                openSelectBox("vm.entry.c5Note");
                return;
            }
            if(!vm.entry.c6){
                toastr.warning("Vui lòng nhập mã số khách hàng","Thông báo");
                focus("vm.entry.c6");
                return;
            }
            if(!vm.entry.c7){
                toastr.warning("Vui lòng chọn giới tính khi sinh ở mục C7","Thông báo");
                focus("vm.entry.c7Male");
                vm.alertC7=true;
                return;
            }
            if(!vm.entry.c8){
                toastr.warning("Vui lòng chọn năm sinh","Thông báo");
                openSelectBox("vm.entry.c8");
                return;
            }
            let isCheckC9=false;
            for(let i=0;i<16;i++){
                if(vm.c9Values[i].isCheck==true){
                    isCheckC9=true;
                }
            }
            if(!isCheckC9){
                toastr.warning("Vui lòng chọn 1 trong các nhóm nguy cơ của khách hàng","Thông báo");
                focus("vm.c9Values[0]");
                vm.alertC9=true;
                return;
            }
            if(vm.c9Values[15].isCheck==true && !vm.entry.c9Note){
                toastr.warning("Vui lòng ghi rõ lí do","Thông báo");
                focus("vm.entry.c9Note");
                return;
            }
            if(!vm.entry.c10){
                toastr.warning("Vui lòng chọn lí do khách hàng chuyển đến","Thông báo");
                openSelectBox("vm.entry.c10");
                return;
            }
            if(!vm.entry.c10Note && vm.entry.c10 && vm.entry.c10!='answer1'){
                toastr.warning("Vui lòng ghi rõ lí do của khách hàng do ai giới thiệu/chuyển đến?","Thông báo");
                focus("vm.entry.c10Note");
                return;
            }
            if(!vm.entry.c11){
                toastr.warning("Vui lòng chọn Khách hàng đã có KQ XN phản ứng trước khi đến và cần làm XN HIV khẳng định mục C11","Thông báo");
                focus('vm.entry.c11NO');
                vm.alertC11=true;
                return;
            }
            if(vm.entry.c11=='YES' && !vm.entry.c11a){
                toastr.warning("Vui lòng chọn XN HIV có phản ứng với","Thông báo");
                openSelectBox('vm.entry.c11a');
                return;
            }
            if(vm.entry.c11=='YES' && vm.entry.c11a=='answer3' && !vm.entry.c11aNote){
                toastr.warning("Vui lòng ghi rõ phản ứng khi XN HIV","Thông báo");
                focus('vm.entry.c11aNote');
                return;
            }
            if(vm.entry.c11=='YES' && !vm.entry.c11b){
                toastr.warning("Vui lòng chọn KH đã sử dụng hình thức TVXN HIV nào?","Thông báo");
                openSelectBox('vm.entry.c11b');
                return;
            }
            if(vm.entry.c11=='YES' && (!vm.entry.c10 || vm.entry.c10!='answer1') && !vm.entry.c11c){
                toastr.warning("Vui lòng chọn thông tin có phiếu chuyển gửi?","Thông báo");
                openSelectBox('c11c_1');
                vm.alertC11c=true;
                return;
            }
            
            if(vm.entry.c11=='YES' && vm.entry.c11c=='YES' && !vm.entry.c11cNote){
                toastr.warning("Vui lòng ghi rõ mã số TVXN cộng đồng","Thông báo");
                focus('vm.entry.c11cNote');
                return;
            }

            if( !vm.entry.c12){
                toastr.warning("Vui lòng chọn kết quả xét nghiệm HIV gần nhất","Thông báo");
                openSelectBox('vm.entry.c12');
                return;
            }
            if(vm.entry.c12=='answer3' && !vm.entry.c131){
                toastr.warning("Vui lòng chọn thời gian xét nghiệm ở mục C13.1","Thông báo");
                openSelectBox('c131_1');
                vm.alertC131=true;
                return;
            }
            if(vm.entry.c12=='answer3' && !vm.entry.c132){
                toastr.warning("Vui lòng chọn điều trị ARV","Thông báo");
                openSelectBox('vm.entry.c132');
                return;
            }
            if( !vm.entry.c14){
                toastr.warning("Vui lòng chọn kết quả xét nghiệm HIV lần này","Thông báo");
                openSelectBox('vm.entry.c14');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14!='answer4' && !vm.entry.c15){
                toastr.warning("Vui lòng chọn KH được TV sau XN và nhận KQXN HIV ở mục C15","Thông báo");
                openSelectBox('c15_1');
                vm.alertC15=true;
                return;
            }
            if(vm.entry.c14 && vm.entry.c14!='answer4' && vm.entry.c15=='YES'){
                if(!vm.entry.c15Date){
                    toastr.warning("Vui lòng chọn ngày quay lại nhận KQXN","Thông báo");
                    focusFlatPick('vm.entry.c15Date');
                    return;
                }
            }
            if(vm.entry.c14 && ( (vm.entry.c14=='answer1'  && vm.entry.c15=='YES') || (vm.entry.c26 && vm.entry.c26!='answer3' && vm.entry.c14!='answer2'))){
                // if(!vm.entry.c1627){
                //     toastr.warning("Vui lòng chọn C16/C27. Giới thiệu chuyển gửi đến dịch vụ PrEP?","Thông báo");
                //     focus('c1627_1');
                //     vm.alertC1627=true;
                //     return;
                // }
                if(vm.entry.c1627 && vm.entry.c1627=='YES' && !vm.entry.c1627Date){
                    toastr.warning("Vui lòng chọn ngày nhận dịch vụ ","Thông báo");
                    focusFlatPick('vm.entry.c1627Date');
                    return;
                }
                if(vm.entry.c1627 && vm.entry.c1627=='YES' && !vm.entry.c1627Note){
                    toastr.warning("Vui lòng ghi rõ tên cơ sở điều trị","Thông báo");
                    focus('vm.entry.c1627Note');
                    return;
                }
            }
            
            if(vm.entry.c14 && vm.entry.c14=='answer2' && !vm.entry.c17){
                toastr.warning("Vui lòng chọn kết quả XN mới nhiễm HIV","Thông báo");
                openSelectBox('vm.entry.c17');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c17 && vm.entry.c17=='answer1' && !vm.entry.c18){
                toastr.warning("Vui lòng chọn kết quả XN tải lượng vi-rút","Thông báo");
                openSelectBox('vm.entry.c18');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer2' && !vm.entry.c19){
                toastr.warning("Vui lòng ghi rõ phòng XN khẳng định","Thông báo");
                focus('vm.entry.c19');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer2' && !vm.entry.c19Date){
                toastr.warning("Vui lòng chọn ngày XN khẳng định","Thông báo");
                focusFlatPick('vm.entry.c19Date');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer2' && !vm.entry.c19Note){
                toastr.warning("Vui lòng nhập mã số XN khẳng định","Thông báo");
                focus('vm.entry.c19Note');
                return;
            }
            if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES'){
                if(!vm.entry.c20){
                    toastr.warning("Vui lòng chọn khách hàng có nhận dịch vụ điều trị HIV","Thông báo");
                    openSelectBox('vm.entry.c20');
                    return;
                }
                if(vm.entry.c20 && vm.entry.c20=='answer2' && !vm.entry.c20Reason){
                    toastr.warning("Vui lòng nhập lí do không điều trị","Thông báo");
                    focus('vm.entry.c20Reason');
                    return;
                }
                if(vm.entry.c20 && vm.entry.c20=='answer3' && !vm.entry.c20Org){
                    toastr.warning("Vui lòng nhập cơ sở  tiếp nhận","Thông báo");
                    focus('vm.entry.c20Org');
                    return;
                }
                if(vm.entry.c20 && vm.entry.c20=='answer3' && !vm.entry.c20RegDate){
                    toastr.warning("Vui lòng chọn ngày đăng kí điều trị","Thông báo");
                    focusFlatPick('vm.entry.c20RegDate');
                    return;
                }
                if(vm.entry.c20 && vm.entry.c20=='answer3' && !vm.entry.c20Code){
                    toastr.warning("Vui lòng nhập mã số điều trị","Thông báo");
                    focus('vm.entry.c20Code');
                    return;
                }
            }
            
            if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' ){
                if(!vm.entry.c21){
                    toastr.warning("Vui lòng chọn khách hàng được tư vấn về dịch vụ TBXNBT/BC?","Thông báo");
                    openSelectBox('c21_1');
                    vm.alertC21=true;
                    return;
                }
                if(vm.entry.c21 && vm.entry.c21=='YES' && !vm.entry.c21Date){
                    toastr.warning("Vui lòng chọn ngày tư vấn","Thông báo");
                    focusFlatPick('vm.entry.c21Date');
                    return;
                }
                if(vm.entry.c21 && vm.entry.c21=='YES' && !vm.entry.c22){
                    toastr.warning("Vui lòng chọn khách hàng có đồng ý nhận dịch vụ TBXNBT/BC?","Thông báo");
                    openSelectBox('c22_1');
                    vm.alertC22=true;
                    return;
                }
                if(!vm.entry.c23FullName){
                    toastr.warning("Vui lòng ghi rõ họ và tên","Thông báo");
                    focus('vm.entry.c23FullName');
                    return;
                }
                if(!vm.entry.c23Ethnic){
                    toastr.warning("Vui lòng chọn dân tộc","Thông báo");
                    openSelectBox('vm.entry.c23Ethnic');
                    return;
                }
                if(!vm.entry.c23Profession){
                    toastr.warning("Vui lòng chọn nghề nghiệp","Thông báo");
                    openSelectBox('vm.entry.c23Profession');
                    return;
                }
                if(!vm.entry.c23IdNumber && !vm.entry.c23HealthNumber){
                    toastr.warning("Vui lòng ghi rõ số CMND/CCCD hoặc số thẻ BHYT","Thông báo");
                    focus('vm.entry.c23IdNumber');
                    return;
                }
                if(!vm.entry.c23ResidentAddressProvince){
                    toastr.warning("Vui lòng chọn tỉnh trong hộ khẩu","Thông báo");
                    openSelectBox('vm.entry.c23ResidentAddressProvince');
                    return;
                }
                if(!vm.entry.c23ResidentAddressDistrict){
                    toastr.warning("Vui lòng chọn huyện trong hộ khẩu","Thông báo");
                    openSelectBox('vm.entry.c23ResidentAddressDistrict');
                    return;
                }
                if(!vm.entry.c23CurrentAddressProvince){
                    toastr.warning("Vui lòng chọn tỉnh","Thông báo");
                    openSelectBox('vm.entry.c23CurrentAddressProvince');
                    return;
                }
                if(!vm.entry.c23CurrentAddressDistrict){
                    toastr.warning("Vui lòng chọn quận/huyện trong hộ khẩu","Thông báo");
                    openSelectBox('vm.entry.c23CurrentAddressDistrict');
                    return;
                }
                if(!vm.entry.c24){
                    toastr.warning("Vui lòng chọn kết quả xác minh ca HIV dương tính","Thông báo");
                    focus('c24_1');
                    vm.alertC24=true;
                    return;
                }
                
            }
            if(!vm.entry.c26){
                toastr.warning("Vui lòng chọn kết quả sàng lọc giang mai","Thông báo");
                focus('c26_1');
                vm.alertC26=true;
                return;
            }
            if(vm.entry.c26 && vm.entry.c26!='answer3' && !vm.entry.c25){
                toastr.warning("Vui lòng chọn khách hàng được bạn tình mắc giang mai giới thiệu đến cơ sở cung cấp dịch vụ?","Thông báo");
                focus('c25_1');
                vm.alertC25=true;
                return;
            }
            if(vm.entry.c26 && vm.entry.c26=='answer3' && vm.entry.c14=='answer4' && vm.entry.c14){
                toastr.warning("Bạn bắt buộc phải làm xét nghiệm giang mai hoặc HIV","Thông báo");
                openSelectBox('vm.entry.c14');
                vm.alertC26=true;
                vm.alertC14=true;
                return;
            }
            let isCheckC28=false;
            for(let i=0;i<4;i++){
                if(vm.c28Values[i].isCheck==true){
                    isCheckC28=true;
                }
            }
            if(!isCheckC28){
                toastr.warning("Vui lòng chọn lí do khách hàng đến cơ sở y tế là gì","Thông báo");
                focus("vm.c28Values[0]");
                vm.alertC28=true;
                return;
            }
            // if(!vm.entry.c28){
            //     toastr.warning("Vui lòng chọn lí do khách hàng đến cơ sở y tế là gì","Thông báo");
            //     openSelectBox('vm.entry.c28');
            //     return;
            // }
            
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23IdNumber){
            //     toastr.warning("Vui lòng ghi rõ số CMND/CCCD","Thông báo");
            //     focus('vm.entry.c23IdNumber');
            //     return;
            // }
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23PhoneNumber){
            //     toastr.warning("Vui lòng ghi rõ số điệnt thoại","Thông báo");
            //     focus('vm.entry.c23PhoneNumber');
            //     return;
            // }
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23Note){
            //     toastr.warning("Vui lòng ghi rõ ghi chú","Thông báo");
            //     focus('vm.entry.c23Note');
            //     return;
            // }
            
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23ResidentAddressCommune){
            //     toastr.warning("Vui lòng chọn xã trong hộ khẩu","Thông báo");
            //     openSelectBox('vm.entry.c23ResidentAddressCommune');
            //     return;
            // }
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23ResidentAddressDetail){
            //     toastr.warning("Vui lòng ghi rõ thôn/xóm/đường/số nhà trong hộ khẩu","Thông báo");
            //     focus('vm.entry.c23ResidentAddressDetail');
            //     return;
            // }

            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23CurrentAddressCommune){
            //     toastr.warning("Vui lòng chọn huyện trong hộ khẩu","Thông báo");
            //     openSelectBox('vm.entry.c23CurrentAddressCommune');
            //     return;
            // }
            // if(vm.entry.c14 && vm.entry.c14=='answer2' && vm.entry.c15 && vm.entry.c15=='YES' && !vm.entry.c23CurrentAddressDetail){
            //     toastr.warning("Vui lòng ghi rõ thôn/xóm/đường/số nhà trong hộ khẩu","Thông báo");
            //     focus('vm.entry.c23CurrentAddressDetail');
            //     return;
            // }
            
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
                vm.entry.c9=[];
                for(let i=0;i<16;i++){
                    if(i==14 && vm.entry.c7=='MALE'){
                        vm.c9Values[i].isCheck=false;
                    }
                    if(i==7 && vm.entry.c7=='MALE'){
                        vm.c9Values[i].isCheck=false;
                    }
                    if(i==1 && vm.entry.c7=='FEMALE'){
                        vm.c9Values[i].isCheck=false;
                    }
                    if(vm.c9Values[i].isCheck==true){
                        vm.entry.c9.push(vm.c9Values[i]);
                    }
                    
                }
                for(let i=0;i<4;i++){
                    if(vm.c28Values[i].isCheck==true){
                        vm.entry.c28=vm.c28Values[i].val;
                    }
                    
                }
                let c2OrgTemp = vm.entry.c2;
                let c3NameTemp = vm.entry.c3;
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
                            // vm.entry = data;
                            // toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                            // $state.go('application.hts');
                            toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                            if(!$scope.isAdministrator($scope.currentUser)) {
                                $state.go('application.hts_add');
                                window.scrollTo(0, 0);
                                vm.entry = {};
                                vm.entry.writAble = true;
                                vm.entry.editAble = true;
                                vm.entry.c2 = c2OrgTemp;
                                vm.entry.c3 = c3NameTemp;
                                vm.c4Date.clear();
                                for(let i=0;i<16;i++){
                                    vm.c9Values[i].isCheck=false;
                                }
                                vm.checkDouble=false;
                                for(let i=0;i<4;i++){
                                    vm.c28Values[i].isCheck=false;
                                     // isCheckC28=true;
                                }
                            } else {
                                $state.go('application.hts');
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
        vm.c4Date = {
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
                        vm.entry.c4 = m.add(7, 'hours').toDate();
                    }
                    if(moment(vm.entry.c4).year()<vm.entry.c8){
                        toastr.warning('Ngày tư vấn trước XN HIV đang nhỏ hơn năm sinh');
                        focusFlatPick('vm.entry.c4');
                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.c4Date.fpItem = fpItem;
                if (vm.entry.c4 && fpItem) {
                    fpItem.setDate(moment(vm.entry.c4).toDate());
                }
            },
            clear: function() {
                if (vm.c4Date.fpItem) {
                    vm.c4Date.fpItem.clear();
                    vm.entry.c4 = null;
                }
            }
        };
        vm.c1627Date = {
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
                       vm.entry.c1627Date = m.add(7, 'hours').toDate();
                   }
                   if(moment(vm.entry.c4)>vm.entry.c1627Date && vm.entry.c4){
                    toastr.warning('Ngày nhận dịch vụ đang nhỏ hơn ngày tư vấn trước XN HIV');
                    focusFlatPick('vm.entry.c1627Date');
                }
               }],
           },
           datePostSetup: function(fpItem) {
               vm.c1627Date.fpItem = fpItem;
               if (vm.entry.c1627Date && fpItem) {
                   fpItem.setDate(moment(vm.entry.c1627Date).toDate());
               }
           },
           clear: function() {
               if (vm.c1627Date.fpItem) {
                   vm.c1627Date.fpItem.clear();
                   vm.entry.c1627Date = null;
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
                        }
                        if(moment(vm.entry.c4)>vm.entry.c15Date && vm.entry.c4){
                            toastr.warning('Ngày quay lại nhận KQXN đang nhỏ hơn ngày tư vấn ');
                            focusFlatPick('vm.entry.c15Date');
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
        vm.c19Date = {
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
                      vm.entry.c19Date = m.add(7, 'hours').toDate();
                  } 
                    if(moment(vm.entry.c4)>vm.entry.c19Date && vm.entry.c4){
                        toastr.warning('Ngày quay lại nhận KQXN đang nhỏ hơn ngày tư vấn ');
                        focusFlatPick('vm.entry.c19Date');
                    }
                    if(moment(vm.entry.c15Date)<vm.entry.c19Date && vm.entry.c15Date){
                        toastr.warning('Ngày quay lại nhận KQXN đang lớn hơn ngày quay lại nhận KQXN ');
                        focusFlatPick('vm.entry.c19Date');
                    }
              }],
          },
          datePostSetup: function(fpItem) {
              vm.c19Date.fpItem = fpItem;
              if (vm.entry.c19Date && fpItem) {
                  fpItem.setDate(moment(vm.entry.c19Date).toDate());
              }
          },
          clear: function() {
              if (vm.c19Date.fpItem) {
                  vm.c19Date.fpItem.clear();
                  vm.entry.c19Date = null;
              }
          }
       };
       vm.c20RegDate = {
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
                     vm.entry.c20RegDate = m.add(7, 'hours').toDate();
                 }
                 if(vm.entry.c20RegDate<vm.entry.c15Date && vm.entry.c15Date){
                    toastr.warning('Ngày đăng kí điều trị đang nhỏ hơn ngày quay lại nhận KQXN ');
                    focusFlatPick('vm.entry.c20RegDate');
                }
             }],
         },
         datePostSetup: function(fpItem) {
             vm.c20RegDate.fpItem = fpItem;
             if (vm.entry.c20RegDate && fpItem) {
                 fpItem.setDate(moment(vm.entry.c20RegDate).toDate());
             }
         },
         clear: function() {
             if (vm.c20RegDate.fpItem) {
                 vm.c20RegDate.fpItem.clear();
                 vm.entry.c20RegDate = null;
             }
         }
      };
      vm.c21Date = {
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
                      vm.entry.c21Date = m.add(7, 'hours').toDate();
                  }
                  if(vm.entry.c21Date<vm.entry.c15Date && vm.entry.c15Date){
                    toastr.warning('Ngày tư vấn về dịch vụ TBXNBT/BC đang nhỏ hơn ngày quay lại nhận KQXN ');
                    focusFlatPick('vm.entry.c21Date');
                }
              }],
          },
          datePostSetup: function(fpItem) {
              vm.c21Date.fpItem = fpItem;
              if (vm.entry.c21Date && fpItem) {
                  fpItem.setDate(moment(vm.entry.c21Date).toDate());
              }
          },
          clear: function() {
              if (vm.c21Date.fpItem) {
                  vm.c21Date.fpItem.clear();
                  vm.entry.c21Date = null;
              }
          }
      };
    }

})();
