import { z } from "zod";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/lib/models/Project";
import { Comment } from "@/lib/models/Comment";
import { jsonError, jsonOk } from "@/lib/api/response";

const IdSchema = z.object({
  id: z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid id" }),
});

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const parsed = IdSchema.safeParse(context.params);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Invalid project id", parsed.error.flatten());
  }

  try {
    await connectToDatabase();

    const project = await Project.findById(parsed.data.id).lean();
    if (!project) {
      return jsonError(404, "NOT_FOUND", "Project not found");
    }

    const comments = await Comment.find({ projectId: parsed.data.id })
      .sort({ createdAt: 1 })
      .lean();

    return jsonOk({ project, comments });
  } catch {
    return jsonError(500, "SERVER_ERROR", "Failed to fetch project");
  }
}

