import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 }
  }
};

export function MotionPage({ children, className = '' }) {
  return (
    <motion.div initial="hidden" animate="show" variants={pageVariants} className={`grid gap-6 ${className}`}>
      {children}
    </motion.div>
  );
}

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};
