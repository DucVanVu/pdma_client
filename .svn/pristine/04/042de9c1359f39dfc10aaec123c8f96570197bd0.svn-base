/**
 * Created by bizic on 29/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.Common').service('LoginService', LoginService);
    LoginService.$inject = [
        'OAuth'
    ];

    function LoginService(OAuth) {
        let self = this;

        self.performLogin = performLogin;

        /**
         * Perform login
         * @param user
         */
        function performLogin(user) {
            return OAuth.getAccessToken(user, null);
        }
    }

})();