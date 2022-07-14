(function () {
    'use strict';

    angular.module('PDMA.Reporting').service('WeeklyReportingService', WeeklyReportingService);

    WeeklyReportingService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function WeeklyReportingService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getWeeklyReports = getWeeklyReports;
        self.getWeeklyReport = getWeeklyReport;
        self.getWeeklyReportAlt = getWeeklyReportAlt;
        self.saveWeeklyReport = saveWeeklyReport;
        self.updateReportStatus = updateReportStatus;
        self.deleteWeeklyReports = deleteWeeklyReports;
        self.getDefaultReport = getDefaultReport;
        self.getDefaultPeriod = getDefaultPeriod;
        self.getTableDefinition4Cases = getTableDefinition4Cases;
        self.getTableDefinition4Untreateds = getTableDefinition4Untreateds;
        self.getTableDefinition4Positives = getTableDefinition4Positives;
        self.getTableDefinition4Treatments = getTableDefinition4Treatments;
        self.getTableDefinition4Progress = getTableDefinition4Progress;
        self.isSameAddress = isSameAddress;
        self.getUntreatedCases = getUntreatedCases;
        self.getWRCase = getWRCase;
        self.saveCases = saveCases;
        self.deleteCases = deleteCases;
        self.export2Excel = export2Excel;
        self.getChartData = getChartData;
        self.findAny = findAny;
        self.getProgressSummaryData = getProgressSummaryData;
        self.districtApproval = districtApproval;

        /**
         * When district user approve a report
         * @param approval
         */
        function districtApproval(report) {
            if (!report) {
                return $q.when(null);
            }

            let url = baseUrl + 'weekly_report/dapproval';

            return utils.resolveAlt(url, 'POST', null, report, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        /**
         * Used to check duplicate of hivConfirmID or patientChartID
         *
         * @param filter
         * @returns {*}
         */
        function findAny(filter) {
            let url = baseUrl + 'wrcase/any';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getProgressSummaryData(filter) {
            let url = baseUrl + 'weekly_report/progress';
            let filterAlt = {};

            angular.copy(filter, filterAlt);

            if (filterAlt.status == null || typeof filterAlt.status == 'undefined') {
                filterAlt.status = -2;
            } else {
                filterAlt.status = filterAlt.status.id;
            }

            return utils.resolveAlt(url, 'POST', null, filterAlt, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        /**
         * Get chart data
         * @param filter
         * @returns {*}
         */
        function getChartData(filter) {
            let url = baseUrl + 'weekly_report/chart';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        /**
         * Export to excel file for download
         * @param filter
         * @returns {*}
         */
        function export2Excel(filter) {
            let url = baseUrl + 'weekly_report/excel';

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

        /**
         * Save a list of cases
         * @param report
         * @param successCallback
         * @param errorCallback
         * @returns {*}
         */
        function saveCases(report, successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report/cases';

            return utils.resolveAlt(url, 'POST', null, report, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        /**
         * Delete selected cases
         * @param report
         * @param delPosCase
         * @param successCallback
         * @param errorCallback
         * @returns {*}
         */
        function deleteCases(report, delPosCase, successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report/cases/' + delPosCase;

            return utils.resolveAlt(url, 'DELETE', null, report, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        /**
         * Find untreated cases of the same site
         * @param filter
         * @returns {*}
         */
        function getUntreatedCases(filter) {
            let url = baseUrl + 'wrcase/untreated';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getWRCase(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'wrcase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function isSameAddress(wrcase) {
            let c = {};
            angular.copy(wrcase, c);

            let obj = {currentAddress: {}, residentialAddress: {}};
            angular.forEach(c.locations, function (loc) {
                if (loc.addressType == 'CURRENT_ADDRESS') {
                    angular.copy(loc, obj.currentAddress);
                } else if (loc.addressType == 'RESIDENT_ADDRESS') {
                    angular.copy(loc, obj.residentialAddress);
                }
            });

            if (!obj.currentAddress.province || !obj.currentAddress.district
                || !obj.residentialAddress.province || !obj.residentialAddress.district) {
                return false;
            }

            let bool = obj.currentAddress.province.id == obj.residentialAddress.province.id
                && obj.currentAddress.district.id == obj.residentialAddress.district.id
                && obj.currentAddress.streetAddress == obj.residentialAddress.streetAddress;

            if (!obj.currentAddress.commune || !obj.currentAddress.commune.id) {
                obj.currentAddress.commune = {id: null};
            }

            if (!obj.residentialAddress.commune || !obj.residentialAddress.commune.id) {
                obj.residentialAddress.commune = {id: null};
            }

            bool = bool && obj.currentAddress.commune.id == obj.residentialAddress.commune.id;

            // To revert back to null
            if (obj.currentAddress.commune.id == null) {
                obj.currentAddress.commune = null;
            }

            if (obj.residentialAddress.commune.id == null) {
                obj.residentialAddress.commune = null;
            }

            return bool;
        }

        function getDefaultReport() {
            let obj = moment(new Date()).startOf('isoWeek');
            let m = moment(new Date()).startOf('isoWeek');

            const weekNumber = moment(new Date()).startOf('isoWeek').week();
            const year = moment(new Date()).startOf('isoWeek').year();

            let fromDate = obj.add(7, 'hours').toDate();
            let toDate = obj.add(6, 'days').add(23, 'hours').add(59, 'minutes').add(59, 'seconds').toDate();

            return {
                tempDate: fromDate,
                fromDate: fromDate,
                toDate: toDate,
                name: 'Báo cáo tuần ' + weekNumber + '/' + year,
                status: 0,
                organization: null,
                htsTst: 0,
                htsPos: 0,
                txNew: 0,
                txNewBreakdown1: 0,
                txNewBreakdown2: 0
            };
        }

        function getDefaultPeriod() {
            return $q.when({
                fromDate: moment().startOf('isoWeek').add(-1, 'week'),
                toDate: moment().endOf('isoWeek').add(-1, 'week')
            });
        }

        function getWeeklyReports(filter) {
            let url = baseUrl + 'weekly_report/list';
            let filterAlt = {};

            angular.copy(filter, filterAlt);

            if (!filter.status || typeof(filter.status.id) == 'undefined') {
                filterAlt.status = -1; // all reports
            } else {
                filterAlt.status = filter.status.id;
            }

            return utils.resolveAlt(url, 'POST', null, filterAlt, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getWeeklyReport(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'weekly_report/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        // Depending on the start date and reporting organization, figure out if there is already a report created
        function getWeeklyReportAlt(dto) {
            let url = baseUrl + 'weekly_report/query';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveWeeklyReport(report, successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report';

            return utils.resolveAlt(url, 'POST', null, report, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function updateReportStatus(report, successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report/status';

            return utils.resolveAlt(url, 'POST', null, report, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteWeeklyReports(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'weekly_report';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition4Cases(treatment) {
            let _tableOp4Hts = function (value, row, index) {
                return '<select class="custom-select" ng-options="item as item.name for item in $parent.htsCaseStatuses track by item.id" ng-model="$parent.cases[' + index + ']._status"><option value="">-- chọn tình trạng --</option></select>';
            };

            let _tableOp4Tx = function (value, row, index) {
                return '<select class="custom-select" ng-options="item as item.name for item in $parent.txCaseStatuses track by item.id" ng-model="$parent.cases[' + index + ']._status"><option value="">-- chọn tình trạng --</option></select>';
            };

            let _tableOperationFormat = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '60px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _genderFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'Nữ' : (value == 'OTHER') ? 'Không rõ' : (value == 'NOT_DISCLOSED') ? 'Không tiết lộ' : '';
            };

            let _nameFormatter = function (value, row, index) {
                if (treatment) {
                    return '<a href="#" ng-click="$parent.editTreatmentCase(' + "'" + row.id + "'" + ')">' + value + '</a>';
                } else {
                    return '<a href="#" ng-click="$parent.editPositiveCase(' + "'" + row.id + "'" + ')">' + value + '</a>';
                }
            };

            let _noteFormatter = function (value, row, index) {

                let ret = '';

                if (value) {
                    if (value.trim().length > 30) {
                        ret = value.substr(0, 30) + '...';
                    } else {
                        ret = value;
                    }
                }

                return ret + '&nbsp;-- <a ng-click="$parent.editCaseNote($parent.cases[' + index + '])" uib-tooltip="Cập&nbsp;nhật&nbsp;ghi&nbsp;chú" href="#"><i class="icon-pencil"></i></a> --';
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY hh:mm A');
            };

            return [
                {
                    field: '',
                    title: 'Xác nhận ca cũ - mới',
                    switchable: false,
                    visible: true,
                    formatter: treatment ? _tableOp4Tx : _tableOp4Hts,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: treatment ? 'patientChartId' : 'hivConfirmId',
                    title: treatment ? 'Mã bệnh nhân' : 'Mã khẳng định HIV+',
                    switchable: false,
                    visible: false,
                    sortable: false,
                    // formatter: _noteFormat
                }
                , {
                    field: 'fullname',
                    title: treatment ? 'Họ tên bệnh nhân' : 'Họ tên khách hàng HIV+',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'dob',
                    title: 'Ngày sinh',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'gender',
                    title: 'Giới tính',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _genderFormatter
                }
                , {
                    field: 'note',
                    title: 'Ghi chú',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    formatter: _noteFormatter
                }
                // , {
                //     field: 'confirmDate',
                //     title: 'Ngày giờ khẳng định HIV+',
                //     sortable: true,
                //     switchable: false,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _dateFormatter2
                // }
            ]
        }

        function getTableDefinition4Untreateds() {
            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="fa fa-user-md margin-right-5"></i>Đưa vào điều trị</a>';
            };

            let _tableOperationFormat = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '40px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _genderFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'Nữ' : (value == 'OTHER') ? 'Không rõ' : (value == 'NOT_DISCLOSED') ? 'Không tiết lộ' : '';
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY hh:mm A');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'fullname',
                    title: 'Họ tên khách hàng HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'dob',
                    title: 'Ngày sinh',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'gender',
                    title: 'Giới tính',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _genderFormatter
                }
                // , {
                //     field: 'screeningDate',
                //     title: 'Ngày giờ sàng lọc',
                //     sortable: true,
                //     switchable: true,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _dateFormatter2
                // }
                , {
                    field: 'confirmDate',
                    title: 'Ngày giờ khẳng định HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
            ]
        }

        function getTableDefinition4Positives(status, isPrivacyConsidered, tableOperationHidden) {
            let _tableOperation = function (value, row, index) {
                let url = '';

                if (status == 0) {
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" uib-tooltip="Sửa&nbsp;ca&nbsp;dương&nbsp;tính" href="#" ng-click="$parent.$parent.editPositiveCase(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Chỉnh sửa</a>';
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-danger no-border" uib-tooltip="Xoá&nbsp;ca&nbsp;dương&nbsp;tính" href="#" ng-click="$parent.$parent.deletePositiveCase(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>Xoá</a>';
                } else {
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted margin-right-20"><i class="icon-pencil icon-muted margin-right-5"></i>Chỉnh sửa</span>';
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted"><i class="icon-trash icon-muted margin-right-5"></i>Xoá</span>';

                    url += '<a uib-tooltip="Xem&nbsp;chi&nbsp;tiết" ng-if="$parent.isDistrictManager($parent.currentUser) || $parent.isProvincialManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.$parent.editPositiveCase(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi tiết</a>';
                }

                url += '<span ng-if="$parent.isNationalManager($parent.currentUser)" class="green-dark margin-right-20 text-muted"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi tiết</span>';

                return url;
            };

            let _tableOperationFormat = function (value, row, index, field) {
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

            let _genderFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'Nữ' : (value == 'OTHER') ? 'Không rõ' : (value == 'NOT_DISCLOSED') ? 'Không tiết lộ' : '';
            };

            let _statusFormatter = function (value, row, index) {
                // if (!value) {
                //     return '<span class="text-muted"><i class="icon-question icon-muted"></i> Chưa xác định</span>';
                // }

                let ret = '';

                switch (value) {
                    case 0:
                        ret = '<span class="text-muted"><i class="icon-question icon-muted"></i> Chưa xác định</span>';
                        break;
                    case 1:
                        ret = '<span class="text-info"><i class="fa fa-check icon-muted"></i> Chẩn đoán mới</span>';
                        break;
                    case 2:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> Chẩn đoán cũ</span>';
                        break;
                    case 4:
                        ret = '<span class="text-warning"><i class="fa fa-check icon-muted"></i> Ngoại tỉnh</span>';
                        break;
                }

                return ret;
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY hh:mm A');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: !tableOperationHidden,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'hivConfirmId',
                    title: 'Mã XNKĐ HIV+',
                    sortable: true,
                    switchable: false,
                    visible: isPrivacyConsidered,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'fullname',
                    title: 'Khách hàng',
                    sortable: true,
                    switchable: false,
                    visible: !isPrivacyConsidered,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';

                        if (row.gender) {
                            let gender = row.gender;
                            s += '<i class="margin-right-5 fa fa-';
                            s += ((gender == 'MALE') ? 'mars' : ((gender == 'FEMALE') ? 'venus' : 'neuter'));
                            s += '"></i>'
                        }

                        s += '<b>' + value + '</b>';
                        if (row.dob) {
                            let dob = row.dob;
                            s += '<p class="margin-bottom-5 margin-top-5">Ngày sinh: ';
                            s += '<span class="font-weight-500">' + moment(dob).format('DD/MM/YYYY') + '</span>';
                            s += '</p>';
                        }


                        return s;
                    }
                }
                // , {
                //     field: 'dob',
                //     title: 'Ngày sinh',
                //     sortable: true,
                //     switchable: false,
                //     cellStyle: _cellNowrap,
                //     formatter: _dateFormatter
                // }
                // , {
                //     field: 'gender',
                //     title: 'Giới tính',
                //     sortable: true,
                //     switchable: false,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _genderFormatter
                // }
                , {
                    field: 'screeningDate',
                    title: 'Ngày giờ sàng lọc',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'confirmDate',
                    title: 'Ngày giờ khẳng định HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'htsCaseStatus',
                    title: 'Ca cũ/mới',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }
            ]
        }

        function getTableDefinition4Treatments(status, isPrivacyConsidered, tableOperationHidden) {
            let _tableOperation = function (value, row, index) {
                let url = '';

                if (status == 0) {
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Chỉnh sửa</a>';
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-danger no-border" uib-tooltip="Xoá&nbsp;ca&nbsp;dương&nbsp;tính" href="#" ng-click="$parent.$parent.deleteTreatmentCase(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>Xoá</a>';
                } else {
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted margin-right-20"><i class="icon-pencil icon-muted margin-right-5"></i>Chỉnh sửa</span>';
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted"><i class="icon-trash icon-muted margin-right-5"></i>Xoá</span>';

                    url += '<a ng-if="$parent.isDistrictManager($parent.currentUser) || $parent.isProvincialManager($parent.currentUser)" class="green-dark margin-right-20" ng-click="$parent.$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi tiết</a>';
                }

                url += '<span ng-if="$parent.isNationalManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20 text-muted"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi tiết</span>';

                return url;
            };

            let _tableOperationFormat = function (value, row, index, field) {
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

            let _genderFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'Nữ' : (value == 'OTHER') ? 'Không rõ' : (value == 'NOT_DISCLOSED') ? 'Không tiết lộ' : '';
            };

            let _statusFormatter = function (value, row, index) {

                let ret = '';

                switch (value) {
                    case 0:
                        ret = '<span class="text-muted"><i class="icon-question icon-muted"></i> Chưa xác định</span>';
                        break;
                    case 1:
                        ret = '<span class="text-info"><i class="fa fa-check icon-muted"></i> Điều trị mới</span>';
                        break;
                    case 2:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> Cũ chưa điều trị</span>';
                        break;
                    case 3:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> Cũ bỏ trị</span>';
                        break;
                    case 4:
                        ret = '<span class="text-warning"><i class="fa fa-check icon-muted"></i> Ngoại tỉnh</span>';
                        break;
                }

                return ret;
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY hh:mm A');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: true,
                    visible: !tableOperationHidden,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'patientChartId',
                    title: 'Mã BN tại PKNT',
                    sortable: true,
                    switchable: false,
                    visible: isPrivacyConsidered,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'fullname',
                    title: 'Bệnh nhân',
                    sortable: true,
                    switchable: false,
                    visible: !isPrivacyConsidered,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';

                        if (row.gender) {
                            let gender = row.gender;
                            s += '<i class="margin-right-5 fa fa-';
                            s += ((gender == 'MALE') ? 'mars' : ((gender == 'FEMALE') ? 'venus' : 'neuter'));
                            s += '"></i>'
                        }

                        s += '<b>' + value + '</b>';
                        if (row.dob) {
                            let dob = row.dob;
                            s += '<p class="margin-bottom-5 margin-top-5">Ngày sinh: ';
                            s += '<span class="font-weight-500">' + moment(dob).format('DD/MM/YYYY') + '</span>';
                            s += '</p>';
                        }


                        return s;
                    }
                }
                , {
                    field: 'transed2OpcAssist',
                    title: 'Đã vào OPC-Assist?',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value) {
                            let s = '<span class="bold text-green">Đã nhập liệu.</span><br />';
                            s += '<span>Mã BN: </span>';
                            s += '<span class="bold">' + row.patientChartIdInOpcAssist + '</span>';

                            return s;
                        } else {
                            return '<span class="bold text-danger">Chưa nhập liệu.</span>';
                        }
                    }
                }
                // , {
                //     field: 'gender',
                //     title: 'Giới tính',
                //     sortable: true,
                //     switchable: false,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _genderFormatter
                // }
                , {
                    field: 'screeningDate',
                    title: 'Ngày giờ sàng lọc',
                    sortable: true,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'confirmDate',
                    title: 'Ngày giờ khẳng định HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'enrollmentDate',
                    title: 'Ngày giờ đăng ký điều trị',
                    sortable: true,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'arvInitiationDate',
                    title: 'Ngày giờ bắt đầu ARV',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'txCaseStatus',
                    title: 'Ca cũ/mới',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }
            ]
        }

        function getTableDefinition(isSiteManager, isProvincialManager) {

            let _tableOperation = function (value, row, index) {
                let url = '';
                if (isSiteManager) {
                    url += '<a uib-tooltip="Cập&nbsp;nhật&nbsp;báo&nbsp;cáo" ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.$parent.editReport(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i><span class="hidden-xs">Chỉnh </span>sửa</a>';
                } else {
                    if (row.status > 0) {
                        if (isProvincialManager) {
                            if (row.status === 1 && row.htsPos === 0 && row.txNew === 0) {
                                url += '<a uib-tooltip="Duyệt&nbsp;nhanh" class="btn btn-sm btn-primary no-border" href="#" data-ng-click="$parent.updateReportStatus(' + "'" + row.id + "'" + ', 2)"><i class="fa fa-check icon-muted margin-right-5"></i>Duyệt nhanh</a>';
                            } else {
                                url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-check icon-muted margin-right-5"></i>Duyệt nhanh</span>';
                            }
                        }
                        url += '<a uib-tooltip="Xem&nbsp;báo&nbsp;cáo" class="btn btn-sm btn-primary no-border" href="#" data-ng-click="$parent.editReport(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi tiết</a>';
                    } else {
                        if (isProvincialManager) {
                            url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-check icon-muted margin-right-5"></i>Duyệt nhanh</span>';
                        }
                        url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi tiết</span>';
                    }
                }
                return url;
            };

            let _tableOperationStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '50px', 'text-align': 'center'}
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

            let _statusFormatter = function (value, row, index) {
                if (value == null) {
                    return '';
                }
                let ret = '';
                switch (value) {
                    case 0:
                        ret = '<span class="report-status-std status-0">Đang soạn thảo</span>';
                        break;
                    case 1:
                        ret = '<span class="report-status-std status-1">Chờ phê duyệt</span>';
                        break;
                    case 2:
                        ret = '<span class="report-status-std status-2">Chờ xuất bản</span>';
                        break;
                    case 3:
                        ret = '<span class="report-status-std status-3">Đã xuất bản</span>';
                        break;
                }

                return ret;
            };

            let _nameFormatter = function (value, row, index) {
                let ret = '<span class="font-weight-600">' + value + '</span>';
                if (row.comment && row.comment.length > 0) {
                    let comment = row.comment;
                    if (comment.length > 30) {
                        comment = comment.substr(0, 30) + '...';
                    }

                    ret += '<a href="#" uib-tooltip="' + comment + '" class="margin-left-5"><i class="icon-bubbles"></i></a>'
                }

                return ret;
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                let md = moment().set({
                    'date': value.dayOfMonth,
                    'month': value.monthValue - 1,
                    'year': value.year,
                    'hour': value.hour,
                    'minute': value.minute,
                    'second': value.second
                });
                return '<div class="text-align-reverse">' + md.format('DD/MM/YYYY hh:mm:ss A') + '</div>';
            };

            let _dateFormatter3 = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                return '<div class="text-align-reverse">' + moment(value).format('DD/MM/YYYY hh:mm:ss A') + '</div>';
            };

            let columns = [
                {
                    field: 'state',
                    checkbox: true
                }
                , {
                    field: '',
                    title: 'Thao tác',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationStyle
                }
                , {
                    field: 'organization.name',
                    title: 'Cơ sở báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'Kỳ báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'fromDate',
                    title: 'Từ ngày',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'toDate',
                    title: 'Đến ngày',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'status',
                    title: 'Trạng thái',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }
                , {
                    field: 'htsTst',
                    title: '# xét nghiệm',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'htsPos',
                    title: '# dương tính',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'txNew',
                    title: '# điều trị',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'createDate',
                    title: 'Tạo báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'submissionDate',
                    title: 'Gửi báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'approvalDate',
                    title: 'Duyệt báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'publishDate',
                    title: 'Xuất bản báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'createdBy',
                    title: 'Người tạo báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'modifyDate',
                    title: 'Lần cập nhật cuối',
                    sortable: false,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'modifiedBy',
                    title: 'Người sửa báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap
                }
            ];

            if (!isSiteManager) {
                columns.shift();
            }

            return columns;
        }

        function getTableDefinition4Progress() {

            let _tableOperation = function (value, row, index) {
                return '<a uib-tooltip="Xem&nbsp;báo&nbsp;cáo" class="green-dark margin-right-20" href="#" data-ng-click="$parent.editReport(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi tiết</a>';
            };

            let _tableOperationStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '50px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _datetimeFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                return moment(value).format('DD/MM/YYYY hh:mm:ss A');
            };

            let _statusFormatter = function (value, row, index) {
                if (value == null) {
                    return '';
                }
                let ret = '';
                switch (value) {
                    case -1:
                        ret = '<span class="report-status-std status--1" style="white-space: nowrap">Chưa làm báo cáo</span>';
                        break;
                    case 0:
                        ret = '<span class="report-status-std status-0" style="white-space: nowrap">Đang soạn báo cáo</span>';
                        break;
                    case 1:
                        ret = '<span class="report-status-std status-1" style="white-space: nowrap">Chờ tỉnh phê duyệt</span>';
                        break;
                    case 2:
                        ret = '<span class="report-status-std status-2" style="white-space: nowrap">Chờ TW xuất bản</span>';
                        break;
                    case 3:
                        ret = '<span class="report-status-std status-3" style="white-space: nowrap">Đã được xuất bản</span>';
                        break;
                }

                return ret;
            };

            let columns = [
                {
                    field: 'name',
                    title: 'Cơ sở báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'province',
                    title: 'Tỉnh - thành phố',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'district',
                    title: 'Huyện - quận',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'status',
                    title: 'Tình trạng',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }, {
                    field: 'submissionDate',
                    title: 'Thời điểm nộp báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _datetimeFormatter
                }, {
                    field: 'approvalDate',
                    title: 'Thời điểm duyệt báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _datetimeFormatter
                }, {
                    field: 'publishDate',
                    title: 'Thời điểm xuất bản báo cáo',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _datetimeFormatter
                }
            ];

            return columns;
        }
    }
})();