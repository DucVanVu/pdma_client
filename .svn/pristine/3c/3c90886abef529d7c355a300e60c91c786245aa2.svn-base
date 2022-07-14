/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.PNS').controller('PNSEditController', PNSEditController);

    PNSEditController.$inject = [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        'settings',
        '$cookies',
        '$stateParams',
        'toastr',
        'blockUI',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        '$uibModal',
        'Upload',
        '$location',

        'PNSService'
    ];

    function PNSEditController($rootScope, $scope, $http, $timeout, settings, $cookies, $stateParams, toastr, blockUI, focus, focusFlatpick, openSelectBox, utils, modal, Upload, $location, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        let vm = this;

        vm.prohibited = {
            value: false,
            message: ''
        };

        vm.entry = {
            id: $stateParams.id && $stateParams.id > 0 ? $stateParams.id : null,
            assessmentDate: new Date()
        };

        vm.ips = [
            {id: 'EPIC', name: 'Dự án EPIC'},
            {id: 'HCMC DOH', name: 'Sở y tế TP. Hồ Chí Minh'},
            {id: 'HMU', name: 'Trường đại học Y Hà Nội'},
            {id: 'HAIVN', name: 'Tổ chức HAIVN'}
        ];
        vm.orgsReadable = [];
        vm.orgsWritable = [];

        // Option for the editor
        vm.editorOptions = {
            toolbar: [
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'clear'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
            ]
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // List of assigned organizations
                vm.orgsReadable = $scope.assignedOrgs.readable;
                vm.orgsWritable = $scope.assignedOrgs.writable;

                if (vm.orgsWritable && vm.orgsWritable.length == 1 && !vm.entry.id) {
                    vm.entry.facility = {};
                    angular.copy(vm.orgsWritable[0], vm.entry.facility);
                } else {
                    // get entry
                    vm.getEntry();
                }
            }
        });

        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Chọn ngày..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
        };

        // For assessment date selection
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    const m = moment(d, 'YYYY-MM-DD');
                    vm.entry.assessmentDate = m.add(7, 'hours').toDate();
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;

                if (vm.entry.assessmentDate) {
                    fpItem.setDate(moment(vm.entry.assessmentDate).toDate());
                }
            },
            clear: function () {
                if (vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.clear();
                    vm.entry.assessmentDate = null;
                }
            }
        };

        vm.statusPaneVis = {
            value: true,
            toggle: function () {
                vm.statusPaneVis.value = !vm.statusPaneVis.value;
                if (vm.statusPaneVis.value) {
                    $cookies.put(service.INSTRUCTION_VISIBILITY, '1');
                } else {
                    $cookies.put(service.INSTRUCTION_VISIBILITY, '0');
                }
            },
            resume: function () {
                // check visibility of status pane
                let savedVis = $cookies.get(service.INSTRUCTION_VISIBILITY);
                if (savedVis == '0') {
                    vm.statusPaneVis.value = false;
                }
            }
        };

        vm.statusPaneVis.resume();

        // Page controller
        const MIN_PAGE = 1;
        const MAX_PAGE = 14;

        vm.page = {
            current: MIN_PAGE,
            max: MAX_PAGE,
            pages: [],
            change: function (input) {
                let p = vm.page.current + input;
                if (p < 1) {
                    p = 1;
                } else if (p > vm.page.max) {
                    p = vm.page.max;
                }

                if (input == -1 || vm.entry.locked || p == 2) {
                    vm.page.current = p;
                    // $cookies.put(service.CURRENT_PAGE, vm.page.current);

                    App.scrollTop();
                } else {
                    vm.save(p);
                }
            },
            jump: function (toPage) {
                let p = toPage;
                if (p < 1) {
                    p = 1;
                } else if (p > vm.page.max) {
                    p = vm.page.max;
                }

                vm.page.current = p;
                // $cookies.put(service.CURRENT_PAGE, vm.page.current);
                App.scrollTop();
            },
            init: function () {
                // let savedPage = parseFloat($cookies.get(service.CURRENT_PAGE));
                // if (savedPage <= vm.page.max && savedPage >= 1) {
                //     vm.page.current = savedPage;
                // }

                for (let i = 1; i <= 14; i++) {
                    vm.page.pages.push({id: i, value: 'Trang ' + i});
                }
            }
        };

        vm.page.init();

        // Keep track of the current page in cookies when user jump page using the select box
        // $scope.$watch('vm.page.current', function (newVal, oldVal) {
        //     $cookies.put(service.CURRENT_PAGE, vm.page.current);
        // });

        /**
         * Get entry by ID
         */
        vm.getEntry = function () {
            if (!vm.entry.id) {
                return;
            }

            service.getEntry(vm.entry.id).then(function (data) {
                if (!data || !data.id) {
                    return;
                }

                vm.entry = {};
                angular.copy(data, vm.entry);

                vm.normalizeProps();
            });
        };

        /**
         * Normalize props
         */
        vm.normalizeProps = function () {
            // 1.1 = 4 (a, b, c, d), 1.2 = 5, 1.3 = 6, 1.4 = 2, 1.5 = 6, 1.6 = 4, 1.7 = 5
            let propSizes = [4, 5, 6, 2, 6, 4, 5];
            let arr = 'a|b|c|d|e|f'.split('|');

            for (let i = 0; i < 7; i++) {
                vm.entry['q1_' + (i + 1)] = [];
                for (let j = 0; j < propSizes[i]; j++) {
                    let val = vm.entry['q1_' + (i + 1) + arr[j]];

                    if (val > 0) {
                        vm.entry['q1_' + (i + 1)][j] = val;
                    }
                }
            }

            // Delimited values
            arr = 'q2_3|q2_6|q3_4|q4_1|q5_1|q5_2'.split('|');
            propSizes = [5, 5, 5, 3, 6, 5];
            for (let i = 0; i < arr.length; i++) {

                if (!vm.entry[arr[i]]) {
                    continue;
                }

                let vals = vm.entry[arr[i]];
                vm.entry[arr[i] + '_tmp'] = [];

                for (let j = 0; j < propSizes[i]; j++) {
                    let val = j + 1;

                    if (vals.includes(val.toString())) {
                        vm.entry[arr[i] + '_tmp'][j] = true;
                    } else {
                        vm.entry[arr[i] + '_tmp'][j] = false;
                    }
                }
            }

            // failedCEEs
            vm.entry.failedCEETexts = [];
            angular.forEach(vm.entry.failedCEEs, function (obj) {
                for (let i = 0; i < vm.failedCEEs.length; i++) {
                    if (obj == vm.failedCEEs[i].id) {
                        vm.entry.failedCEETexts.push(vm.failedCEEs[i]);
                        break;
                    }
                }
            });

            // Locked?
            vm.entry.locked = vm.entry.submitted || !$scope.currentUser || !$scope.isSiteManager($scope.currentUser);
        };

        /**
         * Update the answers based on selection
         * @param q
         */
        vm.updateCriteria = function (q) {
            let arr = 'a|b|c|d|e|f'.split('|');
            let indx = 0;
            angular.forEach(vm.entry[q], function (val, key) {
                let prop = q + arr[indx++];
                vm.entry[prop] = parseFloat(val);

                // q.. == 1 -> q.._text = null
                if (vm.entry[prop] == 1) {
                    vm.entry[prop + '_text'] = null;
                }
            });

            // q1_7c != 1 or q1_7e != 1 -> q1_7c/e_text2 = null
            if ('q1_7c|q1_7e'.includes(q)) {
                if (vm.entry[q] != 1) {
                    vm.entry[q + '_text2'] = null;
                }
            }
        };

        /**
         * Update the delimited properties based on selection
         * @param q
         */
        vm.updateDelimitedProps = function (q) {
            if (!q) {
                return;
            }

            let prop = '';
            angular.forEach(vm.entry[q + '_tmp'], function (val, key) {
                if (val == true) {
                    let key2 = parseFloat(key) + 1;
                    prop += key2 + '|';
                }
            });

            if (prop.endsWith('|')) {
                prop = prop.substr(0, prop.length - 1);
            }

            vm.entry[q] = prop;

            // change text based on values
            if (q == 'q4_1') {
                if (!vm.entry[q].includes('1') && !vm.entry[q].includes('2')) {
                    vm.entry['q4_2'] = null;
                }
            } else if ('q3_4|q2_6|q2_3'.includes(q)) {
                // q3_4 = 5 -> q3_4_text
                // q2_6 = 5 -> q2_6_text
                // q2_3 = 5 -> q2_3_text

                if (!vm.entry[q].includes('5')) {
                    vm.entry[q + '_text'] = null;
                }
            }
        };

        /**
         * Make sure boolean properties are correctly stored
         */
        vm.updateBooleanProps = function (q) {
            if (vm.entry[q] == null) {
                return;
            }

            vm.entry[q] = parseFloat(vm.entry[q]);

            let qs = 'q1_7f,q4_3';
            if (qs.includes(q) && vm.entry[q] == 0) {
                vm.entry[q + '_text'] = null;
            }
        };

        /**
         * Before submission
         */
        vm.beforeSubmit = function () {

            if (vm.entry.locked) {
                return;
            }

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirm_submission_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
            });
        };

        /**
         * Submit the assessment
         */
        vm.submit = function () {

            if (vm.entry.locked) {
                return;
            }

            vm.entry.submitted = true;
            service.submit(vm.entry, function success() {
                toastr.info('Báo cáo đã được chuyển lên tuyến trên.', 'Thông báo');
            }, function failure() {
                toastr.error('Có lỗi xảy ra khi gửi báo cáo lên tuyến trên.', 'Thông báo');
            }).then(function (data) {
                if (data) {
                    vm.entry = {};
                    angular.copy(data, vm.entry);
                    vm.normalizeProps();
                }

                if (vm.modalInstance) {
                    vm.modalInstance.close();
                }
            });
        };

        /**
         * Save the assessment (and move to the given page)
         * @param p
         */
        vm.save = function (p, callback = null, silent = false) {

            if (vm.entry.locked) {
                return;
            }

            if (vm.prohibited.value) {
                toastr.warning('Bạn không thể lưu đánh giá cho cơ sở này!', 'Thông báo');
                return;
            }

            // validate
            let hasError = false;
            switch (vm.page.current) {
                case 1:
                    if (!vm.entry.facility || !vm.entry.facility.id) {
                        openSelectBox('vm.entry.facility');
                        toastr.error('Vui lòng chọn cơ sở cần đánh giá.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.ip) {
                        openSelectBox('vm.entry.ip');
                        toastr.error('Vui lòng chọn tên đối tác triển khai.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.assessorName) {
                        focus('vm.entry.assessorName');
                        toastr.error('Vui lòng nhập tên người tiến hành buổi đánh giá.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.assessorEmail) {
                        focus('vm.entry.assessorEmail');
                        toastr.error('Vui lòng nhập địa chỉ email của người tiến hành buổi đánh giá.', 'Thông báo');
                        hasError = true;
                    } else if (!utils.validEmail(vm.entry.assessorEmail)) {
                        focus('vm.entry.assessorEmail');
                        toastr.error('Địa chỉ email không hợp lệ.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.assessmentDate) {
                        focusFlatpick('vm.entry.assessmentDate');
                        toastr.error('Vui lòng nhập ngày đánh giá.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.facilityPocName) {
                        focus('vm.entry.facilityPocName');
                        toastr.error('Vui lòng nhập tên của người đầu mối liên hệ tại cơ sở cung cấp dịch vụ hỗ trợ cho buổi đánh giá.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.counselorCount) {
                        focus('vm.entry.counselorCount');
                        toastr.error('Vui lòng nhập số lượng nhân viên/tư vấn viên cung cấp dịch vụ tư vấn xét nghiệm HIV tại cơ sở này.', 'Thông báo');
                        hasError = true;
                    } else if (!vm.entry.counselor4Pns) {
                        focus('vm.entry.counselor4Pns');
                        toastr.error('Vui lòng nhập số lượng nhân viên/tư vấn viên làm công việc cung cấp dịch vụ TBXNBT/BC tại cơ sở này.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 2:
                    if (!vm.entry.q1_1 || Object.keys(vm.entry.q1_1).length < 4) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 3:
                    if (!vm.entry.q1_2 || Object.keys(vm.entry.q1_2).length < 5) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d, e.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 4:
                    if (!vm.entry.q1_3 || Object.keys(vm.entry.q1_3).length < 6) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d, e, f.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 5:
                    if (!vm.entry.q1_4 || Object.keys(vm.entry.q1_4).length < 2) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 6:
                    if (!vm.entry.q1_5 || Object.keys(vm.entry.q1_5).length < 6) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d, e, f.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 7:
                    if (!vm.entry.q1_6 || Object.keys(vm.entry.q1_6).length < 4) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d.', 'Thông báo');
                        hasError = true;
                    }
                    break;
                case 8:
                    if (!vm.entry.q1_7 || Object.keys(vm.entry.q1_7).length < 5) {
                        toastr.error('Vui lòng trả lời hết các câu hỏi a, b, c, d, e.', 'Thông báo');
                        hasError = true;
                    } else if (vm.entry.q1_7f == null) {
                        toastr.error('Vui lòng trả lời thêm câu hỏi 1.7.f.', 'Thông báo');
                        hasError = true;
                    }
                    break;
            }

            if (hasError) {
                return;
            }

            blockUI.start();
            service.saveEntry(vm.entry, function success() {
                blockUI.stop();
                if (!silent) {
                    toastr.info('Các câu trả lời đã được lưu...', 'Thông báo');
                }
            }, function failure() {
                blockUI.stop();
                if (!silent) {
                    toastr.error('Có lỗi khi lưu câu trả lời...', 'Thông báo');
                }
            }).then(function (data) {
                if (!silent) {
                    if (data && data.id) {
                        vm.entry = {};
                        angular.copy(data, vm.entry);
                        vm.normalizeProps();

                        if ($stateParams.id == 0) {
                            $location.path('/pns-assess-edit/' + vm.entry.id);
                        }
                    }

                    $timeout(function () {
                        // clear all toastrs
                        toastr.clear();
                    }, 3000);

                    vm.page.current = p;
                    // $cookies.put(service.CURRENT_PAGE, vm.page.current);

                    App.scrollTop(); // scroll to the top on content load
                }

                if (callback) {
                    callback();
                }
            });
        };

        /**
         * Upload files for the current assessment
         */
        vm.uploader = {
            uploadedFile: null,
            errorFile: null,
            modalDialog: null,
            prop: null,
            MAX_FILE_SIZE: settings.upload.maxFilesize,
            showUploadModal: function (prop) {

                if (!prop) {
                    return;
                }

                vm.save(vm.page.current, function callback() {
                    // helps identify which property of the assessment
                    vm.uploader.prop = prop;

                    vm.uploader.modalDialog = modal.open({
                        animation: true,
                        templateUrl: 'upload_file_modal.html',
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        size: 'md'
                    });
                }, true);
            },
            triggerUpload: function (file, errFiles) {
                vm.uploader.uploadedFile = file;
                vm.uploader.errorFile = errFiles && errFiles[0];
            },
            startUploadFile: function (file) {

                if (vm.entry.locked) {
                    return;
                }

                if (file) {
                    let url = settings.api.baseUrl + settings.api.apiV1Url + 'pns_assessment/upload/' + vm.entry.id + '/' + vm.uploader.prop;

                    console.log(url);

                    file.upload = Upload.upload({
                        url: url,
                        data: {file: file}
                    }).progress(function (evt) {
                        vm.uploader.uploadedFile.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    }).success(function (data, status, headers, config) {
                        $timeout(function () {
                            vm.uploader.uploadedFile = null;
                            vm.uploader.errorFile = null;
                            vm.uploader.modalDialog.close();

                            vm.getEntry();
                        }, 500);
                    });
                }
            },
            closeUploadFile: function () {
                vm.uploader.uploadedFile = null;
                vm.uploader.errorFile = null;

                if (vm.uploader.modalDialog) {
                    vm.uploader.modalDialog.close();
                }
            }
        };

        /**
         * Download attachment
         * @param id
         */
        vm.downloadAttachment = function (id, prop) {
            blockUI.start();
            service.downloadAttachment(id, prop).success(vm.downloadCallback).error(function (data) {
                console.log(data);
            });
        };

        /**
         * Print facility report
         */
        vm.printFacilityReport = function () {
            blockUI.start();
            service.downloadFacilityReport(vm.entry.id).success(vm.downloadCallback).error(function (data) {
                console.log(data);
            });
        };

        /**
         * Download callback
         *
         * @param data
         * @param status
         * @param headers
         * @param config
         */
        vm.downloadCallback = function (data, status, headers, config) {
            blockUI.stop();

            headers = headers();

            let filename = headers['x-filename'];
            let contentType = headers['content-type'];

            let linkElement = document.createElement('a');
            try {
                let blob = new Blob([data], {type: contentType});
                let url = window.URL.createObjectURL(blob);

                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", filename);

                let clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
            } catch (ex) {
                console.log(ex);
            }
        };

        $scope.$watch('vm.entry.ip', function (newVal, oldVal) {
            if (newVal) {
                angular.forEach(vm.ips, function (obj) {
                    if (newVal == obj.id) {
                        vm.entry.ipName = obj.name;
                    }
                });
            }
        });

        // watch the facility to make sure that facility cannot has more than one baseline/post entry
        $scope.$watch('vm.entry.facility', function (newVal, oldVal) {

            // do not need to check for existing (unsubmitted) entries
            if (vm.entry.id || vm.prohibited.messageShown) {
                return;
            }

            if (newVal && newVal.id) {

                // reset
                vm.prohibited = {
                    messageShown: true,
                    value: false,
                    message: ''
                };

                blockUI.start();
                service.hasBaseline(newVal.id).then(function (data) {
                    blockUI.stop();
                    if (data) {
                        vm.prohibited = {
                            value: true,
                            message: 'Bạn đã thực hiện một đánh giá đầu vào cho cơ sở này. Bạn vui lòng chờ hết thời gian đánh giá đầu vào nếu muốn thực hiện đánh giá giữa kỳ.'
                        };

                        vm.entry.locked = true;

                        modal.open({
                            animation: true,
                            templateUrl: 'prohibited_modal.html',
                            scope: $scope,
                            size: 'md',
                            backdrop: 'static',
                            keyboard: false
                        });
                    } else {
                        blockUI.start();
                        service.hasPost(newVal.id).then(function (data2) {
                            blockUI.stop();
                            if (data2) {
                                vm.prohibited = {
                                    messageShown: true,
                                    value: true,
                                    message: 'Bạn đã thực hiện một đánh giá sau can thiệp cho cơ sở này. Bạn vui lòng chờ hết thời gian đánh giá sau can thiệp nếu muốn thực hiện đánh giá định kỳ.'
                                };

                                vm.entry.locked = true;

                                modal.open({
                                    animation: true,
                                    templateUrl: 'prohibited_modal.html',
                                    scope: $scope,
                                    size: 'md',
                                    backdrop: 'static',
                                    keyboard: false
                                });
                            }
                        });
                    }
                });
            }
        });

        // Questions
        vm.questions = {
            q1_1: {
                name: 'Mục 1.1. Tư vấn',
                description: 'Tất cả khách hàng có KQXN HIV dương tính cần được trao đổi về cách tiến hành TBXNBT/BC',
                questions: [
                    {
                        id: '1a',
                        name: 'a. Tại buổi tư vấn trước xét nghiệm HIV, tư vấn viên có trao đổi với tất cả khách hàng về TBXNBT/BC và tầm quan trọng của việc xét nghiệm HIV cho BT/BC và con của họ không?'
                    },
                    {
                        id: '1b',
                        name: 'b. Tư vấn viên có trao đổi với tất cả khách hàng là người có HIV (NCH) về lợi ích và rủi ro khi nhận dịch vụ TBXNBT/BC không?'
                    },
                    {
                        id: '1c',
                        name: 'c. Tư vấn viên có giới thiệu với NCH tất cả 4 biện pháp thực hiện TBXNBT/BC đồng thời thảo luận lợi ích và rủi ro của từng biện pháp này không?'
                    },
                    {
                        id: '1d',
                        name: 'd. Tư vấn viên có nói rằng NCH không nhất thiết phải là người thông báo cho BT/BC của họ và nhân viên chương trình sẽ giúp đồng thời không tiết lộ danh tính của NCH khi liên hệ với BT/BC?'
                    }
                ]
            },
            q1_2: {
                name: 'Mục 1.2. Đồng thuận',
                description: 'NCH phải đồng ý một cách rõ ràng về việc tham gia dịch vụ TBXNBT/BC (có nghĩa là đồng ý chia sẻ thông tin về BT/BC) và đồng ý cho TVV trực tiếp liên lạc với BT/BC của họ nếu lựa chọn biên pháp nhân viên hỗ trợ thực hiện. NCH phải được thông tin là họ có quyền tham gia, dừng hoặc tham gia lại vào bất cứ lúc nào và sự tham gia hay không của NCH sẽ không ảnh hưởng đến việc họ nhận dịch vụ khác.',
                questions: [
                    {
                        id: '2a',
                        name: 'a. Tư vấn viên thông báo rằng tất cả NCH có thể từ chối nhận dịch vụ TBXNBT/BC bất kể khi nào và điều này không ảnh hưởng đến các dịch vụ mà họ nhận được (ví dụ như họ cảm thấy có áp lực phải tiết lộ danh tính)?'
                    },
                    {
                        id: '2b',
                        name: 'b. Khi đã đồng thuận và trước khi thảo luận cụ thể danh sách BT/BC và con phơi nhiễm HIV, tư vấn viên có đề nghị tất cả NCH ký vào phiếu đồng ý thông báo BT/BC không?'
                    },
                    {
                        id: '2c',
                        name: 'c. Nếu NCH trước đó đã thống nhất chọn biện pháp nhân viên thực hiện (kể cả khi chuyển từ biện pháp thỏa thuận thực hiện hoặc biện pháp NCH tự thực hiện), tư vấn viên cần khẳng định lại với NCH liệu họ vẫn đồng ý trước khi tư vấn viên trực tiếp liên lạc với BT/BC không?'
                    },
                    {
                        id: '2d',
                        name: 'd. Tại cơ sở, có tài liệu truyền thông cho NCH để nâng cao nhận thức về quyền khách hàng rằng họ không bị ép buộc phải nhận dịch vụ TBXNBT/BC và nhận dịch vụ là hoàn toàn tự nguyện?'
                    },
                    {
                        id: '2e',
                        name: 'e. Tài liệu truyền thông cho NCH có các thông tin về các cách NCH có thể báo cáo việc vi phạm quyền khách hàng và cách nhận được sự hỗ trợ nếu BT/BC có phản ứng tiêu cực sau khi liên lạc không?'
                    }
                ]
            },
            q1_3: {
                name: 'Mục 1.3. Bảo mật',
                description: 'Phải thực hiện các nỗ lực để bảo mật cho khách hàng khi xét nghiệm HIV, trả KQXN và trao đổi để có danh sách BT/BC của NCH',
                questions: [
                    {
                        id: '3a',
                        name: 'a. Tư vấn về dịch vụ TBXNBT/BC và đánh giá nguy cơ bạo lực từ từng BT/BC có được thực hiện trong không gian riêng tư không? <span class="bold">[hãy quan sát để xác thực]</span>'
                    },
                    {
                        id: '3b',
                        name: 'b. Cả hai biện pháp sau đây đang được áp dụng để bảo vệ tên, địa chỉ, số điện thoại v.v. của NCH và BT/BC: 1). hồ sơ của họ được lưu giữ ở tủ có khóa; và 2). cơ sở dữ liệu được bảo vệ, và chỉ có nhân viên chịu trách nhiệm có quyền truy cập? <span class="bold">[hãy kiểm tra để xác thực]</span>'
                    },
                    {
                        id: '3c',
                        name: 'c. Mỗi nhân viên cung cấp dịch vụ TBXNBT/BC đã ký 01 bản "Thỏa thuận cam kết bảo mật” và lưu giữ tại cơ sở? <span class="bold">[hãy kiểm tra rồi xác thực]</span>'
                    },
                    {
                        id: '3d',
                        name: 'd. Nếu cơ sở phối hợp với một bên thứ ba để tiến hành việc thông báo, tiếp cận/xét nghiệm BT/BC của NCH (bước 5-6 trong quy trình): tư vấn viên đã trao đổi và nhận được sự đồng thuận của NCH đồng thời cơ sở có ký và lưu giữ bản "Thỏa thuận chia sẻ dữ liệu" với bên thứ ba đó để cùng bảo mật về tên và thông tin liên lạc của BT/BC và con? <span class="bold">[kiểm tra để xác thực và tải văn bản đã ký]</span>. <br /><br /><span class="bold">Lưu ý:</span> nếu cơ sở không thực hiện cung cấp dịch vụ TBXNBT/BC theo cách cùng phối hợp với bên thứ ba, hãy chọn mục "Có/Tất cả/Luôn luôn"'
                    },
                    {
                        id: '3e',
                        name: 'e. Hiện nay cơ sở có bản hướng dẫn hoặc quy trình thực hiện cách liên lạc, thông báo BT/BC qua gửi tin nhắn, gọi điện thoại, đến nhà hoặc gặp trực tiếp, các ứng dụng mạng xã hội phù hợp và đảm bảo riêng tư, bảo mật, vô danh? <span class="bold">[hãy kiểm tra để xác thực và tải lên hướng dẫn hoặc quy trình này]</span>'
                    },
                    {
                        id: '3f',
                        name: 'f. Sổ cung cấp dịch vụ TBXNBT/BC có ghi nhận thông tin về đường phơi nhiễm HIV của các BT/BC không? (nếu trả lời “Có”, cần thay đổi sổ)'
                    }
                ]
            },
            q1_4: {
                name: 'Mục 1.4 Kết nối dịch vụ',
                description: 'Tất cả khách hàng cần được chuyển tiếp phù hợp tới các dịch vụ dự phòng và điều trị có liên quan tùy theo KQXN HIV',
                questions: [
                    {
                        id: '4a',
                        name: 'a. Cơ sở có quy trình để chuyển tiếp tất cả BT/BC và con đẻ có KQXN khẳng định HIV dương tính tới các dịch vụ điều trị ARV?'
                    },
                    {
                        id: '4b',
                        name: 'b. Cơ sở có quy trình để chuyển tiếp BT/BC có KQXN HIV âm tính tới các dịch vụ dự phòng HIV như PrEP, BCS, BKT, MMT, v.v.?'
                    }
                ]
            },
            q1_5: {
                name: '1.5. Đánh giá nguy cơ bạo lực từ BT/BC',
                description: 'Đánh giá nguy cơ bạo lực cho từng BT/BC mà NCH chia sẻ để xác định cách thông báo và trợ giúp phù hợp xét nghiệm BT/BC',
                questions: [
                    {
                        id: '5a',
                        name: 'a. Tư vấn viên có sử dụng 3 câu hỏi chuẩn đã được hướng dẫn để xác định nguy cơ bạo lực từ từng BT/BC không? <span class="bold">[xác thực là cơ sở có sẵn 3 câu hỏi xác định nguy cơ bạo lực]</span>'
                    },
                    {
                        id: '5b',
                        name: 'b. Tư vấn viên ghi nhận kết quả đánh giá nguy cơ bạo lực cho từng BT/BC được NCH chia sẻ không? <span class="bold">[xác thực trong phiếu thông tin bạn tình, bạn chích chung, con đẻ phơi nhiễm HIV]</span>'
                    },
                    {
                        id: '5c',
                        name: 'c. Để đảm bảo an toàn cho NCH, BT/BC có nguy cơ bao lực, cơ sở có hướng dẫn hoặc quy trình về: 1). lựa chọn biện pháp liên lạc, thông báo phù hợp; hoặc 2). cách làm giảm/loại trừ nguy cơ bạo lực; hoặc 3). lựa chọn biện pháp thay thế; hoặc 4). không liên lạc/thông báo cho BT/BC? <span class="bold">[xác thực có sẵn hướng dẫn hoặc quy trình này]</span>'
                    },
                    {
                        id: '5d',
                        name: 'd. Tư vấn viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về công tác hỗ trợ ban đầu khi xác định có nguy cơ hoặc xảy ra bạo lực từ BT/BC?'
                    },
                    {
                        id: '5e',
                        name: 'e. Tư vấn viên có danh sách các dịch vụ hỗ trợ thân thiện hiện nay về phòng chống bạo lực tại địa phương không? <span class="bold">[xác thực sự sẵn có danh sách này]</span>'
                    },
                    {
                        id: '5f',
                        name: 'f. Cơ sở có hệ thống chuyển tiếp NCH, BT/BC được xác định có nguy cơ hoặc bị bạo lực tới các dịch vụ hỗ trợ thân thiện liên quan?'
                    }
                ]
            },
            q1_6: {
                name: 'Mục 1.6. Đào tạo và giám sát hỗ trợ',
                description: 'Giám sát hỗ trợ gồm các biện pháp giúp nhân viên liên tục cải thiện việc thực hiện và kết quả công việc. Giám sát hỗ trợ được thực hiện trên tinh thần tôn trọng và có thể bao gồm thảo luận trường hợp, quan sát phản hồi trực tiếp để giúp nhân viên nâng cao kiến thức và kỹ năng',
                questions: [
                    {
                        id: '6a',
                        name: 'a. Tất cả nhân viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về cách tiến hành dịch vụ này một cách an toàn, phù hợp với chuẩn mực đạo đức, sử dụng chương trình và tài liệu tập huấn chuẩn đáp ứng tất cả các tiêu chuẩn trong hướng dẫn quốc gia/PEPFAR về TBXNBT/BC?'
                    },
                    {
                        id: '6b',
                        name: 'b. Nội dung các lớp tập huấn TBXNBT/BC có nhấn mạnh việc bảo mật, tôn trọng quyền của khách hàng, sự đồng thuận nhận dịch vụ và "không làm ai tổn thương"? <span class="bold">[tải lên tài liệu tập huấn]</span>'
                    },
                    {
                        id: '6c',
                        name: 'c. Mỗi tư vấn viên cung cấp dịch vụ TBXNBT/BC đã được giám sát hỗ trợ ít nhất một đợt (gồm quan sát phản hồi trực tiếp và có biên bản ghi nhận kết quả) trong vòng 12 tháng qua? <span class="bold">[xác thực công cụ sử dụng và biên bản ghi nhận kết quả đợt giám sát hỗ trợ]</span>'
                    },
                    {
                        id: '6d',
                        name: 'd. Cơ sở có kế hoạch định kỳ thực hiện quan sát phản hồi và hướng dẫn theo cách cầm tay chỉ việc cho các tư vấn viên cung cấp dịch vụ TBXNBT/BC không?'
                    }
                ]
            },
            q1_7: {
                name: 'Mục 1.7. Theo dõi và xử trí các tình huống không mong muốn',
                description: 'Hệ thống theo dõi và xử trí các tình huống không mong muốn cho phép khách hàng và nhân viên báo cáo các hậu quả không mong muốn xảy ra do dịch vụ TBXNBT/BC (bao gồm nhưng không chỉ giới hạn về tổn hại thể chất và kinh tế)',
                questions: [
                    {
                        id: '7a',
                        name: 'a. Tất cả nhân viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về theo dõi, báo cáo và xử trí tình huống không mong muốn chưa?'
                    },
                    {
                        id: '7b',
                        name: 'b. Cơ sở có hệ thống theo dõi và điều tra tất cả các báo cáo về tình huống không mong muốn nghiêm trọng và rất nghiêm trọng như hướng dẫn của PEPFAR không?'
                    },
                    {
                        id: '7c',
                        name: 'c. Trong các lần tái khám/gọi điện thoại/liên lạc, nhân viên cung cấp dịch vụ TBXNBT/BC thường xuyên hỏi NCH về bất kỳ tình huống không mong muốn họ gặp phải liên quan tới dịch vụ TBXNBT/BC sau khi BT/BC được thông báo/xét nghiệm HIV?'
                    },
                    {
                        id: '7d',
                        name: 'd. Cơ sở có sử dụng hộp thư góp ý của khách hàng hoặc đường dây nóng, v.v. để NCH thông báo các tình huống không mong muốn dưới hình thức giấu tên không?'
                    },
                    {
                        id: '7e',
                        name: 'e. Cơ sở có cơ chế để nhân viên cung cấp dịch vụ TBXNBT/BC thông báo về trải nghiệm của bản thân hoặc những lần họ quan sát được tình huống không mong muốn như nhân viên lạm dụng, bắt giữ, vi phạm bảo mật, tiết lộ tình trạng HIV, v.v. dưới hình thức giấu tên không?'
                    }
                ],
                additionalQuestion_1: '1.7.f. Cơ sở có quy trình để xác định, điều tra và xử trí các tình huống không mong muốn liên quan trực tiếp đến TBXNBT/BC không?',
                additionalQuestion_2: 'Nếu sẵn có, hãy tải biểu mẫu trống chưa điền về việc báo cáo và ghi nhận các tình huống bạo lực liên quan đến dịch vụ TBXNBT/BC. Không tải biểu mẫu đã điền có các thông tin định danh cá nhân khách hàng.'
            },
            q2_3: {
                name: '2.3. Lớp tập huấn TBXNBT/BC đầu tiên được cung cấp theo hình thức nào? (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Trực tiếp với nhóm các học viên'},
                    {id: 2, name: 'Trực tiếp với một cá nhân học viên'},
                    {id: 3, name: 'Trực tuyến với một cá nhân học viên'},
                    {id: 4, name: 'Trực tuyến nhóm các học viên'},
                    {id: 5, name: 'Khác'}
                ]
            },
            q2_6: {
                name: '2.6. Cách đánh giá chất lượng cung cấp dịch vụ TBXNBT/BC của nhân viên? (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Quan sát trực tiếp ngay sau tập huấn về TBXNBT/BC'},
                    {id: 2, name: 'Quan sát định kỳ (hàng tháng hoặc hàng quý)'},
                    {id: 3, name: 'Tổ chức lớp tập huấn lại, tập huấn nâng cao'},
                    {id: 4, name: 'Hướng dẫn theo cách cầm tay chỉ việc/khắc phục phù hợp'},
                    {id: 5, name: 'Khác'}
                ]
            },
            q3_4: {
                name: '3.4. Lớp tập huấn về xử trí tình huống không mong muốn trong BT/BC được cung cấp hình thức nào? (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Trực tiếp với nhóm các học viên'},
                    {id: 2, name: 'Trực tiếp với một cá nhân học viên'},
                    {id: 3, name: 'Trực tuyến với một cá nhân học viên'},
                    {id: 4, name: 'Trực tuyến nhóm các học viên'},
                    {id: 5, name: 'Khác'}
                ]
            },
            q4_1: {
                name: '4.1. Nhóm người có nguy cơ cao/nhóm đích hoặc nhóm người có HIV nào dưới đây tham gia giám sát cơ sở trong việc cung cấp dịch vụ TBXNBT/BC? (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Nhóm người có hành vi nguy cơ cao/nhóm đích'},
                    {id: 2, name: 'Nhóm của người sống chung với HIV'},
                    {id: 3, name: 'Khác'}
                ]
            },
            q5_1: {
                name: '5.1. Nhóm người có hành vi nguy cơ cao/nhóm đích nào dưới đây nhận dịch vụ TBXNBT/BC tại cơ sở? (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Nam quan hệ tình dục với nam'},
                    {id: 2, name: 'Mại dâm'},
                    {id: 3, name: 'Người chuyển giới nữ'},
                    {id: 4, name: 'Người tiêm chích ma túy'},
                    {id: 5, name: 'Người trong các trại giam hoặc cơ sở khép kín'},
                    {id: 6, name: 'Khác'}
                ]
            },
            q5_2: {
                name: '5.2. Ở nước bạn, nhóm nào dưới đây bị coi là tội phạm? Lưu ý: có thể không cung cấp dịch vụ TBXNBT/BC cho nhóm bị coi là tội phạm nếu không an toàn (chọn tất cả các ô phù hợp)',
                options: [
                    {id: 1, name: 'Nam quan hệ tình dục với nam'},
                    {id: 2, name: 'Mại dâm'},
                    {id: 3, name: 'Người chuyển giới nữ'},
                    {id: 4, name: 'Người tiêm chích ma túy'},
                    {id: 5, name: 'Không nhóm nào ở trên'}
                ]
            },
        };

        vm.failedCEEs = [
            {
                id: 'q1_1a',
                val: '1.1A: Tại buổi tư vấn trước xét nghiệm HIV, tư vấn viên có trao đổi với tất cả khách hàng về TBXNBT/BC và tầm quan trọng của việc xét nghiệm HIV cho BT/BC và con của họ không?',
                page: 2
            },
            {
                id: 'q1_1b',
                val: '1.1B: Tư vấn viên có trao đổi với tất cả khách hàng là người có HIV (NCH) về lợi ích và rủi ro khi nhận dịch vụ TBXNBT/BC không?',
                page: 2
            },
            {
                id: 'q1_1c',
                val: '1.1C: Tư vấn viên có giới thiệu với NCH tất cả 4 biện pháp thực hiện TBXNBT/BC đồng thời thảo luận lợi ích và rủi ro của từng biện pháp này không?',
                page: 2
            },
            {
                id: 'q1_1d',
                val: '1.1D: Tư vấn viên có nói rằng NCH không nhất thiết phải là người thông báo cho BT/BC của họ và nhân viên chương trình sẽ giúp đồng thời không tiết lộ danh tính của NCH khi liên hệ với BT/BC?',
                page: 2
            },
            {
                id: 'q1_2a',
                val: '1.2A: Tư vấn viên thông báo rằng tất cả NCH có thể từ chối nhận dịch vụ TBXNBT/BC bất kể khi nào và điều này không ảnh hưởng đến các dịch vụ mà họ nhận được (ví dụ như họ cảm thấy có áp lực phải tiết lộ danh tính)?',
                page: 3
            },
            {
                id: 'q1_2b',
                val: '1.2B: Khi đã đồng thuận và trước khi thảo luận cụ thể danh sách BT/BC và con phơi nhiễm HIV, tư vấn viên có đề nghị tất cả NCH ký vào phiếu đồng ý thông báo BT/BC không?',
                page: 3
            },
            {
                id: 'q1_2c',
                val: '1.2C: Nếu NCH trước đó đã thống nhất chọn biện pháp nhân viên thực hiện (kể cả khi chuyển từ biện pháp thỏa thuận thực hiện hoặc biện pháp NCH tự thực hiện), tư vấn viên cần khẳng định lại với NCH liệu họ vẫn đồng ý trước khi tư vấn viên trực tiếp liên lạc với BT/BC không?',
                page: 3
            },
            {
                id: 'q1_2d',
                val: '1.2D: Tại cơ sở, có tài liệu truyền thông cho NCH để nâng cao nhận thức về quyền khách hàng rằng họ không bị ép buộc phải nhận dịch vụ TBXNBT/BC và nhận dịch vụ là hoàn toàn tự nguyện?',
                page: 3
            },
            {
                id: 'q1_3a',
                val: '1.3A: Tư vấn về dịch vụ TBXNBT/BC và đánh giá nguy cơ bạo lực từ từng BT/BC có được thực hiện trong không gian riêng tư không?',
                page: 4
            },
            {
                id: 'q1_3b',
                val: '1.3B: Cả hai biện pháp sau đây đang được áp dụng để bảo vệ tên, địa chỉ, số điện thoại v.v. của NCH và BT/BC: 1). hồ sơ của họ được lưu giữ ở tủ có khóa; và 2). cơ sở dữ liệu được bảo vệ, và chỉ có nhân viên chịu trách nhiệm có quyền truy cập?',
                page: 4
            },
            {
                id: 'q1_3c',
                val: '1.3C: Mỗi nhân viên cung cấp dịch vụ TBXNBT/BC đã ký 01 bản "Thỏa thuận cam kết bảo mật" và lưu giữ tại cơ sở?',
                page: 4
            },
            {
                id: 'q1_3d',
                val: '1.3D: Nếu cơ sở phối hợp với một bên thứ ba để tiến hành việc thông báo, tiếp cận/xét nghiệm BT/BC của NCH (bước 5-6 trong quy trình): tư vấn viên đã trao đổi và nhận được sự đồng thuận của NCH đồng thời cơ sở có ký và lưu giữ bản "Thỏa thuận chia sẻ dữ liệu" với bên thứ ba đó để cùng bảo mật về tên và thông tin liên lạc của BT/BC và con?',
                page: 4
            },
            {
                id: 'q1_3e',
                val: '1.3E: Hiện nay cơ sở có bản hướng dẫn hoặc quy trình thực hiện cách liên lạc, thông báo BT/BC qua gửi tin nhắn, gọi điện thoại, đến nhà hoặc gặp trực tiếp, các ứng dụng mạng xã hội phù hợp và đảm bảo riêng tư, bảo mật, vô danh?',
                page: 4
            },
            {
                id: 'q1_4a',
                val: '1.4A: Cơ sở có quy trình để chuyển tiếp tất cả BT/BC và con đẻ có KQXN khẳng định HIV dương tính tới các dịch vụ điều trị ARV?',
                page: 5
            },
            {
                id: 'q1_4b',
                val: '1.4B: Cơ sở có quy trình để chuyển tiếp BT/BC có KQXN HIV âm tính tới các dịch vụ dự phòng HIV như PrEP, BCS, BKT, MMT, v.v.?',
                page: 5
            },
            {
                id: 'q1_5a',
                val: '1.5A: Tư vấn viên có sử dụng 3 câu hỏi chuẩn đã được hướng dẫn để xác định nguy cơ bạo lực từ từng BT/BC không?',
                page: 6
            },
            {
                id: 'q1_5b',
                val: '1.5B: Tư vấn viên ghi nhận kết quả đánh giá nguy cơ bạo lực cho từng BT/BC được NCH chia sẻ không?',
                page: 6
            },
            {
                id: 'q1_5c',
                val: '1.5C: Để đảm bảo an toàn cho NCH, BT/BC có nguy cơ bao lực, cơ sở có hướng dẫn hoặc quy trình về: 1). lựa chọn biện pháp liên lạc, thông báo phù hợp; hoặc 2). cách làm giảm/loại trừ nguy cơ bạo lực; hoặc 3). lựa chọn biện pháp thay thế; hoặc 4). không liên lạc/thông báo cho BT/BC?',
                page: 6
            },
            {
                id: 'q1_5d',
                val: '1.5D: Tư vấn viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về công tác hỗ trợ ban đầu khi xác định có nguy cơ hoặc xảy ra bạo lực từ BT/BC?',
                page: 6
            },
            {
                id: 'q1_5e',
                val: '1.5E: Tư vấn viên có danh sách các dịch vụ hỗ trợ thân thiện hiện nay về phòng chống bạo lực tại địa phương không?',
                page: 6
            },
            {
                id: 'q1_5f',
                val: '1.5F: Cơ sở có hệ thống chuyển tiếp NCH, BT/BC được xác định có nguy cơ hoặc bị bạo lực tới các dịch vụ hỗ trợ thân thiện liên quan?',
                page: 6
            },
            {
                id: 'q1_6a',
                val: '1.6A: Tất cả nhân viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về cách tiến hành dịch vụ này một cách an toàn, phù hợp với chuẩn mực đạo đức, sử dụng chương trình và tài liệu tập huấn chuẩn đáp ứng tất cả các tiêu chuẩn trong hướng dẫn quốc gia/PEPFAR về TBXNBT/BC?',
                page: 7
            },
            {
                id: 'q1_6b',
                val: '1.6B: Nội dung các lớp tập huấn TBXNBT/BC có nhấn mạnh việc bảo mật, tôn trọng quyền của khách hàng, sự đồng thuận nhận dịch vụ và "không làm ai tổn thương"?',
                page: 7
            },
            {
                id: 'q1_6c',
                val: '1.6C: Mỗi tư vấn viên cung cấp dịch vụ TBXNBT/BC đã được giám sát hỗ trợ ít nhất một đợt (gồm quan sát phản hồi trực tiếp và có biên bản ghi nhận kết quả) trong vòng 12 tháng qua?',
                page: 7
            },
            {
                id: 'q1_6d',
                val: '1.6D: Cơ sở có kế hoạch định kỳ thực hiện quan sát phản hồi và hướng dẫn theo cách cầm tay chỉ việc cho các tư vấn viên cung cấp dịch vụ TBXNBT/BC không?',
                page: 7
            },
            {
                id: 'q1_7a',
                val: '1.7A: Tất cả nhân viên cung cấp dịch vụ TBXNBT/BC đã được tập huấn về theo dõi, báo cáo và xử trí tình huống không mong muốn chưa?',
                page: 8
            },
            {
                id: 'q1_7b',
                val: '1.7B: Cơ sở có hệ thống theo dõi và điều tra tất cả các báo cáo về tình huống không mong muốn nghiêm trọng và rất nghiêm trọng như hướng dẫn của PEPFAR không?',
                page: 8
            },
            {
                id: 'q1_7c',
                val: '1.7C: Trong các lần tái khám/gọi điện thoại/liên lạc, nhân viên cung cấp dịch vụ TBXNBT/BC thường xuyên hỏi NCH về bất kỳ tình huống không mong muốn họ gặp phải liên quan tới dịch vụ TBXNBT/BC sau khi BT/BC được thông báo/xét nghiệm HIV?',
                page: 8
            },
            {
                id: 'q1_7d',
                val: '1.7D: Cơ sở có sử dụng hộp thư góp ý của khách hàng hoặc đường dây nóng, v.v. để NCH thông báo các tình huống không mong muốn dưới hình thức giấu tên không?',
                page: 8
            },
            {
                id: 'q1_7e',
                val: '1.7E: Cơ sở có cơ chế để nhân viên cung cấp dịch vụ TBXNBT/BC thông báo về trải nghiệm của bản thân hoặc những lần họ quan sát được tình huống không mong muốn như nhân viên lạm dụng, bắt giữ, vi phạm bảo mật, tiết lộ tình trạng HIV, v.v. dưới hình thức giấu tên không?',
                page: 8
            },
            {
                id: 'q1_7f',
                val: '1.7F: Cơ sở có quy trình để xác định, điều tra và xử trí các tình huống không mong muốn liên quan trực tiếp đến TBXNBT/BC không?',
                page: 8
            }
        ];

        /// END ///
    }

})();
