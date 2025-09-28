'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, XCircle, Camera, CameraOff, Shield, Calendar, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QrScanner from 'qr-scanner';
import { OverlayLoading } from '@/components/ui/loading';
import { apiFetch } from '@/lib/api';

interface AttendanceResult {
  success: boolean;
  message: string;
  data?: {
    participant?: {
      name: string;
      email: string;
      registrationId: string;
      attendanceTime: string;
    };
    event?: {
      id: string;
      title: string;
      date: string;
      venue: string;
    };
    name?: string;
    eventTitle?: string;
    attendanceTime?: string;
  };
}

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

export default function AdminEventScannerPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const videoRef = useRef<HTMLVideoElement>(null); 
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResult | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminUserStr = localStorage.getItem('adminUser');
      
      if (token && adminUserStr) {
        try {
          JSON.parse(adminUserStr);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing admin user:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await apiFetch(`/events/${eventId}`);
        const data = await response.json();
        
        if (data.success) {
          setEvent(data.event);
        } else {
          toast.error('Event not found');
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (eventId && isAuthenticated) {
      fetchEventData();
    }
  }, [eventId, router, isAuthenticated]);

  const startScanning = async () => {
    try {
      const qrScanner = new QrScanner(
        videoRef.current!,
        (result) => {
          handleQRCodeDetected(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanning(true);
      setHasPermission(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasPermission(false);
      toast.error('Camera access denied. Please allow camera access to use the scanner.');
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    if (isProcessing || lastScannedCode === qrData) return;
    
    setLastScannedCode(qrData);
    setQrCodePreview(qrData);
    setIsProcessing(true);
    setAttendanceResult(null);
    stopScanning();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await apiFetch(`/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrData: qrData,
          expectedEventId: eventId
        }),
      });

      const result: AttendanceResult = await response.json();
      setAttendanceResult(result);

      if (result.success) {
        const participantName = result.data?.participant?.name || 'Participant';
        const eventTitle = result.data?.event?.title || event?.title || 'Event';
        toast.success(`${participantName} successfully marked for ${eventTitle}!`);
        
        // Clear result after 2 seconds for success
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else {
        // Check if it's a cross-event error
        if (result.message.includes('different event')) {
          toast.error('Wrong event QR code! Please scan a QR code for this event only.');
        } else {
          toast.error(result.message);
        }
        // Clear error after 4 seconds
        setTimeout(() => {
          resetScanner();
        }, 4000);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      const errorResult: AttendanceResult = {
        success: false,
        message: 'Invalid QR code format. Please scan a valid event registration QR code.'
      };
      setAttendanceResult(errorResult);
      toast.error('Invalid QR code format');
      setTimeout(() => {
        resetScanner();
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setAttendanceResult(null);
    setLastScannedCode(null);
    setQrCodePreview(null);
  };

  const getSimpleErrorMessage = (message: string) => {
    if (message.includes('different event')) {
      return 'Wrong event QR code';
    } else if (message.includes('already marked') || message.includes('duplicate')) {
      return 'Already checked in';
    } else if (message.includes('not found') || message.includes('invalid')) {
      return 'Invalid QR code';
    } else {
      return 'Check-in failed';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <OverlayLoading text="Loading Event Scanner..." />;
  }

  // Show access denied if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin authentication required to access the scanner.</p>
          <Link href="/auth/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">The event you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link href={`/admin/events/${eventId}`} className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Event</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Admin Scanner</span>
              <span className="sm:hidden">Scanner</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        {/* Event Info */}
        <div className="bg-card border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{event.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>
              </div>
            </div>
            <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan QR codes from this event to mark attendance. Only QR codes generated for this specific event will be accepted.
          </p>
        </div>

        {/* Scanner Section */}
        <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 sm:h-80 bg-muted rounded-lg object-cover"
              playsInline
            />
            
            {!isScanning && !attendanceResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera ready</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <OverlayLoading text="Processing QR Code..." />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={isProcessing}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </button>
            )}

            {attendanceResult && (
              <button
                onClick={resetScanner}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors"
              >
                Scan Another
              </button>
            )}
          </div>

          {hasPermission === false && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center">
                <CameraOff className="h-5 w-5 text-destructive mr-3" />
                <div>
                  <strong>Camera Access Denied:</strong> Please allow camera access to use the QR scanner.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Preview Section */}
        {qrCodePreview && !attendanceResult && (
          <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center mb-3">
              <QrCode className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">QR Code Detected</h2>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Scanned Data:</p>
              <p className="font-mono text-xs break-all text-foreground">
                {qrCodePreview}
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {attendanceResult && (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              {attendanceResult.success ? (
                <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive mb-2" />
              )}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                {attendanceResult.success ? 'Success!' : 'Failed'}
              </h2>
              
              <p className={`text-lg ${attendanceResult.success ? 'text-green-600' : 'text-destructive'}`}>
                {attendanceResult.success ? (
                  `${attendanceResult.data?.participant?.name || 'Participant'} checked in successfully`
                ) : (
                  getSimpleErrorMessage(attendanceResult.message)
                )}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}