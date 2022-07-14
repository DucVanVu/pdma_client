/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TBProphylaxisDispense2Service', TBProphylaxisDispense2Service);

    TBProphylaxisDispense2Service.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TBProphylaxisDispense2Service($http, $q, settings, utils) {
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

            let url = baseUrl + 'tb_prophylaxis2dispense/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getLatestEntry(roundId) {
            if (!roundId) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2dispense/latest/' + roundId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis2dispense/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis2dispense/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'tb_prophylaxis2dispense';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2dispense';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBProphylaxisDispense2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBProphylaxisDispense2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';

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
			let _cellNowra2 = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };
			let _orderFormatter = function (value, row, index) {
                return index + 1;
            };
			let _nameFormatter = function (value, row, index) {
				if(value!=null){
					return value.name;
				}else
					return '';
            };
            return [
                {
                    field: '',
                    title: 'STT',
                    switchable: false,
                    visible: true,                    
                    cellStyle: _cellNowra2,
					formatter: _orderFormatter
                }, {
                    field: 'recordDate',
                    title: 'Ngày',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },
				{
                    field: 'dispensedDoses',
                    title: 'Số liều thuốc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    //formatter: _nameFormatter
                },
				{
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }
            ]
        }
    }

})();