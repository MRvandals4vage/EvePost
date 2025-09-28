'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Trash2, 
  Pause, 
  Play, 
  UserCheck,
  UserX,
  Download,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoading } from '@/components/ui/loading';
import { apiFetch } from '@/lib/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  participantCount: number;
  attendedCount: number;
  isActive: boolean;
}

interface Participant {
  _id: string;
  name: string;
  email: string;
  registrationId: string;
  attended: boolean;
  createdAt: string;
}

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEventData = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch event details
      const eventResponse = await apiFetch(`/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const eventData = await eventResponse.json();
      
      if (eventData.success) {
        setEvent(eventData.event);
      } else {
        toast.error('Event not found');
        router.push('/admin/dashboard');
        return;
      }

      // Fetch participants
      const participantsResponse = await apiFetch(`/registrations/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const participantsData = await participantsResponse.json();
      
      if (participantsData.success) {
        setParticipants(participantsData.data.registrations);
      } else {
        toast.error('Failed to fetch participants');
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast.error('Failed to fetch event data');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, fetchEventData]);

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await apiFetch(`/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Event deleted successfully');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEventStatus = async () => {
    if (!event) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await apiFetch(`/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !event.isActive
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setEvent({ ...event, isActive: !event.isActive });
        toast.success(`Event ${!event.isActive ? 'activated' : 'paused'} successfully`);
      } else {
        toast.error(data.message || 'Failed to update event status');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    } finally {
      setActionLoading(false);
    }
  };

  const exportEventData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await apiFetch(`/attendance/export/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event?.title.replace(/[^a-z0-9]/gi, '_')}_attendance.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export started');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h2>
          <Link href="/admin/dashboard" className="text-primary hover:text-primary/80">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const registeredParticipants = participants.filter(p => !p.attended);
  const attendedParticipants = participants.filter(p => p.attended);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link href="/admin/dashboard" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <Link href={`/admin/events/${eventId}/scanner`}>
                <button className="flex items-center px-3 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scanner
                </button>
              </Link>
              <button
                onClick={exportEventData}
                className="flex items-center px-3 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <div className="bg-card rounded-lg shadow-md p-6 border mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>
              <p className="text-muted-foreground mb-4">{event.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                event.isActive 
                  ? 'bg-chart-2/10 text-chart-2' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {event.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-5 w-5 mr-3" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-5 w-5 mr-3" />
              <span>{event.venue}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Users className="h-5 w-5 mr-3" />
              <span>
                {event.participantCount} registered
                {event.maxParticipants && ` / ${event.maxParticipants} max`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleToggleEventStatus}
              disabled={actionLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground transition-colors ${
                actionLoading
                  ? 'bg-muted cursor-not-allowed'
                  : event.isActive
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-chart-2 hover:bg-chart-2/90'
              }`}
            >
              {event.isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Event
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activate Event
                </>
              )}
            </button>

            <button
              onClick={handleDeleteEvent}
              disabled={actionLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-destructive-foreground transition-colors ${
                actionLoading
                  ? 'bg-muted cursor-not-allowed'
                  : 'bg-destructive hover:bg-destructive/90'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registered Participants */}
          <div className="bg-card rounded-lg shadow-md p-6 border">
            <div className="flex items-center mb-4">
              <UserX className="h-6 w-6 text-muted-foreground mr-3" />
              <h2 className="text-xl font-semibold text-foreground">Registered ({registeredParticipants.length})</h2>
            </div>
            
            {registeredParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No registered participants yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {registeredParticipants.map((participant) => (
                  <div key={participant._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(participant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attended Participants */}
          <div className="bg-card rounded-lg shadow-md p-6 border">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-chart-2 mr-3" />
              <h2 className="text-xl font-semibold text-foreground">Attended ({attendedParticipants.length})</h2>
            </div>
            
            {attendedParticipants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No attendees yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendedParticipants.map((participant) => (
                  <div key={participant._id} className="flex items-center justify-between p-3 bg-chart-2/10 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                    </div>
                    <span className="text-xs text-chart-2 font-medium">✓ Attended</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}