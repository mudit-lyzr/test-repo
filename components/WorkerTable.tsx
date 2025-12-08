'use client';

import { Worker } from '@/lib/types';

interface WorkerTableProps {
  workers: Worker[];
  onToggleAvailability?: (workerId: string, availability: boolean) => void;
}

export default function WorkerTable({ workers, onToggleAvailability }: WorkerTableProps) {
  return (
    <div className="border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Workers ({workers.length})
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left font-medium">ID</th>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Availability</th>
              <th className="px-4 py-2 text-left font-medium">Assigned Hours</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No workers yet.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{worker.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{worker.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      worker.availability
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{worker.totalAssignedHours}/8 hours</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(worker.totalAssignedHours / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {onToggleAvailability && (
                      <button
                        onClick={() => onToggleAvailability(worker.id, !worker.availability)}
                        className={`px-3 py-1 text-sm ${
                          worker.availability
                            ? 'border border-red-200 text-red-600'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {worker.availability ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
