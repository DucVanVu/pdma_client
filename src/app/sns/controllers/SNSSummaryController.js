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
        vm.expandingProperty = {field: "couponCode",sortable: true,displayName: "M?? kh??ch h??ng"};
        // Grid definition
        vm.treeColumnDefinitions = [
            {field: "name",displayName: "T??n kh??ch h??ng",sortable: true,cellTemplate: "<div  style=\"width:20%;\">{{row.branch[col.field]}}</div>"},
            {field: "age",displayName: "N??m sinh/Tu???i",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "gender",displayName: "Gi???i t??nh",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'MALE'\">NAM</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'FEMALE'\">N???</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Kh??c</div>"
//                +"<div>{{row.branch[col.field].trim()}}</div>"
            },
            {field: "riskGroup",displayName: "Nh??m nguy c??",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'MSM'\">MSM</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'NCH'\">B???n t??nh/b???n ch??ch NCH</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'TCMT'\">TCMT</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'MD'\">MD</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">OTHER</div>"
            },
            {field: "idNumber",displayName: "CMND/CCCD/s??? th??? BH/B???ng LX/S??? ??T/S??? h??? kh???u",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "hivStatus",displayName: "T??nh tr???ng HIV",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'positive'\">D????ng t??nh</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'negative'\">??m t??nh</div>"
            },
            {field: "customerSource",displayName: "Ngu???n kh??ch h??ng",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'SNS'\">SNS</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'VCT_OPC'\">VCT/OPC</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'CBOs'\">CBOs</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Kh??c/t??? ?????n</div>"
            },
            {field: "approachMethod",displayName: "H??nh th???c ti???p c???n",sortable: true,cellTemplate:
                "<div ng-if=\"row.branch[col.field].trim() == 'direct'\">Tr???c ti???p</div>"
                +"<div ng-if=\"row.branch[col.field].trim() == 'online'\">Tr???c tuy???n</div>"
            },
            {field: "totalCoupon",displayName: "T???ng s??? th??? ph??t cho CTV",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            //{field: "cardCode",displayName: "M?? s??? th???",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
            {field: "prepDate",displayName: "Ng??y ????ng k?? s??? d???ng PrEP",sortable: true,cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"},
            {field: "arvDate",displayName: "Ng??y ????ng k?? ??i???u tr??? ARV",sortable: true,cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"},
            {field: "Action",displayName: "Thao t??c",cellTemplate:
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
                         return 'N???';
                    }
                    else if(val=='OTHER'){
                         return 'Kh??c';
                    }
                    break;
            }
            return 'Kh??c';
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
                        toastr.info('???? xo?? th??nh c??ng b???n ghi!', 'Th??ng b??o');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
                    }).then(function () {
                        // reload the grid
                        vm.getEntries();
                    });
                }
            });
        };
    }

})();
