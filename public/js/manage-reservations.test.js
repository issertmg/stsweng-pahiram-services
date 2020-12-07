/**
 * @jest-environment jsdom
 */

let manageReservations = require('./manage-reservations');

describe('Set Status Checker', () => {

  it('When the current status is "Pending" and the next status is "pending", it should return true.', () => {
    // Arrange
    const currentStatus = "Pending";
    const nextStatus = "pending";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Pending" and the next status is "pickup-pay", it should return true.', () => {
    // Arrange
    const currentStatus = "Pending";
    const nextStatus = "pickup-pay";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Pending" and the next status is "denied", it should return true.', () => {
    // Arrange
    const currentStatus = "Pending";
    const nextStatus = "denied";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Pending" and the next status is "uncleared", it should return false.', () => {
    // Arrange
    const currentStatus = "Pending";
    const nextStatus = "uncleared";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "To Pay" and the next status is "on-rent", it should return true.', () => {
    // Arrange
    const currentStatus = "To Pay";
    const nextStatus = "on-rent";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "For Pickup" and the next status is "denied", it should return true.', () => {
    // Arrange
    const currentStatus = "For Pickup";
    const nextStatus = "denied";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Uncleared" and the next status is "pending", it should return false.', () => {
    // Arrange
    const currentStatus = "Uncleared";
    const nextStatus = "pending";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "Returned" and the next status is "denied", it should return false.', () => {
    // Arrange
    const currentStatus = "Returned";
    const nextStatus = "denied";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "Returned" and the next status is "returned", it should return true.', () => {
    // Arrange
    const currentStatus = "Returned";
    const nextStatus = "returned";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Denied" and the next status is "pickup-pay", it should return false.', () => {
    // Arrange
    const currentStatus ="Denied";
    const nextStatus = "pickup-pay";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "Denied" and the next status is "denied", it should return true.', () => {
    // Arrange
    const currentStatus = "Denied";
    const nextStatus = "denied";
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("true");
  });

  it('When the current status is "Denied" and the next status is "returned", it should return false.', () => {
    // Arrange
    const currentStatus = "Denied";
    const nextStatus = 'returned';
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "To Pay" and the next status is "uncleared", it should return false.', () => {
    // Arrange
    const currentStatus = "To Pay";
    const nextStatus = 'uncleared';
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

  it('When the current status is "For Pickup" and the next status is "returned", it should return false.', () => {
    // Arrange
    const currentStatus = "For Pickup";
    const nextStatus = 'returned';
    // Act
    const isValid = manageReservations.isValidSetStatus(currentStatus, nextStatus);
    // Assert
    expect(isValid.toString()).toBe("false");
  });

});