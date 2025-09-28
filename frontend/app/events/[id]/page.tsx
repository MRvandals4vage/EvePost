"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, User } from "lucide-react";
import toast from "react-hot-toast";
import { PageLoading } from "@/components/ui/loading";
import { apiFetch } from "@/lib/api";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  isActive: boolean;
  participantCount: number;
  organizer: {
    _id: string;
    username: string;
  };
}

interface RegistrationData {
  name: string;
  email: string;
}

export default function PublicEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: "",
    email: "",
  });

  const fetchEvent = useCallback(async () => {
    try {
      const response = await apiFetch(
        `/events/${eventId}`
      );
      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error("Event not found");
        router.push("/events");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to fetch event details");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }

    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden && eventId) {
        fetchEvent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [eventId, fetchEvent]);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationData.name.trim() || !registrationData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Sending registration request:", {
        name: registrationData.name.trim(),
        email: registrationData.email.trim(),
        eventId: eventId,
      });

      const response = await apiFetch(
        `/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registrationData.name.trim(),
            email: registrationData.email.trim(),
            eventId: eventId,
          }),
        }
      );

      console.log("Response status:", response.status);
      let data: any = null;
      let rawText = "";
      try {
        rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        console.warn("Failed to parse JSON response; raw text:", rawText);
      }
      console.log("Response data:", data);

      if (response.ok && data?.success && data?.registration) {
        toast.success("Registration successful!");

        // Build URL with all required parameters for thank-you page
        const thankYouUrl = new URL(
          `/events/${eventId}/thank-you`,
          window.location.origin
        );
        thankYouUrl.searchParams.set("name", data.registration.name);
        thankYouUrl.searchParams.set("email", data.registration.email);
        thankYouUrl.searchParams.set(
          "registrationId",
          data.registration.registrationId
        );
        thankYouUrl.searchParams.set(
          "eventTitle",
          data.registration.eventTitle
        );
        thankYouUrl.searchParams.set("eventDate", data.registration.eventDate);
        thankYouUrl.searchParams.set("venue", data.registration.venue);
        thankYouUrl.searchParams.set("description", event?.description || "");
        thankYouUrl.searchParams.set(
          "qrCodeData",
          data.registration.qrCodeData
        );

        router.push(thankYouUrl.pathname + thankYouUrl.search);
      } else {
        console.error("Registration failed:", { status: response.status, data, rawText });
        const message =
          (data && (data.message || data.error)) ||
          (rawText && rawText.slice(0, 200)) ||
          `Registration failed (status ${response.status})`;
        toast.error(message);
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Registration failed - network error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Note: Past events are automatically paused, so they won't be accessible
  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Event Not Found
          </h2>
          <Link href="/events" className="text-primary hover:text-primary/80">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventFull = () => {
    return !!(
      event?.maxParticipants && event.participantCount >= event.maxParticipants
    );
  };

  return (
    <AnimatedBackground className="min-h-screen">
      {/* Public Header */}
      <header className="border-b bg-neutral-900/60 backdrop-blur-md shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link
              href="/events"
              className="flex items-center text-gray-300 hover:text-white transition-colors text-sm sm:text-base rounded-full px-2 py-1 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Events</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="text-sm text-gray-300">Public Event Page</div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Event Details */}
          <div className="rounded-2xl p-4 sm:p-6 border border-neutral-700/60 bg-neutral-800/70 backdrop-blur-sm shadow-md">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h1 className="text-xl sm:text-2xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                {event.title}
              </h1>
              <span className="px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide border border-white/20 text-gray-200/90 bg-white/5">
                {!event.isActive ? "Closed" : isEventFull() ? "Full" : "Open"}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
              {event.description}
            </p>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  {formatDate(event.date)}
                </span>
              </div>

              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">{event.venue}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  {event.participantCount} registered
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </span>
              </div>

              <div className="flex items-center text-gray-300">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  Organized by {event.organizer.username}
                </span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="rounded-2xl p-4 sm:p-6 border border-neutral-700/60 bg-neutral-800/70 backdrop-blur-sm shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
              {isEventFull()
                ? "Event is Full"
                : !event.isActive
                ? "Registration Closed"
                : "Register for Event"}
            </h2>

            {!event.isActive ? (
              <div className="text-center py-6">
                <p className="text-gray-300 mb-4">
                  Registration for this event is currently closed.
                </p>
              </div>
            ) : isEventFull() ? (
              <div className="text-center py-6">
                <p className="text-gray-300 mb-4">
                  This event has reached its maximum capacity.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={registrationData.name}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 sm:py-2 border border-input bg-neutral-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-ring focus:border-ring text-white text-base sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={registrationData.email}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 sm:py-2 border border-input bg-neutral-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-ring focus:border-ring text-white text-base sm:text-sm"
                    placeholder="Enter your email address"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-400">
                    Your QR code will be generated for this email address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Registering..." : "Register Now"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </AnimatedBackground>
  );
}
