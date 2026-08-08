"use client";

import { useState } from "react";
import { useTV } from "@/lib/langue";

const CALENDLY = "https://calendly.com/walletiz-fr";
const WHATSAPP_NUM = "590690988538"; // +590 690 98 85 38 (format international, sans +)

// Bouton « Prendre rendez-vous » : au clic, propose au visiteur de nous
// contacter via WhatsApp (échange rapide) OU Calendly (réserver un créneau).
// Réutilisable partout : on lui passe les mêmes classes que le bouton d'origine.
export function BoutonRdv({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTV();
  const [ouvert, setOuvert] = useState(false);
  const whatsapp = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(
    t("rdv_whatsapp_msg")
  )}`;

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={className}>
        {children}
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOuvert(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-stone-900">{t("rdv_choix_titre")}</p>
            <p className="mt-1 text-sm text-stone-500">{t("rdv_choix_desc")}</p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOuvert(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:brightness-95"
              >
                💬 WhatsApp
              </a>
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOuvert(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-bordeaux-700"
              >
                📅 Calendly
              </a>
            </div>

            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="mt-3 w-full py-1 text-sm font-medium text-stone-500 hover:text-stone-700"
            >
              {t("rdv_annuler")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
