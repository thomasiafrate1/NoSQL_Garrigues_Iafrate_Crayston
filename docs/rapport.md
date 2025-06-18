# Partie 1 – MongoDB Standalone

## Méthode de déploiement

On déploie avec Docker Compose dans le dossier *`mongo/standalone`* :

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

## Création de l’utilisateur

Un script *`init.js`* est placé dans le dossier *`init/`*. Ce script est exécuté **une seule fois** au premier lancement du conteneur (si la base de données est vide).  
Il permet de :
1. **Créer une base de données** `testdb`
2. **Créer un utilisateur** `testuser` avec un mot de passe (`testpass`)
3. **Donner les droits `readWrite`** à cet utilisateur uniquement sur `testdb`
4. **Insérer automatiquement quelques documents** dans une collection appelée `testcollection`

Voici le contenu du script *`init.js`* :

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
## Installation de mongosh (CMD MongoDB)

`mongosh` permet d’exécuter des commandes MongoDB en ligne de commande et de tester rapidement des requêtes directement dans le CMD.

Nous avons téléchargé la version ZIP depuis le site officiel de MongoDB.

Après décompression :
- On ouvre un terminal dans le dossier `bin`
- On exécute directement le fichier `mongosh.exe`

## Connexion à la base

### Avec mongosh 

```bash
mongosh "mongodb://admin:admin123@localhost:27017" --authenticationDatabase admin
```

Puis dans le shell :

```js
use testdb
db.auth("testuser", "testpass")
```



## Requêtes exécutées

### Rechercher tous les documents :

```js
db.testcollection.find()
```

**Résultat** :
> Cette commande nous affiche tous les documents et leurs infos.

![alt text](image.png)

### Mise à jour d’un document

```js
db.testcollection.updateOne(
  { name: "Matt" },
  { $set: { age: 28 } }
)
```
**Résultat** :
> Cette commande met à jour l’âge de "Matt" à 28.

![alt text](image-1.png)

### Suppression d’un document

```js
db.testcollection.deleteOne({ name: "Thomas" })
```
**Résultat** :
> Supprime le premier document où `name` est "Thomas".

![alt text](image-2.png)

## Problèmes rencontrés

- Aucun blocage majeur. Il faut bien se connecter en précisant `authSource=admin` pour l'utilisateur root.


## Interface utilisée

- `mongosh` en ligne de commande

# Partie 2 – MongoDB Replica Set

## Méthode de déploiement

Nous avons utilisé `docker-compose.yml` pour déployer 3 instances MongoDB configurées avec l’option `--replSet rs0`.  
Chaque instance utilise un port différent exposé localement :

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

Nous nous sommes connecté à `mongo1`, et ensuite nous avons exécuté la commande `rs.initiate()` dans `mongosh` :

![alt text](2.1.png)
![alt text](2.2.png)

---

## Vérification des rôles

La commande `rs.status()` nous a permis de voir que :
- `mongo1` est bien PRIMARY
- `mongo2` et `mongo3` sont bien SECONDARY

**Extraits de rs.status() :**
**mongo1 :**
![alt text](2.3.png)

**mongo2 :**
![alt text](2.4.png) 

**mongo3 :**
![alt text](2.5.png)

---

## Écriture depuis le PRIMARY

Connexion à `mongo1` (localhost:27017) :

```bash
mongosh "mongodb://localhost:27017"
```

Insertion du document :

![alt text](2.6.png)

---

## Lecture depuis un SECONDARY

Connexion à `mongo2` :

```bash
mongosh "mongodb://localhost:27018"
```

On peut lire les données (grâce à `readPreference=secondary` par défaut en direct) :

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


---

## Explication des modes lecture / écriture

| Rôle       | Peut écrire | Peut lire | Note                            |
|------------|-------------|-----------|---------------------------------|
| PRIMARY    | OUI          | OUI        | C’est le seul nœud modifiable   |
| SECONDARY  | NON          | OUI        | Lecture uniquement (si `readPreference=secondary`) |

En cas de panne du PRIMARY, un SECONDARY devient automatiquement le nouveau PRIMARY.

---

#  Partie 3 – Intégration dans une application avec MongoDB (Standalone)

##  Technologies utilisées

- **Backend** : Node.js
- **Base de données** : MongoDB (mode standalone)
- **ODM** : Mongoose
- **Librairies** :
  - `dotenv` : gestion des variables d’environnement
  - `mongoose` : ODM pour MongoDB
- **Autres outils** :
  - Docker (pour MongoDB standalone)
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
- `admin:admin123` : identifiants de connexion
- `localhost:27017` : adresse du conteneur MongoDB standalone
- `integrationdb` : nom de la base utilisée
- `authSource=admin` : précise que l'authentification se fait via la base `admin`

---

##  Code source : `index.js`

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

##  Méthodes de connexion possibles

| Mode | URI | Description |
|------|-----|-------------|
| Standalone | `mongodb://admin:admin123@localhost:27017/integrationdb?authSource=admin` | Connexion à une seule instance MongoDB |
| Replica Set | `mongodb://localhost:27017,localhost:27018,localhost:27019/integrationdb?replicaSet=rs0` | Connexion à un ensemble de réplicas (ne fonctionne que si tous les hôtes sont joignables depuis Node.js) |

---

##  Dépendances

```bash
npm install mongoose dotenv
```







