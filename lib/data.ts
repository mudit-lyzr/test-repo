import { Worker, Task, WorkerManagementData, Priority } from './types';

const STORAGE_KEY = 'cleaning-business-data';
const MAX_WORK_HOURS_PER_DAY = 8;

let workers: Worker[] = [];
let tasks: Task[] = [];
let workerMap: Map<string, Worker> = new Map();
let nextWorkerId = 1;
let nextTaskId = 1;

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function initializeData(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: WorkerManagementData = JSON.parse(stored);

      workers = parsed.workers || [];
      workerMap.clear();
      workers.forEach(worker => {
        workerMap.set(worker.id, worker);
      });

      tasks = parsed.tasks || [];

      nextWorkerId = parsed.nextWorkerId || 1;
      nextTaskId = parsed.nextTaskId || 1;
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    workers = [];
    tasks = [];
    workerMap.clear();
    nextWorkerId = 1;
    nextTaskId = 1;
  }
}

export function saveData(): void {
  try {
    const data: WorkerManagementData = {
      workers,
      tasks,
      nextWorkerId,
      nextTaskId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    throw new Error('Failed to save data');
  }
}

export function getWorkers(): Worker[] {
  return [...workers];
}

export function getAvailableWorkers(): Worker[] {
  return workers.filter(worker => worker.availability && worker.totalAssignedHours < MAX_WORK_HOURS_PER_DAY);
}

export function addWorker(name: string): Worker {
  const id = `W${String(nextWorkerId).padStart(3, '0')}`;
  nextWorkerId++;

  const worker: Worker = {
    id,
    name,
    availability: true,
    totalAssignedHours: 0,
  };

  workers.push(worker);
  workerMap.set(id, worker);
  saveData();

  return worker;
}

export function updateWorkerAvailability(id: string, availability: boolean): void {
  const worker = workerMap.get(id);
  if (!worker) {
    throw new Error(`Worker with ID ${id} not found`);
  }

  worker.availability = availability;
  saveData();
}

export function getWorkerById(id: string): Worker | undefined {
  return workerMap.get(id);
}

export function getTasks(): Task[] {
  return [...tasks];
}

export function getUnassignedTasks(): Task[] {
  return tasks.filter(task => task.assignedTo === null && !task.completed);
}

export function addTask(description: string, priority: Priority, timeEstimate: number, deadline: string): Task {
  const id = `T${String(nextTaskId).padStart(3, '0')}`;
  nextTaskId++;

  const task: Task = {
    id,
    description,
    priority,
    timeEstimate,
    deadline,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    completed: false,
  };

  tasks.push(task);
  saveData();

  return task;
}

export function assignTaskToWorker(taskId: string, workerId: string): void {
  const task = tasks.find(t => t.id === taskId);
  const worker = workerMap.get(workerId);

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  if (!worker) {
    throw new Error(`Worker with ID ${workerId} not found`);
  }

  if (!worker.availability) {
    throw new Error(`Worker ${worker.name} is not available`);
  }

  if (worker.totalAssignedHours + task.timeEstimate > MAX_WORK_HOURS_PER_DAY) {
    throw new Error(`Worker ${worker.name} would exceed maximum hours (${MAX_WORK_HOURS_PER_DAY})`);
  }

  if (task.assignedTo) {
    const prevWorker = workerMap.get(task.assignedTo);
    if (prevWorker) {
      prevWorker.totalAssignedHours -= task.timeEstimate;
    }
  }

  task.assignedTo = workerId;
  worker.totalAssignedHours += task.timeEstimate;
  saveData();
}

export function unassignTask(taskId: string): void {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  if (task.assignedTo) {
    const worker = workerMap.get(task.assignedTo);
    if (worker) {
      worker.totalAssignedHours -= task.timeEstimate;
    }
    task.assignedTo = null;
    saveData();
  }
}

export function completeTask(taskId: string): void {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  task.completed = true;
  saveData();
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function searchTasks(query: string): Task[] {
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.description.toLowerCase().includes(lowercaseQuery) ||
    task.id.toLowerCase().includes(lowercaseQuery) ||
    (task.assignedTo && task.assignedTo.toLowerCase().includes(lowercaseQuery))
  );
}
export function validateWorkerId(id: string): boolean {
  return /^W\d{3}$/.test(id);
}

export function validateTaskId(id: string): boolean {
  return /^T\d{3}$/.test(id);
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function exportTasksToCSV(): string {
  const headers = ['ID', 'Description', 'Priority', 'Time Estimate', 'Deadline', 'Assigned To', 'Status', 'Created At'];
  const rows = tasks.map(task => [
    task.id,
    task.description,
    task.priority,
    task.timeEstimate.toString(),
    task.deadline,
    task.assignedTo || 'Unassigned',
    task.completed ? 'Completed' : 'Active',
    task.createdAt,
  ]);

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function exportWorkersToCSV(): string {
  const headers = ['ID', 'Name', 'Availability', 'Assigned Hours', 'Available Hours'];
  const rows = workers.map(worker => [
    worker.id,
    worker.name,
    worker.availability ? 'Available' : 'Unavailable',
    worker.totalAssignedHours.toString(),
    Math.max(0, 8 - worker.totalAssignedHours).toString(),
  ]);

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function exportToCSV(): string {
  return exportTasksToCSV();
}
