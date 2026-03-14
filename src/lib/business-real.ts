// Real Database Functions for Orders, Quotations, and Invoices

import { supabase } from '@/lib/supabase'

// ORDER FUNCTIONS
export const createOrder = async (orderData: {
  product_id: string,
  quantity: number,
  total_amount: number
}) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        total_amount: orderData.total_amount,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) {
      console.error('createOrder error:', error)
      throw new Error(`Failed to create order: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('createOrder exception:', err)
    throw err
  }
}

export const getOrders = async (userId?: string) => {
  try {
    const user = await getCurrentUser()
    const targetUserId = userId || user.id
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products: product_id(id, name, gsm, color, base_price),
        buyer: buyer_id(id, company_name, full_name, email)
      `)
      .eq('buyer_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getOrders error:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getOrders exception:', err)
    throw err
  }
}

export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products: product_id(id, name, gsm, color, base_price),
        buyer: buyer_id(id, company_name, full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAllOrders error:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getAllOrders exception:', err)
    throw err
  }
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('updateOrderStatus error:', error)
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('updateOrderStatus exception:', err)
    throw err
  }
}

// PRODUCT FUNCTIONS
export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('getProducts error:', error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getProducts exception:', err)
    throw err
  }
}

// QUOTATION FUNCTIONS
export const createQuotation = async (quotationData: {
  fabric: string,
  quantity: number,
  unit_price: number,
  notes?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        buyer_id: (await getCurrentUser()).id,
        quotation_number: `QT-${Date.now().toString().slice(-6)}`,
        fabric: quotationData.fabric,
        quantity: quotationData.quantity,
        unit_price: quotationData.unit_price,
        total_amount: quotationData.quantity * quotationData.unit_price,
        tax: quotationData.total_amount * 0.18, // 18% GST
        delivery_charge: quotationData.total_amount * 0.05, // 5% delivery
        grand_total: quotationData.total_amount * 1.23, // Total with tax + delivery
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        notes: quotationData.notes
      })
      .select()
      .single()

    if (error) {
      console.error('createQuotation error:', error)
      throw new Error(`Failed to create quotation: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('createQuotation exception:', err)
    throw err
  }
}

/** Fetches quotations for the current buyer from the same table admin uses (quotation). */
export const getQuotationsForBuyer = async () => {
  try {
    const { data, error } = await supabase
      .from('quotation')
      .select(`
        *,
        orders:order_id (
          id,
          quantity,
          total_amount,
          status,
          products:product_id (id, name, gsm, color)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getQuotationsForBuyer error:', error)
      throw new Error(`Failed to fetch quotations: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getQuotationsForBuyer exception:', err)
    throw err
  }
}

export const getQuotations = async (userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('buyer_id', userId || (await getCurrentUser()).id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getQuotations error:', error)
      throw new Error(`Failed to fetch quotations: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getQuotations exception:', err)
    throw err
  }
}

export const updateQuotationStatus = async (quotationId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', quotationId)
      .select()
      .single()

    if (error) {
      console.error('updateQuotationStatus error:', error)
      throw new Error(`Failed to update quotation status: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('updateQuotationStatus exception:', err)
    throw err
  }
}

// INVOICE FUNCTIONS
export const createInvoice = async (orderId: string, dueDate: string) => {
  try {
    // First get the order to get amount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        amount: order.total_amount,
        due_date: dueDate,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      console.error('createInvoice error:', error)
      throw new Error(`Failed to create invoice: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('createInvoice exception:', err)
    throw err
  }
}

/** Fetches invoices for the current buyer. RLS restricts to invoices where order.buyer_id = auth.uid(). */
export const getInvoices = async () => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        orders:order_id (
          id,
          quantity,
          total_amount,
          status,
          created_at,
          products:product_id (id, name, gsm, color)
        )
      `)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('getInvoices error:', error)
      throw new Error(`Failed to fetch invoices: ${error.message}`)
    }

    return data || []
  } catch (err: any) {
    console.error('getInvoices exception:', err)
    throw err
  }
}

export const updateInvoiceStatus = async (invoiceId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      console.error('updateInvoiceStatus error:', error)
      throw new Error(`Failed to update invoice status: ${error.message}`)
    }

    return data
  } catch (err: any) {
    console.error('updateInvoiceStatus exception:', err)
    throw err
  }
}

// Helper function to get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  return user
}
