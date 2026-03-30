import Link from "next/link";

import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import GlassCard from "@/components/ui/GlassCard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/lib/models/Project";

export const runtime = "nodejs";

export default async function ProjectsPage() {
  await connectToDatabase();

  const projects = await Project.find({})
    .sort({ createdAt: -1 })
    .select({ title: 1, description: 1, images: 1, createdAt: 1 })
    .lean();

  return (
    <div className="flex flex-col flex-1">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-2">
              Explore builds with code downloads, diagrams, and components.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Upload a Project
          </Link>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: any) => (
            <Link key={p._id.toString()} href={`/projects/${p._id.toString()}`} className="group">
              <GlassCard className="p-4 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {p.images?.length ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.28),transparent_55%)]" />
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold tracking-tight">{p.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-2">
                    {p.description}
                  </p>
                  <div className="mt-3 text-xs text-white/45">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : null}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

