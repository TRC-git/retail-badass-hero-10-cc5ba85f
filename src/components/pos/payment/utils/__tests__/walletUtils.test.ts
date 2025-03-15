
import { updateCustomerWallet } from '../walletUtils';
import { supabase } from '@/integrations/supabase/client';
import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }
}));

describe('updateCustomerWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return false if customerId or amount is not provided', async () => {
    const result = await updateCustomerWallet('', 100, 'txn123');
    expect(result).toEqual({ success: false });
  });

  test('should create new wallet if wallet does not exist', async () => {
    // Mock wallet not found
    const mockSingleWalletNotFound = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Wallet not found' }
    });
    
    (supabase.from as jest.MockedFunction<typeof supabase.from>).mockImplementation((table: string) => {
      if (table === 'client_wallets') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: mockSingleWalletNotFound,
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'new-wallet-id', current_balance: 100 },
                error: null
              })
            })
          })
        };
      }
      if (table === 'wallet_transactions') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingleWalletNotFound
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: true });
  });

  test('should update existing wallet if wallet exists', async () => {
    // Mock wallet found
    const mockSingleWalletFound = jest.fn().mockResolvedValue({
      data: { id: 'existing-wallet-id', current_balance: 50 },
      error: null
    });

    (supabase.from as jest.MockedFunction<typeof supabase.from>).mockImplementation((table: string) => {
      if (table === 'client_wallets') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: mockSingleWalletFound,
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        };
      }
      if (table === 'wallet_transactions') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingleWalletFound
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: true });
  });

  test('should handle errors during wallet update', async () => {
    // Mock wallet found but update fails
    const mockSingleWalletFound = jest.fn().mockResolvedValue({
      data: { id: 'existing-wallet-id', current_balance: 50 },
      error: null
    });

    (supabase.from as jest.MockedFunction<typeof supabase.from>).mockImplementation((table: string) => {
      if (table === 'client_wallets') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: mockSingleWalletFound,
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('Update failed'))
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingleWalletFound
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: false, error: expect.any(Error) });
  });
});
