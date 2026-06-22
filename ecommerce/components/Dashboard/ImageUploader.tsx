"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import api from "@/utils/apiconfig";

interface ImageUploaderProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  maxFiles?: number;
  id?: string; // optional, for multiple instances
}

const ImageUploader = ({
  value,
  onChange,
  multiple = false,
  label = "Upload Image",
  maxFiles = 10,
  id = "image-uploader",
}: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(
    multiple ? (value as string[]) || [] : value ? [value as string] : [],
  );
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Handler
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    if (multiple && images.length + files.length > maxFiles) {
      alert(`You can upload up to ${maxFiles} images`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await api.post("/image/upload", formData
      );

      const uploadedUrls = (res.data.data as { url: string }[]).map(
        (i) => i.url,
      );

      const updatedImages = multiple
        ? [...images, ...uploadedUrls]
        : uploadedUrls;

      setImages(updatedImages);
      onChange(multiple ? updatedImages : uploadedUrls[0]);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Remove image handler
  const handleRemove = async (imgUrl: string) => {
    try {
      await api.post("/image/delete", { imageUrl: imgUrl });
      const updated = images.filter((i) => i !== imgUrl);
      setImages(updated);
      onChange(multiple ? updated : "");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
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
                src={img}
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