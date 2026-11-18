# TEAk agent

TEAk est une agente IA vocale congolaise, 100 % statique et gratuite :

- **Micro au centre en 3D** : un toucher lance la conversation automatique — TEAk parle, écoute la réponse, répond, puis réécoute.
- **Voix féminine jeune** : synthèse vocale gratuite du navigateur (Web Speech API), voix française féminine choisie automatiquement, hauteur relevée.
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
