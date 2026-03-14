import { Link } from "react-router-dom";
import { Package, FileText, CheckCircle, Receipt, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getOrders } from "@/lib/business-real";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentButton } from "@/components/PaymentButton";
import { useToast } from "@/hooks/use-toast";

interface OrderWithDetails {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  products: {
    name: string;
  };
}

const BuyerDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<OrderWithDetails[]>([]);
  const [viewOrder, setViewOrder] = useState<OrderWithDetails | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setRecentOrders(data.slice(0, 3)); // Get last 3 orders

        
        // Calculate stats
        setStats({
          totalOrders: data.length,
          pendingOrders: data.filter((o: any) => o.status === 'PENDING').length,
          completedOrders: data.filter((o: any) => o.status === 'DELIVERED').length,
          invoices: 0, // TODO: fetch from invoices table
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statsArray = [
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Completed Orders", value: stats.completedOrders.toString(), icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Invoices Available", value: stats.invoices.toString(), icon: Receipt, color: "bg-info/10 text-info" },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
      case "DISPATCHED":
      case "DELIVERED":
        return "status-approved";
      case "CONFIRMED":
        return "status-confirmed";
      case "PENDING":
      case "AWAITING_PAYMENT":
        return "status-pending";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.company_name || 'Buyer'}</h2>
          <p className="text-muted-foreground">Here's an overview of your orders and quotations</p>
        </div>
        <Button asChild>
          <Link to="/buyer/new-order">
            New Order Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsArray.map((stat) => (
          <div key={stat.label} className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/buyer/orders">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent border-r-transparent"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No orders yet. Create your first order to get started!</p>
            <Button asChild>
              <Link to="/buyer/new-order">Create Order</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-foreground">{order.products?.name || 'Unknown'}</td>
                    <td>{order.quantity}</td>
                    <td className="font-mono text-sm">₹{order.total_amount?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => setViewOrder(order)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail dialog */}
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
                <div className="pt-2 flex justify-end">
                  <PaymentButton 
                    order={viewOrder as any} 
                    onPaymentSuccess={() => {
                      setViewOrder(null);
                      fetchOrders();
                      toast({ title: "Payment Successful", description: "Your payment has been received!" });
                    }}
                    onPaymentError={(err) => {
                      toast({ title: "Payment Failed", description: err.message || "An error occurred.", variant: "destructive" });
                    }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/buyer/orders" onClick={() => setViewOrder(null)}>Open All Orders</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Pending Quotations</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Review and approve quotations for your orders.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/buyer/quotations">Review Quotations</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Download Invoices</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Access and download invoices for your completed orders.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/buyer/invoices">View Invoices</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
