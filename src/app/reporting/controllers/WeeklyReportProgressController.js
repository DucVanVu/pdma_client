/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Settings').controller('WeeklyReportProgressController', WeeklyReportProgressController);

    WeeklyReportProgressController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$stateParams',
        'settings',
        'blockUI',
        'toastr',
        'WeeklyReportingService',
        'AdminUnitService'
    ];

    function WeeklyReportProgressController($rootScope, $scope, $http, $timeout, $stateParams, settings, blockUI, toastr, service, auService) {
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
        vm.progress = {summary: {}, results: {}, details: []};
        vm.MAX_DATE = moment(new Date()).endOf('isoWeek').toDate();
        vm.defaultDate = moment(vm.MAX_DATE, 'YYYY-MM-DD').startOf('isoWeek').add(2, 'days').toDate();

        vm.statuses = [
            {id: -1, name: 'Chưa lập báo cáo'},
            {id: 0, name: 'Đang soạn báo cáo'},
            // {id: 0, name: 'Chưa gửi báo cáo'},
            {id: 1, name: 'Đang chờ tỉnh phê duyệt'},
            {id: 2, name: 'Đang chờ TW xuất bản'},
            {id: 3, name: 'Đã được xuất bản báo cáo'}
        ];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            province: null,
            status: null,
            dateOfWeek: vm.defaultDate
        };

        if (typeof $stateParams.status !== 'undefined') {
            let receivedStatus = parseInt($stateParams.status);
            angular.forEach(vm.statuses, function (s) {
                if (s.id === receivedStatus) {
                    vm.filter.status = s;
                }
            });
        }

        vm.pageJustInitialized = [true, true, true];

        // For week selection
        vm.datepicker = {
            fpItem: null,
            dateOpts: {
                // altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'CHỌN TUẦN..',
                defaultDate: vm.defaultDate,
                maxDate: vm.MAX_DATE,
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                ignoredFocusElements: [],
                onChange: [function () {
                    angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.dateOfWeek = m.startOf('isoWeek').add(2, 'days').toDate();

                        $timeout(function () {
                            vm.getProgressSummary();
                        }, 300);
                    }
                }],
                formatDate: function (d, format) {
                    let obj = moment(d, 'YYYY-MM-DD');

                    let dStart = obj.startOf('isoWeek').format('DD/MM/YYYY');
                    let dEnd = obj.endOf('isoWeek').format('DD/MM/YYYY');

                    return 'TUẦN ' + obj.week() + '/' + obj.year() + ' — (' + dStart + ' ⁓ ' + dEnd + ')';
                }
            }
        };

        vm.bsTableControl = {
            options: {
                data: vm.progress.details,
                idField: "id",
                sortable: false,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                singleSelect: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4Progress(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getProgressSummary();
                }
            }
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

        vm.getProgressSummary = function () {
            blockUI.start();
            service.getProgressSummaryData(vm.filter).then(function (data) {
                blockUI.stop();
                vm.progress.results = data.results;
                vm.progress.summary = data.summary;
                vm.progress.details = data.details.content;

                vm.bsTableControl.options.data = vm.progress.details;
                vm.bsTableControl.options.totalRows = data.details.totalElements;

                // draw chart
                vm.drawChart1();
                vm.drawChart2();
            });
        };

        $timeout(function () {
            vm.getProgressSummary();
        }, 300);

        $scope.$watch('vm.filter.province', function (newVal, oldVal) {
            if (!vm.pageJustInitialized[0]) {
                $timeout(function () {
                    vm.getProgressSummary();
                }, 300);
            }

            vm.pageJustInitialized[0] = false;
        });

        $scope.$watch('vm.filter.status', function (newVal, oldVal) {
            if (!vm.pageJustInitialized[1]) {
                $timeout(function () {
                    vm.getProgressSummary();
                }, 300);
            }

            vm.pageJustInitialized[1] = false;
        });

        $scope.$watch('vm.filter.dateOfWeek', function (newVal, oldVal) {
            if (!vm.pageJustInitialized[2]) {
                $timeout(function () {
                    vm.getProgressSummary();
                }, 300);
            }

            vm.pageJustInitialized[2] = false;
        });

        $scope.editReport = function (id) {
            blockUI.start();
            service.getWeeklyReport(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    if ($scope.isSiteManager($scope.currentUser) && utils.indexOf(data.organization, vm.orgsWritable) < 0) {
                        toastr.error('Bạn không có quyền chỉnh sửa báo cáo này!', 'Thông báo');
                    } else {
                        $state.go('application.edit_weekly_report', {id: data.id});
                    }
                } else {
                    toastr.error('Không tải được báo cáo để chỉnh sửa. Vui lòng thử lại sau ít phút.', 'Thông báo');
                }
            });
        };

        vm.drawChart1 = function () {
            Highcharts.chart('chart_1', {
                chart: {
                    type: 'pie',
                    height: 250,
                    style: {
                        fontFamily: 'Quicksand'
                    },
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                title: {
                    text: 'Tình hình nộp báo cáo của các cơ sở',
                },
                colors: ['#e02222', '#3a80d7', '#b4ad44', '#00a65a', '#6a0c7b', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#a6c96a'],
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 25,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y}'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y} (cơ sở)</b><br/>'
                },
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xuất tệp tin ảnh .PNG',
                    downloadJPEG: 'Xuất tệp tin ảnh .JPG',
                    downloadPDF: 'Xuất tệp tin .PDF',
                    viewFullscreen: 'Xem ở chế độ toàn màn hình'
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'viewFullscreen']
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: "Cơ sở báo cáo",
                        data: [
                            {
                                name: "Chưa làm báo cáo",
                                y: vm.progress.summary[0],
                            },
                            {
                                name: "Đang soạn báo cáo",
                                y: vm.progress.summary[1],
                            },
                            {
                                name: "Đang chờ tỉnh duyệt",
                                y: vm.progress.summary[2],
                            },
                            {
                                name: "Đang chờ TW xuất bản",
                                y: vm.progress.summary[3],
                            },
                            {
                                name: "Đã xuất bản báo cáo",
                                y: vm.progress.summary[4],
                            }
                        ]
                    }
                ]
            });
        };

        vm.drawChart2 = function () {
            Highcharts.chart('chart_2', {
                chart: {
                    type: 'column',
                    height: 250,
                    style: {
                        fontFamily: 'Quicksand'
                    }
                },
                title: {
                    text: 'Kết quả đạt được trong tuần'
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
                        text: 'Khách hàng/bệnh nhân'
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br />',
                    pointFormat: 'Tổng số: {point.y} (người)'
                },
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
                    // align: 'left',
                    // verticalAlign: 'right',
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                lang: {
                    downloadPNG: 'Xuất tệp tin ảnh .PNG',
                    downloadJPEG: 'Xuất tệp tin ảnh .JPG',
                    downloadPDF: 'Xuất tệp tin .PDF',
                    viewFullscreen: 'Xem ở chế độ toàn màn hình'
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
                    data: [vm.progress.results[0]],
                    pointStart: 1
                }, {
                    name: 'HTS_POS',
                    data: [vm.progress.results[1]],
                    pointStart: 1
                }, {
                    name: 'TX_NEW',
                    data: [vm.progress.results[2]],
                    pointStart: 1
                }]
            });
        };
    }

})();
