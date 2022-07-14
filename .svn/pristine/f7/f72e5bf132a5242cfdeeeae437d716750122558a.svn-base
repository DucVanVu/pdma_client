/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('MMTService', MMTService);

    MMTService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function MMTService($http, $q, settings, utils) {
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

            let url = baseUrl + 'mmt/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'mmt/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'mmt';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'mmt';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

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

            let _dateFormatter_2 = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                let date = new Date(value.year, value.monthValue - 1, value.dayOfMonth, value.hour, value.minute, value.second, value.nano);

                if (row.modifyDate) {
                    let d = row.modifyDate;
                    date = new Date(d.year, d.monthValue - 1, d.dayOfMonth, d.hour, d.minute, d.second, d.nano);
                }

                return moment(date).format('DD/MM/YYYY hh:mm:ss A');
            };

            return [
                {
                    field: 'organization',
                    title: 'Cơ sở ghi nhận thông tin',
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
                    field: 'facilityName',
                    title: 'Cơ sở điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return 'Không có thông tin cơ sở điều trị';
                        } else {
                            return '<b>' + value + '</b>';
                        }
                    }
                } , {
                    field: 'startDate',
                    title: 'Ngày bắt đầu',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'endDate',
                    title: 'Ngày kết thúc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'note',
                    title: 'Ghi chú',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }
            ]
        }
    }

})();