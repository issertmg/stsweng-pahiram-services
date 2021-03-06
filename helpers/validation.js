const { check } = require('express-validator');

const validation = {
    addPanelValidation: function () {
        return [
            check('type', 'Type should not be empty.').notEmpty().isIn(['big', 'small']),
            check('building', 'Building should not be empty.').notEmpty(),
            check('building', 'Building should contain a maximum of 100 characters.').isLength({min: 1, max: 100}),
            check('level', 'Floor level should be an integer.').notEmpty().isInt({min: 1, max: 50}),
            check('lowerRange', 'Lower range should be an integer.').notEmpty().isInt({min: 1, max: 1000}),
            check('upperRange', 'Upper range should be an integer greater than or equal to lower range.')
                .notEmpty().isInt({min: 1, max: 1000}).custom((upperRange, {req}) => {
                    let lower = parseInt(req.body.lowerRange);
                    let upper = parseInt(upperRange);
                    return upper >= lower;
                })
        ];
    },

    addOrUpdateEquipmentValidation: function () {
        return [
            check('name', 'Equipment name should not be empty.')
                .notEmpty()
                .isLength({min: 1, max: 50}),
            check('brand', 'Equipment brand should not be empty.')
                .notEmpty()
                .isLength({min: 1, max: 50}),
            check('model', 'Equipment model should not be empty.')
                .notEmpty()
                .isLength({min: 1, max: 50}),
            check('count', 'Quantity should be an integer from 1-1000, inclusive.').notEmpty()
                .isInt({gt: 0, max: 1000})
        ];
    },

    reserveEquipmentValidation: function () {
        return [
            check('reason', 'Reason for borrowing should not be empty.')
                .notEmpty()
                .isLength({min: 1, max: 250}),
            check('borrowtime', 'Borrow time option number should be an integer.').notEmpty().isInt()
        ];
    },

    registerValidation: function () {
        return [
            check('idNum', 'ID number should be numeric.')
                .isNumeric({no_symbols: true}),
            check('idNum', 'ID number should contain 8 digits.')
                .isLength({min: 8, max: 8}),
            check('degProg', 'Degree program is invalid.')
                .notEmpty()
                .isLength({min: 1, max: 15}),
            check('degProg', 'Degree program should only contain letters and hyphens.')
                .trim().blacklist(' -').isAlpha(),
            check('phone', 'Phone cannot be empty')
                .notEmpty(),
            check('phone', 'Invalid phone number')
                .isLength({min: 10, max: 10})
                .isNumeric({no_symbols: true}),
        ];
    },

    editProfileValidation: function () {
        return [
            check('phone', 'Phone cannot be empty').notEmpty(),
            check('phone', 'Invalid phone number')
                .isLength({min: 10, max: 10})
                .isNumeric({no_symbols: true})
        ];
    },

    updateReservationValidation: function () {
        return [
            check('penalty', 'Penalty should be 0 or a positive number').notEmpty()
                .isFloat({min: 0}),
            check('remarks', 'Maximum length of remarks is 250 characters')
                .isLength({max: 250})
        ];
    },

    updateUserValidation: function () {
        return [
            check('idNum', 'ID number should be an integer and contain 8 digits').notEmpty()
                .isNumeric({no_symbols: true})
                .isLength({min: 8, max: 8}),
            check('college', 'College is invalid').notEmpty()
                .isIn([
                    'College of Education',
                    'College of Computer Studies',
                    'College of Liberal Arts',
                    'College of Science',
                    'College of Engineering',
                    'College of Business',
                    'School of Economics']),
            check('degProg', 'Degree program should only contain letters and/or dash').notEmpty()
                .isLength({min: 1, max: 15}).custom((degProg, {req}) => {
                let regex = /[a-z\-\s]*/i;
                return degProg.match(regex)[0] === degProg;
            }),
            check('mobile','Phone cannot be empty and should be valid').notEmpty()
                .isLength({min: 10, max: 10})
                .isNumeric({no_symbols: true})
        ];
    },

    bookValidation: function () {
        return [
            check('title', 'Book title should not be empty.').notEmpty().isLength({max: 50}),
            check('authors', 'Authors should not be empty.').notEmpty().isLength({max: 50}),
            check('quantity', 'Quantity should be an integer.').notEmpty().isInt({min: 1, max: 1000}),
            check('edition', 'Book edition should contain 50 characters at max.').trim().isLength({min: 0, max: 50})
        ];
    },
}

module.exports = validation;