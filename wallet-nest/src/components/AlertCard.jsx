import { AlertCircle } from 'lucide-react';

export default function AlertCard({ title, message, type = 'warning' }) {
  const isWarning = type === 'warning';
  
  return (
    <div className={`rounded-2xl p-4 flex items-start space-x-4 border backdrop-blur-md mb-6 transition-all ${
      isWarning 
        ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-500/30' 
        : 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30'
    }`}>
      <div className={`p-2 rounded-full ${isWarning ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
        <AlertCircle size={20} />
      </div>
      <div>
        <h4 className={`font-semibold ${isWarning ? 'text-orange-800 dark:text-orange-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
          {title}
        </h4>
        <p className={`text-sm mt-1 ${isWarning ? 'text-orange-600 dark:text-orange-400/80' : 'text-emerald-600 dark:text-emerald-400/80'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
