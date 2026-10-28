# Sikkim Project Management Foundation website

Static site (plain HTML/CSS/JS, no build step) deployed as a Cloudflare Worker
with static assets. Email is hosted by Migadu.

## Structure

```
public/                   Everything served as-is
  iil/index.html          IIL – Capacity Building page
  assets/css/styles.css   Styles (brand colours: deep teal, cream, orange, gold)
  assets/js/main.js       Mobile menu + contact form submission
  assets/img/             Logo, favicon, photos
  _redirects              Redirects (old Wix URLs → new pages)
  _headers                Security and cache headers
  404.html                Not-found page
src/worker.js             Worker: handles /api/contact, everything else is static
src/contact.js            Emails contact form submissions
wrangler.jsonc            Cloudflare config
```

## Preview locally

```sh
npx wrangler dev
```

Then open http://localhost:8787/iil/.

## Deploy on Cloudflare (Workers Builds)

The Cloudflare project is connected to this GitHub repository and runs
`npx wrangler deploy` on every push to the production branch (`main`).

- Build command: empty. Deploy command: `npx wrangler deploy`.
- The `name` in `wrangler.jsonc` must match the Worker's name in the dashboard.
- Variables and secrets (Worker → Settings → Variables and Secrets):
  - `RESEND_API_KEY` (as a secret)
  - `CONTACT_TO` – the Migadu inbox that should receive messages
  - `CONTACT_FROM` – e.g. `IIL Website <website@sikkimprojectmanagementfoundation.org>`
- Custom domain: Worker → Settings → Domains & Routes → add
  `www.sikkimprojectmanagementfoundation.org`.

## Email (Migadu) and the contact form

Migadu hosts the mailboxes. Keep Migadu's MX, SPF, DKIM and DMARC records in
Cloudflare DNS exactly as Migadu's DNS setup page lists them, and leave
**Cloudflare Email Routing turned off** (it would replace Migadu's MX records).

Migadu has no HTTP API for sending, so the contact form sends through
[Resend](https://resend.com) to the Migadu inbox:

1. Create a Resend account and verify the domain. Resend asks for DKIM/SPF
   records on a `send.` subdomain, so they don't clash with Migadu's records.
2. Create an API key and save it as `RESEND_API_KEY` on the Worker.

Replies to form messages go straight to the visitor (the function sets `reply_to`).
