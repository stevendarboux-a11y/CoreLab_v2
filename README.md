# Corelab - LMS E-learning

> Plateforme de gestion de formations (Learning Management System) développée avec la stack MERN.

---

## Aperçu

<p align="center">
  <img src="client/public/vueglobale.png" alt="Vue globale de Corelab" width="100%">
</p>

<table>
  <tr>
    <td width="50%"><img src="client/public/dashadmin.png" alt="Dashboard administrateur" width="100%"></td>
    <td width="50%"><img src="client/public/dashetudiant-v2-luxe.png" alt="Dashboard étudiant - thème Haute Couture" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><em>Espace administrateur</em></td>
    <td align="center"><em>Espace étudiant — thème Haute Couture</em></td>
  </tr>
</table>

---

## 🆕 Nouveautés V2

> Cette V2 (frontend **et** backend : refonte UI, système de thèmes, animations, correctifs de sécurité et de logique serveur) a été développée en solo par [Arnold](https://github.com/stevendarboux-a11y), en fullstack.

L'espace étudiant a été entièrement repensé : direction éditoriale (Cormorant Garamond, cartes en verre dépoli, anneaux de progression SVG, numéros de leçon en filigrane) et animations fluides avec **Framer Motion**. Nouveauté principale : un **sélecteur de thème** permet à l'étudiant de basculer instantanément tout son espace vers un second univers visuel complet, **Streetwear Industrial** (Syne / Space Grotesk, ombres portées dures, bandeau défilant, effet crochets au survol) — sans jamais affecter l'espace admin, chaque thème étant scopé à `.student-layout[data-theme]`.

<table>
  <tr>
    <td width="50%"><img src="client/public/dashetudiant-v2-luxe.png" alt="Thème Haute Couture" width="100%"></td>
    <td width="50%"><img src="client/public/dashetudiant-v2-streetwear.png" alt="Thème Streetwear Industrial" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><em>Thème Haute Couture</em></td>
    <td align="center"><em>Thème Streetwear Industrial</em></td>
  </tr>
</table>

Autres évolutions de cette V2 :

- Refonte de la page de lecture de leçon en mise en page magazine (fil d'Ariane, article, panneau de progression sticky)
- Nouveaux composants `CourseCard` et `NotificationItem` animés, iconographie [Lucide](https://lucide.dev/)
- Correction de plusieurs fuites CSS entre l'espace admin et l'espace étudiant (variables et sélecteurs non scopés)
- Mise à jour de sécurité : `@tiptap/*` passé en 3.31.3 (0 vulnérabilité `npm audit`)
- Ajout de contenu de démo (nouvelles leçons et quiz) et correction d'un calcul de progression incohérent avec les leçons verrouillées

---

## Stack Technique

| Catégorie           | Technologies                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**        | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Backend**         | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)                                                                                                                                                                                                                        |
| **Base de données** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)                                                                                                                                                                                                                                                                                                                                 |
| **Auth**            | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)                                                                                                                                                                                                                        |
| **Tests**           | ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Supertest](https://img.shields.io/badge/Supertest-000000?style=for-the-badge&logo=node.js&logoColor=white)                                                                                                                                                                                                                             |
| **Infra**           | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)                                                                                                                                                                                                                                       |

---

## Prérequis

- Node.js v20+
- npm
- Docker & Docker Compose (optionnel, recommandé)

---

## Lancement avec Docker (recommandé)

Copie le fichier d'environnement et renseigne les valeurs :

```bash
cp .env.example .env
```

Lance l'application complète (backend, frontend, MongoDB) :

```bash
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend : http://localhost:4242
- Health check : http://localhost:4242/health

---

## Lancement sans Docker

### Variables d'environnement

**`server/.env`** (copier depuis `server/.env.example`) :

```
PORT=4242
MONGODB_URI=mongodb://localhost:27017/corelab
MONGODB_URI_TEST=mongodb://localhost:27017/corelab_test
JWT_SECRET=ton_secret_ici
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

**`client/.env`** (copier depuis `client/.env.example`) :

```
VITE_API_URL=http://localhost:4242/api
```

### Installation

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### Démarrage

```bash
# Backend (port 4242)
cd server && npm start

# Frontend (port 3000)
cd client && npm run dev
```

---

## Données de test

Un script de seed est disponible pour initialiser la base avec des données de test :

```bash
cd server && node scripts/seed.js
```

Comptes créés :

| Email             | Mot de passe | Rôle                          |
| ----------------- | ------------ | ----------------------------- |
| admin@corelab.dev | Admin1234!   | Administrateur                |
| bob@corelab.dev   | Student1234! | Étudiant                      |
| clara@corelab.dev | Student1234! | Étudiant (première connexion) |
| david@corelab.dev | Student1234! | Étudiant                      |
| emma@corelab.dev  | Student1234! | Étudiant                      |

---

## Tests

```bash
cd server && npm test
```

---

## Structure du projet

```
corelab/
├── client/          # Application React
│   ├── public/      # Assets statiques (logo, vidéo, captures)
│   ├── src/
│   └── .env.example
├── server/          # API Express
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── jobs/
│   ├── tests/
│   ├── scripts/
│   └── .env.example
├── docker-compose.yml
└── .env.example     # Variables pour Docker
```

---

## Suivi de projet

- 📋 Tableau Trello : [core-lab-user-stories](https://trello.com/b/8UYHwIST/core-lab-user-stories)
- 🗄️ Schéma BDD : [dbdiagram.io](https://dbdiagram.io/d/6a2bd5d65c789b8acb6ddb74)

---

## Équipe

|                                                                                                        | Membre                                          | Rôle                           |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------ |
| <img src="https://github.com/noemie-ta-ma.png" width="32" height="32" style="border-radius:50%">       | [Noémie](https://github.com/noemie-ta-ma)       | Backend & Infra                |
| <img src="https://github.com/dalobaminthe.png" width="32" height="32" style="border-radius:50%">       | [Daloba](https://github.com/dalobaminthe)       | Fullstack                      |
| <img src="https://github.com/stevendarboux-a11y.png" width="32" height="32" style="border-radius:50%"> | [Arnold](https://github.com/stevendarboux-a11y) | Frontend (V1) · Fullstack (V2) |
