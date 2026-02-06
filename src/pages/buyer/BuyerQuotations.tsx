import { Button } from "@/components/ui/button";
import { Download, Eye, CheckCircle, Clock } from "lucide-react";

const BuyerQuotations = () => {
  const quotations = [
    {
      id: "QT-2024-001",
      orderId: "ORD-2024-001",
      fabric: "Premium Cotton Twill",
      quantity: "500 meters",
      pricePerUnit: "₹180",
      totalAmount: "₹90,000",
      tax: "₹16,200",
      delivery: "₹2,500",
      grandTotal: "₹108,700",
      validUntil: "2024-02-15",
      status: "Approved",
    },
    {
      id: "QT-2024-002",
      orderId: "ORD-2024-002",
      fabric: "Polyester Crepe",
      quantity: "1,200 meters",
      pricePerUnit: "₹95",
      totalAmount: "₹114,000",
      tax: "₹20,520",
      delivery: "₹3,000",
      grandTotal: "₹137,520",
      validUntil: "2024-02-20",
      status: "Pending Approval",
    },
    {
      id: "QT-2024-003",
      orderId: "ORD-2024-005",
      fabric: "Linen Chambray",
      quantity: "350 meters",
      pricePerUnit: "₹220",
      totalAmount: "₹77,000",
      tax: "₹13,860",
      delivery: "₹1,500",
      grandTotal: "₹92,360",
      validUntil: "2024-02-10",
      status: "Approved",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quotations</h2>
        <p className="text-muted-foreground">Review and approve quotations for your orders</p>
      </div>

      {/* Quotation Cards */}
      <div className="space-y-4">
        {quotations.map((quote) => (
          <div key={quote.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-foreground">{quote.id}</h3>
                  <span className={`status-badge ${quote.status === "Approved" ? "status-approved" : "status-pending"}`}>
                    {quote.status === "Approved" ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Approved</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Pending</>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Order ID</span>
                    <span className="font-medium text-foreground">{quote.orderId}</span>
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
                    <span className="font-medium text-foreground">{quote.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* Right Section - Pricing */}
              <div className="lg:w-64 lg:border-l lg:pl-6 border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price/Unit</span>
                    <span className="text-foreground">{quote.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{quote.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span className="text-foreground">{quote.tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">{quote.delivery}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-primary">{quote.grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {quote.status === "Pending Approval" && (
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Quotation
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerQuotations;
