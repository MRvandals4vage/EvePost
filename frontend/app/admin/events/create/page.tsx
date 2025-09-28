"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Save, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { PageLoading } from "@/components/ui/loading";
import { apiFetch } from "@/lib/api";

interface EventData {
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants: string;
}

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    date: "",
    venue: "",
    maxParticipants: "100",
  });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Admin authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      const adminUserStr = localStorage.getItem("adminUser");

      if (!token || !adminUserStr) {
        toast.error("Access denied. Admin authentication required.");
        router.push("/auth/login");
        return;
      }

      try {
        JSON.parse(adminUserStr);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing admin user:", error);
        toast.error("Invalid session. Please login again.");
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiFetch(
        "/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...eventData,
            date: eventData.date ? new Date(eventData.date).toISOString() : undefined,
            maxParticipants: eventData.maxParticipants
              ? parseInt(eventData.maxParticipants)
              : null,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Event created successfully!");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Create event error:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <PageLoading text="Verifying admin access..." />;
  }

  // Show access denied if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-4">
            Admin authentication required to create events.
          </p>
          <Link href="/auth/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-md p-8 border">
          <div className="text-center mb-8">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              Create New Event
            </h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details below to create a new event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={eventData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={eventData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                value={eventData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0,16)}
                step="60"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div>
              <label
                htmlFor="venue"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Venue *
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                required
                value={eventData.venue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Enter venue address"
              />
            </div>

            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Maximum Participants (Optional)
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                value={eventData.maxParticipants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="Default: 100"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Default capacity is 100. Leave empty for unlimited
                registrations.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 border border-input text-sm font-medium rounded-md text-muted-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground transition-colors ${
                  loading
                    ? "bg-muted cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
            <h3 className="text-sm font-medium text-foreground mb-2">
              What happens after creation?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The event will be visible on the public events page</li>
              <li>• Users can register for the event</li>
              <li>
                • Registered users will receive digital tickets with QR codes
              </li>
              <li>• You can track attendance and export data</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
