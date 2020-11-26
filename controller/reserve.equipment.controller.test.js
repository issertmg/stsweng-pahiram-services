/**
 * @jest-environment node
 */

let reserve = require('./reserve.equipment.controller');

describe('Next Weekday Date Getter', () => {
    it('When the day of date parameter is Sunday , then it should return the first succeeding date with the day Monday', () => {
		// Arrange
		const date = new Date (2020, 10, 15);

		// Act
		const newDate = reserve.getNextWeekDayDate(date);

		// Assert
		const expectedDate = new Date (2020, 10, 16);
        expect(newDate.toISOString().substring(0,10)).toBe(expectedDate.toISOString().substring(0,10));
	});

	it('When the day of date parameter is Friday , then it should return the first succeeding date with the day Monday', () => {
		// Arrange
		const date = new Date (2021, 0, 29);

		// Act
		const newDate = reserve.getNextWeekDayDate(date);

		// Assert
		const expectedDate = new Date (2021, 1, 1);
        expect(newDate.toISOString().substring(0,10)).toBe(expectedDate.toISOString().substring(0,10));
	});

	it('When the day of date parameter is Saturday , then it should return the first succeeding date with the day Monday', () => {
		// Arrange
		const date = new Date (2018, 11, 1);

		// Act
		const newDate = reserve.getNextWeekDayDate(date);

		// Assert
		const expectedDate = new Date (2018, 11, 3);
        expect(newDate.toISOString().substring(0,10)).toBe(expectedDate.toISOString().substring(0,10));
	});

	it('When the day of date parameter is Wednesday , then it should return the first succeeding date with the day Thursday', () => {
		// Arrange
		const date = new Date (2019, 3, 17);

		// Act
		const newDate = reserve.getNextWeekDayDate(date);

		// Assert
		const expectedDate = new Date (2019, 3, 18);
        expect(newDate.toISOString().substring(0,10)).toBe(expectedDate.toISOString().substring(0,10));
	});
});

describe('Pickup Time Getter (returns array where 1st element is hour, and 2nd element is minute)', () => {
    it('When option number is 1, then it should return [7, 30]', () => {
		// Arrange
		const optionNumber = 1;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([7,30]);
	});
	
	it('When option number is 2, then it should return [9, 15]', () => {
		// Arrange
		const optionNumber = 2;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([9,15]);
	});

	it('When option number is 3, then it should return [11, 0]', () => {
		// Arrange
		const optionNumber = 3;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([11,0]);
	});

	it('When option number is 4, then it should return [12, 45]', () => {
		// Arrange
		const optionNumber = 4;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([12,45]);
	});

	it('When option number is 5, then it should return [14, 30]', () => {
		// Arrange
		const optionNumber = 5;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([14,30]);
	});

	it('When option number is 6, then it should return [16, 15]', () => {
		// Arrange
		const optionNumber = 6;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([16,15]);
	});

	it('When option number is invalid, then it should return [7, 30]', () => {
		// Arrange
		const optionNumber = 8;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([7,30]);
	});
});