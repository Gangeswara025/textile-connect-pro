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
import { useState } from "react";

const BuyerOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const orders = [
    { id: "ORD-2024-001", fabric: "Premium Cotton Twill", quantity: "500 meters", status: "In Production", quotation: true, date: "2024-01-15" },
    { id: "ORD-2024-002", fabric: "Polyester Crepe", quantity: "1,200 meters", status: "Quoted", quotation: true, date: "2024-01-12" },
    { id: "ORD-2024-003", fabric: "Cotton-Poly Blend", quantity: "800 meters", status: "Pending", quotation: false, date: "2024-01-10" },
    { id: "ORD-2024-004", fabric: "Stretch Denim", quantity: "2,000 meters", status: "Delivered", quotation: true, date: "2024-01-05" },
    { id: "ORD-2024-005", fabric: "Linen Chambray", quantity: "350 meters", status: "Approved", quotation: true, date: "2024-01-03" },
    { id: "ORD-2024-006", fabric: "Organic Cotton Jersey", quantity: "1,500 meters", status: "In Production", quotation: true, date: "2023-12-28" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
        <p className="text-muted-foreground">View and track all your bulk order requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID or Fabric..."
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
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Quotation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
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
                    {order.quotation ? (
                      <Button variant="ghost" size="sm" className="text-info">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
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
    </div>
  );
};

export default BuyerOrders;
