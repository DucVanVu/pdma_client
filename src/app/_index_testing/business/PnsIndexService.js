/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').service('PnsIndexService', PnsIndexService);

    PnsIndexService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PnsIndexService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getTableDefinition = getTableDefinition;
        self.getTableDefinitionContact = getTableDefinitionContact;
        self.getAllEntries=getAllEntries;
        self.getAllEntriesContact=getAllEntriesContact;
        self.deleteEntries=deleteEntries;
        self.getListStaff=getListStaff;
        self.exportPNS=exportPNS;
        self.getEntry=getEntry;
        self.getAllOrganizations=getAllOrganizations;
        self.searchHTS=searchHTS;
        self.searchOPC=searchOPC;
        self.checkHTSOPC=checkHTSOPC;
        self.getAdminUnit = getAdminUnit;
        self.deleteContactEntry=deleteContactEntry;
//        self.updateC24=updateC24;

        function searchHTS(filter) {
            let url = baseUrl + 'htscase/list';
            return utils.resolveAlt(url, 'POST', null, filter, {
            'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function searchOPC(filter) {
            let url = baseUrl + 'case/list';
            return utils.resolveAlt(url, 'POST', null, filter, {
            'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function exportPNS(filterReport) {
            let url = baseUrl + 'pnscase/export';
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
            let url = baseUrl + 'pnscase/'+id;
            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function getAllEntries(filter) {

            let url = baseUrl + 'pnscase/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        };
        function getAllEntriesContact(filter) {

            let url = baseUrl + 'pnscase_contact/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        };
        function getEntry(id){
            if (!id) {
                return $q.when(null);
            }
            let url = baseUrl + 'pnscase/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        };
        function getAllOrganizations(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function checkHTSOPC(checkHTSOPCDto) {
            let url = baseUrl + 'pnscase/checkHTSOrOpc';

            return utils.resolveAlt(url, 'POST', null, checkHTSOPCDto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getAdminUnit(){
            let url = baseUrl + 'admin_unit/provinceByUser';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        function deleteContactEntry(id, successCallback, errorCallback) {
            let url = baseUrl + 'pnscase_contact/'+id;
            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
//        function updateC24(dto){
//            let url = baseUrl + 'pnscase/updateC24';
//            return utils.resolveAlt(url, 'POST', null, dto, {
//                'Content-Type': 'application/json; charset=utf-8'
//            }, angular.noop, angular.noop);
//        }
        function getTableDefinition(isSiteManager) {

            let _tableOperation = function (value, row, index) {
                let url = '';
                
                if(!isSiteManager){
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit/'+ row.id +'" class="btn btn-sm btn-primary no-border margin-right-20" tooltip-placement="auto">';
                    url +=          '<i class="icon-frame margin-right-5"></i>Xem chi ti???t ';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deletePNS(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto">';
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
                    title: 'C3. H??? t??n t?? v???n vi??n: ',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'c7',
                    title: 'C7. H??? t??n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
//                    formatter: _nameFormatter
                }
                , {
                    field: 'c8',
                    title: 'C8. Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c9',
                    title: 'C9. N??m sinh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5',
                    title: 'C5. Ng??y t?? v???n d???ch v???',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c6',
                    title: 'C6. ?????ng ?? nh???n d???ch v??? TBXNBT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }

                , {
                    field: 'c6Date',
                    title: 'Ng??y ?????ng ?? nh???n d???ch v???',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c10',
                    title: 'C10. Ng??y XN kh???ng ?????nh HIV+',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c11Des',
                    title: 'C11. T??nh tr???ng ??i???u tr??? HIV',
                    switchable: false,
                    visible: true,
//                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c4',
                    title: 'C4. M?? s??? kh??ch h??ng',
                    switchable: false,
                    visible: true,
//                    formatter: _activeFormatter,
                    cellStyle: _cellNowrap
                }
            ];

            // if (!shouldDisplayCheckbox) {
            //     columns.shift(); // remove the state column
            // }

            return columns;
        }

        function getTableDefinitionContact(isSiteManager) {
            let _tableOperation = function (value, row, index) {
                let url = '';
                if(!isSiteManager){
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-eye">Xem chi ti???t </i>';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="S???a" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deleteContactEntry(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="X??a" href="#" tooltip-placement="auto">';
                    url +=         '<i class="fa fa-trash"></i>';
                    url +=     '</a>';
                    url += '</div>';
                }
                
                return url;
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
                    if(value.includes("2") || value.includes("YES") || value.includes("C??")){
                        return 'C??';
                    }
                    else if(value.includes("1") || value.includes("NO") || value.includes("Kh??ng")){
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
            let _nameFormatter = function (value, row, index) {
                if (value) {             
                        if(value.fullName){
                            return value.fullName;
                        }
                        return ""; 
                }
                return "";
            };
            let c1Format= function(value, row, index){
                let str="";
                if(value && value.length>0){
                    for(let item of value){
                        if(str.length>0){
                            str+=", "+item.name;
                        }else{
                            str+=item.name
                        }
                    }
                }
                return str;
            }
            
            let columns = [
                {
                    field: '',
                    title: 'Thao t??c',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1receivedInfoDate',
                    title: 'Ng??y khai th??c th??ng tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'person.fullname',
                    title: 'C7. H??? t??n kh??ch h??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'person.gender',
                    title: 'C8. Gi???i t??nh',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'yearOfBirth',
                    title: 'C9. N??m sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'addressDetail',
                    title: '?????a ch??? n??i c?? tr??',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'district.name',
                    title: 'Qu???n/huy???n',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'province.name',
                    title: 'T???nh/th??nh ph???',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'phoneNumber',
                    title: 'S??? ??i???n tho???i',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1',
                    title: 'C1. Quan h??? v???i ng?????i c?? HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: c1Format,
                }
                , {
                    field: 'c2Des',
                    title: 'C2. T??nh tr???ng HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3Des',
                    title: 'C3. Nguy c?? b???o l???c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4First',
                    title: 'C4. Li??n l???c l???n 1',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4Second',
                    title: 'C4. Li??n l???c l???n 2',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4Third',
                    title: 'C4. Li??n l???c l???n 3',
                    switchable: false,
                    visible: true,
                   formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5Des',
                    title: 'C5. ???? li??n l???c ???????c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5ReasonDes',
                    title: 'L?? do kh??ng li??n l???c ???????c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c6Des',
                    title: 'Bi???n ph??p li??n l???c',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c7Des',
                    title: 'C7. C??ch li??n l???c th??nh c??ng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c7Note',
                    title: 'C??ch li??n l???c kh??c',
                    switchable: false,
                    visible: true,
                   formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8Des',
                    title: 'C8. X??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestCode',
                    title: 'M?? x??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestDate',
                    title: 'Ng??y x??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                   formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9Des',
                    title: 'C9. K???t qu??? x??t nghi???m HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestOrg',
                    title: 'T??n c?? s??? XN HIV',
                    switchable: false,
                    visible: true,
                   formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9JoinedPrEPDes',
                    title: '??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9PrEPDate',
                    title: 'Ng??y ??i???u tr??? PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9JoinedARVDes',
                    title: '??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9ARVDate',
                    title: 'Ng??y ??i???u tr??? ARV',
                    switchable: false,
                    visible: true,
                   formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                    
            ];

            return columns;
        }
    }

})();