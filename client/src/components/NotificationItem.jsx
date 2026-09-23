import { motion } from "framer-motion";
import "./NotificationItem.css";

// Ligne de notification : apparition en glissement latéral + puce
// lumineuse pulsante tant que la notification n'a pas été lue.
export function NotificationItem({ title, date, isRead, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`notification-item ${isRead ? "read" : "unread"}`}
      onClick={onClick}
    >
      <div className="notification-dot-wrapper">
        <span className="notification-dot" />
        {!isRead && <span className="notification-dot-ping" />}
      </div>

      <div className="notification-body">
        <p>{title}</p>
        <span>{date}</span>
      </div>

      {!isRead && <span className="notification-cta">Marquer comme lue</span>}
    </motion.div>
  );
}
