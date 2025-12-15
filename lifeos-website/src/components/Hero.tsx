import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/70">Now in Beta — Join the waitlist</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Your Personal
            <br />
            <span className="gradient-text">Operating System</span>
            <br />
            for Life
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Track productivity, fitness, finances, and personal growth — all in one place.
            With gamification that makes self-improvement addictive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Start Your Journey
            </Link>
            <Link href="#screenshots" className="btn-secondary text-lg px-8 py-4">
              See it in Action
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-white/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 border-2 border-[#0c0a10]"
                  />
                ))}
              </div>
              <span className="text-sm">500+ beta users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Screenshot */}
        <div className="mt-20 relative">
          <div className="screenshot-frame mx-auto max-w-5xl glow-purple">
            <div className="aspect-[16/10] bg-[#1a1724] rounded-xl overflow-hidden">
              <img
                src="/assets/screenshots/dashboard.png"
                alt="LifeOS Dashboard"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Floating UI Elements */}
          <div className="hidden lg:block absolute -left-8 top-1/3 glass-card p-4 animate-float">
            <div className="flex items-center gap-3">
              <img
                src="/assets/sprites/pets/pet_phoenix.png"
                alt="Phoenix Pet"
                className="w-10 h-10"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <p className="text-white text-sm font-medium">Phoenix joined!</p>
                <p className="text-white/50 text-xs">+10% XP bonus</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-8 top-1/4 glass-card p-4 animate-float" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-3">
              <img
                src="/assets/sprites/equipment/sword_celestial.png"
                alt="Celestial Sword"
                className="w-10 h-10"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <p className="text-white text-sm font-medium">Epic Drop!</p>
                <p className="text-amber-400 text-xs">Celestial Sword</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
