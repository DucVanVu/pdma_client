(function () {
    'use strict';

    angular
        .module('PDMA.Common')
        .factory('Utilities', Utilities);

    Utilities.$inject = [
        '$window',
        '$http',
        '$q',
        'settings'
    ];

    /** @ngInject */
    function Utilities($window, $http, $q, settings) {
        // Private variables
        return {
            resolve: resolve,
            resolveAlt: resolveAlt,
            sleep: sleep,
            indexOf: indexOf,
            indexOfAlt: indexOfAlt,
            exists: exists,
            validEmail: validEmail,
            detectBrowser: detectBrowser,
            guidGenerator: guidGenerator,
            gender2String: gender2String,
            toggleInArray: toggleInArray,
            findById: findById,
            hasRole: hasRole,
            isPositive: isPositive,
            translateContentType: translateContentType,
            firstUC: firstUC,
            toUpperCase: toUpperCase,
            toTitleCase: toTitleCase,
            weeksInYear: weeksInYear,
            arr2KeyValues: arr2KeyValues,
            isValidSHINumber: isValidSHINumber,
            formatLocalTime: formatLocalTime,
            boolDifferent: boolDifferent,
            invalidDateFromString: invalidDateFromString,
            removeAccent: removeAccent,
            dateRangeOverlap: dateRangeOverlap,
            isNumberOnly: isNumberOnly,
            generatePassword: generatePassword
        };

        /**
         * Generate a random password
         * @param length
         * @returns {string | *}
         */
        function generatePassword(length) {
            const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            const generatePassword = (length, characters) => {
                let password = "";
                for (let i = 0; i < length; i++) {
                    password += characters.charAt(
                        Math.floor(Math.random() * characters.length)
                    );
                }
                return password;
            };

            return generatePassword(length, characters);
        }

        function dateRangeOverlap(dateRanges) {
            let sortedRanges = dateRanges.sort((previous, current) => {
                let mPrev = moment(previous.startDate);

                // if the previous is earlier than the current
                if (mPrev.isBefore(current.startDate, 'day')) {
                    return -1;
                }

                // if the previous time is the same as the current time
                if (mPrev.isSame(current.startDate, 'day')) {
                    return 0;
                }

                // if the previous time is later than the current time
                return 1;
            });

            let result = sortedRanges.reduce((result, current, idx, arr) => {
                // get the previous range
                if (idx === 0) {
                    return result;
                }

                let previous = arr[idx - 1];

                // check for any overlap
                let mPrevEnd = moment(previous.endDate);
                let overlap = mPrevEnd.isAfter(current.startDate);

                // store the result
                if (overlap) {
                    // yes, there is overlap
                    result.overlap = true;
                    // store the specific ranges that overlap
                    result.ranges.push({
                        previous: previous,
                        current: current
                    })
                }

                return result;

                // seed the reduce
            }, {
                overlap: false,
                ranges: []
            });


            // return the final results
            return result;
        }

        /**
         * Ki???m tra chu??i k?? t??? ch??? bao g???m s???
         */
        function isNumberOnly(val) {
            return /^[0-9]+$/.test(val);
        }

        /**
         * X??a d???u ti???ng Vi???t
         * @param alias
         * @returns {string}
         */
        function removeAccent(alias) {
            var str = alias;
            str = str.toLowerCase();
            str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "a");
            str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "e");
            str = str.replace(/??|??|???|???|??/g, "i");
            str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "o");
            str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "u");
            str = str.replace(/???|??|???|???|???/g, "y");
            str = str.replace(/??/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
            str = str.replace(/ + /g, " ");
            str = str.trim();
            return str;
        }

        function invalidDateFromString(input) {
            if (!input || input.trim().length <= 0) {
                return true;
            }

            let invalid = false;
            let val = [];

            console.log(input);

            if (input.length == 8) {
                val[0] = input.substr(0, 2);
                val[1] = input.substr(2, 2);
                val[2] = input.substr(4, 4);
            } else if (input.length == 10) {
                val = input.split('/');
            }

            if (val.length < 2) {
                return true;
            }

            for (let i = 0; i < val.length; i++) {
                if (!val[i] || val[i].indexOf('_') >= 0) {
                    invalid = true;
                    break;
                }
            }

            let tmpD = parseFloat(val[0]);
            let tmpM = parseFloat(val[1]);
            let tmpY = parseFloat(val[2]);
            if (tmpD < 1 || tmpD > 31 || tmpM < 1 || tmpM > 12 || tmpY < 1900 || tmpY > 2050) {
                invalid = true;
            }

            return invalid;
        }

        function boolDifferent(val1, val2) {
            return (!!val1 !== !!val2);
        }

        function formatLocalTime(input) {
            if (!input) {
                return '';
            }

            let d = input.dayOfMonth;
            let m = input.monthValue;
            let y = input.year;

            let s = '';
            if (d < 10) {
                s += '0' + d + '/';
            } else {
                s += d + '/';
            }

            if (m < 10) {
                s += '0' + m + '/';
            } else {
                s += m + '/';
            }

            s += y;

            return s;
        }

        function isValidSHINumber(input) {
            if (!input) {
                return false;
            }

            input = input.replace(/\s+/g, '');

            if (input.length != 15 && input.length != 10) {
                return false;
            }

            if (input.length === 10) {
                return input.match(/^[0-9]+$/);
            }

            let a = input.substr(0, 2);
            let b = input.substr(2, 1);
            let c = input.substr(3);

            let check1 = /^[A-Z,a-z]+$/;
            let check2 = /^[1,2,3,4,5]+$/;
            let check3 = /^[0-9]+$/;

            return (a.match(check1) && b.match(check2) && c.match(check3));
        }

        function arr2KeyValues(input, output) {
            if (angular.isDefined(input)) {
                angular.forEach(input, function (obj) {
                    output[obj.id] = true;
                });
            }
        }

        function gender2String(s) {
            if (!s) {
                return 'Kh??ng r??';
            }

            s = s.toUpperCase();
            if (s == 'MALE') {
                return 'Nam';
            } else if (s == 'FEMALE') {
                return 'N???';
            } else if (s == 'TRANSGENDER') {
                return 'Chuy???n gi???i';
            } else {
                return 'Kh??ng r??';
            }
        }

        /**
         * Get the number of week in a year
         * @param year
         * @returns {*}
         */
        function weeksInYear(year) {
            let month = 11, day = 31, week;

            // Find week that 31 Dec is in. If is first week, reduce date until
            // get previous week.
            do {
                let d = new Date(year, month, day--);
                week = moment(d).week();
            } while (week == 1);

            return week;
        }

        /**
         * Translate content type
         *
         * @param contentType
         * @returns {string}
         */
        function translateContentType(contentType) {
            if (!contentType || contentType.trim() === '') {
                return '';
            }

            let ret = '';

            if (contentType.indexOf('image/') === 0) {
                ret = 'Image';
            } else if (contentType.indexOf('audio/') === 0) {
                ret = 'Audio';
            } else if (contentType.indexOf('video/') === 0) {
                ret = 'Video';
            } else if (contentType.indexOf('text/') === 0) {
                ret = 'Document';
            } else if (contentType.indexOf('message/') === 0) {
                ret = 'Email';
            } else if (contentType.indexOf('multipart/') === 0) {
                ret = 'Multipart';
            } else if (contentType.indexOf('application/') === 0) {
                let sub = contentType.substring(12);
                if (sub.indexOf('msword') === 0
                    || sub.indexOf('vnd.openxmlformats-officedocument.wordprocessingml.document') === 0
                    || sub.indexOf('vnd.ms-excel') === 0
                    || sub.indexOf('rtf') === 0
                    || sub.indexOf('vnd.ms-powerpoint') === 0) {
                    ret = 'Ms Office';
                } else if (sub.indexOf('pdf') === 0
                    || sub.indexOf('vnd.adobe.photoshop') === 0
                    || sub.indexOf('postscript') === 0) {
                    ret = 'Adobe';
                } else if (sub.indexOf('zip') === 0
                    || sub.indexOf('x-rar-compressed') === 0) {
                    ret = 'Zipped file';
                } else if (sub.indexOf('x-msdownload') === 0
                    || sub.indexOf('x-msdownload') === 0
                    || sub.indexOf('vnd.ms-cab-compressed') === 0) {
                    ret = 'Application';
                } else if (sub.indexOf('vnd.oasis.opendocument.text') === 0
                    || sub.indexOf('vnd.oasis.opendocument.spreadsheet') === 0) {
                    ret = 'Open Office';
                } else {
                    ret = '[Unknown]';
                }
            } else {
                ret = '[Unknown]';
            }

            return ret;
        }

        /**
         * Check if the input value is positive number
         * @param input
         */
        function isPositive(input) {
            return input && input != null && input > 0;
        }

        /**
         * Check and see whether this user has a role with rolename
         * @param user
         * @param roleName
         */
        function hasRole(user, roleName) {
            if (!user || user.roles || user.roles.length <= 0 || !roleName || roleName.trim().length <= 0) {
                return false;
            }

            let found = false;
            user.roles.forEach(function (role) {
                if (role.name === roleName) {
                    found = true;
                }
            });

            return found;
        }

        /**
         * Check and see whether this user is administrator
         * @param user
         */
        function isAdministrator(user) {
            return hasRole(user, 'ROLE_ADMIN');
        }

        /**
         * Resolve a request
         *
         * @param url
         * @param method
         * @param successCallback
         * @param errorCallback
         * @returns {*}
         */
        function resolve(url, method, successCallback, errorCallback) {

            if (angular.isUndefined(url)) {
                return $q.reject('Undefined url in an $http call.');
            }

            let _method = method || 'GET';
            let deferred = $q.defer();

            $http({
                method: _method,
                url: url
            }).then(function (response) {
                deferred.resolve(response.data);

                if (angular.isDefined(successCallback) && angular.isFunction(successCallback)) {
                    successCallback();
                }

            }, function (response) {
                deferred.reject(response.statusText);

                if (angular.isDefined(errorCallback) && angular.isFunction(errorCallback)) {
                    errorCallback();
                }

            });

            return deferred.promise;
        }

        /**
         * Resolve a request
         *
         * @param url
         * @param method
         * @param params
         * @param data
         * @param headers
         * @param successCallback
         * @param errorCallback
         * @returns {*}
         */
        function resolveAlt(url, method, params, data, headers, successCallback, errorCallback) {

            if (angular.isUndefined(url)) {
                return $q.reject('Undefined url in an $http call.');
            }

            let _method = method || 'GET';
            let _params = params || null;
            let _data = data || {};
            let _headers = headers || {};

            let deferred = $q.defer();

            $http({
                method: _method,
                url: url,
                params: _params,
                data: _data,
                headers: _headers,
                cache: false
            }).then(function (response) {
                deferred.resolve(response.data);

                if (angular.isDefined(successCallback) && angular.isFunction(successCallback)) {
                    successCallback();
                }

            }, function (response) {
                deferred.reject(response.statusText);

                if (angular.isDefined(errorCallback) && angular.isFunction(errorCallback)) {
                    errorCallback();
                }

            });

            return deferred.promise;
        }

        /**
         * Sleep for some milliseconds
         * @param milliseconds
         */
        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }

        //////////

        /**
         * Find index of an item in an array. Item is supposed to have a unique field named 'id'
         *
         * @param item
         * @param array
         */
        function indexOf(item, array) {
            if (typeof item === 'undefined' || typeof array === 'undefined' || array.length <= 0) {
                return -1;
            }

            if (typeof item.id === 'undefined') {
                return -1;
            }

            let length = array.length;
            let index = -1;
            for (let i = 0; i < length; i++) {
                if (item.id === array[i].id) {
                    index = i;
                    break;
                }
            }

            return index;
        }

        /**
         * Find index of an item in an array. Item is supposed to have a unique field named 'code'
         * @param item
         * @param array
         * @returns {number}
         */
        function indexOfAlt(item, array) {
            if (typeof item === 'undefined' || typeof array === 'undefined' || array.length <= 0) {
                return -1;
            }

            if (typeof item.code === 'undefined') {
                return -1;
            }

            let length = array.length;
            let index = -1;
            for (let i = 0; i < length; i++) {
                if (item.code === array[i].code) {
                    index = i;
                    break;
                }
            }

            return index;
        }

        /**
         * Check if item exists in a list
         *
         * @param item
         * @param list
         * @returns {boolean}
         */
        function exists(item, list) {
            return list.indexOf(item) > -1;
        }


        /**
         * Validate email address
         * @param input
         */
        function validEmail(input) {
            let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(input);
        }

        /**
         * Returns browser information
         * from user agent data
         *
         * Found at http://www.quirksmode.org/js/detect.html
         * but modified and updated to fit for our needs
         */
        function detectBrowser() {
            // If we already tested, do not test again
            if (browserInfo) {
                return browserInfo;
            }

            let browserData = [
                {
                    string: $window.navigator.userAgent,
                    subString: 'Edge',
                    versionSearch: 'Edge',
                    identity: 'Edge'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Chrome',
                    identity: 'Chrome'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'OmniWeb',
                    versionSearch: 'OmniWeb/',
                    identity: 'OmniWeb'
                },
                {
                    string: $window.navigator.vendor,
                    subString: 'Apple',
                    versionSearch: 'Version',
                    identity: 'Safari'
                },
                {
                    prop: $window.opera,
                    identity: 'Opera'
                },
                {
                    string: $window.navigator.vendor,
                    subString: 'iCab',
                    identity: 'iCab'
                },
                {
                    string: $window.navigator.vendor,
                    subString: 'KDE',
                    identity: 'Konqueror'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Firefox',
                    identity: 'Firefox'
                },
                {
                    string: $window.navigator.vendor,
                    subString: 'Camino',
                    identity: 'Camino'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Netscape',
                    identity: 'Netscape'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'MSIE',
                    identity: 'Explorer',
                    versionSearch: 'MSIE'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Trident/7',
                    identity: 'Explorer',
                    versionSearch: 'rv'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Gecko',
                    identity: 'Mozilla',
                    versionSearch: 'rv'
                },
                {
                    string: $window.navigator.userAgent,
                    subString: 'Mozilla',
                    identity: 'Netscape',
                    versionSearch: 'Mozilla'
                }
            ];

            let osData = [
                {
                    string: $window.navigator.platform,
                    subString: 'Win',
                    identity: 'Windows'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'Mac',
                    identity: 'Mac'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'Linux',
                    identity: 'Linux'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'iPhone',
                    identity: 'iPhone'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'iPod',
                    identity: 'iPod'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'iPad',
                    identity: 'iPad'
                },
                {
                    string: $window.navigator.platform,
                    subString: 'Android',
                    identity: 'Android'
                }
            ];

            let versionSearchString = '';

            function searchString(data) {
                for (let i = 0; i < data.length; i++) {
                    let dataString = data[i].string;
                    let dataProp = data[i].prop;

                    versionSearchString = data[i].versionSearch || data[i].identity;

                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) !== -1) {
                            return data[i].identity;

                        }
                    } else if (dataProp) {
                        return data[i].identity;
                    }
                }
            }

            function searchVersion(dataString) {
                let index = dataString.indexOf(versionSearchString);

                if (index === -1) {
                    return;
                }

                return parseInt(dataString.substring(index + versionSearchString.length + 1));
            }

            let browser = searchString(browserData) || 'unknown-browser';
            let version = searchVersion($window.navigator.userAgent) || searchVersion($window.navigator.appVersion) || 'unknown-version';
            let os = searchString(osData) || 'unknown-os';

            // Prepare and store the object
            browser = browser.toLowerCase();
            version = browser + '-' + version;
            os = os.toLowerCase();

            let browserInfo = {
                browser: browser,
                version: version,
                os: os
            };

            return browserInfo;
        }

        /**
         * Generates a globally unique id
         *
         * @returns {*}
         */
        function guidGenerator() {
            let S4 = function () {
                return (((1 + Math.random()) * 0x10000) || 0).toString(16).substring(1);
            };
            return (S4() + S4() + S4() + S4() + S4() + S4());
        }

        /**
         * Toggle in array (push or splice)
         *
         * @param item
         * @param array
         */
        function toggleInArray(item, array) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            } else {
                array.splice(array.indexOf(item), 1);
            }
        }

        /**
         * Find an object with ID objId in an array of objects
         * @param array
         * @param objId
         */
        function findById(array, objId) {
            let obj = {};

            if (array == null || array.length <= 0) {
                return obj;
            }

            let len = array.length;
            let found = false;
            for (let i = 0; i < len && !found; i++) {
                let _obj = array[i];
                if (_obj.id == objId) {
                    angular.copy(_obj, obj);
                    found = true;
                }
            }

            return obj;
        }

        /**
         * Transform a string to first letter upper case and the rest lower case
         * @param input
         * @returns {*}
         */
        function firstUC(input) {

            if (!input) {
                return input;
            }

            if (typeof (input) === 'string') {
                return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
            } else if (Array.isArray(input) && input.length > 0) {
                for (let i = 0; i < input.length; i++) {
                    input[i] = input[i].charAt(0).toUpperCase() + input[i].slice(1).toLowerCase();
                }

                return input;
            }

            return null;
        }

        /**
         * Change a string or an array of string to upper case
         *
         * @param input
         * @returns {*}
         */
        function toUpperCase(input) {

            if (!input) {
                return input;
            }

            if (typeof (input) === 'string') {
                return input.toUpperCase();
            } else if (Array.isArray(input) && input.length > 0) {
                for (let i = 0; i < input.length; i++) {
                    input[i] = input[i].toUpperCase();
                }

                return input;
            }

            return null;
        }

        /**
         * Convert a sentence to title Case
         */
        function toTitleCase(str, firstWordOnly) {
            if (!str) {
                return str;
            }

            str = str.trim();

            if (firstWordOnly) {
                return str.substring(0, 1).toUpperCase() + str.slice(1);
            }

            let word_arr = str.split(' ');
            let new_sentence = '';

            for (let i in word_arr) {
                word_arr[i] = word_arr[i].trim();
                new_sentence += word_arr[i].substring(0, 1).toUpperCase() + word_arr[i].slice(1) + ' ';
            }

            return new_sentence.trim();
        }
    }
}());