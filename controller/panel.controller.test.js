/**
 * @jest-environment node
 */

let panelController = require('./panel.controller');

describe('Identifying the missing panel number', () => {

    it('If the first panel number is missing, it should return 1', () => {
        // Arrange
        const panelNumbers = [2, 3, 4, 5];
        // Act
        const missingPanelNumber = panelController.getMissingPanelNumber(panelNumbers);
        // Assert
        expect(missingPanelNumber).toEqual(1);
    });

    it('If the missing panel number is between the series of numbers, the respective missing panel number should be returned.', () => {
        // Arrange
        const panelNumbers = [1, 2, 3, 4, 6, 7, 8];
        // Act
        const missingPanelNumber = panelController.getMissingPanelNumber(panelNumbers);
        // Assert
        expect(missingPanelNumber).toEqual(5);
    });

    it('If there are more than one missing panel numbers, the number closest to 0 should be returned.', () => {
        // Arrange
        const panelNumbers = [1, 2, 4, 5, 6, 7, 9, 10];
        // Act
        const missingPanelNumber = panelController.getMissingPanelNumber(panelNumbers);
        // Assert
        expect(missingPanelNumber).toEqual(3);
    });

    it('If there are no missing panel numbers within the range, a new panel number is given (i.e. next number after the last)', () => {
        // Arrange
        const panelNumbers = [1, 2, 3, 4, 5, 6, 7];
        // Act
        const missingPanelNumber = panelController.getMissingPanelNumber(panelNumbers);
        // Assert
        expect(missingPanelNumber).toEqual(8);
    });

    it('If there are no panel numbers, it should return 1.', () => {
        // Arrange
        const panelNumbers = [];
        // Act
        const missingPanelNumber = panelController.getMissingPanelNumber(panelNumbers);
        // Assert
        expect(missingPanelNumber).toEqual(1);
    });
});

describe('Checking if the panel is deletable (i.e. not a single locker is occupied/uncleared.', () => {

    it('If all lockers are vacant, the panel is deletable.', () => {
        // Arrange
        const lockers = [
            {number: 1, status: 'vacant'},
            {number: 2, status: 'vacant'},
            {number: 3, status: 'vacant'}
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(true);
    });

    it('If all lockers are broken, the panel is deletable.', () => {
        // Arrange
        const lockers = [
            {number: 1, status: 'broken'},
            {number: 2, status: 'broken'},
            {number: 3, status: 'broken'}
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(true);
    });

    it('If all lockers are either vacant or broken, the panel is deletable.', () => {
        // Arrange
        const lockers = [
            {number: 100, status: 'vacant'},
            {number: 101, status: 'broken'},
            {number: 102, status: 'vacant'},
            {number: 103, status: 'vacant'},
            {number: 104, status: 'broken'}
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(true);
    });

    it('If one of the lockers is occupied, the panel is NOT deletable.', () => {
        // Arrange
        const lockers = [
            {number: 100, status: 'vacant'},
            {number: 101, status: 'broken'},
            {number: 102, status: 'vacant'},
            {number: 103, status: 'occupied'},
            {number: 104, status: 'broken'}
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(false);
    });

    it('If one of the lockers is uncleared, the panel is NOT deletable.', () => {
        // Arrange
        const lockers = [
            {number: 100, status: 'vacant'},
            {number: 101, status: 'uncleared'},
            {number: 102, status: 'vacant'},
            {number: 103, status: 'broken'},
            {number: 104, status: 'vacant'},
            {number: 105, status: 'vacant'},
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(false);
    });

    it('If all lockers are uncleared, the panel is NOT deletable.', () => {
        // Arrange
        const lockers = [
            {number: 100, status: 'uncleared'},
            {number: 101, status: 'uncleared'},
            {number: 102, status: 'uncleared'},
            {number: 103, status: 'uncleared'},
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(false);
    });

    it('If more than one locker is either uncleared or occupied, the panel is NOT deletable.', () => {
        // Arrange
        const lockers = [
            {number: 100, status: 'vacant'},
            {number: 101, status: 'uncleared'},
            {number: 102, status: 'occupied'},
            {number: 103, status: 'broken'},
            {number: 103, status: 'vacant'},
            {number: 103, status: 'vacant'},
            {number: 103, status: 'vacant'},
        ];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(false);
    });

    it('If there is only one locker in the panel, and it is vacant, then the panel is deletable.', () => {
        // Arrange
        const lockers = [{number: 1, status: 'vacant'}];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(true);
    });

    it('If there are no lockers, then the panel is deletable.', () => {
        // Arrange
        const lockers = [];
        // Act
        const deletable = panelController.isPanelDeletable(lockers);
        // Assert
        expect(deletable).toEqual(true);
    });
});

describe('Checking if locker range does not overlap existing locker ranges', () => {

    it('New panel locker range does not overlap existing locker ranges', () => {
        // Arrange
        const panels = [
            {lowerRange: 1, upperRange: 10},
            {lowerRange: 20, upperRange: 25},
            {lowerRange: 26, upperRange: 30},
        ];
        const newPanelLowerRange = 11;
        const newPanelUpperRange = 19;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(true);
    })

    it('Lower range of new panel overlaps an existing panel', () => {
        // Arrange
        const panels = [
            {lowerRange: 1, upperRange: 10},
            {lowerRange: 20, upperRange: 25},
            {lowerRange: 26, upperRange: 30},
        ];
        const newPanelLowerRange = 5;
        const newPanelUpperRange = 19;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(false);
    });

    it('Upper range of new panel overlaps an existing panel', () => {
        // Arrange
        const panels = [
            {lowerRange: 10, upperRange: 19},
            {lowerRange: 20, upperRange: 25},
            {lowerRange: 26, upperRange: 30},
            {lowerRange: 45, upperRange: 56},
        ];
        const newPanelLowerRange = 35;
        const newPanelUpperRange = 49;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(false);
    });

    it('Entire range of the new panel overlaps existing panels', () => {
        // Arrange
        const panels = [
            {lowerRange: 10, upperRange: 19},
            {lowerRange: 22, upperRange: 25},
            {lowerRange: 26, upperRange: 30},
            {lowerRange: 45, upperRange: 56},
        ];
        const newPanelLowerRange = 20;
        const newPanelUpperRange = 34;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(false);
    });

    it('Lower range of new panel overlaps an existing panel, and upper range of new panel overlaps another existing panel', () => {
        // Arrange
        const panels = [
            {lowerRange: 10, upperRange: 19},
            {lowerRange: 22, upperRange: 25},
            {lowerRange: 26, upperRange: 30},
            {lowerRange: 45, upperRange: 56},
        ];
        const newPanelLowerRange = 28;
        const newPanelUpperRange = 52;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(false);
    });

    it('No panels have been created yet', () => {
        // Arrange
        const panels = [];
        const newPanelLowerRange = 1;
        const newPanelUpperRange = 20;
        // Act
        const valid = panelController.isValidLockerRange(panels, newPanelLowerRange, newPanelUpperRange);
        // Assert
        expect(valid).toEqual(true);
    });

});