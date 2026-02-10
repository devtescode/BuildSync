export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "worker";
  phone?: string;
  password?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  deadline: string;
  budget: number;
  spent: number;
  progress: number;
  status: "active" | "completed" | "delayed" | "on-hold";
  createdAt: string;
  workers: string[];
  materials: string[];
  updates: ProjectUpdate[];
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  cost: number;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  assignedTo?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  projectIds: string[];
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  projectId: string;
  purchased: boolean;
  status: "available" | "low" | "out-of-stock";
}

export interface ProjectUpdate {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  workerName: string;
  taskTitle: string;
  type: "task_completed" | "comment";
  message: string;
  date: string;
  read: boolean;
}

export interface WorkerComment {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  text: string;
  date: string;
}
