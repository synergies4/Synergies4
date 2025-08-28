import jsPDF from 'jspdf';

// HR Assessment PDF Generator - Enhanced with comprehensive error handling and debugging
interface AssessmentData {
  overallPercentage: number;
  categoryScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  readinessLevel: string;
  contactInfo: {
    name: string;
    company: string;
  };
  recommendations: Array<{
    title: string;
    description: string;
    actions: string[];
    priority: string;
  }>;
}

export function generateAssessmentPDF(data: AssessmentData): void {
  try {
    console.log('PDF generation started with data:', data);
    
    // Create new PDF document
    const pdf = new jsPDF();
    
    // Set up constants
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        addHeader();
        return true;
      }
      return false;
    };

    // Helper function to add header on each page
    const addHeader = () => {
      // Company logo area (placeholder)
      pdf.setFillColor(20, 184, 166); // Teal color
      pdf.rect(margin, margin, contentWidth, 25, 'F');
      
      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Synergies4', margin + 10, margin + 16);
      
      // Tagline
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-Powered Professional Development', pageWidth - margin - 60, margin + 16);
      
      yPosition = margin + 35;
    };

    // Add header
    addHeader();

    // Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HR Readiness Assessment Report', margin, yPosition);
    yPosition += 15;

    // Subtitle with company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    const subtitle = data.contactInfo.company ? 
      `${data.contactInfo.company} - Agentic Workforce Readiness` : 
      'Agentic Workforce Readiness Assessment';
    pdf.text(subtitle, margin, yPosition);
    yPosition += 20;

    // Date and participant info
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Assessment Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
    if (data.contactInfo.name) {
      pdf.text(`Participant: ${data.contactInfo.name}`, margin, yPosition);
      yPosition += 15;
    } else {
      yPosition += 7;
    }

    // Executive Summary Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 15;

    // Overall Score Box
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(margin, yPosition, contentWidth, 40, 'F');
    pdf.setDrawColor(59, 130, 246); // Blue border
    pdf.rect(margin, yPosition, contentWidth, 40, 'S');

    // Score display
    pdf.setTextColor(59, 130, 246);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${data.overallPercentage}%`, margin + 20, yPosition + 25);

    // Readiness level
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${data.readinessLevel} Readiness`, margin + 80, yPosition + 18);

    // Score interpretation
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const interpretation = getScoreInterpretation(data.overallPercentage);
    const interpretationLines = pdf.splitTextToSize(interpretation, contentWidth - 100);
    pdf.text(interpretationLines, margin + 80, yPosition + 30);

    yPosition += 55;

    // Category Breakdown Section
    checkPageBreak(80);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category Breakdown', margin, yPosition);
    yPosition += 15;

    // Category scores
    Object.entries(data.categoryScores).forEach(([category, scores]) => {
      checkPageBreak(25);
      
      // Category name
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category, margin, yPosition);
      
      // Score
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${scores.score}/${scores.maxScore} points (${scores.percentage}%)`, pageWidth - margin - 60, yPosition);
      
      yPosition += 8;
      
      // Progress bar
      const barWidth = contentWidth - 20;
      const barHeight = 6;
      
      // Background bar
      pdf.setFillColor(230, 230, 230);
      pdf.rect(margin + 10, yPosition, barWidth, barHeight, 'F');
      
      // Progress bar
      const progressWidth = (barWidth * scores.percentage) / 100;
      const color = getColorForPercentage(scores.percentage);
      pdf.setFillColor(color.r, color.g, color.b);
      pdf.rect(margin + 10, yPosition, progressWidth, barHeight, 'F');
      
      yPosition += 20;
    });

    // Recommendations Section
    yPosition += 10;
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Recommendations', margin, yPosition);
    yPosition += 15;

    data.recommendations.forEach((rec, index) => {
      checkPageBreak(60);
      
      // Recommendation title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${rec.title}`, margin, yPosition);
      yPosition += 10;
      
      // Priority badge
      const priorityColor = rec.priority === 'High' ? { r: 239, g: 68, b: 68 } : { r: 245, g: 158, b: 11 };
      pdf.setFillColor(priorityColor.r, priorityColor.g, priorityColor.b);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      const priorityWidth = pdf.getTextWidth(`${rec.priority} Priority`) + 6;
      pdf.rect(margin, yPosition - 5, priorityWidth, 10, 'F');
      pdf.text(`${rec.priority} Priority`, margin + 3, yPosition + 1);
      yPosition += 12;
      
      // Description
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(rec.description, contentWidth - 10);
      pdf.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 5 + 5;
      
      // Actions
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommended Actions:', margin + 5, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      rec.actions.forEach(action => {
        checkPageBreak(15);
        const actionLines = pdf.splitTextToSize(`• ${action}`, contentWidth - 20);
        pdf.text(actionLines, margin + 10, yPosition);
        yPosition += actionLines.length * 5 + 2;
      });
      
      yPosition += 10;
    });

    // Next Steps Section
    checkPageBreak(60);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Next Steps', margin, yPosition);
    yPosition += 15;

    const nextSteps = [
      'Schedule a consultation with our HR transformation experts',
      'Review detailed recommendations with your leadership team',
      'Develop a phased implementation plan for AI workforce integration',
      'Establish metrics and KPIs for measuring transformation success',
      'Begin with foundational changes in your highest-priority areas'
    ];

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    nextSteps.forEach(step => {
      checkPageBreak(15);
      const stepLines = pdf.splitTextToSize(`• ${step}`, contentWidth - 10);
      pdf.text(stepLines, margin + 5, yPosition);
      yPosition += stepLines.length * 6 + 3;
    });

    // Footer
    yPosition += 20;
    checkPageBreak(40);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, contentWidth, 30, 'F');
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('© 2025 Synergies4. All rights reserved.', margin + 10, yPosition + 12);
    pdf.text('For questions about this assessment, contact us at synergies4ai.com', margin + 10, yPosition + 22);

    // Generate filename
    const fileName = data.contactInfo.company ? 
      `${data.contactInfo.company.replace(/[^a-z0-9]/gi, '_')}_HR_Readiness_Assessment.pdf` :
      'HR_Readiness_Assessment.pdf';

    console.log('About to save PDF with filename:', fileName);
    
    // Save the PDF
    pdf.save(fileName);
    
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
}

// Helper function to get score interpretation
function getScoreInterpretation(percentage: number): string {
  if (percentage >= 85) {
    return 'Your organization demonstrates advanced readiness for AI workforce integration with strong foundations across all key areas.';
  }
  if (percentage >= 70) {
    return 'Your organization shows good readiness for AI workforce integration with solid capabilities in most areas.';
  }
  if (percentage >= 55) {
    return 'Your organization is developing readiness for AI workforce integration but needs focused improvement in several areas.';
  }
  return 'Your organization requires significant preparation before AI workforce integration, with fundamental gaps that need addressing.';
}

// Helper function to get color for percentage
function getColorForPercentage(percentage: number): { r: number; g: number; b: number } {
  if (percentage >= 85) return { r: 34, g: 197, b: 94 }; // Green
  if (percentage >= 70) return { r: 59, g: 130, b: 246 }; // Blue  
  if (percentage >= 55) return { r: 245, g: 158, b: 11 }; // Yellow
  return { r: 239, g: 68, b: 68 }; // Red
} 