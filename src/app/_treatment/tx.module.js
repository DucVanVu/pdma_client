(function () {
    'use strict';

    PDMA.Treatment = angular.module('PDMA.Treatment', [
        'ui.router',
        'oc.lazyLoad',
        'bsTable',
        'toastr',
        'ngFileUpload',
        'ui.bootstrap',
        'ngSanitize',
        'cfp.hotkeys',

        'PDMA.Common'
    ]);

    PDMA.Treatment.config(['$stateProvider', function ($stateProvider) {

        $stateProvider

        // General Settings
            .state('application.treatment', {
                url: '/opc/patients',
                templateUrl: '_treatment/views/patient-list.html',
                data: {pageTitle: 'Danh sách bệnh nhân'},
                controller: 'PatientListController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/PatientListController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js',
                                '_treatment/business/MMDispensingService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_dashboard', {
                url: '/opc-dashboard',
                templateUrl: '_treatment/views/dashboard.html',
                data: {pageTitle: 'Phòng khám ngoại trú - Tổng quan'},
                controller: 'TxDashboardController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/TxDashboardController.js',
                                '_treatment/business/TxDashboardService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/OrganizationService.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_calendar', {
                url: '/opc/appointment-cal',
                templateUrl: '_treatment/views/appointment_cal.html',
                data: {pageTitle: 'Lịch hẹn khám'},
                controller: 'AppointmentCalController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/AppointmentCalController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_calendar_edit', {
                url: '/opc/appointment-cal/edit',
                templateUrl: '_treatment/views/appointment_edit.html',
                data: {pageTitle: 'Đặt lịch hẹn khám'},
                controller: 'AppointmentEditController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/AppointmentEditController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_appointment_late', {
                url: '/opc/appointment-cal/late',
                templateUrl: '_treatment/views/appointment_late.html',
                data: {pageTitle: 'Bệnh nhân khám muộn'},
                controller: 'AppointmentLateController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/AppointmentLateController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_appointment_na', {
                url: '/opc/appointment-cal/na',
                templateUrl: '_treatment/views/appointment_na.html',
                data: {pageTitle: 'Bệnh nhân không có lịch khám'},
                controller: 'AppointmentNaController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/AppointmentNaController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_appointment_result', {
                url: '/opc/appointment-cal/result/:origin/:caseOrgId/:appId',
                templateUrl: '_treatment/views/appointment_result.html',
                data: {pageTitle: 'Cập nhật kết quả khám - cấp thuốc'},
                controller: 'AppointmentResultController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/AppointmentResultController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/AppointmentService.js',
                                '_treatment/controllers/_ViralLoadSubController.js',
                                '_treatment/controllers/_CD4SubController.js',
                                '_treatment/controllers/_MmdSubController.js',
                                '_treatment/controllers/_HepSubController.js',
                                '_treatment/controllers/_ShiSubController.js',
                                '_treatment/controllers/_ClinicalStageSubController.js',
                                '_treatment/controllers/_AppointmentSubController.js',
                                '_treatment/business/ClinicalStageService.js',
                                '_treatment/business/MMDispensingService.js',
                                '_treatment/business/LabTestService.js',
                                '_treatment/business/HepatitisService.js',
                                '_treatment/business/TreatmentService.js',
                                '_treatment/business/SHIInterviewService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/RegimenService.js',
                                '_treatment/controllers/_TBTreatment2SubController.js',
								'_treatment/business/TBTreatment2Service.js',
								'_treatment/controllers/_TBProphylaxis2SubController.js',
								'_treatment/business/TBProphylaxis2Service.js',
								'_treatment/controllers/_TBProphylaxisDispense2SubController.js',
								'_treatment/business/TBProphylaxisDispense2Service.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_edit_patient', {
                url: '/opc/edit-patient/:id',
                templateUrl: '_treatment/views/edit-patient.html',
                data: {pageTitle: 'Cập nhật thông tin bệnh nhân'},
                controller: 'EditPatientController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/EditPatientController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/TreatmentService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/HIVConfirmLabService.js',
                                'dictionaries/business/RegimenService.js',
                                'dictionaries/business/OrganizationService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_view_patient', {
                url: '/opc/view-patient/:id',
                templateUrl: '_treatment/views/view-patient.html',
                data: {pageTitle: 'Thông tin bệnh nhân'},
                controller: 'ViewPatientController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/ViewPatientController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                '_treatment/business/SHIInterviewService.js',
                                '_treatment/business/ClinicalStageService.js',
                                '_treatment/business/HepatitisService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/HIVConfirmLabService.js',
                                'dictionaries/business/RegimenService.js',
                                'dictionaries/business/OrganizationService.js',
                                'settings/business/SettingsService.js',
                                '_treatment/business/AppointmentService.js',
                                '_treatment/controllers/_TreatmentInterruptionSubController.js',
                                '_treatment/business/MMDispensingService.js',
                                '_treatment/controllers/_MmdSubController.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_arv_history', {
                url: '/opc/patient/:id/arv-history',
                templateUrl: '_treatment/views/arv-treatment-history.html',
                data: {pageTitle: 'Lịch sử điều trị ARV'},
                controller: 'ArvTreatmentHistoryController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/ArvTreatmentHistoryController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/TreatmentService.js',
                                'dictionaries/business/DictionaryService.js',
                                'dictionaries/business/RegimenService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_reporting', {
                url: '/opc/report',
                templateUrl: '_treatment/views/report.html',
                data: {pageTitle: 'Báo cáo'},
                controller: 'ReportController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/ReportController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/ReportService.js',
                                'dictionaries/business/AdminUnitService.js',
                                'dictionaries/business/OrganizationService.js',
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_risk_interview', {
                url: '/opc/patient/:id/risk-interview',
                templateUrl: '_treatment/views/risk-interviews.html',
                data: {pageTitle: 'Thông tin bệnh nhân'},
                controller: 'RiskInterviewController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/RiskInterviewController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/RiskInterviewService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_shi_interview', {
                url: '/opc/patient/:id/shi-interview/:interview_id',
                templateUrl: '_treatment/views/shi-interview.html',
                data: {pageTitle: 'Cập nhật thông tin sử dụng bảo hiểm y tế'},
                controller: 'SHIInterviewController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/SHIInterviewController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/SHIInterviewService.js',
                                'dictionaries/business/DictionaryService.js',
                                'dictionaries/business/OrganizationService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_vl_requiring_results', {
                url: '/opc/vl/results',
                templateUrl: '_treatment/views/viral-load.html',
                data: {pageTitle: 'Thông tin xét nghiệm TLVR'},
                controller: 'ViralLoadController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/ViralLoadController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_viral_load', {
                url: '/opc/patient/:id/viral-load',
                templateUrl: '_treatment/views/viral-load.html',
                data: {pageTitle: 'Thông tin xét nghiệm TLVR'},
                controller: 'ViralLoadController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/ViralLoadController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                'dictionaries/business/OrganizationService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_cd4_requiring_results', {
                url: '/opc/cd4/results',
                templateUrl: '_treatment/views/cd4.html',
                data: {pageTitle: 'Thông tin xét nghiệm CD4'},
                controller: 'CD4Controller as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/CD4Controller.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_cd4', {
                url: '/opc/patient/:id/cd4',
                templateUrl: '_treatment/views/cd4.html',
                data: {pageTitle: 'Thông tin xét nghiệm CD4'},
                controller: 'CD4Controller as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/CD4Controller.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                'dictionaries/business/OrganizationService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_hepatitis', {
                url: '/opc/patient/:id/hepatitis',
                templateUrl: '_treatment/views/hepatitis.html',
                data: {pageTitle: 'Thông tin xét nghiệm - điều trị viêm gan'},
                controller: 'HepatitisController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/HepatitisController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/HepatitisService.js',
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_pregnancy', {
                url: '/opc/patient/:id/pregnancy',
                templateUrl: '_treatment/views/pregnancy.html',
                data: {pageTitle: 'Thông tin mang thai - sinh đẻ'},
                controller: 'PregnancyController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/PregnancyController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/PregnancyService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_mmt', {
                url: '/opc/patient/:id/mmt',
                templateUrl: '_treatment/views/mmt.html',
                data: {pageTitle: 'Thông tin điều trị Methadone'},
                controller: 'MMTController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/MMTController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/MMTService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_hiv_dr', {
                url: '/opc/patient/:id/hiv-dr',
                templateUrl: '_treatment/views/hiv-dr.html',
                data: {pageTitle: 'Thông tin xét nghiệm kháng thuốc ARV'},
                controller: 'HIVDRController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/HIVDRController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/LabTestService.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_hiv_recency', {
                url: '/opc/patient/:id/hiv-recency',
                templateUrl: '_treatment/views/hiv-recency.html',
                data: {pageTitle: 'Thông tin xét nghiệm nhiễm mới'},
                controller: 'HIVRecencyController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/HIVRecencyController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/RecencyService.js'
                            ]
                        });
                    }]
                }
            })

            .state('application.treatment_tb_hiv', {
                url: '/opc/patient/:id/tb-hiv',
                templateUrl: '_treatment/views/tb-hiv.html',
                data: {pageTitle: 'Thông tin về lao - HIV'},
                controller: 'TBController as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/TBController.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/TBProphylaxisService.js',
                                '_treatment/business/TBTreatmentService.js'
                            ]
                        });
                    }]
                }
            })
			.state('application.treatment_tbtreatment2', {
                url: '/opc/patient/:id/tbtreatment2',
                templateUrl: '_treatment/views/tbtreatment2.html',
                data: {pageTitle: 'Thông tin sàng lọc, chuẩn đoán, điều trị lao'},
                controller: 'TBTreatment2Controller as vm',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'PDMA.Treatment',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '_treatment/controllers/TBTreatment2Controller.js',
                                '_treatment/business/PatientService.js',
                                '_treatment/business/TBTreatment2Service.js',
                                'dictionaries/business/DictionaryService.js'
                            ]
                        });
                    }]
                }
            })

           
    }]);

})();