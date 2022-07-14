/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('TxDashboardController', TxDashboardController);

    TxDashboardController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        'blockUI',
        'toastr',
        'Utilities',
        '$cookies',

        'TxDashboardService',
        'PatientService',
        'AdminUnitService',
        'OrganizationService',
        'AppointmentService'
    ];

    function TxDashboardController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, utils, $cookies, service, pService, auService, orgService, appService) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.provinces = [];
        vm.opcs = [];
        vm.assignedOpcs = [];
        vm.allOpc = {id: 0, name: 'Tất cả các cơ sở điều trị'};
        vm.waitingLabel = 'Đang tải dữ liệu. Vui lòng chờ...';

        vm.filter = {province: null, organization: null};
        vm.data = {
            summaryDataAvailable: false,
            chart1DataAvailable: false,
            chart2DataAvailable: false,
            chart3DataAvailable: false,
            chart4DataAvailable: false,
            chart5DataAvailable: false,
            chart6DataAvailable: false
        };

        vm.refresh = function () {
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
                vm.getSummary();
                vm.getDataForChart1();
                vm.getDataForChart2();
                vm.getDataForChart3();
                vm.getDataForChart4();
                vm.getDataForChart5();
                vm.getDataForChart6();
            }, 150);
        };

        /**
         * Redirect to another page
         * @param opt
         */
        vm.redirect = function (opt) {
            if (!opt || !$scope.isSiteManager($scope.currentUser)) {
                toastr.warning('Chỉ người dùng tuyến cơ sở mới được xem chi tiết.', 'Thông báo');
                return;
            }

            switch (opt) {
                case 1:
                    sessionStorage.removeItem(appService.SELECTED_DATE);
                    $state.go('application.treatment_calendar_edit');
                    break;

                case 2:
                    sessionStorage.setItem(appService.LATE_DAYS, 84);
                    $state.go('application.treatment_appointment_late');
                    break;

                case 3:
                    sessionStorage.setItem('_patient_list_default_status', 'PENDING_ENROLLMENT');
                    $state.go('application.treatment');
                    break;

                case 4:
                    $state.go('application.treatment_vl_requiring_results');
                    break;

                case 5:
                    $state.go('application.treatment_cd4_requiring_results');
                    break;

                default:
                    break;
            }
        };

        vm.getSummary = function () {
            service.getSummary(vm.filter).then(function (data) {
                vm.data.summaryDataAvailable = true;
                vm.data.summaryData = data;
            });
        };

        vm.getDataForChart1 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 1;

            service.getChartData(filter).then(function (data) {
                vm.data.chart1DataAvailable = true;
                vm.data.chart1Data = data.patientData;
                $timeout(function () {
                    vm.drawChart1();
                }, 200);
            });
        };

        vm.getDataForChart2 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 2;

            service.getChartData(filter).then(function (data) {
                vm.data.chart2DataAvailable = true;
                vm.data.chart2Data = data.vlData;
                $timeout(function () {
                    vm.drawChart2();
                }, 200);
            });
        };

        vm.getDataForChart3 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 3;

            service.getChartData(filter).then(function (data) {
                vm.data.chart3DataAvailable = true;
                if (data && data.mmdData) {
                    vm.data.chart3Data = data.mmdData;
                } else {
                    vm.data.chart3Data = {nonMMDCount: 0, onMMDCount: 0};
                }
                $timeout(function () {
                    vm.drawChart3();
                }, 200);

            });
        };

        vm.getDataForChart4 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 4;

            service.getChartData(filter).then(function (data) {
                vm.data.chart4DataAvailable = true;
                if (data && data.tldData) {
                    vm.data.chart4Data = data.tldData;
                } else {
                    vm.data.chart4Data = {nonTldCount: 0, tldCount: 0};
                }
                $timeout(function () {
                    vm.drawChart4();
                }, 200);

            });
        };

        vm.getDataForChart5 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 5;

            service.getChartData(filter).then(function (data) {
                vm.data.chart5DataAvailable = true;
                vm.data.chart5Data = data.riskGroupData;
                $timeout(function () {
                    vm.drawChart5();
                }, 200);

            });
        };

        vm.getDataForChart6 = function () {
            let filter = {};
            angular.copy(vm.filter, filter);
            filter.targetChart = 6;

            service.getChartData(filter).then(function (data) {
                vm.data.chart6DataAvailable = true;
                vm.data.chart6Data = data.tbScreenData;
                $timeout(function () {
                    vm.drawChart6();
                }, 200);

            });
        };

        // Get all provinces
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();
            if (data) {
                vm.provinces = data;
            } else {
                vm.provinces = [];
            }
        });

        /**
         * On selection of a province
         */
        vm.onProvinceChange = function () {
            blockUI.start();
            orgService.getAllOrganizations({
                province: vm.filter.province,
                activeOnly: true,
                opcSiteOnly: true,
                checkUserPermission: true
            }).then(function (data) {
                blockUI.stop();

                vm.filter.organization = null;
                vm.opcs = [];

                if (data && data.length > 0) {
                    angular.copy(data, vm.opcs);
                }

                if (vm.opcs.length > 1) {
                    vm.opcs.unshift({id: -1, name: '---'});
                    vm.opcs.unshift(vm.allOpc);
                }

                if (vm.opcs.length > 0) {
                    vm.filter.organization = {};
                    angular.copy(vm.opcs[0], vm.filter.organization);
                }

                vm.refresh();
            });
        };

        /**
         * On selection of an organization
         */
        vm.onOrganizationChange = function () {
            if (!vm.filter.organization || vm.filter.organization.id == -1) {
                vm.filter.organization = {};
                angular.copy(vm.allOpc, vm.filter.organization);
            }

            if (vm.filter.organization.id == 0) {
                if (service.isMultiProvince(vm.assignedOpcs)) {
                    vm.filter.province = null;
                }
            }

            vm.refresh();
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                let orgsReadable = $scope.assignedOrgs.readable;

                if (!orgsReadable || orgsReadable.length <= 0) {
                    vm.assignedOpcs = [];
                    return;
                }

                vm.assignedOpcs = [];
                angular.forEach(orgsReadable, function (obj) {
                    if (obj.opcSite) {
                        vm.assignedOpcs.push(obj);
                    }
                });

                vm.opcs = [];
                angular.copy(vm.assignedOpcs, vm.opcs);

                if (vm.opcs.length > 0) {
                    if (service.isMultiProvince(vm.assignedOpcs)) {
                        vm.filter.province = null;
                    } else {
                        vm.filter.province = {};
                        angular.copy(vm.opcs[0].address.province, vm.filter.province);
                    }
                } else {
                    return;
                }

                if (vm.opcs.length > 1) {
                    vm.opcs.unshift({id: -1, name: '---'});
                    vm.opcs.unshift({id: 0, name: 'Tất cả các cơ sở điều trị'});
                }

                vm.filter.organization = {};
                angular.copy(vm.opcs[0], vm.filter.organization);

                vm.refresh();
            }
        });

        vm.drawChart1 = function () {
            /**
             * Custom Axis extension to allow emulation of negative values on a logarithmic
             * Y axis. Note that the scale is not mathematically correct, as a true
             * logarithmic axis never reaches or crosses zero.
             */
            (function (H) {
                H.addEvent(H.Axis, 'afterInit', function () {
                    const logarithmic = this.logarithmic;

                    if (logarithmic && this.options.custom && this.options.custom.allowNegativeLog) {

                        // Avoid errors on negative numbers on a log axis
                        this.positiveValuesOnly = false;

                        // Override the converter functions
                        logarithmic.log2lin = num => {
                            const isNegative = num < 0;

                            let adjustedNum = Math.abs(num);

                            if (adjustedNum < 10) {
                                adjustedNum += (10 - adjustedNum) / 10;
                            }

                            const result = Math.log(adjustedNum) / Math.LN10;
                            return isNegative ? -result : result;
                        };

                        logarithmic.lin2log = num => {
                            const isNegative = num < 0;

                            let result = Math.pow(10, Math.abs(num));
                            if (result < 10) {
                                result = (10 * (result - 1)) / (10 - 1);
                            }
                            return isNegative ? -result : result;
                        };
                    }
                });
            }(Highcharts));

            let cates = [];
            let activePatientArr = [];
            let newlyEnrolledArr = [];
            let transInArr = [];
            let returnedArr = [];
            let transedOutArr = [];
            let ltfuArr = [];
            let deadArr = [];

            angular.forEach(vm.data.chart1Data, function (obj) {
                cates.push(obj.month);

                activePatientArr.push(obj.activePatientCount);
                newlyEnrolledArr.push(obj.newlyEnrolledCount);
                transInArr.push(obj.transInCount);
                returnedArr.push(obj.returnedCount);
                transedOutArr.push(obj.transedOutCount);
                ltfuArr.push(obj.ltfuCount);
                deadArr.push(obj.deadCount);
            });

            Highcharts.chart('chart_1', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 500
                    }
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: cates,
                    crosshair: true
                },
                yAxis: {
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Bệnh nhân'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                        },
                        enableMouseTracking: true
                    },
                    column: {
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            },
                        },
                        shadow: false,
                        borderWidth: 0
                    }
                },
                tooltip: {
                    formatter: function () {
                        return this.points.reduce(function (s, point) {
                            return s + '<br/>' + point.series.name + ': <b>' +
                                Math.abs(point.y) + '</b>';
                        }, '<b>' + this.x + '</b>');
                    },
                    shared: true
                },
                series: [{
                    type: 'areaspline',
                    name: 'Bệnh nhân đang điều trị',
                    data: activePatientArr,
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.color('#1194d6').setOpacity(0.5).get('rgba')],
                            [0.7, Highcharts.color('#1194d6').setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        lineWidth: 2,
                        lineColor: '#333333',
                        fillColor: 'white'
                    },
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        color: 'black',
                        style: {
                            fontSize: '12px',
                            textOutline: 'none'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Đăng ký mới',
                    data: newlyEnrolledArr,
                    color: Highcharts.getOptions().colors[2],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Chuyển đến',
                    data: transInArr,
                    color: Highcharts.getOptions().colors[7],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Quay lại',
                    data: returnedArr,
                    color: Highcharts.getOptions().colors[9],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Chuyển đi',
                    data: transedOutArr,
                    color: Highcharts.getOptions().colors[4],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        },
                        formatter: function () {
                            return Math.abs(this.y);
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Bỏ trị',
                    data: ltfuArr,
                    color: Highcharts.getOptions().colors[3],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        },
                        formatter: function () {
                            return Math.abs(this.y);
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Tử vong',
                    data: deadArr,
                    color: Highcharts.getOptions().colors[8],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        },
                        formatter: function () {
                            return Math.abs(this.y);
                        }
                    }]
                }]
            });
        };

        vm.drawChart2 = function () {
            let cates = [];
            let totalArr = [];
            let noResultArr = [];
            let undetectableArr = [];
            let lt200Arr = [];
            let lt1000Arr = [];
            let ge1000Arr = [];

            // total VL test counts in the last 4 quarters
            let testCount = 0;

            angular.forEach(vm.data.chart2Data, function (obj) {
                cates.push(obj.quarter);
                totalArr.push(obj.testCount);
                noResultArr.push(obj.noResultCount);
                undetectableArr.push(obj.undetectableCount);
                lt200Arr.push(obj.lt200Count);
                lt1000Arr.push(obj.lt1000Count);
                ge1000Arr.push(obj.ge1000Count);

                testCount += obj.testCount;
            });

            vm.data.summaryData2.totalVlTestCount = testCount;

            // alert(vm.data.summaryData.totalVlTestCount);

            Highcharts.chart('chart_2', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 500
                    }
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: cates,
                    crosshair: true
                },
                yAxis: {
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Xét nghiệm TLVR'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: true
                    },
                    series: {
                        stacking: 'normal'
                    },
                    column: {
                        dataLabels: {
                            enabled: true,
                            color: 'black',
                            style: {
                                textOutline: 'none',
                            },
                        },
                        shadow: false,
                        borderWidth: 0
                    }
                },
                tooltip: {
                    formatter: function () {
                        return this.points.reduce(function (s, point) {
                            return s + '<br/>' + point.series.name + ': <b>' +
                                Math.abs(point.y) + '</b>';
                        }, '<b>' + this.x + '</b>');
                    },
                    shared: true
                },
                series: [{
                    type: 'line',
                    name: 'Tổng số xét nghiệm',
                    data: totalArr,
                    color: 'transparent',
                    marker: {
                        lineWidth: 2,
                        lineColor: '#333333',
                        fillColor: 'white',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        color: '#000000',
                        style: {
                            fontSize: '12px',
                            textOutline: 'none'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Từ 1000 bản sao/ml',
                    data: ge1000Arr,
                    color: Highcharts.getOptions().colors[8],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: '200 - dưới 1000 bản sao/ml',
                    data: lt1000Arr,
                    color: Highcharts.getOptions().colors[3],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'KPH - dưới 200 bản sao/ml',
                    data: lt200Arr,
                    color: '#d8d256',
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Không phát hiện',
                    data: undetectableArr,
                    color: '#35b75a',
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Chưa có kết quả',
                    data: noResultArr,
                    color: '#aaaaaa',
                    stack: 'stack2',
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            });
        };

        vm.drawChart3 = function () {
            Highcharts.chart('chart_3', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                title: {
                    text: 'Cấp ARV nhiều tháng trong số BN đang quản lý',
                    style: {
                        fontSize: '15px'
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        colors: ['#EBECF0', '#E6CB4F'],
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}<br/><b>({point.y}</b> BN)',
                            style: {
                                fontSize: '12px',
                                textOutline: 'none'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Tỉ lệ',
                    colorByPoint: true,
                    data: [{
                        name: 'ARV một tháng',
                        y: vm.data.chart3Data.nonMMDCount
                    }, {
                        name: 'ARV nhiều tháng',
                        y: vm.data.chart3Data.onMMDCount,
                        sliced: true,
                        selected: true
                    }]
                }]
            });
        };

        vm.drawChart4 = function () {
            Highcharts.chart('chart_4', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                title: {
                    text: 'Cấp TLD trong số BN đang quản lý',
                    style: {
                        fontSize: '15px'
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        colors: ['#36B37E', '#EBECF0'],
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}<br/>(<b>{point.y}</b> BN)',
                            style: {
                                fontSize: '12px',
                                textOutline: 'none'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Tỉ lệ',
                    colorByPoint: true,
                    data: [{
                        name: 'Dùng phác đồ TLD',
                        y: vm.data.chart4Data.tldCount
                    }, {
                        name: 'Dùng phác đồ khác',
                        y: vm.data.chart4Data.nonTldCount,
                        sliced: true,
                        selected: true
                    }]
                }]
            });

        };

        vm.drawChart5 = function () {

            // pre-process data
            let seriesData = [];
            let idx = 1;
            angular.forEach(vm.data.chart5Data, function (obj) {
                seriesData.push({name: obj.rname, value: obj.pcount, colorValue: idx++});
            });

            Highcharts.chart('chart_5', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                colorAxis: {
                    minColor: '#FFFFFF',
                    maxColor: Highcharts.getOptions().colors[7]
                },
                series: [{
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px',
                            textOutline: 'none'
                        },
                        formatter: function () {
                            return this.point.options.name + ' (' + this.point.options.value + ')'
                        }
                    }],
                    data: seriesData
                }],
                title: {
                    text: 'Phân nhóm chính trong số BN đang quản lý',
                    style: {
                        fontSize: '15px'
                    }
                }
            });
        };

        vm.drawChart6 = function () {

            let cates = [];
            let screenedArr = [];
            let posArr = [];

            let posCount = 0;

            angular.forEach(vm.data.chart6Data, function (obj) {
                cates.push(obj.month);
                screenedArr.push(obj.totalScreened);
                posArr.push(obj.posCount);

                posCount += obj.posCount;
            });

            vm.data.summaryData2.tbScreenPosCount = posCount;

            Highcharts.chart('chart_6', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                title: {
                    text: 'Số được sàng lọc và số dương tính 5 tháng vừa qua',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: cates,
                    crosshair: true,
                    allowDecimals: false,
                },
                yAxis: {
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    allowDecimals: false,
                    title: {
                        text: 'BN được sàng lọc lao'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    formatter: function () {
                        return this.points.reduce(function (s, point) {
                            return s + '<br/>' + point.series.name + ': <b>' +
                                Math.abs(point.y) + '</b>';
                        }, '<b>' + this.x + '</b>');
                    },
                    shared: true
                },
                series: [{
                    type: 'line',
                    name: 'Số bệnh nhân được sàng lọc',
                    data: screenedArr,
                    color: 'transparent',
                    marker: {
                        lineWidth: 2,
                        lineColor: '#333333',
                        fillColor: 'white',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        color: '#000000',
                        style: {
                            fontSize: '12px',
                            textOutline: 'none'
                        }
                    }]
                }, {
                    type: 'column',
                    name: 'Có kết quả dương tính',
                    data: posArr,
                    color: Highcharts.getOptions().colors[8],
                    dataLabels: [{
                        enabled: true,
                        inside: true,
                        style: {
                            fontSize: '12px',
                            textOutline: 'none'
                        }
                    }]
                }]
            });

        };

        // vm.drawChart7 = function () {
        //     let colors = Highcharts.getOptions().colors;
        //     let categories = [
        //         'Được dự phòng',
        //         'Chưa được dự phòng'
        //     ];
        //     let data = [
        //         {
        //             y: 80.0,
        //             color: colors[2],
        //             drilldown: {
        //                 name: 'Được dự phòng',
        //                 categories: [
        //                     'Bỏ trị',
        //                     'Chưa hoàn thành',
        //                     'Đã hoàn thành'
        //                 ],
        //                 data: [
        //                     1.0,
        //                     20.0,
        //                     59.0
        //                 ]
        //             }
        //         },
        //         {
        //             y: 20.0,
        //             color: colors[1],
        //             drilldown: {
        //                 name: 'Chưa được dự phòng',
        //                 categories: ['Chưa được dự phòng'],
        //                 data: [20.0]
        //             }
        //         }
        //     ];
        //
        //     let dataset1 = [];
        //     let dataset2 = [];
        //     let dataLen = data.length;
        //
        //     for (let i = 0; i < dataLen; i += 1) {
        //         // add browser data
        //         dataset1.push({
        //             name: categories[i],
        //             y: data[i].y,
        //             color: data[i].color
        //         });
        //
        //         // add version data
        //         let drillDataLen = data[i].drilldown.data.length;
        //         for (let j = 0; j < drillDataLen; j += 1) {
        //             let brightness = 0.2 - (j / drillDataLen) / 5;
        //             dataset2.push({
        //                 name: data[i].drilldown.categories[j],
        //                 y: data[i].drilldown.data[j],
        //                 color: Highcharts.color(data[i].color).brighten(brightness).get()
        //             });
        //         }
        //     }
        //
        //     Highcharts.chart('chart_7', {
        //         chart: {
        //             type: 'pie',
        //             style: {
        //                 fontFamily: 'Quicksand',
        //                 fontWeight: 500
        //             }
        //         },
        //         title: {
        //             text: null
        //         },
        //         plotOptions: {
        //             pie: {
        //                 shadow: false,
        //                 center: ['50%', '50%']
        //             }
        //         },
        //         tooltip: {
        //             valueSuffix: '%'
        //         },
        //         series: [{
        //             name: 'Tỉ lệ',
        //             data: dataset1,
        //             size: '60%',
        //             dataLabels: {
        //                 formatter: function () {
        //                     return this.y > 5 ? this.point.name : null;
        //                 },
        //                 color: '#ffffff',
        //                 distance: -30
        //             }
        //         }, {
        //             name: 'Tỉ lệ',
        //             data: dataset2,
        //             size: '80%',
        //             innerSize: '60%',
        //             dataLabels: {
        //                 formatter: function () {
        //                     // display only if larger than 1
        //                     return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
        //                         this.y + '%' : null;
        //                 }
        //             },
        //             id: 'breakdown'
        //         }],
        //         responsive: {
        //             rules: [{
        //                 condition: {
        //                     maxWidth: 400
        //                 },
        //                 chartOptions: {
        //                     series: [{}, {
        //                         id: 'breakdown',
        //                         dataLabels: {
        //                             enabled: false
        //                         }
        //                     }]
        //                 }
        //             }]
        //         }
        //     });
        // };
        /**
         ---------------------------------------------------
         BEGIN : Export chart data by target chart
         --------------------------------------------------
         **/
        vm.exportChartData = function (targetChart) {
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
            //alert(targetChart);
            filter.targetChart = targetChart;
            blockUI.start();
            service.exportChartData(filter)
                .success(successHandler)
                .error(function () {
                    blockUI.stop();
                });
        };
        /**
         * -------------------------------------------------
         * END: Export patient
         * -------------------------------------------------
         */
    }

})();
