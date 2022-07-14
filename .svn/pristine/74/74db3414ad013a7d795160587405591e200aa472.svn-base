/**
 * Created by bizic on 28/8/2016.
 */

(function () {
    'use strict';
    angular.module('PDMA.Reporting').controller('WeeklyReportController', WeeklyReportController);

    WeeklyReportController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$state',
        '$stateParams',
        '$timeout',
        '$cookies',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        'Utilities',
        'bsTableAPI',

        'WeeklyReportingService',
        'OrganizationService',
        'AdminUnitService',
        'UserService'
    ];

    function WeeklyReportController($rootScope, $scope, $http, $state, $stateParams, $timeout, $cookies, settings, modal, toastr, blockUI, utils, bsTableAPI, service, orgService, auService, uService) {
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

            if ($scope.isAdministrator($scope.currentUser)) {
                $state.go('application.dashboard');
            }
        });

        let vm = this;

        vm.COOKIES_KEYS = {
            SELECTED_PAGE: '_wr_listing_selected_page',
            SELECTED_WEEK: '_wr_listing_selected_week',
            SELECTED_ORG: '_wr_listing_selected_org',
            SELECTED_STATUS: '_wr_listing_selected_status'
        };

        vm.modalInstance = null;
        vm.weeklyReport = {};
        vm.weeklyReports = [];
        vm.selectedReports = [];

        // vm.provinces = [];
        // vm.selectedProvince = null;

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.orgsDeletable = [];

        vm.organizations = [];
        vm.selectedOrg = null;
        vm.pageJustLoaded = [true, true, true];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            orgs: [], // readable orgs,
            status: null,
            date: null
        };

        vm.updatePageIndex = function (pIndex, shouldUpdate) {
            if (typeof pIndex == 'undefined' || pIndex < 0) {
                pIndex = 0;
            }

            vm.filter.pageIndex = pIndex;
            $cookies.put(vm.COOKIES_KEYS.SELECTED_PAGE, vm.filter.pageIndex);

            if (shouldUpdate) {
                bsTableAPI('bsTableControl', 'selectPage', pIndex + 1);
            }
        };

        vm.statuses = [
            {id: 0, name: 'Đang soạn thảo'},
            {id: 1, name: 'Chờ phê duyệt'},
            {id: 2, name: 'Chờ xuất bản'},
            {id: 3, name: 'Đã xuất bản'}
        ];

        // Adjust pageIndex from cookies
        let temp = $cookies.get(vm.COOKIES_KEYS.SELECTED_PAGE);
        if (typeof temp !== 'undefined') {
            vm.filter.pageIndex = parseInt(temp);
            vm.updatePageIndex(vm.filter.pageIndex, true);
        } else {
            vm.updatePageIndex(0);
        }

        // Update from cookies
        temp = $cookies.get(vm.COOKIES_KEYS.SELECTED_ORG);
        if (typeof temp !== 'undefined') {
            vm.selectedOrg = JSON.parse(temp);

            if (vm.selectedOrg && vm.selectedOrg.id) {
                vm.filter.orgs = [vm.selectedOrg];
                vm.pageJustLoaded[1] = false;
            }
        }

        temp = $cookies.get(vm.COOKIES_KEYS.SELECTED_WEEK);
        if (typeof temp !== 'undefined') {
            let tmpWeek = JSON.parse(temp);
            if (tmpWeek && tmpWeek.date) {
                vm.filter.date = tmpWeek.date;
            }
        }

        temp = $cookies.get(vm.COOKIES_KEYS.SELECTED_STATUS);
        if (typeof temp !== 'undefined') {
            vm.filter.status = JSON.parse(temp);
            vm.pageJustLoaded[2] = false;
        }

        // For week selection
        vm.MAX_DATE = moment(new Date()).startOf('isoWeek').add(-1, 'day').toDate();
        let defaultDate = moment(vm.MAX_DATE, 'YYYY-MM-DD').startOf('isoWeek').add(2, 'days').toDate();
        vm.datepicker = {
            fpItem: null,
            dateOpts: {
                // altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'CHỌN TUẦN..',
                defaultDate: vm.filter.date ? vm.filter.date : null,
                maxDate: vm.MAX_DATE,
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filter.date = m.startOf('isoWeek').add(3, 'days').toDate(); // to be safe

                        // add to cookies
                        $cookies.putObject(vm.COOKIES_KEYS.SELECTED_WEEK, {
                            date: vm.filter.date
                        });

                        vm.updatePageIndex(0, true);
                        vm.getWeeklyReports();
                    }
                }],
                formatDate: function (d, format) {
                    let obj = moment(d, 'YYYY-MM-DD');
                    return 'TUẦN ' + obj.week() + '/' + obj.year();
                }
            },
            datePostSetup: function (fpItem) {
                vm.datepicker.fpItem = fpItem;
            },
            clear: function () {
                if (vm.datepicker.fpItem) {
                    vm.datepicker.fpItem.clear();
                    vm.filter.date = null;

                    $cookies.remove(vm.COOKIES_KEYS.SELECTED_WEEK);

                    vm.updatePageIndex(0, true);
                    vm.getWeeklyReports();
                }
            }
        };

        // Date picker for excel export - from date
        vm.excelExportFilter = {
            fromDate: null,
            toDate: null
        };

        vm.datepicker2 = {
            fpItem: null,
            dateOpts: {
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'TỪ TUẦN..',
                defaultDate: null,
                maxDate: vm.MAX_DATE,
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    // angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.excelExportFilter.fromDate = m.startOf('isoWeek').add(2, 'days').toDate(); // need adjustment on serverside
                    }
                }],
                formatDate: function (d, format) {
                    let obj = moment(d, 'YYYY-MM-DD');
                    return 'TỪ TUẦN ' + obj.week() + '/' + obj.year();
                }
            }
        };

        // Date picker for excel export - to date
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: {
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'ĐẾN TUẦN..',
                defaultDate: null,
                maxDate: vm.MAX_DATE,
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    // angular.element(document.querySelector('#fixed_element')).focus();
                    const d = this.selectedDates[0];
                    if (d) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.excelExportFilter.toDate = m.startOf('isoWeek').add(2, 'days').toDate(); // need adjustment on serverside
                    }
                }],
                formatDate: function (d, format) {
                    let obj = moment(d, 'YYYY-MM-DD');
                    return 'ĐẾN TUẦN ' + obj.week() + '/' + obj.year();
                }
            }
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {

                vm.orgsReadable = [];
                vm.orgsWritable = [];
                vm.orgsDeletable = [];

                vm.organizations = [];

                $timeout(function () {
                    angular.copy($scope.assignedOrgs.readable, vm.orgsReadable);
                    angular.copy($scope.assignedOrgs.writable, vm.orgsWritable);
                    angular.copy($scope.assignedOrgs.deletable, vm.orgsDeletable);

                    angular.copy(vm.orgsReadable, vm.organizations);

                    if (vm.filter.orgs.length > 0) {
                        let tmp = $cookies.get(vm.COOKIES_KEYS.SELECTED_ORG);
                        let tmpInCookies = null;
                        if (typeof tmp !== 'undefined') {
                            tmpInCookies = JSON.parse(tmp);
                        }

                        tmp = [];
                        angular.copy(vm.filter.orgs, tmp);
                        vm.filter.orgs = [];
                        // make sure the user has access to selected orgs
                        for (let i = 0; i < tmp.length; i++) {

                            let obj = tmp[i];

                            if (utils.indexOf(obj, vm.organizations) >= 0) {
                                vm.filter.orgs.push(obj);
                            } else {
                                if (tmpInCookies && tmpInCookies.id && obj.id == tmpInCookies.id) {
                                    // Remove cookies
                                    $cookies.remove(vm.COOKIES_KEYS.SELECTED_ORG);
                                }
                                if (vm.selectedOrg && vm.selectedOrg.id && obj.id == vm.selectedOrg.id) {
                                    vm.selectedOrg = null;
                                }
                            }
                        }
                    }

                    if (vm.filter.orgs.length <= 0) {
                        angular.copy(vm.organizations, vm.filter.orgs);
                    }

                    // Get weekly reports
                    bsTableAPI('bsTableControl', 'selectPage', vm.filter.pageIndex + 1);
                    vm.getWeeklyReports();
                }, 300);
            }
        });

        $scope.$watch('vm.selectedOrg', function (newVal, oldVal) {

            if (newVal && newVal.id) {
                vm.filter.orgs = [newVal];

                vm.updatePageIndex(0, true);
                vm.getWeeklyReports();

                // add to cookies
                $cookies.putObject(vm.COOKIES_KEYS.SELECTED_ORG, {
                    id: newVal.id,
                    name: newVal.name
                });
            } else {
                vm.filter.orgs = [];
                angular.copy(vm.organizations, vm.filter.orgs);

                if (!vm.pageJustLoaded[1]) {
                    vm.updatePageIndex(0, true);
                    vm.getWeeklyReports();
                }

                vm.pageJustLoaded[1] = false;

                // Remove cookies
                $cookies.remove(vm.COOKIES_KEYS.SELECTED_ORG);
            }
        });

        $scope.$watch('vm.filter.status', function (newVal, oldVal) {

            if (newVal && typeof newVal.id != 'undefined') {
                $cookies.putObject(vm.COOKIES_KEYS.SELECTED_STATUS, newVal);
            } else {
                $cookies.remove(vm.COOKIES_KEYS.SELECTED_STATUS);
            }

            if (!vm.pageJustLoaded[2]) {
                vm.updatePageIndex(0, true);
                vm.getWeeklyReports();
            }

            vm.pageJustLoaded[2] = false;
        });

        vm.tabs = {
            activeTab: 2,
            changeTab: function (tab) {
                if (tab >= 1 || tab <= 2) {
                    vm.tabs.activeTab = tab;
                }
            }
        };

        /**
         * Get all weekly reports
         */
        vm.getWeeklyReports = function () {
            blockUI.start();
            // console.log(vm.filter);
            service.getWeeklyReports(vm.filter).then(function (data) {
                blockUI.stop();

                vm.weeklyReports = data.content;

                let isSiteManager = $scope.isSiteManager($scope.currentUser);
                let isProvincialManager = $scope.isProvincialManager($scope.currentUser);

                // vm.bsTableControl.options.pageNumber = vm.filter.pageIndex + 1;
                vm.bsTableControl.options.columns = service.getTableDefinition(isSiteManager, isProvincialManager);
                vm.bsTableControl.options.data = vm.weeklyReports;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        /**
         * Table definition
         * @type {{options: {data: (Array|*), idField: string, sortable: boolean, striped: boolean, maintainSelected: boolean, clickToSelect: boolean, showColumns: boolean, showToggle: boolean, pagination: boolean, singleSelect: boolean, pageSize: number, pageList: number[], locale: *, sidePagination: string, columns: *, onCheck: onCheck, onUncheckAll: onUncheckAll, onPageChange: onPageChange}}}
         */
        vm.bsTableControl = {
            options: {
                data: vm.weeklyReports,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                singleSelect: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedReports = [row];
                    });
                },
                onUncheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedReports = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.updatePageIndex(vm.filter.pageIndex, false);
                    vm.getWeeklyReports();
                }
            }
        };

        /**
         * New weeklyReport
         */
        vm.newReport = function () {
            $state.go('application.edit_weekly_report', {id: 0});
        };

        /**
         * Edit a weeklyReport
         * @param id
         */
        $scope.editReport = function (id) {
            blockUI.start();
            service.getWeeklyReport(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    if ($scope.isSiteManager($scope.currentUser) && utils.indexOf(data.organization, vm.orgsWritable) < 0) {
                        toastr.error('Bạn không có quyền chỉnh sửa báo cáo này!', 'Thông báo');
                    } else {
                        $state.go('application.edit_weekly_report', {id: data.id});
                    }
                } else {
                    toastr.error('Không tải được báo cáo để chỉnh sửa. Vui lòng thử lại sau ít phút.', 'Thông báo');
                }
            });
        };

        /**
         * Quickly approve the request for provincial manager
         * @param id
         */
        $scope.updateReportStatus = function (id, status) {
            blockUI.start();
            service.getWeeklyReport(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {

                    vm.dialog = {
                        icon: 'im im-icon-Flash',
                        title: 'Duyệt báo cáo',
                        message: 'Bạn có chắc chắn muốn duyệt [' + data.name + '] của cơ sở [' + data.organization.name + '] không?',
                        callback: function (answer) {

                            if (vm.modalInstance) {
                                vm.modalInstance.close();
                            }

                            if (answer === 'yes') {
                                data.status = status;

                                blockUI.start();
                                service.updateReportStatus(data, function success() {
                                    blockUI.stop();
                                    toastr.info('Bạn đã cập nhật thành công trạng thái của báo cáo.', 'Thông báo');
                                }, function failure() {
                                    toastr.error('Có lỗi xảy ra khi cập nhật trạng thái của báo cáo.', 'Thông báo');
                                }).then(function (data2) {
                                    if (data2 && data2.id) {
                                        $state.go($state.$current, null, {reload: true});
                                    }
                                });
                            }
                        }
                    };

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'confirmation.html',
                        scope: $scope,
                        size: 'md'
                    });

                    vm.modalInstance.closed.then(function () {
                        vm.dialog = {};
                    });
                }
            });
        };

        /**
         * Delete weekly reports
         */
        vm.deleteReports = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteWeeklyReports(vm.selectedReports, function success() {

                        // Refresh list
                        vm.getWeeklyReports();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedReports.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedReports = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá bản ghi.', 'Thông báo');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Export multiple reports to Excel
         */
        vm.excelExportFilter = {
            tmpFromDate: null,
            tmpToDate: null,
            fromDate: null,
            toDate: null
        };

        vm.export2Excel = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'export_modal.html',
                scope: $scope,
                size: 'md'
            });
        };

        vm.startExport2Excel = function () {

            if (!vm.excelExportFilter.fromDate || !vm.excelExportFilter.toDate) {
                toastr.error('Bạn vui lòng chọn khoảng thời gian để trích xuất số liệu!');
                return;
            }

            let mfDate = moment(vm.excelExportFilter.fromDate);
            let mtDate = moment(vm.excelExportFilter.toDate);

            if (mfDate.isAfter(mtDate)) {
                toastr.error('Khoảng thời gian để trích xuất số liệu không hợp lệ!');
                return;
            }

            angular.extend(vm.excelExportFilter, {
                org: vm.selectedOrg,
                province: vm.selectedProvince
            });

            blockUI.start();
            service.export2Excel(vm.excelExportFilter).success(function (data, status, headers, config) {
                blockUI.stop();

                headers = headers();

                var filename = headers['x-filename'];
                var contentType = headers['content-type'];

                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([data], {type: contentType});
                    var url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", filename);

                    var clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    console.log(ex);
                }
            }).error(function (data) {
                // console.log(data);
            }).finally(function () {
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };
    }

})();
