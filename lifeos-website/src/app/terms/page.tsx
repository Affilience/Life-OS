'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-white/50 mb-12">Last updated: January 2025</p>

        <div className="space-y-8 text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Ascnd ("the Service"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Ascnd is a personal development application that helps users track habits, set goals,
              journal, develop skills, and improve their lives through gamification and AI-powered
              insights. The Service is currently in beta and features may change.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="mb-4">To use the Service, you must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Share your account with others</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. User Content</h2>
            <p>
              You retain ownership of all content you create within the Service (journal entries,
              goals, notes, etc.). By using the Service, you grant us a limited license to process
              and store this content to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Beta Service</h2>
            <p>
              The Service is currently in beta. This means features may be incomplete, contain bugs,
              or change without notice. We appreciate your feedback and patience as we improve the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Subscription and Payments</h2>
            <p>
              During the beta period, the Service is free to use. When paid plans are introduced,
              we will provide advance notice. Founding members may receive special pricing or
              benefits as a thank you for early support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Ascnd
              and are protected by international copyright, trademark, and other intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages resulting
              from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms.
              You may also delete your account at any time. Upon termination, your right to use the
              Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes via email or through the Service. Continued use after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@ascnd.app" className="text-purple-400 hover:text-purple-300">
                legal@ascnd.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
