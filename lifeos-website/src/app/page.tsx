import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Modules } from "@/components/Modules";
import { Gamification } from "@/components/Gamification";
import { Screenshots } from "@/components/Screenshots";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Modules />
      <Gamification />
      <Screenshots />
      <CTA />
      <Footer />
    </main>
  );
}
