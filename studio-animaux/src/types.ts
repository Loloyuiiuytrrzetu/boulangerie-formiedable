// Format de données d'un épisode. Un fichier par épisode dans src/episodes/.
export type Word = {text: string; start: number; end: number}; // secondes, issus de l'audio réel

export type TitleSegment = {text: string; highlight?: boolean; at: number}; // `at` = seconde d'apparition

export type Scene = {
  id: string;
  start: number; // secondes (alignées sur les horodatages audio)
  end: number;
  phrase: string; // phrase audio correspondante
  decor: string;
  personnages: string[];
  actions: string;
  camera: {from: CameraKey; to: CameraKey};
  effets?: string[];
  transition?: 'cut' | 'fondu' | 'glissement' | 'zoom';
};

export type CameraKey = {x: number; y: number; zoom: number};

export type Episode = {
  slug: string;
  titre: string;
  titreSegments: TitleSegment[];
  audio: string; // chemin relatif à public/
  dureeSecondes: number; // durée RÉELLE mesurée avec ffprobe
  mots: Word[]; // horodatages réels (scripts/horodater.py)
  motsJaunes: string[]; // mots mis en évidence dans les sous-titres
  scenes: Scene[];
};
