/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').service('PNSService', PNSService);

    PNSService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities',
        'constants'
    ];

    function PNSService($http, $q, settings, utils, constants) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.INSTRUCTION_VISIBILITY = constants.cookies_pns_instr_visibility;
        self.CURRENT_PAGE = constants.cookies_pns_current_page;

        self.export2Excel = export2Excel;
        self.exportRawData = exportRawData;
        self.hasBaseline = hasBaseline;
        self.hasPost = hasPost;
        self.getEntry = getEntry;
        self.downloadAttachment = downloadAttachment;
        self.downloadFacilityReport = downloadFacilityReport;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.getPrefs = getPrefs;
        self.setPrefs = setPrefs;
        self.saveEntry = saveEntry;
        self.submit = submit;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        /**
         * Export to excel file for download
         * @param filter
         * @returns {*}
         */
        function export2Excel(filter) {
            let url = baseUrl + 'pns_assessment/excel';

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

        function exportRawData(filter) {
            let url = baseUrl + 'pns_assessment/excel_detailed/' + filter.type;

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

        function hasBaseline(facId) {
            if (!facId) {
                return $q.when(true);
            }

            let url = baseUrl + 'pns_assessment/has-baseline/' + facId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function hasPost(facId) {
            if (!facId) {
                return $q.when(true);
            }

            let url = baseUrl + 'pns_assessment/has-post/' + facId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'pns_assessment/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function downloadAttachment(id, prop) {
            if (!id || !prop) {
                id = 0;
            }

            let url = baseUrl + 'pns_assessment/download/' + id + '/' + prop;

            return $http({
                method: 'GET',
                url: url,
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function downloadFacilityReport(id) {
            if (!id) {
                id = 0;
            }

            let url = baseUrl + 'pns_assessment/facility-report/' + id;

            return $http({
                method: 'GET',
                url: url,
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'pns_assessment/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'pns_assessment/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getPrefs() {
            let url = baseUrl + 'pns_assessment/prefs';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function setPrefs(prefs, successCallback, errorCallback) {
            let url = baseUrl + 'pns_assessment/prefs';

            return utils.resolveAlt(url, 'POST', null, prefs, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'pns_assessment';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function submit(entry, successCallback, errorCallback) {
            let url = baseUrl + 'pns_assessment/submit';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'pns_assessment';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a ng-if="$parent.isSiteManager($parent.currentUser)" class="green-dark margin-right-20" href="#/pns-assess-edit/' + row.id + '">' + (row.submitted ? '<i class="icon-frame margin-right-5"></i>Xem chi ti???t' : '<i class="icon-pencil margin-right-5"></i>Ch???nh s???a') + '</a>';
                ret += '<a ng-if="!$parent.isSiteManager($parent.currentUser)" class="green-dark margin-right-20" href="#/pns-assess-edit/' + row.id + '"><i class="icon-frame margin-right-5"></i>Xem chi ti???t</a>';

                return ret;
            };

            let _cellNowrap = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap'}
                };
            };

            return [
                {
                    field: 'state',
                    checkbox: true
                }
                , {
                    field: '',
                    title: 'Thao t??c',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'facility.name',
                    title: 'T??n c?? s???',
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'assessmentDate',
                    title: 'Ng??y ????nh gi??',
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '';
                        }
                        return moment(value).format('DD/MM/YYYY');
                    }
                }
                , {
                    field: 'assessmentType',
                    title: 'Lo???i ????nh gi??',
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        let ret = '';
                        switch (value) {
                            case 0:
                                ret = '????nh gi?? ban ?????u';
                                break;
                            case 1:
                                ret = '????nh gi?? gi???a k???';
                                break;
                            case 2:
                                ret = '????nh gi?? sau can thi???p';
                                break;
                            case 3:
                                ret = '????nh gi?? ?????nh k???';
                                break;
                        }
                        return ret;
                    }
                }
                , {
                    field: 'submitted',
                    title: '???? g???i l??n tuy???n tr??n',
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == 1) {
                            return '<span class="badge badge-primary">???? g???i ??i</span>'
                        } else {
                            return '<span class="badge badge-default">Ch??a g???i ??i</span>'
                        }
                    }
                }
                , {
                    field: 'finalScore',
                    title: '??i???m ?????t ???????c',
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value == 31) {
                            return '<span class="text-green bold">' + value + '</span>';
                        } else {
                            return value;
                        }
                    }
                }
            ]
        }
    }

})();