"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import EventCard from "@/components/EventCard";
import { PageLoading } from "@/components/ui/loading";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { apiFetch } from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  participantCount: number;
  isActive: boolean;
  organizer?: {
    _id: string;
    username: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();

    // Set up periodic refresh every 30 seconds to keep participant counts updated
    const refreshInterval = setInterval(fetchEvents, 30000);

    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);

  const fetchEvents = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const response = await apiFetch(`/events`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        if (isManualRefresh) {
          toast.success("Events updated");
        }
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchEvents(true);
  };
  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  return (
    <AnimatedBackground className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-neutral-900/60 backdrop-blur-md relative z-10 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link
              href="/"
              className="flex items-center text-gray-300 hover:text-white transition-colors text-sm sm:text-base rounded-full px-2 py-1 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center text-gray-300 hover:text-white transition-colors disabled:opacity-50 text-sm sm:text-base rounded-full px-3 py-1 border border-transparent hover:border-white/30 hover:bg-white/5"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Available Events
          </h1>
          <p className="text-sm sm:text-base text-gray-300/90 max-w-2xl mx-auto px-4">
            Browse through all available events and register for the ones
            you&apos;d like to attend. You&apos;ll receive a digital ticket with
            QR code after registration.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">📅</div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">
              No Events Available
            </h3>
            <p className="text-sm sm:text-base text-gray-300 px-4">
              There are currently no active events. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </AnimatedBackground>
  );
}
