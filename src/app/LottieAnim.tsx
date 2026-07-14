"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

// Petit wrapper client pour intégrer une animation Lottie (.json) dans une
// page server. Charge le JSON en fetch pour éviter d'alourdir le bundle.
export function LottieAnim({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let annule = false;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (!annule) setData(json);
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, [src]);

  if (!data) return <div className={className} />;
  return <Lottie animationData={data} loop autoplay className={className} />;
}
