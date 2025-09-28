"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, User, Eye } from "lucide-react";

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

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventFull =
    event.maxParticipants && event.participantCount >= event.maxParticipants;

  return (
    <div className="rounded-xl border border-border/60 p-4 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:scale-[1.01] h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-foreground line-clamp-2 flex-1 pr-2">
          {event.title}
        </h3>
        <div className="flex flex-wrap gap-1 flex-shrink-0">
          {!event.isActive && (
            <span className="px-2 py-1 bg-muted/70 text-muted-foreground text-[10px] font-semibold rounded-full uppercase tracking-wide border border-border/40">
              Inactive
            </span>
          )}
          {isEventFull && (
            <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-semibold rounded-full uppercase tracking-wide border border-destructive/30">
              Full
            </span>
          )}
          {event.isActive && !isEventFull && (
            <span className="px-2 py-1 bg-chart-2/10 text-chart-2 text-[10px] font-semibold rounded-full uppercase tracking-wide border border-chart-2/30">
              Open
            </span>
          )}
        </div>
      </div>

      {/* Description - One line with ellipsis */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
        {event.description}
      </p>

      {/* Event Details */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-2" />
            Date:
          </span>
          <span className="text-xs font-medium text-foreground">
            {formatDate(event.date)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center">
            <MapPin className="h-3 w-3 mr-2" />
            Venue:
          </span>
          <span className="text-xs font-medium text-foreground truncate ml-2">
            {event.venue}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center">
            <Users className="h-3 w-3 mr-2" />
            Participants:
          </span>
          <span className="text-xs font-medium text-foreground">
            {event.participantCount}
            {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center">
            <User className="h-3 w-3 mr-2" />
            Organizer:
          </span>
          <span className="text-xs font-medium text-foreground truncate ml-2">
            {event.organizer?.username || "Unknown"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <Link
          href={`/events/${event._id}`}
          className="inline-flex items-center px-3 py-2 border border-border text-xs font-medium rounded-full text-foreground bg-background hover:bg-muted hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150 flex-1 justify-center gap-2"
        >
          <Eye className="h-3 w-3" />
          <span>
            {event.isActive && !isEventFull ? "Register" : "View Details"}
          </span>
        </Link>
      </div>
    </div>
  );
}
