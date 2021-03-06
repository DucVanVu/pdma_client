/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SNS').service('SNSService', SNSService);

    SNSService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function SNSService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getEntry = getEntry;
        self.getMaxSeq = getMaxSeq;
        self.getAllEntries = getAllEntries;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;
        self.deleteIdNumber=deleteIdNumber;
        self.checkCode=checkCode;
        self.checkCodeMulti=checkCodeMulti;
        self.getTableDefinition = getTableDefinition;
        self.findByCode=findByCode;
        self.exportList=exportList;
        self.getAdminUnit=getAdminUnit;
        self.getReport=getReport;
        self.exportReport=exportReport;
        self.getListWriteAbleSNS=getListWriteAbleSNS;

        function getListWriteAbleSNS() {
            let url = baseUrl + 'sns/get_list_sns_write_able';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function exportReport(filterReport) {
            let url = baseUrl + 'sns/exportReport';
            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filterReport,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }

        function getReport(reportFilter, successCallback, errorCallback) {
            let url = baseUrl + 'sns/report';

            return utils.resolveAlt(url, 'POST', null, reportFilter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'sns/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getMaxSeq(orgId) {
            if (!orgId) {
                return $q.when(null);
            }
            let url = baseUrl + 'sns/maxseq/' + orgId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }


        function getAllEntries(filter) {

            let url = baseUrl + 'sns/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'sns';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(id, successCallback, errorCallback) {
            let url = baseUrl + 'sns/'+id;
            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteIdNumber(id, successCallback, errorCallback) {
            let url = baseUrl + 'sns_case_id_number/'+id;
            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function checkCode(checkCodeDto) {
            let url = baseUrl + 'sns/checkCode';

            return utils.resolveAlt(url, 'POST', null, checkCodeDto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function checkCodeMulti(listCheckCodeDto) {
            let url = baseUrl + 'sns/checkCodeMulti';
            return utils.resolveAlt(url, 'POST', null, listCheckCodeDto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function findByCode(couponCode) {
            let url = baseUrl + 'sns/findByCode/'+couponCode+'/';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function exportList(f) {
            let url = baseUrl + 'sns/export';
            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: f,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }
        function getAdminUnit(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTableDefinition(shouldDisplayCheckbox,isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let url = '';
                if(!isSiteManager){
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/sns-edit/'+ row.id +'" class="btn btn-sm btn-primary no-border margin-right-20" tooltip-placement="auto">';
                    url +=          '<i class="icon-frame margin-right-5"></i>Xem chi ti???t ';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/sns-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deleteSNS(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto">';
                    url +=         '<i class="fa fa-trash"></i>';
                    url +=     '</a>';
                    url += '</div>';
                }

//                url += '<a ui-tooltip="S???a" class="green-dark margin-right-20" href="#" data-ng-click="$parent.editSNS(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5 margin-left-5"></i></a>';
//                url += '<a ui-tooltip="X??a" class="green-dark margin-right-20" href="#" data-ng-click="$parent.deleteSNS(' + "'" + row.id + "'" + ')"><i class="fa fa-trash margin-right-15 margin-left-5"></i></a>';
                
                return url;
            };

            let _tableOpStyle = function (value, row, index, field) {
                return {
                    classes: '',
                    css: {'white-space': 'nowrap', 'width': '50px'}
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
            let _genderFormatter = function (value, row, index) {
                if(value){
                    if(value=='MALE'){
                        return 'NAM';
                    }
                    else if(value=='FEMALE'){
                        return 'N???';
                    }
                    else if(value=='OTHER'){
                        return 'KH??C';
                    }
                }
                return '';
            };
            let _riskGroupFormatter = function (value, row, index) {
                if(value){
                    if(value=='MSM'){
                        return 'MSM';
                    }
                    else if(value=='NCH'){
                        return 'B???n t??nh/b???n ch??ch NCH';
                    }
                    else if(value=='MD'){
                        return 'M???i d??m';
                    }
                    else if(value=='OTHER'){
                        return 'Nh??m kh??c';
                    }
                    else if(value=='TCMT'){
                        return 'Ti??m ch??ch ma t??y';
                    }
                }
                return '';
            };
            let _hivStatusFormatter = function (value, row, index) {
                if(value){
                    if(value=='positive'){
                        return 'D????ng t??nh';
                    }
                    else if(value=='negative'){
                        return '??m t??nh';
                    }
                    else if(value=='undefined'){
                        return 'Kh??ng x??c ?????nh';
                    }
                    else if(value=='notest'){
                        return 'Kh??ng l??m x??t nghi???m';
                    }
                }
                return '';
            };
            let _customerSourceFormatter = function (value, row, index) {
                if(value){
                    if(value=='SNS'){
                        return 'SNS';
                    }
                    else if(value=='VCT_OPC'){
                        return 'VCT/OPC';
                    }
                    else if(value=='CBOs'){
                        return 'CBOs';
                    }
                    else if(value=='OTHER'){
                        return 'Kh??c/t??? ?????n';
                    }
                }
                return '';
            };
            let _approachMethodFormatter = function (value, row, index) {
                if(value){
                    if(value=='direct'){
                        return 'Tr???c ti???p';
                    }
                    else if(value=='online'){
                        return 'Tr???c tuy???n';
                    }
                }
                return '';
            };
            let _orderFormatter = function (value, row, index) {
                return index + 1;
            };

            let _parentCodeFormat = function (value, row, index) {
                if(value && value.couponCode){
                    return value.couponCode;
                }
                return '';
            }

            let columns = [
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
                    cellStyle: _tableOpStyle
                }
                ,{
                    field: '',
                    title: 'STT',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
					formatter: _orderFormatter
                }
                , {
                    field: 'parent',
                    title: 'M?? KH/CTV gi???i thi???u',
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _parentCodeFormat
                }
                , {
                    field: 'couponCode',
                    title: 'M?? KH/CTV',
                    switchable: true,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'name',
                    title: 'H??? t??n kh??ch h??ng/CTV',
                    switchable: false,
                    visible: true,
//                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'yearOfBirth',
                    title: 'N??m sinh',
                    switchable: false,
                    visible: true,
//                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'gender',
                    title: 'Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'idNumberType',
                    title: 'Lo???i gi???y t??? t??y th??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'idNumber',
                    title: 'S??? th??? gi???y t??? t??y th??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'riskGroup',
                    title: 'Nh??m nguy c??',
                    switchable: false,
                    visible: true,
                    formatter: _riskGroupFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'firstTimeVisit',
                    title: 'Ng??y gi???i thi???u d???ch v??? SNS',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'customerSource',
                    title: 'Ngu???n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    formatter: _customerSourceFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'approachMethod',
                    title: 'H??nh th???c ti???p c???n',
                    switchable: false,
                    visible: true,
                    formatter: _approachMethodFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'testDate',
                    title: 'Ng??y x??t nghi???m HIV l???n n??y',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'hivStatus',
                    title: 'T??nh tr???ng HIV',
                    switchable: false,
                    visible: true,
                    formatter: _hivStatusFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'prepDate',
                    title: 'Ng??y ????ng k?? s??? d???ng PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                     field: 'arvDate',
                     title: 'Ng??y ????ng k?? ??i???u tr??? ARV',
                     switchable: false,
                     visible: true,
                     formatter: _dateFormatter,
                     cellStyle: _cellNowrap
                }
                , {
                    field: 'totalCoupon',
                    title: 'T???ng s??? th??? m???i ph??t cho CTV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'orderCoupon',
                    title: 'S??? th??? t??? th??? m???i',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
            ];

            if (!shouldDisplayCheckbox) {
                columns.shift(); // remove the state column
            }

            return columns;
        }
    }

})();