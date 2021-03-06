/**
 * Created by bizic on 28/8/2016.
 */

(function () {
    'use strict';
    angular.module('PDMA.Reporting').controller('WeeklyReportDashboardController', WeeklyReportDashboardController);

    WeeklyReportDashboardController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$state',
        '$filter',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'Utilities',
        'WeeklyReportingService',
        'OrganizationService',
        'AdminUnitService',
        'UserService'
    ];

    function WeeklyReportDashboardController($rootScope, $scope, $http, $state, $filter, $timeout, settings, modal, toastr, blockUI, utils, service, orgService, auService, uService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.orgsReadable = [];
        vm.provinces = [];
        vm.organizations = [];
        vm.loading = false;

        vm.MAX_DATE = moment(new Date()).startOf('isoWeek').add(-1, 'day').toDate();
        let defaultDate = moment(vm.MAX_DATE, 'YYYY-MM-DD').startOf('isoWeek').add(5, 'days').toDate();
        let defaultEndOfWeek = moment(vm.MAX_DATE, 'YYYY-MM-DD').startOf('isoWeek').add(7, 'days').add(6, 'hours').add(59, 'minutes').add(59, 'seconds').toDate();
        let weeksOfYear = utils.weeksInYear(moment(new Date()).year());

        vm.data = {
            summary: [0, 0, 0, 0],
            fromDate: null,
            toDate: defaultEndOfWeek,
            htsTstAnnTarget: 0,
            htsPosAnnTarget: 0,
            txNewAnnTarget: 0,
            htsTstData: [],
            htsPosData: [],
            posRtriPos: [],
            posOfferedPns: [],
            txNewData: [],
            txNewNDiagData: [],
            txNewODiagData: [],
            txNewIndeterminate: [],
            txNewSameDayData: [],
            posRate: [],
            htsTstCumData: [],
            htsPosCumData: [],
            txNewCumData: []
        };

        vm.filter = {
            province: null,
            org: null,
            tempDate: defaultEndOfWeek,
            toDate: defaultEndOfWeek
        };

        vm.pageJustLoaded = [true, true];

        // let customBlockUI = blockUI.instances.get('dashboardChartArea');

        vm.getChartData = function () {
            vm.loading = true;
            $timeout(function () {
                // blockUI.start();
                service.getChartData(vm.filter).then(function (data) {
                    // blockUI.stop();
                    vm.loading = false;

                    vm.data = data;
                    vm.prepareChartData();
                    vm.redrawCharts();
                });
            }, 150);
        };

        /**
         * Switch to the progress details page
         * @param status
         */
        vm.viewProgressDetails = function (status) {
            $state.go('application.weekly_report_progress', {status: status});
        };

        // vm.getChartData();

        /**
         * Prepare data...
         */
        vm.prepareChartData = function () {
            vm.data.htsPosTarget8Weeks = [];
            vm.data.txNewTarget8Weeks = [];
            vm.data.htsPosTarget12Months = [];
            vm.data.txNewTarget12Months = [];
            vm.data.weekLabels = [];
            vm.data.monthLabels = [];

            let toDate = vm.data.toDate;
            toDate = moment({
                year: toDate.year,
                month: toDate.monthValue - 1,
                day: toDate.dayOfMonth,
                hour: toDate.hour,
                minute: toDate.minute,
                second: toDate.second,
                millisecond: toDate.nano
            });

            let year = toDate.year();
            let week = toDate.week();

            for (let i = 7; i >= 0; i--) {
                vm.data.weekLabels[i] = 'T.' + week + '/' + year;

                toDate = toDate.add(-1, 'week');
                year = toDate.year();
                week = toDate.week();
            }

            if (vm.data.toDate.monthValue >= 10 && vm.data.toDate.monthValue <= 12) {
                toDate = moment({
                    year: vm.data.toDate.year,
                    month: 8,
                    day: 30,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                }).add(1, 'year');
            } else {
                toDate = moment({
                    year: vm.data.toDate.year,
                    month: 8,
                    day: 30,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                });
            }

            year = toDate.year();
            let month = toDate.month();
            for (let i = 11; i >= 0; i--) {
                vm.data.monthLabels[i] = 'Th.' + (month + 1) + '/' + year;

                toDate = toDate.add(-1, 'month');
                year = toDate.year();
                month = toDate.month();
            }

            let htsPosTargetByWeek = Math.round(vm.data.htsPosAnnTarget / weeksOfYear);
            let txNewTargetByWeek = Math.round(vm.data.txNewAnnTarget / weeksOfYear);
            let htsPosTargetByMonth = vm.data.htsPosAnnTarget / 12;
            let txNewTargetByMonth = vm.data.txNewAnnTarget / 12;

            for (let i = 0; i < 8; i++) {
                vm.data.htsPosTarget8Weeks[i] = htsPosTargetByWeek;
                vm.data.txNewTarget8Weeks[i] = txNewTargetByWeek;
            }

            for (let i = 0; i < 12; i++) {
                vm.data.htsPosTarget12Months[i] = htsPosTargetByMonth;
                vm.data.txNewTarget12Months[i] = txNewTargetByMonth;
            }

            // Calculate cummulative 12-month targets
            for (let i = 1; i < 12; i++) {
                vm.data.htsPosTarget12Months[i] += vm.data.htsPosTarget12Months[i - 1];
                vm.data.txNewTarget12Months[i] += vm.data.txNewTarget12Months[i - 1];
            }

            // round each value
            for (let i = 0; i < 12; i++) {
                vm.data.htsPosTarget12Months[i] = Math.round(vm.data.htsPosTarget12Months[i]);
                vm.data.txNewTarget12Months[i] = Math.round(vm.data.txNewTarget12Months[i]);
            }

            // HTS_POS_Rate
            for (let i = 0; i < vm.data.posRate.length; i++) {
                vm.data.posRate[i] = vm.data.posRate[i] * 100;
            }
        };

        // Get all provinces
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            if (data) {
                vm.provinces = data;
            } else {
                vm.provinces = [];
            }
        });

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                angular.copy(vm.orgsReadable, vm.organizations);

                $timeout(function () {
                    if (vm.organizations.length == 1) {
                        vm.filter.org = vm.organizations[0];
                    }

                    vm.getChartData();
                }, 300);
            }
        });

        /**
         * On province change
         */
        vm.onProvinceChange = function () {
            vm.organizations = [];
            if (!vm.filter.province || !vm.filter.province.id) {
                angular.copy(vm.orgsReadable, vm.organizations);
            } else {
                angular.forEach(vm.orgsReadable, function (obj) {
                    if (obj.address.province.id == vm.filter.province.id) {
                        vm.organizations.push(obj);
                    }
                });
            }

            vm.filter.org = null;
            vm.getChartData();
        };

        // $scope.$watch('vm.filter.province', function (newVal, oldVal) {
        //     vm.organizations = [];
        //     if (newVal && newVal.id) {
        //         angular.forEach(vm.orgsReadable, function (obj) {
        //             if (obj.address.province.id == newVal.id) {
        //                 vm.organizations.push(obj);
        //             }
        //         });
        //         if (vm.filter.org && vm.filter.org.id) {
        //             if (vm.filter.org.address.province.id != newVal.id) {
        //                 vm.filter.org = null;
        //                 vm.getChartData();
        //             }
        //         } else {
        //             vm.getChartData();
        //         }
        //
        //     } else {
        //         angular.copy(vm.orgsReadable, vm.organizations);
        //
        //         if (vm.filter.org != null) {
        //             vm.filter.org = null; // this trigger reload already
        //         } else {
        //             if (!vm.pageJustLoaded[0]) {
        //                 vm.getChartData();
        //             }
        //             vm.pageJustLoaded[0] = false;
        //         }
        //     }
        // });

        /**
         * On filtering organization
         */
        vm.onOrganizationChange = function () {
            if (vm.filter.org && vm.filter.org.id) {
                if (!vm.filter.province || !vm.filter.province.id) {
                    vm.filter.province = {};
                    angular.copy(vm.filter.org.address.province, vm.filter.province);

                    vm.organizations = [];
                    angular.forEach(vm.orgsReadable, function (obj) {
                        if (obj.address.province.id == vm.filter.province.id) {
                            vm.organizations.push(obj);
                        }
                    });
                }
            }

            vm.getChartData();
        };

        // $scope.$watch('vm.filter.org', function (newVal, oldVal) {
        //
        //     if (newVal && newVal.id) {
        //         if (!vm.filter.province) {
        //             vm.filter.province = newVal.address.province;
        //         } else {
        //             vm.getChartData();
        //         }
        //     } else {
        //         if (!vm.pageJustLoaded[1]) {
        //             vm.getChartData();
        //         }
        //         vm.pageJustLoaded[1] = false;
        //     }
        // });

        // For week selection
        vm.datepicker = {
            fpItem: null,
            dateOpts: {
                // altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'CH???N TU???N..',
                defaultDate: defaultDate,
                maxDate: vm.MAX_DATE,
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.toDate = m.startOf('isoWeek').add(7, 'days').add(6, 'hours').add(59, 'minutes').add(59, 'seconds').toDate();

                        vm.getChartData();
                    }
                }],
                formatDate: function (d, format) {
                    let obj = moment(d, 'YYYY-MM-DD');
                    return 'S??? LI???U ?????N TU???N ' + obj.week() + '/' + obj.year();
                }
            }
        };

        vm.redrawCharts = function () {
            vm.drawChart0();
            vm.drawChart1();
            vm.drawChart2();
            vm.drawChart2_1();
            vm.drawChart3();
            vm.drawChart4();
            vm.drawChart5();
            vm.drawChart6();
        };

        // Chart 0
        vm.drawChart0 = function () {
            Highcharts.chart('chart_0', {
                chart: {
                    type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'K???t qu??? ?????t ???????c trong tu???n ' + moment(vm.filter.toDate).add(-1, 'days').week()
                },
                xAxis: {
                    crosshair: true,
                    labels:
                        {
                            enabled: false
                        }
                },

                yAxis: {
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Kh??ch h??ng/b???nh nh??n'
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br />',
                    pointFormat: 'T???ng s???: {point.y} (ng?????i)'
                },
                colors: ['#a6c96a', '#c42525', '#2f7ed8', '#dddddd', '#f28f43', '#0d233a', '#1aadce', '#492970', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        },
                        // grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'viewFullscreen']
                        }
                    }
                },
                series: [{
                    name: 'HTS_TST',
                    data: [vm.data.htsTstData[7]],
                    pointStart: 1
                }, {
                    name: 'HTS_POS',
                    data: [vm.data.htsPosData[7]],
                    pointStart: 1
                }, {
                    name: 'TX_NEW',
                    data: [vm.data.txNewData[7]],
                    pointStart: 1
                }]
            });
        };

        // Chart 1
        vm.drawChart1 = function () {
            Highcharts.chart('chart_1', {
                chart: {
                    // type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? ???????c l??m XN, quay l???i nh???n KQXN v?? t??? l??? d????ng t??nh theo tu???n',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.weekLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? l?????ng kh??ch h??ng'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            textOutline: 'none',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }, {
                    labels: {
                        format: '{value}%',
                        style: {
                            // color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: 'T??? l??? d????ng t??nh',
                        style: {
                            // color: Highcharts.getOptions().colors[1]
                        }
                    },
                    opposite: true
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    shared: true,
                    crosshairs: true
                },
                colors: ['#2f7ed8', '#c42525', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            // enabled: true,
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    id: 1,
                    name: 'S??? kh??ch h??ng l??m XN HIV v?? quay l???i nh???n KQXN',
                    type: 'column',
                    data: vm.data.htsTstData
                }, {
                    id: 2,
                    name: 'T??? l??? % d????ng t??nh',
                    type: 'line',
                    yAxis: 1,
                    data: vm.data.posRate,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 2
                    }

                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        // Chart 2
        vm.drawChart2 = function () {
            Highcharts.chart('chart_2', {
                chart: {
                    // type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? c?? KQXN d????ng t??nh v?? s??? m???i ???????c ????a v??o ??T ARV theo tu???n',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.weekLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? b???nh nh??n/kh??ch h??ng d????ng t??nh'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            textOutline: 'none',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    // headerFormat: '<b>{point.x}</b><br/>',
                    // pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
                    shared: true
                },
                colors: ['#8bbc21', '#2f7ed8', '#c42525', '#f28f43', '#dddddd', '#910000', '#1aadce', '#0d233a', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: 'none',
                            },
                            color: 'black'
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    name: 'TX_NEW: ??i???u tr??? m???i',
                    type: 'column',
                    data: vm.data.txNewNDiagData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'TX_NEW: Ngo???i t???nh',
                    type: 'column',
                    data: vm.data.txNewOProvData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'TX_NEW: C?? b??? tr???',
                    type: 'column',
                    data: vm.data.txNewOLTFData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'TX_NEW: C?? ch??a ??T',
                    type: 'column',
                    data: vm.data.txNewODiagData //[3, 4, 6, 2, 9, 6, 7, 6]
                }, {
                    name: 'TX_NEW: Ch??a x??c ?????nh',
                    type: 'column',
                    data: vm.data.txNewIndeterminate //[3, 4, 6, 2, 9, 6, 7, 6]
                }, {
                    name: 'S??? KH c?? KQXN d????ng t??nh',
                    type: 'line',
                    // yAxis: 1,
                    data: vm.data.htsPosData, //[9, 15, 21, 8, 38, 19, 19, 18],
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }, {
                    name: 'S??? ??i???u tr??? trong ng??y',
                    type: 'line',
                    // yAxis: 1,
                    data: vm.data.txNewSameDayData, //[5, 9, 11, 4, 23, 10, 12, 10],
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        /**
         * RTRI+ and PNS offered
         */
        vm.drawChart2_1 = function () {
            Highcharts.chart('chart_2_1', {
                chart: {
                    // type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? c?? KQXN d????ng t??nh, ???????c l??m s??ng l???c nhi???m m???i v?? ???????c t?? v???n TBXNBT/BC theo tu???n',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.weekLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? b???nh nh??n/kh??ch h??ng d????ng t??nh'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            textOutline: 'none',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    // headerFormat: '<b>{point.x}</b><br/>',
                    // pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
                    shared: true
                },
                colors: ['#c42525', '#a6c96a', '#2f7ed8', '#dddddd', '#f28f43', '#0d233a', '#1aadce', '#492970', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: 'none',
                            },
                            color: 'black'
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    },
                    series: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    }
                },
                series: [{
                    name: 'HTS_POS: Ca m???i',
                    type: 'column',
                    data: vm.data.posNewData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'HTS_POS: Ca c??',
                    type: 'column',
                    data: vm.data.posOldData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'HTS_POS: Ngo???i t???nh',
                    type: 'column',
                    data: vm.data.posOProvData //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'HTS_POS: Ch??a x??c ?????nh',
                    type: 'column',
                    data: vm.data.posIndeterminate //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'S??? c?? k???t qu??? RTRI+',
                    type: 'line',
                    data: vm.data.posRtriPos //[6, 12, 14, 6, 30, 12, 13, 12]
                }, {
                    name: 'S??? ???????c t?? v???n TBXNBT/BC',
                    type: 'line',
                    data: vm.data.posOfferedPns //[6, 12, 14, 6, 30, 12, 13, 12]
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        // Chart 3
        vm.drawChart3 = function () {
            Highcharts.chart('chart_3', {
                chart: {
                    type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? kh??ch h??ng c?? KQXN d????ng t??nh v?? ch??? ti??u theo tu???n',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.weekLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? kh??ch h??ng d????ng t??nh'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    shared: true
                },
                colors: ['#2f7ed8', '#cccccc', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        // stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: 'none',
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        },
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Ch??? ti??u d????ng t??nh theo tu???n',
                    type: 'column',
                    // dashStyle: 'ShortDot',
                    // yAxis: 1,
                    data: vm.data.htsPosTarget8Weeks,
                    color: 'rgba(204,204,204,1)',
                    pointPadding: 0,
                    pointPlacement: 0,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }

                }, {
                    name: 'S??? KH c?? KQXN d????ng t??nh',
                    type: 'column',
                    data: vm.data.htsPosData,
                    color: 'rgba(47,126,216,.9)',
                    pointPadding: 0.2,
                    pointPlacement: 0,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        // Chart 4
        vm.drawChart4 = function () {
            Highcharts.chart('chart_4', {
                chart: {
                    type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? kh??ch h??ng c?? KQXN d????ng t??nh v?? ch??? ti??u l??y t??ch',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.monthLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? kh??ch h??ng d????ng t??nh'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    // headerFormat: '<b>{point.x}</b><br/>',
                    // pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
                    shared: true
                },
                colors: ['#2f7ed8', '#c42525', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        // stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        },
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    },
                },
                series: [{
                    name: 'Ch??? ti??u d????ng t??nh l??y t??ch',
                    type: 'column',
                    color: 'rgba(204,204,204,1)',
                    pointPadding: 0,
                    pointPlacement: 0,
                    data: vm.data.htsPosTarget12Months,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }

                }, {
                    name: 'L??y t??ch s??? KH c?? KQXN d????ng t??nh',
                    type: 'column',
                    data: vm.data.htsPosCumData,
                    color: 'rgba(47,126,216,.9)',
                    pointPadding: 0.2,
                    pointPlacement: 0,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        // Chart 5
        vm.drawChart5 = function () {
            Highcharts.chart('chart_5', {
                chart: {
                    type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? kh??ch h??ng ???????c ????a v??o ??i???u tr??? ARV v?? ch??? ti??u theo tu???n',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.weekLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? b???nh nh??n'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    // headerFormat: '<b>{point.x}</b><br/>',
                    // pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
                    shared: true
                },
                colors: ['#8bbc21', '#c42525', '#2f7ed8', '#0d233a', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        // stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            }
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        },
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Ch??? ti??u TX_NEW theo tu???n',
                    type: 'column',
                    // dashStyle: 'ShortDot',
                    // yAxis: 1,
                    color: 'rgba(204,204,204,1)',
                    pointPadding: 0,
                    pointPlacement: 0,
                    data: vm.data.txNewTarget8Weeks,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }, {
                    name: 'TX_NEW',
                    type: 'column',
                    data: vm.data.txNewData,
                    color: 'rgba(139,188,33,.9)',
                    pointPadding: 0.2,
                    pointPlacement: 0,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };

        // Chart 6
        vm.drawChart6 = function () {
            Highcharts.chart('chart_6', {
                chart: {
                    type: 'column',
                    height: 400,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'S??? kh??ch h??ng ???????c ????a v??o ??i???u tr??? ARV v?? ch??? ti??u l??y t??ch',
                    style: {'fontSize': '15px'}
                },
                xAxis: {
                    categories: vm.data.monthLabels,
                    crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'S??? kh??ch h??ng d????ng t??nh'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                }],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    floating: false,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    // headerFormat: '<b>{point.x}</b><br/>',
                    // pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
                    shared: true
                },
                colors: ['#2f7ed8', '#c42525', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    column: {
                        // stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            },
                            // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        },
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Ch??? ti??u TX_NEW lu??? t??ch',
                    type: 'column',
                    // dashStyle: 'ShortDot',
                    // yAxis: 1,
                    color: 'rgba(204,204,204,1)',
                    pointPadding: 0,
                    pointPlacement: 0,
                    data: vm.data.txNewTarget12Months,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }

                }, {
                    name: 'Lu??? t??ch TX_NEW',
                    type: 'column',
                    data: vm.data.txNewCumData,
                    color: 'rgba(139,188,33,.9)',
                    pointPadding: 0.2,
                    pointPlacement: 0,
                    tooltip: {
                        valueSuffix: ' ng?????i'
                    }
                }],
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xu???t t???p tin ???nh .PNG',
                    downloadJPEG: 'Xu???t t???p tin ???nh .JPG',
                    downloadPDF: 'Xu???t t???p tin .PDF',
                    downloadXLS: 'T???i d??? li???u bi???u ?????',
                    viewFullscreen: 'Xem ??? ch??? ????? to??n m??n h??nh'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'separator', 'downloadXLS', 'viewFullscreen']
                        }
                    }
                }
            });
        };
    }

})();
