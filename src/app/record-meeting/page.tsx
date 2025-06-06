'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  ArrowLeft, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  Download,
  Copy,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Mock demo data
const DEMO_TRANSCRIPT = `Sarah (Scrum Master): Alright everyone, let's start our Sprint 15 planning meeting. We've got about 90 minutes scheduled, and I want to make sure we cover everything properly.

Mike (Product Owner): Perfect. So we're looking at the stories in our backlog for the next two weeks. The main priorities are the user authentication system and the reporting dashboard improvements.

Jessica (Developer): I've been looking at the authentication stories, and I think the OAuth integration might be more complex than initially estimated. We should probably break that down further.

David (Designer): I agree with Jessica. From a UX perspective, we also need to consider the onboarding flow for new users. That's going to require some additional design work.

Sarah: Good points. Let's start with story estimation. Mike, can you walk us through the top priority items?

Mike: Sure. First item is "As a user, I want to sign in with Google so that I can access the platform quickly." This was initially estimated at 8 points, but given Jessica's concerns, maybe we should re-evaluate.

Jessica: I'd say it's more like 13 points. We need to handle the OAuth flow, user provisioning, error handling, and security considerations. Plus integration testing.

David: And we'll need design mockups for the sign-in flow. That's probably another 3 points for design work.

Sarah: So we're looking at 13 for development plus 3 for design. Let's also consider the testing effort. Tom, what's your take on QA for this?

Tom (QA Engineer): For OAuth integration, I'd want to do comprehensive testing across different browsers and devices. Plus security testing. I'd estimate about 5 points for QA.

Mike: Okay, so total is 21 points for the OAuth story. That's quite a bit. Should we break it down further?

Jessica: We could split it into "Set up OAuth provider configuration" and "Implement user sign-in flow" and "Handle user provisioning".

Sarah: That makes sense. Let's do that breakdown. Moving on to the reporting dashboard - what's the current state there?

David: I've completed the wireframes, and the stakeholders approved them last week. The main changes are adding filters by date range and export functionality.

Mike: Right, and the stories are "As a manager, I want to filter reports by date range" and "As a manager, I want to export reports to PDF".

Jessica: The filtering should be straightforward - probably 5 points. The PDF export might be trickier depending on the complexity of the reports.

Tom: For testing the export functionality, I'll need to verify different report types and ensure PDF formatting is correct across various data sets.

Sarah: Let's estimate the PDF export at 8 points including testing. Now, let's talk about capacity. What's everyone's availability for this sprint?

Jessica: I've got that conference next Thursday and Friday, so I'm probably at about 70% capacity.

David: I'm fully available, but I'm also supporting the marketing team with some landing page updates.

Tom: Full capacity for me, but I want to finish up the automation testing from last sprint first.

Sarah: Okay, so realistic capacity is probably around 80 points total for the team. We've got 34 points identified so far. What else should we consider?

Mike: There's also the bug fixes from last sprint. We had that data synchronization issue that needs investigation.

Jessica: Oh right, that's been bothering me. I think it might be related to the caching layer. Could be a quick fix or could be complex.

Sarah: Let's estimate that at 8 points to be safe. We can always adjust if we find the root cause quickly.

Tom: We should also allocate time for regression testing after the bug fix.

Sarah: Good point. So we're at 42 points now. That leaves us with some buffer for unexpected issues.

Mike: Should we consider any technical debt items?

Jessica: Actually, yes. We've been putting off updating the API documentation, and it's getting out of sync with our actual implementation.

David: That's important for our external partners too. They've been asking about updated documentation.

Sarah: How much effort for documentation updates?

Jessica: If we focus on the core endpoints that changed recently, probably 13 points.

Sarah: That brings us to 55 points, which is well within our capacity. Let's also think about sprint goals. What would success look like?

Mike: For me, success is having the OAuth integration working end-to-end, even if it's not fully polished.

Jessica: And fixing that synchronization bug. Our users have been reporting issues.

David: Getting the reporting improvements live would be great for the upcoming board presentation.

Sarah: Perfect. So our sprint goals are: 1) Complete OAuth integration MVP, 2) Fix data synchronization issue, 3) Deliver reporting dashboard improvements, and 4) Update API documentation.

Tom: That sounds achievable. Should we also plan our demo for the stakeholders?

Mike: Yes, let's schedule that for the second Thursday of the sprint. I'll make sure the key stakeholders can attend.

Sarah: Great. I'll send out calendar invites after this meeting. Any other concerns or questions before we finalize the sprint backlog?

Jessica: Just want to confirm - if we run into issues with the OAuth complexity, we can always push some of the edge cases to the next sprint?

Mike: Absolutely. Better to have a working core feature than a partially implemented complex one.

Sarah: Agreed. Alright team, I think we have a solid plan. Let's update the sprint backlog and start the work. Thanks everyone for a productive planning session!`;

type MeetingType = 'sprint-planning' | 'daily-standup' | 'retrospective' | 'demo' | 'backlog-grooming' | 'team-meeting' | 'one-on-one' | 'all-hands';

interface MeetingData {
  title: string;
  type: MeetingType;
  participants: string;
  duration: string;
}

const MEETING_TYPES: Record<MeetingType, { label: string; icon: string; color: string }> = {
  'sprint-planning': { label: 'Sprint Planning', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'daily-standup': { label: 'Daily Standup', icon: '☀️', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  'retrospective': { label: 'Retrospective', icon: '🔄', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'demo': { label: 'Sprint Demo', icon: '🎯', color: 'bg-green-50 text-green-700 border-green-200' },
  'backlog-grooming': { label: 'Backlog Grooming', icon: '🌱', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'team-meeting': { label: 'Team Meeting', icon: '👥', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'one-on-one': { label: 'One-on-One', icon: '🗣️', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  'all-hands': { label: 'All Hands', icon: '🙌', color: 'bg-gray-50 text-gray-700 border-gray-200' }
};

export default function RecordMeetingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [meetingData, setMeetingData] = useState<MeetingData>({
    title: '',
    type: 'team-meeting',
    participants: '',
    duration: ''
  });
  const [hasRecordingData, setHasRecordingData] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        setAudioChunks(chunks);
        setHasRecordingData(true);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Generate transcript
  const generateTranscript = async () => {
    if (!hasRecordingData && !transcription) {
      alert('No recording available to transcribe.');
      return;
    }

    setIsTranscribing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set demo transcript
      setTranscription(DEMO_TRANSCRIPT);
      
      // Auto-update meeting data based on transcript content
      if (!meetingData.title || meetingData.title === '') {
        setMeetingData(prev => ({
          ...prev,
          title: 'Sprint 15 Planning Meeting',
          participants: 'Sarah, Mike, Jessica, David, Tom',
          duration: '45 minutes'
        }));
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error generating transcript. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Load demo meeting
  const loadDemoMeeting = () => {
    setTranscription(DEMO_TRANSCRIPT);
    setMeetingData({
      title: 'Sprint 15 Planning Meeting',
      type: 'sprint-planning',
      participants: 'Sarah (Scrum Master), Mike (Product Owner), Jessica (Developer), David (Designer), Tom (QA Engineer)',
      duration: '45 minutes'
    });
    setHasRecordingData(true);
  };

  // Reset everything
  const resetMeeting = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscription('');
    setMeetingData({
      title: '',
      type: 'team-meeting',
      participants: '',
      duration: ''
    });
    setHasRecordingData(false);
    setAudioChunks([]);
    setMediaRecorder(null);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Copy transcript
  const copyTranscript = () => {
    navigator.clipboard.writeText(transcription);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const selectedMeetingType = MEETING_TYPES[meetingData.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-bold text-gray-900">Meeting Recording Studio</h1>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Recording Controls */}
          <div className="space-y-6">
            {/* Recording Status Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Recording Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Status Display */}
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isRecording 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-200' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {isRecording ? (
                      isPaused ? (
                        <Pause className="h-10 w-10 text-white" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )
                    ) : (
                      <Mic className="h-10 w-10 text-white" />
                    )}
                  </div>
                  
                  <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    isRecording 
                      ? isPaused 
                        ? 'text-yellow-600' 
                        : 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {isRecording 
                      ? isPaused 
                        ? 'Recording Paused' 
                        : 'Recording in Progress...' 
                      : 'Ready to Record'
                    }
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={togglePause} 
                        variant="outline"
                        size="lg"
                        className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-6 py-3 rounded-full transition-all duration-300"
                      >
                        {isPaused ? (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            Pause
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={stopRecording} 
                        variant="outline"
                        size="lg"
                        className="border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-3 rounded-full transition-all duration-300"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-3 pt-4 border-t">
                  <Button 
                    onClick={loadDemoMeeting} 
                    variant="outline"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Load Demo Meeting
                  </Button>
                  <Button 
                    onClick={resetMeeting} 
                    variant="outline"
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Details Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="h-5 w-5 mr-2 text-teal-600" />
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Meeting Title (Optional)
                  </Label>
                  <Input
                    id="title"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Auto-generated if empty"
                    className="mt-1 bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Meeting Type
                  </Label>
                  <Select 
                    value={meetingData.type} 
                    onValueChange={(value) => setMeetingData(prev => ({ ...prev, type: value as MeetingType }))}
                  >
                    <SelectTrigger className="mt-1 bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-xl">
                      {Object.entries(MEETING_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key} className="hover:bg-teal-50 focus:bg-teal-50">
                          <div className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="participants" className="text-sm font-medium text-gray-700">
                    Participants
                  </Label>
                  <Input
                    id="participants"
                    value={meetingData.participants}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, participants: e.target.value }))}
                    placeholder="Enter participant names"
                    className="mt-1 bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={meetingData.duration}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 30 minutes"
                    className="mt-1 bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                {/* Meeting Type Badge */}
                <div className="pt-2">
                  <Badge className={`${selectedMeetingType.color} text-sm px-3 py-1 border`}>
                    {selectedMeetingType.icon} {selectedMeetingType.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transcript & Actions */}
          <div className="space-y-6">
            {/* Transcript Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-teal-600" />
                    AI Transcript
                  </CardTitle>
                  {transcription && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={copyTranscript} 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-teal-50 hover:border-teal-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-teal-50 hover:border-teal-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!transcription ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Record a meeting or load a demo to generate an AI transcript.
                    </p>
                    <Button 
                      onClick={generateTranscript} 
                      disabled={!hasRecordingData || isTranscribing}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md transition-all duration-300"
                    >
                      {isTranscribing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Transcript
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      className="min-h-[400px] bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500 text-sm leading-relaxed resize-none"
                      placeholder="AI-generated transcript will appear here..."
                    />
                    
                    {/* Copy Success Message */}
                    {showCopiedMessage && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center animate-fade-in-out">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Copied!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {transcription && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Ready to Create Your Course?</h3>
                      <p className="text-teal-100">
                        Transform this meeting transcript into a comprehensive training course with AI
                      </p>
                    </div>
                    
                    <Link 
                      href={`/synergize?transcript=${encodeURIComponent(transcription)}&title=${encodeURIComponent(meetingData.title || 'Meeting Recording')}&type=${meetingData.type}`}
                      className="inline-block"
                    >
                      <Button 
                        size="lg"
                        className="bg-white text-teal-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Course Content
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-teal-100 mt-2">
                      This will open the AI assistant to generate your course
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 