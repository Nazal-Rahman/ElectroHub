import { notFound } from "next/navigation";
import Link from "next/link";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/lib/models/Project";
import { Comment } from "@/lib/models/Comment";
import CommentsSection from "./CommentsSection";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import GlassCard from "@/components/ui/GlassCard";

export const runtime = "nodejs";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await connectToDatabase();

  const project = await Project.findById(params.id).lean();
  if (!project) notFound();

  const commentsDocs = await Comment.find({ projectId: params.id })
    .sort({ createdAt: 1 });

  const comments = commentsDocs.map((c) => ({
    _id: c._id.toString(),
    projectId: c.projectId.toString(),
    username: c.username,
    message: c.message,
    likes: c.likes,
    createdAt: c.createdAt.toISOString(),
    replies: (c.replies ?? []).map((r) => ({
      _id: r._id?.toString() ?? "",
      username: r.username,
      message: r.message,
      likes: r.likes,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  const hasImages = Array.isArray(project.images) && project.images.length > 0;
  const hasExtraNotes =
    typeof project.extraNotes === "string" && project.extraNotes.trim().length > 0;

  return (
    <div className="flex flex-col flex-1">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-6">
          <Link href="/projects" className="text-sm text-white/70 hover:text-white underline">
            ← Back to projects
          </Link>
        </div>

        <header className="relative overflow-hidden rounded-2xl glass neon-ring p-7 md:p-10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-purple-600/18 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-400/14 blur-3xl" />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
              {project.description}
            </p>
          </div>
        </header>

        {/* Gallery */}
        {hasImages ? (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white/90">Image Gallery</h2>
                <p className="mt-1 text-sm text-muted-2">Visuals of the build and final result.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.images.map((url: string, idx: number) => (
                <div
                  key={`${url}-${idx}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Project image ${idx + 1}`}
                    className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {/* Code / Actions */}
          <GlassCard className="p-5 lg:col-span-1">
            <div className="text-sm font-semibold text-white/90">Code</div>
            <p className="mt-2 text-sm text-muted-2">
              Download the ZIP file containing the full source code.
            </p>

            <a
              href={project.codeFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 px-4 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:brightness-110"
            >
              Download ZIP
            </a>

            <a
              href={project.circuitPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Open Circuit PDF
            </a>
          </GlassCard>

          {/* Circuit */}
          <GlassCard className="p-5 lg:col-span-2">
            <div className="text-sm font-semibold text-white/90">Circuit Diagram</div>
            <p className="mt-2 text-sm text-muted-2">
              Embedded preview of the uploaded PDF.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <iframe
                src={project.circuitPdfUrl}
                className="h-[420px] w-full"
                title="Circuit diagram preview"
              />
            </div>
          </GlassCard>
        </div>

        {/* Components */}
        <section className="mt-8">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white/90">Components</div>
            {Array.isArray(project.components) && project.components.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.components.map((c: string, idx: number) => (
                  <span
                    key={`${c}-${idx}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-2">No components listed.</p>
            )}
          </GlassCard>
        </section>

        {/* Extra notes */}
        {hasExtraNotes ? (
          <section className="mt-8">
            <GlassCard className="p-5">
              <div className="text-sm font-semibold text-white/90">Extra Notes</div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
                {project.extraNotes}
              </p>
            </GlassCard>
          </section>
        ) : null}

        {/* Comments */}
        <section className="mt-10">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-white/90">Comments</div>
            <p className="mt-2 text-sm text-muted-2">
              Ask questions, leave feedback, and reply in threads.
            </p>
            <div className="mt-5">
              <CommentsSection initialComments={comments} projectId={params.id} />
            </div>
          </GlassCard>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

