import React from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCheck, FaFolderOpen } from 'react-icons/fa';

const AppointmentTimeline = ({ status }) => {
  // Define standard steps in sequence
  const steps = [
    { label: 'Requested', desc: 'Awaiting doctor review' },
    { label: 'Approved', desc: 'Request approved by doctor' },
    { label: 'Confirmed', desc: 'Booking slots locked' },
    { label: 'Consultation Completed', desc: 'Consultation finished' },
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-center space-x-3 text-red-600 dark:text-red-400">
        <FaTimesCircle className="text-2xl flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Appointment Cancelled</h4>
          <p className="text-xs text-red-500/80">This booking request has been cancelled and slots released.</p>
        </div>
      </div>
    );
  }

  // Get index of active step
  const activeIndex = steps.findIndex((step) => step.label === status);

  return (
    <div className="w-full py-4">
      {/* Visual Timeline Bar */}
      <div className="relative flex items-center justify-between">
        {/* Connection Background Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
        {/* Active connection line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 z-0"
          style={{ width: `${(Math.max(0, activeIndex) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Timeline nodes */}
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              {/* Outer circle */}
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : isActive
                    ? 'bg-white dark:bg-slate-900 border-brand-500 text-brand-500 ring-4 ring-brand-100 dark:ring-brand-950/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <FaCheck className="text-xs" />
                ) : isActive ? (
                  <FaHourglassHalf className="text-xs animate-spin" style={{ animationDuration: '3s' }} />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              
              {/* Labels */}
              <div className="absolute top-8 w-24 text-center">
                <p className={`text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-brand-500 font-extrabold' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  {step.label === 'Consultation Completed' ? 'Completed' : step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-6"></div> {/* Spacer for absolute labels */}
    </div>
  );
};

export default AppointmentTimeline;
