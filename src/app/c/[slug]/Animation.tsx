"use client";

const STYLES: Record<
  string,
  { symboles: string[]; classe: string }
> = {
  confettis: { symboles: ["🎉", "🎊", "🎈", "🥳"], classe: "chute" },
  coeurs: { symboles: ["💖", "❤️", "💕", "💗"], classe: "montee" },
  etoiles: { symboles: ["✨", "⭐", "🌟", "💫"], classe: "chute" },
  feux: { symboles: ["🎆", "🎇", "✨", "💥"], classe: "explosion" },
};

// Animation plein écran, 100 particules, ~4 secondes.
// Fermeture manuelle (touche/clic).
export function AnimationRecompense({
  type,
  onEnd,
}: {
  type: string;
  onEnd?: () => void;
}) {
  if (type === "aucune") {
    // rien à afficher — appelle immédiatement onEnd
    if (onEnd) setTimeout(onEnd, 0);
    return null;
  }
  const config = STYLES[type] ?? STYLES.confettis;
  const particules = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    gauche: Math.random() * 100,
    symbole: config.symboles[i % config.symboles.length],
    delai: Math.random() * 2,
    duree: 3.5 + Math.random() * 2,
    taille: 18 + Math.random() * 28,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40"
      onClick={onEnd}
    >
      <style>{`
        @keyframes chute {
          0%   { transform: translateY(-15vh) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translateY(115vh) rotate(720deg); opacity: 0.7; }
        }
        @keyframes montee {
          0%   { transform: translateY(115vh) scale(0.5); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translateY(-15vh) scale(1.3); opacity: 0; }
        }
        @keyframes explosion {
          0%   { transform: scale(0) rotate(0deg); opacity: 1; }
          75%  { opacity: 1; }
          100% { transform: scale(2.4) rotate(360deg) translateY(-35vh); opacity: 0; }
        }
      `}</style>
      {particules.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute select-none"
          style={{
            left: `${p.gauche}vw`,
            fontSize: `${p.taille}px`,
            animation: `${config.classe} ${p.duree}s ease-in ${p.delai}s forwards`,
          }}
        >
          {p.symbole}
        </span>
      ))}
      <div className="relative animate-bounce rounded-3xl bg-white px-8 py-6 text-center shadow-2xl">
        <p className="text-5xl">🏆</p>
        <p className="mt-2 text-lg font-extrabold text-stone-900">
          Récompense obtenue !
        </p>
        <p className="mt-1 text-sm text-stone-500">Touchez pour continuer</p>
      </div>
    </div>
  );
}
