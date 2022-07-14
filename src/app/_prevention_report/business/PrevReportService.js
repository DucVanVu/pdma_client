/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PREV_REPORT').service('PrevReportService', PrevReportService);

    PrevReportService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PrevReportService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;
        self.exportReportSNS=exportReportSNS;
        self.exportReportHTS=exportReportHTS;
        self.exportReportPE=exportReportPE;
        self.exportReportPNS=exportReportPNS;
        self.exportReportSTI=exportReportSTI;
        self.exportReportSelfTest=exportReportSelfTest;
        self.exportReportSelfTestNew=exportReportSelfTestNew;
        self.exportReportMerPe02 =exportReportMerPe02;
        self.getAdminUnit = getAdminUnit;
        self.getAllOrganizations=getAllOrganizations;
        function exportReportSNS(filterReport) {
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
        
        function exportReportHTS(filterReport) {
            let url = baseUrl + 'htscase/exportReportHTS';
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

        function exportReportPE(filterReport) {
            let url = baseUrl + 'pecase/exportReport';
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

        function exportReportPNS(filterReport) {
            let url = baseUrl + 'pnscase/exportReport';
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

        function exportReportSTI(filterReport) {
            let url = baseUrl + 'htscase/exportReportSTI';
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

        function exportReportSelfTest(filterReport) {
            let url = baseUrl + 'self_test/exportReport';
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

        function exportReportSelfTestNew(filterReport) {
            let url = baseUrl + 'prev_chart/exportReport';
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

        function exportReportMerPe02(filterReport) {
            let url = baseUrl + 'prev_chart/export-report-mer-pe';
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

        function getAdminUnit(){
            let url = baseUrl + 'admin_unit/provinceByUser';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllOrganizations(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
    }
})();