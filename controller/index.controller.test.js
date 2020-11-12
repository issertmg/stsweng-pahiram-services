let index = require('./index.controller');

describe('Sample', () => {
    it('Test function should return true', () => {
        // Arrange
        // Act
        // Assert
        expect(index.testFcn()).toEqual(true);
    });
});