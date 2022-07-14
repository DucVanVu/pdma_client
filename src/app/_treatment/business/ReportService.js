/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('ReportService', ReportService);

    ReportService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function ReportService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getEntries = getEntries;
        self.generateReport = generateReport;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;
        self.convertReportingPeriod = convertReportingPeriod;
        self.convertReportingPeriodTB = convertReportingPeriodTB;
        self.convertReportingPeriodTBMonth = convertReportingPeriodTBMonth;

        function convertReportingPeriod(report, usePepfarQuarter) {

            let fromDate = null;
            let toDate = null;

            if (usePepfarQuarter) {
                switch (report.selQuarter) {
                    case 1:
                        fromDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 9, // October
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 11, // Dec
                            'date': 31,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 2:
                        fromDate = moment().set({
                            'year': report.selYear,
                            'month': 0, // Jan
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 2, // March
                            'date': 31,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 3:
                        fromDate = moment().set({
                            'year': report.selYear,
                            'month': 3, // April
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 5, // June
                            'date': 30,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 4:
                        fromDate = moment().set({
                            'year': report.selYear,
                            'month': 6, // Jul
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 8, // September
                            'date': 30,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                }
            } else {
                switch (report.selQuarter) {
                    case 1:
                        fromDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 0, // Jan
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 11, // Dec
                            'date': 31,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 2:
                        fromDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 3, // Oct
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 2, // March
                            'date': 31,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 3:
                        fromDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 6, // Jul
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 5, // June
                            'date': 30,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                    case 4:
                        fromDate = moment().set({
                            'year': report.selYear - 1,
                            'month': 9, // Oct
                            'date': 1,
                            'hour': 0,
                            'minute': 0,
                            'second': 0
                        });
                        toDate = moment().set({
                            'year': report.selYear,
                            'month': 8, // September
                            'date': 30,
                            'hour': 17,
                            'minute': 59,
                            'second': 59
                        });
                        break;
                }
            }

            report.fromDate = fromDate.add(7, 'hours').toDate();
            report.toDate = toDate.add(7, 'hours').toDate();
        }

        function convertReportingPeriodTB(report) {

            let fromDate = null;
            let toDate = null;
            let fromYearDate = null;
            let toYearDate = null;
            switch (report.selQuarter) {
                case 1:
                    fromDate = moment().set({
                        'year': report.selYear,
                        'month': 0, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 2, // March
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    fromYearDate = moment().set({
                        'year': report.selYear,
                        'month': 0, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toYearDate = moment().set({
                        'year': report.selYear,
                        'month': 11, // September
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;
                case 2:
                    fromDate = moment().set({
                        'year': report.selYear,
                        'month': 3, // Oct
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 5, // Jul
                        'date': 30,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    fromYearDate = moment().set({
                        'year': report.selYear,
                        'month': 0, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toYearDate = moment().set({
                        'year': report.selYear,
                        'month': 11, // September
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;
                case 3:
                    fromDate = moment().set({
                        'year': report.selYear,
                        'month': 6, // July
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 8, // June
                        'date': 30,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    fromYearDate = moment().set({
                        'year': report.selYear,
                        'month': 0, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toYearDate = moment().set({
                        'year': report.selYear,
                        'month': 11, // September
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;
                case 4:
                    fromDate = moment().set({
                        'year': report.selYear,
                        'month': 9, // Oct
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 11, // September
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    fromYearDate = moment().set({
                        'year': report.selYear,
                        'month': 0, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toYearDate = moment().set({
                        'year': report.selYear,
                        'month': 11, // September
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;
            }

            report.fromDate = fromDate.add(7, 'hours').toDate();
            report.toDate = toDate.add(7, 'hours').toDate();
            report.fromYearDate = fromYearDate.add(7, 'hours').toDate();
            report.toYearDate = toYearDate.add(7, 'hours').toDate();
        }

        function convertReportingPeriodTBMonth(report) {

            let fromDate = null;
            let toDate = null;
            let preFromDate = null;
            let preToDate = null;
            switch (report.selQuarter) {
                case 1:
                    fromDate = moment().set({
                        'year': report.selYear - 1,
                        'month': 9, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 2, // March
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });

                    preFromDate = moment().set({
                        'year': report.selYear - 1,
                        'month': 3, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    preToDate = moment().set({
                        'year': report.selYear - 1,
                        'month': 8, // March
                        'date': 30,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;
                case 2:
                    fromDate = moment().set({
                        'year': report.selYear,
                        'month': 3, // Oct
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    toDate = moment().set({
                        'year': report.selYear,
                        'month': 8, // Jul
                        'date': 30,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    preFromDate = moment().set({
                        'year': report.selYear - 1,
                        'month': 9, // Jan
                        'date': 1,
                        'hour': 0,
                        'minute': 0,
                        'second': 0,
                        'millisecond': 0
                    });
                    preToDate = moment().set({
                        'year': report.selYear,
                        'month': 2, // March
                        'date': 31,
                        'hour': 23,
                        'minute': 59,
                        'second': 59,
                        'millisecond': 999
                    });
                    break;

            }

            report.fromDate = fromDate.add(7, 'hours').toDate();
            report.toDate = toDate.add(7, 'hours').toDate();
            report.preFromDate = preFromDate.add(7, 'hours').toDate();
            report.preToDate = preToDate.add(7, 'hours').toDate();

        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'reporting/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'reporting/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function generateReport(filter) {
            let url = baseUrl + 'reporting';

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filter,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'reporting';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';

                return ret;
            };

            let _tableOperationCellStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter_2 = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                let date = new Date(value.year, value.monthValue - 1, value.dayOfMonth, value.hour, value.minute, value.second, value.nano);
                return moment(date).format('DD/MM/YYYY hh:mm:ss A');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'title',
                    title: 'Tên báo cáo',
                    switchable: false,
                    visible: true
                }, {
                    field: 'contentLength',
                    title: 'Kích thước tệp tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'createdByName',
                    title: 'Được lập bởi',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'createDate',
                    title: 'Ngày lập báo cáo',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }

})();