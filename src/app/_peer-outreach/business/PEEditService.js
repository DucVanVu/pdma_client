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
        //     //     return (value == 0) ? '<span class="text-muted">Kh??ng s??? d???ng</span>' : (value == 1) ? '<span class="text-success">??ang s??? d???ng</span>' : '';
        //     // };

        //     return [
        //         {
        //             field: 'state',
        //             checkbox: true
        //         }
        //         , {
        //             field: '',
        //             title: 'Thao t??c',
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
                    url +=     '<a href="#/prevention/pe-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-eye">Xem chi ti???t </i>';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    if(!row.parent){
                    url +=     '<a href="#/prevention/pe-add-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Th??m b???n t??nh, b???n ch??ch" tooltip-placement="auto">';
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
                    url +=     '<a href="#/prevention/pe-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deletePE(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto">';
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
                        return 'N???';
                    }
                    else if(value=='OTHER'){
                        return 'KH??C';
                    }
                }
                return '';
            };
            let _yesNoNoneFormatter = function (value, row, index) {
                if(value){
                    if(value.includes("2") || value.includes("YES")){
                        return 'C??';
                    }
                    else if(value.includes("1") || value.includes("NO")){
                        return 'Kh??ng';
                    }
                    else if(value.includes("3") || value.includes("NO_")){
                        return 'Kh??ng c?? th??ng tin';
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
                        return 'Kh??ng r??';
                    }
                    else if(value=='answer1'){
                        return '????? XN HIV';
                    }
                    else if(value=='answer2'){
                        return '????? XN giang mai';
                    }else if(value=='answer3'){
                        return '????? XN c??? HIV v?? giang mai';
                    }
                    else if(value=='answer4'){
                        return 'Do d???ch v??? PrEP chuy???n g???i XN';
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
                    res+="Th??ng "+value;
                    return res;
                }
                return '';
            };

            let _c1ReportYearFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+="N??m "+value;
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
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                },
                {
                    field: 'c1',
                    title: 'K??? b??o c??o',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _c1Formatter
                }
                , {
                    field: 'c1Staff',
                    title: 'Ng?????i b??o c??o/CBO',
                    switchable: false,
                    visible: true,
                    formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c2',
                    title: 'H??? t??n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    //formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3',
                    title: 'Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c4',
                    title: 'N??m sinh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5Ward',
                    title: '?????a ch??? n??i c?? tr??',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5District',
                    title: 'Qu???n/huy???n',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5Province',
                    title: 'T???nh/th??nh ph???',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c6',
                    title: 'Nh??m nguy c?? c???a kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    formatter: _c6Formatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c7Des',
                    title: 'C??ch ti???p c???n',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c8Des',
                    title: 'T??nh tr???ng HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c8ARVDes',
                    title: 'T??nh tr???ng ??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c9',
                    title: 'T?? v???n TBXNBT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                     field: 'c9Date',
                     title: 'Ng??y t?? v???n',
                     switchable: false,
                     visible: true,
                     formatter: _dateFormatter,
                     cellStyle: _cellNowrap
                 }, {
                    field: 'c10',
                    title: 'Cung c???p t??n BT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11',
                    title: '?????ng ?? x??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12Des',
                    title: 'Lo???i h??nh x??t nghi???m',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12Code',
                    title: 'M?? x??t nghi???m',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12NoteDes',
                    title: 'T??? x??t nghi???m cho',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c13Des',
                    title: 'K???t qu??? XN HIV l???n n??y',
                    switchable: false,
                    visible: true,
                    //formatter: _c17Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131',
                    title: 'Chuy???n XN kh???ng ?????nh',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131Code',
                    title: 'M?? s??? XN kh???ng ?????nh',
                    switchable: false,
                    visible: true,
                    //formatter: _c5Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131ResultDes',
                    title: 'K???t qu??? XN kh???ng ?????nh',
                    switchable: false,
                    visible: true,
                    //formatter: _c5NoteFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14',
                    title: '??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Date',
                    title: 'Ng??y ??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Code',
                    title: 'M?? kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c14Name',
                    title: 'T??n c?? s??? ??i???u tr???',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15',
                    title: '??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Date',
                    title: 'Ng??y ??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Code',
                    title: 'M?? kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    //formatter: _c11bFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c15Name',
                    title: 'T??n c?? s??? ??i???u tr???',
                    switchable: false,
                    visible: true,
                    //formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c16Des',
                    title: 'K???t qu??? x??c minh',
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
                    title: 'Ghi ch??',
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