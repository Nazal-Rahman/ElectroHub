import mongoose, { Schema, models, Types } from "mongoose";

export type ReplySubdoc = {
  _id: Types.ObjectId;
  username: string;
  message: string;
  likes: number;
  createdAt: Date;
};

export type CommentDocument = mongoose.InferSchemaType<typeof CommentSchema>;

const ReplySchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    likes: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: true, versionKey: false }
);

const CommentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    username: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    replies: { type: [ReplySchema], required: true, default: [] },
    likes: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false }
);

export const Comment =
  models.Comment || mongoose.model("Comment", CommentSchema);

