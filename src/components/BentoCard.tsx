import React from 'react';
import './BentoCard.css';

interface BentoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function BentoCard({ title, description, icon, children, className = '' }: BentoCardProps) {
  return (
    <div className={`bento-card hover-shimmer ${className}`}>
      {icon && <div className="bento-icon">{icon}</div>}
      <h3 className="bento-title">{title}</h3>
      <p className="bento-desc">{description}</p>
      {children && <div className="bento-content">{children}</div>}
    </div>
  );
}
