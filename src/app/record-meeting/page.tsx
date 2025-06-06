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
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
      setRecordingState('completed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcription);
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
      <div className="flex items-center justify-center space-x-6 py-8">
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-4 text-lg"
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
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
      setRecordingState('completed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcription);
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 hover:text-gray-800"
              >
                <Link href="/synergize">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Synergize AI
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Record Meeting</h1>
                <p className="text-sm text-gray-600">Professional meeting capture & AI transcription</p>
              </div>
            </div>
            
            <Badge className="bg-red-100 text-red-700 border-red-200">
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
                  <Label className="text-sm font-medium text-gray-700">Meeting Title</Label>
                  <Input
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Enter meeting title..."
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
              <div className="flex items-center justify-center space-x-6 py-8">
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-4 text-lg"
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