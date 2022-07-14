/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SNS').controller('SNSSummaryController', SNSSummaryController);

    SNSSummaryController.$inject = [
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
        '$state'
    ];

    function SNSSummaryController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service,$state) {
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
                vm.treeData = data.content;
            });
        }
        vm.getEntries();
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
