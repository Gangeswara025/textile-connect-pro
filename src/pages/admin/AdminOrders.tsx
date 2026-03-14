import { useState, useEffect } from "react";
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
import { getAllOrders, updateOrderStatus } from "@/lib/business-real";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { printInvoice } from "@/lib/invoicePdf";

interface Order {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    gsm?: string;
    color?: string;
  };
  buyer: {
    id: string;
    company_name: string;
    email: string;
  };
}

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id && order.id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.buyer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (order.status && order.status.toLowerCase() === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent border-r-transparent"></div>
      </div>
    );
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    awaiting_payment: orders.filter(o => o.status === "AWAITING_PAYMENT").length,
    confirmed: orders.filter(o => o.status === "CONFIRMED").length,
    paid: orders.filter(o => o.status === "PAID").length,
    processing: orders.filter(o => o.status === "PROCESSING").length,
    dispatched: orders.filter(o => o.status === "DISPATCHED").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
        <p className="text-muted-foreground">View and process all buyer orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-primary">{statusCounts.all}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{statusCounts.pending}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Awaiting Payment</p>
          <p className="text-2xl font-bold text-warning">{statusCounts.awaiting_payment}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-bold text-info">{statusCounts.confirmed}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold text-success">{statusCounts.processing}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-success">{statusCounts.paid}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Dispatched</p>
          <p className="text-2xl font-bold text-accent">{statusCounts.dispatched}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold text-success">{statusCounts.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, buyer, or product..."
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
            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
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
                <th>Buyer</th>
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
                  <td className="font-medium text-foreground">{(order.id || "").toString().slice(0, 8)}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.buyer?.company_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer?.email}</p>
                    </div>
                  </td>
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
                    <Select 
                      value={order.status}
                      onValueChange={(value) => handleUpdateStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="AWAITING_PAYMENT">Awaiting Payment</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
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
                <span className="font-medium">{(viewOrder.id || "").toString().slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer</span>
                <span className="font-medium">{viewOrder.buyer?.company_name || "—"}</span>
              </div>
              <div className="text-muted-foreground text-xs">{viewOrder.buyer?.email}</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{viewOrder.products?.name || "—"}</span>
              </div>
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
                <span className="font-medium">{viewOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(viewOrder.created_at).toLocaleDateString()}</span>
              </div>

              {/* Invoice section for paid/dispatched/delivered orders */}
              {(viewOrder.status === 'PAID' || viewOrder.status === 'DISPATCHED' || viewOrder.status === 'DELIVERED') && (
                <div className="pt-4 mt-2 border-t border-border">
                  <InvoiceSection orderId={viewOrder.id} order={viewOrder} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Small sub-component to load and display invoice info for an order */
const InvoiceSection = ({ orderId, order }: { orderId: string; order: any }) => {
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
        // No invoice found
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [orderId]);

  if (loading) return <p className="text-xs text-muted-foreground">Loading invoice...</p>;
  if (!invoice) return <p className="text-xs text-muted-foreground">No invoice generated yet.</p>;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Invoice #</span>
        <span className="font-medium">{invoice.invoice_number}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Issued</span>
        <span className="font-medium">{new Date(invoice.issued_at).toLocaleDateString()}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={() => {
          printInvoice({
            invoiceNumber: invoice.invoice_number,
            issuedAt: invoice.issued_at,
            buyerName: order.buyer?.company_name || 'Buyer',
            buyerCompany: order.buyer?.company_name || '',
            productName: order.products?.name || 'Product',
            productDetails: [order.products?.gsm && `${order.products.gsm} GSM`, order.products?.color].filter(Boolean).join(' • ') || '',
            quantity: order.quantity,
            totalAmount: invoice.total_amount,
            orderId: order.id,
          });
        }}
      >
        <FileText className="h-4 w-4 mr-2" />
        Download Invoice
      </Button>
    </div>
  );
};

export default AdminOrders;
