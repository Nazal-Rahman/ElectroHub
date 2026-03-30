import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/lib/models/Project";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";

export default async function Home() {
  const hasMongo = Boolean(process.env.MONGODB_URI);
  if (hasMongo) {
    await connectToDatabase();
  }

  const featured = hasMongo
    ? await Project.find({})
        .sort({ createdAt: -1 })
        .select({ title: 1, description: 1, images: 1, createdAt: 1 })
        .limit(6)
        .lean()
    : [];

  return (
    <div className="flex flex-col flex-1">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        {!hasMongo ? (
          <div className="mb-8">
            <GlassCard className="p-5">
              <p className="text-sm text-muted">
                Setup required: add <span className="font-semibold text-white/90">MONGODB_URI</span>{" "}
                to your <span className="font-semibold text-white/90">.env</span> (or Vercel env)
                to enable projects + comments.
              </p>
              <p className="mt-2 text-xs text-white/45">
                The UI is working; data is currently disabled until the database is configured.
              </p>
            </GlassCard>
          </div>
        ) : null}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl glass neon-ring p-8 md:p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-300" />
              Premium electronics portfolio platform
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              Build. Share. Inspire Electronics.
            </h1>

            <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
              Upload your projects with code, circuit diagrams, and visuals. Let visitors explore,
              comment, and engage—cleanly and professionally.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110"
              >
                Explore Projects
                <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Upload a Project
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Featured Projects</h2>
              <p className="mt-1 text-sm text-muted-2">
                The latest builds, curated and presented in a premium format.
              </p>
            </div>
            <Link href="/projects" className="text-sm text-white/75 hover:text-white underline">
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.length ? (
              featured.map((p: any) => (
                <Link
                  key={p._id.toString()}
                  href={`/projects/${p._id.toString()}`}
                  className="group"
                >
                  <GlassCard className="p-4 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
                    {p.images?.length ? (
                      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    ) : (
                      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-cyan-400/10" />
                        <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.28),transparent_55%)]" />
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="text-base font-semibold tracking-tight">
                        {p.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-2">
                        {p.description}
                      </p>
                      <div className="mt-3 text-xs text-white/45">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : null}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))
            ) : (
              <GlassCard className="p-6 md:col-span-2 lg:col-span-3">
                <p className="text-sm text-muted-2">
                  No projects yet. Upload your first project via{" "}
                  <Link href="/admin" className="underline text-white/80 hover:text-white">
                    /admin
                  </Link>
                  .
                </p>
              </GlassCard>
            )}
          </div>
        </section>

        {/* About */}
        <section className="mt-12">
          <GlassCard className="p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-2 text-sm text-muted-2">
                  A short introduction about you as an electronics creator.
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm leading-7 text-muted">
                  I build electronics projects focused on practical engineering—circuits, embedded
                  systems, and prototypes. ElectroHub is where I document my builds with clean
                  writeups, diagrams, and downloadable code so others can learn, remix, and get
                  inspired.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
