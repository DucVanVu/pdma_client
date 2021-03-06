/**
 * Created by bizic on 28/8/2016.
 */
(function () {
    'use strict';

    angular.module('PDMA.SELF_TEST').controller('SelfTestEditController', SelfTestEditController);

    SelfTestEditController.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        'blockUI',
        '$timeout',
        'settings',
        '$stateParams',
        '$uibModal',
        'toastr',
        'focus',
        'focusFlatPick',
        'openSelectBox',
        'Utilities',
        'AdminUnitService',
        'StaffService',
        'SelfTestService'
    ];

    function SelfTestEditController($rootScope, $scope, $state, blockUI, $timeout, settings, $stateParams, modal, toastr, focus, focusFlatPick, openSelectBox, utils, auService, staffService, service) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;

        // wait for current user object
        blockUI.start();
        $scope.$watch('currentUser.loaded', function (newVal, old) {
            if (!newVal) {
                return;
            }
            
            
            // if (!($scope.isSiteManager($scope.currentUser) || $scope.isProvincialManager($scope.currentUser))) {
            //     $state.go('application.prev_dashboard');
            // }
            vm.orgsWritable = $scope.assignedOrgs.writable;
            vm.orgsReadable = $scope.assignedOrgs.readable;
            vm.isWrited=false;
            vm.isReaded=false;
            let idParam = $stateParams.id;
            if(!idParam){
                service.getListWriteAbleSelfTest().then(function(data){
                    if(data && data.length>0){
                        vm.orgsWritable = data;
                        vm.isWrited = true;
                        blockUI.stop();
                    }else{
                        blockUI.stop();
                        $state.go('application.self_test');
                        toastr.warning("B???n kh??ng c?? quy???n th??m ho???c s???a b???n ghi","C???nh b??o"); 
                    }
                });
            }else{
                blockUI.stop();
            }
            
            
            if(vm.orgsWritable.length > 0) {
                vm.isWrited = true;
            }else{
                
            }
            if(vm.orgsReadable.length > 0) {
                vm.isReaded = true;
            }
            //blockUI.stop();
            // Getting Entry for editing
            vm.loadEntry();
        });
        let vm = this;

        vm.numberOfDays = 30;
        vm.convertDispensingDate = null;
        vm.convertDispensingDateSpeciment = null;

        vm.entry = {
            organization: null,
            person: {
                gender: 'OTHER',
                locations: [{province: null, district: null, commune: null}]
            },
            specimens: []
        };

        vm.specimen = {};

        // lists
        vm.yobList = [];
        vm.genderList = [
            {code: 'MALE', name: 'Nam'},
            {code: 'FEMALE', name: 'N???'}
        ];
        vm.specimens = [
            {code: 'ORAQUICK', name: 'OraQuick'},
            {code: 'INSTI', name: 'INSTI'},
            {code: 'OTHER', name: 'Sinh ph???m kh??c'}
        ];
        vm.supportTypes = [
            {code: 'W_SUPPORT', name: 'C?? h??? tr??? tr???c ti???p'},
            {code: 'WO_SUPPORT', name: 'Kh??ng c?? h??? tr???'}
        ];
        vm.clients = [
            {code: 'SELF', name: 'B???n th??n'},
            {code: 'SEXUAL_PARTNER', name: 'B???n t??nh'},
            {code: 'IDU_PARTNER', name: 'B???n ch??ch chung'},
            {code: 'OTHER', name: 'B???n kh??c'}
        ];
        vm.risks = [
            {code: 'PWID', name: 'Ti??m ch??ch ma tu??'},
            {code: 'MSM', name: 'Nam quan h??? ?????ng gi???i (MSM)'},
            {code: 'TG', name: 'Chuy???n gi???i'},
            {code: 'FSW', name: 'N??? b??n d??m'},
            {code: 'PLHIV_PARTNER', name: 'BT/BC c???a ng?????i c?? HIV'},
            {code: 'OTHER', name: 'Kh??c'}
        ];
        vm.screenResults = [
            {code: 'NONE_REACTIVE', name: 'Kh??ng ph???n ???ng'},
            {code: 'REACTIVE', name: 'C?? ph???n ???ng'},
            {code: 'OTHER', name: 'T??? ch???i tr??? l???i/kh??ng bi???t'}
        ];
        vm.confirmResults = [
            {code: 'POSITIVE', name: 'D????ng t??nh'},
            {code: 'NEGATIVE', name: '??m t??nh'},
            {code: 'OTHER', name: 'T??? ch???i tr??? l???i/kh??ng bi???t'}
        ];
        vm.selfTestSourceValues = [
            {id:1,name:'Nh??n vi??n c???ng ?????ng th???c hi???n', isCheck:false, val:'answer1'},
            {id:2,name:'C?? s??? y t??? th???c hi???n', isCheck:false, val:'answer2'},
        ];

        vm.provinces = [];
        vm.districts = [];
        vm.communes = [];
        vm.staffList = [];
        vm.orgsWritable = [];

        vm.modalInstance = null;
        let mTodayEnd = moment().set({hour: 23, minute: 59, second: 59});

        // dob list
        for (let i = moment().year(); i > 1930; i--) {
            vm.yobList.push({code: i, name: '' + i});
        }

        // Get all provinces
        blockUI.start();
        auService.getAllAdminUnits({parentCode: 'country_1', excludeVoided: true}).then(function (data) {
            blockUI.stop();
            vm.provinces = [];
            if (data) {
                angular.copy(data, vm.provinces);
            }
        });

        // if(vm.entry.dispensingDate) {
        //     // vm.dispensingDate.fpItem.setDate(moment(vm.entry.dispensingDate).toDate());
        //     alert("jfd");
        // }

        let datePickerOptions = {
            altFormat: 'd/m/Y',
            altInput: true,
            dateFormat: 'Y-m-dTH:i:S',
            enableTime: false,
            placeholder: 'Ch???n ng??y..',
            plugins: [new scrollPlugin({})],
            weekNumbers: true,
            shorthandCurrentMonth: false,
            locale: 'vn',
            position: 'auto',
            allowInput: false,
            disable: [
                function (date) {
                    // return true to disable
                    return moment(date).isAfter(mTodayEnd);
                }
            ]
        };

        // For dispensing date
        vm.datepicker1 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.dispensingDate = m.add(7, 'hours').toDate();
                        if(!vm.specimen.dispensingDate) {
                            vm.specimen.dispensingDate = vm.entry.dispensingDate;
                            vm.dispensingDate.fpItem.setDate(moment(vm.entry.dispensingDate).toDate());
                            
                        }
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker1.fpItem = fpItem;
                if (vm.entry.dispensingDate) {
                    fpItem.setDate(moment(vm.entry.dispensingDate).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker1.fpItem) {
                    vm.datepicker1.fpItem.setDate(moment(date).toDate());
                }
            }
        };

        // For dispensing date
        vm.dispensingDate = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.specimen.dispensingDate = m.add(7, 'hours').toDate();
                    }
                    // if(!vm.specimen.dispensingDate) {
                    //     vm.specimen.dispensingDate = null;
                    // }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.dispensingDate.fpItem = fpItem;
                if (vm.specimen.dispensingDate) {
                    fpItem.setDate(moment(vm.specimen.dispensingDate).toDate());
                    
                }
                // alert(vm.specimen.dispensingDate);
            },
            setDate: function (date) {
                if (date && vm.dispensingDate.fpItem) {
                    vm.dispensingDate.fpItem.setDate(moment(date).toDate());
                }
            }
        };

        // For client dob
        vm.datepicker2 = {
            fpItem: null,
            dateOpts: $.extend({
                onChange: [function () {
                    const d = this.selectedDates[0];
                    if (_.isDate(d)) {
                        const m = moment(d, 'YYYY-MM-DD');
                        vm.entry.person.dob = m.add(7, 'hours').toDate();
                    }
                }],
            }, datePickerOptions),
            datePostSetup: function (fpItem) {
                vm.datepicker2.fpItem = fpItem;
                if (vm.entry.person.dob) {
                    fpItem.setDate(moment(vm.entry.person.dob).toDate());
                }
            },
            setDate: function (date) {
                if (date && vm.datepicker2.fpItem) {
                    vm.datepicker2.fpItem.setDate(moment(date).toDate());
                }
            }
        };

        vm.bsTableControl = {
            options: {
                data: [],
                idField: 'id',
                sortable: true,
                striped: true,
                maintainSelected: true,
                clickToSelect: false,
                showColumns: false,
                showToggle: false,
                pagination: false,
                locale: settings.locale,
                sidePagination: 'server',
                columns: service.getSpecimensTableDef(),
            }
        };

        // check if this is a request to edit an existing entry
        vm.loadEntry = function () {
            let idParam = $stateParams.id;
            if (idParam) {
                blockUI.start();
                service.getEntry(idParam).then(function (data) {
                    blockUI.stop();
                    if (data && data.id) {
                        vm.isWrited = data.writAble;
                        if(!data.writAble && !data.readAble){
                            $state.go('application.self_test');
                            toastr.warning("B???n kh??ng c?? quy???n ?????c ho???c s???a b???n ghi","C???nh b??o");
                        }
                        angular.copy(data, vm.entry);
                        vm.convertDispensingDate = new Date(vm.entry.dispensingDate);
                        // normalize data
                        vm.datepicker1.setDate(vm.entry.dispensingDate);
                        // specimens
                        let isSiteManager = $scope.isSiteManager($scope.currentUser);

                        vm.bsTableControl.options.columns = service.getSpecimensTableDef(isSiteManager);
                        vm.bsTableControl.options.data = vm.entry.specimens;
                    }
                });
            }
        };

        // Check and see if the user is assigned to only one organization
        $scope.$watch('assignedOrgs.initialized', function (newVal, oldVal) {
            if (newVal == true) {
                // if(!$scope.isAdministrator($scope.currentUser) && !$scope.isProvincialManager($scope.currentUser)) {
                //     if (!$scope.isSelfTestRole) {
                //         $state.go('application.prev_dashboard');
                //     }
                // }
                // // List of assigned organizations
                // vm.orgsWritable = $scope.assignedOrgs.writable;
                // vm.orgsReadable = $scope.assignedOrgs.readable;

                // if (vm.orgsWritable && vm.orgsWritable.length == 1 && !vm.entry.id && (!vm.entry.organization || !vm.entry.organization.id)) {
                //     vm.entry.organization = {};
                //     angular.copy(vm.orgsWritable[0], vm.entry.organization);
                // }

                // load the entry
                vm.loadEntry();
            }
        });

        /**
         * Add a specimen to the list
         */
        vm.addSpecimen = function () {
            var checkDirectSupport = 0;
            vm.bsTableControl.options.data.map((item) => {
                console.log(item.support);
                if(item.support=="W_SUPPORT") {
                    checkDirectSupport = 1;
                }
                console.log(checkDirectSupport);
                if(checkDirectSupport == 1) {
                    vm.supportTypes = [
                        {code: 'WO_SUPPORT', name: 'Kh??ng c?? h??? tr???'}
                    ];
                    vm.clients = [
                        {code: 'SEXUAL_PARTNER', name: 'B???n t??nh'},
                        {code: 'IDU_PARTNER', name: 'B???n ch??ch chung'},
                        {code: 'OTHER', name: 'B???n kh??c'}
                    ];
                } else {
                    vm.supportTypes = [
                        {code: 'W_SUPPORT', name: 'C?? h??? tr??? tr???c ti???p'},
                        {code: 'WO_SUPPORT', name: 'Kh??ng c?? h??? tr???'}
                    ];
                    vm.clients = [
                        {code: 'SELF', name: 'B???n th??n'},
                        {code: 'SEXUAL_PARTNER', name: 'B???n t??nh'},
                        {code: 'IDU_PARTNER', name: 'B???n ch??ch chung'},
                        {code: 'OTHER', name: 'B???n kh??c'}
                    ];
                }
                    
            })
            vm.specimen.dispensingDate = vm.entry.dispensingDate;
            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'edit_specimen_modal.html',
                scope: $scope,
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });

            vm.modalInstance.closed.then(function () {
                vm.specimen = {};
            });
        };

        /**
         * Edit a specimen for this selftest entry
         * @param id
         */
        $scope.editSpecimenEntry = function (id) {
            if (!id) {
                toastr.warning('Kh??ng t??m th???y th??ng tin b???n ghi.', 'Th??ng b??o');
            }

            service.getSpecimen(id).then(function (data) {
                
                vm.specimen = data;
                console.log(data);
                vm.convertDispensingDateSpeciment = new Date(vm.specimen.dispensingDate);
                
                vm.modalInstance = modal.open({
                    animation: true,
                    templateUrl: 'edit_specimen_modal.html',
                    scope: $scope,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });

                vm.modalInstance.closed.then(function () {
                    vm.specimen = {};
                });
            });
        };

        /**
         * Delete a specimen for this selftest entry
         * @param id
         */
        $scope.deleteSpecimenEntry = function (id) {
            if (!id) {
                toastr.warning('Kh??ng t??m th???y th??ng tin b???n ghi.', 'Th??ng b??o');
            }

            vm.dialog = {
                icon: 'im im-icon-Flash',
                title: 'X??a b???n ghi?',
                message: 'B???n c?? th???c s??? mu???n x??a th??ng tin m???t sinh ph???m ???? c???p ph??t cho kh??ch h??ng kh??ng?',
                callback: function (answer) {
                    if (answer === 'yes') {
                        blockUI.start();
                        // service.getSpecimen(id, function success() {
                        // }, function failure() {
                        //     blockUI.stop();
                        // }).then(function (data) {
                        //     blockUI.stop();
                        //     let convertDispensingDateSpeciment = new Date(data.dispensingDate);
                        //     console.log(convertDispensingDateSpeciment);
                        //     let dispensingDateSpecimentConvert = convertDispensingDateSpeciment.getMonth()+1;
                        //     let calculateQuarter = null;
                        //     if(dispensingDateSpecimentConvert>0 && dispensingDateSpecimentConvert<4) {
                        //         calculateQuarter = 1;
                        //     } else if(dispensingDateSpecimentConvert>3 && dispensingDateSpecimentConvert<7) {
                        //         calculateQuarter = 2;
                        //     } else if(dispensingDateSpecimentConvert>6 && dispensingDateSpecimentConvert<10) {
                        //         calculateQuarter = 3;
                        //     } else if(dispensingDateSpecimentConvert>9 && dispensingDateSpecimentConvert<13) {
                        //         calculateQuarter = 4;
                        //     }
                        //     let changeByQuarter = new Date(convertDispensingDateSpeciment.getFullYear(), convertDispensingDateSpeciment.getMonth(), convertDispensingDateSpeciment.getDate());
                        //     if(calculateQuarter == 1) {
                        //         changeByQuarter.setMonth(2);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 2) {
                        //         changeByQuarter.setMonth(5);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 3) {
                        //         changeByQuarter.setMonth(8);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     } else if(calculateQuarter == 4) {
                        //         changeByQuarter.setMonth(11);
                        //         changeByQuarter.setDate(vm.numberOfDays);
                        //     }
                        //     let isAdministrator = $scope.isAdministrator($scope.currentUser);
                        //     if(!isAdministrator) {
                        //         if((new Date()) > changeByQuarter) {
                        //             toastr.warning("???? qu?? th???i h???n ch???nh s???a phi???u","Th??ng b??o");
                        //             return;
                        //         }
                        //     }
                            service.deleteSpecimens([{id: id}], function success() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.info('B???n ???? x??a th??nh c??ng b???n ghi!', 'Th??ng b??o');

                                $state.go($state.$current, null, {reload: true});

                            }, function failure() {
                                blockUI.stop();
                                toastr.clear();
                                toastr.error('C?? l???i x???y ra khi x??a b???n ghi!', 'Th??ng b??o');
                            })
                        // })
                    }

                    vm.modalInstance.close();
                }
            };

            vm.modalInstance = modal.open({
                animation: true,
                templateUrl: 'confirmation.html',
                scope: $scope,
                size: 'md'
            });

            vm.modalInstance.closed.then(function () {
                vm.dialog = {};
            });
        };

        // reload staff list
        $scope.$watch('vm.entry.organization', function (newVal, oldVal) {
            vm.staffList = [];
            if (!newVal || !newVal.id) {
                vm.entry.dispensingStaff = null;
                return;
            }

            staffService.getEntries({organization: {id: newVal.id}, pageIndex: 0, pageSize: 100}).then(function (data) {
                if (data && data.content) {
                    angular.copy(data.content, vm.staffList);
                }
            });
        });

        $scope.$watch('vm.specimen.support', function (newVal, oldVal) {
            if (!newVal) {
                vm.specimen.client = null;
                vm.specimen.clientYob = null;
                vm.specimen.clientGender = null;
                return;
            }

            if (newVal === 'W_SUPPORT') {
                vm.specimen.client = null;
            } else {
                vm.specimen.clientYob = null;
                vm.specimen.clientGender = null;
            }
        });

        $scope.$watch('vm.specimen.code', function (newVal, oldVal) {
            if (!newVal) {
                vm.specimen.name = null;
                return;
            }
            if(oldVal) {
                if(vm.specimen.name === "OraQuick") {
                    vm.specimen.name = null;
                }
                if(vm.specimen.name === "INSTI") {
                    vm.specimen.name = null;
                }
            }

            if (vm.specimen.code !== 'OTHER') { 
                let indx = _.findIndex(vm.specimens, {'code': vm.specimen.code});
                if (indx >= 0) {
                    vm.specimen.name = vm.specimens[indx].name;
                }
            }
        });

        $scope.$watch('vm.specimen.screenResult', function (newVal, oldVal) {
            if (!newVal || newVal != 'REACTIVE') {
                vm.specimen.confirmResult = null;
            }
        });

        $scope.$watch('vm.entry.person.locations[0].province', function (newVal, oldVal) {
            vm.districts = [];
            vm.communes = [];

            if (vm.entry.person.locations.length <= 0) {
                return;
            }

            if (vm.entry.person.locations[0].province && vm.entry.person.locations[0].province.id) {
                // Districts
                auService.getAllAdminUnits({
                    parentId: vm.entry.person.locations[0].province.id,
                    excludeVoided: true
                }).then(function (data) {
                    if (data) {
                        vm.districts = data;
                    } else {
                        vm.districts = [];
                    }

                    // Set selected district
                    if (vm.entry.person.locations[0].district && vm.entry.person.locations[0].district.id) {
                        if (utils.indexOf(vm.entry.person.locations[0].district, vm.districts) < 0) {
                            vm.entry.person.locations[0].district = null;
                            vm.entry.person.locations[0].commune = null;
                        }
                    }
                });
            }
        });

        $scope.$watch('vm.entry.person.locations[0].district', function (newVal, oldVal) {
            vm.communes = [];

            if (vm.entry.person.locations.length <= 0) {
                return;
            }

            if (vm.entry.person.locations[0].district && vm.entry.person.locations[0].district.id) {
                // Communes
                blockUI.start();
                auService.getAllAdminUnits({
                    parentId: vm.entry.person.locations[0].district.id,
                    excludeVoided: true
                }).then(function (data) {
                    blockUI.stop();

                    if (data) {
                        vm.communes = data;
                    } else {
                        vm.communes = [];
                    }

                    // Set selected commune
                    if (vm.entry.person.locations[0].commune && vm.entry.person.locations[0].commune.id) {
                        if (utils.indexOf(vm.entry.person.locations[0].commune, vm.communes) < 0) {
                            vm.entry.person.locations[0].commune = null;
                        }
                    }
                });
            }
        });

        /**
         * Save the self test entry
         */
        vm.saveEntry = function () {
            vm.submitDisabled = true;

            if (!$scope.isSiteManager($scope.currentUser)) {
                return;
            }

            // if(vm.entry.id) {
            //     let dispensingDateConvert = vm.convertDispensingDate.getMonth()+1;
            //     let calculateQuarter = null;
            //     if(dispensingDateConvert>0 && dispensingDateConvert<4) {
            //         calculateQuarter = 1;
            //     } else if(dispensingDateConvert>3 && dispensingDateConvert<7) {
            //         calculateQuarter = 2;
            //     } else if(dispensingDateConvert>6 && dispensingDateConvert<10) {
            //         calculateQuarter = 3;
            //     } else if(dispensingDateConvert>9 && dispensingDateConvert<13) {
            //         calculateQuarter = 4;
            //     }
            //     let changeByQuarter = new Date(vm.convertDispensingDate.getFullYear(), vm.convertDispensingDate.getMonth(), vm.convertDispensingDate.getDate());
            //     if(calculateQuarter == 1) {
            //         changeByQuarter.setMonth(2);
            //         changeByQuarter.setDate(vm.numberOfDays);
            //     } else if(calculateQuarter == 2) {
            //         changeByQuarter.setMonth(5);
            //         changeByQuarter.setDate(vm.numberOfDays);
            //     } else if(calculateQuarter == 3) {
            //         changeByQuarter.setMonth(8);
            //         changeByQuarter.setDate(vm.numberOfDays);
            //     } else if(calculateQuarter == 4) {
            //         changeByQuarter.setMonth(11);
            //         changeByQuarter.setDate(vm.numberOfDays);
            //     }
                
            //     let isAdministrator = $scope.isAdministrator($scope.currentUser);
            //     if(!isAdministrator) {
            //         if((new Date()) > changeByQuarter) {
            //             toastr.warning("???? qu?? th???i h???n ch???nh s???a phi???u","Th??ng b??o");
            //             return;
            //         }
            //     }
            // }

            // validate
            if (!vm.entry.organization || !vm.entry.organization.id) {
                toastr.error('Vui l??ng ch???n c?? s??? d???ch v???.', 'Th??ng b??o');
                openSelectBox('vm.entry.organization');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.dispensingStaff || !vm.entry.dispensingStaff.id) {
                toastr.error('Vui l??ng ch???n nh??n vi??n c???p ph??t sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.entry.dispensingStaff');
                vm.toggleSubmit();
                return;
            }

            if (!vm.specimen.dispensingDate && !vm.entry.id) {
                toastr.error('Vui l??ng ch???n ng??y c???p ph??t sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                focusFlatPick('vm.specimen.dispensingDate');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.dispensingDate) { 
                toastr.error('Vui l??ng ch???n ng??y c???p ph??t sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                focusFlatPick('vm.entry.dispensingDate');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.person.fullname || vm.entry.person.fullname.trim() === '') {
                toastr.error('Vui l??ng nh???p t??n kh??ch h??ng.', 'Th??ng b??o');
                focus('vm.entry.person.fullname');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.person.mobilePhone || vm.entry.person.mobilePhone.trim() === '') {
                toastr.error('Vui l??ng nh???p s??? ??i???n tho???i kh??ch h??ng.', 'Th??ng b??o');
                focus('vm.entry.person.mobilePhone');
                vm.toggleSubmit();
                return;
            }
            
            if (!vm.entry.selfTestSource || vm.entry.selfTestSource.trim() === '') {
                toastr.error('Vui l??ng ngu???n t??? x??t nghi???m.', 'Th??ng b??o');
                focus('vm.entry.selfTestSource');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.person.locations[0].province || !vm.entry.person.locations[0].province.id) {
                toastr.error('Vui l??ng nh???p ?????a ch??? (t???nh/th??nh ph???) c???a kh??ch h??ng.', 'Th??ng b??o');
                openSelectBox('vm.entry.person.locations[0].province');
                vm.toggleSubmit();
                return;
            }

            if (!vm.entry.person.locations[0].district || !vm.entry.person.locations[0].district.id) {
                toastr.error('Vui l??ng nh???p ?????a ch??? (qu???n/huy???n) c???a kh??ch h??ng.', 'Th??ng b??o');
                openSelectBox('vm.entry.person.locations[0].district');
                vm.toggleSubmit();
                return;
            }

            // check specimen when adding a customer
            if (!vm.entry.id) {
                if (!vm.specimen.code) {
                    toastr.error('Vui l??ng nh???p t??n sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                    openSelectBox('vm.specimen.code');
                    vm.toggleSubmit();
                    return;
                }

                if (vm.specimen.code === 'OTHER' && (!vm.specimen.name || vm.specimen.name.trim() === '')) {
                    toastr.error('Vui l??ng nh???p t??n sinh ph???m.', 'Th??ng b??o');
                    focus('vm.specimen.name');
                    vm.toggleSubmit();
                    return;
                }

                if (!vm.specimen.support) {
                    toastr.error('Vui l??ng cho bi???t h??nh th???c x??t nghi???m.', 'Th??ng b??o');
                    openSelectBox('vm.specimen.support');
                    vm.toggleSubmit();
                    return;
                }

                if (vm.specimen.support === 'W_SUPPORT') {
                    if (!vm.specimen.clientYob) {
                        toastr.error('Vui l??ng cho bi???t n??m sinh c???a ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                        openSelectBox('vm.specimen.clientYob');
                        vm.toggleSubmit();
                        return;
                    } else {
                        if((new Date().getFullYear() - vm.specimen.clientYob) < 10) {
                            toastr.error('N??m sinh c???a ng?????i c???n x??t nghi???m kh??ng ???????c nh??? h??n 10', 'Th??ng b??o');
                            openSelectBox('vm.specimen.clientYob');
                            vm.toggleSubmit();
                            return;
                        }
                    }

                    if (!vm.specimen.clientGender) {
                        toastr.error('Vui l??ng cho bi???t gi???i t??nh c???a ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                        openSelectBox('vm.specimen.clientGender');
                        vm.toggleSubmit();
                        return;
                    }

                    vm.entry.person.gender = vm.specimen.clientGender;
                } else {
                    if (!vm.specimen.client) {
                        toastr.error('Vui l??ng cho bi???t ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                        openSelectBox('vm.specimen.client');
                        vm.toggleSubmit();
                        return;
                    }
                }

                // default client gender
                if (!vm.entry.person.gender) {
                    vm.entry.person.gender = 'OTHER';
                }

                // set the specimen to the entry
                vm.entry.specimens = [vm.specimen];
            }

            // assign the default address type
            vm.entry.person.locations[0].addressType = 'CURRENT_ADDRESS';

            // save entry
            service.saveEntry(vm.entry, function success() {
                toastr.info('???? l??u th??nh c??ng th??ng tin b???n ghi c???p ph??t sinh ph???m t??? x??t nghi???m.', 'Th??ng b??o');
                vm.toggleSubmit();

            }, function failure() {
                toastr.error('C?? l???i x???y ra khi l??u th??ng tin b???n ghi c???p ph??t sinh ph???m t??? x??t nghi???m.', 'Th??ng b??o');
                vm.toggleSubmit();
            }).then(function (data) {
                // reload page
                if (data && data.id) {
                    $state.go($state.$current, {id: data.id}, {reload: true});
                }
            });
        };

        /**
         * Save the specimen entry
         */
        vm.saveSpecimenEntry = function () {
            // if(vm.entry.id) {
            //     let changeByQuarter = null;
            //     if(vm.convertDispensingDate != null) {
            //         let dispensingDateConvert = vm.convertDispensingDate.getMonth()+1;
            //         let calculateQuarter = null;
            //         if(dispensingDateConvert>0 && dispensingDateConvert<4) {
            //             calculateQuarter = 1;
            //         } else if(dispensingDateConvert>3 && dispensingDateConvert<7) {
            //             calculateQuarter = 2;
            //         } else if(dispensingDateConvert>6 && dispensingDateConvert<10) {
            //             calculateQuarter = 3;
            //         } else if(dispensingDateConvert>9 && dispensingDateConvert<13) {
            //             calculateQuarter = 4;
            //         }
            //         changeByQuarter = new Date(vm.convertDispensingDate.getFullYear(), vm.convertDispensingDate.getMonth(), vm.convertDispensingDate.getDate());
            //         if(calculateQuarter == 1) {
            //             changeByQuarter.setMonth(2);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 2) {
            //             changeByQuarter.setMonth(5);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 3) {
            //             changeByQuarter.setMonth(8);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 4) {
            //             changeByQuarter.setMonth(11);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         }
            //     } 
            //     if (vm.convertDispensingDateSpeciment != null) {
            //         let dispensingDateSpecimentConvert = vm.convertDispensingDateSpeciment.getMonth()+1;
            //         console.log("duc");
            //         console.log(vm.convertDispensingDateSpeciment);
            //         let calculateQuarter = null;
            //         if(dispensingDateSpecimentConvert>0 && dispensingDateSpecimentConvert<4) {
            //             calculateQuarter = 1;
            //         } else if(dispensingDateSpecimentConvert>3 && dispensingDateSpecimentConvert<7) {
            //             calculateQuarter = 2;
            //         } else if(dispensingDateSpecimentConvert>6 && dispensingDateSpecimentConvert<10) {
            //             calculateQuarter = 3;
            //         } else if(dispensingDateSpecimentConvert>9 && dispensingDateSpecimentConvert<13) {
            //             calculateQuarter = 4;
            //         }
            //         changeByQuarter = new Date(vm.convertDispensingDateSpeciment.getFullYear(), vm.convertDispensingDateSpeciment.getMonth(), vm.convertDispensingDateSpeciment.getDate());
            //         if(calculateQuarter == 1) {
            //             changeByQuarter.setMonth(2);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 2) {
            //             changeByQuarter.setMonth(5);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 3) {
            //             changeByQuarter.setMonth(8);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         } else if(calculateQuarter == 4) {
            //             changeByQuarter.setMonth(11);
            //             changeByQuarter.setDate(vm.numberOfDays);
            //         }
            //     }
            //     let isAdministrator = $scope.isAdministrator($scope.currentUser);
            //     if(!isAdministrator) {
            //         if((new Date()) > changeByQuarter) {
            //             toastr.warning("???? qu?? th???i h???n ch???nh s???a phi???u","Th??ng b??o");
            //             return;
            //         }
            //     }
            // }
            if (!vm.specimen.code) {
                toastr.error('Vui l??ng nh???p t??n sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.specimen.code');
                return;
            }

            if (vm.specimen.code === 'OTHER' && (!vm.specimen.name || vm.specimen.name.trim() === '')) {
                toastr.error('Vui l??ng nh???p t??n sinh ph???m.', 'Th??ng b??o');
                focus('vm.specimen.name');
                return;
            }

            if (!vm.specimen.support) {
                toastr.error('Vui l??ng cho bi???t h??nh th???c x??t nghi???m.', 'Th??ng b??o');
                openSelectBox('vm.specimen.support');
                return;
            }

            if (!vm.specimen.dispensingDate) {
                toastr.error('Vui l??ng ch???n ng??y c???p ph??t sinh ph???m x??t nghi???m.', 'Th??ng b??o');
                focusFlatPick('vm.specimen.dispensingDate');
                vm.toggleSubmit();
                return;
            }

            if (vm.specimen.support === 'W_SUPPORT') {
                if (!vm.specimen.clientYob) {
                    toastr.error('Vui l??ng cho bi???t n??m sinh c???a ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                    openSelectBox('vm.specimen.clientYob');
                    return;
                } else {
                    if((new Date().getFullYear() - vm.specimen.clientYob) < 10) {
                        toastr.error('N??m sinh c???a ng?????i c???n x??t nghi???m kh??ng ???????c nh??? h??n 10', 'Th??ng b??o');
                        openSelectBox('vm.specimen.clientYob');
                        vm.toggleSubmit();
                        return;
                    }
                }

                if (!vm.specimen.clientGender) {
                    toastr.error('Vui l??ng cho bi???t gi???i t??nh c???a ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                    openSelectBox('vm.specimen.clientGender');
                    return;
                }

            } else {
                if (!vm.specimen.client) {
                    toastr.error('Vui l??ng cho bi???t ng?????i c???n x??t nghi???m.', 'Th??ng b??o');
                    openSelectBox('vm.specimen.client');
                    return;
                }
            }
            // set self-test entry
            vm.specimen.selfTest = {id: vm.entry.id};

            // save specimen entry
            blockUI.start();
            service.saveSpecimen(vm.specimen, function success() {
                blockUI.stop();
                toastr.info('???? l??u th??nh c??ng th??ng tin sinh ph???m t??? x??t nghi???m.', 'Th??ng b??o');
            }, function failure() {
                blockUI.stop();
                toastr.error('C?? l???i x???y ra khi l??u th??ng tin sinh ph???m t??? x??t nghi???m.', 'Th??ng b??o');
            }).then(function (data) {
                // reload page
                if (data && data.id) {
                    $state.go($state.$current, {id: data.id}, {reload: true});
                }
            });
        };

        // Enable/disable button
        vm.submitDisabled = false;
        vm.toggleSubmit = function () {
            if (vm.submitDisabled) {
                $timeout(function () {
                    vm.submitDisabled = false;
                }, 1000);
            } else {
                vm.submitDisabled = true;
            }
        };
    }

})();
