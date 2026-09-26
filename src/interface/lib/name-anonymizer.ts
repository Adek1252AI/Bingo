/**
 * Name anonymization for bingo board display.
 *
 * Maps personal names (character/actor names from movie word pools) to
 * anonymized icon+label pairs for display purposes only.
 *
 * The underlying word data is preserved — all game logic (daub tracking,
 * win detection, share links) continues to use the original words.
 * This module only affects what the player sees on the board.
 */

export interface AnonymizedDisplay {
  /** Icon emoji or short symbol */  
  icon: string;
  /** Short generic label shown alongside the icon */
  label: string;
}

/**
 * Returns an anonymized display for a word if it matches a known personal
 * name, or null if the word should be shown as-is.
 *
 * Matching is case-insensitive and trims surrounding whitespace.
 */
export function anonymizeWord(word: string): AnonymizedDisplay | null {
  const key = word.trim().toLowerCase();

  const map: Record<string, AnonymizedDisplay> = {
    // ── Star Wars ──────────────────────────────────────────────
    'yoda':                { icon: '🧙', label: 'Mentor' },
    'luke skywalker':      { icon: '🦸', label: 'Hero' },
    'darth vader':         { icon: '🦹', label: 'Villain' },
    'obi-wan kenobi':      { icon: '🧙', label: 'Mentor' },
    'han solo':            { icon: '🏴‍☠️', label: 'Rogue' },
    'princess leia':       { icon: '👑', label: 'Leader' },
    'chewbacca':           { icon: '🐻', label: 'Warrior' },
    'boba fett':           { icon: '🔫', label: 'Hunter' },
    'mace windu':          { icon: '⚔️', label: 'General' },
    'qui-gon jinn':        { icon: '🧙', label: 'Mentor' },
    'darth maul':          { icon: '🦹', label: 'Villain' },
    'clone trooper':       { icon: '⚔️', label: 'Soldier' },

    // ── Harry Potter ───────────────────────────────────────────
    'harry potter':        { icon: '🦸', label: 'Hero' },
    'hermione':            { icon: '📚', label: 'Scholar' },
    'ron':                 { icon: '🤝', label: 'Friend' },
    'dumbledore':          { icon: '🧙', label: 'Mentor' },
    'snape':               { icon: '🎓', label: 'Teacher' },
    'voldemort':           { icon: '🦹', label: 'Villain' },
    'hagrid':              { icon: '🛡️', label: 'Guardian' },

    // ── The Matrix ─────────────────────────────────────────────
    'neo':                 { icon: '🦸', label: 'Hero' },
    'morpheus':            { icon: '🧙', label: 'Mentor' },
    'trinity':             { icon: '🥋', label: 'Fighter' },
    'oracle':              { icon: '🔮', label: 'Seer' },
    'agent smith':         { icon: '🕴️', label: 'Agent' },
    'cypher':              { icon: '🎭', label: 'Traitor' },
    'tank':                { icon: '🖥️', label: 'Operator' },
    'dozer':               { icon: '🖥️', label: 'Operator' },
    'switch':              { icon: '🎛️', label: 'Operator' },

    // ── Jurassic Park ──────────────────────────────────────────
    'john hammond':        { icon: '🏢', label: 'Visionary' },
    'alan grant':          { icon: '🦕', label: 'Paleontologist' },
    'ellie sattler':       { icon: '🌿', label: 'Paleontologist' },
    'ian malcolm':         { icon: '📊', label: 'Theorist' },
    'lex':                 { icon: '👧', label: 'Kid' },
    'tim':                 { icon: '👦', label: 'Kid' },
    'dr. grant':           { icon: '🦕', label: 'Paleontologist' },

    // ── The Godfather ──────────────────────────────────────────
    'michael':             { icon: '🎩', label: 'Son' },
    'sonny':               { icon: '🔥', label: 'Brother' },
    'tom hagen':           { icon: '⚖️', label: 'Advisor' },
    'kay':                 { icon: '🌸', label: 'Wife' },
    'marlon brando':       { icon: '🎬', label: 'Actor' },
    'al pacino':           { icon: '🎬', label: 'Actor' },
    'luca brasi':          { icon: '🗡️', label: 'Enforcer' },

    // ── Pulp Fiction ───────────────────────────────────────────
    'vincent vega':        { icon: '🔫', label: 'Hitman' },
    'jules winnfield':     { icon: '🔫', label: 'Hitman' },
    'marsellus wallace':   { icon: '👔', label: 'Boss' },
    'mia wallace':         { icon: '💃', label: 'Boss\'s Wife' },
    'pumpkin':             { icon: '🎃', label: 'Robber' },
    'honey bunny':         { icon: '🎃', label: 'Robber' },

    // ── Notting Hill ───────────────────────────────────────────
    'william thacker':     { icon: '📖', label: 'Bookshop Owner' },
    'anna scott':          { icon: '🌟', label: 'Actress' },
    'julia roberts':       { icon: '🌟', label: 'Actress' },
    'hugh grant':          { icon: '🎬', label: 'Actor' },

    // ── Indiana Jones ──────────────────────────────────────────
    'marion ravenwood':    { icon: '🏛️', label: 'Adventurer' },
    'short round':         { icon: '🥋', label: 'Sidekick' },

    // ── Lord of the Rings ──────────────────────────────────────
    'frodo':               { icon: '💍', label: 'Ring-bearer' },
    'sam':                 { icon: '🤝', label: 'Loyal Friend' },
    'gandalf':             { icon: '🧙', label: 'Wizard' },
    'aragorn':             { icon: '⚔️', label: 'Ranger' },
    'legolas':             { icon: '🏹', label: 'Elf' },
    'gimli':               { icon: '🪓', label: 'Dwarf' },
    'gollum':              { icon: '🐟', label: 'Creature' },
    'galadriel':           { icon: '✨', label: 'Elf Queen' },
    'treebeard':           { icon: '🌳', label: 'Ent' },
    'boromir':             { icon: '🛡️', label: 'Warrior' },

    // ── Gladiator ──────────────────────────────────────────────
    'maximus':             { icon: '⚔️', label: 'General' },
    'commodus':            { icon: '👑', label: 'Emperor' },
    'seneca':              { icon: '📜', label: 'Advisor' },
    'maximus decimus meridius': { icon: '⚔️', label: 'General' },
  };

  return map[key] ?? null;
}

/**
 * Returns true if a word is a known personal name that should be
 * anonymized on the board.
 */
export function isPersonalName(word: string): boolean {
  return anonymizeWord(word) !== null;
}
