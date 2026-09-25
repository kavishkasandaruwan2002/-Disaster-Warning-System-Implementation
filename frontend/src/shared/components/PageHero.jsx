import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const PageHero = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  actions,
  className = '',
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 md:p-12 mb-8 shadow-xl border border-slate-700/50 ${className}`}
    >
      {/* Parallax Gradient Background Shape */}
      <motion.div
        style={{ y: bgY, opacity }}
        className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: bgY, opacity }}
        className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-3xl">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-500/10 border border-blue-400/30 text-blue-300 mb-4"
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{badge}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-300 leading-relaxed font-normal mb-6"
          >
            {subtitle}
          </motion.p>
        )}

        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHero;
