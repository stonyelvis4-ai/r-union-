<!--
  Sync Impact Report
  Version change: (initial) → 1.0.0
  Modified principles: N/A (initial constitution)
  Added sections: Project Purpose, Core Features, UX Principles, Technical Architecture,
    Data Management, Code Quality Rules, Security Principles, Performance Requirements,
    Testing Requirements, Future Extensions, Development Principle, Governance
  Removed sections: Template placeholders (Core Principles 1–5, SECTION_2, SECTION_3)
  Templates: plan-template.md ✅ updated (Constitution Check); spec-template.md ✅ no change;
    tasks-template.md ✅ no change; commands/*.md ⚠ N/A (no commands folder)
  Follow-up TODOs: None
-->
# SmartReunion Constitution

Cette constitution définit les principes, objectifs, standards d'architecture, règles de
développement et exigences de qualité que tous les contributeurs doivent respecter pour
l'application de gestion de réunions intelligente (Web et Mobile).

---

## 1. Project Purpose

**Objectif principal** : Créer une plateforme de gestion de réunions intelligente permettant
aux organisations d'organiser des réunions, de les enregistrer, de transcrire automatiquement
les discussions, de générer des comptes-rendus structurés par IA et de gérer la présence
via des codes QR.

Le système MUST améliorer la productivité, la transparence et la documentation des réunions.

---

## 2. Core Features

L'application MUST prendre en charge les fonctionnalités essentielles suivantes.

### Meeting Management

- Créer des réunions
- Modifier des réunions
- Supprimer des réunions
- Consulter les réunions

### Attendance System

- Générer un code QR par réunion
- Permettre aux participants de scanner le QR pour marquer leur présence
- Stocker les enregistrements de présence

### Meeting Recording

- Démarrer l'enregistrement
- Mettre en pause l'enregistrement
- Arrêter l'enregistrement
- Enregistrer les fichiers audio

### AI Transcription

- Convertir l'audio des réunions en texte via une technologie de reconnaissance vocale (IA)

### AI Meeting Summary

- Générer des comptes-rendus structurés comprenant :
  - Points clés discutés
  - Décisions prises
  - Actions à réaliser
  - Responsables désignés
  - Date de la prochaine réunion

### Participant Management

- Ajouter des participants
- Suivre la présence
- Envoyer des rapports

### Report Distribution

- Envoyer automatiquement les comptes-rendus aux participants par e-mail
- Permettre l'export des rapports en PDF ou Word

---

## 3. User Experience Principles

L'application MUST respecter les principes UX suivants :

- Interface simple et intuitive
- Navigation rapide
- Design responsive (bureau, tablette, mobile)
- Tableaux de bord clairs
- Friction minimale pour scanner les QR et rejoindre les réunions
- Design visuel professionnel avec composants UI modernes

---

## 4. Technical Architecture

Le projet MUST suivre une architecture propre et scalable.

**Technologies recommandées :**

| Domaine           | Stack |
|-------------------|--------|
| Frontend Web      | Next.js, React, TypeScript, TailwindCSS |
| Application mobile| React Native avec Expo |
| Backend           | Node.js, Express.js |
| Base de données   | PostgreSQL |
| Services IA       | OpenAI (transcription et résumés) |
| Stockage          | Stockage cloud pour les enregistrements audio |
| Authentification  | Authentification sécurisée par JWT |

---

## 5. Data Management

L'application MUST gérer les entités suivantes :

- **Users** : utilisateurs du système
- **Meetings** : réunions
- **Participants** : participants aux réunions
- **Attendance** : présence
- **Audio recordings** : enregistrements audio
- **Transcriptions** : transcriptions texte
- **Summaries** : comptes-rendus

Toutes les données MUST être structurées, validées et sécurisées.

---

## 6. Code Quality Rules

Tous les contributeurs MUST respecter les standards suivants :

- Utiliser TypeScript autant que possible
- Écrire un code modulaire et réutilisable
- Utiliser des noms de variables clairs et descriptifs
- Documenter toutes les fonctions majeures
- Suivre les bonnes pratiques des API REST
- Maintenir une structure de dossiers cohérente
- Garantir un code maintenable et lisible

---

## 7. Security Principles

L'application MUST garantir :

- Authentification sécurisée
- Mots de passe chiffrés
- Routes API protégées
- Validation des entrées
- Prévention des vulnérabilités courantes (injection, XSS, CSRF, etc.)

---

## 8. Performance Requirements

L'application MUST être optimisée pour :

- Chargement rapide des pages
- Requêtes base de données efficaces
- Animations UI fluides
- Architecture backend scalable

---

## 9. Testing Requirements

Le projet MUST inclure :

- Tests unitaires pour les fonctionnalités clés
- Tests d'API
- Validation des flux critiques
- Gestion d'erreurs de base

---

## 10. Future Extensions

L'architecture MUST permettre l'intégration future de fonctionnalités avancées telles que :

- Reconnaissance des intervenants
- Transcription multilingue
- Analytiques des réunions
- Intégrations calendrier
- Gestion des tâches issues des actions de réunion

---

## 11. Development Principle

Tout développement MUST prioriser :

- **Simplicité** : solutions simples avant complexité
- **Scalabilité** : conception permettant la montée en charge
- **Maintenabilité** : code et structure maintenables à long terme
- **Sécurité** : conformité aux principes de sécurité (section 7)
- **Expérience utilisateur** : qualité et clarté de l'UX (section 3)

---

## Governance

- Cette constitution prime sur les autres pratiques du projet. Les décisions techniques et
  fonctionnelles MUST être conformes à ses sections.
- **Amendements** : toute modification MUST être documentée, avec justification et impact
  sur les specs/plans. Les changements incompatibles avec l’existant (retrait ou
  redéfinition de principes) entraînent un incrément MAJOR ; ajout de sections ou principes,
  MINOR ; clarifications et corrections, PATCH.
- **Conformité** : les revues de code et les plans (plan.md) MUST vérifier la conformité
  à cette constitution. La section « Constitution Check » du plan d’implémentation doit
  s’y référer avant Phase 0 et après Phase 1.
- **Complexité** : toute complexité supplémentaire par rapport aux principes (simplicité,
  stack recommandée) MUST être justifiée dans le plan et documentée.

**Version**: 1.0.0 | **Ratified**: 2025-03-06 | **Last Amended**: 2025-03-06
