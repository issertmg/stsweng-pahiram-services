/**
 * @jest-environment node
 */

let reservation = require('./reservations.controller');

describe('Reservation Cancellability Checker', () => {
    it('When the status of the reservation is Pending, then it should return true', () => {
        // Arrange
        const reservationObject = {status: "Pending"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(true);
    });

    it('When the status of the reservation is For Pickup, then it should return true', () => {
        // Arrange
        const reservationObject = {status: "For Pickup"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(true);
    });

    it('When the status of the reservation is To Pay, then it should return true', () => {
        // Arrange
        const reservationObject = {status: "To Pay"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(true);
    });

    it('When the status of the reservation is Uncleared, then it should return false', () => {
        // Arrange
        const reservationObject = {status: "Uncleared"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(false);
    });

    it('When the status of the reservation is Returned, then it should return false', () => {
        // Arrange
        const reservationObject = {status: "Returned"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(false);
    });

    it('When the status of the reservation is Denied, then it should return false', () => {
        // Arrange
        const reservationObject = {status: "Denied"}

        // Act
        const result = reservation.isCancellable(reservationObject);

        // Assert
        expect(result).toBe(false);
    });
});

describe('Admin Checker', () => {
    it('When usertype is student, then it should return false', () => {
        // Arrange
        const userObject = {type: "student"};

        // Act
        const result = reservation.userIsAdmin(userObject);

        // Assert
        expect(result).toBe(false);
    });

    it('When usertype is studentRep, then it should return true', () => {
        // Arrange
        const userObject = {type: "studentRep"};

        // Act
        const result = reservation.userIsAdmin(userObject);

        // Assert
        expect(result).toBe(true);
    });
});

describe('Get Sort Parameters', () => {
    it('When the column number is valid and the direction is ASCENDING, the appropriate column name and direction is returned.', () => {
        // Arrange
        const column = '0';
        const dir = 'asc';

        // Act
        const result = reservation.getSortValue(column, dir);

        // Assert
        expect(result).toEqual({'userID': 1});
    });

    it('When the column number is valid and the direction is DESCENDING, the appropriate column name and direction is returned.', () => {
        // Arrange
        const column = '2';
        const dir = 'desc';

        // Act
        const result = reservation.getSortValue(column, dir);

        // Assert
        expect(result).toEqual({'onItemType': -1});
    });

    it('When the column number is not among the choices, the default column lastUpdated and default sort order -1 are set.', () => {
        // Arrange
        const column = '100';
        const dir = 'asc';

        // Act
        const result = reservation.getSortValue(column, dir);

        // Assert
        expect(result).toEqual({'lastUpdated': -1});
    });

    it('When the sort order is neither asc nor desc, the default sort order -1 is set.', () => {
        // Arrange
        const column = '1';
        const dir = 'something_else';

        // Act
        const result = reservation.getSortValue(column, dir);

        // Assert
        expect(result).toEqual({'dateCreated': -1});
    });

    it('When one of the two parameters is null, the default sort is set.', () => {
        // Arrange
        const column = null;
        const dir = 'asc';

        // Act
        const result = reservation.getSortValue(column, dir);

        // Assert
        expect(result).toEqual({'lastUpdated': -1});
    });
});

describe('Payment Date Checker', () => {
    it('When the set payment date is the date yesterday, then it should return false', () => {
        // Arrange
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() - 1);

        // Act
        const result = reservation.isValidPaymentDate(paymentDate);

        // Assert
        expect(result).toBe(false);
    });

    it('When the set payment date is the date today, then it should return true', () => {
        // Arrange
        const paymentDate = new Date();

        // Act
        const result = reservation.isValidPaymentDate(paymentDate);

        // Assert
        expect(result).toBe(true);
    });

    it('When the set payment date is the date tomorrow, then it should return true', () => {
        // Arrange
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() + 1);

        // Act
        const result = reservation.isValidPaymentDate(paymentDate);

        // Assert
        expect(result).toBe(true);
    });
});

describe('Checking if Reservation is Deletable', () => {
    it('When the reservation status is Returned, it should be deletable', () => {
        // Arrange
        const status = 'Returned';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(true);
    });

    it('When the reservation status is Denied, it should be deletable', () => {
        // Arrange
        const status = 'Denied';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(true);
    });

    it('When the reservation status is On Rent, it should NOT be deletable', () => {
        // Arrange
        const status = 'On Rent';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });

    it('When the reservation status is For Pickup, it should NOT be deletable', () => {
        // Arrange
        const status = 'For Pickup';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });

    it('When the reservation status is To Pay, it should NOT be deletable', () => {
        // Arrange
        const status = 'To Pay';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });

    it('When the reservation status is Uncleared, it should NOT be deletable', () => {
        // Arrange
        const status = 'Uncleared';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });

    it('When the reservation status is Pending, it should NOT be deletable', () => {
        // Arrange
        const status = 'Pending';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });

    it('When the reservation status is a random string (not matching Denied or Returned), it should NOT be deletable', () => {
        // Arrange
        const status = 'asdfg';

        // Act
        const result = reservation.reservationIsDeletable(status);

        // Assert
        expect(result).toBe(false);
    });
});