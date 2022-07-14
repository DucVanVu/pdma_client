/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.HTS').service('HtsEditService', HtsEditService);

    HtsEditService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function HtsEditService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;
        self.getDictionary=getDictionary;
        self.getEntry=getEntry;
        self.getListHtsWriteAble=getListHtsWriteAble;
        self.getListStaff=getListStaff;
        self.getAdminUnit=getAdminUnit;
        self.saveEntry=saveEntry;
        self.getTableDefinition = getTableDefinition;
        self.checkCode=checkCode;
        self.updateC24=updateC24;
        function getDictionary (type){
            if (!type) {
                return $q.when(null);
            }
            let filter={
                type:type
            }
            let url = baseUrl + 'dictionary/all';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getEntry(id){
            if (!id) {
                return $q.when(null);
            }
            let url = baseUrl + 'htscase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function getListHtsWriteAble(){
            let url = baseUrl + 'htscase/get_list_hts_write_able';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function getListStaff(org) {
            let url = baseUrl + 'staff/list';
            return utils.resolveAlt(url, 'POST', null, org, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getAdminUnit(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function saveEntry(entry){
            let url = baseUrl + 'htscase/';
            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function checkCode(checkCodeDto) {
            let url = baseUrl + 'htscase/checkCode';

            return utils.resolveAlt(url, 'POST', null, checkCodeDto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function updateC24(dto){
            let url = baseUrl + 'htscase/updateC24';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
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