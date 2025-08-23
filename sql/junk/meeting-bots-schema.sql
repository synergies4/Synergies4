-- Meeting Bots Table for tracking recording sessions
CREATE TABLE IF NOT EXISTS meeting_bots (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id VARCHAR(255) UNIQUE NOT NULL, -- Recall.ai bot ID
  meeting_url TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('zoom', 'google-meet', 'teams', 'unknown')),
  bot_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'joining', 'recording', 'stopping', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  recording_started_at TIMESTAMP WITH TIME ZONE,
  stopped_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recording data
  transcript_url TEXT,
  transcript_text TEXT,
  transcript_ready BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  recording_ready BOOLEAN DEFAULT FALSE,
  
  -- References
  transcript_id INTEGER REFERENCES meeting_transcripts(id),
  
  -- Metadata
  recall_data JSONB, -- Raw data from Recall.ai
  error_message TEXT,
  
  -- Indexes
  CONSTRAINT unique_user_bot UNIQUE (user_id, bot_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_bots_user_id ON meeting_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_bot_id ON meeting_bots(bot_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_status ON meeting_bots(status);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_platform ON meeting_bots(platform);
CREATE INDEX IF NOT EXISTS idx_meeting_bots_created_at ON meeting_bots(created_at DESC);

-- RLS Policies
ALTER TABLE meeting_bots ENABLE ROW LEVEL SECURITY;

-- Users can only access their own meeting bots
CREATE POLICY "Users can access their own meeting bots" ON meeting_bots
  FOR ALL USING (auth.uid() = user_id);

-- Users can insert their own meeting bots
CREATE POLICY "Users can create meeting bots" ON meeting_bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON meeting_bots TO authenticated;
GRANT USAGE ON SEQUENCE meeting_bots_id_seq TO authenticated; 