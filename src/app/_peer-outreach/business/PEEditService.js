/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PeerOutreach').service('PEEditService', PEEditService);

    PEEditService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PEEditService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;
        self.getDictionary=getDictionary;
        self.getEntry=getEntry;
        self.getListPeWriteAble=getListPeWriteAble;
        self.getListStaff=getListStaff;
        self.getAdminUnit=getAdminUnit;
        self.saveEntry=saveEntry;
        self.getTableDefinition = getTableDefinition;
        self.checkCode=checkCode;
        self.updateC24=updateC24;
        function getDictionary (type){
            if (!type) {
                return $q.when(null);
            }
            let filter={
                type:type
            }
            let url = baseUrl + 'dictionary/all';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getEntry(id){
            if (!id) {
                return $q.when(null);
            }
            let url = baseUrl + 'pecase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        
        function getListPeWriteAble(){
            let url = baseUrl + 'pecase/get_list_pe_write_able';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function getListStaff(org) {
            let url = baseUrl + 'staff/list';
            return utils.resolveAlt(url, 'POST', null, org, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getAdminUnit(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function saveEntry(entry){
            let url = baseUrl + 'pecase/';
            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function checkCode(checkCodeDto) {
            let url = baseUrl + 'htscase/checkCode';

            return utils.resolveAlt(url, 'POST', null, checkCodeDto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function updateC24(dto){
            let url = baseUrl + 'htscase/updateC24';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        // function getTableDefinition() {

        //     let _tableOperation = function (value, row, index) {
        //         return '<a class="green-dark margin-right-20" href="#" data-ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Edit</a>';
        //     };

        //     let _cellNowrap = function (value, row, index, field) {
        //         return {
        //             classes: '',
        //             css: {'white-space': 'nowrap'}
        //         };
        //     };

        //     //
        //     // let _activeFormatter = function (value, row, index) {
        //     //     return (value == 0) ? '<span class="text-muted">Không sử dụng</span>' : (value == 1) ? '<span class="text-success">Đang sử dụng</span>' : '';
        //     // };

        //     return [
        //         {
        //             field: 'state',
        //             checkbox: true
        //         }
        //         , {
        //             field: '',
        //             title: 'Thao tác',
        //             switchable: true,
        //             visible: true,
        //             formatter: _tableOperation,
        //             cellStyle: _cellNowrap
        //         }
        //     ]
        // }
        function getTableDefinition(isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let url = '';
                if(!isSiteManager){
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pe-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Sửa" tooltip-placement="auto">';
                    url +=          '<i class="icon-eye">Xem chi tiết </i>';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    if(!row.parent){
                    url +=     '<a href="#/prevention/pe-add-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Thêm bạn tình, bạn chích" tooltip-placement="auto">';
                    url +=          '<i class="icon-plus"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    }
                    else{
                    url +=     '<a  class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="" tooltip-placement="auto">';
                    url +=          '<i class="fa fa-fw fa-angle-right"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    }
                    url +=     '<a href="#/prevention/pe-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Sửa" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deletePE(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Xóa" href="#" tooltip-placement="auto">';
                    url +=         '<i class="fa fa-trash"></i>';
                    url +=     '</a>';
                    url += '</div>';
                }
                
                return url;
                //return '<a class="green-dark margin-right-20" href="#" data-ng-click="$parent.editEntry(' + "'" + row.id + "'" + ')"><i class="icon-pencil margin-right-5"></i>Edit</a>';
            };
            
            let _genderFormatter = function (value, row, index) {
                if(value){
                    if(value=='MALE'){
                        return 'NAM';
                    }
                    else if(value=='FEMALE'){
                        return 'NỮ';
                    }
                    else if(value=='OTHER'){
                        return 'KHÁC';
                    }
                }
                return '';
            };
            let _yesNoNoneFormatter = function (value, row, index) {
                if(value){
                    if(value.includes("2") || value.includes("YES")){
                        return 'Có';
                    }
                    else if(value.includes("1") || value.includes("NO")){
                        return 'Không';
                    }
                    else if(value.includes("3") || value.includes("NO_")){
                        return 'Không có thông tin';
                    }
                }
                return '';
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

            let _c1Formatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('MM/YYYY');
            };

            let _nameFormatter = function (value, row, index) {
                if (value) {             
                        if(value.fullName){
                            return value.fullName;
                        }
                        return ""; 
                }
                return "";
            };
            
            let _c28Formatter = function (value, row, index) {
                if (value) {
                    if(value=='UNKNOWN'){
                        return 'Không rõ';
                    }
                    else if(value=='answer1'){
                        return 'Để XN HIV';
                    }
                    else if(value=='answer2'){
                        return 'Để XN giang mai';
                    }else if(value=='answer3'){
                        return 'Để XN cả HIV và giang mai';
                    }
                    else if(value=='answer4'){
                        return 'Do dịch vụ PrEP chuyển gửi XN';
                    }
                }
                return '';
            };
            
            let _c6Formatter= function (value, row, index) {
                let res="";
                if (value && value.length>0) {
                    for(let item of value){
                        if(item.name){
                            res+=","+item.name;
                        }
                    }
                    if(res.length>0){
                        res = res.substr(1);
                    }
                    return res;
                }
                return '';
            };

            let _c1ReportFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+="Tháng "+value;
                    return res;
                }
                return '';
            };

            let _c1ReportYearFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+="Năm "+value;
                    return res;
                }
                return '';
            };
            
            let _addressDistrictFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+=value.name;
                    return res;
                }
                return '';
            };
            

            
            let columns = [
                {
                    field: '',
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                },
                {
                    field: 'c1',
                    title: 'Kỳ báo cáo',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _c1Formatter
                }
                , {
                    field: 'c1Staff',
                    title: 'Người báo cáo/CBO',
                    switchable: false,
                    visible: true,
                    formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c2',
                    title: 'Họ tên khách hàng',
                    switchable: false,
                    visible: true,
                    //formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3',
                    title: 'Giới tính',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c4',
                    title: 'Năm sinh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5Ward',
                    title: 'Địa chỉ nơi cư trú',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5District',
                    title: 'Quận/huyện',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5Province',
                    title: 'Tỉnh/thành phố',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c6',
                    title: 'Nhóm nguy cơ của khách hàng',
                    switchable: false,
                    visible: true,
                    formatter: _c6Formatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c7Des',
                    title: 'Cách tiếp cận',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c8Des',
                    title: 'Tình trạng HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c8ARVDes',
                    title: 'Tình trạng điều trị ARV',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c9',
                    title: 'Tư vấn TBXNBT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                     field: 'c9Date',
                     title: 'Ngày tư vấn',
                     switchable: false,
                     visible: true,
                     formatter: _dateFormatter,
                     cellStyle: _cellNowrap
                 }, {
                    field: 'c10',
                    title: 'Cung cấp tên BT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11',
                    title: 'Đồng ý xét nghiệm HIV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12Des',
                    title: 'Loại hình xét nghiệm',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12Code',
                    title: 'Mã xét nghiệm',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12NoteDes',
                    title: 'Tự xét nghiệm cho',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c13Des',
                    title: 'Kết quả XN HIV lần này',
                    switchable: false,
                    visible: true,
                    //formatter: _c17Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131',
                    title: 'Chuyển XN khẳng định',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131Code',
                    title: 'Mã số XN khẳng định',
                    switchable: false,
                    visible: true,
                    //formatter: _c5Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131ResultDes',
                    title: 'Kết quả XN khẳng định',
                    switchable: false,
                    visible: true,
                    //formatter: _c5NoteFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14',
                    title: 'Điều trị PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Date',
                    title: 'Ngày điều trị PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Code',
                    title: 'Mã khách hàng',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Name',
                    title: 'Tên cơ sở điều trị',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15',
                    title: 'Điều trị ARV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Date',
                    title: 'Ngày điều trị ARV',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Code',
                    title: 'Mã khách hàng',
                    switchable: false,
                    visible: true,
                    //formatter: _c11bFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Name',
                    title: 'Tên cơ sở điều trị',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c16Des',
                    title: 'Kết quả xác minh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c132Des',
                    title: 'KQXN SL giang mai',
                    switchable: false,
                    visible: true,
                    //formatter: _c132Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c17',
                    title: 'Ghi chú',
                    switchable: false,
                    visible: true,
                    // formatter: _c131Formatter,
                    cellStyle: _cellNowrap
                }

            ];

            // if (!shouldDisplayCheckbox) {
            //     columns.shift(); // remove the state column
            // }

            return columns;
        }
    }

})();