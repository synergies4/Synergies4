'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Calendar, Clock, Users, Video, Settings, Plus, Trash2, Edit, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetingUrl?: string;
  platform: string;
  autoRecord: boolean;
  participants: number;
}

interface RecordingRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    platforms: string[];
    keywords: string[];
    participantMin?: number;
    duration?: number;
  };
  recordingSettings: {
    autoStart: boolean;
    autoTranscribe: boolean;
    saveToFolder?: string;
  };
}

export default function CalendarIntegration() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<CalendarEvent[]>([]);
  const [recordingRules, setRecordingRules] = useState<RecordingRule[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRuleOpen, setNewRuleOpen] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demo - replace with actual API calls
      setUpcomingMeetings([
        {
          id: '1',
          title: 'Weekly Team Standup',
          start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          end: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          platform: 'google-meet',
          autoRecord: true,
          participants: 5
        },
        {
          id: '2', 
          title: 'Client Presentation',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          meetingUrl: 'https://zoom.us/j/123456789',
          platform: 'zoom',
          autoRecord: false,
          participants: 8
        },
        {
          id: '3',
          title: 'Sprint Planning',
          start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          end: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...',
          platform: 'teams',
          autoRecord: true,
          participants: 6
        }
      ]);

      setRecordingRules([
        {
          id: '1',
          name: 'Record All Team Meetings',
          enabled: true,
          conditions: {
            platforms: ['google-meet', 'zoom'],
            keywords: ['team', 'standup', 'sync'],
            participantMin: 3
          },
          recordingSettings: {
            autoStart: true,
            autoTranscribe: true,
            saveToFolder: 'Team Meetings'
          }
        },
        {
          id: '2',
          name: 'Record Client Calls',
          enabled: true,
          conditions: {
            platforms: ['zoom', 'teams'],
            keywords: ['client', 'presentation', 'demo'],
            participantMin: 2
          },
          recordingSettings: {
            autoStart: true,
            autoTranscribe: true,
            saveToFolder: 'Client Meetings'
          }
        }
      ]);

      setIsConnected(true);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const connectCalendar = async (provider: 'google' | 'outlook' | 'apple') => {
    try {
      toast.success(`${provider} calendar connected successfully!`);
      setIsConnected(true);
      loadCalendarData();
    } catch (error) {
      toast.error(`Failed to connect ${provider} calendar`);
    }
  };

  const toggleMeetingRecording = async (meetingId: string, enabled: boolean) => {
    try {
      setUpcomingMeetings(prev => 
        prev.map(meeting => 
          meeting.id === meetingId 
            ? { ...meeting, autoRecord: enabled }
            : meeting
        )
      );
      
      toast.success(enabled ? 'Auto-recording enabled' : 'Auto-recording disabled');
    } catch (error) {
      toast.error('Failed to update recording settings');
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      setRecordingRules(prev =>
        prev.map(rule =>
          rule.id === ruleId
            ? { ...rule, enabled }
            : rule
        )
      );
      
      toast.success(enabled ? 'Rule enabled' : 'Rule disabled');
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const recordNow = async (meeting: CalendarEvent) => {
    try {
      if (!meeting.meetingUrl) {
        toast.error('No meeting URL found');
        return;
      }

      const response = await fetch('/api/meeting-recorder/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingUrl: meeting.meetingUrl,
          botName: `${meeting.title} Recorder`,
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
      } else {
        toast.error(data.error || 'Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'zoom': return 'Zoom';
      case 'google-meet': return 'Google Meet';
      case 'teams': return 'Microsoft Teams';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Connect Your Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 mb-4">
              Connect your calendar to automatically record meetings and manage recording preferences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => connectCalendar('google')}
                className="flex items-center gap-2 h-12"
                variant="outline"
              >
                🟢 Google Calendar
              </Button>
              
              <Button 
                onClick={() => connectCalendar('outlook')}
                className="flex items-center gap-2 h-12"
                variant="outline"
              >
                🟦 Outlook Calendar
              </Button>
              
              <Button 
                onClick={() => connectCalendar('apple')}
                className="flex items-center gap-2 h-12"
                variant="outline"
              >
                🍎 Apple Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings ({upcomingMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl">{getPlatformIcon(meeting.platform)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(meeting.start)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(meeting.start)} - {formatTime(meeting.end)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {meeting.participants} participants
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Auto-record:</span>
                  <Switch
                    checked={meeting.autoRecord}
                    onCheckedChange={(checked) => toggleMeetingRecording(meeting.id, checked)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {meeting.autoRecord && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                )}
                <Button
                  size="sm"
                  onClick={() => recordNow(meeting)}
                  disabled={!meeting.meetingUrl}
                >
                  <Video className="h-3 w-3 mr-1" />
                  Record Now
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recording Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Auto-Recording Rules
            </CardTitle>
            <Button size="sm" onClick={() => setNewRuleOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recordingRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {rule.conditions.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {getPlatformIcon(platform)} {getPlatformName(platform)}
                        </Badge>
                      ))}
                    </div>
                    {rule.conditions.keywords.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Keywords: {rule.conditions.keywords.join(', ')}
                      </Badge>
                    )}
                    {rule.conditions.participantMin && (
                      <Badge variant="outline" className="text-xs">
                        Min {rule.conditions.participantMin} participants
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Calendar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Calendar Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Default Recording Mode</h4>
              <p className="text-sm text-gray-600">Choose how meetings are recorded by default</p>
            </div>
            <select className="px-3 py-2 border rounded-lg">
              <option value="speaker_view">Speaker View</option>
              <option value="gallery_view">Gallery View</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-Transcription</h4>
              <p className="text-sm text-gray-600">Automatically generate transcripts for recorded meetings</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Meeting Notifications</h4>
              <p className="text-sm text-gray-600">Get notified when recordings start/stop</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Disconnect Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 