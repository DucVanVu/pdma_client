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
                    url +=          '<i class="icon-frame margin-right-5"></i>Xem chi tiết ';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Sửa" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deletePNS(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Xóa" href="#" tooltip-placement="auto">';
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
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Âm tính';
                    }
                    else if(value.includes("2")){
                        return 'Dương tính';
                    }else if(value.includes("3")){
                        return 'Không làm xét nghiệm Giang mai';
                    }
                }
                return '';
            };
            let _c14Formatter = function (value, row, index) {
                if (value) {
                    if(value.includes("-1")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Âm tính';
                    }
                    else if(value.includes("2")){
                        return 'Dương tính';
                    }else if(value.includes("3")){
                        return 'Không xác định';
                    }else if(value.includes("4")){
                        return 'Không làm xét nghiệm';
                    }
                }
                return '';
            };
            let _c24Formatter = function (value, row, index) {
                if (value) {
                    if(value.includes("-1")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Khách hàng dương tính mới';
                    }
                    else if(value.includes("2")){
                        return 'Khách hàng dương tính cũ';
                    }else if(value.includes("3")){
                        return 'Đang chờ kết quả xác minh';
                    }
                }
                return '';
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
            let _c5Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Khoa phòng bệnh viện (không bao gồm PKNT HIV)';
                    }
                    else if(value.includes("2")){
                        return 'Cơ sở TVXN HIV (VCT, PKNT, MMT, PrEP, trại giam)';
                    }
                }
                return '';
            };
            let _c5NoteFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Tư vấn xét nghiệm tự nguyện (VCT)';
                    }
                    else if(value.includes("2")){
                        return 'TVXN HIV tại phòng khám ngoại trú';
                    } else if(value.includes("3")){
                        return 'TVXN HIV tại cơ sở điều trị Methadone';
                    }
                    else if(value.includes("4")){
                        return 'TVXN HIV tại cơ sở điều trị PrEP';
                    }
                    else if(value.includes("5")){
                        return 'Khoa phòng bệnh viện (không bao gồm PKNT HIV)';
                    }
                    else if(value.includes("6")){
                        return 'TVXN HIV tại trại giam, trại tạm giam';
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
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Khách hàng tự đến';
                    }
                    else if(value.includes("2")){
                        return 'Dịch vụ TBXNBT/BC của người có HIV';
                    }else if(value.includes("3")){
                        return 'Chương trình tiếp cận cộng đồng';
                    }else if(value.includes("4")){
                        return 'Khác';
                    }
                }
                return '';
            };
            let _c11aFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Dịch miệng';
                    }
                    else if(value.includes("2")){
                        return 'Máu mao mạch đầu ngón tay';
                    }else if(value.includes("3")){
                        return 'Khác';
                    }
                }
                return '';
            };
            let _c11bFormatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Tự làm xét nghiệm';
                    }
                    else if(value.includes("2")){
                        return 'Xét nghiệm do nhóm cộng đồng thực hiện';
                    }else if(value.includes("3")){
                        return 'Xét nghiệm do y tế xã/phường thực hiện';
                    }
                }
                return '';
            };
            let _c12Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Chưa bao giờ XN HIV';
                    }
                    else if(value.includes("2")){
                        return 'Có, kết quả XN âm tính';
                    }else if(value.includes("3")){
                        return 'Có, kết quả XN dương tính';
                    }else if(value.includes("4")){
                        return 'Có, không xác định hoặc không biết kết quả XN';
                    }
                }
                return '';
            };
            let _c131Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return '≤ 12 tháng';
                    }
                    else if(value.includes("2")){
                        return '> 12 tháng';
                    }
                }
                return '';
            };
            let _c132Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Chưa bao giờ điều trị ARV';
                    }
                    else if(value.includes("2")){
                        return 'Đang điều trị ARV';
                    }
                    else if(value.includes("3")){
                        return 'Đã bỏ điều trị ARV';
                    }
                }
                return '';
            };
            let _c17Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Mới nhiễm HIV';
                    }
                    else if(value.includes("2")){
                        return 'Nhiễm HIV đã lâu';
                    }else if(value.includes("3")){
                        return 'Không làm XN mới nhiễm';
                    }
                }
                return '';
            };
            let _c18Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return '< 1.000 bản sao/ml';
                    }
                    else if(value.includes("2")){
                        return '≥ 1.000 bản sao/ml';
                    }else if(value.includes("3")){
                        return 'Không làm XN tải lượng vi-rút';
                    }else if(value.includes("4")){
                        return 'Đang chờ kết quả XN tải lượng vi-rút';
                    }
                }
                return '';
            };
            let _c20Formatter= function (value, row, index) {
                if (value) {
                    if(value.includes("-1") || value.includes("UN")){
                        return 'Không rõ';
                    }
                    else if(value.includes("1")){
                        return 'Chưa có thông tin';
                    }
                    else if(value.includes("2")){
                        return 'Không';
                    }else if(value.includes("3")){
                        return 'Có';
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
            //     return (value == 0) ? '<span class="text-muted">Không sử dụng</span>' : (value == 1) ? '<span class="text-success">Đang sử dụng</span>' : '';
            // };

            // return [
            //     {
            //         field: 'state',
            //         checkbox: true
            //     }
            //     , {
            //         field: '',
            //         title: 'Thao tác',
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
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3',
                    title: 'C3. Họ tên tư vấn viên: ',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _nameFormatter
                }
                , {
                    field: 'c7',
                    title: 'C7. Họ tên khách hàng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
//                    formatter: _nameFormatter
                }
                , {
                    field: 'c8',
                    title: 'C8. Giới tính',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c9',
                    title: 'C9. Năm sinh',
                    switchable: false,
                    visible: true,
                    //formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c5',
                    title: 'C5. Ngày tư vấn dịch vụ',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c6',
                    title: 'C6. Đồng ý nhận dịch vụ TBXNBT/BC',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }

                , {
                    field: 'c6Date',
                    title: 'Ngày đồng ý nhận dịch vụ',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c10',
                    title: 'C10. Ngày XN khẳng định HIV+',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c11Des',
                    title: 'C11. Tình trạng điều trị HIV',
                    switchable: false,
                    visible: true,
//                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c4',
                    title: 'C4. Mã số khách hàng',
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
                    url +=     '<a href="#/prevention/pns-edit-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Sửa" tooltip-placement="auto">';
                    url +=          '<i class="icon-eye">Xem chi tiết </i>';
                    url +=     '</a>';
                    url += '</div>';
                }else{
                    url += '<div class="opc-toolbar">';
                    url +=     '<a href="#/prevention/pns-edit-contact/'+ row.id +'" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Sửa" tooltip-placement="auto">';
                    url +=          '<i class="icon-pencil"></i>';
                    url +=     '</a>';
                    url +=     '<div class="vertical-seperator shorter float-right"></div>';
                    url +=     '<a data-ng-click="$parent.deleteContactEntry(' + "'" + row.id + "'" + ')" class="btn btn-primary no-padding-tb jumping no-border" uib-tooltip="Xóa" href="#" tooltip-placement="auto">';
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
                    if(value.includes("2") || value.includes("YES") || value.includes("Có")){
                        return 'Có';
                    }
                    else if(value.includes("1") || value.includes("NO") || value.includes("Không")){
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
                    title: 'Thao tác',
                    switchable: false,
                    visible: true,
                    formatter: _tableOperation,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1receivedInfoDate',
                    title: 'Ngày khai thác thông tin',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: _dateFormatter
                }
                , {
                    field: 'person.fullname',
                    title: 'C7. Họ tên khách hàng',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                }
                , {
                    field: 'person.gender',
                    title: 'C8. Giới tính',
                    switchable: false,
                    visible: true,
                    formatter: _genderFormatter,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'yearOfBirth',
                    title: 'C9. Năm sinh',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'addressDetail',
                    title: 'Địa chỉ nơi cư trú',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'district.name',
                    title: 'Quận/huyện',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'province.name',
                    title: 'Tỉnh/thành phố',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'phoneNumber',
                    title: 'Số điện thoại',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c1',
                    title: 'C1. Quan hệ với người có HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap,
                    formatter: c1Format,
                }
                , {
                    field: 'c2Des',
                    title: 'C2. Tình trạng HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }
                , {
                    field: 'c3Des',
                    title: 'C3. Nguy cơ bạo lực',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4First',
                    title: 'C4. Liên lạc lần 1',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4Second',
                    title: 'C4. Liên lạc lần 2',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c4Third',
                    title: 'C4. Liên lạc lần 3',
                    switchable: false,
                    visible: true,
                   formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5Des',
                    title: 'C5. Đã liên lạc được',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c5ReasonDes',
                    title: 'Lý do không liên lạc được',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c6Des',
                    title: 'Biện pháp liên lạc',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c7Des',
                    title: 'C7. Cách liên lạc thành công',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c7Note',
                    title: 'Cách liên lạc khác',
                    switchable: false,
                    visible: true,
                   formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8Des',
                    title: 'C8. Xét nghiệm HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestCode',
                    title: 'Mã xét nghiệm HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestDate',
                    title: 'Ngày xét nghiệm HIV',
                    switchable: false,
                    visible: true,
                   formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9Des',
                    title: 'C9. Kết quả xét nghiệm HIV',
                    switchable: false,
                    visible: true,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c8LabtestOrg',
                    title: 'Tên cơ sở XN HIV',
                    switchable: false,
                    visible: true,
                   formatter: _nameFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9JoinedPrEPDes',
                    title: 'Điều trị PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9PrEPDate',
                    title: 'Ngày điều trị PrEP',
                    switchable: false,
                    visible: true,
                    formatter: _dateFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9JoinedARVDes',
                    title: 'Điều trị ARV',
                    switchable: false,
                    visible: true,
                    formatter: _yesNoNoneFormatter,
                    cellStyle: _cellNowrap
                }, {
                    field: 'c9ARVDate',
                    title: 'Ngày điều trị ARV',
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