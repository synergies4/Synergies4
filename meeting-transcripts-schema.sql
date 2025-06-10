-- Meeting Transcripts and Recordings Schema
-- Run this in your Supabase SQL editor

-- Meeting Transcripts Table
CREATE TABLE IF NOT EXISTS public.meeting_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  meeting_platform VARCHAR(50), -- 'zoom', 'google-meet', 'teams', 'manual', etc.
  meeting_id VARCHAR(255), -- External meeting ID if applicable
  meeting_url TEXT, -- Original meeting URL
  participants JSONB DEFAULT '[]'::jsonb, -- Array of participant names/emails
  transcript_text TEXT NOT NULL, -- Full transcript content
  transcript_json JSONB, -- Structured transcript with timestamps, speakers, etc.
  duration_minutes INTEGER, -- Meeting duration in minutes
  recording_url TEXT, -- URL to audio/video recording if available
  summary TEXT, -- AI-generated summary
  key_points JSONB DEFAULT '[]'::jsonb, -- Array of key points/action items
  tags JSONB DEFAULT '[]'::jsonb, -- User-defined tags
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(transcript_text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'C')
  ) STORED
);

-- Meeting Participants Table (for detailed participant tracking)
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_transcript_id UUID NOT NULL REFERENCES public.meeting_transcripts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(100), -- 'host', 'participant', 'presenter', etc.
  join_time TIMESTAMP WITH TIME ZONE,
  leave_time TIMESTAMP WITH TIME ZONE,
  speaking_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Action Items Table
CREATE TABLE IF NOT EXISTS public.meeting_action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_transcript_id UUID NOT NULL REFERENCES public.meeting_transcripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assignee_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_user_id ON public.meeting_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_meeting_date ON public.meeting_transcripts(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_platform ON public.meeting_transcripts(meeting_platform);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_search ON public.meeting_transcripts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON public.meeting_participants(meeting_transcript_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON public.meeting_action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.meeting_action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON public.meeting_action_items(due_date);

-- Row Level Security
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meeting_transcripts
CREATE POLICY "Users can view their own meeting transcripts" 
ON public.meeting_transcripts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meeting transcripts" 
ON public.meeting_transcripts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting transcripts" 
ON public.meeting_transcripts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting transcripts" 
ON public.meeting_transcripts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for meeting_participants
CREATE POLICY "Users can view participants of their meetings" 
ON public.meeting_participants FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.meeting_transcripts 
  WHERE id = meeting_transcript_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage participants of their meetings" 
ON public.meeting_participants FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.meeting_transcripts 
  WHERE id = meeting_transcript_id AND user_id = auth.uid()
));

-- RLS Policies for meeting_action_items
CREATE POLICY "Users can view their own action items" 
ON public.meeting_action_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own action items" 
ON public.meeting_action_items FOR ALL 
USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_meeting_transcripts_updated_at 
BEFORE UPDATE ON public.meeting_transcripts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at 
BEFORE UPDATE ON public.meeting_action_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 