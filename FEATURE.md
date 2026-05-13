# État des fonctionnalités

Ce document synthétise ce qui est déjà disponible dans l'application et ce qui semble encore à développer.

## Déjà en place

- Gestion des joueurs: ajout, modification, désactivation, marquage de présence et import CSV depuis [src/routes/joueurs.index.tsx](src/routes/joueurs.index.tsx), avec la logique métier dans [src/stores/joueurStore.ts](src/stores/joueurStore.ts) et le parseur dans [src/lib/csvImport.ts](src/lib/csvImport.ts).
- Création d'un concours: formulaire de création, choix du format et calcul du nombre de terrains via [src/routes/concours.nouveau.tsx](src/routes/concours.nouveau.tsx) et [src/stores/concoursStore.ts](src/stores/concoursStore.ts).
- Déroulé d'un concours: inscription des joueurs, tirage, affichage de la partie en cours, saisie des scores et validation de partie dans [src/routes/concours.$concoursId.tsx](src/routes/concours.$concoursId.tsx) et [src/lib/tirage.ts](src/lib/tirage.ts).
- Gestion des résultats: normalisation des scores et détermination du gagnant via [src/lib/resultat.ts](src/lib/resultat.ts).
- Réglages applicatifs: nombre de terrains extérieur/intérieur et mode sombre dans [src/routes/parametres.tsx](src/routes/parametres.tsx) et [src/stores/parametresStore.ts](src/stores/parametresStore.ts).
- Accueil et navigation: tableau de bord, accès rapide aux concours, et écran de navigation globale dans [src/routes/index.tsx](src/routes/index.tsx), [src/components/layout/TopBar.tsx](src/components/layout/TopBar.tsx) et [src/components/layout/BottomNav.tsx](src/components/layout/BottomNav.tsx).
- Base locale: persistance Dexie, schéma des tables et données par défaut dans [src/lib/db.ts](src/lib/db.ts).
- Couverture de tests: présence de tests unitaires et end-to-end sur des parcours clés dans [src/lib/format.test.ts](src/lib/format.test.ts), [src/lib/resultat.test.ts](src/lib/resultat.test.ts), [src/lib/tirage.test.ts](src/lib/tirage.test.ts) et [e2e/concours-solo.spec.ts](e2e/concours-solo.spec.ts).

## À développer

- Synchronisation distante / multi-appareils: la base locale contient déjà une file de synchronisation et des marqueurs de modification dans [src/lib/db.ts](src/lib/db.ts), mais aucune couche de sync n'est branchée dans l'UI ou les stores.
- Authentification et gestion des comptes: aucune fonctionnalité d'auth n'apparaît dans le code courant.
- Export et sauvegarde des données: pas d'export CSV/PDF ou de mécanisme de sauvegarde/restauration visible.

## Améliorations récentes

- Historique avancé et statistiques: ajout d'un écran dédié avec classement cumulé, bilans joueurs et historique détaillé des parties/terrains via [src/routes/concours.$concoursId.historique.tsx](src/routes/concours.$concoursId.historique.tsx) et [src/lib/concoursStats.ts](src/lib/concoursStats.ts).
- Archivage et réouverture: ajout d'un écran archives et d'une action de réouverture de la dernière partie d'un concours terminé via [src/routes/concours.archives.tsx](src/routes/concours.archives.tsx) et [src/stores/concoursStore.ts](src/stores/concoursStore.ts).
- Validation métier enrichie: renforcement des garde-fous autour des inscriptions, du tirage, de la saisie de score, des transitions d'état et de la validation de partie dans [src/stores/concoursStore.ts](src/stores/concoursStore.ts) et [src/lib/resultat.ts](src/lib/resultat.ts).

## Lecture rapide

Le projet couvre déjà le cycle principal d'utilisation: joueurs -> concours -> tirage -> score -> clôture, avec un suivi avancé des concours terminés. La principale zone encore incomplète est tout ce qui touche à la synchronisation, aux comptes et aux exports.