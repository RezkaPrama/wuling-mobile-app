import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }) => {
  const baseStyles = "px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-[#D91E1E] text-white shadow-lg shadow-red-900/20",
    secondary: "bg-[#2D2D2D] text-white",
    outline: "border-2 border-[#D91E1E] text-[#D91E1E]",
    danger: "bg-red-100 text-red-600 border border-red-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
    {children}
  </div>
);

export const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-medium text-gray-600 ml-1">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
      <input 
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${Icon ? 'pl-11' : 'px-4'} pr-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-gray-800`}
        {...props} 
      />
    </div>
  </div>
);

export const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'red' | 'green' | 'blue' | 'gray' | 'yellow' }) => {
  const styles = {
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    gray: "bg-gray-100 text-gray-600 border-gray-200"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};
