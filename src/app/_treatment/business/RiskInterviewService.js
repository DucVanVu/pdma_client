/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('RiskInterviewService', RiskInterviewService);

    RiskInterviewService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function RiskInterviewService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'risk_interview/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'risk_interview/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'risk_interview';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'risk_interview';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(orgsWritable, isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let org = row.organization;
                if (!org || !org.id || !orgsWritable || orgsWritable.length <= 0) {
                    return '&mdash;';
                }

                let ret = '';
                if (!isSiteManager) {
                    ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                    ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                } else {
                    if (utils.indexOf(org, orgsWritable) >= 0) {
                        ret = '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                    } else {
                        ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                        ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                    }
                }

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

            let _risksFormatter = function (value, row, index) {
                if (!value || value.length <= 0) {
                    return '';
                }

                if (value.length > 1) {
                    let ret = '';
                    angular.forEach(value, function (s) {
                        ret += s.value;
                        ret += ' / ';
                    });

                    if (row.otherRiskGroupText) {
                        ret += row.otherRiskGroupText;
                    }

                    ret = ret.endsWith(' / ') ? ret.substr(0, ret.length - 3) : ret;
                    return ret;
                } else {
                    return value[0].value;
                }
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'organization',
                    title: 'C?? s??? th???c hi???n ????nh gi??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.name) {
                            return value.name;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'risks',
                    title: 'Nh??m nguy c??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _risksFormatter
                }, {
                    field: 'interviewDate',
                    title: 'Ng??y ph???ng v???n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'createDate',
                    title: 'Ng??y gi??? nh???p li???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter_2
                }
            ]
        }
    }

})();