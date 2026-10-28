// Mobile navigation
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Contact form: submit to the Worker (/api/contact) without leaving the page
const form = document.querySelector(".contact-form");
if (form) {
  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');
  const say = (msg, kind) => { status.textContent = msg; status.className = `form-status ${kind}`; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll("[required]").forEach((f) => {
      const ok = f.checkValidity();
      f.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      say("Please fill in your first name, a valid email and a message.", "err");
      firstInvalid.focus();
      return;
    }

    button.disabled = true;
    say("Sending…", "");
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
      form.reset();
      say("Thank you! Your message has been sent. We'll get back to you soon.", "ok");
    } catch {
      const email = document.querySelector('.contact-details a[href^="mailto:"]');
      say(`Sorry, something went wrong. Please email us at ${email ? email.textContent : "our address above"}.`, "err");
    } finally {
      button.disabled = false;
    }
  });
}
