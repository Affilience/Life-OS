/**
 * tsParticles configuration for all 15 cosmic evolution stages
 */

import type { ISourceOptions } from "@tsparticles/engine";

export const StageConfigs: Record<number, ISourceOptions> = {
  // STAGE 1: Quantum Foam - Chaotic energy fluctuations
  1: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 25,
        density: { enable: false }
      },
      color: {
        value: ["#9BB0FF", "#B8C5FF", "#7A93FF", "#FFFFFF"],
        animation: {
          enable: true,
          speed: 20,
          sync: false
        }
      },
      opacity: {
        value: { min: 0.1, max: 0.9 },
        animation: {
          enable: true,
          speed: 5,
          sync: false,
          destroy: "none",
          mode: "random"
        }
      },
      size: {
        value: { min: 0.5, max: 4 },
        animation: {
          enable: true,
          speed: 8,
          sync: false,
          minimumValue: 0.3
        }
      },
      move: {
        enable: true,
        speed: { min: 3, max: 8 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
        bounce: true,
        attract: {
          enable: true,
          distance: 200,
          rotate: { x: 3000, y: 3000 }
        }
      },
      shape: { type: "circle" },
      life: {
        duration: {
          value: 2,
          sync: false
        },
        count: 0,
        delay: {
          value: 0.1,
          sync: false
        }
      },
      shadow: {
        enable: true,
        blur: 8,
        color: "#9BB0FF",
        offset: { x: 0, y: 0 }
      }
    },
    background: {
      color: "#000033"
    }
  },

  // STAGE 2: Fundamental Particles - Organized high-energy particles
  2: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 30,
        density: { enable: false }
      },
      color: {
        value: ["#FFF4EA", "#FFD2A1", "#FFAA66", "#FFC88C"],
        animation: {
          enable: true,
          speed: 10,
          sync: false
        }
      },
      opacity: {
        value: { min: 0.5, max: 1.0 },
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
      size: {
        value: { min: 2, max: 5 },
        animation: {
          enable: true,
          speed: 4,
          sync: false,
          minimumValue: 1
        }
      },
      move: {
        enable: true,
        speed: { min: 2, max: 5 },
        direction: "none",
        attract: {
          enable: true,
          rotate: { x: 800, y: 1400 }
        },
        bounce: true
      },
      links: {
        enable: true,
        distance: 80,
        color: "#FFF4EA",
        opacity: 0.4,
        width: 1.5,
        shadow: {
          enable: true,
          blur: 5,
          color: "#FFD2A1"
        },
        triangles: {
          enable: true,
          color: "#FFD2A1",
          opacity: 0.1
        }
      },
      shadow: {
        enable: true,
        blur: 10,
        color: "#FFD2A1",
        offset: { x: 0, y: 0 }
      }
    },
    background: {
      color: "#001133"
    }
  },

  // STAGE 3: Atoms (Orbital Patterns)
  3: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 18,
        density: { enable: false }
      },
      color: { value: ["#FFD2A1", "#9BB0FF"] },
      opacity: { value: 0.7 },
      size: {
        value: { min: 2, max: 5 }
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none"
      },
      orbit: {
        enable: true,
        opacity: 0.5,
        rotation: {
          value: 45,
          random: true
        },
        width: 1
      }
    },
    background: {
      color: "#0A0A1A"
    }
  },

  // STAGE 4: Molecules
  4: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 23,
        density: { enable: false }
      },
      color: { value: ["#FFFFFF", "#FF6347", "#808080"] },
      opacity: { value: 0.75 },
      size: {
        value: { min: 2, max: 6 }
      },
      move: {
        enable: true,
        speed: { min: 1, max: 3 },
        direction: "none"
      },
      links: {
        enable: true,
        distance: 80,
        color: "#FFFFFF",
        opacity: 0.4,
        width: 2
      }
    },
    background: {
      color: "#0D0D1A"
    }
  },

  // STAGE 5: Cosmic Dust - Slow-drifting dusty particles
  5: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 60,
        density: { enable: false }
      },
      color: {
        value: ["#8B4513", "#CD853F", "#A0522D", "#D2691E", "#B8860B"],
        animation: {
          enable: true,
          speed: 5,
          sync: false
        }
      },
      opacity: {
        value: { min: 0.2, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      size: {
        value: { min: 0.5, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
          minimumValue: 0.3
        }
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 0.8 },
        direction: "none",
        random: true,
        attract: {
          enable: true,
          distance: 150,
          rotate: { x: 100, y: 100 }
        },
        drift: { min: -0.5, max: 0.5 }
      },
      collisions: {
        enable: true,
        mode: "absorb"
      },
      links: {
        enable: true,
        distance: 40,
        color: "#8B4513",
        opacity: 0.15,
        width: 0.5
      },
      shadow: {
        enable: true,
        blur: 3,
        color: "#CD853F",
        offset: { x: 0, y: 0 }
      }
    },
    background: {
      color: "#000000"
    },
    emitters: {
      rate: {
        quantity: 2,
        delay: 0.5
      },
      size: {
        width: 100,
        height: 100,
        mode: "percent"
      }
    }
  },

  // STAGE 6: Dust Clouds
  6: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 35,
        density: { enable: false }
      },
      color: { value: ["#1A1A1A", "#FF6B35"] },
      opacity: {
        value: { min: 0.2, max: 0.6 }
      },
      size: {
        value: { min: 2, max: 6 }
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 0.8 },
        direction: "none"
      },
      links: {
        enable: true,
        distance: 100,
        color: "#FF6B35",
        opacity: 0.2,
        width: 1
      }
    },
    background: {
      color: "#000000"
    }
  },

  // STAGE 7: Planetesimals
  7: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 43,
        density: { enable: false }
      },
      color: { value: ["#696969", "#A9A9A9"] },
      opacity: {
        value: { min: 0.5, max: 0.8 }
      },
      size: {
        value: { min: 2, max: 5 }
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 2 },
        direction: "none"
      },
      shape: {
        type: ["circle", "triangle"]
      }
    },
    background: {
      color: "#000000"
    }
  },

  // STAGE 8: Protoplanets
  8: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 52,
        density: { enable: false }
      },
      color: { value: ["#808080", "#FF6347"] },
      opacity: {
        value: { min: 0.6, max: 0.9 }
      },
      size: {
        value: { min: 3, max: 7 }
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 1.5 },
        direction: "none"
      }
    },
    background: {
      color: "#0A0000"
    }
  },

  // STAGE 9: Planets
  9: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 58,
        density: { enable: false }
      },
      color: { value: ["#4682B4", "#8B7355", "#228B22"] },
      opacity: {
        value: { min: 0.7, max: 1.0 }
      },
      size: {
        value: { min: 4, max: 10 }
      },
      move: {
        enable: true,
        speed: { min: 0.3, max: 1 },
        direction: "none"
      },
      rotate: {
        value: 0,
        animation: {
          enable: true,
          speed: 5,
          sync: false
        }
      }
    },
    background: {
      color: "#000033"
    }
  },

  // STAGE 10: Protostars
  10: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 68,
        density: { enable: false }
      },
      color: {
        value: ["#CD5C5C", "#FF6347", "#FF8C00"]
      },
      opacity: {
        value: { min: 0.4, max: 0.9 },
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
      size: {
        value: { min: 2, max: 8 },
        animation: {
          enable: true,
          speed: 3,
          minimumValue: 1
        }
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 3 },
        direction: "none",
        attract: {
          enable: true,
          rotate: { x: 600, y: 600 }
        }
      },
      rotate: {
        value: 0,
        animation: {
          enable: true,
          speed: 10,
          sync: false
        }
      }
    },
    background: {
      color: "#0A0000"
    }
  },

  // STAGE 11: Main Sequence Star
  11: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 78,
        density: { enable: false }
      },
      color: { value: "#FFD700" },
      opacity: {
        value: { min: 0.6, max: 1 },
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 6 }
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 2 },
        direction: "none",
        outModes: { default: "destroy" }
      }
    },
    background: {
      color: "#000033"
    }
  },

  // STAGE 12: Binary Star System
  12: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 92,
        density: { enable: false }
      },
      color: { value: ["#FFD2A1", "#FFCC6F"] },
      opacity: {
        value: { min: 0.5, max: 1 }
      },
      size: {
        value: { min: 2, max: 8 }
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 2.5 },
        direction: "none",
        attract: {
          enable: true,
          rotate: { x: 800, y: 800 }
        }
      }
    },
    background: {
      color: "#000044"
    }
  },

  // STAGE 13: Star Cluster - Bright twinkling stars of various types
  13: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 120,
        density: { enable: false }
      },
      color: {
        value: [
          "#AABfFF", // Blue stars (hot)
          "#FFFFFF", // White stars
          "#FFD2A1", // Yellow-orange stars
          "#FFE4B5", // Warm white
          "#FFA07A", // Light orange
          "#87CEEB"  // Light blue
        ],
        animation: {
          enable: true,
          speed: 15,
          sync: false
        }
      },
      opacity: {
        value: { min: 0.3, max: 1.0 },
        animation: {
          enable: true,
          speed: 3,
          sync: false,
          mode: "random"
        }
      },
      size: {
        value: { min: 1, max: 6 },
        animation: {
          enable: true,
          speed: 5,
          sync: false,
          minimumValue: 0.5
        }
      },
      move: {
        enable: true,
        speed: { min: 0.1, max: 0.8 },
        direction: "none",
        attract: {
          enable: true,
          distance: 300,
          rotate: { x: 200, y: 200 }
        },
        drift: { min: -0.3, max: 0.3 }
      },
      shadow: {
        enable: true,
        blur: 15,
        color: "#FFFFFF",
        offset: { x: 0, y: 0 }
      },
      rotate: {
        value: 0,
        animation: {
          enable: true,
          speed: 3,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 100,
        color: "#AABfFF",
        opacity: 0.1,
        width: 0.5,
        shadow: {
          enable: true,
          blur: 3,
          color: "#FFFFFF"
        }
      }
    },
    background: {
      color: "#000022"
    },
    emitters: [
      {
        position: { x: 50, y: 50 },
        rate: {
          quantity: 1,
          delay: 0.3
        },
        size: {
          width: 80,
          height: 80,
          mode: "percent"
        }
      }
    ]
  },

  // STAGE 14: Emission Nebula
  14: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 115,
        density: { enable: false }
      },
      color: {
        value: ["#FF0040", "#00FFB2", "#FF6A6A"]
      },
      opacity: {
        value: { min: 0.2, max: 0.7 },
        animation: {
          enable: true,
          speed: 0.5,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 10 }
      },
      move: {
        enable: true,
        speed: { min: 0.1, max: 0.5 },
        direction: "none"
      },
      shape: {
        type: ["circle", "triangle", "polygon"],
        options: {
          polygon: { sides: 6 }
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: "#FF0040",
        opacity: 0.1,
        width: 1,
        triangles: {
          enable: true,
          color: "#00FFB2",
          opacity: 0.05
        }
      }
    },
    background: {
      color: "#000022"
    }
  },

  // STAGE 15: Spiral Galaxy
  15: {
    fullScreen: { enable: false },
    particles: {
      number: {
        value: 150,
        density: { enable: false }
      },
      color: {
        value: ["#AABfFF", "#FFD2A1", "#FF0040"]
      },
      opacity: {
        value: { min: 0.3, max: 0.9 }
      },
      size: {
        value: { min: 0.5, max: 4 }
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 1.5 },
        direction: "none",
        spin: {
          enable: true,
          position: { x: 50, y: 50 },
          acceleration: 0.5
        }
      },
      rotate: {
        value: 0,
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
      orbit: {
        enable: true,
        opacity: 0.2,
        rotation: {
          value: { min: 0, max: 360 }
        },
        width: 1
      }
    },
    background: {
      color: "#000000"
    }
  }
};
