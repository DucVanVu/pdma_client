/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('AppointmentService', AppointmentService);

    AppointmentService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities',
        '$filter'
    ];

    function AppointmentService($http, $q, settings, utils, $filter) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.SELECTED_DATE = '_appmt_selected_date';
        self.LATE_DAYS = '_appmt_late_days';

        self.getEntry = getEntry;
        self.getCalendarEvents = getCalendarEvents;
        self.getEntries = getEntries;
        self.getLateEntries = getLateEntries;
        self.getEntries4Individual = getEntries4Individual;
        self.getAllEntries4Individual = getAllEntries4Individual;
        self.entriesModified = entriesModified;
        self.saveEntry = saveEntry;
        self.saveEntries = saveEntries;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition4Search = getTableDefinition4Search;
        self.getTableDefinition4QuickView = getTableDefinition4QuickView;
        self.getTableDefinition = getTableDefinition;
        self.getTableDefinition4Individual = getTableDefinition4Individual;
        self.getTableDefinition4Late = getTableDefinition4Late;
        self.exportPatientsLate2Appointment = exportPatientsLate2Appointment;
        self.getArrivalDateNotation = getArrivalDateNotation;
        self.exportDailyAppointments = exportDailyAppointments;
        self.exportLateAppointments = exportLateAppointments;
        self.getTableDefinition4NA = getTableDefinition4NA;
        self.getAllPatientHasNoAppointment = getAllPatientHasNoAppointment;
        self.getTableDefinitionNA = getTableDefinitionNA;
        self.exportNAAppointments = exportNAAppointments;

        function exportNAAppointments(filter) {
            let url = baseUrl + 'appointment/excel-patient-has-no-appointment';

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


        function getAllPatientHasNoAppointment(filter) {
            let url = baseUrl + 'appointment/patient-has-no-appointment';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getArrivalDateNotation(appointmentDate, arrivalDate) {

            let s = '';
            if (!arrivalDate) {
                s = 'Vui l??ng cho bi???t ng??y b???nh nh??n t???i kh??m.';
            } else {
                let mArrivalDate = moment(arrivalDate).set({hour: 7, minute: 0, second: 0});
                let mApptDate = moment(appointmentDate).set({hour: 7, minute: 0, second: 0});
                let diff = mArrivalDate.diff(mApptDate);

                if (diff > 0) {
                    let accuDiff = Math.ceil(Math.abs(mArrivalDate.diff(mApptDate)/(24*60*60*1000)));
                    s = 'Mu???n ' + accuDiff + ' ng??y so v???i ng??y h???n';
                } else if (diff < 0) {
                    let accuDiff = Math.ceil(Math.abs(mArrivalDate.diff(mApptDate)/(24*60*60*1000)));
                    s = 'S???m ' + accuDiff + ' ng??y so v???i ng??y h???n';
                } else {
                    s = 'B???nh nh??n ?????n ????ng h???n';
                }
            }

            return s;
        }

        function exportPatientsLate2Appointment(filter) {
            let url = baseUrl + 'appointment/excel-4-late';

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

        function exportDailyAppointments(filter) {
            let url = baseUrl + 'appointment/excel-daily-appointments';

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

        function exportLateAppointments(filter) {
            let url = baseUrl + 'appointment/excel-late-appointments';

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

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'appointment/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getCalendarEvents(filter) {
            let url = baseUrl + 'appointment/cal-events';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getLateEntries(filter) {
            let url = baseUrl + 'appointment/late';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            console.log(filter);
            let url = baseUrl + 'appointment/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries4Individual(filter) {
            let url = baseUrl + 'appointment/individual-list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAllEntries4Individual(caseId) {
            let url = baseUrl + 'appointment/individual-list-all';

            url += '/';
            url += caseId;

            return utils.resolveAlt(url, 'POST', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function entriesModified(newVals, oldVals) {
            if ((!newVals && !oldVals) || (newVals.length <= 0 && oldVals.length <= 0)) {
                return false;
            }

            if (newVals.length != oldVals.length) {
                return true;
            }

            let len = newVals.length;
            let result = false;

            for (let i = 0; i < len; i++) {

                if (utils.boolDifferent(newVals[i].arrived, oldVals[i].arrived)
                    || utils.boolDifferent(newVals[i].sArrivalDate, oldVals.sArrivalDate)
                    || utils.boolDifferent(newVals[i].vlTested, oldVals[i].vlTested)
                    || utils.boolDifferent(newVals[i].cd4Tested, oldVals[i].cd4Tested)
                    || utils.boolDifferent(newVals[i].arvDrTested, oldVals[i].arvDrTested)
                    || newVals[i].sNextAppointmentDate != oldVals[i].sNextAppointmentDate) {

                    result = true;
                    break;
                }
            }

            return result;
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'appointment';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function saveEntries(entries, successCallback, errorCallback) {
            let url = baseUrl + 'appointment/multiple';

            return utils.resolveAlt(url, 'POST', null, entries, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(entries, successCallback, errorCallback) {
            if (!entries || entries.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'appointment';
            return utils.resolveAlt(url, 'DELETE', null, entries, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition4Search(selectedRecords) {
            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: function (value, row, index) {

                        let found = false;
                        if (selectedRecords && selectedRecords.length > 0) {
                            let length = selectedRecords.length;
                            let index = -1;

                            for (let i = 0; i < length; i++) {
                                if (row.id == selectedRecords[i].theCase.id) {
                                    index = i;
                                    break;
                                }
                            }

                            found = index >= 0;
                        }

                        if (found) {
                            return '&mdash;';
                        } else {
                            return '<button class="btn btn-sm btn-primary" ng-click="$parent.addPatient2AppointmentList(' + "'" + row.id + "'" + ')">H???n kh??m</button>';
                        }
                    }
                }, {
                    field: 'patientChartId',
                    title: 'M?? b???nh nh??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'fullname',
                    title: 'H??? t??n b???nh nh??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'gender',
                    title: 'Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'dob',
                    title: 'Ng??y sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
            ]
        }

        function getTableDefinition4Individual() {

            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'text-align': 'center'}
                };
            };

            return [
                {
                    field: 'state',
                    checkbox: true
                }, {
                    field: 'appointmentDate',
                    title: '<div class="text-center" uib-tooltip="Ng??y h???n kh??m" tooltip-placement="auto">Ng??y h???n</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? moment(value).format('DD/MM/YYYY') : '&mdash;';
                    }
                }, {
                    field: 'arrived',
                    title: '<div class="text-center" uib-tooltip="???? t???i kh??m?" tooltip-placement="auto">???? t???i?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="???? t???i kh??m" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Ch??a t???i kh??m" tooltip-placement="auto"></i>';
                    }
                }, {
                    field: 'arrivalDate',
                    title: '<div class="text-center" uib-tooltip="Ng??y b???nh nh??n t???i kh??m" tooltip-placement="auto">Ng??y t???i kh??m</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (row.arrivalDate) {
                            return moment(value).format('DD/MM/YYYY');
                        } else {
                            let today = moment().utcOffset(0);
                            today.set({hour: 0, minute: 0, second: 0, millisecond: 0});

                            if (today.isAfter(row.appointmentDate)) {
                                return 'Mu???n ' + today.diff(row.appointmentDate, 'days') + ' ng??y';
                            } else {
                                return '&mdash;';
                            }
                        }
                    }
                }, {
                    field: 'vlTested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN TLVR?" tooltip-placement="auto">XN TLVR?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN TLVR" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN TLVR" tooltip-placement="auto"></i>';
                    }
                }, {
                    field: 'cd4Tested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN CD4?" tooltip-placement="auto">XN CD4?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN CD4" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN CD4" tooltip-placement="auto"></i>';
                    }
                }, {
                    field: 'arvDrTested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN kh??ng thu???c?" tooltip-placement="auto">XN Kh??ng thu???c?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN kh??ng thu???c" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN kh??ng thu???c" tooltip-placement="auto"></i>';
                    }
                }
            ]
        }

        function getTableDefinition4QuickView(selectedDate) {

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: 'text-center'
                };
            };

            return [
                {
                    field: 'theCase',
                    title: 'M?? b???nh ??n',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.caseOrgs && value.caseOrgs.length > 0 && value.caseOrgs[0].patientChartId) {
                            return '<span class="bold ' + (row.late ? 'text-danger' : '') + '">' + value.caseOrgs[0].patientChartId + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase',
                    title: 'H??? t??n b???nh nh??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.person && value.person.fullname) {
                            let s = '<a target="_blank" uib-tooltip="Xem h??? s?? b???nh ??n" href="#/opc/view-patient/' + value.id + '">';
                            if (value.person.gender) {
                                let gender = value.person.gender;
                                s += '<i class="margin-right-5 fa fa-';
                                s += ((gender == 'MALE') ? 'mars' : ((gender == 'FEMALE') ? 'venus' : 'neuter'));
                                s += row.late ? ' text-danger' : '';
                                s += '"></i>'
                            }

                            s += '<span class="bold ' + (row.late ? 'text-danger' : '') + '">' + value.person.fullname + '</span></a>';

                            return s;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'arrived',
                    title: '<div class="text-center" uib-tooltip="???? t???i kh??m?" tooltip-placement="auto">???? t???i?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (!row.late) {
                            return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="???? t???i kh??m" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Ch??a t???i kh??m" tooltip-placement="auto"></i>';
                        } else {
                            let lateDays = Math.abs(moment(row.appointmentDate).diff(selectedDate, 'days'));
                            return '<span class="' + (row.late ? 'text-danger' : '') + '">mu???n <span class="underline">' + lateDays + ' ng??y</span></span>'
                        }
                    }
                }, {
                    field: 'arrivalDate',
                    title: '<div class="text-center" uib-tooltip="Ng??y b???nh nh??n t???i kh??m" tooltip-placement="auto">Ng??y kh??m</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return row.arrivalDate ? moment(value).format('DD/MM/YYYY') : '&mdash;';
                    }
                }, {
                    field: 'vlTested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN TLVR?" tooltip-placement="auto">TLVR?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN TLVR" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN TLVR" tooltip-placement="auto"></i>';
                    }
                }, {
                    field: 'cd4Tested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN CD4?" tooltip-placement="auto">CD4?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN CD4" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN CD4" tooltip-placement="auto"></i>';
                    }
                }, {
                    field: 'arvDrTested',
                    title: '<div class="text-center" uib-tooltip="BN c?? ???????c l??m XN kh??ng thu???c?" tooltip-placement="auto">Kh??ng thu???c?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="C?? l??m XN kh??ng thu???c" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Kh??ng l??m XN kh??ng thu???c" tooltip-placement="auto"></i>';
                    }
                }
            ]
        }

        function getTableDefinition4Late(opts) {
            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: 'text-center',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _sortIcon1 = 'fa-sort';
            let _sortIcon2 = 'fa-sort';
            let _sortIcon3 = 'fa-sort';

            if (opts && opts.sortField == 1) {
                _sortIcon1 = 'fa-sort-alpha-asc';
            } else if (opts && opts.sortField == 2) {
                _sortIcon2 = 'fa-sort-alpha-asc';
            } else if (opts && opts.sortField == 3) {
                _sortIcon3 = 'fa-sort-alpha-desc';
            }

            return [
                {
                    field: 'state',
                    checkbox: true,
                }, {
                    field: '',
                    title: '<div class="small text-center">[ Thao t??c ]</div>',
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        let s = '';
                        if (!row.arrived) {
                            s += '<button class="btn btn-sm btn-danger no-border" ng-click="$parent.removeAppointment(' + "'" + row.id + "'" + ',' + "'" + row.theCase.person.fullname + "'" + ',' + "'" + moment(row.appointmentDate).format('DD/MM/YYYY') + "'" + ');" uib-tooltip="X??a kh???i l???ch" tooltip-placement="auto"><i class="icon-trash"></i></button>';
                        } else {
                            s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="icon-trash"></i></button>';
                        }

                        // s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-history/' + row.theCase.id + '" uib-tooltip="L???ch s??? kh??m" tooltip-placement="auto"><i class="fa fa-history"></i></a>';
                        s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-cal/result/late/' + row.theCase.caseOrgs[0].id + '/' + row.id + '" uib-tooltip="Nh???p k???t qu??? kh??m" tooltip-placement="auto"><i class="fa fa-get-pocket"></i></a>';

                        let lateDays = Math.abs(moment(row.appointmentDate).diff(moment(), 'days'));
                        if (lateDays >= 84) {
                            s += '<button class="btn btn-sm btn-warning no-border" ng-click="$parent.markAsLTFU(' + "'" + row.theCase.caseOrgs[0].id + "'" + ',' + "'" + row.theCase.person.fullname + "'" + ');" uib-tooltip="C???p nh???t th??nh b??? tr???" tooltip-placement="auto"><i class="fa fa-random"></i></button>';
                        } else {
                            s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="fa fa-random"></i></button>';
                        }

                        return s;
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 120px;">M?? b???nh ??n<a ng-click="$parent.sort(2);" title="S???p x???p theo m?? b???nh nh??n" href="#"><i class="fa ' + _sortIcon2 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.caseOrgs && value.caseOrgs.length > 0 && value.caseOrgs[0].patientChartId) {
                            return '<span class="bold">' + value.caseOrgs[0].patientChartId + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 200px;">T??n b???nh nh??n<a ng-click="$parent.sort(1);" title="S???p x???p theo h??? t??n" href="#"><i class="fa ' + _sortIcon1 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '200px', 'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '';

                        if (value.person && value.person.fullname) {
                            s += '<a href="#/opc/view-patient/' + value.caseOrgs[0].id + '" class="bold" target="_blank">';
                            s += value.person.fullname;
                            s += '</a>';
                        } else {
                            s += '&mdash;';
                        }

                        return s;
                    }
                }, {
                    field: 'theCase.person.gender',
                    title: '<div uib-tooltip="Gi???i t??nh" tooltip-placement="auto">Gi???i t??nh</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (!value) {
                            s += 'Kh??ng c?? th??ng tin';
                        }

                        switch (value) {
                            case 'MALE':
                                s += 'Nam';
                                break;
                            case 'FEMALE':
                                s += 'N???';
                                break;
                            default:
                                s += 'Kh??ng x??c ?????nh';
                                break;
                        }

                        return s + '</span>';
                    }
                }, {
                    field: 'theCase.person.dob',
                    title: '<div uib-tooltip="Ng??y sinh" tooltip-placement="auto">Ng??y sinh</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + moment(value).format('DD/MM/YYYY') + '</span>';
                    }
                }, {
                    field: 'appointmentDate',
                    title: '<div uib-tooltip="Ng??y h???n kh??m" tooltip-placement="auto">Ng??y h???n kh??m</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<span class="font-weight-600">' + moment(value).format('DD/MM/YYYY') + '</span>';
                    }
                }, {
                    field: 'arrived',
                    title: '<div uib-tooltip="S??? ng??y mu???n kh??m" tooltip-placement="auto" class="header-with-sorter margin-left-5" style="min-width: 140px;">S??? ng??y mu???n<a ng-click="$parent.sort(3);" title="S???p x???p theo s??? ng??y mu???n" href="#"><i class="fa ' + _sortIcon3 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '140px', 'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (!row.appointmentDate || value) {
                            return '&mdash;';
                        }

                        let lateDays = Math.abs(moment(row.appointmentDate).diff(moment(), 'days'));
                        let css = '';
                        if (lateDays >= 84) {
                            css = 'badge-danger bold';
                        } else if (lateDays >= 28) {
                            css = 'badge-warning bold';
                        }

                        return '<span class="badge ' + css + '" style="padding-left: 20px; padding-right: 20px; min-width: 100px">' + lateDays + ' ng??y</span>'
                    }
                }, {
                    field: 'latestArrivalDate',
                    title: '<div uib-tooltip="L???n kh??m cu???i" tooltip-placement="auto">L???n kh??m cu???i</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + moment(value).format('DD/MM/YYYY') + '</span>';
                    }
                }, {
                    field: 'latestVlTest',
                    title: '<div uib-tooltip="Ng??y x??t nghi???m TLVR g???n nh???t" tooltip-placement="auto">Ng??y XN TLVR g???n nh???t</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return (value && value.sampleDate) ? ('<span class="font-weight-600">' + moment(value.sampleDate).format('DD/MM/YYYY') + '</span>') : '&mdash;';
                    }
                }, {
                    field: 'latestVlTest',
                    title: '<div uib-tooltip="K???t qu??? TLVR g???n nh???t" tooltip-placement="auto">TLVR g???n nh???t</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';

                        if (value && typeof(value.resultNumber) != 'undefined') {
                            if (value.resultNumber == 0) {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-green small">Kh??ng ph??t hi???n</span>';
                            } else if (value.resultNumber < 200) {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-green">';
                                s += $filter('number')(value.resultNumber, 0);
                                s += ' (b???n sao/ml)</span>'
                            } else {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-danger">';
                                s += $filter('number')(value.resultNumber, 0);
                                s += ' (b???n sao/ml)</span>';
                            }
                        } else {
                            s += '&mdash;';
                        }

                        s += '</span>';

                        return s;
                    }
                }
            ]
        }

        function getTableDefinition4NA(opts) {
            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: 'text-center',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _sortIcon1 = 'fa-sort';
            let _sortIcon2 = 'fa-sort';
            let _sortIcon3 = 'fa-sort';

            if (opts && opts.sortField == 1) {
                _sortIcon1 = 'fa-sort-alpha-asc';
            } else if (opts && opts.sortField == 2) {
                _sortIcon2 = 'fa-sort-alpha-asc';
            } else if (opts && opts.sortField == 3) {
                _sortIcon3 = 'fa-sort-alpha-desc';
            }

            return [
                {
                    field: 'state',
                    checkbox: true,
                }, {
                    field: '',
                    title: '<div class="small text-center">[ Thao t??c ]</div>',
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        let s = '';
                        if (!row.arrived) {
                            s += '<button class="btn btn-sm btn-danger no-border" ng-click="$parent.removeAppointment(' + "'" + row.id + "'" + ',' + "'" + row.theCase.person.fullname + "'" + ',' + "'" + moment(row.appointmentDate).format('DD/MM/YYYY') + "'" + ');" uib-tooltip="X??a kh???i l???ch" tooltip-placement="auto"><i class="icon-trash"></i></button>';
                        } else {
                            s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="icon-trash"></i></button>';
                        }

                        // s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-history/' + row.theCase.id + '" uib-tooltip="L???ch s??? kh??m" tooltip-placement="auto"><i class="fa fa-history"></i></a>';
                        // s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-cal/result/late/' + row.theCase.caseOrgs[0].id + '/' + row.id + '" uib-tooltip="Nh???p k???t qu??? kh??m" tooltip-placement="auto"><i class="fa fa-get-pocket"></i></a>';

                        // let lateDays = Math.abs(moment(row.appointmentDate).diff(moment(), 'days'));
                        // if (lateDays >= 84) {
                        //     s += '<button class="btn btn-sm btn-warning no-border" ng-click="$parent.markAsLTFU(' + "'" + row.theCase.caseOrgs[0].id + "'" + ',' + "'" + row.theCase.person.fullname + "'" + ');" uib-tooltip="C???p nh???t th??nh b??? tr???" tooltip-placement="auto"><i class="fa fa-random"></i></button>';
                        // } else {
                        //     s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="fa fa-random"></i></button>';
                        // }

                        return s;
                    }
                }, {
                    field: 'organization',
                    title: 'C?? s??? ??i???u tr???',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.name) {
                            return '<span class="bold">' + value.name + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 120px;">M?? b???nh ??n<a ng-click="$parent.sort(2);" title="S???p x???p theo m?? b???nh nh??n" href="#"><i class="fa ' + _sortIcon2 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.caseOrgs && value.caseOrgs.length > 0 && value.caseOrgs[0].patientChartId) {
                            return '&mdash;';
                            //return '<span class="bold">' + value.caseOrgs[0].patientChartId + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 200px;">T??n b???nh nh??n<a ng-click="$parent.sort(1);" title="S???p x???p theo h??? t??n" href="#"><i class="fa ' + _sortIcon1 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '200px', 'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '';

                        if (value.person && value.person.fullname) {
                            //s += '<a href="#/opc/view-patient/' + value.caseOrgs[0].id + '" class="bold" target="_blank">';
                            s += '<a href="#" class="bold" target="_blank">';
                            s += value.person.fullname;
                            s += '</a>';
                        } else {
                            s += '&mdash;';
                        }

                        return s;
                    }
                }, {
                    field: 'theCase.person.gender',
                    title: '<div uib-tooltip="Gi???i t??nh" tooltip-placement="auto">Gi???i t??nh</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (!value) {
                            s += 'Kh??ng c?? th??ng tin';
                        }

                        switch (value) {
                            case 'MALE':
                                s += 'Nam';
                                break;
                            case 'FEMALE':
                                s += 'N???';
                                break;
                            default:
                                s += 'Kh??ng x??c ?????nh';
                                break;
                        }

                        return s + '</span>';
                    }
                }, {
                    field: 'theCase.person.dob',
                    title: '<div uib-tooltip="Ng??y sinh" tooltip-placement="auto">Ng??y sinh</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + moment(value).format('DD/MM/YYYY') + '</span>';
                    }
                }, {
                    field: 'latestVlTest',
                    title: '<div uib-tooltip="Ng??y x??t nghi???m TLVR g???n nh???t" tooltip-placement="auto">Ng??y XN TLVR g???n nh???t</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return (value && value.sampleDate) ? ('<span class="font-weight-600">' + moment(value.sampleDate).format('DD/MM/YYYY') + '</span>') : '&mdash;';
                    }
                }, {
                    field: 'latestVlTest',
                    title: '<div uib-tooltip="K???t qu??? TLVR g???n nh???t" tooltip-placement="auto">TLVR g???n nh???t</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';

                        if (value && typeof(value.resultNumber) != 'undefined') {
                            if (value.resultNumber == 0) {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-green small">Kh??ng ph??t hi???n</span>';
                            } else if (value.resultNumber < 200) {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-green">';
                                s += $filter('number')(value.resultNumber, 0);
                                s += ' (b???n sao/ml)</span>'
                            } else {
                                s += '<span class="font-weight-600 badge badge-normal-text badge-danger">';
                                s += $filter('number')(value.resultNumber, 0);
                                s += ' (b???n sao/ml)</span>';
                            }
                        } else {
                            s += '&mdash;';
                        }

                        s += '</span>';

                        return s;
                    }
                }
            ]
        }

        function getTableDefinition(opts) {
            let _cellAlignCenter = function (value, row, index, field) {
                return {
                    classes: 'text-center',
                    css: {'white-space': 'nowrap'}
                };
            };

            let _sortIcon1 = 'fa-sort';
            let _sortIcon2 = 'fa-sort';

            if (opts && opts.sortField == 1) {
                _sortIcon1 = 'fa-sort-alpha-asc';
            } else if (opts && opts.sortField == 2) {
                _sortIcon2 = 'fa-sort-alpha-asc';
            }

            let mTodayStart = moment().set({hour: 0, minute: 0, second: 0});
            let mNext14Days = mTodayStart.add(14, 'days');

            return [
                {
                    field: 'state',
                    checkbox: true,
                }, {
                    field: '',
                    title: '<div class="small text-center">[ Thao t??c ]</div>',
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        let s = '';
                        if (!row.arrived) {
                            s += '<button class="btn btn-sm btn-danger no-border" ng-click="$parent.removeAppointment(' + "'" + row.id + "'" + ',' + "'" + row.theCase.person.fullname + "'" + ',' + "'" + moment(row.appointmentDate).format('DD/MM/YYYY') + "'" + ');" uib-tooltip="X??a kh???i l???ch" tooltip-placement="auto"><i class="icon-trash"></i></button>';
                        } else {
                            s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="icon-trash"></i></button>';
                        }

                        // s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-history/' + row.theCase.id + '" uib-tooltip="L???ch s??? kh??m" tooltip-placement="auto"><i class="fa fa-history"></i></a>';
                        if (mNext14Days.isBefore(row.appointmentDate)) {
                            s += '<button data-ng-disabled="true" class="btn btn-sm btn-default no-border"><i class="fa fa-get-pocket"></i></button>';
                        } else {
                            s += '<a class="btn btn-sm btn-primary no-border" href="#/opc/appointment-cal/result/edit/' + row.theCase.caseOrgs[0].id + '/' + row.id + '" uib-tooltip="C???p nh???t k???t qu??? kh??m" tooltip-placement="auto"><i class="fa fa-get-pocket"></i></a>';
                        }

                        return s;
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 120px;">M?? b???nh ??n<a ng-click="$parent.sort(2);" title="S???p x???p theo m?? b???nh nh??n" href="#"><i class="fa ' + _sortIcon2 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '120px'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (value && value.caseOrgs && value.caseOrgs.length > 0 && value.caseOrgs[0].patientChartId) {
                            return '<span class="bold">' + value.caseOrgs[0].patientChartId + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 200px;">T??n b???nh nh??n<a ng-click="$parent.sort(1);" title="S???p x???p theo h??? t??n" href="#"><i class="fa ' + _sortIcon1 + '"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'min-width': '200px', 'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let s = '';

                        if (value.person && value.person.fullname) {
                            s += '<a href="#/opc/view-patient/' + value.caseOrgs[0].id + '" class="bold" target="_blank">';
                            s += value.person.fullname;
                            s += '</a>';
                        } else {
                            s += '&mdash;';
                        }

                        return s;
                    }
                }, {
                    field: 'arrived',
                    title: '<div class="text-center" uib-tooltip="???? t???i kh??m?" tooltip-placement="auto">Tr???ng th??i</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<span class="badge badge-primary">???? t???i</span>' : '<span class="badge badge-default">Ch??a t???i</span>';
                    }
                }, {
                    field: 'arrivalDate',
                    title: '<div class="text-center" uib-tooltip="Ng??y b???nh nh??n t???i kh??m" tooltip-placement="auto">Ng??y kh??m</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<span class="font-weight-600">' + moment(value).format('DD/MM/YYYY') + '</span>' : '&mdash;';
                    }
                }, /*{
                    field: 'nextAppointmentDate',
                    title: '<div class="text-center" uib-tooltip="Ng??y h???n t??i kh??m" tooltip-placement="auto">Ng??y h???n t??i kh??m</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<span class="font-weight-600">' + moment(value).format('DD/MM/YYYY') + '</span>' : '&mdash;';
                    }
                },*/ {
                    field: 'drugDays',
                    title: '<div class="text-center" uib-tooltip="S??? ng??y thu???c ???????c c???p" tooltip-placement="auto">S??? ng??y thu???c</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<span class="font-weight-600">' + value + '</span>' : '&mdash;';
                    }
                }, {
                    field: 'drugSource',
                    title: '<div class="text-center" uib-tooltip="Ngu???n thu???c ARV" tooltip-placement="auto">Ngu???n thu???c</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (typeof(value) == 'undefined') {
                            return '&mdash;';
                        }

                        let drugSources = [
                            {id: 'SHI', name: 'B???o hi???m'},
                            {id: 'PEPFAR', name: 'PEPFAR'},
                            {id: 'GF', name: 'Qu??? to??n c???u'},
                            {id: 'NATIONAL', name: 'Ng??n s??ch'},
                            {id: 'SELF', name: 'T??? chi tr???'},
                            {id: 'OTHER', name: 'Ngu???n kh??c'}
                        ];

                        let s = '&mdash;';
                        for (let i = 0; i < drugSources.length; i++) {
                            if (drugSources[i].id == value) {
                                s = drugSources[i].name;
                                break;
                            }
                        }

                        return '<span class="font-weight-600">' + s + '</span>';
                    }
                }, {
                    field: 'mmdEval',
                    title: '<div class="text-center" uib-tooltip="C???p thu???c nhi???u th??ng" tooltip-placement="auto">C???p thu???c nhi???u th??ng</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '<span class="font-weight-600">';

                        if (value.onMmd) {
                            s += '??ang nh???n nhi???u th??ng';
                        } else if (value.eligible) {
                            s += '??n ?????nh, ch??a c???p nhi???u th??ng.'
                        } else {
                            s += 'Ch??a ???n ?????nh';
                        }

                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'tbScreenResult',
                    title: '<div class="text-center" uib-tooltip="K???t qu??? s??ng l???c lao" tooltip-placement="auto">S??ng l???c lao</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        return value ? '<span class="font-weight-600">' + (value == 1 ? 'D????ng t??nh' : '??m t??nh') + '</span>' : '&mdash;';
                    }
                }, {
                    field: 'vlTest',
                    title: '<div class="text-center" uib-tooltip="X??t nghi???m t???i l?????ng virus HIV" tooltip-placement="auto">X??t nghi???m t???i l?????ng HIV</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '<span class="font-weight-600">';

                        if (value.resultDate) {
                            if (value.resultNumber) {
                                s += $filter('number')(value.resultNumber, 0) + ' <span class="small">b???n sao/ml</span>';
                            } else if (value.resultText) {
                                s += value.resultText;
                            } else {
                                s += '&mdash;';
                            }
                        } else {
                            s += 'Ch??a c?? k???t qu???';
                        }

                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'cd4Test',
                    title: '<div class="text-center" uib-tooltip="X??t nghi???m CD4" tooltip-placement="auto">X??t nghi???m CD4</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellAlignCenter,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '<span class="font-weight-600">';

                        if (value.resultDate) {
                            if (value.resultNumber) {
                                s += $filter('number')(value.resultNumber, 0) + ' <span class="small">t??? b??o/mm<sup>3</sup></span>';
                            } else if (value.resultText) {
                                s += value.resultText;
                            } else {
                                s += '&mdash;';
                            }
                        } else {
                            s += 'Ch??a c?? k???t qu???';
                        }

                        s += '</span>';

                        return s;
                    }
                }
            ]
        }

        function getTableDefinitionNA(opts) {
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
                    title: '<div class="text-center small">[ Thao t??c ]</div>',
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
                            s += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-primary no-padding-tb jumping no-border" href="#/opc/edit-patient/' + row.id + '" uib-tooltip="S???a&nbsp;h???&nbsp;s??&nbsp;b???nh&nbsp;nh??n" tooltip-placement="auto"><i class="icon-pencil"></i></a>';
                        } else {
                            s += '<button disabled="disabled" class="btn btn-primary no-padding-tb jumping no-border"><i class="icon-pencil"></i></button>';
                        }
                        s += '<div class="vertical-seperator shorter float-right"></div>';
                        if ((row.status == 'ACTIVE' || row.status == 'TRANSFERRED_OUT' || row.status == 'DEAD' || row.status == 'LTFU') && !row.theCase.deleted) {
                            let appId = 0;
                            if (row.theCase.appointments && row.theCase.appointments.length > 0) {
                                appId = row.theCase.appointments[0].id;
                            }

                            s += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="btn btn-primary no-padding-tb jumping no-border" href="#/opc/appointment-cal/result/home/' + row.id + '/' + appId + '" uib-tooltip="Kh??m&nbsp;-&nbsp;c???p&nbsp;thu???c" tooltip-placement="auto"><i class="fa fa-get-pocket"></i></a>';
                        } else {
                            s += '<button disabled="disabled" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Kh??m - c???p thu???c"><i class="fa fa-get-pocket"></i></button>';
                        }

                        s += '</div>';

                        return s;
                    }
                }, {
                    field: 'organization.name',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 120px;">C?? s??? ??i???u tr???<a class="margin-right-10" ng-click="$parent.openAdvancedSearchDialog();" href="#"><i class="fa fa-filter"></i></a></div>',
                    switchable: false,
                    visible: opts.displaySiteName,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<a href="#" ng-click="$parent.filterByOrg(' + "'" + row.organization.id + "', " + "'" + value + "'" + ')" uib-tooltip="L???c theo:&nbsp;' + row.organization.name + '" class="font-weight-500 text-muted"><i class="fa fa-caret-right icon-muted patient-status">&nbsp;</i>' + value + '</a>';
                    }
                }, {
                    field: 'theCase',
                    title: '<div class="header-with-sorter margin-left-5" style="min-width: 200px;">B???nh nh??n<a ng-click="$parent.sort(1);" title="S???p x???p theo h??? t??n" href="#"><i class="fa ' + _sortIcon1 + '"></i></a></div>',
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
                                ret += '<a class="bold patient-status-normal ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nh???n ????? xem h??? s??"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'normal') + ' margin-right-5"></i>';
                                break;
                            case 'LTFU':
                                ret += '<a class="bold patient-status-ltfu ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nh???n ????? xem h??? s??"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'ltfu') + ' margin-right-5"></i>';
                                break;
                            case 'TRANSFERRED_OUT':
                                ret += '<a class="bold patient-status-trans-out ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nh???n ????? xem h??? s??"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'trans-out') + ' margin-right-5"></i>';
                                break;
                            case 'DEAD':
                                ret += '<a class="bold patient-status-dead ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nh???n ????? xem h??? s??"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'dead') + ' margin-right-5"></i>';
                                break;
                            case 'PENDING_ENROLLMENT':
                                ret += '<a class="bold patient-status-enrollment-pending ' + deletedClass + '" href="#/opc/view-patient/' + row.id + '" uib-tooltip="Nh???n ????? xem h??? s??"><i class="' + gs + ' patient-status ' + (value.deleted ? 'record-deleted' : 'enrollment-pending') + ' margin-right-5"></i>';
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
                                status = 'h??? s?? ???? x??a v??o <span class="font-weight-600">';
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
                                status = 'h??? s?? ???? x??a';
                            }
                        } else {
                            switch (row.status) {
                                case 'ACTIVE':
                                    status = '??ang ??i???u tr??? t??? <span class="font-weight-600">' + moment(row.startDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'PENDING_ENROLLMENT':
                                    status = 'ch??? ti???p nh???n';
                                    break;
                                case 'CANCELLED_ENROLLMENT':
                                    status = 'h???y chuy???n g???i';
                                    break;
                                case 'LTFU':
                                    status = '???? b??? tr??? t??? <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'DEAD':
                                    status = '???? t??? vong t??? <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                                case 'TRANSFERRED_OUT':
                                    status = '???? chuy???n ??i t??? <span class="font-weight-600">' + moment(row.endDate).format('DD/MM/YYYY') + '</span>';
                                    break;
                            }
                        }

                        ret += '<a href="#" ng-click="$parent.displayStatusHistory(' + "'" + row.id + "'" + ');" uib-tooltip="Xem&nbsp;chi&nbsp;ti???t" class="p-status">' + status + '</a>'
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
                    title: '<div class="align-right">Ng??y sinh</div>',
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
                    title: '<div class="header-with-sorter margin-left-5">M?? b???nh ??n<a ng-click="$parent.sort(2);" title="S???p x???p theo m?? b???nh nh??n" href="#"><i class="fa ' + _sortIcon2 + '"></i></a></div>',
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
                    title: 'Lo???i ????ng k??',
                    switchable: false,
                    visible: !opts.siteManagerOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';

                        switch (row.enrollmentType) {
                            case 'NEWLY_ENROLLED':
                                s += '<i class="fa fa-circle-o margin-left-10 icon-muted margin-right-5"></i>????ng k?? m???i';
                                break;
                            case 'RETURNED':
                                s += '<i class="fa fa-rotate-right margin-left-10 icon-muted margin-right-5"></i>??i???u tr??? l???i';
                                break;
                            case 'TRANSFERRED_IN':
                                s += '<i class="fa fa-long-arrow-right margin-left-10 icon-muted margin-right-5"></i>chuy???n t???i';
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
                    title: '<div class="margin-left-5">M?? HIV-Info</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        return '<div class="margin-left-5 font-weight-500">' + (value ? value : '&mdash;') + '</div>';
                    }
                }, {
                    field: 'theCase.person.nidNumber',
                    title: '<div class="margin-left-5">S??? CMTND</div>',
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
                    title: '<div class="align-right">Ng??y XNK?? HIV</div>',
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
                    title: '<div class="align-right">Ng??y b???t ?????u ARV</div>',
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
                    title: 'Ph??c ????? ARV hi???n t???i',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-500">';
                        if (value.currentArvRegimenName) {
                            s += value.currentArvRegimenName;
                            if (value.currentArvRegimenLine) {
                                s += ' (b???c ' + value.currentArvRegimenLine + ')';
                            }
                        } else {
                            s += '&mdash;';
                        }
                        s += '</span>';

                        return s;
                    }
                }, {
                    field: 'theCase.currentArvRegimenStartDate',
                    title: '<div class="align-right">B???t ?????u ph.????? ARV g???n nh???t</div>',
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
                    title: 'K???t qu??? TLVR g???n nh???t',
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
                                s += (entry.resultNumber == 0 ? 'Kh??ng ph??t hi???n' : ($filter('number')(entry.resultNumber, 0) + ' <span class="small">(b???n sao/ml)</span>'));
                            } else if (entry.resultText) {
                                s += entry.resultText;
                            } else {
                                s += 'Ch??a c?? k???t qu???.';
                            }
                            s += '</span>';

                            return s;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'theCase.labTests',
                    title: '<div class="align-right">Ng??y l???y m???u TLVR g???n nh???t</div>',
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
                    title: '<i class="fa fa-flash margin-right-5"></i>C???p thu???c nhi???u th??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.status == 'ACTIVE') {
                            let s = '';
                            let firstMmd = ((row.theCase.mmdEvals && row.theCase.mmdEvals.length > 0) ? row.theCase.mmdEvals[0] : null);

                            if (firstMmd) {
                                if (firstMmd.onMmd) {
                                    s += '<span ng-click="$parent.showMMDOverview(' + "'" + row.theCase.id + "'" + ')"><span class="font-weight-600 underline-alt">??ang nh???n</span> thu???c nhi???u th??ng</span>';
                                    s += ' &mdash; <span class="small">L???n g???n nh???t:</span> ';
                                    s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                                } else {
                                    if (firstMmd.eligible) {
                                        s += '<span ng-click="$parent.showMMDOverview(' + "'" + row.theCase.id + "'" + ')">???? ???????c ????nh gi?? <span class="font-weight-600 underline">???n ?????nh</span></span>';
                                        if (firstMmd.evaluationDate) {
                                            s += ' &mdash; <span class="small">Ng??y:</span> ';
                                            s += moment(firstMmd.evaluationDate).format('DD/MM/YYYY');
                                        }
                                    } else {
                                        s += 'B???nh nh??n ch??a ???n ?????nh.';
                                    }
                                }
                            } else {
                                s += '<span class="text-muted">Ch??a ????nh gi??.</span>';
                            }

                            return s;
                        } else {
                            return '<span class="text-muted">Kh??ng c??n ??i???u tr???.</span>';
                        }

                        return '&mdash;';
                    }
                }*/, {
                    field: 'arvGroup',
                    title: 'Nh??m ??/tr??? ARV',
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
                    title: '?????a ch??? hi???n t???i',
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
                    title: '?????a ch??? theo h??? kh???u',
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
    }

})();