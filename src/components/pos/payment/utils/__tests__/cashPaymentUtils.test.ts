
import { calculateChange, handleNumpadInput } from '../cashPaymentUtils';

describe('calculateChange', () => {
  test('should return correct change when amount tendered is greater than total', () => {
    const result = calculateChange('20', 15);
    expect(result).toBe(5);
  });

  test('should return 0 when amount tendered is less than total', () => {
    const result = calculateChange('10', 15);
    expect(result).toBe(0);
  });

  test('should return 0 when amount tendered is equal to total', () => {
    const result = calculateChange('15', 15);
    expect(result).toBe(0);
  });

  test('should handle string parsing correctly', () => {
    const result = calculateChange('20.5', 15.25);
    expect(result).toBe(5.25);
  });

  test('should handle invalid amount tendered as 0', () => {
    const result = calculateChange('invalid', 15);
    expect(result).toBe(0);
  });
});

describe('handleNumpadInput', () => {
  test('should clear the amount tendered when "clear" is pressed', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('clear', '12.34', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('0');
  });

  test('should remove the last digit when "backspace" is pressed', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('backspace', '12.34', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('12.3');
  });

  test('should set to "0" when backspace is pressed on a single digit', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('backspace', '5', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('0');
  });

  test('should set exact amount for predefined buttons (10, 20, 50, 100)', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('20', '0', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('20');
  });

  test('should replace "0" with digit when digit is pressed', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('5', '0', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('5');
  });

  test('should not add a second decimal point', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('.', '12.34', setAmountTendered);
    expect(setAmountTendered).not.toHaveBeenCalled();
  });

  test('should append digit to existing amount', () => {
    const setAmountTendered = jest.fn();
    handleNumpadInput('5', '12.3', setAmountTendered);
    expect(setAmountTendered).toHaveBeenCalledWith('12.35');
  });
});
