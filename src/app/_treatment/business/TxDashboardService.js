/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('TxDashboardService', TxDashboardService);

    TxDashboardService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function TxDashboardService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getSummary = getSummary;
        self.getChartData = getChartData;
        self.isMultiProvince = isMultiProvince;
		self.exportChartData=exportChartData;

        // check if the current user is assigned to multi-province
        function isMultiProvince(orgs) {
            let provId = 0;
            let multiprov = false;
            for (let i = 0; i < orgs.length; i++) {
                let obj = orgs[i];

                if (provId == 0 && obj.address && obj.address.province) {
                    provId = obj.address.province.id;
                }

                if (obj.address && obj.address.province && provId != obj.address.province.id) {
                    multiprov = true;
                    break;
                }
            }

            return multiprov;
        }

        function getSummary(f) {
            let url = baseUrl + 'opc-dashboard/summary';

            let filter = {province: f.province, organizationId: null};
            if (f.organization && f.organization.id >= 0) {
                filter.organizationId = f.organization.id;
            }

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getChartData(f) {
            let url = baseUrl + 'opc-dashboard/chart-data';

            let filter = {province: f.province, organizationId: null, targetChart: f.targetChart};
            if (f.organization && f.organization.id >= 0) {
                filter.organizationId = f.organization.id;
            }

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }
		function exportChartData(f) {
            let url = baseUrl + 'opc-dashboard/export';
			let filter = {province: f.province, organizationId: null, targetChart: f.targetChart};
            if (f.organization && f.organization.id >= 0) {
                filter.organizationId = f.organization.id;
            }
            return $http({
                method: 'POST',
                url: url,
                params: null,
                data: filter,
                headers: {'Content-Type': 'application/json; charset=utf-8'},
                cache: false,
                responseType: 'arraybuffer'
            });
        }
    }

})();