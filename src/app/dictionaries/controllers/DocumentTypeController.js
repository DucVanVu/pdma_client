/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Dictionary').controller('DocumentTypeController', DocumentTypeController);

    DocumentTypeController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'Utilities',
        'DocumentTypeService'
    ];
    
    function DocumentTypeController ($rootScope, $scope, $state, blockUI, $timeout,settings, modal, toastr, utils, service) {
        $scope.$on('$viewContentLoaded', function() {
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

        vm.docType = {};
        vm.docTypes = [];
        vm.selectedDocTypes = [];

        vm.pageIndex = 0;
        vm.pageSize = 25;

        vm.getDocumentTypes = function() {
            service.getDocumentTypes(vm.pageIndex, vm.pageSize).then(function(data) {
                vm.docTypes = data.content;
                vm.bsTableControl.options.data = vm.docTypes;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getDocumentTypes();

        vm.bsTableControl = {
            options: {
                data: vm.docTypes,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: true,
                pagination: true,
                pageSize: vm.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedDocTypes.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedDocTypes = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedDocTypes);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedDocTypes.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedDocTypes = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.pageSize = pageSize;
                    vm.pageIndex = index - 1;

                    vm.getDocumentTypes();
                }
            }
        };

        /**
         * New Document Type
         */
        vm.newDocumentType = function () {

            vm.docType.isNew = true;
            vm.docType.active = true;

            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_document_type_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {

                    if (!vm.docType.name || vm.docType.name.trim() == "") {
                        toastr.error('Please enter document type name.', 'Error');
                        return;
                    }

                    service.saveDocumentType(vm.docType, function success() {

                        // Refresh list
                        vm.getDocumentTypes();

                        // Notify
                        toastr.info('You have successfully added a new document type.', 'Information');

                        // clear object
                        vm.docType = {};
                    }, function failure() {
                        toastr.error('An error occurred while adding a new document type.', 'Error');
                    });
                }
            }, function () {
                vm.docType = {};
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Edit a document type
         * @param docTypeId
         */
        $scope.editDocumentType = function(docTypeId) {
            service.getDocumentType(docTypeId).then(function(data) {

                vm.docType = data;
                vm.docType.isNew = false;

                let modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_document_type_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                modalInstance.result.then(function (confirm) {
                    if (confirm == 'yes') {

                        if (!vm.docType.name || vm.docType.name.trim() == "") {
                            toastr.error('Please enter document type name.', 'Error');
                            return;
                        }

                        service.saveDocumentType(vm.docType, function success() {

                            // Refresh list
                            vm.getDocumentTypes();

                            // Notify
                            toastr.info('You have successfully updated a record.', 'Information');

                            // clear object
                            vm.docType = {};
                        }, function failure() {
                            toastr.error('An error occurred while updating a record.', 'Error');
                        });
                    }
                }, function () {
                    vm.docType = {};
                    console.log('Modal dismissed at: ' + new Date());
                });
            });
        };

        /**
         * Delete document types
         */
        vm.deleteDocumentTypes = function () {
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    service.deleteDocumentTypes(vm.selectedDocTypes, function success() {

                        // Refresh list
                        vm.getDocumentTypes();

                        // Notify
                        toastr.info('You have successfully deleted ' + vm.selectedDocTypes.length + ' records.', 'Information');

                        // Clear selected productTypes
                        vm.selectedDocTypes = [];
                    }, function failure() {
                        toastr.error('An error occurred while deleting records.', 'Error');
                    });
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

})();
