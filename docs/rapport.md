## Introduction

Dans ce projet, on a exploré plusieurs aspects de MongoDB : le déploiement en standalone, la configuration d’un Replica Set, et l’intégration avec une application Node.js. L’objectif était autant technique que pédagogique : comprendre comment fonctionnent les bases de données NoSQL, comment les manipuler, et surtout comment les connecter à une application réelle. Voici un retour sur notre démarche, nos choix, et ce que ça nous a appris.

---

# Partie 1 – MongoDB Standalone

## Déploiement de MongoDB en mode standalone

Pour commencer le projet, on a décidé de partir sur un déploiement simple avec une seule instance MongoDB. Le but, c'était d’avoir un environnement simple et minimal pour bien comprendre comment fonctionne l’installation de base et comment sécuriser les accès.


## Mise en place avec Docker Compose

On a choisi d’utiliser Docker Compose pour déployer MongoDB rapidement, sans rien installer en local. Voici le fichier qu’on a mis dans *``mongo/standalone``* :


```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6.0
    container_name: mongo-standalone
    ports:
      - 27017:27017
    volumes:
      - ./data:/data/db
      - ./init:/docker-entrypoint-initdb.d
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    restart: unless-stopped
```

## Script d'initialisation init.js

Dans le dossier ``init/``, on a ajouté un petit script ``init.js`` qui se lance au premier boot. Il sert à :
- Créer une base de données testdb
- Créer un utilisateur testuser avec mot de passe testpass
- Lui donner les droits readWrite uniquement sur testdb
- Et insérer 3 documents dans une collection testcollection

```js
db = db.getSiblingDB("testdb");

db.createUser({
  user: "testuser",
  pwd: "testpass",
  roles: [{ role: "readWrite", db: "testdb" }]
});

db.testcollection.insertMany([
  { name: "Hugo", age: 30 },
  { name: "Matt", age: 25 },
  { name: "Thomas", age: 75 }
]);
```
## Connexion à la base avec mongoSH

Pour se connecter et tester des commandes, on a utilisé ``mongosh``, le shell MongoDB.

On a téléchargé la version zip depuis le site officiel, puis on a lancé mongosh.exe dans le terminal.
#### Connexion à la base avec les identifiants admin :

```bash
mongosh "mongodb://admin:admin123@localhost:27017" --authenticationDatabase admin
```

```bash
use testdb
db.auth("testuser", "testpass")
```


## Requêtes exécutées

On a essayé plusieurs requêtes Mongo classiques :

### Lire tous les documents :

```js
db.testcollection.find()
```

![alt text](image.png)

### Mettre à jour d’un document

```js
db.testcollection.updateOne(
  { name: "Matt" },
  { $set: { age: 28 } }
)
```

![alt text](image-1.png)

### Supprimer un document

```js
db.testcollection.deleteOne({ name: "Thomas" })
```

![alt text](image-2.png)

## Problèmes rencontrés

Pas de grosse difficulté, sauf une chose : il faut bien penser à utiliser authSource=admin dans l’URI de connexion. Sinon, la connexion échoue même avec les bons identifiants.


## Interface utilisée

- `mongosh` en ligne de commande


## Résultat 

Grâce à cette première partie, on a pu installer et configurer MongoDB très rapidement avec Docker. On a appris à sécuriser l’accès avec des utilisateurs, à interagir avec la base via mongosh, et à manipuler des documents. C’était une bonne première étape pour comprendre les bases de MongoDB et son fonctionnement sans trop de complexité.

# Partie 2 – MongoDB Replica Set

Le but était de voir comment MongoDB gérait la haute disponibilité : plusieurs nœuds, rôle PRIMARY/SECONDARY.

## Méthode de déploiement

On a utilisé un `docker-compose.yml` pour lancer 3 instances MongoDB sur des ports différents : 

- `mongo1` → 27017
- `mongo2` → 27018
- `mongo3` → 27019

```yaml
services:
  mongo1:
    image: mongo:6.0
    ports:
      - 27017:27017
    command: ["--replSet", "rs0"]

  mongo2:
    image: mongo:6.0
    ports:
      - 27018:27017
    command: ["--replSet", "rs0"]

  mongo3:
    image: mongo:6.0
    ports:
      - 27019:27017
    command: ["--replSet", "rs0"]
```

## Initialisation du Replica Set

On s’est connecté à ``mongo1`` avec ``mongosh``, puis on a lancé :

![alt text](2.1.png)
![alt text](2.2.png)

---

## Vérification des rôles

Grâce à ``rs.status()``, on a vu que :
- `mongo1` est bien PRIMARY
- `mongo2` et `mongo3` sont bien SECONDARY

**mongo1 :**
![alt text](2.3.png)

**mongo2 :**
![alt text](2.4.png) 

**mongo3 :**
![alt text](2.5.png)

---

## Écriture depuis le PRIMARY

Connexion à `mongo1` (port 27017) :

```bash
mongosh "mongodb://localhost:27017"
```

Insertion du document :

![alt text](2.6.png)

---

## Lecture depuis un SECONDARY

Connexion à `mongo2` (port 27018) :

```bash
mongosh "mongodb://localhost:27018"
```

On lit les données  :

![alt text](2.8.png)

---

## Connexions testées

- PRIMARY :
  ```bash
  mongosh "mongodb://localhost:27017"
  ```

- SECONDARY :
  ```bash
  mongosh "mongodb://localhost:27018"
  ```

## Résultat

Cette partie nous a permis de comprendre le fonctionnement d’un Replica Set : comment les instances se synchronisent, comment se passent les élections, et quelles sont les contraintes en lecture/écriture. Même si la mise en place réseau a été un peu complexe, on a bien compris l’intérêt de la haute disponibilité et de la tolérance aux pannes.

---

#  Partie 3 – Intégration de MongoDB dans une application Node.js


## Objectif
On voulait tester une vraie interaction entre une base MongoDB et une application. Le but c’était de coder un petit backend Node.js qui fait des opérations CRUD sur la base. 

##  Technologies utilisées

- **Backend** : Node.js
- **Base de données** : MongoDB 
- **ODM** : Mongoose
- **Librairies** :
  - `dotenv` : gestion des variables d’environnement
  - `mongoose` : ODM pour MongoDB
- **Autres outils** :
  - Docker 
  - Visual Studio Code

---

##  Structure du projet

```
integration/
└── node/
    ├── .env
    ├── index.js
    ├── package.json
    ├── package-lock.json
    └── node_modules/
```

---

## Connexion sécurisée

**Fichier `.env` :**
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/integrationdb?authSource=admin
```

**Explication de l'URI** :
- `admin:admin123` : login du root Mongo
- `localhost:27017` : port d’écoute de MongoDB
- `integrationdb` : base de données ciblée
- `authSource=admin` : obligatoire pour l’authentification root

---

##  `index.js` - Notre App

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {

    const User = mongoose.model('User', {
      name: String,
      age: Number
    });

    const user = await User.create({ name: 'Thomas', age: 22 });
    console.log('✔️ Inserted:', user);

    const found = await User.find({ age: { $gte: 18 } });
    console.log('🔍 Found users >= 18:', found);

    const updated = await User.updateOne({ name: 'Thomas' }, { $set: { age: 23 } });
    console.log('🔄 Updated count:', updated.modifiedCount);

    const deleted = await User.deleteOne({ name: 'Thomas' });
    console.log('❌ Deleted count:', deleted.deletedCount);

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });

```

---


##  Résultats des tests

![alt text](image-3.png)


---

##  Dépendances

```bash
npm install mongoose dotenv
```

## Résultats 

On a réussi à connecter une app Node.js à notre base MongoDB et à exécuter toutes les opérations CRUD. On a bien vu l’intérêt de Mongoose pour structurer les données et simplifier les requêtes. C’était aussi un bon test d’environnement réel avec variables d’environnement, gestion des erreurs, et logique backend connectée à une vraie base.






