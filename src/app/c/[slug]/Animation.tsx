"use client";

// Animations de récompense. CSS pur, aucune dépendance.
// Le restaurateur choisit le style : confettis, coeurs, etoiles, feux.

const STYLES: Record<
  string,
  { symboles: string[]; classe: string }
> = {
  confettis: { symboles: ["🎉", "🎊", "🎈", "🥳"], classe: "chute" },
  coeurs: { symboles: ["💖", "❤️", "💕", "💗"], classe: "montee" },
  etoiles: { symboles: ["✨", "⭐", "🌟", "💫"], classe: "chute" },
  feux: { symboles: ["🎆", "🎇", "✨", "💥"], classe: "explosion" },
};

export function AnimationRecompense({
  type,
  onEnd,
}: {
  type: string;
  onEnd?: () => void;
}) {
  const config = STYLES[type] ?? STYLES.confettis;
  // 60 particules réparties horizontalement
  const particules = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    gauche: Math.random() * 100,
    symbole: config.symboles[i % config.symboles.length],
    delai: Math.random() * 1.5,
    duree: 2 + Math.random() * 2,
    taille: 20 + Math.random() * 24,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40"
      onAnimationEnd={onEnd}
      onClick={onEnd}
    >
      <style>{`
        @keyframes chute {
          0%   { transform: translateY(-15vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.6; }
        }
        @keyframes montee {
          0%   { transform: translateY(110vh) scale(0.5); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(-15vh) scale(1.2); opacity: 0; }
        }
        @keyframes explosion {
          0%   { transform: scale(0) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: scale(2) rotate(360deg) translateY(-30vh); opacity: 0; }
        }
      `}</style>
      {particules.map((p) => (
        <span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.gauche}vw`,
            fontSize: `${p.taille}px`,
            animation: `${config.classe} ${p.duree}s ease-in ${p.delai}s forwards`,
          }}
        >
          {p.symbole}
        </span>
      ))}
      <div className="relative rounded-3xl bg-white px-8 py-6 text-center shadow-2xl animate-bounce">
        <p className="text-5xl">🏆</p>
        <p className="mt-2 text-lg font-extrabold text-stone-900">
          Récompense obtenue !
        </p>
        <p className="mt-1 text-sm text-stone-500">Touchez pour continuer</p>
      </div>
    </div>
  );
}
