import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const orders = [
    { id: "ORD-2024-012", buyer: "ABC Textiles Ltd", fabric: "Premium Cotton Twill", gsm: "180-220", color: "Navy Blue", quantity: "500 meters", status: "Pending", date: "2024-01-18" },
    { id: "ORD-2024-011", buyer: "Fashion Hub Exports", fabric: "Polyester Crepe", gsm: "120-150", color: "Black", quantity: "1,200 meters", status: "Quoted", date: "2024-01-17" },
    { id: "ORD-2024-010", buyer: "Metro Garments Ltd", fabric: "Stretch Denim", gsm: "280-320", color: "Indigo", quantity: "2,000 meters", status: "In Production", date: "2024-01-16" },
    { id: "ORD-2024-009", buyer: "Uniforms Direct", fabric: "Cotton-Poly Blend", gsm: "160-180", color: "White", quantity: "800 meters", status: "Approved", date: "2024-01-15" },
    { id: "ORD-2024-008", buyer: "Global Fabrics Inc", fabric: "Linen Chambray", gsm: "140-160", color: "Natural", quantity: "350 meters", status: "Delivered", date: "2024-01-10" },
    { id: "ORD-2024-007", buyer: "Textile World", fabric: "Technical Ripstop", gsm: "100-120", color: "Olive", quantity: "1,500 meters", status: "In Production", date: "2024-01-08" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fabric.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase().replace(" ", "-") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Production":
      case "Approved":
        return "status-approved";
      case "Quoted":
        return "status-quoted";
      case "Pending":
        return "status-pending";
      case "Delivered":
        return "bg-accent/15 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
        <p className="text-muted-foreground">View and process bulk order requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Pending Quote</p>
          <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "Pending").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Quoted</p>
          <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === "Quoted").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">In Production</p>
          <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === "In Production").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold text-accent">{orders.filter(o => o.status === "Delivered").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, buyer, or fabric..."
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
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in-production">In Production</SelectItem>
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
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-foreground">{order.id}</td>
                  <td>{order.buyer}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.fabric}</p>
                      <p className="text-xs text-muted-foreground">{order.gsm} GSM • {order.color}</p>
                    </div>
                  </td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{order.date}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "Pending" && (
                        <Button size="sm" asChild>
                          <Link to={`/admin/quotations/create?order=${order.id}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Quote
                          </Link>
                        </Button>
                      )}
                    </div>
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
    </div>
  );
};

export default AdminOrders;
