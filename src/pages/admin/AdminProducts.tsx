import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

interface Fabric {
  id: string;
  name: string;
  gsm: string;
  composition: string;
  colors: string[];
  useCase: string;
  category: string;
}

const AdminProducts = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);

  const [fabrics, setFabrics] = useState<Fabric[]>([
    { id: "1", name: "Premium Cotton Twill", gsm: "180-220", composition: "100% Cotton", colors: ["White", "Navy", "Black", "Khaki"], useCase: "Workwear, Uniforms", category: "Cotton" },
    { id: "2", name: "Polyester Crepe", gsm: "120-150", composition: "100% Polyester", colors: ["Black", "Royal Blue", "Burgundy"], useCase: "Formal Wear, Dresses", category: "Polyester" },
    { id: "3", name: "Cotton-Poly Blend", gsm: "160-180", composition: "65% Polyester, 35% Cotton", colors: ["White", "Light Blue", "Grey"], useCase: "Shirts, Office Wear", category: "Blended" },
    { id: "4", name: "Stretch Denim", gsm: "280-320", composition: "98% Cotton, 2% Spandex", colors: ["Indigo", "Black", "Light Wash"], useCase: "Jeans, Jackets", category: "Denim" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    gsm: "",
    composition: "",
    colors: "",
    useCase: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFabric) {
      setFabrics(prev => prev.map(f => 
        f.id === editingFabric.id 
          ? { ...f, ...formData, colors: formData.colors.split(",").map(c => c.trim()) }
          : f
      ));
      toast({ title: "Product Updated", description: "Fabric details have been updated." });
    } else {
      const newFabric: Fabric = {
        id: Date.now().toString(),
        name: formData.name,
        gsm: formData.gsm,
        composition: formData.composition,
        colors: formData.colors.split(",").map(c => c.trim()),
        useCase: formData.useCase,
        category: formData.category,
      };
      setFabrics(prev => [...prev, newFabric]);
      toast({ title: "Product Added", description: "New fabric has been added to the catalog." });
    }

    setFormData({ name: "", gsm: "", composition: "", colors: "", useCase: "", category: "" });
    setEditingFabric(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (fabric: Fabric) => {
    setEditingFabric(fabric);
    setFormData({
      name: fabric.name,
      gsm: fabric.gsm,
      composition: fabric.composition,
      colors: fabric.colors.join(", "),
      useCase: fabric.useCase,
      category: fabric.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFabrics(prev => prev.filter(f => f.id !== id));
    toast({ title: "Product Deleted", description: "Fabric has been removed from the catalog.", variant: "destructive" });
  };

  const openNewDialog = () => {
    setEditingFabric(null);
    setFormData({ name: "", gsm: "", composition: "", colors: "", useCase: "", category: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
          <p className="text-muted-foreground">Manage your fabric catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFabric ? "Edit Fabric" : "Add New Fabric"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-enterprise">Fabric Name *</label>
                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Premium Cotton Twill" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-enterprise">GSM *</label>
                  <Input name="gsm" value={formData.gsm} onChange={handleChange} required placeholder="e.g., 180-220" />
                </div>
                <div>
                  <label className="label-enterprise">Category *</label>
                  <Input name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Cotton" />
                </div>
              </div>
              <div>
                <label className="label-enterprise">Composition *</label>
                <Input name="composition" value={formData.composition} onChange={handleChange} required placeholder="e.g., 100% Cotton" />
              </div>
              <div>
                <label className="label-enterprise">Available Colors (comma-separated) *</label>
                <Input name="colors" value={formData.colors} onChange={handleChange} required placeholder="White, Navy, Black" />
              </div>
              <div>
                <label className="label-enterprise">Use Case *</label>
                <Textarea name="useCase" value={formData.useCase} onChange={handleChange} required placeholder="Workwear, Uniforms, Casual Wear" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit">{editingFabric ? "Update Fabric" : "Add Fabric"}</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{fabrics.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Cotton</p>
          <p className="text-2xl font-bold text-foreground">{fabrics.filter(f => f.category === "Cotton").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Polyester</p>
          <p className="text-2xl font-bold text-foreground">{fabrics.filter(f => f.category === "Polyester").length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-muted-foreground">Others</p>
          <p className="text-2xl font-bold text-foreground">{fabrics.filter(f => !["Cotton", "Polyester"].includes(f.category)).length}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Fabric Name</th>
                <th>Category</th>
                <th>GSM</th>
                <th>Composition</th>
                <th>Colors</th>
                <th>Use Case</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((fabric) => (
                <tr key={fabric.id}>
                  <td className="font-medium text-foreground">{fabric.name}</td>
                  <td>
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium">{fabric.category}</span>
                  </td>
                  <td>{fabric.gsm}</td>
                  <td className="max-w-[150px] truncate">{fabric.composition}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {fabric.colors.slice(0, 3).map(color => (
                        <span key={color} className="text-xs px-1.5 py-0.5 bg-muted rounded">{color}</span>
                      ))}
                      {fabric.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{fabric.colors.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[150px] truncate text-muted-foreground">{fabric.useCase}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(fabric)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(fabric.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
