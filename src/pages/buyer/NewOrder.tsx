import { useState, useEffect } from "react";
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
import { getProducts, createOrder } from "@/lib/business-real";

interface Product {
  id: string;
  name: string;
  gsm: string;
  color: string;
  base_price: number;
}

const NewOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    deliveryDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setFormData((prev) => ({
      ...prev,
      productId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please select a product and enter quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quantity = parseInt(formData.quantity);
      const totalAmount = quantity * selectedProduct.base_price;

      await createOrder({
        product_id: formData.productId,
        quantity,
        total_amount: totalAmount,
      });

      toast({
        title: "Success",
        description: "Order created successfully! You can view it in your orders.",
      });

      navigate("/buyer/orders");
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          Select fabric, quantity and submit your order request
        </p>
      </div>

      {/* Form */}
      <div className="dashboard-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-enterprise">Product *</label>
            <Select
              value={formData.productId}
              onValueChange={handleProductSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.gsm} GSM • {product.color} • ₹{product.base_price.toLocaleString()}/unit
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2">Selected Product Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">GSM</p>
                  <p className="font-medium text-foreground">{selectedProduct.gsm}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Color</p>
                  <p className="font-medium text-foreground">{selectedProduct.color}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Price</p>
                  <p className="font-medium text-foreground">₹{selectedProduct.base_price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="quantity" className="label-enterprise">
              Quantity (Meters/Units) *
            </label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="e.g., 500"
              min="1"
            />
            {selectedProduct && formData.quantity && (
              <p className="text-sm text-muted-foreground mt-2">
                Estimated Total: ₹{(parseInt(formData.quantity) * selectedProduct.base_price).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="deliveryDate" className="label-enterprise">
              Expected Delivery Date
            </label>
            <Input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="notes" className="label-enterprise">
              Additional Notes/Requirements
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
              <li>Your order is created and saved to your account</li>
              <li>You can view it in the "My Orders" page</li>
              <li>Admin will review and update the status</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Order"}
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
