let reserve = require('./reserve.controller');

describe('Next Weekday Date Getter', () => {
    it('When the day of date parameter is (0) Sunday , then it should return the first succeeding date with the day (1) Monday', () => {
		// Arrange
		const date = new Date (2020, 11, 15);

		// Act
		const newDate = reserve.getNextWeekDayDate(date);

		// Assert
		const expectedDate = new Date (2020, 11, 16);
        expect(newDate.toISOString().substring(0,10)).toBe(expectedDate.toISOString().substring(0,10))
	});
	
	//TODO more test cases
});

describe('Pickup Time Getter (returns array where 1st element is hour, and 2nd element is minute)', () => {
    it('When option number is 1, then it should return [7, 30]', () => {
		// Arrange
		const optionNumber = 1;

		// Act
		const timeArray = reserve.getPickupTime(optionNumber);

		// Assert
        expect(timeArray).toEqual([7,30])
	});
	
	//TODO more test cases
});