// Compresse une image côté navigateur avant upload.
// - iPhone/Android peuvent produire des photos 4-15 Mo en HEIC/HEIF qui font
//   crasher l'upload Supabase (parfois même sans message d'erreur).
// - On redimensionne à 2000px de côté max, on convertit en JPEG qualité 85%.
// Les petites images (< 2 Mo) sont laissées telles quelles.
export async function compresserImage(fichier: File): Promise<File> {
  if (fichier.size < 2 * 1024 * 1024) return fichier;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 2000;
        const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(fichier);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(fichier);
            resolve(
              new File([blob], fichier.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(fichier);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(fichier);
    reader.readAsDataURL(fichier);
  });
}

// Applique la compression à un ou plusieurs champs de fichiers d'un FormData.
export async function compresserChampsImage(
  formData: FormData,
  noms: readonly string[]
): Promise<void> {
  for (const nom of noms) {
    const fichier = formData.get(nom);
    if (fichier instanceof File && fichier.size > 0) {
      try {
        formData.set(nom, await compresserImage(fichier));
      } catch {
        // en cas d'échec, on laisse le fichier original
      }
    }
  }
}
