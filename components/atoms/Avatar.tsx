import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'size-5 text-[10px]',
    md: 'size-6 text-xs',
    lg: 'size-8 text-sm',
    xl: 'size-20 text-xl',
  };

  const containerClasses = `${sizeClasses[size]} rounded-full flex-shrink-0 object-cover border border-gray-200 dark:border-gray-700 ${className}`;

  if (src) {
    return <img src={src} alt={name || 'Avatar'} className={containerClasses} />;
  }

  return (
    <div className={`${containerClasses} bg-gray-100 dark:bg-slate-800 flex items-center justify-center border-dashed border-gray-300 dark:border-gray-600`}>
      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: size === 'sm' ? '14px' : '16px' }}>person</span>
    </div>
  );
};

export default Avatar;
