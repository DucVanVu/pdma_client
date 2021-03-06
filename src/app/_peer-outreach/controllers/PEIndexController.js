/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PeerOutreach').controller('PEIndexController', PEIndexController);

    PEIndexController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        'PEIndexService',
        '$state',
        '$uibModal',
        'blockUI',
        'toastr',
        'focusFlatPick'
    ];

    function PEIndexController($rootScope, $scope, $http, $timeout, settings, service, $state, modal, blockUI, toastr, focusFlatPick) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;
        
        var vm = this;

        vm.entries = [];
        vm.selectedEntries = [];
        vm.modalInstance=null;

        vm.numberOfDays = 30;

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };
        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.orgsPeable = [];
        vm.grantedOrgs = [];

        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();
            
            // vm.orgsReadable = $scope.assignedOrgs.readable;
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

        // vm.getEntriesByRole = function (data) {
        //     if(!data || $scope.isAdministrator($scope.currentUser) || $scope.isProvincialManager($scope.currentUser)) {
        //         return data;
        //     }
        //     vm.orgsPeable = $scope.assignedOrgs.peable;
        //     vm.grantedOrgsData = [];
        //     data.forEach(element1 => {
        //         vm.orgsPeable.forEach(element2 => {
        //             if(element1.c1Org.id === element2.id) {
        //                 vm.grantedOrgsData.push(element1);
        //             }
        //         })
        //     });
        //     console.log("duca");
        //     console.log(vm.grantedOrgsData);
        //     return vm.grantedOrgsData;
        // }

        
        // vm.filter = {
        //     storageKey: '__pe_filter',
        //     props: ['org', 'staff', 'keyword', 'fromDate', 'toDate', 'type'],
        //     org: null,
        //     staff: null,
        //     keyword: null,
        //     fromDate: null,
        //     toDate: null,
        //     type: null
        // };
        // vm.filter1 = {
        //     pageIndex: 0,
        //     pageSize: 25
        // };

        $scope.deletePE = function (id) {
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
                    //     let c1ConvertToDate = new Date(data.c1);
                    //     let c1Convert = c1ConvertToDate.getMonth()+1;
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
                    //     let changeByQuarter = new Date(c1ConvertToDate.getFullYear(), c1ConvertToDate.getMonth(), c1ConvertToDate.getDate());
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
                    // })
                    
                    
                }
//                 if (answer == 'yes') {
//                     blockUI.start();
//                     service.deleteEntries(id, function success(data) {
//                         blockUI.stop();
//                     }, function failure(data) {
//                         blockUI.stop();
//                         toastr.error('C?? l???i x???y ra khi xo?? b???n ghi.', 'Th??ng b??o');
//                     }).then(function (data) {
//                         if(data.code=='YES'){
//                             toastr.info(data.message, 'Th??ng b??o');
//                         }
//                         else {
//                             vm.alertContent = data.message;
//                             vm.modalInstance = modal.open({
//                                 animation: true,
//                                 templateUrl: '_alert_modal.html',
//                                 scope: $scope,
//                                 size: 'md',
//                                 backdrop: 'static',
//                                 keyboard: false
//                             });
// //                            toastr.error(data.message, 'Th??ng b??o');
//                         }
//                         vm.getEntries();
//                     });
//                 }
            });
        };

        vm.getEntry = function () {
            // block the view with a loading indicator

            vm.id = $stateParams.id;

        };

        // vm.orgsWritable=[];
        // $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
        //     if (newVal == true) {
        //         vm.orgsWritable = $scope.assignedOrgs.writable;
        //         if (vm.orgsWritable && vm.orgsWritable.length == 1) {
        //             vm.currentOrg = vm.orgsWritable[0];
        //             vm.filter.org=vm.orgsWritable[0];
        //         }
        //     }
        // });

        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsPeable = $scope.assignedOrgs.peable;

                if (!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                    if(vm.orgsPeable.length == 0 || !vm.orgsPeable) {
                        $state.go('application.prev_dashboard');
                    }
                }

                vm.grantedOrgs = [];

                angular.forEach(vm.orgsReadable, function (obj) {
                    vm.grantedOrgs.push({
                        id: obj.id,
                        name: obj.name,
                        address: obj.address,
                        province: (obj.address && obj.address.province) ? obj.address.province.name : 'Kh??ng r?? t???nh'
                    });
                });
                vm.grantedOrgsTemp = vm.grantedOrgs;

                if (vm.grantedOrgs.length === 1) {
                    vm.filter.org = {};

                    angular.copy(vm.grantedOrgs[0], vm.filter.org);
                }

                // load the entries
                vm.getEntries();
            }
        });

        $scope.$watch('vm.filter.org', function (newVal, oldVal) {
            if(newVal!=oldVal){
                vm.filter.staff =null;
            }
            vm.getEntries()
            vm.getListStaff();
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

        vm.openAddPE = function () {
            $state.go('application.pe_add');
        };

        vm.getEntries = function () {
            blockUI.start();

            vm.filter.toDate = vm.tempToDate;
            if(vm.filter.toDate) {
                let convertToDate = new Date(vm.filter.toDate);
                convertToDate.setMonth(convertToDate.getMonth() + 1);
                convertToDate.setDate(convertToDate.getDate() - 1);
                vm.filter.toDate = convertToDate;
            }
            
            service.getAllEntries(vm.filter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                //vm.treeData = data.content;
                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager, vm.sortField1, vm.sortField2, vm.sortField3);
                vm.bsTableControl.options.data = data.content;
                vm.bsTableControl.options.totalRows = data.totalElements;
                blockUI.stop();
            });
        }
        vm.getEntries();
        // vm.getEntries1 = function () {
        //     //blockUI.start();
        //     service.getAllEntries(vm.filter1, function success() {
        //     }, function failure() {
        //         //blockUI.stop();
        //     }).then(function (data) {
        //         //vm.treeData = data.content;
        //         //console.log(data);
        //         let isSiteManager = $scope.isSiteManager($scope.currentUser);
        //         vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager);
        //         vm.bsTableControl.options.data = data.content;
        //         vm.bsTableControl.options.totalRows = data.totalElements;
        //         //blockUI.stop();
        //     });
        // }
        // vm.getEntries1();
        vm.getOrgs = function() {
            vm.filter.org = null;
            // let filter = {};
            // filter.provinceId = vm.filter.province;
            // blockUI.start();
            // service.getOrgsByProvinceId(vm.filter.provinceId, function success() {
            // }, function failure() {
            //     blockUI.stop();
            // }).then(function (data) {
            //     blockUI.stop();
            //     if(data) {
            //         vm.grantedOrgs = data;
            //     } else {
            //         vm.grantedOrgs = [];
            //     }
            // });
            vm.grantedOrgs = [];
            vm.grantedOrgsTemp.forEach(element => {
                if(element.address.province.id == vm.filter.provinceId) {
                    vm.grantedOrgs.push(element);
                }
            });
            vm.getEntries();
        }

        vm.filterTypes = [
            {name:'T???t c??? kh??ch h??ng',val:9},
            {name:'Kh??ch h??ng c?? t??nh tr???ng HIV d????ng t??nh khi ti???p c???n',val:1},
            {name:'Kh??ch h??ng ?????ng ?? cung c???p th??ng tin BT/BC',val:2},
            {name:'Kh??ch h??ng ?????ng ?? x??t nghi???m HIV',val:3},
            {name:'Kh??ch h??ng c?? ph???n ???ng HIV d????ng t??nh',val:4},
            {name:'Kh??ch h??ng c?? k???t qu??? kh???ng ?????nh HIV d????ng t??nh',val:5},
            {name:'Kh??ch h??ng D????ng t??nh ???????c t??nh cho ch??? ti??u MER',val:6},
            {name:'Kh??ch h??ng s??? d???ng d???ch v??? ??i???u tr??? ARV',val:7},
            {name:'Kh??ch h??ng s??? d???ng d???ch v??? ??i???u tr??? PrEP',val:8},
        ];
        
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
        $scope.$watch('vm.filter', function(newVal, oldVal) {

        });

        vm.openSearch = function() {
            if(vm.filter.fromDate && vm.filter.toDate) {
                if(new Date(vm.filter.toDate)<new Date(vm.filter.fromDate)) {
                    toastr.warning('Ng??y k???t th??c kh??ng ???????c nh??? h??n ng??y b???t ?????u');
                    return;
                }
            }
            vm.getEntries();
        }

        vm.exportPE = function () {
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
            service.exportPE(vm.filter)
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
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({}), new monthSelectPlugin({
                    shorthand: true, //defaults to false
                    // dateFormat: 'm/Y', //defaults to "F Y"
                    // altFormat: 'm/Y', //defaults to "F Y"
                    dateFormat: "Y-m-dTH:i:S", //defaults to "F Y"
                    altFormat: "m/Y", //defaults to "F Y"
                })],
                maxDate: new Date(),
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function(date) {
                        // return true to disable
                        // console.log(date);
                        return (date > new Date());
                    }
                ],
                onChange: [function() {
                    const d = this.selectedDates[0];
                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.fromDate = m.add(7, 'hours').toDate();
                    }
                    if(new Date(vm.filter.fromDate)>new Date()){
                        toastr.warning('Ng??y ch???n b??o c??o kh??ng ???????c l???n h??n ng??y hi???n t???i');
                        focusFlatPick('vm.filter.fromDate');
                        return;
                    }
                    // console.log("duc");
                    console.log(new Date(vm.filter.fromDate));
                    // console.log(new Date(vm.filter.toDate));
                    if(new Date(vm.filter.toDate) < new Date(vm.filter.fromDate) && vm.filter.toDate){
                        toastr.warning('Ng??y k???t th??c kh??ng ???????c nh??? h??n ng??y b???t ?????u');
                        focusFlatPick('vm.filter.fromDate');
                    }
                    
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
                    placeholder: 'Ch???n ng??y..',
                    plugins: [new scrollPlugin({}), new monthSelectPlugin({
                        shorthand: true, //defaults to false
                        // dateFormat: 'm/Y', //defaults to "F Y"
                        // altFormat: 'm/Y', //defaults to "F Y"
                        dateFormat: "Y-m-dTH:i:S", //defaults to "F Y"
                        altFormat: "m/Y", //defaults to "F Y"
                    })],
                    maxDate: new Date(),
                    shorthandCurrentMonth: false,
                    locale: 'vn',
                    position: 'auto',
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
                            vm.filter.toDate = m.add(7, 'hours').toDate();
                        }

                        if(new Date(vm.filter.toDate)>new Date()){
                            toastr.warning('Ng??y ch???n b??o c??o kh??ng ???????c l???n h??n ng??y hi???n t???i');
                            focusFlatPick('vm.filter.toDate');
                        }
                        if(new Date(vm.filter.toDate)<new Date(vm.filter.fromDate) && vm.filter.fromDate){
                            toastr.warning('Ng??y k???t th??c kh??ng ???????c nh??? h??n ng??y b???t ?????u');
                            focusFlatPick('vm.filter.toDate');
                        }
                        vm.tempToDate = vm.filter.toDate;
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

        $scope.sort1 = function (col) {
            if (col) {
                vm.sortField1 = col;
                console.log("duc");
                console.log(vm.sortField1);
                vm.filter.sortField = col;
                vm.getEntries();
            }
        };
        $scope.sort2 = function (col) {
            if (col) {
                vm.sortField2 = col;
                vm.filter.sortField = col;
                vm.getEntries();
            }
        };
        $scope.sort3 = function (col) {
            if (col) {
                vm.sortField3 = col;
                vm.filter.sortField = col;
                vm.getEntries();
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
                // height: 400,
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
