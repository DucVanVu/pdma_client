/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('HepatitisService', HepatitisService);

    HepatitisService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function HepatitisService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'hepatitis/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'hepatitis/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'hepatitis/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'hepatitis';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'hepatitis';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(orgsWritable, isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let org = row.organization;
                if (!org || !org.id || !orgsWritable || orgsWritable.length <= 0) {
                    return '&mdash;';
                }

                let ret = '';

                if (!isSiteManager) {
                    ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>Sửa</button>';
                    ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xoá</button>';
                } else {
                    if (utils.indexOf(org, orgsWritable) >= 0) {
                        ret = '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';
                    } else {
                        ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>Sửa</button>';
                        ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xoá</button>';
                    }
                }
                
                return ret;
            };

            let _tableOperationCellStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _hepTypeFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }

                switch (value) {
                    case 'HEP_B':
                        return 'Xét nghiệm HbsAg';
                        break;
                    case 'HEP_C':
                        return 'Xét nghiệm Anti-HCV';
                        break;
                }
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'organization',
                    title: 'Cơ sở ghi nhận thông tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        console.log(value);
                        if (value && value.name) {
                            return value.name;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'testType',
                    title: 'Loại xét nghiệm',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _hepTypeFormatter
                }, {
                    field: 'testDate',
                    title: 'Ngày xét nghiệm',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'testPositive',
                    title: 'Kết quả xét nghiệm',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '';
                        } else if (value == true) {
                            return 'Dương tính';
                        } else {
                            return 'Âm tính';
                        }
                    }
                }, {
                    field: 'onTreatment',
                    title: 'Điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '';
                        } else if (value == true) {
                            return '<span class="font-weight-600 margin-right-10">Đã được điều trị viêm gan' + (row.testType == 'HEP_B' ? ' B' : row.testType == 'HEP_C' ? ' C' : '') + '</span>';
                        } else {
                            return row.testPositive ? 'Chưa điều trị' : 'Không mắc viêm gan' + (row.testType == 'HEP_B' ? ' B' : row.testType == 'HEP_C' ? ' C' : '');
                        }
                    }
                }, {
                    field: 'txStartDate',
                    title: 'Ngày bắt đầu điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'txEndDate',
                    title: 'Ngày kết thúc điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
            ]
        }
    }

})();