'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Edit3, 
  Eye, 
  FileText, 
  Save, 
  Undo, 
  Copy,
  Printer,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ResumeEditorProps {
  content: string;
  title: string;
  onSave?: (content: string) => void;
  modifications?: string[];
  keywords?: string[];
}

export default function ResumeEditor({
  content,
  title,
  onSave,
  modifications = [],
  keywords = []
}: ResumeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('preview');
  const contentRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Convert markdown-like content to HTML for better display
  const formatContent = (text: string): string => {
    if (!text) return '';
    
    return text
      // Convert markdown headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-gray-300 pb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-1">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-gray-700">$1</h3>')
      
      // Convert markdown bold/italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      
      // Convert bullet points
      .replace(/^• (.*$)/gm, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
      
      // Convert line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br />')
      
      // Wrap in paragraphs
      .replace(/^(?!<[hl])/gm, '<p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/(?<![>])$/gm, '</p>')
      
      // Clean up extra paragraph tags
      .replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/g, '')
      .replace(/<p class="mb-4 text-gray-700 leading-relaxed">(<[hl])/g, '$1');
  };

  const handleSave = () => {
    setEditedContent(editRef.current?.value || editedContent);
    setIsEditing(false);
    onSave?.(editRef.current?.value || editedContent);
    toast.success('Changes saved successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to last saved content
    if (editRef.current) {
      editRef.current.value = editedContent;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const exportToPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, margin + 10);
      
      // Add content
      let yPosition = margin + 25;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Clean content for PDF (remove HTML tags)
      const cleanContent = editedContent
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      const lines = pdf.splitTextToSize(cleanContent, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const exportToDoc = () => {
    try {
      // Create a simple DOC format (RTF)
      const docContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 {\\b ${title}}\\par\\par
${editedContent.replace(/<[^>]*>/g, '').replace(/\n/g, '\\par ')}}`;
      
      const blob = new Blob([docContent], { 
        type: 'application/rtf' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('DOC file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export DOC');
      console.error('DOC export error:', error);
    }
  };

  const printContent = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { 
              color: #2c3e50; 
              border-bottom: 2px solid #3498db; 
              padding-bottom: 10px;
            }
            h2 { 
              color: #34495e; 
              border-bottom: 1px solid #bdc3c7; 
              padding-bottom: 5px;
            }
            h3 { color: #7f8c8d; }
            strong { color: #2c3e50; }
            li { margin-bottom: 5px; }
            p { margin-bottom: 12px; }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${formatContent(editedContent)}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            {isEditing ? 'Editing mode - make your changes below' : 'Preview mode - click edit to make changes'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <Undo className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Export options */}
      {!isEditing && (
        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border">
          <span className="text-sm font-medium text-gray-700">Export:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToDoc}
            className="flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>DOC</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printContent}
            className="flex items-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
        </div>
      )}

      {/* Modifications and keywords summary */}
      {(modifications.length > 0 || keywords.length > 0) && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modifications">Modifications</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>
              
              <TabsContent value="modifications" className="mt-4">
                <div className="space-y-2">
                  {modifications.map((mod, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{mod}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="keywords" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Content display/editing */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isEditing ? (
            <div className="p-6">
              <textarea
                ref={editRef}
                defaultValue={editedContent}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm overflow-y-auto"
                placeholder="Edit your content here..."
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Formatting Tips:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Use <code className="bg-blue-100 px-1 rounded"># Title</code> for main headings</p>
                  <p>• Use <code className="bg-blue-100 px-1 rounded">## Section</code> for section headings</p>
                  <p>• Use <code className="bg-blue-100 px-1 rounded">**text**</code> for bold text</p>
                  <p>• Use <code className="bg-blue-100 px-1 rounded">- item</code> or <code className="bg-blue-100 px-1 rounded">• item</code> for bullet points</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div 
                ref={contentRef}
                className="p-8 bg-white overflow-y-auto max-h-[600px] border-b"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(editedContent) 
                  }}
                  className="prose prose-sm max-w-none break-words"
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                />
              </div>
              {/* Scroll indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 