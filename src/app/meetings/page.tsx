'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/shared/PageLayout';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Play, 
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Video,
  Mic,
  CheckSquare,
  AlertCircle,
  Plus,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import CalendarIntegration from '@/components/CalendarIntegration';

interface MeetingTranscript {
  id: string;
  title: string;
  meeting_platform: string;
  meeting_date: string;
  duration_minutes: number;
  transcript_text: string;
  summary: string;
  participants: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  meeting_action_items: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
  tags: string[];
  recording_url?: string;
  created_at: string;
}

export default function MeetingsPage() {
  const [transcripts, setTranscripts] = useState<MeetingTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchTranscripts();
  }, [searchTerm, selectedPlatform, pagination.offset]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);

      const response = await fetch(`/api/meeting-transcripts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTranscripts(data.transcripts);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch transcripts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePlatformFilter = (platform: string) => {
    setSelectedPlatform(platform);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'zoom': return '📹';
      case 'google-meet': return '📊';
      case 'teams': return '💼';
      case 'manual': return '📝';
      default: return '🎥';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'zoom': return 'bg-blue-100 text-blue-800';
      case 'google-meet': return 'bg-green-100 text-green-800';
      case 'teams': return 'bg-purple-100 text-purple-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionItemStats = (actionItems: any[]) => {
    const total = actionItems.length;
    const completed = actionItems.filter(item => item.status === 'completed').length;
    const pending = actionItems.filter(item => item.status === 'pending').length;
    const overdue = actionItems.filter(item => {
      if (!item.due_date) return false;
      return new Date(item.due_date) < new Date() && item.status !== 'completed';
    }).length;

    return { total, completed, pending, overdue };
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Recordings</h1>
            <p className="text-gray-600">View and manage your meeting transcripts and recordings</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Upload Recording
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recordings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto md:mx-0">
            <TabsTrigger value="recordings">Meeting Recordings</TabsTrigger>
            <TabsTrigger value="calendar">Calendar Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search meetings, participants, or keywords..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedPlatform === 'zoom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformFilter('zoom')}
                  >
                    📹 Zoom
                  </Button>
                  <Button
                    variant={selectedPlatform === 'google-meet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformFilter('google-meet')}
                  >
                    📊 Meet
                  </Button>
                  <Button
                    variant={selectedPlatform === 'teams' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformFilter('teams')}
                  >
                    💼 Teams
                  </Button>
                </div>
              </div>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <Video className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(transcripts.reduce((sum, t) => sum + (t.duration_minutes || 0), 0))}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Action Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transcripts.reduce((sum, t) => sum + (t.meeting_action_items?.length || 0), 0)}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transcripts.reduce((sum, t) => sum + (t.participants?.length || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transcripts.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedPlatform !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first meeting recording to get started'
                }
              </p>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {transcripts.map((transcript) => {
              const actionStats = getActionItemStats(transcript.meeting_action_items || []);
              
              return (
                <Card key={transcript.id} className="group hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                          {transcript.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPlatformColor(transcript.meeting_platform)}>
                            {getPlatformIcon(transcript.meeting_platform)} {transcript.meeting_platform}
                          </Badge>
                          {transcript.recording_url && (
                            <Badge variant="secondary">
                              <Play className="w-3 h-3 mr-1" />
                              Recording
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Meeting Info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(transcript.meeting_date)}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatDuration(transcript.duration_minutes || 0)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {transcript.participants?.length || 0} participants
                        </div>
                      </div>

                      {/* Summary Preview */}
                      {transcript.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {transcript.summary}
                        </p>
                      )}

                      {/* Action Items */}
                      {actionStats.total > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                          <span className="text-sm text-gray-600">
                            {actionStats.completed}/{actionStats.total} action items completed
                          </span>
                          {actionStats.overdue > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {actionStats.overdue} overdue
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {transcript.tags && transcript.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {transcript.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {transcript.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{transcript.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <Link href={`/meetings/${transcript.id}`}>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {transcript.recording_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={transcript.recording_url} target="_blank" rel="noopener noreferrer">
                                <Play className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

            {/* Pagination */}
            {pagination.hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={loading}
                >
                  Load More Meetings
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
} 