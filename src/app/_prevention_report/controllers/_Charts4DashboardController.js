let drawCharts = function ($scope, vm,$state) {

    let commonChartOptions = {
        credits: {
            enabled: false
        },
        lang: {
            downloadPNG: 'Xuất tệp tin ảnh .PNG',
            downloadJPEG: 'Xuất tệp tin ảnh .JPG',
            downloadPDF: 'Xuất tệp tin .PDF',
            downloadXLS: 'Tải dữ liệu biểu đồ',
            viewFullscreen: 'Phóng to biểu đồ',
            exitFullscreen: 'Thu nhỏ biểu đồ',
            resetZoom: 'Bỏ zoom',
            noData: 'Không có dữ liệu.',
            loading: 'Đang tải...',
            accessibility: {
                zoom: {
                    mapZoomIn: 'Phóng to',
                    mapZoomOut: 'Thu nhỏ',
                    resetZoomButton: 'Bỏ zoom'
                }
            }
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuClassName: 'highcharts-context-menu',
                    className: 'btn btn-sm btn-default no-border',
                    menuItems: ['viewFullscreen', 'exitFullscreen', 'separator', 'downloadXLS', 'separator', 'downloadPNG', 'downloadJPEG', 'downloadPDF']
                }
            },
            filename: 'pdma-p-chart'
        }
    };

    // -----------------------------------------------------------------------
    // Section 1: Tiếp cận - Tìm ca - Chuyển gửi điều trị ARV - Dự phòng PrEP
    // -----------------------------------------------------------------------

    // Draw chart 1: Xét nghiệm khẳng định HIV+ theo thời gian báo cáo
    var filter = {};
    vm.drawChart1 = function () {
        // debugger;
        vm.service.getChart1(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_1', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: 'Xét nghiệm khẳng định HIV+ theo thời gian báo cáo',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    // categories: ['Th.1/2021', 'Th.2/2021', 'Th.3/2021', 'Th.4/2021', 'Th.5/2021', 'Th.6/2021'],
                    categories: vm.retChart1.categories,
                    crosshair: true
                },
                yAxis: [{
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },
                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Xét nghiệm HIV',
                    // data: [122, 231, 130, 110, 120, 151],
                    data: series1,
                    color: 'rgba(0, 0, 0, 0.5)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    // data: [2, 6, 3, 11, 1, 2],
                    data: series2,
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'line',
                    name: 'Tỉ lệ % HIV+',
                    // data: [1.7, 2.6, 2.3, 10.0, 0.83, 1.32],
                    data: series3,
                    color: 'rgba(200, 20, 20, 1)',
                    lineWidth: 1,
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(200, 20, 20, 1)',
                        fillColor: 'white',
                        symbol: 'circle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'left',
                        y: 12,
                        x: 5,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // Draw chart 2: Xét nghiệm khẳng định HIV+ theo đơn vị hành chính
    vm.drawChart2 = function () {
        vm.service.getChart2(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            vm.retChart2 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart2.categories.length; index++) {
                    const cat = vm.retChart2.categories[index];
                    series1.push(vm.retChart2.series[cat].firstQuantity);
                    series2.push(vm.retChart2.series[cat].secondQuantity);
                    series3.push(vm.retChart2.series[cat].percent);
                }
            }
            Highcharts.chart('chart_2', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: 'Xét nghiệm khẳng định HIV+ theo đơn vị hành chính',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    // categories: ['Hải Phòng', 'Hà Nội', 'Long An', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Thái Nguyên'],
                    categories: vm.retChart2.categories,
                    crosshair: true,
                },
                yAxis: [{
                    type: 'logarithmic',
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },

                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Xét nghiệm HIV',
                    // data: [122, 231, 130, 110, 120, 151],
                    data: series1,
                    color: 'rgba(0, 0, 0, 0.5)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    // data: [2, 6, 3, 11, 1, 2],
                    data: series2,
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'line',
                    name: 'Tỉ lệ % HIV+',
                    // data: [1.7, 2.6, 2.3, 10.0, 0.83, 1.32],
                    data: series3,
                    color: 'transparent',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(200, 20, 20, 1)',
                        fillColor: 'rgba(200, 20, 20, 1)',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'left',
                        y: 12,
                        x: 5,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            }, commonChartOptions));
        });

    };

    // Draw chart 3: Xét nghiệm khẳng định HIV+ theo mô hình xét nghiệm
    vm.drawChart3 = function () {
        vm.service.getChart3(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_3', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                title: {
                    text: 'Xét nghiệm khẳng định HIV+ theo mô hình xét nghiệm',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    // categories: ['Cộng đồng', 'Cộng đồng - PNS', 'Khoa phòng BV', 'PNS cố định', 'TVXN TN'],
                    crosshair: true,
                },
                yAxis: [{
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },
                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    data: series2,
                    //data: [122, 231, 130, 110, 120],
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'line',
                    name: 'Tỉ lệ % HIV+',
                    data: series3,
                    //data: [1.7, 2.6, 2.3, 10.0, 0.83],
                    color: 'transparent',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(200, 20, 20, 1)',
                        fillColor: 'rgba(200, 20, 20, 1)',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'left',
                        y: 12,
                        x: 5,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            }, commonChartOptions));
        });
    };

    // Draw chart 4: Xét nghiệm khẳng định HIV+ theo nhóm khách hàng
    vm.drawChart4 = function () {
        vm.service.getChart4(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_4', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    }
                },
                title: {
                    text: 'Xét nghiệm khẳng định HIV+ theo nhóm khách hàng',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['NCMT', 'MSM', 'Bán dâm', 'TG', 'BT/BCC của NCH', 'Phạm nhân', 'Khác'],
                    crosshair: true,
                },
                yAxis: [{
                    minorTickInterval: 0.1,
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },
                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    data: series2,
                    //data: [122, 231, 130, 110, 120, 200],
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'line',
                    name: 'Tỉ lệ % HIV+',
                    data: series3,
                    // data: [1.7, 2.6, 2.3, 10.0, 0.83, 2.5],
                    color: 'transparent',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(200, 20, 20, 1)',
                        fillColor: 'rgba(200, 20, 20, 1)',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'left',
                        y: 12,
                        x: 5,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            }, commonChartOptions));
        });
    };

    // Draw chart 5: Chuyển gửi thành công đến cơ sở điều trị ARV theo thời gian báo cáo
    vm.drawChart5 = function () {
        vm.service.getChart5(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_5', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: 'Chuyển gửi thành công đến CSĐT ARV theo thời gian báo cáo',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Th.1/2021', 'Th.2/2021', 'Th.3/2021', 'Th.4/2021', 'Th.5/2021', 'Th.6/2021'],
                    crosshair: true
                },
                yAxis: [{
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },
                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    //data: [122, 231, 130, 110, 120, 151],
                    data: series1,
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'Chuyển điều trị ARV thành công',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(15, 145, 89, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'line',
                    name: '% chuyển điều trị ARV thành công',
                    data: series3,
                    //data: [98.36, 100.0, 100.0, 90.90, 98.33, 99.33],
                    color: 'rgba(140, 15, 190, 1)',
                    lineWidth: 1,
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(140, 15, 190, 1)',
                        fillColor: 'white',
                        symbol: 'circle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'center',
                        y: -5,
                        x: 0,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // Draw chart 6: Chuyển gửi thành công đến cơ sở điều trị ARV theo đơn vị hành chính
    vm.drawChart6 = function () {
        vm.service.getChart6(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_6', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: 'Chuyển gửi thành công đến CSĐT ARV theo đơn vị hành chính',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Hải Phòng', 'Hà Nội', 'Long An', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Thái Nguyên'],
                    crosshair: true,
                },
                yAxis: [{
                    title: {
                        text: 'Xét nghiệm HIV'
                    },
                }, {
                    min: 0,
                    labels: {
                        format: '{value}%',
                    },
                    title: {
                        text: 'Tỉ lệ % HIV+',
                    },

                    opposite: true,
                    crosshairs: true
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    data: series1,
                    //data: [122, 231, 130, 110, 120, 151],
                    color: 'rgba(10, 105, 205, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'Chuyển điều trị ARV thành công',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(15, 145, 89, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'line',
                    name: '% chuyển điều trị ARV thành công',
                    data: series3,
                    //data: [98.36, 100.0, 100.0, 90.90, 98.33, 99.33],
                    color: 'transparent',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' %',
                        valueDecimals: 1
                    },
                    marker: {
                        lineWidth: 1,
                        lineColor: 'rgba(140, 15, 190, 1)',
                        fillColor: 'rgba(140, 15, 190, 1)',
                        symbol: 'triangle'
                    },
                    dataLabels: [{
                        enabled: true,
                        align: 'center',
                        y: -5,
                        x: 0,
                        formatter: function () {
                            return this.y.toFixed(1) + '%';
                        },
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            }, commonChartOptions));
        });
    };

    // Draw chart 7: Chuyển gửi thành công đến cơ sở điều trị PrEP theo thời gian báo cáo
    vm.drawChart7 = function () {
        vm.service.getChart7(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_7', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                legend: {
                    enabled: false
                },
                title: {
                    text: 'Chuyển gửi thành công đến CSĐT PrEP theo thời gian báo cáo',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Th.1/2021', 'Th.2/2021', 'Th.3/2021', 'Th.4/2021', 'Th.5/2021', 'Th.6/2021'],
                    crosshair: true
                },
                yAxis: [{
                    title: {
                        text: null
                    }
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                series: [{
                    id: 2,
                    type: 'column',
                    name: 'Chuyển điều trị ARV thành công',
                    data: series1,
                    // data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(129, 21, 165, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // Draw chart 8: Chuyển gửi thành công đến cơ sở điều trị PrEP theo đơn vị hành chính
    vm.drawChart8 = function () {
        vm.service.getChart8(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].percent);
                }
            }
            Highcharts.chart('chart_8', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',

                },
                legend: {
                    enabled: false
                },
                title: {
                    text: 'Chuyển gửi thành công đến CSĐT PrEP theo đơn vị hành chính',
                    style: {
                        fontSize: '15px'
                    }
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    // categories: ['Hải Phòng', 'Hà Nội', 'Long An', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Thái Nguyên'],
                    crosshair: true,
                },
                yAxis: [{
                    title: {
                        text: null
                    },
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Chuyển điều trị ARV thành công',
                    data: series1,
                    // data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(129, 21, 165, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }]
            }, commonChartOptions));
        });
    };

    // -----------------------------------------------------------------------
    // Section 2: Xét nghiệm phát hiện mới nhiễm HIV
    // -----------------------------------------------------------------------
    // Draw chart 9: Xét nghiệm phát hiện mới nhiễm HIV theo thời gian báo cáo
    vm.drawChart9 = function () {
        // blockUI.start();
        vm.service.getChart9(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            var series4 = [];
            var series5 = [];
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
            Highcharts.chart('chart_9', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Th.1/2021', 'Th.2/2021', 'Th.3/2021', 'Th.4/2021', 'Th.5/2021', 'Th.6/2021'],
                    crosshair: true
                },
                yAxis: [{
                    title: {
                        text: null
                    }
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    data: series1,
                    //data: [122, 231, 130, 110, 120, 151],
                    color: 'rgba(31, 99, 156, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'XN phát hiện mới nhiễm HIV',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(60, 174, 163, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'column',
                    name: 'Nhiễm mới HIV - XN nhanh',
                    data: series3,
                    //data: [10, 31, 12, 7, 11, 15],
                    color: 'rgba(246, 214, 93, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 4,
                    type: 'column',
                    name: 'XN TLVR HIV',
                    data: series4,
                    //data: [8, 25, 10, 6, 10, 7],
                    color: 'rgba(23, 63, 95, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 5,
                    type: 'column',
                    name: 'TLVR HIV &gt; 1000 cps/ml',
                    data: series5,
                    //data: [5, 18, 8, 5, 9, 6],
                    color: 'rgba(237, 86, 59, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // Draw chart 10: Xét nghiệm phát hiện mới nhiễm HIV theo đơn vị hành chính
    vm.drawChart10 = function () {
        vm.service.getChart10(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            var series4 = [];
            var series5 = [];
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
            Highcharts.chart('chart_10', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',

                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Hải Phòng', 'Hà Nội', 'Long An', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Thái Nguyên'],
                    crosshair: true,
                },
                yAxis: [{
                    title: {
                        text: null
                    },
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'Khẳng định HIV+',
                    data: series1,
                    //data: [122, 231, 130, 110, 120, 151],
                    color: 'rgba(31, 99, 156, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'XN phát hiện mới nhiễm HIV',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(60, 174, 163, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'column',
                    name: 'Nhiễm mới HIV - XN nhanh',
                    data: series3,
                    //data: [10, 31, 12, 7, 11, 15],
                    color: 'rgba(246, 214, 93, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 4,
                    type: 'column',
                    name: 'XN TLVR HIV',
                    data: series4,
                    //data: [8, 25, 10, 6, 10, 7],
                    color: 'rgba(23, 63, 95, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 5,
                    type: 'column',
                    name: 'TLVR HIV &gt; 1000 cps/ml',
                    data: series5,
                    //data: [5, 18, 8, 5, 9, 6],
                    color: 'rgba(237, 86, 59, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // -----------------------------------------------------------------------
    // Section 3: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV
    // -----------------------------------------------------------------------
    // Draw chart 11: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV theo thời gian báo cáo
    vm.drawChart11 = function () {
        vm.service.getChart11(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            var series4 = [];
            var series5 = [];
            var series6 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].thirdQuantity);
                    series4.push(vm.retChart1.series[cat].fourQuantity);
                    series5.push(vm.retChart1.series[cat].fiveQuantity);
                    series6.push(vm.retChart1.series[cat].sixQuantity);
                }
            }
            Highcharts.chart('chart_11', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Th.1/2021', 'Th.2/2021', 'Th.3/2021', 'Th.4/2021', 'Th.5/2021', 'Th.6/2021'],
                    crosshair: true
                },
                yAxis: [{
                    title: {
                        text: null
                    }
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'NCH được tư vấn dịch vụ',
                    data: series1,
                    //data: [122, 231, 130, 110, 120, 151],
                    color: 'rgba(50, 78, 68, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'NCH đồng ý nhận dịch vụ',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(175, 187, 195, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'column',
                    name: 'BT/BCC khai thác được thông tin',
                    data: series3,
                    //data: [10, 31, 12, 7, 11, 15],
                    color: 'rgba(87, 135, 168, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 4,
                    type: 'column',
                    name: 'BT/BCC XN HIV',
                    data: series4,
                    //data: [8, 25, 10, 6, 10, 7],
                    color: 'rgba(4, 92, 140, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 5,
                    type: 'column',
                    name: 'BT/BCC XN khẳng định HIV+',
                    data: series5,
                    //data: [5, 18, 8, 5, 9, 6],
                    color: 'rgba(251, 214, 135, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 6,
                    type: 'column',
                    name: 'BT/BCC chuyển gửi thành công ĐT ARV',
                    data: series6,
                    //data: [4, 12, 6, 4, 7, 5],
                    color: 'rgba(251, 166, 6, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    // Draw chart 12: Thông báo xét nghiệm bạn tình, bạn chích chung của người có HIV theo đơn vị hành chính
    vm.drawChart12 = function () {
        vm.service.getChart12(vm.filter, function success() {
        }, function failure() {
            // blockUI.stop();
        }).then(function (data) {
            // blockUI.stop();
            vm.retChart1 = data;
            var series1 = [];
            var series2 = [];
            var series3 = [];
            var series4 = [];
            var series5 = [];
            var series6 = [];
            if(vm.validateGetTotal()) {
                for (let index = 0; index < vm.retChart1.categories.length; index++) {
                    const cat = vm.retChart1.categories[index];
                    series1.push(vm.retChart1.series[cat].firstQuantity);
                    series2.push(vm.retChart1.series[cat].secondQuantity);
                    series3.push(vm.retChart1.series[cat].thirdQuantity);
                    series4.push(vm.retChart1.series[cat].fourQuantity);
                    series5.push(vm.retChart1.series[cat].fiveQuantity);
                    series6.push(vm.retChart1.series[cat].sixQuantity);
                }
            }
            Highcharts.chart('chart_12', $.extend({
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',

                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: vm.retChart1.categories,
                    //categories: ['Hải Phòng', 'Hà Nội', 'Long An', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Thái Nguyên'],
                    crosshair: true,
                },
                yAxis: [{
                    title: {
                        text: null
                    },
                }],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            style: {
                                textOutline: false
                            }
                        },
                        enableMouseTracking: true
                    }
                },
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 1,
                    type: 'column',
                    name: 'NCH được tư vấn dịch vụ',
                    data: series1,
                    //data: [122, 231, 130, 110, 120, 151],
                    color: 'rgba(50, 78, 68, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 2,
                    type: 'column',
                    name: 'NCH đồng ý nhận dịch vụ',
                    data: series2,
                    //data: [120, 231, 130, 100, 118, 150],
                    color: 'rgba(175, 187, 195, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 3,
                    type: 'column',
                    name: 'BT/BCC khai thác được thông tin',
                    data: series3,
                    //data: [10, 31, 12, 7, 11, 15],
                    color: 'rgba(87, 135, 168, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 4,
                    type: 'column',
                    name: 'BT/BCC XN HIV',
                    data: series4,
                    //data: [8, 25, 10, 6, 10, 7],
                    color: 'rgba(4, 92, 140, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 5,
                    type: 'column',
                    name: 'BT/BCC XN khẳng định HIV+',
                    data: series5,
                    //data: [5, 18, 8, 5, 9, 6],
                    color: 'rgba(251, 214, 135, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }, {
                    id: 6,
                    type: 'column',
                    name: 'BT/BCC chuyển gửi thành công ĐT ARV',
                    data: series6,
                    //data: [4, 12, 6, 4, 7, 5],
                    color: 'rgba(251, 166, 6, 0.8)',
                    dataLabels: [{
                        enabled: true,
                        inside: false,
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }],
            }, commonChartOptions));
        });
    };

    vm.drawChart13 = function () {
        getmap();
        function getmap(type,namep){
            if(type){
                vm.filter.chart13=type;
            }
            vm.service.getChart13(vm.filter, function success() {
            }, function failure() {
                // blockUI.stop();
            }).then(function (data1) {
                var pathFile = "assets/maps/";
                var name = "Việt Nam";
                var title = "Bản đồ ca nhiễm mới của ";
                var nameFile = "_vietnam";
                vm.retChart13 = data1;
                if(namep){
                    name = namep;
                    nameFile = xoa_dau(namep);
                    nameFile = nameFile.split(' ').join('');
                    nameFile = nameFile.toLowerCase();
                }else{
                    if (vm.filter.province) {
                        name = vm.filter.province.name;
                        nameFile = xoa_dau(vm.filter.province.name);
                        nameFile = nameFile.split(' ').join('');
                        nameFile = nameFile.toLowerCase();
                    } else {
                        name = "Việt Nam";
                        nameFile = "_vietnam";
                    }
                }
                

               
                $.getJSON(pathFile + nameFile + ".geojson", function (geojson) {
                    let data = [];
                    let join = ['hc-key', 'key'];
                    if (nameFile == "_vietnam") {
                        $.each(geojson.features, function (index, feature) {
                            data.push({
                                key: feature.properties['hc-key'],
                                value: 0,
                                name: feature.properties['name']
                            });
                        });
                    } else {
                        $.each(geojson.features, function (index, feature) {
                            data.push({
                                key: feature.properties['mahuyen'],
                                value: 0,
                                name: feature.properties['diadanh']
                            });
                        });
                        join = ['mahuyen', 'key'];
                    }
                    for (let index = 0; index < vm.retChart13.categories.length; index++) {
                        const cat = vm.retChart13.categories[index];
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].key == Number(cat) ) {
                                data[i].value = vm.retChart13.series[cat].thirdQuantity;
                            }
                        }
                    }
                    $('#chart_13').highcharts('Map', $.extend({
                        chart: {
                            style: {
                                fontFamily: 'Quicksand',
                                fontWeight: 501,
                            },
                        },
                        title: {
                            text: title + name,
                            style: {
                                fontSize: '15px'
                            }
                            // y: 40
                        },
                        mapNavigation: {
                            enabled: true,
                            buttonOptions: {
                                verticalAlign: 'bottom'
                            }
                        },
                        colorAxis: {
                            dataClasses: [
                                {
                                    from: 0,
                                    to: 0,
                                    name: '0',
                                    color: '#F1EEF6'
                                }, {
                                    from: 1,
                                    to: 1,
                                    name: '1',
                                    color: '#FCD7D1'
                                }, {
                                    from: 2,
                                    to: 5,
                                    name: '2 - 5',
                                    color: '#DB2B2B'
                                }, {
                                    from: 6,
                                    to: 15,
                                    name: '6 - 15',
                                    color: '#B92025'
                                }, {
                                    from: 16,
                                    to: 50,
                                    name: '21 - 50',
                                    color: '#961B1E'
                                }, {
                                    from: 51,
                                    to: 100,
                                    name: '51 - 100',
                                    color: '#6F0E17'
                                }, {
                                    from: 101,
                                    name: '> 100',
                                    color: '#500007'
                                }
                            ],
                            min: 0,
                        },
                        legend: {
                            title: {
                                text: 'Nhiễm mới',
                            },
                            layout: 'vertical',
                            align: 'right',
                            floating: true,
                            backgroundColor: "#ffffff"
                        },
                        tooltip: {
                            formatter: function () {
                                if (nameFile == "_vietnam") {
                                    return this.point.name + ": " + this.point.value;
                                } else {
                                    return this.point.properties.diadanh + ": " + this.point.value;
                                }
                            }
                        },
    
    
                        series: [{
                            data: data,
                            mapData: geojson,
                            name: 'Regional Directors',
                            joinBy: join,
                            states: {
                                hover: {
                                    color: '#a4edba'
                                }
                            },
                            dataLabels: {
                                enabled: nameFile == "_vietnam" ? false : true,
                                formatter: function () {
                                    return this.point.properties ? this.point.properties.diadanh : "";
                                }
                            },
                            point: {
                                events: {
                                  // On click, look for a detailed map
                                    click: function () {
                                        var key = this.name;
                                        if(this.key == 576){
                                            $state.go('application.hts_map',{
                                                type:1,
                                                key: this.key
                                            });
                                        }
                                        if(this.key == 498){
                                            $state.go('application.hts_map',{
                                                type:1,
                                                key: this.key
                                            });
                                        }
                                        if(type==1 || (vm.filter.province && vm.filter.province.name)){
                                            $state.go('application.hts_map',{
                                                type:1,
                                                key: this.key
                                            });
                                        }else{
                                            getmap(1,key);
                                        }
                                        
                                    }
                                }
                                
                            }
                               
                        }],
                        drilldown: {
                            activeDataLabelStyle: {
                              color: '#FFFFFF',
                              textDecoration: 'none',
                              textOutline: '1px #000000'
                            },
                            drillUpButton: {
                              relativeTo: 'spacingBox',
                              position: {
                                x: 0,
                                y: 60
                              }
                            }
                          }
    
                    }, commonChartOptions), function(chart){
                        if(type==1){
                            chart.myButton = chart.renderer.button('quay lại',9, 380)
                            .attr({
                                zIndex: 3
                            }).on('click', function () {
                                vm.filter.chart13=0;
                                getmap();
                            })
                            .add();
                        }
                    });
                });
            });
        }
        
    };

    function xoa_dau(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    };
    vm.drawChart14 = function () {
        getmap();
        function getmap(type,namep){
            if(type){
                vm.filter.chart14=type;
            }
            vm.service.getChart14(vm.filter, function success() {
            }, function failure() {
                // blockUI.stop();
            }).then(function (data1) {
                var pathFile = "assets/maps/";
                var name = "Việt Nam";
                var title = "Bản đồ ca khẳng định HIV+ của ";
                var nameFile = "_vietnam";
                vm.retChart14 = data1;
                console.log("jdj");
                console.log(data1);
                if(namep){
                    name = namep;
                    nameFile = xoa_dau(namep);
                    nameFile = nameFile.split(' ').join('');
                    nameFile = nameFile.toLowerCase();
                }else{
                    if (vm.filter.province) {
                        name = vm.filter.province.name;
                        nameFile = xoa_dau(vm.filter.province.name);
                        nameFile = nameFile.split(' ').join('');
                        nameFile = nameFile.toLowerCase();
                    } else {
                        name = "Việt Nam";
                        nameFile = "_vietnam";
                    }
                }
                
                $.getJSON(pathFile + nameFile + ".geojson", function (geojson) {
                    let data = [];
                    let join = ['hc-key', 'key'];
                    if (nameFile == "_vietnam") {
                        $.each(geojson.features, function (index, feature) {
                            data.push({
                                key: feature.properties['hc-key'],
                                value: 0,
                                name: feature.properties['name']
                            });
                        });
                    } else {
                        $.each(geojson.features, function (index, feature) {
                            data.push({
                                key: feature.properties['mahuyen'],
                                value: 0,
                                name: feature.properties['diadanh']
                            });
                        });
                        join = ['mahuyen', 'key'];
                    }
                    for (let index = 0; index < vm.retChart14.categories.length; index++) {
                        const cat = vm.retChart14.categories[index];
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].key == Number(cat) ) {
                                data[i].value = vm.retChart14.series[cat].firstQuantity;
                            }
                        }
                    }
                    $('#chart_14').highcharts('Map', $.extend({
                        chart: {
                            style: {
                                fontFamily: 'Quicksand',
                                fontWeight: 501
                            },
                            // zoomType: 'x',
                            // panning: true,
                            // panKey: 'shift',
    
                        },
                        title: {
                            text: title + name,
                            style: {
                                fontSize: '15px'
                            }
                            // y: 40
                        },
                        mapNavigation: {
                            enabled: true,
                            buttonOptions: {
                                verticalAlign: 'bottom'
                            },
                            buttons: {

                            }

                        },
                        colorAxis: {
                            dataClasses: [
                                {
                                    from: 0,
                                    to: 0,
                                    name: '0',
                                    color: '#F1EEF6'
                                }, {
                                    from: 1,
                                    to: 1,
                                    name: '1',
                                    color: '#FCD7D1'
                                }, {
                                    from: 2,
                                    to: 5,
                                    name: '2 - 5',
                                    color: '#DB2B2B'
                                }, {
                                    from: 6,
                                    to: 15,
                                    name: '6 - 15',
                                    color: '#B92025'
                                }, {
                                    from: 16,
                                    to: 50,
                                    name: '21 - 50',
                                    color: '#961B1E'
                                }, {
                                    from: 51,
                                    to: 100,
                                    name: '51 - 100',
                                    color: '#6F0E17'
                                }, {
                                    from: 101,
                                    name: '> 100',
                                    color: '#500007'
                                }
                            ],
                            min: 0,
                            // stops: [
                            //   [0, '#EFEFFF'],
                            //   [1, Highcharts.getOptions().colors[0]],
                            //   [2, Highcharts.color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
                            // ]
                            // stops: [
                            //     [0, '#F1EEF6'],
                            //     [0.5, '#F1EEF6'],
                            //     [1, '#900037'],
                            //     [2, '#500007']
                            // ]
                        },
                        legend: {
                            title: {
                                text: 'KĐ HIV+',
                            },
                            layout: 'vertical',
                            align: 'right',
                            floating: true,
                            backgroundColor: "#ffffff"
                        },
                        tooltip: {
                            formatter: function () {
                                if (nameFile == "_vietnam") {
                                    return this.point.name + ": " + this.point.value;
                                } else {
                                    return this.point.properties.diadanh + ": " + this.point.value;
                                }
                            }
                        },
    
    
                        series: [{
                            data: data,
                            mapData: geojson,
                            // name: 'Regional Directors',
                            joinBy: join,
                            states: {
                                hover: {
                                    color: '#a4edba'
                                }
                            },
                            dataLabels: {
                                enabled: nameFile == "_vietnam" ? false : true,
                                formatter: function () {
                                    return this.point.properties ? this.point.properties.diadanh : "";
                                }
                            },
                            point: {
                                events: {
                                  // On click, look for a detailed map
                                    click: function () {
                                        var key = this.name;
                                        if(this.key == 576){
                                            $state.go('application.hts_map',{
                                                type:2,
                                                key: this.key
                                            });
                                        }
                                        if(this.key == 498){
                                            $state.go('application.hts_map',{
                                                type:2,
                                                key: this.key
                                            });
                                        }
                                        if(type==1 || (vm.filter.province && vm.filter.province.name)){
                                            $state.go('application.hts_map',{
                                                type:2,
                                                key: this.key
                                            });
                                        }else{
                                            getmap(1,key);
                                        }
                                        
                                    }
                                }
                                
                            }
                        }]
    
                    }, commonChartOptions), function(chart){
                        if(type==1){
                            chart.myButton = chart.renderer.button('quay lại',9, 380)
                            .attr({
                                zIndex: 3
                            }).on('click', function () {
                                vm.filter.chart14=0;
                                getmap();
                            })
                            .add();
                        }
                    });
                });
            });
        }
        
    };

};