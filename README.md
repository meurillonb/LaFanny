# LaFanny

LaFanny est une application web progressive (PWA) destinée à gérer des concours de pétanque. Elle permet de maintenir une liste de joueurs, gérer leurs présences, créer et suivre des concours, et importer des joueurs depuis un fichier CSV.

Principales fonctionnalités
- Gestion des joueurs (ajout, modification, suppression « soft »)
- Marquage de présence pour la session suivante
- Import CSV avec détection des doublons
- Gestion des concours (création, historique, archives)
- PWA (manifest + service worker) pour installation hors-ligne
- Déploiement prêt pour GitHub Pages (workflow GitHub Actions inclus)

Installation et commandes

Pour lancer le projet en développement :

```bash
npm install
npm run dev
```

Builder pour la production :

```bash
npm run build
```

Prévisualiser la build :

```bash
npm run preview
```

Tests :

```bash
npm run test
```

Prérequis

Avant d'installer et de lancer le projet, installe Node.js (recommandé : Node 24 LTS ou au moins >= 22.21.0) et `npm`.

Sur macOS (option 1 — nvm) :

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "$HOME/.nvm" || printf %s "$XDG_CONFIG_HOME/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
nvm install 24
nvm use 24
```

Sur macOS (option 2 — Homebrew) :

```bash
brew install node@24
brew link --force --overwrite node@24
```

Vérifier l'installation :

```bash
node -v
npm -v
```

Utilisation locale
- Installer les dépendances :

```bash
npm install
```

- Lancer le serveur de développement :

```bash
npm run dev
```

- Builder la version de production :

```bash
npm run build
```

- Prévisualiser la build locale :

```bash
npm run preview
```

Si tu veux forcer une version de Node différente pour ce projet, utilise `nvm` ou ajoute un fichier `.nvmrc` contenant le numéro de version (`24`).

Déploiement

Le dépôt contient un workflow GitHub Actions (`.github/workflows/deploy.yml`) configuré pour déployer la sortie `dist/` sur GitHub Pages automatiquement lors d'un push sur `main`.

Import CSV — format attendu

Le module d'import supporte les séparateurs `,` (virgule) et `;` (point-virgule). Le fichier doit commencer par une ligne d'en-têtes (insensible à la casse). La colonne `nom` est requise ; les autres colonnes sont optionnelles.

En-têtes reconnus (exemples, sans ordre imposé) :

- `nom` (obligatoire) — nom du joueur (unique pour l'import)
- `prenom` — prénom (optionnel)
- `genre` — `M` ou `F` (optionnel)
- `role` — `pointeur`, `tireur` ou `milieu` (optionnel)
- `niveau` — `debutant`, `intermediaire`, `confirme`, `expert` (optionnel)
- `actif` — `true` / `false` (optionnel, défaut `true`)
- `presentSessionSuivante` — `true` / `false` (optionnel, défaut `false`)

Règles d'import importantes :
- La colonne `nom` est obligatoire. Les lignes sans nom sont ignorées.
- Les valeurs `genre`, `role` et `niveau` sont validées ; les valeurs invalides sont signalées dans le rapport d'import.
- Les doublons sont détectés en comparant le champ `nom` (insensible à la casse). Les doublons sont ignorés et comptabilisés comme « skipped ».

Exemple de fichier CSV (virgule) :

```csv
nom,prenom,genre,role,niveau,actif,presentSessionSuivante
DUPONT,Jean,M,pointeur,intermediaire,true,false
MARTIN,Claire,F,milieu,confirme,true,true
```

Exemple avec point-virgule :

```csv
nom;prenom;genre;role;niveau;actif;presentSessionSuivante
DUPONT;Jean;M;pointeur;intermediaire;true;false
```

Si votre fichier contient un BOM UTF‑8 (généré par certains éditeurs), il est automatiquement géré.

Comportement de l'import
- Le parseur renvoie un objet contenant `joueurs` (liste prête à l'ajout), `imported` (nombre valides), `skipped` (lignes ignorées) et `errors` (messages pour les lignes invalides).

Support et contribution

Si tu souhaites améliorer l'app, ouvre une issue ou une pull request sur le dépôt GitHub.

---------------------------------
Description technique courte

LaFanny est construite avec :
- Vite + React + TypeScript
- MUI pour l'UI
- Zustand pour le state local
- Dexie (IndexedDB) pour le stockage local
- `vite-plugin-pwa` pour la PWA

Fichier important pour l'import CSV : `src/lib/csvImport.ts`

Contact

Voir le dépôt : https://github.com/meurillonb/LaFanny

