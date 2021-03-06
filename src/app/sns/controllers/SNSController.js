/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SNS').controller('SNSController', SNSController);

    SNSController.$inject = [
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

    function SNSController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service, $state) {
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
        vm.treeData = [];
        // Entry statuses
        vm.subEntries = [];
        vm.numberOfDays = 30;
        vm.modalInstance = null; // the modal dialog

        blockUI.start();
        vm.orgsSnsable = [];
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();
            
            // vm.orgsReadable = $scope.assignedOrgs.readable;
            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }
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

        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsSnsable = $scope.assignedOrgs.snsable;
                
                if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                    if(vm.orgsSnsable.length == 0 || !vm.orgsSnsable) {
                        blockUI.stop();
                        $state.go('application.prev_dashboard');
                    }
                }

                // load the entries
                // vm.getEntries();
            }
        });

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
            name: 'N???'
        }];
        vm.listHivStatus = [{
            id: 'positive',
            name: 'D????ng t??nh'
        }, {
            id: 'negative',
            name: '??m t??nh'
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
            name: 'Kh??c/t??? ?????n'
        }];

        vm.riskGroups = [{
            id: 'MSM',
            name: 'MSM'
        }, {
            id: 'NCH',
            name: 'B???n t??nh/b???n ch??ch NCH'
        }, {
            id: 'TCMT',
            name: 'Ti??m ch??ch ma t??y'
        }, {
            id: 'MD',
            name: 'M???i d??m'
        }, {
            id: 'OTHER',
            name: 'Kh??c'
        }];
        vm.approachMethods = [{
            id: 'direct',
            name: 'Tr???c ti???p'
        }, {
            id: 'online',
            name: 'Tr???c tuy???n'
        }];

        vm.idNumberTypes=[{ id: 'CMND', name: 'Ch???ng m??nh nh??n d??n'}
        ,{ id: 'CCCD', name: 'C??n c?????c c??ng d??n'}
        ,{ id: 'THE_BH', name: 'Th??? b???o hi???m'}
        ,{ id: 'BANG_LAI', name: 'B???ng l??i xe'}
        ,{ id: 'SDT', name: 'S??? ??i???n tho???i'}
        ,{ id: 'HO_KHAU', name: 'S??? H??? kh???u'}];
//        $.getJSON( "/data.json", function( data ) {
//          vm.treeData = data.content;
//          console.log(vm.treeData);
//        });
        vm.alertContent="";
        vm.getEntries = function () {
            blockUI.start();
            service.getAllEntries(vm.filter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                vm.treeData = data.content;
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(false,isSiteManager);
                vm.bsTableControl.options.data = data.content;
                vm.bsTableControl.options.totalRows = data.totalElements;
                blockUI.stop();
            });
        };
        vm.getEntries();

        vm.openSearch = function () {
            vm.getEntries();
        }

        vm.totalCouponChange = function () {
//            alert('ok');
            if (vm.totalCoupon && vm.totalCoupon > 0 && vm.couponDate && vm.startCouponCode && vm.startCouponCode > 0) {
                for (let i = 0; i < vm.totalCoupon; i++) {
                    let subEntry = {};
                    subEntry.code = vm.startCouponCode + i + 1;
                    subEntry.date = vm.couponDate;
                    vm.subEntries.push(subEntry);
                }
            }
        }

//        bsTableControl
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

                    // Reloading entries upon page change
                    vm.getEntries();
                }
            }
        };
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
                (vm.filter.riskGroup && vm.filter.riskGroup.length>0)
                || (vm.filter.hivStatus && vm.filter.hivStatus.length>0)
                || (vm.filter.customerSource && vm.filter.customerSource.length>0)
                || (vm.filter.approachMethod && vm.filter.approachMethod.length>0)
                || (vm.filter.fromYear && vm.filter.fromYear>0)
                || (vm.filter.toYear && vm.filter.toYear>0)
                || vm.filter.prepDateFrom
                || vm.filter.prepDateTo
                || vm.filter.arvDateFrom
                || vm.filter.arvDateTo;
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

        // Grid definition
//        vm.expandingProperty = {field: "couponCode", sortable: false, displayName: "M??&nbsp;KH"};
//        vm.treeColumnDefinitions = [
//            {
//                field: "Action",
//                displayName: "<div class='nowrap'>Thao t??c</div>",
//                cellTemplate:
//                    '<a ng-click="cellTemplateScope.click(row.branch,1)"><i class="icon-pencil margin-right-15"></i></a>'
//                    //+'<a ng-click="cellTemplateScope.click(row.branch,2)"><i class="fa fa-eye margin-right-15"></i></a>'
//                    + '<a ng-click="cellTemplateScope.click(row.branch,3)"><i class="fa fa-trash margin-right-15"></i></a>',
//                cellTemplateScope: {
//                    click: function (data, type) {        // this works too: $scope.someMethod;
//                        if (type == 1) {
//                            if (data.id != null || angular.isDefined(data.id)) {
//                                vm.editSNS(data.id);
//                                console.log('this is 1');
//                            }
//                        }
////                                if(type == 2){
////                                    if(data.id != null || angular.isDefined(data.id)){
////                                        vm.viewDepartment(data.id);
////                                        console.log('this is 2');
////                                    }
////                                }
//                        if (type == 3) {
//                            if (data.id != null || angular.isDefined(data.id)) {
//                                vm.deleteSNS(data.id);
//                                console.log('this is 3');
//                            }
//                        }
//                    }
//                }
//            },
//            {
//                field: "name",
//                displayName: "<div class='nowrap'>T??n kh??ch h??ng</div>",
//                sortable: false,
//                cellTemplate: "<div class='nowrap' style='min-width: 180px;'>{{row.branch[col.field]}}</div>"
//            },
//            {
//                field: "yearOfBirth",
//                displayName: "<div class='nowrap'>N??m sinh</div>",
//                sortable: false,
//                cellTemplate: "<div class='nowrap'>{{row.branch[col.field]}}</div>"
//            },
//            {
//                field: "gender",
//                displayName: "<div class='nowrap'>Gi???i t??nh</div>",
//                sortable: false,
//                cellTemplate:
//                    "<div ng-if=\"row.branch[col.field].trim() == 'MALE'\" ng-cloak=''>Nam</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'FEMALE'\">N???</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Kh??c</div>"
//            },
//            {
//                field: "riskGroup",
//                displayName: "<div class='nowrap'>Nh??m nguy c??</div>",
//                sortable: false,
//                cellTemplate:
//                    "<div ng-if=\"row.branch[col.field].trim() == 'MSM'\">MSM</div>"
//                    + "<div class='nowrap' ng-if=\"row.branch[col.field].trim() == 'NCH'\">B???n t??nh/b???n ch??ch NCH</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'TCMT'\">TCMT</div>"
//                    + "<div class='nowrap' ng-if=\"row.branch[col.field].trim() == 'MD'\">M???i d??m</div>"
//                    + "<div class='nowrap' ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Nh??m kh??c</div>"
//            },
//            {
//                field: "idNumber",
//                displayName: "<div class='nowrap'>M?? ?????nh danh</div>",
//                sortable: false,
//                cellTemplate: "<div>{{row.branch[col.field]}}</div>"
//            },
//            {
//                field: "hivStatus",
//                displayName: "<div class='nowrap'>T??nh tr???ng HIV</div>",
//                sortable: false,
//                cellTemplate:
//                    "<div class='nowrap' ng-if=\"row.branch[col.field].trim() == 'positive'\">D????ng t??nh</div>"
//                    + "<div class='nowrap' ng-if=\"row.branch[col.field].trim() == 'negative'\">??m t??nh</div>"
//            },
//            {
//                field: "customerSource",
//                displayName: "<div class='nowrap'>Ngu???n kh??ch h??ng</div>",
//                sortable: false,
//                cellTemplate:
//                    "<div ng-if=\"row.branch[col.field].trim() == 'SNS'\">SNS</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'VCT_OPC'\">VCT/OPC</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'CBOs'\">CBO</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'OTHER'\">Kh??c/t??? ?????n</div>"
//            },
//            {
//                field: "approachMethod",
//                displayName: "<div class='nowrap'>H??nh th???c ti???p c???n</div>",
//                sortable: false,
//                cellTemplate:
//                    "<div ng-if=\"row.branch[col.field].trim() == 'direct'\">Tr???c ti???p</div>"
//                    + "<div ng-if=\"row.branch[col.field].trim() == 'online'\">Tr???c tuy???n</div>"
//            },
//            {
//                field: "totalCoupon",
//                displayName: "<div class='nowrap'>S??? th??? ph??t ra</div>",
//                sortable: false,
//                cellTemplate: "<div>{{row.branch[col.field]}}</div>"
//            },
//            //{field: "cardCode",displayName: "M?? s??? th???",sortable: true,cellTemplate: "<div>{{row.branch[col.field]}}</div>"},
//            {
//                field: "prepDate",
//                displayName: "<div class='nowrap'>????ng k?? s??? d???ng PrEP</div>",
//                sortable: false,
//                cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"
//            },
//            {
//                field: "arvDate",
//                displayName: "<div class='nowrap'>????ng k?? ??i???u tr??? ARV</div>",
//                sortable: false,
//                cellTemplate: "<div>{{row.branch[col.field] | date:'dd/MM/yyyy'}}</div>"
//            }
//
//        ];
        vm.displayValue = function (field, val) {
            console.log(val);
            switch (field) {
                case 'gender':
                    if (val == 'MALE') {
                        return 'Nam';
                    }
                    else if (val == 'FEMALE') {
                        return 'N???';
                    }
                    else if (val == 'OTHER') {
                        return 'Kh??c';
                    }
                    break;
            }
            return 'Kh??c';
        }


        vm.openAddSNS = function () {
            $state.go('application.sns-add');
        };

        vm.onSelectNode = function (node) {

        };
        vm.onClickNode = function (node) {

        };
        $scope.editSNS = function (id) {
            $state.go('application.sns-edit', {id: id}, {reload: true});
//            alert(id);
        };

        $scope.deleteSNS = function (id) {

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
                    //     console.log("duc");
                    //     console.log(data);
                    //     let convertTestDate = new Date(data.testDate);
                    //     let testDateConvert = convertTestDate.getMonth()+1;
                    //     let calculateQuarter = null;
                    //     if(testDateConvert>0 && testDateConvert<4) {
                    //         calculateQuarter = 1;
                    //     } else if(testDateConvert>3 && testDateConvert<7) {
                    //         calculateQuarter = 2;
                    //     } else if(testDateConvert>6 && testDateConvert<10) {
                    //         calculateQuarter = 3;
                    //     } else if(testDateConvert>9 && testDateConvert<13) {
                    //         calculateQuarter = 4;
                    //     }
                    //     let changeByQuarter = new Date(convertTestDate.getFullYear(), convertTestDate.getMonth(), convertTestDate.getDate());
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
                    //             toastr.warning("???? qu?? th???i h???n ch???nh s???a phi???u","Th??ng b??o");
                    //             return;
                    //         }
                    //     }
                        service.deleteEntries(id, function success(data) {
                            blockUI.stop();
                        }, function failure(data) {
                            blockUI.stop();
                            toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
                        }).then(function (data) {
                            // reload the grid
                            if(data.code=='YES'){
                                toastr.info(data.message, 'Th??ng b??o');
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
    //                            toastr.error(data.message, 'Th??ng b??o');
                            }
                            vm.getEntries();
                        });
                    // });
                }
            });
        };

        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Ch???n ng??y..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: true,
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ]
        };

        vm.prepDateFrom = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.prepDateFrom = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.prepDateFrom.fpItem = fpItem;
                if (vm.filter.prepDateFrom) {
                    fpItem.setDate(moment(vm.filter.prepDateFrom).toDate());
                }
            },
            clear: function () {
                if (vm.prepDateFrom.fpItem) {
                    vm.prepDateFrom.fpItem.clear();
                    vm.filter.prepDateFrom = null;
                }
            }
        };
        vm.prepDateTo = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.prepDateTo = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.prepDateTo.fpItem = fpItem;
                if (vm.filter.prepDateTo) {
                    fpItem.setDate(moment(vm.filter.prepDateTo).toDate());
                }
            },
            clear: function () {
                if (vm.prepDateTo.fpItem) {
                    vm.prepDateTo.fpItem.clear();
                    vm.filter.prepDateTo = null;
                }
            }
        };
        vm.arvDateFrom = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.arvDateFrom = m.add(7, 'hours').toDate();
                    }
                    vm.openSearch();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.arvDateFrom.fpItem = fpItem;
                if (vm.filter.arvDateFrom) {
                    fpItem.setDate(moment(vm.filter.arvDateFrom).toDate());
                }
            },
            clear: function () {
                if (vm.arvDateFrom.fpItem) {
                    vm.arvDateFrom.fpItem.clear();
                    vm.filter.arvDateFrom = null;
                }
            }
        };
        vm.arvDateTo = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.arvDateTo = m.add(7, 'hours').toDate();
                    }
                    vm.openSearch();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.arvDateTo.fpItem = fpItem;
                if (vm.filter.arvDateTo) {
                    fpItem.setDate(moment(vm.filter.arvDateTo).toDate());
                }
            },
            clear: function () {
                if (vm.arvDateTo.fpItem) {
                    vm.arvDateTo.fpItem.clear();
                    vm.filter.arvDateTo = null;
                }
            }
        };
        /**
        ---------------------------------------------------
         BEGIN : Export
         --------------------------------------------------
         **/
        vm.exportList = function (targetChart) {
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
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = targetChart;
            blockUI.start();
            service.exportList(filter)
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
        /**
         * -------------------------------------------------
         * END: Export
         * -------------------------------------------------
         */
    }

})();
