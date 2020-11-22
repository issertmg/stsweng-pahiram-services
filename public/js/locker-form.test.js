/**
 * @jest-environment jsdom
 */

let lockerForm = require('./locker-form');

describe('Removing a Query String Parameter from a URL', () => {

    it('When the URL contains a query string parameter, it should be deleted.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker?bldg=La%20Salle';
        // Act
        const newURL = lockerForm.removeQueryStringParam('bldg', url);
        // Assert
        expect(newURL).toEqual('http://pahiram-services.com/reserve/locker?');
    });

    it('When the URL contains more than one query string parameter, the specified parameter should be deleted.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker?bldg=Henry%20Sy&flr=21';
        // Act
        const newURL = lockerForm.removeQueryStringParam('flr', url);
        // Assert
        expect(newURL).toEqual('http://pahiram-services.com/reserve/locker?bldg=Henry%20Sy');
    });

    it('When the URL does not contain query string parameter, the URL returned is unchanged.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker';
        // Act
        const newURL = lockerForm.removeQueryStringParam('flr', url);
        // Assert
        expect(newURL).toEqual(url);
    });

    it('When the specified query string parameter does not exist in the URL, the URL returned is unchanged.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker?flr=12';
        // Act
        const newURL = lockerForm.removeQueryStringParam('bldg', url);
        // Assert
        expect(newURL).toEqual(url);
    });
});

describe('Updating the Query String Parameter from a URL', () => {

    it('When the URL does not contain the specified parameter, it adds it.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker';
        // Act
        const newURL = lockerForm.getUpdatedURL(url, 'bldg', 'La%20Salle');
        // Assert
        expect(newURL).toEqual('http://pahiram-services.com/reserve/locker?bldg=La%20Salle');
    });

    it('When the URL contains the specified parameter, its value is replaced.', () => {
        // Arrange
        const url = 'http://pahiram-services.com/reserve/locker?bldg=La%20Salle&flr=2';
        // Act
        const newURL = lockerForm.getUpdatedURL(url, 'flr', '5');
        // Assert
        expect(newURL).toEqual('http://pahiram-services.com/reserve/locker?bldg=La%20Salle&flr=5');
    });
});