/**
 * Created by bizic on 28/8/2016.
 */
// import {geojson} from "../../assets/scripts/external/highcharts-shapes-vn-all";

(function () {
    'use strict';

    angular.module('PDMA.PREV_REPORT').controller('PrevReportController', PrevReportController);

    PrevReportController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'Utilities',
        'PrevReportService',
        'focusFlatPick',
        'openSelectBox'
    ];

    function PrevReportController($rootScope, $scope, $state, blockUI, $timeout, settings, modal, toastr, utils, service, focusFlatPick, openSelectBox) {
        $scope.$on('$viewContentLoaded', function () {
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
            if ($scope.isAdministrator($scope.currentUser)) {
                let filter = {};
                service.getAllOrganizations(filter, function success() {
                }, function failure() {
                    blockUI.stop();
                }).then(function (data) {
                    angular.forEach(data, function (obj) {
                        vm.orgsWritable = data;
                        vm.orgsWritableTemp = data;
                    });
                    
                    blockUI.stop();
                });
            }
            
            if($scope.isAdministrator($scope.currentUser)) {
                vm.listReport = [
                    {id: 1, name: "Báo cáo SNS"},
                    {id: 2, name: "Báo cáo TVXN HIV"},
                    {id: 3, name: "Báo cáo Tiếp cận cộng đồng"},
                    {id: 4, name: "Báo cáo Thông báo XN BT/BC"},
                    {id: 5, name: "Báo cáo Xét nghiệm sàng lọc giang mai"},
                    {id: 6, name: "Báo cáo Tự xét nghiệm"},
                    {id: 7, name: "Báo cáo MER"},
                    {id: 8, name: "Báo cáo MER PE02"},
                ];         
            } else {
                vm.listReport = [
                    {id: 1, name: "Báo cáo SNS"},
                    {id: 2, name: "Báo cáo TVXN HIV"},
                    {id: 3, name: "Báo cáo Tiếp cận cộng đồng"},
                    {id: 4, name: "Báo cáo Thông báo XN BT/BC"},
                    {id: 5, name: "Báo cáo Xét nghiệm sàng lọc giang mai"},
                    {id: 6, name: "Báo cáo Tự xét nghiệm"},
                ];
            }
            // todo if necessary check if the current user is allowed to access this page
        });

        let vm = this;

        vm.report = {orgIds: []};
        
        vm.orgsWritable = [];
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            // debugger;
            if (newVal == true) {
                vm.orgsWritable = $scope.assignedOrgs.readable;
                vm.orgsWritableTemp = vm.orgsWritable;
                // if (vm.orgsWritable && vm.orgsWritable.length >= 1 && !vm.report.org) {
                //     vm.currentOrg = vm.orgsWritable[0];
                //     vm.report.org=vm.orgsWritable[0];
                // }
            }
        });
        vm.adminUnitFilter = {};
        vm.provinces = [];
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

        vm.getOrgs = function() {
            vm.report.orgIds = null;
            vm.orgsWritable = [];
            vm.orgsWritableTemp.forEach(element => {
                if(element.address.province.id == vm.report.provinceId) {
                    vm.orgsWritable.push(element);
                }
            });
        }

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
            if (!vm.report.type) {
                toastr.warning('Chưa chọn kiểu báo cáo', "Thông báo");
                openSelectBox('vm.report.type');
                return;
            }
            if (!vm.report.provinceId && (vm.report.orgIds && vm.report.orgIds.length == 0)) {
                toastr.warning('Vui lòng chọn tỉnh/thành phố hoặc cơ sở báo cáo', "Thông báo");
                return;
            }
            // if (vm.report.orgIds && vm.report.orgIds.length == 0) {
            //     toastr.warning('Chưa chọn cơ sở báo cáo', "Thông báo");
            //     openSelectBox('vm.report.orgIds');
            //     return;
            // }
            if (!vm.report.fromDate) {
                toastr.warning('Chưa chọn ngày bắt đầu', "Thông báo");
                focusFlatPick('vm.report.fromDate');
                return;
            }
            if (!vm.report.toDate) {
                toastr.warning('Chưa chọn ngày kết thúc', "Thông báo");
                focusFlatPick('vm.report.toDate');
                return;
            }
            if (vm.report.toDate < vm.report.fromDate) {
                toastr.warning('Ngày bắt đầu không thế lớn hơn ngày kết thúc', "Thông báo");
                focusFlatPick('vm.report.toDate');
                return;
            }
            blockUI.start();
            if (vm.report.type && vm.report.type == 1) {
                service.exportReportSNS(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 2) {
                service.exportReportHTS(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 3) {
                console.log("duc");
                console.log(vm.report);
                service.exportReportPE(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 4) {
                service.exportReportPNS(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 5) {
                service.exportReportSTI(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 6) {
                service.exportReportSelfTest(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 7) {
                service.exportReportSelfTestNew(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }
            if (vm.report.type && vm.report.type == 8) {
                service.exportReportMerPe02(vm.report)
                    .success(successHandler)
                    .error(function () {
                        blockUI.stop();
                    });
            }

        };
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
                        vm.report.fromDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.report.fromDate) {
                    fpItem.setDate(moment(vm.report.fromDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.report.fromDate = null;
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
                        vm.report.toDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.report.toDate) {
                    fpItem.setDate(moment(vm.report.toDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.report.toDate = null;
                }
            }
        };

        /// BEGIN: SAMPLE MAPS
        Highcharts.getJSON('../../assets/scripts/external/highcharts-shapes-vn-all.json', function (geojson) {

            let states = Highcharts.geojson(geojson, 'map'),
                cities = Highcharts.geojson(geojson, 'mappoint');

            console.log(states);
            console.log(cities);

            Highcharts.mapChart('map_container_1', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    height: 800,
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: null
                },
                plotOptions: {
                    series: {
                        point: {
                            events: {
                                click: function () {
                                    var text = '<b>Clicked point</b><br>Series: ' + this.series.name +
                                        '<br>Point: ' + this.name + ' (' + this.value + '/km²)',
                                        chart = this.series.chart;
                                    if (!chart.clickLabel) {
                                        chart.clickLabel = chart.renderer.label(text, 0, 250)
                                            .css({
                                                width: '180px'
                                            })
                                            .add();
                                    } else {
                                        chart.clickLabel.attr({
                                            text: text
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                series: [{
                    name: 'Provinces',
                    data: states,
                    color: '#778877',
                    states: {
                        hover: {
                            color: '#FF4488'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            width: '80px' // force line-wrap
                        }
                    },
                    tooltip: {
                        pointFormat: '{point.name}'
                    }
                }]
            });
        });

        Highcharts.getJSON('../../assets/maps/hanoi.json', function (geojson) {

            let states = Highcharts.geojson(geojson, 'map'),
                cities = Highcharts.geojson(geojson, 'mappoint');

            console.log(states);
            console.log(cities);

            Highcharts.mapChart('map_container_2', {
                chart: {
                    style: {
                        fontFamily: 'Quicksand',
                        fontWeight: 501
                    },
                    height: 800,
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: null
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                series: [{
                    name: 'District',
                    data: states,
                    color: '#778877',
                    states: {
                        hover: {
                            color: '#FF4488'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            width: '80px' // force line-wrap
                        }
                    },
                    tooltip: {
                        pointFormat: '{point.name}'
                    }
                }]
            });
        });

        /// END: SAMPLE MAPS
    }

})();
