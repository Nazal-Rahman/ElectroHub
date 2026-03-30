import { z } from "zod";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Comment } from "@/lib/models/Comment";
import { jsonError, jsonOk } from "@/lib/api/response";

export const runtime = "nodejs";

const LikeSchema = z.object({
  commentId: z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid commentId" }),
  replyId: z.string().optional().refine((v) => v === undefined || Types.ObjectId.isValid(v), {
    message: "Invalid replyId",
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = LikeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
    }

    await connectToDatabase();

    const { commentId, replyId } = parsed.data;

    const updated = replyId
      ? await Comment.findOneAndUpdate(
          { _id: commentId },
          {
            $inc: { "replies.$[elem].likes": 1 },
          },
          {
            new: true,
            arrayFilters: [{ "elem._id": replyId }],
          }
        ).lean()
      : await Comment.findOneAndUpdate(
          { _id: commentId },
          { $inc: { likes: 1 } },
          { new: true }
        ).lean();

    if (!updated) {
      return jsonError(404, "NOT_FOUND", "Comment not found");
    }

    return jsonOk(updated);
  } catch (err: any) {
    return jsonError(500, "SERVER_ERROR", "Failed to like comment", { message: err?.message });
  }
}

