/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TBProphylaxisService', TBProphylaxisService);

    TBProphylaxisService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TBProphylaxisService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getLatestEntry = getLatestEntry;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getLatestEntry(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis/latest/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'tb_prophylaxis';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis';
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
                        ret = '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editProEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteProEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
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

            let regimens = [
                {id: '_9H', name: 'Ph??c ????? 9H'},
                {id: '_3HP', name: 'Ph??c ????? 3HP'},
                {id: '_6H', name: 'Ph??c ????? 6H'},
                {id: '_3RH', name: 'Ph??c ????? 3RH'},
                {id: '_4R', name: 'Ph??c ????? 4R'},
                {id: '_1HP', name: 'Ph??c ????? 1HP'},
                {id: 'OTHER', name: 'Ph??c ????? kh??c'}
            ];

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
                    title: 'C?? s??? ghi nh???n th??ng tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.name) {
                            return '<span class="font-weight-600">' + value.name + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'regimen',
                    title: 'Ph??c ????? thu???c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let result = regimens.findIndex(e => e.id === value);
                        if (result >= 0) {
                            return regimens[result].name;
                        } else {
                            return '&mdash;';
                        }
                    }
                },
                {
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
                    field: 'result',
                    title: 'T??nh tr???ng ??i???u tr???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        switch (value) {
                            case null:
                                return '&mdash;';
                            case 1:
                                return 'B??? tr???';
                            case 2:
                                return 'Ch??a ho??n th??nh';
                            case 3:
                                return '???? ho??n th??nh';
                        }
                    }
                }, {
                    field: 'note',
                    title: 'Ghi ch??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '&mdash;';
                        } else {
                            return value;
                        }
                    }
                }
            ]
        }
    }

})();