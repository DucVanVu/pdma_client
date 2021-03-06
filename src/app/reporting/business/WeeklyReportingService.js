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
                name: 'B??o c??o tu???n ' + weekNumber + '/' + year,
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
                return '<select class="custom-select" ng-options="item as item.name for item in $parent.htsCaseStatuses track by item.id" ng-model="$parent.cases[' + index + ']._status"><option value="">-- ch???n t??nh tr???ng --</option></select>';
            };

            let _tableOp4Tx = function (value, row, index) {
                return '<select class="custom-select" ng-options="item as item.name for item in $parent.txCaseStatuses track by item.id" ng-model="$parent.cases[' + index + ']._status"><option value="">-- ch???n t??nh tr???ng --</option></select>';
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

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'N???' : (value == 'OTHER') ? 'Kh??ng r??' : (value == 'NOT_DISCLOSED') ? 'Kh??ng ti???t l???' : '';
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

                return ret + '&nbsp;-- <a ng-click="$parent.editCaseNote($parent.cases[' + index + '])" uib-tooltip="C???p&nbsp;nh???t&nbsp;ghi&nbsp;ch??" href="#"><i class="icon-pencil"></i></a> --';
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
                    title: 'X??c nh???n ca c?? - m???i',
                    switchable: false,
                    visible: true,
                    formatter: treatment ? _tableOp4Tx : _tableOp4Hts,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: treatment ? 'patientChartId' : 'hivConfirmId',
                    title: treatment ? 'M?? b???nh nh??n' : 'M?? kh???ng ?????nh HIV+',
                    switchable: false,
                    visible: false,
                    sortable: false,
                    // formatter: _noteFormat
                }
                , {
                    field: 'fullname',
                    title: treatment ? 'H??? t??n b???nh nh??n' : 'H??? t??n kh??ch h??ng HIV+',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'dob',
                    title: 'Ng??y sinh',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'gender',
                    title: 'Gi???i t??nh',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _genderFormatter
                }
                , {
                    field: 'note',
                    title: 'Ghi ch??',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    formatter: _noteFormatter
                }
                // , {
                //     field: 'confirmDate',
                //     title: 'Ng??y gi??? kh???ng ?????nh HIV+',
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
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="fa fa-user-md margin-right-5"></i>????a v??o ??i???u tr???</a>';
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

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'N???' : (value == 'OTHER') ? 'Kh??ng r??' : (value == 'NOT_DISCLOSED') ? 'Kh??ng ti???t l???' : '';
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
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'fullname',
                    title: 'H??? t??n kh??ch h??ng HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'dob',
                    title: 'Ng??y sinh',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'gender',
                    title: 'Gi???i t??nh',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _genderFormatter
                }
                // , {
                //     field: 'screeningDate',
                //     title: 'Ng??y gi??? s??ng l???c',
                //     sortable: true,
                //     switchable: true,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _dateFormatter2
                // }
                , {
                    field: 'confirmDate',
                    title: 'Ng??y gi??? kh???ng ?????nh HIV+',
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
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" uib-tooltip="S???a&nbsp;ca&nbsp;d????ng&nbsp;t??nh" href="#" ng-click="$parent.$parent.editPositiveCase(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Ch???nh s???a</a>';
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-danger no-border" uib-tooltip="Xo??&nbsp;ca&nbsp;d????ng&nbsp;t??nh" href="#" ng-click="$parent.$parent.deletePositiveCase(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>Xo??</a>';
                } else {
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted margin-right-20"><i class="icon-pencil icon-muted margin-right-5"></i>Ch???nh s???a</span>';
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted"><i class="icon-trash icon-muted margin-right-5"></i>Xo??</span>';

                    url += '<a uib-tooltip="Xem&nbsp;chi&nbsp;ti???t" ng-if="$parent.isDistrictManager($parent.currentUser) || $parent.isProvincialManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.$parent.editPositiveCase(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi ti???t</a>';
                }

                url += '<span ng-if="$parent.isNationalManager($parent.currentUser)" class="green-dark margin-right-20 text-muted"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi ti???t</span>';

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

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'N???' : (value == 'OTHER') ? 'Kh??ng r??' : (value == 'NOT_DISCLOSED') ? 'Kh??ng ti???t l???' : '';
            };

            let _statusFormatter = function (value, row, index) {
                // if (!value) {
                //     return '<span class="text-muted"><i class="icon-question icon-muted"></i> Ch??a x??c ?????nh</span>';
                // }

                let ret = '';

                switch (value) {
                    case 0:
                        ret = '<span class="text-muted"><i class="icon-question icon-muted"></i> Ch??a x??c ?????nh</span>';
                        break;
                    case 1:
                        ret = '<span class="text-info"><i class="fa fa-check icon-muted"></i> Ch???n ??o??n m???i</span>';
                        break;
                    case 2:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> Ch???n ??o??n c??</span>';
                        break;
                    case 4:
                        ret = '<span class="text-warning"><i class="fa fa-check icon-muted"></i> Ngo???i t???nh</span>';
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
                    title: 'Thao t??c',
                    switchable: false,
                    visible: !tableOperationHidden,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'hivConfirmId',
                    title: 'M?? XNK?? HIV+',
                    sortable: true,
                    switchable: false,
                    visible: isPrivacyConsidered,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'fullname',
                    title: 'Kh??ch h??ng',
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
                            s += '<p class="margin-bottom-5 margin-top-5">Ng??y sinh: ';
                            s += '<span class="font-weight-500">' + moment(dob).format('DD/MM/YYYY') + '</span>';
                            s += '</p>';
                        }


                        return s;
                    }
                }
                // , {
                //     field: 'dob',
                //     title: 'Ng??y sinh',
                //     sortable: true,
                //     switchable: false,
                //     cellStyle: _cellNowrap,
                //     formatter: _dateFormatter
                // }
                // , {
                //     field: 'gender',
                //     title: 'Gi???i t??nh',
                //     sortable: true,
                //     switchable: false,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _genderFormatter
                // }
                , {
                    field: 'screeningDate',
                    title: 'Ng??y gi??? s??ng l???c',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'confirmDate',
                    title: 'Ng??y gi??? kh???ng ?????nh HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'htsCaseStatus',
                    title: 'Ca c??/m???i',
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
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Ch???nh s???a</a>';
                    url += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-danger no-border" uib-tooltip="Xo??&nbsp;ca&nbsp;d????ng&nbsp;t??nh" href="#" ng-click="$parent.$parent.deleteTreatmentCase(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>Xo??</a>';
                } else {
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted margin-right-20"><i class="icon-pencil icon-muted margin-right-5"></i>Ch???nh s???a</span>';
                    url += '<span ng-if="$parent.isSiteManager($parent.currentUser)" class="text-muted"><i class="icon-trash icon-muted margin-right-5"></i>Xo??</span>';

                    url += '<a ng-if="$parent.isDistrictManager($parent.currentUser) || $parent.isProvincialManager($parent.currentUser)" class="green-dark margin-right-20" ng-click="$parent.$parent.editTreatmentCase(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi ti???t</a>';
                }

                url += '<span ng-if="$parent.isNationalManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20 text-muted"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi ti???t</span>';

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

                return (value == 'MALE') ? 'Nam' : (value == 'FEMALE') ? 'N???' : (value == 'OTHER') ? 'Kh??ng r??' : (value == 'NOT_DISCLOSED') ? 'Kh??ng ti???t l???' : '';
            };

            let _statusFormatter = function (value, row, index) {

                let ret = '';

                switch (value) {
                    case 0:
                        ret = '<span class="text-muted"><i class="icon-question icon-muted"></i> Ch??a x??c ?????nh</span>';
                        break;
                    case 1:
                        ret = '<span class="text-info"><i class="fa fa-check icon-muted"></i> ??i???u tr??? m???i</span>';
                        break;
                    case 2:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> C?? ch??a ??i???u tr???</span>';
                        break;
                    case 3:
                        ret = '<span class="text-danger"><i class="fa fa-check icon-muted"></i> C?? b??? tr???</span>';
                        break;
                    case 4:
                        ret = '<span class="text-warning"><i class="fa fa-check icon-muted"></i> Ngo???i t???nh</span>';
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
                    title: 'Thao t??c',
                    switchable: true,
                    visible: !tableOperationHidden,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationFormat
                }
                , {
                    field: 'patientChartId',
                    title: 'M?? BN t???i PKNT',
                    sortable: true,
                    switchable: false,
                    visible: isPrivacyConsidered,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'fullname',
                    title: 'B???nh nh??n',
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
                            s += '<p class="margin-bottom-5 margin-top-5">Ng??y sinh: ';
                            s += '<span class="font-weight-500">' + moment(dob).format('DD/MM/YYYY') + '</span>';
                            s += '</p>';
                        }


                        return s;
                    }
                }
                , {
                    field: 'transed2OpcAssist',
                    title: '???? v??o OPC-Assist?',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value) {
                            let s = '<span class="bold text-green">???? nh???p li???u.</span><br />';
                            s += '<span>M?? BN: </span>';
                            s += '<span class="bold">' + row.patientChartIdInOpcAssist + '</span>';

                            return s;
                        } else {
                            return '<span class="bold text-danger">Ch??a nh???p li???u.</span>';
                        }
                    }
                }
                // , {
                //     field: 'gender',
                //     title: 'Gi???i t??nh',
                //     sortable: true,
                //     switchable: false,
                //     visible: true,
                //     cellStyle: _cellNowrap,
                //     formatter: _genderFormatter
                // }
                , {
                    field: 'screeningDate',
                    title: 'Ng??y gi??? s??ng l???c',
                    sortable: true,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'confirmDate',
                    title: 'Ng??y gi??? kh???ng ?????nh HIV+',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'enrollmentDate',
                    title: 'Ng??y gi??? ????ng k?? ??i???u tr???',
                    sortable: true,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'arvInitiationDate',
                    title: 'Ng??y gi??? b???t ?????u ARV',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'txCaseStatus',
                    title: 'Ca c??/m???i',
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
                    url += '<a uib-tooltip="C???p&nbsp;nh???t&nbsp;b??o&nbsp;c??o" ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.$parent.editReport(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i><span class="hidden-xs">Ch???nh </span>s???a</a>';
                } else {
                    if (row.status > 0) {
                        if (isProvincialManager) {
                            if (row.status === 1 && row.htsPos === 0 && row.txNew === 0) {
                                url += '<a uib-tooltip="Duy???t&nbsp;nhanh" class="btn btn-sm btn-primary no-border" href="#" data-ng-click="$parent.updateReportStatus(' + "'" + row.id + "'" + ', 2)"><i class="fa fa-check icon-muted margin-right-5"></i>Duy???t nhanh</a>';
                            } else {
                                url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-check icon-muted margin-right-5"></i>Duy???t nhanh</span>';
                            }
                        }
                        url += '<a uib-tooltip="Xem&nbsp;b??o&nbsp;c??o" class="btn btn-sm btn-primary no-border" href="#" data-ng-click="$parent.editReport(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi ti???t</a>';
                    } else {
                        if (isProvincialManager) {
                            url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-check icon-muted margin-right-5"></i>Duy???t nhanh</span>';
                        }
                        url += '<span class="btn btn-default btn-sm no-border disabled"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi ti???t</span>';
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
                        ret = '<span class="report-status-std status-0">??ang so???n th???o</span>';
                        break;
                    case 1:
                        ret = '<span class="report-status-std status-1">Ch??? ph?? duy???t</span>';
                        break;
                    case 2:
                        ret = '<span class="report-status-std status-2">Ch??? xu???t b???n</span>';
                        break;
                    case 3:
                        ret = '<span class="report-status-std status-3">???? xu???t b???n</span>';
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
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationStyle
                }
                , {
                    field: 'organization.name',
                    title: 'C?? s??? b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'K??? b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'fromDate',
                    title: 'T??? ng??y',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'toDate',
                    title: '?????n ng??y',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'status',
                    title: 'Tr???ng th??i',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }
                , {
                    field: 'htsTst',
                    title: '# x??t nghi???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'htsPos',
                    title: '# d????ng t??nh',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'txNew',
                    title: '# ??i???u tr???',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'createDate',
                    title: 'T???o b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'submissionDate',
                    title: 'G???i b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'approvalDate',
                    title: 'Duy???t b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'publishDate',
                    title: 'Xu???t b???n b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter3
                }
                , {
                    field: 'createdBy',
                    title: 'Ng?????i t???o b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'modifyDate',
                    title: 'L???n c???p nh???t cu???i',
                    sortable: false,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'modifiedBy',
                    title: 'Ng?????i s???a b??o c??o',
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
                return '<a uib-tooltip="Xem&nbsp;b??o&nbsp;c??o" class="green-dark margin-right-20" href="#" data-ng-click="$parent.editReport(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Chi ti???t</a>';
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
                        ret = '<span class="report-status-std status--1" style="white-space: nowrap">Ch??a l??m b??o c??o</span>';
                        break;
                    case 0:
                        ret = '<span class="report-status-std status-0" style="white-space: nowrap">??ang so???n b??o c??o</span>';
                        break;
                    case 1:
                        ret = '<span class="report-status-std status-1" style="white-space: nowrap">Ch??? t???nh ph?? duy???t</span>';
                        break;
                    case 2:
                        ret = '<span class="report-status-std status-2" style="white-space: nowrap">Ch??? TW xu???t b???n</span>';
                        break;
                    case 3:
                        ret = '<span class="report-status-std status-3" style="white-space: nowrap">???? ???????c xu???t b???n</span>';
                        break;
                }

                return ret;
            };

            let columns = [
                {
                    field: 'name',
                    title: 'C?? s??? b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'province',
                    title: 'T???nh - th??nh ph???',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'district',
                    title: 'Huy???n - qu???n',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'status',
                    title: 'T??nh tr???ng',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _statusFormatter
                }, {
                    field: 'submissionDate',
                    title: 'Th???i ??i???m n???p b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _datetimeFormatter
                }, {
                    field: 'approvalDate',
                    title: 'Th???i ??i???m duy???t b??o c??o',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _datetimeFormatter
                }, {
                    field: 'publishDate',
                    title: 'Th???i ??i???m xu???t b???n b??o c??o',
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