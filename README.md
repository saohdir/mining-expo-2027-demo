# IMDX 2027 — Public Marketing Frontend (Pre-Go-Live UAT)

This repository holds the IMDX 2027 **public marketing pages, photography, logos, and editorial content**. It is no longer a mocked registration / QR / payment demo.

The companion [mining-expo-2027-backend](https://github.com/saohdir/mining-expo-2027-backend) implements the dynamic UAT customer account, booking, manual invoice/payment, CMS, booth floorplan and QR scanner.

**Deployment model:** The HTML in this repo should be mounted as the public website at `/` and the Next.js app at `/account`, `/admin` and `/api` on the **same UAT HTTPS domain**, following the backend's `docs/UAT_DEPLOYMENT.md`.

**Important:** The existing [GitHub Pages site](https://saohdir.github.io/mining-expo-2027-demo/) is only a *static design/content preview*. Account buttons cannot actually register users or process payments there. Those functions require a configured dynamic server and PostgreSQL with valid SMTP/SMS settings. The UAT environment has NOT been deployed from this repository.

## Monetary and admission policy

- **No Midtrans, QRIS or automatic payment gateway**. Finance verifies organizer-issued manual bank transfers.
- No payment form, customer database, or QR scanner is served by GitHub Pages.
- Each exhibitor booth request specifies preferred units and custom m² but is not an automatic hold or assignment.
- Real attendee QR verification happens exclusively in the authenticated CMS.
- Public UAT registration remains disabled until organizer sign-off; don't add fake payment/QR modals.

## Content pages

Home; About Exhibition; Exhibition Scope; Why Exhibit; Visitor Information; Conferences & Networking; News; Photo Highlights; Venue; Organizers & Partners; Contact.

All event content, images and brand-use permissions must be reviewed before go-live. See [MEDIA_CREDITS.md](MEDIA_CREDITS.md).

Repository slug `mining-expo-2027-demo` is retained for continuity with past links; the website is intended as a source component for the actual IMDX UAT platform.
