/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SELF_TEST').service('SelfTestService', SelfTestService);

    SelfTestService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function SelfTestService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getSpecimensTableDef = getSpecimensTableDef;
        self.getEntries = getEntries;
        self.getEntry = getEntry;
        self.getSpecimen = getSpecimen;
        self.export2Excel = export2Excel;
        self.saveEntry = saveEntry;
        self.saveSpecimen = saveSpecimen;
        self.deleteEntries = deleteEntries;
        self.deleteSpecimens = deleteSpecimens;
        self.getListWriteAbleSelfTest = getListWriteAbleSelfTest;
        self.getAllOrganizations = getAllOrganizations;
        self.getAdminUnit = getAdminUnit;

        function getListWriteAbleSelfTest() {
            let url = baseUrl + 'self_test/get_list_self_test_write_able';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'self_test/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getSpecimen(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'self_test/specimen/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter, successCallback, errorCallback) {
            let url = baseUrl + 'self_test/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
        
        function getAllOrganizations(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAdminUnit(){
            let url = baseUrl + 'admin_unit/provinceByUser';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        /**
         * Export self test data 2 excel
         * @returns {*}
         */
        function export2Excel(filter) {
            let url = baseUrl + 'self_test/export';

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filter,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'self_test';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function saveSpecimen(entry, successCallback, errorCallback) {
            let url = baseUrl + 'self_test/specimen';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'self_test';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteSpecimens(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'self_test/specimen';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let s = '';

                if (!isSiteManager) {
                    s += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#/prevention/st_edit/' + row.id + '"><i class="icon-frame margin-right-5"></i>Xem chi ti???t</a>';
                } else {
                    s += '<a class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto" href="#/prevention/st_edit/' + row.id + '"><i class="icon-pencil"></i></a>';
                    s += '<button class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto" data-ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="fa fa-trash"></i></button>';
                }

                return s;
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _activeFormatter = function (value, row, index) {
                return (value == 0) ? '<span class="text-muted">Kh??ng s??? d???ng</span>' : (value == 1) ? '<span class="text-green">??ang s??? d???ng</span>' : '';
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }, {
                    field: 'organization.name',
                    title: 'T??n ????n v???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return value;
                    }
                }, {
                    field: 'dispensingStaff',
                    title: 'Nh??n vi??n c???p sinh ph???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value || !value.fullName) {
                            return '&mdash;';
                        }

                        return value.fullName;
                    }
                }, {
                    field: 'dispensingDate',
                    title: 'Ng??y c???p sinh ph???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'specimens',
                    title: 'S??? sinh ph???m c???p',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let arr = [];
                        angular.forEach(value, function (obj) {
                            if (arr.length > 0) {
                                let indx = _.findIndex(arr, {'code': obj.code});
                                if (indx >= 0) {
                                    arr[indx].count++;
                                } else {
                                    arr.push({code: obj.code, name: obj.name, count: 1});
                                }
                            } else {
                                arr.push({code: obj.code, name: obj.name, count: 1});
                            }
                        });

                        let s = '';
                        angular.forEach(arr, function (obj) {
                            s += obj.name + ' ( x' + obj.count + ' )';
                            s += '; ';
                        });

                        if (s.endsWith('; ')) {
                            s = s.substring(0, s.length - 2);
                        }

                        return s;
                    }
                }
                , {
                    field: 'person.fullname',
                    title: 'T??n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'person.mobilePhone',
                    title: '??i???n tho???i kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }, {
                    field: 'selfTestSourceDes',
                    title: 'Ngu???n t??? x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }, {
                    field: 'person.locations',
                    title: '?????a ch??? kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        let curAddress = {};

                        angular.forEach(value, function (loc) {
                            if (loc.addressType === 'CURRENT_ADDRESS') {
                                angular.copy(loc, curAddress);
                            }
                        });

                        let address = '';
                        if (curAddress && curAddress.id) {
                            if (curAddress.province) {
                                address += curAddress.province.name;
                                address += ', ';
                            }

                            if (curAddress.district) {
                                address += curAddress.district.name;
                                address += ', ';
                            }

                            if (curAddress.commune) {
                                address += curAddress.commune.name;
                                address += ', ';
                            }

                            if (curAddress.streetAddress) {
                                address += curAddress.streetAddress;
                            }

                            address = address.trim();
                            address = address.endsWith(',') ? address.substr(0, address.length - 1) : address;
                        }

                        let addressString = '<span class="font-weight-500">';
                        addressString += (address.length > 0 ? address : '&mdash;');
                        addressString += '</span>';

                        return addressString;
                    }
                }
            ]
        }

        function getSpecimensTableDef(isSiteManager) {
            let _tableOperation = function (value, row, index) {
                let s = '';

                if (!isSiteManager) {
                    s = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>Ch???nh s???a</button>';
                    s += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                } else {
                    s += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editSpecimenEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Ch???nh s???a</a>';
                    s += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" data-ng-click="$parent.deleteSpecimenEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                }

                return s;
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
                }, {
                    field: 'name',
                    title: 'Sinh ph???m x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return value;
                    }
                }, {
                    field: 'support',
                    title: 'H??nh th???c x??t nghi???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let supportTypes = [
                            {code: 'W_SUPPORT', name: 'C?? h??? tr??? tr???c ti???p'},
                            {code: 'WO_SUPPORT', name: 'Kh??ng c?? h??? tr???'}
                        ];

                        let indx = _.findIndex(supportTypes, {'code': value});

                        if (indx >= 0) {
                            return supportTypes[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'clientYob',
                    title: 'N??m sinh',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }, {
                    field: 'clientGender',
                    title: 'Gi???i t??nh',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let genderList = [
                            {code: 'MALE', name: 'Nam'},
                            {code: 'FEMALE', name: 'N???'}
                        ];

                        let indx = _.findIndex(genderList, {'code': value});

                        if (indx >= 0) {
                            return genderList[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'client',
                    title: 'Ng?????i s??? d???ng sinh ph???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let clients = [
                            {code: 'SELF', name: 'B???n th??n'},
                            {code: 'SEXUAL_PARTNER', name: 'B???n t??nh'},
                            {code: 'IDU_PARTNER', name: 'B???n ch??ch chung'},
                            {code: 'OTHER', name: 'B???n kh??c'}
                        ];

                        let indx = _.findIndex(clients, {'code': value});

                        if (indx >= 0) {
                            return clients[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'clientRiskGroup',
                    title: 'Nh??m nguy c??',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let risks = [
                            {code: 'PWID', name: 'Ti??m ch??ch ma tu??'},
                            {code: 'MSM', name: 'Nam quan h??? ?????ng gi???i (MSM)'},
                            {code: 'TG', name: 'Chuy???n gi???i'},
                            {code: 'FSW', name: 'N??? b??n d??m'},
                            {code: 'PLHIV_PARTNER', name: 'BT/BC c???a ng?????i c?? HIV'},
                            {code: 'OTHER', name: 'Kh??c'}
                        ];

                        let indx = _.findIndex(risks, {'code': value});

                        if (indx >= 0) {
                            return risks[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'screenResult',
                    title: 'K???t qu??? t??? x??t nghi???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let screenResults = [
                            {code: 'NONE_REACTIVE', name: 'Kh??ng ph???n ???ng'},
                            {code: 'REACTIVE', name: 'C?? ph???n ???ng'},
                            {code: 'OTHER', name: 'T??? ch???i tr??? l???i/kh??ng bi???t'}
                        ];

                        let indx = _.findIndex(screenResults, {'code': value});

                        if (indx >= 0) {
                            return screenResults[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'confirmResult',
                    title: 'K???t qu??? kh???ng ?????nh HIV',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let confirmResults = [
                            {code: 'POSITIVE', name: 'D????ng t??nh'},
                            {code: 'NEGATIVE', name: '??m t??nh'},
                            {code: 'OTHER', name: 'T??? ch???i tr??? l???i/kh??ng bi???t'}
                        ];

                        let indx = _.findIndex(confirmResults, {'code': value});

                        if (indx >= 0) {
                            return confirmResults[indx].name;
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'dispensingDate',
                    title: 'Ng??y c???p sinh ph???m',
                    sortable: false,
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },
            ]
        }
    }
})();