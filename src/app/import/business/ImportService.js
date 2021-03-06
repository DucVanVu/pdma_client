/**
 * Created by bizic on 30/8/2016.
 */
 (function () {
    'use strict';

    angular.module('PDMA.Import').service('ImportService', ImportService);

    ImportService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function ImportService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.importHTSNew = importHTSNew;
        function importHTSNew(file) {
            let url = baseUrl + 'htscase/importExcelNew';
            return $http({
                method: 'POST',
                url: url,
                params: { uploadfile: file },
                data: { uploadfile: file },
                headers: {'Content-Type': 'multipart/form-data; boundary=something'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }
        // self.exportReportSNS=exportReportSNS;
        // self.exportReportHTS=exportReportHTS;
        // self.exportReportPE=exportReportPE;
        // self.exportReportPNS=exportReportPNS;
        // self.exportReportSTI=exportReportSTI;
        // self.exportReportSelfTest=exportReportSelfTest;
        // function exportReportSNS(filterReport) {
        //     let url = baseUrl + 'sns/exportReport';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }
        
        // function exportReportHTS(filterReport) {
        //     let url = baseUrl + 'htscase/exportReportHTS';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }

        // function exportReportPE(filterReport) {
        //     let url = baseUrl + 'pecase/exportReport';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }

        // function exportReportPNS(filterReport) {
        //     let url = baseUrl + 'pnscase/exportReport';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }

        // function exportReportSTI(filterReport) {
        //     let url = baseUrl + 'htscase/exportReportSTI';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }

        // function exportReportSelfTest(filterReport) {
        //     let url = baseUrl + 'self_test/exportReport';
        //     return $http({
        //         method: 'POST',
        //         url: url,
        //         params: null,
        //         data: filterReport,
        //         headers: {'Content-Type': 'application/json; charset=utf-8'},
        //         cache: false,
        //         responseType: 'arraybuffer'
        //     });
        // }

    }
})();