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
import { Search, Filter } from "lucide-react";

interface Fabric {
  id: string;
  name: string;
  gsm: string;
  composition: string;
  colors: string[];
  useCase: string;
  category: string;
}

const fabrics: Fabric[] = [
  {
    id: "1",
    name: "Premium Cotton Twill",
    gsm: "180-220",
    composition: "100% Cotton",
    colors: ["White", "Navy", "Black", "Khaki"],
    useCase: "Workwear, Uniforms, Casual Wear",
    category: "Cotton",
  },
  {
    id: "2",
    name: "Polyester Crepe",
    gsm: "120-150",
    composition: "100% Polyester",
    colors: ["Black", "Royal Blue", "Burgundy"],
    useCase: "Formal Wear, Dresses",
    category: "Polyester",
  },
  {
    id: "3",
    name: "Cotton-Poly Blend",
    gsm: "160-180",
    composition: "65% Polyester, 35% Cotton",
    colors: ["White", "Light Blue", "Grey"],
    useCase: "Shirts, Office Wear",
    category: "Blended",
  },
  {
    id: "4",
    name: "Stretch Denim",
    gsm: "280-320",
    composition: "98% Cotton, 2% Spandex",
    colors: ["Indigo", "Black", "Light Wash"],
    useCase: "Jeans, Jackets, Casual Wear",
    category: "Denim",
  },
  {
    id: "5",
    name: "Pure Silk Charmeuse",
    gsm: "80-100",
    composition: "100% Mulberry Silk",
    colors: ["Ivory", "Champagne", "Black"],
    useCase: "Evening Wear, Luxury Apparel",
    category: "Silk",
  },
  {
    id: "6",
    name: "Linen Chambray",
    gsm: "140-160",
    composition: "100% Linen",
    colors: ["Natural", "Blue", "White"],
    useCase: "Summer Wear, Resort Wear",
    category: "Linen",
  },
  {
    id: "7",
    name: "Technical Ripstop",
    gsm: "100-120",
    composition: "100% Nylon",
    colors: ["Black", "Olive", "Navy"],
    useCase: "Outdoor Gear, Bags, Activewear",
    category: "Technical",
  },
  {
    id: "8",
    name: "Organic Cotton Jersey",
    gsm: "160-180",
    composition: "100% Organic Cotton",
    colors: ["White", "Black", "Heather Grey"],
    useCase: "T-shirts, Loungewear",
    category: "Cotton",
  },
  {
    id: "9",
    name: "Satin Duchess",
    gsm: "180-200",
    composition: "100% Polyester Satin",
    colors: ["Ivory", "Gold", "Silver"],
    useCase: "Bridal Wear, Formal Wear",
    category: "Polyester",
  },
];

const categories = ["All", "Cotton", "Polyester", "Blended", "Denim", "Silk", "Linen", "Technical"];

const Fabrics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || fabric.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 lg:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-heading">Our Fabric Collection</h1>
          <p className="section-subheading mx-auto">
            Browse our extensive range of quality fabrics. Request bulk quotes for any product.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fabrics by name, composition, or use case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredFabrics.length} of {fabrics.length} fabrics
        </p>

        {/* Fabric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFabrics.map((fabric, index) => (
            <div
              key={fabric.id}
              className="card-enterprise overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Fabric Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {fabric.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{fabric.category}</span>
                </div>
              </div>

              {/* Fabric Details */}
              <div className="p-5">
                <h3 className="font-semibold text-foreground mb-3">{fabric.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GSM</span>
                    <span className="font-medium text-foreground">{fabric.gsm}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Composition</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{fabric.composition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Use Case</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{fabric.useCase}</span>
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground block mb-2">Available Colors</span>
                  <div className="flex flex-wrap gap-1">
                    {fabric.colors.map((color) => (
                      <span
                        key={color}
                        className="text-xs px-2 py-1 bg-muted rounded-md text-foreground"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Request Bulk Quote
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredFabrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No fabrics found matching your criteria.</p>
          </div>
        )}

        {/* Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Note:</strong> Prices are not displayed publicly. 
            Register as a buyer to request detailed quotations with pricing, tax, and delivery information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
