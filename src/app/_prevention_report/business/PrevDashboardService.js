/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PREV_REPORT').service('PrevDashboardService', PrevDashboardService);

    PrevDashboardService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function PrevDashboardService($http, $q, settings, utils) {
        let self = this;
        self.getAdminUnit = getAdminUnit;
        self.getCurrentUser = getCurrentUser;
        self.getOrganization = getOrganization;
        self.getChart1=getChart1;
        self.getChart2=getChart2;
        self.getChart3=getChart3;
        self.getChart4=getChart4;
        self.getChart5=getChart5;
        self.getChart6=getChart6;
        self.getChart7=getChart7;
        self.getChart8=getChart8;
        self.getChart9=getChart9;
        self.getChart10=getChart10;
        self.getChart11=getChart11;
        self.getChart12=getChart12;
        self.getChart14=getChart14;
        self.getChart13=getChart13;
        self.getTotalsPE=getTotalsPE;
        self.getTotalsHTS=getTotalsHTS;
        self.getTotalsHIV=getTotalsHIV;
        self.getTotalsARV=getTotalsARV;
        self.getTotalsPrEP=getTotalsPrEP;
        self.getToltalsSection2=getToltalsSection2;
        self.getToltalsSection3=getToltalsSection3;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        function getCurrentUser() {
            var url = baseUrl + 'user/current';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getToltalsSection3(filter){
            let url = baseUrl + 'prev_chart/toltalsSection3';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getToltalsSection2(filter){
            let url = baseUrl + 'prev_chart/toltalsSection2';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart13(filter){
            let url = baseUrl + 'prev_chart/chart13';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart14(filter){
            let url = baseUrl + 'prev_chart/chart14';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart12(filter){
            let url = baseUrl + 'prev_chart/chart12';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart11(filter){
            let url = baseUrl + 'prev_chart/chart11';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart10(filter){
            let url = baseUrl + 'prev_chart/chart10';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart9(filter){
            let url = baseUrl + 'prev_chart/chart9';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTotalsPrEP(filter){
            let url = baseUrl + 'prev_chart/totalsPrEP';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTotalsARV(filter){
            let url = baseUrl + 'prev_chart/totalsARV';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTotalsHIV(filter){
            let url = baseUrl + 'prev_chart/totalsHIV';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTotalsHTS(filter){
            let url = baseUrl + 'prev_chart/totalsHTS';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getTotalsPE(filter){
            let url = baseUrl + 'prev_chart/totalsPE';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart3(filter){
            let url = baseUrl + 'prev_chart/chart3';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart4(filter){
            let url = baseUrl + 'prev_chart/chart4';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart8(filter){
            let url = baseUrl + 'prev_chart/chart8';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart7(filter){
            let url = baseUrl + 'prev_chart/chart7';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart6(filter){
            let url = baseUrl + 'prev_chart/chart6';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart5(filter){
            let url = baseUrl + 'prev_chart/chart5';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart1(filter){
            let url = baseUrl + 'prev_chart/chart1';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChart2(filter){
            let url = baseUrl + 'prev_chart/chart2';
            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getAdminUnit(filter) {
            let url = baseUrl + 'admin_unit/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
        function getOrganization(filter) {
            let url = baseUrl + 'organization/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
    }
})();