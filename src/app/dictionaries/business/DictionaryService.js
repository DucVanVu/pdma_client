/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('DictionaryService', DictionaryService);

    DictionaryService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function DictionaryService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntryTypes = getEntryTypes;
        self.getTableDefinition = getTableDefinition;
        self.getEntriesPageable = getEntriesPageable;
        self.getMultipleEntries = getMultipleEntries;
        self.getAllEntries = getAllEntries;
        self.getEntry = getEntry;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.sortEntries = sortEntries;
        self.saveEntriesSortOrder = saveEntriesSortOrder;

        function sortEntries(arr) {
            if (arr === null || arr.length <= 0) {
                return [];
            } else if (arr.length <= 1) {
                return arr;
            } else {
                arr.sort((a, b) => {
                    return (a.order < b.order) ? -1 : (a.order > b.order) ? 1 : 0;
                });
            }
        }

        function getEntryTypes() {
            let url = baseUrl + 'dictionary/types';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getMultipleEntries(filter) {
            let url = baseUrl + 'dictionary/multiple';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntriesPageable(filter) {
            let url = baseUrl + 'dictionary/list';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllEntries(types) {
            let url = baseUrl + 'dictionary/all';

            if (!types || types.size <= 0) {
                return $q.when([]);
            }

            return utils.resolveAlt(url, 'POST', null, types, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'dictionary/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'dictionary';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function saveEntriesSortOrder(entries, successCallback, errorCallback) {
            let url = baseUrl + 'dictionary/reorder';
            return utils.resolveAlt(url, 'PUT', null, entries, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'dictionary';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Cập nhật</a>';
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _activeFormatter = function (value, row, index) {
                return (value == 0) ? '<span class="text-muted">Không sử dụng</span>' : (value == 1) ? '<span class="text-green">Đang sử dụng</span>' : '';
            };

            return [
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
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'id',
                    title: 'ID',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'type',
                    title: 'Loại dữ liệu',
                    sortable: true,
                    switchable: false,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'code',
                    title: 'Mã đầu mục',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'value',
                    title: 'Nội dung',
                    sortable: true,
                    switchable: true
                }
                , {
                    field: 'valueEn',
                    title: 'Nội dung (tiếng Anh)',
                    sortable: true,
                    switchable: true
                }
                , {
                    field: 'description',
                    title: 'Mô tả chi tiết',
                    sortable: true,
                    switchable: true,
                    visible: false
                }, {
                    field: 'order',
                    title: 'Thứ tự sắp xếp',
                    sortable: true,
                    switchable: true,
                    visible: false
                }
                , {
                    field: 'active',
                    title: 'Trạng thái',
                    sortable: true,
                    switchable: true,
                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();