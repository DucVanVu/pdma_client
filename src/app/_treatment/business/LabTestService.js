/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('LabTestService', LabTestService);

    LabTestService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function LabTestService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.checkVLEligibility = checkVLEligibility;
        self.analyze = analyze;
        self.getEntry = getEntry;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getEntries = getEntries;
        self.getMultiple = getMultiple;
        self.getVLTableDefinition = getVLTableDefinition;
        self.getRecencyTableDefinition = getRecencyTableDefinition;
        self.getCD4TableDefinition = getCD4TableDefinition;
        self.getDRTableDefinition = getDRTableDefinition;

        function checkVLEligibility(filter) {
            let url = baseUrl + 'labtest/eligibility';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        /**
         * Analyze and suggest data for adding a new viral load test
         *
         * @param entry - the new entry
         * @param patient
         * @param entries - full list of VL lab tests of this patient
         */
        function analyze(entry, patient, entries) {
            if (!entry || !patient || !patient.id) {
                return;
            }

            let today = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
            let arvStartDate = patient.arvStartDate;

            if (patient.secondLineStartDate) {
                arvStartDate = patient.secondLineStartDate;
            }

            if (patient.thirdLineStartDate) {
                arvStartDate = patient.thirdLineStartDate;
            }

            if (!arvStartDate) {
                return; // invalid patient's ARV start date
            }

            let monthDiff = today.diff(arvStartDate, 'months');

            // at 6th month
            if (monthDiff > 3 && monthDiff < 9) {
                entry.reasonForTesting = 'VL_AT_6MONTH';
            }

            // at 12th month
            if (monthDiff >= 9 && monthDiff <= 15) {
                entry.reasonForTesting = 'VL_AT_12MONTH';
            }

            // routine 12th month
            if (monthDiff > 15) {
                entry.reasonForTesting = 'VL_ROUTINE_12MONTH';
            }

            // check 3-month follow-up test
            // get latest entry
            let latest = null;
            if (entries && entries.length > 0) {
                latest = entries[0];
            }

            if (!latest) {
                return;
            }

            if (latest.resultNumber && latest.resultNumber >= 200) {
                monthDiff = today.diff(latest.sampleDate, 'months');
                if (monthDiff >= 3 && monthDiff <= 6) {
                    entry.reasonForTesting = 'VL_FOLLOWUP_3MONTH';
                } else {
                    entry.reasonForTesting = 'VL_ROUTINE_12MONTH';
                }
            }
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'labtest/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'labtest/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getMultiple(filter) {
            let url = baseUrl + 'labtest/multiple';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'labtest';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'labtest';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getVLTableDefinition(siteManager, orgsWritable, noResultOnly) {

            let _tableOperation = function (value, row, index) {
                let org = row.organization;
                if (!org || !org.id || !orgsWritable || orgsWritable.length <= 0) {
                    return '&mdash;';
                }

                let ret = '';
                if (utils.indexOf(org, orgsWritable) >= 0) {
                    ret += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                    if (noResultOnly) {
                        ret += '<span class="text-muted mutter margin-right-20"><i class="icon-trash margin-right-5"></i>Xo??</span>';
                    } else {
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                    }
                } else {
                    ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                    ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                }

                return ret;
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
                    return '<span class="font-weight-500 small text-danger">[ ch??a ghi nh???n ]</span>';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _resultFormatter = function (value, row, index) {
                let result = '<span class="font-weight-500 small text-danger">[ ch??a ghi nh???n ]</span>';

                if (row.resultNumber != null) {
                    if (row.resultNumber > 0) {
                        result = '<b>' + row.resultNumber + '</b> b???n sao/ml';
                    } else {
                        result = '<span class="font-weight-600 text-green">Kh??ng ph??t hi???n</span>';
                    }
                }

                return result;
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: siteManager,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'patientFullname',
                    title: 'T??n b???nh nh??n',
                    switchable: false,
                    visible: noResultOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'patientChartId',
                    title: 'M?? b???nh ??n',
                    switchable: false,
                    visible: noResultOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'organization',
                    title: '????n v??? ch??? ?????nh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + value.name + '</span>';
                    }
                }, {
                    field: 'reasonForTesting',
                    title: 'L?? do x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-600">';
                        switch (value) {
                            case 'VL_AT_6MONTH':
                                s += 'T???i th???i ??i???m 6 th??ng sau ART';
                                break;
                            case 'VL_AT_12MONTH':
                                s += 'T???i th???i ??i???m 12 th??ng sau ART';
                                break;
                            case 'VL_ROUTINE_12MONTH':
                                s += '?????nh k??? sau 12 th??ng';
                                break;
                            case 'VL_FOLLOWUP_3MONTH':
                                s += 'C?? bi???u hi???n nghi ng??? TB??T';
                                break;
                            case 'VL_PREGNANCY':
                                s += 'Ph??? n??? mang thai, cho con b??';
                                break;
                            case 'VL_RECENCY':
                                s += 'XN TLVR ????? kh???ng ?????nh nhi???m m???i';
                                break;
                        }

                        return s;
                    }
                }, {
                    field: 'sampleDate',
                    title: 'Ng??y l???y m???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'resultText',
                    title: 'K???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _resultFormatter
                }, {
                    field: 'resultDate',
                    title: 'Ng??y c?? k???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'fundingSource',
                    title: 'Ngu???n kinh ph??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '';
                        switch (value) {
                            case 'SHI':
                                s = 'B???o hi???m y t???';
                                break;
                            case 'GF':
                                s = 'Qu??? to??n c???u';
                                break;
                            case 'SELF':
                                s = 'T??? chi tr???';
                                break;
                            case 'DRIVE_C':
                                s = 'D??? ??n Drive-C';
                                break;
                            default:
                                s = 'Ngu???n kh??c';
                                break;
                        }

                        return s;
                    }
                }, {
                    field: 'sampleSite',
                    title: 'N??i l???y m???u x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + value + '</span>';
                    }
                }
            ]
        }

        function getCD4TableDefinition(siteManager, orgsWritable, noResultOnly) {

            let _tableOperation = function (value, row, index) {
                let org = row.organization;
                if (!org || !org.id || !orgsWritable || orgsWritable.length <= 0) {
                    return '&mdash;';
                }

                let ret = '';
                if (utils.indexOf(org, orgsWritable) >= 0) {
                    ret += '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                    if (noResultOnly) {
                        ret += '<span class="text-muted mutter margin-right-20"><i class="icon-trash margin-right-5"></i>Xo??</span>';
                    } else {
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                    }
                } else {
                    ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                    ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                }

                return ret;
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
                    return '<span class="font-weight-500 small text-danger">[ ch??a ghi nh???n ]</span>';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: siteManager,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'patientFullname',
                    title: 'T??n b???nh nh??n',
                    switchable: false,
                    visible: noResultOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'patientChartId',
                    title: 'M?? b???nh ??n',
                    switchable: false,
                    visible: noResultOnly,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-600">' + value + '</span>';
                    }
                }, {
                    field: 'organization',
                    title: '????n v??? ch??? ?????nh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + value.name + '</span>';
                    }
                }, {
                    field: 'reasonForTesting',
                    title: 'L?? do x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<span class="font-weight-600">';

                        switch (value) {
                            case 'CD4_BASELINE':
                                s += 'Tr?????c khi b???t ?????u ARV';
                                break;
                            case 'CD4_ROUTINE':
                                s += 'X??t nghi???m ?????nh k???';
                                break;
                        }

                        return s;
                    }
                }, {
                    field: 'sampleDate',
                    title: 'Ng??y l???y m???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'resultNumber',
                    title: 'K???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == null) {
                            return '<span class="font-weight-500 small text-danger">[ ch??a ghi nh???n ]</span>';
                        }

                        return (value < 350) ? '<span class="bold text-red">' + value + '</span> t??? b??o/mm<sup>3</sup>' : '<span class="bold text-green">' + value + '</span> t??? b??o/mm<sup>3</sup>';
                    }
                }, {
                    field: 'resultDate',
                    title: 'Ng??y c?? k???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'fundingSource',
                    title: 'Ngu???n kinh ph??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = '';
                        switch (value) {
                            case 'SHI':
                                s = 'B???o hi???m y t???';
                                break;
                            case 'GF':
                                s = 'Qu??? to??n c???u';
                                break;
                            case 'SELF':
                                s = 'T??? chi tr???';
                                break;
                            case 'DRIVE_C':
                                s = 'D??? ??n Drive-C';
                                break;
                            default:
                                s = 'Ngu???n kh??c';
                                break;
                        }

                        return s;
                    }
                }, {
                    field: 'sampleSite',
                    title: 'N??i l???y m???u x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return '<span class="font-weight-500">' + value + '</span>';
                    }
                }
            ]
        }

        function getRecencyTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="green-dark margin-right-20" href="#" ng-click="$parent.$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                ret += '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="green-dark margin-right-20" href="#" ng-click="$parent.$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                ret += '<span ng-if="!$parent.isSiteManager($parent.currentUser)">&mdash;</span>';

                return ret;
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
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter_2 = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                let date = new Date(value.year, value.monthValue - 1, value.dayOfMonth, value.hour, value.minute, value.second, value.nano);
                return moment(date).format('DD/MM/YYYY hh:mm:ss A');
            };

            let _reasonFormatter = function (value, row, index) {
                if (!value || !value.id) {
                    return '';
                }

                return value.value;
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'resultText',
                    title: 'K???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }, {
                    field: 'sampleDate',
                    title: 'Ng??y l???y m???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'resultDate',
                    title: 'Ng??y c?? k???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'createDate',
                    title: 'Ng??y gi??? nh???p li???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter_2
                }
            ]
        }

        function getDRTableDefinition(orgsWritable, isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let org = row.organization;
                if (!org || !org.id || !orgsWritable || orgsWritable.length <= 0) {
                    return '&mdash;';
                }

                let ret = '';

                if (!isSiteManager) {
                    ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                    ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                } else {
                    if (utils.indexOf(org, orgsWritable) >= 0) {
                        ret = '<a class="btn btn-sm btn-primary no-border margin-right-20" href="#" ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                        ret += '<a class="btn btn-sm btn-danger no-border margin-right-20" href="#" ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';
                    } else {
                        ret = '<button disabled="disabled" class="btn btn-sm btn-default no-border margin-right-20"><i class="icon-pencil margin-right-5"></i>S???a</button>';
                        ret += '<button disabled="disabled" class="btn btn-sm btn-default no-border"><i class="icon-trash margin-right-5"></i>Xo??</button>';
                    }
                }

                return ret;
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
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };

            let _dateFormatter_2 = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }

                let date = new Date(value.year, value.monthValue - 1, value.dayOfMonth, value.hour, value.minute, value.second, value.nano);
                return moment(date).format('DD/MM/YYYY hh:mm:ss A');
            };

            return [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                }, {
                    field: 'organization',
                    title: 'C?? s??? y??u c???u x??t nghi???m',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.name) {
                            return value.name;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'resultText',
                    title: 'K???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            if (row.resultDate) {
                                return 'Kh??ng kh??ng thu???c';
                            } else {
                                return '&mdash;';
                            }
                        }

                        return '<span class="bold">' + value.replace(/\$\$/g, '/') + '</span>';
                    }
                }, {
                    field: 'sampleDate',
                    title: 'Ng??y l???y m???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'resultDate',
                    title: 'Ng??y c?? k???t qu???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'createDate',
                    title: 'Ng??y gi??? nh???p li???u',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter_2
                }
            ]
        }
    }

})();