import {loadFont} from '@remotion/google-fonts/Fredoka';
export const {fontFamily} = loadFont('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Zones sûres TikTok (marges indicatives : barre du haut, colonne d'icônes à droite, légende en bas)
export const SAFE = {top: 150, bottom: 420, left: 60, right: 170};

export const COLORS = {jaune: '#FFD60A', blanc: '#FFFFFF', contour: '#000000'};

// Contour noir épais sans aucun fond (paint-order trace le contour sous le remplissage)
export const outlinedText = (strokePx: number): React.CSSProperties => ({
  fontFamily,
  fontWeight: 700,
  WebkitTextStroke: `${strokePx}px ${COLORS.contour}`,
  paintOrder: 'stroke fill',
  textShadow: '0 6px 0 rgba(0,0,0,0.35)',
});
