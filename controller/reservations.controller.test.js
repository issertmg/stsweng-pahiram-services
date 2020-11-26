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