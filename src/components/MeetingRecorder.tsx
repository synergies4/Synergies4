// MeetingRecorder component for handling meeting recordings across platforms
// Supports Zoom, Google Meet, and Microsoft Teams integration
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, MicOff, Video, Clock, Users, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface RecordingSession {
  id: number;
  botId: string;
  meetingUrl: string;
  platform: string;
  status: string;
  botName?: string;
  createdAt: string;
}

export default function MeetingRecorder() {
  const [isOpen, setIsOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [botName, setBotName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<RecordingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000); // Check every 5 seconds
    
    // Listen for custom event to open recorder
    const handleOpenRecorder = () => setIsOpen(true);
    window.addEventListener('openRecorder', handleOpenRecorder);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('openRecorder', handleOpenRecorder);
    };
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch('/api/meeting-recorder/active', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const sessions = await response.json();
        setActiveSessions(sessions);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const startRecording = async () => {
    if (!meetingUrl.trim()) {
      toast.error('Please enter a meeting URL');
      return;
    }

    setIsStarting(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/meeting-recorder/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          meetingUrl: meetingUrl.trim(),
          botName: botName.trim() || undefined,
          recordingSettings: {
            recording_mode: 'speaker_view',
            transcription_options: {
              provider: 'meeting_captions'
            }
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Recording bot is joining the meeting!');
        setMeetingUrl('');
        setBotName('');
        setIsOpen(false);
        fetchActiveSessions();
      } else {
        toast.error(data.error || 'Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    } finally {
      setIsStarting(false);
    }
  };

  const stopRecording = async (recordingSession: RecordingSession) => {
    setIsLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/meeting-recorder/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          botId: recordingSession.botId,
          recordId: recordingSession.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Recording stopped');
        fetchActiveSessions();
      } else {
        toast.error(data.error || 'Failed to stop recording');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-500';
      case 'joining': return 'bg-yellow-500';
      case 'created': return 'bg-blue-500';
      case 'stopping': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recording': return 'Recording';
      case 'joining': return 'Joining...';
      case 'created': return 'Starting...';
      case 'stopping': return 'Stopping...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom': return '🟦';
      case 'google-meet': return '🟢';
      case 'teams': return '🟣';
      default: return '📹';
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const detectPlatform = (url: string) => {
    if (url.includes('zoom.us')) return 'Zoom';
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
    return 'Unknown Platform';
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Video className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-xl">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                Meeting Recorder
              </DialogTitle>
              <p className="text-gray-600 mt-2">Record meetings across Zoom, Google Meet, and Microsoft Teams with our AI-powered recording bot</p>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {/* Start New Recording */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Start New Recording</CardTitle>
                  <CardDescription className="text-gray-700">
                    Enter a meeting URL to start recording automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-gray-800">
                      Meeting URL <span className="text-red-600">*</span>
                    </label>
                    <Input
                      placeholder="https://meet.google.com/xyz-abcd-efg"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      disabled={isStarting}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {meetingUrl && (
                      <p className="text-sm text-blue-700 mt-2 font-medium">
                        Platform: {detectPlatform(meetingUrl)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-gray-800">
                      Bot Name (Optional)
                    </label>
                    <Input
                      placeholder="Meeting Recorder"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      disabled={isStarting}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Button 
                    onClick={startRecording} 
                    disabled={isStarting || !meetingUrl.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isStarting ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Starting Recording...
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="h-6 w-6 text-red-600" />
                      Active Recordings ({activeSessions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {getPlatformIcon(session.platform)}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {session.botName || 'Meeting Recorder'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Started {new Date(session.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={`${getStatusColor(session.status)} text-white text-xs`}
                          >
                            {getStatusText(session.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 truncate flex-1">
                            {session.meetingUrl}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyUrl(session.meetingUrl)}
                            className="p-1 h-6 w-6"
                          >
                            {copied ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(session.meetingUrl, '_blank')}
                            className="p-1 h-6 w-6"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          {(session.status === 'recording' || session.status === 'joining') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => stopRecording(session)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <MicOff className="h-3 w-3 mr-1" />
                              Stop Recording
                            </Button>
                          )}
                          
                          {session.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = '/meetings'}
                              className="flex-1"
                            >
                              View Transcript
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Setup Tips */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-emerald-800">📚 Quick Setup Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-emerald-800 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">🟦 Zoom:</span>
                    <span>Works with meeting URLs or join links</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">🟢 Google Meet:</span>
                    <span>Use meet.google.com/xxx-xxxx-xxx format</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">🟣 Teams:</span>
                    <span>Use teams.microsoft.com meeting links</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-600">🤖</span>
                    <span>Bot will join automatically and send a chat message when recording starts</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 