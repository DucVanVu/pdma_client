/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').controller('ReportController', ReportController);

    ReportController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$cookies',
        'settings',
        'Utilities',
        '$uibModal',
        '$state',
        'toastr',
        'blockUI',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'bsTableAPI',
        'ReportService',
        'AdminUnitService',
        'OrganizationService',
        'PatientService'
    ];

    function ReportController($rootScope, $scope, $http, $timeout, $cookies, settings, utils, modal, $state, toastr, blockUI, focus, focusFlatpickr, openSelectBox, bsTableAPI, repService, auService, orgService, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;
        vm.modalInstance = null;
        vm.orgsReadable = [];
        vm.orgsWritable = [];

        vm.filter = {
            pageIndex: 0,
            pageSize: 25
        };

        vm.prevSelectedReportType = null;
        vm.selectedReportType = null;

        vm.selectedOpcs = [];

        vm.__type_heading_indicator = {
            id: '',
            type: '__heading',
            heading: true,
            name: 'Báo cáo chỉ số'
        };

        vm.__type_heading_tablular = {
            id: '',
            type: '__heading',
            heading: true,
            name: 'Báo cáo danh sách'
        };

        vm.reportTypes = [
            vm.__type_heading_indicator,
            // {
            //     id: 'LY_REQUEST_SEP_2021',
            //     available: true,
            //     name: 'Báo cáo cho Ly - Sep 2021'
            // },
            // {
            //     id: 'LY_REQUEST_SEP_2021_2',
            //     available: true,
            //     name: 'Báo cáo cho Ly - Sep 2021'
            // },
            {
                id: 'VL_VAAC_REPORT',
                type: '__indicator',
                available: true,
                name: '1. Báo cáo xét nghiệm tải lượng virus HIV (theo mẫu của VAAC)'
            },
            // {
            //     id: 'VL_PEPFAR_REPORT',
            //     type: '__indicator',
            //     available: true,
            //     name: '2. Báo cáo xét nghiệm tải lượng virus HIV (theo yêu cầu của PEPFAR)'
            // },
            {
                id: 'VL_PEPFAR_REPORT_OLD',
                type: '__indicator',
                available: true,
                name: '2. Báo cáo xét nghiệm tải lượng virus HIV (theo yêu cầu của PEPFAR)' //'2.1. Báo cáo xét nghiệm tải lượng virus HIV (theo yêu cầu của PEPFAR, mẫu báo cáo cũ)'
            },
            // {
            //     id: 'MER_25_OPC',
            //     type: '__indicator',
            //     available: true,
            //     singleOrganization: true,
            //     calculationClassified: true,
            //     // rawDataOnly: true,
            //     name: '3. Báo cáo PEPFAR (MER 2.5) hoạt động chăm sóc - điều trị HIV/AIDS'
            // },
            {
                id: 'MER_OPC',
                type: '__indicator',
                available: true,
                singleOrganization: true,
                // calculationClassified: true,
                rawDataOnly: true,
                // testing: true,
                name: '3. Báo cáo PEPFAR (MER 2.6) hoạt động chăm sóc - điều trị HIV/AIDS'
            },
            {
                id: 'OPC_REPORT_MONTHLY',
                type: '__indicator',
                available: true,
                singleOrganization: true,
                calculationClassified: true,
                rawDataOnly: true,
                // testing: true,
                name: '4. Báo cáo hoạt động tại cơ sở chăm sóc - điều trị HIV/AIDS (dự án EPIC)'
            },
            vm.__type_heading_tablular,
            {
                id: 'CBS_REPORT',
                type: '__tabular',
                available: true,
                passwordProtected: true,
                name: '1. Dữ liệu báo cáo giám sát ca bệnh'
            },
            {
                id: 'VL_SCHEDULE',
                type: '__tabular',
                available: true,
                name: '2. Bệnh nhân đến lịch làm xét nghiệm tải lượng virus HIV'
            },
            {
                id: 'SHI_EXPIRED',
                type: '__tabular',
                available: true,
                name: '3. Bệnh nhân có thẻ bảo hiểm y tế đã hết hạn sử dụng'
            },
            {
                id: 'NO_SHI',
                type: '__tabular',
                available: true,
                name: '4. Bệnh nhân chưa có thông tin thẻ bảo hiểm y tế'
            },
            // {
            //     id: 'SHI_TOBE_EXPIRED',
            //     type: '__tabular',
            //     available: true,
            //     name: 'Bệnh nhân có thẻ bảo hiểm y tế sẽ hết hạn trong 2 tháng tới'
            // },
            {
                id: 'VL_DATA',
                type: '__tabular',
                available: true,
                name: '5. Dữ liệu xét nghiệm tải lượng virus HIV theo thời gian'
            },
            {
                id: 'CD4_DATA',
                type: '__tabular',
                available: true,
                name: '6. Dữ liệu xét nghiệm CD4 theo thời gian'
            },
            {
                id: 'RISKGROUP_REPORT',
                type: '__tabular',
                available: true,
                name: '7. Dữ liệu phân nhóm nguy cơ mới nhất'
            },
            {
                id: 'TX_TABULAR_SUMMARY',
                type: '__tabular',
                available: true,
                calculationClassified: true,
                name: '8. Tổng hợp tình hình điều trị tại cơ sở (đang quản lý, mới điều trị, chuyển đi, bỏ trị, tử vong)'
            },
            {
                id: 'NEW_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                includeAppointmentInfo: true,
                name: '8.1. Bệnh nhân mới đăng ký điều trị (gồm cả điều trị lần đầu, điều trị lại, chuyển đến)'
            },
            {
                id: 'NEWLY_ENROLLED_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                // sub: true,
                name: '8.1.1. Bệnh nhân điều trị lần đầu'
            },
            {
                id: 'RETURNED_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                // sub: true,
                name: '8.1.2. Bệnh nhân điều trị lại'
            },
            {
                id: 'TRANSEDIN_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                // sub: true,
                name: '8.1.3. Bệnh nhân chuyển tới từ cơ sở điều trị khác'
            },
            {
                id: 'ACTIVE_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                calculationClassified: true,
                includeExtra: true,
                includeAppointmentInfo: true,
                name: '8.2. Bệnh nhân đang được quản lý'
            },
            {
                id: 'TRANSOUT_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                calculationClassified: true,
                includeExtra: true,
                includeAppointmentInfo: true,
                name: '8.3. Bệnh nhân được chuyển tiếp điều trị tới cơ sở khác'
            },
            {
                id: 'DEAD_LTFU_PATIENT_REPORT',
                type: '__tabular',
                available: true,
                includeExtra: true,
                includeAppointmentInfo: true,
                name: '8.4. Bệnh nhân tử vong hoặc bỏ điều trị'
            },
            {
                id: 'MMD_LINELIST_DATA',
                type: '__tabular',
                available: true,
                singleOrganization: true,
                name: '9. Dữ liệu cấp thuốc nhiều tháng'
            },
            // {
            //     id: 'HEPETITIS_DATA',
            //     type: '__tabular',
            //     available: true,
            //     name: '9. Dữ liệu sàng lọc, điều trị viêm gan B/C'
            // },
            // {
            //     id: 'TB_PROPHYLAXIS_DATA',
            //     type: '__tabular',
            //     available: true,
            //     name: '10. Dữ liệu điều trị dự phòng lao cho bệnh nhân'
            // },
            // {
            //     id: 'TB_DIAG_TREATMENT_DATA',
            //     type: '__tabular',
            //     available: true,
            //     name: '11. Dữ liệu chẩn đoán, điều trị lao cho bệnh nhân'
            // }
            // {id: '', name: '-'},
            // {id: 'QUARTERLY_TB_TREATMENT', available: true, name: 'Báo cáo hoạt động Lao/HIV (Báo cáo quý)'},
            // {id: 'MONTHLY_TB_TREATMENT', available: true, name: 'Báo cáo hoạt động Lao/HIV (Báo cáo 6 tháng)'}
            // {id: 'VL_LOGBOOK_REPORT', available: false, name: 'Sổ xét nghiệm tải lượng virus HIV'},
            // {id: '', name: '-'},
            // {id: 'SHI_REPORT', available: false, name: 'Báo cáo tình hình sử dụng thẻ bảo hiểm y tế'},
            // {id: 'CV556_REPORT', available: false, name: 'Báo cáo tình hình sử dụng thẻ bảo hiểm y tế (theo CV-556)'},
            // {id: '', name: '-'},
        ];

        vm.algorithms = [
            {id: 'CIRCULAR_03', name: 'Tính theo thông tư 03/2015/TT-BYT'},
            {id: 'PEPFAR', name: 'Tính theo hướng dẫn của chương trình PEPFAR'}
        ];

        vm.quarters = [
            {id: 1, name: 'Quí 1'},
            {id: 2, name: 'Quí 2'},
            {id: 3, name: 'Quí 3'},
            {id: 4, name: 'Quí 4'}
        ];
        vm.months = [
            {id: 1, name: '6 tháng lần 1'},
            {id: 2, name: '6 tháng lần 2'}
        ];

        vm.provinces = [];
        vm.organizations = [];
        vm.years = [];

        vm.filteredReportTypes_0 = [];
        vm.filteredReportTypes = [];
        vm.filteredReportKeyword = null;
        vm.report = {algorithm: 'PEPFAR'};

        // Get all provinces
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();
            if (data) {
                vm.provinces = data;
            } else {
                vm.provinces = [];
            }

            console.log(vm.provinces);
        });

        // Seclect only OPCs
        vm.getOPCs = function (provinceId) {
            let provinceIds = [];

            if (provinceId) {
                provinceIds.push(provinceId);
            }

            blockUI.start();
            orgService.getAllOrganizations({
                provinceIds: provinceIds,
                checkUserPermission: true,
                opcSiteOnly: true,
                activeOnly: true,
                compact: true
            }).then(function (data) {
                blockUI.stop();

                // Update the list of organizations for the select list
                vm.organizations = [];
                angular.copy(data, vm.organizations);

                if (vm.organizations.length > 1) {
                    vm.organizations.unshift({id: -1, name: '-'});
                    vm.organizations.unshift({id: 0, name: 'Tất cả các đơn vị'});
                }
                vm.report.organization = vm.organizations[0].id;

                // Check if the selected organization is still in the list after changing the province
                if (vm.report.organization) {
                    let found = false;
                    for (let j = 0; j < vm.organizations.length; j++) {
                        if (vm.organizations[j].id == vm.report.organization) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        vm.report.organization = null;
                    }
                }
            });
        };

        // initialize
        vm.getOPCs();

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal === true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                // vm.organizations = [];
                // angular.copy(vm.orgsReadable, vm.organizations);
                //
                // if (vm.organizations.length > 1) {
                //     vm.organizations.unshift({id: -1, name: ''});
                //     vm.organizations.unshift({id: 0, name: 'Tất cả các đơn vị'});
                // }
                // vm.report.organization = vm.organizations[0].id;

                // initialize the list
                vm.filteredReportTypes_0 = [];
                if (!$scope.isDonor($scope.currentUser)) {
                    angular.copy(vm.reportTypes, vm.filteredReportTypes_0);
                } else {
                    angular.forEach(vm.reportTypes, function (obj) {
                        if (obj.type == '__indicator') {
                            vm.filteredReportTypes_0.push(obj);
                        }
                    });
                }

                angular.copy(vm.filteredReportTypes_0, vm.filteredReportTypes);

                // focus on the keyword
                $timeout(function () {
                    focus('vm.filteredReportKeyword');
                }, 500);
            }
        });

        vm.clearKeyword = function () {
            vm.filteredReportKeyword = null;

            $timeout(function () {
                focus('vm.filteredReportKeyword');
            }, 500);
        };

        vm.searchReport = function () {
            vm.selectedReportType = null;

            if (!vm.filteredReportKeyword || vm.filteredReportKeyword.trim() == '') {
                vm.filteredReportTypes = [];
                angular.copy(vm.filteredReportTypes_0, vm.filteredReportTypes);
                return;
            }

            let indicatorTypes = [];
            let tabularTypes = [];
            angular.forEach(vm.reportTypes, function (obj) {
                if (obj.type === '__heading') {
                    return;
                }

                let keyword = vm.filteredReportKeyword.trim().toLowerCase();
                if (obj.name.toLowerCase().indexOf(keyword) >= 0) {
                    if (obj.type == '__indicator') {
                        indicatorTypes.push(obj);
                    } else {
                        tabularTypes.push(obj);
                    }
                }
            });

            vm.filteredReportTypes = [];
            if (indicatorTypes.length > 0) {
                vm.filteredReportTypes.push(vm.__type_heading_indicator);
                vm.filteredReportTypes = vm.filteredReportTypes.concat(indicatorTypes);
            }

            if (tabularTypes.length > 0) {
                vm.filteredReportTypes.push(vm.__type_heading_tablular);
                vm.filteredReportTypes = vm.filteredReportTypes.concat(tabularTypes);
            }
        };

        $scope.$watch('vm.filteredReportKeyword', function (newVal, oldVal) {
            vm.selectedReportType = null;
            if (!newVal) {
                $timeout(function () {
                    vm.filteredReportTypes = [];
                    angular.copy(vm.filteredReportTypes_0, vm.filteredReportTypes);
                }, 500);
            }
        });

        /**
         * Making sure only one option is selected
         */
        vm.onSingleSelectionClick = function (opt) {
            if (!vm.report || (!vm.report.includeExtra && !vm.report.includeAppointmentInfo)) {
                return;
            }

            switch (opt) {
                case 1:
                    // extra is clicked
                    if (vm.report.includeExtra) {
                        vm.report.includeAppointmentInfo = null;
                    }
                    break;
                case 2:
                    // app info is clicked
                    if (vm.report.includeAppointmentInfo) {
                        vm.report.includeExtra = null;
                    }
                    break;
            }
        };

        // Data initiation
        (function () {
            let currentYear = moment(new Date()).year();
            for (let i = 2020; i <= currentYear + 1; i++) {
                vm.years.unshift({id: i, name: 'Năm ' + i});
            }
        })();

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

        // Report start date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.report.fromDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.report.fromDate) {
                    fpItem.setDate(moment(vm.report.fromDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.report.fromDate = null;
                }
            }
        };

        // Report end date
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.report.toDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.report.toDate) {
                    fpItem.setDate(moment(vm.report.toDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.clear();
                    vm.report.toDate = null;
                }
            }
        };

        // Report at date
        vm.datepicker3 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.report.atDate = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker3.fpItem = fpItem;
                if (vm.report.atDate) {
                    fpItem.setDate(moment(vm.report.atDate).toDate());
                }
            }
        };

        // For month selection
        vm.datepicker4 = {
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
                })],
                shorthandCurrentMonth: false,
                locale: 'vn',
                position: 'auto',
                onChange: [function () {
                    const d = this.selectedDates[0];

                    if (d && _.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.report.atDate = m.add(7, 'hours').toDate();
                    }
                }],
            },
            datePostSetup: function (fpItem) {
                vm.datepicker4.fpItem = fpItem;
                if (vm.report.atDate) {
                    fpItem.setDate(moment(vm.report.atDate).toDate());
                }
            }
        };

        // Entry grid
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
                columns: repService.getTableDefinition(),
                onPageChange: function (index, pageSize) {
                    vm.filter.pageSize = pageSize;
                    vm.filter.pageIndex = index - 1;

                    vm.getEntries();
                }
            }
        };

        /**
         * On selection of report type
         */
        vm.selectReportType = function (t) {

            vm.selectedReportType = {};

            if (!t) {
                return;
            }

            angular.copy(t, vm.selectedReportType);

            if (vm.selectedReportType == '') {
                vm.selectedReportType = vm.reportTypes[0].id;
            }

            if (vm.selectedReportType && (vm.selectedReportType.id == 'VL_PEPFAR_REPORT' || vm.selectedReportType.id == 'VL_PEPFAR_REPORT_OLD')) {
                vm.datepicker1.clear();
                vm.datepicker2.clear();

                vm.report.fromDate = null;
                vm.report.toDate = null;
            }
            if (vm.selectedReportType && vm.selectedReportType.id == 'QUARTERLY_TB_TREATMENT') {
                vm.datepicker1.clear();
                vm.datepicker2.clear();

                vm.report.fromDate = null;
                vm.report.toDate = null;
            }
            if (vm.selectedReportType && vm.selectedReportType.id == 'MONTHLY_TB_TREATMENT') {
                vm.datepicker1.clear();
                vm.datepicker2.clear();

                vm.report.fromDate = null;
                vm.report.toDate = null;
            }

            // vm.prevSelectedReportType = vm.selectedReportType.id;
        };

        /**
         * Generate report
         */
        vm.generateReport = function () {

            // Validate
            if (vm.selectedReportType.id == 'VL_PEPFAR_REPORT' || vm.selectedReportType.id == 'VL_PEPFAR_REPORT_OLD' || vm.selectedReportType.id == 'MER_OPC') {
                if (!vm.report.selQuarter) {
                    toastr.error('Vui lòng chọn quý báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selQuarter');
                    return;
                }

                if (!vm.report.selYear) {
                    toastr.error('Vui lòng chọn năm báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selYear');
                    return;
                }

                // Converting to (fromDate, toDate)
                if (vm.selectedReportType.id == 'MER_OPC') {
                    repService.convertReportingPeriod(vm.report, true);
                } else {
                    repService.convertReportingPeriod(vm.report);
                }
            } else if (vm.selectedReportType.id == 'ACTIVE_PATIENT_REPORT' || vm.selectedReportType.id == 'MMD_LINELIST_DATA') {
                if (!vm.report.atDate) {
                    toastr.error('Vui lòng chọn ngày chốt dữ liệu báo cáo.', 'Thông báo');
                    focusFlatpickr('vm.report.atDate');
                    return;
                }
            } else if (vm.selectedReportType.id == 'QUARTERLY_TB_TREATMENT') {
                if (!vm.report.selQuarter) {
                    toastr.error('Vui lòng chọn quý báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selQuarter');
                    return;
                }

                if (!vm.report.selYear) {
                    toastr.error('Vui lòng chọn năm báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selYear');
                    return;
                }

                // Converting to (fromDate, toDate)
                repService.convertReportingPeriodTB(vm.report);
            } else if (vm.selectedReportType.id == 'MONTHLY_TB_TREATMENT') {
                if (!vm.report.selQuarter) {
                    toastr.error('Vui lòng chọn tháng báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selQuarter');
                    return;
                }

                if (!vm.report.selYear) {
                    toastr.error('Vui lòng chọn năm báo cáo.', 'Thông báo');
                    openSelectBox('vm.report.selYear');
                    return;
                }

                // Converting to (fromDate, toDate)
                repService.convertReportingPeriodTBMonth(vm.report);
            } else if (vm.selectedReportType.id != 'RISKGROUP_REPORT' && vm.selectedReportType.id != 'VL_SCHEDULE' && vm.selectedReportType.id != 'SHI_EXPIRED' && vm.selectedReportType.id != 'NO_SHI') {
                if (!vm.report.fromDate) {
                    toastr.clear();
                    toastr.error('Vui lòng chọn ngày bắt đầu của kỳ báo cáo.', 'Thông báo');
                    focusFlatpickr('vm.report.fromDate');
                    return;
                }

                if (!vm.report.toDate) {
                    toastr.clear();
                    toastr.error('Vui lòng chọn ngày kết thúc của kỳ báo cáo.', 'Thông báo');
                    focusFlatpickr('vm.report.toDate');
                    return;
                }

                let mStartDate = moment(vm.report.fromDate);
                let mEndDate = moment(vm.report.toDate).set({hour: 23, minute: 59, second: 59});

                // --> change to the end of day
                vm.report.toDate = mEndDate.toDate();

                if (mStartDate.isAfter(vm.report.toDate)) {
                    toastr.clear();
                    toastr.error('Ngày bắt đầu phải trước ngày kết thúc của kỳ báo cáo.', 'Thông báo');
                    focusFlatpickr('vm.report.toDate');
                    return;
                }

                // -> need to make sure the period is a month
                if (vm.selectedReportType.id == 'OPC_REPORT_MONTHLY') {
                    let endOfMonth = moment(vm.report.toDate).endOf('month');
                    let monthDiff = mEndDate.diff(mStartDate, 'months');

                    if (mStartDate.date() != 1 || !mEndDate.isSame(endOfMonth, 'day') || monthDiff != 0) {
                        toastr.clear();
                        toastr.error('Giai đoạn báo cáo phải là một tháng. Vui lòng chọn lại.', 'Thông báo');
                        focusFlatpickr('vm.report.fromDate');
                        return;
                    }
                }
            }

            if (vm.report.organization == null || vm.report.organization < 0) {
                toastr.error('Vui lòng chọn đơn vị cần sinh báo cáo');
                openSelectBox('vm.report.organization');
                return;
            }

            // in case a report requires that it be generated for each organization only
            if (vm.selectedReportType.singleOrganization && vm.report.organization <= 0) {
                toastr.error('Vui lòng chọn đơn vị cần sinh báo cáo');
                openSelectBox('vm.report.organization');
                return;
            }

            vm.report.reportType = vm.selectedReportType.id;
            vm.report.password = utils.generatePassword(6);

            blockUI.start();
            repService.generateReport(vm.report).success(function (data, status, headers, config) {
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

                    // hide the password after 1 minute
                    vm.report.countdown = 60;
                    (function countdown() {
                        $timeout(function () {
                            vm.report.countdown--;
                            if (vm.report.countdown <= 0) {
                                vm.report.password = null;
                            } else {
                                countdown();
                            }
                        }, 1000);
                    })();
                } catch (ex) {
                    console.log(ex);
                }
            }).error(function (data) {
                blockUI.stop();

                // hide the password immediately
                vm.report.password = null;
            });
        };

        /**
         * Copy password to clipboard
         */
        vm.copyPassword2Clipboard = function () {
            if (vm.report.passwordCopied) {
                return;
            }

            let copyElement = document.createElement("textarea");

            copyElement.style.position = 'fixed';
            copyElement.style.opacity = '0';
            copyElement.textContent = decodeURI(vm.report.password);

            let body = document.getElementsByTagName('body')[0];
            body.appendChild(copyElement);

            copyElement.select();
            copyElement.setSelectionRange(0, 99999); // for mobile devices
            document.execCommand('copy');

            vm.report.passwordCopied = true;

            body.removeChild(copyElement);
        };

        /**
         * On selection of an organization
         */
        vm.onOrganizationChange = function () {
            if (vm.report.organization == -1) {
                vm.report.organization = vm.organizations[0];
            }
        };

        vm.reset = function () {
            vm.report = {};
            vm.selectReportType = null;
        };

        /**
         * Provinces watcher
         */
        $scope.$watch('vm.report.province', function (newVal, oldVal) {
            // if (!newVal) {
            //
            //     vm.organizations = [];
            //     angular.copy(vm.orgsReadable, vm.organizations);
            //
            //     if (vm.organizations.length > 1) {
            //         vm.organizations.unshift({id: -1, name: '-'});
            //         vm.organizations.unshift({id: 0, name: 'Tất cả các đơn vị'});
            //     }
            //
            //     if (vm.organizations.length > 0) {
            //         vm.report.organization = vm.organizations[0].id;
            //     }
            //
            //     return;
            // }

            vm.getOPCs(newVal);
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

        /**
         * -------------------------------------------------
         * END: Shared functions
         * -------------------------------------------------
         */
    }

})();
