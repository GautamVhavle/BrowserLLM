/**
 * Reusable animated section header for landing page sections.
 * Fades in on scroll with staggered children.
 */
import { motion } from "framer-motion";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";

interface SectionHeaderProps {
  label: string;
  labelColor: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({
  label,
  labelColor,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
      className="text-center mb-16"
    >
      <motion.p
        variants={fadeUp}
        transition={defaultTransition}
        className={`${labelColor} font-mono text-xs mb-3 tracking-[0.2em] uppercase`}
      >
        {label}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        transition={defaultTransition}
        className="text-3xl sm:text-4xl md:text-5xl font-display font-bold"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          transition={defaultTransition}
          className="text-gray-400 mt-4 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
