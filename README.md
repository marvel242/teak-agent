# TEAk agent

TEAk est une agente IA vocale congolaise, 100 % statique et gratuite :

- **Son visage animé au centre** : un personnage 3D aux 20 expressions (détourées, fond transparent) qui change d'émotion selon ses réponses. Un petit bouton en bas lance la conversation automatique — TEAk parle, écoute la réponse, répond, puis réécoute. Le bouton s'allume **rouge quand TEAk parle**, **vert quand l'utilisateur parle** ; quand elle écoute, elle porte la main à l'oreille et ses yeux clignotent.
- **Voix féminine jeune** : voix Google gratuite (plus réaliste) par défaut, avec repli sur la voix française de l'appareil (Web Speech API) hors-ligne — choix dans Réglages.
- **Recherche web** : pour les questions générales, TEAk cherche sur DuckDuckGo et Wikipédia (APIs gratuites) et affiche ses sources à l'écran.
- **Heure et date en images** : une montre 3D dorée apparaît pour l'heure, un calendrier 3D pour la date.
- **Français + Lingala** : lexique de phrases avec écoute, réponses en français, en lingala ou en mélange congolais.
- **Connaissance du Congo Brazzaville** : départements, parcs (Odzala-Kokoua, Nouabalé-Ndoki), fleuve Congo, Sape, rumba, cuisine.
- **Mémoire** : TEAk retient ce qu'on lui confie (prénom, ville, goûts). La mémoire est stockée dans le navigateur de chaque visiteur (localStorage), visible et effaçable via le menu ⋯ > Mémoire.

## Hébergement

Site statique (un seul fichier `index.html`), hébergé gratuitement sur **Cloudflare Pages**,
déployé depuis ce dépôt GitHub. Chaque modification poussée sur la branche `main`
republie automatiquement le site.

## Modifier TEAk

- Modifier `index.html`, puis pousser le changement sur GitHub : le site se met à jour tout seul.
- Ajouter des connaissances : sections `DEPARTEMENTS`, `LIEUX`, `PLATS` dans le script.
- Ajouter des phrases lingala : directement dans l'application (menu ⋯ > Lingala) ou dans le tableau `PHRASES`.
