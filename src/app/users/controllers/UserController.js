/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.User').controller('UserController', UserController);

    UserController.$inject = [
        '$rootScope',
        '$scope',
        '$timeout',
        '$state',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'bsTableAPI',
        'Utilities',

        'UserService',
        'OrganizationService',
        'AdminUnitService'
    ];

    function UserController($rootScope, $scope, $timeout, $state, settings, modal, toastr, blockUI, bsTableAPI, utils, service, orgService, auService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;
        

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }

            blockUI.stop();

            if (!$scope.isAdministrator($scope.currentUser)) {
                $state.go('application.dashboard');
            }
        });

        let vm = this;

        vm.user = {};
        vm.users = [];
        vm.selectedUsers = [];
        vm.roles = [];
        vm.isActives=[{val: true,name: "Đã kích hoạt"},{val: false,name: "Chưa kích hoạt"}];

        vm.filter = {
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };
        vm.provinces=[];
        service.getAllProvince({parentId:1}).then(function(data){
            if(data){
                vm.provinces=data;
            }
        });

        // Get all roles
        blockUI.start();
        service.getAllRoles().then(function (data) {
            blockUI.stop();
            if (data && data.length > 0) {
                vm.roles = data;
            } else {
                vm.roles = [];
            }
        });

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getUsers();
                }, 300);
            }
        });
        $scope.$watch('vm.filter.active', function (newVal, oldVal) {
            vm.getUsers();
        });

        $scope.$watch('vm.filter.provinceId', function (newVal, oldVal) {
            vm.getUsers();
        });

        

        /**
         * Free text search
         */
        vm.freeTextSearch = function() {
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getUsers();
        };

        

        // Get all users
        vm.getUsers = function () {
            blockUI.start();
            service.getUsers(vm.filter).then(function (data) {
                blockUI.stop();
                vm.users = data.content;
                vm.bsTableControl.options.data = vm.users;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getUsers();

        vm.bsTableControl = {
            options: {
                data: vm.users,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                singleSelect: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        if (row.username && row.username != 'admin') {
                            vm.selectedUsers.push(row);
                        } else {
                            bsTableAPI('bsTableControl', 'uncheckBy', {field: 'username', values: ['admin']});
                        }
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedUsers);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedUsers.splice(index, 1);
                        });
                    }
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getUsers();
                }
            }
        };

        /**
         * Save user
         */
        function saveUser() {

            if (!vm.user.fullname || vm.user.fullname.trim() === '') {
                toastr.error('Bạn vui lòng nhập họ tên người dùng.', 'Thông báo');
                return;
            }

            if (!utils.validEmail(vm.user.email)) {
                toastr.error('Vui lòng cung cấp một địa chỉ email phù hợp.', 'Thông báo');
                return;
            }

            blockUI.start();

            service.emailDuplicates(vm.user).then(function (emailDup) {
                blockUI.stop();

                if (emailDup) {
                    toastr.error('Địa chỉ email này đã tồn tại. Vui lòng chọn một địa chỉ email khác.', 'Thông báo');
                } else {

                    if (!vm.user.username || vm.user.username.trim() === '') {
                        toastr.error('Tên đăng nhập không hợp lệ.', 'Thông báo');
                        return;
                    }

                    blockUI.start();
                    service.usernameDuplicates(vm.user).then(function (usernameDup) {
                        blockUI.stop();

                        if (usernameDup) {
                            toastr.error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.', 'Thông báo');
                        } else {

                            if (!vm.user.roles || vm.user.roles.length <= 0) {
                                toastr.error('Vui lòng chọn ít nhất một vai trò.', 'Thông báo');
                                return;
                            }

                            blockUI.start();
                            service.saveUser(vm.user, function success() {

                                blockUI.stop();

                                // Refresh list
                                vm.getUsers();

                                // Notify
                                toastr.info('Bạn đã lưu thành công thông tin người dùng.', 'Thông báo');

                                // clear object
                                vm.user = {};
                            }, function failure() {
                                blockUI.stop();
                                toastr.error('Có lỗi xảy ra khi lưu thông tin người dùng.', 'Thông báo');
                            });
                        }
                    });
                }
            });
        }

        /**
         * New user
         */
        vm.newUser = function () {

            vm.user.isNew = true;
            vm.user.active = true;

            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_user_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    saveUser();
                }
            }, function () {
                vm.user = {};
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Edit a user
         * @param userId
         */
        $scope.editUser = function (userId) {
            service.getUser(userId).then(function (data) {

                vm.user = data;
                vm.user.isNew = false;

                let modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_user_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                modalInstance.result.then(function (confirm) {
                    if (confirm === 'yes') {
                        saveUser();
                    }
                }, function () {
                    vm.user = {};
                    console.log('Modal dismissed at: ' + new Date());
                });
            });
        };

        /**
         * Change user password
         *
         * @param userId
         */
        $scope.changePassword = function (userId) {
            service.getUser(userId).then(function (data) {

                vm.user = data;
                vm.user.isNew = false;

                let modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'change_password_modal.html',
                    scope: $scope,
                    size: 'md'
                });

                modalInstance.result.then(function (confirm) {
                    if (confirm === 'yes') {

                        if (!vm.user.password1 || vm.user.password1.trim() === '') {
                            toastr.error('Please enter new password!', 'Error');
                            return;
                        }

                        if (vm.user.password1 != vm.user.password2) {
                            toastr.error('New passwords don\'t match!', 'Error');
                            return;
                        }

                        vm.user.password = vm.user.password1;

                        service.changePassword(vm.user, function success() {
                            toastr.info('You have successfully changed password for this user.', 'Information');
                        }, function failure() {
                            toastr.error('An error occurred while updating user password.', 'Error');
                        });
                    }
                }, function () {
                    vm.user = {};
                    console.log('Modal dismissed at: ' + new Date());
                }).then(function (data) {
                    vm.user = {};
                });
            });
        };

        /**
         * Grant permissions for an user
         */
        $scope.grantPermission = function (userId) {
            $state.go('application.grant_permission', {id: userId});
        };

        /**
         * Delete program services
         */
        vm.deleteUsers = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteUsers(vm.selectedUsers, function success() {

                        // Refresh list
                        vm.getUsers();

                        // Notify
                        toastr.info('You have successfully deleted ' + vm.selectedUsers.length + ' records.', 'Information');

                        // Clear selected productTypes
                        vm.selectedUsers = [];
                    }, function failure() {
                        toastr.error('An error occurred while deleting records.', 'Error');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        vm.exportUser = function () {
            let successHandler = function (data, status, headers, config) {
                blockUI.stop();

                headers = headers();

                let filename = headers['x-filename'];
                let contentType = headers['content-type'];

                let linkElement = document.createElement('a');
                try {
                    let blob = new Blob([data], {type: contentType});
                    let url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", filename);

                    let clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    console.log(ex);
                }
            };
            
            blockUI.start();
            service.exportUser(vm.filter)
            .success(successHandler)
            .error(function () {
                blockUI.stop();
            });
        };
    }

})();
