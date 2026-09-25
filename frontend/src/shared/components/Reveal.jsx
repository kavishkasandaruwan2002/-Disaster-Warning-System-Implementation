import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Reveal = ({ 
  children, 
  width = 'w-full', 
  delay = 0, 
  duration = 0.5,
  yOffset = 25,
  className = '' 
}) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div ref={ref} className={`${width} ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: yOffset }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
        transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Reveal;
