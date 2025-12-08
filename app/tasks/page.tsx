'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TaskTable from '@/components/TaskTable';
import {
  getTasks,
  getAvailableWorkers,
  sortTasksByPriority,
  sortTasksByDeadline,
  searchTasks,
  exportTasksToCSV,
  exportWorkersToCSV,
  assignTaskToWorker,
  unassignTask,
  completeTask,
  initializeData,
} from '@/lib/data';
import { Task, Priority, Worker } from '@/lib/types';

type SortOption = 'priority' | 'deadline' | 'created' | 'none';
type FilterOption = 'all' | 'active' | 'completed' | 'assigned' | 'unassigned';

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [allTasks, searchQuery, sortBy, filterBy, priorityFilter]);

  const loadData = () => {
    setAllTasks(getTasks());
    setAvailableWorkers(getAvailableWorkers());
  };

  const applyFiltersAndSorting = () => {
    let tasks = [...allTasks];

    if (searchQuery.trim()) {
      tasks = searchTasks(searchQuery.trim());
    }

    switch (filterBy) {
      case 'active':
        tasks = tasks.filter((task) => !task.completed);
        break;
      case 'completed':
        tasks = tasks.filter((task) => task.completed);
        break;
      case 'assigned':
        tasks = tasks.filter((task) => task.assignedTo !== null);
        break;
      case 'unassigned':
        tasks = tasks.filter((task) => task.assignedTo === null);
        break;
      default:
        break;
    }

    if (priorityFilter !== 'all') {
      tasks = tasks.filter((task) => task.priority === priorityFilter);
    }

    switch (sortBy) {
      case 'priority':
        tasks = sortTasksByPriority(tasks);
        break;
      case 'deadline':
        tasks = sortTasksByDeadline(tasks);
        break;
      case 'created':
        tasks = [...tasks].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredTasks(tasks);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 2500);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  const handleAssignTask = (taskId: string, workerId: string) => {
    try {
      assignTaskToWorker(taskId, workerId);
      loadData();
      showSuccess('Task assigned successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleUnassignTask = (taskId: string) => {
    try {
      unassignTask(taskId);
      loadData();
      showSuccess('Task unassigned successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to unassign task');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    try {
      completeTask(taskId);
      loadData();
      showSuccess('Task completed successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to complete task');
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
      showSuccess('Tasks exported successfully');
    } catch (err) {
      showError('Failed to export tasks');
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
      showSuccess('Workers exported successfully');
    } catch (err) {
      showError('Failed to export workers');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('none');
    setFilterBy('all');
    setPriorityFilter('all');
  };


  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-7xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">View Tasks</h1>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 text-rose-700 px-6 py-4 shadow">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 text-emerald-700 px-6 py-4 shadow">
              {success}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full border px-3 py-2"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-full border px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                  className="w-full border px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border"
              >
                Clear
              </button>
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
          </section>

          <section className="space-y-6">
            <TaskTable
              tasks={filteredTasks}
              showCompleted={filterBy === 'all' || filterBy === 'completed'}
              onAssignTask={handleAssignTask}
              onUnassignTask={handleUnassignTask}
              onCompleteTask={handleCompleteTask}
              availableWorkers={availableWorkers}
            />

            {filteredTasks.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                {allTasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}


