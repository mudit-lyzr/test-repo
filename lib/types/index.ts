export type Priority = 'high' | 'medium' | 'low';

export interface Worker {
  id: string;
  name: string;
  availability: boolean;
  totalAssignedHours: number;
}

export interface Task {
  id: string;
  description: string;
  priority: Priority;
  timeEstimate: number;
  deadline: string;
  assignedTo: string | null; 
  createdAt: string;
  completed: boolean;
}

export interface WorkerManagementData {
  workers: Worker[];
  tasks: Task[];
  nextWorkerId: number;
  nextTaskId: number;
}
