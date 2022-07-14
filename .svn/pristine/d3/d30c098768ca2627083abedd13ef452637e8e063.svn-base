/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('RecencyService', RecencyService);

    RecencyService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function RecencyService($http, $q, settings, utils) {
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

            let url = baseUrl + 'recency/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getLatestEntry(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'recency/latest/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'recency/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'recency/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'recency';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'recency';
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
                    return '&mdash;';
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
                    field: 'screenSampleDate',
                    title: 'Ngày lấy mẫu sàng lọc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'screenTestDate',
                    title: 'Ngày XN sàng lọc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'screenResult',
                    title: 'Kết quả sàng lọc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '&mdash;';
                        } else {
                            let ret = '&mdash;';
                            switch (value) {
                                case 'RECENT':
                                    ret = 'Mới nhiễm';
                                    break;
                                case 'OLD':
                                    ret = 'Nhiễm cũ';
                                    break;
                                case 'NEGATIVE':
                                    ret = 'Âm tính';
                                    break;
                                case 'INDETERMINATE':
                                    ret = 'Không xác định';
                                    break;
                            }

                            return '<span class="bold ' + (value == 'RECENT' ? 'text-red' : 'text-green') + '">' + ret + '</span>';
                        }
                    }
                }, {
                    field: 'vlTestDate',
                    title: 'Ngày XN TLVR',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'vlResult',
                    title: 'Kết quả XN TLVR',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }, {
                    field: 'confirmResult',
                    title: 'Kết quả khẳng định',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '&mdash;';
                        } else {
                            let ret = '&mdash;';
                            switch (value) {
                                case 'RECENT':
                                    ret = 'Mới nhiễm';
                                    break;
                                case 'OLD':
                                    ret = 'Nhiễm cũ';
                                    break;
                                case 'NEGATIVE':
                                    ret = 'Âm tính';
                                    break;
                                case 'INDETERMINATE':
                                    ret = 'Không xác định';
                                    break;
                            }

                            return '<span class="bold ' + (value == 'RECENT' ? 'text-red' : 'text-green') + '">' + ret + '</span>';
                        }
                    }
                }
            ]
        }
    }

})();