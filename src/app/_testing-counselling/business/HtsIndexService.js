/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.HTS').service('HtsIndexService', HtsIndexService);

    HtsIndexService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function HtsIndexService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getAllEntries=getAllEntries;
        self.deleteEntries=deleteEntries;
        self.getListStaff=getListStaff;
        self.exportHTS=exportHTS;
        self.getEntry=getEntry;
        self.updateC24=updateC24;
        self.getAdminisByGsoCode=getAdminisByGsoCode;
        self.getAllOrganizations=getAllOrganizations;
        self.getAdminUnit = getAdminUnit;
        
        function getAdminisByGsoCode(code) {
            let url = baseUrl + 'admin_unit/gsocode/'+code;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function exportHTS(filterReport) {
            let url = baseUrl + 'htscase/export';
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
        
        function getListStaff(org) {
            let url = baseUrl + 'staff/list';
            return utils.resolveAlt(url, 'POST', null, org, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function deleteEntries(id, successCallback, errorCallback) {
            let url = baseUrl + 'htscase/'+id;
            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getAllEntries(filter) {

            let url = baseUrl + 'htscase/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        };
        function getEntry(id){
            if (!id) {
                return $q.when(null);
            }
            let url = baseUrl + 'htscase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function updateC24(dto){
            let url = baseUrl + 'htscase/updateC24';
            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getAllOrganizations(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getAdminUnit(){
            let url = baseUrl + 'admin_unit/provinceByUser';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        
        function getTableDefinition(isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let tag = '';
                if(!isSiteManager){
                    tag += '<div class="opc-toolbar">';
                    tag +=     '<a href="#/prevention/hts-edit/'+ row.id +'" class="btn btn-sm btn-primary no-border margin-right-20" tooltip-placement="auto">';
                    tag +=          '<i class="icon-frame margin-right-5"></i>Xem chi ti???t ';
                    tag +=     '</a>';
                    tag += '</div>';
                }else{
                    tag += '<div class="opc-toolbar">';
                    tag +=     '<a data-ng-click="$parent.updateHTS(' + "'" + row.id + "'" + ')" href="#" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="C???p nh???t ca d????ng t??nh" tooltip-placement="auto">';
                    tag +=          '<i class="fa fa-get-pocket"></i>';
                    tag +=     '</a>';
                    tag +=     '<div class="vertical-seperator shorter float-right"></div>';
                    tag +=     '<a href="#/prevention/hts-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    tag +=          '<i class="icon-pencil"></i>';
                    tag +=     '</a>';
                    tag +=     '<div class="vertical-seperator shorter float-right"></div>';
                    tag +=     '<a data-ng-click="$parent.deleteHTS(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto">';
                    tag +=         '<i class="fa fa-trash"></i>';
                    tag +=     '</a>';
                    tag += '</div>';
                }
                
                return tag;
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
                    if(value == "2" || value == "YES"){
                        return 'C??';
                    }
                    else if(value == "1" || value == "NO"){
                        return 'Kh??ng';
                    }
                    else if(value == "3" || value == "NO_INFORMATION"){
                        return 'Ch??a c?? th??ng tin';
                    }
                }
                return '';
            };

            let _cellNowrap = function (value, row, index, field) {
                // if(row.notComplete==true && (row.canNotComplete==null || row.canNotComplete==false)){
                //     return {
                //         classes: '',
                //         css: {'background-color':'yellow','white-space': 'nowrap'}
                //     };
                // }else{
                //     return {
                //         classes: '',
                //         css: {'white-space': 'nowrap'}
                //     };
                // }
                if(row.c2.canNotBeCompleted) {
                    if(row.notComplete==true && (row.canNotComplete==null || row.canNotComplete==false)){
                        return {
                            classes: '',
                            css: {'background-color':'yellow','white-space': 'nowrap'}
                        };
                    }else{
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap'}
                        };
                    }
                } else {
                    if(row.notComplete==true) {
                        return {
                            classes: '',
                            css: {'background-color':'yellow','white-space': 'nowrap'}
                        };
                    } else{
                        return {
                            classes: '',
                            css: {'white-space': 'nowrap'}
                        };
                    }
                }
                // if(row.notComplete==true && (row.canNotComplete==null || row.canNotComplete==false)){
                //     return {
                //         classes: '',
                //         css: {'background-color':'yellow','white-space': 'nowrap'}
                //     };
                // }else{
                //     return {
                //         classes: '',
                //         css: {'white-space': 'nowrap'}
                //     };
                // }
                
            };

            let _dateFormatter = function (value, row, index) {
                if (!value) {
                    return '';
                }
                return moment(value).format('DD/MM/YYYY');
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
            let _c26Formatter = function (value, row, index) {
                if (value) {
                    if(value.includes("-1")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return '??m t??nh';
                    }
                    else if(value.includes("2")){
                        return 'D????ng t??nh';
                    }else if(value.includes("3")){
                        return 'Kh??ng l??m x??t nghi???m Giang mai';
                    }
                }
                return '';
            };
            let _c14Formatter = function (value, row, index) {
                if (value) {
                    if(value.includes("-1")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return '??m t??nh';
                    }
                    else if(value.includes("2")){
                        return 'D????ng t??nh';
                    }else if(value.includes("3")){
                        return 'Kh??ng x??c ?????nh';
                    }else if(value.includes("4")){
                        return 'Kh??ng l??m x??t nghi???m';
                    }
                }
                return '';
            };
            let _c24Formatter = function (value, row, index) {
                if (value) {
                    if(value.includes("-1")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Kh??ch h??ng d????ng t??nh m???i';
                    }
                    else if(value.includes("2")){
                        return 'Kh??ch h??ng d????ng t??nh c??';
                    }else if(value.includes("3")){
                        return '??ang ch??? k???t qu??? x??c minh';
                    }
                }
                return '';
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
            let _c5Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Khoa ph??ng b???nh vi???n (kh??ng bao g???m PKNT HIV)';
                    }
                    else if(value.includes("2")){
                        return 'C?? s??? TVXN HIV (VCT, PKNT, MMT, PrEP, tr???i giam)';
                    }
                }
                return '';
            };
            let _c5NoteFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'T?? v???n x??t nghi???m t??? nguy???n (VCT)';
                    }
                    else if(value.includes("2")){
                        return 'TVXN HIV t???i ph??ng kh??m ngo???i tr??';
                    } else if(value.includes("3")){
                        return 'TVXN HIV t???i c?? s??? ??i???u tr??? Methadone';
                    }
                    else if(value.includes("4")){
                        return 'TVXN HIV t???i c?? s??? ??i???u tr??? PrEP';
                    }
                    else if(value.includes("5")){
                        return 'Khoa ph??ng b???nh vi???n (kh??ng bao g???m PKNT HIV)';
                    }
                    else if(value.includes("6")){
                        return 'TVXN HIV t???i tr???i giam, tr???i t???m giam';
                    }
                }
                return '';
            };
            let _c9Formatter= function (value, row, index) {
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
            let _c10Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Kh??ch h??ng t??? ?????n';
                    }
                    else if(value.includes("2")){
                        return 'D???ch v??? TBXNBT/BC c???a ng?????i c?? HIV';
                    }else if(value.includes("3")){
                        return 'Ch????ng tr??nh ti???p c???n c???ng ?????ng';
                    }else if(value.includes("4")){
                        return 'Kh??c';
                    }
                }
                return '';
            };
            let _c11aFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'D???ch mi???ng';
                    }
                    else if(value.includes("2")){
                        return 'M??u mao m???ch ?????u ng??n tay';
                    }else if(value.includes("3")){
                        return 'Kh??c';
                    }
                }
                return '';
            };
            let _c11bFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'T??? l??m x??t nghi???m';
                    }
                    else if(value.includes("2")){
                        return 'X??t nghi???m do nh??m c???ng ?????ng th???c hi???n';
                    }else if(value.includes("3")){
                        return 'X??t nghi???m do y t??? x??/ph?????ng th???c hi???n';
                    }
                }
                return '';
            };
            let _c12Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Ch??a bao gi??? XN HIV';
                    }
                    else if(value.includes("2")){
                        return 'C??, k???t qu??? XN ??m t??nh';
                    }else if(value.includes("3")){
                        return 'C??, k???t qu??? XN d????ng t??nh';
                    }else if(value.includes("4")){
                        return 'C??, kh??ng x??c ?????nh ho???c kh??ng bi???t k???t qu??? XN';
                    }
                }
                return '';
            };
            let _c131Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return '??? 12 th??ng';
                    }
                    else if(value.includes("2")){
                        return '> 12 th??ng';
                    }
                }
                return '';
            };
            let _c132Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Ch??a bao gi??? ??i???u tr??? ARV';
                    }
                    else if(value.includes("2")){
                        return '??ang ??i???u tr??? ARV';
                    }
                    else if(value.includes("3")){
                        return '???? b??? ??i???u tr??? ARV';
                    }
                }
                return '';
            };
            let _c17Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'M???i nhi???m HIV';
                    }
                    else if(value.includes("2")){
                        return 'Nhi???m HIV ???? l??u';
                    }else if(value.includes("3")){
                        return 'Kh??ng l??m XN m???i nhi???m';
                    }
                }
                return '';
            };
            let _c18Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return '< 1.000 b???n sao/ml';
                    }
                    else if(value.includes("2")){
                        return '??? 1.000 b???n sao/ml';
                    }else if(value.includes("3")){
                        return 'Kh??ng l??m XN t???i l?????ng vi-r??t';
                    }else if(value.includes("4")){
                        return '??ang ch??? k???t qu??? XN t???i l?????ng vi-r??t';
                    }
                }
                return '';
            };
            let _c20Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Kh??ng r??';
                    }
                    else if(value.includes("1")){
                        return 'Ch??a c?? th??ng tin';
                    }
                    else if(value.includes("2")){
                        return 'Kh??ng';
                    }else if(value.includes("3")){
                        return 'C??';
                    }
                }
                return '';
            };
            let _addressDistrictFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+=value.name;
                    if(value.parent){
                        res+=" - "+value.parent.name;
                    }
                    return res;
                }
                return '';
            };
            let _addressCommuneFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+=value.name;
                    return res;
                }
                return '';
            };
            let _dictionaryFormatter= function (value, row, index) {
                let res="";
                if (value) {
                    res+=value.value;
                    return res;
                }
                return '';
            };

            //
            // let _activeFormatter = function (value, row, index) {
            //     return (value == 0) ? '<span class="text-muted">Kh??ng s??? d???ng</span>' : (value == 1) ? '<span class="text-success">??ang s??? d???ng</span>' : '';
            // };

            // return [
            //     {
            //         field: 'state',
            //         checkbox: true
            //     }
            //     , {
            //         field: '',
            //         title: 'Thao t??c',
            //         switchable: true,
            //         visible: true,
            //         formatter: _tableOperation,
            //         cellStyle: _cellNowrap
            //     }
            // ]
            let columns = [
                // {
                //     field: 'state',
                //     checkbox: true
                // }
                // , 
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3',
                    title: 'H??? t??n t?? v???n vi??n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'c6',
                    title: 'M?? s??? kh??ch h??ng',
                    switchable: false,
                    visible: true,
//                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c7',
                    title: 'Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c14',
                    title: 'KQ XN HIV l???n n??y',
                    switchable: false,
                    visible: true,
                    formatter: _c14Formatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c8',
                    title: 'N??m sinh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c4',
                    title: 'T?? v???n tr?????c XN',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c24',
                    title: 'K???t qu??? x??c minh ca HIV d????ng t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _c24Formatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c26',
                    title: 'KQ XN s??ng l???c Giang mai',
                    switchable: false,
                    visible: true,
                    formatter: _c26Formatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c25',
                    title: 'BT m???c GM gi???i thi???u',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c15Date',
                    title: 'Quay l???i nh???n KQXN',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c15',
                    title: 'T?? v???n sau XN',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1627',
                    title: 'Gi???i thi???u ??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1627Note',
                    title: 'T??n c?? s??? ??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                     field: 'c1627Date',
                     title: 'Ng??y ??i???u tr??? PrEP',
                     switchable: false,
                     visible: true,
                     formatter: _dateFormatter,
                     cellStyle: _cellNowrap
                 }, {
                    field: 'c20',
                    title: 'Nh???n d???ch v??? ??i???u tr??? HIV',
                    switchable: false,
                    visible: true,
                    formatter: _c20Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c20Org',
                    title: 'T??n c?? s??? ??i???u tr??? HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c20RegDate',
                    title: 'Ng??y ??i???u tr??? HIV',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c20Code',
                    title: 'M?? s??? ??i???u tr???',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c20Reason',
                    title: 'L?? do kh??ng ??i???u tr??? HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c17',
                    title: 'KQXN m???i nhi???m HIV',
                    switchable: false,
                    visible: true,
                    formatter: _c17Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c18',
                    title: 'KQXN t???i l?????ng vi-r??t',
                    switchable: false,
                    visible: true,
                    formatter: _c18Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5',
                    title: 'Lo???i h??nh d???ch v??? TVXN HIV',
                    switchable: false,
                    visible: true,
                    formatter: _c5Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5Note',
                    title: 'Ghi r?? c?? s??? TVXN HIV',
                    switchable: false,
                    visible: true,
                    formatter: _c5NoteFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9',
                    title: 'Nh??m nguy c?? c???a kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    formatter: _c9Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c10',
                    title: 'Ngu???n gi???i thi???u/chuy???n g???i',
                    switchable: false,
                    visible: true,
                    formatter: _c10Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c10Note',
                    title: 'Th??ng tin li??n quan',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11',
                    title: '???? c?? KQXN ph???n ???ng',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11a',
                    title: 'C?? ph???n ???ng v???i',
                    switchable: false,
                    visible: true,
                    formatter: _c11aFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11aNote',
                    title: 'Ghi r??',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11b',
                    title: 'H??nh th???c TVXNHIV',
                    switchable: false,
                    visible: true,
                    formatter: _c11bFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11c',
                    title: 'C?? phi???u chuy???n g???i',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c11cNote',
                    title: 'M?? s??? TVXN c???ng ?????ng',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c12',
                    title: 'KQXN HIV l???n g???n nh???t',
                    switchable: false,
                    visible: true,
                    formatter: _c12Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c131',
                    title: 'Th???i gian XN g???n nh???t',
                    switchable: false,
                    visible: true,
                    formatter: _c131Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c132',
                    title: 'T??nh tr???ng ??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                    formatter: _c132Formatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c19',
                    title: 'T??n ph??ng XN kh???ng ?????nh HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c19Date',
                    title: 'Ng??y XN kh???ng ?????nh',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c19Note',
                    title: 'M?? s??? XN kh???ng ?????nh HIV',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c21',
                    title: 'T?? v???n TBXNBT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c21Date',
                    title: 'Ng??y t?? v???n',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c22',
                    title: '?????ng ?? nh???n d???ch v???',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23FullName',
                    title: 'H??? t??n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23Ethnic',
                    title: 'D??n t???c',
                    switchable: false,
                    visible: true,
                    formatter: _dictionaryFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23Profession',
                    title: 'Ngh??? nghi???p ch??nh c???a kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    formatter: _dictionaryFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23HealthNumber',
                    title: 'S??? th??? BHYT',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                },{
                    field: 'c23IdNumber',
                    title: 'S??? CMND/CCCD',
                    switchable: false,
                    visible: true,
                    // formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23PhoneNumber',
                    title: '??i???n tho???i',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23ResidentAddressDetail',
                    title: '?????a ch??? n??i ????ng k?? h??? kh???u',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23ResidentAddressWard',
                    title: 'Ph?????ng/x??',
                    switchable: false,
                    visible: true,
                    //formatter: _addressCommuneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23ResidentAddressDistrict',
                    title: 'Qu???n/huy???n',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23ResidentAddressProvince',
                    title: 'T???nh/th??nh ph???',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23CurrentAddressDetail',
                    title: '?????a ch??? n??i c?? tr??',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23CurrentAddressWard',
                    title: 'Ph?????ng/x??',
                    switchable: false,
                    visible: true,
                    //formatter: _addressCommuneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23CurrentAddressDistrict',
                    title: 'Qu???n/huy???n',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c23CurrentAddressProvince',
                    title: 'T???nh/th??nh ph???',
                    switchable: false,
                    visible: true,
                    formatter: _addressDistrictFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c28',
                    title: 'L?? do ?????n c?? s???',
                    switchable: false,
                    visible: true,
                    formatter: _c28Formatter,
                    cellStyle: _cellNowrap
               }, {
                    field: 'c23Note',
                    title: 'Ghi ch?? (n???u c??)',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'totalIsTestedHiv',
                    title: 'T???ng s??? b???n t??nh, b???n ch??ch ???? l??m x??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'totalHivPositiveResult',
                    title: 'T???ng s??? b???n t??nh, b???n ch??ch c?? KQXN HIV d????ng t??nh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'note',
                    title: 'Ghi ch??',
                    switchable: false,
                    visible: true,
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