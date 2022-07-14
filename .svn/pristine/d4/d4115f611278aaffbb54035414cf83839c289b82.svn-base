/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('DocumentTypeService', DocumentTypeService);

    DocumentTypeService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function DocumentTypeService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getAllDocumentTypes = getAllDocumentTypes;
        self.getDocumentTypes = getDocumentTypes;
        self.getDocumentType = getDocumentType;
        self.saveDocumentType = saveDocumentType;
        self.deleteDocumentTypes = deleteDocumentTypes;

        function getAllDocumentTypes() {
            let url = baseUrl + 'document_type/all';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getDocumentTypes(pageIndex, pageSize) {

            let url = baseUrl + 'document_type/list';
            url += '?page=' + ((pageIndex >= 0) ? pageIndex : 0);
            url += '&size=' + ((pageSize > 0) ? pageSize : 25);

            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getDocumentType(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'document_type/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveDocumentType(docType, successCallback, errorCallback) {
            let url = baseUrl + 'document_type';

            docType.active = docType.active == null ? 0 : docType.active;

            return utils.resolveAlt(url, 'POST', null, docType, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteDocumentTypes(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'document_type';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editDocumentType(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Chỉnh sửa</a>';
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
                    field: 'name',
                    title: 'Loại tài liệu',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'active',
                    title: 'Trạng thái',
                    sortable: true,
                    switchable: false,
                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();