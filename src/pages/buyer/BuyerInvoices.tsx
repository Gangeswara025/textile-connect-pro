import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

const BuyerInvoices = () => {
  const invoices = [
    {
      id: "INV-2024-001",
      orderId: "ORD-2024-004",
      fabric: "Stretch Denim",
      amount: "₹285,000",
      date: "2024-01-08",
      status: "Paid",
    },
    {
      id: "INV-2024-002",
      orderId: "ORD-2024-001",
      fabric: "Premium Cotton Twill",
      amount: "₹108,700",
      date: "2024-01-18",
      status: "Pending",
    },
    {
      id: "INV-2023-045",
      orderId: "ORD-2023-089",
      fabric: "Technical Ripstop",
      amount: "₹156,800",
      date: "2023-12-20",
      status: "Paid",
    },
    {
      id: "INV-2023-044",
      orderId: "ORD-2023-085",
      fabric: "Organic Cotton Jersey",
      amount: "₹195,500",
      date: "2023-12-15",
      status: "Paid",
    },
  ];

  const getStatusClass = (status: string) => {
    return status === "Paid" ? "status-approved" : "status-pending";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
        <p className="text-muted-foreground">View and download invoices for completed orders</p>
      </div>

      {/* Invoice Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order ID</th>
                <th>Fabric</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-medium text-foreground">{invoice.id}</td>
                  <td>{invoice.orderId}</td>
                  <td>{invoice.fabric}</td>
                  <td className="font-medium text-foreground">{invoice.amount}</td>
                  <td className="text-muted-foreground">{invoice.date}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
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

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground mb-1">Paid Invoices</p>
          <p className="text-2xl font-bold text-success">{invoices.filter(i => i.status === "Paid").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground mb-1">Pending Invoices</p>
          <p className="text-2xl font-bold text-warning">{invoices.filter(i => i.status === "Pending").length}</p>
        </div>
      </div>
    </div>
  );
};

export default BuyerInvoices;
