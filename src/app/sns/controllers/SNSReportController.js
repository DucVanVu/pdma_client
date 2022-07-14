/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SNS').controller('SNSReportController', SNSReportController);

    SNSReportController.$inject = [
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
        'focusFlatPick',
        'openSelectBox',
        '$state'
    ];

    function SNSReportController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service,focusFlatPick,openSelectBox,$state) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;
        vm.filter={};
        vm.entry = {};           // placeholder for an entry
        vm.entries = [];         // all entries queried for the grid
        vm.selectedEntries = []; // selected entries on the grid
        vm.treeData=[];
        // Entry statuses
        vm.subEntries = [];

        vm.modalInstance = null; // the modal dialog

        // For querying list of entries
        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };
//        $.getJSON( "/data.json", function( data ) {
//          vm.treeData = data.content;
//          console.log(vm.treeData);
//        });

        vm.getEntries = function(){
            service.getAllEntries(vm.filter, function success() {
            }, function failure() {
            }).then(function (data) {
                console.log("data",data);
                vm.treeData = data.content;
            });
        }
        vm.getEntries();
        vm.adminUnitFilter={};
        vm.getAllProvinces = function(){
            vm.adminUnitFilter.excludeVoided=true;
            vm.adminUnitFilter.parentCode="country_1";
            blockUI.start();
            service.getAdminUnit(vm.adminUnitFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                console.log("data",data);
                vm.provinces = data;
                blockUI.stop();
            });
        };
        vm.orgsWritable=[];
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                vm.orgsWritable = $scope.assignedOrgs.readable;
                if (vm.orgsWritable && vm.orgsWritable.length >= 1 && !vm.entry.id) {
                    vm.currentOrg = vm.orgsWritable[0];
                }
            }
        });
        vm.reportSNS=[];
        vm.getAllProvinces();
        vm.filterSNSReport={orgIds:[]};
        vm.searchSNSReport= function(){
            if(vm.filterSNSReport.orgIds && vm.filterSNSReport.orgIds.length==0){
                toastr.warning('Chưa chọn cơ sở báo cáo');
                openSelectBox('vm.filterSNSReport.orgIds');
                return;
            }
            if(!vm.filterSNSReport.fromDate){
                toastr.warning('Chưa chọn ngày bắt đầu');
                focusFlatPick('vm.filterSNSReport.fromDate');
                return;
            }
            if(!vm.filterSNSReport.toDate){
                toastr.warning('Chưa chọn ngày kết thúc');
                focusFlatPick('vm.filterSNSReport.toDate');
                return;
            }
            if(vm.filterSNSReport.toDate<vm.filterSNSReport.fromDate){
                toastr.warning('Ngày bắt đầu không thế lớn hơn ngày kết thúc');
                focusFlatPick('vm.filterSNSReport.fromDate');
                return;
            }
            //console.log("abc",vm.filterSNSReport)
            blockUI.start();
            service.getReport(vm.filterSNSReport,  function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                console.log("vm.reportSNS",data.listDetail);
                vm.reportSNS = data.listDetail;
                blockUI.stop();
            });
        };

        vm.exportReport = function () {
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
            if(vm.filterSNSReport.orgIds && vm.filterSNSReport.orgIds.length==0){
                toastr.warning('Chưa chọn cơ sở báo cáo');
                openSelectBox('vm.filterSNSReport.orgIds');
                return;
            }
            if(!vm.filterSNSReport.fromDate){
                toastr.warning('Chưa chọn ngày bắt đầu');
                focusFlatPick('vm.filterSNSReport.fromDate');
                return;
            }
            if(!vm.filterSNSReport.toDate){
                toastr.warning('Chưa chọn ngày kết thúc');
                focusFlatPick('vm.filterSNSReport.toDate');
                return;
            }
            if(vm.filterSNSReport.toDate<vm.filterSNSReport.fromDate){
                toastr.warning('Ngày bắt đầu không thế lớn hơn ngày kết thúc');
                focusFlatPick('vm.filterSNSReport.fromDate');
                return;
            }
            blockUI.start();
            service.exportReport(vm.filterSNSReport)
            .success(successHandler)
            .error(function () {
                blockUI.stop();
            });
        };

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
                        if(vm.filterSNSReport.fromDate>new Date()){
                            toastr.warning('Ngày chọn báo cáo không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.filterSNSReport.fromDate');
                            return;
                        }
                        
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.fromDateReport.fpItem = fpItem;
                    if (vm.filterSNSReport.fromDate && fpItem) {
                        fpItem.setDate(moment(vm.filterSNSReport.fromDate).toDate());
                    }
                },
                clear: function() {
                    if (vm.fromDateReport.fpItem) {
                        vm.fromDateReport.fpItem.clear();
                        vm.filterSNSReport.fromDate = null;
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
                        if(vm.filterSNSReport.toDate>new Date()){
                            toastr.warning('Ngày chọn báo cáo không được lớn hơn ngày hiện tại');
                            focusFlatPick('vm.filterSNSReport.toDate');
                        }
                        
                    }],
                },
                datePostSetup: function(fpItem) {
                    vm.toDateReport.fpItem = fpItem;
                    if (vm.filterSNSReport.toDate && fpItem) {
                        fpItem.setDate(moment(vm.filterSNSReport.toDate).toDate());
                    }
                },
                clear: function() {
                    if (vm.toDateReport.fpItem) {
                        vm.toDateReport.fpItem.clear();
                        vm.filterSNSReport.toDate = null;
                    }
                }
        };

        vm.totalCouponChange = function(){
//            alert('ok');
            if(vm.totalCoupon && vm.totalCoupon>0 && vm.couponDate && vm.startCouponCode && vm.startCouponCode>0){
                for(let i=0;i<vm.totalCoupon;i++){
                    let subEntry = {};
                    subEntry.code=vm.startCouponCode+i+1;
                    subEntry.date=vm.couponDate;
                    vm.subEntries.push(subEntry);
                }
            }
        }

//        debugger;
vm.male='MALE';
        vm.expandingProperty = {field: "couponCode",sortable: true,displayName: "Mã khách hàng"};
        // Grid definition
        vm.treeColumnDefinitions = [
            {field: "name",displayName: "Tên khách hàng",sortable: true,cellTemplate: "<div  style=\"width:20%;\">{{row.branch[col.field]}}</div>"},
            {field: "age",displayName: "Năm sinh/Tuổi",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "gender",displayName: "Giới tính",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'MALE'\">NAM</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'FEMALE'\">Nữ</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Khác</div>"
//                +"<div>{{row.branch[col.field].trim()}}</div>"
            },
            {field: "riskGroup",displayName: "Nhóm nguy cơ",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'MSM'\">MSM</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'NCH'\">Bạn tình/bạn chích NCH</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'TCMT'\">TCMT</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'MD'\">MD</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">OTHER</div>"
            },
            {field: "idNumber",displayName: "CMND/CCCD/số thẻ BH/Bằng LX/Số ĐT/Số hộ khẩu",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "hivStatus",displayName: "Tình trạng HIV",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'positive'\">Dương tính</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'negative'\">Âm tính</div>"
            },
            {field: "customerSource",displayName: "Nguồn khách hàng",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'SNS'\">SNS</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'VCT_OPC'\">VCT/OPC</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'CBOs'\">CBOs</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Khác/tự đến</div>"
            },
            {field: "approachMethod",displayName: "Hình thức tiếp cận",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'direct'\">Trực tiếp</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'online'\">Trực tuyến</div>"
            },
            {field: "totalCoupon",displayName: "Tổng số thẻ phát cho CTV",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            //{field: "cardCode",displayName: "Mã số thẻ",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "prepDate",displayName: "Ngày đăng ký sử dụng PrEP",sortable: true,cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"},
            {field: "arvDate",displayName: "Ngày đăng ký điều trị ARV",sortable: true,cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"},
            {field: "Action",displayName: "Thao tác",cellTemplate:
            '<a ng-click="cellTemplateScope.click(row.branch,1)"><i class="icon-pencil margin-right-15"></i></a>'
            //+'<a ng-click="cellTemplateScope.click(row.branch,2)"><i class="fa fa-eye margin-right-15"></i></a>'
            +'<a ng-click="cellTemplateScope.click(row.branch,3)"><i class="fa fa-trash margin-right-15"></i></a>',
                cellTemplateScope: {
                    click: function(data,type) {        // this works too: $scope.someMethod;
                        if(type == 1){
                            if(data.id != null || angular.isDefined(data.id)){
                                vm.editSNS(data.id);
                                console.log('this is 1');
                            }
                        }
//                                if(type == 2){
//                                    if(data.id != null || angular.isDefined(data.id)){
//                                        vm.viewDepartment(data.id);
//                                        console.log('this is 2');
//                                    }
//                                }
                        if(type == 3){
                            if(data.id != null || angular.isDefined(data.id)) {
                                vm.deleteSNS(data.id);
                                console.log('this is 3');
                            }
                        }
                    }
                }
            }
        ];
        vm.displayValue = function(field,val){
        console.log(val);
            switch (field){
                case 'gender':
                    if(val=='MALE'){
                        return 'Nam';
                    }
                    else if(val=='FEMALE'){
                         return 'Nữ';
                    }
                    else if(val=='OTHER'){
                         return 'Khác';
                    }
                    break;
            }
            return 'Khác';
        }


        vm.openAddSNS = function () {
            $state.go('application.sns-add');
//            vm.entry = {};
//            vm.entry.isNew = true;
//            vm.entry.resultAvailable = true;
//
//            vm.modalInstance = modal.open({
//                animation: true,
//                templateUrl: 'edit_entry_modal.html',
//                scope: $scope,
//                size: 'lg',
//                backdrop: 'static',
//                keyboard: false
//            });
//
//            vm.modalInstance.closed.then(function () {
//                // TODO
//            });
        };

        vm.onSelectNode = function (node) {

        };
        vm.onClickNode = function (node) {

        };
        vm.editSNS = function(id){
            $state.go('application.sns-edit', {id: id}, {reload: true});
//            alert(id);
        };
        vm.deleteSNS = function(id){

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
                    service.deleteEntries(id, function success() {
                        blockUI.stop();
                        toastr.info('Đã xoá thành công bản ghi!', 'Thông báo');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    }).then(function () {
                        // reload the grid
                        vm.getEntries();
                    });
                }
            });
        };
    }

})();
