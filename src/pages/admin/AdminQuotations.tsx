import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Send, Download } from "lucide-react";

const AdminQuotations = () => {
  const { toast } = useToast();
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [quoteForm, setQuoteForm] = useState({
    pricePerUnit: "",
    taxRate: "18",
    deliveryCharges: "",
    validityDate: "",
  });

  const quotations = [
    { id: "QT-2024-001", orderId: "ORD-2024-010", buyer: "Metro Garments Ltd", fabric: "Stretch Denim", quantity: "2,000 meters", amount: "₹285,000", status: "Approved", date: "2024-01-16" },
    { id: "QT-2024-002", orderId: "ORD-2024-011", buyer: "Fashion Hub Exports", fabric: "Polyester Crepe", quantity: "1,200 meters", amount: "₹137,520", status: "Pending", date: "2024-01-17" },
    { id: "QT-2024-003", orderId: "ORD-2024-009", buyer: "Uniforms Direct", fabric: "Cotton-Poly Blend", quantity: "800 meters", amount: "₹92,360", status: "Approved", date: "2024-01-15" },
  ];

  const pendingOrders = [
    { id: "ORD-2024-012", buyer: "ABC Textiles Ltd", fabric: "Premium Cotton Twill", gsm: "180-220", color: "Navy Blue", quantity: "500", unit: "meters" },
  ];

  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateQuote = (order: any) => {
    setSelectedOrder(order);
    setQuoteForm({ pricePerUnit: "", taxRate: "18", deliveryCharges: "", validityDate: "" });
    setIsQuoteDialogOpen(true);
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Quotation Sent",
      description: `Quotation for ${selectedOrder?.id} has been sent to the buyer.`,
    });
    setIsQuoteDialogOpen(false);
  };

  const calculateTotal = () => {
    const quantity = parseInt(selectedOrder?.quantity || "0");
    const price = parseFloat(quoteForm.pricePerUnit || "0");
    const taxRate = parseFloat(quoteForm.taxRate || "0");
    const delivery = parseFloat(quoteForm.deliveryCharges || "0");
    
    const subtotal = quantity * price;
    const tax = subtotal * (taxRate / 100);
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      delivery: delivery.toFixed(2),
      total: (subtotal + tax + delivery).toFixed(2),
    };
  };

  const getStatusClass = (status: string) => {
    return status === "Approved" ? "status-approved" : "status-pending";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quotation Management</h2>
        <p className="text-muted-foreground">Generate and manage quotations for bulk orders</p>
      </div>

      {/* Pending Orders for Quote */}
      {pendingOrders.length > 0 && (
        <div className="dashboard-card border-warning/30">
          <h3 className="text-lg font-semibold text-foreground mb-4">Orders Awaiting Quotation</h3>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{order.id}</span>
                    <span className="status-badge status-pending">Needs Quote</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.buyer} • {order.fabric} ({order.gsm} GSM, {order.color}) • {order.quantity} {order.unit}
                  </p>
                </div>
                <Button onClick={() => handleCreateQuote(order)}>
                  Create Quotation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotation Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Quotation</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer</span>
                  <span className="font-medium">{selectedOrder.buyer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fabric</span>
                  <span className="font-medium">{selectedOrder.fabric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</span>
                </div>
              </div>

              {/* Pricing Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-enterprise">Price per {selectedOrder.unit?.slice(0, -1)} (₹) *</label>
                  <Input
                    name="pricePerUnit"
                    type="number"
                    value={quoteForm.pricePerUnit}
                    onChange={handleQuoteChange}
                    required
                    placeholder="e.g., 180"
                  />
                </div>
                <div>
                  <label className="label-enterprise">Tax Rate (%) *</label>
                  <Input
                    name="taxRate"
                    type="number"
                    value={quoteForm.taxRate}
                    onChange={handleQuoteChange}
                    required
                    placeholder="18"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-enterprise">Delivery Charges (₹) *</label>
                  <Input
                    name="deliveryCharges"
                    type="number"
                    value={quoteForm.deliveryCharges}
                    onChange={handleQuoteChange}
                    required
                    placeholder="e.g., 2500"
                  />
                </div>
                <div>
                  <label className="label-enterprise">Valid Until *</label>
                  <Input
                    name="validityDate"
                    type="date"
                    value={quoteForm.validityDate}
                    onChange={handleQuoteChange}
                    required
                  />
                </div>
              </div>

              {/* Calculated Total */}
              {quoteForm.pricePerUnit && (
                <div className="bg-primary/5 rounded-lg p-4 space-y-2 text-sm border border-primary/20">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{calculateTotal().subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({quoteForm.taxRate}%)</span>
                    <span>₹{calculateTotal().tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₹{calculateTotal().delivery}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/20 font-semibold">
                    <span>Grand Total</span>
                    <span className="text-primary">₹{calculateTotal().total}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Quotation
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Quotations */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">All Quotations</h3>
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote.id}>
                  <td className="font-medium text-foreground">{quote.id}</td>
                  <td>{quote.orderId}</td>
                  <td>{quote.buyer}</td>
                  <td>{quote.fabric}</td>
                  <td>{quote.quantity}</td>
                  <td className="font-medium text-foreground">{quote.amount}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminQuotations;
