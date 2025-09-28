import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { GradientButton } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedBackground } from '@/components/ui/animated-background';

export const metadata: Metadata = {
  title: 'About EvePost - Event Management Platform',
  description: 'Learn more about EvePost, the comprehensive event management and attendance tracking platform.',
};

export default function AboutPage() {
  return (
    <AnimatedBackground className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="text-primary">EvePost</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              EvePost is revolutionizing event management by providing a seamless, all-in-one platform
              for organizers to create, manage, and track events with ease.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-6 lg:px-12 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                <p className="text-lg text-gray-300 mb-6">
                  We believe that hosting successful events shouldn&apos;t be complicated. Whether you&apos;re organizing
                  a small workshop, a corporate conference, or a large festival, EvePost provides the tools
                  you need to manage registrations, check-ins, and analytics effortlessly.
                </p>
                <p className="text-lg text-gray-300">
                  Our platform combines intuitive design with powerful features to help event organizers
                  focus on what matters most: creating memorable experiences for their attendees.
                </p>
              </div>
              <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-white mb-4">What Sets Us Apart</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <span>QR code-based check-ins for instant, contactless entry</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <span>Real-time analytics and attendee insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <span>Intuitive event creation and customization tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <span>Secure and reliable platform for events of all sizes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Trusted by Event Organizers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-gray-300">Events Created</div>
              </div>
              <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">500,000+</div>
                <div className="text-gray-300">Attendees Checked In</div>
              </div>
              <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-gray-300">Uptime Reliability</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-12 bg-primary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Host Your Next Event?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of event organizers who trust EvePost to make their events successful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/events">Browse Events</Link>
              </GradientButton>
              <GradientButton asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/auth/login">Get Started</Link>
              </GradientButton>
            </div>
          </div>
        </section>
      </main>
    </AnimatedBackground>
  );
}
