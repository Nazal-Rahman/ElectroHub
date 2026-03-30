import GlassCard from "@/components/ui/GlassCard";
import SiteNav from "@/components/site/SiteNav";

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col flex-1">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="mt-2 h-4 w-72 rounded bg-white/5" />
          </div>
          <div className="h-4 w-24 rounded bg-white/10" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="p-4">
              <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              <div className="mt-4 h-4 w-2/3 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-4 w-full rounded bg-white/5 animate-pulse" />
              <div className="mt-2 h-4 w-5/6 rounded bg-white/5 animate-pulse" />
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}

