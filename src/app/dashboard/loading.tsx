// Squelette affiché instantanément pendant que le dashboard charge côté
// serveur (Suspense boundary automatique de Next.js). Évite la sensation
// de site figé pendant la requête initiale.
export default function ChargementDashboard() {
  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:ml-64 lg:max-w-none lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-stone-200" />
            <div className="h-24 rounded-2xl bg-stone-200" />
            <div className="col-span-2 h-24 rounded-2xl bg-stone-200 sm:col-span-1" />
          </div>
          <div className="h-14 rounded-2xl bg-stone-200" />
          <div className="h-64 rounded-2xl bg-stone-200" />
          <div className="h-96 rounded-2xl bg-stone-200" />
        </div>
      </div>
    </main>
  );
}
