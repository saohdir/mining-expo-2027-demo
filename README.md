# IMDX 2027 — interactive concept preview

Client presentation prototype for **Indonesia Mining & Downstream Industries Exhibition 2027** (26–28 May 2027, JIEXPO Jakarta, Indonesia).

**This repository contains a demo, not an official exhibition registration platform.** Registration, booth requests, payment, and QR validation are simulated locally in the browser. Nothing is submitted, charged, saved to a server, or recognized for event admission.

## What can visitors explore?

- Responsive marketing homepage, exhibition scope, conference programs, venue, and FAQ.
- Booth request concept with available size choices: 9, 18, 36, 72, 90, 108, 144, 180, and 240 m².
- Participant registration, simulated checkout options, sample QR pass, participant dashboard, and simulated organizer check-in.
- Follows the supplied warm orange/cream design system and original typography and layout inspiration.

## Run locally

Open `index.html` or serve the folder with `python -m http.server 8000`. No `npm install`, database, or server configuration required.

## GitHub Pages

This is a static website. GitHub Pages can serve it from `main` / root (Settings → Pages), or via the included Pages workflow if Pages Actions deployment is enabled on the repository.

## Production considerations

A real system will require a secure server, authentication, staff authorization, Midtrans merchant onboarding and webhook verification, unique signed QR tokens, event access control, and privacy/security reviews. The prototype implements **none** of these real-world services.

Concept by Ridho Ariq Setyawan — Freelance Web Development.