import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'
import Quiz from '../models/Quiz.js'
import Attempt from '../models/Attempt.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { validate, submitAttemptSchema } from '../middleware/validate.js'
import mongoose from 'mongoose'


const router = Router()

// ─── GET /api/student/courses ─────────────────────────────────────────────────
// Retourne les cours de l'étudiant connecté avec leurs leçons
router.get('/courses', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'courses',
      populate: { path: 'lessons', select: 'title availableFrom' }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.courses)
  } catch (err) {
    next(err)
  }
})

router.get('/lessons', verifyToken, async (req, res) => {
    try {
        const { courseId } = req.query
        const lessons = await Lesson.find({
            courseId,
            availableFrom: { $lte: Date.now() }
        })
        res.json(lessons)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.get('/lessons/:id', verifyToken, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
        if (lesson.availableFrom > Date.now()) {
            return res.status(403).json({ error: 'Lesson not available yet' })
        }
        res.json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.get('/lessons/:id/quiz', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lesson: req.params.id })
      .select('-questions.correctIndexes')
    if (!quiz) return res.status(404).json({ error: 'No quiz for this lesson' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/quizzes/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctIndexes')
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/quizzes/submit', verifyToken, validate(submitAttemptSchema), async (req, res) => {
  try {
    const { quizId, answers } = req.body
    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Nombre de réponses incorrect' })
    }
    let correct = 0
    const results = quiz.questions.map((q, i) => {
      const isCorrect = q.correctIndexes.includes(answers[i])
      if (isCorrect) correct++
      return { questionIndex: i, correct: isCorrect, correctIndexes: q.correctIndexes }
    })
    const score = Math.round((correct / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore
    const attempt = await Attempt.create({
      student: req.user.userId,
      quiz: quizId,
      answers,
      score,
      passed,
    })
    res.status(201).json({ score, passed, passingScore: quiz.passingScore, results, attempt })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/attempts', verifyToken, async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user.userId })
      .populate({ path: 'quiz', select: 'title lesson' })
      .sort({ attemptedAt: -1 })
    res.json(attempts)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/progress/:courseId', verifyToken, async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.userId)
    const courseId = new mongoose.Types.ObjectId(req.params.courseId)
    // Ne compte que les leçons déjà disponibles : sinon le total inclut des
    // leçons verrouillées que l'étudiant ne voit même pas dans sa liste,
    // ce qui rend la fraction affichée incohérente avec ce qu'il voit.
    const lessons = await Lesson.find({ courseId, availableFrom: { $lte: Date.now() } })
    const totalLessons = lessons.length
    if (totalLessons === 0) {
      return res.json({ courseId: req.params.courseId, totalLessons: 0, completedLessons: 0, progressPercent: 0 })
    }
    const lessonIds = lessons.map(l => l._id)
    const quizzes = await Quiz.find({ lesson: { $in: lessonIds } }).select('_id lesson')
    const quizIds = quizzes.map(q => q._id)
    const passedQuizzes = await Attempt.aggregate([
      { $match: { student: studentId, quiz: { $in: quizIds }, passed: true } },
      { $group: { _id: '$quiz' } },
    ])
    const completedLessons = passedQuizzes.length
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)
    res.json({ courseId: req.params.courseId, totalLessons, completedLessons, progressPercent })
  } catch (err) {
    next(err)
  }
})

router.get('/notifications', verifyToken, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ student: req.user.userId })
      .populate('lesson', 'title')
      .sort({ read: 1, sentAt: -1 })
    res.json(notifications)
  } catch (err) {
    next(err)
  }
})

router.patch('/notifications/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, student: req.user.userId },
      { read: true },
      { returnDocument: 'after' }
    )
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    res.json(notification)
  } catch (err) {
    next(err)
  }
})

export default router
