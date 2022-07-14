/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TBTreatment2Service', TBTreatment2Service);

    TBTreatment2Service.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TBTreatment2Service($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getLatestEntry = getLatestEntry;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.getTableDefinition = getTableDefinition;
        self.getSubTableDefinition = getSubTableDefinition;

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_treatment2/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getLatestEntry(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_treatment2/latest/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'tb_treatment2/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'tb_treatment2/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'tb_treatment2';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_treatment2';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';

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
			let _cellNowra2 = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };
			let _orderFormatter = function (value, row, index) {
                return index + 1;
            };

            let tb2ScreeningTypes = [
                {id: 'upon_registration_of_the_treatment_facility', name: 'Khi đăng ký CSĐT'},
                {id: 'during_the_management_of_the_Treatment_Facility', name: 'Trong quá trình quản lý CSĐT'},
                {id: 'patients_with_suspected_TB_visit_a_TB_facility', name: 'BN nghi lao đến khám cơ sở lao (do cơ sở HIV chuyển hoặc BN tự đến)'},
                {id: 'HIV_infected_TB_patient_transferred_from_a_TB_facility', name: 'BN lao nhiễm HIV chuyển từ cơ sở lao đến'}
            ];

            let _screeningTypesFormatter = function (value, row, index) {
                if (!value) {
                    return ' ';
                }
                return tb2ScreeningTypes.filter(type => type.id == value)[0].name;
            };

            return [
				
				{
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                },
                {
                    field: '',
                    title: 'STT',
                    switchable: false,
                    visible: true,                    
                    cellStyle: _cellNowra2,
					formatter: _orderFormatter
                }, {
                    field: 'screeningType',
                    title: 'Sàng lọc lao dương tính',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _screeningTypesFormatter
                },{
                    field: 'screeningDate',
                    title: 'Ngày sàng lọc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'tbDiagnosisFacility',
                    title: 'Tên cơ sở chuẩn đoán lao',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },{
                    field: 'tbDiagnosisDate',
                    title: 'Ngày chuẩn đoán',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },{
                    field: 'tbTxFacility',
                    title: 'Tên cơ sở đăng ký',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },{
                    field: 'tbTxPatientCode',
                    title: 'Mã số bệnh nhân đăng ký',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },
				{
                    field: 'tbTxStartDate',
                    title: 'Ngày bắt đầu điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
            ]
        }

        function getSubTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                // ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';

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
			let _cellNowra2 = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '70px'}
                };
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '&mdash;';
                }
                return moment(value).format('DD/MM/YYYY');
            };
			let _orderFormatter = function (value, row, index) {
                return index + 1;
            };
            return [
				
                {
                    field: '',
                    title: 'STT',
                    switchable: false,
                    visible: true,                    
                    cellStyle: _cellNowra2,
					formatter: _orderFormatter
                },
                {
                    field: 'screeningDate',
                    title: 'Ngày sàng lọc lao',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                },
            ]
        }
    }

})();