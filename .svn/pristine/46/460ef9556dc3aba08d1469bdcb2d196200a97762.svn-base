/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('PatientListController', PatientListController);

    PatientListController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$uibModal',
        'blockUI',
        'toastr',
        '$cookies',
        '$state',
        'Utilities',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'bsTableAPI',

        'PatientService',
        'AppointmentService',
    ];

    function PatientListController($rootScope, $scope, $http, $timeout, settings, modal, blockUI, toastr, $cookies, $state, utils, focus, focusFlatPick, openSelectBox, bsTableAPI, service, appService) {
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
        vm.selectedEntry = {};
        vm.entries = [];
        vm.selectedEntries = [];
        vm.modalInstance = null;
        vm.modalInstance2 = null;

        vm.patientStatuses = [
            {id: null, name: 'Tất cả bệnh nhân'},
            {id: 'ACTIVE', name: 'Bệnh nhân đang quản lý'},
            {id: 'DEAD', name: 'Bệnh nhân đã tử vong'},
            {id: 'LTFU', name: 'Bệnh nhân đã bỏ trị'},
            {id: 'TRANSFERRED_OUT', name: 'Bệnh nhân đã chuyển đi'},
            {id: 'PENDING_ENROLLMENT', name: 'Bệnh nhân chờ tiếp nhận'}
        ];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25,
            exportPatient: true, // by default
            patientStatus: 'ACTIVE',
            includeOnART: true,
            includePreART: true,
            sortField: 1, // 1 = patient name, 2 = patient chart ID
        };

        vm.filterSelector = {
            storageKey: '_patient_filter',
            props: ['organization', 'patientStatus', 'keyword', 'arvGroup', 'hivConfirmDateFrom', 'hivConfirmDateTo', 'arvStartDateFrom', 'arvStartDateTo', 'ageFrom', 'ageTo', 'gender', 'enrollmentType', 'missingData', 'includeDeleted', 'includeOnART', 'includePreART', 'appointmentResult', 'appointmentMonth'],
            patientStatus: 'ACTIVE',
            enrollmentType: null
        };


        vm.appointmentResultTypes = [
            {id: 'HAS_APPOINTMENT', name: 'Bệnh nhân có lịch hẹn'},
            {id: 'HAS_VL_TEST', name: 'B.N được làm TLVR'},
            {id: 'HAS_CD4_TEST', name: 'B.N được làm CD4'},
            {id: 'HAS_ARV_DR_TEST', name: 'B.N được làm kháng thuốc ARV'},
            {id: 'NOT_ARRIVED', name: 'Bệnh nhân chưa tới khám'}
        ];
        vm.genders = [{id: 'MALE', name: 'Nam'}, {id: 'FEMALE', name: 'Nữ'}, {id: 'OTHER', name: 'Không rõ'}];
        vm.enrollmentTypes = [
            {id: null, name: 'Tất cả loại hình đăng ký'},
            {id: 'NEWLY_ENROLLED', name: 'Đăng ký mới'},
            {id: 'RETURNED', name: 'Điều trị lại'},
            {id: 'TRANSFERRED_IN', name: 'Chuyển tới'}
        ];

        vm.orgsReadable = [];
        vm.orgsWritable = [];
        vm.grantedOPCs = [];

        vm.bsTableControl = {
            options: {
                data: vm.entries,
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
                columns: service.getTableDefinition({}),
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

                    vm.getPatients();
                }
            }
        };

        // Resume the filter
        (function () {
            let data = localStorage.getItem(vm.filterSelector.storageKey);
            if (data) {
                vm.filter = JSON.parse(data);

                // replicate to the selector
                angular.forEach(vm.filterSelector.props, function (obj) {
                    vm.filterSelector[obj] = vm.filter[obj];
                });

                vm.filter.pageIndex = 0;
                vm.filter.pageSize = 25;
            }
        })();

        /**
         * Update the status of filter: Are there any filter criteria
         */
        vm.updateFilterStatus = function () {
            vm.filter.isFiltered = false;

            angular.forEach(vm.filterSelector.props, function (obj) {
                if (vm.filter[obj] != null) {
                    vm.filter.isFiltered = true;
                }
            });

            if (vm.filter.isFiltered) {
                localStorage.setItem(vm.filterSelector.storageKey, JSON.stringify(vm.filter));
            } else {
                localStorage.removeItem(vm.filterSelector.storageKey);
            }
        };

        /**
         * On filter removed
         * @param prop
         */
        vm.onFilterRemoved = function (prop) {
            if (prop == 'patientStatus') {
                return;
            }

            delete vm.filter[prop];
            delete vm.filterSelector[prop];

            if (prop == 'appointmentResult') {
                delete vm.filter['appointmentMonth'];
                delete vm.filterSelector['appointmentMonth'];
            }

            // reset page index
            vm.filter.pageIndex = 0;
            bsTableAPI('bsTableControl', 'selectPage', 1);

            vm.getPatients();
        };

        // Get a list of patients
        vm.getPatients = function (updateFilter) {
            // make sure we have patients in the list
            if (!vm.filterSelector.includeOnART && !vm.filterSelector.includePreART) {
                vm.filterSelector.includeOnART = true;
                vm.filterSelector.includePreART = true;
                updateFilter = true;
            }

            if (updateFilter) {

                angular.forEach(vm.filterSelector.props, function (obj) {
                    vm.filter[obj] = vm.filterSelector[obj];
                });

                if (!vm.filter.keyword || vm.filter.keyword.trim().length <= 0) {
                    vm.filter.keyword = null;
                }

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                // reset page index
                vm.filter.pageIndex = 0;
                bsTableAPI('bsTableControl', 'selectPage', 1);
            }

            vm.updateFilterStatus();

            blockUI.start();
            service.getPatients(vm.filter).then(function (data) {
                vm.entries = data.content;
                vm.bsTableControl.options.data = vm.entries;
                vm.bsTableControl.options.totalRows = data.totalElements;

                let displaySiteName = $scope.isProvincialManager($scope.currentUser) || ($scope.isSiteManager($scope.currentUser) && vm.orgsWritable.length > 1);
                let siteManagerOnly = $scope.isSiteManager($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser);
                vm.bsTableControl.options.columns = service.getTableDefinition({
                    displaySiteName: displaySiteName,
                    siteManagerOnly: siteManagerOnly,
                    sortField: vm.filter.sortField
                });

                blockUI.stop();
            });
        };

        /**
         * Sort the list
         * @param col
         */
        $scope.sort = function (col) {
            if (col) {
                vm.filter.sortField = col;

                vm.getPatients();
            }
        };

        /**
         *
         * @type {boolean}
         */
        $scope.$watch('vm.filterSelector.keyword', function (newVal, oldVal) {
            if ((!newVal || newVal.trim() == '') && oldVal && oldVal.trim() != '') {
                $timeout(function () {
                    vm.getPatients(true);
                }, 500);
            }
        });

        /**
         * Watch the appointment result when doing advanced search
         */
        $scope.$watch('vm.filterSelector.appointmentResult', function (newVal, oldVal) {
            if (!newVal || newVal == 'NOT_ARRIVED') {
                vm.datepicker5.clear();
                return;
            }

            // force selection of month if the appointment result is set
            if (!vm.filterSelector.appointmentMonth) {
                let date = moment().set('date', 1).set('hour', '7').set('minute', '0').set('second', 0).toDate();
                vm.filterSelector.appointmentMonth = date;
                vm.datepicker5.setDate(date);
            }
        });

        /**
         * Open the popup for updating shortcuts
         */
        vm.showUpdateShortcuts = function () {

            // read local storage
            let selShortcuts = JSON.parse(localStorage.getItem(service.SELECTED_SHORTCUTS));

            if (selShortcuts) {
                vm.shortcuts = {};
                angular.copy(selShortcuts, vm.shortcuts);
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'shortcuts.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.shortcuts = {};
            });
        };

        /**
         * Update shortcuts
         */
        vm.updateShortcuts = function () {
            // validate
            let opts = ['editCase', 'cd4', 'vl', 'shi', 'tb', 'hep', 'dr', 'pregnancy'];
            let optCount = 0;

            angular.forEach(opts, function (opt) {
                if (vm.shortcuts[opt]) {
                    optCount++;
                }
            });

            if (optCount > 3) {
                toastr.error('Bạn chỉ được chọn tối đa 3 liên kết nhanh.', 'Thông báo');
                return;
            }

            localStorage.setItem(service.SELECTED_SHORTCUTS, JSON.stringify(vm.shortcuts));

            if (vm.modalInstance) {
                vm.modalInstance.close();
            }

            vm.bsTableControl.options.columns = service.getTableDefinition({
                shortcuts: vm.shortcuts
            });

            // refresh current page
            bsTableAPI('bsTableControl', 'refreshOptions', vm.bsTableControl.options);
        };

        /**
         * Make sure this is selected by default
         */
        $scope.$watch('vm.shortcuts.editCase', function (newVal, oldVal) {
            if (!vm.shortcuts) {
                vm.shortcuts = {};
            }

            if (!newVal) {
                vm.shortcuts.editCase = true;
            }
        });

        /**
         * Open the advanced search box
         */
        vm.openAdvancedSearch = function (focusOnElement) {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'advanced_search_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                if (focusOnElement) {
                    $timeout(function () {
                        if (focusOnElement.type == 'select') {
                            openSelectBox(focusOnElement.id);
                        } else if (focusOnElement.type == 'textbox') {
                            focus(focusOnElement.id);
                        } else if (focusOnElement.type == 'datepicker') {
                            focusFlatPick(focusOnElement.id);
                        }
                    }, 100);
                }
            });

            vm.modalInstance.closed.then(function () {
                // TODO
            });
        };

        /**
         * Filter by organization. This is for provincial manager to filter by clicking the org name in the list
         */
        $scope.filterByOrg = function (id, name) {
            vm.filterSelector.organization = {id: id, name: name};
            vm.getPatients(true);
        };

        /**
         * Open filter modal dialog...
         */
        $scope.openAdvancedSearchDialog = function () {
            vm.openAdvancedSearch({id: 'vm.filterSelector.organization', type: 'select'});
        };

        /**
         * Display treatment history for the selected patient
         * @param id
         */
        vm.fullStatusHistory = [];
        $scope.displayStatusHistory = function (id) {

            if (!id) {
                return;
            }

            vm.bsTableControl4Status = {
                options: {
                    data: [],
                    idField: 'id',
                    sortable: true,
                    striped: true,
                    maintainSelected: true,
                    clickToSelect: false,
                    showColumns: false,
                    showToggle: false,
                    pagination: false,
                    locale: settings.locale,
                    sidePagination: 'server',
                    columns: service.getTableDefinition4StatusHistoryAlt(),
                }
            };

            blockUI.start();
            service.getFullCaseStatusHistory(id).then(function (data) {
                blockUI.stop();

                vm.fullStatusHistory = [];
                angular.copy(data, vm.fullStatusHistory);

                vm.bsTableControl4Status.options.data = data;

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'patient_status_history_modal_alt.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance.closed.then(function () {
                    vm.fullStatusHistory = [];
                });
            });
        };

        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Chọn ngày..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: true
        };

        // HIV Confirm date from
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.hivConfirmDateFrom = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.filterSelector.hivConfirmDateFrom) {
                    fpItem.setDate(moment(vm.filterSelector.hivConfirmDateFrom).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.filterSelector.hivConfirmDateFrom = null;
                }
            }
        };

        // HIV Confirm date to
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.hivConfirmDateTo = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.filterSelector.hivConfirmDateTo) {
                    fpItem.setDate(moment(vm.filterSelector.hivConfirmDateTo).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.filterSelector.hivConfirmDateTo = null;
                }
            }
        };

        // ARV start date from
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.arvStartDateFrom = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.filterSelector.arvStartDateFrom) {
                    fpItem.setDate(moment(vm.filterSelector.arvStartDateFrom).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker3.fpItem) {
                    vm.datepicker3.fpItem.clear();
                    vm.filterSelector.arvStartDateFrom = null;
                }
            }
        };

        // ARV start date to
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.arvStartDateTo = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;
                if (vm.filterSelector.arvStartDateTo) {
                    fpItem.setDate(moment(vm.filterSelector.arvStartDateTo).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker4.fpItem) {
                    vm.datepicker4.fpItem.clear();
                    vm.filterSelector.arvStartDateTo = null;
                }
            }
        };

        // For month selection (in advanced search)
        vm.datepicker5 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y',
                altInput: true,
                // dateFormat: 'Y-m-dTH:i:S',
                // enableTime: false,
                placeholder: 'Chọn ngày..',
                plugins: [new scrollPlugin({}), new monthSelectPlugin({
                    shorthand: true, //defaults to false
                    dateFormat: "Y-m-dTH:i:S", //defaults to "F Y"
                    altFormat: "F Y", //defaults to "F Y"
                    // theme: "dark"
                })],
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.filterSelector.appointmentMonth = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker5.fpItem = fpItem;
                if (vm.filterSelector.appointmentMonth) {
                    fpItem.setDate(moment(vm.filterSelector.appointmentMonth).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker5.fpItem) {
                    vm.datepicker5.fpItem.setDate(date);
                }
            },
            clear: function () {
                if (vm.datepicker5.fpItem) {
                    vm.filterSelector.appointmentMonth = null;
                    if (!vm.datepicker5.fpItem.config) {
                        vm.datepicker5.fpItem.config = {};
                    }
                    vm.datepicker5.fpItem.clear();
                }
            }
        };

        /**
         * Add a patient...
         */
        vm.openAddPatient = function () {
            if (localStorage.getItem(service.EDIT_PATIENT_ENTRY)) {
                localStorage.removeItem(service.EDIT_PATIENT_ENTRY);
            }

            $state.go('application.treatment_edit_patient', {id: 0});
        };

        /**
         * Table definition for search result
         */
        vm.bsTableControl4Search = {
            options: {
                data: [],
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4WrCaseSearch(),
            }
        };

        /**
         * Add a patient from the weekly report
         */
        vm.addFromWeeklyReport = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'import_from_wr_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.opened.then(function () {
                $timeout(function () {
                    focus('vm.wrSearchKeyword');
                }, 100);
            });

            vm.modalInstance.closed.then(function () {
                // ...
            });
        };

        /**
         * Watch the search keyword for weekly report cases
         */
        $scope.$watch('vm.wrSearchKeyword', function (newVal, oldVal) {
            if (oldVal && !newVal) {
                $timeout(function () {
                    vm.bsTableControl4Search.options.data = [];
                    vm.bsTableControl4Search.options.totalRows = 0;
                }, 100);
            }
        });

        /**
         * Create patient from weekly report
         * @param wrCaseId
         */
        $scope.createPatientFromWR = function (wrCaseId) {
            if (!wrCaseId) {
                return;
            }

            blockUI.start();
            service.getWrPatient(wrCaseId).then(function (data) {
                blockUI.stop();

                if (!data || !data.id) {
                    return;
                }

                service.buildPatientFromWRCase(data).then(function (data) {
                    localStorage.setItem(service.EDIT_PATIENT_ENTRY, JSON.stringify(data));
                });

                $state.go('application.treatment_edit_patient', {id: 0});
            });
        };

        /**
         * Filter patients from weekly report data
         */
        vm.filterWrPatients = function () {
            if (!vm.wrSearchKeyword || vm.wrSearchKeyword.trim().length <= 0) {
                return;
            }

            let filter = {
                keyword: vm.wrSearchKeyword,
                owner: {id: vm.orgsWritable[0].id}
            };

            blockUI.start();
            service.getWrPatients(filter).then(function (data) {
                blockUI.stop();

                vm.bsTableControl4Search.options.data = data;
                vm.bsTableControl4Search.options.totalRows = data.length;
            });
        };

        /**
         * Export patients to Excel file
         */
        vm.exportPatients = function () {
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'export_patients_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                // ...
            });
        };

        /**
         * Export patients late to appointment to Excel file
         */
        vm.exportLatePatients = function () {

            vm.filter.lateDays = 28;

            vm.dialog = {
                title: 'Xuất bệnh nhân muộn khám',
                yesButton: 'Xuất dữ liệu',
                yesButtonIcon: 'fa-download',
                callback: function () {
                    vm.startExport2Excel(3);
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'patients_missing_appointments.html',
                scope: $scope,
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        /**
         * Start export patients to Excel
         */
        vm.startExport2Excel = function (opt) {

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

            let downloadPatientData = function () {
                service.export2Excel(vm.filter).success(successHandler).error(function (data) {
                    blockUI.stop();
                }).finally(function () {
                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }
                });
            };

            let downloadSearchResults = function () {
                service.exportSearchResults(vm.filter).success(successHandler).error(function (data) {
                    blockUI.stop();
                });
            };

            let downloadLatePatients = function () {

                if (!vm.filter.lateDays) {
                    blockUI.stop();
                    toastr.error('Vui lòng cho biết bệnh nhân muộn khám', 'Thông báo');
                    focus('vm.filter.lateDays');
                    return;
                }

                appService.exportPatientsLate2Appointment(vm.filter).success(successHandler).error(function (data) {
                    blockUI.stop();
                }).finally(function () {
                    if (vm.modalInstance) {
                        vm.modalInstance.close();
                    }
                });
            };

            let downloadAdhocData = function () {
                service.exportAdhocData().success(successHandler).error(function (data) {
                    blockUI.stop();
                });
            };

            blockUI.start();
            switch (opt) {
                case 1: // download patient data
                    downloadPatientData();
                    break;
                case 2: // download search results
                    downloadSearchResults();
                    break;
                case 3: // download late appointments (>= 28 days)
                    downloadLatePatients();
                    break;
                case 10:
                    downloadAdhocData();
                    break;
            }


        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;
                vm.grantedOPCs = [];

                angular.forEach(vm.orgsReadable, function (obj) {
                    if (obj.opcSite == true) {
                        vm.grantedOPCs.push({
                            id: obj.id,
                            name: obj.name,
                            province: (obj.address && obj.address.province) ? obj.address.province.name : 'Không rõ tỉnh'
                        });
                    }
                });

                let defaultStatus = sessionStorage.getItem('_patient_list_default_status');
                sessionStorage.removeItem('_patient_list_default_status');

                if (defaultStatus) {
                    vm.filterSelector.patientStatus = defaultStatus;
                    vm.filter.patientStatus = defaultStatus;
                }

                vm.getPatients();
            }
        });

        $scope.$watch('vm.filter.patientStatus', function (newVal, oldVal) {
            if (newVal) {
                angular.forEach(vm.patientStatuses, function (obj) {
                    if (newVal && newVal === obj.id) {
                        vm.filter.patientStatusLabel = obj.name;
                        return;
                    }
                });
            }
        });

        $scope.$watch('vm.filter.enrollmentType', function (newVal, oldVal) {
            if (newVal) {
                angular.forEach(vm.enrollmentTypes, function (obj) {
                    if (newVal === obj.id) {
                        vm.filter.enrollmentTypeLabel = obj.name;
                        return;
                    }
                });
            }
        });

        $scope.$watch('vm.filter.appointmentResult', function (newVal, oldVal) {
            if (newVal) {
                angular.forEach(vm.appointmentResultTypes, function (obj) {
                    if (newVal === obj.id) {
                        vm.filter.appointmentResultLabel = obj.name;

                        if (vm.filter.appointmentMonth) {
                            vm.filter.appointmentResultLabel += ' trong tháng ' + moment(vm.filter.appointmentMonth).format('MM/YYYY');
                        }

                        return;
                    }
                });
            }
        });

        // Enable/disable button
        vm.submitDisabled = false;
        vm.toggleSubmit = function () {
            if (vm.submitDisabled) {
                toastr.clear();
                $timeout(function () {
                    vm.submitDisabled = false;
                }, 1000);
            } else {
                vm.submitDisabled = true;
            }
        };

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

        /**
         * -------------------------------------------------
         * END: Shared functions
         * -------------------------------------------------
         */
    }
})();
