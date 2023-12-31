# EasyCollab

Aboubacar HASSANE CHEKOU KORE

Théo JOFFROY

Louis LESNIAK

- Rapport et documentation technique dans le fichier [Rapport_EasyCollab.pdf](Rapport_EasyCollab.pdf)

# Extrait de la documentation pour l'installation et la connexion

Spécifiez dans le fichier .env (ou .env.local) les champs :

- SECRET=
- PORT=

Le port par défaut est le port 3000, vous pouvez générer 64 bytes aléatoirement pour spécifier le champ SECRET à l’aide de la commande javascript :

`require('crypto').randomBytes(64).toString('hex’)`

Ensuite entrez dans votre terminal :

`npm install && npm start`

Ouvrir la page : `http://localhost:PORT` 
(où PORT est le port défini dans le fichier .env (ou .env.local), si vous n’avez pas défini de port, il est de 3000 par défaut.)

