"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import FileDropzone from "./FileDropzone";
import { Plus, X } from "lucide-react";

export default function UploadProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [componentDraft, setComponentDraft] = useState("");
  const [components, setComponents] = useState<string[]>([]);
  const [extraNotes, setExtraNotes] = useState("");

  const [codeZip, setCodeZip] = useState<File | null>(null);
  const [circuitPdf, setCircuitPdf] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pdfPreviewUrl = useMemo(() => {
    if (!circuitPdf) return null;
    return URL.createObjectURL(circuitPdf);
  }, [circuitPdf]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!codeZip) throw new Error("Please choose a code ZIP file.");
      if (!circuitPdf) throw new Error("Please choose a circuit PDF file.");

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("components", JSON.stringify(components));

      if (extraNotes.trim().length > 0) {
        fd.append("extraNotes", extraNotes);
      }

      fd.append("codeZip", codeZip);
      fd.append("circuitPdf", circuitPdf);
      for (const img of images) fd.append("images", img);

      const res = await fetch("/api/projects", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Upload failed");
      }

      setSuccess("Project uploaded successfully.");
      toast.success("Project uploaded");
      setTitle("");
      setDescription("");
      setComponentDraft("");
      setComponents([]);
      setExtraNotes("");
      setCodeZip(null);
      setCircuitPdf(null);
      setImages([]);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed");
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-5">
          <div>
            <div className="text-xs font-semibold text-white/75">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              placeholder="e.g., Smart Soil Moisture Monitor"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-white/75">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-2 min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              placeholder="What did you build, how it works, and what makes it special?"
            />
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/75">Components</div>
                <div className="mt-1 text-xs text-white/45">
                  Add parts as tags (Enter to add).
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={componentDraft}
                onChange={(e) => setComponentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = componentDraft.trim();
                    if (!v) return;
                    setComponents((prev) =>
                      prev.includes(v) ? prev : [...prev, v]
                    );
                    setComponentDraft("");
                  }
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
                placeholder="e.g., Arduino Nano"
              />
              <button
                type="button"
                onClick={() => {
                  const v = componentDraft.trim();
                  if (!v) return;
                  setComponents((prev) => (prev.includes(v) ? prev : [...prev, v]));
                  setComponentDraft("");
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                aria-label="Add component"
              >
                <Plus size={18} />
              </button>
            </div>

            {components.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {components.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => setComponents((prev) => prev.filter((x) => x !== c))}
                      className="text-white/55 hover:text-white"
                      aria-label={`Remove ${c}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-xs font-semibold text-white/75">Extra Notes (optional)</div>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="mt-2 min-h-[120px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              placeholder="Any extra details, tips, calibration notes, or future improvements..."
            />
          </div>
        </section>

        <aside className="space-y-6">
          <FileDropzone
            label="Code ZIP (required)"
            helper="Upload a .zip file for download."
            accept=".zip,application/zip,application/x-zip-compressed"
            multiple={false}
            files={codeZip ? [codeZip] : []}
            onFiles={(files) => setCodeZip(files[0] ?? null)}
          />

          <FileDropzone
            label="Circuit Diagram PDF (required)"
            helper="Upload a .pdf file. A preview appears below."
            accept=".pdf,application/pdf"
            multiple={false}
            files={circuitPdf ? [circuitPdf] : []}
            onFiles={(files) => setCircuitPdf(files[0] ?? null)}
          />

          {pdfPreviewUrl ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="text-xs font-semibold text-white/70">PDF preview</div>
              <iframe
                src={pdfPreviewUrl}
                className="mt-2 h-56 w-full rounded-2xl border border-white/10 bg-black/40"
                title="Circuit PDF preview"
              />
            </div>
          ) : null}

          <FileDropzone
            label="Images (optional)"
            helper="Upload multiple images. These render as a gallery."
            accept="image/*"
            multiple
            files={images}
            onFiles={(files) => setImages(files)}
          />

          {images.length ? (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(0, 6).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Project image ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      {error ? <p className="mt-5 text-sm text-red-400">{error}</p> : null}
      {success ? <p className="mt-5 text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload project"}
      </button>
    </form>
  );
}

