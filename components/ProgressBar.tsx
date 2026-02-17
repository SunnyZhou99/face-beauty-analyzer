'use client';

interface ProgressBarProps {
  progress: number;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <p className="text-center text-sm text-gray-600 mt-2">{status}</p>
    </div>
  );
}
