/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PREV_REPORT').controller('PrevDashboardController', PrevDashboardController);

    PrevDashboardController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'Utilities',
        'PrevDashboardService',
        'focusFlatPick'
    ];
    
    function PrevDashboardController ($rootScope, $scope, $state, blockUI, $timeout,settings, modal, toastr, utils, service, focusFlatPick) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            // todo if necessary check if the current user is allowed to access this page
        });

        let vm = this;
        vm.service = service;
        vm.waitingLabel = 'Đang tải dữ liệu. Vui lòng chờ...';
        vm.data = {
            summaryDataAvailable: false,
            chart1DataAvailable: false,
            chart2DataAvailable: false,
            chart3DataAvailable: false,
            chart4DataAvailable: false,
            chart5DataAvailable: false,
            chart6DataAvailable: false
        };
        vm.filter={};
        //Administrative Unit Filter
        vm.adminUnitFilter = {};
        vm.organizationFilter = {};
        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };
        vm.provinces = [];
        vm.reportTypes1 = [
            {id:1, name:"MER"},
            {id:2, name:"Không tính vào chỉ tiêu MER"}
        ];
        vm.filter.reportTypes=[];
        vm.filter.reportTypes.push(vm.reportTypes1[0].id);

        vm.modalities = [
            {id:1, name:"Cơ sở cố định"},
            {id:2, name:"Cộng đồng"},
        ];
        vm.isRole = false;
        //------Start--Phân quyền theo user đăng nhập-----------
        blockUI.start();
        service.getCurrentUser().then(function (data) {
            console.log(data);
            vm.user = data;
            var roles = data.roles;
            if (roles != null && roles.length > 0) {
                for (var i = 0; i < roles.length; i++) {
                    if (roles[i] != null && 
                        (roles[i].name.toLowerCase() == 'role_admin' || 
                        roles[i].name.toLowerCase() == 'role_donor' ||
                        roles[i].name.toLowerCase() == 'role_site_manager' ||
                        roles[i].name.toLowerCase() == 'role_provincial_manager' ||
                        roles[i].name.toLowerCase() == 'role_district_manager')) {
                        vm.isRole = true;
                    }
                }
            } else {
                vm.isRole = false;
            }
            blockUI.stop();
        });

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

        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
        
        let datePickerOptions = {
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
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ]
        };
        // Report start date
        
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.fromDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.filter.fromDate ) {
                    fpItem.setDate(moment(vm.filter.fromDate).toDate());
                    // vm.refresh();
                }
                if(!vm.filter.fromDate){
                    var today= new Date();
                    // today.setMonth(0);
                    // today.setDate(1);
                    today.setFullYear(today.getFullYear() - 1);
                    const m = moment(today, 'YYYY-MM-DD');
                    vm.filter.fromDate = m.toDate();
                    fpItem.setDate(moment(vm.filter.fromDate).toDate());
                    // vm.refresh();
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.filter.fromDate = null;
                    // vm.refresh();
                }
            }
        };

        // Report end date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.toDate = m.add(7, 'hours').toDate();
                        // vm.refresh();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.filter.toDate) {
                    fpItem.setDate(moment(vm.filter.toDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.filter.toDate = null;
                    // vm.refresh();
                }
            }
        };

        $scope.$watch('vm.filter.fromDate', function (newVal, oldVal) {
            if(newVal) {
                let convertFilterFromDate = moment(vm.filter.fromDate,"YYYY-MM-DD").toDate();
                let convertFilterToDate = moment(vm.filter.toDate,"YYYY-MM-DD").toDate();
                if(convertFilterToDate != null && convertFilterToDate < convertFilterFromDate) {
                    toastr.warning("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
                }
            }
        });

        $scope.$watch('vm.filter.toDate', function (newVal, oldVal) {
            if(newVal) {
                let convertFilterFromDate = moment(vm.filter.fromDate,"YYYY-MM-DD").toDate();
                let convertFilterToDate = moment(vm.filter.toDate,"YYYY-MM-DD").toDate();
                if(convertFilterFromDate != null && convertFilterToDate < convertFilterFromDate) {
                    toastr.warning("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
                }
            }
        });
        
        // $scope.$watch('vm.filter.province', function (newVal, oldVal) {
        //     if(newVal){
        //         getOrgIdsByProvince();
        //     }
        // });
        function getOrgIdsByProvince(){
            vm.filter.district = null;
            vm.filter.facility = null;
            let adminUnitFilter={};
            adminUnitFilter.excludeVoided=true;
            if(!vm.filter.province) {
                vm.filter.orgIds = [];
                vm.districts = [];
                vm.facilities = [];
                vm.refresh();
                return;
            }
            adminUnitFilter.parentId=vm.filter.province.id;
            blockUI.start();
            service.getAdminUnit(adminUnitFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                vm.districts = data;
            });

            let organizationFilter={};
            organizationFilter.province={
                id: vm.filter.province.id,
            };
            blockUI.start();
            service.getOrganization(organizationFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                vm.facilities = data;
                let arrayFacilities = [];
                vm.facilities.forEach(element => {
                    arrayFacilities.push(element.id);
                });
                vm.filter.orgIds = arrayFacilities;
                vm.refresh();
            });
        }
        // $scope.$watch('vm.filter.district', function (newVal, oldVal) {
        //     if(newVal){
        //         debugger
        //         getOrgIdsByDistrict();
        //     }
        // });
        vm.changeDistrict = function() {
            // vm.refresh();
            getOrgIdsByDistrict();
        };

        function getOrgIdsByDistrict(){
            vm.facilities = null;
            vm.filter.facility = null;
            let organizationFilter={};
            if(!vm.filter.district) {
                getOrgIdsByProvince();
                return;
            }
            organizationFilter.district={
                id: vm.filter.district.id,
            };

            blockUI.start();
            service.getOrganization(organizationFilter, function success() {
            }, function failure() {
                blockUI.stop();
            }).then(function (data) {
                blockUI.stop();
                vm.facilities = data;
                let arrayFacilities = [];
                vm.facilities.forEach(element => {
                    arrayFacilities.push(element.id);
                });
                vm.filter.orgIds = arrayFacilities;
                vm.refresh();
            });
        };
        vm.changeFacility = function(){
            // alert('ok');
            // debugger;
            if(!vm.filter.facility || vm.filter.facility.length==0){
                vm.filter.orgIds=[];
                if(vm.filter.facility.length==0){
                    if(vm.filter.district){
                        getOrgIdsByDistrict();
                    }
                    else if(vm.filter.province){
                        getOrgIdsByProvince();
                    }
                }
            }
            else{
                vm.filter.orgIds=vm.filter.facility;
                vm.refresh();
            }
        }
        // $scope.$watch('vm.filter.facility', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.filter.orgIds=vm.filter.facility;
        //         if(vm.filter.facility.length==0){
        //             if(vm.filter.district){
        //                 getOrgIdsByDistrict();
        //             }
        //             else if(vm.filter.province){
        //                 getOrgIdsByProvince();
        //             }
        //         }                
        //         // vm.refresh();
        //     }
        // });
        
        // $scope.$watch('vm.filter.reportTypes', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.refresh();
        //     }
        // });

        // $scope.$watch('vm.filter.fromDate', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.refresh();
        //     }
        // });
        
        // $scope.$watch('vm.filter.toDate', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.refresh();
        //     }
        // });
        
        // $scope.$watch('vm.filter.modality', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.refresh();
        //     }
        // });

        // $scope.$watch('vm.filter.orgIds', function (newVal, oldVal) {
        //     if(newVal){
        //         vm.refresh();
        //     }
        // });
        
        drawCharts($scope, vm,$state);

        vm.refresh = function () {
            blockUI.start();
            vm.data = {
                summaryDataAvailable: false,
                chart1DataAvailable: false,
                chart2DataAvailable: false,
                chart3DataAvailable: false,
                chart4DataAvailable: false,
                chart5DataAvailable: false,
                chart6DataAvailable: false,
                summaryData: {},
                summaryData2: {},
                chart1Data: [],
                chart2Data: [],
                chart3Data: {},
                chart4Data: {},
                chart5Data: [],
                chart6Data: []
            };

            // making sure this does not block the query for administrative data
            $timeout(function () {
                vm.getTotalsPE(vm.filter);
                vm.getTotalsHTS(vm.filter);
                vm.getTotalsHIV(vm.filter);
                vm.getTotalsARV(vm.filter);
                vm.getTotalsPrEP(vm.filter);
                vm.getToltalsSection2(vm.filter);
                vm.getToltalsSection3(vm.filter);
                // Section 1
                // vm.getSummary4Section1();
                vm.getDataForChart1();
                vm.getDataForChart2();
                vm.getDataForChart3();
                vm.getDataForChart4();
                vm.getDataForChart5();
                vm.getDataForChart6();
                vm.getDataForChart7();
                vm.getDataForChart8();

                // Section 2
                // vm.getSummary4Section2();
                vm.getDataForChart9();
                vm.getDataForChart10();

                // Section 3
                // vm.getSummary4Section3();
                vm.getDataForChart11();
                vm.getDataForChart12();

                vm.getDataForChart13();
                vm.getDataForChart14();
            }, 150);
            blockUI.stop();
        };

        vm.refresh();
        // Xét nghiệm khẳng định HIV+ thì thời gian báo cáo
        vm.getDataForChart1 = function () {
            vm.data.chart1DataAvailable = true;
            $timeout(function () {
                vm.drawChart1();
            }, 500);
        };
        // Xét nghiệm khẳng định HIV+ thì đơn vị hành chính
        vm.getDataForChart2 = function () {
            vm.data.chart2DataAvailable = true;
            $timeout(function () {
                vm.drawChart2();
            }, 500);
        };

        vm.getDataForChart3 = function () {
            vm.data.chart3DataAvailable = true;
            $timeout(function () {
                vm.drawChart3();
            }, 500);
        };

        vm.getDataForChart4 = function () {
            vm.data.chart4DataAvailable = true;
            $timeout(function () {
                vm.drawChart4();
            }, 500);
        };

        vm.getDataForChart5 = function () {
            vm.data.chart5DataAvailable = true;
            $timeout(function () {
                vm.drawChart5();
            }, 500);
        };

        vm.getDataForChart6 = function () {
            vm.data.chart6DataAvailable = true;
            $timeout(function () {
                vm.drawChart6();
            }, 500);
        };

        vm.getDataForChart7 = function () {
            vm.data.chart7DataAvailable = true;
            $timeout(function () {
                vm.drawChart7();
            }, 500);
        };

        vm.getDataForChart8 = function () {
            vm.data.chart8DataAvailable = true;
            $timeout(function () {
                vm.drawChart8();
            }, 500);
        };

        // -----------------------------------------------------------------------
        // Section 2: Xét nghiệm phát hiện mới nhiễm HIV
        // -----------------------------------------------------------------------

        // Chart 9: Xét nghiệm phát hiện mới nhiễm HIV theo thời gian báo cáo
        vm.getDataForChart9 = function () {
            vm.data.chart9DataAvailable = true;
            $timeout(function () {
                vm.drawChart9();
            }, 500);
        };

        // Chart 10: Xét nghiệm phát hiện mới nhiễm HIV theo đơn vị hành chính
        vm.getDataForChart10 = function () {
            vm.data.chart10DataAvailable = true;
            $timeout(function () {
                vm.drawChart10();
            }, 500);
        };

        // -----------------------------------------------------------------------
        // Section 3: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV
        // -----------------------------------------------------------------------

        // Chart 11: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV theo thời gian báo cáo
        vm.getDataForChart11 = function () {
            vm.data.chart11DataAvailable = true;
            $timeout(function () {
                vm.drawChart11();
            }, 500);
        };

        // Chart 12: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV theo đơn vị hành chính
        vm.getDataForChart12 = function () {
            vm.data.chart12DataAvailable = true;
            $timeout(function () {
                vm.drawChart12();
            }, 500);
        };

        vm.getDataForChart13 = function () {
            vm.data.chart13DataAvailable = true;
            $timeout(function () {
                vm.drawChart13();
            }, 500);
        };

        vm.getDataForChart14 = function () {
            vm.data.chart14DataAvailable = true;
            $timeout(function () {
                vm.drawChart14();
            }, 500);
        };

        vm.chart1 = function (type){
            vm.filter.chart1=type;
            vm.getDataForChart1();
        }
        vm.chart2 = function (type){
            vm.filter.chart2=type;
            vm.getDataForChart2();
        }
        vm.chart3 = function (type){
            vm.filter.chart3=type;
            vm.getDataForChart3();
        }
        vm.chart4 = function (type){
            vm.filter.chart4=type;
            vm.getDataForChart4();
        }
        vm.chart5 = function (type){
            vm.filter.chart5=type;
            vm.getDataForChart5();
        }
        vm.chart6 = function (type){
            vm.filter.chart6=type;
            vm.getDataForChart6();
        }
        vm.chart7 = function (type){
            vm.filter.chart7=type;
            vm.getDataForChart7();
        }
        vm.chart8 = function (type){
            vm.filter.chart8=type;
            vm.getDataForChart8();
        }
        vm.chart9 = function (type){
            vm.filter.chart9=type;
            vm.getDataForChart9();
        }
        vm.chart10 = function (type){
            vm.filter.chart10=type;
            vm.getDataForChart10();
        }
        vm.chart11 = function (type){
            vm.filter.chart11=type;
            vm.getDataForChart11();
        }
        vm.chart12 = function (type){
            vm.filter.chart12=type;
            vm.getDataForChart12();
        }

        vm.totalsPE=0;
        vm.totalsHTS=0;
        vm.totalsHIV=0;
        vm.percentHIV=0;
        vm.totalsARV=0;
        vm.percentARV=0;
        vm.totalsPrEP=0;
        vm.toltalsSection21=0;
        vm.toltalsSection22=0;
        vm.toltalsSection23=0;
        vm.toltalsSection24=0;
        vm.toltalsSection25=0;

        vm.toltalsSection31=0;
        vm.toltalsSection32=0;
        vm.toltalsSection33=0;
        vm.toltalsSection34=0;
        vm.toltalsSection35=0;
        vm.toltalsSection36=0;
        vm.toltalsSection37=0;

        vm.validateGetTotal = function() {
            if((!vm.filter.province && !vm.filter.district) || (vm.filter.orgIds && vm.filter.orgIds.length > 0)) {
                return true;
            }
            return false;
        }

        vm.getTotalsPE = function(filter){
            if(vm.validateGetTotal()) {
                service.getTotalsPE(filter, function success() {
                }, function failure() {
                    // blockUI.stop();
                }).then(function (data) {
                    // blockUI.stop();
                    vm.retChart1 = data;
                    var series1=[];
                    var series3=[];
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity);
                        series3.push(vm.retChart1.series[cat].percent);
                    }
                    if(series1.length>0){
                        vm.totalsPE=series1[0];
                    } else{
                        vm.totalsPE=0;
                    }
                });
            } else {
                vm.totalsPE=0;
            }
        }

        vm.getTotalsHTS =  function(filter){
            if(vm.validateGetTotal()) {
                service.getTotalsHTS(filter, function success() {
                }, function failure() {
                    // blockUI.stop();
                }).then(function (data) {
                    // blockUI.stop();
                    vm.retChart1 = data;
                    var series1=[];
                    var series3=[];
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity + vm.retChart1.series[cat].secondQuantity);
                        series3.push(vm.retChart1.series[cat].percent);
                    }
                    if(series1.length>0){
                        vm.totalsHTS=series1[0];
                    } else{
                        vm.totalsHTS=0;
                    }
                });
            } else {
                vm.totalsHTS=0;
            }
        }

        vm.getTotalsHIV =  function(filter){
            if(vm.validateGetTotal()) {
                service.getTotalsHIV(filter, function success() {
                }, function failure() {
                    // blockUI.stop();
                }).then(function (data) {
                    // blockUI.stop();
                    vm.retChart1 = data;
                    var series1=[];
                    var series3=[];
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].secondQuantity);
                        series3.push(vm.retChart1.series[cat].percent);
                    }
                    if(series1.length>0){
                        vm.totalsHIV=series1[0];
                        vm.percentHIV=series3[0];
                    } else{
                        vm.totalsHIV=0;
                        vm.percentHIV=0;
                    }
                });
            } else{
                vm.totalsHIV=0;
                vm.percentHIV=0;
            }
        }

        vm.getTotalsARV =  function(filter){
            if(vm.validateGetTotal()) {
                service.getTotalsARV(filter, function success() {
                }, function failure() {
                    // blockUI.stop();
                }).then(function (data) {
                    // blockUI.stop();
                    vm.retChart1 = data;
                    var series1=[];
                    var series3=[];
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity);
                        series3.push(vm.retChart1.series[cat].percent);
                    }
                    if(series1.length>0){
                        vm.totalsARV=series1[0];
                        vm.percentARV=series3[0];
                    } else{
                        vm.totalsARV=0;
                        vm.percentARV=0;
                    }
                });
            } else{
                vm.totalsARV=0;
                vm.percentARV=0;
            }
        }

        vm.getTotalsPrEP =  function(filter){
            if(vm.validateGetTotal()) {
                service.getTotalsPrEP(filter, function success() {
                }, function failure() {
                    // blockUI.stop();
                }).then(function (data) {
                    // blockUI.stop();
                    vm.retChart1 = data;
                    var series1=[];
                    var series3=[];
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity);
                        series3.push(vm.retChart1.series[cat].percent);
                    }
                    if(series1.length>0){
                        vm.totalsPrEP=series1[0];
                    } else{
                        vm.totalsPrEP=0;
                    }
                });
            } else{
                vm.totalsPrEP=0;
            }
        }

        vm.changeMap = function(){
            // debugger
            if(vm.filter.province && vm.filter.province.name) {
                vm.filter.chart13=1;
                vm.filter.chart14=1;
                vm.getDataForChart13();
                vm.getDataForChart14();
            }else{
                vm.filter.chart13=0;
                vm.filter.chart14=0;
                vm.getDataForChart13();
                vm.getDataForChart14();
            }
            // vm.refresh();
            getOrgIdsByProvince();
        }

        vm.getToltalsSection3 =  function(filter){
            service.getToltalsSection3(filter, function success() {
            }, function failure() {
                // blockUI.stop();
            }).then(function (data) {
                // blockUI.stop();
                vm.retChart1 = data;
                var series1=[];
                var series2=[];
                var series3=[];
                var series4=[];
                var series5=[];
                var series6=[];
                var series7=[];
                if(vm.validateGetTotal()) {
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity);
                        series2.push(vm.retChart1.series[cat].secondQuantity);
                        series3.push(vm.retChart1.series[cat].thirdQuantity);
                        series4.push(vm.retChart1.series[cat].fourQuantity);
                        series5.push(vm.retChart1.series[cat].fiveQuantity);
                        series6.push(vm.retChart1.series[cat].sixQuantity);
                        series7.push(vm.retChart1.series[cat].sevenQuantity);
                    }
                }
                if(series1.length>0){
                    vm.toltalsSection31=series1[0];
                }else{
                    vm.toltalsSection31=0;
                }
                if(series2.length>0){
                    vm.toltalsSection32=series2[0];
                }else{
                    vm.toltalsSection32=0;
                }
                if(series3.length>0){
                    vm.toltalsSection33=series3[0];
                }else{
                    vm.toltalsSection33=0;
                }
                if(series4.length>0){
                    vm.toltalsSection34=series4[0];
                }else{
                    vm.toltalsSection34=0;
                }
                if(series5.length>0){
                    vm.toltalsSection35=series5[0];
                }else{
                    vm.toltalsSection35=0;
                }
                if(series6.length>0){
                    vm.toltalsSection36=series6[0];
                }else{
                    vm.toltalsSection36=0;
                }
                if(series7.length>0){
                    vm.toltalsSection37=series7[0];
                }else{
                    vm.toltalsSection37=0;
                }
                
            });
        }

        vm.getToltalsSection2 =  function(filter){
            service.getToltalsSection2(filter, function success() {
            }, function failure() {
                // blockUI.stop();
            }).then(function (data) {
                // blockUI.stop();
                vm.retChart1 = data;
                var series1=[];
                var series2=[];
                var series3=[];
                var series4=[];
                var series5=[];
                if(vm.validateGetTotal()) {
                    for (let index = 0; index < vm.retChart1.categories.length; index++) {
                        const cat = vm.retChart1.categories[index];
                        series1.push(vm.retChart1.series[cat].firstQuantity);
                        series2.push(vm.retChart1.series[cat].secondQuantity);
                        series3.push(vm.retChart1.series[cat].thirdQuantity);
                        series4.push(vm.retChart1.series[cat].fourQuantity);
                        series5.push(vm.retChart1.series[cat].fiveQuantity);
                    }
                }
                if(series1.length>0){
                    vm.toltalsSection21=series1[0];
                }else{
                    vm.toltalsSection21=0;
                }
                if(series2.length>0){
                    vm.toltalsSection22=series2[0];
                }else{
                    vm.toltalsSection22=0;
                }
                if(series3.length>0){
                    vm.toltalsSection23=series3[0];
                }else{
                    vm.toltalsSection23=0;
                }
                if(series4.length>0){
                    vm.toltalsSection24=series4[0];
                }else{
                    vm.toltalsSection24=0;
                }
                if(series5.length>0){
                    vm.toltalsSection25=series5[0];
                }else{
                    vm.toltalsSection25=0;
                }
                
            });
        }

    }

})();