/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('DictionaryController', DictionaryController);

    DictionaryController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$timeout',
        'settings',
        '$uibModal',
        'blockUI',
        'toastr',
        'Utilities',
        'bsTableAPI',

        'DictionaryService'
    ];

    function DictionaryController($rootScope, $scope, $state, $timeout, settings, modal, blockUI, toastr, utils, bsTableAPI, service) {
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

        vm.modalInstance = null;

        vm.entry = {};
        vm.entries = [];
        vm.selectedEntries = [];
        vm.entryTypes = [];

        vm.filter = {
            type: null,
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };
        // Sorter
        vm.sorter = {
            type: null,
            list: [],
            options: {
                stop: function (e, ui) {
                    let length = vm.sorter.list.length;
                    for (let i = 0; i < length; i++) {
                        vm.sorter.list[i].order = i + 1;
                    }
                }
            }
        };

        $scope.$watch('vm.filter.type', function (newVal, oldVal) {
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            $timeout(function () {
                vm.getEntries();
            }, 300);
        });

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal && oldVal) {
                $timeout(function () {
                    vm.getEntries();
                }, 300);
            }
        });

        /**
         * Free text search
         */
        vm.freeTextSearch = function() {
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getEntries();
        };

        vm.getEntries = function () {
            blockUI.start();
            service.getEntriesPageable(vm.filter).then(function (data) {
                blockUI.stop();
                vm.entries = data.content;
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getTypes = function () {
            service.getEntryTypes().then(function (data) {
                vm.entryTypes = data;
            });
        };

        vm.getEntries();
        vm.getTypes();

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

                    vm.getEntries();
                }
            }
        };

        /**
         * Open dialog for re-ordering entries
         */
        vm.reOrder = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'reorder_entries_modal.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    service.saveEntriesSortOrder(vm.sorter.list, function success() {
                        toastr.info('B???n ???? l??u th??nh c??ng th??? t??? m???i c???a danh s??ch.', 'Th??ng b??o');
                    }, function failure() {
                        toastr.errono('C?? l???i x???y ra khi l??u th??? t??? m???i c???a danh s??ch.', 'Th??ng b??o');
                    });

                    vm.sorter.type = null;
                    vm.sorter.list = [];
                }
            }, function () {

                vm.sorter.type = null;
                vm.sorter.list = [];

                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * New dictionary entry
         */
        vm.newEntry = function () {

            vm.entry.isNew = true;
            vm.entry.active = true;

            if (vm.filter.type) {
                vm.entry.type = vm.filter.type;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_entry_modal.html',
                scope: $scope,
                size: 'md'
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.entry = {};
            });
        };

        /**
         * Edit an entry
         * @param entryId
         */
        $scope.editEntry = function (entryId) {
            service.getEntry(entryId).then(function (data) {

                vm.entry = data;
                vm.entry.isNew = false;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_entry_modal.html',
                    scope: $scope,
                    size: 'md'
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.entry = {};
                });
            });
        };

        /**
         * Save an entry
         */
        vm.saveEntry = function () {
            if (!vm.entry.type || vm.entry.type.trim() == '') {
                toastr.error('Vui l??ng ch???n lo???i d??? li???u.', 'Th??ng b??o');
                return;
            }

            if (!vm.entry.value || vm.entry.value.trim() == '') {
                toastr.error('B???n vui l??ng nh???p n???i dung d??? li???u.', 'Th??ng b??o');
                return;
            }

            service.saveEntry(vm.entry, function success() {

                // Refresh list
                vm.getEntries();

                // Notify
                toastr.info('B???n ???? l??u th??nh c??ng m???t ?????u m???c cho t??? ??i???n d??? li???u.', 'Th??ng b??o');
            }, function failure() {
                toastr.error('C?? l???i x???y ra khi l??u ?????u m???c cho t??? ??i???n d??? li???u.', 'Th??ng b??o');
            }).then(function () {
                // clear object
                vm.entry = {};

                if (vm.modalInstance != null) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Delete selected entries
         */
        vm.deleteEntries = function () {
            var modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteEntries(vm.selectedEntries, function success() {

                        // Refresh list
                        vm.getEntries();

                        // Notify
                        toastr.info('B???n ???? x??a th??nh c??ng ' + vm.selectedEntries.length + ' b???n ghi.', 'Th??ng b??o');

                        // Clear selected productTypes
                        vm.selectedEntries = [];
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi th???c hi???n x??a c??c b???n ghi ???? ch???n.', 'Th??ng b??o');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        // Watches
        $scope.$watch('vm.sorter.type', function (newVal, oldVal) {
            if (newVal) {
                let dicType = {type: newVal, title: null};
                service.getMultipleEntries([dicType]).then(function (data) {
                    if (data && data.length > 0) {
                        vm.sorter.list = [];
                        angular.copy(data[0].data, vm.sorter.list);
                    }
                });
            }
        });
    }

})();