/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.UID').service('UidService', UidService);

    UidService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function UidService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="green-dark margin-right-20" href="#" data-ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Edit</a>';
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            //
            // let _activeFormatter = function (value, row, index) {
            //     return (value == 0) ? '<span class="text-muted">Không sử dụng</span>' : (value == 1) ? '<span class="text-success">Đang sử dụng</span>' : '';
            // };

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
            ]
        }
    }

})();