export default function ChargementSuperAdmin() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-32 rounded-2xl bg-stone-200" />
            <div className="h-32 rounded-2xl bg-stone-200" />
            <div className="h-32 rounded-2xl bg-stone-200" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="h-96 rounded-2xl bg-stone-200" />
            <div className="h-96 rounded-2xl bg-stone-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
