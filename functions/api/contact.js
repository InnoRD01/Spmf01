// Cloudflare Pages Function: POST /api/contact
//
// Migadu hosts the mailbox but has no HTTP sending API, and Workers can't
// speak SMTP easily, so mail is sent through Resend (https://resend.com) to
// the Migadu inbox. Configure in Cloudflare Pages → Settings → Variables:
//   RESEND_API_KEY  (secret)
//   CONTACT_TO      e.g. hello@sikkimprojectmanagementfoundation.org
//   CONTACT_FROM    e.g. "IIL Website <website@sikkimprojectmanagementfoundation.org>"

const MAX = { first_name: 100, last_name: 100, email: 200, phone: 40, interest: 100, message: 5000 };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid form data" }, 400);
  }

  // Honeypot: bots fill every field; pretend success so they move on
  if (form.get("website")) return json({ ok: true });

  const data = {};
  for (const [key, max] of Object.entries(MAX)) {
    data[key] = String(form.get(key) || "").trim().slice(0, max);
  }
  if (!data.first_name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, error: "Please provide your name, a valid email and a message." }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ ok: false, error: "Contact form is not configured" }, 500);
  }

  const name = `${data.first_name} ${data.last_name}`.trim();
  const text = [
    `Name: ${name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "-"}`,
    `Interested in: ${data.interest || "-"}`,
    "",
    data.message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: data.email,
      subject: `IIL website: ${data.interest || "Message"} from ${name}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return json({ ok: false, error: "Could not send message" }, 502);
  }
  return json({ ok: true });
}
