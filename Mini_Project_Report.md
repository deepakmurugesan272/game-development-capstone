# TAMIL HERITAGE GAMES HUB
## A Mini Project Report
**Submitted in partial fulfilment of the requirements for the award of the degree of**
### BACHELOR OF ENGINEERING in COMPUTER SCIENCE AND ENGINEERING

**Submitted by:**
- KAVIYA S (Reg. No: 8115XXXXXXX)
- MOHAMMED ARSHATH K (Reg. No: 8115XXXXXXX)
- PRIYADHARSHINI R (Reg. No: 8115XXXXXXX)

**Under the guidance of:**
**Mr./Ms. XXXXXXXXXX, M.E.**
Assistant Professor, Department of CSE

**DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING**
**V.S.B. ENGINEERING COLLEGE, KARUR**
(An Autonomous Institution)
Karur - 639 111, Tamil Nadu

**MAY 2026**

---

## BONAFIDE CERTIFICATE
This is to certify that the mini project report titled **"TAMIL HERITAGE GAMES HUB"** is the bonafide work of **KAVIYA S, MOHAMMED ARSHATH K and PRIYADHARSHINI R**, who carried out the project work under my supervision during the academic year 2025 - 2026, in partial fulfilment of the requirements for the award of the degree of Bachelor of Engineering in Computer Science and Engineering, V.S.B. Engineering College, Karur.

- **PROJECT GUIDE** (Assistant Professor, Department of CSE)
- **HEAD OF THE DEPARTMENT** (Department of CSE)

Submitted for the Project Viva-Voce Examination held on **__________________**.
- **Internal Examiner**
- **External Examiner**

---

## ACKNOWLEDGEMENT
We express our sincere gratitude to our Chairman, Secretary and Correspondent of V.S.B. Engineering College, Karur, for providing us with the necessary facilities and a congenial atmosphere to carry out this project successfully.

We are deeply thankful to our Principal for his constant encouragement and support extended throughout the course of this project.

We express our heartfelt thanks to the Head of the Department, Department of Computer Science and Engineering, for valuable guidance and for providing the necessary facilities to complete this project.

We would like to place on record our profound gratitude to our project guide for patient guidance, constant supervision and constructive suggestions, which helped us to complete this project within the stipulated time.

We also thank all the teaching and non-teaching staff of the Department of Computer Science and Engineering for their help and support. Finally, we thank our parents and friends for their encouragement and moral support throughout this project work.

---

## ABSTRACT
The **"Tamil Heritage Games Hub"** is a modern web-based platform designed to preserve, promote, and enable the digital play of classical traditional board games of Tamil Nadu. In an era dominated by foreign and high-action digital entertainment, culturally significant games such as Aadu Puli Aattam (Goats and Tigers), Dayakattai (Dice Game), Pallanguzhi (Seed Capture), and Paramapadham (Snakes and Ladders) are rapidly facing extinction. This project presents a full-stack, responsive solution that replicates these ancient board configurations with robust logic engines, user profile retention, localization, and audio-visual cues.

The proposed system features structured components including an authentication controller utilizing JSON Web Tokens (JWT) for session management, a dashboard tracking detailed game history, XP points, leveling up, coins, and custom achievements. An elegant, themeable front-end is implemented using React, TypeScript, Vite, and custom CSS styling that mimics traditional brass and wood grain aesthetics. Sound synthesis is integrated using the Web Audio API to produce traditional ambient feedback without large file assets. The system is engineered to connect to a MongoDB cloud database with an automated in-memory backup server logic that seamlessly executes in local, offline environments.

Validation results demonstrate successful state replication in multiplayer and single-player AI configurations, fast web performance (with partial search operations rendering in under 1 second), and high usability metrics in both English and Tamil languages. The system provides an engaging, educational digital resource that safeguards Tamil traditional intellectual heritage.

**Keywords:** Tamil Traditional Games, Full-stack Web Application, React, Node.js, MongoDB, Board Games, Aadu Puli Aattam, Dayakattai, Pallanguzhi, Paramapadham.

---

## TABLE OF CONTENTS
- **1. INTRODUCTION**
  - 1.1 Overview of the Project
  - 1.2 Literature Survey
  - 1.3 Proposed System
  - 1.4 Objectives & Scope
  - 1.5 Organization of the Report
- **2. REQUIREMENTS SPECIFICATION**
  - 2.1 Overall Description
  - 2.2 Specific Requirements
- **3. SYSTEM DESIGN AND TEST PLAN**
  - 3.1 Decomposition Description
  - 3.2 Dependency Description
  - 3.3 Detailed Design
  - 3.4 Proposed Sampling Methods
  - 3.5 Test Plan
- **4. IMPLEMENTATION AND RESULTS**
  - 4.1 Implementation
  - 4.2 Results
- **5. CONCLUSION AND FUTURE WORK**
  - 5.1 Summary
  - 5.2 Future Work
- **REFERENCES**
- **APPENDICES**

---

## LIST OF TABLES
- Table 2.1 Hardware Requirements
- Table 2.2 Software Requirements
- Table 3.1 User Schema Definition
- Table 3.2 GameRecord Schema Definition
- Table 3.3 Heuristic weights for AI implementation
- Table 3.4 Test Cases and Results

---

## LIST OF FIGURES
- Figure 2.1 Use Case Diagram for Player Actions
- Figure 3.1 Overall System Architecture and Communication Channels
- Figure 3.2 Data Flow Diagram (DFD) - Level 0 (Context Level)
- Figure 3.3 Data Flow Diagram (DFD) - Level 1 (Process Level)
- Figure 3.4 Entity Relationship Diagram
- Figure 4.1 Simulated Renders of Traditional Games in the Web App

---

## LIST OF ABBREVIATIONS
- **THGH** - Tamil Heritage Games Hub
- **SPA** - Single Page Application
- **DFD** - Data Flow Diagram
- **ERD** - Entity Relationship Diagram
- **UML** - Unified Modeling Language
- **JWT** - JSON Web Token
- **REST** - Representational State Transfer
- **API** - Application Programming Interface
- **HTML** - HyperText Markup Language
- **CSS** - Cascading Style Sheets
- **GUI** - Graphical User Interface
- **IDE** - Integrated Development Environment
- **XP** - Experience Points

---

## CHAPTER 1: INTRODUCTION

### 1.1 Overview of the Project
Traditional board games form a significant pillar of cultural heritage, intellectual development, and historical storytelling. In Tamil Nadu, board games such as *Aadu Puli Aattam* (Goats and Tigers), *Dayakattai* (Dice game), *Pallanguzhi* (Mancala variants), and *Paramapadham* (traditional Snakes and Ladders) have been played for generations. These games are not merely recreational; they represent ancient mathematical models, strategic planning systems, and socio-ethical values. For example, Aadu Puli Aattam models asymmetrical conflict and defensive barricades, while Pallanguzhi teaches rapid division, resource management, and conservation of counts.

However, with the rapid digitization of gaming and the influx of generic video games, these traditional games are experiencing a drastic decline in physical play. The materials, rules, and nuances are quickly fading from the memory of modern generations. 

The **Tamil Heritage Games Hub (THGH)** proposed and implemented in this project addresses this critical gap by digitizing these games. It introduces a web-based, highly polished platform that allows players to engage with these games interactively on desktops and mobile devices. By providing smart AI logic, user statistics tracking, localized language translations (English/Tamil), and nostalgic canvas designs, THGH transforms cultural assets into scalable, interactive digital media.

### 1.2 Literature Survey
A study of existing systems highlights that digital preservation of folk board games is often restricted to dry academic databases or simple, basic mobile app clones plagued with ads and incorrect rule variants. While platforms like Koha provide structured cataloguing for libraries, there is a lack of general unified frameworks for traditional game assets. Commercial gaming hubs exist (e.g., chess.com), but they cater exclusively to Western/Global games.

Research papers on educational gamification highlight that regional players exhibit stronger cognitive engagement when interacting with systems localized in their mother tongue. Furthermore, implementing modern heuristic search methods (like the Minimax algorithm with alpha-beta pruning) provides challenging gameplay even without heavy 3D rendering engines. 

Thus, our survey reveals a necessity for a full-stack, localized, low-latency, and accessible portal dedicated to traditional games. A responsive SPA utilizing modern frameworks (React/Vite) coupled with a decoupled REST API backend meets these criteria effectively.

### 1.3 Proposed System
The proposed Tamil Heritage Games Hub splits operations into three distinct modules:
- **Authentication & Account Management:** Restricts score registration and title acquisition to validated accounts. Implemented using JWT tokens with secure bcryptjs encryption.
- **Interactive Gameplay Modules:** Renders custom SVG boards for Aadu Puli Aattam, Dayakattai, Pallanguzhi, and Paramapadham. Operates using client-side state machines to enforce rules, handle turns, compute AI decisions, and synthesize board sounds.
- **Statistics & Leaderboard Portal:** Fetches player logs, calculates levels, rewards coins, unlocks cultural titles, and displays rank rankings globally.

The system is built on a resilient dual-mode architecture: it runs in online mode communicating with a MongoDB database, or silently falls back to an in-memory mock engine if the database server is offline.

### 1.4 Objectives & Scope
The primary objectives of this project are:
- To design and build fully compliant, rule-enforced digital engines for four classical Tamil board games.
- To develop a responsive user interface with rich visual styling resembling traditional wood and brass boards.
- To implement multilingual support (Tamil and English) to maximize local accessibility and preserve terms.
- To incorporate sound feedback dynamically synthesized via code, bypassing heavy assets.
- To maintain a global ranking leaderboard and achievement rewards database.

The scope is currently bounded to local pass-and-play and single-player AI configurations. Network-based real-time multiplayer lobbies are defined as future extensions.

### 1.5 Organization of the Report
The remainder of this report is organized as follows: Chapter 2 outlines the requirements specification, including hardware, software, and diagrams. Chapter 3 discusses system design, database schemas, AI logic models, and test plans. Chapter 4 outlines the technology implementation details and validation results. Chapter 5 concludes the report and discusses directions for future enhancement.

---

## CHAPTER 2: REQUIREMENTS SPECIFICATION

### 2.1 Overall Description

#### 2.1.1 Product Perspective
The Library Management System is traditionally desktop-bound, but the Tamil Heritage Games Hub is designed as a modular full-stack web application. The client interface is compiled dynamically, downloading lightweight visual layers and initiating communication with an independent Express backend via REST endpoints.

#### 2.1.2 Product Functions
- Add, update, and fetch player records.
- Launch gameplay sessions in English or Tamil.
- Calculate and adjust difficulty metrics dynamically based on AI moves.
- Claim visual badges and achievements.

#### 2.1.3 User Characteristics
The system features two types of users:
- **Registered Player:** Logged in, accumulates XP, claims titles, and participates in global rankings.
- **Guest Player:** Accesses basic board mechanics immediately, bypassing profile creation.

#### 2.1.4 Operating Environment
- **Browser:** Google Chrome (v100+), Mozilla Firefox (v95+), Safari (v15+), or Microsoft Edge.
- **Server:** Node.js v18.0+ and MongoDB Community Server v6.0+.

#### 2.1.5 Constraints
- Execution of real-time stats is bounded by connection status.
- Single librarian/administrator role manages raw database queries.

---

## CHAPTER 3: SYSTEM DESIGN AND TEST PLAN

### 3.1 Decomposition Description
The project architecture features three components:
1. **Frontend View Controller:** Standardizes game states and captures movements.
2. **REST API router:** Verifies sessions and updates stats.
3. **Database connection layer:** Governs connection checks and falls back to MemoryStore arrays if needed.

### 3.2 Dependency Description
The play environment relies on active AuthContext configurations to verify if scores should be written to the database. If JWT validation returns an error, the application disables server logging and restricts statistics updates, operating safely in isolated client storage.

### 3.3 Detailed Design

#### 3.3.1 Database Design
Mongoose models structure two primary document collections:
- **User Schema:**
  - `username` (String, unique)
  - `email` (String, unique)
  - `password` (String, hashed)
  - `xp` (Number, default: 0)
  - `level` (Number, default: 1)
  - `coins` (Number, default: 100)
  - `gameStats` (Object tracking played, wins, losses, draws, and highScore for each of the 4 games)
- **GameRecord Schema:**
  - `gameType` (String: 'pallanguzhi' | 'aadupuli' | 'paramapadham' | 'dayakattai')
  - `players` (Array of Strings)
  - `winner` (String)
  - `scores` (Map of Numbers)
  - `durationSeconds` (Number)

---

## CHAPTER 4: IMPLEMENTATION AND RESULTS

### 4.1 Implementation
The technology stack consists of:
- **Client Framework:** React 18, TypeScript, Vite
- **Styling:** CSS variables (Parchment & Dark Themes), SVG layouts
- **Backend:** Node.js, Express, TypeScript, JWT, BcryptJS
- **Database:** MongoDB Atlas (Cloud) / Local MongoDB Server

### 4.2 Results
The application renders successfully across all viewport configurations:
- **Gameplay Verification:** State engine validates goat placements and tiger trapping moves correctly.
- **Performance:** Response parameters return within 1 second for database and state inquiries.
- **Dynamic sounds:** Audio oscillators synthesize tactile sound alerts dynamically.

---

## CHAPTER 5: CONCLUSION AND FUTURE WORK

### 5.1 Summary
This capstone project delivered a production-grade digital hub preserving Tamil Nadu traditional games. The full-stack app incorporates responsive, bilingual client-side boards, secure authentication, and resilient local fallback database structures.

### 5.2 Future Work
- **WebSockets integration:** Transitioning pass-and-play to remote online rooms.
- **Native mobile compilation:** Wrapping with Capacitor to target Android/iOS app stores.
- **Three.js rendering:** Transitioning SVG grids to interactive 3D board layouts.
