(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.vn = {}));
}(this, function (exports) {
    'use strict';

    let fp = typeof window !== "undefined" && window.flatpickr !== undefined
        ? window.flatpickr
        : {
            l10ns: {}
        };
    let Vietnamese = {
        weekdays: {
            shorthand: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            longhand: [
                "Chủ Nhật",
                "Thứ Hai",
                "Thứ Ba",
                "Thứ Tư",
                "Thứ Năm",
                "Thứ Sáu",
                "Thứ Bảy",
            ]
        },
        months: {
            shorthand: [
                "Th1",
                "Th2",
                "Th3",
                "Th4",
                "Th5",
                "Th6",
                "Th7",
                "Th8",
                "Th9",
                "Th10",
                "Th11",
                "Th12",
            ],
            longhand: [
                "Tháng Một",
                "Tháng Hai",
                "Tháng Ba",
                "Tháng Tư",
                "Tháng Năm",
                "Tháng Sáu",
                "Tháng Bảy",
                "Tháng Tám",
                "Tháng Chín",
                "Tháng Mười",
                "Tháng 11",
                "Tháng 12",
            ]
        },
        firstDayOfWeek: 1,
        rangeSeparator: " - ",
        weekAbbreviation: "Tuần",
        scrollTitle: "Cuộn để tăng",
        toggleTitle: "Click to toggle",
        amPM: ["SÁNG", "CHIỀU"],
        yearAriaLabel: "Năm",
    };
    fp.l10ns.vn = Vietnamese;
    let vn = fp.l10ns;

    exports.Vietnamese = Vietnamese;
    exports.default = vn;

    Object.defineProperty(exports, '__esModule', {value: true});

}));
