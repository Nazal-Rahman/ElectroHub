import { z } from "zod";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/lib/models/Project";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminOrNull } from "@/lib/auth/requireAdmin";
import { uploadProjectImages, uploadRawProjectFile } from "@/lib/uploads/cloudinary";

const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  components: z.array(z.string().min(1)).optional(),
  extraNotes: z.string().optional(),
});

function parseComponents(raw: string | null): string[] {
  if (!raw) return [];

  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const asJson = JSON.parse(trimmed);
    if (Array.isArray(asJson)) {
      return asJson.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    // fall through to comma/newline split
  }

  return trimmed
    .split(/[,|\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .select({ title: 1, description: 1, images: 1, createdAt: 1 })
      .lean();

    return jsonOk(projects);
  } catch (err) {
    return jsonError(500, "SERVER_ERROR", "Failed to fetch projects");
  }
}

export async function POST(req: Request) {
  const authed = await requireAdminOrNull();
  if (!authed) {
    return jsonError(401, "UNAUTHORIZED", "Admin access required");
  }

  try {
    const form = await req.formData();

    const title = String(form.get("title") ?? "");
    const description = String(form.get("description") ?? "");
    const componentsRaw = form.get("components");
    const extraNotes = form.get("extraNotes");

    const components = parseComponents(componentsRaw ? String(componentsRaw) : null);

    const parsed = CreateProjectSchema.safeParse({
      title,
      description,
      components,
      extraNotes: extraNotes ? String(extraNotes) : undefined,
    });

    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid project payload", parsed.error.flatten());
    }

    const codeZip = form.get("codeZip");
    const circuitPdf = form.get("circuitPdf");
    const images = form.getAll("images").filter((v) => v instanceof File) as File[];

    if (!(codeZip instanceof File) || !codeZip.size) {
      return jsonError(400, "VALIDATION_ERROR", "codeZip file is required");
    }
    if (!(circuitPdf instanceof File) || !circuitPdf.size) {
      return jsonError(400, "VALIDATION_ERROR", "circuitPdf file is required");
    }

    const baseFolder = process.env.CLOUDINARY_FOLDER ?? "electrohub";
    const uploadFolderId = new Types.ObjectId().toString();
    const projectFolder = `${baseFolder}/projects/${uploadFolderId}`;

    const codeFileUrl = await uploadRawProjectFile({
      file: codeZip,
      kind: "zip",
      projectFolder,
    });
    const circuitPdfUrl = await uploadRawProjectFile({
      file: circuitPdf,
      kind: "pdf",
      projectFolder,
    });

    const imageUrls = images.length
      ? await uploadProjectImages({ images, projectFolder })
      : [];

    const extraNotesTrimmed =
      parsed.data.extraNotes && parsed.data.extraNotes.trim().length > 0
        ? parsed.data.extraNotes.trim()
        : undefined;

    const created = await Project.create({
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      codeFileUrl,
      images: imageUrls.length ? imageUrls : undefined,
      circuitPdfUrl,
      components: parsed.data.components?.length ? parsed.data.components : [],
      extraNotes: extraNotesTrimmed,
    });

    return jsonOk(created);
  } catch (err: any) {
    return jsonError(500, "SERVER_ERROR", "Failed to upload project", { message: err?.message });
  }
}

