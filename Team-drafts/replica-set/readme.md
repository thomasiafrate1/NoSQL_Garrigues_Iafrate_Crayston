
## 🧪 Partie 2 – MongoDB Replica Set

### 📁 Objectif

Dans cette étape, j’ai mis en place un **Replica Set** MongoDB avec 3 instances locales pour comprendre la réplication et la haute disponibilité.

---

### 🔧 Étape 1 – Configuration des instances

J’ai créé trois dossiers pour héberger les données des trois instances :

```
C:\mongo-replica-set\
├── node1\
├── node2\
└── node3\
```

Chaque dossier contiendra son propre `dbPath`.

J’ai ensuite lancé les trois instances MongoDB avec ces commandes :

```bash
mongod --replSet "rs0" --port 27017 --dbpath "C:\mongo-replica-set\node1" --bind_ip localhost --fork --logpath "C:\mongo-replica-set\node1\mongo.log"
mongod --replSet "rs0" --port 27018 --dbpath "C:\mongo-replica-set\node2" --bind_ip localhost --fork --logpath "C:\mongo-replica-set\node2\mongo.log"
mongod --replSet "rs0" --port 27019 --dbpath "C:\mongo-replica-set\node3" --bind_ip localhost --fork --logpath "C:\mongo-replica-set\node3\mongo.log"
```

---

### 🚀 Étape 2 – Initialisation du Replica Set

Je me suis connecté à l’instance principale (port 27017) avec `mongosh` :

```bash
mongosh --port 27017
```

J’ai ensuite initialisé le Replica Set avec ce script :

```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

Puis j’ai vérifié que tout fonctionnait avec :

```js
rs.status()
```

🔎 Résultat :  
J’ai vu que le noeud `localhost:27017` était `PRIMARY` et les autres `SECONDARY`.

---

### 🧪 Étape 3 – Insérer et lire des données

Toujours dans `mongosh`, j’ai inséré un document sur le `PRIMARY` :

```js
use testdb
db.users.insertOne({ nom: "Matt", age: 22 })
```

Ensuite, je me suis connecté à un `SECONDARY` avec :

```bash
mongosh --port 27018
```

Par défaut, un `SECONDARY` ne permet pas de lire. J’ai donc activé la lecture sur ce noeud avec :

```js
rs.slaveOk()
db.users.find()
```

✅ Le document était bien visible sur le secondaire, preuve que la réplication fonctionnait.

---

### 🔌 Connexion à un Replica Set

Pour se connecter en mode Replica Set via URI, j’utiliserais une chaîne comme :

```bash
mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0
```

Avec un client comme Compass ou une app Node.js, cette URI assure la tolérance aux pannes : si un noeud tombe, un autre prend le relais.

---

### 💡 Lecture et écriture

- **PRIMARY** : toutes les écritures passent par ce noeud.
- **SECONDARY** : lecture possible si `readPreference` est bien configuré (`secondary`, `nearest`, etc.).
- Le Replica Set bascule automatiquement si le PRIMARY devient inaccessible.

---
