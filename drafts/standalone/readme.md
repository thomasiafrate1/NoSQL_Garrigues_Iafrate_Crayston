# Atelier MongoDB

En premier lieu, j'installe MongoDB.
Une fois l'intallation terminée je suis sur mon tableau de bord disons,

![Texte alternatif](../assets/imgs/Capture1.PNG)

### Partie 1 – MongoDB Standalone

Je créé une connection : 

![Texte alternatif](../assets/imgs/Capture2.PNG)

Je créé la base de donnée avec la collection :

![Texte alternatif](../assets/imgs/Capture3.PNG)

J'insère de la data :

![Texte alternatif](../assets/imgs/Capture4.PNG)

J'essai de voir si ca marche en cherchant une value de 5 ou plus et ça marche, et je tente avec 55 et la ca marche pas, donc c'est ce que je veux :

![Texte alternatif](../assets/imgs/Capture5.PNG)
![Texte alternatif](../assets/imgs/Capture6.PNG)


J'update ma value à 20 au lieu de 10 pour voir si ça marche :

![Texte alternatif](../assets/imgs/Capture7.PNG)
![Texte alternatif](../assets/imgs/Capture8.PNG)

Je supprime mon document avec le json et sa valeur (value : 20) :

![Texte alternatif](../assets/imgs/Capture9.PNG)
![Texte alternatif](../assets/imgs/Capture10.PNG)

J'ouvre mongod.cfg

![Texte alternatif](../assets/imgs/Capture11.PNG)

Je rajoute dans security (authorization: enabled)

![Texte alternatif](../assets/imgs/Capture12.PNG)

Je redémarre le service MongoDB

![Texte alternatif](../assets/imgs/Capture13.PNG)

Je créé un dossier db dans data car je n'arrive pas à redémarrer MongoDB

![Texte alternatif](../assets/imgs/Capture14.PNG)

J'ai tout les problèmes possibles, maintenant c'est le chemin qui va pas

![Texte alternatif](../assets/imgs/Capture15.PNG)

## Passons à la création du user admin

## 🔧 Méthode de déploiement
MongoDB a été installé en mode standalone sur une machine Windows comme vu précédemment, via l’installeur officiel depuis le site [mongodb.com](https://www.mongodb.com/try/download/community).

## 👤 Création de l’utilisateur admin

### Étapes réalisées :
1. Démarrage de MongoDB sans authentification.
2. Connexion via Compass sur `localhost:27017`.
3. Création de l'utilisateur admin dans la base `admin` via `mongosh` :

```js
use admin

db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
```

4. Modification du fichier `mongod.cfg` pour activer l'authentification :

```yaml
security:
  authorization: enabled
```

5. Redémarrage du service MongoDB.

## 🔗 Méthodes de connexion possibles

### Avec Compass :
- URI sans auth (avant) : `mongodb://localhost:27017`
- URI avec auth : `mongodb://admin:admin123@localhost:27017/admin`

### Avec mongosh :
```bash
mongosh -u admin -p admin123 --authenticationDatabase admin
```

## ✅ Vérification
Connexion réussie via Compass avec l'utilisateur `admin`. Accès à toutes les bases et collections.
