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
    }
}

module.exports = validation;