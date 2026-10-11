# Quality Claims Intelligence

Application de qualification, d'analyse et de pilotage des réclamations clients qualité.

Le même code produit deux versions :

| Version | Données | IA | Usage |
|---|---|---|---|
| **Site Netlify** (`npm run build`) | Partagées entre utilisateurs (Netlify Blobs) | Claude, si la clé API est configurée | Usage d'équipe, protégé par mot de passe |
| **Fichier HTML autoporté** (`npm run build:standalone`) | Stockées dans le navigateur du poste | Règles uniquement | Usage individuel, hors ligne |

Les deux versions échangent leurs données par **Données et paramétrage › Sauvegarde et export** (fichier JSON).

### Fichier HTML de consultation (données intégrées)
**Données et paramétrage › Sauvegarde et export › Exporter un fichier HTML de consultation** crée un fichier unique `QCI_consultation_<date>.html` contenant l'application et l'état du moment : réclamations, qualifications, validations, dossiers d'investigation, volumes et paramètres. Le bouton fonctionne depuis le site Netlify et depuis la version autonome.

À l'ouverture du fichier :
- les données s'affichent sans import ;
- filtres, graphiques, fiches réclamations et dossiers sont consultables ;
- aucune modification n'est possible, et rien n'est écrit dans le navigateur ;
- un bandeau indique la date de l'export, son auteur et sa source.

Le fichier contient les noms de clients en clair et les descriptions avec les noms de personnes abrégés. La table de décodage et les empreintes de noms n'y figurent pas.

---

## Langues (FR · EN · IT)
Le sélecteur **FR · EN · IT** se trouve en haut du menu latéral. Le choix est mémorisé dans le navigateur. À la première ouverture, l'application s'affiche en anglais.

Sont traduits :
- l'interface ;
- les référentiels (familles, sous-familles, symptômes, gravités, priorités, familles et parfums de produits) ;
- les textes générés (synthèse, alertes, justifications, faits, hypothèses, anomalies, historique) ;
- les en-têtes des exports.

Ne sont **pas** traduits :
- les données sources : descriptions des clients, libellés produits, noms de clients et d'usines, type de défaut d'origine ;
- les saisies des utilisateurs : commentaires, titres et contenus de dossiers ;
- les réponses de l'IA, rédigées en français.

Dates et nombres gardent le format français dans les trois langues (31/12/2026, 1 234,5).

Un fichier de consultation s'ouvre dans la langue de la personne qui l'a exporté. Le lecteur peut changer de langue, mais ce choix n'est pas mémorisé.

Les traductions sont centralisées dans `src/i18n/dict.ts`, avec le texte français comme clé. Un test vérifie que chaque texte d'interface possède sa traduction anglaise et italienne.

## 1. Publier sur GitHub

1. Créez un dépôt **privé** sur https://github.com/new (par exemple `quality-claims-intelligence`), sans README.
2. Décompressez l'archive, puis dans le dossier obtenu :
   ```bash
   git init
   git add .
   git commit -m "Version initiale"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/quality-claims-intelligence.git
   git push -u origin main
   ```
   Sans ligne de commande : sur la page du dépôt vide, choisissez « uploading an existing file » et glissez le contenu du dossier (pas le dossier lui-même).

Le fichier `.gitignore` exclut `tests/local/` : n'y placez que des fichiers réels, ils ne seront jamais publiés.

## 2. Déployer sur Netlify

1. Netlify › **Add new project › Import an existing project › GitHub**, puis choisissez le dépôt.
2. Les réglages sont lus dans `netlify.toml` (commande `npm run build`, dossier `dist`, fonctions `netlify/functions`). Ne les modifiez pas. La commande construit aussi `qci-autonome.html`, le gabarit utilisé pour exporter les fichiers de consultation.
3. **Deploy**. Netlify Blobs est activé automatiquement : aucune base de données à créer.

### Mot de passe
Projet › **Project configuration › Access & security › Visitor access** (l'intitulé exact dépend de votre offre) : activez la protection par mot de passe. Elle s'applique à tout le site, y compris aux fonctions de données.

### Assistance IA (facultatif)
Projet › **Project configuration › Environment variables** :

| Variable | Valeur |
|---|---|
| `ANTHROPIC_API_KEY` | votre clé API Anthropic (console.anthropic.com) — usage facturé par Anthropic |
| `ANTHROPIC_MODEL` | facultatif, par défaut `claude-sonnet-5-5` |

Redéployez ensuite (**Deploys › Trigger deploy**). Sans clé, l'application fonctionne normalement avec la qualification par règles. Les descriptions envoyées à l'IA sont déjà pseudonymisées.

## 3. Fichier HTML autoporté

`QCI_autonome.html` s'ouvre directement dans Chrome, Edge ou Firefox, sans installation ni connexion. Les données restent dans le navigateur de ce poste : exportez régulièrement une sauvegarde.

Pour le régénérer : `npm install` puis `npm run build:standalone` → `dist-standalone/index.html`.

## 4. Développement

```bash
npm install
npm test                 # 37 tests sur données fictives (+1 sur tests/local/reel.local.csv s'il existe)
npm run dev              # interface en local (stockage navigateur)
npx netlify dev          # interface + fonctions Netlify en local
```

---

## Règles validées intégrées

| Sujet | Règle | Fichier |
|---|---|---|
| Granularité | Une ligne = une réclamation | `src/core/importer.ts` |
| Réimport | Ligne identique ignorée ; mêmes 6 champs et description complétée → mise à jour de la ligne ; plusieurs candidats → nouvelle ligne signalée | `importer.ts` |
| Pseudonymisation | Motif « jj/mm/aaaa hh:mm Prénom NOM : » ; consonnes seulement (Y voyelle), prénom et nom séparés, collision → `-2` ; table de décodage téléchargée à l'import, jamais stockée | `importer.ts` |
| Clients | En clair ; LAGO GROUP = flux interne (filtre) | `referentiels.ts` |
| Dates | jj/mm/aaaa, jj.mm.aaaa, jj/mm/aa ; « NC », « n.d. » = manquant | `util.ts` |
| Anomalies de dates | Écart DDM − fabrication hors 30–730 j ou DDM antérieure : valeur conservée, surlignée en jaune, incluse dans les analyses | `importer.ts` |
| Date de réclamation | Mention explicite « Date de réclamation : » uniquement ; aucune estimation | `importer.ts` |
| Usines | Hiérarchie Groupe (BOUVARD ITALIA, LAGO) › Site | `referentiels.ts` |
| Produits, taxonomie, mapping, gravité, signaux, score | Classeur de validation, tous onglets « OK » | `referentiels.ts`, `ref_produits.json` |
| Volumes | Usine × produit × mois de fabrication, en UVC et kg ; taux calculés uniquement sur les combinaisons renseignées | `analytics.ts` |

### Interprétations techniques (paramétrables dans l'application)
- **Mois évaluable** : chacun de ses 3 mois de référence compte au moins une réclamation (évite de fausses alertes autour d'une date isolée comme 2002).
- **Alerte étayée** : n ≥ 3 et test de Poisson p < 0,05 (hausse, concentration), ou n ≥ 3 pour une apparition. Toutes les autres règles produisent des alertes exploratoires.
- **Priorité d'une alerte** : P1 si une réclamation critique est concernée, P2 si étayée ou n ≥ 3, sinon P3.
- **Situations du score** : regroupement usine × sous-famille par défaut. Si la dynamique n'est pas calculable, son poids est redistribué. Une réclamation critique impose P1.
- **Cas hors grille de gravité** (plastique de dureté non précisée, mélange d'emballages, texture) : « Non évaluable » ou « Majeure » avec examen humain obligatoire.

## Architecture

```
src/core/       calculs purs et testés : csv, importer, classify, analytics, signals, synthesis, store, ai, snapshot
src/pages/      10 pages + fiche réclamation
src/ui/         composants (graphiques, tableaux exportables, filtres)
src/i18n/       traduction FR / EN / IT (dictionnaire et motifs des textes générés)
netlify/functions/store.mts   stockage partagé (Netlify Blobs)
netlify/functions/claude.mts  qualification IA (clé côté serveur)
tests/          tests de calcul, de classification et de non-régression
```

Les calculs se font dans le navigateur, en TypeScript. Netlify n'exécute pas Python nativement, d'où le remplacement de FastAPI et Pandas validé. Pour 400 lignes par import, le volume est largement supporté.

## Limites connues
- Pas de gestion des rôles (choix validé). La protection repose sur le mot de passe Netlify ; l'auteur des modifications est un nom saisi librement.
- Écritures simultanées : la modification la plus récente l'emporte, élément par élément.
- Les empreintes de noms conservées (pour garder la même abréviation d'un import à l'autre) ne sont pas lisibles directement, mais elles peuvent être confirmées par quelqu'un qui connaîtrait déjà un nom.
- Les noms écrits hors du motif « date heure Prénom NOM : » ne sont pas détectés.
- « Emballage gonflé » n'existe pas dans la taxonomie validée : ces cas restent « Non précisée ».
- Les mois de fabrication récents sont sous-représentés, car les produits n'ont pas atteint leur DDM.
