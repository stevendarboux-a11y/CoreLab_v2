import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

import User from '../src/models/User.js'
import Course from '../src/models/Course.js'
import Lesson from '../src/models/Lesson.js'
import Quiz from '../src/models/Quiz.js'
import Attempt from '../src/models/Attempt.js'
import Notification from '../src/models/Notification.js'

const BCRYPT_ROUNDS = 10

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  // Nettoyage
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany(),
    Attempt.deleteMany(),
    Notification.deleteMany(),
  ])
  console.log('Collections nettoyées')

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS)
  const studentHash = await bcrypt.hash('Student1234!', BCRYPT_ROUNDS)

  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@corelab.dev',
    passwordHash: adminHash,
    role: 'admin',
    isFirstLogin: false,
  })

  const [bob, clara, david, emma] = await User.insertMany([
    {
      name: 'Bob Étudiant',
      email: 'bob@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
    {
      name: 'Clara Étudiante',
      email: 'clara@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: true, // première connexion pas encore faite
    },
    {
      name: 'David Martin',
      email: 'david@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
    {
      name: 'Emma Petit',
      email: 'emma@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
  ])
  console.log('Users créés')

  // ─── Courses ──────────────────────────────────────────────────────────────
  const [courseHistoire, courseStylisme, courseTextile] = await Course.insertMany([
    {
      title: 'Histoire de la Mode Contemporaine',
      description: 'Découvrez l\'évolution des silhouettes et les grands créateurs du XXe siècle.',
      createdBy: admin._id,
      students: [bob._id, david._id],
    },
    {
      title: 'Stylisme & Création',
      description: 'Apprenez à développer une collection, du moodboard au croquis de mode.',
      createdBy: admin._id,
      students: [bob._id, clara._id, david._id],
    },
    {
      title: 'Textile & Matières',
      description: 'Comprendre les fibres naturelles et synthétiques, et les enjeux éco-responsables.',
      createdBy: admin._id,
      students: [emma._id],
    },
  ])

  // Mise à jour des cours dans les users
  await User.findByIdAndUpdate(bob._id, { courses: [courseHistoire._id, courseStylisme._id] })
  await User.findByIdAndUpdate(clara._id, { courses: [courseStylisme._id] })
  await User.findByIdAndUpdate(david._id, { courses: [courseHistoire._id, courseStylisme._id] })
  await User.findByIdAndUpdate(emma._id, { courses: [courseTextile._id] })
  console.log('Courses créés')

  // ─── Lessons ──────────────────────────────────────────────────────────────
  const day = 1000 * 60 * 60 * 24
  const [
    lessonAnnées20,
    lessonDior,
    lessonAnnées60,
    lessonCroquis,
    lessonMoodboard,
    lessonMatieres,
    lessonFibres,
    lessonInnovants,
    lessonEntretien,
  ] = await Lesson.insertMany([
    {
      title: 'Les années 20 : La libération',
      content: '<h1>Les Années 20</h1><p>Les silhouettes se raccourcissent, le corset disparaît.</p><p>C\'est l\'ère des <strong>garçonnes</strong> et de la libération du corps de la femme, menée par des créatrices comme Coco Chanel et Madeleine Vionnet.</p>',
      courseId: courseHistoire._id,
      availableFrom: new Date(Date.now() - day * 7), // disponible depuis 7 jours
    },
    {
      title: 'L\'après-guerre : Le New Look',
      content: '<h1>Le New Look</h1><p>Créé par <strong>Christian Dior</strong> en 1947, en réaction aux années de privation.</p><p>Il se caractérise par une taille très marquée, des épaules douces et des jupes corolles très amples.</p>',
      courseId: courseHistoire._id,
      availableFrom: new Date(Date.now() + day * 2), // pas encore dispo (dans 2 jours)
    },
    {
      title: 'Les années 60 : La révolution Mod',
      content: '<h1>Les Années 60 : La Révolution Mod</h1><p>Portée par <strong>Mary Quant</strong> à Londres, la minijupe bouleverse les codes et symbolise l\'émancipation de la jeunesse.</p><p>Le mouvement <strong>Mod</strong> puise son inspiration dans le Pop Art, avec des formes géométriques, des couleurs vives et des matières synthétiques comme le PVC.</p>',
      courseId: courseHistoire._id,
      availableFrom: new Date(Date.now() - day * 1),
    },
    {
      title: 'Les bases du croquis de mode',
      content: '<h1>Le Croquis</h1><p>La figurine de mode standard est allongée et mesure généralement <strong>9 têtes</strong>.</p><p>Elle sert de base pour exprimer l\'attitude et le tombé du vêtement.</p>',
      courseId: courseStylisme._id,
      availableFrom: new Date(Date.now() - day * 5),
    },
    {
      title: 'Créer un moodboard',
      content: '<h1>Le Moodboard</h1><p>Aussi appelé planche de tendance, il rassemble images, textures, couleurs et mots-clés.</p><p>Il sert de fil conducteur visuel pour toute la collection.</p>',
      courseId: courseStylisme._id,
      availableFrom: new Date(Date.now() - day * 2),
    },
    {
      title: 'Choisir ses matières et sa palette couleur',
      content: '<h1>Matières et Palette Couleur</h1><p>Le choix des <strong>matières</strong> détermine le tombé, la texture et l\'usage final du vêtement.</p><p>La <strong>palette couleur</strong> d\'une collection raconte une histoire : elle doit rester cohérente du moodboard jusqu\'au défilé.</p>',
      courseId: courseStylisme._id,
      availableFrom: new Date(Date.now() - day * 1),
    },
    {
      title: 'Les fibres naturelles vs synthétiques',
      content: '<h1>Les Fibres</h1><p>Les fibres naturelles (coton, lin, soie, laine) proviennent de sources végétales ou animales.</p><p>Les fibres synthétiques (polyester, nylon) sont issues de la pétrochimie.</p>',
      courseId: courseTextile._id,
      availableFrom: new Date(Date.now() - day * 3),
    },
    {
      title: 'Les textiles innovants et éco-responsables',
      content: '<h1>Textiles Innovants et Éco-responsables</h1><p>De nouvelles fibres comme le <strong>Tencel</strong> (à base de pulpe de bois) ou le coton biologique réduisent l\'impact environnemental de la production textile.</p><p>Le <strong>polyester recyclé</strong>, issu de bouteilles plastiques, gagne aussi du terrain dans l\'industrie de la mode.</p>',
      courseId: courseTextile._id,
      availableFrom: new Date(Date.now() - day * 2),
    },
    {
      title: 'Entretien et durabilité des textiles',
      content: '<h1>Entretien et Durabilité</h1><p>Bien lire une <strong>étiquette d\'entretien</strong> permet de prolonger la durée de vie d\'un vêtement et de limiter son impact écologique.</p><p>Un lavage à basse température et un séchage à l\'air libre réduisent l\'usure des fibres.</p>',
      courseId: courseTextile._id,
      availableFrom: new Date(Date.now() - day * 1),
    },
  ])

  // Mise à jour des leçons dans les cours
  await Course.findByIdAndUpdate(courseHistoire._id, { lessons: [lessonAnnées20._id, lessonDior._id, lessonAnnées60._id] })
  await Course.findByIdAndUpdate(courseStylisme._id, { lessons: [lessonCroquis._id, lessonMoodboard._id, lessonMatieres._id] })
  await Course.findByIdAndUpdate(courseTextile._id, { lessons: [lessonFibres._id, lessonInnovants._id, lessonEntretien._id] })
  console.log('Lessons créées')

  // ─── Quizzes ──────────────────────────────────────────────────────────────
  const [
    quizHistoire,
    quizNewLook,
    quizAnnées60,
    quizStylisme,
    quizMoodboard,
    quizMatieres,
    quizTextile,
    quizInnovants,
    quizEntretien,
  ] = await Quiz.insertMany([
    {
      title: 'Quiz - Les Années 20',
      lesson: lessonAnnées20._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Quelle créatrice est souvent associée à la silhouette des "garçonnes" ?',
          choices: ['Jeanne Lanvin', 'Elsa Schiaparelli', 'Coco Chanel', 'Christian Dior'],
          correctIndexes: [2],
        },
        {
          prompt: 'Quel sous-vêtement féminin contraignant disparaît massivement dans les années 20 ?',
          choices: ['Le jupon', 'Le corset', 'La crinoline', 'Le soutien-gorge'],
          correctIndexes: [1],
        },
        {
          prompt: 'Comment s\'appelle la fameuse petite robe noire inventée en 1926 ?',
          choices: ['La robe Ford', 'La robe Cocktail', 'La robe New Look', 'La robe de Bal'],
          correctIndexes: [0], // Optionnel: un petit challenge historique
        },
      ],
    },
    {
      title: 'Quiz - Le New Look',
      lesson: lessonDior._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Qui a créé le New Look ?',
          choices: ['Coco Chanel', 'Christian Dior', 'Yves Saint Laurent', 'Elsa Schiaparelli'],
          correctIndexes: [1],
        },
        {
          prompt: 'En quelle année le New Look est-il créé ?',
          choices: ['1920', '1937', '1947', '1957'],
          correctIndexes: [2],
        },
        {
          prompt: 'Le New Look est une réaction à quoi ?',
          choices: ['Aux années de privation de la guerre', 'Au mouvement punk', 'À la crise de 1929', 'Aux tendances japonaises'],
          correctIndexes: [0],
        },
        {
          prompt: 'Quelles caractéristiques retrouve-t-on dans le New Look ? (plusieurs choix)',
          choices: ['Une taille très marquée', 'Des épaules larges et carrées', 'Des épaules douces', 'Des jupes corolles très amples'],
          correctIndexes: [0, 2, 3],
        },
      ],
    },
    {
      title: 'Quiz - Les Années 60',
      lesson: lessonAnnées60._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Qui popularise la minijupe dans les années 60 ?',
          choices: ['Mary Quant', 'Coco Chanel', 'Vivienne Westwood', 'Elsa Schiaparelli'],
          correctIndexes: [0],
        },
        {
          prompt: 'Quel mouvement artistique influence la mode Mod ?',
          choices: ['Le Cubisme', 'Le Pop Art', 'Le Surréalisme', 'L\'Impressionnisme'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quelle matière synthétique devient emblématique de cette période ?',
          choices: ['Le lin', 'Le PVC', 'La laine', 'Le cachemire'],
          correctIndexes: [1],
        },
      ],
    },
    {
      title: 'Quiz - Croquis de mode',
      lesson: lessonCroquis._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Combien de "têtes" mesure généralement une figurine de mode standard pour allonger la silhouette ?',
          choices: ['6 têtes', '9 têtes', '12 têtes', '7.5 têtes'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quel est l\'objectif principal du croquis de mode ?',
          choices: ['Faire un portrait réaliste', 'Montrer l\'attitude et le vêtement', 'Créer un patron technique', 'Décorer un atelier'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quels éléments retrouve-t-on souvent sur un croquis abouti ? (plusieurs choix)',
          choices: ['Les ombres et lumières', 'Des échantillons de tissu', 'Le tombé du vêtement', 'Le prix de vente'],
          correctIndexes: [0, 1, 2],
        },
      ],
    },
    {
      title: 'Quiz - Le Moodboard',
      lesson: lessonMoodboard._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Comment appelle-t-on aussi le moodboard ?',
          choices: ['Le patron de base', 'La planche de tendance', 'Le cahier des charges', 'Le book de portfolio'],
          correctIndexes: [1],
        },
        {
          prompt: 'Que rassemble un moodboard ? (plusieurs choix)',
          choices: ['Des images', 'Des textures', 'Le prix de vente final', 'Des couleurs et mots-clés'],
          correctIndexes: [0, 1, 3],
        },
        {
          prompt: 'Quel est le rôle principal du moodboard dans une collection ?',
          choices: ['Servir de fil conducteur visuel', 'Remplacer le croquis technique', 'Calculer les coûts de production', 'Servir de facture client'],
          correctIndexes: [0],
        },
      ],
    },
    {
      title: 'Quiz - Matières et Couleurs',
      lesson: lessonMatieres._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Qu\'est-ce qui détermine le tombé d\'un vêtement ?',
          choices: ['Le prix', 'La matière choisie', 'La marque', 'La taille de l\'étiquette'],
          correctIndexes: [1],
        },
        {
          prompt: 'Pourquoi la palette couleur d\'une collection doit-elle rester cohérente ?',
          choices: ['Pour réduire les coûts', 'Pour raconter une histoire cohérente', 'Par obligation légale', 'Ce n\'est pas nécessaire'],
          correctIndexes: [1],
        },
      ],
    },
    {
      title: 'Quiz - Fibres Textiles',
      lesson: lessonFibres._id,
      passingScore: 70,
      questions: [
        {
          prompt: 'Parmi ces fibres, laquelle est d\'origine animale ?',
          choices: ['Le coton', 'La soie', 'Le lin', 'Le polyester'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quelle fibre est issue de la pétrochimie ?',
          choices: ['Polyester', 'Laine', 'Chanvre', 'Viscose'],
          correctIndexes: [0],
        },
      ],
    },
    {
      title: 'Quiz - Textiles Innovants',
      lesson: lessonInnovants._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'À partir de quoi est fabriqué le Tencel ?',
          choices: ['Du pétrole', 'De la pulpe de bois', 'Des coquillages', 'Des algues'],
          correctIndexes: [1],
        },
        {
          prompt: 'D\'où provient le polyester recyclé couramment utilisé en mode ?',
          choices: ['Des bouteilles plastiques', 'Du coton usagé', 'De la laine recyclée', 'Du chanvre'],
          correctIndexes: [0],
        },
      ],
    },
    {
      title: 'Quiz - Entretien Textile',
      lesson: lessonEntretien._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Que permet de prolonger un bon entretien du vêtement ?',
          choices: ['Sa durée de vie', 'Son prix de vente', 'Sa couleur d\'origine uniquement', 'Rien de particulier'],
          correctIndexes: [0],
        },
        {
          prompt: 'Quelle pratique réduit l\'usure des fibres ?',
          choices: ['Lavage à haute température', 'Séchage en machine systématique', 'Lavage à basse température', 'Repassage quotidien'],
          correctIndexes: [2],
        },
      ],
    },
  ])
  console.log('Quizzes créés')

  // ─── Attempts ─────────────────────────────────────────────────────────────
  // Bob : a réussi le quiz Histoire (100%) et le quiz Stylisme (réussi de justesse)
  // David : a échoué le quiz Histoire puis l'a repassé avec succès
  await Attempt.insertMany([
    {
      student: bob._id,
      quiz: quizHistoire._id,
      answers: [2, 1, 0], // toutes correctes → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 4),
    },
    {
      student: bob._id,
      quiz: quizStylisme._id,
      answers: [1, 1, 2], // Q3 incomplète → 2/3 ≈ 67%
      score: 67,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 1),
    },
    {
      student: david._id,
      quiz: quizHistoire._id,
      answers: [0, 0, 3], // tout faux → 0%
      score: 0,
      passed: false,
      attemptedAt: new Date(Date.now() - day * 3),
    },
    {
      student: david._id,
      quiz: quizHistoire._id,
      answers: [2, 1, 0], // rattrapage réussi → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 2),
    },
    // Emma : première activité sur ses nouveaux quiz Textile
    {
      student: emma._id,
      quiz: quizTextile._id,
      answers: [1, 0], // toutes correctes → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 2),
    },
    {
      student: emma._id,
      quiz: quizInnovants._id,
      answers: [1, 0], // toutes correctes → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 1),
    },
  ])
  console.log('Attempts créés')

  // ─── Notifications ────────────────────────────────────────────────────────
  await Notification.insertMany([
    {
      student: bob._id,
      lesson: lessonAnnées20._id,
      message: 'La leçon "Les années 20 : La libération" est maintenant disponible.',
      read: true,
      type: 'lesson',
    },
    {
      student: bob._id,
      lesson: lessonMoodboard._id,
      message: 'La leçon "Créer un moodboard" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: clara._id,
      lesson: lessonCroquis._id,
      message: 'La leçon "Les bases du croquis de mode" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: david._id,
      lesson: lessonMoodboard._id,
      message: 'La leçon "Créer un moodboard" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: bob._id,
      lesson: lessonAnnées60._id,
      message: 'La leçon "Les années 60 : La révolution Mod" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: emma._id,
      lesson: lessonInnovants._id,
      message: 'La leçon "Les textiles innovants et éco-responsables" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: emma._id,
      lesson: lessonEntretien._id,
      message: 'La leçon "Entretien et durabilité des textiles" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
  ])
  console.log('Notifications créées')

  console.log('\n✅ Seed terminé !')
  console.log('  admin@corelab.dev     → Admin1234!')
  console.log('  bob@corelab.dev       → Student1234! (2 cours, progression avancée)')
  console.log('  clara@corelab.dev     → Student1234! (isFirstLogin: true)')
  console.log('  david@corelab.dev     → Student1234! (a échoué puis rattrapé un quiz)')
  console.log('  emma@corelab.dev      → Student1234! (cours Textile)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  mongoose.disconnect()
  process.exit(1)
})