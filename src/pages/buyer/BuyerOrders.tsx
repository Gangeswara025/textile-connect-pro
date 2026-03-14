import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { getOrders } from "@/lib/business-real";
import { PaymentButton } from "@/components/PaymentButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { printInvoice } from "@/lib/invoicePdf";

interface OrderWithProduct {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  products: {
    name: string;
    gsm?: string;
    color?: string;
  };
}

const BuyerOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<OrderWithProduct | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "status-delivered";
      case "DISPATCHED":
        return "status-shipped";
      case "PROCESSING":
      case "CONFIRMED":
        return "status-in-production";
      case "PENDING":
        return "status-pending";
      case "AWAITING_PAYMENT":
        return "status-pending";
      case "PAID":
        return "status-confirmed";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
        <p className="text-muted-foreground">Track and manage your fabric orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-foreground">{order.id.slice(0, 8)}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.products?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.products?.gsm && `${order.products.gsm} GSM • `}
                        {order.products?.color || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{order.quantity}</td>
                  <td className="font-mono text-sm">₹{order.total_amount?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => setViewOrder(order)} title="View details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{(viewOrder.id || "").slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{viewOrder.products?.name || "—"}</span>
              </div>
              {viewOrder.products?.gsm != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GSM</span>
                  <span className="font-medium">{viewOrder.products.gsm}</span>
                </div>
              )}
              {viewOrder.products?.color != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium">{viewOrder.products.color}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewOrder.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total amount</span>
                <span className="font-medium">₹{viewOrder.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`status-badge ${getStatusClass(viewOrder.status)}`}>{viewOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(viewOrder.created_at).toLocaleDateString()}</span>
              </div>
              
              {viewOrder.status === 'AWAITING_PAYMENT' && (
                <div className="pt-4 mt-4 border-t border-border flex justify-end">
                  <PaymentButton 
                    order={viewOrder as any} 
                    onPaymentSuccess={() => {
                      setViewOrder(null);
                      fetchOrders();
                      toast({ title: "Payment Successful", description: "Your payment has been received and your order is now confirmed." });
                    }}
                    onPaymentError={(err) => {
                      toast({ title: "Payment Failed", description: err.message || "An error occurred during payment.", variant: "destructive" });
                    }}
                  />
                </div>
              )}

              {(viewOrder.status === 'PAID' || viewOrder.status === 'DISPATCHED' || viewOrder.status === 'DELIVERED') && (
                <BuyerInvoiceSection orderId={viewOrder.id} order={viewOrder} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerOrders;

/** Sub-component to load and display invoice for a buyer's order */
const BuyerInvoiceSection = ({ orderId, order }: { orderId: string; order: any }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('order_id', orderId)
          .single();
        setInvoice(data);
      } catch (e) {
        // No invoice
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [orderId]);

  if (loading) return <p className="text-xs text-muted-foreground pt-4">Loading invoice...</p>;
  if (!invoice) return null;

  return (
    <div className="pt-4 mt-4 border-t border-border space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Invoice #</span>
        <span className="font-medium">{invoice.invoice_number}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          printInvoice({
            invoiceNumber: invoice.invoice_number,
            issuedAt: invoice.issued_at,
            buyerName: 'Buyer',
            buyerCompany: '',
            productName: order.products?.name || 'Product',
            productDetails: [order.products?.gsm && `${order.products.gsm} GSM`, order.products?.color].filter(Boolean).join(' • ') || '',
            quantity: order.quantity,
            totalAmount: invoice.total_amount,
            orderId: order.id,
          });
        }}
      >
        <FileText className="h-4 w-4 mr-2" />
        View Invoice
      </Button>
    </div>
  );
};
