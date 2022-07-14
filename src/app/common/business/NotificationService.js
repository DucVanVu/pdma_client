/**
 * Created by bizic on 29/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Common').service('NotificationService', NotificationService);
    NotificationService.$inject = [
        '$http',
        '$q',
        'settings',
        'Utilities'
    ];

    function NotificationService($http, $q, settings, utils) {
        let self = this;
        let baseUrl = settings.api.baseUrl + settings.api.apiV1Url;

        self.findById = findById;
        self.countUnread = countUnread;
        self.markAsRead = markAsRead;
        self.fetchNotifications = fetchNotifications;
        self.broadcastAll = broadcastAll;
        self.broadcast = broadcast;
        self.getOPCAssistNotification = getOPCAssistNotification;

        function findById(id) {
            if (!id) {
                return $q.when(null);
            }

            let url = baseUrl + 'notification/' + id;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function countUnread() {
            let url = baseUrl + 'notification/unread';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function markAsRead() {
            let url = baseUrl + 'notification/mark_read';

            return utils.resolveAlt(url, 'PUT', null, null, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function fetchNotifications() {
            let url = baseUrl + 'notification/list';
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

        function broadcastAll(dto) {
            let url = baseUrl + 'notification/broadcast_all';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function broadcast(dto) {
            let url = baseUrl + 'notification/broadcast';

            return utils.resolveAlt(url, 'POST', null, dto, {
                'Content-Type': 'application/json; charset=utf-8'
            }, angular.noop, angular.noop);
        }

        function getOPCAssistNotification(orgId) {
            if (!orgId) {
                return $q.when(null);
            }

            let url = baseUrl + 'notification/opc-notificaton/' + orgId;
            return utils.resolve(url, 'GET', angular.noop, angular.noop);
        }

    }

})();