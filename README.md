# Sikkim Project Management Foundation website

Static site (plain HTML/CSS/JS, no build step) hosted on Cloudflare Pages.
Email is hosted by Migadu.

## Structure

```
iil/index.html            IIL – Capacity Building page
assets/css/styles.css     Styles (brand colours: deep teal, cream, orange, gold)
assets/js/main.js         Mobile menu + contact form submission
assets/img/               Logo, favicon, photos
functions/api/contact.js  Cloudflare Pages Function that emails form submissions
_redirects                Redirects (old Wix URLs → new pages)
_headers                  Security and cache headers
404.html                  Not-found page
```

## Preview locally

```sh
npx wrangler pages dev .
```

Then open http://localhost:8788/iil/. (Any static server works for the page
itself; `wrangler` is needed for the contact form function.)

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pick this repository and the production branch.
3. Build settings: Framework preset **None**, build command **empty**,
   output directory **/**.
4. Add environment variables (Settings → Variables and Secrets):
   - `RESEND_API_KEY` (encrypt as a secret)
   - `CONTACT_TO` – the Migadu inbox that should receive messages
   - `CONTACT_FROM` – e.g. `IIL Website <website@sikkimprojectmanagementfoundation.org>`
5. Custom domains → add `www.sikkimprojectmanagementfoundation.org`.

## Email (Migadu) and the contact form

Migadu hosts the mailboxes. Keep Migadu's MX, SPF, DKIM and DMARC records in
Cloudflare DNS exactly as Migadu's DNS setup page lists them, and leave
**Cloudflare Email Routing turned off** (it would replace Migadu's MX records).

Migadu has no HTTP API for sending, so the contact form sends through
[Resend](https://resend.com) to the Migadu inbox:

1. Create a Resend account and verify the domain. Resend asks for DKIM/SPF
   records on a `send.` subdomain, so they don't clash with Migadu's records.
2. Create an API key and save it as `RESEND_API_KEY` in Cloudflare Pages.

Replies to form messages go straight to the visitor (the function sets `reply_to`).
