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
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";

const AdminBuyers = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [buyers, setBuyers] = useState([
    { id: "1", businessName: "ABC Textiles Ltd", gst: "22AAAAA0000A1Z5", contactPerson: "Rajesh Kumar", email: "rajesh@abctextiles.com", phone: "+91 98765 43210", status: "Approved", date: "2024-01-10" },
    { id: "2", businessName: "Fashion Hub Exports", gst: "27AABCU9603R1ZM", contactPerson: "Priya Sharma", email: "priya@fashionhub.com", phone: "+91 98765 43211", status: "Pending", date: "2024-01-18" },
    { id: "3", businessName: "Metro Garments Ltd", gst: "33AADCM2345Q1ZP", contactPerson: "Amit Patel", email: "amit@metrogarments.in", phone: "+91 98765 43212", status: "Pending", date: "2024-01-17" },
    { id: "4", businessName: "Uniforms Direct", gst: "07AAECN9876P1ZX", contactPerson: "Sunita Verma", email: "sunita@uniformsdirect.com", phone: "+91 98765 43213", status: "Pending", date: "2024-01-16" },
    { id: "5", businessName: "Global Fabrics Inc", gst: "09AAGCG1234H1ZY", contactPerson: "Vikram Singh", email: "vikram@globalfabrics.com", phone: "+91 98765 43214", status: "Approved", date: "2024-01-05" },
    { id: "6", businessName: "Textile World", gst: "36AABCT5678M1ZK", contactPerson: "Neha Gupta", email: "neha@textileworld.in", phone: "+91 98765 43215", status: "Rejected", date: "2024-01-12" },
  ]);

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch = buyer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.gst.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || buyer.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: "Approved" } : b));
    toast({
      title: "Buyer Approved",
      description: "The buyer account has been activated.",
    });
  };

  const handleReject = (id: string) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, status: "Rejected" } : b));
    toast({
      title: "Buyer Rejected",
      description: "The buyer registration has been rejected.",
      variant: "destructive",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "status-approved";
      case "Pending":
        return "status-pending";
      case "Rejected":
        return "status-rejected";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Buyer Management</h2>
        <p className="text-muted-foreground">Approve registrations and manage buyer accounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Total Buyers</p>
          <p className="text-2xl font-bold text-foreground">{buyers.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">{buyers.filter(b => b.status === "Pending").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Active Buyers</p>
          <p className="text-2xl font-bold text-success">{buyers.filter(b => b.status === "Approved").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name, GST, or email..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buyers Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>GST Number</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id}>
                  <td className="font-medium text-foreground">{buyer.businessName}</td>
                  <td className="font-mono text-sm">{buyer.gst}</td>
                  <td>{buyer.contactPerson}</td>
                  <td>{buyer.email}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(buyer.status)}`}>
                      {buyer.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{buyer.date}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {buyer.status === "Pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success hover:text-success"
                            onClick={() => handleApprove(buyer.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(buyer.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No buyers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBuyers;
