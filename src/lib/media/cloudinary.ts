import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "battlexa-cloud";
const API_KEY = process.env.CLOUDINARY_API_KEY || "123456789012345";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "sampleCloudinaryApiSecretKey";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateUploadFile(file: { type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP images are permitted.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size exceeds the 5MB maximum limit.",
    };
  }
  return { valid: true };
}

export function generateUploadSignature(folder: string = "battlexa"): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + API_SECRET)
    .digest("hex");

  return {
    timestamp,
    signature,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder,
  };
}
