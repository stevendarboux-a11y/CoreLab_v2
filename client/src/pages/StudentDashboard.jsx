import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProgress, getLessons, getAttempts } from "../api/student.js";
import "./StudentDashboard.css";

// Noms de cours en attendant que getStudentCourses soit branché ici aussi
const courseNames = [
  "Histoire de la Mode",
  "Stylisme & Création",
  "Textile & Matières",
  "Couture & Patronage",
  "Mode Digitale",
  "Mode Mondiale",
];

// Convertit une date ISO en texte lisible : "Aujourd'hui", "Il y a 1j", etc.
function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1j";
  return `Il y a ${days}j`;
}

function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ── États ──────────────────────────────────────────────────────────────────
  const [modules, setModules] = useState([]);       // progression par cours
  const [nextLesson, setNextLesson] = useState(null); // prochaine leçon à faire
  const [attempts, setAttempts] = useState([]);     // historique des quiz passés
  const [loading, setLoading] = useState(true);

  // ── Chargement des données ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadProgress() {
      if (!user?.courses?.length) {
        setLoading(false);
        return;
      }
      try {
        // Promise.all : 3 appels en parallèle pour ne pas les enchaîner inutilement
        const [progressData, firstLessons, attemptsData] = await Promise.all([
          Promise.all(
            user.courses.map((courseId, i) =>
              fetchProgress(courseId, token).then((data) => ({
                name: courseNames[i] || `Cours ${i + 1}`,
                progress: data.progressPercent,
                lessons: `${data.completedLessons}/${data.totalLessons}`,
                completedLessons: data.completedLessons,
              })),
            ),
          ),
          getLessons(user.courses[0], token),
          getAttempts(token),
        ]);

        setModules(progressData);
        setAttempts(attemptsData);

        // Math.min évite de dépasser le dernier index si toutes les leçons sont faites
        const completed = progressData[0]?.completedLessons ?? 0;
        const nextIndex = Math.min(completed, firstLessons.length - 1);
        setNextLesson(firstLessons[nextIndex] ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        // finally s'exécute toujours, succès ou erreur
        setLoading(false);
      }
    }
    loadProgress();
  }, [user, token]);

  // ── Moyenne calculée côté front depuis les attempts (score sur 100 → /5 → sur 20) ──
  const moyenne = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) / 5 * 10) / 10
    : null;

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Mon Parcours</h1>
          {/* split(" ")[0] : affiche uniquement le prénom */}
          <p>Bienvenue, {user?.name?.split(" ")[0]}</p>
        </div>
        <span className="season-badge">AW 2026</span>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-left">
          <div className="welcome-card glow-card">
            <h2>Bonne reprise, {user?.name?.split(" ")[0]} ✦</h2>
            <p>Stylisme 2024 · Paris - Milan · Semestre 3 en cours · AW 2026</p>
          </div>

          {/* Stats : cours assignés + moyenne réelle */}
          <div className="stats-grid">
            <div className="stat-card glow-card">
              <small>Cours suivis</small>
              <strong>{user?.courses?.length ?? 0}</strong>
              <span>cours assignés</span>
            </div>
            <div className="stat-card glow-card">
              <small>Moyenne générale</small>
              <strong>{moyenne !== null ? `${moyenne}/20` : "-"}</strong>
              <span>{attempts.length} quiz passés</span>
            </div>
          </div>

          {/* Barres de progression par cours */}
          <div className="progress-section">
            <h3>Progression par Module</h3>
            {loading ? (
              <p style={{ color: "#9a9a9a", fontSize: "13px" }}>
                Chargement...
              </p>
            ) : (
              <div className="modules-ring-grid">
                {modules.map((module) => (
                  <div key={module.name} className="module-ring-card">
                    <div
                      className="progress-ring progress-ring-sm"
                      style={{ "--pct": module.progress }}
                    >
                      <svg viewBox="0 0 100 100">
                        <circle className="ring-bg" cx="50" cy="50" r="42" />
                        <circle className="ring-fill" cx="50" cy="50" r="42" />
                      </svg>
                      <span className="progress-ring-value">
                        {module.progress}%
                      </span>
                    </div>
                    <div className="module-ring-info">
                      <span>{module.name}</span>
                      <small>{module.lessons} leçons</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-right">
          {/* Prochaine leçon : la leçon à l'index = nombre de leçons complétées */}
          <div className="next-lesson-card glow-card">
            <small>Prochaine Leçon</small>
            <h3>{nextLesson?.title ?? "-"}</h3>
            <div className="lesson-meta">
              <div>
                <small>Module</small>
                <span>{courseNames[0]}</span>
              </div>
            </div>
            <button
              className="resume-btn"
              onClick={() =>
                nextLesson &&
                navigate(`/dashboard/cours/${nextLesson._id}`, {
                  state: { courseName: courseNames[0] },
                })
              }
            >
              ▶ Reprendre la leçon
            </button>
          </div>

          {/* 5 derniers quiz passés avec score et date relative */}
          <div className="activity-section">
            <h3>Activité Récente</h3>
            {attempts.length === 0 && (
              <p style={{ color: "#9a9a9a", fontSize: "13px" }}>Aucune activité.</p>
            )}
            {attempts.slice(0, 5).map((attempt) => (
              <div key={attempt._id} className={`activity-item ${attempt.passed ? "success" : "fail"}`}>
                <div>
                  <p>{attempt.quiz?.title ?? "Quiz"}</p>
                  <small>Score : {attempt.score} / 100</small>
                </div>
                <span>{timeAgo(attempt.attemptedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
