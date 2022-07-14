(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('RegimenService', RegimenService);

    RegimenService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function RegimenService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getAllRegimens = getAllRegimens;
        self.getRegimens = getRegimens;
        self.getRegimen = getRegimen;
        self.saveRegimen = saveRegimen;
        self.deleteRegimens = deleteRegimens;

        function getAllRegimens(filter) {
            let url = baseUrl + 'regimen/all';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getRegimens(filter) {
            let url = baseUrl + 'regimen/list';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getRegimen(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'regimen/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveRegimen(regimen, successCallback, errorCallback) {
            let url = baseUrl + 'regimen';

            regimen.active = regimen.active == null ? 0 : regimen.active;

            return utils.resolveAlt(url, 'POST', null, regimen, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteRegimens(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'regimen';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border" href="#" data-ng-click="$parent.editRegimen(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Chỉnh sửa</a>';
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
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
                    field: 'shortName',
                    title: 'Tên rút gọn',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'Tên đầy đủ',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'description',
                    title: 'Mô tả',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'disease.value',
                    title: 'Dùng cho bệnh',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();