/**
 * Addresses: every screen has one, so the address bar says where you are, a
 * reload stays there, and a bookmark or a link opens it.
 *
 * requiem: web/screens-have-addresses
 *
 * A route `{ name, ...params }` becomes `/name?param=value`, one level deep so
 * the page's relative asset paths keep working; the map is `/`. Only plain
 * values (text, numbers, true/false) go in the address. An address carries a
 * screen's name and ids, never anything typed or personal, and the root `/`
 * reads no parameters at all: links from emails put their tokens there, and
 * those must not be copied into history.
 *
 * This module is pure (no DOM), so the checks can run it in Node.
 */

const PLAIN = new Set(['string', 'number', 'boolean']);

/**
 * What each screen allows: `roles` (who may open it from an address; any if
 * absent), `restore: false` (it needs what only the moment it opened had, such
 * as a run in progress, and can't be rebuilt from its address), and `title`
 * (for the tab and the browser's history). Extensions add theirs through
 * `addScreen(name, render, rules)`.
 */
const rules = new Map(Object.entries({
  map: {},
  skill: { title: 'Skill' },
  mode: { title: 'Choose a mode' },
  play: { restore: false, title: 'Practice' },
  summary: { restore: false, title: 'Practice' },
  teacher: { roles: ['teacher'], title: 'Console' },
  student: { roles: ['teacher'], title: 'Student' },
}));

export const CORE_SCREENS = new Set(rules.keys());

export function setScreenRules(name, screenRules = {}) {
  rules.set(name, screenRules);
}

export function screenRules(name) {
  return rules.get(name) ?? {};
}

/** The address of a route. */
export function urlFor(route) {
  if (!route?.name || route.name === 'map') return '/';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(route)) {
    if (key !== 'name' && PLAIN.has(typeof value)) query.set(key, String(value));
  }
  const q = query.toString();
  return `/${encodeURIComponent(route.name)}${q ? `?${q}` : ''}`;
}

/** The route an address names, or null for the root or anything that isn't a screen's address. */
export function routeFromUrl(pathname, search = '') {
  const name = decodeURIComponent(pathname.replace(/^\/+|\/+$/g, ''));
  if (!/^[a-z][a-z0-9-]*$/.test(name) || name === 'map') return null;
  const route = { name };
  for (const [key, value] of new URLSearchParams(search)) {
    if (key === 'name') continue;
    route[key] = /^-?\d{1,15}$/.test(value) ? Number(value)
      : value === 'true' ? true : value === 'false' ? false : value;
  }
  return route;
}

/**
 * Where someone who arrived at `route`'s address should start, or null for
 * their usual home: the screen must exist (`known(name)`), allow their role,
 * and be one an address can rebuild. A practice run can't be: its address
 * opens the skill instead.
 */
export function startingRoute(route, me, known) {
  if (!route || !me || !known(route.name)) return null;
  const r = screenRules(route.name);
  if (r.roles && !r.roles.includes(me.role)) return null;
  if (r.restore === false) return route.skillId ? { name: 'skill', skillId: route.skillId } : null;
  return route;
}

/** The tab's title for a route, with the app's own name after it. */
export function titleFor(route, appName) {
  if (!route?.name || route.name === 'map' || route.name === 'login') return appName;
  const own = screenRules(route.name).title
    ?? route.name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  return `${own} · ${appName}`;
}
