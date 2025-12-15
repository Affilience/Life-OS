"use client";

import { useState } from "react";

const screenshots = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Your command center. See everything at a glance.",
    image: "/assets/screenshots/dashboard.png",
  },
  {
    id: "character",
    title: "Character",
    description: "Watch your avatar evolve as you level up.",
    image: "/assets/screenshots/character.png",
  },
  {
    id: "productivity",
    title: "Productivity",
    description: "Deep work tracking and task management.",
    image: "/assets/screenshots/productivity.png",
  },
  {
    id: "health",
    title: "Health",
    description: "Workouts, nutrition, and sleep in one place.",
    image: "/assets/screenshots/health.png",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Beautiful book-style journaling experience.",
    image: "/assets/screenshots/journal.png",
  },
  {
    id: "skills",
    title: "Skills",
    description: "Skyrim-inspired skill trees with real perks.",
    image: "/assets/screenshots/skills.png",
  },
  {
    id: "quests",
    title: "Quests",
    description: "Epic quests and daily missions to complete.",
    image: "/assets/screenshots/quests.png",
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Plan your days and track your time.",
    image: "/assets/screenshots/calendar.png",
  },
];

export function Screenshots() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const activeScreenshot = screenshots.find((s) => s.id === activeTab);

  return (
    <section id="screenshots" className="section bg-[#0a0812]">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See
            <span className="gradient-text"> LifeOS </span>
            in Action
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Beautiful, functional, and designed to make you want to use it every day.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screenshots.map((screenshot) => (
            <button
              key={screenshot.id}
              onClick={() => setActiveTab(screenshot.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === screenshot.id
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {screenshot.title}
            </button>
          ))}
        </div>

        {/* Screenshot Display */}
        <div className="relative">
          {/* Main Screenshot */}
          <div className="screenshot-frame max-w-5xl mx-auto glow-purple">
            <div className="aspect-[16/10] bg-[#1a1724] rounded-xl overflow-hidden">
              {activeScreenshot?.image ? (
                <img
                  src={activeScreenshot.image}
                  alt={activeScreenshot.title}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-white/30 text-lg mb-2">
                      [{activeScreenshot?.title} Screenshot]
                    </p>
                    <p className="text-white/20 text-sm">
                      {activeScreenshot?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden lg:block absolute -left-4 top-1/4 w-64 glass-card p-4 animate-float">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400">✓</span>
              </div>
              <span className="text-white text-sm font-medium">Task Completed!</span>
            </div>
            <p className="text-white/50 text-xs">+50 XP earned</p>
          </div>

          <div className="hidden lg:block absolute -right-4 top-1/3 w-56 glass-card p-4 animate-float" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-medium">7 Day Streak!</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full">
              <div className="h-full w-[70%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
            </div>
          </div>

          <div className="hidden lg:block absolute -right-8 bottom-1/4 w-48 glass-card p-4 animate-float" style={{ animationDelay: "2s" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-white text-sm font-medium">Level Up!</p>
                <p className="text-white/50 text-xs">Now Level 25</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile App Preview */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm mb-8">Also available on mobile</p>
          <div className="flex justify-center gap-6">
            {/* iPhone Frame */}
            <div className="w-40 md:w-56">
              <div className="aspect-[9/19] bg-[#1a1724] rounded-[2rem] border-4 border-white/10 shadow-2xl flex items-center justify-center">
                <span className="text-white/20 text-xs">[iOS App]</span>
              </div>
            </div>
            {/* Android Frame */}
            <div className="w-40 md:w-56 hidden sm:block">
              <div className="aspect-[9/19] bg-[#1a1724] rounded-[1.5rem] border-4 border-white/10 shadow-2xl flex items-center justify-center">
                <span className="text-white/20 text-xs">[Android App]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
