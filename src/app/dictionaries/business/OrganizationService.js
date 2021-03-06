/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('OrganizationService', OrganizationService);

    OrganizationService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function OrganizationService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getTableDefinition2 = getTableDefinition2;
        self.getServiceTableDef = getServiceTableDef;
        self.getOrganizations = getOrganizations;
        self.getAllOrganizations = getAllOrganizations;
        self.getOrganization = getOrganization;
        self.getOrgByCode = getOrgByCode;
        self.saveOrganization = saveOrganization;
        self.deleteOrganizations = deleteOrganizations;
        self.getAllProvince = getAllProvince;

        function getAllProvince(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getOrganizations(filter) {

            let url = baseUrl + 'organization/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllOrganizations(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getOrganization(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'organization/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }


        function getOrgByCode(code) {
            if (!code) {
                return $q.when(null);
            }

            let url = baseUrl + 'organization/code/' + code;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveOrganization(organization, successCallback, errorCallback) {
            let url = baseUrl + 'organization';
            let method = 'POST';

            organization.active = organization.active == null ? 0 : organization.active;

            if (organization.id) {
                method = 'PUT';
            }

            return utils.resolveAlt(url, method, null, organization, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteOrganizations(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'organization';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getServiceTableDef() {
            let _tableOperation = function (value, row, index) {
                let url = '<a class="green-dark margin-right-20" href="#" data-ng-click="$parent.editService(' + "'" + row.service.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                url += '<a class="green-dark" href="#" data-ng-click="$parent.removeService(' + "'" + row.service.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'service.name',
                    title: 'T??n d???ch v???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'startDate',
                    title: 'Ng??y b???t ?????u',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'endDate',
                    title: 'Ng??y k???t th??c',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
            ]
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editOrganization(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Ch???nh s???a</a>';
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _activeFormatter = function (value, row, index) {
                return (value == 0) ? '<span class="text-muted">Kh??ng ho???t ?????ng</span>' : (value == 1) ? '<span class="text-green">Ho???t ?????ng</span>' : '';
            };

            let _trueFalseFormatter = function (value, row, index) {
                if (!value) {
                    return '<i class="fa fa-close icon-muted"></i>';
                }

                return '<span class="text-green"><i class="fa fa-check"></i></span>';
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
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'T??n c?? s???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'code',
                    title: 'M?? c?? s???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }
                , {
                    field: 'address.province.name',
                    title: 'T???nh/th??nh ph???',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address.district.name',
                    title: 'Qu???n/huy???n',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'pepfarSite',
                    title: 'PEPFAR Site?',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _trueFalseFormatter
                }
                , {
                    field: 'opcSite',
                    title: 'OPC?',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _trueFalseFormatter
                }
                , {
                    field: 'htsSite',
                    title: 'HTC?',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _trueFalseFormatter
                }
                , {
                    field: 'pnsSite',
                    title: 'PNS?',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _trueFalseFormatter
                }
                , {
                    field: 'active',
                    title: 'T??nh tr???ng',
                    sortable: true,
                    switchable: false,
                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address.streetAddress',
                    title: '?????a ch??? chi ti???t',
                    sortable: true,
                    switchable: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'description',
                    title: 'M?? t???',
                    sortable: false,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'canNotBeCompleted',
                    title: '??p d???ng kh??ng ho??n th??nh phi???u TVXN(HTS)',
                    sortable: true,
                    switchable: true,
                    formatter: _trueFalseFormatter,
                    cellStyle: _cellNowrap
                }
            ]
        }

        function getTableDefinition2() {
            let _tableOperation = function (value, row, index) {
                return '<a class="green-dark margin-right-20" href="#" data-ng-click="$parent.selectOrganization(' + "'" + row.id + "'" + ')"><i class="icon-check margin-right-5"></i>Ch???n</a>';
            };

            let _cellTableOp = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '60px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellTableOp
                }
                , {
                    field: 'name',
                    title: 'T??n c?? s???',
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address.province.name',
                    title: 'T???nh/th??nh ph???',
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'address.district.name',
                    title: 'Qu???n/huy???n',
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();