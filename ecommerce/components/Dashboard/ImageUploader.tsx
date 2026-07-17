"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/apiconfig";

interface ImageUploaderProps {
  value: string | string[];
  fileIds?: string[];
  onChange: (value: string | string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  multiple?: boolean;
  label?: string;
  maxFiles?: number;
  id?: string; // optional, for multiple instances
}

interface TrackedImage {
  url: string;
  fileId: string;
}

const ImageUploader = ({
  value,
  fileIds = [],
  onChange,
  onFileIdsChange,
  multiple = false,
  label = "Upload Image",
  maxFiles = 10,
  id = "image-uploader",
}: ImageUploaderProps) => {
  const [images, setImages] = useState<TrackedImage[]>(() => {
    const urls = multiple ? (value as string[]) || [] : value ? [value as string] : [];
    return urls.map((url, i) => ({ url, fileId: fileIds[i] || "" }));
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Handler
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    if (multiple && images.length + files.length > maxFiles) {
      toast.error(`You can upload up to ${maxFiles} images`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await api.post("/image/upload", formData
      );

      const uploaded = res.data.data as { url: string; imageId: string }[];
      const newImages: TrackedImage[] = uploaded.map((i) => ({
        url: i.url,
        fileId: i.imageId,
      }));

      const updatedImages = multiple
        ? [...images, ...newImages]
        : newImages;

      setImages(updatedImages);
      onChange(
        multiple
          ? updatedImages.map((i) => i.url)
          : updatedImages[0]?.url || "",
      );
      onFileIdsChange?.(
        multiple
          ? updatedImages.map((i) => i.fileId)
          : updatedImages.map((i) => i.fileId),
      );
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Remove image handler
  const handleRemove = async (img: TrackedImage) => {
    try {
      if (img.fileId) {
        await api.post("/image/delete", { fileId: img.fileId });
      }
      const updated = images.filter((i) => i.url !== img.url);
      setImages(updated);
      onChange(
        multiple ? updated.map((i) => i.url) : updated[0]?.url || "",
      );
      onFileIdsChange?.(
        multiple ? updated.map((i) => i.fileId) : updated.map((i) => i.fileId),
      );
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm space-y-4">
      <label className="text-sm font-semibold block">{label}</label>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        id={id}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />

      {/* Upload Button */}
      <label htmlFor={id} className="global_button cursor-pointer flex items-center justify-center">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> Uploading...
          </span>
        ) : multiple ? (
          "Upload Images"
        ) : (
          "Upload Image"
        )}
      </label>

      {/* Preview Section */}
      {images.length > 0 && (
        <div
          className={`grid gap-4 ${
            multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative w-full border border-gray-300 rounded-lg overflow-hidden ${
                multiple ? "h-40" : "h-[40vh]"
              }`}
            >
              <Image
                src={img.url}
                alt={`Preview ${idx}`}
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => handleRemove(img)}
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;