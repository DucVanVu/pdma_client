/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Announcement').controller('IndexController', IndexController);

    IndexController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'blockUI',
        '$sce',

        'IndexService'
    ];

    function IndexController($rootScope, $scope, $http, $timeout, settings, modal, toastr, blockUI, $sce, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.entry = {};           // placeholder for an entry
        vm.entries = [];         // all entries queried for the grid
        vm.selectedEntries = []; // selected entries on the grid

        // Entry statuses
        vm.statuses = [{id: 0, name: 'ĐANG SOẠN THẢO'}, {id: 1, name: 'ĐÃ XUẤT BẢN'}];

        vm.modalInstance = null; // the modal dialog

        // For querying list of entries
        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null
        };

        // Option for the editor
        vm.editorOptions = {
            toolbar: [
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'clear'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
            ]
        };

        // Get all entries
        vm.getEntries = function () {

            // block the view with a loading indicator
            blockUI.start();

            service.getAllEntries(vm.filter).then(function (data) {

                // unblock the view
                blockUI.stop();

                vm.entries = data.content;

                let shouldDisplayCheckbox = $scope.isNationalManager($scope.currentUser) || $scope.isDonor($scope.currentUser);

                // console.log(shouldDisplayCheckbox);

                vm.bsTableControl.options.columns = service.getTableDefinition(shouldDisplayCheckbox);
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        // Getting list of entries when page loaded
        vm.getEntries();

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getEntries();
                }, 300);
            }
        });

        // Grid definition
        vm.bsTableControl = {
            options: {
                data: vm.entries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedEntries.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedEntries);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedEntries.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedEntries = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    // Reloading entries upon page change
                    vm.getEntries();
                }
            }
        };

        $scope.viewEntry = function(id) {
            blockUI.start();

            service.getEntry(id).then(function (data) {

                blockUI.stop();

                // Only continue when we can get the entry with a given ID
                if (!data || !data.id) {
                    return;
                }

                vm.entry = data;
                vm.entry.content =  $sce.trustAsHtml(vm.entry.content);

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'view_entry_modal.html',
                    scope: $scope,
                    size: 'md'
                });

                // When modal dialog is closed
                vm.modalInstance.closed.then(function () {
                    vm.entry = {};
                });
            });
        };

        /**
         * Create a new entry
         */
        vm.newEntry = function () {

            vm.entry.isNew = true; // to inform the view
            vm.entry.status = 0; // default to DRAFTING

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            // When modal dialog is closed
            vm.modalInstance.closed.then(function () {
                vm.entry = {};
            });
        };

        /**
         * Edit an entry
         * @param id
         */
        $scope.editEntry = function (id) {

            blockUI.start();

            service.getEntry(id).then(function (data) {

                blockUI.stop();

                // Only continue when we can get the entry with a given ID
                if (!data || !data.id) {
                    return;
                }

                vm.entry = data;
                vm.entry.isNew = false;       // to inform the view

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_entry_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                // When modal dialog is closed
                vm.modalInstance.closed.then(function () {
                    vm.entry = {};
                });
            });
        };

        /**
         * Save a new/existing entry
         */
        vm.saveEntry = function () {

            // validate the entry title, make sure it is not null or empty
            if (!vm.entry.title || vm.entry.title.trim().length <= 0) {
                toastr.error('Vui lòng nhập tiêu đề của thông báo.', 'Thông báo');
                return;
            }

            console.log(vm.entry);

            service.saveEntry(vm.entry, function success() {
                toastr.info('Bạn đã lưu thành công một mục thông báo.', 'Thông báo');

                // Reload the grid
                vm.getEntries();

            }, function failure() {
                toastr.error('Có lỗi xảy ra khi lưu thông tin của một mục thông báo.', 'Thông báo');
            }).then(function (data) {
                if (vm.modalInstance != null) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Delete selected entries
         */
        vm.deleteEntries = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteEntries(vm.selectedEntries, function success() {

                        // Refresh the grid
                        vm.getEntries();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedEntries.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedEntries = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá các bản ghi đã chọn.', 'Thông báo');
                    });
                }
            });
        };
    }

})();
