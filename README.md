# IMDX 2027 — interactive concept preview

Client presentation prototype for **Indonesia Mining & Downstream Industries Exhibition 2027** (26–28 May 2027, JIEXPO Jakarta, Indonesia).

**This repository contains a demo, not an official exhibition registration platform.** Registration, booth requests, payment, and QR validation are simulated locally in the browser. Nothing is submitted, charged, saved to a server, or recognized for event admission.

## What can visitors explore?

- Responsive marketing homepage, exhibition scope, conference programs, venue, and FAQ.
- Booth request concept with available size choices: 9, 18, 36, 72, 90, 108, 144, 180, and 240 m².
- Participant registration, simulated checkout options, sample QR pass, participant dashboard, and simulated organizer check-in.
- Adds an exhibition-style photo-led homepage, news editorial previews, programme overview, animated industry photo reel, visual gallery, and organizer information.\n- Retains the original brand-independent IMDX identity and the interactive visitor/exhibitor/QR concepts.\n- Uses licensed stock photos rather than reproducing images, logo assets or video footage from the reference website; see [MEDIA_CREDITS.md](MEDIA_CREDITS.md).

## Run locally

Open `index.html` or serve the folder with `python -m http.server 8000`. No `npm install`, database, or server configuration required.

## Publish with GitHub Pages

This is a static website; no GitHub Actions workflow, build step, or hosting subscription is needed.

1. Open repository **Settings → Pages**.
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Under **Branch**, select **`main`** and **`/(root)`**, then click **Save**.
4. Once GitHub finishes publishing, open **https://saohdir.github.io/mining-expo-2027-demo/**.

If the page initially shows 404, check the deployment status shown under Settings → Pages. The source file `index.html` is at the root of `main`.

## Production considerations

A real system will require a secure server, authentication, staff authorization, Midtrans merchant onboarding and webhook verification, unique signed QR tokens, event access control, and privacy/security reviews. The prototype implements **none** of these real-world services.

Concept by Ridho Ariq Setyawan — Freelance Web Development.