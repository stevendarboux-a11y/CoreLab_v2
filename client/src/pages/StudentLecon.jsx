import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getLesson, getLessons, getLessonQuiz, fetchProgress } from "../api/student.js";
import "./StudentLecon.css";

function StudentLecon() {
  // useParams : lit le :lessonId dans l'URL /dashboard/cours/:lessonId
  const { lessonId } = useParams();
  const navigate = useNavigate();
  // useLocation : récupère les données passées en navigation (courseName)
  const location = useLocation();
  const { token } = useAuth();

  // ── États ──────────────────────────────────────────────────────────────────
  const [lesson, setLesson] = useState(null);           // contenu de la leçon
  const [courseLessons, setCourseLessons] = useState([]); // toutes les leçons du cours (sidebar)
  const [completedCount, setCompletedCount] = useState(0); // leçons déjà complétées dans ce cours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // courseName transmis via navigate(..., { state }) depuis StudentCours
  const courseName = location.state?.courseName ?? "Mes Cours";

  // ── Chargement séquentiel : leçon d'abord, puis leçons + progression du cours ──
  // On ne peut pas tout paralléliser : getLessons/fetchProgress ont besoin de
  // lesson.courseId, qui n'est connu qu'après la réponse de getLesson
  useEffect(() => {
    setLoading(true);
    getLesson(lessonId, token)
      .then((lessonData) => {
        setLesson(lessonData);
        return Promise.all([
          getLessons(lessonData.courseId, token),
          fetchProgress(lessonData.courseId, token),
        ]);
      })
      .then(([lessonsData, progressData]) => {
        setCourseLessons(lessonsData);
        setCompletedCount(progressData.completedLessons);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [lessonId, token]);

  // ── Récupère le quiz de cette leçon puis navigue vers la page quiz ─────────
  async function handleQuizClick() {
    setLoadingQuiz(true);
    try {
      const quiz = await getLessonQuiz(lessonId, token);
      navigate(`/dashboard/quiz/${quiz._id}`);
    } catch {
      alert("Aucun quiz disponible pour cette leçon.");
    } finally {
      setLoadingQuiz(false);
    }
  }

  if (loading) return <div className="lecon-state">Chargement…</div>;
  if (error) return <div className="lecon-state lecon-error">{error}</div>;
  if (!lesson) return null;

  // Position de la leçon actuelle dans la liste (pour prev/next et numérotation)
  const currentIndex = courseLessons.findIndex((l) => l._id === lessonId);
  const prevLesson = courseLessons[currentIndex - 1];
  const nextLesson = courseLessons[currentIndex + 1];

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="student-lecon">
      {/* Fil d'Ariane & Saison */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lecon-breadcrumb-row"
      >
        <div className="lecon-breadcrumb">
          <span>MODULE</span>
          <ChevronRight size={14} />
          <span className="lecon-breadcrumb-course">{courseName.toUpperCase()}</span>
          <ChevronRight size={14} />
          <span className="lecon-breadcrumb-current">
            LEÇON {String(currentIndex + 1).padStart(2, "0")}
          </span>
        </div>
        <span className="lecon-season">AW 2026</span>
      </motion.div>

      <div className="lecon-body">
        {/* Colonne de gauche : contenu de la leçon, style article ── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lecon-content"
        >
          <header className="lecon-content-header">
            <span className="lecon-eyebrow">
              Atelier d'étude · Chapitre {currentIndex + 1}
            </span>
            <h1>{lesson.title}</h1>
          </header>

          {/* dangerouslySetInnerHTML : injecte le HTML stocké en base directement */}
          <div
            className="lecon-html"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </motion.article>

        {/* Colonne de droite : progression, QCM, navigation ── */}
        <aside className="lecon-sidebar">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sidebar-module"
          >
            <h3>Progression du module</h3>
            {courseLessons.map((l, i) => (
              <div
                key={l._id}
                className={`module-item ${l._id === lessonId ? "current" : ""} ${i < completedCount ? "done" : ""}`}
                data-num={String(i + 1).padStart(2, "0")}
                onClick={() =>
                  navigate(`/dashboard/cours/${l._id}`, {
                    state: { courseName },
                  })
                }
              >
                <span className="module-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="module-title">{l.title}</span>
                {i < completedCount && (
                  <CheckCircle2 size={16} className="module-done-icon" />
                )}
              </div>
            ))}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lecon-quiz-btn"
            onClick={handleQuizClick}
            disabled={loadingQuiz}
          >
            <span>{loadingQuiz ? "…" : "Passer le QCM du module"}</span>
            {!loadingQuiz && <ArrowRight size={18} />}
          </motion.button>

          {/* Navigation précédente / suivante */}
          <div className="lecon-nav">
            <button
              className="nav-btn"
              onClick={() =>
                navigate(`/dashboard/cours/${prevLesson._id}`, {
                  state: { courseName },
                })
              }
              disabled={!prevLesson}
            >
              <ArrowLeft size={14} /> Leçon préc.
            </button>
            <button
              className="nav-btn"
              onClick={() =>
                navigate(`/dashboard/cours/${nextLesson._id}`, {
                  state: { courseName },
                })
              }
              disabled={!nextLesson}
            >
              Leçon suiv. <ArrowRight size={14} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default StudentLecon;
