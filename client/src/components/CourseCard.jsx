import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import "./CourseCard.css";

// Carte de leçon éditoriale : numéro géant en filigrane, apparition en
// cascade (stagger via `index`) et bordure/icône réactives au survol.
export function CourseCard({ index = 0, number, title, date, status, featured, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -4 }}
      className={`course-card ${featured ? "course-card-feature" : ""}`}
      onClick={onOpen}
    >
      <span className="course-card-number">{number}</span>

      <div className="course-card-top">
        <span className="course-card-status">{status}</span>
        <div className="course-card-arrow">
          <ArrowUpRight size={18} color="var(--green)" />
        </div>
      </div>

      <h3 className="course-card-title">{title}</h3>

      <div className="course-card-date">
        <Clock size={14} />
        <span>Disponible depuis le {date}</span>
      </div>
    </motion.div>
  );
}
