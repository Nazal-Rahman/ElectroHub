import { z } from "zod";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/Comment";
import { jsonError, jsonOk } from "@/lib/api/response";

export const runtime = "nodejs";

const AddCommentSchema = z.object({
  projectId: z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid projectId" }),
  username: z.string().min(1).max(50).trim(),
  message: z.string().min(1).max(5000).trim(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = AddCommentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
    }

    await connectToDatabase();

    const created = await Comment.create({
      projectId: parsed.data.projectId,
      username: parsed.data.username,
      message: parsed.data.message,
      replies: [],
      likes: 0,
    });

    return jsonOk(created);
  } catch (err: any) {
    return jsonError(500, "SERVER_ERROR", "Failed to add comment", { message: err?.message });
  }
}

