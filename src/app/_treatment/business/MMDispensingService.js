/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('MMDispensingService', MMDispensingService);

    MMDispensingService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function MMDispensingService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.updateDeletionStatus = updateDeletionStatus;
        self.getAllEntries = getAllEntries; // for one patient
        self.getHardEligible = getHardEligible;
        self.isHardEligible = isHardEligible;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinitionForHistory = getTableDefinitionForHistory;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'mmdispensing/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function updateDeletionStatus(dto, successCallback, errorCallback) {
            if (!dto) {
                return $q.when(null);
            }

            let url = baseUrl + 'mmdispensing/soft_del_restore';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'mmdispensing/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getHardEligible(filter) {
            let url = baseUrl + 'mmdispensing/hard_eligible_vals';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function isHardEligible(filter) {
            let url = baseUrl + 'mmdispensing/hard_eligible';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'mmdispensing';
            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'mmdispensing';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinitionForHistory(isSiteManager) {
            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: '',
                    title: '<div class="text-center small">[thao t??c]</div>',
                    switchable: false,
                    visible: isSiteManager,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '<div class="opc-toolbar">';

                        if (row.deleted) {
                            s += '<a class="btn btn-sm btn-default no-border" ng-click="$parent.mmdRestoreEntry(' + "'" + row.id + "'," + "'" + row.theCase.id + "'"  + ')" href="#"><i class="fa fa-undo margin-right-5"></i> kh??i ph???c</a>';
                            s += '<div class="vertical-seperator shorter float-right"></div>';
                            s += '<span class="btn btn-sm btn-primary no-border" disabled="disabled"><i class="icon-pencil"></i> s???a</span>';
                        } else {
                            s += '<a class="btn btn-sm btn-danger no-border" ng-click="$parent.mmdDeleteEntry(' + "'" + row.id + "'," + "'" + row.theCase.id + "'"  + ')" href="#"><i class="icon-trash margin-right-5"></i> x??a</a>';
                            s += '<div class="vertical-seperator shorter float-right"></div>';
                            s += '<a class="btn btn-sm btn-primary no-border" ng-click="$parent.updateMMDEntry(' + "'" + row.id + "'" + ')" href="#"><i class="icon-pencil"></i> s???a</a>';
                        }

                        s += '</div>';

                        return s;
                    }
                }, {
                    field: 'eligible',
                    title: '<div class="text-center text-green">???n ?????nh?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        let bgColor = 'rgba(255, 229, 0, 0.05)';
                        if (value) {
                            bgColor = 'rgba(255, 229, 0, 0.3)';
                        }

                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': bgColor}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'onMmd',
                    title: '<div class="text-center text-green">C???p nhi???u th??ng?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        let bgColor = 'rgba(255, 229, 0, 0.1)';
                        if (value) {
                            bgColor = 'rgba(255, 229, 0, 0.4)';
                        }

                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': bgColor}
                        };
                    },
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'evaluationDate',
                    title: 'Ng??y ????nh gi??',
                    switchable: false,
                    visible: true,
                    cellStyle: function () {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'text-align': 'right'}
                        };
                    },
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        let s = moment(value).format('D/M/YYYY');

                        if (row.deleted) {
                            return '<span class="text-muted">' + s + '</span>';
                        }

                        return s;
                    }
                }, {
                    field: 'adult',
                    title: '<div class="small text-center">&ge; 3 tu???i?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>';
                        }
                    }
                }, {
                    field: 'arvGt12Month',
                    title: '<div class="small text-center">??.tr??? ARV &gt; 6 th??ng?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'vlLt200',
                    title: '<div class="small text-center">TLVR &lt; 50?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'noOIs',
                    title: '<div class="small text-center">Kh??ng c?? NTCH?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'noDrugAdvEvent',
                    title: '<div class="small text-center">Kh??ng T.D ph??? c???a thu???c?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap'}
                        };
                    },
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'noPregnancy',
                    title: '<div class="small text-center">Kh??ng c?? thai, cho con b???</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: 'goodAdherence',
                    title: '<div class="small text-center">Tu??n th??? t???t?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {

                        if (row.deleted) {
                            return '<div class="text-center text-muted mutter">&mdash;</div>';
                        }

                        if (value) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }
            ]
        }

        function getTableDefinition() {

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: '',
                    title: '<div class="small text-center">[Thao t??c]</div>',
                    switchable: false,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let s = '';
                        let firstMmdRecord = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);

                        // if (!firstMmdRecord.adult || !firstMmdRecord.arvGt12Month || !firstMmdRecord.vlLt200) {
                        //     s += '<button uib-tooltip="C???p nh???t th??ng tin" class="btn btn-default no-border btn-sm font-weight-600" style="min-width: 55px;" data-ng-disabled="true"><span class="text-muted">&mdash;</span></button>';
                        // } else {
                        s += '<button ng-click="$parent.showMMDOverview(' + "'" + row.id + "'" + ')" uib-tooltip="L???ch s??? c???p thu???c nhi???u th??ng" class="btn btn-primary no-border btn-sm font-weight-600" style="min-width: 55px;"><i class="fa fa-history"></i></button>';
                        // }

                        return s;
                    }
                }, {
                    field: 'id',
                    title: '<div class="header-with-sorter margin-left-5">Th??ng tin b???nh nh??n<a class="hidden-xs hidden-sm hidden-md text-muted" href="#"><i class="fa fa-sort-alpha-asc"></i></a></div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let ret = '<div>';
                        let gs = 'fa fa-';
                        if (row.person.gender) {
                            let gender = row.person.gender;

                            gs += ((gender == 'MALE') ? 'mars' : ((gender == 'FEMALE') ? 'venus' : 'neuter'));
                        } else {
                            gs += 'neuter';
                        }

                        ret += '<a class="bold patient-status-normal" target="_blank" href="#/opc/view-patient/' + row.id + '"><i class="' + gs + ' patient-status normal margin-right-5"></i>';
                        ret += (row.person.fullname + '</a>');
                        ret += '</div>';
                        ret += '<span class="small margin-right-5">&mdash; M?? b???nh ??n:</span><span class="smaller font-weight-500">' + ((row.caseOrgs && row.caseOrgs.length > 0) ? row.caseOrgs[0].patientChartId : '&mdash;') + '</span>';
                        return ret;
                    }
                }, {
                    field: '',
                    title: '<div class="text-center text-green underline">B???nh nh??n<br/>???? ???n ?????nh?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        let bgColor = 'rgba(51, 122, 183, 0.1)';
                        if (firstMmd && firstMmd.eligible) {
                            bgColor = 'rgba(51, 122, 183, 0.4)';
                        }

                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': bgColor}
                        };
                    },
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.eligible) {
                            return '<div class="text-center" style="color: #1b5889"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="text-center text-green underline">??ang ???????c c???p<br/>nhi???u th??ng?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        let bgColor = 'rgba(51, 122, 183, 0.1)';
                        if (firstMmd && firstMmd.onMmd) {
                            bgColor = 'rgba(51, 122, 183, 0.6)';
                        }

                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': bgColor}
                        };
                    },
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.onMmd) {
                            return '<div class="text-center" style="color: #1b5889"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">&ge; 15 tu???i?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.adult) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>';
                        }
                    }
                }, {
                    field: 'id',
                    title: '<div class="small text-center">??.tr??? ARV<br/>&gt; 12 th??ng?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.arvGt12Month) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">TLVR &lt; 200/<br />CD4 &ge; 500?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.vlLt200) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">Kh??ng c??<br />NTCH?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': 'rgba(0, 0, 0, 0.05)'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.noOIs) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">Kh??ng T.D ph???<br/>c???a thu???c?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: function (value, row, index, field) {
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap', 'background-color': 'rgba(0, 0, 0, 0.05)'}
                        };
                    },
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.noDrugAdvEvent) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">Kh??ng c?? thai,<br />cho con b???</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.noPregnancy) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }, {
                    field: '',
                    title: '<div class="small text-center">Tu??n th??? t???t?</div>',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let firstMmd = ((row.mmdEvals && row.mmdEvals.length > 0) ? row.mmdEvals[0] : null);
                        if (firstMmd && firstMmd.goodAdherance) {
                            return '<div class="text-center text-green"><i class="fa fa-check"></i></div>';
                        } else {
                            return '<div class="text-center text-danger"><i class="fa fa-close"></i></div>'
                        }
                    }
                }
            ]
        }
    }

})();