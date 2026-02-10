import { useState } from "react";
import { getProjects, addProject } from "@/lib/storage";
import { Project } from "@/types";
import { Link } from "react-router-dom";
import { Plus, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  "on-hold": "bg-warning/10 text-warning border-warning/20",
};

const Projects = () => {
  const [projects, setProjects] = useState(getProjects());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", deadline: "", budget: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const deadlineDate = new Date(form.deadline);
    let status: Project["status"] = "active";
    if (deadlineDate < now) status = "delayed";

    const p: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      location: form.location,
      deadline: form.deadline,
      budget: parseFloat(form.budget) || 0,
      spent: 0,
      progress: 0,
      status,
      createdAt: now.toISOString(),
      workers: [],
      materials: [],
      updates: [],
      tasks: [],
    };
    addProject(p);
    setProjects(getProjects());
    setForm({ name: "", location: "", deadline: "", budget: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} total projects</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Budget (₦)</Label>
                  <Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} required />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Progress starts at 0% and updates automatically as tasks are completed.</p>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="stat-card text-center py-16">
          <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="stat-card block group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                <Badge variant="outline" className={statusColors[p.status]}>{p.status}</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><MapPin size={14} /> {p.location}</div>
                <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(p.deadline).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5"><TrendingUp size={14} /> ₦{p.budget.toLocaleString()}</div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{p.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
