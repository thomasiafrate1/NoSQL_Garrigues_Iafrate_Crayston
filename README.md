# Atelier NoSql - Déployer et utiliser MongoDB

Ce projet a été réalisé dans le cadre de notre formation à Ynov, dans le module **NoSQL**.  
Il fait suite aux premier cours théoriques et a pour but de mettre en pratique ce qu'on a pu apprendre à travers un atelier technique.

---

## Objectifs pédagogiques
* Comprendre les principes d’une base de données orientée document
* Déployer MongoDB selon différents modes : standalone, replica set, puis sharding (bonus)
* Intégrer MongoDB dans une application avec un langage de votre choix
* Documenter toutes les étapes de l’atelier dans un fichier Markdown
* Versionner votre projet avec Git et le rendre accessible en ligne.

---

## Structure du projet

```
atelier-mongodb/
├── docs/
│   ├── assets/
│   │   ├── image.png
│   │   └── ...
│   └── rapport.md
├── mongo/
│   ├── standalone/
│   └── replicaset/
├── integration/
│   └── <JavaScript/NodeJS>/
│       └── tests/
├── drafts/
│   └── assets/
│   └── replica-set/
│   └── standalone/
└── README.md
```

---

## Lancer les services

### 1. Cloner le dépôt

```bash
git clone https://github.com/thomasiafrate1/NoSQL_Garrigues_Iafrate_Crayston
cd NoSQL_Garrigues_Iafrate_Crayston
```

---

## Documentation complète

Voir le fichier [`docs/rapport.md`](docs/rapport.md) pour la documentation détaillé de chaque étape de chaque partie du projet.

---

## Suivi d'avancement

| Partie                   | État         |
| ------------------------ | -----------  |
| MongoDB Standalone       | ✅ Fait      |
| MongoDB Replica Set      | ✅ Fait      |
| Intégration dans une App | ✅ Fait      |
| MongoDB Sharding (Bonus) | 🔄 A Faire   |

---

## Prérequis

* Docker et Docker Compose
* Node.js
* mongosh

---

## Auteurs

[IAFRATE Thomas](https://github.com/thomasiafrate1), [GARRIGUES Hugo](https://github.com/HugoGarrigues), [CRAYSTON Matt](https://github.com/MattCrayston24)

---