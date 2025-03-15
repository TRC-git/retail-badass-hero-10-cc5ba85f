
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
    (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Wallet not found' }
    });

    // Mock successful wallet creation
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'client_wallets') {
        return {
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
        from: jest.fn().mockReturnThis()
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: true });
  });

  test('should update existing wallet if wallet exists', async () => {
    // Mock wallet found
    (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
      data: { id: 'existing-wallet-id', current_balance: 50 },
      error: null
    });

    // Mock wallet update
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'client_wallets') {
        return {
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
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-wallet-id', current_balance: 50 },
              error: null
            })
          })
        })
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: true });
  });

  test('should handle errors during wallet update', async () => {
    // Mock wallet found but update fails
    (supabase.from().select().eq().single as jest.Mock).mockResolvedValue({
      data: { id: 'existing-wallet-id', current_balance: 50 },
      error: null
    });

    // Mock wallet update failure
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'client_wallets') {
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('Update failed'))
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-wallet-id', current_balance: 50 },
              error: null
            })
          })
        })
      };
    });

    const result = await updateCustomerWallet('cust123', 100, 'txn123');
    
    expect(result).toEqual({ success: false, error: expect.any(Error) });
  });
});
