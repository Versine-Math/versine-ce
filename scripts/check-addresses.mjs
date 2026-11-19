/**
 * Addresses: a route and its address turn into each other, the root reads no
 * parameters (an emailed link's token stays out of history), and an address
 * opens only a screen that exists, for someone allowed it, that can be rebuilt.
 *
 * requiem: web/screens-have-addresses
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const a = await import(join(ROOT, 'web/ui/addresses.js'));

const fail = [];
const check = (ok, what) => { if (!ok) fail.push(what); };
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const back = (route) => {
  const url = new URL(a.urlFor(route), 'https://example.test');
  return a.routeFromUrl(url.pathname, url.search);
};

check(a.urlFor({ name: 'map' }) === '/', 'the map is the root');
check(a.urlFor({ name: 'teacher' }) === '/teacher', 'a screen is /name');
check(a.urlFor({ name: 'mode', skillId: 'integers-add', level: 2 }) === '/mode?skillId=integers-add&level=2',
  'parameters go in the query');
check(same(back({ name: 'mode', skillId: 'integers-add', level: 2 }), { name: 'mode', skillId: 'integers-add', level: 2 }),
  'a route comes back from its address, numbers as numbers');
check(same(back({ name: 'student', id: 42 }), { name: 'student', id: 42 }), 'an id comes back as a number');
check(a.urlFor({ name: 'play', skillId: 's', origin: { from: 'map' }, run: null }) === '/play?skillId=s',
  'only plain values go in an address');
check(a.routeFromUrl('/', '?verify=secret') === null, 'the root reads no parameters, so a token never enters a route');
check(a.routeFromUrl('/index.html', '') === null && a.routeFromUrl('/a/b', '') === null
  && a.routeFromUrl('/Family', '') === null, 'only a bare lowercase name is a screen\'s address');

const known = (name) => a.CORE_SCREENS.has(name) || name === 'family';
const teacher = { role: 'teacher' };
const student = { role: 'student' };
a.setScreenRules('family', { roles: ['teacher'], title: 'Family' });
check(same(a.startingRoute({ name: 'family', tab: 'account' }, teacher, known), { name: 'family', tab: 'account' }),
  'a parent starts on the screen the address named');
check(a.startingRoute({ name: 'family' }, student, known) === null, 'a screen not for this role sends them home');
check(a.startingRoute({ name: 'teacher' }, student, known) === null, 'the console is for teachers only');
check(a.startingRoute({ name: 'nowhere' }, teacher, known) === null, 'an unknown screen sends them home');
check(a.startingRoute({ name: 'family' }, null, known) === null, 'nobody signed in starts nowhere yet');
check(same(a.startingRoute({ name: 'play', skillId: 'x', level: 1 }, student, known), { name: 'skill', skillId: 'x' }),
  'a practice run can\'t be rebuilt: its address opens the skill');
check(a.titleFor({ name: 'family' }, 'Versine') === 'Family · Versine' && a.titleFor({ name: 'map' }, 'Versine') === 'Versine'
  && a.titleFor({ name: 'add-student' }, 'Versine') === 'Add student · Versine', 'each screen titles the tab');

if (fail.length) {
  console.log(`${fail.length} address check(s) failed:`);
  for (const f of fail) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('addresses: every check passed — routes and addresses, the root, roles and rebuilding');
