import { describe, it, expect } from 'vitest';
import { anonymizeWord, isPersonalName } from '@/interface/lib/name-anonymizer';

describe('name-anonymizer', () => {
  describe('anonymizeWord', () => {
    it('returns null for non-personal words', () => {
      expect(anonymizeWord('Jedi')).toBeNull();
      expect(anonymizeWord('Lightsaber')).toBeNull();
      expect(anonymizeWord('Hogwarts')).toBeNull();
      expect(anonymizeWord('FREE')).toBeNull();
      expect(anonymizeWord('The Force')).toBeNull();
    });

    it('anonymizes Star Wars character names (case-insensitive)', () => {
      expect(anonymizeWord('Yoda')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('yoda')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('  YODA  ')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('Darth Vader')).toEqual({ icon: '🦹', label: 'Villain' });
      expect(anonymizeWord('DARTH VADER')).toEqual({ icon: '🦹', label: 'Villain' });
      expect(anonymizeWord('Han Solo')).toEqual({ icon: '🏴‍☠️', label: 'Rogue' });
      expect(anonymizeWord('Princess Leia')).toEqual({ icon: '👑', label: 'Leader' });
      expect(anonymizeWord('Obi-Wan Kenobi')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('Clone Trooper')).toEqual({ icon: '⚔️', label: 'Soldier' });
    });

    it('anonymizes Harry Potter character names', () => {
      expect(anonymizeWord('Harry Potter')).toEqual({ icon: '🦸', label: 'Hero' });
      expect(anonymizeWord('Hermione')).toEqual({ icon: '📚', label: 'Scholar' });
      expect(anonymizeWord('Ron')).toEqual({ icon: '🤝', label: 'Friend' });
      expect(anonymizeWord('Dumbledore')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('Snape')).toEqual({ icon: '🎓', label: 'Teacher' });
      expect(anonymizeWord('Voldemort')).toEqual({ icon: '🦹', label: 'Villain' });
      expect(anonymizeWord('Hagrid')).toEqual({ icon: '🛡️', label: 'Guardian' });
    });

    it('anonymizes The Matrix character names', () => {
      expect(anonymizeWord('Neo')).toEqual({ icon: '🦸', label: 'Hero' });
      expect(anonymizeWord('Morpheus')).toEqual({ icon: '🧙', label: 'Mentor' });
      expect(anonymizeWord('Trinity')).toEqual({ icon: '🥋', label: 'Fighter' });
      expect(anonymizeWord('Oracle')).toEqual({ icon: '🔮', label: 'Seer' });
      expect(anonymizeWord('Agent Smith')).toEqual({ icon: '🕴️', label: 'Agent' });
    });

    it('anonymizes Jurassic Park character names', () => {
      expect(anonymizeWord('John Hammond')).toEqual({ icon: '🏢', label: 'Visionary' });
      expect(anonymizeWord('Alan Grant')).toEqual({ icon: '🦕', label: 'Paleontologist' });
      expect(anonymizeWord('Ellie Sattler')).toEqual({ icon: '🌿', label: 'Paleontologist' });
      expect(anonymizeWord('Ian Malcolm')).toEqual({ icon: '📊', label: 'Theorist' });
      expect(anonymizeWord('Lex')).toEqual({ icon: '👧', label: 'Kid' });
      expect(anonymizeWord('Tim')).toEqual({ icon: '👦', label: 'Kid' });
      expect(anonymizeWord('Dr. Grant')).toEqual({ icon: '🦕', label: 'Paleontologist' });
    });

    it('anonymizes The Godfather character names', () => {
      expect(anonymizeWord('Michael')).toEqual({ icon: '🎩', label: 'Son' });
      expect(anonymizeWord('Sonny')).toEqual({ icon: '🔥', label: 'Brother' });
      expect(anonymizeWord('Tom Hagen')).toEqual({ icon: '⚖️', label: 'Advisor' });
      expect(anonymizeWord('Kay')).toEqual({ icon: '🌸', label: 'Wife' });
      expect(anonymizeWord('Marlon Brando')).toEqual({ icon: '🎬', label: 'Actor' });
      expect(anonymizeWord('Al Pacino')).toEqual({ icon: '🎬', label: 'Actor' });
      expect(anonymizeWord('Luca Brasi')).toEqual({ icon: '🗡️', label: 'Enforcer' });
    });

    it('anonymizes Pulp Fiction character names', () => {
      expect(anonymizeWord('Vincent Vega')).toEqual({ icon: '🔫', label: 'Hitman' });
      expect(anonymizeWord('Jules Winnfield')).toEqual({ icon: '🔫', label: 'Hitman' });
      expect(anonymizeWord('Marsellus Wallace')).toEqual({ icon: '👔', label: 'Boss' });
      expect(anonymizeWord('Mia Wallace')).toEqual({ icon: '💃', label: 'Boss\'s Wife' });
      expect(anonymizeWord('Pumpkin')).toEqual({ icon: '🎃', label: 'Robber' });
      expect(anonymizeWord('Honey Bunny')).toEqual({ icon: '🎃', label: 'Robber' });
    });

    it('anonymizes Notting Hill character names', () => {
      expect(anonymizeWord('William Thacker')).toEqual({ icon: '📖', label: 'Bookshop Owner' });
      expect(anonymizeWord('Anna Scott')).toEqual({ icon: '🌟', label: 'Actress' });
      expect(anonymizeWord('Julia Roberts')).toEqual({ icon: '🌟', label: 'Actress' });
      expect(anonymizeWord('Hugh Grant')).toEqual({ icon: '🎬', label: 'Actor' });
    });

    it('anonymizes Indiana Jones character names', () => {
      expect(anonymizeWord('Marion Ravenwood')).toEqual({ icon: '🏛️', label: 'Adventurer' });
      expect(anonymizeWord('Short Round')).toEqual({ icon: '🥋', label: 'Sidekick' });
    });

    it('anonymizes Lord of the Rings character names', () => {
      expect(anonymizeWord('Frodo')).toEqual({ icon: '💍', label: 'Ring-bearer' });
      expect(anonymizeWord('Sam')).toEqual({ icon: '🤝', label: 'Loyal Friend' });
      expect(anonymizeWord('Gandalf')).toEqual({ icon: '🧙', label: 'Wizard' });
      expect(anonymizeWord('Aragorn')).toEqual({ icon: '⚔️', label: 'Ranger' });
      expect(anonymizeWord('Legolas')).toEqual({ icon: '🏹', label: 'Elf' });
      expect(anonymizeWord('Gimli')).toEqual({ icon: '🪓', label: 'Dwarf' });
      expect(anonymizeWord('Gollum')).toEqual({ icon: '🐟', label: 'Creature' });
      expect(anonymizeWord('Galadriel')).toEqual({ icon: '✨', label: 'Elf Queen' });
      expect(anonymizeWord('Treebeard')).toEqual({ icon: '🌳', label: 'Ent' });
      expect(anonymizeWord('Boromir')).toEqual({ icon: '🛡️', label: 'Warrior' });
    });

    it('anonymizes Gladiator character names', () => {
      expect(anonymizeWord('Maximus')).toEqual({ icon: '⚔️', label: 'General' });
      expect(anonymizeWord('Commodus')).toEqual({ icon: '👑', label: 'Emperor' });
      expect(anonymizeWord('Seneca')).toEqual({ icon: '📜', label: 'Advisor' });
      expect(anonymizeWord('Maximus Decimus Meridius')).toEqual({ icon: '⚔️', label: 'General' });
    });
  });

  describe('isPersonalName', () => {
    it('returns true for known personal names', () => {
      expect(isPersonalName('Yoda')).toBe(true);
      expect(isPersonalName('Harry Potter')).toBe(true);
      expect(isPersonalName('Neo')).toBe(true);
      expect(isPersonalName('Frodo')).toBe(true);
      expect(isPersonalName('Maximus Decimus Meridius')).toBe(true);
    });

    it('returns false for non-names', () => {
      expect(isPersonalName('Jedi')).toBe(false);
      expect(isPersonalName('Hogwarts')).toBe(false);
      expect(isPersonalName('The Matrix')).toBe(false);
      expect(isPersonalName('FREE')).toBe(false);
    });
  });
});
