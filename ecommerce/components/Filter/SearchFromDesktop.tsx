"use client";

import Image from "next/image";
import { Fragment, useState, useEffect, useMemo, useRef } from "react";
Search
// import { debounce } from "lodash";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
// import { baseAPI } from "@/utils/config";

const SearchFormLarge = () => {
  const router = useRouter();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [clickChangeColor, setClickChangeColor] = useState(false);
  const inputRef = useRef(null);

  // Outside click handle
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (inputRef.current && !inputRef.current.contains(event.target)) {
//         setClickChangeColor(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchSuggestions = async (keyword) => {
//     if (!keyword.trim()) {
//       setSuggestions([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${baseAPI}/getEcomProduct/1/40/${keyword}`,
//         { cache: "no-cache" },
//       );
//       const data = await response.json();
//       if (data.status === "Success") {
//         setSuggestions(data.data || []);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const debouncedFetchSuggestions = useMemo(() => {
//     return debounce((keyword) => fetchSuggestions(keyword), 500);
//   }, []);

//   useEffect(() => {
//     debouncedFetchSuggestions(searchKeyword);
//     return () => debouncedFetchSuggestions.cancel();
//   }, [searchKeyword, debouncedFetchSuggestions]);

//   const getImageUrl = (image) => {
//     if (!image || typeof image !== "string" || image.trim() === "") {
//       return "/icons8-no-image-96.png";
//     }
//     try {
//       return encodeURI(image);
//     } catch {
//       return "/icons8-no-image-96.png";
//     }
//   };

  const clearSearch = () => {
    setSearchKeyword("");
    setSuggestions([]);
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      router.push(`/product/search/${searchKeyword}`);
      setClickChangeColor(false); // ✅ hide dropdown
      setSuggestions([]); // ✅ clear suggestions
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(); // ✅ redirect on Enter
      }}
      className="flex items-center w-md xl:w-[600px] justify-start relative"
    >
      <div className="relative w-full" ref={inputRef}>
        <input
          onClick={() => setClickChangeColor(true)}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search for Products (e.g. biscuit, oil, drink)"
          className={`outline-none w-full rounded-lg py-[8px] px-2 text-[#080808] ${
            clickChangeColor
              ? "bg-white shadow-lg border-2 border-[#1ea0f7]"
              : "bg-[#ffffff] border-2 border-[#1ea0f7]"
          }`}
        />
        {/* {searchKeyword && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
          )} */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-2xl hover:scale-110 active:text-[#1ea0f7]"
        >
          <Search />
        </button>
      </div>
      {/* Suggention Dropdown */}
      {/* {suggestions.length > 0 && searchKeyword && (
        <div className="absolute top-full w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {loading && <h1 className="text-center py-2">Searching...</h1>}
          {suggestions.slice(0, 100).map((suggestion, index) => (
            <Link
              key={index}
              href={`/product/${suggestion.slug}`}
              prefetch={false}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSearchKeyword("");
                setSuggestions([]);
              }}
            >
              <Image
                src={getImageUrl(suggestion.image)}
                alt={suggestion.name}
                height={30}
                width={30}
                className="object-cover rounded-sm"
              />
              <span>{suggestion.name}</span>
            </Link>
          ))}
        </div>
      )} */}
    </form>
  );
};

export default SearchFormLarge;
