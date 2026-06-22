"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "@/utils/apiconfig";
import toast from "react-hot-toast";
import { Save, Tag as TagIcon, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import ImageUploader from "@/components/Dashboard/ImageUploader";
import { refreshProductData } from "@/app/actions";

// Editor-ke dynamic import kora holo
const MDXEditorComponent = dynamic(() => import("@/components/MDX/MDXEditor"), {
  ssr: false,
});


const UpdateProduct = () => {
  const [productID, setProductID] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [images, setImages] = useState<string[]>([]);

  // 🔥 ১️⃣ slug দিয়ে blog fetch
  useEffect(() => {
    if (!slug) return;

    const fetchTraining = async () => {
      try {
        const res = await api.get(`/product/productBySlug/${slug}`);
        const product = res.data.data;
        setProductID(product._id);
        setTitle(product.title);
        setDescription(product?.description);
        setShortDescription(product?.shortDescription);
        setThumbnail(product?.thumbnail);
        setTags(product.tags || []);
        setPrice(product.price);
        setStock(product.stock);
        setImages(product.images);
      } catch (error) {
        toast.error("Product not found");
        router.push("/admin/product/product-list");
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [slug]);


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const update = async () => {

    const product = {
      title,
      price: Number(price),
      description,
      shortDescription,
      tags,
      active: true,
      thumbnail,
      images,
      stock
    };

    await api.put(`/product/update/${productID}`, product);

    await refreshProductData(slug)
    toast.success("Product updated successfully");

    router.refresh();
    router.push(`/product/${slug}`);
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}

      <h1 className="text-2xl font-bold">New Product</h1>



      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Thumbnail */}
          <ImageUploader
            label="Thumbnail"
            value={thumbnail}
            onChange={(val) => setThumbnail(val as string)}
          />
          <ImageUploader
            label="Product Images"
            value={images}
            onChange={(val) => setImages(val as string[])}
            multiple
            maxFiles={4}
          />
          {/* Title Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
            <input
              type="text"
              placeholder="Post Title..."
              className="w-full text-3xl font-bold outline-none border-none placeholder:text-gray-300"
              value={title}
              onChange={handleTitleChange}
            />
            <div className="text-sm text-gray-400 mt-2 font-mono">
              Slug: {slug}
            </div>
          </div>


          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm space-y-3">
            {/* Price */}
            <div>
              <label className="text-sm font-semibold block mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="input_field"
                min={0}
              />
            </div>
            {/* Stock */}
            <div>
              <label className="text-sm font-semibold block mb-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="input_field"
                min={0}
              />
            </div>


          </div>
          <h1>Short Description</h1>
          {/* MDX Editor Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col min-h-0">
            <MDXEditorComponent
              markdown={shortDescription}
              onChange={(v) => setShortDescription(v)}
            />
          </div>
          <h1>Full Description</h1>
          {/* MDX Editor Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col min-h-0">
            <MDXEditorComponent
              markdown={description}
              onChange={(v) => setDescription(v)}
            />
          </div>{" "}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <TagIcon size={16} /> Tags
            </label>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={addTag}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {tag}{" "}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => update()}
        className="global_button my-2"
      >
        Publish
      </button>
    </div>
  );
};

export default UpdateProduct;
