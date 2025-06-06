'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Mic,
  MicOff,
  Square,
  Pause,
  PlayCircle,
  RotateCcw,
  FileText,
  BookOpen,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Meeting Recording Component (moved from synergize page)
const MeetingRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('sprint-planning');
  const [participants, setParticipants] = useState('');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'completed' | 'transcribing' | 'transcribed' | 'permission-denied'>('idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Clear any previous permission errors
      setPermissionError(null);
      setRecordingState('idle');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setRecordingState('completed');
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingState('recording');
      setRecordingTime(0);
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      let errorMessage = '';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
        setRecordingState('permission-denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please check that your device has a microphone.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Your browser does not support audio recording. Please try a different browser.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Microphone constraints could not be satisfied. Please try again.';
      } else {
        errorMessage = 'Unable to access microphone. Please check your permissions and try again.';
      }
      
      setPermissionError(errorMessage);
    }
  };

  const retryPermissions = async () => {
    // Clear error state and try again
    setPermissionError(null);
    setRecordingState('idle');
    await startRecording();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscription('');
    setRecordingState('idle');
    audioChunksRef.current = [];
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    setRecordingState('transcribing');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('provider', 'openai');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      const data = await response.json();
      setTranscription(data.transcription);
      setRecordingState('transcribed');
      
      // Auto-generate title and type if needed
      const { title, type } = generateTitleAndType(data.transcription);
      setMeetingTitle(title);
      setMeetingType(type);
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
      setRecordingState('completed');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-generate title and type based on transcript content
  const generateTitleAndType = (transcript: string) => {
    const content = transcript.toLowerCase();
    
    // Auto-detect meeting type based on content
    let detectedType = meetingType;
    if (content.includes('sprint planning') || content.includes('sprint plan')) {
      detectedType = 'sprint-planning';
    } else if (content.includes('retrospective') || content.includes('retro')) {
      detectedType = 'retrospective';
    } else if (content.includes('daily standup') || content.includes('daily scrum') || content.includes('standup')) {
      detectedType = 'daily-standup';
    } else if (content.includes('sprint review') || content.includes('demo')) {
      detectedType = 'sprint-review';
    } else if (content.includes('backlog') || content.includes('grooming') || content.includes('refinement')) {
      detectedType = 'backlog-grooming';
    } else if (content.includes('stakeholder')) {
      detectedType = 'stakeholder-meeting';
    } else if (content.includes('training') || content.includes('workshop')) {
      detectedType = 'training-session';
    }
    
    // Auto-generate title if none provided
    let generatedTitle = meetingTitle;
    if (!meetingTitle.trim()) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      const typeMap: { [key: string]: string } = {
        'sprint-planning': 'Sprint Planning',
        'retrospective': 'Sprint Retrospective',
        'daily-standup': 'Daily Standup',
        'sprint-review': 'Sprint Review',
        'backlog-grooming': 'Backlog Grooming',
        'team-meeting': 'Team Meeting',
        'stakeholder-meeting': 'Stakeholder Meeting',
        'training-session': 'Training Session'
      };
      
      // Try to extract sprint number or other identifiers from content
      const sprintMatch = content.match(/sprint\s+(\d+|[a-z]+)/i);
      const sprintInfo = sprintMatch ? ` ${sprintMatch[1]}` : '';
      
      generatedTitle = `${typeMap[detectedType] || 'Team Meeting'}${sprintInfo} - ${dateStr}`;
    }
    
    return { title: generatedTitle, type: detectedType };
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcription);
  };

  // Demo mode functionality for testing
  const loadDemoMeeting = () => {
    const demoTranscript = `Meeting started at 2:15 PM

**Sarah (Scrum Master):** Alright everyone, let's start our sprint planning meeting. We have John from the development team, Lisa from QA, and Mike our Product Owner. Today we're planning Sprint 23 which starts Monday.

**Mike (Product Owner):** Thanks Sarah. I want to walk through our top priorities for this sprint. We have three main user stories we need to tackle. First is the user authentication improvement - we've been getting feedback that the login process is too complex.

**John (Developer):** Can you elaborate on what specific improvements we're looking for? Are we talking about single sign-on integration or just UI improvements?

**Mike:** Good question. Based on user feedback, we want to implement social login options like Google and GitHub, and streamline the current form by reducing required fields. The acceptance criteria include OAuth integration and reducing login steps from 4 to 2.

**Lisa (QA):** What's our testing strategy for the OAuth integration? We'll need to test with different providers and edge cases like when external services are down.

**Sarah:** Great point Lisa. John, what's your estimate for the OAuth story?

**John:** Given the complexity of integrating multiple providers and ensuring security standards, I'd estimate this at 8 story points. We'll need to research OAuth libraries, implement the integration, and add fallback mechanisms.

**Mike:** That seems reasonable. The second priority is improving our API response times. We've noticed some endpoints are taking over 3 seconds to respond, especially the user dashboard data fetch.

**John:** I've been looking into this. The main bottleneck is our database queries. We're doing N+1 queries in several places and missing some indexes. I estimate this optimization work at 5 story points.

**Lisa:** For this one, I'll need to create performance test scenarios to validate the improvements. We should establish baseline metrics before we start.

**Sarah:** Excellent. Mike, what's the third priority?

**Mike:** The mobile responsive design updates for our dashboard. Users are reporting that the charts and tables don't display well on mobile devices. This affects about 40% of our user base.

**John:** This is mostly CSS and layout work. I think we can break this down into smaller components. The dashboard has 5 main sections - header, navigation, charts, data tables, and footer. I'd estimate 3 story points total.

**Lisa:** I'll need to test across different devices and screen sizes. We should include tablet testing too, not just mobile phones.

**Sarah:** So we have 8 + 5 + 3 = 16 story points total. Based on our velocity from the last 3 sprints averaging 14 points, this might be slightly ambitious. Should we consider moving something to the next sprint?

**Mike:** The mobile responsive work is important but could be deferred if needed. Let's commit to the OAuth and performance improvements as must-haves.

**John:** Actually, I think we can handle all three if we start with some research spikes early in the sprint. The OAuth research could happen in parallel with performance profiling.

**Lisa:** I agree. If we plan the testing approach upfront, we can work more efficiently.

**Sarah:** Alright, let's commit to all three stories but with the understanding that mobile responsive is our flex item if we run into issues. 

**Action Items:**
- John: Research OAuth libraries and create implementation plan by Wednesday
- Lisa: Set up performance baseline metrics and mobile testing matrix
- Mike: Review and approve OAuth provider list with security team
- Sarah: Schedule mid-sprint check-in for Thursday

**Sprint Goal:** Improve user experience through faster authentication, better performance, and mobile accessibility.

Meeting ended at 3:00 PM`;

    // Simulate the recording flow
    setMeetingTitle("Sprint 23 Planning Meeting");
    setMeetingType("sprint-planning");
    setParticipants("Sarah (Scrum Master), John (Developer), Lisa (QA), Mike (Product Owner)");
    setRecordingTime(2700); // 45 minutes
    setTranscription(demoTranscript);
    setRecordingState('transcribed');
    
    // Create a fake audio blob for completeness
    const fakeAudioData = new Uint8Array(1024);
    const fakeBlob = new Blob([fakeAudioData], { type: 'audio/webm' });
    setAudioBlob(fakeBlob);
  };

  const getRecordingStateDisplay = () => {
    switch (recordingState) {
      case 'recording':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />,
          text: 'Recording...'
        };
      case 'paused':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <Pause className="w-5 h-5" />,
          text: 'Paused'
        };
      case 'completed':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Recording Complete'
        };
      case 'transcribing':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: 'Transcribing...'
        };
      case 'transcribed':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Transcription Complete'
        };
      case 'permission-denied':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <MicOff className="w-5 h-5" />,
          text: 'Permission Denied'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <Mic className="w-5 h-5" />,
          text: 'Ready to Record'
        };
    }
  };

  const stateDisplay = getRecordingStateDisplay();

  return (
    <div className="space-y-6">
      {/* Meeting Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Meeting Title</Label>
          <Input
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Enter meeting title..."
            className="mt-1 bg-white border-gray-300 text-gray-900"
            disabled={isRecording}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Meeting Type</Label>
          <Select value={meetingType} onValueChange={setMeetingType} disabled={isRecording}>
            <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sprint-planning">Sprint Planning</SelectItem>
              <SelectItem value="retrospective">Retrospective</SelectItem>
              <SelectItem value="daily-standup">Daily Standup</SelectItem>
              <SelectItem value="sprint-review">Sprint Review</SelectItem>
              <SelectItem value="backlog-grooming">Backlog Grooming</SelectItem>
              <SelectItem value="team-meeting">Team Meeting</SelectItem>
              <SelectItem value="stakeholder-meeting">Stakeholder Meeting</SelectItem>
              <SelectItem value="training-session">Training Session</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Participants (optional)</Label>
        <Input
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="List meeting participants..."
          className="mt-1 bg-white border-gray-300 text-gray-900"
          disabled={isRecording}
        />
      </div>

      {/* Recording Status */}
      <div className={`p-6 rounded-xl border-2 ${stateDisplay.bgColor} ${stateDisplay.borderColor} transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={stateDisplay.color}>
              {stateDisplay.icon}
            </div>
            <div>
              <div className={`font-semibold text-lg ${stateDisplay.color}`}>
                {stateDisplay.text}
              </div>
              {(isRecording || recordingTime > 0) && (
                <div className="text-sm text-gray-600 mt-1">
                  Duration: {formatTime(recordingTime)}
                </div>
              )}
            </div>
          </div>
          
          {recordingState !== 'idle' && recordingState !== 'transcribing' && recordingState !== 'permission-denied' && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetRecording}
              className="text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Permission Error Display */}
      {permissionError && (
        <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
          <div className="flex items-start space-x-4">
            <MicOff className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-3 text-lg">Microphone Access Required</h4>
              <p className="text-red-700 mb-4">{permissionError}</p>
              
              <div className="text-sm text-red-600 space-y-2 mb-6">
                <p><strong>How to fix this:</strong></p>
                <p>• Look for the microphone icon 🎤 in your browser's address bar</p>
                <p>• Click it and select "Allow" to grant microphone permissions</p>
                <p>• On Safari mobile: Tap the "aA" icon, then Website Settings → Microphone → Allow</p>
                <p>• Refresh the page if needed after granting permissions</p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={retryPermissions}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setPermissionError(null);
                    setRecordingState('idle');
                  }}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

                    {/* Recording Controls */}
              <div className="flex flex-col items-center space-y-6 py-8">
                <div className="flex items-center justify-center space-x-6">
                  {!isRecording && recordingState === 'idle' && !permissionError && (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all hover:scale-105 text-xl font-semibold"
                    >
                      <Mic className="w-8 h-8 mr-3" />
                      Start Recording
                    </Button>
                  )}

                                  {isRecording && (
                  <>
                    {!isPaused ? (
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg"
                      >
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={resumeRecording}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                      >
                        <PlayCircle className="w-6 h-6 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Button
                      onClick={stopRecording}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 text-lg"
                    >
                      <Square className="w-6 h-6 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
              
              {/* Demo Mode - Only show when idle and no recording in progress */}
              {recordingState === 'idle' && !isRecording && !permissionError && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-sm text-gray-500 text-center">
                    For testing purposes:
                  </div>
                  <Button
                    onClick={loadDemoMeeting}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 text-sm bg-blue-25"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Load Demo Meeting (45min Sprint Planning)
                  </Button>
                </div>
              )}
            </div>

      {/* Transcription Section */}
      {recordingState === 'completed' && (
        <div className="text-center py-6">
          <Button
            onClick={transcribeAudio}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 text-lg"
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            ) : (
              <FileText className="w-6 h-6 mr-3" />
            )}
            Generate Transcript
          </Button>
        </div>
      )}

      {/* Display Transcription */}
      {transcription && (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold text-gray-700">Meeting Transcript</Label>
            <div className="mt-3 p-6 bg-gray-50 border border-gray-200 rounded-xl max-h-80 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {transcription}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-teal-500/25 transition-all hover:scale-105 text-lg"
            >
              <Link href={`/synergize?transcript=${encodeURIComponent(transcription)}&title=${encodeURIComponent(meetingTitle)}&type=${meetingType}`}>
                <BookOpen className="w-6 h-6 mr-3" />
                Create Course Content
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={copyTranscript}
              className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:text-teal-700 px-6 py-4 text-lg"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy Transcript
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RecordMeetingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('sprint-planning');
  const [participants, setParticipants] = useState('');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'completed' | 'transcribing' | 'transcribed' | 'permission-denied'>('idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setPermissionError(null);
      setRecordingState('idle');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setRecordingState('completed');
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingState('recording');
      setRecordingTime(0);
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      let errorMessage = '';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
        setRecordingState('permission-denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please check that your device has a microphone.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Your browser does not support audio recording. Please try a different browser.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Microphone constraints could not be satisfied. Please try again.';
      } else {
        errorMessage = 'Unable to access microphone. Please check your permissions and try again.';
      }
      
      setPermissionError(errorMessage);
    }
  };

  const retryPermissions = async () => {
    setPermissionError(null);
    setRecordingState('idle');
    await startRecording();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscription('');
    setRecordingState('idle');
    audioChunksRef.current = [];
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    setRecordingState('transcribing');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('provider', 'openai');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      const data = await response.json();
      setTranscription(data.transcription);
      setRecordingState('transcribed');
      
      // Auto-generate title and type if needed
      const { title, type } = generateTitleAndType(data.transcription);
      setMeetingTitle(title);
      setMeetingType(type);
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
      setRecordingState('completed');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-generate title and type based on transcript content
  const generateTitleAndType = (transcript: string) => {
    const content = transcript.toLowerCase();
    
    // Auto-detect meeting type based on content
    let detectedType = meetingType;
    if (content.includes('sprint planning') || content.includes('sprint plan')) {
      detectedType = 'sprint-planning';
    } else if (content.includes('retrospective') || content.includes('retro')) {
      detectedType = 'retrospective';
    } else if (content.includes('daily standup') || content.includes('daily scrum') || content.includes('standup')) {
      detectedType = 'daily-standup';
    } else if (content.includes('sprint review') || content.includes('demo')) {
      detectedType = 'sprint-review';
    } else if (content.includes('backlog') || content.includes('grooming') || content.includes('refinement')) {
      detectedType = 'backlog-grooming';
    } else if (content.includes('stakeholder')) {
      detectedType = 'stakeholder-meeting';
    } else if (content.includes('training') || content.includes('workshop')) {
      detectedType = 'training-session';
    }
    
    // Auto-generate title if none provided
    let generatedTitle = meetingTitle;
    if (!meetingTitle.trim()) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      const typeMap: { [key: string]: string } = {
        'sprint-planning': 'Sprint Planning',
        'retrospective': 'Sprint Retrospective',
        'daily-standup': 'Daily Standup',
        'sprint-review': 'Sprint Review',
        'backlog-grooming': 'Backlog Grooming',
        'team-meeting': 'Team Meeting',
        'stakeholder-meeting': 'Stakeholder Meeting',
        'training-session': 'Training Session'
      };
      
      // Try to extract sprint number or other identifiers from content
      const sprintMatch = content.match(/sprint\s+(\d+|[a-z]+)/i);
      const sprintInfo = sprintMatch ? ` ${sprintMatch[1]}` : '';
      
      generatedTitle = `${typeMap[detectedType] || 'Team Meeting'}${sprintInfo} - ${dateStr}`;
    }
    
    return { title: generatedTitle, type: detectedType };
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcription);
  };

  // Demo mode functionality for testing
  const loadDemoMeeting = () => {
    const demoTranscript = `Meeting started at 2:15 PM

**Sarah (Scrum Master):** Alright everyone, let's start our sprint planning meeting. We have John from the development team, Lisa from QA, and Mike our Product Owner. Today we're planning Sprint 23 which starts Monday.

**Mike (Product Owner):** Thanks Sarah. I want to walk through our top priorities for this sprint. We have three main user stories we need to tackle. First is the user authentication improvement - we've been getting feedback that the login process is too complex.

**John (Developer):** Can you elaborate on what specific improvements we're looking for? Are we talking about single sign-on integration or just UI improvements?

**Mike:** Good question. Based on user feedback, we want to implement social login options like Google and GitHub, and streamline the current form by reducing required fields. The acceptance criteria include OAuth integration and reducing login steps from 4 to 2.

**Lisa (QA):** What's our testing strategy for the OAuth integration? We'll need to test with different providers and edge cases like when external services are down.

**Sarah:** Great point Lisa. John, what's your estimate for the OAuth story?

**John:** Given the complexity of integrating multiple providers and ensuring security standards, I'd estimate this at 8 story points. We'll need to research OAuth libraries, implement the integration, and add fallback mechanisms.

**Mike:** That seems reasonable. The second priority is improving our API response times. We've noticed some endpoints are taking over 3 seconds to respond, especially the user dashboard data fetch.

**John:** I've been looking into this. The main bottleneck is our database queries. We're doing N+1 queries in several places and missing some indexes. I estimate this optimization work at 5 story points.

**Lisa:** For this one, I'll need to create performance test scenarios to validate the improvements. We should establish baseline metrics before we start.

**Sarah:** Excellent. Mike, what's the third priority?

**Mike:** The mobile responsive design updates for our dashboard. Users are reporting that the charts and tables don't display well on mobile devices. This affects about 40% of our user base.

**John:** This is mostly CSS and layout work. I think we can break this down into smaller components. The dashboard has 5 main sections - header, navigation, charts, data tables, and footer. I'd estimate 3 story points total.

**Lisa:** I'll need to test across different devices and screen sizes. We should include tablet testing too, not just mobile phones.

**Sarah:** So we have 8 + 5 + 3 = 16 story points total. Based on our velocity from the last 3 sprints averaging 14 points, this might be slightly ambitious. Should we consider moving something to the next sprint?

**Mike:** The mobile responsive work is important but could be deferred if needed. Let's commit to the OAuth and performance improvements as must-haves.

**John:** Actually, I think we can handle all three if we start with some research spikes early in the sprint. The OAuth research could happen in parallel with performance profiling.

**Lisa:** I agree. If we plan the testing approach upfront, we can work more efficiently.

**Sarah:** Alright, let's commit to all three stories but with the understanding that mobile responsive is our flex item if we run into issues. 

**Action Items:**
- John: Research OAuth libraries and create implementation plan by Wednesday
- Lisa: Set up performance baseline metrics and mobile testing matrix
- Mike: Review and approve OAuth provider list with security team
- Sarah: Schedule mid-sprint check-in for Thursday

**Sprint Goal:** Improve user experience through faster authentication, better performance, and mobile accessibility.

Meeting ended at 3:00 PM`;

    // Simulate the recording flow
    setMeetingTitle("Sprint 23 Planning Meeting");
    setMeetingType("sprint-planning");
    setParticipants("Sarah (Scrum Master), John (Developer), Lisa (QA), Mike (Product Owner)");
    setRecordingTime(2700); // 45 minutes
    setTranscription(demoTranscript);
    setRecordingState('transcribed');
    
    // Create a fake audio blob for completeness
    const fakeAudioData = new Uint8Array(1024);
    const fakeBlob = new Blob([fakeAudioData], { type: 'audio/webm' });
    setAudioBlob(fakeBlob);
  };

  const getRecordingStateDisplay = () => {
    switch (recordingState) {
      case 'recording':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />,
          text: 'Recording...'
        };
      case 'paused':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <Pause className="w-5 h-5" />,
          text: 'Paused'
        };
      case 'completed':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Recording Complete'
        };
      case 'transcribing':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: 'Transcribing...'
        };
      case 'transcribed':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Transcription Complete'
        };
      case 'permission-denied':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <MicOff className="w-5 h-5" />,
          text: 'Permission Denied'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <Mic className="w-5 h-5" />,
          text: 'Ready to Record'
        };
    }
  };

  const stateDisplay = getRecordingStateDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 border-b border-teal-700 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:text-teal-200 hover:bg-white/10"
              >
                <Link href="/synergize">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Synergize AI
                </Link>
              </Button>
              <div className="h-6 w-px bg-white/30" />
              <div>
                <h1 className="text-xl font-bold text-white">Record Meeting</h1>
                <p className="text-sm text-white/80">Professional meeting capture & AI transcription</p>
              </div>
            </div>
            
            <Badge className="bg-white/20 text-white border-white/30">
              <Mic className="w-4 h-4 mr-2" />
              Live Recording
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center border-b border-gray-100">
              <CardTitle className="text-2xl text-gray-900 mb-2">
                Meeting Recording Studio
              </CardTitle>
              <p className="text-gray-600">
                Capture your Agile meetings and transform them into training content
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Meeting Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meeting Title (optional)</Label>
                  <Input
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Auto-generated from transcript if left empty"
                    className="mt-2 bg-white border-gray-300 text-gray-900"
                    disabled={isRecording}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meeting Type</Label>
                  <Select value={meetingType} onValueChange={setMeetingType} disabled={isRecording}>
                    <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="sprint-planning" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Sprint Planning</SelectItem>
                      <SelectItem value="retrospective" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Retrospective</SelectItem>
                      <SelectItem value="daily-standup" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Daily Standup</SelectItem>
                      <SelectItem value="sprint-review" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Sprint Review</SelectItem>
                      <SelectItem value="backlog-grooming" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Backlog Grooming</SelectItem>
                      <SelectItem value="team-meeting" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Team Meeting</SelectItem>
                      <SelectItem value="stakeholder-meeting" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Stakeholder Meeting</SelectItem>
                      <SelectItem value="training-session" className="text-gray-900 hover:bg-teal-50 focus:bg-teal-50">Training Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Participants (optional)</Label>
                <Input
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="List meeting participants..."
                  className="mt-2 bg-white border-gray-300 text-gray-900"
                  disabled={isRecording}
                />
              </div>

              {/* Recording Status */}
              <div className={`p-6 rounded-xl border-2 ${stateDisplay.bgColor} ${stateDisplay.borderColor} transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={stateDisplay.color}>
                      {stateDisplay.icon}
                    </div>
                    <div>
                      <div className={`font-semibold text-lg ${stateDisplay.color}`}>
                        {stateDisplay.text}
                      </div>
                      {(isRecording || recordingTime > 0) && (
                        <div className="text-sm text-gray-600 mt-1">
                          Duration: {formatTime(recordingTime)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {recordingState !== 'idle' && recordingState !== 'transcribing' && recordingState !== 'permission-denied' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetRecording}
                      className="text-teal-600 hover:text-white hover:bg-teal-600 border-teal-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Permission Error Display */}
              {permissionError && (
                <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                  <div className="flex items-start space-x-4">
                    <MicOff className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 mb-3 text-lg">Microphone Access Required</h4>
                      <p className="text-red-700 mb-4">{permissionError}</p>
                      
                      <div className="text-sm text-red-600 space-y-2 mb-6">
                        <p><strong>How to fix this:</strong></p>
                        <p>• Look for the microphone icon 🎤 in your browser's address bar</p>
                        <p>• Click it and select "Allow" to grant microphone permissions</p>
                        <p>• On Safari mobile: Tap the "aA" icon, then Website Settings → Microphone → Allow</p>
                        <p>• Refresh the page if needed after granting permissions</p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={retryPermissions}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button
                          onClick={() => {
                            setPermissionError(null);
                            setRecordingState('idle');
                          }}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording Controls */}
              <div className="flex flex-col items-center space-y-6 py-8">
                <div className="flex items-center justify-center space-x-6">
                  {!isRecording && recordingState === 'idle' && !permissionError && (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all hover:scale-105 text-xl font-semibold"
                    >
                      <Mic className="w-8 h-8 mr-3" />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <>
                      {!isPaused ? (
                        <Button
                          onClick={pauseRecording}
                          variant="outline"
                          className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg"
                        >
                          <Pause className="w-6 h-6 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={resumeRecording}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                        >
                          <PlayCircle className="w-6 h-6 mr-2" />
                          Resume
                        </Button>
                      )}
                      
                      <Button
                        onClick={stopRecording}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 text-lg"
                      >
                        <Square className="w-6 h-6 mr-2" />
                        Stop Recording
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Demo Mode - Only show when idle and no recording in progress */}
                {recordingState === 'idle' && !isRecording && !permissionError && (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-sm text-gray-500 text-center">
                      For testing purposes:
                    </div>
                    <Button
                      onClick={loadDemoMeeting}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 text-sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Load Demo Meeting (45min Sprint Planning)
                    </Button>
                  </div>
                )}
              </div>

              {/* Transcription Section */}
              {recordingState === 'completed' && (
                <div className="text-center py-6">
                  <Button
                    onClick={transcribeAudio}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 text-lg"
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <FileText className="w-6 h-6 mr-3" />
                    )}
                    Generate Transcript
                  </Button>
                </div>
              )}

              {/* Display Transcription */}
              {transcription && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-700">Meeting Transcript</Label>
                    <div className="mt-3 p-6 bg-gray-50 border border-gray-200 rounded-xl max-h-80 overflow-y-auto">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {transcription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-teal-500/25 transition-all hover:scale-105 text-lg"
                    >
                      <Link href={`/synergize?transcript=${encodeURIComponent(transcription)}&title=${encodeURIComponent(meetingTitle)}&type=${meetingType}`}>
                        <BookOpen className="w-6 h-6 mr-3" />
                        Create Course Content
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={copyTranscript}
                      className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:text-teal-700 px-6 py-4 text-lg"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Transcript
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p><strong>Setup & Record:</strong> Configure your meeting details and start recording with professional-grade audio capture.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p><strong>AI Transcription:</strong> Generate accurate transcripts with speaker identification and formatting.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p><strong>Course Creation:</strong> Transform insights into structured training content and learning modules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 