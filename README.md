A carpool-matching and commute companion app for University of Houston students. Built from user research to a deployed, production application handling real user data.

**Live app**: https://coogcommute.vercel.app

**Features**

- UH-verified authentication: passwordless magic-link sign-in restricted to @cougarnet.uh.edu addresses

- Real carpool matching: students create a profile (neighborhood, schedule, optional women-only filter) and browse other verified students

- Driver ratings: after a completed ride, riders rate their driver; ratings are aggregated automatically and securely via database triggers

- Gas & toll split calculator: live geocoding and distance calculation for any address, not a hardcoded lookup table

- Campus alerts: manually-curated UH-specific event and parking alerts

- Responsive design: built mobile-first, tested across phone and desktop breakpoints


**Tech stack**


- Frontend: React, Vite, React Router, Tailwind CSS, Framer Motion

- Backend/Database: Supabase (PostgreSQL, Auth, Row-Level Security)

- Hosting: Vercel

- Design: Figma (low- and high-fidelity wireframes, user flows)
