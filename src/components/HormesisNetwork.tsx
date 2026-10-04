import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function HormesisNetwork() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse", // El ratón (estrés) disipa las partículas
        },
      },
      modes: {
        repulse: {
          distance: 120, // Distancia de repulsión
          duration: 0.4, // Vuelven rápidamente
        },
      },
    },
    particles: {
      color: {
        value: "#10B981", // Verde Esmeralda
      },
      links: {
        enable: false, // Sin líneas, solo partículas individuales
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 0, // Estáticas hasta que ocurre el hover
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 800
        },
        value: 550, // Aún más partículas
      },
      opacity: {
        value: { min: 0.1, max: 0.5 }, // Opacidad más sutil
        animation: {
          enable: true,
          speed: 0.5,
          sync: false,
        }
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 2.5 }, // Un poco más grandes
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        }
      },
    },
    detectRetina: true,
  };

  if (init) {
    return (
      <Particles
        id="tsparticles-hormesis"
        options={options}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
    );
  }

  return null;
}
