// HeroSection component for the homepage

"use client";

import React from 'react';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from "framer-motion";
import { AnimatedBackground } from '@/components/ui/animated-background';

function HeroSectionComponent() {
    return (
        <>
            <main className="overflow-x-hidden">
                <section>
                    <AnimatedBackground className="relative min-h-screen w-full flex items-center justify-center">
                        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
                            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 2 }}
                                    className="max-w-4xl mx-auto"
                                >
                                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                                        {"EvePost: Create, Manage, and Host Events with Ease".split(" ").map((word, wordIndex) => (
                                            <span
                                                key={wordIndex}
                                                className="inline-block mr-4 last:mr-0"
                                            >
                                                {word.split("").map((letter, letterIndex) => (
                                                    <motion.span
                                                        key={`${wordIndex}-${letterIndex}` }
                                                        initial={{ y: 100, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                wordIndex * 0.1 +
                                                                letterIndex * 0.03,
                                                            type: "spring",
                                                            stiffness: 150,
                                                            damping: 25,
                                                        }}
                                                        className="inline-block text-transparent bg-clip-text
                                                        bg-gradient-to-r from-white to-white/80
                                                        dark:from-white dark:to-white/80"
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))}
                                            </span>
                                        ))}
                                    </h1>

                                    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                        <GradientButton
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full pl-5 pr-3 text-base text-white"
                                        >
                                            <Link href="/events">
                                                <span className="text-nowrap">Browse Events</span>
                                                <ChevronRight className="ml-1" />
                                            </Link>
                                        </GradientButton>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </AnimatedBackground>
                </section>

                <section id="features" className="bg-neutral-950 py-20">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white">Why Choose EvePost?</h2>
                            <p className="text-lg text-gray-300 mt-4">Everything you need to host successful events.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-white mb-4">Easy Event Creation</h3>
                                <p className="text-gray-300">Create and customize your event page in minutes with our intuitive editor. Add your branding, event details, and ticket types with ease.</p>
                            </div>
                            <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-white mb-4">QR Code Check-ins</h3>
                                <p className="text-gray-300">Seamlessly check in attendees with our QR code scanner. No more long lines or manual check-ins. Just scan and go!</p>
                            </div>
                            <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg">
                                <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
                                <p className="text-gray-300">Track your event&apos;s performance with real-time analytics. Monitor ticket sales, attendee demographics, and more.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

// Export as default for compatibility
export default HeroSectionComponent;

// Also export as named export
export { HeroSectionComponent as HeroSection };
