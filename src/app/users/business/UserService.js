/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.User').service('UserService', UserService);

    UserService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function UserService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getUsers = getUsers;
        self.getUser = getUser;
        self.saveUser = saveUser;
        self.deleteUsers = deleteUsers;
        self.getAllRoles = getAllRoles;
        self.getAllUsers = getAllUsers;
        self.usernameDuplicates = usernameDuplicates;
        self.emailDuplicates = emailDuplicates;
        self.changePassword = changePassword;
        self.changePasswordSelf = changePasswordSelf;
        self.passwordValid = passwordValid;
        self.cropProfilePhoto = cropProfilePhoto;
        self.getPermissions = getPermissions;
        self.savePermissions = savePermissions;
        self.revokePermission = revokePermission;
        self.getAssignedOrganizations = getAssignedOrganizations;
        self.getAllProvince = getAllProvince;
        self.exportUser = exportUser;

        function exportUser(filter) {
            let url = baseUrl + 'user/export';
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

        function getAllProvince(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAssignedOrganizations(userId) {

            if (!userId) {
                return $q.when(null);
            }

            let url = baseUrl + 'user_org/list/' + userId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getPermissions(user) {
            if (!user || !user.id) {
                return $q.when(null);
            }

            let url = baseUrl + 'user_org/list/' + user.id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function savePermissions(permissions) {
            let url = baseUrl + 'user_org';

            return utils.resolveAlt(url, 'POST', null, permissions, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function revokePermission(permissions) {
            let url = baseUrl + 'user_org';

            return utils.resolveAlt(url, 'DELETE', null, permissions, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function emailDuplicates(user) {

            if (!user.id) {
                user.id = 0;
            }

            let url = baseUrl + 'user/duplicate/email';

            return utils.resolveAlt(url, 'POST', null, user, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function usernameDuplicates(user) {

            if (!user.id) {
                user.id = 0;
            }

            let url = baseUrl + 'user/duplicate/username';

            return utils.resolveAlt(url, 'POST', null, user, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllRoles() {
            let url = baseUrl + 'role/list';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getUsers(filter) {
            let url = baseUrl + 'user/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllUsers(filter) {
            let url = baseUrl + 'user/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getUser(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'user/id/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function saveUser(user, successCallback, errorCallback) {
            let url = baseUrl + 'user';

            user.active = user.active === null ? 0 : user.active;

            return utils.resolveAlt(url, 'POST', null, user, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteUsers(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'user';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function changePassword(user, successCallback, errorCallback) {
            let url = baseUrl + 'user/password';

            return utils.resolveAlt(url, 'PUT', null, user, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function changePasswordSelf(user, successCallback, errorCallback) {
            let url = baseUrl + 'user/password/self';

            return utils.resolveAlt(url, 'PUT', null, user, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function passwordValid(passwordObj) {
            let url = baseUrl + 'user/password/valid';

            return utils.resolveAlt(url, 'POST', null, passwordObj, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function cropProfilePhoto(cropper) {
            let url = baseUrl + 'user/photo/crop';

            return utils.resolveAlt(url, 'POST', null, cropper, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                if (row.username && row.username === 'admin') {
                    return '<span class="margin-right-20 text-muted">&mdash;</span>';
                } else {
                    let ret = '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.editUser(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                    ret += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" data-ng-click="$parent.grantPermission(' + "'" + row.id + "'" + ')"><i class="icon-grid margin-right-5"></i>Gán quyền</a>';
                    ret += '<a class="btn btn-sm btn-default no-border" href="#" data-ng-click="$parent.changePassword(' + "'" + row.id + "'" + ')"><i class="icon-eye margin-right-5"></i>Đổi mật khẩu</a>';

                    return ret;
                }
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _operationColStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '145px'}
                };
            };

            let _activeFormatter = function (value, row, index) {
                return (value == 0) ? '<span class="text-muted">Inactive</span>' : (value == 1) ? '<span class="text-green">Active</span>' : '';
            };

            let _roles = function (value, row, index) {

                if (value === null || value.length <= 0) {
                    return '-';
                }

                let ret = '';
                angular.forEach(value, function (obj) {
                    ret += obj.name;
                    ret += ', ';
                });

                if (ret.length > 2) {
                    ret = ret.substr(0, ret.length - 2);
                }

                return ret;
            };

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
                    cellStyle: _operationColStyle
                }
                , {
                    field: 'fullname',
                    title: 'Họ tên',
                    sortable: true,
                    switchable: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'username',
                    title: 'Tên đăng nhập',
                    sortable: true,
                    switchable: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'email',
                    title: 'Địa chỉ email',
                    sortable: true,
                    switchable: true,
                    visible: false,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'roles',
                    title: 'Vai trò',
                    sortable: true,
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _roles
                }
                , {
                    field: 'active',
                    title: 'Trạng thái',
                    sortable: true,
                    switchable: true,
                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
            ]
        }
    }
})();