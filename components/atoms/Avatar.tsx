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

  const containerClasses = `${sizeClasses[size]} rounded-full flex-shrink-0 object-cover ${className}`;

  if (src) {
    return <img src={src} alt={name || 'Avatar'} className={containerClasses} />;
  }

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className={`${containerClasses} bg-jira-blue dark:bg-blue-700 flex items-center justify-center text-white font-bold`}>
      <span style={{ fontSize: size === 'sm' ? '8px' : size === 'lg' ? '14px' : '10px' }}>{initials}</span>
    </div>
  );
};

export default Avatar;
