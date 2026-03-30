import { z } from "zod";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/Comment";
import { jsonError, jsonOk } from "@/lib/api/response";

export const runtime = "nodejs";

const ReplySchema = z.object({
  commentId: z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid commentId" }),
  username: z.string().min(1).max(50).trim(),
  message: z.string().min(1).max(5000).trim(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = ReplySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
    }

    await connectToDatabase();

    const updated = await Comment.findByIdAndUpdate(
      parsed.data.commentId,
      {
        $push: {
          replies: {
            _id: new Types.ObjectId(),
            username: parsed.data.username,
            message: parsed.data.message,
            likes: 0,
          },
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return jsonError(404, "NOT_FOUND", "Comment not found");
    }

    return jsonOk(updated);
  } catch (err: any) {
    return jsonError(500, "SERVER_ERROR", "Failed to add reply", { message: err?.message });
  }
}

