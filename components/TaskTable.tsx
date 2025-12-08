'use client';

import { Task, Worker } from '@/lib/types';

interface TaskTableProps {
  tasks: Task[];
  showCompleted?: boolean;
  onAssignTask?: (taskId: string, workerId: string) => void;
  onUnassignTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  availableWorkers?: Worker[];
}

const PRIORITY_STYLES: Record<string, { label: string; classes: string }> = {
  high: {
    label: 'High Priority',
    classes: 'bg-rose-50 text-rose-600 border border-rose-100',
  },
  medium: {
    label: 'Medium Priority',
    classes: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  low: {
    label: 'Low Priority',
    classes: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
};

export default function TaskTable({
  tasks,
  showCompleted = false,
  onAssignTask,
  onUnassignTask,
  onCompleteTask,
  availableWorkers = [],
}: TaskTableProps) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const filteredTasks = showCompleted ? tasks : tasks.filter((task) => !task.completed);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Tasks ({filteredTasks.length})
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left font-medium">ID</th>
              <th className="px-4 py-2 text-left font-medium">Task</th>
              <th className="px-4 py-2 text-left font-medium">Priority</th>
              <th className="px-4 py-2 text-left font-medium">Time</th>
              <th className="px-4 py-2 text-left font-medium">Deadline</th>
              <th className="px-4 py-2 text-left font-medium">Assignment</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No tasks found. add a task from above menu
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;
                return (
                  <tr key={task.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{task.id}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {formatDate(task.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${priority.classes}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{task.timeEstimate}h</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatDate(task.deadline)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignedTo ? (
                        <span className="font-medium">{task.assignedTo}</span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!task.completed && (
                        <div className="flex flex-col gap-2">
                          {task.assignedTo ? (
                            <>
                              {onUnassignTask && (
                                <button
                                  onClick={() => onUnassignTask(task.id)}
                                  className="px-3 py-1 border text-sm"
                                >
                                  Unassign
                                </button>
                              )}
                              {onCompleteTask && (
                                <button
                                  onClick={() => onCompleteTask(task.id)}
                                  className="px-3 py-1 bg-green-500 text-white text-sm"
                                >
                                  Complete
                                </button>
                              )}
                            </>
                          ) : (
                            onAssignTask &&
                            availableWorkers.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    onAssignTask(task.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="border px-3 py-1 text-sm"
                                defaultValue=""
                              >
                                <option value="">Assign to...</option>
                              {availableWorkers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name}
                                </option>
                              ))}
                              </select>
                            )
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
