import { useState } from "react";
import { getWorkers, addWorker, saveWorkers, getProjects, getWorkerComments } from "@/lib/storage";
import { Worker } from "@/types";
import { Plus, Phone, Briefcase, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Workers = () => {
  const [workers, setWorkers] = useState(getWorkers());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", phone: "" });
  const projects = getProjects();
  const activeProjects = projects.filter(p => p.status !== "completed");
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [commentView, setCommentView] = useState<string | null>(null);
  const workerComments = getWorkerComments();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const w: Worker = {
      id: crypto.randomUUID(),
      name: form.name,
      role: form.role,
      phone: form.phone,
      projectIds: [],
    };
    addWorker(w);
    setWorkers(getWorkers());
    setForm({ name: "", role: "", phone: "" });
    setOpen(false);
  };

  const assignToProject = (workerId: string) => {
    if (!selectedProject) return;
    const updated = workers.map(w =>
      w.id === workerId && !w.projectIds.includes(selectedProject)
        ? { ...w, projectIds: [...w.projectIds, selectedProject] }
        : w
    );
    saveWorkers(updated);
    setWorkers(updated);
    setSelectedProject("");
    setAssignOpen(null);
  };

  const unassign = (workerId: string, projectId: string) => {
    const updated = workers.map(w =>
      w.id === workerId ? { ...w, projectIds: w.projectIds.filter(p => p !== projectId) } : w
    );
    saveWorkers(updated);
    setWorkers(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Workers</h1>
          <p className="text-muted-foreground text-sm mt-1">{workers.length} total workers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Add Worker</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Worker</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Role</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Mason, Electrician" required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              <Button type="submit" className="w-full">Add Worker</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workers.length === 0 ? (
        <div className="stat-card text-center py-16">
          <p className="text-muted-foreground">No workers added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workers.map(w => {
            const wComments = workerComments.filter(c => c.workerId === w.id);
            return (
              <div key={w.id} className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold">
                    {w.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{w.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase size={12} /> {w.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3"><Phone size={12} /> {w.phone}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {w.projectIds.map(pid => {
                    const proj = projects.find(p => p.id === pid);
                    return proj ? (
                      <Badge key={pid} variant="secondary" className="text-xs gap-1">
                        {proj.name}
                        <button onClick={() => unassign(w.id, pid)}><X size={10} /></button>
                      </Badge>
                    ) : null;
                  })}
                </div>

                {assignOpen === w.id ? (
                  <div className="flex gap-2 mb-3">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>
                        {activeProjects.filter(p => !w.projectIds.includes(p.id)).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-8 text-xs" onClick={() => assignToProject(w.id)}>Assign</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs w-full mb-2" onClick={() => setAssignOpen(w.id)}>
                    Assign to Project
                  </Button>
                )}

                {/* Worker comments */}
                {wComments.length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 w-full"
                      onClick={() => setCommentView(commentView === w.id ? null : w.id)}
                    >
                      <MessageSquare size={12} /> {wComments.length} Comment{wComments.length !== 1 ? "s" : ""}
                    </Button>
                    {commentView === w.id && (
                      <ul className="mt-2 space-y-2">
                        {[...wComments].reverse().slice(0, 5).map(c => (
                          <li key={c.id} className="text-xs border-l-2 border-secondary/30 pl-2 py-0.5">
                            <p>{c.text}</p>
                            <p className="text-muted-foreground">{new Date(c.date).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Workers;
