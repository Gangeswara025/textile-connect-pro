import { Link } from "react-router-dom";
import { Package, FileText, CheckCircle, Receipt, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const BuyerDashboard = () => {
  const stats = [
    { label: "Total Orders", value: "12", icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Pending Quotations", value: "3", icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Approved Orders", value: "7", icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Invoices Available", value: "5", icon: Receipt, color: "bg-info/10 text-info" },
  ];

  const recentOrders = [
    { id: "ORD-2024-001", fabric: "Premium Cotton Twill", quantity: "500 meters", status: "In Production", date: "2024-01-15" },
    { id: "ORD-2024-002", fabric: "Polyester Crepe", quantity: "1,200 meters", status: "Quoted", date: "2024-01-12" },
    { id: "ORD-2024-003", fabric: "Cotton-Poly Blend", quantity: "800 meters", status: "Pending", date: "2024-01-10" },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Production":
        return "status-approved";
      case "Quoted":
        return "status-quoted";
      case "Pending":
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
          <h2 className="text-2xl font-bold text-foreground">Welcome back, ABC Textiles</h2>
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
        {stats.map((stat) => (
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
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-foreground">{order.id}</td>
                  <td>{order.fabric}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{order.date}</td>
                  <td>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                You have 3 quotations waiting for your review and approval.
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
