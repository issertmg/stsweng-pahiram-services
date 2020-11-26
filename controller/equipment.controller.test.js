/**
 * @jest-environment node
 */

let equipment = require('./equipment.controller');

describe('Public ID (filename without file extension) Getter', () => {
    it('When filename in URL only contains one "." (sample.jpg), then it should return "sample"', () => {
        // Arrange
        const url = 'http://res.cloudinary.com/dxknp9c0t/image/upload/v1605611070/sample.jpg';

        // Act
        const publicID = equipment.getPublicIDFromURL(url);

        // Assert
        expect(publicID).toBe("sample");
    });

    it('When filename in URL only contains two "." (sa.mple.jpg), then it should return "sa.mple"', () => {
        // Arrange
        const url = 'http://res.cloudinary.com/dksidvjfi/v1605611070/sa.mple.jpg';

        // Act
        const publicID = equipment.getPublicIDFromURL(url);

        // Assert
        expect(publicID).toBe("sa.mple");
    });

    it('When filename in URL only contains three "." (sa.mp.le.png), then it should return "sa.mp.le"', () => {
        // Arrange
        const url = 'http://res.cloudinary.com/sa.mp.le.png';

        // Act
        const publicID = equipment.getPublicIDFromURL(url);

        // Assert
        expect(publicID).toBe("sa.mp.le");
    });
});