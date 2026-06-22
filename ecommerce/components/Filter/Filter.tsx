"use client";

import api from "@/utils/apiconfig";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface LevelItem {
  _id: string;
  name: string;
}

const Filter = () => {
  const [activeSort, setActiveSort] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // 🔹 Fetch levels from API
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get("/training/level-list");
        setLevels(res.data.data); // expect array of {_id, name}
      } catch (err) {
        console.error("Failed to fetch levels", err);
      }
    };
    fetchLevels();
  }, []);

  return (
    <div className="space-y-6 lg:block hidden">
      {/* Header */}
      <div className="mt-10">
        <h1 className="text-lg font-bold uppercase">Training Programs</h1>
        <h1 className="text-[#646464]">25 products</h1>

        {/* Search */}
        <div className="relative py-6 border-b border-gray-400">
          <input
            type="text"
            placeholder="Search Trainings"
            className="py-3 px-5 border border-gray-400 rounded-sm w-full pr-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-1/2 -translate-y-1/2 right-5 text-[#949494]" />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <h1 className="text-sm font-semibold">
          Sort By: <span className="text-gray-600">{activeSort || "None"}</span>
        </h1>

        <CustomCheckBox
          label="Featured"
          checked={activeSort === "Featured"}
          onChange={(checked) => setActiveSort(checked ? "Featured" : "")}
        />
        <CustomCheckBox
          label="Best selling"
          checked={activeSort === "Best selling"}
          onChange={(checked) => setActiveSort(checked ? "Best selling" : "")}
        />
        <CustomCheckBox
          label="Alphabetically, A-Z"
          checked={activeSort === "Alphabetically, A-Z"}
          onChange={(checked) =>
            setActiveSort(checked ? "Alphabetically, A-Z" : "")
          }
        />
        <CustomCheckBox
          label="Alphabetically, Z-A"
          checked={activeSort === "Alphabetically, Z-A"}
          onChange={(checked) =>
            setActiveSort(checked ? "Alphabetically, Z-A" : "")
          }
        />
        <CustomCheckBox
          label="Price, low to high"
          checked={activeSort === "Price, low to high"}
          onChange={(checked) =>
            setActiveSort(checked ? "Price, low to high" : "")
          }
        />
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <h1 className="text-sm font-semibold">Experience Level</h1>

        {levels.map((lvl) => (
          <CustomCheckBox
            key={lvl._id}
            label={lvl.name}
            checked={experienceLevel.includes(lvl.name)}
            onChange={() =>
              toggleItem(lvl.name, experienceLevel, setExperienceLevel)
            }
          />
        ))}
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <h1 className="text-sm font-semibold">Goal</h1>

        <CustomCheckBox
          label="Gain Strength"
          checked={goals.includes("Gain Strength")}
          onChange={() => toggleItem("Gain Strength", goals, setGoals)}
        />
        <CustomCheckBox
          label="Gain Muscle"
          checked={goals.includes("Gain Muscle")}
          onChange={() => toggleItem("Gain Muscle", goals, setGoals)}
        />
        <CustomCheckBox
          label="Both"
          checked={goals.includes("Both")}
          onChange={() => toggleItem("Both", goals, setGoals)}
        />
      </div>
    </div>
  );
};

export default Filter;

interface CustomCheckBoxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomCheckBox = ({ label, checked, onChange }: CustomCheckBoxProps) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer hidden"
      />

      <span
        className="
          w-4 h-4 rounded-full border border-gray-400
          flex items-center justify-center
          peer-checked:bg-black peer-checked:border-black
        "
      >
        <svg
          className="w-3 h-3 text-white hidden peer-checked:block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      <span className="text-sm font-medium">{label}</span>
    </label>
  );
};
