(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('HIVConfirmLabService', HIVConfirmLabService);

    HIVConfirmLabService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function HIVConfirmLabService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getLabs = getLabs;
        self.getAllLabs = getAllLabs;
        self.getLab = getLab;
        self.saveLab = saveLab;
        self.deleteLabs = deleteLabs;

        function getLabs(filter) {

            let url = baseUrl + 'confirm_lab/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllLabs(filter) {

            let url = baseUrl + 'confirm_lab/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getLab(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'confirm_lab/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveLab(regimen, successCallback, errorCallback) {
            let url = baseUrl + 'confirm_lab';

            regimen.active = regimen.active == null ? 0 : regimen.active;

            return utils.resolveAlt(url, 'POST', null, regimen, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteLabs(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'confirm_lab';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editLab(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Ch???nh s???a</a>';
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
                    title: 'Thao t??c',
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
                    title: 'T??n ph??ng x??t nghi???m',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address.province.name',
                    title: 'T???nh/th??nh ph???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address',
                    title: '?????a ch??? chi ti???t',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();