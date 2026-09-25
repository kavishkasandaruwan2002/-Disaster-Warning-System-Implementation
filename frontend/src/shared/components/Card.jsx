import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  glowColor = 'blue',
  onClick,
  ...props
}) => {
  const hoverClasses = hoverEffect ? 'hover:-translate-y-1 hover:shadow-glow transition-all duration-300' : '';
  const glowClasses = glow ? `shadow-glow-${glowColor}` : 'shadow-soft dark:shadow-soft-dark';

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 ${glowClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
