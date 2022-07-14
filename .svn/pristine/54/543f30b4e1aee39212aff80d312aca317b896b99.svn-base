/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Settings').service('SettingsService', SettingsService);

    SettingsService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function SettingsService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.resetPassword4DemoUsers = resetPassword4DemoUsers;
        self.forceWeeklyDataSynthesis = forceWeeklyDataSynthesis;
        self.deleteDemoWeeklyData = deleteDemoWeeklyData;
        self.dangerousReset = dangerousReset;
        self.deleteOpcAssistData = deleteOpcAssistData;
        self.saveOPCAssistProvinces = saveOPCAssistProvinces;
        self.getOPCAssistProvinces = getOPCAssistProvinces;

        function resetPassword4DemoUsers(successCallback, errorCallback) {
            let url = baseUrl + 'user/demo';

            return utils.resolveAlt(url, 'PUT', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function forceWeeklyDataSynthesis(successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report/synthesis';

            return utils.resolveAlt(url, 'POST', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteDemoWeeklyData(successCallback, errorCallback) {
            let url = baseUrl + 'weekly_report/demo';

            return utils.resolveAlt(url, 'DELETE', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteOpcAssistData(filter, successCallback, errorCallback) {
            if (!filter) {
                return $q.when(null);
            }

            let url = baseUrl + 'case/_danger_/del';

            return utils.resolveAlt(url, 'DELETE', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function saveOPCAssistProvinces(dto, successCallback, errorCallback) {
            let url = baseUrl + 'preferences';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
        
        function getOPCAssistProvinces() {
            let url = baseUrl + 'preferences/name/opcassist_provinces';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function dangerousReset(dto, successCallback, errorCallback) {
            let url = baseUrl + 'user/dangerous_reset';

            return utils.resolveAlt(url, 'PUT', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
    }
})();