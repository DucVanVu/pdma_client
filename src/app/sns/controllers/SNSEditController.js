/**
 * Created by bizic on 28/8/2016.
 */
(function() {
    'use strict';

    angular.module('PDMA.SNS').controller('SNSEditController', SNSEditController);

    SNSEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',
        'SNSService',
        '$state',
        '$stateParams',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities'
    ];

    function SNSEditController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service, $state, $stateParams, focus,focusFlatPick,openSelectBox,utils) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;
        vm.id = $stateParams.id;
        vm.entry = {}; // placeholder for an entry
        vm.entries = []; // all entries queried for the grid
        vm.selectedEntries = []; // selected entries on the grid
        vm.treeData = [];
        vm.numberOfDays = 30;
        vm.convertTestDate = null;
        vm.convertIssueDate = null;
        // Entry statuses
        vm.subEntries = [];
        vm.modalInstance = null; // the modal dialog
        vm.maxSeq=0;
        vm.currentOrg=null;
        vm.entry.orderCoupon = '';
        // For querying list of entries
        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };
        vm.genders = [{
            id: 'MALE',
            name: 'Nam'
        }, {
            id: 'FEMALE',
            name: 'Nữ'
        }];
        vm.listHivStatus = [{
            id: 'positive',
            name: 'Dương tính'
        }, {
            id: 'negative',
            name: 'Âm tính'
        }, {
            id: 'undefined',
            name: 'Không xác định'
        }, {
            id: 'notest',
            name: 'Không xét nghiệm'
        }];
        vm.customerSources = [{
            id: 'SNS',
            name: 'SNS'
        }, {
            id: 'VCT_OPC',
            name: 'VCT/OPC'
        }, {
            id: 'CBOs',
            name: 'CBOs'
        }, {
            id: 'OTHER',
            name: 'Khác/tự đến'
        }];

        vm.riskGroups = [{
            id: 'MSM',
            name: 'MSM'
        }, {
            id: 'NCH',
            name: 'Bạn tình/bạn chích NCH'
        }, {
            id: 'TCMT',
            name: 'Tiêm chích ma túy'
        }, {
            id: 'MD',
            name: 'Mại dâm'
        }, {
            id: 'OTHER',
            name: 'Khác'
        }];
        vm.approachMethods = [{
            id: 'direct',
            name: 'Trực tiếp'
        }, {
            id: 'online',
            name: 'Trực tuyến'
        }];

        vm.idNumberTypes=[
        { id: 'CMND', name: 'Chứng minh nhân dân'}
        ,{ id: 'CCCD', name: 'Căn cước công dân'}
        ,{ id: 'THE_BH', name: 'Thẻ bảo hiểm y tế'}
//        ,{ id: 'BANG_LAI', name: 'Bằng lái xe'}
//        ,{ id: 'SDT', name: 'Số điện thoại'}
//        ,{ id: 'HO_KHAU', name: 'Số hộ khẩu'}
        ];

        vm.years=[];
        let currentYear = moment().year();
        for(let i=moment().year();i>1900;i--){
            let year={ id: i, name: i};
            vm.years.push(year);
        }
        vm.org ={};
        vm.orgsWritable = [];

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            // debugger;
            if (!newVal) {
                return;
            }

            //blockUI.stop();
            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }
            vm.orgsWritable = $scope.assignedOrgs.writable;
            vm.orgsReadable = $scope.assignedOrgs.readable;
            vm.isWrited=false;
            vm.isReaded=false;
            let idParam = $stateParams.id;
            if(!idParam){
                service.getListWriteAbleSNS().then(function(data){
                    if(data && data.length>0){
                        vm.orgsWritable = data;
                        vm.isWrited = true;
                        blockUI.stop();
                    }else{
                        blockUI.stop();
                        $state.go('application.sns');
                        toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Cảnh báo"); 
                    }
                });
            }else{
                blockUI.stop();
            }
            
            
            if(vm.orgsWritable.length > 0) {
                vm.isWrited = true;
            }
            if(vm.orgsReadable.length > 0) {
                vm.isReaded = true;
            }
            // Getting Entry for editing
            vm.getEntry();
        });

        $(document).on("wheel", "input[type=number]", function(e) {
            $(this).blur();
        });
        vm.snsDob = {
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
                    const d = this.selectedDates[0];
                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.dob = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.snsDob.fpItem = fpItem;
                if (vm.entry.dob && fpItem) {
                    fpItem.setDate(moment(vm.entry.dob).toDate());
                }
            },
            clear: function() {
                if (vm.snsDob.fpItem) {
                    vm.snsDob.fpItem.clear();
                    vm.entry.dob = null;
                }
            }
        };
        vm.snsArvDate = {
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
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.arvDate = m.add(7, 'hours').toDate();
                        if(moment(vm.entry.arvDate).year()<vm.entry.yearOfBirth){
                            toastr.warning('Ngày đăng ký điều trị ARV đang nhỏ hơn năm sinh');
                            focusFlatPick('vm.entry.arvDate');
                        }
                        if(vm.entry.arvDate>new Date()){
                            toastr.warning('Ngày đăng ký điều trị ARV không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.entry.arvDate');
                        }
                        vm.validateDate();
                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.snsArvDate.fpItem = fpItem;
                if (vm.entry.arvDate && fpItem) {
                    fpItem.setDate(moment(vm.entry.arvDate).toDate());
                }
            },
            clear: function() {
                if (vm.snsArvDate.fpItem) {
                    vm.snsArvDate.fpItem.clear();
                    vm.entry.arvDate = null;
                }
            }
        };

        vm.snsPrepDate = {
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
                    const d = this.selectedDates[0];
                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.prepDate = m.add(7, 'hours').toDate();
                        if(moment(vm.entry.prepDate).year()<vm.entry.yearOfBirth){
                            toastr.warning('Ngày đăng ký sử dụng PrEP đang nhỏ hơn năm sinh');
                            focusFlatPick('vm.entry.prepDate');
                        }
                        if(vm.entry.prepDate>new Date()){
                            toastr.warning('Ngày đăng ký sử dụng PrEP không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.entry.prepDate');
                        }
                        vm.validateDate();
                    }
                }],
            },
            datePostSetup: function(fpItem) {
                vm.snsPrepDate.fpItem = fpItem;
                if (vm.entry.prepDate && fpItem) {
                    fpItem.setDate(moment(vm.entry.prepDate).toDate());
                }
            },
            clear: function() {
                if (vm.snsPrepDate.fpItem) {
                    vm.snsPrepDate.fpItem.clear();
                    vm.entry.prepDate = null;
                }
            }
        };
        vm.snsCouponDate = {
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
                         return (date >= new Date());
                     }
                 ],
                onChange: [function() {
                    angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.couponDate = m.add(7, 'hours').toDate();
                    }
                    if(vm.couponDate>new Date()){
                        toastr.warning('Ngày phát thẻ không được lớn hơn ngày hiện tại');
                        focusFlatPick('vm.couponDate');
                    }
                    vm.validateDate();
                }],
            },
            datePostSetup: function(fpItem) {
                vm.snsCouponDate.fpItem = fpItem;
                if (vm.couponDate && fpItem) {
                    fpItem.setDate(moment(vm.couponDate).toDate());
                }
            },
            clear: function() {
                if (vm.snsCouponDate.fpItem) {
                    vm.snsCouponDate.fpItem.clear();
                    vm.couponDate = null;
                }
            }
        };

        vm.testDate = {
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
                            vm.entry.testDate = m.add(7, 'hours').toDate();
                        }
                        if(vm.entry.testDate>new Date()){
                            toastr.warning('Ngày xét nghiệm không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.entry.testDate');
                        }
                        vm.validateDate();
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.testDate.fpItem = fpItem;
                    if (vm.entry.testDate && fpItem) {
                        fpItem.setDate(moment(vm.entry.testDate).toDate());
                    }
                },
                clear: function() {
                    if (vm.testDate.fpItem) {
                        vm.testDate.fpItem.clear();
                        vm.entry.testDate = null;
                    }
                }
        };

        vm.firstTimeVisit = {
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
                             vm.entry.firstTimeVisit = m.add(7, 'hours').toDate();
                         }
                         if(vm.entry.firstTimeVisit>new Date()){
                             toastr.warning('Ngày xét nghiệm không được lớn hơn ngày hiện tại');
                             focusFlatPick('vm.entry.firstTimeVisit');
                         }
                         if(!vm.couponDate){
                            vm.couponDate=vm.entry.firstTimeVisit;
                            vm.snsCouponDate.datePostSetup(vm.snsCouponDate.fpItem);
                         }
                         vm.validateDate();
                     }],
                 },
                 datePostSetup: function(fpItem) {
                     vm.firstTimeVisit.fpItem = fpItem;
                     if (vm.entry.firstTimeVisit && fpItem) {
                         fpItem.setDate(moment(vm.entry.firstTimeVisit).toDate());
                     }
                 },
                 clear: function() {
                     if (vm.firstTimeVisit.fpItem) {
                         vm.firstTimeVisit.fpItem.clear();
                         vm.entry.firstTimeVisit = null;
                     }
                 }
         };

        vm.getEntry = function() {
            if (vm.id) {
                service.getEntry(vm.id).then(function(data) {
                    vm.isWrited = data.writAble;
                    if(!data.writAble && !data.readAble){
                        $state.go('application.sns');
                        toastr.warning("Bạn không có quyền đọc hoặc sửa bản ghi","Cảnh báo");
                    }
                    // vm.checkReadOrWriteOrNull(data.organization.id);
                    vm.entry = data;
                    vm.currentOrg = vm.entry.organization;
                    if(vm.entry.testDate != null) {
                        vm.convertTestDate = new Date(vm.entry.testDate);
                    }
                    if(vm.entry.issueDate != null) {
                        vm.convertIssueDate = new Date(vm.entry.issueDate);
                    }
                    vm.snsPrepDate.datePostSetup(vm.snsPrepDate.fpItem);
                    vm.snsArvDate.datePostSetup(vm.snsArvDate.fpItem);
                    vm.snsDob.datePostSetup(vm.snsDob.fpItem);
                    vm.testDate.datePostSetup(vm.testDate.fpItem);
                    vm.firstTimeVisit.datePostSetup(vm.firstTimeVisit.fpItem);
                    service.getListWriteAbleSNS().then(function(data){
                        if(data && data.length>0){
                            vm.orgsWritable = data;
                            vm.isWrited = true;
                            blockUI.stop();
                        }else{
                            blockUI.stop();
                            if(!vm.id && !vm.isWrited){
                                $state.go('application.sns');
                                toastr.warning("Bạn không có quyền thêm hoặc sửa bản ghi","Cảnh báo"); 
                            }
                            
                        }
                    });
                });
            }
        }
        vm.createSubCoupon = function() {
            if(!vm.checkCouponCodeValid(vm.entry.couponCode,'vm.entry.couponCode')){
                return;
            }
            if(!vm.couponDate){
                toastr.warning('Bạn chưa nhập ngày phát thẻ phát');
                focusFlatPick('vm.couponDate');
                return;
            }
            if(vm.couponDate>new Date()){
                toastr.warning('Ngày phát thẻ phát không được lớn hơn ngày hiện tại');
                focusFlatPick('vm.couponDate');
                return;
            }
            if(!vm.totalCoupon || vm.totalCoupon<=0){
                toastr.warning('Bạn chưa nhập tổng số thẻ phát ra');
                focus('vm.totalCoupon');
                return;
            }
            // if(!vm.startCouponCode || vm.startCouponCode<=0){
            //     toastr.warning('Bạn chưa nhập số thẻ bắt đầu');
            //     focus('vm.startCouponCode');
            //     return;
            // }
            if(vm.entry && vm.currentOrg && vm.entry.organization.id!=vm.currentOrg.id && vm.maxSeq){
//                if(vm.startCouponCode<=vm.maxSeq){
//                    toastr.warning('Mã số thẻ bắt đầu phải lớn hơn '+vm.maxSeq);
//                    focus('vm.startCouponCode');
//                    return;
//                }
            }
            else{
//                 let subCode = vm.entry.couponCode.split('-');
//                 let seq = parseInt(subCode[2]);
//                 if(vm.startCouponCode<=seq){
//                     toastr.warning('Mã số thẻ bắt đầu phải lớn hơn số thứ tự thẻ của khách hàng');
// //                    focus('vm.startCouponCode');
//                     return;
//                 }
            }


//            if(vm.entry && vm.entry.children && vm.entry.children.length>0){
//                for(let i=0;i<vm.entry.children.length;i++){
//                    if(vm.entry.children[i].issueDate==vm.couponDate){
//                        vm.entry.children.splice(i,1);
//                        i--;
//                    }
//                }
//            }
            if (vm.totalCoupon && vm.totalCoupon > 0 && vm.couponDate) {
                let tempSubEntries=[];
                vm.tempHasDuoSubEntries=[];
                if (!vm.entry.children) {
                    vm.entry.children = [];
                }
                //Tạo thẻ xong đưa vào 1 biến tạm thời
                for (let i = 0; i < vm.totalCoupon; i++) {
                    let subCode = vm.entry.couponCode.split('-');
                    let subEntry = {};
                    subEntry.couponCode='';
                    // 
                    if(vm.currentOrg){
                        if(vm.currentOrg.address && vm.currentOrg.address.province && vm.currentOrg.address.province.codeGso){
                            subEntry.couponCode = vm.currentOrg.address.province.codeGso+'-';
                        }
                        subEntry.couponCode+=vm.currentOrg.code+'-';  
                        //subEntry.couponCode+=vm.currentOrg.code+'-'+(vm.startCouponCode + i);  
                    }
                    else{
                        subEntry.couponCode = subCode[0]+'-'+subCode[1]+'-';
                        //subEntry.couponCode = subCode[0]+'-'+subCode[1]+'-'+(vm.startCouponCode + i);
                    }
                    subEntry.issueDate = vm.couponDate;
                    subEntry.organization = vm.currentOrg;
                    tempSubEntries.push(subEntry);
                }
                //Kiểm tra các mã thẻ mới tạo xem có bị trùng với các mã thẻ hiện tại hay không
                let hasDup = false;
                // if(vm.entry.children && vm.entry.children.length>0){
                //     for(let i = 0; i < vm.entry.children.length; i++){
                //         for(let j = 0; j < tempSubEntries.length; j++){
                //             if(tempSubEntries[j].couponCode==vm.entry.children[i].couponCode){
                //                 tempSubEntries[j].isDup=true;
                //                 hasDup=true;
                //                 vm.tempHasDuoSubEntries.push(tempSubEntries[j]);
                //                 toastr.warning('Mã số thẻ bị trùng');
                //             }
                //         }
                //     }
                // }
                //Nếu không trùng thì đẩy vào vm.entry.children
                if(hasDup == false){
                    vm.entry.children = vm.entry.children.concat(tempSubEntries);
                }
//                console.log(vm.entry.children);
            }
        }

//        $scope.$watch('vm.totalCoupon', function(newVal, oldVal) {
//            vm.createSubCoupon();
//        });
//        $scope.$watch('vm.couponDate', function(newVal, oldVal) {
////            alert(newVal.getDate());// 29
////            vm.createSubCoupon();
//        });
//        $scope.$watch('vm.startCouponCode', function(newVal, oldVal) {
//            vm.createSubCoupon();
//        });
        $scope.$watch('vm.entry.gender', function (newVal, oldVal) {
            if(vm.entry.gender=='FEMALE') {
                vm.riskGroups = [{id: 'NCH', name: 'Bạn tình/bạn chích NCH'}, {id: 'TCMT',name: 'Tiêm chích ma túy'}, {id: 'MD',name: 'Mại dâm'}, {id: 'OTHER', name: 'Khác'}];
                if(vm.entry.riskGroup=='MSM'){
                    vm.entry.riskGroup='';
                }
            }
            else {
                vm.riskGroups = [{id: 'MSM', name: 'MSM'}, {id: 'NCH', name: 'Bạn tình/bạn chích NCH'}, {id: 'TCMT', name: 'Tiêm chích ma túy'}, {id: 'MD', name: 'Mại dâm'}, {id: 'OTHER', name: 'Khác'}];
            }
        });
        vm.validateEntry = function() {
            // if(vm.entry.id) {
            //     if(vm.convertTestDate != null) {
            //         let testDateConvert = vm.convertTestDate.getMonth()+1;
            //         let calculateQuarter = null;
            //         if(testDateConvert>0 && testDateConvert<4) {
            //             calculateQuarter = 1;
            //         } else if(testDateConvert>3 && testDateConvert<7) {
            //             calculateQuarter = 2;
            //         } else if(testDateConvert>6 && testDateConvert<10) {
            //             calculateQuarter = 3;
            //         } else if(testDateConvert>9 && testDateConvert<13) {
            //             calculateQuarter = 4;
            //         }
            //         let changeByQuarter = new Date(vm.convertTestDate.getFullYear(), vm.convertTestDate.getMonth(), vm.convertTestDate.getDate());
            //         if(calculateQuarter == 1) {
            //             changeByQuarter.setMonth(2);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 2) {
            //             changeByQuarter.setMonth(5);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 3) {
            //             changeByQuarter.setMonth(8);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 4) {
            //             changeByQuarter.setMonth(11);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         }
                    
            //         let isAdministrator = $scope.isAdministrator($scope.currentUser);
            //         if(!isAdministrator) {
            //             if((new Date()) > changeByQuarter) {
            //                 toastr.warning("Đã quá thời hạn chỉnh sửa phiếu","Thông báo");
            //                 return;
            //             }
            //         }
            //     }
                // if(vm.convertIssueDate != null) {
                //     let issueDateConvert = vm.convertIssueDate.getMonth()+1;
                //     let calculateQuarter = null;
                //     if(issueDateConvert>0 && issueDateConvert<4) {
                //         calculateQuarter = 1;
                //     } else if(issueDateConvert>3 && issueDateConvert<7) {
                //         calculateQuarter = 2;
                //     } else if(issueDateConvert>6 && issueDateConvert<10) {
                //         calculateQuarter = 3;
                //     } else if(issueDateConvert>9 && issueDateConvert<13) {
                //         calculateQuarter = 4;
                //     }
                //     let changeByQuarter = new Date(vm.convertIssueDate.getFullYear(), vm.convertIssueDate.getMonth(), vm.convertIssueDate.getDate());
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
            // }
            if(!vm.entry.couponCode){
                toastr.warning('Mã thẻ không được để trống');
                focus('vm.entry.couponCode');
                return false;
            }
            else if(!vm.checkCouponCodeValid(vm.entry.couponCode,'vm.entry.couponCode')){
                return false;
            }
            if(!vm.entry.name){
                toastr.warning('Họ tên không được để trống');
                focus('vm.entry.name');
                return false;
            }
            if(!vm.entry.yearOfBirth || vm.entry.yearOfBirth==0){
                toastr.warning('Năm sinh không được để trống');
                openSelectBox('vm.entry.yearOfBirth');
                return false;
            }
            if(!vm.entry.firstTimeVisit){
                toastr.warning('Ngày giới thiệu dịch vụ SNS không được để trống');
                focusFlatPick('vm.entry.firstTimeVisit');
                return false;
            }


            if(!vm.entry.gender || vm.entry.gender=='UNKNOW'){
                toastr.warning('Giới tính không được để trống');
                openSelectBox('vm.entry.gender');
                return false;
            }
            if(!vm.entry.idNumberType || vm.entry.idNumberType=='UNKNOW'){
                toastr.warning('Loại giấy tờ không được để trống');
                openSelectBox('vm.entry.idNumberType');
                return false;
            }
            if(!vm.entry.idNumber || vm.entry.idNumber.trim()===""){
                toastr.warning('Mã định danh không được để trống được để trống');
                focus('vm.entry.idNumber');
                return false;
            }

//            if(!vm.entry.snsCaseIdNumers || vm.entry.snsCaseIdNumers.length==0){
//                toastr.warning('Mã định danh không được để trống được để trống');
//                openSelectBox('vm.idNumberType');
//                return false;
//            }

            if(!vm.entry.hivStatus || vm.entry.hivStatus=='unknow'){
                toastr.warning('Tình trạng HIV không được để trống');
                openSelectBox('vm.entry.hivStatus');
                return false;
            }

            // if(vm.entry.hivStatus && vm.entry.hivStatus!='notest' && !vm.entry.testDate){
            //     toastr.warning('Ngày xét nghiệm HIV không được để trống');
            //     focusFlatPick('vm.entry.testDate');
            //     return false;
            // }

            if(!vm.entry.riskGroup || vm.entry.riskGroup=="UNKNOW"){
                toastr.warning('Nhóm nguy cơ không được để trống được để trống');
                openSelectBox('vm.entry.riskGroup');
                return false;
            }

            if(!vm.entry.customerSource || vm.entry.customerSource=='UNKNOW'){
                toastr.warning('Nguồn khách hàng không được để trống');
                openSelectBox('vm.entry.customerSource');
                return false;
            }
            if(vm.entry.customerSource && vm.entry.customerSource === 'SNS' && !vm.entry.approachMethod || vm.entry.approachMethod=='unknow'){
                toastr.warning('Hình thức tiếp cận không được để trống');
                openSelectBox('vm.entry.approachMethod');
                return false;
            }
            if(!vm.entry.organization){
                toastr.warning('Bạn không có quyền thêm dữ liệu với cơ sở hiện tại');
                return false;
            }
            if(vm.entry.children && vm.entry.children.length>0){
                for(let i=0;i<vm.entry.children.length;i++){
                    if(!vm.checkCouponCodeValid(vm.entry.children[i].couponCode,null)){
                        return false;
                    }
                    if(vm.entry.children[i].couponCode==vm.entry.couponCode){
                        toastr.warning('Mã thẻ phát ra không được trùng với mã khách hàng');
                        vm.entry.children[i].isDup=true;
                        return false;
                    }
                    //Check trong list vm.entry.children xem có 2 mã trùng nhau hay không?
                    for(let j=0;j<vm.entry.children.length;j++){
                        if(i!=j){
                            if(vm.entry.children[i].couponCode==vm.entry.children[j].couponCode){
                                if(!vm.entry.children[i].id){
                                    vm.entry.children[i].isDep=true;
                                }
                                else if(!vm.entry.children[j].id){
                                    vm.entry.children[j].isDep=true;
                                }
                                toastr.warning('Mã thẻ phát ra bị trùng');
                                return false;
                            }
                        }
                    }
                }
            }
            if(!vm.validateDate()){
                return false;
            }
            return true;
        }

        vm.validateDate = function(){
            if(vm.entry.firstTimeVisit){
                if(vm.entry.parent && vm.entry.parent.firstTimeVisit){
                    let parentFirstTimeVisit = moment(vm.entry.parent.firstTimeVisit).startOf('day');
                    let firstTimeVisit = moment(vm.entry.firstTimeVisit).startOf('day');
                    if(firstTimeVisit<parentFirstTimeVisit){
                        toastr.warning('Ngày giới thiệu dịch vụ SNS không thể sau ngày được phát thẻ');
                        focusFlatPick('vm.entry.firstTimeVisit');
                        return false;
                    }
                }
                if(vm.entry.issueDate){
                    let issueDate = moment(vm.entry.issueDate).startOf('day');
                    let firstTimeVisit = moment(vm.entry.firstTimeVisit).startOf('day');
                    if(firstTimeVisit<issueDate){
                        toastr.warning('Ngày giới thiệu dịch vụ SNS không thể sau ngày được phát thẻ');
                        focusFlatPick('vm.entry.firstTimeVisit');
                        return false;
                    }
                }
                if(vm.couponDate){
                    let couponDate = moment(vm.couponDate).startOf('day');
                    let firstTimeVisit = moment(vm.entry.firstTimeVisit).startOf('day');
                    if(couponDate<firstTimeVisit){
                        toastr.warning('Ngày phát không được trước ngày giới thiệu dịch vụ');
                        focusFlatPick('vm.couponDate');
                        return false;
                    }
                }
            }
            if(vm.entry.testDate){

                // if(vm.entry.firstTimeVisit){
                //     let firstTimeVisit = moment(vm.entry.firstTimeVisit).startOf('day');
                //     let testDate = moment(vm.entry.testDate).startOf('day');
                //     if(firstTimeVisit>testDate){
                //         toastr.warning('Ngày giới thiệu dịch vụ SNS không được sau ngày xét nghiệm');
                //         focusFlatPick('vm.entry.testDate');
                //         return false;
                //     }
                // }
                if(vm.entry.arvDate){
                    let arvDate = moment(vm.entry.arvDate).startOf('day');
                    let testDate = moment(vm.entry.testDate).startOf('day');
                    if(arvDate<testDate){
                        toastr.warning('Ngày đăng ký điều trị ARV không được trước ngày xét nghiệm');
                        focusFlatPick('vm.entry.arvDate');
                        return false;
                    }
                }
                if(vm.entry.prepDate){
                    let prepDate = moment(vm.entry.prepDate).startOf('day');
                    let testDate = moment(vm.entry.testDate).startOf('day');
                    if(prepDate<testDate){
                        toastr.warning('Ngày đăng ký sử dụng PrEP không được trước ngày xét nghiệm');
                        focusFlatPick('vm.entry.prepDate');
                        return false;
                    }
                }
            }
            return true;
        }

        vm.saveEntry = function() {
//            vm.addIdNumber();
            if(vm.orgsWritable && vm.orgsWritable.length>0){
                if(!vm.entry.organization){
                    vm.entry.organization = vm.orgsWritable[0];
                }
                if(!vm.entry.testOrganization){
                    vm.entry.testOrganization = vm.orgsWritable[0];
                }
            }
            if (vm.entry && vm.validateEntry()) {
//                if(!vm.entry.issueDate){
//                    vm.entry.issueDate = new Date();
//                }
                let checkCodeObj = {
                    id:vm.entry.id,
                    couponCode:vm.entry.couponCode
                }
                let listCheckCodeObj=[{ id:vm.entry.id, couponCode:vm.entry.couponCode}];
                vm.entry.orderCoupon = '';
                if(vm.entry.children && vm.entry.children.length>0){
                    for(let i=0;i<vm.entry.children.length;i++){
                        listCheckCodeObj.push({id:vm.entry.children[i].id, couponCode:vm.entry.children[i].couponCode});
                        const chars = (vm.entry.children[i].couponCode).split("-");
                        if(i<vm.entry.children.length-1) {
                            vm.entry.orderCoupon+=chars[2] + "; ";
                        } else {
                            vm.entry.orderCoupon+=chars[2];
                        }
                    }
                }
                //Kiểm tra mã khách hàng có bị trùng hay không?
                //Kiểm tra các thẻ khách hàng này phát ra có thẻ nào bị trùng mã hay không?
                blockUI.start();
                service.checkCodeMulti(listCheckCodeObj).then(function(data){
                    let hasDup=false;
                    blockUI.stop();
                    if(data && data.length>0){
                        for(let i=0;i<data.length;i++){
                            if(data[i] && data[i].isDup==true){
                                hasDup=true;
                                if(data[i].couponCode==vm.entry.couponCode){
                                    toastr.warning('Mã khách hàng bị trùng');
                                    focus('vm.entry.couponCode');
                                    break;
                                }
                                if(vm.entry.children && vm.entry.children.length>0){
                                    for(let j=0;j<vm.entry.children.length;j++){
                                        if(!vm.entry.children[j].id && data[i].couponCode==vm.entry.children[j].couponCode){
                                            vm.entry.children[j].isDup=true;
                                        }
                                    }
                                }
                            }
                            if(hasDup==true){
                                toastr.warning('Mã thẻ phát ra bị trùng');
                            }
                        }
                    }
                    if(hasDup==false){
                        blockUI.start();
                        //Nếu không trùng thì gọi hàm save
                        service.saveEntry(vm.entry, function success() {
                            toastr.info('Bạn đã lưu thành công.', 'Thông báo');
                            // Reload the grid
                            //                    vm.getEntries();

                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi lưu thông tin.', 'Thông báo');
                        }).then(function(data) {
                            blockUI.stop();
                            $state.go('application.sns');
                        });
                    }
                });
            }
        }

        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // if(!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                //     if (!$scope.isSnsRole) {
                //         $state.go('application.prev_dashboard');
                //     }
                // }
                // vm.orgsWritable = $scope.assignedOrgs.writable;
                // if (vm.orgsWritable && vm.orgsWritable.length >= 1 && !vm.entry.id) {
                //     vm.currentOrg = vm.orgsWritable[0];
                //     console.log(vm.orgsWritable);                    
                // }
                vm.getEntry();
            }
        });

        $scope.$watch('vm.currentOrg', function (newVal, oldVal) {
            // debugger;
            if(vm.currentOrg) {
                if(!vm.entry || !vm.entry.id){
                    vm.entry.couponCode='';
                    if(vm.currentOrg.address && vm.currentOrg.address.province && vm.currentOrg.address.province.codeGso){
                        vm.entry.couponCode=vm.currentOrg.address.province.codeGso+'-';
                    }
                    vm.entry.couponCode+=vm.currentOrg.code+'-';
                    vm.entry.children=[];
                }
                if(!vm.entry.organization){
                    vm.entry.organization = vm.currentOrg;
                }
                if(!vm.entry.testOrganization){
                    vm.entry.testOrganization = vm.currentOrg;
                }
                service.getMaxSeq(vm.currentOrg.id).then(function(data) {
                    vm.maxSeq = data;
    //                alert(vm.maxSeq);
                });
            }
        });

        $scope.$watch('vm.entry.hivStatus', function (newVal, oldVal) {
            if(newVal=='positive'){
                vm.entry.prepDate=null;
            }
            else if(newVal=='negative'){
                vm.entry.arvDate=null;
            }
            else{
                vm.entry.prepDate=null;
                vm.entry.arvDate=null;
            }
            if(vm.entry.hivStatus=='notest'){
                vm.entry.testDate=null;
            }
        });


        vm.cancel = function() {
            $state.go('application.sns')
        }
        //        debugger;
        vm.expandingProperty = {
            field: "code",
            sortable: true,
            displayName: "Mã khách hàng"
        };
        // Grid definition
        vm.nameChange = function(){
            vm.entry.name = utils.toTitleCase(vm.entry.name).replace("  "," ");
//            vm.entry.name = vm.entry.name;
        }
        vm.idNumberChange = function(){
            if(vm.entry.idNumber){
                vm.entry.idNumber = utils.toUpperCase(vm.entry.idNumber).replace(" ","");
            }
            if(vm.idNumber){
                vm.idNumber = utils.toUpperCase(vm.idNumber).replace(" ","");
            }
        }
        vm.idNumberItemChange = function(index){
        }
        vm.showAllIdNumber=false;
        vm.addIdNumber = function(){
            if(!vm.entry.snsCaseIdNumers){
                vm.entry.snsCaseIdNumers=[];
            }
            if(vm.idNumberType && vm.idNumber){
                vm.entry.snsCaseIdNumers.push({
                    idNumberType:vm.idNumberType,
                    value:vm.idNumber
                });
                vm.idNumberType=null;
                vm.idNumber=null;
            }
        }

        $scope.isNumberOnly= function(val) {
            return /^[0-9]+$/.test(val);
        }
        vm.couponCodeChange = function(){
            if(vm.entry.couponCode){
                let subCode = vm.entry.couponCode.split('-');
                if(subCode.length>3){
                    toastr.warning('Mã thẻ không đúng định dạng 3 phần');
                    focus('vm.entry.couponCode');
                }
                else if(subCode.length==3){
                    if(subCode[2].trim().length>0 && !utils.isNumberOnly(subCode[2])){
                        toastr.warning('Phần số thứ tự không được có ký tự chữ');
                        focus('vm.entry.couponCode');
                    }
                    let seq = parseInt(subCode[2]);
                }
            }
        }
        vm.findByCodeCoupon=null;
        vm.couponCodeBlur = function(){
            if(vm.entry.couponCode){
//                let subCode = vm.entry.couponCode.split('-');
//                if(subCode.length<3 || subCode.length>3){
//                    toastr.warning('Mã thẻ không đúng định dạng 3 phần');
//                    focus('vm.entry.couponCode');
//                }
//                else if(subCode[2].trim().length==0){
//                    toastr.warning('Bạn chưa nhập phần số thứ tự trong mã');
//                    focus('vm.entry.couponCode');
//                }
//                else if(!utils.isNumberOnly(subCode[2])){
//                    toastr.warning('Phần số thứ tự không được có ký tự chữ');
//                    focus('vm.entry.couponCode');
//                }
                if(vm.checkCouponCodeValid(vm.entry.couponCode,'vm.entry.couponCode')){

                    if(!vm.entry.id){
                        blockUI.start();
                        service.findByCode(vm.entry.couponCode).then(function (data){
                            blockUI.stop();
                            if(data){
                                vm.findByCodeCoupon=data;
                                console.log(vm.findByCodeCoupon);
                                vm.modalInstance = modal.open({
                                    animation: true,
                                    templateUrl: '_coupon_existed_alert_modal.html',
                                    scope: $scope,
                                    size: 'md',
                                    backdrop: 'static',
                                    keyboard: false
                                });
                                vm.modalInstance.result.then(function(answer) {
                                    if (answer == 'yes' && !vm.findByCodeCoupon.testOrganization) {
                                        $state.go('application.sns-edit', {
                                            id: vm.findByCodeCoupon.id
                                        }, {
                                            reload: true,
                                            newtab : true
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
        //Kiểm tra mã coupon có hợp lệ không
        vm.checkCouponCodeValid = function(couponCode,focusId){
            if(couponCode){
                let subCode = couponCode.split('-');
                if(subCode.length<3 || subCode.length>3){
                    toastr.warning('Mã thẻ hoặc mã thẻ phát ra không đúng định dạng 3 phần');
                    if(focusId){
                        focus(focusId);
                    }
//                    focus('vm.entry.couponCode');
                    return false;
                }
                else if(subCode[2].trim().length==0){
                    toastr.warning('Bạn chưa nhập phần số thứ tự trong mã');
                    if(focusId){
                        focus(focusId);
                    }
//                    focus('vm.entry.couponCode');
                    return false;
                }
                else if(!utils.isNumberOnly(subCode[2])){
                    toastr.warning('Phần số thứ tự không được có ký tự chữ');
                    if(focusId){
                        focus(focusId);
                    }
//                    focus('vm.entry.couponCode');
                    return false;
                }
            }
            return true;
        }

        vm.checkChildCode = function(e,index){
            if(e && e.couponCode){
                if(vm.checkCouponCodeValid(e.couponCode,null)){
                    if(vm.checkCouponCodeValid(vm.entry.couponCode,'vm.entry.couponCode')){
                        if(e.couponCode==vm.entry.couponCode){
                            toastr.warning('Mã thẻ phát ra không được trùng với mã khách hàng');
                            e.isDup = true;
                            return;
                        }
                    }
                    if(vm.entry.children.length>1){
                        for(let i=0;i<vm.entry.children.length;i++){
                            if(i!=index){
                                if(e.couponCode==vm.entry.children[i].couponCode){
                                    toastr.warning('Mã đã tồn tại trong danh sách');
                                    return;
                                }
                            }
                        }
                    }
                    let checkCodeObj={ id:e.id, couponCode:e.couponCode};
                    //Kiểm tra mã khách hàng có bị trùng hay không?
                    //Kiểm tra các thẻ khách hàng này phát ra có thẻ nào bị trùng mã hay không?
                    blockUI.start();
                    service.checkCode(checkCodeObj).then(function(data){
                        blockUI.stop();
                        if(data && data.isDup){
                            toastr.warning(data.note);
                            e.isDup = true;
                        }
                        else{
                            toastr.info('Mã hợp lệ');
                            e.isDup=false;
                        }
                        console.log("â",vm.entry.children);
                    });
                }
            }
            else{
                toastr.warning('Mã không được để trống');
            }
        }

        vm.startCouponCodeChange = function(){

        }
        vm.startCouponCodeBlur = function(){
            let subCode = vm.entry.couponCode.split('-');
            let seq = parseInt(subCode[2]);

            if(vm.entry && vm.currentOrg && vm.entry.organization.id!=vm.currentOrg.id && vm.maxSeq){
//                if(vm.startCouponCode<=vm.maxSeq){
//                    toastr.warning('Mã số thẻ bắt đầu phải lớn hơn '+vm.maxSeq);
//                    focus('vm.startCouponCode');
//                }
            }
            else{
//                 if(vm.startCouponCode<=seq){
//                     toastr.warning('Mã số thẻ bắt đầu phải lớn hơn số thứ tự thẻ của khách hàng');
// //                    focus('vm.startCouponCode');
//                 }
            }
        }
        vm.openAddSNS = function() {
            vm.entry = {};
            vm.entry.isNew = true;
            vm.entry.resultAvailable = true;

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function() {
                // TODO
            });
        };
        vm.editChild = function(id) {
            $state.go('application.sns-edit', {
                id: id
            }, {
                reload: true,
                newtab : true
            });
        }
        vm.deleteChild = function(id, index) {

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function(answer) {
                if (answer == 'yes') {
                    if (id) {
                        blockUI.start();
                        service.deleteEntries(id, function success() {
                            blockUI.stop();
//                            toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                        }).then(function(data) {
                            blockUI.stop();
                            if(data.code=='YES'){
                                toastr.info(data.message, 'Thông báo');
                                if (vm.entry.children) {
                                    vm.entry.children.splice(index, 1);
                                }
                            }
                            else{
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

                        });
                    } else {
                        if (vm.entry.children) {
                            vm.entry.children.splice(index, 1);
                        }
                    }

                }
            });
        };

        vm.removeIdNumber = function(id, index) {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'delete_entry_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function(answer) {
                if (answer == 'yes') {
                    if (id) {
                        blockUI.start();
                        service.deleteIdNumber(id, function success() {
                            blockUI.stop();
                            toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                        }).then(function() {
                            blockUI.stop();
                            toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                            if (vm.entry.snsCaseIdNumers) {
                                vm.entry.snsCaseIdNumers.splice(index, 1);
                            }
                        });
                    }
                    else {
                        if (vm.entry.snsCaseIdNumers && vm.entry.snsCaseIdNumers.length>0) {
                            vm.entry.snsCaseIdNumers.splice(index,1);
                        }
                    }

                }
            });
        };




    }

})();