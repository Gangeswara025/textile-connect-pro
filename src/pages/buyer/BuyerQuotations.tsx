import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getQuotationsForBuyer } from "@/lib/business-real";

/** Row from quotation table (admin-created) with joined order & product */
interface QuotationRow {
  id: string;
  order_id: string;
  quoted_price: number;
  valid_until: string;
  status: string;
  created_at: string;
  orders?: {
    id: string;
    quantity: number;
    total_amount: number;
    status: string;
    products?: { id: string; name: string; gsm?: string; color?: string } | null;
  } | null;
}

/** Normalized for UI */
interface QuotationDisplay {
  id: string;
  quotation_number: string;
  order_id: string;
  fabric: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  tax: number;
  delivery_charge: number;
  grand_total: number;
  valid_until: string;
  status: string;
  created_at: string;
}

function mapRowToDisplay(row: QuotationRow): QuotationDisplay {
  const order = row.orders;
  const product = order?.products;
  const quantity = order?.quantity ?? 0;
  const unitPrice = quantity > 0 ? row.quoted_price / quantity : 0;
  return {
    id: row.id,
    quotation_number: `QT-${row.id.slice(0, 8).toUpperCase()}`,
    order_id: row.order_id,
    fabric: product?.name ?? "—",
    quantity,
    unit_price: unitPrice,
    total_amount: row.quoted_price,
    tax: 0,
    delivery_charge: 0,
    grand_total: row.quoted_price,
    valid_until: row.valid_until,
    status: row.status,
    created_at: row.created_at,
  };
}

function openQuotationPrintWindow(quote: QuotationDisplay) {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html><head><title>Quotation ${quote.quotation_number}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #333; }
      h1 { font-size: 1.25rem; margin-bottom: 8px; }
      .row { display: flex; justify-content: space-between; margin: 6px 0; }
      .muted { color: #666; }
      .total { font-weight: 600; margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; }
    </style></head><body>
    <h1>Quotation ${quote.quotation_number}</h1>
    <p class="muted">Order ID: ${(quote.order_id || "").slice(0, 8).toUpperCase()}</p>
    <div class="row"><span class="muted">Fabric</span><span>${quote.fabric}</span></div>
    <div class="row"><span class="muted">Quantity</span><span>${quote.quantity}</span></div>
    <div class="row"><span class="muted">Valid until</span><span>${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "N/A"}</span></div>
    <div class="row"><span class="muted">Status</span><span>${quote.status}</span></div>
    <hr/>
    <div class="row"><span class="muted">Price/Unit</span><span>₹${quote.unit_price?.toLocaleString()}</span></div>
    <div class="row"><span class="muted">Subtotal</span><span>₹${quote.total_amount?.toLocaleString()}</span></div>
    <div class="row"><span class="muted">Tax (18% GST)</span><span>₹${quote.tax?.toLocaleString()}</span></div>
    <div class="row"><span class="muted">Delivery</span><span>₹${quote.delivery_charge?.toLocaleString()}</span></div>
    <div class="row total"><span>Grand Total</span><span>₹${quote.grand_total?.toLocaleString()}</span></div>
    <p style="margin-top:24px;font-size:12px;color:#888;">Generated from Textile Connect. Use browser Print → Save as PDF to download.</p>
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

const BuyerQuotations = () => {
  const [quotations, setQuotations] = useState<QuotationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuote, setViewQuote] = useState<QuotationDisplay | null>(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const data = await getQuotationsForBuyer();
        setQuotations((data as QuotationRow[]).map(mapRowToDisplay));
      } catch (error: any) {
        console.error('Failed to fetch quotations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  if (loading) {
    return <div>Loading quotations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quotations</h2>
        <p className="text-muted-foreground">Review and approve quotations for your orders</p>
      </div>

      {/* Quotation Cards */}
      <div className="space-y-4">
        {quotations.length === 0 && (
          <div className="dashboard-card p-8 text-center text-muted-foreground">
            <p>No quotations yet. When the admin sends a quote for your order, it will appear here.</p>
          </div>
        )}
        {quotations.map((quote) => (
          <div key={quote.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-foreground">{quote.quotation_number}</h3>
                  <span className={`status-badge ${
                    quote.status === 'ACCEPTED' ? "status-approved" :
                    quote.status === 'ACTIVE' ? "status-pending" :
                    quote.status === 'EXPIRED' ? "status-default" :
                    "status-default"
                  }`}>
                    {quote.status === 'ACCEPTED' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Accepted</>
                    ) : quote.status === 'EXPIRED' ? (
                      <>Expired</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Active</>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Order ID</span>
                    <span className="font-medium text-foreground">{(quote.order_id || '').slice(0, 8).toUpperCase() || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fabric</span>
                    <span className="font-medium text-foreground">{quote.fabric}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Quantity</span>
                    <span className="font-medium text-foreground">{quote.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Valid Until</span>
                    <span className="font-medium text-foreground">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Pricing */}
              <div className="lg:w-64 lg:border-l lg:pl-6 border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price/Unit</span>
                    <span className="text-foreground">₹{quote.unit_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{quote.total_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span className="text-foreground">₹{quote.tax?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">₹{quote.delivery_charge?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-primary">₹{quote.grand_total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setViewQuote(quote)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => openQuotationPrintWindow(quote)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewQuote} onOpenChange={(open) => !open && setViewQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quotation details</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quotation</span>
                <span className="font-medium">{viewQuote.quotation_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{(viewQuote.order_id || "").slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric</span>
                <span className="font-medium">{viewQuote.fabric}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewQuote.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid until</span>
                <span className="font-medium">{viewQuote.valid_until ? new Date(viewQuote.valid_until).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{viewQuote.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Grand total</span>
                <span className="font-semibold text-primary">₹{viewQuote.grand_total?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerQuotations;
