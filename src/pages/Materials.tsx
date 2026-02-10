import { useState } from "react";
import { getMaterials, addMaterial, saveMaterials, getProjects, recalculateProjectSpent } from "@/lib/storage";
import { Material } from "@/types";
import { Plus, AlertTriangle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  available: "bg-success/10 text-success border-success/20",
  low: "bg-warning/10 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20",
};

const Materials = () => {
  const [materials, setMaterials] = useState(getMaterials());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "", projectId: "", cost: "" });
  const projects = getProjects();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(form.quantity) || 0;
    const m: Material = {
      id: crypto.randomUUID(),
      name: form.name,
      quantity: qty,
      unit: form.unit,
      cost: parseFloat(form.cost) || 0,
      projectId: form.projectId,
      purchased: false,
      status: qty === 0 ? "out-of-stock" : qty < 10 ? "low" : "available",
    };
    addMaterial(m);
    setMaterials(getMaterials());
    setForm({ name: "", quantity: "", unit: "", projectId: "", cost: "" });
    setOpen(false);
  };

  const purchaseMaterial = (materialId: string) => {
    const updated = materials.map(m =>
      m.id === materialId ? { ...m, purchased: true } : m
    );
    saveMaterials(updated);
    setMaterials(updated);
    const mat = updated.find(m => m.id === materialId);
    if (mat?.projectId) {
      recalculateProjectSpent(mat.projectId);
    }
    toast.success("Material marked as purchased — budget updated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Materials</h1>
          <p className="text-muted-foreground text-sm mt-1">{materials.length} items tracked</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Add Material</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Material</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2"><Label>Material Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="bags, tons, pieces" required /></div>
              </div>
              <div className="space-y-2">
                <Label>Cost (₦)</Label>
                <Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Total cost of material" />
              </div>
              <div className="space-y-2">
                <Label>Assign to Project</Label>
                <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Material</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <div className="stat-card text-center py-16">
          <p className="text-muted-foreground">No materials tracked yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto stat-card p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Material</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Quantity</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Cost</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => {
                const proj = projects.find(p => p.id === m.projectId);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-2">
                      {m.status === "low" && <AlertTriangle size={14} className="text-warning" />}
                      {m.name}
                    </td>
                    <td className="p-4">{m.quantity} {m.unit}</td>
                    <td className="p-4">₦{(m.cost || 0).toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground">{proj?.name || "—"}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={statusColors[m.status]}>{m.status}</Badge>
                    </td>
                    <td className="p-4">
                      {!m.purchased ? (
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => purchaseMaterial(m.id)}>
                          <ShoppingCart size={12} /> Purchase
                        </Button>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Purchased</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Materials;
