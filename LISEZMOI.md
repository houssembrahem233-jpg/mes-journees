# Mes Journées — tâches et prières

Application mobile (Android et iPhone) faite avec React Native et Expo.

## Installer sur Android (le plus simple)

À chaque modification sur la branche `main`, GitHub fabrique automatiquement l'application.
1. Ouvre l'onglet **Releases** du projet sur ton téléphone.
2. Télécharge `app-release.apk` dans la dernière version.
3. Ouvre le fichier pour l'installer (autorise « Installer des applis inconnues » si Android le demande).

Pour une nouvelle version : réinstalle simplement le nouvel apk, tes données sont conservées.

## Contenu
- `App.js` : point d'entrée et barre d'onglets
- `src/theme.js` : les couleurs
- `src/dates.js` : les dates en français et les répétitions
- `src/store.js` : la sauvegarde sur le téléphone
- `src/components.js` : boutons, fenêtres, en-têtes
- `src/screens/` : les 4 écrans (Aujourd'hui, Importantes, Planning, Prières)

## Lancer l'application sur ton téléphone

1. Sur ton ordinateur, installe **Node.js** (version LTS) depuis nodejs.org.
2. Sur ton téléphone, installe **Expo Go** (Play Store ou App Store).
3. Dans un terminal, crée le projet :
   ```
   npx create-expo-app@latest MesJournees --template blank
   cd MesJournees
   ```
4. Copie dans ce dossier le fichier `App.js` (remplace celui qui existe) et le dossier `src`.
5. Installe les 3 modules utilisés :
   ```
   npx expo install @react-native-async-storage/async-storage react-native-safe-area-context @expo/vector-icons
   ```
6. Démarre :
   ```
   npx expo start
   ```
   Scanne le QR code avec Expo Go (Android) ou avec l'appareil photo (iPhone).
   Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.

Pour changer le nom affiché de l'application, modifie `"name"` dans `app.json`.

## Installer l'application pour de vrai sur Android (gratuit)

Une seule fois, depuis l'ordinateur, dans le dossier `MesJournees` :

1. Copie aussi le fichier `eas.json` dans le dossier.
2. Crée un compte gratuit sur expo.dev.
3. Dans le terminal :
   ```
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
   Si on te demande un « Android package name », accepte la proposition
   (ou écris par exemple `com.mesjournees.app`). Accepte aussi la création de la clé (« keystore »).
4. Après 10 à 20 minutes, un lien et un QR code s'affichent.
   Ouvre-les sur le Samsung, télécharge le fichier `.apk` et touche-le pour l'installer.
   Si Android bloque, autorise « Installer des applications inconnues » pour ton navigateur
   (Paramètres › Applications › ton navigateur › Installer des applis inconnues).

L'icône « Mes Journées » apparaît alors avec tes autres applications. Plus besoin d'Expo Go ni de l'ordinateur.
Pour une nouvelle version plus tard : relancer `eas build -p android --profile preview` et réinstaller l'apk
(les données sont conservées si on garde le même nom de package).

## Fonctionnement
- **Aujourd'hui** : Al-Fajr (Fait / Pas fait, toucher à nouveau pour annuler),
  Qiyam al-Layl (− / +), tâches du jour avec catégorie, tâches planifiées du jour.
  Les tâches non terminées sont reportées automatiquement au jour suivant.
- **Importantes** : priorité haute / moyenne / basse, filtre, note,
  bouton « Planifier une date » qui envoie la tâche dans le planning.
- **Planning** : semaine par semaine, heure facultative,
  répétition (chaque jour, semaine ou mois), liste des 7 jours à venir.
- **Prières** : calendrier du mois et statistiques.
  - Fajr : toucher un jour fait défiler fait → pas fait → effacé.
  - Qiyam : toucher un jour ouvre le compteur de rak'at.
- Appui long sur une tâche = supprimer. Toucher une tâche (Importantes, Planning) = modifier.

Les données restent sur le téléphone. Elles ne sont pas synchronisées entre appareils.
