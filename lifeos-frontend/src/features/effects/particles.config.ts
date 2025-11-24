import type { ISourceOptions } from "@tsparticles/engine";

export const dashboardParticlesConfig: ISourceOptions = {
  background: {
    color: { value: "transparent" }
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 60,
      density: { enable: true, width: 1920, height: 1080 }
    },
    color: {
      value: ["#7A5CFF", "#5CE1E6", "#D064FF"]
    },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.1, max: 0.4 }
    },
    size: {
      value: { min: 1, max: 3 }
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" }
    }
  },
  detectRetina: true
};
