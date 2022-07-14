/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('PatientService', PatientService);

    PatientService.$inject = [
        '$http',
        '$q',
        '$filter',
        'settings',
        'Utilities',
        'constants'
    ];

    function PatientService($http, $q, $filter, settings, utils, constants) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.EDIT_PATIENT_ENTRY = '_tx_patient_being_edited';
        self.SELECTED_PATIENT_ID = constants.cookies_tx_selected_patient_id;
        self.STATUS_VISIBILITY = constants.cookies_tx_status_visibility;
        self.SELECTED_SHORTCUTS = '_tx_selected_shortcuts';
        self.SELECTED_OPC = '_tx_selected_facility';

        self.restorePatient = restorePatient;
        self.softDeletePatient = softDeletePatient;
        self.deletePatients = deletePatients;
        self.savePatient = savePatient;
        self.getTableDefinition = getTableDefinition;
        self.getTableDefinition4Risks = getTableDefinition4Risks;
        self.getTableDefinition4WrCaseSearch = getTableDefinition4WrCaseSearch;
        self.getTableDefinition4StatusHistory = getTableDefinition4StatusHistory;
        self.getTableDefinition4StatusHistoryAlt = getTableDefinition4StatusHistoryAlt;
        self.getPatients = getPatients;
        self.getWrPatients = getWrPatients;
        self.getWrPatient = getWrPatient;
        self.markAsLinked2OPCAssist = markAsLinked2OPCAssist;
        self.buildPatientFromWRCase = buildPatientFromWRCase;
        self.getPatients4Appointment = getPatients4Appointment;
        self.getPatient = getPatient;
        self.getCaseOrg = getCaseOrg;
        self.updateCaseOrg = updateCaseOrg;
        self.deleteCaseOrg = deleteCaseOrg;
        self.getFullCaseStatusHistory = getFullCaseStatusHistory;
        self.updatePatientStatus = updatePatientStatus;
        self.updateReferralResult = updateReferralResult;
        self.cancelReferral = cancelReferral;
        self.reEnrollPatient = reEnrollPatient;
        self.downloadReferralSheet = downloadReferralSheet;
        self.export2Excel = export2Excel;
        self.exportSearchResults = exportSearchResults;
        self.exportAdhocData = exportAdhocData;
        self.isSameAddress = isSameAddress;
        self.checkEditable = checkEditable;
        self.hivInfoIdExists = hivInfoIdExists;
        self.nationalIdExists = nationalIdExists;
        self.getMmdStatus = getMmdStatus;
        self.patientChartIdExists = patientChartIdExists;
        self.patientRecordExists = patientRecordExists;
        self.cropPhoto = cropPhoto;
        self.getPhoto = getPhoto;
        self.getBarcode = getBarcode;
        self.updateHIVInfoID = updateHIVInfoID;
        self.removeHIVInfoID = removeHIVInfoID;

        function buildPatientFromWRCase(wrCase) {
            let patient = {theCase: {}};

            if (wrCase && wrCase.id) {

                patient.organization = wrCase.opc;
                patient.enrollmentType = 'NEWLY_ENROLLED';
                patient.patientChartId = wrCase.patientChartId;
                patient.startDate = wrCase.enrollmentDate;
                patient.arvStartDate = wrCase.arvInitiationDate;
                patient.status = 'ACTIVE';
                patient.endDate = null;

                patient.theCase.person = {
                    dob: wrCase.dob,
                    locations: wrCase.locations,
                    fullname: wrCase.fullname,
                    gender: wrCase.gender,
                    nidNumber: wrCase.nationalId
                };

                if (patient.theCase.person.locations && patient.theCase.person.locations.length > 0) {
                    patient.theCase.person.locations[0].id = null;
                }

                if (patient.theCase.person.locations && patient.theCase.person.locations.length > 1) {
                    patient.theCase.person.locations[1].id = null;
                }

                patient.theCase.hivScreenDate = wrCase.screeningDate;
                patient.theCase.hivConfirmDate = wrCase.confirmDate;
                patient.theCase.confirmLab = wrCase.confirmLab;
                patient.theCase.confirmLabName = null;
                patient.theCase.arvStartDate = wrCase.arvInitiationDate;
                patient.theCase.currentArvRegimenStartDate = wrCase.arvInitiationDate;
                patient.theCase.wrCaseId = wrCase.id;
            }

            return $q.when(patient);
        }

        function getMmdStatus(orgId, caseId) {
            if (!orgId || !caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/mmd-status';
            url += '/';
            url += (orgId ? orgId : '0');
            url += '/';
            url += (caseId ? caseId : '0');

            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function patientRecordExists(dto) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/patientrecord-exists';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function patientChartIdExists(dto) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/patientchartid-exists';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function hivInfoIdExists(dto) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/hivinfoid-exists';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function nationalIdExists(dto) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/nationalid-exists';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function checkEditable(coEntry, isSiteManager, history) {

            if (!coEntry || !coEntry.theCase || !coEntry.organization) {
                return;
            }

            // Check if the selected coEntry is editable
            let status = coEntry.status;
            let deleted = coEntry.theCase.deleted;

            coEntry.editable = coEntry.id ? coEntry.caseEditable : true;
            coEntry.statusEditable = isSiteManager && !deleted && (status !== 'TRANSFERRED_OUT' && status !== 'PENDING_ENROLLMENT' && status !== 'CANCELLED_ENROLLMENT');

            // if an account manages multiple OPC, and is openning a Case-org --> we need to check and see if the
            // most recent case-org of the patient is the same with the opened case-org in order to allow editing status
            if (history && history.length > 0) {
                coEntry.statusEditable = coEntry.statusEditable && (history[0].id === coEntry.id);
            }

            coEntry.enrollmentTypeEditable = !deleted;

            if (!coEntry.editable) {
                if (!isSiteManager) {
                    coEntry.noneditableReason = 'chỉ có thể được cập nhật bởi nhân viên phòng khám. Bạn không được gán quyền';
                } else if (deleted) {
                    coEntry.noneditableReason = 'đã bị đánh dấu xóa khỏi cơ sở dữ liệu';
                } else {
                    switch (status) {
                        case 'LTFU':
                            coEntry.noneditableReason = 'đã bỏ trị';
                            break;
                        case 'TRANSFERRED_OUT':
                            coEntry.noneditableReason = 'đã chuyển đi';
                            break;
                        case 'DEAD':
                            coEntry.noneditableReason = 'đã tử vong';
                            break;
                        case 'PENDING_ENROLLMENT':
                            coEntry.noneditableReason = 'chưa được tiếp nhận';
                            break;
                    }
                }
            }
        }

        function isSameAddress(person) {
            let c = {};
            angular.copy(person, c);

            let obj = {currentAddress: {}, residentAddress: {}};
            angular.forEach(c.locations, function (loc) {
                if (loc.addressType == 'CURRENT_ADDRESS') {
                    angular.copy(loc, obj.currentAddress);
                } else if (loc.addressType == 'RESIDENT_ADDRESS') {
                    angular.copy(loc, obj.residentAddress);
                }
            });

            // for adding new patient
            if (obj) {
                if (!obj.currentAddress && !obj.residentAddress) {
                    return true;
                } else {
                    if (!obj.currentAddress.province && !obj.residentAddress.province
                        && !obj.currentAddress.district && !obj.residentAddress.district
                        && !obj.currentAddress.commune && !obj.residentAddress.commune
                        && !obj.currentAddress.streetAddress && !obj.residentAddress.streetAddress) {
                        return true;
                    }
                }
            }

            if (!obj || !obj.currentAddress
                || !obj.residentAddress || !obj.currentAddress.province
                || !obj.currentAddress.district
                || !obj.residentAddress.province || !obj.residentAddress.district) {
                return false;
            }

            let bool = obj.currentAddress.province.id == obj.residentAddress.province.id
                && obj.currentAddress.district.id == obj.residentAddress.district.id
                && obj.currentAddress.streetAddress == obj.residentAddress.streetAddress;

            if (!obj.currentAddress.commune || !obj.currentAddress.commune.id) {
                obj.currentAddress.commune = {id: null};
            }

            if (!obj.residentAddress.commune || !obj.residentAddress.commune.id) {
                obj.residentAddress.commune = {id: null};
            }

            bool = bool && obj.currentAddress.commune.id == obj.residentAddress.commune.id;

            // To revert back to null
            if (obj.currentAddress.commune.id == null) {
                obj.currentAddress.commune = null;
            }

            if (obj.residentAddress.commune.id == null) {
                obj.residentAddress.commune = null;
            }

            return bool;
        }

        function getFullCaseStatusHistory(caseOrgId) {
            if (!caseOrgId) {
                return $q.when([]);
            }

            let url = baseUrl + 'case/status/' + caseOrgId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function updateHIVInfoID(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/hivinfoid';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function removeHIVInfoID(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/rem_hivinfoid';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function updatePatientStatus(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/status';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function cancelReferral(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/cancel_referral';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function updateReferralResult(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/referral_result';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function reEnrollPatient(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/re-enroll';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function downloadReferralSheet(coId) {
            let url = baseUrl + 'case/refsheet';
            url += '/' + coId;

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: null,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        /**
         * Export patient data to excel file for download
         * @param filter
         * @returns {*}
         */
        function export2Excel(filter) {
            let url = baseUrl + 'case/excel';

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filter,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        /**
         * Export search results to excel file for download
         * @param filter
         * @returns {*}
         */
        function exportSearchResults(filter) {
            let url = baseUrl + 'case/excel-4-search';

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filter,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        /**
         * Adhocc data for Ly
         * @returns {*}
         */
        function exportAdhocData() {
            let url = baseUrl + 'case/adhoc_data';

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: null,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function cropPhoto(cropper, personId) {
            let url = baseUrl + 'case/photo/crop/' + personId;

            return utils.resolveAlt(url, 'POST', null, cropper, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getPhoto(personId) {
            let url = baseUrl + 'case/photo/' + personId;

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: null,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function getBarcode(coId) {
            let url = baseUrl + 'case/barcode/' + coId;

            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: null,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function softDeletePatient(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/soft';
            return utils.resolveAlt(url, 'DELETE', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function restorePatient(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/restore';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deletePatients(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'case';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function savePatient(patient, successCallback, errorCallback) {
            let url = baseUrl + 'case';

            return utils.resolveAlt(url, 'POST', null, patient, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getPatients(filter) {
            let url = baseUrl + 'case/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getWrPatients(filter) {
            let url = baseUrl + 'wrcase/tx_cases';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getWrPatient(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'wrcase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function markAsLinked2OPCAssist(dto) {
            let url = baseUrl + 'wrcase/link2_opcassist';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getPatients4Appointment(filter) {
            let url = baseUrl + 'case/list-4-appointment';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getPatient(id, failureHandler) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/' + id;
            return utils.resolve(url, 'GET', angular.noop, failureHandler ? failureHandler : angular.noop);
        }

        function getCaseOrg(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/case-org/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function updateCaseOrg(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/case-org';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteCaseOrg(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/case-org';
            return utils.resolveAlt(url, 'DELETE', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(opts) {
            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: 'text-center',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _sortIcon1 = 'fa-sort';
            let _sortIcon2 = 'fa-sort';

            if (opts.sortField == 1) {
                _sortIcon1 = 'fa-sort-alpha-asc';
            } else if (opts.sortField == 2) {
                _sortIcon2 = 'fa-sort-alpha-asc';
            }

            return [
                {
                    field: 'state',
                    checkbox: true,
                }, {
                    field: '',
                    title: '<div class="text-center small">[ Thao tác ]</div>',
                    switchable: false,
                    visible: opts.siteManagerOnly,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        let s = '';

                        if (row.deleted) {
                            return '&mdash;';
                        }

                        s += '<div class="opc-toolbar">';
                        if (row.caseEditable && !row.theCase.deleted) {
                            s += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-primary no-padding-tb jumping no-border" href="#/opc/edit-patient/' + row.id + '" uib-tooltip="Sửa&nbsp;hồ&nbsp;sơ&nbsp;bệnh&nbsp;nhân" tooltip-placement="auto"><i class="icon-pencil"></i></a>';
                        } else {
                            s += '<button disabled="disabled" class="btn btn-primary no-padding-tb jumping no-border"><i class="icon-pencil"></i></button>';
                        }
                        s += '<div class="vertical-seperator shorter float-right"></div>';
                        if ((row.status == 'ACTIVE' || row.status == 'TRANSFERRED_OUT' || row.status == 'DEAD' || row.status == 'LTFU') && !row.theCase.deleted) {
                            let appId = 0;
                            if (row.theCase.appointments && row.theCase.appointments.length > 0) {
                                appId = row.theCase.appointments[0].id;
                            }

                            s += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-primary no-padding-tb jumping no-border" href="#/opc/appointment-cal/result/home/' + row.id + '/' + appId + '" uib-tooltip="Khám&nbsp;-&nbsp;cấp&nbsp;thuốc" tooltip-placement="auto"><i class="fa fa-get-pocket"></i></a>';
                        } else {
                            s += '<button disabled="disabled" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Khám - cấp thuốc"><i class="fa fa-get-pocket"></i></button>';
                        }

                        s += '</div>';

                        return s;
                    }
                }, {
                    field: 'organization.name',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 120px;">Cơ sở điều trị<a class="margin-right-10" ng-click="$parent.openAdvancedSearchDialog();" href="#"><i class="fa fa-filter"></i></a></div>',
                    switchable: false,
                    visible: opts.displaySiteName,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<a href="#" ng-click="$parent.filterByOrg(' + "'" + row.organization.id + "', " + "'" + value + "'" + ')" uib-tooltip="Lọc theo:&nbsp;' + row.organization.name + '" class="font-weight-500 text-muted"><i class="fa fa-caret-right icon-muted patient-status">&nbsp;</i>' + value + '</a>';
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 200px;">Bệnh nhân<a ng-click="$parent.sort(1);" title="Sắp xếp theo họ tên" href="#"><i class="fa ' + _sortIcon1 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    formatter: function (value, row, index, field) {
                        let ret = '<div>';
                        let deletedClass = '';

                        if (row.theCase.deleted) {
                            deletedClass = 'deleted-record';
                        }

                        let gs = 'fa fa-';
                        if (value.person.gender) {
                            let gender = value.person.gender;

                            gs += ((gender == 'MALE') ? 'mars' : ((gender == 'FEMALE') ? 'venus' : 'neuter'));
                        } else {
                            gs += 'neuter';
                        }

                        switch (row.status) {
                            case 'ACTIVE':
                                ret += '<a class="bold patient-status-normal ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nhấn để xem hồ sơ"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'normal') + ' margin-right-5"></i>';
                                break;
                            case 'LTFU':
                                ret += '<a class="bold patient-status-ltfu ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nhấn để xem hồ sơ"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'ltfu') + ' margin-right-5"></i>';
                                break;
                            case 'TRANSFERRED_OUT':
                                ret += '<a class="bold patient-status-trans-out ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nhấn để xem hồ sơ"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'trans-out') + ' margin-right-5"></i>';
                                break;
                            case 'DEAD':
                                ret += '<a class="bold patient-status-dead ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nhấn để xem hồ sơ"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'dead') + ' margin-right-5"></i>';
                                break;
                            case 'PENDING_ENROLLMENT':
                                ret += '<a class="bold patient-status-enrollment-pending ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nhấn để xem hồ sơ"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'enrollment-pending') + ' margin-right-5"></i>';
                                break;
                            default:
                                ret += '<a class="bold ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '"><i class="' + gs + ' patient-status normal margin-right-5"></i>';
                                break;

                        }

                        ret += (value.person.fullname + '</a>');

                        let status = '';
                        if (row.theCase.deleted) {
                            let d = row.theCase.modifyDate;
                            if (d) {
                                status = 'hồ sơ đã xóa vào <span class="font-weight-600">';
                                let md = moment().set({
                                    'date': d.dayOfMonth,
                                    'month': d.monthValue - 1,
                                    'year': d.year,
                                    'hour': d.hour,
                                    'minute': d.minute,
                                    'second': d.second
                                });
                                status += md.format('DD/MM/YYYY') + '</span>';
                            } else {
                                status = 'hồ sơ đã xóa';
                            }
                        } else {
                            switch (row.status) {
                                case 'ACTIVE':
                                    status = 'đang điều trị từ <span class="font-weight-600">' + moment(row.startDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'PENDING_ENROLLMENT':
                                    status = 'chờ tiếp nhận';
                                    break;
                                case 'CANCELLED_ENROLLMENT':
                                    status = 'hủy chuyển gửi';
                                    break;
                                case 'LTFU':
                                    status = 'đã bỏ trị từ <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'DEAD':
                                    status = 'đã tử vong từ <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'TRANSFERRED_OUT':
                                    status = 'đã chuyển đi từ <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                            }
                        }

                        ret += '<a href="#" ng-click="$parent.displayStatusHistory(' + "'" + row.id + "'" + ');" uib-tooltip="Xem&nbsp;chi&nbsp;tiết" class="p-status">' + status + '</a>'
                        ret += '</div>';
                        return ret;
                    },
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: 'patient-col',
                            css: {}
                        };
                    }
                }, {
                    field: 'theCase.person.dob',
                    title: '<div class="align-right">Ngày sinh</div>',
                    switchable: false,
                    visible: true,
                    formatter: function (value, row, index, field) {
                        return '<span class="font-weight-500">' + (value ? moment(value).format('DD/MM/YYYY') : '-/-/-') + '</span>';
                    },
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px', 'text-align': 'right'}
                        };
                    }
                }, {
                    field: 'patientChartId',
                    title: '<div class="header-with-sorter margin-left-5">Mã bệnh án<a ng-click="$parent.sort(2);" title="Sắp xếp theo mã bệnh nhân" href="#"><i class="fa ' + _sortIcon2 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    formatter: function (value, row, index, field) {
                        return '<div class="margin-left-5 font-weight-600">' + (value ? value : '&mdash;') + '</div>';
                    },
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '140px'}
                        };
                    }
                }, {
                    field: 'enrollmentType',
                    title: 'Loại đăng ký',
                    switchable: false,
                    visible: !opts.siteManagerOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';

                        switch (row.enrollmentType) {
                            case 'NEWLY_ENROLLED':
                                s += '<i class="fa fa-circle-o margin-left-10 icon-muted margin-right-5"></i>đăng ký mới';
                                break;
                            case 'RETURNED':
                                s += '<i class="fa fa-rotate-right margin-left-10 icon-muted margin-right-5"></i>điều trị lại';
                                break;
                            case 'TRANSFERRED_IN':
                                s += '<i class="fa fa-long-arrow-right margin-left-10 icon-muted margin-right-5"></i>chuyển tới';
                                break;
                            default:
                                s += '&mdash;';
                                break;
                        }

                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase.hivInfoId',
                    title: '<div class="margin-left-5">Mã HIV-Info</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<div class="margin-left-5 font-weight-500">' + (value ? value : '&mdash;') + '</div>';
                    }
                }, {
                    field: 'theCase.person.nidNumber',
                    title: '<div class="margin-left-5">Số CMTND</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        return '<div class="margin-left-5 font-weight-500">' + (value ? value : '&mdash;') + '</div>';
                    }
                }, {
                    field: 'theCase.hivConfirmDate',
                    title: '<div class="align-right">Ngày XNKĐ HIV</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px', 'text-align': 'right'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value) {
                            s += moment(value).format('DD/MM/YYYY');
                        } else {
                            s + '&mdash;';
                        }
                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase.arvStartDate',
                    title: '<div class="align-right">Ngày bắt đầu ARV</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px', 'text-align': 'right'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value) {
                            s += moment(value).format('DD/MM/YYYY');
                        } else {
                            s + '&mdash;';
                        }
                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase',
                    title: 'Phác đồ ARV hiện tại',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value.currentArvRegimenName) {
                            s += value.currentArvRegimenName;
                            if (value.currentArvRegimenLine) {
                                s += ' (bậc ' + value.currentArvRegimenLine + ')';
                            }
                        } else {
                            s += '&mdash;';
                        }
                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase.currentArvRegimenStartDate',
                    title: '<div class="align-right">Bắt đầu ph.đồ ARV gần nhất</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px', 'text-align': 'right'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value) {
                            s += moment(value).format('DD/MM/YYYY');
                        } else {
                            s += '&mdash; //';
                        }
                        s += '</span>';

                        return s;
                    }
                }/*, {
                    field: 'theCase.labTests',
                    title: 'Kết quả TLVR gần nhất',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.length > 0) {
                            let entry = null;

                            value.forEach(function (obj, indx) {
                                if (obj.testType === 'VIRAL_LOAD') {
                                    entry = {};
                                    angular.copy(obj, entry);
                                    return;
                                }
                            });

                            if (!entry) {
                                return '&mdash;';
                            }

                            let s = '<span class="font-weight-600">';
                            if (typeof entry.resultNumber != 'undefined' && entry.resultNumber != null) {
                                s += (entry.resultNumber == 0 ? 'Không phát hiện' : ($filter('number')(entry.resultNumber, 0) + ' <span class="small">(bản sao/ml)</span>'));
                            } else if (entry.resultText) {
                                s += entry.resultText;
                            } else {
                                s += 'Chưa có kết quả.';
                            }
                            s += '</span>';

                            return s;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase.labTests',
                    title: '<div class="align-right">Ngày lấy mẫu TLVR gần nhất</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px', 'text-align': 'right'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.length > 0) {
                            let sampleDate = null;

                            value.forEach(function (obj, indx) {
                                if (obj.testType === 'VIRAL_LOAD') {
                                    sampleDate = obj.sampleDate;
                                    return;
                                }
                            });

                            if (!sampleDate) {
                                return '&mdash;';
                            }

                            let s = '<span class="font-weight-500">';
                            s += moment(sampleDate).format('DD/MM/YYYY');
                            s += '</span>';

                            return s;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase.id',
                    title: '<i class="fa fa-flash margin-right-5"></i>Cấp thuốc nhiều tháng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.status == 'ACTIVE') {
                            let s = '';
                            let firstMmd = ((row.theCase.mmdEvals && row.theCase.mmdEvals.length > 0) ? row.theCase.mmdEvals[0] : null);

                            if (firstMmd) {
                                if (firstMmd.onMmd) {
                                    s += '<span ng-click="$parent.showMMDOverview(' + "'" + row.theCase.id + "'" + ')"><span class="font-weight-600 underline-alt">Đang nhận</span> thuốc nhiều tháng</span>';
                                    s += ' &mdash; <span class="small">Lần gần nhất:</span> ';
                                    s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                                } else {
                                    if (firstMmd.eligible) {
                                        s += '<span ng-click="$parent.showMMDOverview(' + "'" + row.theCase.id + "'" + ')">Đã được đánh giá <span class="font-weight-600 underline">ổn định</span></span>';
                                        if (firstMmd.evaluationDate) {
                                            s += ' &mdash; <span class="small">Ngày:</span> ';
                                            s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                                        }
                                    } else {
                                        s += 'Bệnh nhân chưa ổn định.';
                                    }
                                }
                            } else {
                                s += '<span class="text-muted">Chưa đánh giá.</span>';
                            }

                            return s;
                        } else {
                            return '<span class="text-muted">Không còn điều trị.</span>';
                        }

                        return '&mdash;';
                    }
                }*/, {
                    field: 'arvGroup',
                    title: 'Nhóm Đ/trị ARV',
                    switchable: false,
                    visible: true,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value) {
                            s += value;
                        } else {
                            s += '&mdash;';
                        }
                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase.person.locations',
                    title: 'Địa chỉ hiện tại',
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        // Current address
                        let curAddress = {};
                        angular.forEach(value, function (loc) {
                            if (loc.addressType == 'CURRENT_ADDRESS') {
                                angular.copy(loc, curAddress);
                            }
                        });

                        let address = '';
                        if (curAddress && curAddress.id) {
                            if (curAddress.province) {
                                address += curAddress.province.name;
                                address += ', ';
                            }

                            if (curAddress.district) {
                                address += curAddress.district.name;
                                address += ', ';
                            }

                            if (curAddress.commune) {
                                address += curAddress.commune.name;
                                address += ', ';
                            }

                            if (curAddress.streetAddress) {
                                address += curAddress.streetAddress;
                            }

                            address = address.trim();
                            address = address.endsWith(',') ? address.substr(0, address.length - 1) : address;
                        }

                        let addressString = '<span class="font-weight-500">';
                        addressString += (address.length > 0 ? address : '&mdash;');
                        addressString += '</span>';

                        return addressString;
                    }
                }, {
                    field: 'theCase.person.locations',
                    title: 'Địa chỉ theo hộ khẩu',
                    visible: true,
                    cellStyle: function (value, row, index, field) {

                        let resAddress = {};
                        let curAddress = {};
                        angular.forEach(row.theCase.person.locations, function (loc) {
                            if (loc.addressType == 'RESIDENT_ADDRESS') {
                                angular.copy(loc, resAddress);
                            }

                            if (loc.addressType == 'CURRENT_ADDRESS') {
                                angular.copy(loc, curAddress);
                            }
                        });

                        let diffProvince = 'bg-color-orange';

                        if (resAddress && resAddress.id && resAddress.province && curAddress && curAddress.id && curAddress.province) {
                            if (curAddress.province.id && resAddress.province.id && curAddress.province.id === resAddress.province.id) {
                                diffProvince = '';
                            }
                        }

                        return {
                            classes: diffProvince,
                            css: {'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {
                        // Resident address
                        let resAddress = {};
                        angular.forEach(value, function (loc) {
                            if (loc.addressType == 'RESIDENT_ADDRESS') {
                                angular.copy(loc, resAddress);
                            }
                        });

                        let address = '';
                        if (resAddress && resAddress.id) {
                            if (resAddress.province) {
                                address += resAddress.province.name;
                                address += ', ';
                            }

                            if (resAddress.district) {
                                address += resAddress.district.name;
                                address += ', ';
                            }

                            if (resAddress.commune) {
                                address += resAddress.commune.name;
                                address += ', ';
                            }

                            if (resAddress.streetAddress) {
                                address += resAddress.streetAddress;
                            }

                            address = address.trim();
                            address = address.endsWith(',') ? address.substr(0, address.length - 1) : address;
                        }

                        let addressString = '<span class="font-weight-500">';
                        addressString += (address.length > 0 ? address : '&mdash;');
                        addressString += '</span>';

                        return addressString;
                    }
                }
            ]
        }

        function getTableDefinition4Risks() {

            let _tableOperation = function (value, row, index) {
                return '<a class="green-dark margin-right-20" href="#/opc/view-patient/' + row.id + '"><i class="icon-frame margin-right-5"></i>Chi tiết</a>';
            };

            let _tableOperationCellStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }
                , {
                    field: 'person.gender',
                    title: 'Giới tính',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'person.dob',
                    title: 'Ngày sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'hivConfirmDate',
                    title: 'Ngày khẳng định HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'arvStartDate',
                    title: 'Ngày bắt đầu ARV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
            ]
        }

        function getTableDefinition4WrCaseSearch() {
            let _tableOperation = function (value, row, index) {
                return '<a class="btn btn-sm btn-primary no-border jumping" href="#" ng-click="$parent.createPatientFromWR(' + "'" + row.id + "'" + ');"><i class="fa fa-play margin-right-5"></i>Tạo hồ sơ</a>';
            };

            let _tableOperationCellStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter2 = function (value, row, index) {
                if (!value) {
                    return '';
                }

                return moment(value).format('DD/MM/YYYY');
            };

            return [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }
                , {
                    field: 'fullname',
                    title: 'Họ tên',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'gender',
                    title: 'Giới tính',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '&mdash;';

                        switch (value) {
                            case 'MALE':
                                s = 'Nam';
                                break;
                            case 'FEMALE':
                                s = 'Nữ';
                                break;
                            case 'OTHER':
                                s = 'Khác';
                                break;
                            case 'NOT_DISCLOSED':
                                s = 'Không tiết lộ';
                                break;
                            case 'TRANSGENDER':
                                s = 'Chuyển giới';
                                break;
                        }

                        return s;
                    }
                }
                , {
                    field: 'dob',
                    title: 'Ngày sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'confirmDate',
                    title: 'Ngày khẳng định HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter2
                }
                , {
                    field: 'patientChartId',
                    title: 'Mã bệnh nhân',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
            ]
        }

        function getTableDefinition4StatusHistory(isProvincialManager, orgsWritable, orgsReadable, fullStatusHistory) {

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: 'updateable',
                    title: '',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value) {
                            return '<i class="fa fa-spinner fa-spin icon-muted margin-right-5"></i>';
                        } else {
                            switch (row.status) {
                                case 'ACTIVE':
                                    return '<i class="fa fa-check text-green"></i>';
                                case 'LTFU':
                                    return '<i class="fa fa-chain-broken text-danger"></i>';
                                case 'DEAD':
                                    return '<i class="fa fa-circle text-muted"></i>';
                                case 'PENDING_ENROLLMENT':
                                    return '<i class="fa fa-spinner fa-spin icon-muted margin-right-5"></i>';
                                case 'CANCELLED_ENROLLMENT':
                                    return '<i class="fa fa-close"></i>';
                                case 'TRANSFERRED_OUT':
                                    return '<i class="fa fa-long-arrow-left text-purple"></i>';
                                default:
                                    return '&mdash;';

                            }
                        }
                    }
                }
                , {
                    field: 'editable',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';
                        if (row.theCase.deleted) {
                            s = '<button class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="icon-pencil icon-muted margin-right-5"></i>cập nhật</button>';
                            s += '<button class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="fa fa-download icon-muted margin-right-5"></i>phiếu chuyển tiếp</button>';
                            s += '<button class="btn btn-danger btn-sm jumping" disabled="disabled"><i class="icon-trash icon-muted margin-right-5"></i>xóa</button>';

                            return s;
                        } else if (isProvincialManager) {

                            let editable = false;
                            angular.forEach(orgsReadable, function (obj) {
                                if (obj.id == row.organization.id || row.organization.code == 'organization_other_specified') {
                                    editable = true;
                                    return;
                                }
                            });

                            if (editable) {
                                s += '<a href="#" uib-tooltip="Sửa thông tin" class="btn btn-sm btn-primary no-border jumping" ng-click="$parent.provincialEditCaseOrg(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>cập nhật</a>';
                                if (row.id != fullStatusHistory[0].id) {
                                    s += '<a href="#" uib-tooltip="Xóa thông tin" class="btn btn-danger btn-sm no-border jumping" ng-click="$parent.removeCaseOrg(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>xóa</a>';
                                } else {
                                    s += '<button class="btn btn-danger btn-sm jumping" disabled="disabled"><i class="icon-trash icon-muted margin-right-5"></i>xóa</button>';
                                }
                            } else {
                                s += '<button class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="icon-pencil icon-muted margin-right-5"></i>cập nhật</button>';
                                s += '<button class="btn btn-danger btn-sm jumping" disabled="disabled"><i class="icon-trash icon-muted margin-right-5"></i>xóa</button>';
                            }
                        } else {
                            if (value) {
                                s += '<a href="#" uib-tooltip="Sửa thông tin" class="btn btn-sm btn-primary no-border jumping" ng-click="$parent.editCaseOrg(' + "'" + row.id + "'" + ')"><i class="icon-pencil icon-muted margin-right-5"></i>cập nhật</a>';
                            } else {
                                s += '<button class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="icon-pencil icon-muted margin-right-5"></i>cập nhật</button>';
                            }

                            if (value && row.status == 'TRANSFERRED_OUT' && !row.theCase.deleted) {
                                s += '<a href="#" uib-tooltip="In phiếu chuyển tiếp dịch vụ" class="btn btn-sm btn-primary no-border jumping" ng-click="$parent.printReferralSheet(' + "'" + row.id + "'" + ')"><i class="fa fa-download icon-muted margin-right-5"></i>phiếu chuyển tiếp</a>';
                            } else {
                                s += '<button class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="fa fa-download icon-muted margin-right-5"></i>phiếu chuyển tiếp</button>';
                            }

                            if (row.deletable) {
                                s += '<a href="#" uib-tooltip="Xóa thông tin" class="btn btn-danger btn-sm no-border jumping" ng-click="$parent.removeCaseOrg(' + "'" + row.id + "'" + ')"><i class="icon-trash icon-muted margin-right-5"></i>xóa</a>';
                            } else {
                                s += '<button class="btn btn-danger btn-sm jumping" disabled="disabled"><i class="icon-trash icon-muted margin-right-5"></i>xóa</button>';
                            }
                        }

                        return s;
                    }
                }
                , {
                    field: 'organization',
                    title: 'Tên cơ sở điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value || !value.id) {
                            return '&mdash;';
                        }

                        let str = '<span class="font-weight-600">';

                        if (value.code == 'organization_other_specified') {
                            str += row.organizationName;
                        } else {
                            str += value.name;
                        }

                        str += '</span>';

                        return str;
                    }
                }
                , {
                    field: 'patientChartId',
                    title: 'Mã bệnh án',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }
                , {
                    field: 'enrollmentType',
                    title: 'Loại đăng ký',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '&mdash;';

                        switch (value) {
                            case 'NEWLY_ENROLLED':
                                s = 'Đăng ký mới';
                                break;
                            case 'TRANSFERRED_IN':
                                s = 'Chuyển tới';
                                break;
                            case 'RETURNED':
                                s = 'Điều trị lại';
                                break;
                        }

                        return s;
                    }
                }
                , {
                    field: 'startDate',
                    title: 'Ngày bắt đầu đợt đ/trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.status === 'PENDING_ENROLLMENT' || row.status === 'CANCELLED_ENROLLMENT') {
                            return '&mdash;';
                        } else {
                            if (!value) {
                                return '&mdash;';
                            }

                            let s = '';
                            s += moment(value).format('DD/MM/YYYY');
                            // s += row.editable ? '<a href="#" uib-tooltip="Sửa ngày bắt đầu"><i class="icon-pencil margin-left-5"></i></a>' : '';

                            return s;
                        }
                    }
                }
                , {
                    field: 'endDate',
                    title: 'Ngày kết thúc đợt đ/trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '';
                        s += moment(value).format('DD/MM/YYYY');
                        // s += row.editable ? '<a href="#" uib-tooltip="Sửa ngày kết thúc" ng-click="$parent.editCaseOrgDate(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-left-5"></i></a>' : '';

                        return s;
                    }
                }
                , {
                    field: 'status',
                    title: 'Trạng thái điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let ret = '&mdash;';

                        switch (value) {
                            case 'ACTIVE':
                                ret = 'Đang được quản lý';
                                break;
                            case 'LTFU':
                                ret = 'Đã bỏ trị';
                                break;
                            case 'DEAD':
                                ret = 'Đã tử vong';
                                break;
                            case 'TRANSFERRED_OUT':
                                ret = 'Đã chuyển đi';
                                break;
                            case 'PENDING_ENROLLMENT':
                                ret = 'Chờ tiếp nhận';
                                break;
                        }

                        return ret;
                    }
                }
                , {
                    field: 'endingReason',
                    title: 'Ghi chú',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index) {
                        return {
                            classes: '',
                            css: {'min-width': '250px'}
                        };
                    }
                }
            ]
        }

        function getTableDefinition4StatusHistoryAlt() {

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: 'organization',
                    title: 'Tên cơ sở điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value || !value.id) {
                            return '&mdash;';
                        }

                        let str = '<span class="font-weight-600">';

                        if (value.code == 'organization_other_specified') {
                            str += row.organizationName;
                        } else {
                            str += value.name;
                        }

                        str += '</span>';

                        return str;
                    }
                }
                , {
                    field: 'patientChartId',
                    title: 'Mã bệnh án',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value;
                    }
                }
                , {
                    field: 'startDate',
                    title: 'Ngày bắt đầu',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.status === 'PENDING_ENROLLMENT' || row.status === 'CANCELLED_ENROLLMENT') {
                            return '&mdash;';
                        } else {
                            if (!value) {
                                return '&mdash;';
                            }

                            let s = '';
                            s += moment(value).format('DD/MM/YYYY');
                            // s += row.editable ? '<a href="#" uib-tooltip="Sửa ngày bắt đầu"><i class="icon-pencil margin-left-5"></i></a>' : '';

                            return s;
                        }
                    }
                }
                , {
                    field: 'endDate',
                    title: 'Ngày kết thúc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '';
                        s += moment(value).format('DD/MM/YYYY');
                        // s += row.editable ? '<a href="#" uib-tooltip="Sửa ngày kết thúc" ng-click="$parent.editCaseOrgDate(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-left-5"></i></a>' : '';

                        return s;
                    }
                }
                , {
                    field: 'enrollmentType',
                    title: 'Loại đăng ký',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '&mdash;';

                        switch (value) {
                            case 'NEWLY_ENROLLED':
                                s = 'Đăng ký mới';
                                break;
                            case 'TRANSFERRED_IN':
                                s = 'Chuyển tới';
                                break;
                            case 'RETURNED':
                                s = 'Điều trị lại';
                                break;
                        }

                        return s;
                    }
                }
                , {
                    field: 'status',
                    title: 'Trạng thái điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let ret = '&mdash;';

                        switch (value) {
                            case 'ACTIVE':
                                ret = 'Đang được quản lý';
                                break;
                            case 'LTFU':
                                ret = 'Đã bỏ trị';
                                break;
                            case 'DEAD':
                                ret = 'Đã tử vong';
                                break;
                            case 'TRANSFERRED_OUT':
                                ret = 'Đã chuyển đi';
                                break;
                            case 'PENDING_ENROLLMENT':
                                ret = 'Chờ tiếp nhận';
                                break;
                        }

                        return ret;
                    }
                }
                , {
                    field: 'endingReason',
                    title: 'Ghi chú',
                    switchable: false,
                    visible: true
                }
            ]
        }
    }

})();