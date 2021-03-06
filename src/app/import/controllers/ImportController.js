/**
 * Created by bizic on 28/8/2016.
 */
// import {geojson} from "../../assets/scripts/external/highcharts-shapes-vn-all";

(function () {
    'use strict';

    angular.module('PDMA.Import').controller('ImportController', ImportController);

    ImportController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$uibModal',
        'toastr',
        'Utilities',
        'ImportService',
        'Upload',
        'focusFlatPick',
        'openSelectBox'
    ];

    function ImportController($rootScope, $scope, $state, blockUI, $timeout, settings, modal, toastr, utils, service, Uploader, focusFlatPick, openSelectBox) {
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

            // todo if necessary check if the current user is allowed to access this page
        });

        var vm = this;

        vm.report = {orgIds: []};

        $scope.MAX_FILE_SIZE = "5MB";
        $scope.f = null;
        $scope.errFile = null;
        $scope.uploadFiles = function (file, errFiles) {
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
        };

        // importPE
        vm.importPE = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startUploadFilePE($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };


        vm.startHTSNew = function (file) {
            blockUI.start();
            let successHandler = function (data, status, headers, config) {
                blockUI.stop();
                //headers = headers();

                let filename = "hts_import_result";
                let contentType ="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                let linkElement = document.createElement('a');
                try {
                    blockUI.stop();
                    let blob = new Blob([data.data], {type: contentType});
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
                    blockUI.stop();
                    console.log(ex);
                }
            };
            var func = "htscase/importExcelNew";
            if (file) {
                
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                    responseType: 'arraybuffer'
                });
                file.upload.then(successHandler,
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    });
            }

            
            
            //blockUI.start();
            // service.importHTSNew(file)
            // .success(successHandler)
            // .error(function () {
            //     blockUI.stop();
            // });
        };

        vm.startUploadFilePE = function (file) {
            //console.log(file);
            //   var func ='file/updateListFromFileImport/3/7';
            var func =
              "pecase/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        console.log("ducduc");
                        console.log(response);
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = [];
                            (response.data.listErr).forEach(element => {
                                if(element.c1) {
                                    let d1 = new Date(element.c1);
                                    element.c1 = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c3) {
                                    if(element.c3 == "MALE") {
                                        element.c3 = 6;
                                    } else if(element.c3 == "FEMALE") {
                                        element.c3 = 7;
                                    }
                                }
                                if(element.c6) {
                                    let c6Convert="";
                                    element.c6.forEach(item => {
                                        if(item.val=="answer1") {
                                            c6Convert+="8,";
                                        } else if(item.val=="answer2") {
                                            c6Convert+="9,";
                                        } else if(item.val=="answer3") {
                                            c6Convert+="10,";
                                        } else if(item.val=="answer4") {
                                            c6Convert+="11,";
                                        } else if(item.val=="answer5") {
                                            c6Convert+="12,";
                                        } else if(item.val=="answer6") {
                                            c6Convert+="13";
                                        }
                                    })
                                    element.c6 = c6Convert;
                                }
                                if(element.c7) {
                                    if(element.c7 == "answer1") {
                                        element.c7 = 24;
                                    } else if(element.c7 == "answer2") {
                                        element.c7 = 25;
                                    } else if(element.c7 == "answer3") {
                                        element.c7 = 26;
                                    } else if(element.c7 == "answer4") {
                                        element.c7 = 27;
                                    } else if(element.c7 == "answer5") {
                                        element.c7 = 28;
                                    }
                                }
                                if(element.c8) {
                                    if(element.c8 == "answer1") {
                                        element.c8 = 29;
                                    } else if(element.c8 == "answer2") {
                                        element.c8 = 30;
                                    } else if(element.c8 == "answer3") {
                                        element.c8 = 31;
                                    }
                                }
                                if(element.c8ARV) {
                                    if(element.c8ARV == "answer1") {
                                        element.c8ARV = 32;
                                    } else if(element.c8ARV == "answer2") {
                                        element.c8ARV = 33;
                                    } else if(element.c8ARV == "answer3") {
                                        element.c8ARV = 34;
                                    }
                                }
                                if(element.c9) {
                                    if(element.c9 == "YES") {
                                        element.c9 = 4;
                                    } else if(element.c9 == "NO") {
                                        element.c9 = 3;
                                    }
                                }
                                if(element.c9Date) {
                                    let d1 = new Date(element.c9Date);
                                    element.c9Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c10) {
                                    if(element.c10 == "YES") {
                                        element.c10 = 4;
                                    } else if(element.c10 == "NO") {
                                        element.c10 = 3;
                                    }
                                }
                                if(element.c11) {
                                    if(element.c11 == "YES") {
                                        element.c11 = 4;
                                    } else if(element.c11 == "NO") {
                                        element.c11 = 3;
                                    }
                                }
                                if(element.c11Date) {
                                    let d1 = new Date(element.c11Date);
                                    element.c11Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c12) {
                                    if(element.c12 == "answer1") {
                                        element.c12 = 35;
                                    } else if(element.c12 == "answer2") {
                                        element.c12 = 36;
                                    } else if(element.c12 == "answer3") {
                                        element.c12 = 37;
                                    } else if(element.c12 == "answer4") {
                                        element.c12 = 38;
                                    }
                                }
                                if(element.c12Note) {
                                    if(element.c12Note == "answer1") {
                                        element.c12Note = 39;
                                    } else if(element.c12Note == "answer2") {
                                        element.c12Note = 40;
                                    } else if(element.c12Note == "answer3") {
                                        element.c12Note = 41;
                                    }
                                }
                                if(element.c13) {
                                    if(element.c13 == "answer1") {
                                        element.c13 = 43;
                                    } else if(element.c13 == "answer2") {
                                        element.c13 = 44;
                                    } else if(element.c13 == "answer3") {
                                        element.c13 = 45;
                                    } else if(element.c13 == "answer4") {
                                        element.c13 = 46;
                                    }
                                }
                                if(element.c131) {
                                    if(element.c131 == "YES") {
                                        element.c131 = 4;
                                    } else if(element.c131 == "NO") {
                                        element.c131 = 3;
                                    }
                                }
                                if(element.c131Result) {
                                    if(element.c131Result == "answer1") {
                                        element.c131Result = 43;
                                    } else if(element.c131Result == "answer2") {
                                        element.c131Result = 45;
                                    } else if(element.c131Result == "answer3") {
                                        element.c131Result = 46;
                                    } else if(element.c131Result == "answer4") {
                                        element.c131Result = 47;
                                    }
                                }
                                if(element.c14) {
                                    if(element.c14 == "YES") {
                                        element.c14 = 4;
                                    } else if(element.c14 == "NO") {
                                        element.c14 = 3;
                                    }
                                }
                                if(element.c14Date) {
                                    let d1 = new Date(element.c14Date);
                                    element.c14Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c15) {
                                    if(element.c15 == "YES") {
                                        element.c15 = 4;
                                    } else if(element.c15 == "NO") {
                                        element.c15 = 3;
                                    }
                                }
                                if(element.c15Date) {
                                    let d1 = new Date(element.c15Date);
                                    element.c15Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c16) {
                                    if(element.c16 == "answer1") {
                                        element.c16 = 81;
                                    } else if(element.c16 == "answer2") {
                                        element.c16 = 82;
                                    } else if(element.c16 == "answer3") {
                                        element.c16 = 83;
                                    }
                                }
                                if(element.c132) {
                                    if(element.c132 == "answer1") {
                                        element.c132 = 193;
                                    } else if(element.c132 == "answer2") {
                                        element.c132 = 194;
                                    } else if(element.c132 == "answer3") {
                                        element.c132 = 195;
                                    }
                                }

                                vm.listErrs.push(element);
                            });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrPE.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };

        // importHTS
        vm.importHTS = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startUploadFileHTS($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };
        
        // importHTS update cmnd
        vm.importHTSToUpdateIdentityCard = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startUploadFileHTSUpdateIdentityCard($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.importHTSNew = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startHTSNew($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.startUploadFileHTS = function (file) {
            //console.log(file);
            //   var func ='file/updateListFromFileImport/3/7';
            var func = "htscase/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            // vm.listErrs = response.data.listErr;
                            vm.listErrs = [];
                            (response.data.listErr).forEach(element => {
                                if(element.c4) {
                                    let d1 = new Date(element.c4);
                                    element.c4 = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c5) {
                                    if(element.c5 == "answer1") {
                                        element.c5 = 48;
                                    } else if(element.c5 == "answer2") {
                                        element.c5 = 49;
                                    }
                                }
                                if(element.c5Note) {
                                    if(element.c5Note == "answer1") {
                                        element.c5Note = 151;
                                    } else if(element.c5Note == "answer2") {
                                        element.c5Note = 152;
                                    } else if(element.c5Note == "answer3") {
                                        element.c5Note = 153;
                                    } else if(element.c5Note == "answer4") {
                                        element.c5Note = 154;
                                    } else if(element.c5Note == "answer5") {
                                        element.c5Note = 155;
                                    } else if(element.c5Note == "answer6") {
                                        element.c5Note = 156;
                                    }
                                }
                                if(element.c7) {
                                    if(element.c7 == "MALE") {
                                        element.c7 = 6;
                                    } else if(element.c7 == "FEMALE") {
                                        element.c7 = 7;
                                    }
                                }
                                if(element.c9) {
                                    let c9Convert="";
                                    element.c9.forEach(item => {
                                        if(item.val=="answer1") {
                                            c9Convert+="8,";
                                        } else if(item.val=="answer2") {
                                            c9Convert+="9,";
                                        } else if(item.val=="answer3") {
                                            c9Convert+="10,";
                                        } else if(item.val=="answer4") {
                                            c9Convert+="11,";
                                        } else if(item.val=="answer5") {
                                            c9Convert+="12,";
                                        } else if(item.val=="answer6") {
                                            c9Convert+="13,";
                                        } else if(item.val=="answer7") {
                                            c9Convert+="14,";
                                        } else if(item.val=="answer8") {
                                            c9Convert+="15,";
                                        } else if(item.val=="answer9") {
                                            c9Convert+="16,";
                                        } else if(item.val=="answer10") {
                                            c9Convert+="17,";
                                        } else if(item.val=="answer11") {
                                            c9Convert+="18,";
                                        } else if(item.val=="answer12") {
                                            c9Convert+="19,";
                                        } else if(item.val=="answer13") {
                                            c9Convert+="20,";
                                        } else if(item.val=="answer14") {
                                            c9Convert+="21,";
                                        } else if(item.val=="answer15") {
                                            c9Convert+="22,";
                                        } else if(item.val=="answer16") {
                                            c9Convert+="23,";
                                        }
                                    })
                                    element.c9 = c9Convert;
                                }
                                if(element.c10) {
                                    if(element.c10 == "answer1") {
                                        element.c10 = 50;
                                    } else if(element.c10 == "answer2") {
                                        element.c10 = 51;
                                    } else if(element.c10 == "answer3") {
                                        element.c10 = 52;
                                    } else if(element.cc10 == "answer4") {
                                        element.c10 = 53;
                                    }
                                }
                                if(element.c11) {
                                    if(element.c11 == "YES") {
                                        element.c11 = 4;
                                    } else if(element.c11 == "NO") {
                                        element.c11 = 3;
                                    }
                                }
                                if(element.c11a) {
                                    if(element.c11a == "answer1") {
                                        element.c11a = 54;
                                    } else if(element.c11a == "answer2") {
                                        element.c11a = 55;
                                    } else if(element.c11a == "answer3") {
                                        element.c11a = 56;
                                    }
                                }
                                if(element.c11b) {
                                    if(element.c11b == "answer1") {
                                        element.c11b = 57;
                                    } else if(element.c11b == "answer2") {
                                        element.c11b = 58;
                                    } else if(element.c11b == "answer3") {
                                        element.c11b = 59;
                                    }
                                }
                                if(element.c11c) {
                                    if(element.c11c == "YES") {
                                        element.c11c = 4;
                                    } else if(element.c11c == "NO") {
                                        element.c11c = 3;
                                    }
                                }
                                if(element.c12) {
                                    if(element.c12 == "answer1") {
                                        element.c12 = 60;
                                    } else if(element.c12 == "answer2") {
                                        element.c12 = 61;
                                    } else if(element.c12 == "answer3") {
                                        element.c12 = 62;
                                    } else if(element.c12 == "answer4") {
                                        element.c12 = 63;
                                    }
                                }
                                if(element.c131) {
                                    if(element.c131 == "answer1") {
                                        element.c131 = 64;
                                    } else if(element.c131 == "answer2") {
                                        element.c131 = 65;
                                    }
                                }
                                if(element.c132) {
                                    if(element.c132 == "answer1") {
                                        element.c132 = 66;
                                    } else if(element.c132 == "answer2") {
                                        element.c132 = 67;
                                    } else if(element.c132 == "answer3") {
                                        element.c132 = 68;
                                    }
                                }
                                if(element.c14) {
                                    if(element.c14 == "answer1") {
                                        element.c14 = 69;
                                    } else if(element.c14 == "answer2") {
                                        element.c14 = 70;
                                    } else if(element.c14 == "answer3") {
                                        element.c14 = 71;
                                    } else if(element.c14 == "answer4") {
                                        element.c14 = 196;
                                    }
                                }
                                if(element.c15) {
                                    if(element.c15 == "YES") {
                                        element.c15 = 4;
                                    } else if(element.c15 == "NO") {
                                        element.c15 = 3;
                                    }
                                }
                                if(element.c15Date) {
                                    let d1 = new Date(element.c15Date);
                                    element.c15Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c1627) {
                                    if(element.c1627 == "YES") {
                                        element.c1627 = 4;
                                    } else if(element.c1627 == "NO") {
                                        element.c1627 = 3;
                                    }
                                }
                                if(element.c1627Date) {
                                    let d1 = new Date(element.c1627Date);
                                    element.c1627Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c17) {
                                    if(element.c17 == "answer1") {
                                        element.c17 = 72;
                                    } else if(element.c17 == "answer2") {
                                        element.c17 = 73;
                                    } else if(element.c17 == "answer3") {
                                        element.c17 = 74;
                                    }
                                }
                                if(element.c18) {
                                    if(element.c18 == "answer1") {
                                        element.c18 = 75;
                                    } else if(element.c18 == "answer2") {
                                        element.c18 = 76;
                                    } else if(element.c18 == "answer3") {
                                        element.c18 = 77;
                                    } else if(element.c18 == "answer4") {
                                        element.c18 = 192;
                                    }
                                }
                                if(element.c19Date) {
                                    let d1 = new Date(element.c19Date);
                                    element.c19Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c20) {
                                    if(element.c20 == "answer1") {
                                        element.c20 = 78;
                                    } else if(element.c20 == "answer2") {
                                        element.c20 = 79;
                                    } else if(element.c20 == "answer3") {
                                        element.c20 = 80;
                                    }
                                }
                                if(element.c20RegDate) {
                                    let d1 = new Date(element.c20RegDate);
                                    element.c20RegDate = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c21) {
                                    if(element.c21 == "YES") {
                                        element.c21 = 4;
                                    } else if(element.c21 == "NO") {
                                        element.c21 = 3;
                                    }
                                }
                                if(element.c21Date) {
                                    let d1 = new Date(element.c21Date);
                                    element.c21Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c22) {
                                    if(element.c22 == "YES") {
                                        element.c22 = 4;
                                    } else if(element.c22 == "NO") {
                                        element.c22 = 3;
                                    }
                                }
                                if(element.c24) {
                                    if(element.c24 == "answer1") {
                                        element.c24 = 81;
                                    } else if(element.c24 == "answer2") {
                                        element.c24 = 82;
                                    } else if(element.c24 == "answer3") {
                                        element.c24 = 83;
                                    }
                                }
                                if(element.c25) {
                                    if(element.c25 == "YES") {
                                        element.c25 = 4;
                                    } else if(element.c25 == "NO") {
                                        element.c25 = 3;
                                    }
                                }
                                if(element.c26) {
                                    if(element.c26 == "answer1") {
                                        element.c26 = 193;
                                    } else if(element.c26 == "answer2") {
                                        element.c26 = 194;
                                    } else if(element.c26 == "answer3") {
                                        element.c26 = 195;
                                    }
                                }
                                if(element.c28) {
                                    if(element.c28 == "answer1") {
                                        element.c28 = 197;
                                    } else if(element.c28 == "answer2") {
                                        element.c28 = 198;
                                    } else if(element.c28 == "answer3") {
                                        element.c28 = 199;
                                    } else if(element.c28 == "answer4") {
                                        element.c28 = 200;
                                    }
                                }

                                vm.listErrs.push(element);
                            });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrHTS.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };
        
        vm.startUploadFileHTSUpdateIdentityCard = function (file) {
            var func = "htscase/importExcelToUpdateIdentityCard";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = response.data.listErr;

                            vm.modalInstanceListErr = modal.open({
                                animation: true,
                                templateUrl: "listDataImportErrHTSUpdateIdentityCard.html",
                                scope: $scope,
                                backdrop: "static",
                                keyboard: false,
                                windowClass: "customer-modal-lg",
                                size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };

        //importPNS
        vm.importPNS = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startUploadFilePNS($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.startUploadFilePNS = function (file) {
            var func = "pnscase/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = [];
                            (response.data.listErr).forEach(element => {
                                if(element.c6) {
                                    if(element.c6 == "YES") {
                                        element.c6 = 4;
                                    } else if(element.c6 == "NO") {
                                        element.c6 = 3;
                                    }
                                }
                                if(element.c5) {
                                    let d1 = new Date(element.c5);
                                    element.c5 = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c6Date) {
                                    let d1 = new Date(element.c6Date);
                                    element.c6Date = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c8) {
                                    if(element.c8 == "MALE") {
                                        element.c8 = 6;
                                    } else if(element.c8 == "FEMALE") {
                                        element.c8 = 7;
                                    }
                                }
                                if(element.c10) {
                                    let d1 = new Date(element.c10);
                                    element.c10 = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c11) {
                                    if(element.c11 == "answer1") {
                                        element.c11 = 157;
                                    } else if(element.c11 == "answer2") {
                                        element.c11 = 158;
                                    } else if(element.c11 == "answer3") {
                                        element.c11 = 159;
                                    } else if(element.c11 == "answer4") {
                                        element.c11 = 160;
                                    } else if(element.c11 == "answer5") {
                                        element.c11 = 161;
                                    } else if(element.c11 == "answer6") {
                                        element.c11 = 162;
                                    } else if(element.c11 == "answer7") {
                                        element.c11 = 163;
                                    }
                                }
                                if(element.c12) {
                                    let c12Convert="";
                                    element.c12.forEach(item => {
                                        if(item.val=="answer1") {
                                            c12Convert+="8,";
                                        } else if(item.val=="answer2") {
                                            c12Convert+="9,";
                                        } else if(item.val=="answer3") {
                                            c12Convert+="10,";
                                        } else if(item.val=="answer4") {
                                            c12Convert+="11,";
                                        } else if(item.val=="answer5") {
                                            c12Convert+="12,";
                                        } else if(item.val=="answer6") {
                                            c12Convert+="13,";
                                        } else if(item.val=="answer7") {
                                            c12Convert+="14,";
                                        } else if(item.val=="answer8") {
                                            c12Convert+="15,";
                                        } else if(item.val=="answer9") {
                                            c12Convert+="16,";
                                        } else if(item.val=="answer10") {
                                            c12Convert+="17,";
                                        } else if(item.val=="answer11") {
                                            c12Convert+="18,";
                                        } else if(item.val=="answer12") {
                                            c12Convert+="19,";
                                        } else if(item.val=="answer13") {
                                            c12Convert+="20,";
                                        } else if(item.val=="answer14") {
                                            c12Convert+="21,";
                                        } else if(item.val=="answer15") {
                                            c12Convert+="22,";
                                        } else if(item.val=="answer16") {
                                            c12Convert+="23,";
                                        }
                                    })
                                    element.c12 = c12Convert;
                                }
                                vm.listErrs.push(element);
                            });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrPNS.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };

        //importPNSContact
        vm.importPNSContact = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") { 
                        blockUI.start();
                        vm.startUploadFilePNSContact($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.startUploadFilePNSContact = function (file) {
            var func = "pnscase_contact/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = [];
                            (response.data.listErr).forEach(element => {
                                if(element.gender) {
                                    if(element.gender == "MALE") {
                                        element.gender = 6;
                                    } else if(element.gender == "FEMALE") {
                                        element.gender = 7;
                                    }
                                }
                                if(element.c1receivedInfoDate) {
                                    let d1 = new Date(element.c1receivedInfoDate);
                                    element.c1receivedInfoDate = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c2) {
                                    if(element.c2 == "answer1") {
                                        element.c2 = 174;
                                    } else if(element.c2 == "answer2") {
                                        element.c2 = 175;
                                    }
                                }
                                if(element.c3) {
                                    if(element.c3 == "YES") {
                                        element.c3 = 4;
                                    } else if(element.c3 == "NO") {
                                        element.c3 = 3;
                                    }
                                }
                                if(element.c4First) {
                                    let d1 = new Date(element.c4First);
                                    element.c4First = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c4Second) {
                                    let d1 = new Date(element.c4Second);
                                    element.c4Second = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c4Third) {
                                    let d1 = new Date(element.c4Third);
                                    element.c4Third = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c5) {
                                    if(element.c5 == "YES") {
                                        element.c5 = 4;
                                    } else if(element.c5 == "NO") {
                                        element.c5 = 3;
                                    }
                                }
                                if(element.c5Reason) {
                                    if(element.c5Reason == "answer1") {
                                        element.c5Reason = 176;
                                    } else if(element.c5Reason == "answer2") {
                                        element.c5Reason = 177;
                                    } else if(element.c5Reason == "answer3") {
                                        element.c5Reason = 178;
                                    }
                                }
                                if(element.c6) {
                                    if(element.c6 == "answer1") {
                                        element.c6 = 180;
                                    } else if(element.c6 == "answer2") {
                                        element.c6 = 181;
                                    } else if(element.c6 == "answer3") {
                                        element.c6 = 182;
                                    } else if(element.c6 == "answer4") {
                                        element.c6 = 183;
                                    }
                                }
                                if(element.c7) {
                                    if(element.c7 == "answer1") {
                                        element.c7 = 184;
                                    } else if(element.c7 == "answer2") {
                                        element.c7 = 185;
                                    } else if(element.c7 == "answer3") {
                                        element.c7 = 186;
                                    } else if(element.c7 == "answer4") {
                                        element.c7 = 187;
                                    } else if(element.c7 == "answer5") {
                                        element.c7 = 188;
                                    }
                                }
                                if(element.c8) {
                                    if(element.c8 == "answer1") {
                                        element.c8 = 189;
                                    } else if(element.c8 == "answer2") {
                                        element.c8 = 190;
                                    } else if(element.c8 == "answer3") {
                                        element.c8 = 191;
                                    }
                                }
                                if(element.c8LabtestDate) {
                                    let d1 = new Date(element.c8LabtestDate);
                                    element.c8LabtestDate = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c9) {
                                    if(element.c9 == "answer1") {
                                        element.c9 = 44;
                                    } else if(element.c9 == "answer2") {
                                        element.c9 = 45;
                                    } else if(element.c9 == "answer3") {
                                        element.c9 = 46;
                                    } else if(element.c9 == "answer4") {
                                        element.c9 = 179;
                                    }
                                }
                                if(element.c9JoinedPrEP) {
                                    if(element.c9JoinedPrEP == "YES") {
                                        element.c9JoinedPrEP = 4;
                                    } else if(element.c9JoinedPrEP == "NO") {
                                        element.c9JoinedPrEP = 3;
                                    }
                                }
                                if(element.c9PrEPDate) {
                                    let d1 = new Date(element.c9PrEPDate);
                                    element.c9PrEPDate = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c9JoinedARV) {
                                    if(element.c9JoinedARV == "YES") {
                                        element.c9JoinedARV = 4;
                                    } else if(element.c9JoinedARV == "NO") {
                                        element.c9JoinedARV = 3;
                                    }
                                }
                                if(element.c9ARVDate) {
                                    let d1 = new Date(element.c9ARVDate);
                                    element.c9ARVDate = moment(d1).format("MM/DD/YYYY");
                                }
                                if(element.c1) {
                                    let c1Convert="";
                                    element.c1.forEach(item => {
                                        if(item.val=="answer1") {
                                            c1Convert+="169,";
                                        } else if(item.val=="answer2") {
                                            c1Convert+="170,";
                                        } else if(item.val=="answer3") {
                                            c1Convert+="171,";
                                        } else if(item.val=="answer4") {
                                            c1Convert+="172,";
                                        } else if(item.val=="answer5") {
                                            c1Convert+="173,";
                                        }
                                    })
                                    element.c1 = c1Convert;
                                }
                                vm.listErrs.push(element);
                            });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrPNSContact.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };

        // importStaff
        vm.importStaff = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") {
                        blockUI.start();
                        vm.startUploadFileStaff($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.startUploadFileStaff = function (file) {
            var func = "staff/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = response.data.listErr;
                            // vm.listErrs = [];
                            // (response.data.listErr).forEach(element => {
                                
                            //     vm.listErrs.push(element);
                            // });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrStaff.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };
        
        // importOrg
        vm.importOrg = function () {
            var modalInstance = modal.open({
              animation: true,
              templateUrl: "import_modal.html",
              scope: $scope,
              size: "md",
              backdrop: false,
            });
            $scope.f = null;
            $scope.errFile = null;
      
            modalInstance.result.then(
                function (confirm) {
                    if (confirm == "yes") {
                        blockUI.start();
                        vm.startUploadFileOrg($scope.f);
                        console.log($scope.f);
                    }
                },
                function () {
                    console.log("cancel");
                }
            );
        };

        vm.startUploadFileOrg = function (file) {
            var func = "organization/importExcel";
            if (file) {
                file.upload = Uploader.upload({
                    url: settings.api.baseUrl + settings.api.apiV1Url + func,
                    data: { uploadfile: file },
                });
                file.upload.then(
                    function (response) {
                        //   debugger
                        file.result = response.data;
                        if (
                            response.data.listErr != null &&
                            response.data.listErr.length > 0
                        ) {
                            vm.listErrs = [];
                            (response.data.listErr).forEach(element => {
                                if(element.active == true || element.active == false) {
                                    if(element.active == true) {
                                        element.active = 1;
                                    } else if(element.active == false) {
                                        element.active = 0;
                                    }
                                }
                                
                                vm.listErrs.push(element);
                            });
                            console.log("anh duc");
                            console.log(vm.listErrs);
                            vm.modalInstanceListErr = modal.open({
                            animation: true,
                            templateUrl: "listDataImportErrOrg.html",
                            scope: $scope,
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "customer-modal-lg",
                            size: "lg",
                            });
                            blockUI.stop();
                        } else if(response.data.totalErr > 0) {
                            blockUI.stop();
                            toastr.error('Import l???i', 'Th??ng b??o');
                        } else {
                            blockUI.stop();
                            toastr.info('Import th??nh c??ng', 'Th??ng b??o');
                        }
                    },
                    function errorCallback(response) {
                        blockUI.stop();
                        toastr.error('Import l???i', 'Th??ng b??o');
                    }
                );
            }
        };

    }

})();
