---
id: screens-have-addresses
namespace: web
kind: design
modality: must
status: active
provenance:
    type: dialogue
created_at: 2026-11-18T17:57:07.622783911Z
relationships:
    - to: server/extensions/extension-points
      type: refines
      via: link
    - to: catalogue/graph/gate-guards-every-route
      type: depends_on
      via: link
---

Every screen has an address, so the address bar says where you are, a reload stays there, a bookmark or a new tab opens it, a link can point at it, and the browser's history lists distinct places. A route {name, ...params} is /name?param=value, one level deep so index.html's relative asset paths keep working; the map is /. Only plain values go in an address (text, numbers, true/false): a screen's name and ids, never anything typed or personal. The root reads no parameters, because emailed links put their one-time tokens there and those must not be copied into a route or history. On load the address is read once: the screen opens if it exists, the person's role may open it (addScreen's roles; the console and a student's page are for teachers) and it can be rebuilt from an address (restore: false otherwise; a practice run's address opens its skill). Signed out, it opens once they sign in; anything else falls back to their usual home. The server answers a bare lowercase name with the app's page and keeps a missing file or an unknown /api path a 404. Each history entry records its depth, so a screen's own Back uses the browser's back only while that stays in the app. When the person signed in changes (sign-out, a hand-over), the page starts again at / rather than reloading the address, so the next person is never taken to the last one's screen. SEO was not the reason: everything behind sign-in is not for search engines. Chosen on 2026-11-18 at Versine's owner's request.
