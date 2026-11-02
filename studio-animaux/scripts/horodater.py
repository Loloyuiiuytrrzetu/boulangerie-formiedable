"""Horodatage mot par mot d'une voix off ElevenLabs (faster-whisper, français).
Usage : .venv/bin/python scripts/horodater.py public/episodes/<slug>/voix.mp3 "texte validé (optionnel, sert d'invite)"
Écrit <audio>.mots.json : {"duree": s, "mots": [{"text","start","end"}]}.
Les mots transcrits doivent ensuite être comparés au texte validé (orthographe, accents) avant usage."""
import json, subprocess, sys
from faster_whisper import WhisperModel

audio = sys.argv[1]
prompt = sys.argv[2] if len(sys.argv) > 2 else None
duree = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).strip())
model = WhisperModel("medium", device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, language="fr", word_timestamps=True, initial_prompt=prompt, vad_filter=False)
mots = [{"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segments for w in s.words]
out = audio.rsplit(".", 1)[0] + ".mots.json"
json.dump({"duree": duree, "mots": mots}, open(out, "w"), ensure_ascii=False, indent=1)
print(f"Durée réelle : {duree:.2f} s — {len(mots)} mots — {out}")
