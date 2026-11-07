/**
 * Game modes. A mode is a small policy object -- it never generates problems
 * or touches the DOM, it only decides how a run starts, ends, and is judged.
 *
 * Two modes, on purpose: one to learn in, one to prove it in. Every extra mode
 * is another decision between a kid and the math.
 *
 * @typedef {object} Mode
 * @property {string} id
 * @property {string} name
 * @property {string} glyph
 * @property {string} blurb
 * @property {boolean} [allowExplain]    offer the "why?" button
 * @property {boolean} [allowRetryQueue] re-serve missed problems later
 * @property {boolean} [scored]
 * @property {boolean} [gate]            passing unlocks the next level
 * @property {number}  [duration]        seconds
 * @property {number}  [target]          correct answers needed to pass
 */

/** @type {Record<string, Mode>} */
export const MODES = {
  practice: {
    id: 'practice',
    name: 'Practice',
    glyph: '∞',
    blurb: 'No clock, no limit. Ask why whenever you like, and wrong answers '
      + 'just come back around.',
    allowExplain: true,
    allowRetryQueue: true,
    scored: false,
  },

  trial: {
    id: 'trial',
    name: 'Time Trial',
    glyph: '⏱',
    blurb: 'Solve enough before the clock runs out and the next level unlocks. '
      + 'Mistakes cost you time, not lives.',
    duration: 300,
    target: 12,
    scored: true,
    gate: true,
  },
};

export const MODE_ORDER = ['practice', 'trial'];

/**
 * How a Time Trial's size follows the work. A trial runs about five minutes at
 * the level's expected pace, so a level of quick problems asks for twelve and a
 * level where one problem takes minutes asks for one or two. The last level
 * mixes every earlier one and counts as a review, so it asks for six where six
 * fit in seven minutes.
 */
// requiem: play/clock/trial-fits-the-level
export const TRIAL_SIZE = {
  typicalSeconds: 300,
  fewest: 1,
  most: 12,
  lastLevelFewest: 6,
  lastLevelLongestSeconds: 420,
};

/** Correct answers to ask for, from the seconds one problem is expected to take. */
export function trialTarget(parSeconds, isLastLevel = false) {
  const { typicalSeconds, fewest, most, lastLevelFewest, lastLevelLongestSeconds } = TRIAL_SIZE;
  const fit = Math.max(fewest, Math.min(most, Math.round(typicalSeconds / parSeconds)));
  if (!isLastLevel) return fit;
  return Math.max(fit, Math.min(lastLevelFewest, Math.floor(lastLevelLongestSeconds / parSeconds)));
}

/**
 * Time Trial settings for one level. `pace` is the expected seconds per problem,
 * the fixed standard a student's speed is measured against.
 *
 * @param {{parSeconds?:number, isLastLevel?:boolean}} [levelDef]
 * @returns {{pace:number, target:number}}
 */
export function trialSettings(levelDef) {
  const pace = levelDef?.parSeconds ?? MODES.trial.duration / MODES.trial.target;
  return { pace, target: trialTarget(pace, levelDef?.isLastLevel) };
}

/** "3 min", "2 min 30 s", "90 s" */
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}
