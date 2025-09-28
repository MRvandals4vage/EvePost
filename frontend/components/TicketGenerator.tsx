'use client';

import { forwardRef, useImperativeHandle } from 'react';

interface TicketData {
  participant: {
    name: string;
    email: string;
    registrationId: string;
  };
  event: {
    title: string;
    description: string;
    date: string;
    venue: string;
  };
  qrCodeData: string;
}

interface TicketGeneratorProps {
  ticketData: TicketData;
}

export interface TicketGeneratorRef {
  generateAndDownloadTicket: () => Promise<void>;
}

const TicketGenerator = forwardRef<TicketGeneratorRef, TicketGeneratorProps>(({ ticketData }, ref) => {
  const generateAndDownloadTicket = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Create PDF document with landscape orientation
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Define consistent margins and spacing
       const margin = 15;
       const headerHeight = 45;
       const sectionSpacing = 8;
       const labelWidth = 35;
      
       // Color definitions
       const primaryColor: [number, number, number] = [0, 0, 0]; // Professional blue
       const darkGray: [number, number, number] = [44, 62, 80];
       const lightGray: [number, number, number] = [236, 240, 241];
       const white: [number, number, number] = [255, 255, 255];
       const black: [number, number, number] = [0, 0, 0];
      
      // Set font
      pdf.setFont('helvetica');
      
      // HEADER SECTION
      // Main header background with gradient effect
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Add a subtle accent stripe
      pdf.setFillColor(...darkGray);
      pdf.rect(0, headerHeight - 4, pageWidth, 4, 'F');
      
      // Event title
      pdf.setTextColor(...white);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      
      // Handle long titles by adjusting font size
      const titleWidth = pdf.getTextWidth(ticketData.event.title);
      if (titleWidth > pageWidth - 40) {
        pdf.setFontSize(24);
      }
      if (titleWidth > pageWidth - 40) {
        pdf.setFontSize(20);
      }
      
      pdf.text(ticketData.event.title, pageWidth / 2, 20, { align: 'center' });
      
      // Event subtitle
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('EVENT ADMISSION TICKET', pageWidth / 2, 32, { align: 'center' });
      
      // MAIN CONTENT AREA
      const contentY = headerHeight + margin;
      const contentHeight = pageHeight - headerHeight - (margin * 2) - 15; // Space for footer
      
      // Main content background
      pdf.setFillColor(...lightGray);
      pdf.rect(margin, contentY, pageWidth - (margin * 2), contentHeight, 'F');
      
      // Content border
      pdf.setDrawColor(...darkGray);
      pdf.setLineWidth(1);
      pdf.rect(margin, contentY, pageWidth - (margin * 2), contentHeight);
      
      // Define column dimensions
      const columnWidth = (pageWidth - (margin * 4) - 10) / 2; // 10mm gap between columns
      const leftColumnX = margin + 10;
      const rightColumnX = leftColumnX + columnWidth + 10;
      
       // LEFT COLUMN - Participant & Event Details
      
      // Helper function to create section headers
      const createSectionHeader = (text: string, x: number, y: number, width: number) => {
        pdf.setFillColor(...primaryColor);
        pdf.rect(x, y - 6, width, 10, 'F');
        pdf.setTextColor(...white);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text, x + 5, y);
        return y + 12; // Return next line position
      };
      
      // Helper function to add labeled info
      const addLabeledInfo = (label: string, value: string, x: number, y: number, maxValueWidth: number = 120) => {
        pdf.setTextColor(...darkGray);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label + ':', x, y);
        
        pdf.setTextColor(...black);
        pdf.setFont('helvetica', 'normal');
        
        // Handle long text by wrapping
        const words = value.split(' ');
        let line = '';
        const lines = [];
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = pdf.getTextWidth(testLine);
          
          if (testWidth > maxValueWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);
        
        let lineY = y;
        for (const textLine of lines) {
          pdf.text(textLine, x + labelWidth, lineY);
          lineY += 5;
        }
        
        return lineY + 2; // Return next line position
      };
      
       // Participant Details Section
       let currentY = contentY + 15;
       currentY = createSectionHeader('PARTICIPANT DETAILS', leftColumnX, currentY, columnWidth);
       
       currentY = addLabeledInfo('Full Name', ticketData.participant.name, leftColumnX + 5, currentY);
       currentY = addLabeledInfo('Email Address', ticketData.participant.email, leftColumnX + 5, currentY);
       currentY = addLabeledInfo('Registration ID', ticketData.participant.registrationId, leftColumnX + 5, currentY);
       
       currentY += sectionSpacing;
       
       // Event Details Section
       currentY = createSectionHeader('EVENT DETAILS', leftColumnX, currentY, columnWidth);
      
      // Format date nicely
      const eventDate = new Date(ticketData.event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      currentY = addLabeledInfo('Date', formattedDate, leftColumnX + 5, currentY);
      currentY = addLabeledInfo('Time', formattedTime, leftColumnX + 5, currentY);
      currentY = addLabeledInfo('Venue', ticketData.event.venue, leftColumnX + 5, currentY);
      
      if (ticketData.event.description) {
        addLabeledInfo('Description', ticketData.event.description, leftColumnX + 5, currentY, 100);
      }
      
      // RIGHT COLUMN - QR Code Section
      const qrSectionY = contentY + 15;
      const qrSize = 40;
      const qrX = rightColumnX + (columnWidth - qrSize) / 2;
      let qrCurrentY = qrSectionY;
      
      // QR Section Header
      qrCurrentY = createSectionHeader('CHECK-IN QR CODE', rightColumnX, qrCurrentY, columnWidth);
      qrCurrentY += 10;
      
      // QR Code container with nice styling
      pdf.setFillColor(...white);
      pdf.rect(qrX - 10, qrCurrentY - 10, qrSize + 20, qrSize + 20, 'F');
      
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(2);
      pdf.rect(qrX - 10, qrCurrentY - 10, qrSize + 20, qrSize + 20);
      
      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(1);
      pdf.rect(qrX - 5, qrCurrentY - 5, qrSize + 10, qrSize + 10);
      
      // Add QR code
      const qrCodeImage = `data:image/png;base64,${ticketData.qrCodeData}`;
      pdf.addImage(qrCodeImage, 'PNG', qrX, qrCurrentY, qrSize, qrSize);
      
      // QR Instructions
      const instructionY = qrCurrentY + qrSize + 25;
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Present this QR code for', rightColumnX + columnWidth / 2, instructionY, { align: 'center' });
      pdf.text('instant check-in at the event', rightColumnX + columnWidth / 2, instructionY + 6, { align: 'center' });
      
      // TICKET ID BAR AT BOTTOM
      const ticketBarY = contentY + contentHeight - 25;
      pdf.setFillColor(...darkGray);
      pdf.rect(margin + 10, ticketBarY, pageWidth - (margin * 2) - 20, 15, 'F');
      
      pdf.setTextColor(...white);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TICKET ID: ${ticketData.participant.registrationId}`, pageWidth / 2, ticketBarY + 9, { align: 'center' });
      
      // FOOTER
      const footerY = pageHeight - 10;
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by EvePost ', margin, footerY);
      
      const generatedTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      pdf.text(`Generated: ${generatedTime}`, pageWidth - margin, footerY, { align: 'right' });
      
      // Download the PDF
      const fileName = `${ticketData.event.title.replace(/[^a-z0-9]/gi, '_')}_ticket_${ticketData.participant.registrationId}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Ticket generation failed:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    generateAndDownloadTicket
  }));

  return null;
});

TicketGenerator.displayName = 'TicketGenerator';

export default TicketGenerator;