import { v2 as cloudinary } from "cloudinary";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable ${name}`);
  return val;
}

let isConfigured = false;

function ensureCloudinaryConfigured() {
  if (isConfigured) return;
  cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  });
  isConfigured = true;
}

async function uploadBuffer({
  buffer,
  filename,
  mimeType,
  resourceType,
  folder,
  publicId,
}: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  resourceType: "image" | "raw";
  folder: string;
  publicId?: string;
}) {
  ensureCloudinaryConfigured();

  const uploadResult = await new Promise<{
    secure_url: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        public_id: publicId,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        filename_override: filename,
        // mime_type helps Cloudinary set correct content-type for raw uploads
        // (not strictly required but improves browser preview/download behavior).
        ...(mimeType ? { mimeType: mimeType } : {}),
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error("Cloudinary upload returned no URL"));
        resolve({ secure_url: result.secure_url });
      }
    );

    stream.end(buffer);
  });

  return uploadResult.secure_url;
}

function getExtension(filename: string) {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx + 1) : "";
}

function extLower(filename: string) {
  return getExtension(filename).toLowerCase();
}

export async function uploadProjectImages({
  images,
  projectFolder,
}: {
  images: File[];
  projectFolder: string;
}) {
  if (!images.length) return [];

  const results: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const ext = extLower(file.name);
    const looksLikeImage =
      (file.type && file.type.startsWith("image/")) ||
      ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext);

    if (!looksLikeImage) {
      throw new Error(`Invalid image type: ${file.type || ext || "unknown"}`);
    }

    const normalizedExt = ext || "img";
    const filename = file.name.replace(/\.[^/.]+$/, `.${normalizedExt}`);
    const publicId = `image_${i}_${Date.now()}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBuffer({
      buffer,
      filename,
      mimeType: file.type,
      resourceType: "image",
      folder: `${projectFolder}/images`,
      publicId,
    });

    results.push(url);
  }

  return results;
}

export async function uploadRawProjectFile({
  file,
  kind,
  projectFolder,
}: {
  file: File;
  kind: "zip" | "pdf";
  projectFolder: string;
}) {
  const allowedZip = new Set(["application/zip", "application/x-zip-compressed", "application/octet-stream"]);
  const allowedPdf = new Set(["application/pdf", "application/octet-stream"]);

  const ext = extLower(file.name);
  if (kind === "zip") {
    const looksLikeZip = (file.type && allowedZip.has(file.type)) || ext === "zip";
    if (!looksLikeZip) throw new Error(`Invalid ZIP type: ${file.type || ext || "unknown"}`);
  }
  if (kind === "pdf") {
    const looksLikePdf = (file.type && allowedPdf.has(file.type)) || ext === "pdf";
    if (!looksLikePdf) throw new Error(`Invalid PDF type: ${file.type || ext || "unknown"}`);
  }

  const filename = ext ? file.name : kind === "zip" ? "code.zip" : "circuit.pdf";

  const buffer = Buffer.from(await file.arrayBuffer());

  const folder = projectFolder;
  const resourceType: "raw" = "raw";
  const publicId = kind === "zip" ? `code_${Date.now()}` : `circuit_${Date.now()}`;

  const url = await uploadBuffer({
    buffer,
    filename,
    mimeType: file.type,
    resourceType,
    folder: `${folder}/${kind === "zip" ? "code" : "circuit"}`,
    publicId,
  });

  return url;
}

