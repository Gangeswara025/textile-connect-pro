import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

const NewOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fabricType: "",
    gsm: "",
    color: "",
    quantity: "",
    unit: "meters",
    deliveryDate: "",
    notes: "",
  });

  const fabricTypes = [
    "Premium Cotton Twill",
    "Polyester Crepe",
    "Cotton-Poly Blend",
    "Stretch Denim",
    "Pure Silk Charmeuse",
    "Linen Chambray",
    "Technical Ripstop",
    "Organic Cotton Jersey",
    "Satin Duchess",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Order Request Submitted",
      description: "You will receive a quotation within 24-48 business hours.",
    });

    navigate("/buyer/orders");
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/buyer"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-foreground">New Bulk Order Request</h2>
        <p className="text-muted-foreground">
          Submit your requirements and receive a detailed quotation
        </p>
      </div>

      {/* Form */}
      <div className="dashboard-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-enterprise">Fabric Type *</label>
            <Select
              value={formData.fabricType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, fabricType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fabric type" />
              </SelectTrigger>
              <SelectContent>
                {fabricTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gsm" className="label-enterprise">
                GSM (Weight) *
              </label>
              <Input
                id="gsm"
                name="gsm"
                value={formData.gsm}
                onChange={handleChange}
                required
                placeholder="e.g., 180-200"
              />
            </div>
            <div>
              <label htmlFor="color" className="label-enterprise">
                Color *
              </label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="e.g., Navy Blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="label-enterprise">
                Quantity *
              </label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 500"
                  className="flex-1"
                />
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="yards">Yards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="deliveryDate" className="label-enterprise">
                Expected Delivery Date *
              </label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="label-enterprise">
              Additional Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any specific requirements, finishing preferences, packaging instructions, etc."
            />
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Our team reviews your requirements</li>
              <li>We prepare a detailed quotation with pricing</li>
              <li>You receive the quotation within 24-48 hours</li>
              <li>Approve the quotation to confirm your order</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/buyer")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
