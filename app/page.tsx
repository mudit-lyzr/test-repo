'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import WorkerTable from '@/components/WorkerTable';
import TaskTable from '@/components/TaskTable';
import {
  getWorkers,
  getTasks,
  getAvailableWorkers,
  updateWorkerAvailability,
  assignTaskToWorker,
  unassignTask,
  completeTask,
  initializeData,
  exportTasksToCSV,
  exportWorkersToCSV,
} from '@/lib/data';
import { Worker, Task } from '@/lib/types';

export default function Dashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkers(getWorkers());
    setTasks(getTasks());
    setAvailableWorkers(getAvailableWorkers());
  };

  const handleFeedback = (type: 'error' | 'success', message: string) => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 2500);
    }
  };

  const wrapAction = (fn: () => void, successMessage: string) => {
    try {
      fn();
      loadData();
      handleFeedback('success', successMessage);
    } catch (err) {
      handleFeedback(
        'error',
        err instanceof Error ? err.message : 'Something went wrong'
      );
    }
  };

  const handleToggleAvailability = (workerId: string, availability: boolean) => {
    wrapAction(
      () => updateWorkerAvailability(workerId, availability),
      `Worker ${workerId} marked as ${availability ? 'available' : 'unavailable'}`
    );
  };

  const handleAssignTask = (taskId: string, workerId: string) => {
    wrapAction(() => assignTaskToWorker(taskId, workerId), `Task ${taskId} assigned to ${workerId}`);
  };

  const handleUnassignTask = (taskId: string) => {
    wrapAction(() => unassignTask(taskId), `Task ${taskId} is now unassigned`);
  };

  const handleCompleteTask = (taskId: string) => {
    wrapAction(() => completeTask(taskId), `Task ${taskId} completed`);
  };

  const handleExportTasksCSV = () => {
    try {
      const csvContent = exportTasksToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleFeedback('success', 'Tasks exported successfully');
    } catch (err) {
      handleFeedback('error', 'Failed to export tasks');
    }
  };

  const handleExportWorkersCSV = () => {
    try {
      const csvContent = exportWorkersToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `workers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleFeedback('success', 'Workers exported successfully');
    } catch (err) {
      handleFeedback('error', 'Failed to export workers');
    }
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const totalWorkers = workers.length;
  const workingWorkers = new Set(
    tasks
      .filter((task) => task.assignedTo && !task.completed)
      .map((task) => task.assignedTo)
  ).size;


  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-7xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={handleExportTasksCSV}
                className="px-4 py-2 bg-green-500 text-white"
              >
                Export Tasks
              </button>
              <button
                onClick={handleExportWorkersCSV}
                className="px-4 py-2 bg-blue-500 text-white"
              >
                Export Workers
              </button>
            </div>
          </div>

          {/* Worker Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Total Workers</h3>
                  <p className="text-3xl font-bold text-slate-900">{totalWorkers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Currently Working</h3>
                  <p className="text-3xl font-bold text-slate-900">{workingWorkers}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded border border-green-200 bg-green-50 text-green-700 px-4 py-2">
              {success}
            </div>
          )}

          <section className="space-y-8">
            <WorkerTable workers={workers} onToggleAvailability={handleToggleAvailability} />
            <TaskTable
              tasks={activeTasks}
              onAssignTask={handleAssignTask}
              onUnassignTask={handleUnassignTask}
              onCompleteTask={handleCompleteTask}
              availableWorkers={availableWorkers}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
