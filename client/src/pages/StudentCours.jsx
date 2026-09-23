import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getLessons, fetchProgress, getStudentCourses } from "../api/student.js";
import { CourseCard } from "../components/CourseCard.jsx";
import "./StudentCours.css";

function StudentCours() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // ── États ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);        // liste des cours de l'étudiant
  const [selectedIndex, setSelectedIndex] = useState(0); // onglet actif
  const [lessons, setLessons] = useState([]);        // leçons du cours sélectionné
  const [progress, setProgress] = useState(null);    // progression du cours sélectionné
  const [loading, setLoading] = useState(true);

  // ── 1er useEffect : charge les cours une seule fois au montage ─────────────
  useEffect(() => {
    getStudentCourses(token)
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // ── 2ème useEffect : recharge leçons + progression à chaque changement d'onglet ──
  useEffect(() => {
    if (!courses.length) return;
    const courseId = courses[selectedIndex]._id;
    setLoading(true);
    // Promise.all : leçons et progression chargées en parallèle
    Promise.all([getLessons(courseId, token), fetchProgress(courseId, token)])
      .then(([lessonsData, progressData]) => {
        setLessons(lessonsData);
        setProgress(progressData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedIndex, courses, token]);

  const courseName = courses[selectedIndex]?.title ?? `Cours ${selectedIndex + 1}`;

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="student-cours">
      <div className="cours-header">
        <div>
          <h1>Mes Cours</h1>
          <p>Module : {courseName}</p>
        </div>
        <span className="cours-season">AW 2026</span>
      </div>

      {/* Onglets : un par cours assigné à l'étudiant */}
      <div className="cours-tabs">
        {courses.map((course, i) => (
          <button
            key={course._id}
            className={`cours-tab ${selectedIndex === i ? "active" : ""}`}
            onClick={() => setSelectedIndex(i)}
          >
            {course.title}
          </button>
        ))}
      </div>

      <div className="cours-body">
        <div className="cours-title-row">
          <h2>{courseName}</h2>
          {progress && (
            <p className="cours-meta">
              {progress.totalLessons} leçons · AW 2026
            </p>
          )}
        </div>

        {/* Anneau de progression SVG + typographie XXL du cours sélectionné */}
        {progress && (
          <div className="cours-progress-row">
            <div
              className="progress-ring"
              style={{ "--pct": progress.progressPercent }}
            >
              <svg viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="42" />
                <circle className="ring-fill" cx="50" cy="50" r="42" />
              </svg>
              <span className="progress-ring-value">
                {progress.progressPercent}%
              </span>
            </div>
            <span className="cours-progress-label">
              {progress.completedLessons}/{progress.totalLessons} leçons
              complétées
            </span>
          </div>
        )}

        {loading && <p className="cours-state">Chargement…</p>}

        {!loading && lessons.length === 0 && (
          <p className="cours-state">Aucune leçon disponible.</p>
        )}

        {/* Liste des leçons disponibles (déjà structurée comme des cartes) */}
        {!loading && lessons.length > 0 && (
          <div className="lessons-list">
            {lessons.map((lesson, i) => (
              <CourseCard
                key={lesson._id}
                index={i}
                featured={i === 0}
                number={String(i + 1).padStart(2, "0")}
                title={lesson.title}
                date={new Date(lesson.availableFrom).toLocaleDateString("fr-FR")}
                status="Disponible"
                // On passe courseName en state pour l'afficher sur la page leçon
                onOpen={() =>
                  navigate(`/dashboard/cours/${lesson._id}`, {
                    state: { courseName },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCours;