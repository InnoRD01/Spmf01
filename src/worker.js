// Static files in public/ are served directly by Workers Static Assets.
// Only requests that don't match a file reach this Worker.
import { handleContact } from "./contact.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
      }
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
