(function () {

    'use strict';

    let PDMA = angular.module('PDMA');

    /* Setup App Main Controller */
    PDMA.controller('AppController', ['$rootScope', '$scope', '$cookies', '$state', '$http', '$window', '$timeout', 'constants', 'settings', '$uibModal', 'toastr', 'Upload', 'focus', 'UserService', 'NotificationService', 'OAuth', 'blockUI',
        function ($rootScope, $scope, $cookies, $state, $http, $window, $timeout, constants, settings, modal, toastr, Upload, focus, userService, notiService, OAuth, blockUI) {
            $scope.$on('$viewContentLoaded', function () {
            });

            let emptyOrgs = {
                readable: [],
                writable: [],
                deletable: [],
                htsable: [],
                peable: [],
                pnsable: [],
                snsable: [],
                selfTestable: [],
                initialized: false
            };

            // Other controller logic
            let user = $cookies.getObject(constants.cookies_user);
            $scope.currentUser = {fullname: '', loaded: false};
            $scope.assignedOrgs = {};
            $scope.opcNotification = {};
            angular.copy(emptyOrgs, $scope.assignedOrgs);

            // notifications
            $scope.notification = {
                unread: 0,
                list: [],
                fetch: function () {
                    // count unread notifications
                    notiService.countUnread().then(function (data) {
                        $scope.notification.unread = data;
                    });

                    // fetch notifications
                    notiService.fetchNotifications().then(function (data) {
                        $scope.notification.list = data.content;
                    });
                },
                fetch4OpcAssist: function () {
                    /**
                     * Get minimized notification data for the OPC-Assist
                     * Data including:
                     * - # of patients pending enrollment
                     * - # of appointments today
                     */

                    if ($scope.assignedOrgs.writable.length > 0) {
                        let org = $scope.assignedOrgs.writable[0];

                        notiService.getOPCAssistNotification(org.id).then(function (data) {
                            if (data) {
                                angular.copy(data, $scope.opcNotification);

                                if (data.todayAppointmentCount) {
                                    $scope.opcNotification.calendarTooltip = data.todayAppointmentCount + ' lịch hẹn hôm nay';
                                } else {
                                    $scope.opcNotification.calendarTooltip = 'Lịch khám';
                                }

                                if (data.pendingEnrollmentCount) {
                                    $scope.opcNotification.patientListTooltip = data.pendingEnrollmentCount + ' BN chờ tiếp nhận. Vào tìm kiếm nâng cao để chọn xem danh sách chờ...';
                                } else {
                                    $scope.opcNotification.patientListTooltip = 'Quản lý bệnh nhân';
                                }
                            }
                        });
                    }
                }
            };

            // Click on notification item
            $scope.notificationOpen = function (item) {
                $timeout(function () {
                    notiService.markAsRead().then(function (data) {
                        $scope.notification.fetch();
                    });
                }, 5000); // after 5 seconds
            };

            $rootScope.$on('$onCurrentUserData', function (event, data) {
                $scope.assignedOrgs = {};
                angular.copy(emptyOrgs, $scope.assignedOrgs);

                if (data != null) {
                    $scope.currentUser = data;
                    $scope.notification.fetch();
                    $scope.currentUser.loaded = true;
                }
            });

            $rootScope.$on('$onOrganizationData', function (event, data) {
                // Reset...
                $scope.assignedOrgs = {};
                // Vũ Văn Đức thêm $scope.isHtsRole, $scope.isPeRole, $scope.isPnsRole, $scope.isSnsRole, $scope.isSelfTestRole
                $scope.isHtsRole = false;
                $scope.isPeRole = false;
                $scope.isPnsRole = false;
                $scope.isSnsRole = false;
                $scope.isSelfTestRole = false;
                angular.copy(emptyOrgs, $scope.assignedOrgs);

                if (!data || data.length <= 0) {
                    return;
                }

                angular.forEach(data, function (uo) {
                    $scope.assignedOrgs.readable.push(uo.organization);

                    if (uo.writeAccess) {
                        $scope.assignedOrgs.writable.push(uo.organization);
                    }

                    if (uo.deleteAccess) {
                        $scope.assignedOrgs.deletable.push(uo.organization);
                    }
                    
                    // Vũ Văn Đức thêm htsRole, peRole, pnsRole, snsRole, selfTestRole
                    if(uo.htsRole) {
                        $scope.assignedOrgs.htsable.push(uo.organization);
                    }

                    if(uo.peRole) {
                        $scope.assignedOrgs.peable.push(uo.organization);
                    }

                    if(uo.pnsRole) {
                        $scope.assignedOrgs.pnsable.push(uo.organization);
                    }

                    if(uo.snsRole) {
                        $scope.assignedOrgs.snsable.push(uo.organization);
                    }

                    if(uo.selfTestRole) {
                        $scope.assignedOrgs.selfTestable.push(uo.organization);
                    }
                });

                if($scope.assignedOrgs.htsable.length > 0) {
                    $scope.isHtsRole = true;
                } else {
                    $scope.isHtsRole = false;
                }

                if($scope.assignedOrgs.peable.length > 0) {
                    $scope.isPeRole = true;
                } else {
                    $scope.isPeRole = false;
                }

                if($scope.assignedOrgs.pnsable.length > 0) {
                    $scope.isPnsRole = true;
                } else {
                    $scope.isPnsRole = false;
                }
                
                if($scope.assignedOrgs.snsable.length > 0) {
                    $scope.isSnsRole = true;
                } else {
                    $scope.isSnsRole = false;
                }

                if($scope.assignedOrgs.selfTestable.length > 0) {
                    $scope.isSelfTestRole = true;
                } else {
                    $scope.isSelfTestRole = false;
                }

                // Fetch OPC assist notification
                $scope.notification.fetch4OpcAssist();
                $scope.assignedOrgs.initialized = true;
            });

            $rootScope.$on('$userPhotoChanged', function (event, data) {
                $scope.currentUser.hasPhoto = true;

                angular.element('#_user_profile_photo_small').attr('src', settings.api.baseUrl + 'public/user/photo/' + $scope.currentUser.username + '?d=' + moment().format('MMDDYY-hhmmss'));
                angular.element('#_user_profile_photo_big').attr('src', settings.api.baseUrl + 'public/user/photo/' + $scope.currentUser.username + '?d=' + moment().format('MMDDYY-hhmmss'));
            });

            /**
             * Logout...
             */
            $scope.logout = function () {
                OAuth.revokeToken();

                $scope.assignedOrgs = {};
                angular.copy(emptyOrgs, $scope.assignedOrgs);

                // Remove all cookies
                let cookies = $cookies.getAll();
                angular.forEach(cookies, function (v, k) {
                    if (k != constants.cookies_pns_instr_visibility && k != constants.cookies_pns_current_page) {
                        $cookies.remove(k);
                    }
                });

                $scope.assignedOrgs = {};
                $scope.currentUser = null;
                $scope.opcNotification = {};

                $state.go('login');
            };

            /**
             * Change password
             */
            $scope.changePassword = function () {
                let modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'change_password_modal2.html',
                    scope: $scope,
                    size: 'md'
                });

                $scope.changePasswordObj = {
                    currentPassword: null,
                    newPassword: null,
                    newPasswordRep: null,
                    saveNewPassword: function () {
                        if (!$scope.changePasswordObj.currentPassword || $scope.changePasswordObj.currentPassword.trim() === '') {
                            toastr.error('Vui lòng nhập mật khẩu hiện thời.', 'Thông báo');
                            focus('_frm_change_password.current_password');
                            return;
                        }

                        if (!$scope.changePasswordObj.newPassword || $scope.changePasswordObj.newPassword.trim() === '') {
                            toastr.error('Vui lòng nhập mật khẩu mới.', 'Thông báo');
                            focus('_frm_change_password.new_password');
                            return;
                        }

                        if ($scope.changePasswordObj.newPassword != $scope.changePasswordObj.newPasswordRep) {
                            toastr.error('Mật khẩu mới không trùng khớp nhau.', 'Thông báo');
                            focus('_frm_change_password.new_password_rep');
                            return;
                        }

                        userService.passwordValid({password: $scope.changePasswordObj.currentPassword}).then(function (data) {
                            if (!data) {
                                toastr.error('Mật khẩu hiện thời bạn vừa nhập không đúng. Vui lòng kiểm tra lại!', 'Thông báo');
                                focus('_frm_change_password.current_password');
                                return;
                            } else {
                                let userObj = {
                                    id: $scope.currentUser.id,
                                    username: $scope.currentUser.username,
                                    password: $scope.changePasswordObj.newPassword
                                };
                                userService.changePasswordSelf(userObj, function success() {

                                    toastr.info('Bạn đã thay đổi mật khẩu thành công.', 'Thông báo');

                                    modal.open({
                                        animation: true,
                                        templateUrl: 'password_changed_modal.html',
                                        scope: $scope,
                                        backdrop: 'static',
                                        keyboard: false,
                                        size: 'md'
                                    });

                                }, function error() {
                                    toastr.error('Có lỗi xảy ra khi cập nhật mật khẩu mới! Mật khẩu của bạn vẫn được giữ nguyên.', 'Thông báo');
                                }).then(function (data) {
                                    modalInstance.close();
                                });
                            }
                        });
                    }
                };
            };

            /**
             * Upload profile photo
             */
            $scope.profilePhoto = {
                uploadedFile: null,
                errorFile: null,
                modalDialog: null,
                loadedImageData: '',
                cropper: {x: 0, y: 0, w: 0, h: 0, cropWidth: 300, cropHeight: 300},
                croppedImage: '',
                photoUrl: '',
                showUploadModal: function () {
                    if (!$scope.currentUser || !$scope.currentUser.id) {
                        return;
                    }

                    $scope.profilePhoto.modalDialog = modal.open({
                        animation: true,
                        templateUrl: 'upload_photo_modal.html',
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        size: 'md'
                    });
                },
                triggerUpload: function (file, errFiles) {
                    $scope.profilePhoto.uploadedFile = file;
                    $scope.profilePhoto.errorFile = errFiles && errFiles[0];
                },
                startUploadFile: function (file) {
                    if (file) {
                        let url = settings.api.baseUrl + settings.api.apiV1Url + 'user/photo/upload';

                        file.upload = Upload.upload({
                            url: url,
                            data: {file: file}
                        }).progress(function (evt) {
                            $scope.profilePhoto.uploadedFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data, status, headers, config) {
                            $timeout(function () {
                                $scope.profilePhoto.uploadedFile = null;
                                $scope.profilePhoto.errorFile = null;
                                $scope.profilePhoto.modalDialog.close();

                                $scope.profilePhoto.photoUrl = settings.api.baseUrl + 'public/user/photo/' + $scope.currentUser.username;

                                // Start cropping...
                                $scope.profilePhoto.modalDialog = modal.open({
                                    animation: true,
                                    templateUrl: 'crop_photo_modal.html',
                                    scope: $scope,
                                    backdrop: 'static',
                                    keyboard: false,
                                    size: 'md'
                                });

                                $scope.profilePhoto.modalDialog.result.then(function (confirm) {
                                    $scope.profilePhoto.cropper.x = $scope.profilePhoto.cropper.cropImageLeft;
                                    $scope.profilePhoto.cropper.y = $scope.profilePhoto.cropper.cropImageTop;
                                    $scope.profilePhoto.cropper.w = $scope.profilePhoto.cropper.cropImageWidth;
                                    $scope.profilePhoto.cropper.h = $scope.profilePhoto.cropper.cropImageHeight;
                                    $scope.profilePhoto.cropper.user = $scope.currentUser;

                                    userService.cropProfilePhoto($scope.profilePhoto.cropper).then(function (data) {
                                        // emit event...
                                        $rootScope.$emit('$userPhotoChanged', data);
                                    });
                                });
                            }, 500);
                        });
                    }
                },
                closeUploadFile: function () {
                    $scope.profilePhoto.uploadedFile = null;
                    $scope.profilePhoto.errorFile = null;

                    if ($scope.profilePhoto.modalDialog) {
                        $scope.profilePhoto.modalDialog.close();
                    }
                }
            };

            /**
             * Check if the current user is admin user
             */
            $scope.isAdministrator = function (user) {
                if (!user || !user.roles || user.roles.length <= 0 || user.pnsOnly) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_ADMIN" === role.name.toUpperCase()
                        || "ROLE_MANAGER" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            /**
             * Check if the current user is a donor
             *
             * @param user
             * @returns {boolean}
             */
            $scope.isDonor = function (user) {
                if (!user || !user.roles || user.roles.length <= 0) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_DONOR" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            /**
             * Check if the current user is a national manager
             *
             * @param user
             * @returns {boolean}
             */
            $scope.isNationalManager = function (user) {
                if (!user || !user.roles || user.roles.length <= 0) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_NATIONAL_MANAGER" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            /**
             * Check if the current user is a provincial manager
             *
             * @param user
             * @returns {boolean}
             */
            $scope.isProvincialManager = function (user) {
                if (!user || !user.roles || user.roles.length <= 0) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_PROVINCIAL_MANAGER" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            $scope.isDistrictManager = function (user) {
                if (!user || !user.roles || user.roles.length <= 0) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_DISTRICT_MANAGER" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            /**
             * Check if the current user is a site manager
             *
             * @param user
             * @returns {boolean}
             */
            $scope.isSiteManager = function (user) {
                if (!user || !user.roles || user.roles.length <= 0) {
                    return false;
                }

                let ret = false;
                angular.forEach(user.roles, function (role) {
                    if ("ROLE_SITE_MANAGER" === role.name.toUpperCase()) {
                        ret = true;
                    }
                });

                return ret;
            };

            /**
             * Open the manual document
             */
            $scope.openManuals = function () {
                let url = '/assets/manuals/manuals_1.pdf';
                window.open(url, '_blank');
                // let url = settings.api.baseUrl + 'manual/1';
                //
                // $http.get(url, {responseType: 'arraybuffer'})
                //     .success(function (data) {
                //         let file = new Blob([data], {type: 'application/pdf'});
                //         let fileURL = window.URL.createObjectURL(file);
                //         window.open(fileURL);
                //     });
            };
        }
    ]);

    /***
     Layout Partials.
     By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
     initialization can be disabled and Layout.init() should be called on page load complete as explained above.
     ***/

    /* Setup Layout Part - Header */
    PDMA.controller('HeaderController', ['$scope', '$state', 'settings', function ($scope, $state, settings) {
        $scope.$on('$includeContentLoaded', function () {
            Layout.initHeader($state);
            Layout.initContent();
        });
    }]);

    /* Setup Layout Part - Sidebar/Page header */
    PDMA.controller('SidebarController', ['$scope', 'settings', function ($scope, settings) {
        $scope.$on('$includeContentLoaded', function () {
            Layout.initSidebar(); // init sidebar
        });
    }]);

    /* Setup Layout Part - Quick Sidebar */
    PDMA.controller('QuickSidebarController', ['$scope', function ($scope) {
        $scope.$on('$includeContentLoaded', function () {
            setTimeout(function () {
                // QuickSidebar.init(); // init quick sidebar
            }, 2000)
        });
    }]);

    /* Setup Layout Part - Theme Panel */
    PDMA.controller('ThemePanelController', ['$scope', function ($scope) {
        $scope.$on('$includeContentLoaded', function () {
            // ThemeSettings.init(); // init theme panel
        });
    }]);

    /* Setup Layout Part - Footer */
    PDMA.controller('FooterController', ['$scope', 'settings', function ($scope, settings) {
        $scope.$on('$includeContentLoaded', function () {
            Layout.initFooter();
        });
    }]);

})();