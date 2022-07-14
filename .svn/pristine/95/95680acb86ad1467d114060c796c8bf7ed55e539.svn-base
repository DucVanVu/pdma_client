/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Document').service('DocumentService', DocumentService);

    DocumentService.$inject = [
        '$http',
        '$q',
        '$filter',
        'settings',
        'Utilities'
    ];

    function DocumentService($http, $q, $filter, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getDocuments = getDocuments;
        self.getDocument = getDocument;
        self.saveDocument = saveDocument;
        self.deleteDocuments = deleteDocuments;
        self.downloadDocument = downloadDocument;

        function getDocuments(filter) {
            let url = baseUrl + 'document/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getDocument(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'document/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveDocument(document, successCallback, failureCallback) {
            let url = baseUrl + 'document';

            return utils.resolveAlt(url, 'POST', null, document, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, failureCallback);
        }

        function deleteDocuments(dtos, successCallback, failureCallback) {
            let url = baseUrl + 'document';

            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, failureCallback);
        }

        function downloadDocument(id) {
            if (id == null) {
                id = 0;
            }

            let url = baseUrl + 'document/download/' + id;

            return $http({
                method: 'GET',
                url: url,
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function getTableDefinition(shouldDisplayCheckbox) {

            let _tableOperation = function (value, row, index) {
                let url = '';

                url += '<a class="green-dark margin-right-20" href="#" ng-if="$parent.isNationalManager($parent.currentUser) || $parent.isDonor($parent.currentUser)" data-ng-click="$parent.$parent.editDocument(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>Chỉnh sửa</a>';
                url += '<a class="green-dark margin-right-5" href="#" data-ng-click="$parent.downloadDocument(' + "'" + row.id + "'" + ')"><i class="fa fa-download icon-muted margin-right-5"></i>Tải về</a>';

                return url;
            };

            let _tableOpStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': shouldDisplayCheckbox ? '150px' : '80px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _fileSizeFormatter = function (value, row, index) {
                if (!value) {
                    return '-';
                }

                return $filter('fileSize')(value, 2);
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
                    title: 'Tiêu đề tài liệu',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'docType.name',
                    title: 'Loại tài liệu',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'contentLength',
                    title: 'Kích thước tệp',
                    sortable: true,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _fileSizeFormatter
                }
            ];

            if (!shouldDisplayCheckbox) {
                columns.shift();
            }

            return columns;
        }
    }

})();