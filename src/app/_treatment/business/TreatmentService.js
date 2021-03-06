/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TreatmentService', TreatmentService);

    TreatmentService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TreatmentService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getEntries = getEntries;
        self.hasMultipleMissingEndDate = hasMultipleMissingEndDate;
        self.saveEntry = saveEntry;
        self.deleteEntry = deleteEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;
        self.getTableDefinitionAlt = getTableDefinitionAlt;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'treatment/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'treatment/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function hasMultipleMissingEndDate(filter) {
            let url = baseUrl + 'treatment/missing-end-date';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'treatment';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntry(dto, successCallback, errorCallback) {
            if (!dto || !dto.id) {
                return $q.when(null);
            }

            let url = baseUrl + 'treatment';
            return utils.resolveAlt(url, 'DELETE', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'treatment/multiple';
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
                        ret += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
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
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
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
                    title: 'C?? s??? ghi nh???n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value || !value.id) {
                            return '&mdash;';
                        }

                        return '<span class="bold">' + value.name + '</span>';
                    }
                }, {
                    field: 'regimenName',
                    title: 'T??n ph??c ?????',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<span class="bold">' + value + '</span> (b???c ' + row.regimenLine + ')';
                    }
                }, {
                    field: 'startDate',
                    title: 'Ng??y b???t ?????u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'endDate',
                    title: 'Ng??y k???t th??c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'endingReason',
                    title: 'L?? do k???t th??c',
                    switchable: false,
                    visible: true
                }
            ]
        }

        function getTableDefinitionAlt() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';

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
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
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
                    field: 'regimenName',
                    title: 'T??n ph??c ?????',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<span class="bold">' + value + '</span> (b???c ' + row.regimenLine + ')';
                    }
                }, {
                    field: 'startDate',
                    title: 'Ng??y b???t ?????u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'endDate',
                    title: 'Ng??y k???t th??c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'endingReason',
                    title: 'L?? do k???t th??c',
                    switchable: false,
                    visible: true
                }
            ]
        }
    }

})();