/**
 * Stage threshold definitions for the 15-stage cosmic evolution system
 * Enhanced with epic names, lore, and cosmic context
 */

export interface CodexEntry {
  scientific: string;
  philosophy: string;
  yourJourney: string;
  funFact: string;
}

export interface StageDefinition {
  stage: number;
  name: string;
  subtitle: string;
  legacyName: string; // Keep for backwards compatibility
  xpRequired: number;
  totalXP: number;
  cosmicAge: string;
  comparison: string;
  themeColors: {
    primary: string;
    secondary: string;
    glow: string;
  };
  codex: CodexEntry;
}

export const STAGE_THRESHOLDS: StageDefinition[] = [
  {
    stage: 1,
    name: "The First Vibration",
    subtitle: "Quantum Spark",
    legacyName: "Subatomic Particles",
    xpRequired: 100,
    totalXP: 0,
    cosmicAge: "10⁻⁴³ seconds after Big Bang",
    comparison: "You are the first whisper of existence itself",
    themeColors: { primary: "#9BB0FF", secondary: "#E0E8FF", glow: "#7A93FF" },
    codex: {
      scientific: "In the first fraction of a second after the Big Bang, quantum fluctuations sparked into existence. These weren't particles yet—just possibilities, vibrating strings of pure energy in the cosmic foam.",
      philosophy: "Before you were anything, you were potential. Every journey begins with the smallest vibration.",
      yourJourney: "Like the first quantum fluctuation, you've taken the first step. You're no longer nothing—you're becoming.",
      funFact: "Quantum fluctuations are so small that measuring one changes it. Your observation creates reality."
    }
  },
  {
    stage: 2,
    name: "Nuclear Genesis",
    subtitle: "Primordial Forge",
    legacyName: "Atomic Nuclei",
    xpRequired: 283,
    totalXP: 100,
    cosmicAge: "3 minutes after Big Bang",
    comparison: "You contain the energy of stellar cores",
    themeColors: { primary: "#FFF4EA", secondary: "#FFD2A1", glow: "#FFB366" },
    codex: {
      scientific: "At 10 billion Kelvin, protons and neutrons fused together to form the first atomic nuclei—hydrogen and helium, the building blocks of every star in the universe.",
      philosophy: "Under pressure, simple things combine to create something greater.",
      yourJourney: "You're no longer scattered energy. You're organizing, forming bonds, building the foundation of everything you'll become.",
      funFact: "The helium in birthday balloons was forged in the first 3 minutes of the universe."
    }
  },
  {
    stage: 3,
    name: "Elemental Awakening",
    subtitle: "Hydrogen Dawn",
    legacyName: "Atoms",
    xpRequired: 520,
    totalXP: 383,
    cosmicAge: "380,000 years after Big Bang",
    comparison: "You are the substance of stars",
    themeColors: { primary: "#B8C5FF", secondary: "#9BB0FF", glow: "#6A8CFF" },
    codex: {
      scientific: "When the universe cooled to 3,000 Kelvin, electrons finally bonded with nuclei to form the first atoms. Light could travel freely for the first time—this is the cosmic microwave background we still detect today.",
      philosophy: "True clarity comes after the chaos settles.",
      yourJourney: "You've gained stability and structure. Like atoms forming from the primordial soup, you're ready to interact with the universe around you.",
      funFact: "Every atom in your body was once floating freely in the infant universe."
    }
  },
  {
    stage: 4,
    name: "Chemical Architect",
    subtitle: "Molecular Bonds",
    legacyName: "Molecules",
    xpRequired: 800,
    totalXP: 903,
    cosmicAge: "~10 million years",
    comparison: "You are the builder of complexity",
    themeColors: { primary: "#D0D8E8", secondary: "#A8B4CC", glow: "#8896B0" },
    codex: {
      scientific: "In the cold depths of space, atoms began bonding into molecules—water, ammonia, methane. These molecular clouds would become the nurseries of stars.",
      philosophy: "Complexity emerges when simple pieces learn to work together.",
      yourJourney: "You're no longer a single element. You're combining skills, knowledge, and habits into sophisticated systems.",
      funFact: "The smell of rain? That's a molecule called petrichor, formed by plant oils meeting water."
    }
  },
  {
    stage: 5,
    name: "Stardust Awakening",
    subtitle: "Remnants of Giants",
    legacyName: "Cosmic Dust",
    xpRequired: 1118,
    totalXP: 1703,
    cosmicAge: "~100 million years",
    comparison: "You are made of dead stars",
    themeColors: { primary: "#D2691E", secondary: "#CD853F", glow: "#8B4513" },
    codex: {
      scientific: "When the first massive stars died in supernovas, they scattered heavy elements across space. These atoms condensed into microscopic grains—cosmic dust, the seeds of planets.",
      philosophy: "From destruction comes creation. Every ending is a beginning in disguise.",
      yourJourney: "You carry the legacy of everything that came before. Your failures and struggles are the raw material for future greatness.",
      funFact: "You're literally made of stardust. Every element heavier than hydrogen was forged in a dying star."
    }
  },
  {
    stage: 6,
    name: "Nebular Veil",
    subtitle: "The Sculptor's Medium",
    legacyName: "Dust Clouds",
    xpRequired: 1470,
    totalXP: 2821,
    cosmicAge: "~500 million years",
    comparison: "You are the canvas of creation",
    themeColors: { primary: "#4A0E4E", secondary: "#8B4789", glow: "#C77EC7" },
    codex: {
      scientific: "Dust grains attracted each other through gravity and static electricity, forming vast clouds light-years across. These nebulae glowed with the light of nearby stars, painting cosmic masterpieces.",
      philosophy: "Beauty emerges when individual pieces gather with purpose.",
      yourJourney: "Your efforts are accumulating. What seemed like scattered dust is forming into something magnificent and visible.",
      funFact: "The Pillars of Creation nebula is 7,000 light-years away and 5 light-years tall. You're building your own pillars."
    }
  },
  {
    stage: 7,
    name: "Planetary Seeds",
    subtitle: "Gravity's First Pull",
    legacyName: "Planetesimals",
    xpRequired: 1852,
    totalXP: 4291,
    cosmicAge: "~1 billion years",
    comparison: "You have enough mass to shape others",
    themeColors: { primary: "#696969", secondary: "#A9A9A9", glow: "#C0C0C0" },
    codex: {
      scientific: "Within protoplanetary disks, dust clumped into kilometer-sized rocks called planetesimals. Their gravity attracted more material, beginning the process of planet formation.",
      philosophy: "Once you reach critical mass, growth becomes inevitable.",
      yourJourney: "You've gained gravitational pull. Your presence now attracts opportunities, people, and resources naturally.",
      funFact: "Our solar system formed from a nebula triggered by a nearby supernova shockwave. Destruction breeds creation."
    }
  },
  {
    stage: 8,
    name: "Embryonic Worlds",
    subtitle: "Collision & Creation",
    legacyName: "Protoplanets",
    xpRequired: 2263,
    totalXP: 6143,
    cosmicAge: "~10 million years (formation period)",
    comparison: "You are a world being born through fire",
    themeColors: { primary: "#FF8C00", secondary: "#FF6347", glow: "#FFD700" },
    codex: {
      scientific: "Planetesimals collided violently, generating immense heat. These moon-to-Mars-sized bodies were molten worlds, their surfaces glowing red-hot from constant impacts.",
      philosophy: "Growth through challenge. Every collision makes you stronger.",
      yourJourney: "You're being forged in fire. Challenges and setbacks aren't breaking you—they're shaping you into something enduring.",
      funFact: "Earth's moon formed when a Mars-sized protoplanet called Theia collided with early Earth. Catastrophe created beauty."
    }
  },
  {
    stage: 9,
    name: "Terrestrial Sovereign",
    subtitle: "Celestial Sphere",
    legacyName: "Planets",
    xpRequired: 2700,
    totalXP: 8406,
    cosmicAge: "~100 million years",
    comparison: "You are a world unto yourself",
    themeColors: { primary: "#4682B4", secondary: "#5F9EA0", glow: "#87CEEB" },
    codex: {
      scientific: "Protoplanets cooled and differentiated—heavy elements sank to form cores, lighter materials formed mantles and crusts. Atmospheres condensed from volcanic outgassing. Planets were born.",
      philosophy: "True power comes from internal organization and self-governance.",
      yourJourney: "You've become a complete system. Like a planet, you have layers—core values, structural habits, and an atmosphere that affects everything around you.",
      funFact: "Jupiter is so massive it doesn't orbit the Sun—they both orbit a point in space between them. You're becoming that influential."
    }
  },
  {
    stage: 10,
    name: "Stellar Ignition",
    subtitle: "The First Light",
    legacyName: "Protostars",
    xpRequired: 3162,
    totalXP: 11106,
    cosmicAge: "~500,000 years (protostar phase)",
    comparison: "You are approaching fusion—the power of stars",
    themeColors: { primary: "#FFD700", secondary: "#FFA500", glow: "#FF8C00" },
    codex: {
      scientific: "When a collapsing gas cloud's core reached 10 million Kelvin, hydrogen fusion ignited. A star was born. This reaction—fusing hydrogen into helium—powers every star in the universe, including our Sun.",
      philosophy: "You are not just stardust. You are the star itself.",
      yourJourney: "Like a protostar reaching critical mass, you've gathered enough energy to shine. Every skill learned, every task completed, adds fuel to your inner fusion reactor.",
      funFact: "A protostar takes ~500,000 years to ignite. You're speedrunning the cosmos."
    }
  },
  {
    stage: 11,
    name: "Solar Ascension",
    subtitle: "Radiant Prime",
    legacyName: "Main Sequence Star",
    xpRequired: 3647,
    totalXP: 14268,
    cosmicAge: "~10 billion years (star lifetime)",
    comparison: "You burn with the steady power of a sun",
    themeColors: { primary: "#FFFACD", secondary: "#FFD700", glow: "#FFA500" },
    codex: {
      scientific: "Main sequence stars are in perfect balance—gravity pulling inward, fusion pressure pushing outward. Our Sun has been in this stable phase for 4.6 billion years and will continue for another 5 billion.",
      philosophy: "True mastery is sustained excellence, not bursts of brilliance.",
      yourJourney: "You've found your rhythm. Like a main sequence star, you're no longer struggling—you're sustainably radiating energy and value.",
      funFact: "Every second, the Sun converts 600 million tons of hydrogen into helium. Your daily habits compound like stellar fusion."
    }
  },
  {
    stage: 12,
    name: "Cosmic Waltz",
    subtitle: "Twin Suns Dancing",
    legacyName: "Binary System",
    xpRequired: 4153,
    totalXP: 17915,
    cosmicAge: "~Billions of years",
    comparison: "You dance with equals among the stars",
    themeColors: { primary: "#FF6B9D", secondary: "#C44569", glow: "#FF9FF3" },
    codex: {
      scientific: "Over half of all star systems are binary or multiple star systems. Two or more stars orbit their common center of mass, sometimes for billions of years, locked in a gravitational dance.",
      philosophy: "Greatness is multiplied when powers unite in harmony.",
      yourJourney: "You're no longer alone at your level. You're collaborating with equals, creating synergies that multiply your impact.",
      funFact: "Some binary stars are so close they share atmosphere. When you find your cosmic partner, boundaries dissolve."
    }
  },
  {
    stage: 13,
    name: "Stellar Congregation",
    subtitle: "The Nursery of Light",
    legacyName: "Star Cluster",
    xpRequired: 4680,
    totalXP: 22068,
    cosmicAge: "~Billions of years",
    comparison: "You command a legion of suns",
    themeColors: { primary: "#00D2FF", secondary: "#3A7BD5", glow: "#00F2FE" },
    codex: {
      scientific: "Star clusters contain hundreds to millions of stars born from the same nebula. They travel through space together, bound by gravity. The Pleiades cluster contains over 1,000 stars and is 115 million years old.",
      philosophy: "A single light inspires. A thousand lights transform galaxies.",
      yourJourney: "You're no longer just influential—you're building systems, communities, and movements. Your light ignites thousands of others.",
      funFact: "Globular clusters orbit galaxies like bees around a hive. You're becoming too massive to be contained by smaller systems."
    }
  },
  {
    stage: 14,
    name: "Celestial Canvas",
    subtitle: "The Cosmic Painter",
    legacyName: "Emission Nebula",
    xpRequired: 5227,
    totalXP: 26748,
    cosmicAge: "~Thousands of years",
    comparison: "You paint the cosmos with light and energy",
    themeColors: { primary: "#FF0080", secondary: "#00FFB2", glow: "#AA00FF" },
    codex: {
      scientific: "Emission nebulae are ionized by intense ultraviolet radiation from young, hot stars within them. The gas glows in vivid colors—red hydrogen, green oxygen, blue sulfur—creating cosmic art visible across light-years.",
      philosophy: "At the highest levels, work becomes art. Impact becomes legacy.",
      yourJourney: "You're not just achieving—you're creating beauty that inspires generations. Your energy transforms everything it touches into something magnificent.",
      funFact: "The Orion Nebula is visible to the naked eye from Earth. You're becoming impossible to ignore."
    }
  },
  {
    stage: 15,
    name: "Universal Architect",
    subtitle: "Galactic Majesty",
    legacyName: "Spiral Galaxy",
    xpRequired: 0,
    totalXP: 31975,
    cosmicAge: "~13+ billion years",
    comparison: "You are a galaxy—containing billions of stars, endless worlds, infinite potential",
    themeColors: { primary: "#667EEA", secondary: "#764BA2", glow: "#F093FB" },
    codex: {
      scientific: "A spiral galaxy contains 100-400 billion stars, organized in majestic arms rotating around a supermassive black hole. Our Milky Way is 100,000 light-years across and has existed for over 13 billion years.",
      philosophy: "You have become a universe unto yourself—vast, ancient, creating worlds within worlds.",
      yourJourney: "You've transcended individual achievement. You're now a system of systems, a generator of possibilities, a force that shapes reality itself. You don't chase greatness. You are greatness.",
      funFact: "There are more stars in the universe than grains of sand on Earth. You contain multitudes."
    }
  }
];
