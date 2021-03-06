(function () {

    'use strict';

    let PDMA = angular.module('PDMA');

    /* Setup global constants */
    PDMA.constant('constants', {
        cookies_user: 'pdma.user',
        cookies_pns_instr_visibility: '_pns_inst_visibility',
        cookies_pns_current_page: '_pns_cur_page',
        cookies_tx_selected_patient_id: '_selected_patient_id',
        cookies_tx_status_visibility: '_status_vis',
        oauth2_token: 'token',
    });

    /* Setup global settings */
    PDMA.factory('settings', ['$rootScope', '$state', 'constants', function ($rootScope, $state, constants) {
        // supported languages
        let settings = {
            layout: {
                pageSidebarClosed: false, // sidebar menu state
                pageContentWhite: true, // set page content layout
                pageBodySolid: true, // solid body color state
                pageAutoScrollOnLoad: 500 // auto scroll to top on page load,
            },
            versionNumber: '2_2_3-release_5',
            clientVersion: '2.2.3-release (04/04/2022)',
            locale: 'vi-VN',
            assetsPath: 'assets',
            api: {
                baseUrl: PDMA.API_SERVER_URL,
                apiV1Url: PDMA.API_V1,
                clientId: PDMA.API_CLIENT_ID,
                clientKey: PDMA.API_CLIENT_KEY,
                oauth: {
                    token: constants.oauth2_token
                }
            },
            organization: {
                otherOrgCode: 'organization_other_specified'
            },
            upload: {
                maxFilesize: '10MB'
            }
        };

        $rootScope.settings = settings;

        return settings;
    }]);

    /**
     * Scroll to element
     */
    PDMA.factory('scrollToElement', ['$timeout', '$window', function ($timeout, $window) {
        return function (id, compensate) {
            $timeout(function () {
                let element = $window.document.getElementById(id);
                let comp = compensate ? compensate : 50;
                if (element) {
                    $("html,body").animate({
                        scrollTop: $(element).offset().top - comp
                    }, "slow");
                }
            });
        };
    }]);

    /**
     * Set focus on element
     */
    PDMA.factory('focus', ['$timeout', '$window', function ($timeout, $window) {
        return function (id) {
            $timeout(function () {
                let element = $window.document.getElementById(id);
                if (element)
                    element.focus();
            });
        };
    }]);

    /**
     * Set focus on flat pickr element
     */
    PDMA.factory('focusFlatPick', ['$timeout', '$window', function ($timeout, $window) {
        return function (id) {
            $timeout(function () {
                let element = $window.document.getElementById(id);
                if (element) {
                    $timeout(function () {
                        $(element).next().focus();
                    }, 500);
                }
            });
        };
    }]);

    /**
     * Open the ui-select
     */
    PDMA.factory('openSelectBox', ['$timeout', '$window', function ($timeout, $window) {
        return function (id) {
            $timeout(function () {
                let element = $window.document.getElementById(id);
                if (element) {
                    $timeout(function () {
                        $(element).find('div>span').click();
                    }, 500);
                }
            });
        };
    }]);

    /**
     * Invoke bstable API
     */
    PDMA.factory('bsTableAPI', ['$window', function ($window) {
        return function (id, api, parameter) {
            let element = $window.document.getElementById(id);
            if (element && element.hasAttribute('bs-table-control')) {
                return $(element).bootstrapTable(api, parameter);
            }
        };
    }]);

    /**
     * No server response interceptor
     */
    PDMA.factory('ServerExceptionHandlerInterceptor', [
        '$q',
        'toastr',
        'blockUI',
        '$cookies',
        '$injector',
        'constants',
        '$location',
        function ($q, toastr, blockUI, $cookies, $injector, constants, $location) {
            return {
                responseError: function (rejection) {
                    if (rejection.status <= 0) {
                        toastr.warning('Kh??ng th??? k???t n???i ?????n m??y ch???.', 'Th??ng b??o');
                        return;
                    }

                    if (rejection.status === 400) {
                        toastr.error('C?? l???i x???y ra. Vui l??ng th??? l???i sau ??t ph??t.', 'Th??ng b??o (400)');
                    }

                    if (rejection.status == 401) {
                        // Force refresh token in application.run()
                    }

                    if (rejection.status == 403) {
                        toastr.error('B???n kh??ng c?? quy???n truy c???p ch???c n??ng n??y.', 'Th??ng b??o (403)');
                        blockUI.stop();
                        $location.path('/dashboard');
                    }

                    if (rejection.status == 500) {
                        toastr.error('M??y ch??? ??ang kh??ng th??? ph???c v???. Vui l??ng th??? l???i sau ??t ph??t.', 'Th??ng b??o (500)');
                    }

                    return $q.reject(rejection);
                }
            };
        }
    ]);

    PDMA.filter('timeAgoAlt', ['$filter', function ($filter) {
        return function (time) {
            return $filter('timeAgo')(moment(time).toDate());
        };
    }]);

    // Filters
    PDMA.filter('propsFilter', function () {
        return function (items, props) {
            let out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    let itemMatches = false;

                    let keys = Object.keys(props);
                    for (let i = 0; i < keys.length; i++) {
                        let prop = keys[i];
                        let text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    });

    PDMA.filter('drugsFilter', function () {
        return function (items, props) {
            let out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    let itemMatches = false;

                    let keys = Object.keys(props);
                    for (let i = 0; i < keys.length; i++) {
                        let prop = keys[i];
                        let text = props[prop].toLowerCase();
                        let splitedTexts = text.split(' ');
                        let itemVal = item[prop].toString().toLowerCase();

                        let found = true;
                        for (let j = 0; j < splitedTexts.length; j++) {
                            if (itemVal.indexOf(splitedTexts[j]) < 0) {
                                found = false;
                                break;
                            }
                        }

                        itemMatches = found;
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    });

    PDMA.filter('contentType', ['Utilities', function (utils) {
        return function (cc) {
            return utils.translateContentType(cc);
        };
    }]);

    PDMA.filter('weekDay', [function () {
        return function (input) {
            if (input < 2 || input > 8) {
                return '';
            }

            let arr = ['Th??? Hai', 'Th??? Ba', 'Th??? T??', 'Th??? N??m', 'Th??? S??u', 'Th??? B???y', 'Ch??? Nh???t'];
            return arr[input - 2];
        };
    }]);

    PDMA.filter('monthString', ['$filter', function ($filter) {
        return function (input) {
            if (!input) {
                return '&mdash;';
            }

            let obj = moment(input);
            let months = ['Th??ng M???t', 'Th??ng Hai', 'Th??ng Ba', 'Th??ng T??', 'Th??ng N??m', 'Th??ng S??u', 'Th??ng B???y', 'Th??ng T??m', 'Th??ng Ch??n', 'Th??ng M?????i', 'Th??ng M?????i M???t', 'Th??ng M?????i Hai'];

            return months[obj.month()] + ', ' + obj.year();
        };
    }]);

    PDMA.filter('weekString', ['$filter', function ($filter) {
        return function (input) {
            let m = moment(input, 'YYYY-MM-DD').add(1, 'day');
            let obj = moment(input, 'YYYY-MM-DD').add(1, 'day');

            let fromDate = m.startOf('isoWeek').toDate();
            let toDate = m.endOf('isoWeek').toDate();

            return 'T. ' + obj.week() + '/' + obj.year() + ' (' + $filter('date')(fromDate, 'dd/MM/yyyy') + ' - ' + $filter('date')(toDate, 'dd/MM/yyyy') + ')';
        };
    }]);

    PDMA.filter('weekString2', ['$filter', function ($filter) {
        return function (input) {
            let m = moment(input, 'YYYY-MM-DD').add(-1, 'day');
            let obj = moment(input, 'YYYY-MM-DD').add(-1, 'day');

            let fromDate = m.startOf('isoWeek').toDate();
            let toDate = m.endOf('isoWeek').toDate();

            return 'S??? LI???U ?????N TU???N ' + obj.week() + '/' + obj.year();
        };
    }]);

    PDMA.filter('dateString', ['$filter', function ($filter) {
        return function (input) {
            let m = moment(input, 'YYYY-MM-DD');
            let dayArr = ['Ch??? Nh???t', 'Th??? Hai', 'Th??? Ba', 'Th??? T??', 'Th??? N??m', 'Th??? S??u', 'Th??? B???y'];

            return dayArr[m.day()] + ', ' + m.format('DD/MM/YYYY');
        };
    }]);

    PDMA.filter('appointmentStatus', ['$filter', function ($filter) {
        return function (input) {
            if (!input || !input.id || !input.appointmentDate) {
                return '';
            }

            let ret = '';
            let arrivalDate = input.arrivalDate;
            if (arrivalDate) {
                let mArrivalDate = moment(arrivalDate);

                if (mArrivalDate.isSame(input.appointmentDate, 'day')) {
                    ret = '????ng h???n';
                } else if (mArrivalDate.isAfter(input.appointmentDate, 'day')) {
                    ret = 'tr??? h???n';
                } else {
                    ret = 'tr?????c h???n';
                }
            } else {
                if (input.missed) {
                    ret = 'b??? kh??m';
                } else {
                    ret = 'ch??a t???i';
                }
            }

            return ret;
        };
    }]);

    PDMA.filter('fileSize', function () {
        let units = [
            'bytes',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB'
        ];

        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '?';
            }

            let unit = 0;

            while (bytes >= 1024) {
                bytes /= 1024;
                unit++;
            }

            return bytes.toFixed(+precision) + ' ' + units[unit];
        };
    });

    PDMA.filter('patientStatus', [function () {
        return function (input) {
            switch (input) {
                case 'ACTIVE':
                    return '??ang qu???n l??';
                    break;
                case 'TRANSFERRED_OUT':
                    return '???? chuy???n ??i';
                    break;
                case 'LTFU':
                    return '???? b??? tr???';
                    break;
                case 'DEAD':
                    return '???? t??? vong';
                    break;
                case 'PENDING_ENROLLMENT':
                    return 'Ch??? ti???p nh???n';
                    break;
            }
        };
    }]);

    PDMA.filter('enrollmentType', [function () {
        return function (input) {
            switch (input) {
                case 'NEWLY_ENROLLED':
                    return '????ng k?? m???i';
                    break;
                case 'RETURNED':
                    return '??i???u tr??? l???i';
                    break;
                case 'TRANSFERRED_IN':
                    return 'Chuy???n t???i';
                    break;
            }
        };
    }]);

    PDMA.filter('genderString', [function () {
        return function (input) {
            switch (input) {
                case 'MALE':
                    return 'Nam';
                    break;
                case 'FEMALE':
                    return 'N???';
                    break;
                case 'TRANSGENDER':
                    return 'Chuy???n gi???i';
                    break;
                case 'OTHER':
                    return 'Kh??c';
                    break;
                case 'NOT_DISCLOSED':
                    return 'Kh??ng ti???t l???';
                    break;
            }
        };
    }]);
})();