/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Reporting').service('SiteLevelTargetService', SiteLevelTargetService);

    SiteLevelTargetService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function SiteLevelTargetService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getAllTargets = getAllTargets;
        self.saveTargets = saveTargets;

        function getAllTargets(filter) {
            let url = baseUrl + 'sltarget/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveTargets(targets, successCallback, errorCallback) {
            let url = baseUrl + 'sltarget/multiple';

            return utils.resolveAlt(url, 'POST', null, targets, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
    }
})();