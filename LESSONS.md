# Lessons learned: SPMF / IIL website

What we learned rebuilding the IIL – Capacity Building page (moving it off Wix
onto GitHub + Cloudflare, with email on Migadu). Written so the next project
on the same stack goes faster.

## Costs: what is free and what is not

- **Cloudflare gives free Workers, not free domains.** Hosting, DNS, TLS
  certificates and the `workers.dev` address are free. A custom domain is
  always paid, even through Cloudflare Registrar.
- **Free DNS is not a free domain.** Cloudflare's free DNS tier manages
  domains you already own; it doesn't give you one.
- **Domain prices depend on the ending.** Cloudflare Registrar sells at cost,
  with no markup and no renewal jump: `.org` / `.com` about US$10–11 a year,
  `.io` / `.ai` much more. Cloudflare doesn't sell `.in`; buy that from an
  Indian registrar (about ₹500–900 a year) and point its nameservers to Cloudflare.
- **One domain covers a whole project.** Subdomains (`www.`, `iil.`) and extra
  mailboxes on it cost nothing more.
- **Migadu's free trial allows only one custom domain.** Adding more domains
  needs a paid plan (Micro covers every domain on the account).

## Cloudflare

- **Pages and Workers are different products.** "Import a repository" in the
  current dashboard creates a *Worker*. A Worker needs a `wrangler.jsonc`
  that points at a folder of static files (`public/`). Pages-only features,
  like a `functions/` folder, don't run on Workers. Our first build failed
  with "Could not detect a directory containing static files" for this reason.
- **Only the production branch (`main`) is deployed.** Work on other branches
  goes live only after it's merged into `main`.
- **`name` in `wrangler.jsonc` must match the Worker's name in the dashboard**
  (here: `spmfweb`).
- **A new Worker has no public address by default.** "No URLs enabled" means
  `workers.dev` is off: turn it on under Settings → Domains & Routes.
- **The `workers.dev` account subdomain is shared by every Worker** on the
  account (`<worker>.<account-subdomain>.workers.dev`). Rename it once, before
  sharing any links, because renaming later breaks every existing link.
- **One account can host many sites:** one GitHub repo → one Worker. Static
  files are served free and unlimited; only code that runs (like the contact
  form endpoint) counts toward the free daily request limit.

## Email (Migadu)

- **Migadu needs a domain you own.** It can't be used with a `workers.dev`
  address, because you can't add MX/SPF/DKIM/DMARC records to Cloudflare's domain.
- **Cloudflare Email Routing and Migadu can't share a domain.** Both need the
  domain's MX records. Email Routing is fine as a placeholder before launch;
  turn it off before switching to Migadu.
- **Migadu has no HTTP API for sending,** so a website contact form can't send
  through it directly. Ours sends through Resend into the Migadu inbox, which
  also keeps form traffic off Migadu Micro's 20 outgoing messages a day.
- **Every new account (e.g. Resend) should be created with the operations
  address**, not a personal one, so the project doesn't depend on one person.

## Process

- **Test locally before pushing:** `npx wrangler deploy --dry-run` and
  `npx wrangler dev`. Both catch config errors before Cloudflare does.
- **Start every repo with a `.gitignore`** that excludes `.wrangler/` and
  `node_modules/`. We once committed wrangler's local cache by accident.
- **Check the old site's content, not just its look.** The Wix page had a
  broken email address, key numbers buried in a paragraph, no clear "join"
  button, images without descriptions and messy page addresses.
- **Update the architecture document:** its runbook (step 04) says Cloudflare
  Pages; we deploy on Workers.

## Still open

- Rename the `workers.dev` account subdomain, then share the link.
- Images folder and the other Wix pages (Home, Services, About, Contact).
- Keep the contact form (needs Resend) or switch to a plain email link.
- Later: buy the domain, set up Migadu `hello@`, attach the domain to the Worker.
