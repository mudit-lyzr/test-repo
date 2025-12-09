'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import {
  addWorker,
  addTask,
  assignTaskToWorker,
  getWorkers,
  getAvailableWorkers,
  initializeData,
  validateDate,
  exportTasksToCSV,
  exportWorkersToCSV,
} from '@/lib/data';
import { Priority, Worker } from '@/lib/types';

export default function AssignPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [workerName, setWorkerName] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskTimeEstimate, setTaskTimeEstimate] = useState<number>(1);
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [assignToWorker, setAssignToWorker] = useState<string>('');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkers(getWorkers());
    setAvailableWorkers(getAvailableWorkers());
  };

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 2500);
    } else {
      setError(message);
      setSuccess('');
    }
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
      showMessage('success', 'Tasks exported successfully');
    } catch (err) {
      showMessage('error', 'Failed to export tasks');
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
      showMessage('success', 'Workers exported successfully');
    } catch (err) {
      showMessage('error', 'Failed to export workers');
    }
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerName.trim()) {
      showMessage('error', 'Worker name is required');
      return;
    }

    try {
      const newWorker = addWorker(workerName.trim());
      setWorkerName('');
      loadData();
      showMessage('success', `Crew member ${newWorker.name} added (ID ${newWorker.id})`);
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to add worker');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      showMessage('error', 'Task description is required');
      return;
    }

    if (!validateDate(taskDeadline)) {
      showMessage('error', 'Please enter a valid deadline');
      return;
    }

    if (taskTimeEstimate <= 0) {
      showMessage('error', 'Time estimate must be greater than 0');
      return;
    }

    try {
      const newTask = addTask(taskDescription.trim(), taskPriority, taskTimeEstimate, taskDeadline);

      if (assignToWorker) {
        assignTaskToWorker(newTask.id, assignToWorker);
        showMessage('success', `Task “${newTask.description}” created and assigned to ${assignToWorker}`);
      } else {
        showMessage('success', `Task “${newTask.description}” created`);
      }

      setTaskDescription('');
      setTaskPriority('medium');
      setTaskTimeEstimate(1);
      setTaskDeadline('');
      setAssignToWorker('');
      loadData();
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-6xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Assign Tasks</h1>
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

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workers Section - Left Column */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Workers ({workers.length})</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportTasksCSV}
                      className="px-3 py-1 bg-green-500 text-white text-sm"
                    >
                      Export Tasks
                    </button>
                    <button
                      onClick={handleExportWorkersCSV}
                      className="px-3 py-1 bg-blue-500 text-white text-sm"
                    >
                      Export Workers
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {workers.length === 0 ? (
                  <p className="text-gray-500">No workers yet</p>
                ) : (
                  <div className="space-y-3">
                    {workers.map((worker) => (
                      <div key={worker.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{worker.name}</p>
                            <p className="text-sm text-gray-500">{worker.id}</p>
                          </div>
                          <span className={`px-2 py-1 text-sm ${worker.availability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {worker.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">{worker.totalAssignedHours}/8 hours</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(worker.totalAssignedHours / 8) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Worker Form - Middle Column */}
            <form onSubmit={handleAddWorker} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
              <h2 className="text-lg font-medium">Add Worker</h2>
              <label className="block">
                Name
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="mt-1 w-full border px-3 py-2"
                  required
                />
              </label>
              <button type="submit" className="w-full bg-blue-500 text-white py-2">
                Add Worker
              </button>
            </form>

            {/* Create Task Form - Right Column */}
            <form onSubmit={handleAddTask} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
              <h2 className="text-lg font-medium">Create Task</h2>
              <label className="block">
                Description
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full border px-3 py-2"
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Priority
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="mt-1 w-full border px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="block">
                  Hours
                  <input
                    type="number"
                    value={taskTimeEstimate}
                    onChange={(e) => setTaskTimeEstimate(Number(e.target.value))}
                    min="0.5"
                    step="0.5"
                    className="mt-1 w-full border px-3 py-2"
                    required
                  />
                </label>
              </div>
              <label className="block">
                Deadline
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 w-full border px-3 py-2"
                  required
                />
              </label>
              <label className="block">
                Assign to (optional)
                <select
                  value={assignToWorker}
                  onChange={(e) => setAssignToWorker(e.target.value)}
                  className="mt-1 w-full border px-3 py-2"
                >
                  <option value="">No assignment</option>
                  {availableWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="w-full bg-green-500 text-white py-2">
                Create Task for workers
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

