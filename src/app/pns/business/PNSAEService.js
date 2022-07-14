/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').service('PNSAEService', PNSAEService);

    PNSAEService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PNSAEService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.eventTypes = [
            {
                id: 1,
                name: "Đe dọa tổn thương người có HIV, BT/BC và các thành viên gia đình, hoặc người cung cấp dịch vụ TBXNBT/BC về thể chất, tình dục hoặc kinh tế"
            },
            {
                id: 2,
                name: "Có sự cố gây tổn thương về thể chất, tình dục hoặc kinh tế của người có HIV, BT/BC và các thành viên gia đình, hoặc người cung cấp dịch vụ TBXNBT/BC"
            },
            {id: 3, name: "Phải dừng điều trị ARV hoặc dừng sử dụng các dịch vụ có liên quan khác"},
            {id: 4, name: "Người có HIV bị ép buộc tiết lộ thông tin cá nhân của họ hay của BT/BC"},
            {id: 5, name: "Trẻ em < 15 tuổi bị bỏ rơi hoặc bị đuổi ra khỏi nhà"},
            {id: 6, name: "Người có HIV không đồng ý tham gia TB BT/BC"},
            {id: 7, name: "Người có HIV bị kỳ thị tại cơ sở hoặc bị coi như tội phạm"}
        ];

        self.facilityTypes = [
            {id: 'PUBLIC_FACILITY', name: 'Cơ sở y tế công'},
            {id: 'PRIVATE_FACILITY', name: 'Cơ sở y tế tư nhân'},
            {id: 'COMMUNITY', name: 'Nhóm cộng đồng (CBO, nhân viên tiếp cận cộng đồng)'},
            {id: 'OTHER', name: 'Khác'}
        ];

        self.downloadReport = downloadReport;
        self.getEntry = getEntry;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.submitEntry = submitEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;

        function downloadReport(filter) {
            let url = baseUrl + 'pns_ae/report';

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

            let url = baseUrl + 'pns_ae/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'pns_ae/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'pns_ae';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function submitEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'pns_ae/submit';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'pns_ae';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ops = '<a class="text-blue margin-right-20" href="#/pns-ae-edit/' + row.id + '" ><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                ops += '<a class="text-danger margin-right-20" href="#" data-ng-click="$parent.deleteEntry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xóa</a>';

                if (row.submitted) {
                    ops = '<p class="table-operation-status text-green"><i class="fa fa-check margin-right-5"></i>Đã gửi đi</p>';
                    ops += '<span class="inline-block margin-left-5"><a class="text-blue margin-right-20" href="#/pns-ae-edit/' + row.id + '" ><i class="icon-frame margin-right-5"></i>Xem</a></span>';
                }

                return ops;
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
                    title: 'Thao tác',
                    switchable: true,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }, {
                    field: 'facilityType',
                    title: 'Cơ sở dịch vụ',
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value && !row.facility && !row.facility.name) {
                            return '&mdash;';
                        }

                        let ret = '<span class="font-weight-600">' + row.facility.name + '</span>';

                        for (let i = 0; i < self.facilityTypes.length; i++) {
                            if (self.facilityTypes[i].id == value) {
                                ret += '<br />&mdash;';
                                ret += self.facilityTypes[i].name;
                            }
                        }

                        return ret;
                    }
                }, {
                    field: 'eventType',
                    title: 'Tình huống được báo cáo',
                    switchable: true,
                    visible: true,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        for (let i = 0; i < self.eventTypes.length; i++) {
                            if (self.eventTypes[i].id == value) {
                                return self.eventTypes[i].name;
                            }
                        }

                        return '&mdash;';
                    }
                }, {
                    field: 'reportDate',
                    title: 'Ngày báo cáo',
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return moment(value).format('DD/MM/YYYY hh:mm:ss a');
                    }
                }, {
                    field: 'addressed',
                    title: 'Được xử trí?',
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: function (value, row, index) {
                        if (!value) {
                            return '&mdash;';
                        }

                        return value == 1 ? '<i class="fa fa-check-square-o cursor-pointer" uib-tooltip="Đã xử trí tình huống" tooltip-placement="auto"></i>' : '<i class="fa fa-square-o cursor-pointer" uib-tooltip="Chưa xử trí tình huống" tooltip-placement="auto"></i>';
                    }
                }
            ]
        }
    }

})();