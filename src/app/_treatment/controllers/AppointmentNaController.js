/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('AppointmentNaController', AppointmentNaController);

    AppointmentNaController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        '$state',
        '$stateParams',
        'blockUI',
        'toastr',
        '$cookies',
        'Utilities',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'bsTableAPI',

        'PatientService',
        'AppointmentService'
    ];

    function AppointmentNaController($rootScope, $scope, $http, $timeout, settings, modal, $state, $stateParams, blockUI, toastr, $cookies, utils, focus, focusFlatPick, openSelectBox, bsTableAPI, service, appService) {
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

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.grantedOPCs = [];

        vm.utils = utils;
        vm.entry = {}; // A new appointment entry for a patient
        vm.entries = []; // List of appointments set for the date
        vm.selectedEntries = [];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            keyword: null,
            sortField: 1
        };

        // -------------------------------------------------
        // BEGIN: Get selected date form session storage
        // -------------------------------------------------
        let lateDays = parseFloat(sessionStorage.getItem(appService.LATE_DAYS));
        sessionStorage.removeItem(appService.LATE_DAYS);

        lateDays = !lateDays ? 0 : lateDays;

        let selDate = sessionStorage.getItem(appService.SELECTED_DATE);
        let mToday = moment().set({hour: 7, minute: 0, second: 0});

        if (!selDate) {
            vm.selectedDate = mToday.toDate();
        } else {
            vm.selectedDate = moment(selDate, 'DD/MM/YYYY').add(7, 'hours').toDate();
        }

        // vm.filter.fromDate = vm.selectedDate;
        // vm.filter.toDate = vm.selectedDate;
        
        vm.getEntries = function () {
            // get late entries
            blockUI.start();
            appService.getAllPatientHasNoAppointment(vm.filter).then(function(data){
                blockUI.stop();
                vm.lateEntries = [];
                angular.copy(data.content, vm.lateEntries);

                //vm.bsTableControl.options.columns = appService.getTableDefinition4NA({sortField: vm.filter.sortField});
                vm.bsTableControl.options.data = vm.lateEntries;
                vm.bsTableControl.options.totalRows = data.totalElements;
                vm.bsTableControl.options.appointmentCount = data.extraCount;
            });
        };
        
        vm.getEntries();
        // -------------------------------------------------
        // END: Get selected date form session storage
        // -------------------------------------------------

        vm.bsTableControl = {
            options: {
                data: vm.lateEntries,
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.filter.pageSize,
                pageList: [5, 10, 25, 50, 100],
                locale: settings.locale,
                sidePagination: 'server',
                columns: appService.getTableDefinitionNA({sortField: vm.filter.sortField}),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                     vm.getEntries();
                }
            }
        };

        /**
         * Calling API to search for patients
         *
         * @type {boolean}
         */
        $scope.$watch('vm.filter.keyword', function (newVal, oldVal) {
            if (!newVal) {
                $timeout(function () {
                    // vm.getEntries();
                }, 500);
            }
        });

        /**
         * On selection of clinic
         */
        vm.onClinicChange = function () {
            let selOpcId = $cookies.get(service.SELECTED_OPC);
            if (selOpcId) {
                $cookies.remove(selOpcId);
            }

            if (vm.filter.organization && vm.filter.organization.id) {
                $cookies.put(service.SELECTED_OPC, vm.filter.organization.id);
            }

             vm.getEntries();
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.grantedOPCs = [];

                vm.filter.organization = {};

                if (vm.orgsWritable && vm.orgsWritable.length > 0) {
                    angular.forEach(vm.orgsWritable, function (obj) {
                        if (obj.opcSite === true) {
                            vm.grantedOPCs.push({
                                id: obj.id,
                                name: obj.name,
                                province: (obj.address && obj.address.province) ? obj.address.province.name : 'Kh??ng r?? t???nh'
                            });
                        }
                    });

                    // resume
                    let selOpcId = parseFloat($cookies.get(service.SELECTED_OPC));
                    if (selOpcId && vm.grantedOPCs.length) {
                        let indx = _.findIndex(vm.grantedOPCs, {'id': selOpcId});

                        if (indx >= 0) {
                            vm.filter.organization = {};
                            angular.copy(vm.grantedOPCs[indx], vm.filter.organization);
                        }
                    }

                    if (!vm.filter.organization || !vm.filter.organization.id) {
                        vm.filter.organization = {};
                        angular.copy(vm.orgsWritable[0], vm.filter.organization);
                    }

                     vm.getEntries();
                }
            }
        });

        /**
         * -------------------------------------------------
         * BEGIN: Shared functions
         * -------------------------------------------------
         */

        // Get the previously selected patient
        (function () {
            let selPatientId = $cookies.get(service.SELECTED_PATIENT_ID);

            if (selPatientId) {
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

        // Getting the saved editing patient object
        (function () {
            let entryObj = localStorage.getItem(service.EDIT_PATIENT_ENTRY);

            if (entryObj) {
                entryObj = JSON.parse(entryObj);

                if (entryObj.id) {
                    blockUI.start();
                    service.getPatient(entryObj.id, function failure() {
                        blockUI.stop();
                    }).then(function (data) {
                        vm.editingEntry = data;
                        blockUI.stop();
                    });
                } else {
                    vm.editingEntry = entryObj;
                }
            }
        })();

        vm.exportNaAppointment = function(){
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
            appService.exportNAAppointments(vm.filter)
                .success(successHandler)
                .error(function () {
                    blockUI.stop();
                });
        }
        /**
         * -------------------------------------------------
         * END: Shared functions
         * -------------------------------------------------
         */

    }

})();
