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
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';

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
                {id: 'upon_registration_of_the_treatment_facility', name: 'Khi ????ng k?? CS??T'},
                {id: 'during_the_management_of_the_Treatment_Facility', name: 'Trong qu?? tr??nh qu???n l?? CS??T'},
                {id: 'patients_with_suspected_TB_visit_a_TB_facility', name: 'BN nghi lao ?????n kh??m c?? s??? lao (do c?? s??? HIV chuy???n ho???c BN t??? ?????n)'},
                {id: 'HIV_infected_TB_patient_transferred_from_a_TB_facility', name: 'BN lao nhi???m HIV chuy???n t??? c?? s??? lao ?????n'}
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
                    title: 'Thao t??c',
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
                    title: 'S??ng l???c lao d????ng t??nh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _screeningTypesFormatter
                },{
                    field: 'screeningDate',
                    title: 'Ng??y s??ng l???c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }, {
                    field: 'tbDiagnosisFacility',
                    title: 'T??n c?? s??? chu???n ??o??n lao',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },{
                    field: 'tbDiagnosisDate',
                    title: 'Ng??y chu???n ??o??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },{
                    field: 'tbTxFacility',
                    title: 'T??n c?? s??? ????ng k??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },{
                    field: 'tbTxPatientCode',
                    title: 'M?? s??? b???nh nh??n ????ng k??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                },
				{
                    field: 'tbTxStartDate',
                    title: 'Ng??y b???t ?????u ??i???u tr???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
            ]
        }

        function getSubTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>S???a</a>';
                // ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBTreatment2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xo??</a>';

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
                    title: 'Ng??y s??ng l???c lao',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _tableOperationCellStyle
                },
            ]
        }
    }

})();