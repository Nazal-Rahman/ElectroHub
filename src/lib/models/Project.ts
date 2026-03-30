import mongoose, { Schema, models } from "mongoose";

export type ProjectDocument = mongoose.InferSchemaType<typeof ProjectSchema>;

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    codeFileUrl: { type: String, required: true },
    images: { type: [String], required: false },
    circuitPdfUrl: { type: String, required: true },
    components: { type: [String], required: true, default: [] },
    extraNotes: { type: String, required: false, trim: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false }
);

export const Project =
  models.Project || mongoose.model("Project", ProjectSchema);

