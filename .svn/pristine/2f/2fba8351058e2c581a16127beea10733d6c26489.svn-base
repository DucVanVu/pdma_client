/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Announcement').service('IndexService', IndexService);

    IndexService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function IndexService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getAllEntries = getAllEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'announcement/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {

            let url = baseUrl + 'announcement/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'announcement';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'announcement';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(shouldDisplayCheckbox) {

            let _tableOperation = function (value, row, index) {
                let url = '';

                url += '<a class="green-dark margin-right-20" href="#" ng-if="$parent.isNationalManager($parent.currentUser) || $parent.isDonor($parent.currentUser)" data-ng-click="$parent.$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Cập nhật</a>';
                url += '<a class="green-dark margin-right-20" href="#" ng-if="$parent.isAdministrator($parent.currentUser) || $parent.isProvincialManager($parent.currentUser) || $parent.isDistrictManager($parent.currentUser) || $parent.isSiteManager($parent.currentUser)" data-ng-click="$parent.$parent.viewEntry(' + "'" + row.id + "'" + ')"><i class="fa fa-th-large icon-muted margin-right-5"></i>Xem chi tiết</a>';

                return url;
            };

            let _tableOpStyle = function (value, row, index, field) {
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

            let _activeFormatter = function (value, row, index) {
                return (value == 0) ? '<span class="text-muted bold">Đang soạn thảo</span>' : (value == 1) ? '<span class="text-success bold">Đã xuất bản</span>' : '';
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '-';
                }

                return moment(value).format('DD/MM/YYYY hh:mm A');
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
                    cellStyle: _tableOpStyle
                }
                , {
                    field: 'title',
                    title: 'Tiêu đề',
                    switchable: false,
                    visible: true
                }
                , {
                    field: 'status',
                    title: 'Trạng thái',
                    switchable: false,
                    visible: true,
                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'publishDate',
                    title: 'Ngày xuất bản',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
            ];

            if (!shouldDisplayCheckbox) {
                columns.shift(); // remove the state column
            }

            return columns;
        }
    }

})();