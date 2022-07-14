(function () {
    'use strict';

    angular.module('PDMA.Dictionary').service('StaffService', StaffService);

    StaffService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function StaffService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getEntries = getEntries;
        self.getEntry = getEntry;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;

        function getEntries(filter) {

            let url = baseUrl + 'staff/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'staff/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveEntry(staff, successCallback, errorCallback) {
            let url = baseUrl + 'staff';
            staff.person.gender = 'OTHER';

            return utils.resolveAlt(url, 'POST', null, staff, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'staff';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {
            let _tableOperation = function (value, row, index) {
                let url = '';

                url += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                url += '<a class="btn btn-sm btn-danger no-border" href="#" data-ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';

                return url;
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
                    title: 'Thao tác',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: function () {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'width': '120px'}
                        };
                    }
                }
                , {
                    field: 'person.fullname',
                    title: 'Họ tên',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'person.mobilePhone',
                    title: 'Số điện thoại',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'person.emailAddress',
                    title: 'Địa chỉ email',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'jobTitle',
                    title: 'Vị trí công việc',
                    sortable: false,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();