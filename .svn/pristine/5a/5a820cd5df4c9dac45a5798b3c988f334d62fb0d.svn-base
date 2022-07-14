/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Document').controller('DocumentController', DocumentController);

    DocumentController.$inject = [
        '$rootScope',
        '$scope',
        '$timeout',
        'toastr',
        'blockUI',
        '$uibModal',
        'settings',
        'Utilities',
        'Upload',
        'DocumentService',
        'DocumentTypeService'
    ];

    function DocumentController($rootScope, $scope, $timeout, toastr, blockUI, modal, settings, utils, Upload, service, docTypeService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.document = {};
        vm.documents = [];
        vm.selectedDocuments = [];

        vm.modalInstance = null;

        vm.filter = {
            keyword: null,
            pageIndex: 0,
            pageSize: 25
        };

        vm.getDocuments = function () {
            service.getDocuments(vm.filter).then(function (data) {
                vm.documents = data.content;

                let shouldDisplayCheckbox = $scope.isNationalManager($scope.currentUser) || $scope.isDonor($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition(shouldDisplayCheckbox);
                vm.bsTableControl.options.data = vm.documents;
                vm.bsTableControl.options.totalRows = data.totalElements;
            });
        };

        vm.getDocuments();

        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (oldVal && !newVal) {
                $timeout(function () {
                    vm.getDocuments();
                }, 300);
            }
        });

        vm.bsTableControl = {
            options: {
                data: vm.documents,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: true,
                showToggle: false,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                columns: service.getTableDefinition(),
                onCheck: function (row, $element) {
                    $scope.$apply(function () {
                        vm.selectedDocuments.push(row);
                    });
                },
                onCheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedDocuments = rows;
                    });
                },
                onUncheck: function (row, $element) {
                    let index = utils.indexOf(row, vm.selectedDocuments);
                    if (index >= 0) {
                        $scope.$apply(function () {
                            vm.selectedDocuments.splice(index, 1);
                        });
                    }
                },
                onUncheckAll: function (rows) {
                    $scope.$apply(function () {
                        vm.selectedDocuments = [];
                    });
                },
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getDocuments();
                }
            }
        };

        /**
         * Create a new document
         */
        vm.newDocument = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'upload_files_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.selectedDocType = null;
                vm.uploadedFile = null;
                vm.errorFile = null;
                console.log('modal dismissed...');
            });
        };

        vm.closeUploadFile = function () {
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }
        };

        /**
         * Edit document
         * @param id
         */
        $scope.editDocument = function (id) {
            if (!id) {
                return;
            }

            blockUI.start();
            service.getDocument(id).then(function (data) {
                blockUI.stop();

                if (data && data.id) {
                    vm.document = data;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_document_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.closed.then(function () {
                        vm.document = {};
                    });
                }
            });
        };

        /**
         * Save an editing document
         */
        vm.saveDocument = function() {
            if (!vm.document.title || vm.document.title.trim().length <= 0) {
                toastr.error('Bạn vui lòng nhập tên tài liệu.', 'Thông báo');
                return;
            }

            if (!vm.document.docType || !vm.document.docType.id) {
                toastr.error('Bạn vui lòng chọn loại tài liệu.', 'Thông báo');
                return;
            }

            service.saveDocument(vm.document, function success() {
                toastr.info('Bạn đã lưu thành công thông tin tài liệu.', 'Thông báo');

                // reload grids
                vm.getDocuments();
            }, function failure() {
                toastr.error('Có lỗi xảy ra khi lưu tài liệu.', 'Thông báo');
            }).then(function () {
                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Download document
         * @param id
         */
        $scope.downloadDocument = function (id) {
            blockUI.start();
            service.downloadDocument(id).success(function (data, status, headers, config) {
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
                console.log(data);
            });
        };

        /**
         * Delete selected documents
         */
        vm.deleteDocuments = function() {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_delete_modal.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm === 'yes') {
                    service.deleteDocuments(vm.selectedDocuments, function success() {

                        // Refresh the grid
                        vm.getDocuments();

                        // Notify
                        toastr.info('Bạn đã xoá thành công ' + vm.selectedDocuments.length + ' bản ghi.', 'Thông báo');

                        // Clear selected productTypes
                        vm.selectedDocuments = [];
                    }, function failure() {
                        toastr.error('Có lỗi xảy ra khi xoá các bản ghi đã chọn.', 'Thông báo');
                    });
                }
            });
        };

        //// Upload file
        vm.MAX_FILE_SIZE = settings.upload.maxFilesize;
        vm.uploadedFile = null;
        vm.errorFile = null;
        vm.selectedDocType = null;
        vm.documentTypes = [];

        docTypeService.getAllDocumentTypes().then(function (data) {
            if (data && data.length > 0) {
                vm.documentTypes = data;
                vm.selectedDocType = vm.documentTypes[0];
            } else {
                vm.documentTypes = [];
                vm.selectedDocType = null;
            }
        });

        vm.uploadFiles = function (file, errFiles) {
            vm.uploadedFile = file;
            vm.errorFile = errFiles && errFiles[0];
        };

        vm.startUploadFile = function (file) {
            if (vm.selectedDocType == null || !vm.selectedDocType.id || !utils.isPositive(vm.selectedDocType.id)) {
                toastr.error('Please specify the document type.', 'Error');
                return;
            }

            if (file) {
                var url = settings.api.baseUrl + settings.api.apiV1Url + 'document/upload/';
                url += '/';
                url += vm.selectedDocType.id;

                file.upload = Upload.upload({
                    url: url,
                    data: {file: file}
                }).progress(function (evt) {
                    vm.uploadedFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    if (data && utils.isPositive(data.id)) {
                        // vm.event = data;

                        // reload grid
                        vm.getDocuments();
                    }
                });
            }
        };
    }

})();
