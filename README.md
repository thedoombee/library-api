# Library API

API REST de gestion d'une bibliothèque, développée avec Node.js, Express, Prisma et PostgreSQL. Le projet met en œuvre la gestion des auteurs, des livres, des utilisateurs, ainsi que le cycle des emprunts, avec authentification JWT et droits d'accès par rôle.

## Vue d'ensemble

Cette application expose une API backend pour :

- gérer les auteurs et les livres du catalogue ;
- enregistrer et authentifier des utilisateurs ;
- attribuer des rôles et permissions via un système RBAC ;
- créer, consulter et clôturer des prêts de livres ;
- sécuriser les endpoints avec un middleware d'authentification et de permission ;
- documenter l'API via Swagger UI.

## Stack technique

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Zod (validation des entrées)
- JWT (authentification)
- bcrypt (hashage des mots de passe)
- Jest + Supertest (tests unitaires et d'intégration)
- Helmet, CORS, express-rate-limit
- Swagger UI pour la documentation API

## Architecture

Le projet suit une structure simple et claire en couches :

```text
routes
  ↓
controllers
  ↓
services
  ↓
repositories
  ↓
Prisma / PostgreSQL
```

### Structure du projet

```text
src/
  app.js
  server.js
  config/
    database.js
    env.js
    swagger.js
  errors/
  middlewares/
  modules/
    authors/
    books/
    loans/
    users/
prisma/
  schema.prisma
  seed.js
  migrations/
  tests/
    helpers/
    integration/
    unit/
```

## Règles métier implémentées

### 1. Gestion des rôles et permissions

Le système est basé sur des rôles et des permissions stockés en base :

- MEMBER
- LIBRARIAN

Les permissions couvrent :

- création / mise à jour / suppression d'auteurs ;
- création / mise à jour / suppression de livres ;
- création d'un emprunt ;
- lecture des emprunts personnels ;
- lecture de tous les emprunts ;
- retour de ses propres emprunts ;
- retour de n'importe quel emprunt.

### 2. Limite de 3 emprunts actifs par utilisateur

Un utilisateur ne peut pas avoir plus de 3 prêts actifs en même temps.

La logique est vérifiée dans le service avant la création d'un nouveau prêt :

```js
const activeLoansCount = await loanRepository.ActiveUserLoans(userId);
if (activeLoansCount >= MAX_ACTIVE_LOANS_PER_USER) {
  throw new ConflictError(...);
}
```

### 3. Décrémentation atomique du stock

Lors de la création d'un prêt, le stock du livre est vérifié et décrémenté au sein d'une transaction Prisma pour éviter les incohérences concurrentes.

### 4. Retour d'un emprunt

Lorsqu'un emprunt est retourné :

- le statut passe à `RETURNED` ;
- la date de retour est enregistrée ;
- le nombre de copies disponibles du livre est incrémenté.

## Concurrence et robustesse

Un point central du projet est la gestion d'une race condition sur le stock des livres.

Avant la correction, le schéma de logique classique était :

1. lire le nombre de copies disponibles ;
2. vérifier si le stock est positif ;
3. décrémenter le stock.

Ce modèle est vulnérable aux accès simultanés : plusieurs requêtes peuvent passer le contrôle avant que la mise à jour ne soit faite.

Dans le code actuel, la création d'un prêt est effectuée dans une transaction Prisma avec une mise à jour conditionnelle :

```js
const updateResult = await tx.book.updateMany({
  where: { id: bookId, availableCopies: { gt: 0 } },
  data: { availableCopies: { decrement: 1 } },
});
```

Cette approche rend la vérification et la décrémentation atomiques : la base applique la condition au moment de l'écriture. Si plusieurs requêtes arrivent en même temps, seule une d'entre elles peut réduire le stock, tandis que les autres échouent proprement avec un conflit métier.

Le script de démonstration a montré le comportement attendu : pour 10 requêtes concurrentes, il y a eu 1 succès et 9 conflits.

## Configuration et variables d'environnement

Le projet exige une configuration environnementale valide. La validation est faite dans [src/config/env.js](src/config/env.js) avec Zod.

### Variables attendues

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/library_api?schema=public"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/library_api_test?schema=public"
JWT_SECRET="une_clé_très_longue_et_sécurisée_min_32_chars"
PORT=3000
NODE_ENV=development
TOKEN_EXPIRATION="1h"
```

### Points importants

- `DATABASE_URL` est utilisée pour l'environnement standard ;
- `DATABASE_URL_TEST` est utilisée automatiquement lorsque `NODE_ENV=test` ;
- `JWT_SECRET` doit être suffisamment long pour garantir la sécurité des tokens ;
- `TOKEN_EXPIRATION` est un format de durée compatible avec la configuration du projet.

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd library-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet avec les variables décrites ci-dessus.

### 4. Initialiser la base PostgreSQL

```bash
npx prisma migrate dev
```

### 5. Peupler les données de base

Le projet contient un script de seed qui crée :

- les permissions ;
- les rôles MEMBER et LIBRARIAN ;
- deux comptes utilisateurs de démonstration ;
- un auteur et un livre d'exemple.

```bash
npm run prisma:seed
```

### 6. Lancer l'application

```bash
npm run dev
```

Le serveur démarre sur le port configuré dans `PORT` ou sur le port par défaut du projet.

## Vérification de l'état de santé

Une route dédiée est exposée pour vérifier que le service est bien démarré :

```http
GET /health
```

Réponse attendue :

```json
{ "status": "ok" }
```

## Tests

Le projet contient des tests unitaires et d'intégration :

- `tests/unit/`
- `tests/integration/`

### Lancer les tests

```bash
npm test
```

### Générer un rapport de couverture

```bash
npm run test:coverage
```

## Documentation API

La documentation Swagger est exposée sur :

```text
/api-docs
```

Elle documente les endpoints principaux pour :

- auteurs ;
- livres ;
- utilisateurs ;
- prêts.

## Authentification

Les endpoints protégés utilisent un token JWT dans le header `Authorization` :

```http
Authorization: Bearer <token>
```

Le middleware d'authentification vérifie :

- présence du header ;
- format du bearer token ;
- validité du JWT ;
- existence de l'utilisateur ;
- récupération des permissions associées.

## Endpoints principaux

### Utilisateurs

- `POST /users/register`
- `POST /users/login`

### Auteurs

- `POST /authors`
- `GET /authors`
- `GET /authors/:id`
- `PATCH /authors/:id`
- `DELETE /authors/:id`

### Livres

- `POST /books`
- `GET /books`
- `GET /books/:id`
- `PATCH /books/:id`
- `DELETE /books/:id`

### Emprunts

- `POST /loans`
- `GET /loans`
- `PATCH /loans/:id/return`

## Points d'amélioration

Le projet est solide comme base backend d'apprentissage et de mise en pratique, mais plusieurs améliorations restent pertinentes :

- renforcer la contrainte côté base pour limiter le nombre d'emprunts actifs par utilisateur de façon encore plus stricte ;
- optimiser les vérifications d'auteurs lors de la création d'un livre, notamment pour éviter une logique trop dépendante d'appels multiples ;
- ajouter une gestion de tokens de rafraîchissement plutôt qu'un JWT à expiration fixe ;
- consolider la couverture de tests sur les cas de bord, notamment les scénarios de concurrence et d'autorisations complexes.

## Conclusion

Cette API constitue une base claire et cohérente pour une application de gestion de bibliothèque en Node.js, en combinant :

- architecture modulaire ;
- validation forte des entrées ;
- droits par rôle ;
- sécurité des opérations critiques ;
- conformité avec les bonnes pratiques backend du développement d'API REST.
