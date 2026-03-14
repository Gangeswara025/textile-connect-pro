import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight request FIRST before anything else (even try/catch)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, amount, currency = 'INR' } = await req.json()

    if (!order_id || !amount) {
      return new Response(JSON.stringify({ success: false, error: 'order_id and amount are required' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Call Razorpay API to create an order
    const rzpKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const rzpKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    // Get Auth User from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader || '' } } }
    )
    
    // Validate user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (!user) {
       console.error("Auth error:", authError);
       return new Response(JSON.stringify({ success: false, error: 'Unauthorized user', details: authError }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Amount should be in smaller units (paise for INR). Ensure it's passed correctly from frontend (e.g. * 100).
    const rzpPayload = {
      amount: Math.round(amount * 100), 
      currency: currency,
      receipt: `rcpt_${order_id.replace(/-/g, '').substring(0, 10)}`, // Short receipt ID
    }

    const base64Auth = btoa(`${rzpKeyId}:${rzpKeySecret}`)

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Auth}`
      },
      body: JSON.stringify(rzpPayload)
    })

    const rzpData = await razorpayResponse.json()

    if (!razorpayResponse.ok) {
       return new Response(JSON.stringify({ success: false, error: rzpData.error?.description || 'Failed to create Razorpay order', details: rzpData }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
    }

    return new Response(JSON.stringify({ success: true, id: rzpData.id, amount: rzpData.amount, currency: rzpData.currency }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message, stack: error.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
