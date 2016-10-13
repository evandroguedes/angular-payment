/*global angular: false */
angular.module('payment.service', [])
    .factory('payment', ['$document', function ($document) {
        'use strict';

        var defaultFormat = /(\d{1,4})/g,
            cards = [
                {
                    type: 'maestro',
                    pattern: /^(5(018|0[23]|[68])|6(39|7))/,
                    format: defaultFormat,
                    length: [12, 13, 14, 15, 16, 17, 18, 19],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'dinersclub',
                    pattern: /^(36|38|30[0-5])/,
                    format: defaultFormat,
                    length: [14],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'laser',
                    pattern: /^(6706|6771|6709)/,
                    format: defaultFormat,
                    length: [16, 17, 18, 19],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'jcb',
                    pattern: /^35/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'unionpay',
                    pattern: /^62/,
                    format: defaultFormat,
                    length: [16, 17, 18, 19],
                    cvcLength: [3],
                    luhn: false
                }, {
                    type: 'discover',
                    pattern: /^(6011|65|64[4-9]|622)/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'mastercard',
                    pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'amex',
                    pattern: /^3[47]/,
                    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
                    length: [15],
                    cvcLength: [3, 4],
                    luhn: true
                }, {
                    type: 'visa',
                    pattern: /^4/,
                    format: defaultFormat,
                    length: [13, 14, 15, 16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'visaelectron',
                    pattern: /^4(026|17500|405|508|844|91[37])/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'forbrugsforeningen',
                    pattern: /^600/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'dankort',
                    pattern: /^5019/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: true
                }, {
                    type: 'elo',
                    pattern: /^401178|^401179|^431274|^438935|^451416|^457393|^457631|^457632|^504175|^627780|^636297|^636368|^(506699|5067[0-6]\d|50677[0-8])|^(50900\d|5090[1-9]\d|509[1-9]\d{2})|^65003[1-3]|^(65003[5-9]|65004\d|65005[0-1])|^(65040[5-9]|6504[1-3]\d)|^(65048[5-9]|65049\d|6505[0-2]\d|65053     [0-8])|^(65054[1-9]|6505[5-8]\d|65059[0-8])|^(65070\d|65071[0-8])|^65072[0-7]|^(65090[1-9]|65091\d|650920)|^(65165[2-9]|6516[6-7]\d)|^(65500\d|65501\d)|^(65502[1-9]|6550[3-4]\d|65505[0-8])/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: false
                }, {
                    type: 'aura',
                    pattern: /^50[0-9]/,
                    format: defaultFormat,
                    length: [16],
                    cvcLength: [3],
                    luhn: false
                }
            ],
            trim = function (str) {
                return str.toString().replace(/^\s+|\s+$/g, '');
            },
            hasTextSelected = function (elm) {
                var ref;
                if ((elm.prop('selectionStart') != null) && elm.prop('selectionStart') !== elm.prop('selectionEnd')) { return true; }
                return $document !== undefined && $document !== null ? (ref = $document.selection) != null ? typeof ref.createRange === "function" ? ref.createRange().text : undefined : undefined : undefined;
            },
            cardFromNumber = function (num) {
                var card, i, len;
                if (!num) { return null; }
                num = num.toString().replace(/\D/g, '');
                for (i = 0, len = cards.length; i < len; i++) {
                    card = cards[i];
                    if (card.pattern.test(num)) { return card; }
                }

                return null;
            },
            luhnCheck = function (num) {
                var digit, digits = num.toString().split('').reverse(), sum = 0, i, odd = true;
                for (i = 0; i < digits.length; i++) {
                    digit = digits[i];
                    digit = parseInt(digit, 10);
                    if ((odd = !odd)) { digit *= 2; }
                    if (digit > 9) { digit -= 9; }
                    sum += digit;
                }

                return sum % 10 === 0;
            },
            validateCardNumber = function (num) {
                if (!num) { return false; }

                var card;
                num = num.toString().replace(/\s+|-/g, '');
                if (!/^\d+$/.test(num)) { return false; }
                card = cardFromNumber(num);

                return card ? (card.length.indexOf(num.length) >= 0) && (card.luhn === false || luhnCheck(num)) : false;
            },
            formatCardNumber = function (num) {
                var card = cardFromNumber(num), groups, upperLength, ref, result;
                if (!card) { return num; }
                upperLength = card.length[card.length.length - 1];
                num = num.replace(/\D/g, '');
                num = num.slice(0, +upperLength + 1 || 9e9);
                if (card.format.global) {
                    result = (ref = num.match(card.format)) !== null ? ref.join(' ') : undefined;
                } else {
                    groups = card.format.exec(num);
                    if (groups !== null) { groups.shift(); }
                    result = groups !== null ? groups.join(' ') : undefined;
                }

                return result;
            },
            validateCardExpiry = function (month, year) {
                var currentTime, expiry, prefix;
                if (typeof month === 'object' && month.hasOwnProperty('month')) {
                    year = month.year;
                    month = month.month;
                }

                if (!(month && year)) { return false; }

                month = trim(month);
                year = trim(year);
                if (!/^\d+$/.test(month)) { return false; }
                if (!/^\d+$/.test(year)) { return false; }
                if (!(parseInt(month, 10) <= 12)) { return false; } // jshint ignore:line
                if (year.length === 2) {
                    prefix = (new Date()).getFullYear();
                    prefix = prefix.toString().slice(0, 2);
                    year = prefix + year;
                }

                expiry = new Date(year, month);
                currentTime = new Date();
                expiry.setMonth(expiry.getMonth() - 1);
                expiry.setMonth(expiry.getMonth() + 1, 1);

                return expiry > currentTime;
            },
            cardFromType = function (type) {
                var i;
                for (i = 0; i < cards.length; i++) {
                    if (cards[i].type === type) { return cards[i]; }
                }

                return undefined;
            },
            validateCardCVC = function (cvc, type) {
                var card;
                cvc = trim(cvc);
                if (!/^\d+$/.test(cvc)) { return false; }
                if (type) {
                    card = cardFromType(type);
                    return card ? card.cvcLength.indexOf(cvc.length) >= 0 : false;
                }

                return cvc.length >= 3 && cvc.length <= 4;
            };

        return {
            hasTextSelected: hasTextSelected,
            cardFromNumber: cardFromNumber,
            validateCardNumber: validateCardNumber,
            validateCardExpiry: validateCardExpiry,
            validateCardCvc: validateCardCVC,
            formatCardNumber: formatCardNumber
        };
    }]);
