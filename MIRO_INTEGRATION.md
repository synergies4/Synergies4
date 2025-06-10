# Miro Integration Guide

## Overview
This guide covers integrating Miro boards and diagrams into your AI conversations and presentations for enhanced context and collaboration.

## 🏆 Recommended Approaches

### Option 1: Miro REST API (Recommended)
**Best for: Direct board access and real-time updates**

```typescript
// Miro API Client
class MiroAPI {
  private apiKey: string;
  private baseUrl = 'https://api.miro.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get user's boards
  async getBoards() {
    const response = await fetch(`${this.baseUrl}/boards`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }

  // Get board details
  async getBoard(boardId: string) {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return await response.json();
  }

  // Get board items (shapes, sticky notes, etc.)
  async getBoardItems(boardId: string) {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/items`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return await response.json();
  }

  // Export board as image
  async exportBoardAsImage(boardId: string, format: 'png' | 'jpg' = 'png') {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format,
        viewport_type: 'fit_to_board'
      })
    });
    
    return await response.json();
  }

  // Create sticky note
  async createStickyNote(boardId: string, content: string, position: { x: number, y: number }) {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/sticky_notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          content,
          shape: 'square'
        },
        style: {
          fillColor: 'yellow',
          textAlign: 'center'
        },
        position
      })
    });
    
    return await response.json();
  }
}
```

### Option 2: Miro Web SDK Integration
**Best for: Embedded Miro boards in your app**

```typescript
// Miro SDK for embedding boards
import { Miro } from '@mirohq/websdk-types';

declare global {
  interface Window {
    miro: Miro;
  }
}

class MiroEmbedded {
  async initializeBoard(boardId: string) {
    // Initialize Miro SDK
    await window.miro.board.ui.on('init', async () => {
      console.log('Miro board initialized');
    });

    // Get board information
    const boardInfo = await window.miro.board.getInfo();
    return boardInfo;
  }

  // Extract text from board for AI context
  async extractBoardContext(boardId: string) {
    const items = await window.miro.board.get();
    
    const context = {
      title: await window.miro.board.getInfo().then(info => info.title),
      textContent: [],
      shapes: [],
      diagrams: []
    };

    items.forEach(item => {
      switch (item.type) {
        case 'sticky_note':
          context.textContent.push({
            type: 'sticky_note',
            content: item.content,
            position: item.position
          });
          break;
          
        case 'text':
          context.textContent.push({
            type: 'text',
            content: item.content,
            position: item.position
          });
          break;
          
        case 'shape':
          context.shapes.push({
            type: 'shape',
            shapeType: item.shape,
            content: item.content,
            position: item.position
          });
          break;
      }
    });

    return context;
  }

  // Create AI summary of board
  async createBoardSummary(boardContext: any) {
    const response = await fetch('/api/ai/summarize-miro-board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardContext })
    });
    
    return await response.json();
  }
}
```

### Option 3: Image-Based Integration
**Best for: Simple diagram import without live editing**

```typescript
class MiroImageImport {
  // Upload Miro board export to your system
  async importMiroBoard(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'miro-board');

    const response = await fetch('/api/upload-diagram', {
      method: 'POST',
      body: formData
    });

    const { imageUrl, extractedText } = await response.json();
    
    // Use OCR to extract text from diagram
    const context = await this.extractTextFromImage(imageUrl);
    
    return {
      imageUrl,
      extractedText: context,
      metadata: {
        source: 'miro',
        uploadedAt: new Date().toISOString()
      }
    };
  }

  // Extract text using OCR (Tesseract.js or cloud OCR)
  async extractTextFromImage(imageUrl: string) {
    const response = await fetch('/api/ocr/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    
    return await response.json();
  }
}
```

## 🔧 API Endpoints for Miro Integration

### 1. Miro Board Import API
```typescript
// src/app/api/miro/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boardId, boardUrl } = await request.json();

    // Initialize Miro API
    const miro = new MiroAPI(process.env.MIRO_ACCESS_TOKEN!);

    // Get board data
    const boardData = await miro.getBoard(boardId);
    const boardItems = await miro.getBoardItems(boardId);
    
    // Export board as image
    const exportResult = await miro.exportBoardAsImage(boardId);
    
    // Process board content for AI context
    const context = await processMiroBoardForAI(boardItems);
    
    // Save to database
    const { data: savedBoard } = await supabase
      .from('user_miro_boards')
      .insert({
        user_id: session.user.id,
        miro_board_id: boardId,
        board_url: boardUrl,
        title: boardData.name,
        description: boardData.description,
        image_url: exportResult.url,
        content_context: context,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return NextResponse.json({ 
      board: savedBoard,
      context 
    });

  } catch (error) {
    console.error('Miro import error:', error);
    return NextResponse.json({ error: 'Failed to import Miro board' }, { status: 500 });
  }
}

async function processMiroBoardForAI(boardItems: any) {
  const context = {
    totalItems: boardItems.data.length,
    textElements: [],
    shapes: [],
    diagrams: [],
    summary: ''
  };

  // Extract meaningful content
  boardItems.data.forEach((item: any) => {
    if (item.type === 'sticky_note' || item.type === 'text') {
      context.textElements.push({
        content: item.data.content,
        position: item.position,
        type: item.type
      });
    } else if (item.type === 'shape') {
      context.shapes.push({
        shape: item.data.shape,
        content: item.data.content || '',
        position: item.position
      });
    }
  });

  // Generate AI summary
  const allText = context.textElements.map(e => e.content).join(' ');
  if (allText.length > 0) {
    // Call your AI service to summarize
    context.summary = await generateAISummary(allText);
  }

  return context;
}
```

### 2. Add Miro Context to Conversations
```typescript
// src/app/api/conversations/add-miro-context/route.ts
export async function POST(request: NextRequest) {
  try {
    const { conversationId, miroBoardId } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Miro board context
    const { data: miroBoard } = await supabase
      .from('user_miro_boards')
      .select('*')
      .eq('id', miroBoardId)
      .eq('user_id', session.user.id)
      .single();

    if (!miroBoard) {
      return NextResponse.json({ error: 'Miro board not found' }, { status: 404 });
    }

    // Add context to conversation
    const contextMessage = {
      role: 'system',
      content: `Miro Board Context: "${miroBoard.title}"
      
Summary: ${miroBoard.content_context.summary}

Key Elements:
${miroBoard.content_context.textElements.map((el: any, i: number) => 
  `${i + 1}. ${el.content}`
).join('\n')}

This Miro board provides visual context for our conversation. Reference these elements when relevant.`,
      metadata: {
        type: 'miro_context',
        board_id: miroBoard.miro_board_id,
        board_title: miroBoard.title,
        image_url: miroBoard.image_url
      }
    };

    // Update conversation with Miro context
    const { data: updatedConversation } = await supabase
      .from('user_conversations')
      .update({
        context_data: {
          miro_boards: [miroBoard],
          updated_at: new Date().toISOString()
        }
      })
      .eq('id', conversationId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    return NextResponse.json({ 
      conversation: updatedConversation,
      contextMessage 
    });

  } catch (error) {
    console.error('Add Miro context error:', error);
    return NextResponse.json({ error: 'Failed to add Miro context' }, { status: 500 });
  }
}
```

## 🎨 UI Components for Miro Integration

### Miro Board Selector
```typescript
// components/MiroBoardSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Download, Plus } from 'lucide-react';

interface MiroBoard {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  content_context: any;
}

export default function MiroBoardSelector({ onBoardSelect }: { onBoardSelect: (board: MiroBoard) => void }) {
  const [boards, setBoards] = useState<MiroBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [importUrl, setImportUrl] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/miro/boards');
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Failed to fetch Miro boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const importBoard = async () => {
    if (!importUrl) return;

    setLoading(true);
    try {
      // Extract board ID from Miro URL
      const boardId = extractBoardIdFromUrl(importUrl);
      
      const response = await fetch('/api/miro/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          boardId, 
          boardUrl: importUrl 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setBoards(prev => [data.board, ...prev]);
        setImportUrl('');
      }
    } catch (error) {
      console.error('Failed to import Miro board:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractBoardIdFromUrl = (url: string) => {
    // Extract board ID from Miro URL
    const match = url.match(/miro\.com\/app\/board\/(.+?)\//);
    return match ? match[1] : '';
  };

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Import New Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Import Miro Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Paste Miro board URL here..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
            <Button onClick={importBoard} disabled={!importUrl || loading}>
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search your Miro boards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBoards.map((board) => (
          <Card key={board.id} className="group cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-0">
              {board.image_url && (
                <img
                  src={board.image_url}
                  alt={board.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{board.title}</h3>
                {board.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{board.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {board.content_context.totalItems} items
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onBoardSelect(board)}
                    >
                      Select
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={board.image_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBoards.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No Miro boards found. Import your first board to get started.
        </div>
      )}
    </div>
  );
}
```

## 🗄️ Database Schema for Miro Integration

```sql
-- Add to your existing schema
CREATE TABLE IF NOT EXISTS public.user_miro_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  miro_board_id VARCHAR(255) NOT NULL,
  board_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  content_context JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_miro_boards_user_id ON public.user_miro_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_miro_boards_board_id ON public.user_miro_boards(miro_board_id);

-- RLS Policies
ALTER TABLE public.user_miro_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own Miro boards" 
ON public.user_miro_boards FOR ALL 
USING (auth.uid() = user_id);
```

## 🚀 Implementation Priority

### Phase 1: Basic Integration (Start Here)
1. **Image-based import** - Users upload Miro board screenshots
2. **OCR text extraction** - Extract text for AI context
3. **Simple board gallery** - View and select imported boards

### Phase 2: API Integration
1. **Miro OAuth setup** - Allow users to connect their Miro account
2. **Board listing** - Fetch user's Miro boards
3. **Live board import** - Direct board data import

### Phase 3: Advanced Features
1. **Real-time sync** - Keep boards updated
2. **Collaborative editing** - Add AI insights back to Miro
3. **Advanced context extraction** - Understand diagram relationships

## 💡 Best Practices

1. **Start Simple**: Begin with image uploads and OCR
2. **User Consent**: Always ask permission before accessing Miro data
3. **Context Relevance**: Only include relevant board elements in AI context
4. **Visual Previews**: Show board thumbnails for easy selection
5. **Fallback Options**: Support manual text input if API fails

This approach gives you powerful Miro integration that enhances your AI conversations with visual context! 🎨 