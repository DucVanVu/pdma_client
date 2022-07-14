(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('ServiceService', ServiceService);

    ServiceService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function ServiceService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getAllServices = getAllServices;
        self.getServices = getServices;
        self.getService = getService;
        self.codeExists = codeExists;
        self.saveService = saveService;
        self.deleteServices = deleteServices;

        function getAllServices() {
            let url = baseUrl + 'service/all';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getServices(pageIndex, pageSize) {

            let url = baseUrl + 'service/list';

            url = url + '?page=' + (pageIndex ? pageIndex : 0);
            url = url + '&size=' + (pageSize ? pageSize : 25);

            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getService(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'service/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function codeExists(service) {

            if (!service) {
                return $q.when(false);
            }

            let url = baseUrl + 'service/exists';

            return utils.resolveAlt(url, 'POST', null, service, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveService(service, successCallback, errorCallback) {
            let url = baseUrl + 'service';

            return utils.resolveAlt(url, 'POST', null, service, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteServices(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'service';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editService(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Chỉnh sửa</a>';
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
                    title: 'Mã dịch vụ',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'Tên dịch vụ',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'description',
                    title: 'Mô tả',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();