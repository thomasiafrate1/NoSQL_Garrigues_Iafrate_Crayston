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



