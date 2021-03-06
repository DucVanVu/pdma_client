(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('AdminUnitEditTableService', AdminUnitEditTableService);

    AdminUnitEditTableService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function AdminUnitEditTableService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getAdminUnits = getAdminUnits;
        self.getAllRoles = getAllRoles;
        self.getAllAdminUnits = getAllAdminUnits;
        self.getAdminUnit = getAdminUnit;
        self.getAdminUnitAlt = getAdminUnitAlt;
        self.saveOrUpdate = saveOrUpdate;
        self.deleteAdminUnits = deleteAdminUnits;

        function getAdminUnits(filter) {

            let url = baseUrl + 'admin_unit_edit_table/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllAdminUnits(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllRoles() {
            let url = baseUrl + 'role/list';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        
        function getAdminUnit(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'admin_unit/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAdminUnitAlt(code) {
            if (!code) {
                return $q.when(null);
            }

            let url = baseUrl + 'admin_unit/code/' + code;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveOrUpdate(adminUnitEditTable, successCallback, errorCallback) {
            let url = baseUrl + 'admin_unit_edit_table/save';

            return utils.resolveAlt(url, 'POST', null, adminUnitEditTable, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteAdminUnits(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'admin_unit';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editAdminUnit(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Ch???nh s???a</a>';
            };

            let _tableOpStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '100px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _activeFormatter = function (value, row, index) {
                return (value != 0) ? '<span class="text-muted">Kh??ng ho???t ?????ng</span>' : (value == 0) ? '<span class="text-green">Ho???t ?????ng</span>' : '';
            };

            let _nameFormatter = function (value, row, index) {
                if (row && row.id) {
                    return '<a href="#" class="font-weight-600" ng-click="$parent.selectAdminUnit(' + "'" + row.id + "'" + ')">' + value + '</a>';
                } else {
                    return '-';
                }
            };

            return [
                {
                    field: 'state',
                    checkbox: true
                }
                , {
                    field: '',
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOpStyle
                }
                , {
                    field: 'name',
                    title: 'T??n ????n v???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: '',
                    title: 'Role',
                    sortable: true,
                    switchable: false,
                    // formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: '',
                    title: 'C?? th??? ch???nh s???a',
                    sortable: true,
                    switchable: false,
                    // formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: '',
                    title: 'Qu??',
                    sortable: true,
                    switchable: false,
                    // formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: '',
                    title: 'N??m',
                    sortable: true,
                    switchable: false,
                    // formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();