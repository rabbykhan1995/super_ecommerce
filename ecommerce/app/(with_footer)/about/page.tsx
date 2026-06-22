"use client";

import Image from "next/image";
import React from "react";

// ── Static Data ──────────────────────────────────────────────────────────────
const STATS = [
  { value: "7M+", label: "YouTube Subscribers" },
  { value: "15+", label: "Years of Training" },
  { value: "20+", label: "Programs Created" },
  { value: "500+", label: "Athletes Coached" },
];

const ACHIEVEMENTS = [
  "Mr. Junior Canada — Natural Bodybuilding, 2012",
  "Canadian National Bench Press Record — Powerlifting, 2014",
  "502 lb Squat · 336 lb Bench · 518 lb Deadlift",
  "All-Time Best Wilks Score of 446",
  "B.Sc. Biochemistry",
  "Guest Lecturer — University of Iowa & Lehman College",
];

const TEAM = [
  {
    name: "Max Edsey",
    role: "Senior Content Manager",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    bio: "Max holds a B.S. in Exercise Science from Ohio State and an M.S. in Sport & Exercise Nutrition from Loughborough University. He has been part of the team since 2017.",
  },
  {
    name: "Patrick MacInnis",
    role: "Pro Athlete & Coach",
    img: "https://images.unsplash.com/photo-1583500178450-e59e4309b57a?w=600&q=80",
    bio: "Patrick is a professional natural men's physique competitor and certified bodybuilding judge. He turned pro in 2016 and is passionate about evidence-based coaching.",
  },
  {
    name: "Denise Henstridge",
    role: "BEd.E, ECITS PTC",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    bio: "Denise has embraced healthy living for 25+ years and has been a certified personal coach since 2006. Her teaching background brings a uniquely organized approach.",
  },
];

const SOCIALS = [
  {
    platform: "YouTube",
    handle: "@YourChannel",
    tagline: "FITNESS · SCIENCE · LIFESTYLE",
    cta: "Subscribe →",
    href: "https://youtube.com",
  },
  {
    platform: "Instagram",
    handle: "@yourhandle",
    tagline: "ATHLETE · COACH · CREATOR",
    cta: "Follow →",
    href: "https://instagram.com",
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const fallbackImg = "https://via.placeholder.com/400x500?text=No+Image";

  return (
    <main className="bg-stone-50 text-stone-900 antialiased">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        {/* Grid Texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none bg-[length:56px_56px] bg-[linear-gradient(#78716c_1px,transparent_1px),linear-gradient(90deg,#78716c_1px,transparent_1px)]"
        />
        <div className="h-1 w-full bg-lime-400" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pt-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
          <div className="py-20 lg:py-28">
            <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-8">
              <span className="w-7 h-px bg-lime-500" />
              Drug-Free Athlete & Educator
            </span>
            <h1 className="text-[clamp(3rem,8vw,7rem)] font-black leading-tight tracking-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              AKIB<br /><span className="text-lime-500">JAVED</span><br />SHESHIR
            </h1>
            <p className="mt-8 max-w-lg text-base lg:text-lg leading-relaxed text-stone-500 font-light">
              Professional natural bodybuilder, powerlifter, and science-based fitness educator. Helping millions train smarter — no fluff, just results.
            </p>
            <a
              href="/programs"
              className="inline-block mt-10 px-8 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium hover:bg-lime-400 hover:text-stone-900 transition-colors duration-300"
            >
              Explore Programs
            </a>
          </div>

          <div className="hidden lg:flex justify-end items-end pl-10">
            <div className="relative w-full max-w-[480px]">
              <div className="absolute -top-5 -left-5 right-5 bottom-0 border border-lime-300/60" />
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85"
                alt="Athlete portrait"
                height={1000}
                width={500}
                className="relative z-10 w-full object-cover grayscale-[10%]"
                onError={(e) => ((e.target as HTMLImageElement).src = fallbackImg)}
                style={{ aspectRatio: "3/4" }}
              />
              <div className="absolute bottom-0 right-0 z-20 bg-lime-400 px-5 py-3 text-stone-900 text-xs font-black tracking-widest uppercase" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Est. 2012
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
            {STATS.map((s) => (
              <div key={s.label} className="py-8 px-6 first:pl-0 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-black text-lime-500 leading-none">
                  {s.value}
                </div>
                <div className="mt-2 text-xs tracking-wide uppercase text-stone-400 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-28 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-28">
        <div className="lg:sticky lg:top-24 self-start">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> About
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            THE<br />STORY
          </h2>
          <div className="mt-5 w-10 h-1 bg-lime-400" />
        </div>
        <div>
          <div className="space-y-5 text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            {ACHIEVEMENTS.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-t border-stone-100 py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="mb-16">
            <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
              <span className="w-6 h-px bg-lime-500" /> The People
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              MEET<br />THE TEAM
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM.map((member) => (
              <article key={member.name} className="group bg-white overflow-hidden rounded-lg shadow-sm">
                <div className="relative w-full h-72 overflow-hidden">
                  <Image
                    src={member.img || fallbackImg}
                    alt={member.name}
                    fill
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-stone-900 leading-tight">{member.name}</h3>
                  <p className="mt-1 text-xs tracking-wide uppercase text-lime-600 font-medium">{member.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500 font-light">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-28">
        <div className="mb-14">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Connect
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            FOLLOW<br />THE JOURNEY
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between bg-stone-100 hover:bg-stone-900 transition-colors duration-500 p-8 rounded-lg min-h-[260px]"
            >
              <div>
                <span className="block text-4xl sm:text-5xl font-black text-stone-900 group-hover:text-white transition-colors duration-500">{s.platform}</span>
                <p className="mt-2 text-xs tracking-wide text-stone-400">{s.handle}</p>
              </div>
              <div className="flex items-end justify-between mt-6">
                <p className="text-xs tracking-wide uppercase text-stone-400 max-w-[180px]">{s.tagline}</p>
                <span className="text-xs tracking-wide uppercase border border-stone-300 group-hover:border-lime-400 group-hover:text-lime-400 text-stone-500 px-4 py-1 transition-colors duration-300">{s.cta}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}