import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProjects, updateProject, addNotification, getWorkerComments, addWorkerComment, recalculateProjectSpent } from "@/lib/storage";
import { Project, Task, WorkerComment } from "@/types";
import { CheckCircle2, Circle, FolderKanban, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const reload = () => {
    const all = getProjects();
    const mine = all.filter(p => p.workers.includes(user?.id || "") || 
      (p.tasks || []).some(t => t.assignedTo === user?.id));
    // Also check worker records
    setProjects(mine.length > 0 ? mine : all.filter(p => {
      const workers = JSON.parse(localStorage.getItem("buildsync_workers") || "[]");
      const myWorker = workers.find((w: any) => w.id === user?.id);
      return myWorker?.projectIds?.includes(p.id);
    }));
  };

  useEffect(() => { reload(); }, [user]);

  const completeTask = (project: Project, taskId: string) => {
    const updated = {
      ...project,
      tasks: project.tasks.map(t =>
        t.id === taskId ? { ...t, completed: true, completedBy: user?.name, completedAt: new Date().toISOString() } : t
      ),
    };
    updateProject(updated);
    const recalc = recalculateProjectSpent(project.id);

    // Notify admin
    const task = updated.tasks.find(t => t.id === taskId);
    addNotification({
      id: crypto.randomUUID(),
      projectId: project.id,
      projectName: project.name,
      workerName: user?.name || "Worker",
      taskTitle: task?.title || "",
      type: "task_completed",
      message: `${user?.name} completed task "${task?.title}" on ${project.name}`,
      date: new Date().toISOString(),
      read: false,
    });

    toast.success("Task marked as completed!");
    reload();
  };

  const sendComment = (projectId: string) => {
    const text = commentTexts[projectId]?.trim();
    if (!text) return;
    addWorkerComment({
      id: crypto.randomUUID(),
      workerId: user?.id || "",
      workerName: user?.name || "Worker",
      projectId,
      text,
      date: new Date().toISOString(),
    });
    addNotification({
      id: crypto.randomUUID(),
      projectId,
      projectName: projects.find(p => p.id === projectId)?.name || "",
      workerName: user?.name || "Worker",
      taskTitle: "",
      type: "comment",
      message: `${user?.name} commented on ${projects.find(p => p.id === projectId)?.name}: "${text.substring(0, 50)}"`,
      date: new Date().toISOString(),
      read: false,
    });
    setCommentTexts(prev => ({ ...prev, [projectId]: "" }));
    toast.success("Comment sent to admin");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">My Projects</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome, {user?.name}. View your assigned tasks below.</p>
      </div>

      {projects.length === 0 ? (
        <div className="stat-card text-center py-16">
          <FolderKanban size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">You haven't been assigned to any projects yet.</p>
        </div>
      ) : (
        projects.map(project => {
          const completedTasks = (project.tasks || []).filter(t => t.completed).length;
          const totalTasks = (project.tasks || []).length;
          return (
            <div key={project.id} className="stat-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg">{project.name}</h2>
                  <p className="text-xs text-muted-foreground">{project.location}</p>
                </div>
                <Badge variant="outline" className={
                  project.status === "active" ? "bg-success/10 text-success border-success/20" :
                  project.status === "completed" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-warning/10 text-warning border-warning/20"
                }>{project.status}</Badge>
              </div>

              <div className="flex items-center gap-3">
                <Progress value={project.progress} className="flex-1 h-2" />
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Tasks ({completedTasks}/{totalTasks})</h3>
                {(project.tasks || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {(project.tasks || []).map(task => (
                      <li key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                        task.completed ? "bg-success/5 border-success/20" : "bg-card border-border"
                      }`}>
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <Circle size={18} className="text-muted-foreground" />
                          )}
                          <div>
                            <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                              {task.title}
                            </p>
                            {task.cost > 0 && <p className="text-xs text-muted-foreground">Cost: ₦{task.cost.toLocaleString()}</p>}
                          </div>
                        </div>
                        {!task.completed && project.status !== "completed" && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => completeTask(project, task.id)}>
                            <CheckCircle2 size={14} /> Done
                          </Button>
                        )}
                        {task.completed && task.completedBy && (
                          <span className="text-xs text-muted-foreground">by {task.completedBy}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Comment */}
              {project.status !== "completed" && (
                <div className="border-t border-border pt-3">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <MessageSquare size={14} /> Leave a Comment
                  </h3>
                  <div className="flex gap-2">
                    <Textarea
                      value={commentTexts[project.id] || ""}
                      onChange={e => setCommentTexts(prev => ({ ...prev, [project.id]: e.target.value }))}
                      placeholder="Write a comment for admin..."
                      className="min-h-[50px] text-sm"
                    />
                    <Button size="sm" className="self-end" onClick={() => sendComment(project.id)}>
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default WorkerDashboard;
