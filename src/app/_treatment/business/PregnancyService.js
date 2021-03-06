/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('PregnancyService', PregnancyService);

    PregnancyService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PregnancyService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'pregnancy/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'pregnancy/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'pregnancy';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'pregnancy';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition(orgsWritable, isSiteManager) {

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
                    title: 'C?? s??? ghi nh???n th??ng tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value && value.name) {
                            return '<span class="font-weight-600">' + value.name + '</span>';
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'pregnant',
                    title: 'T??nh tr???ng thai ngh??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return 'Kh??ng mang thai';
                        } else {
                            return 'C?? mang thai';
                        }
                    }
                }, {
                    field: 'lastMenstrualPeriod',
                    title: 'Ng??y c???a k?? kinh cu???i',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        } else {
                            return moment(value).format('DD/MM/YYYY');
                        }
                    }
                }, {
                    field: 'dueDate',
                    title: 'Ng??y d??? sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        } else {
                            return moment(value).format('DD/MM/YYYY');
                        }
                    }
                }, {
                    field: 'pregResult',
                    title: 'T??nh tr???ng sinh n???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        switch (value) {
                            case null:
                                return '&mdash;';
                            case 'STILLBIRTH':
                                return 'Ch??a sinh';
                            case 'GAVEBIRTH':
                                return '<span class="bold text-green">???? sinh</span>';
                            case 'MISCARRIAGE':
                                return '<span class="bold text-danger">B??? s???y thai</span>';
                            case 'ABORTION':
                                return '<span class="bold text-danger">???? ph?? thai</span>';
                            case 'UNKNOWN':
                                return 'Kh??ng r??';
                        }
                    }
                }, {
                    field: 'childDob',
                    title: 'Ng??y sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        } else {
                            return moment(value).format('DD/MM/YYYY');
                        }
                    }
                }, {
                    field: 'childHIVStatus',
                    title: 'XN HIV+ c???a con',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.pregResult == 'GAVEBIRTH') {
                            switch (value) {
                                case null, 0:
                                    return 'Kh??ng c?? th??ng tin';
                                case 1:
                                    return 'Nhi???m HIV';
                                case 2:
                                    return 'Kh??ng nhi???m HIV';
                                case 3:
                                    return 'Kh??ng r??';
                            }
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'childProphylaxis',
                    title: '??i???u tr??? d??? ph??ng cho con',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.pregResult == 'GAVEBIRTH') {
                            switch (value) {
                                case null, 0:
                                    return 'Kh??ng c?? th??ng tin';
                                case 1:
                                    return 'C?? ??i???u tr???';
                                case 2:
                                    return 'Kh??ng ??i???u tr???';
                                case 3:
                                    return 'Kh??ng r??';
                            }
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'childInitiatedOnART',
                    title: '??i???u tr??? ARV cho con',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (row.childHIVStatus == 1) {
                            switch (value) {
                                case null:
                                    return '&mdash';
                                case true:
                                    return '???? ????a v??o ??i???u tr???';
                                case false:
                                    return 'Ch??a ??i???u tr???';
                            }
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'childOpc',
                    title: 'C?? s??? ??i???u tr??? ARV cho con',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value) {
                            return value;
                        } else {
                            return '&mdash;';
                        }
                    }
                }, {
                    field: 'note',
                    title: 'Ghi ch??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (value) {
                            return value;
                        } else {
                            return '&mdash;';
                        }
                    }
                }
            ]
        }
    }

})();