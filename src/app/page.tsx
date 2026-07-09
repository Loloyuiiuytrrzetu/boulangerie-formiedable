import Link from "next/link";

export default function Accueil() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-bordeaux-800 text-3xl text-white shadow-lg">
          ✦
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-bordeaux-800">
          Walletiz
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          La carte de fidélité digitale des petits commerces.
          <br />
          Un QR code, zéro application à installer.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-bordeaux-800 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-bordeaux-700"
          >
            Espace commerçant
          </Link>
          <p className="text-sm text-stone-400">
            Client ? Scannez le QR code affiché dans votre commerce préféré.
          </p>
        </div>
      </div>
    </main>
  );
}
