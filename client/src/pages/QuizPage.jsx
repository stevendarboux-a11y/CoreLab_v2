import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getQuiz, submitQuiz } from "../api/student";
import "./QuizPage.css";

function QuizPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getQuiz(quizId, token)
        .then((data) => {
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setLoading(false);
    })
    .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    }, [quizId]);
    
    function handleAnswer(questionIndex, choiceIndex) {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = choiceIndex;
        setAnswers(newAnswers);
    }
    
    async function handleSubmit() {
        if (answers.includes(null)) {
            alert("Veuillez répondre à toutes les questions !");
            return;
        }
        setSubmitting(true);
        try {
            const data = await submitQuiz(quizId, answers, token);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }
    
    if (loading) return <div className="quiz-loading">Chargement du quiz...</div>;
    if (error) return <div className="quiz-error">{error}</div>;

    // Écran résultat
    if (result) {
        return (
            <div className="quiz-container">
                <div className={`quiz-result ${result.passed ? "passed" : "failed"}`}>
                    <div className="result-icon">{result.passed ? "✅" : "❌"}</div>
                        <h2>{result.passed ? "Quiz réussi !" : "Quiz échoué"}</h2>
                        <div className="result-score">
                            <span className="score-number">{result.score}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                        <p>Seuil de réussite : {result.passingScore} / 100</p>
                        <div className="result-details">
                            {result.results.map((r, i) => (
                                <div key={i} className={`result-row ${r.correct ? "correct" : "incorrect"}`}>
                                    <span>{r.correct ? "✓" : "✗"}</span>
                                    <span>Question {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    <button className="quiz-btn" onClick={() => navigate(-1)}>
                        Retour aux leçons
                    </button>
                </div>
            </div>
        );
    }

  // Écran quiz
    return (
        <div className="quiz-container">
        <div className="quiz-header">
            <h1>{quiz.title}</h1>
            <div
              className="progress-ring progress-ring-sm"
              style={{
                "--pct": Math.round(
                  (answers.filter((a) => a !== null).length / quiz.questions.length) * 100
                ),
              }}
            >
              <svg viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="42" />
                <circle className="ring-fill" cx="50" cy="50" r="42" />
              </svg>
              <span className="progress-ring-value">
                {answers.filter((a) => a !== null).length}/{quiz.questions.length}
              </span>
            </div>
        </div>

        <div className="quiz-questions">
            {quiz.questions.map((q, qi) => (
            <div key={qi} className={`question-card ${answers[qi] !== null ? "answered" : ""}`}>
                <span className="question-number-watermark">{String(qi + 1).padStart(2, "0")}</span>
                <p className="question-prompt">{q.prompt}</p>
                <div className="choices">
                {q.choices.map((choice, ci) => (
                    <button
                    key={ci}
                    className={`choice-btn ${answers[qi] === ci ? "selected" : ""}`}
                    onClick={() => handleAnswer(qi, ci)}
                    >
                    <span className="choice-letter">
                        {String.fromCharCode(65 + ci)}
                    </span>
                    {choice}
                    </button>
                ))}
                </div>
            </div>
            ))}
        </div>

        <div className="quiz-footer">
            <button
            className="quiz-btn submit"
            onClick={handleSubmit}
            disabled={submitting || answers.includes(null)}
            >
            {submitting ? "Envoi en cours..." : "Soumettre mes réponses"}
            </button>
        </div>
        </div>
    );
}

export default QuizPage;