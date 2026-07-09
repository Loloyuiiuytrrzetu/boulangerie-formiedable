"use client";

// Animations de récompense en pur CSS/SVG — aucun emoji flottant.
// 5 types : aucune, etoiles, ondes, rayons, vague

function EtoilesScintillantes({ couleur }: { couleur: string }) {
  // 40 étoiles positionnées au hasard qui apparaissent et disparaissent
  const etoiles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delai: Math.random() * 3,
    duree: 2 + Math.random() * 2,
    taille: 8 + Math.random() * 18,
  }));
  return (
    <>
      <style>{`
        @keyframes scintiller {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          40%, 60% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
      `}</style>
      {etoiles.map((e) => (
        <svg
          key={e.id}
          viewBox="0 0 24 24"
          className="absolute"
          style={{
            top: `${e.top}%`,
            left: `${e.left}%`,
            width: e.taille,
            height: e.taille,
            animation: `scintiller ${e.duree}s ease-in-out ${e.delai}s infinite`,
            filter: `drop-shadow(0 0 6px ${couleur})`,
          }}
        >
          <path
            d="M12 2l2.4 6.9L21 10l-5.4 4.5L17.5 22 12 18l-5.5 4 1.9-7.5L3 10l6.6-1.1z"
            fill={couleur}
          />
        </svg>
      ))}
    </>
  );
}

function OndesLumineuses({ couleur }: { couleur: string }) {
  // 5 cercles concentriques qui se propagent depuis le centre
  const ondes = [0, 0.6, 1.2, 1.8, 2.4];
  return (
    <>
      <style>{`
        @keyframes onde {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(6); opacity: 0; }
        }
      `}</style>
      {ondes.map((delai, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: 200,
            height: 200,
            border: `4px solid ${couleur}`,
            animation: `onde 3s ease-out ${delai}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function RayonsEclatants({ couleur }: { couleur: string }) {
  // 16 rayons qui tournent lentement, chacun pulse
  const rayons = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <>
      <style>{`
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rayonPulse {
          0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 4,
          height: 4,
          animation: "rotation 12s linear infinite",
        }}
      >
        {rayons.map((angle, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: "50%",
              left: "50%",
              width: 6,
              height: "70vh",
              background: `linear-gradient(to bottom, ${couleur}00, ${couleur}, ${couleur}00)`,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              transformOrigin: "center",
              animation: `rayonPulse 2s ease-in-out ${i * 0.1}s infinite`,
              filter: `blur(2px)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function VagueDoree({ couleur }: { couleur: string }) {
  // 4 vagues qui traversent l'écran horizontalement avec fondu
  const vagues = [0, 0.8, 1.6, 2.4];
  return (
    <>
      <style>{`
        @keyframes vague {
          0% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(100vw) skewX(-20deg); opacity: 0; }
        }
      `}</style>
      {vagues.map((delai, i) => (
        <div
          key={i}
          className="absolute inset-y-0"
          style={{
            width: "50vw",
            background: `linear-gradient(to right, transparent, ${couleur}, transparent)`,
            filter: "blur(30px)",
            animation: `vague 3s ease-in-out ${delai}s infinite`,
          }}
        />
      ))}
    </>
  );
}

const ANIMATIONS: Record<string, React.ComponentType<{ couleur: string }>> = {
  etoiles: EtoilesScintillantes,
  ondes: OndesLumineuses,
  rayons: RayonsEclatants,
  vague: VagueDoree,
};

export function AnimationRecompense({
  type,
  couleur = "#7A1E2E",
  onEnd,
}: {
  type: string;
  couleur?: string;
  onEnd?: () => void;
}) {
  if (type === "aucune") {
    if (onEnd) setTimeout(onEnd, 0);
    return null;
  }
  const Compo = ANIMATIONS[type] ?? ANIMATIONS.etoiles;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70"
      onClick={onEnd}
    >
      <div className="pointer-events-none absolute inset-0">
        <Compo couleur={couleur} />
      </div>
      <div className="relative rounded-3xl bg-white/95 px-10 py-8 text-center shadow-2xl backdrop-blur">
        <p className="text-2xl font-extrabold text-stone-900">
          Récompense obtenue !
        </p>
        <p className="mt-1 text-sm text-stone-500">Touchez pour continuer</p>
      </div>
    </div>
  );
}
