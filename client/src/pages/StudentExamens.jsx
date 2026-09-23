import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getStudentCourses, getLessonQuiz, getStudentAttempts } from "../api/student.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import "./StudentExamens.css";

function StudentExamens() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // ── États ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]); // leçons groupées par cours
  const [attempts, setAttempts] = useState([]); // historique des quiz passés
  const [loading, setLoading] = useState(true);
  // loadingQuiz stocke l'ID de la leçon en cours (pas un booléen)
  // → permet de désactiver uniquement le bouton cliqué, pas tous les boutons
  const [loadingQuiz, setLoadingQuiz] = useState(null);

  // ── Charge les cours ET les tentatives en parallèle ────────────────────────
  useEffect(() => {
    Promise.all([
      getStudentCourses(token),
      getStudentAttempts(token)
    ])
      .then(([coursesData, attemptsData]) => {
        setCourses(coursesData);
        setAttempts(attemptsData);
      })
      .catch(() => {
        // En cas d'erreur de chargement, on l'attrape pour ne pas casser l'interface
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // ── Au clic : cherche le quiz de la leçon puis redirige ────────────────────
  async function handleQuizClick(lessonId) {
    setLoadingQuiz(lessonId);
    try {
      const quiz = await getLessonQuiz(lessonId, token);
      
      const alreadyTaken = attempts.some((a) => a.quiz?._id === quiz._id);
      if (alreadyTaken) {
        alert("Vous avez déjà passé ce quiz.");
        setLoadingQuiz(null);
        return;
      }

      navigate(`/dashboard/quiz/${quiz._id}`);
    } catch {
      alert("Aucun quiz disponible pour cette leçon.");
      setLoadingQuiz(null);
    }
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="student-examens">
      <div className="examens-header">
        <h1>Mes Examens</h1>
        <p>Accédez aux quiz de vos leçons disponibles</p>
      </div>

      {loading && <p className="examens-state">Chargement…</p>}

      {!loading && courses.length === 0 && (
        <p className="examens-state">Aucun cours assigné.</p>
      )}

      {/* Une section par cours, avec ses leçons et le bouton quiz */}
      <div className="examens-list">
        {courses.map((course, ci) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: ci * 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="course-block"
          >
            <h2>{course.title}</h2>
            
            {!course.lessons || course.lessons.length === 0 ? (
              <p className="examens-state">Aucune leçon disponible.</p>
            ) : (
              course.lessons.map((lesson, li) => {
                const isAvailable = new Date(lesson.availableFrom) <= new Date();
                const attempt = attempts.find((a) => a.quiz?.lesson === lesson._id);
                const hasAttempted = !!attempt;

                return (
                  <div key={lesson._id} className="lesson-row">
                    <span className="lesson-num">{String(li + 1).padStart(2, "0")}</span>
                    <div className="lesson-row-info">
                      <p className="lesson-title">{lesson.title}</p>
                      {hasAttempted ? (
                        <small className="muted">
                          Quiz terminé ({attempt.score}%)
                        </small>
                      ) : isAvailable ? (
                        <small>Quiz disponible</small>
                      ) : (
                        <small className="muted">
                          Disponible le {new Date(lesson.availableFrom).toLocaleDateString("fr-FR")}
                        </small>
                      )}
                    </div>
                    {/* disabled si ce bouton précis est en chargement, si pas dispo ou déjà passé */}
                    <button
                      className="quiz-link-btn"
                      onClick={() => handleQuizClick(lesson._id)}
                      disabled={!isAvailable || hasAttempted || loadingQuiz === lesson._id}
                    >
                      {hasAttempted ? (
                        <>
                          <CheckCircle2 size={14} /> Déjà passé
                        </>
                      ) : !isAvailable ? (
                        <>
                          <Lock size={14} /> Verrouillé
                        </>
                      ) : loadingQuiz === lesson._id ? (
                        "…"
                      ) : (
                        <>
                          Passer le quiz <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default StudentExamens;