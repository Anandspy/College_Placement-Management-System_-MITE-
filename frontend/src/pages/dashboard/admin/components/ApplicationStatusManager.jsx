import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateApplicationStatus } from '../../../../api/applicationApi';
import { Check, X, Clock, Edit2 } from 'lucide-react';

const statuses = [
  { value: 'applied', label: 'Applied', color: 'bg-neutral-100 text-neutral-600' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-50 text-blue-600' },
  { value: 'not-shortlisted', label: 'Not Shortlisted', color: 'bg-red-50 text-red-600' },
  { value: 'test-cleared', label: 'Test Cleared', color: 'bg-green-50 text-green-600' },
  { value: 'test-failed', label: 'Test Failed', color: 'bg-red-50 text-red-600' },
  { value: 'interview-scheduled', label: 'Interview Scheduled', color: 'bg-purple-50 text-purple-600' },
  { value: 'selected', label: 'Selected', color: 'bg-brand-orange/10 text-brand-orange' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-600' }
];

const ApplicationStatusManager = ({ application, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === application.status) return;

    try {
      setIsUpdating(true);
      await updateApplicationStatus(application._id, { status: newStatus });
      toast.success('Status updated successfully');
      if (onStatusChange) {
        onStatusChange(application._id, newStatus);
      }
    } catch (error) {
      toast.error('Failed to update status');
      // Reset the select value back to current status on error
      e.target.value = application.status;
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusConfig = statuses.find(s => s.value === application.status) || statuses[0];

  return (
    <div className="relative inline-block w-48">
      <select
        value={application.status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`w-full appearance-none rounded-lg border-neutral-200 pl-4 pr-10 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors disabled:opacity-50 ${currentStatusConfig.color}`}
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value} className="bg-white text-neutral-900">
            {status.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
        <Edit2 className="h-4 w-4" />
      </div>
    </div>
  );
};

export default ApplicationStatusManager;
