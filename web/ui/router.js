/**
 * Shared app state and the world's smallest router. Screens import from here
 * rather than from app.js so there is no import cycle.
 */
import { startingRoute, titleFor, urlFor } from './addresses.js';

export const state = {
  me: null,
  users: [],
  needsSetup: false,
  progress: null,
  route: { name: 'login' },
};

let renderer = () => {};
export const setRenderer = (fn) => { renderer = fn; };
export const rerender = () => renderer();

/**
 * Every move is a history entry, so the browser's back button and Android's
 * back gesture step back through the app instead of out of it -- leaving
 * mid-run used to lose the run unsaved.
 *
 * A screen with something to finish first (a run in progress) registers a
 * guard, and a back press goes through it: the play screen files the run,
 * then goes where the press pointed.
 */
let leaveGuard = null;
export const setLeaveGuard = (fn) => { leaveGuard = fn; };
let fromHistory = false;

// The app's own name, for the tab's title: index.html's title as first loaded.
const APP_NAME = typeof document !== 'undefined' ? document.title : '';

/**
 * Each entry carries the screen's address too (requiem: web/screens-have-addresses),
 * so the address bar says where you are and a reload or a bookmark comes back there.
 */
// Each entry also carries `depth`, its count of app entries before it, so a screen's
// own Back can tell whether the browser's back stays in the app: a page opened
// straight from its address has nothing of the app's behind it.
function record(route, replace) {
  const depth = history.state?.depth ?? 0;
  try {
    if (replace) history.replaceState({ route, depth }, '', urlFor(route));
    else history.pushState({ route, depth: depth + 1 }, '', urlFor(route));
  } catch { /* a route that cannot be cloned is still a route */ }
  document.title = titleFor(route, APP_NAME);
}

/** @param {{replace?: boolean}} [opts] replace the current entry rather than add one */
export function go(route, { replace = false } = {}) {
  state.route = route;
  // A move made in answer to a back press is already in history.
  record(route, fromHistory || replace);
  fromHistory = false;
  renderer();
  window.scrollTo(0, 0);
}

// The route the page's address named when it loaded, until someone signed in can be taken there.
let wanted = null;
export function rememberAddress(route) { wanted = route; }

/**
 * Where this person should start: the screen the address named, if they may
 * open it and it can be rebuilt from an address, else null for their usual
 * home. Used once; `state.fromAddress` then tells an extension not to send
 * them elsewhere. `known(name)` says whether a screen by that name exists.
 */
export function takeStartRoute(me, known) {
  const route = startingRoute(wanted, me, known);
  wanted = null;
  if (route) state.fromAddress = true;
  return route;
}

/**
 * Change the current route's details -- a tab picked within a screen -- and its
 * address, without drawing the screen again or adding a history entry.
 */
export function replaceRoute(route) {
  state.route = route;
  record(route, true);
}

window.addEventListener('popstate', (e) => {
  const route = e.state?.route;
  if (!route || !state.me) return;
  fromHistory = true;
  if (leaveGuard) leaveGuard(route);
  else go(route);
});
