import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Utility function to verify HMAC-SHA256 signatures using standard Web Crypto API
async function verifySignature(body: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signatureBuffer = new Uint8Array(signature.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)));
  
  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    enc.encode(body)
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rzp_payment_id, rzp_order_id, rzp_signature, db_order_id, amount } = await req.json()

    if (!rzp_payment_id || !rzp_order_id || !rzp_signature || !db_order_id) {
       throw new Error("Missing required payment verification parameters")
    }

    const rzpKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || ''

    // 1. Verify Signature
    // Format: HMAC SHA256 of "rzp_order_id|rzp_payment_id" using secret key
    const payload = `${rzp_order_id}|${rzp_payment_id}`;
    const isValidSignature = await verifySignature(payload, rzp_signature, rzpKeySecret);

    if (!isValidSignature) {
       throw new Error("Invalid payment signature")
    }

    // 2. Signature is valid, update Supabase database!
    // We use the SERVICE_ROLE key here because RLS might prevent the user from inserting gracefully 
    // depending on policies, or we want high-privilege access to finalize the payment record.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if payment already exists
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('transaction_reference', rzp_payment_id)
      .single()

    if (existingPayment) {
        return new Response(JSON.stringify({ success: true, message: 'Payment already logged' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
    }

    // Insert payment record
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: db_order_id,
        amount: amount,
        currency: 'INR',
        payment_status: 'SUCCESS',
        payment_gateway: 'razorpay',
        transaction_reference: rzp_payment_id,
        paid_at: new Date().toISOString()
      })

    if (insertError) throw insertError

    // Update the orders table status to 'PAID'
    await supabaseAdmin
      .from('orders')
      .update({ status: 'PAID' })
      .eq('id', db_order_id)

    // 3. Auto-generate Invoice
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('order_id', db_order_id)
      .single()

    if (!existingInvoice) {
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert({
          order_id: db_order_id,
          invoice_number: invoiceNumber,
          total_amount: amount,
        })

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError)
        // Don't throw — payment is already recorded, invoice is best-effort
      }
    }

    // 4. Auto-dispatch: Update order status to DISPATCHED
    await supabaseAdmin
      .from('orders')
      .update({ status: 'DISPATCHED' })
      .eq('id', db_order_id)

    return new Response(JSON.stringify({ success: true, message: 'Payment verified, invoice generated, order dispatched.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
