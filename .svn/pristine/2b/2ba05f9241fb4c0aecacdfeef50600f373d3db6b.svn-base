/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TBProphylaxis2Service', TBProphylaxis2Service);

    TBProphylaxis2Service.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TBProphylaxis2Service($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getLatestEntry = getLatestEntry;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.setStatus = setStatus;
        self.getTableDefinition = getTableDefinition;
		self.checkComplete=checkComplete;
		self.checkAgeByRegimen=checkAgeByRegimen;
		
		function checkAgeByRegimen(caseId,regimen) {
			
            if (!caseId) {
                return $q.when(null);
            }
			
            let url = baseUrl + 'tb_prophylaxis2/checkAgeByRegimen/' + caseId +'/'+regimen;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
		function checkComplete(tbProphylaxis2Id,tbProphylaxis2DispenseId,dose,recordDate) {
			
            if (!tbProphylaxis2Id) {
                return $q.when(null);
            }
			if(!tbProphylaxis2DispenseId){
				tbProphylaxis2DispenseId=0;
			}
            let url = baseUrl + 'tb_prophylaxis2/checkCompleteOrNotComplete/' + tbProphylaxis2Id +'/'+tbProphylaxis2DispenseId+'/'+dose+'/'+recordDate;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function setStatus(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2/setStatus/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getLatestEntry(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2/latest/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis2/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'tb_prophylaxis2/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'tb_prophylaxis2';
            entry.active = entry.active == null ? 0 : entry.active;

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'tb_prophylaxis2';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getTableDefinition() {

            let _tableOperation = function (value, row, index) {
                let ret = '<a class="green-dark margin-right-20" href="#" ng-click="$parent.editTBProphylaxis2Entry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Sửa</a>';
                ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.deleteTBProphylaxis2Entry(' + "'" + row.id + "'" + ')"><i class="icon-trash margin-right-5"></i>Xoá</a>';
				ret += '<a class="green-dark margin-right-20" href="#" ng-click="$parent.tbProphylaxisDispense2Entry(' + "'" + row.id + "'" + ')"><i class="fa fa-medkit margin-right-5"></i>Cấp thuốc</a>';
                return ret;
            };
			let _tableOperationDispense = function (value, row, index) {
                let ret = '<a title="Đang điều trị, click để ngưng điều trị"  class="green-dark margin-right-20" href="#" ng-show="' + row.dispensed + "== true " + '"   ng-click="$parent.stopEntry(' + "'" + row.id + "'" + ')"><i class="fa fa-toggle-on margin-right-5"></i>Đang điều trị</a>';
                ret += '<a title="Đã ngưng, click để quay lại điều trị"  class="green-dark margin-right-20" href="#" ng-show="' + row.dispensed + "== false " + '" ng-click="$parent.resumeEntry(' + "'" + row.id + "'" + ')"><i class="fa fa-toggle-off margin-right-5"></i>Ngưng điều trị</a>';
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
			let _cellNowra3 = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '100px','text-align':'center'}
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
			let _nameFormatter = function (value, row, index) {
				if(value!=null){
					return value.name;
				}else
					return '';
            };

            let _statusFormatter = function (value, row, index) {
                // if(value === true) {
                //     return "Hoàn thành điều trị";
                // } else if(value === false) {
                //     return "Bỏ trị";
                // } else if(value === null) {
                //     return "Chưa hoàn thành";
                // } else {
                //     return '&mdash;';
                // }
                switch (value) {
                    case 0:
                        return "Chưa bắt đầu";
                    case 1:
                        return "Đang điều trị";
                    case 2:
                        return "Ngưng điều trị";
                    case 3:
                        return "Hoàn thành điều trị";
                    case 4:
                        return "Bỏ điều trị";
                    default:
                        return '&mdash;';
                  }
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
                    field: 'startDate',
                    title: 'Ngày bắt đầu điều trị',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                },
				{
                    field: 'regimen',
                    title: 'Phác đồ',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    //formatter: _nameFormatter
                },
				{
                    field: '',
                    title: 'Đang điều trị',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperationDispense,
                    cellStyle: _cellNowra3
                },
                {
                    field: 'status',
                    title: 'Trạng thái điều trị',
                    switchable: false,
                    visible: true,                    
                    cellStyle: _cellNowrap,
					formatter: _statusFormatter
                },
				
            ]
        }
    }

})();