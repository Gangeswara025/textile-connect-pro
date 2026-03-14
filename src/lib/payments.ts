import { supabase } from './supabase';

export interface RazorpayOrderData {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Calls the Supabase Edge Function to create a Razorpay order.
 * This securely uses the Razorpay Key & Secret on the backend.
 */
export const createRazorpayOrder = async (orderId: string, amount: number): Promise<RazorpayOrderData> => {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { order_id: orderId, amount: amount }
  });

  if (error) {
    console.error('Edge function HTTP error:', error);
    throw new Error(error.message || 'Failed to communicate with payment server');
  }
  
  if (data && data.success === false) {
    console.error('Edge function Payload error:', data);
    throw new Error(data.error || 'Server rejected the payment request');
  }

  return data;
};

export interface VerificationData {
  rzp_payment_id: string;
  rzp_order_id: string;
  rzp_signature: string;
  db_order_id: string;
  amount: number;
}

/**
 * Calls the Supabase Edge Function to verify the payment signature.
 * Updates the database safely from the backend if valid.
 */
export const verifyRazorpayPayment = async (verificationData: VerificationData): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: verificationData
  });

  if (error) {
    console.error('Payment verification error:', error);
    throw new Error(error.message || 'Failed to verify payment');
  }

  return data;
};
