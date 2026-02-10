import { Project, Worker, Material, User, Notification, WorkerComment } from "@/types";

const KEYS = {
  USER: "buildsync_user",
  PROJECTS: "buildsync_projects",
  WORKERS: "buildsync_workers",
  MATERIALS: "buildsync_materials",
  REGISTERED_USERS: "buildsync_registered_users",
  NOTIFICATIONS: "buildsync_notifications",
  WORKER_COMMENTS: "buildsync_worker_comments",
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Auth
export const getUser = (): User | null => get<User | null>(KEYS.USER, null);
export const setUser = (u: User) => set(KEYS.USER, u);
export const clearUser = () => localStorage.removeItem(KEYS.USER);

// Registered users (for worker signup/signin)
export const getRegisteredUsers = (): User[] => get<User[]>(KEYS.REGISTERED_USERS, []);
export const saveRegisteredUsers = (u: User[]) => set(KEYS.REGISTERED_USERS, u);
export const registerUser = (u: User) => {
  const all = getRegisteredUsers();
  all.push(u);
  saveRegisteredUsers(all);
};

// Projects
export const getProjects = (): Project[] => {
  const projects = get<Project[]>(KEYS.PROJECTS, []);
  return projects.map(p => ({ ...p, tasks: p.tasks || [] }));
};
export const saveProjects = (p: Project[]) => set(KEYS.PROJECTS, p);
export const addProject = (p: Project) => { const all = getProjects(); all.push(p); saveProjects(all); };
export const updateProject = (p: Project) => {
  const all = getProjects().map(x => x.id === p.id ? p : x);
  saveProjects(all);
};

// Workers
export const getWorkers = (): Worker[] => get<Worker[]>(KEYS.WORKERS, []);
export const saveWorkers = (w: Worker[]) => set(KEYS.WORKERS, w);
export const addWorker = (w: Worker) => { const all = getWorkers(); all.push(w); saveWorkers(all); };

// Materials
export const getMaterials = (): Material[] => {
  const mats = get<Material[]>(KEYS.MATERIALS, []);
  return mats.map(m => ({ ...m, cost: m.cost || 0, purchased: m.purchased || false }));
};
export const saveMaterials = (m: Material[]) => set(KEYS.MATERIALS, m);
export const addMaterial = (m: Material) => { const all = getMaterials(); all.push(m); saveMaterials(all); };

// Notifications
export const getNotifications = (): Notification[] => get<Notification[]>(KEYS.NOTIFICATIONS, []);
export const saveNotifications = (n: Notification[]) => set(KEYS.NOTIFICATIONS, n);
export const addNotification = (n: Notification) => {
  const all = getNotifications();
  all.unshift(n);
  saveNotifications(all);
};
export const markNotificationRead = (id: string) => {
  const all = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(all);
};
export const markAllNotificationsRead = () => {
  const all = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(all);
};

// Worker Comments
export const getWorkerComments = (): WorkerComment[] => get<WorkerComment[]>(KEYS.WORKER_COMMENTS, []);
export const saveWorkerComments = (c: WorkerComment[]) => set(KEYS.WORKER_COMMENTS, c);
export const addWorkerComment = (c: WorkerComment) => {
  const all = getWorkerComments();
  all.push(c);
  saveWorkerComments(all);
};

// Helper: recalculate project spent from completed tasks + purchased materials
export const recalculateProjectSpent = (projectId: string) => {
  const project = getProjects().find(p => p.id === projectId);
  if (!project) return;
  const materials = getMaterials().filter(m => m.projectId === projectId && m.purchased);
  const taskCost = (project.tasks || []).filter(t => t.completed).reduce((s, t) => s + t.cost, 0);
  const materialCost = materials.reduce((s, m) => s + m.cost, 0);
  const totalCompleted = (project.tasks || []).filter(t => t.completed).length;
  const totalTasks = (project.tasks || []).length;
  const progress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : project.progress;
  const spent = taskCost + materialCost;
  
  const updated: Project = {
    ...project,
    spent,
    progress: Math.min(progress, 100),
    status: progress >= 100 ? "completed" : project.status,
  };
  updateProject(updated);
  return updated;
};
