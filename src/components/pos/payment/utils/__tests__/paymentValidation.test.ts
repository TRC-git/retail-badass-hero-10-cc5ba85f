
import { validatePayment } from '../paymentValidation';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

// Mock the toast library
jest.mock('sonner', () => ({
  error: jest.fn(),
}));

describe('validatePayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return true for valid cash payment', () => {
    const result = validatePayment('cash', 15, '20', undefined, undefined);
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('should return false when cash amount is less than total', () => {
    const result = validatePayment('cash', 20, '15', undefined, undefined);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Amount tendered must be equal to or greater than the total');
  });

  test('should return false when card details are missing', () => {
    const result = validatePayment('card', 20, '0', {
      cardNumber: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCVC: ''
    }, undefined);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Please enter all card details');
  });

  test('should return false when card number is invalid', () => {
    const result = validatePayment('card', 20, '0', {
      cardNumber: '123',
      cardExpiryMonth: '12',
      cardExpiryYear: '25',
      cardCVC: '123'
    }, undefined);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Invalid card number');
  });

  test('should return true for valid card payment', () => {
    const result = validatePayment('card', 20, '0', {
      cardNumber: '4111111111111111',
      cardExpiryMonth: '12',
      cardExpiryYear: '25',
      cardCVC: '123'
    }, undefined);
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('should return false when check number is missing', () => {
    const result = validatePayment('check', 20, '0', undefined, '');
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Please enter a check number');
  });

  test('should return true for valid check payment', () => {
    const result = validatePayment('check', 20, '0', undefined, '12345');
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('should return true for tab payment', () => {
    const result = validatePayment('tab', 20, '0', undefined, undefined);
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('should return true for gift card payment', () => {
    const result = validatePayment('gift_card', 20, '0', undefined, undefined);
    expect(result).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
