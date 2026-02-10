import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects, updateProject, getWorkers, getMaterials, getWorkerComments, recalculateProjectSpent } from "@/lib/storage";
import { Project, ProjectUpdate, Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, CheckCircle2, MapPin, Calendar, Wallet,
  TrendingUp, Users, Package, MessageSquare, Plus, ListTodo, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  "on-hold": "bg-warning/10 text-warning border-warning/20",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [updateText, setUpdateText] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", cost: "" });

  const reload = () => {
    const p = getProjects().find(x => x.id === id) || null;
    setProject(p);
  };

  useEffect(() => { reload(); }, [id]);

  if (!project) return <div className="p-8 text-center text-muted-foreground">Project not found.</div>;

  const save = (p: Project) => { updateProject(p); setProject({ ...p }); };

  const markDone = () => {
    save({ ...project, progress: 100, status: "completed" });
  };

  const addUpdate = () => {
    if (!updateText.trim()) return;
    const upd: ProjectUpdate = {
      id: crypto.randomUUID(),
      text: updateText,
      date: new Date().toISOString(),
      author: user?.name || "Engineer",
    };
    save({ ...project, updates: [...project.updates, upd] });
    setUpdateText("");
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: crypto.randomUUID(),
      title: taskForm.title.trim(),
      cost: parseFloat(taskForm.cost) || 0,
      completed: false,
    };
    save({ ...project, tasks: [...(project.tasks || []), task] });
    setTaskForm({ title: "", cost: "" });
    setTaskOpen(false);
  };

  const workers = getWorkers().filter(w => w.projectIds.includes(project.id));
  const materials = getMaterials().filter(m => m.projectId === project.id);
  const workerComments = getWorkerComments().filter(c => c.projectId === project.id);
  const remaining = project.budget - project.spent;
  const isCompleted = project.status === "completed";

  const deadlineDate = new Date(project.deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const completedTasks = (project.tasks || []).filter(t => t.completed).length;
  const totalTasks = (project.tasks || []).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold">{project.name}</h1>
            <Badge variant="outline" className={statusColors[project.status]}>{project.status}</Badge>
          </div>
        </div>
        {!isCompleted && (
          <Button onClick={markDone} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
            <CheckCircle2 size={16} /> Mark as Done
          </Button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <MapPin size={16} className="text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="font-medium text-sm mt-0.5">{project.location}</p>
        </div>
        <div className="stat-card">
          <Calendar size={16} className="text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="font-medium text-sm mt-0.5">{deadlineDate.toLocaleDateString()}</p>
          <p className={`text-xs mt-0.5 ${daysLeft < 0 ? "text-destructive" : daysLeft < 7 ? "text-warning" : "text-success"}`}>
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
          </p>
        </div>
        <div className="stat-card">
          <Wallet size={16} className="text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="font-medium text-sm mt-0.5">₦{project.budget.toLocaleString()}</p>
          <p className={`text-xs mt-0.5 ${remaining < 0 ? "text-destructive" : "text-success"}`}>
            ₦{remaining.toLocaleString()} remaining
          </p>
        </div>
        <div className="stat-card">
          <TrendingUp size={16} className="text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="font-medium text-sm mt-0.5">{project.progress}%</p>
          <Progress value={project.progress} className="mt-2 h-1.5" />
        </div>
      </div>

      {/* Tasks */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <ListTodo size={18} className="text-primary" /> Tasks ({completedTasks}/{totalTasks})
          </h3>
          {!isCompleted && (
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-xs"><Plus size={14} /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Add Task</DialogTitle></DialogHeader>
                <form onSubmit={addTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Foundation laying" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost (₦)</Label>
                    <Input type="number" value={taskForm.cost} onChange={e => setTaskForm({ ...taskForm, cost: e.target.value })} placeholder="Cost for this task" />
                  </div>
                  <Button type="submit" className="w-full">Add Task</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {(project.tasks || []).length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No tasks yet. Add tasks for workers to complete.</p>
        ) : (
          <ul className="space-y-2">
            {(project.tasks || []).map(task => (
              <li key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                task.completed ? "bg-success/5 border-success/20" : "bg-card border-border"
              }`}>
                <div className="flex items-center gap-2">
                  {task.completed ? <CheckCircle2 size={16} className="text-success" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                  {task.cost > 0 && <Badge variant="outline" className="text-[10px] ml-1">₦{task.cost.toLocaleString()}</Badge>}
                </div>
                {task.completed && task.completedBy && (
                  <span className="text-xs text-muted-foreground">Done by {task.completedBy}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workers */}
        <div className="stat-card">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
            <Users size={18} className="text-primary" /> Workers ({workers.length})
          </h3>
          {workers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No workers assigned.</p>
          ) : (
            <ul className="space-y-2">
              {workers.map(w => (
                <li key={w.id} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {w.name[0]}
                  </div>
                  <div>
                    <span>{w.name}</span>
                    <span className="text-muted-foreground"> — {w.role}</span>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} /> {w.phone}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Materials */}
        <div className="stat-card">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
            <Package size={18} className="text-secondary" /> Materials ({materials.length})
          </h3>
          {materials.length === 0 ? (
            <p className="text-muted-foreground text-sm">No materials added.</p>
          ) : (
            <ul className="space-y-2">
              {materials.map(m => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span>{m.name} {m.purchased && <Badge variant="outline" className="text-[10px] bg-success/10 text-success ml-1">Purchased</Badge>}</span>
                  <span className={`font-medium ${m.status === "low" ? "text-warning" : m.status === "out-of-stock" ? "text-destructive" : "text-foreground"}`}>
                    {m.quantity} {m.unit} {m.cost > 0 && `· ₦${m.cost.toLocaleString()}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Worker Comments (Admin only) */}
      {workerComments.length > 0 && (
        <div className="stat-card">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
            <MessageSquare size={18} className="text-secondary" /> Worker Comments
          </h3>
          <ul className="space-y-3">
            {[...workerComments].reverse().map(c => (
              <li key={c.id} className="border-l-2 border-secondary/40 pl-3 py-1">
                <p className="text-sm">{c.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.workerName} · {new Date(c.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Activity Feed */}
      <div className="stat-card">
        <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-primary" /> Site Updates
        </h3>
        {!isCompleted && (
          <div className="flex gap-2 mb-4">
            <Textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              placeholder="Add a site update..."
              className="min-h-[60px]"
            />
            <Button onClick={addUpdate} size="sm" className="self-end">
              <Plus size={16} />
            </Button>
          </div>
        )}
        {project.updates.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {[...project.updates].reverse().map(u => (
              <li key={u.id} className="border-l-2 border-primary/30 pl-3 py-1">
                <p className="text-sm">{u.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{u.author} · {new Date(u.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
