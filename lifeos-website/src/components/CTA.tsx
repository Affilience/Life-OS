import Link from "next/link";

export function CTA() {
  return (
    <section className="section relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to
            <span className="gradient-text"> Level Up </span>
            Your Life?
          </h2>

          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Join thousands of people who are tracking their way to a better life.
            Start free, upgrade when you're ready.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup" className="btn-primary text-lg px-10 py-4">
              Get Started Free
            </Link>
            <Link href="#" className="btn-secondary text-lg px-10 py-4">
              Watch Demo
            </Link>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/50">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free forever tier</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="testimonial-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-white/80 text-lg italic mb-4">
                  "LifeOS completely changed how I approach personal development. The gamification
                  actually makes me excited to log my workouts and complete tasks. I've been more
                  consistent in the last 3 months than the previous 3 years combined."
                </p>
                <div>
                  <p className="text-white font-medium">Alex K.</p>
                  <p className="text-white/40 text-sm">Software Engineer • Level 42</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
