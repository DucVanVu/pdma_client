/**
 * Created by bizic on 30/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Treatment').service('SHIInterviewService', SHIInterviewService);

    SHIInterviewService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function SHIInterviewService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.getAllInstances = getAllInstances;
        self.getLatestEntry = getLatestEntry;
        self.getAllEntries = getAllEntries;
        self.getEntries = getEntries;
        self.getEntry = getEntry;
        self.saveEntry = saveEntry;
        self.deleteEntries = deleteEntries;

        function getAllInstances(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'shi_interview/instances/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getEntry(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'shi_interview/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }
        
        function getLatestEntry(caseId) {
            if (!caseId) {
                return $q.when(null);
            }

            let url = baseUrl + 'shi_interview/latest/' + caseId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function getAllEntries(filter) {
            let url = baseUrl + 'shi_interview/all';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getEntries(filter) {
            let url = baseUrl + 'shi_interview/list';

            return utils.resolveAlt(url, 'POST', null, filter, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function saveEntry(entry, successCallback, errorCallback) {
            let url = baseUrl + 'shi_interview';

            return utils.resolveAlt(url, 'POST', null, entry, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }

        function deleteEntries(dtos, successCallback, errorCallback) {
            if (!dtos || dtos.length <= 0) {
                return $q.when(null);
            }

            let url = baseUrl + 'shi_interview';
            return utils.resolveAlt(url, 'DELETE', null, dtos, {
                'Content-Type': 'application/json; charset=utf-8'
            }, successCallback, errorCallback);
        }
    }

})();