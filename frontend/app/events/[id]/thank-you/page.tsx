'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Download, FileText, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import TicketGenerator, { TicketGeneratorRef } from '@/components/TicketGenerator';
import { PageLoading } from '@/components/ui/loading';
import { apiFetch } from '@/lib/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants: number | null;
  isActive: boolean;
  participantCount: number;
  organizer: {
    username: string;
  };
}

interface RegistrationData {
  name: string;
  email: string;
  registrationId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  description: string;
  qrCodeData: string;
}

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const ticketGeneratorRef = useRef<TicketGeneratorRef>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [ticketDownloaded, setTicketDownloaded] = useState(false);
  const [ticketDownloadFailed, setTicketDownloadFailed] = useState(false);

  const fetchEventData = useCallback(async () => {
    try {
      const response = await apiFetch(`/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
      } else {
        // Fallback to URL params if API fails
        const eventTitle = searchParams.get('eventTitle');
        const eventDate = searchParams.get('eventDate');
        const venue = searchParams.get('venue');
        const description = searchParams.get('description');
        
        setEvent({
          _id: eventId,
          title: eventTitle || '',
          description: description || '',
          date: eventDate || '',
          venue: venue || '',
          maxParticipants: null,
          isActive: true,
          participantCount: 0,
          organizer: { username: 'Event Organizer' }
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      // Fallback to URL params if API fails
      const eventTitle = searchParams.get('eventTitle');
      const eventDate = searchParams.get('eventDate');
      const venue = searchParams.get('venue');
      const description = searchParams.get('description');
      
      setEvent({
        _id: eventId,
        title: eventTitle || '',
        description: description || '',
        date: eventDate || '',
        venue: venue || '',
        maxParticipants: null,
        isActive: true,
        participantCount: 0,
        organizer: { username: 'Event Organizer' }
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, searchParams]);

  useEffect(() => {
    // Get registration data from URL params
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const registrationId = searchParams.get('registrationId');
    const eventTitle = searchParams.get('eventTitle');
    const eventDate = searchParams.get('eventDate');
    const venue = searchParams.get('venue');
    const description = searchParams.get('description');
    const qrCodeData = searchParams.get('qrCodeData');

    if (name && email && registrationId && eventTitle && eventDate && venue && qrCodeData) {
      setRegistrationData({
        name,
        email,
        registrationId,
        eventTitle,
        eventDate,
        venue,
        description: description || '',
        qrCodeData
      });
      
      // Fetch actual event data to get updated participant count
      fetchEventData();
    } else {
      toast.error('Invalid registration data');
      router.push('/events');
    }
  }, [eventId, searchParams, router, fetchEventData]);

  // Auto-download ticket when registration data is available
  useEffect(() => {
    if (registrationData && !loading && !ticketDownloaded && !ticketDownloadFailed) {
      const autoDownloadTicket = async () => {
        // Wait for component to be fully mounted
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!ticketGeneratorRef.current) {
          console.error('TicketGenerator ref not available');
          setTicketDownloadFailed(true);
          toast.error('Auto-download failed. Please try manually.');
          return;
        }

        try {
          setIsGeneratingTicket(true);
          await ticketGeneratorRef.current.generateAndDownloadTicket();
          setTicketDownloaded(true);
          toast.success('Ticket downloaded automatically!');
        } catch (error) {
          console.error('Auto ticket download failed:', error);
          setTicketDownloadFailed(true);
          toast.error('Auto-download failed. Please click the download button.');
        } finally {
          setIsGeneratingTicket(false);
        }
      };

      autoDownloadTicket();
    }
  }, [registrationData, loading, ticketDownloaded, ticketDownloadFailed]);


  const handleDownloadTicket = async () => {
    if (!ticketGeneratorRef.current || !registrationData) {
      toast.error('Ticket data not available');
      return;
    }

    try {
      setIsGeneratingTicket(true);
      await ticketGeneratorRef.current.generateAndDownloadTicket();
      setTicketDownloaded(true);
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Ticket generation failed:', error);
      toast.error('Failed to generate ticket. Please try again.');
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  if (!event || !registrationData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Registration Not Found</h1>
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Registration Complete</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 text-center border mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Thank You for Registering!</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              Your registration for <strong>{event.title}</strong> has been confirmed. 
              We&apos;re excited to see you at the event!
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <QrCode className="h-5 w-5 text-primary mr-2" />
                <span className="text-primary font-medium">Your Digital Ticket</span>
              </div>
              <p className="text-primary text-sm">
                Download your personalized ticket with QR code for easy check-in at the event.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadTicket}
              disabled={isGeneratingTicket}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
            >
              {isGeneratingTicket ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Generating Ticket...
                </>
              ) : ticketDownloaded ? (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Again
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Your Ticket
                </>
              )}
            </button>
            
            <p className="text-xs text-muted-foreground">
              {ticketDownloaded ? (
                "Ticket downloaded successfully! You can download it again if needed."
              ) : ticketDownloadFailed ? (
                "Auto-download failed. Please click the button above to download manually."
              ) : (
                "Your ticket is being prepared for download..."
              )}
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 border mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Event Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Date & Time</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Venue</p>
                  <p className="text-muted-foreground">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Participants</p>
                  <p className="text-muted-foreground">
                    {event.participantCount} registered
                    {event.maxParticipants && ` (max ${event.maxParticipants})`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 border mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Your Registration</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Name:</span>
                <span className="text-muted-foreground">{registrationData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Email:</span>
                <span className="text-muted-foreground">{registrationData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Registration ID:</span>
                <span className="text-muted-foreground font-mono text-sm">{registrationData.registrationId}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">What happens next?</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Download your ticket</span>
                  <p className="text-sm">Click the button above to download your personalized PDF ticket</p>
                </div>
              </li>
              <li className="flex items-start">
                <QrCode className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Bring your QR code</span>
                  <p className="text-sm">Present the QR code on your ticket at the event for instant check-in</p>
                </div>
              </li>
              <li className="flex items-start">
                <Users className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Automatic attendance tracking</span>
                  <p className="text-sm">Your attendance will be automatically recorded when you check in</p>
                </div>
              </li>
              <li className="flex items-start">
                <FileText className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Keep your registration details</span>
                  <p className="text-sm">Save your registration ID for any future reference or support</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/events"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Browse More Events
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Ticket Generator Component */}
      {registrationData && (
        <TicketGenerator
          ref={ticketGeneratorRef}
          ticketData={{
            participant: {
              name: registrationData.name,
              email: registrationData.email,
              registrationId: registrationData.registrationId
            },
            event: {
              title: registrationData.eventTitle,
              description: registrationData.description,
              date: registrationData.eventDate,
              venue: registrationData.venue
            },
            qrCodeData: registrationData.qrCodeData
          }}
        />
      )}
    </div>
  );
}
