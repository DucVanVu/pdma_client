/**
 * Created by bizic on 28/8/2016.
 */

(function () {
    'use strict';
    angular.module('PDMA.Reporting').controller('WeeklyReportEditController', WeeklyReportEditController);

    WeeklyReportEditController.$inject = [
        '$rootScope',
        '$scope',
        '$q',
        '$http',
        '$filter',
        '$timeout',
        '$state',
        '$stateParams',
        '$location',
        '$anchorScroll',
        'settings',
        '$uibModal',
        'toastr',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'blockUI',
        'bsTableAPI',
        'Utilities',
        '$sce',
        'WeeklyReportingService',
        'OrganizationService',
        'AdminUnitService',
        'HIVConfirmLabService'
    ];

    function WeeklyReportEditController($rootScope, $scope, $q, $http, $filter, $timeout, $state, $stateParams, $location, $anchorScroll, settings, modal, toastr, focus, focusFlatPick, openSelectBox, blockUI, bsTableAPI, utils, $sce, service, orgService, auService, labService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        if ($stateParams.id == null || $stateParams.id < 0) {
            $state.go('application.weekly_reports');
        }

        let vm = this;

        let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        vm.modalInstance = null;

        // current page of the report list
        vm.weeklyReport = {};
        vm.dirty = {value: false, shouldMeasure: false};
        vm.dialog = {title: null, message: null};

        vm.orgsReadable = [];
        vm.orgsWritable = [];

        vm.provinces = [];
        vm.districts = [];

        vm.organizations = [];
        vm.confirmLabs = [];

        vm.positiveCases = [];
        vm.treatmentCases = [];

        vm.positiveCase = {};
        vm.treatmentCase = {};
        // Option for the editor
        vm.editorOptions = {
            toolbar: [
                ['bold', 'italics', 'underline', 'ul', 'ol', 'clear']
            ]
        };

        $scope.cases = []; // for updating new/old cases
        $scope.txCaseStatuses = [
            {id: 0, name: 'Ch??a x??c ?????nh'},
            {id: 1, name: '??i???u tr??? m???i'},
            {id: 2, name: 'C?? ch??a ??i???u tr???'},
            {id: 3, name: 'C?? b??? tr???'},
            {id: 4, name: 'Ngo???i t???nh'}
        ];
        $scope.htsCaseStatuses = [
            {id: 0, name: 'Ch??a x??c ?????nh'},
            {id: 1, name: 'Ch???n ??o??n m???i'},
            {id: 2, name: 'Ch???n ??o??n c??'},
            {id: 4, name: 'Ngo???i t???nh'}
        ];
        vm.untreatedCases = [];
        vm.opcs = [];

        vm.caseAddress = {
            residentialAddress: {province: null, district: null},
            currentAddress: {province: null, district: null}
        };
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
        vm.untreatedFilter = {
            owner: null,
            keyword: null,
            pageIndex: 0,
            pageSize: 5,
            search: function () {
                blockUI.start();
                service.getUntreatedCases(vm.untreatedFilter).then(function (data) {
                    blockUI.stop();
                    vm.untreatedCases = data.content;
                    vm.bsTableControl3.options.data = vm.untreatedCases;
                    vm.bsTableControl3.options.totalRows = data.totalElements;

                    if (vm.untreatedCases.length <= 0) {
                        // Force destroy table in case there is no row.
                        bsTableAPI('bsTableControl3', 'destroy');
                    }
                });
            }
        };

        vm.genders = [{id: 'MALE', name: 'Nam'}, {id: 'FEMALE', name: 'N???'}, {id: 'OTHER', name: 'Kh??ng r??'}, {
            id: 'NOT_DISCLOSED',
            name: 'Kh??ng ti???t l???'
        }];

        vm.treatmentStatuses = [
            {id: 0, name: 'Kh??ng n???m ???????c'},
            {id: 1, name: '???? chuy???n ??i???u tr??? t???i m???t c?? s??? kh??c'},
            {id: 2, name: '???? chuy???n ??i???u tr??? t???i ch??nh c?? s??? n??y'}
        ];

        vm.rtriOptions = [
            {id: 1, name: 'M???i nhi???m - Test nhanh'},
            {id: 2, name: 'Nhi???m l??u'},
            {id: -1, name: 'Kh??ng ????? ti??u chu???n th???c hi???n XN'},
            {id: 0, name: 'Kh??ng ?????ng ?? x??t nghi???m'}
        ];

        vm.offeredPnsOptions = [
            {id: 1, name: 'C?? ???????c t?? v???n'},
            {id: 2, name: 'Kh??ng ???????c t?? v???n'},
            {id: 0, name: 'Kh??ng th???c hi???n'}
        ];

        // Positive table
        vm.bsTableControl1 = {
            options: {
                data: vm.positiveCases,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                singleSelect: true,
                pageSize: 500,
                pageList: [500],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4Positives()
            }
        };

        // Treatment table
        vm.bsTableControl2 = {
            options: {
                data: vm.treatmentCases,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                singleSelect: true,
                pageSize: 500,
                pageList: [500],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4Treatments(),
            }
        };

        // Untreated cases table
        vm.bsTableControl3 = {
            options: {
                data: vm.untreatedCases,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: true,
                pageSize: vm.untreatedFilter.pageSize,
                pageList: [5, 10],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4Untreateds(),
                onPageChange: function (index, pageSize) {
                    vm.untreatedFilter.pageSize = pageSize;
                    vm.untreatedFilter.pageIndex = index - 1;
                    // reload
                    blockUI.start();
                    service.getUntreatedCases(vm.untreatedFilter).then(function (data) {
                        blockUI.stop();
                        vm.untreatedCases = data.content;
                        vm.bsTableControl3.options.data = vm.untreatedCases;
                        vm.bsTableControl3.options.totalRows = data.totalElements;
                    });
                }
            }
        };

        // For new/old case update
        vm.bsTableControl4 = {
            options: {
                data: $scope.cases,
                idField: "id",
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                singleSelect: true,
                pageSize: 500,
                pageList: [500],
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getTableDefinition4Cases(),
            }
        };

        // For week selection
        vm.datepicker = {
            fpItem: null,
            canMoveNext: false,
            dateOpts: {
                // altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-d',
                placeholder: 'Ch???n tu???n..',
                defaultDate: vm.weeklyReport.tempDate,
                maxDate: moment(new Date()).startOf('isoWeek').add(6, 'days').add(23, 'hours').add(59, 'minutes').add(59, 'seconds').toDate(),
                plugins: [new weekSelect({}), new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onReady: function () {
                    if (!vm.weeklyReport.id) {
                        const m = moment(new Date());
                        vm.weeklyReport.fromDate = m.startOf('isoWeek').add(7, 'hours').toDate();
                        vm.weeklyReport.toDate = m.startOf('isoWeek').add(6, 'days').add(23, 'hours').add(59, 'minutes').add(59, 'seconds').toDate();
                    }
                },
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d) && !vm.weeklyReport.id) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.weeklyReport.fromDate = m.startOf('isoWeek').add(7, 'hours').toDate();
                        vm.weeklyReport.toDate = m.startOf('isoWeek').add(7, 'days').add(6, 'hours').add(59, 'minutes').add(59, 'seconds').toDate();

                        // Move this down here to fix the year number in the first week of a new year
                        const weekNumber = moment(d, 'YYYY-MM-DD').startOf('isoWeek').add(2, 'days').week();
                        const year = moment(vm.weeklyReport.toDate, 'YYYY-MM-DD').startOf('isoWeek').add(2, 'days').year();
                        vm.weeklyReport.name = 'B??o c??o tu???n ' + weekNumber + '/' + year;
                    }
                }],
                formatDate: function (d, format) {
                    let m = moment(d, 'YYYY-MM-DD');
                    let obj = moment(d, 'YYYY-MM-DD');

                    let fromDate = m.startOf('isoWeek').toDate();
                    let toDate = m.endOf('isoWeek').toDate();

                    let ret = 'T. ' + obj.week() + '/' + obj.year() + ' (' + $filter('date')(fromDate, 'dd/MM/yyyy') + ' - ' + $filter('date')(toDate, 'dd/MM/yyyy') + ')';

                    return ret;
                }
            },
            datePostSetup: function (fpItem) {
                vm.datepicker.fpItem = fpItem;

                // after the report edit form is loaded
                if (vm.weeklyReport.tempDate) {
                    fpItem.setDate(moment(vm.weeklyReport.tempDate).toDate());
                }
            },
            setNull: function () {
                $location.path('/reporting/weekly/edit/0/?r=' + Math.random(), true);
            }
        };

        // For DOB selection
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: false,
                defaultDate: moment(moment(new Date()).add(-20, 'years').year() + '-06-15', 'YYYY-MM-DD').toDate(),
                plugins: [new scrollPlugin({})],
                placeholder: 'Ch???n ng??y..',
                weekNumbers: false,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onReady: function () {
                    const m = moment(vm.datepicker2.dateOpts.defaultDate);
                    if (!vm.positiveCase.id) {
                        vm.positiveCase.dob = m.add(7, 'hours').toDate();
                    }

                    if (!vm.treatmentCase.id) {
                        vm.treatmentCase.dob = m.add(7, 'hours').toDate();
                    }
                },
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.positiveCase.dob = m.add(7, 'hours').toDate();
                        vm.treatmentCase.dob = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;

                if (vm.positiveCase.id) {
                    fpItem.setDate(moment(vm.positiveCase.dob).toDate());
                }

                if (vm.treatmentCase.id) {
                    fpItem.setDate(moment(vm.treatmentCase.dob).toDate());
                }
            }
        };

        // For HIV screening date selection
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y h:i K',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: true,
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.positiveCase.screeningDate = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;

                if (vm.positiveCase.screeningDate) {
                    fpItem.setDate(moment(vm.positiveCase.screeningDate).toDate());
                }
            }
        };

        // For HIV confirm date selection
        vm.datepicker4 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y h:i K',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: true,
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.positiveCase.confirmDate = m.add(7, 'hours').toDate();
                        vm.treatmentCase.confirmDate = vm.positiveCase.confirmDate;
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;

                if (vm.positiveCase.id) {
                    fpItem.setDate(moment(vm.positiveCase.confirmDate).toDate());
                }

                if (vm.treatmentCase.id) {
                    fpItem.setDate(moment(vm.treatmentCase.confirmDate).toDate());
                }
            }
        };

        // For Enrollment date selection
        vm.datepicker5 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y h:i K',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: true,
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.treatmentCase.enrollmentDate = m.add(7, 'hours').toDate();
                        if (vm.positiveCase.treatmentStatus) {
                            vm.positiveCase.enrollmentDate = m.add(7, 'hours').toDate();
                        }
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker5.fpItem = fpItem;
                if (vm.positiveCase.enrollmentDate) {
                    fpItem.setDate(moment(vm.positiveCase.enrollmentDate).toDate());
                }
                if (vm.treatmentCase.enrollmentDate) {
                    fpItem.setDate(moment(vm.treatmentCase.enrollmentDate).toDate());
                }
            }
        };

        // For ARV Initiation date selection
        vm.datepicker6 = {
            fpItem: null,
            dateOpts: {
                altFormat: 'd/m/Y h:i K',
                altInput: true,
                dateFormat: 'Y-m-dTH:i:S',
                enableTime: true,
                placeholder: 'Ch???n ng??y..',
                plugins: [new scrollPlugin({})],
                weekNumbers: true,
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                disable: [
                    function (date) {
                        // return true to disable
                        return moment(date).isAfter(mTodayEnd);
                    }
                ],
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');

                        vm.treatmentCase.arvInitiationDate = m.add(7, 'hours').toDate();
                        if (vm.positiveCase.treatmentStatus) {
                            vm.positiveCase.arvInitiationDate = m.add(7, 'hours').toDate();
                        }
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker6.fpItem = fpItem;
                if (vm.positiveCase.arvInitiationDate) {
                    fpItem.setDate(moment(vm.positiveCase.arvInitiationDate).toDate());
                }
                if (vm.treatmentCase.arvInitiationDate) {
                    fpItem.setDate(moment(vm.treatmentCase.arvInitiationDate).toDate());
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

        // Get all OPCs
        blockUI.start();
        orgService.getAllOrganizations({activeOnly: true, compact: true, opcSiteOnly: true}).then(function (data) {
            blockUI.stop();
            if (data && data.length > 0) {
                vm.opcs = data;
            } else {
                vm.opcs = [];
            }
        });

        // Get all HIV Confirm labs
        blockUI.start();
        labService.getAllLabs({}).then(function (data) {
            blockUI.stop();
            vm.confirmLabs = data;
        });

        // Get the weekly report
        vm.getWeeklyReport = function (id) {
            vm.dirty = {value: false, shouldMeasure: false};
            vm.positiveCases = [];
            vm.treatmentCases = [];

            if (!id || parseInt(id) <= 0) {
                vm.dirty = {shouldMeasure: true, value: true};
                vm.createDefaultReport();
                return;
            }

            blockUI.start();
            service.getWeeklyReport(id).then(function (data) {
                blockUI.stop();
                if (data && data.id) {
                    vm.weeklyReport = data;

                    // Set VCT site for untreated filter
                    if (!vm.untreatedFilter.owner || !vm.untreatedFilter.owner.id) {
                        vm.untreatedFilter.owner = {};
                    }
                    angular.copy(vm.weeklyReport.organization, vm.untreatedFilter.owner);

                    // datepickers
                    // vm.datepicker3.dateOpts.minDate = moment(data.fromDate).toDate();
                    vm.datepicker3.dateOpts.maxDate = moment(data.toDate).toDate();

                    vm.datepicker4.dateOpts.minDate = moment(data.fromDate).toDate();
                    vm.datepicker4.dateOpts.maxDate = moment(data.toDate).toDate();

                    vm.datepicker5.dateOpts.minDate = moment(data.fromDate).toDate();
                    vm.datepicker5.dateOpts.maxDate = moment(data.toDate).toDate();

                    vm.datepicker6.dateOpts.minDate = moment(data.fromDate).toDate();
                    vm.datepicker6.dateOpts.maxDate = moment(data.toDate).toDate();

                    if (vm.weeklyReport.cases && vm.weeklyReport.cases.length > 0) {

                        // Sort out the positive cases and tx cases
                        vm.positiveCases = [];
                        vm.treatmentCases = [];

                        let mfd = moment(vm.weeklyReport.fromDate);
                        let mtd = moment(vm.weeklyReport.toDate);
                        angular.forEach(vm.weeklyReport.cases, function (obj) {
                            if (obj.vct && obj.vct.id) {
                                // only count if date of confirm is in the same week
                                let mcd = moment(obj.confirmDate, 'YYYY-MM-DD');
                                if (mcd.isSameOrAfter(mfd) && mcd.isSameOrBefore(mtd)) {
                                    vm.positiveCases.push(obj);
                                }
                            }

                            if (obj.opc && obj.opc.id && (!obj.vct || (obj.vct && obj.vct.id && obj.vct.id == obj.opc.id))) {
                                // only count if date of enrollment is in the same week
                                let med = moment(obj.enrollmentDate, 'YYYY-MM-DD');
                                if (med.isSameOrAfter(mfd) && med.isSameOrBefore(mtd)) {
                                    vm.treatmentCases.push(obj);
                                }
                            }
                        });

                        let isPrivacyConsidered = !$scope.isSiteManager($scope.currentUser) && !$scope.isDistrictManager($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser);
                        let tableOperationHidden = !$scope.isSiteManager($scope.currentUser) && !$scope.isDistrictManager($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser);

                        // vm.bsTableControl1.options.showColumns = $scope.isSiteManager($scope.currentUser);
                        vm.bsTableControl1.options.columns = service.getTableDefinition4Positives(vm.weeklyReport.status, isPrivacyConsidered, tableOperationHidden);
                        vm.bsTableControl1.options.data = vm.positiveCases;
                        vm.bsTableControl1.options.totalRows = vm.positiveCases.length;

                        // vm.bsTableControl2.options.showColumns = $scope.isSiteManager($scope.currentUser);
                        vm.bsTableControl2.options.columns = service.getTableDefinition4Treatments(vm.weeklyReport.status, isPrivacyConsidered, tableOperationHidden);
                        vm.bsTableControl2.options.data = vm.treatmentCases;
                        vm.bsTableControl2.options.totalRows = vm.treatmentCases.length;
                    }
                } else {
                    vm.createDefaultReport();
                }

                vm.dirty.shouldMeasure = true;
                vm.dirty.value = !vm.weeklyReport.id || vm.weeklyReport.id <= 0;
            })
        };

        /**
         * Create a default report object
         */
        vm.createDefaultReport = function () {
            vm.weeklyReport = service.getDefaultReport();

            // datepickers
            // vm.datepicker3.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
            vm.datepicker3.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

            vm.datepicker4.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
            vm.datepicker4.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

            vm.datepicker5.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
            vm.datepicker5.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

            vm.datepicker6.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
            vm.datepicker6.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

            if (vm.orgsWritable && vm.orgsWritable.length == 1) {
                vm.weeklyReport.organization = {};
                angular.copy(vm.orgsWritable[0], vm.weeklyReport.organization);
            }
        };

        //vm.createDefaultReport();

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                angular.copy(vm.orgsReadable, vm.organizations);

                // get weekly report
                vm.getWeeklyReport($stateParams.id);
            }
        });

        // For current address
        $scope.$watch('vm.caseAddress.currentAddress.province', function (newVal, oldVal) {

            if (newVal && oldVal && newVal.id == oldVal.id) {
                return;
            }

            vm.addressFilter1.districts = [];
            vm.addressFilter1.communes = [];

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
            vm.addressFilter1.communes = [];

            if (vm.caseAddress.currentAddress.district && vm.caseAddress.currentAddress.district.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.currentAddress.district.id,
                    excludeVoided: true
                }).then(function (data) {
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

        // For residential address
        $scope.$watch('vm.caseAddress.residentialAddress.province', function (newVal, oldVal) {

            if (newVal && oldVal && newVal.id == oldVal.id) {
                return;
            }

            vm.addressFilter2.districts = [];
            vm.addressFilter2.communes = [];

            if (vm.caseAddress.residentialAddress.province && vm.caseAddress.residentialAddress.province.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.residentialAddress.province.id,
                    excludeVoided: true
                }).then(function (data) {
                    if (data) {
                        vm.addressFilter2.districts = data;
                    } else {
                        vm.addressFilter2.districts = [];
                    }

                    // Set selected district
                    if (vm.caseAddress.residentialAddress.district && vm.caseAddress.residentialAddress.district.id) {
                        if (utils.indexOf(vm.caseAddress.residentialAddress.district, vm.addressFilter2.districts) < 0) {
                            vm.caseAddress.residentialAddress.district = null;
                            vm.caseAddress.residentialAddress.commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.caseAddress.residentialAddress.district', function (newVal, oldVal) {
            vm.addressFilter2.communes = [];

            if (vm.caseAddress.residentialAddress.district && vm.caseAddress.residentialAddress.district.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.caseAddress.residentialAddress.district.id,
                    excludeVoided: true
                }).then(function (data) {
                    if (data) {
                        vm.addressFilter2.communes = data;
                    } else {
                        vm.addressFilter2.communes = [];
                    }

                    // Set selected commune
                    if (vm.caseAddress.residentialAddress.commune && vm.caseAddress.residentialAddress.commune.id) {
                        if (utils.indexOf(vm.caseAddress.residentialAddress.commune, vm.addressFilter2.communes) < 0) {
                            vm.caseAddress.residentialAddress.commune = null;
                        }
                    }
                });
            }
        });

        // For reloading the list of positive cases
        $scope.$watch('vm.untreatedFilter.keyword', function (newVal, oldVal) {
            if (oldVal && !newVal) {
                // reload
                $timeout(function () {
                    blockUI.start();
                    service.getUntreatedCases(vm.untreatedFilter).then(function (data) {
                        blockUI.stop();
                        vm.untreatedCases = data.content;
                        vm.bsTableControl3.options.data = vm.untreatedCases;
                        vm.bsTableControl3.options.totalRows = data.totalElements;
                    });
                }, 300);
            }
        });

        // Scroll to bottom
        $scope.$watch('vm.positiveCase.treatmentStatus', function (newVal, oldVal) {
            if (newVal && newVal.id) {
                $location.hash('edit-positive-bottom.anchor_' + newVal.id);
                $anchorScroll();
            }
        });

        $scope.$watchGroup(['vm.weeklyReport', 'vm.weeklyReport.htsTst', 'vm.weeklyReport.htsPos', 'vm.weeklyReport.txNew', 'vm.weeklyReport.note'], function (newValues, oldValues) {
            vm.dirty.value = false;

            if (!vm.dirty.shouldMeasure) {
                return;
            }

            if (!newValues[0].id) {
                vm.dirty.value = true;
                return;
            }

            if (typeof(oldValues[1]) === 'undefined' && typeof(oldValues[2]) === 'undefined' && typeof(oldValues[3]) === 'undefined' && typeof(oldValues[4]) === 'undefined') {
                return;
            }

            vm.dirty.value = (newValues[1] != oldValues[1]) || (newValues[2] != oldValues[2]) || (newValues[3] != oldValues[3]) || (newValues[4] != oldValues[4]);
            vm.dirty.value = vm.dirty.value && newValues[0].status <= 1;
        });

        /**
         * Add a positive case
         */
        vm.addPositiveCase = function () {

            function prepareEditForm() {
                vm.positiveCase.isNew = true;
                vm.positiveCase.sameAddress = true;
                vm.positiveCase.treatmentStatus = vm.treatmentStatuses[0];

                // Default province
                vm.caseAddress = {
                    residentialAddress: {province: {}, district: null},
                    currentAddress: {province: {}, district: null}
                };

                angular.copy(vm.weeklyReport.organization.address.province, vm.caseAddress.residentialAddress.province);
                angular.copy(vm.weeklyReport.organization.address.province, vm.caseAddress.currentAddress.province);

                vm.datepicker4.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();

                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_positive_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                vm.modalInstance.closed.then(function () {
                    vm.positiveCase = {};
                    vm.caseAddress = {
                        residentialAddress: {province: null, district: null},
                        currentAddress: {province: null, district: null}
                    };
                });
            }

            if (!vm.weeklyReport.id) {

                if (!vm.weeklyReport.fromDate || !vm.weeklyReport.toDate) {
                    toastr.error('B???n vui l??ng ch???n tu???n ????? b??o c??o!', 'Th??ng b??o');
                    return;
                }

                if (!vm.weeklyReport.organization || !vm.weeklyReport.organization.id) {
                    toastr.error('B???n vui l??ng ch???n ????n v??? b??o c??o.', 'Th??ng b??o');
                    return;
                }

                service.getWeeklyReportAlt(vm.weeklyReport).then(function (data) {
                    if (data && data.id) {
                        vm.weeklyReport = data;

                        vm.modalInstance = modal.open({
                            animation: true,
                            templateUrl: 'report_found_modal.html',
                            scope: $scope,
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false
                        });
                    } else {
                        service.saveWeeklyReport(vm.weeklyReport, function success() {
                            toastr.info('???? l??u b??o c??o.', 'Th??ng b??o');
                        }, function failure() {
                            toastr.error('Kh??ng th??? l??u b??o c??o.', 'Th??ng b??o');
                        }).then(function (data) {
                            if (data && data.id) {
                                // vm.weeklyReport = data;
                                // updating the URL without reloading
                                $location.path('/reporting/weekly/edit/' + data.id + '/');
                                // prepareEditForm();
                            }
                        });
                    }
                });
            } else {
                prepareEditForm();
            }
        };

        /**
         * Edit a positive case
         * @param id
         */
        $scope.editPositiveCase = function (id) {

            blockUI.start();
            service.getWRCase(id).then(function (data) {
                blockUI.stop();

                vm.positiveCase = data;
                vm.positiveCase.isNew = false;
                vm.positiveCase.sameAddress = service.isSameAddress(vm.positiveCase);

                vm.datepicker4.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();

                if (vm.positiveCase.opc) {
                    if (vm.positiveCase.opc.id == vm.positiveCase.vct.id) {
                        vm.positiveCase.treatmentStatus = vm.treatmentStatuses[2];
                    } else {
                        vm.positiveCase.treatmentStatus = vm.treatmentStatuses[1];
                    }
                } else {
                    vm.positiveCase.treatmentStatus = vm.treatmentStatuses[0];
                }

                vm.caseAddress = {
                    residentialAddress: {},
                    currentAddress: {}
                };

                if (vm.positiveCase.locations && vm.positiveCase.locations.length > 0) {
                    angular.forEach(vm.positiveCase.locations, function (loc) {
                        console.log(loc);
                        if (loc && loc.addressType == 'CURRENT_ADDRESS') {
                            angular.copy(loc, vm.caseAddress.currentAddress);
                        } else if (loc && loc.addressType == 'RESIDENT_ADDRESS') {
                            angular.copy(loc, vm.caseAddress.residentialAddress);
                        }
                    });
                }

                let modalInstance = modal.open({
                    animation: false,
                    templateUrl: 'edit_positive_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                modalInstance.closed.then(function () {
                    vm.positiveCase = {};
                    vm.caseAddress = {
                        residentialAddress: {province: null, district: null},
                        currentAddress: {province: null, district: null}
                    };
                });
            });
        };

        /**
         * Delete a positive case
         * @param id
         */
        $scope.deletePositiveCase = function (id) {
            service.getWRCase(id).then(function (data) {
                if (data && data.id) {
                    vm.positiveCase = data;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'confirm_delete_positivecase_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.result.then(function (confirm) {
                        if (confirm === 'yes') {
                            let report = {id: vm.weeklyReport.id, cases: [vm.positiveCase]};
                            service.deleteCases(report, true, function success() {
                                toastr.info('B???n ???? xo?? th??nh c??ng th??ng tin m???t kh??ch h??ng d????ng t??nh.', 'Th??ng b??o');
                            }, function failure() {
                                toastr.error('C?? l???i x???y ra khi xo?? th??ng tin c???a m???t kh??ch h??ng d????ng t??nh.', 'Th??ng b??o');
                            }).then(function (data) {
                                if (data && data.id) {
                                    $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random());
                                }
                            });
                        }
                    });

                    vm.modalInstance.closed.then(function () {
                        vm.positiveCase = {};
                        vm.caseAddress = {
                            residentialAddress: {province: null, district: null},
                            currentAddress: {province: null, district: null}
                        };
                    });
                }
            });
        };

        /**
         * Save a positive case
         */
        vm.savePositiveCase = function () {

            blockUI.start();

            if (!vm.positiveCase.fullname || vm.positiveCase.fullname.trim().length <= 0) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p h??? t??n kh??ch h??ng!', 'Th??ng b??o');
                focus('vm.positiveCase.fullname');
                return;
            }

            vm.positiveCase.fullname = utils.toTitleCase(vm.positiveCase.fullname);

            if (!vm.positiveCase.gender) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p gi???i t??nh c???a kh??ch h??ng!', 'Th??ng b??o');
                return;
            }

            if (!vm.caseAddress.currentAddress.province || !vm.caseAddress.currentAddress.province.id
                || !vm.caseAddress.currentAddress.district || !vm.caseAddress.currentAddress.district.id) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p ?????a ch??? hi???n t???i c???a kh??ch h??ng!', 'Th??ng b??o');
                return;
            }

            if (vm.positiveCase.sameAddress) {
                let tmp = vm.caseAddress.residentialAddress.id;

                vm.caseAddress.residentialAddress = {};
                angular.copy(vm.caseAddress.currentAddress, vm.caseAddress.residentialAddress);

                vm.caseAddress.residentialAddress.id = tmp;
            } else {
                if (!vm.caseAddress.residentialAddress.province || !vm.caseAddress.residentialAddress.province.id
                    || !vm.caseAddress.residentialAddress.district || !vm.caseAddress.residentialAddress.district.id) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng nh???p ?????a ch??? theo h??? kh???u c???a kh??ch h??ng!', 'Th??ng b??o');
                    return;
                }
            }

            // Title case first word for street address
            if (vm.caseAddress.currentAddress.streetAddress && vm.caseAddress.currentAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.currentAddress.streetAddress = utils.toTitleCase(vm.caseAddress.currentAddress.streetAddress, true);
            }

            if (vm.caseAddress.residentialAddress.streetAddress && vm.caseAddress.residentialAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.residentialAddress.streetAddress = utils.toTitleCase(vm.caseAddress.residentialAddress.streetAddress, true);
            }

            vm.caseAddress.currentAddress.addressType = 'CURRENT_ADDRESS';
            vm.caseAddress.residentialAddress.addressType = 'RESIDENT_ADDRESS';
            vm.positiveCase.locations = [vm.caseAddress.currentAddress, vm.caseAddress.residentialAddress];

            if (!vm.positiveCase.vct || !vm.positiveCase.vct.id) {
                vm.positiveCase.vct = {};
                angular.copy(vm.weeklyReport.organization, vm.positiveCase.vct);
            }

            if (!vm.positiveCase.screeningDate) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p ng??y gi??? x??t nghi???m s??ng l???c HIV!', 'Th??ng b??o');
                return;
            }

            if (!vm.positiveCase.screeningSite || vm.positiveCase.screeningSite.trim().length <= 0) {
                blockUI.stop();
                toastr.error('B???n vui l??ng cho bi???t ????n v??? ?????u ti??n ti???p c???n kh??ch h??ng!', 'Th??ng b??o');
                return;
            }

            vm.positiveCase.screeningSite = utils.toTitleCase(vm.positiveCase.screeningSite, true);

            if (!vm.positiveCase.confirmDate) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p ng??y gi??? x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                return;
            }

            if (moment(vm.positiveCase.screeningDate).isAfter(vm.positiveCase.confirmDate)) {
                blockUI.stop();
                toastr.error('Ng??y x??t nghi???m kh???ng ?????nh HIV+ kh??ng th??? s???m h??n ng??y x??t nghi???m s??ng l???c HIV!', 'Th??ng b??o');
                return;
            }

            if (!vm.positiveCase.hivConfirmId || vm.positiveCase.hivConfirmId.trim().length <= 0) {
                blockUI.stop();
                toastr.error('B???n vui l??ng nh???p m?? s??? x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                focus('vm.positiveCase.hivConfirmId');
                return;
            }

            vm.positiveCase.hivConfirmId = utils.toUpperCase(vm.positiveCase.hivConfirmId);

            if (!vm.positiveCase.confirmLab || !vm.positiveCase.confirmLab.id) {
                blockUI.stop();
                toastr.error('B???n vui l??ng cho bi???t ph??ng x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                return;
            }

            if (typeof vm.positiveCase.rtriPos == 'undefined') {
                blockUI.stop();
                toastr.error('B???n vui l??ng cho bi???t k???t qu??? x??t nghi???m nhanh nhi???m m???i!', 'Th??ng b??o');
                return;
            }

            if (typeof vm.positiveCase.offeredPns == 'undefined') {
                blockUI.stop();
                toastr.error('B???n vui l??ng cho bi???t t??nh h??nh t?? v???n x??t nghi???m BT/BC!', 'Th??ng b??o');
                return;
            }

            if (!vm.positiveCase.treatmentStatus || !vm.positiveCase.treatmentStatus.name) {
                blockUI.stop();
                toastr.error('B???n vui l??ng cho bi???t t??nh h??nh chuy???n g???i ca d????ng t??nh n??y ??i ??i???u tr???!', 'Th??ng b??o');
                return;
            }

            if (vm.positiveCase.treatmentStatus.id === 1) {
                if (!vm.positiveCase.opc || !vm.positiveCase.opc.id) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng cho bi???t ph??ng kh??m ngo???i tr?? ???? ti???p nh???n b???nh nh??n!', 'Th??ng b??o');
                    return;
                } else if (vm.positiveCase.id == vm.weeklyReport.organization.id) {
                    blockUI.stop();
                    toastr.error('Ph??ng kh??m ngo???i tr?? b???n ??ang ch???n tr??ng v???i ch??nh c?? s??? b??o c??o. B???n vui l??ng ki???m tra l???i!', 'Th??ng b??o');
                    return;
                }
            } else if (vm.positiveCase.treatmentStatus.id === 2) {
                if (!vm.positiveCase.enrollmentDate) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng nh???p ng??y gi??? ????ng k?? v??o ??i???u tr???!', 'Th??ng b??o');
                    return;
                }

                if (!vm.positiveCase.arvInitiationDate) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng nh???p ng??y gi??? b???t ?????u ??i???u tr??? ARV!', 'Th??ng b??o');
                    return;
                }

                if (moment(vm.positiveCase.confirmDate).isAfter(vm.positiveCase.enrollmentDate)) {
                    blockUI.stop();
                    toastr.error('Ng??y ????ng k?? v??o ??i???u tr??? kh??ng th??? s???m h??n ng??y x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                    return;
                }

                if (moment(vm.positiveCase.enrollmentDate).isAfter(vm.positiveCase.arvInitiationDate)) {
                    blockUI.stop();
                    toastr.error('Ng??y b???t ?????u ??i???u tr??? ARV kh??ng th??? s???m h??n ng??y ????ng k?? v??o ??i???u tr???!', 'Th??ng b??o');
                    return;
                }

                if (!vm.positiveCase.patientChartId || vm.positiveCase.patientChartId.trim().length <= 0) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng nh???p m?? b???nh nh??n t???i ph??ng kh??m ngo???i tr??!', 'Th??ng b??o');
                    focus('vm.positiveCase.patientChartId');
                    return;
                }

                vm.positiveCase.opc = {};
                angular.copy(vm.positiveCase.vct, vm.positiveCase.opc);
            } else {
                vm.positiveCase.opc = null;
            }

            // nationalID
            if (vm.positiveCase.nationalId) {
                vm.positiveCase.nationalId = utils.toUpperCase(vm.positiveCase.nationalId);
            }

            // Check and see if the hivconfirmID already exists
            service.findAny({
                hivConfirmId: vm.positiveCase.hivConfirmId,
                owner: vm.positiveCase.vct
            }).then(function (data) {
                if (data && data.length > 0 && utils.indexOf(vm.positiveCase, data) < 0) {
                    blockUI.stop();
                    toastr.error('M?? s??? x??t nghi???m kh???ng ?????nh HIV+ ???? t???n t???i. Vui l??ng ki???m tra l???i.', 'Th??ng b??o');
                    return;
                }

                if (!vm.positiveCases) {
                    vm.positiveCases = [];
                }

                if (vm.positiveCase.id) {
                    let pos = utils.indexOf(vm.positiveCase, vm.positiveCases);
                    if (pos >= 0) {
                        vm.positiveCases.splice(pos, 1);
                    }
                }

                vm.positiveCases.push(vm.positiveCase);

                // merge treatment and positive cases
                let cases = [];
                angular.copy(vm.positiveCases, cases);

                angular.forEach(vm.treatmentCases, function (obj) {
                    if (utils.indexOf(obj, cases) < 0) {
                        cases.push(obj);
                    }
                });

                let reportToSave = {id: vm.weeklyReport.id, cases: cases};

                service.saveCases(reportToSave, function success() {
                    blockUI.stop();
                    toastr.info('???? l??u th??nh c??ng th??ng tin ca d????ng t??nh!', 'Th??ng b??o');
                }, function error() {
                    blockUI.stop();
                    toastr.error('C?? l???i x???y ra khi l??u th??ng tin ca d????ng t??nh!', 'Th??ng b??o');
                }).then(function (data) {
                    if (data && data.id) {
                        vm.weeklyReport = {};
                        angular.copy(data, vm.weeklyReport);

                        // Update the table
                        $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random());
                    }
                });

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Prepare edit form for adding a treatment case
         */
        vm.prepareEditForm4Tx = function () {

            if (vm.modalInstance != null) {
                vm.modalInstance.close();
            }

            vm.treatmentCase = {};
            vm.treatmentCase.isNew = true;
            vm.treatmentCase.sameAddress = true;

            // Default province
            vm.caseAddress = {
                residentialAddress: {province: {}, district: null},
                currentAddress: {province: {}, district: null}
            };

            angular.copy(vm.weeklyReport.organization.address.province, vm.caseAddress.residentialAddress.province);
            angular.copy(vm.weeklyReport.organization.address.province, vm.caseAddress.currentAddress.province);

            vm.datepicker4.dateOpts.minDate = null;// moment(vm.weeklyReport.fromDate).toDate();

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_treatment_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            // Clear event object
            vm.modalInstance.closed.then(function () {
                vm.treatmentCase = {};
                vm.caseAddress = {
                    residentialAddress: {province: null, district: null},
                    currentAddress: {province: null, district: null}
                };
            });
        };

        /**
         * Add a treatment case
         */
        vm.addTreatmentCase = function () {

            function listUntreatedCases() {
                blockUI.start();
                service.getUntreatedCases(vm.untreatedFilter).then(function (data) {
                    blockUI.stop();

                    if (data.totalElements <= 0) {
                        vm.prepareEditForm4Tx();
                        return;
                    }

                    // load data into table
                    vm.untreatedCases = data.content;
                    vm.bsTableControl3.options.data = vm.untreatedCases;
                    vm.bsTableControl3.options.totalRows = data.totalElements;

                    // show the table
                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'edit_treatment_search_modal.html',
                        scope: $scope,
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.closed.then(function () {
                        vm.untreatedFilter.keyword = null;
                        vm.untreatedFilter.pageIndex = 0;
                        vm.untreatedFilter.pageSize = 5;
                    });
                });
            }

            if (!vm.weeklyReport.id) {
                blockUI.start();

                if (!vm.weeklyReport.fromDate || !vm.weeklyReport.toDate) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng ch???n tu???n ????? b??o c??o!', 'Th??ng b??o');
                    return;
                }

                if (!vm.weeklyReport.organization || !vm.weeklyReport.organization.id) {
                    blockUI.stop();
                    toastr.error('B???n vui l??ng ch???n ????n v??? b??o c??o.', 'Th??ng b??o');
                    return;
                }

                service.getWeeklyReportAlt(vm.weeklyReport).then(function (data) {
                    if (data && data.id) {
                        blockUI.stop();
                        vm.weeklyReport = data;

                        vm.modalInstance = modal.open({
                            animation: true,
                            templateUrl: 'report_found_modal.html',
                            scope: $scope,
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false
                        });
                    } else {
                        service.saveWeeklyReport(vm.weeklyReport, function success() {
                            blockUI.stop();
                            toastr.info('???? l??u b??o c??o.', 'Th??ng b??o');
                        }, function failure() {
                            blockUI.stop();
                            toastr.error('Kh??ng th??? l??u b??o c??o.', 'Th??ng b??o');
                        }).then(function (data) {
                            if (data && data.id) {
                                vm.weeklyReport = data;

                                if (!vm.untreatedFilter.owner || !vm.untreatedFilter.owner.id) {
                                    vm.untreatedFilter.owner = {};
                                }
                                angular.copy(vm.weeklyReport.organization, vm.untreatedFilter.owner);

                                listUntreatedCases();
                            }
                        });
                    }
                });
            } else {
                listUntreatedCases();
            }
        };

        /**
         * Edit a treatment case
         * @param id
         * @param fromPreviousWeek - If a positive case of the same site found in previous week and was not enrolled until this week, this will be TRUE, otherwise will be FALSE
         */
        $scope.editTreatmentCase = function (id) {
            blockUI.start();
            service.getWRCase(id).then(function (data) {

                blockUI.stop();

                // if (vm.modalInstance) {
                //     vm.modalInstance.close();
                // }

                // update treatment case
                vm.treatmentCase = data;
                vm.treatmentCase.isNew = false;
                // vm.treatmentCase.fromPrevWeek = false;
                vm.treatmentCase.sameAddress = service.isSameAddress(vm.treatmentCase);

                // let mfd = moment(vm.weeklyReport.fromDate);
                // let mtd = moment(vm.weeklyReport.toDate);
                // let mcd = moment(vm.treatmentCase.confirmDate, 'YYYY-MM-DD');
                //
                // if (!(mcd.isSameOrAfter(mfd) && mcd.isSameOrBefore(mtd))) {
                //     vm.treatmentCase.fromPrevWeek = true;
                // }

                // datepickers
                // vm.datepicker3.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
                vm.datepicker3.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

                vm.datepicker4.dateOpts.minDate = null;// moment(vm.weeklyReport.fromDate).toDate();
                vm.datepicker4.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

                vm.datepicker5.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
                vm.datepicker5.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

                vm.datepicker6.dateOpts.minDate = moment(vm.weeklyReport.fromDate).toDate();
                vm.datepicker6.dateOpts.maxDate = moment(vm.weeklyReport.toDate).toDate();

                vm.caseAddress = {
                    residentialAddress: {},
                    currentAddress: {}
                };

                if (vm.treatmentCase.locations && vm.treatmentCase.locations.length > 0) {
                    angular.forEach(vm.treatmentCase.locations, function (loc) {
                        if (loc && loc.addressType == 'CURRENT_ADDRESS') {
                            angular.copy(loc, vm.caseAddress.currentAddress);
                        } else if (loc && loc.addressType == 'RESIDENT_ADDRESS') {
                            angular.copy(loc, vm.caseAddress.residentialAddress);
                        }
                    });
                }

                let modalInstance = modal.open({
                    animation: false,
                    templateUrl: 'edit_treatment_modal.html',
                    scope: $scope,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                });

                // Clear event object
                modalInstance.closed.then(function () {
                    vm.treatmentCase = {};
                    vm.caseAddress = {
                        residentialAddress: {province: null, district: null},
                        currentAddress: {province: null, district: null}
                    };
                });
            });
        };

        /**
         * Delete a treatment case
         * @param id
         */
        $scope.deleteTreatmentCase = function (id) {
            service.getWRCase(id).then(function (data) {
                if (data && data.id) {
                    vm.treatmentCase = data;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'confirm_delete_treatmentcase_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    vm.modalInstance.result.then(function (confirm) {
                        if (confirm === 'yes') {
                            let report = {id: vm.weeklyReport.id, cases: [vm.treatmentCase]};
                            service.deleteCases(report, false, function success() {
                                toastr.info('B???n ???? xo?? th??nh c??ng th??ng tin m???t ca ??i???u tr??? m???i.', 'Th??ng b??o');
                            }, function failure() {
                                toastr.error('C?? l???i x???y ra khi xo?? th??ng tin c???a m???t ca ??i???u tr??? m???i.', 'Th??ng b??o');
                            }).then(function (data) {
                                if (data && data.id) {
                                    $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random());
                                }
                            });
                        }
                    });

                    vm.modalInstance.closed.then(function () {
                        vm.treatmentCase = {};
                        vm.caseAddress = {
                            residentialAddress: {province: null, district: null},
                            currentAddress: {province: null, district: null}
                        };
                    });
                }
            });
        };

        /**
         * Save a treatment case
         */
        vm.saveTreatmentCase = function () {

            if (!vm.treatmentCase.fullname || vm.treatmentCase.fullname.trim().length <= 0) {
                toastr.error('B???n vui l??ng nh???p h??? t??n b???nh nh??n!', 'Th??ng b??o');
                focus('vm.treatmentCase.fullname');
                return;
            }

            vm.treatmentCase.fullname = utils.toTitleCase(vm.treatmentCase.fullname);

            if (!vm.treatmentCase.gender) {
                toastr.error('B???n vui l??ng nh???p gi???i t??nh c???a b???nh nh??n!', 'Th??ng b??o');
                return;
            }

            if (!vm.caseAddress.currentAddress.province || !vm.caseAddress.currentAddress.province.id
                || !vm.caseAddress.currentAddress.district || !vm.caseAddress.currentAddress.district.id) {
                toastr.error('B???n vui l??ng nh???p ?????a ch??? hi???n t???i c???a b???nh nh??n!', 'Th??ng b??o');
                return;
            }

            if (vm.treatmentCase.sameAddress) {
                let tmp = vm.caseAddress.residentialAddress.id;

                vm.caseAddress.residentialAddress = {};
                angular.copy(vm.caseAddress.currentAddress, vm.caseAddress.residentialAddress);

                vm.caseAddress.residentialAddress.id = tmp;
            } else {
                if (!vm.caseAddress.residentialAddress.province || !vm.caseAddress.residentialAddress.province.id
                    || !vm.caseAddress.residentialAddress.district || !vm.caseAddress.residentialAddress.district.id) {
                    toastr.error('B???n vui l??ng nh???p ?????a ch??? theo h??? kh???u c???a b???nh nh??n!', 'Th??ng b??o');
                    return;
                }
            }

            // Title case first word for street address
            if (vm.caseAddress.currentAddress.streetAddress && vm.caseAddress.currentAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.currentAddress.streetAddress = utils.toTitleCase(vm.caseAddress.currentAddress.streetAddress, true);
            }

            if (vm.caseAddress.residentialAddress.streetAddress && vm.caseAddress.residentialAddress.streetAddress.trim().length > 0) {
                vm.caseAddress.residentialAddress.streetAddress = utils.toTitleCase(vm.caseAddress.residentialAddress.streetAddress, true);
            }

            vm.caseAddress.currentAddress.addressType = 'CURRENT_ADDRESS';
            vm.caseAddress.residentialAddress.addressType = 'RESIDENT_ADDRESS';
            vm.treatmentCase.locations = [vm.caseAddress.currentAddress, vm.caseAddress.residentialAddress];

            if (!vm.treatmentCase.opc || !vm.treatmentCase.opc.id) {
                vm.treatmentCase.opc = {};
                angular.copy(vm.weeklyReport.organization, vm.treatmentCase.opc);
            }

            if (!vm.treatmentCase.confirmDate) {
                toastr.error('B???n vui l??ng nh???p ng??y gi??? x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                return;
            }

            if (!vm.treatmentCase.enrollmentDate) {
                toastr.error('B???n vui l??ng nh???p ng??y gi??? ????ng k?? v??o ??i???u tr???!', 'Th??ng b??o');
                return;
            }

            if (!vm.treatmentCase.arvInitiationDate) {
                toastr.error('B???n vui l??ng nh???p ng??y gi??? b???t ?????u ??i???u tr??? ARV!', 'Th??ng b??o');
                return;
            }

            if (moment(vm.treatmentCase.confirmDate).isAfter(vm.treatmentCase.enrollmentDate)) {
                toastr.error('Ng??y ????ng k?? v??o ??i???u tr??? kh??ng th??? s???m h??n ng??y x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                return;
            }

            if (moment(vm.treatmentCase.enrollmentDate).isAfter(vm.treatmentCase.arvInitiationDate)) {
                toastr.error('Ng??y b???t ?????u ??i???u tr??? ARV kh??ng th??? s???m h??n ng??y ????ng k?? v??o ??i???u tr???!', 'Th??ng b??o');
                return;
            }

            if (!vm.treatmentCase.patientChartId || vm.treatmentCase.patientChartId.trim().length <= 0) {
                toastr.error('B???n vui l??ng nh???p m?? b???nh nh??n t???i ph??ng kh??m ngo???i tr??!', 'Th??ng b??o');
                focus('vm.treatmentCase.patientChartId');
                return;
            }

            vm.treatmentCase.patientChartId = utils.toUpperCase(vm.treatmentCase.patientChartId);

            if (!vm.treatmentCase.confirmLab || !vm.treatmentCase.confirmLab.id) {
                toastr.error('B???n vui l??ng cho bi???t ph??ng x??t nghi???m kh???ng ?????nh HIV+!', 'Th??ng b??o');
                return;
            }

            // national Id
            if (vm.treatmentCase.nationalId) {
                vm.treatmentCase.nationalId = utils.toUpperCase(vm.treatmentCase.nationalId);
            }

            // Check and see if the patientChartID already exists
            service.findAny({
                patientChartId: vm.treatmentCase.patientChartId,
                owner: vm.treatmentCase.opc
            }).then(function (data) {
                if (data && data.length > 0 && utils.indexOf(vm.treatmentCase, data) < 0) {
                    toastr.error('M?? b???nh nh??n t???i ph??ng kh??m ngo???i tr?? ???? t???n t???i. Vui l??ng ki???m tra l???i.', 'Th??ng b??o');
                    return;
                }

                if (!vm.treatmentCases) {
                    vm.treatmentCases = [];
                }

                if (vm.treatmentCase.id) {
                    let pos = utils.indexOf(vm.treatmentCase, vm.treatmentCases);
                    if (pos >= 0) {
                        vm.treatmentCases.splice(pos, 1);
                    }
                }

                vm.treatmentCases.push(vm.treatmentCase);

                // merge treatment and positive cases
                let cases = [];
                angular.copy(vm.treatmentCases, cases);

                angular.forEach(vm.positiveCases, function (obj) {
                    if (utils.indexOf(obj, cases) < 0) {
                        cases.push(obj);
                    }
                });

                service.saveCases({id: vm.weeklyReport.id, cases: cases}, function success() {
                    toastr.info('???? l??u th??nh c??ng th??ng tin m???t b???nh nh??n!', 'Th??ng b??o');
                }, function error() {
                    toastr.error('C?? l???i x???y ra khi l??u th??ng tin b???nh nh??n!', 'Th??ng b??o');
                }).then(function (data) {
                    if (data && data.id) {
                        vm.weeklyReport = {};
                        angular.copy(data, vm.weeklyReport);

                        // Update the table
                        $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random());
                    }
                });

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Update weekly reoirt with a new status
         * @param status
         */
        vm.changeReportStatus = function (status, returned) {
            let shouldProceed = false;
            let shouldValidate = false;
            vm.dialog.title = 'C???p nh???t tr???ng th??i b??o c??o';
            vm.dialog.returned = returned;
            vm.dialog.status = status;

            switch (status) {
                case 0:
                    if (vm.weeklyReport.status > 0) {
                        shouldProceed = true;
                        vm.dialog.message = 'B???n c?? mu???n chuy???n tr??? l???i <b>' + vm.weeklyReport.name + '</b> cho c?? s??? <b>' + vm.weeklyReport.organization.name + '</b> kh??ng?';
                    }
                    break;
                case 1:
                    if (vm.weeklyReport.status < 1) {
                        shouldProceed = true;
                        shouldValidate = true;
                        vm.dialog.message = 'B???n c?? ch???c ch???n mu???n g???i <b>' + vm.weeklyReport.name + '</b> l??n tuy???n tr??n kh??ng?';
                    } else {
                        shouldProceed = true;
                        vm.dialog.message = 'B???n c?? ch???c ch???n mu???n tr??? l???i <b>' + vm.weeklyReport.name + '</b> cho tuy???n t???nh/huy???n kh??ng?';
                    }
                    break;
                case 2:
                    if (vm.weeklyReport.status < 2) {
                        shouldProceed = true;
                        vm.dialog.message = 'B???n c?? ch???c ch???n mu???n duy???t <b>' + vm.weeklyReport.name + '</b> c???a c?? s??? <b>' + vm.weeklyReport.organization.name + '</b> kh??ng?';
                    }
                    break;
                case 3:
                    if (vm.weeklyReport.status < 3) {
                        shouldProceed = true;
                        vm.dialog.message = 'B???n c?? ch???c ch???n mu???n xu???t b???n <b>' + vm.weeklyReport.name + '</b> c???a c?? s??? <b>' + vm.weeklyReport.organization.name + '</b> kh??ng?';
                    }
                    break;
            }

            if (!shouldProceed) {
                return;
            }

            if (shouldValidate) {
                let hasError = false;

                if (vm.weeklyReport.htsTst < vm.weeklyReport.htsPos) {
                    vm.dialog.message = '<b class="text-danger">C?? l???i s??? li???u!</b><br /><br />S??? kh??ch h??ng x??t nghi???m kh??ng th??? ??t h??n s??? kh??ch h??ng c?? k???t qu??? d????ng t??nh!';
                    vm.dialog.message += '<br /><br />&mdash;S??? l?????ng kh??ch h??ng x??t nghi???m b???n khai b??o l??: ' + vm.weeklyReport.htsTst;
                    vm.dialog.message += '<br />&mdash;S??? l?????ng kh??ch h??ng d????ng t??nh b???n khai b??o l??: ' + vm.weeklyReport.htsPos;
                    vm.dialog.message += '<br /><br />B???n vui l??ng ch???nh s???a cho ph?? h???p v?? g???i l???i.';

                    hasError = true;
                } else if (vm.weeklyReport.htsPos != vm.positiveCases.length) {
                    vm.dialog.message = '<b class="text-danger">C?? l???i s??? li???u!</b><br /><br />Danh s??ch kh??ch h??ng c?? k???t qu??? d????ng t??nh kh??ng kh???p v???i s??? l?????ng kh??ch h??ng d????ng t??nh ???????c khai b??o, c??? th??? nh?? sau:';
                    vm.dialog.message += '<br /><br />&mdash;T???ng s??? l?????ng kh??ch h??ng d????ng t??nh b???n khai b??o l??: ' + vm.weeklyReport.htsPos;
                    vm.dialog.message += '<br />&mdash;S??? l?????ng kh??ch h??ng d????ng t??nh b???n ???? nh???p trong danh s??ch l??: ' + vm.positiveCases.length;
                    vm.dialog.message += '<br /><br />B???n vui l??ng ch???nh s???a cho ph?? h???p v?? g???i l???i.';

                    hasError = true;
                }

                if (vm.weeklyReport.txNew != vm.treatmentCases.length) {
                    vm.dialog.message = '<b class="text-danger">C?? l???i s??? li???u!</b><br /><br />Danh s??ch b???nh nh??n ??i???u tr??? trong tu???n kh??ng kh???p v???i s??? l?????ng b???nh nh??n ???????c khai b??o, c??? th??? nh?? sau:';
                    vm.dialog.message += '<br /><br />&mdash;T???ng s??? l?????ng b???nh nh??n b???n khai b??o l??: ' + vm.weeklyReport.txNew;
                    vm.dialog.message += '<br />&mdash;S??? l?????ng b???nh nh??n b???n ???? nh???p trong danh s??ch l??: ' + vm.treatmentCases.length;
                    vm.dialog.message += '<br /><br />B???n vui l??ng ch???nh s???a cho ph?? h???p v?? g???i l???i.';

                    hasError = true;
                }

                if (hasError) {
                    vm.dialog.title = 'B???n vui l??ng xem l???i b??o c??o!';
                    modal.open({
                        animation: true,
                        templateUrl: 'error_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });

                    return;
                }
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_change_status_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog.returned = null;
                vm.dialog.status = null;
                vm.dialog.hasCommentError = null;
            });

        };

        $scope.$watch('vm.weeklyReport.comment', function (newVal, oldVal) {
            if (vm.dialog.hasCommentError) {
                if (newVal && newVal.trim().length > 0) {
                    vm.dialog.hasCommentError = false;
                }
            }
        });

        /**
         * Submit a valid report status
         * @param status
         */
        vm.submitReportStatus = function (status) {
            let hasError = false;
            if (vm.weeklyReport.htsTst < vm.weeklyReport.htsPos) {
                hasError = true;
            }

            if (vm.weeklyReport.htsPos != vm.positiveCases.length) {
                hasError = true;
            }

            if (vm.weeklyReport.txNew != vm.treatmentCases.length) {
                hasError = true;
            }

            if (hasError && vm.weeklyReport.status && status && vm.weeklyReport < status) {
                toastr.error('Vui l??ng ki???m tra l???i s??? li???u ??? ?? b??i ?????!', 'Th??ng b??o');
                return;
            }

            // validate comment
            if (vm.dialog.returned) {
                if (!vm.weeklyReport.comment || vm.weeklyReport.comment.trim() == '') {
                    vm.dialog.hasCommentError = true;
                    focus('vm.weeklyReport.comment');
                    return;
                } else {
                    vm.dialog.hasCommentError = false;
                }
            }

            vm.weeklyReport.status = status;

            service.updateReportStatus(vm.weeklyReport, function success() {
                toastr.info('B???n ???? c???p nh???t th??nh c??ng tr???ng th??i c???a b??o c??o.', 'Th??ng b??o');
            }, function failure() {
                toastr.error('C?? l???i x???y ra khi c???p nh???t tr???ng th??i c???a b??o c??o.', 'Th??ng b??o');
            }).then(function (data) {

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }

                if (data && data.id) {
                    $location.path('/reporting/weekly/');
                }
            });
        };

        /**
         * Edit note for a case
         */
        $scope.editCaseNote = function (_case) {
            $scope._case = _case;
            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'case_note_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
        };

        /**
         * Update positive cases status
         */
        vm.updatePositiveNewOld = function () {

            vm.dialog.title = 'C???p nh???t ca d????ng t??nh c?? - m???i';
            vm.dialog.message = 'Hi???n ch??a c?? ca d????ng t??nh n??o ???????c b??o c??o trong tu???n.';
            $scope.cases = [];

            angular.copy(vm.positiveCases, $scope.cases);
            if ($scope.cases.length > 0) {
                for (let i = 0; i < $scope.cases.length; i++) {
                    $scope.cases[i]._status = {id: $scope.cases[i].htsCaseStatus};
                }

                vm.bsTableControl4.options.columns = service.getTableDefinition4Cases(false);
                vm.bsTableControl4.options.data = $scope.cases;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'old_new_cases_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    let cases = [];
                    angular.forEach($scope.cases, function (obj) {
                        if (obj._status && typeof obj._status.id != 'undefined') {
                            obj.htsCaseStatus = obj._status.id;
                        }

                        cases.push(obj);
                    });

                    angular.forEach(vm.treatmentCases, function (obj) {
                        if (utils.indexOf(obj, cases) < 0) {
                            cases.push(obj);
                        }
                    });

                    service.saveCases({id: vm.weeklyReport.id, cases: cases}, function success() {
                        toastr.info('B???n d?? c???p nh???t th??nh c??ng t??nh tr???ng c?? - m???i cho c??c ca d????ng t??nh.', 'Th??ng b??o');
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi c???p nh???t t??nh tr???ng c?? - m???i cho c??c ca d????ng t??nh.', 'Th??ng b??o');
                    }).then(function (data) {
                        if (data && data.id) {
                            $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random(), true);
                        }
                    });
                }
            });

            vm.modalInstance.closed.then(function () {
                $scope.cases = [];
            });
        };

        /**
         * Update treatment cases status
         */
        vm.updateTreatmentNewOld = function () {

            vm.dialog.title = 'C???p nh???t ca ??i???u tr??? c?? - m???i';
            vm.dialog.message = 'Hi???n ch??a c?? ca ??i???u tr??? n??o ???????c b??o c??o trong tu???n.';
            $scope.cases = [];

            angular.copy(vm.treatmentCases, $scope.cases);
            if ($scope.cases.length > 0) {
                for (let i = 0; i < $scope.cases.length; i++) {
                    $scope.cases[i]._status = {id: $scope.cases[i].txCaseStatus};
                }

                vm.bsTableControl4.options.columns = service.getTableDefinition4Cases(true);
                vm.bsTableControl4.options.data = $scope.cases;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'old_new_cases_modal.html',
                scope: $scope,
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {
                    let cases = [];
                    angular.forEach($scope.cases, function (obj) {
                        if (obj._status && typeof obj._status.id != 'undefined') {
                            obj.txCaseStatus = obj._status.id;
                        }

                        cases.push(obj);
                    });

                    angular.forEach(vm.positiveCases, function (obj) {
                        if (utils.indexOf(obj, cases) < 0) {
                            cases.push(obj);
                        }
                    });

                    service.saveCases({id: vm.weeklyReport.id, cases: cases}, function success() {
                        toastr.info('B???n d?? c???p nh???t th??nh c??ng t??nh tr???ng c?? - m???i cho c??c b???nh nh??n m???i ????a v??o ??i???u tr??? trong tu???n.', 'Th??ng b??o');
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi c???p nh???t t??nh tr???ng c?? - m???i cho c??c b???nh nh??n m???i ????a v??o ??i???u tr??? trong tu???n.', 'Th??ng b??o');
                    }).then(function (data) {
                        if (data && data.id) {
                            $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random(), true);
                        }
                    });
                }
            });

            vm.modalInstance.closed.then(function () {
                $scope.cases = [];
            });
        };

        /**
         * Export a single report to Excel file
         */
        vm.export2Excel = function () {
            blockUI.start();

            service.export2Excel({report: vm.weeklyReport}).success(function (data, status, headers, config) {
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
            }).error(function (data) {
                // console.log(data);
            });
        };

        /**
         * Save the weeklyReport
         */
        vm.saveReport = function () {
            blockUI.start();

            if (!vm.weeklyReport.fromDate || !vm.weeklyReport.toDate) {
                blockUI.stop();
                toastr.error('B???n vui l??ng ch???n tu???n ????? b??o c??o!', 'Th??ng b??o');
                return;
            }

            if (!vm.weeklyReport.organization || !vm.weeklyReport.organization.id) {
                blockUI.stop();
                toastr.error('B???n vui l??ng ch???n ????n v??? b??o c??o.', 'Th??ng b??o');
                return;
            }

            service.getWeeklyReportAlt(vm.weeklyReport).then(function (data) {
                if (!vm.weeklyReport.id && data && data.id) {
                    blockUI.stop();
                    vm.weeklyReport = data;

                    vm.modalInstance = modal.open({
                        animation: true,
                        templateUrl: 'report_found_modal.html',
                        scope: $scope,
                        size: 'md',
                        backdrop: 'static',
                        keyboard: false
                    });
                } else {
                    service.saveWeeklyReport(vm.weeklyReport, function success() {
                        blockUI.stop();
                        toastr.info('B???n ???? l??u th??nh c??ng ' + vm.weeklyReport.name, 'Th??ng b??o');
                    }, function failure() {
                        blockUI.stop();
                        toastr.error('C?? l???i x???y ra khi l??u th??ng tin b??o c??o tu???n.', 'Th??ng b??o');
                    }).then(function (data) {
                        if (data && data.id) {
                            $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random(), true);
                        }
                    });
                }
            });
        };

        /**
         * Mark the report as district approved
         */
        vm.markDistrictApproval = function () {
            vm.dialog.title = 'Qu???n/huy???n duy???t b??o c??o';
            vm.dialog.message = 'B???n c?? ch???c ch???n mu???n duy???t b??o c??o n??y c???a c?? s??? kh??ng?';

            let modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_dapproval_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function (confirm) {
                if (confirm == 'yes') {

                    vm.weeklyReport.dapproved = true;

                    service.districtApproval(vm.weeklyReport, function success() {
                        toastr.info('B???n ???? duy???t th??nh c??ng b??o c??o.', 'Th??ng b??o');
                    }, function failure() {
                        toastr.error('C?? l???i x???y ra khi duy???t b??o c??o.', 'Th??ng b??o');
                    }).then(function (data) {
                        if (data && data.id) {
                            $location.path('/reporting/weekly/edit/' + data.id + '/?r=' + Math.random());
                        }
                    });
                }
            });

            modalInstance.closed.then(function () {
            });
        };
    }

})();
