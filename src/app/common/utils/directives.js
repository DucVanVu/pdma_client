/***
 GLobal Directives
 ***/
(function () {
    'use strict';

    let PDMA = angular.module('PDMA');

    // Route State Load Spinner(used on page or content load)
    PDMA.directive('ngSpinnerBar', ['$rootScope',
        function ($rootScope) {
            return {
                link: function (scope, element, attrs) {

                    // by defult hide the spinner bar
                    element.addClass('hide'); // hide spinner bar by default

                    // display the spinner bar whenever the route changes(the content part started loading)
                    $rootScope.$on('$stateChangeStart', function () {
                        element.removeClass('hide'); // show spinner bar
                    });

                    // hide the spinner bar on rounte change success(after the content loaded)
                    $rootScope.$on('$stateChangeSuccess', function () {
                        element.addClass('hide'); // hide spinner bar
                        $('body').removeClass('page-on-load'); // remove page loading indicator

                        Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                        // auto scorll to page top
                        setTimeout(function () {
                            App.scrollTop(); // scroll to the top on content load
                        }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                    });

                    // handle errors
                    $rootScope.$on('$stateNotFound', function () {
                        element.addClass('hide'); // hide spinner bar
                    });

                    // handle errors
                    $rootScope.$on('$stateChangeError', function () {
                        element.addClass('hide'); // hide spinner bar
                    });

                    // handle errors
                    $rootScope.$on('$unauthorized', function () {
                        element.addClass('hide'); // hide spinner bar
                    });
                }
            };
        }
    ]);

    // Handle global LINK clickpage-sidebar navbar-collapse collapse
    PDMA.directive('a', function () {
        return {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function (e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });

    // Handle Dropdown Hover Plugin Integration
    PDMA.directive('dropdownMenuHover', function () {
        return {
            link: function (scope, elem) {
                elem.dropdownHover();
            }
        };
    });

    // Apply external libs to SELECT elements
    PDMA.directive('select', function () {
        return {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                if (elem.hasClass('select2') || elem.hasClass('select2-multiple')) {
                    elem.select2({
                        allowClear: elem.hasClass('allow-clear'),
                        placeholder: attrs.placeholder,
                        width: null
                    });
                }
            }
        };
    });

    /**
     * Required for ui-select
     */
    PDMA.directive('uiSelectRequired', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                ctrl.$validators.uiSelectRequired = function (modelValue, viewValue) {
                    if (attr.uiSelectRequired) {
                        let isRequired = scope.$eval(attr.uiSelectRequired)
                        if (isRequired == false)
                            return true;
                    }
                    let determineVal;
                    if (angular.isArray(modelValue)) {
                        determineVal = modelValue;
                    } else if (angular.isArray(viewValue)) {
                        determineVal = viewValue;
                    } else if (angular.isObject(modelValue)) {
                        determineVal = angular.equals(modelValue, {}) ? [] : ['true'];
                    } else if (angular.isObject(viewValue)) {
                        determineVal = angular.equals(viewValue, {}) ? [] : ['true'];
                    } else {
                        return false;
                    }
                    return determineVal.length > 0;
                };
            }
        };
    });

    /**
     * Tab component
     */
    PDMA.directive('tabdrop', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.find('.nav-tabs > li > a').on('click', function (ev) {
                    ev.preventDefault();
                });

                elem.tabdrop({align: 'left'});
            }
        };
    }]);

    /**
     * Modal draggable
     */
    PDMA.directive('modalMovable', ['$document',
        function ($document) {
            return {
                restrict: 'AC',
                link: function (scope, elem, attrs) {
                    let startX = 0,
                        startY = 0,
                        x = 0,
                        y = 0,
                        minWidth = attrs.minWidth || null;

                    let dialogWrapper = elem.parent();
                    let dialogHeader = dialogWrapper.find('.modal-header');

                    dialogHeader.css('background-color', '#344559');
                    dialogHeader.css('color', 'rgb(255, 255, 255, 0.8)');
                    dialogHeader.css('cursor', 'move');

                    let autoHeight = attrs.autoHeight;

                    if (autoHeight != 'yes') {
                        let dialogBody = dialogWrapper.find('.modal-body');
                        let maxHeight = window.innerHeight - 200;

                        let stickyToolbar = attrs.stickyToolbar;

                        if (stickyToolbar != 'yes') {
                            dialogBody.css('max-height', (maxHeight) + 'px');
                            dialogBody.css('overflow-y', 'scroll');
                        } else {
                            let content = dialogBody.find('.row:last-child');
                            content.css('max-height', (maxHeight - 50) + 'px');
                            content.css('overflow-y', 'scroll');
                        }

                        let minHeight = attrs.minHeight;
                        if (minHeight) {
                            dialogBody.css('min-height', minHeight + 'px');
                        }
                    }

                    let fullWidth = attrs.fullWidth;
                    if (fullWidth == 'yes') {
                        let dialog = dialogWrapper.parent('.modal-dialog');
                        if (dialog) {
                            let documentWidth = $document.width();
                            dialog.css('width', (documentWidth - 30) + 'px');
                        }
                    }

                    let calendarInline = attrs.calendarInline;

                    if (calendarInline == 'yes') {
                        let adjustedLeft = 112; // (600 - 376) / 2;
                        let maxWidth = attrs.maxWidth;

                        dialogWrapper.css({
                            left: adjustedLeft + 'px',
                            width: maxWidth ? maxWidth : '376px'
                        });
                    }

                    dialogWrapper.css({
                        position: 'relative',
                        minWidth: minWidth ? minWidth : 'auto'
                    });

                    dialogHeader.on('mousedown', function (event) {
                        // Prevent default dragging of selected content
                        event.preventDefault();
                        startX = event.pageX - x;
                        startY = event.pageY - y;
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);

                        dialogHeader.css('background-color', '#f1f1f1');
                        dialogHeader.css('color', '#333333');
                    });

                    function mousemove(event) {
                        y = event.pageY - startY;
                        x = event.pageX - startX;
                        dialogWrapper.css({
                            top: y + 'px',
                            left: x + 'px'
                        });
                    }

                    function mouseup() {
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);

                        dialogHeader.css('background-color', '#344559');
                        dialogHeader.css('color', 'rgb(255, 255, 255, 0.8)');
                    }

                    // prevent page scroll
                    // $('body').bind('mousewheel DOMMouseScroll', function (e) {
                    //     var e0 = e;//.originalEvent,
                    //     var delta = e0.wheelDelta || -e0.detail;
                    //     this.scrollTop += (delta < 0 ? 1 : -1) * 30;
                    //     e.preventDefault();
                    // });
                }
            };
        }
    ]);

    /**
     * Replace the ng-include node with the included contents
     */
    PDMA.directive('includeReplace', function () {
        return {
            require: 'ngInclude',
            restrict: 'A',
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    });

    /**
     * Toggle details
     */
    PDMA.directive('toggleView', function () {
        return {
            restrict: 'A',
            link: function ($scope, $elem, $attrs) {
                let target = $attrs.target || '';

                $elem.on('click', function () {
                        let $fa = $elem.find('i.fa');
                        if (target != '') {
                            let $target = $(target);
                            if ($target.hasClass('hidden')) {
                                $target.removeClass('hidden');
                                $fa.removeClass('fa-caret-down').addClass('fa-caret-up');
                            } else {
                                $target.addClass('hidden');
                                $fa.removeClass('fa-caret-up').addClass('fa-caret-down');
                            }
                        }
                    }
                );
            }
        };
    });

    /**
     * On key press
     */
    PDMA.directive('onKeyPress', [function () {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                $element.bind("keypress", function (event) {
                    let keyCode = event.which || event.keyCode;

                    if (keyCode == $attrs.whenKeyCode) {
                        $scope.$apply(function () {
                            $scope.$eval($attrs.onKeyPress, {$event: event});
                        });

                    }
                });
            }
        };
    }]);

    /**
     * Apply styles for login screen
     */
    PDMA.directive('loginScreen', [function () {
        return {
            restrict: 'AC',
            link: function (scope, elem, attrs) {
                let $body = $('body');

                if ($body.hasClass('public-pages')) {
                    $body.removeClass('public-pages');
                }

                if (!$body.hasClass('login')) {
                    $body.addClass('login');
                }
            }
        };
    }]);

    /**
     * Apply styles for admin page
     */
    PDMA.directive('adminScreen', [function () {
        return {
            restrict: 'AC',
            link: function (scope, elem, attrs) {
                let $body = $('body');

                if ($body.hasClass('login')) {
                    $body.removeClass('login');
                }
            }
        };
    }]);

    /**
     * Keep focus
     */
    PDMA.directive('focusMe', [function () {
        return {
            link: function (scope, element, attrs) {
                $(element).keydown(function (ev) {
                    let code = ev.keyCode || ev.which;
                    // let char = $.getChar(ev);
                    // element.val(element.val() + String.fromCharCode(char));

                    if (code == 9 || code == 27) {
                        element.blur();
                    } else {
                        element.focus();
                    }
                    ev.preventDefault();
                });
            }
        }
    }]);

    PDMA.directive('appointmentScreenResizer', ['$timeout', '$window', function ($timeout, $window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                let resizeeID = attrs.resizedElement || null;

                if (!resizeeID) {
                    return;
                }

                let resizee = $($window.document.getElementById(resizeeID));

                new ResizeSensor(elem, function () {
                    let height = elem.innerHeight();
                    let resizeeChildHeight = resizee.find('>div').height();
                    if (resizeeChildHeight <= height) {
                        resizee.css('over-flow-y', 'hidden');
                    } else {
                        resizee.css('over-flow-y', 'auto');
                    }

                    resizee.height(height - 50);
                });
            }
        }
    }]);

    PDMA.directive('slimScroll', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {

                let color = attrs.color || '#ffffff';
                let height = attrs.containerHeight || '400px';

                elem.slimScroll({
                    color: color,
                    size: '10px',
                    height: height,
                    alwaysVisible: true,
                    railVisible: true,
                    disableFadeOut: true
                });
            }
        };
    }]);

    PDMA.directive('dragOn', ['$timeout', 'blockUI', function ($timeout, blockUI) {
        return {
            link: function (scope, element, attrs) {
                $(element).dragOn({});

                // $timeout(function () {
                //     // find the table body
                //     let tableContainer = $(element).find('.fixed-table-body')[0];
                //     console.log(tableContainer);
                //
                //     $(tableContainer).jScrollPane({showArrows: true});
                //     let api = $(tableContainer).data('jsp');
                //     let throttleTimeout;
                //     $(window).bind('resize', function () {
                //         if (!throttleTimeout) {
                //             throttleTimeout = setTimeout(
                //                 function () {
                //                     api.reinitialise();
                //                     throttleTimeout = null;
                //                 },
                //                 50
                //             );
                //         }
                //     });
                //
                // }, 1000);
            }
        };
    }]);

    PDMA.directive('horizontalScroll', [function () {
        return {
            link: function (scope, element, attrs) {
                let lastScrollTop = 0;
                element.bind("DOMMouseScroll mousewheel onmousewheel", function (ev) {

                    // cross-browser wheel delta
                    let event = window.event || ev; // old IE support
                    let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

                    let $container = $(element.find('.fixed-table-body')[0]);
                    let $tableContent = $($container.children()[1]);

                    let scrollUp = false;
                    if (event.wheelDelta) {
                        scrollUp = event.wheelDelta > 0;
                    } else {
                        scrollUp = event.deltaY < 0;
                    }

                    if ($tableContent.get(0).scrollWidth <= $container.width()
                        || ($container.scrollLeft() == 0 && scrollUp)
                        || ($container.scrollLeft() + $container.width() == $tableContent.get(0).scrollWidth && !scrollUp)) {
                        return;
                    }

                    scope.$apply(function () {
                        let base = 30 * delta;
                        let scrollLeft = $container.scrollLeft() - base;
                        $container.scrollLeft(scrollLeft);
                    });

                    // for IE
                    event.returnValue = false;
                    // for Chrome and Firefox
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                });
            }
        };
    }]);

    PDMA.directive('webuiPopover', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                let url = attrs.url || '#';
                let title = attrs.title || '';
                let moveTo = attrs.moveTo || '';
                let targetType = attrs.targetType || '';

                let popover = elem.webuiPopover({
                    url: url,
                    title: title,
                    placement: 'bottom',
                    type: 'html',
                    closeable: true,
                    arrow: false,
                    trigger: 'manual',
                    animation: 'pop',
                    backdrop: false,
                    dismissible: true,
                    onHide: function ($element) {
                        if (moveTo != '') {
                            if (targetType == 'ui-select') {
                                let uiSelect = angular.element($(moveTo).get(0)).controller('uiSelect');
                                $timeout(function () {
                                    uiSelect.activate(false, true);
                                }, 50);
                            } else {
                                $(moveTo).focus();
                            }
                        }
                    }
                });

                elem.on('focus', function () {
                    popover.webuiPopover('show');
                    $(this).trigger('blur');
                });

                $(url).find('button.btn').on('click', function () {
                    popover.webuiPopover('hide');
                });
            }
        };
    }]);

    PDMA.directive('datetimeFormat', ['$parse', '$filter', function ($parse, $filter) {
        let directive = {
            restrict: 'A',
            require: ['ngModel'],
            link: link
        };
        return directive;

        function link(scope, element, attrs, ctrls) {
            let ngModelController = ctrls[0];
            let format = attrs.customFormat || 'dd/MM/yyyy';

            ngModelController.$formatters.push(function (modelValue) {
                if (!modelValue) {
                    return undefined;
                }

                let dt = new Date(modelValue);
                return $filter('date')(dt, format);
            });
        }
    }]);

    PDMA.directive('expandableButton', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let expanding = false;
                let width = window.innerWidth;
                let span = element.find('span');

                $(window).on('resize', function () {
                    width = window.innerWidth;
                });

                span.hide('fast');

                element.hover(function (ev) {
                    // ev.stopPropagation();
                    if (!expanding && width > 992) {
                        expanding = true;
                        span.show({duration: 10, easing: 'easeInQuad'});
                    }
                }, function (ev) {
                    // ev.stopPropagation();
                    if (expanding && width > 992) {
                        expanding = false;
                        span.hide({duration: 10, easing: 'easeOutQuad'});
                    }
                });
            }
        };
    }]);

    PDMA.directive('expandableControl', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    let width = element.width();
                    let originalWidth = element.width();
                    let elementPos = element.position();
                    let $input = element.find('input[type="text"]');
                    let $placeholder = element.next();

                    $placeholder.hide();
                    $placeholder.css({left: elementPos.left, top: elementPos.top + element.height()});

                    $(window).on('resize', function () {
                        width = element.width();
                    });

                    $input.focus(function (ev) {
                        $placeholder.show(100);
                        element.animate({'width': (width + 30)});
                    });

                    $input.blur(function (ev) {
                        $placeholder.hide(100);
                        element.animate({'width': originalWidth});
                    });
                }, 300);
            }
        };
    }]);

    PDMA.directive('customSlider', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let children = element.find('>span');
                let len = children.length;
                if (len <= 1) {
                    return;
                }

                function setVisibility(indx) {
                    for (let i = 0; i < len; i++) {
                        $(children[i]).hide('slow');
                    }
                    $(children[indx]).show('slow');
                }

                let index = 0;
                setVisibility(index);

                function slide() {
                    if (index >= len) {
                        index = 0;
                    }

                    setVisibility(index);
                    index++;

                    $timeout(slide, 3000);
                }

                $timeout(slide, 3000);
            }
        };
    }]);

    PDMA.directive('regimenInput', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let drugs = ['TDF', '3TC', 'DTG', 'FTC', 'EFV', 'NVP', 'AZT', 'ABC', 'd4T', 'LPV', 'LPV/r', 'ATV/r', 'DRV', 'DRV/r', 'RPV', 'SOF', 'VEL', 'ZDV', 'TAF', 'RAL', 'DCV'];

                element.keyup(function () {
                    let val = element.val();

                    if (!val) {
                        return;
                    }

                    let lastChar = val[val.length - 1];
                    val = val.trim();

                    if (val.length < 3) {
                        return;
                    }

                    let vals = val.split('\+');

                    for (let i = 0; i < vals.length; i++) {
                        let index = drugs.findIndex(e => e.toLowerCase() == vals[i].toLowerCase());

                        if (index >= 0) {
                            vals[i] = drugs[index];
                        }
                    }

                    val = vals.join('+');
                    if (lastChar == ' ') {
                        val += '+';
                    }

                    element.val(val);
                });
            }
        };
    }]);

    PDMA.directive('ngEnter', ['$timeout', function ($timeout) {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    $timeout(function () {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });
                    }, 300);

                    event.preventDefault();
                }
            });
        };
    }]);

    PDMA.directive('titleCase', ['$timeout', function ($timeout) {
        return function (scope, element, attrs) {
            element.bind("keyup", function (event) {
                $timeout(function () {
                    let val = $(element).val();
                    if (!val) {
                        return;
                    }

                    let spl = val.split(' ');
                    for (let i = 0; i < spl.length; i++) {
                        spl[i] = spl[i].charAt(0).toUpperCase() + spl[i].substr(1).toLowerCase();
                        ;
                    }

                    val = spl.join(' ');

                    // val = val.replace(
                    //     /\w\S*/g,
                    //     function (txt) {
                    //         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    //     }
                    // );

                    $(element).val(val);
                }, 300);

                event.preventDefault();
            });

            element.bind('blur', function (event) {
                let val = $(element).val();

                if (!val) {
                    return;
                }

                $(element).val(val.trim());
            });
        };
    }]);

    PDMA.directive('upperCase', ['$timeout', function ($timeout) {
        return function (scope, element, attrs) {
            element.bind("keyup", function (event) {
                let val = $(element).val();
                if (!val) {
                    return;
                }

                $(element).val(val.toUpperCase());
            });

            element.bind('blur', function (event) {
                let val = $(element).val();

                if (!val) {
                    return;
                }

                $(element).val(val.trim());
            });
        };
    }]);

    PDMA.directive('printPage', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).on('click', function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    $timeout(function () {
                        let portion = attrs.printPage;

                        if (portion) {
                            $('#' + portion).print();
                        }
                    }, 300);
                });
            }
        };
    }]);

    PDMA.directive('inputMask', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    let mask = attrs.inputMask;

                    if (mask) {
                        $(element).inputmask({mask: mask});
                    }
                }, 300);
            }
        };
    }]);

    PDMA.directive('collapseButton', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let $content = $(element).closest('div').next('div');
                if (!$content) {
                    return;
                }

                let htmls = ['Thu nh???<i class="fa fa-angle-double-down margin-left-10"></i>', 'M??? r???ng<i class="fa fa-angle-double-up margin-left-10"></i>'];
                let i = 0;

                $(element).click(function () {
                    $content.toggle('slow');
                    i = (i > 0) ? 0 : 1;

                    $(this).html(htmls[i]);
                });
            }
        }
    }]);
    
    PDMA.directive('collapseButtonMap', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let $content = $(element).closest('div').next('div');
                if (!$content) {
                    return;
                }

                let htmls = ['Thu nh???<i class="fa fa-angle-double-down margin-left-10"></i>', 'M??? r???ng<i class="fa fa-angle-double-up margin-left-10"></i>'];
                let i = 1;

                $(element).click(function () {
                    $content.toggle('slow');
                    i = (i < 1) ? 1 : 0;

                    $(this).html(htmls[i]);
                });
            }
        }
    }]);

    PDMA.directive('textareaAutogrow', ['$timeout', '$window', function ($timeout, $window) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).autogrow({vertical: true, horizontal: false});
            }
        };
    }]);

    PDMA.directive('expandableRowContent', ['$timeout', '$window', function ($timeout, $window) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                function adj() {
                    $timeout(function () {
                        let $firstDiv = $(element).find('>div:first>.portlet');
                        let $lastDiv = $(element).find('>div:last>.portlet');

                        let firstHeight = $firstDiv.outerHeight(true);
                        let lastHeight = $lastDiv.outerHeight(true);

                        if (firstHeight > lastHeight) {
                            $lastDiv.outerHeight(firstHeight, true);
                        } else {
                            $firstDiv.outerHeight(lastHeight, true);
                        }
                    }, 600);
                }

                adj();

                $($window).resize(function () {
                    adj();
                });
            }
        };
    }]);

    PDMA.directive('overrideTopMenu', ['$timeout', 'toastr', function ($timeout, toastr) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).mouseup(function () {
                    // $timeout(function () {
                    //     // window.open('https://www.youtube.com/channel/UCr-4J7GWaxGLWDClYd9esYw?view_as=subscriber', '_blank');
                    // }, 300);
                });
            }
        };
    }]);

    PDMA.directive('collapsible', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                let text = attrs.text;
                let trigger = element.find('a');
                let panel = element.next();

                trigger.data['status'] = 'closed';
                trigger.html((text ? text : 'M??? r???ng') + ' <i class="margin-left-5 fa fa-caret-down"></i>');

                function show() {
                    panel.show('fast');
                    trigger.data['status'] = 'openned';
                    trigger.html((text ? text : 'Thu g???n') + ' <i class="margin-left-5 fa fa-caret-up"></i>');
                }

                function hide() {
                    panel.hide('fast');
                    trigger.data['status'] = 'closed';
                    trigger.html((text ? text : 'M??? r???ng') + ' <i class="margin-left-5 fa fa-caret-down"></i>');
                }

                if (attrs.initClosed == 'true') {
                    hide();
                } else {
                    show();
                }

                trigger.on('click', function (ev) {
                    if (trigger.data['status'] == 'openned') {
                        hide();
                    } else {
                        show();
                    }
                    ev.stopPropagation();
                });
            }
        };
    }]);

    PDMA.directive('doubleEntry', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: {callback: '&callback'},
            link: function (scope, element, attrs) {
                if (!scope.callback) {
                    return;
                }

                let originVal = '';

                $(element).focus(function () {
                    originVal = $(element).val();
                });

                $(element).blur(function () {
                    $timeout(function () {
                        let val = $(element).val();

                        if (val === originVal) {
                            return;
                        }

                        if (val && val.trim().length > 0) {
                            scope.callback();
                        }
                    }, 300);
                });
            }
        };
    }]);

    PDMA.directive('dateInput', ['$timeout', '$window', 'Utilities', function ($timeout, $window, utils) {
        return {
            restrict: 'A',
            scope: {
                control: '='
            },
            link: function (scope, element, attrs) {
                element.keyup(function () {
                    let val = element.val();

                    if (!val) {
                        if (element.hasClass('control-error')) {
                            element.removeClass('control-error');
                        }
                        return;
                    }

                    let invalid = utils.invalidDateFromString(val);

                    if (invalid) {
                        if (!element.hasClass('control-error')) {
                            element.addClass('control-error');
                        }
                    } else {
                        if (element.hasClass('control-error')) {
                            element.removeClass('control-error');
                        }
                    }
                });
            }
        }
    }]);

    PDMA.directive('searchBox', ['$timeout', '$window', function ($timeout, $window) {
        return {
            restrict: 'A',
            scope: {
                isLoading: '=isLoading',
            },
            link: function (scope, element, attrs) {
                let $resultBox = element.find('#search-results');
                let $keywordInput = element.find('#typeahead-container');

                // create the cover and append to body
                let $cover = $('<div class="backdrop-cover hidden"></div>');
                $('body').append($cover);

                $resultBox.hide();

                let adjustPos = function () {
                    let pos = $keywordInput.position();
                    if (pos.top >= 100) {
                        $resultBox.css({left: pos.left + 15, top: pos.top + $keywordInput.height() + 2});
                    } else {
                        $resultBox.css({left: pos.left + 15, top: pos.top + $keywordInput.height() + 40});
                    }

                };

                adjustPos();

                $($window).resize(function () {
                    $timeout(function () {
                        adjustPos();
                    }, 0);
                });

                $($window).click(function () {
                    $resultBox.hide('slow');
                });

                $resultBox.click(function (event) {
                    $keywordInput.find('>input').focus();
                    event.stopPropagation();
                });

                let controlVisi = function (input) {
                    let txt = $(input).val();
                    if (txt && txt.trim().length > 0) {
                        $resultBox.show('fast');
                    } else {
                        $resultBox.hide('slow');
                    }
                };

                $keywordInput.find('>input').keyup(function (event) {
                    let txt = $(this).val();
                    if (event.which == 13) {
                        if (txt && txt.trim().length > 0) {
                            $resultBox.show('fast');
                        }
                    } else {
                        if (!txt || txt.trim().length <= 0) {
                            $resultBox.hide('slow');
                        }
                    }
                }).focus(function () {
                    // controlVisi(this);
                    // Cover
                    $cover.removeClass('hidden');
                    // icon
                    updateIcon(true);
                }).blur(function () {
                    // Cover
                    $cover.addClass('hidden');
                    // icon
                    updateIcon(false);
                }).click(function (event) {
                    event.stopPropagation();
                });

                scope.$watch('isLoading', function (newVal, oldVal) {
                    if (newVal != oldVal && newVal == false) {
                        updateIcon(true);
                    }
                });

                function updateIcon(toArrow) {
                    let iconEle = $keywordInput.find('span[data-searching="0"]>i');

                    if (toArrow) {
                        if (iconEle && iconEle.hasClass('fa-search')) {
                            iconEle.css({'cursor': 'pointer'});
                            iconEle.removeClass('fa-search');
                            iconEle.addClass('fa-long-arrow-left');
                        }
                    } else {
                        if (iconEle && iconEle.hasClass('fa-long-arrow-left')) {
                            iconEle.css({'cursor': 'auto'});
                            iconEle.removeClass('fa-long-arrow-left');
                            iconEle.addClass('fa-search');
                        }
                    }
                }
            }
        };
    }]);

    PDMA.directive('fc', [function () {
        return {
            restrict: 'A',
            scope: {
                eventSources: '=ngModel',
                options: '=fcOptions',
                control: '='
            },
            link: function (scope, elm) {
                let calendar;

                scope.internalControl = scope.control || {};
                scope.internalControl.invokeAPI = function (apiName, params) {
                    if (!apiName) {
                        return;
                    }

                    if (params) {
                        calendar.fullCalendar(apiName, params);
                    } else {
                        calendar.fullCalendar(apiName);
                    }
                };

                init();
                scope.$watchCollection('eventSources', watchDirective);
                scope.$watch('options', watchDirective, true);
                scope.$on('$destroy', function () {
                    destroy();
                });

                function init() {
                    if (!calendar) {
                        calendar = $(elm).html('');
                    }
                    calendar.fullCalendar(getOptions(scope.options));
                }

                function destroy() {
                    if (calendar && calendar.fullCalendar) {
                        calendar.fullCalendar('destroy');
                    }
                }

                function getOptions(options) {
                    return angular.extend({}, {
                        eventSources: scope.eventSources
                    }, options);
                }

                function watchDirective(newOptions, oldOptions) {
                    if (newOptions !== oldOptions) {
                        destroy();
                        init();
                    } else if ((newOptions && angular.isUndefined(calendar))) {
                        init();
                    }
                }
            }
        };
    }]);

})();
