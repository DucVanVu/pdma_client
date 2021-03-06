/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').service('PnsEditContactService', PnsEditContactService);

    PnsEditContactService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PnsEditContactService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;
        self.getDictionary=getDictionary;
        self.getEntry=getEntry;
        self.getPNSEntry=getPNSEntry;
        self.getListStaff=getListStaff;
        self.getAdminUnit=getAdminUnit;
        self.saveEntry=saveEntry;
        self.getTableDefinition = getTableDefinition;
        self.getListHTSCase= getListHTSCase;
        self.getListPnsWriteAble=getListPnsWriteAble;
        self.getTableDefinitionc8HTSCase=getTableDefinitionc8HTSCase;

        function getListPnsWriteAble(){
            let url = baseUrl + 'pnscase/get_list_pns_write_able';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getListHTSCase(filter) {
            let url = baseUrl + 'htscase/list';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

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
            let url = baseUrl + 'pnscase_contact/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function getPNSEntry(id){
            if (!id) {
                return $q.when(null);
            }
            let url = baseUrl + 'pnscase/' + id;
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
            let url = baseUrl + 'pnscase_contact/';
            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        
//        function checkCode(checkCodeDto) {
//            let url = baseUrl + 'pnscase/checkCode';
//
//            return utils.resolveAlt(url, 'POST', null, checkCodeDto, {
//                'Content-Type': 'application/json; charset=utf-8'
//            }, angular.noop, angular.noop);
//        }
//        function updateC24(dto){
//            let url = baseUrl + 'pnscase/updateC24';
//            return utils.resolveAlt(url, 'POST', null, dto, {
//                'Content-Type': 'application/json; charset=utf-8'
//            }, angular.noop, angular.noop);
//        }
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
            //     return (value == 0) ? '<span class="text-muted">Kh??ng s??? d???ng</span>' : (value == 1) ? '<span class="text-success">??ang s??? d???ng</span>' : '';
            // };

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
            ]
        }

        function getTableDefinitionc8HTSCase() {
            var _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: { 'white-space': 'nowrap' }
                };
            };
            var _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };
            let _nameFormatter = function (value, row, index) {
                if (value) {             
                        if(value.fullName){
                            return value.fullName;
                        }
                        return ""; 
                }
                return "";
            };
            let _nameOrgFormatter = function (value, row, index) {
                if (value) {             
                        if(value.fullName){
                            return value.fullName;
                        }
                        return ""; 
                }
                return "";
            };
            return [
                {
                    field: 'state',
                    checkbox: true,
                } , {
                    field: 'c6',
                    title: 'M?? s??? KH TVXN HIV',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                }, {
                    field: 'c4',
                    title: 'Ng??y t?? v???n tr?????c XN HIV',
                    sortable: true,
                    switchable: false,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap,
                }, {
                    field: 'c8',
                    title: 'N??m sinh',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                }, {
                    field: 'c2',
                    title: 'T??n c?? s???',
                    sortable: true,
                    switchable: false,
                    formatter:_nameOrgFormatter,
                    cellStyle: _cellNowrap,
                }, {
                    field: 'c3',
                    title: 'H??? t??n t?? v???n vi??n',
                    sortable: true,
                    switchable: false,
                    formatter:_nameFormatter,
                    cellStyle: _cellNowrap,
                }
            ];
        }
    }

})();