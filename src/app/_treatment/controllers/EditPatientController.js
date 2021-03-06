/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('EditPatientController', EditPatientController);

    EditPatientController.$inject = [
        '$rootScope',
        '$scope',
        '$q',
        '$http',
        '$state',
        '$timeout',
        '$stateParams',
        'settings',
        '$uibModal',
        'blockUI',
        'bsTableAPI',
        'toastr',
        '$cookies',
        'Utilities',
        'focus',
        'focusFlatPick',
        'openSelectBox',

        'AdminUnitService',
        'HIVConfirmLabService',
        'RegimenService',
        'TreatmentService',
        'DictionaryService',
        'OrganizationService',
        'PatientService',
    ];

    function EditPatientController($rootScope, $scope, $q, $http, $state, $timeout, $stateParams, settings, modal, blockUI, bsTableAPI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, auService, labService, regimenService, treatmentService, dicService, orgService, service) {
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

            if (!$scope.isSiteManager($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                $state.go('application.treatment_reporting');
            }
        });

        let vm = this;

        vm.entry = {
            theCase: {
                person: {}
            },
            organization: {}
        };

        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.opcs = [];

        vm.provinces = [];
        vm.districts = [];

        vm.confirmLabs = [];
        vm.regimens = [];

        vm.caseAddress = {};
        vm.addressFilter1 = {
            provinces: [],
            districts: [],
            communes: [],
        };
        vm.addressFilter2 = {
            provinces: [],
            districts: [],
            communes: [],
        };
        vm.occupations = [
            {id: 1, name: 'D?????i 6 tu???i'},
            {id: 2, name: 'H???c sinh/sinh vi??n'},
            {id: 3, name: 'Ngh??? h???c'},
            {id: 4, name: 'L???c l?????ng v?? trang'},
            {id: 5, name: 'C??ng nh??n vi??n ch???c'},
            {id: 6, name: '??i l??m c??ng ty c?? h???p ?????ng'},
            {id: 7, name: 'L??m ngh??? t??? do'},
            {id: 8, name: 'Th???t nghi???p'},
            {id: 9, name: 'Ngh??? kh??c'}
        ];
        vm.genders = [{id: 'MALE', name: 'Nam'}, {id: 'FEMALE', name: 'N???'}, {
            id: 'TRANSGENDER',
            name: 'Chuy???n gi???i'
        }, {id: 'OTHER', name: 'Kh??ng r??'}];
        vm.enrollmentTypes = [{id: 'NEWLY_ENROLLED', name: '????ng k?? m???i'}, {
            id: 'RETURNED',
            name: '??i???u tr??? l???i'
        }, {id: 'TRANSFERRED_IN', name: 'Chuy???n t???i'}];

        vm.patientStatuses = [
            {id: 'ACTIVE', name: '??ang ???????c qu???n l??'},
            {id: 'LTFU', name: '???? b??? tr???'},
            {id: 'DEAD', name: '???? t??? vong'},
            {id: 'TRANSFERRED_OUT', name: '???? chuy???n ??i'}
        ];

        vm.ethnics = [];

        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Ch???n ng??y..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: true,
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ]
        };

        // For DOB selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                // defaultDate: moment(moment(new Date()).add(-20, 'years').year() + '-06-15', 'YYYY-MM-DD').toDate(),
                // onReady: function () {
                //     const m = moment(vm.datepicker1.dateOpts.defaultDate);
                //     if (!vm.entry.id) {
                //         vm.entry.person.dob = m.add(7, 'hours').toDate();
                //     }
                // },
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.theCase.person.dob = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.theCase.person && vm.entry.theCase.person.dob) {
                    fpItem.setDate(moment(vm.entry.theCase.person.dob).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.theCase.person.dob = null;
                }
            }
        };

        // For HIV confirm date selection
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.theCase.hivConfirmDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.theCase.hivConfirmDate) {
                    fpItem.setDate(moment(vm.entry.theCase.hivConfirmDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.entry.theCase.hivConfirmDate = null;
                }
            }
        };

        // For ARV Initiation date selection
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.entry.theCase.arvStartDate = m.add(7, 'hours').toDate();

                        if (!vm.entry.startDate) {
                            vm.entry.startDate = vm.entry.theCase.arvStartDate;
                            vm.datepicker7.setDate(vm.entry.startDate);
                        }

                        if (!vm.entry.theCase.currentArvRegimenStartDate) {
                            vm.entry.theCase.currentArvRegimenStartDate = vm.entry.theCase.arvStartDate;
                            vm.datepicker5.setDate(vm.entry.theCase.currentArvRegimenStartDate);
                        }
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.entry.theCase.arvStartDate != null) {
                    fpItem.setDate(moment(vm.entry.theCase.arvStartDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.entry.theCase.arvStartDate = null;
                }
            }
        };

        // For end date at current OPC selection
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.endDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;
                if (vm.entry.endDate) {
                    fpItem.setDate(moment(vm.entry.endDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.clear();
                    vm.entry.endDate = null;
                }
            }
        };

        // For selecting start date of current ARV regimen
        vm.datepicker5 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.theCase.currentArvRegimenStartDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker5.fpItem = fpItem;
                if (vm.entry.theCase.currentArvRegimenStartDate) {
                    fpItem.setDate(moment(vm.entry.theCase.currentArvRegimenStartDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker5.fpItem) {
                    vm.datepicker5.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker5.fpItem) {
                    vm.datepicker5.fpItem.clear();
                    vm.entry.theCase.currentArvRegimenStartDate = null;
                }
            }
        };

        // For HIV screen date selection
        vm.datepicker6 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.theCase.hivScreenDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker6.fpItem = fpItem;
                if (vm.entry.theCase.hivScreenDate) {
                    fpItem.setDate(moment(vm.entry.theCase.hivScreenDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker6.fpItem) {
                    vm.datepicker6.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker6.fpItem) {
                    vm.datepicker6.fpItem.clear();
                    vm.entry.theCase.hivScreenDate = null;
                }
            }
        };

        // Start date of the case-org
        vm.datepicker7 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.startDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker7.fpItem = fpItem;
                if (vm.entry.startDate) {
                    fpItem.setDate(moment(vm.entry.startDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker7.fpItem) {
                    vm.datepicker7.fpItem.setDate(moment(date).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker7.fpItem) {
                    vm.datepicker7.fpItem.clear();
                    vm.entry.startDate = null;
                }
            }
        };

        /**
         * Get dictionary entries
         */
        blockUI.start();
        dicService.getMultipleEntries([{type: 'ETHNIC'}]).then(function (data) {
            blockUI.stop();
            angular.forEach(data, function (obj) {
                if (obj.type == 'ETHNIC') {
                    vm.ethnics = [];
                    angular.copy(obj.data, vm.ethnics);
                }
            });
        });

        // Get list of OPCs
        blockUI.start();
        orgService.getAllOrganizations({
            provinceIds: null,
            checkUserPermission: true,
            opcSiteOnly: true,
            activeOnly: true,
            compact: true
        }).then(function (data) {
            blockUI.stop();

            // Update the list of organizations for the select list
            vm.opcs = [];
            angular.copy(data, vm.opcs);
        });

        /**
         * Reset case data
         */
        vm.resetCase = function () {

            vm.entry = {
                editable: true,
                theCase: {
                    person: {},
                    sameAddress: true
                },
                organization: null,
            };

            vm.caseAddress = {
                residentAddress: {province: null, district: null},
                currentAddress: {province: null, district: null}
            };

            // focus on patient name
            $timeout(function () {
                focus('vm.entry.theCase.person.fullname');
            }, 300);
        };

        vm.resetCase();

        // Update entry on load
        vm.updateEntryOnLoad = function () {
            vm.entry.theCase.sameAddress = service.isSameAddress(vm.entry.theCase.person);

            if (!vm.entry.id) {
                vm.entry.enrollmentType = vm.enrollmentTypes[0].id;
            }

            // Locations
            vm.caseAddress = {currentAddress: {}, residentAddress: {}};
            if (vm.entry.theCase.person && vm.entry.theCase.person.locations) {
                let curAddress = {};
                let resAddress = {};
                angular.forEach(vm.entry.theCase.person.locations, function (loc) {
                    if (loc.addressType == 'CURRENT_ADDRESS') {
                        angular.copy(loc, curAddress);
                    } else if (loc.addressType == 'RESIDENT_ADDRESS') {
                        angular.copy(loc, resAddress);
                    }
                });

                angular.copy(resAddress, vm.caseAddress.residentAddress);
                angular.copy(curAddress, vm.caseAddress.currentAddress);

                // make sure address ID is correctly maintained
                blockUI.start();
                $timeout(function () {
                    blockUI.stop();
                    vm.caseAddress.residentAddress.id = resAddress.id;
                    vm.caseAddress.currentAddress.id = curAddress.id;
                }, 1000);
            }

            // Check if the entry is editable
            service.checkEditable(vm.entry, $scope.isSiteManager($scope.currentUser));
            console.log(vm.entry);
            if (!vm.entry.editable) {
                if (localStorage.getItem(service.EDIT_PATIENT_ENTRY)) {
                    localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
                }

                $state.go('application.treatment_view_patient', {id: vm.entry.id});
            }

            // Other confirm lab
            if (vm.entry.theCase.confirmLabName && !vm.entry.theCase.confirmLab) {
                vm.entry.theCase.confirmLab = {};
                angular.copy({
                    id: 0,
                    name: 'C?? s??? kh??c',
                    address: {province: {name: '&mdash; Vui l??ng ghi r??'}}
                }, vm.entry.theCase.confirmLab);
            }

            // Workaround for weird issue with datepicker
            if (vm.entry.theCase.person) {
                vm.datepicker1.setDate(moment(vm.entry.theCase.person.dob).add(7, 'hours').toDate());
            }

            if (vm.entry.theCase.hivScreenDate) {
                vm.datepicker6.setDate(moment(vm.entry.theCase.hivScreenDate).add(7, 'hours').toDate());
            }

            if (vm.entry.theCase.hivConfirmDate) {
                vm.datepicker2.setDate(moment(vm.entry.theCase.hivConfirmDate).add(7, 'hours').toDate());
            }

            // if (vm.entry.theCase.arvStartDate) {
            //     vm.datepicker3.setDate(moment(vm.entry.theCase.arvStartDate).add(7, 'hours').toDate());
            // }

            // if (vm.entry.startDate) {
            //     console.log(vm.entry.startDate);
            //     vm.datepicker7.setDate(moment(vm.entry.startDate).add(7, 'hours').toDate());
            // }

            if (vm.entry.endDate) {
                vm.datepicker4.setDate(moment(vm.entry.endDate).add(7, 'hours').toDate());
            }

            if (vm.entry.theCase.currentArvRegimenStartDate) {
                vm.datepicker5.setDate(moment(vm.entry.theCase.currentArvRegimenStartDate).add(7, 'hours').toDate());
            }

            vm.entry.theCase.arvDataEditable = !(vm.entry.id && vm.entry.theCase.arvStartDate && vm.entry.theCase.treatments && vm.entry.theCase.treatments.length > 0);
            vm.entry.theCase.onArv = vm.entry.theCase.arvStartDate != null; // initialized
        };

        vm.loadEntry = function () {
            // check if the recently edited record is in session storage
            let entryObj = localStorage.getItem(service.EDIT_PATIENT_ENTRY);

            if (entryObj) {
                entryObj = JSON.parse(entryObj);

                if (entryObj.id) {
                    blockUI.start();
                    service.getPatient(entryObj.id, function failure() {
                        localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
                        blockUI.stop();
                    }).then(function (data) {
                        vm.entry = data;
                        vm.updateEntryOnLoad();
                        blockUI.stop();
                    });
                } else {
                    vm.entry = entryObj;
                    vm.updateEntryOnLoad();
                }
            } else {
                vm.updateEntryOnLoad();
            }

            // Now check and see if there is an ID on the request path
            let id = $stateParams.id;

            if (!isNaN(id)) {
                id = parseFloat(id);

                if (id) {
                    blockUI.start();
                    service.getPatient(id, function failure() {
                        // do something
                        blockUI.stop();
                    }).then(function (data) {
                        vm.entry = data;
                        vm.updateEntryOnLoad();

                        $timeout(function () {
                            focus('vm.entry.theCase.person.fullname');
                        }, 500);

                        blockUI.stop();
                    });
                }
            }
        };

        // Get all provinces
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();
            if (data) {
                vm.provinces = data;
            } else {
                vm.provinces = [];
            }

            angular.copy(vm.provinces, vm.addressFilter1.provinces);
            angular.copy(vm.provinces, vm.addressFilter2.provinces);
        });

        // Get all HIV Confirm labs
        blockUI.start();
        labService.getAllLabs({}).then(function (data) {
            blockUI.stop();
            vm.confirmLabs = data;

            // Add to beggining of the array
            vm.confirmLabs.unshift({id: -1, name: '---'});
            vm.confirmLabs.unshift({id: 0, name: 'C?? s??? kh??c', address: {province: {name: '&mdash; Vui l??ng ghi r??'}}});
        });

        // Get all ARV regimens
        blockUI.start();
        regimenService.getAllRegimens({disease: {code: 'HIV'}}).then(function (data) {
            blockUI.stop();
            vm.regimens = data;

            // Add to beginning of the array
            vm.regimens.unshift({id: -1, name: '---'});
            vm.regimens.unshift({id: 0, name: 'Ph??c ????? ARV kh??c', description: '&mdash; Vui l??ng ghi r??'});
        });

        /**
         * Close the edit form and return to the list
         */
        vm.closeEditForm = function (toPatientView) {

            vm.avoidDoubleEntry = true; // prevent other processes to start, e.g. when the HIVInfo text input is blurred

            vm.dialog = {
                title: 'H???y nh???p li???u?',
                message: 'B???n c?? th??? ch??a th???c hi???n l??u th??ng tin b???nh nh??n. B???n c?? ch???c ch???n mu???n tho??t kh???i m??n h??nh nh???p li???u kh??ng?',
                callback: function (answer) {
                    if (answer === 'yes') {
                        // clear the object in the session storage
                        if (localStorage.getItem(service.EDIT_PATIENT_ENTRY)) {
                            localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
                        }

                        if (toPatientView && vm.entry.id) {
                            $state.go('application.treatment_view_patient', {id: vm.entry.id});
                        } else {
                            $state.go('application.treatment');
                        }
                    } else {
                        focus('vm.entry.theCase.person.fullname');
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * On selection of HIV confirm lab
         */
        vm.onConfirmLabChange = function () {
            if (vm.entry.theCase.confirmLab && vm.entry.theCase.confirmLab.id == -1) {
                vm.entry.theCase.confirmLab = {};
                angular.copy(vm.confirmLabs[0], vm.entry.theCase.confirmLab);
            }
        };

        /**
         * On selection of current ARV regimen
         */
        vm.onCurrentRegimenChange = function () {
            if (vm.entry.theCase.currentArvRegimen.id == -1) {
                vm.entry.theCase.currentArvRegimen = {};
                angular.copy(vm.regimens[0], vm.entry.theCase.currentArvRegimen);
            }
        };

        /**
         * On ARV status changed
         */
        vm.onArvTxStatusChange = function () {
            if (!vm.entry.theCase.arvDataEditable) {
                vm.entry.theCase.onArv = true;
            }

            if (!vm.entry.theCase.onArv) {
                vm.entry.theCase.arvStartDate = null;
                vm.entry.theCase.currentArvRegimen = null;
                vm.entry.theCase.currentArvRegimenName = null;
                vm.entry.theCase.currentArvRegimenLine = null;
                vm.entry.theCase.currentArvRegimenStartDate = null;
            }
        };

        /**
         * Show entry guide
         */
        vm.showEntryGuide = function () {

            vm.avoidDoubleEntry = true;

            vm.dialog = {
                icon: 'im im-icon-Information',
                title: 'H?????ng d???n nh???p li???u',
                message: '<div class="entry-guide"><div>Khi nh???p li???u th??ng tin b???nh nh??n, b???n c???n l??u ?? nh?? sau:</div><ul><li>C??c tr?????ng th??ng tin <span class="bold">in ?????m</span> b???t bu???c, v?? ph???i nh???p ?????y ?????</li><li>C??c tr?????ng th??ng tin <span class="underline">c?? g???ch ch??n</span> kh??ng b???t bu???c, nh??ng l???i c???n thi???t ????? l???p b??o c??o, v?? v???y c???n ph???i nh???p ????? khi c?? th??ng tin</li><li>C??c tr?????ng th??ng tin kh??ng in ?????m l?? kh??ng b???t bu???c, nh??ng n???u b???n c?? th??ng tin xin vui l??ng nh???p ?????.</li></ul></div>',
                ok: 'OK',
                callback: function (answer) {
                    if (answer == 'ok') {
                        vm.modalInstance.close();
                    }
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'information.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
                vm.avoidDoubleEntry = false;
            });
        };

        /**
         * Double input for HIVInfo ID
         */
        vm.confirmHIVInfoId = function () {

            if (vm.avoidDoubleEntry) {
                return;
            }

            vm.dialog = {
                title: 'X??c nh???n m?? HIVInfo',
                message: 'Vui l??ng nh???p l???i m?? HIVInfo m???t l???n n???a.',
                ok: 'X??c nh???n',
                masked: true,
                cancel: false,
                callback: function (answer) {
                    if (answer == 'ok') {
                        vm.entry.theCase.hivInfoId = vm.entry.theCase.hivInfoId ? vm.entry.theCase.hivInfoId.trim() : null;
                        vm.dialog.input = vm.dialog.input ? vm.dialog.input.trim() : null;

                        if (vm.entry.theCase.hivInfoId !== vm.dialog.input) {
                            vm.dialog.message = 'M?? HIVInfo c???a hai l???n nh???p kh??ng tr??ng nhau. B???n vui l??ng ki???m tra l???i.';
                            vm.modalInstance2 = modal.open({
                                animation: true,
                                templateUrl: 'general_error_modal.html',
                                scope: $scope,
                                size: 'md',
                                backdrop: 'static',
                                keyboard: false
                            });

                            vm.modalInstance2.closed.then(function () {
                                vm.modalInstance.close();

                                vm.entry.theCase.hivInfoId = null;
                                focus('vm.entry.theCase.hivInfoId');
                            });
                        } else {
                            vm.modalInstance.close();
                        }
                    }
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'input.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                focus('vm.dialog.input');
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Save basic information of a patient
         */
        vm.savePatient = function (options) {
            vm.submitDisabled = true;

            if (!vm.opcs || vm.opcs.length <= 0) {
                vm.toggleSubmit();
                return;
            } else if (!vm.entry.id && (!vm.entry.organization || !vm.entry.organization.id)) {
                if (!vm.entry.organization || !vm.entry.organization.id) {
                    toastr.error('B???n vui l??ng ch???n c?? s??? ??i???u tr??? ARV!', 'Th??ng b??o');
                    openSelectBox('vm.entry.organization');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }
            }

            vm.avoidDoubleEntry = true;

            blockUI.start();

            // Check if the entry is editable
            if (!vm.entry.editable) {
                vm.toggleSubmit();
                blockUI.stop();
                vm.closeEditForm(true);
            }

            if (!vm.entry.theCase.person.fullname || vm.entry.theCase.person.fullname.trim().length <= 0) {
                toastr.error('B???n vui l??ng nh???p h??? t??n b???nh nh??n!', 'Th??ng b??o');
                focus('vm.entry.theCase.person.fullname');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            vm.entry.theCase.person.fullname = utils.toTitleCase(vm.entry.theCase.person.fullname);

            let today = new Date();
            let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});
            let mDob = moment(vm.entry.theCase.person.dob || today);

            if (mDob.isSameOrAfter(today, 'day')) {
                toastr.error('Ng??y sinh c???a b???nh nh??n kh??ng h???p l???!', 'Th??ng b??o');
                focusFlatPick('vm.entry.theCase.person.dob');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (!vm.entry.theCase.person.gender) {
                toastr.error('B???n vui l??ng nh???p gi???i t??nh c???a b???nh nh??n!', 'Th??ng b??o');
                openSelectBox('vm.entry.theCase.person.gender');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (vm.entry.theCase.hivInfoId && !vm.entry.theCase.hivInfoId.match(/^[0-9]+$/)) {
                toastr.error('M?? HIVInfo kh??ng h???p l???!', 'Th??ng b??o');
                focus('vm.entry.theCase.hivInfoId');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (vm.entry.theCase.person.nidNumber && !vm.entry.theCase.person.nidNumber.match(/^(?=[0-9]*$)(?:.{9}|.{12})$/)) {
                toastr.error('S??? CMTND/CCCD kh??ng h???p l???!', 'Th??ng b??o');
                focus('vm.entry.theCase.person.nidNumber');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (!vm.caseAddress.currentAddress.province || !vm.caseAddress.currentAddress.province.id) {
                toastr.error('B???n vui l??ng nh???p ?????a ch??? hi???n t???i c???a b???nh nh??n!', 'Th??ng b??o');
                openSelectBox('vm.caseAddress.currentAddress.province');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (!vm.caseAddress.currentAddress.district || !vm.caseAddress.currentAddress.district.id) {
                toastr.error('B???n vui l??ng nh???p ?????a ch??? hi???n t???i c???a b???nh nh??n!', 'Th??ng b??o');
                openSelectBox('vm.caseAddress.currentAddress.district');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (!vm.caseAddress.residentAddress.province || !vm.caseAddress.residentAddress.province.id) {
                toastr.error('B???n vui l??ng nh???p ?????a ch??? theo h??? kh???u c???a b???nh nh??n!', 'Th??ng b??o');
                openSelectBox('vm.caseAddress.residentAddress.province');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (!vm.caseAddress.residentAddress.district || !vm.caseAddress.residentAddress.district.id) {
                toastr.error('B???n vui l??ng nh???p ?????a ch??? theo h??? kh???u c???a b???nh nh??n!', 'Th??ng b??o');
                openSelectBox('vm.caseAddress.residentAddress.district');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            // Title case first word for street address
            if (vm.caseAddress.currentAddress.streetAddress && vm.caseAddress.currentAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.currentAddress.streetAddress = utils.toTitleCase(vm.caseAddress.currentAddress.streetAddress, true);
            }

            if (vm.caseAddress.residentAddress.streetAddress && vm.caseAddress.residentAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.residentAddress.streetAddress = utils.toTitleCase(vm.caseAddress.residentAddress.streetAddress, true);
            }

            vm.caseAddress.currentAddress.addressType = 'CURRENT_ADDRESS';
            vm.caseAddress.residentAddress.addressType = 'RESIDENT_ADDRESS';

            vm.entry.theCase.person.locations = [vm.caseAddress.currentAddress, vm.caseAddress.residentAddress];

            if (!vm.entry.theCase.hivConfirmDate) {
                toastr.error('B???n vui l??ng nh???p ng??y x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                focusFlatPick('vm.entry.theCase.hivConfirmDate');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (mTodayEnd.isBefore(vm.entry.theCase.hivConfirmDate, 'day')) {
                toastr.error('Ng??y x??t nghi???m kh???ng ?????nh HIV+ kh??ng th??? sau ng??y hi???n t???i!', 'Th??ng b??o');
                focusFlatPick('vm.entry.theCase.hivConfirmDate');
                vm.toggleSubmit();
                blockUI.stop();
                vm.avoidDoubleEntry = false;
                return;
            }

            if (vm.entry.theCase.hivScreenDate) {
                let mConfirmDate = moment(vm.entry.theCase.hivConfirmDate);
                if (mConfirmDate.isBefore(vm.entry.theCase.hivScreenDate, 'day')) {
                    toastr.error('Ng??y x??t nghi???m kh???ng ?????nh kh??ng th??? tr?????c ng??y s??ng l???c HIV+!', 'Th??ng b??o');
                    focusFlatPick('vm.entry.theCase.hivConfirmDate');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }
            }

            if (vm.entry.theCase.onArv) {
                if (!vm.entry.theCase.arvStartDate) {
                    toastr.error('B???n vui l??ng nh???p ng??y b???t ?????u ARV!', 'Th??ng b??o');
                    focusFlatPick('vm.entry.theCase.arvStartDate');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }

                if (mTodayEnd.isBefore(vm.entry.theCase.arvStartDate, 'day')) {
                    toastr.error('Ng??y b???t ?????u ARV kh??ng th??? sau ng??y hi???n t???i!', 'Th??ng b??o');
                    focusFlatPick('vm.entry.theCase.arvStartDate');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }

                if (vm.entry.theCase.arvDataEditable) {
                    if (!vm.entry.theCase.currentArvRegimenName || vm.entry.theCase.currentArvRegimenName.trim().length <= 0) {
                        toastr.error('B???n vui l??ng cho bi???t ph??c ????? thu???c ARV hi???n t???i!', 'Th??ng b??o');
                        openSelectBox('vm.entry.theCase.currentArvRegimen');
                        vm.toggleSubmit();
                        blockUI.stop();
                        vm.avoidDoubleEntry = false;
                        return;
                    }

                    if (!vm.entry.theCase.currentArvRegimenLine) {
                        toastr.error('B???n vui l??ng cho bi???t b???c c???a ph??c ????? thu???c ARV hi???n t???i!', 'Th??ng b??o');
                        focus('vm.entry.theCase.currentArvRegimenLine');
                        vm.toggleSubmit();
                        blockUI.stop();
                        vm.avoidDoubleEntry = false;
                        return;
                    }

                    if (!vm.entry.theCase.currentArvRegimenStartDate) {
                        toastr.error('Vui l??ng cho bi???t ng??y b???t ?????u c???a ph??c ????? ARV ???? ch???n!', 'Th??ng b??o');
                        focusFlatPick('vm.entry.theCase.currentArvRegimenStartDate');
                        vm.toggleSubmit();
                        blockUI.stop();
                        vm.avoidDoubleEntry = false;
                        return;
                    }

                    let mCurrentArvRegimenStartDate = moment(vm.entry.theCase.currentArvRegimenStartDate).set({
                        hour: 0,
                        minute: 0,
                        second: 0
                    });

                    let mArvStartDate = moment(vm.entry.theCase.arvStartDate).set({hour: 0, minute: 0, second: 0});
                    if (mCurrentArvRegimenStartDate.isBefore(mArvStartDate)) {
                        toastr.error('Ng??y b???t ?????u c???a ph??c ????? ARV hi???n t???i kh??ng th??? tr?????c ng??y b???t ?????u ??i???u tr??? ARV!', 'Th??ng b??o');
                        focusFlatPick('vm.entry.theCase.currentArvRegimenStartDate');
                        vm.toggleSubmit();
                        blockUI.stop();
                        vm.avoidDoubleEntry = false;
                        return;
                    }
                }
            } else {
                if (vm.entry.theCase.arvDataEditable) {
                    vm.entry.theCase.arvStartDate = null;
                    vm.entry.theCase.currentArvRegimen = null;
                    vm.entry.theCase.currentArvRegimenName = null;
                    vm.entry.theCase.currentArvRegimenLine = null;
                    vm.entry.theCase.currentArvRegimenStartDate = null;
                }
            }

            if (!vm.entry.id) {
                if (!vm.entry.enrollmentType) {
                    toastr.error('B???n vui l??ng ch???n lo???i h??nh ????ng k?? c???a b???nh nh??n!', 'Th??ng b??o');
                    openSelectBox('vm.entry.enrollmentType');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }

                if (!vm.entry.patientChartId || vm.entry.patientChartId.trim().length <= 0) {
                    toastr.error('B???n vui l??ng nh???p m?? b???nh ??n t???i c?? s???!', 'Th??ng b??o');
                    focus('vm.entry.patientChartId');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }

                if (!vm.entry.startDate) {
                    toastr.error('B???n vui l??ng nh???p ng??y b???t ?????u ?????t ??i???u tr??? g???n nh???t t???i c?? s???!', 'Th??ng b??o');
                    focusFlatPick('vm.entry.startDateAtCurrentOPC');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                }

                if (!vm.entry.status) {
                    toastr.error('B???n vui l??ng ch???n tr???ng th??i ??i???u tr??? g???n nh???t c???a b???nh nh??n t???i c?? s???!', 'Th??ng b??o');
                    openSelectBox('vm.entry.latestStatus');
                    vm.toggleSubmit();
                    blockUI.stop();
                    vm.avoidDoubleEntry = false;
                    return;
                } else {
                    if (vm.entry.status != 'ACTIVE') {
                        if (!vm.entry.endDate) {
                            toastr.error('B???n vui l??ng nh???p ng??y b???nh nh??n k???t th??c ?????t ??i???u tr???!', 'Th??ng b??o');
                            focusFlatPick('vm.entry.endDateAtCurrentOPC');
                            vm.toggleSubmit();
                            blockUI.stop();
                            vm.avoidDoubleEntry = false;
                            return;
                        }

                        let mEndDate = moment(vm.entry.endDate);
                        if (mEndDate.isBefore(vm.entry.startDate, 'day')) {
                            toastr.error('Ng??y k???t th??c kh??ng th??? tr?????c ng??y b???t ?????u ?????t ??i???u tr???!', 'Th??ng b??o');
                            focusFlatPick('vm.entry.endDateAtCurrentOPC');
                            vm.toggleSubmit();
                            blockUI.stop();
                            vm.avoidDoubleEntry = false;
                            return;
                        }
                    } else {
                        vm.entry.endDate = null;
                        vm.entry.endingReason = null;
                    }
                }
            }

            vm.entry.theCase.hivConfirmId = utils.toUpperCase(vm.entry.theCase.hivConfirmId);
            vm.entry.theCase.person.nidNumber = utils.toUpperCase(vm.entry.theCase.person.nidNumber);

            // Start submission
            let submission = function () {
                service.savePatient(vm.entry, function success() {
                    toastr.clear();
                    toastr.info('???? l??u th??nh c??ng th??ng tin b???nh nh??n.', 'Th??ng b??o');
                    vm.avoidDoubleEntry = false;

                    // mark the wr case as linked
                    if (vm.entry.theCase.wrCaseId) {
                        service.markAsLinked2OPCAssist({id: vm.entry.theCase.wrCaseId});
                    }

                    vm.toggleSubmit();
                    blockUI.stop();
                }, function failure() {
                    toastr.clear();
                    toastr.error('C?? l???i x???y ra khi l??u th??ng tin b???nh nh??n. Vui l??ng th??? l???i sau.', 'Th??ng b??o');
                    vm.avoidDoubleEntry = false;
                    vm.toggleSubmit();
                    blockUI.stop();
                }).then(function (dto) {

                    if (options.redirect != 1) {
                        vm.resetCase();
                        vm.entry.avoidSessionStorage = true;
                        localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
                    } else {
                        $state.go($state.$current, {id: dto.id}, {reload: true});
                    }

                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }

                    switch (options.redirect) {
                        case 2:
                            // stay for another new patient
                            service.checkEditable(vm.entry, $scope.isSiteManager($scope.currentUser));
                            break;
                        case 3:
                            $state.go('application.treatment');
                            break;
                        case 4:
                            // Go to arv treatment history
                            $state.go('application.treatment_arv_history', {id: dto.id});
                            break;
                    }
                });
            };

            let checkPatientChartId = function () {
                service.patientChartIdExists(vm.entry).then(function (data) {
                    if (data && data.id) {
                        vm.dialog = {message: 'M?? b???nh ??n ???? ???????c s??? d???ng cho b???nh nh??n kh??c c?? t??n <b>' + data.theCase.person.fullname + '</b>. Vui l??ng ki???m tra l???i.'};
                        if (vm.submitDisabled) {
                            vm.toggleSubmit();
                        }

                        blockUI.stop();

                        vm.modalInstance = modal.open({
                            animation: true,
                            templateUrl: 'general_error_modal.html',
                            scope: $scope,
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false
                        });

                        vm.modalInstance.closed.then(function () {
                            vm.dialog = null;
                            focus('vm.entry.patientChartId');
                            vm.avoidDoubleEntry = false;
                        });
                    } else {
                        // finally, submit data after validation...
                        submission();
                    }
                });
            };

            // Check duplicate of national ID number
            let checkNationalId = function () {
                if (vm.entry.theCase.person.nidNumber) {
                    service.nationalIdExists(vm.entry).then(function (data) {
                        if (data) {
                            if (data.result != 0) {
                                vm.dialog = {message: '', shouldDisplay: false};
                                switch (data.result) {
                                    case -1:
                                        checkPatientChartId();
                                        break;
                                    case 1:
                                        vm.dialog.shouldDisplay = true;
                                        vm.dialog.message = 'H??? th???ng t??m th???y m???t b???nh nh??n kh??c ??? c?? s??? c???a b???n c?? s??? CMTND/CCCD t????ng t???. B???n vui l??ng ki???m tra l???i.';
                                        break;
                                    case 2:
                                        vm.dialog.shouldDisplay = true;
                                        vm.dialog.message = 'L??u ??: H??? th???ng t??m th???y m???t b???nh nh??n kh??c (kh??ng thu???c c?? s??? c???a b???n) c?? s??? CMTND/CCCD t????ng t???. B???n c?? th??? ghi ch?? l???i ????? b??o c??o v???i tuy???n t???nh.';
                                        break;
                                }

                                if (vm.dialog.shouldDisplay) {
                                    if (vm.submitDisabled) {
                                        vm.toggleSubmit();
                                    }
                                    blockUI.stop();

                                    vm.modalInstance = modal.open({
                                        animation: true,
                                        templateUrl: 'general_error_modal.html',
                                        scope: $scope,
                                        size: 'md',
                                        backdrop: 'static',
                                        keyboard: false
                                    });

                                    vm.modalInstance.closed.then(function () {
                                        vm.dialog = null;

                                        if (data.result == 2) {
                                            checkPatientChartId();
                                        } else if (data.result == 1) {

                                            // Check for application in Hai Phong only
                                            if (vm.entry.organization && vm.entry.organization.address
                                                && vm.entry.organization.address.province
                                                && vm.entry.organization.address.province.code == 'province_31') {
                                                focus('vm.entry.theCase.person.nidNumber');
                                                vm.avoidDoubleEntry = false;
                                            } else {
                                                checkPatientChartId();
                                            }
                                        }
                                    });
                                }

                            } else {
                                checkPatientChartId();
                            }
                        } else {
                            checkPatientChartId();
                        }
                    });
                } else {
                    checkPatientChartId();
                }
            };

            // Check the duplicate of HIVInfoID and patientChartID
            let checkHivInfoId = function () {
                if (vm.entry.theCase.hivInfoId) {
                    service.hivInfoIdExists(vm.entry).then(function (data) {
                        if (data && data > 0) {
                            vm.dialog = {message: 'M?? HIVInfo ???? ???????c s??? d???ng cho b???nh nh??n kh??c. Vui l??ng ki???m tra l???i.'};
                            if (vm.submitDisabled) {
                                vm.toggleSubmit();
                            }
                            blockUI.stop();

                            vm.modalInstance = modal.open({
                                animation: true,
                                templateUrl: 'general_error_modal.html',
                                scope: $scope,
                                size: 'md',
                                backdrop: 'static',
                                keyboard: false
                            });

                            vm.modalInstance.closed.then(function () {
                                vm.dialog = null;
                                focus('vm.entry.theCase.hivInfoId');
                                vm.avoidDoubleEntry = false;
                            });
                        } else {
                            checkPatientChartId();
                        }
                    });
                } else {
                    checkPatientChartId();
                }
            };

            let checkExistingPatientRecord = function () {
                service.patientRecordExists(vm.entry).then(function (data) {
                    if (data && data.id) {
                        blockUI.stop();
                        if (vm.submitDisabled) {
                            vm.toggleSubmit();
                        }

                        // residential address
                        let existingPatient = {};
                        let newPatient = {};

                        angular.copy(data, existingPatient);
                        angular.copy(vm.entry, newPatient);

                        angular.forEach(existingPatient.theCase.person.locations, function (obj) {
                            if (obj.addressType == 'RESIDENT_ADDRESS') {
                                let address = '';
                                if (obj.province) {
                                    address += obj.province.name;
                                    address += ', ';
                                }

                                if (obj.district) {
                                    address += obj.district.name;
                                    address += ', ';
                                }

                                if (obj.commune) {
                                    address += obj.commune.name;
                                    address += ', ';
                                }

                                if (obj.streetAddress) {
                                    address += obj.streetAddress;
                                }

                                address = address.trim();
                                address = address.endsWith(',') ? address.substr(0, address.length - 1) : address;
                                existingPatient.theCase.resAddress = address;
                            }
                        });
                        angular.forEach(newPatient.theCase.person.locations, function (obj) {
                            if (obj.addressType == 'RESIDENT_ADDRESS') {
                                let address = '';
                                if (obj.province) {
                                    address += obj.province.name;
                                    address += ', ';
                                }

                                if (obj.district) {
                                    address += obj.district.name;
                                    address += ', ';
                                }

                                if (obj.commune) {
                                    address += obj.commune.name;
                                    address += ', ';
                                }

                                if (obj.streetAddress) {
                                    address += obj.streetAddress;
                                }

                                address = address.trim();
                                address = address.endsWith(',') ? address.substr(0, address.length - 1) : address;
                                newPatient.theCase.resAddress = address;
                            }
                        });

                        // check data...
                        vm.dialog = {
                            existingPatient: existingPatient,
                            newPatient: newPatient,
                            callback: function (answer) {
                                vm.modalInstance.close();

                                if (answer == 'yes') {
                                    // checkHivInfoId();
                                    // checkPatientChartId();
                                    checkNationalId();
                                }
                            }
                        };

                        vm.modalInstance = modal.open({
                            animation: true,
                            templateUrl: 'record_found_confirmation.html',
                            scope: $scope,
                            size: 'lg',
                            backdrop: 'static',
                            keyboard: false
                        });

                        vm.modalInstance.closed.then(function () {
                            vm.dialog = {};
                            vm.avoidDoubleEntry = false;
                        });

                    } else {
                        // checkPatientChartId();
                        checkNationalId();
                    }
                });
            };

            if (moment(vm.entry.theCase.arvStartDate).isBefore(vm.entry.theCase.hivConfirmDate)) {
                blockUI.stop();

                vm.dialog = {
                    title: 'C???nh b??o',
                    message: 'Ng??y b???t ?????u ??i???u tr??? ARV c???a b???nh nh??n n??y ??ang s???m h??n ng??y x??t nghi???m kh???ng ?????nh HIV+. B???n c?? ch???c ch???n mu???n l??u th??ng tin kh??ng?',
                    callback: function (answer) {
                        vm.modalInstance.close();

                        if (vm.submitDisabled) {
                            vm.toggleSubmit();
                        }

                        if (answer == 'yes') {
                            // checkHivInfoId();
                            // checkPatientChartId();
                            checkExistingPatientRecord();
                        }
                    }
                };

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'confirmation.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance.closed.then(function () {
                    vm.dialog = {};
                    focusFlatPick('vm.entry.theCase.hivConfirmDate');
                    vm.avoidDoubleEntry = false;
                });

            } else {
                // checkHivInfoId();
                // checkPatientChartId();
                checkExistingPatientRecord();
            }
        };

        // Enable/disable button
        vm.submitDisabled = false;
        vm.toggleSubmit = function () {
            if (vm.submitDisabled) {
                // toastr.clear();
                $timeout(function () {
                    vm.submitDisabled = false;
                }, 1000);
            } else {
                vm.submitDisabled = true;
            }
        };

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (!vm.entry.avoidSessionStorage) {
                // Remove obj from local storage...
                localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
            }
        });

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                if (vm.orgsWritable && vm.orgsWritable.length == 1 && !vm.entry.id && (!vm.entry.organization || !vm.entry.organization.id)) {
                    vm.entry.organization = {};
                    angular.copy(vm.orgsWritable[0], vm.entry.organization);
                }

                // load the entry
                vm.loadEntry();
            }
        });

        $scope.$watch('vm.entry.theCase.person.occupation', function (newVal, oldVal) {
            if (newVal) {
                if (newVal != 9) {
                    vm.entry.theCase.person.occupationName = vm.occupations[newVal - 1].name;
                }
            } else {
                vm.entry.theCase.person.occupationName = null;
            }
        });

        // Watch out for vm.entry.theCase.sameAddress value change
        $scope.$watch('vm.entry.theCase.sameAddress', function (newVal, oldVal) {
            if (!newVal) {
                return;
            }

            let tmp = vm.caseAddress.residentAddress.id;

            vm.caseAddress.residentAddress = {temporaryDisableWatcher: true};
            angular.copy(vm.caseAddress.currentAddress, vm.caseAddress.residentAddress);

            vm.caseAddress.residentAddress.addressType = 'RESIDENT_ADDRESS';
            vm.caseAddress.residentAddress.id = (tmp ? tmp : null);
            vm.caseAddress.residentAddress.temporaryDisableWatcher = false;
        });

        // For current address
        $scope.$watch('vm.caseAddress.currentAddress.province', function (newVal, oldVal) {
            // if (newVal && oldVal && newVal.id == oldVal.id) {
            //     return;
            // }

            vm.addressFilter1.districts = [];
            vm.addressFilter1.communes = [];

            // update residential address if same
            if (vm.entry.theCase.sameAddress) {
                vm.caseAddress.residentAddress.province = {};
                angular.copy(vm.caseAddress.currentAddress, vm.caseAddress.residentAddress);
            }

            if (vm.caseAddress.currentAddress.province && vm.caseAddress.currentAddress.province.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.currentAddress.province.id,
                    excludeVoided: true
                }).then(function (data) {
                    if (data) {
                        vm.addressFilter1.districts = data;
                    } else {
                        vm.addressFilter1.districts = [];
                    }

                    // Set selected district
                    if (vm.caseAddress.currentAddress.district && vm.caseAddress.currentAddress.district.id) {
                        if (utils.indexOf(vm.caseAddress.currentAddress.district, vm.addressFilter1.districts) < 0) {
                            vm.caseAddress.currentAddress.district = null;
                            vm.caseAddress.currentAddress.commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.caseAddress.currentAddress.district', function (newVal, oldVal) {
            // if (newVal && oldVal && newVal.id == oldVal.id) {
            //     return;
            // }

            vm.addressFilter1.communes = [];

            // update residential district if same address
            if (vm.entry.theCase.sameAddress) {
                vm.caseAddress.residentAddress.district = {};
                angular.copy(vm.caseAddress.currentAddress.district, vm.caseAddress.residentAddress.district);
            }

            if (vm.caseAddress.currentAddress.district && vm.caseAddress.currentAddress.district.id) {
                // Communes
                blockUI.start();
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.currentAddress.district.id,
                    excludeVoided: true
                }).then(function (data) {
                    blockUI.stop();

                    if (data) {
                        vm.addressFilter1.communes = data;
                    } else {
                        vm.addressFilter1.communes = [];
                    }

                    // Set selected commune
                    if (vm.caseAddress.currentAddress.commune && vm.caseAddress.currentAddress.commune.id) {
                        if (utils.indexOf(vm.caseAddress.currentAddress.commune, vm.addressFilter1.communes) < 0) {
                            vm.caseAddress.currentAddress.commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.caseAddress.currentAddress.commune', function (newVal, oldVal) {
            if (newVal && oldVal && newVal.id == oldVal.id) {
                return;
            }

            if (vm.entry.theCase.sameAddress) {
                vm.caseAddress.residentAddress.commune = {};
                angular.copy(vm.caseAddress.currentAddress.commune, vm.caseAddress.residentAddress.commune);

                // when commune is removed
                if (!newVal || !newVal.id) {
                    vm.caseAddress.residentAddress.commune = null;
                }
            }
        });

        $scope.$watch('vm.caseAddress.currentAddress.streetAddress', function (newVal, oldVal) {

            if (!newVal) {
                vm.caseAddress.currentAddress.streetAddress = null;
            }

            if (vm.entry.theCase.sameAddress) {
                vm.caseAddress.residentAddress.streetAddress = vm.caseAddress.currentAddress.streetAddress;
            }
        });

        // For residential address
        $scope.$watch('vm.caseAddress.residentAddress.province', function (newVal, oldVal) {

            if (newVal && oldVal && newVal.id == oldVal.id) {
                return;
            }

            if (vm.caseAddress.residentAddress.temporaryDisableWatcher) {
                return;
            }

            vm.addressFilter2.districts = [];
            vm.addressFilter2.communes = [];

            if (vm.caseAddress.residentAddress.province && vm.caseAddress.residentAddress.province.id) {
                // Districts
                blockUI.start();
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.residentAddress.province.id,
                    excludeVoided: true
                }).then(function (data) {
                    blockUI.stop();

                    if (data) {
                        vm.addressFilter2.districts = data;
                    } else {
                        vm.addressFilter2.districts = [];
                    }

                    // Set selected district
                    if (vm.caseAddress.residentAddress.district && vm.caseAddress.residentAddress.district.id) {
                        if (utils.indexOf(vm.caseAddress.residentAddress.district, vm.addressFilter2.districts) < 0) {
                            vm.caseAddress.residentAddress.district = null;
                            vm.caseAddress.residentAddress.commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.caseAddress.residentAddress.district', function (newVal, oldVal) {
            if (newVal && oldVal && newVal.id == oldVal.id) {
                return;
            }

            if (vm.caseAddress.residentAddress.temporaryDisableWatcher) {
                return;
            }

            vm.addressFilter2.communes = [];

            if (vm.caseAddress.residentAddress.district && vm.caseAddress.residentAddress.district.id) {
                // Districts
                blockUI.start();
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.residentAddress.district.id,
                    excludeVoided: true
                }).then(function (data) {
                    blockUI.stop();

                    if (data) {
                        vm.addressFilter2.communes = data;
                    } else {
                        vm.addressFilter2.communes = [];
                    }

                    // Set selected commune
                    if (vm.caseAddress.residentAddress.commune && vm.caseAddress.residentAddress.commune.id) {
                        if (utils.indexOf(vm.caseAddress.residentAddress.commune, vm.addressFilter2.communes) < 0) {
                            vm.caseAddress.residentAddress.commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.entry.theCase.confirmLab', function (newVal, oldVal) {
            if (newVal) {
                if (newVal.id == 0) {
                    focus('vm.entry.theCase.confirmLabName');
                } else {
                    vm.entry.theCase.confirmLabName = newVal.name;
                }
            }
        });

        $scope.$watch('vm.entry.theCase.currentArvRegimen', function (newVal, oldVal) {
            if (newVal) {
                if (newVal.id == 0) {
                    focus('vm.entry.theCase.currentArvRegimenName');
                } else {
                    vm.entry.theCase.currentArvRegimenName = newVal.name;
                    vm.entry.theCase.currentArvRegimenLine = newVal.line;
                }
            }
        });

        $scope.$watch('vm.entry.theCase.currentArvRegimenLine', function (newVal, oldVal) {
            if (newVal < 1) {
                vm.entry.theCase.currentArvRegimenLine = 1;
            }

            if (newVal > 3) {
                vm.entry.theCase.currentArvRegimenLine = 3;
            }
        });

        // Get the previously selected patient --> for displaying on the nav-tab
        (function () {
            let selPatientId = $cookies.get(service.SELECTED_PATIENT_ID);

            if (selPatientId) {

                if (!$scope.isSiteManager($scope.currentUser)) {
                    $cookies.remove(service.SELECTED_PATIENT_ID);
                    $state.go('application.treatment');
                }

                blockUI.start();
                service.getPatient(selPatientId, function failure() {
                    $cookies.remove(service.SELECTED_PATIENT_ID);
                    blockUI.stop();
                }).then(function (data) {
                    blockUI.stop();

                    if (!data || !data.id) {
                        $cookies.remove(service.SELECTED_PATIENT_ID);
                        return;
                    }

                    vm.selectedEntry = data;

                    // Age
                    vm.selectedEntry.theCase.person.age = moment().diff(vm.selectedEntry.theCase.person.dob, 'years');

                    // Gender icon
                    if (vm.selectedEntry.theCase.person.gender == 'MALE') {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-mars';
                    } else if (vm.selectedEntry.theCase.person.gender == 'FEMALE') {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-venus';
                    } else {
                        vm.selectedEntry.theCase.person.genderIcon = 'fa-genderless';
                    }
                });
            }
        })();
    }

})();
