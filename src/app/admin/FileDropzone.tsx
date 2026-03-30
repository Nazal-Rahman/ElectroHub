"use client";

import { UploadCloud } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";

export default function FileDropzone({
  label,
  helper,
  accept,
  multiple,
  files,
  onFiles,
}: {
  label: string;
  helper?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = Array.from(e.dataTransfer.files ?? []);
      if (!dropped.length) return;
      onFiles(multiple ? dropped : [dropped[0]]);
    },
    [multiple, onFiles]
  );

  const fileNames = useMemo(() => files.map((f) => f.name), [files]);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white/75">{label}</div>
          {helper ? <div className="mt-1 text-xs text-white/45">{helper}</div> : null}
        </div>
        <label className="cursor-pointer text-xs font-semibold text-white/70 hover:text-white underline">
          Browse
          <input
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              onFiles(multiple ? picked : picked.slice(0, 1));
            }}
          />
        </label>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        className={cn(
          "mt-3 rounded-2xl border border-white/10 bg-black/25 p-4 transition",
          dragOver ? "border-cyan-300/40 bg-white/10" : "hover:bg-white/[0.07]"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
            <UploadCloud size={18} className="text-white/70" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white/85">
              Drag & drop files here
            </div>
            <div className="text-xs text-white/45">
              {multiple ? "You can drop multiple files." : "Drop a single file."}
            </div>
          </div>
        </div>

        {fileNames.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {fileNames.map((n) => (
              <span
                key={n}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
              >
                {n}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

