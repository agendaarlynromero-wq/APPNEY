
import React from 'react';

interface RetroButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = "px-4 py-1 font-bold text-[11px] active:translate-y-[1px] active:translate-x-[1px] transition-all bevel-out select-none cursor-default uppercase tracking-wide";
  const variants = {
    primary: "bg-[#c0c7c8] text-black",
    secondary: "bg-[#c0c7c8] text-black italic",
    ghost: "bg-transparent border-none shadow-none text-current"
  };

  // Custom click for professional active state (inverting bevel)
  const activeStyle = "active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white";

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${activeStyle} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
