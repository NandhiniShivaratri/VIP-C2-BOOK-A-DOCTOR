const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure output directories exist
function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Draw a title page for a document
function drawTitlePage(doc, title, phaseName) {
  // Draw primary color header block
  doc.rect(0, 0, 612, 220).fill('#0f172a');
  
  // Title Text
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff').text(title, 50, 80, { width: 512, align: 'left' });
  doc.fontSize(14).font('Helvetica').fillColor('#38bdf8').text(phaseName, 50, 140, { width: 512, align: 'left' });
  
  // Platform details
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('PROJECT PLATFORM:', 50, 260);
  doc.fontSize(12).font('Helvetica').fillColor('#475569').text('MediConnect - Premium MERN Doctor Appointment Platform', 200, 260);
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('REFERENCE PATH:', 50, 290);
  doc.fontSize(12).font('Helvetica').fillColor('#475569').text('VIP-C2-BOOK-A-DOCTOR', 200, 290);
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('DATE OF EXECUTION:', 50, 320);
  doc.fontSize(12).font('Helvetica').fillColor('#475569').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 200, 320);
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('AUTHOR / CREATOR:', 50, 350);
  doc.fontSize(12).font('Helvetica').fillColor('#475569').text('Antigravity AI Engineer & pairing USER', 200, 350);
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text('DOCUMENT STATUS:', 50, 380);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('APPROVED / PRODUCTION-READY', 200, 380);
  
  // Executive Summary border box
  doc.rect(50, 430, 512, 180).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.rect(50, 430, 512, 30).fill('#f8fafc');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('EXECUTIVE OVERVIEW', 65, 440);
  
  const summaryText = 'This phase-wise document outlines the development lifecycle, system structures, and technical specifications of MediConnect. MediConnect is a clinic-agnostic, hospital-grade scheduling ecosystem built utilizing the MERN stack (MongoDB, Express, React, Node.js). It supports secure JWT access/refresh token structures, comprehensive patient calendars, and simulated multi-modal checkout payment gates.';
  doc.fontSize(10).font('Helvetica').fillColor('#475569').text(summaryText, 65, 475, { width: 482, align: 'justify', lineGap: 4 });
  
  doc.addPage();
}

// Add page header / footer / styles helpers
function setupDocEvents(doc, titleText) {
  // No-op to avoid pageAdded recursions
}

function writePageNumberFooters(doc, titleText) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Skip headers and footers on the cover page (first page)
    if (i === range.start) continue;

    // Header
    doc.save();
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b').text(titleText.toUpperCase(), 50, 30, { align: 'left' });
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('MEDICONNECT DOCUMENTATION', 50, 30, { align: 'right' });
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 42).lineTo(562, 42).stroke();
    doc.restore();
    
    // Footer
    doc.save();
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 750).lineTo(562, 750).stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Confidential - Intellectual Property of MediConnect', 50, 760, { align: 'left' });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, 50, 760, { align: 'right' });
    doc.restore();
  }
}

// Draw a styled section header
function drawSectionHeader(doc, title, topOffset) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(title, 50, topOffset);
  doc.strokeColor('#38bdf8').lineWidth(1.5).moveTo(50, topOffset + 18).lineTo(150, topOffset + 18).stroke();
  doc.moveDown(1.5);
}

// Helper to draw clean table
function drawTable(doc, startY, headers, rows, colWidths) {
  doc.save();
  let currentY = startY;
  
  // Headers Background
  doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), 20).fill('#1e293b');
  
  // Header Text
  let currentX = 50;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  headers.forEach((h, index) => {
    doc.text(h, currentX + 5, currentY + 6, { width: colWidths[index] - 10, align: 'left' });
    currentX += colWidths[index];
  });
  
  currentY += 20;
  
  // Rows
  doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
  rows.forEach((row, rIdx) => {
    // Row background stripes
    if (rIdx % 2 === 1) {
      doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f8fafc');
    }
    
    currentX = 50;
    row.forEach((cell, cIdx) => {
      doc.text(cell.toString(), currentX + 5, currentY + 5, { width: colWidths[cIdx] - 10, align: 'left' });
      currentX += colWidths[cIdx];
    });
    
    // Draw border lines
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, currentY + 18).lineTo(50 + colWidths.reduce((a, b) => a + b, 0), currentY + 18).stroke();
    currentY += 18;
  });
  
  doc.restore();
  return currentY;
}

// Draw a diagram panel box
function drawDiagramPanel(doc, title, startY, height) {
  doc.save();
  // Border box
  doc.rect(50, startY, 512, height).strokeColor('#94a3b8').lineWidth(1).dash(4, { space: 4 }).stroke();
  
  // Title ribbon
  doc.rect(51, startY + 1, 510, 20).fill('#f1f5f9');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text(title.toUpperCase() + ' - SYSTEM VISUALIZATION', 65, startY + 7);
  doc.restore();
}

// ----------------------------------------------------
// VECTOR DIAGRAMS DRAWING IMPLEMENTATIONS
// ----------------------------------------------------

// 1. Brainstorming Mind Map
function drawMindMapDiagram(doc, y) {
  const height = 180;
  drawDiagramPanel(doc, 'Ideation Mind Map', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Center Bubble
  doc.roundedRect(226, docY + 50, 160, 40, 5).fill('#0f172a');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff').text('MEDICONNECT SYSTEM', 226, docY + 65, { width: 160, align: 'center' });
  
  // Connectors
  doc.strokeColor('#0284c7').lineWidth(1.5).moveTo(226, docY + 70).lineTo(130, docY + 30).stroke();
  doc.strokeColor('#0284c7').lineWidth(1.5).moveTo(386, docY + 70).lineTo(482, docY + 30).stroke();
  doc.strokeColor('#0284c7').lineWidth(1.5).moveTo(306, docY + 90).lineTo(306, docY + 130).stroke();
  
  // Branch 1: Patient App (Top Left)
  doc.roundedRect(50, docY + 10, 120, 30, 4).fill('#e0f2fe');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text('PATIENT PORTAL', 50, docY + 21, { width: 120, align: 'center' });
  // Features Patient
  doc.fontSize(7.5).font('Helvetica').fillColor('#64748b')
     .text('- Search Specialities', 60, docY + 45)
     .text('- Available Calendar Grid', 60, docY + 55)
     .text('- Multi-modal Checkout', 60, docY + 65);
     
  // Branch 2: Doctor Suite (Top Right)
  doc.roundedRect(442, docY + 10, 120, 30, 4).fill('#dcfce7');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#15803d').text('DOCTOR SUITE', 442, docY + 21, { width: 120, align: 'center' });
  // Features Doctor
  doc.fontSize(7.5).font('Helvetica').fillColor('#64748b')
     .text('- Calendar Slot Toggle', 452, docY + 45)
     .text('- Custom Bio & Languages', 452, docY + 55)
     .text('- Appointments Operations', 452, docY + 65);
     
  // Branch 3: Admin Console (Bottom Center)
  doc.roundedRect(226, docY + 130, 160, 30, 4).fill('#faf5ff');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b21a8').text('ADMIN ANALYTICS CONSOLE', 226, docY + 141, { width: 160, align: 'center' });
  // Features Admin
  doc.fontSize(7.5).font('Helvetica').fillColor('#64748b')
     .text('- Booking Analytics Charts', 396, docY + 135)
     .text('- Specialty Growth Trends', 396, docY + 145)
     .text('- System Doctor Verification', 396, docY + 155);
     
  doc.restore();
}

// 2. Use Case Diagram
function drawUseCaseDiagram(doc, y) {
  const height = 200;
  drawDiagramPanel(doc, 'Functional Use Cases', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Left Actor: Patient
  doc.circle(90, docY + 40, 10).fill('#0f172a');
  doc.strokeColor('#0f172a').lineWidth(1.5)
     .moveTo(90, docY + 50).lineTo(90, docY + 90) // spine
     .moveTo(75, docY + 65).lineTo(105, docY + 65) // arms
     .moveTo(90, docY + 90).lineTo(75, docY + 115) // left leg
     .moveTo(90, docY + 90).lineTo(105, docY + 115) // right leg
     .stroke();
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('Patient Actor', 60, docY + 122, { width: 60, align: 'center' });
  
  // Right Actor: Doctor
  doc.circle(522, docY + 40, 10).fill('#16a34a');
  doc.strokeColor('#16a34a').lineWidth(1.5)
     .moveTo(522, docY + 50).lineTo(522, docY + 90)
     .moveTo(507, docY + 65).lineTo(537, docY + 65)
     .moveTo(522, docY + 90).lineTo(507, docY + 115)
     .moveTo(522, docY + 90).lineTo(537, docY + 115)
     .stroke();
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#16a34a').text('Doctor Actor', 492, docY + 122, { width: 60, align: 'center' });
  
  // Use Case Ovals in Center
  const useCases = [
    { text: 'Browse & Filter Doctors', color: '#e0f2fe', textCol: '#0369a1', y: docY + 10 },
    { text: 'Select Date & Slots', color: '#e0f2fe', textCol: '#0369a1', y: docY + 45 },
    { text: 'Authorize Simulated Payments', color: '#fee2e2', textCol: '#991b1b', y: docY + 80 },
    { text: 'Manage Calendar Availability', color: '#dcfce7', textCol: '#15803d', y: docY + 115 },
    { text: 'View System Analytics Charts', color: '#faf5ff', textCol: '#6b21a8', y: docY + 150 }
  ];
  
  useCases.forEach(uc => {
    doc.roundedRect(196, uc.y, 220, 26, 13).fill(uc.color);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(uc.textCol).text(uc.text, 196, uc.y + 8, { width: 220, align: 'center' });
  });
  
  // Connect Patient to Use Cases
  doc.strokeColor('#94a3b8').lineWidth(1)
     .moveTo(105, docY + 65).lineTo(196, docY + 23)
     .moveTo(105, docY + 65).lineTo(196, docY + 58)
     .moveTo(105, docY + 65).lineTo(196, docY + 93)
     .stroke();
     
  // Connect Doctor to Use Cases
  doc.strokeColor('#94a3b8').lineWidth(1)
     .moveTo(507, docY + 65).lineTo(416, docY + 128)
     .moveTo(507, docY + 65).lineTo(416, docY + 93)
     .stroke();
     
  doc.restore();
}

// 3. Gantt Chart / Timeline
function drawGanttChartDiagram(doc, y) {
  const height = 180;
  drawDiagramPanel(doc, 'Project Gantt Chart Timeline', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Header Columns
  const cols = ['Phase', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  const widths = [160, 50, 50, 50, 50, 50, 50];
  let curX = 60;
  
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b');
  cols.forEach((c, idx) => {
    doc.text(c, curX, docY + 5, { width: widths[idx], align: idx === 0 ? 'left' : 'center' });
    curX += widths[idx];
  });
  
  // Grid Lines
  doc.strokeColor('#cbd5e1').lineWidth(0.5);
  for (let i = 1; i <= 6; i++) {
    doc.moveTo(220 + (i - 1) * 50, docY + 20).lineTo(220 + (i - 1) * 50, docY + 140).stroke();
  }
  doc.moveTo(60, docY + 20).lineTo(520, docY + 20).stroke();
  
  // Timeline Tasks
  const tasks = [
    { name: '1. Setup & JWT Auth Refresh Flow', start: 0, length: 2, color: '#38bdf8' },
    { name: '2. Doctor Details & Calendar Grid', start: 1, length: 2, color: '#60a5fa' },
    { name: '3. Booking Engine & Mock Checkout', start: 2, length: 2, color: '#34d399' },
    { name: '4. Analytics Dashboard & Charts', start: 3, length: 2, color: '#a78bfa' },
    { name: '5. Database Seeding & Scaling logs', start: 4, length: 1.5, color: '#fb7185' },
    { name: '6. Verification & Remote Push', start: 5, length: 1, color: '#e2e8f0' }
  ];
  
  tasks.forEach((t, index) => {
    const rowY = docY + 25 + index * 20;
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text(t.name, 60, rowY + 3, { width: 150 });
    
    // Draw duration bar
    const barX = 220 + t.start * 50;
    const barW = t.length * 50;
    doc.rect(barX, rowY, barW, 12).fill(t.color);
  });
  
  doc.restore();
}

// 4. System Architecture Diagram
function drawSystemArchitectureDiagram(doc, y) {
  const height = 180;
  drawDiagramPanel(doc, 'Client-Server Architecture', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Client Box
  doc.roundedRect(60, docY + 50, 130, 60, 4).fill('#e0f2fe');
  doc.strokeColor('#0284c7').lineWidth(1.5).roundedRect(60, docY + 50, 130, 60, 4).stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0369a1')
     .text('CLIENT LAYER (SPA)', 60, docY + 58, { width: 130, align: 'center' });
  doc.fontSize(8).font('Helvetica').fillColor('#0369a1')
     .text('Vite React, Redux Toolkit', 60, docY + 75, { width: 130, align: 'center' })
     .text('Tailwind, FullCalendar', 60, docY + 87, { width: 130, align: 'center' });
     
  // API requests arrows
  doc.strokeColor('#94a3b8').lineWidth(2).moveTo(195, docY + 70).lineTo(285, docY + 70).stroke();
  // Draw Arrowhead right
  doc.moveTo(280, docY + 66).lineTo(286, docY + 70).lineTo(280, docY + 74).fill('#94a3b8');
  
  // Response arrows
  doc.strokeColor('#94a3b8').lineWidth(2).moveTo(285, docY + 90).lineTo(195, docY + 90).stroke();
  // Draw Arrowhead left
  doc.moveTo(200, docY + 86).lineTo(194, docY + 90).lineTo(200, docY + 94).fill('#94a3b8');
  
  // Text between Client & Server
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748b')
     .text('HTTPS POST/GET (JSON)', 195, docY + 52, { width: 90, align: 'center' })
     .text('JWT Access Headers', 195, docY + 100, { width: 90, align: 'center' });
     
  // Server Box
  doc.roundedRect(290, docY + 50, 130, 60, 4).fill('#dcfce7');
  doc.strokeColor('#15803d').lineWidth(1.5).roundedRect(290, docY + 50, 130, 60, 4).stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#15803d')
     .text('SERVER LAYER (API)', 290, docY + 58, { width: 130, align: 'center' });
  doc.fontSize(8).font('Helvetica').fillColor('#15803d')
     .text('Node.js, Express App', 290, docY + 75, { width: 130, align: 'center' })
     .text('Helmet, CORS, Auth MW', 290, docY + 87, { width: 130, align: 'center' });
     
  // Server to DB arrows
  doc.strokeColor('#94a3b8').lineWidth(2).moveTo(425, docY + 70).lineTo(475, docY + 70).stroke();
  doc.moveTo(470, docY + 66).lineTo(476, docY + 70).lineTo(470, docY + 74).fill('#94a3b8');
  doc.strokeColor('#94a3b8').lineWidth(2).moveTo(475, docY + 90).lineTo(425, docY + 90).stroke();
  doc.moveTo(430, docY + 86).lineTo(424, docY + 90).lineTo(430, docY + 94).fill('#94a3b8');
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#64748b')
     .text('Mongoose ODM', 425, docY + 52, { width: 50, align: 'center' });
     
  // Database Box
  doc.roundedRect(480, docY + 50, 80, 60, 4).fill('#fef3c7');
  doc.strokeColor('#d97706').lineWidth(1.5).roundedRect(480, docY + 50, 80, 60, 4).stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#d97706')
     .text('DATABASE', 480, docY + 58, { width: 80, align: 'center' });
  doc.fontSize(8).font('Helvetica').fillColor('#d97706')
     .text('MongoDB', 480, docY + 78, { width: 80, align: 'center' })
     .text('(JSON Doc)', 480, docY + 88, { width: 80, align: 'center' });
     
  doc.restore();
}

// 5. Database ERD
function drawERDDiagram(doc, y) {
  const height = 230;
  drawDiagramPanel(doc, 'Database Entity-Relationship Diagram', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Table 1: USER Collection
  doc.rect(60, docY + 10, 110, 80).strokeColor('#475569').lineWidth(1).stroke();
  doc.rect(60, docY + 10, 110, 16).fill('#1e293b');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('users', 60, docY + 14, { width: 110, align: 'center' });
  doc.fontSize(7).font('Helvetica').fillColor('#334155')
     .text(' _id (PK) [ObjectId]', 65, docY + 30)
     .text(' name [String]', 65, docY + 40)
     .text(' email [String, Unique]', 65, docY + 50)
     .text(' password [String]', 65, docY + 60)
     .text(' role ["patient","doctor","admin"]', 65, docY + 70);
     
  // Table 2: DOCTOR Collection
  doc.rect(60, docY + 110, 110, 90).strokeColor('#15803d').lineWidth(1).stroke();
  doc.rect(60, docY + 110, 110, 16).fill('#15803d');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('doctors', 60, docY + 114, { width: 110, align: 'center' });
  doc.fontSize(7).font('Helvetica').fillColor('#334155')
     .text(' _id (PK) [ObjectId]', 65, docY + 130)
     .text(' userId (FK) [Ref: User]', 65, docY + 140)
     .text(' specialization [String]', 65, docY + 150)
     .text(' consultationFee [Number]', 65, docY + 160)
     .text(' about [String]', 65, docY + 170)
     .text(' rating (avg) [Number]', 65, docY + 180);
     
  // Table 3: APPOINTMENT Collection
  doc.rect(260, docY + 50, 120, 100).strokeColor('#0284c7').lineWidth(1).stroke();
  doc.rect(260, docY + 50, 120, 16).fill('#0284c7');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('appointments', 260, docY + 54, { width: 120, align: 'center' });
  doc.fontSize(7).font('Helvetica').fillColor('#334155')
     .text(' _id (PK) [ObjectId]', 265, docY + 70)
     .text(' patientId (FK) [Ref: User]', 265, docY + 80)
     .text(' doctorId (FK) [Ref: Doctor]', 265, docY + 90)
     .text(' doctorName [String]', 265, docY + 100)
     .text(' date [String]', 265, docY + 110)
     .text(' time [String]', 265, docY + 120)
     .text(' consultationFee [Number]', 265, docY + 130)
     .text(' status [String]', 265, docY + 140);
     
  // Table 4: PAYMENT Collection
  doc.rect(440, docY + 10, 110, 80).strokeColor('#d97706').lineWidth(1).stroke();
  doc.rect(440, docY + 10, 110, 16).fill('#d97706');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('payments', 440, docY + 14, { width: 110, align: 'center' });
  doc.fontSize(7).font('Helvetica').fillColor('#334155')
     .text(' _id (PK) [ObjectId]', 445, docY + 30)
     .text(' appointmentId (FK)', 445, docY + 40)
     .text(' amount [Number]', 445, docY + 50)
     .text(' paymentMethod [String]', 445, docY + 60)
     .text(' status ["success","failed"]', 445, docY + 70);

  // Table 5: REVIEW Collection
  doc.rect(440, docY + 110, 110, 80).strokeColor('#7c3aed').lineWidth(1).stroke();
  doc.rect(440, docY + 110, 110, 16).fill('#7c3aed');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('reviews', 440, docY + 114, { width: 110, align: 'center' });
  doc.fontSize(7).font('Helvetica').fillColor('#334155')
     .text(' _id (PK) [ObjectId]', 445, docY + 130)
     .text(' doctorId (FK) [Ref: Doctor]', 445, docY + 140)
     .text(' patientId (FK) [Ref: User]', 445, docY + 150)
     .text(' rating [Number]', 445, docY + 160)
     .text(' comment [String]', 445, docY + 170);

  // Relationships connector lines
  doc.strokeColor('#94a3b8').lineWidth(1);
  // User -> Doctor (userId)
  doc.moveTo(115, docY + 90).lineTo(115, docY + 110).stroke();
  // User -> Appointment
  doc.moveTo(170, docY + 35).lineTo(220, docY + 35).lineTo(220, docY + 75).lineTo(260, docY + 75).stroke();
  // Doctor -> Appointment
  doc.moveTo(170, docY + 145).lineTo(220, docY + 145).lineTo(220, docY + 105).lineTo(260, docY + 105).stroke();
  // Appointment -> Payment
  doc.moveTo(380, docY + 80).lineTo(410, docY + 80).lineTo(410, docY + 35).lineTo(440, docY + 35).stroke();
  // Doctor -> Review
  doc.moveTo(170, docY + 170).lineTo(240, docY + 170).lineTo(240, docY + 190).lineTo(440, docY + 190).stroke();
  
  doc.restore();
}

// 6. Booking Flowchart
function drawBookingFlowchart(doc, y) {
  const height = 180;
  drawDiagramPanel(doc, 'Patient Booking & Payments Journey', y, height);
  
  const docY = y + 25;
  doc.save();
  
  // Start Bubble
  doc.roundedRect(60, docY + 20, 50, 25, 12).fill('#475569');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff').text('START', 60, docY + 28, { width: 50, align: 'center' });
  
  // Arrow to search
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(110, docY + 32).lineTo(140, docY + 32).stroke();
  doc.moveTo(135, docY + 29).lineTo(141, docY + 32).lineTo(135, docY + 35).fill('#94a3b8');
  
  // 1. Browse / Filter
  doc.rect(140, docY + 15, 80, 35).strokeColor('#0284c7').lineWidth(1).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0369a1').text('Browse / Search\nDoctors Specialties', 140, docY + 22, { width: 80, align: 'center' });
  
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(220, docY + 32).lineTo(250, docY + 32).stroke();
  doc.moveTo(245, docY + 29).lineTo(251, docY + 32).lineTo(245, docY + 35).fill('#94a3b8');
  
  // 2. Profile slots selection
  doc.rect(250, docY + 15, 80, 35).strokeColor('#0284c7').lineWidth(1).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0369a1').text('Select Doctor &\nChoose Active Slot', 250, docY + 22, { width: 80, align: 'center' });
  
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(330, docY + 32).lineTo(360, docY + 32).stroke();
  doc.moveTo(355, docY + 29).lineTo(361, docY + 32).lineTo(355, docY + 35).fill('#94a3b8');
  
  // 3. Checkout Gateway
  doc.rect(360, docY + 15, 80, 35).strokeColor('#d97706').lineWidth(1).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#b45309').text('Checkout Modal:\nSimulated Payment', 360, docY + 22, { width: 80, align: 'center' });
  
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(400, docY + 50).lineTo(400, docY + 80).stroke();
  doc.moveTo(397, docY + 75).lineTo(400, docY + 81).lineTo(403, docY + 75).fill('#94a3b8');
  
  // Decision node (Diamond)
  doc.polygon([400, docY + 80], [440, docY + 100], [400, docY + 120], [360, docY + 100]).strokeColor('#b91c1c').lineWidth(1).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#b91c1c').text('Authorize?', 360, docY + 97, { width: 80, align: 'center' });
  
  // YES branch (down)
  doc.strokeColor('#15803d').lineWidth(1.5).moveTo(400, docY + 120).lineTo(400, docY + 140).stroke();
  doc.moveTo(397, docY + 135).lineTo(400, docY + 141).lineTo(403, docY + 135).fill('#15803d');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#15803d').text('YES', 405, docY + 125);
  
  // Success Card
  doc.rect(360, docY + 140, 80, 30).strokeColor('#15803d').lineWidth(1).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#15803d').text('Success page\nRedirect Dashboard', 360, docY + 146, { width: 80, align: 'center' });
  
  // NO branch (right)
  doc.strokeColor('#b91c1c').lineWidth(1.5).moveTo(440, docY + 100).lineTo(480, docY + 100).lineTo(480, docY + 32).lineTo(440, docY + 32).stroke();
  doc.moveTo(445, docY + 29).lineTo(439, docY + 32).lineTo(445, docY + 35).fill('#b91c1c');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#b91c1c').text('NO (Retry)', 445, docY + 105);
  
  // Dashboard Verify (End)
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(360, docY + 155).lineTo(300, docY + 155).stroke();
  doc.moveTo(305, docY + 152).lineTo(299, docY + 155).lineTo(305, docY + 158).fill('#94a3b8');
  
  doc.rect(210, docY + 140, 90, 30).strokeColor('#475569').lineWidth(1).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#475569').text('Verify Appointment in\nMy Appointments Grid', 210, docY + 146, { width: 90, align: 'center' });
  
  doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(210, docY + 155).lineTo(150, docY + 155).stroke();
  doc.moveTo(155, docY + 152).lineTo(149, docY + 155).lineTo(155, docY + 158).fill('#94a3b8');
  
  doc.roundedRect(100, docY + 142, 50, 25, 12).fill('#475569');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff').text('END', 100, docY + 150, { width: 50, align: 'center' });
  
  doc.restore();
}

// ----------------------------------------------------
// INDIVIDUAL PHASE DOCUMENT BUILDERS
// ----------------------------------------------------

// 1. Brainstorming Phase Document Builder
function buildBrainstormingPDF() {
  const outputPath = 'MERN Phase Wise/Phase Wise Templets/Brainstorming & Ideation Phase/Brainstorming & Ideation Phase.pdf';
  return buildDocument(outputPath, 'BRAINSTORMING & IDEATION PHASE', 'Phase 1 - Conception', (doc) => {
    drawTitlePage(doc, 'Brainstorming & Ideation Phase Document', 'Phase 1: Project Conception & Feature Scoping');
    
    drawSectionHeader(doc, '1. Project Core Vision', 70);
    const p1 = 'MediConnect is engineered as a next-generation full-stack healthcare scheduler designed to modernize patient-doctor interactions. Drawing inspiration from top-tier platforms like Practo and Zocdoc, the system is designed to remove friction from the scheduling funnel. It establishes a direct, secure interface between clinics, multi-specialty doctors, and patients seeking consultations.';
    const p2 = 'In this initial ideation phase, we focused heavily on resolving key system bottlenecks: eliminating administrative double-booking, ensuring secure access levels for patient charts, supporting robust authentication mechanisms, and creating dynamic calendars that reflect real-time shifts. The application is planned to scale seamlessly by separating client-side logic from REST API endpoints, supported by a scalable, schema-validated NoSQL backend.';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(p1, 50, 110, { width: 512, align: 'justify', lineGap: 3 });
    doc.moveDown();
    doc.text(p2, 50, doc.y, { width: 512, align: 'justify', lineGap: 3 });
    
    drawSectionHeader(doc, '2. Feature Scoping Matrix', doc.y + 20);
    const p3 = 'During the collaborative ideation sessions, system features were categorized based on user actors: Patients, Doctors, and Platform Administrators. We prioritized core functionalities (V1) versus future enhancements (V2) to deliver a robust MVP with premium aesthetics and production-grade features.';
    doc.text(p3, 50, doc.y, { width: 512, align: 'justify', lineGap: 3 });
    
    doc.moveDown();
    const headers = ['User Actor', 'V1 MVP Scope (Core Features)', 'V2 Expansion Scope (Future Goals)'];
    const rows = [
      ['Patient', 'Registration, Profile, Filter by specialization, Calendar slot checkout, Simulated UPI/Card payment.', 'Telemedicine video calls, Prescription vault, Insurance verification.'],
      ['Doctor', 'Profile setup, Consultation fee setup, Weekly schedule mapping, Manage bookings (Confirm/Cancel).', 'E-Prescriptions generator, Multi-clinic sync, AI-driven slot suggestions.'],
      ['Admin', 'Specialty taxonomy, System analytics (Bookings, Top Doctors, Specialty popularity charts).', 'Auto-invoicing, Audit logs, Multi-tenant clinic panels management.']
    ];
    const newY = drawTable(doc, doc.y + 10, headers, rows, [70, 220, 222]);
    
    doc.addPage();
    drawSectionHeader(doc, '3. Brainstorming Mind Map', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The following mind map visualizes the core architecture of MediConnect, breaking down user interfaces into modular functional components linked to the database schema.', 50, 100, { width: 512 });
    
    drawMindMapDiagram(doc, 130);
  });
}

// 2. Requirement Analysis Document Builder
function buildRequirementPDF() {
  const outputPath = 'MERN Phase Wise/Phase Wise Templets/Requirement Analysis/Requirement Analysis.pdf';
  return buildDocument(outputPath, 'REQUIREMENT ANALYSIS PHASE', 'Phase 2 - Specifications', (doc) => {
    drawTitlePage(doc, 'Requirement Analysis Document', 'Phase 2: Functional & Non-Functional Specifications');
    
    drawSectionHeader(doc, '1. Functional Requirements (FR)', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155')
       .text('Functional requirements define the core operational features that the MediConnect platform must perform.', 50, 110, { width: 512 });
    
    doc.moveDown();
    const frRows = [
      ['FR-101', 'User Authentication', 'Secure login/signup with email confirmation. Implement access and refresh JWT token rotations.'],
      ['FR-102', 'Doctor Search & Filtering', 'Ability to search doctors by name, specialization, and average rating.'],
      ['FR-103', 'Calendar Booking Grid', 'Interactive FullCalendar/Shift grid displaying active available slots for patient selection.'],
      ['FR-104', 'Simulated Checkout', 'Patient checkout flow supporting UPI scan, simulated credit card authentication, and cash payments.'],
      ['FR-105', 'Appointments Tracker', 'A Patient Appointments panel showing doctor name, fee, date/time, and real-time status.'],
      ['FR-106', 'Doctor Dashboard Panel', 'Allow doctors to toggle slot availability, cancel appointments, and view review feedback.'],
      ['FR-107', 'Admin Dashboard Charts', 'Graphical rendering of monthly registrations, specialty distribution, and platform booking volumes.']
    ];
    let nextY = drawTable(doc, doc.y + 5, ['Req ID', 'Feature Domain', 'Detailed Specification / Criteria'], frRows, [50, 120, 342]);
    
    drawSectionHeader(doc, '2. Non-Functional Requirements (NFR)', nextY + 25);
    const nfrText = 'Non-functional requirements describe system quality attributes, security measures, and engineering constraints. MediConnect enforces rigorous standards across these dimensions:';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(nfrText, 50, doc.y, { width: 512, align: 'justify', lineGap: 3 });
    
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1e293b');
    doc.text('\n• Security & Encryption:', 50, doc.y)
       .font('Helvetica').fillColor('#475569')
       .text(' Passwords must be hashed using bcryptjs (rounds=10) prior to storage. API endpoints are protected using Helmet headers and strict CORS configuration. Rate limiting restricts requests to 100 per 15 minutes locally to prevent denial-of-service.', 50, doc.y)
       .font('Helvetica-Bold').fillColor('#1e293b')
       .text('\n• Performance & Concurrency:', 50, doc.y)
       .font('Helvetica').fillColor('#475569')
       .text(' Node.js server executes asynchronous request parsing. MongoDB models are structured to minimize aggregate lookups, storing critical fields like doctor details directly inside the appointment document.', 50, doc.y)
       .font('Helvetica-Bold').fillColor('#1e293b')
       .text('\n• Responsive Layout & Compatibility:', 50, doc.y)
       .font('Helvetica').fillColor('#475569')
       .text(' Frontend React layout is built with Tailwind CSS, supporting mobile, tablet, and desktop display orientations with flexible flex/grid elements.', 50, doc.y);
       
    doc.addPage();
    drawSectionHeader(doc, '3. System Use Cases', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The diagram below maps user roles to functional endpoints, demonstrating actor permissions within the platform.', 50, 100, { width: 512 });
    
    drawUseCaseDiagram(doc, 130);
  });
}

// 3. Project Planning Phase Document Builder
function buildPlanningPDF() {
  const outputPath = 'MERN Phase Wise/Phase Wise Templets/Project Planning Phase/Project Planning Phase.pdf';
  return buildDocument(outputPath, 'PROJECT PLANNING PHASE', 'Phase 3 - Schedule & Scope', (doc) => {
    drawTitlePage(doc, 'Project Planning Phase Document', 'Phase 3: Work Breakdown Structure & Risk Assessments');
    
    drawSectionHeader(doc, '1. Project Schedule Overview', 70);
    const p1 = 'To build a robust, premium full-stack platform, we adopted an agile approach structured across six development milestones. Each milestone represents a core functional domain, ending with a gate review. Development progresses from schema definition to user-facing dashboards, concluding with security hardening and repository deployment.';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(p1, 50, 110, { width: 512, align: 'justify', lineGap: 3 });
    
    doc.moveDown();
    const rows = [
      ['Milestone 1', 'Database Models & Token Auth', 'Define Mongoose schemas. Set up JWT access and refresh token authentication middleware.', 'Week 1'],
      ['Milestone 2', 'Doctor Details & Search Logic', 'Develop doctor filter endpoints. Build client-side specialization directories.', 'Week 2'],
      ['Milestone 3', 'Calendar Engine & Checkouts', 'Integrate interactive booking calendar. Design UPI and simulated card payment checkout overlay.', 'Week 3'],
      ['Milestone 4', 'Dashboards & Analytics Charts', 'Build Patient/Doctor lists. Implement Admin charts for monthly appointments & patient counts.', 'Week 4'],
      ['Milestone 5', 'Security Hardening & Seeding', 'Incorporate Helmet, CORS middleware, and seed MongoDB with 50+ doctors and 100+ bookings.', 'Week 5'],
      ['Milestone 6', 'QA, Testing & GitHub Push', 'Perform end-to-end user manual verification. Initialize Git and push all codebase files.', 'Week 6']
    ];
    let nextY = drawTable(doc, doc.y + 5, ['Phase', 'Focus Area', 'Milestone Deliverables', 'Timeline'], rows, [65, 110, 277, 60]);
    
    drawSectionHeader(doc, '2. Gantt Chart Timeline', nextY + 25);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The timeline below maps each milestone to its allocated development weeks, illustrating parallel task execution.', 50, doc.y, { width: 512 });
    
    drawGanttChartDiagram(doc, doc.y + 10);
    
    doc.addPage();
    drawSectionHeader(doc, '3. Risk Assessment & Mitigation Matrix', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The project planning phase analyzed potential operational risks and outlined automated mitigation solutions.', 50, 100, { width: 512 });
    
    doc.moveDown();
    const riskHeaders = ['Risk Description', 'Impact', 'Planned Mitigation Strategy'];
    const riskRows = [
      ['Double-Booking during high concurrent booking attempts', 'High', 'Implement backend validation during checkout: verify slot status is still "available" in MongoDB before charging simulated transactions.'],
      ['Brute force login attacks on backend auth controllers', 'Medium', 'Configure express-rate-limit middleware restricting each IP address to 100 requests per 15 minutes.'],
      ['Sensitive config secrets leaked to public repository', 'High', 'Add .env variables to root Git ignore file. Create a .env.example template for development setup.'],
      ['In-memory database reset losing user changes', 'Medium', 'Develop automated seed function that executes on server start, populating a rich analytics dataset immediately.']
    ];
    drawTable(doc, doc.y + 10, riskHeaders, riskRows, [140, 50, 322]);
  });
}

// 4. Project Design Phase (Proposed Solution) Document Builder
function buildDesignPDF() {
  const outputPath = 'MERN Phase Wise/Phase Wise Templets/Project Design Phase/Proposed Solution/Proposed Solution Template.pdf';
  return buildDocument(outputPath, 'PROJECT DESIGN PHASE', 'Phase 4 - Proposed Solution', (doc) => {
    drawTitlePage(doc, 'Proposed Solution Template', 'Phase 4: Architecture, Schemas & Database Entity-Relationships');
    
    drawSectionHeader(doc, '1. System Architecture', 70);
    const p1 = 'MediConnect is architected as a Client-Server decoupled application leveraging the MERN Stack. The frontend operates as a Single Page Application (SPA) compiled via Vite, using Redux Toolkit for centralized user state and Axios for secure backend communications. The backend is a stateless RESTful API utilizing Express.js running on Node.js, storing state in MongoDB using the Mongoose ODM framework.';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(p1, 50, 110, { width: 512, align: 'justify', lineGap: 3 });
    
    drawSystemArchitectureDiagram(doc, doc.y + 20);
    
    doc.addPage();
    drawSectionHeader(doc, '2. Database Schema Details', 70);
    const p2 = 'The system utilizes five collections in MongoDB. To ensure referential integrity while retaining NoSQL performance, schemas leverage Mongoose references (`ref`), supplemented by explicit denormalization for fields that are frequently read but rarely updated (like saving doctorSpecialization and doctorName directly inside Appointment documents to speed up patient search layouts).';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(p2, 50, 100, { width: 512, align: 'justify', lineGap: 3 });
    
    drawERDDiagram(doc, doc.y + 15);
  });
}

// 5. Project Development Document Builder
function buildDevelopmentPDF() {
  const outputPath = 'MERN Phase Wise/Phase Wise Templets/Project Developement/Project Developement.pdf';
  return buildDocument(outputPath, 'PROJECT DEVELOPMENT PHASE', 'Phase 5 - Core Engineering', (doc) => {
    drawTitlePage(doc, 'Project Development Document', 'Phase 5: Technical Setup, Folder Structures & Coding Guidelines');
    
    drawSectionHeader(doc, '1. Directory Structure Mapping', 70);
    const introText = 'MediConnect segregates frontend and backend packages to decouple dependencies and optimize build sizes. The following structural map represents the primary codebase folders:';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(introText, 50, 110, { width: 512, align: 'justify' });
    
    doc.moveDown();
    const structRows = [
      ['backend/config', 'Contains db.js database connection setup and seed.js data seeding scripts.'],
      ['backend/controllers', 'Request controllers handling auth, appointment processing, and reviews.'],
      ['backend/middleware', 'Custom middleware including authentication validation and error handlers.'],
      ['backend/models', 'Mongoose schemas defining User, Doctor, Appointment, Review, and Payments.'],
      ['backend/routes', 'API endpoint routers mapped to respective controller methods.'],
      ['frontend/src/components', 'Reusable design elements (navigation bars, inputs, card components).'],
      ['frontend/src/pages', 'Core views: Home, SearchDoctors, DoctorDetails, Patient/Doctor dashboards.'],
      ['frontend/src/redux', 'Global Redux Toolkit slice managers handles user login status and auth tokens.']
    ];
    let nextY = drawTable(doc, doc.y + 5, ['Directory Path', 'Functional Purpose / Description'], structRows, [150, 362]);
    
    drawSectionHeader(doc, '2. Coding Standards & Guidelines', nextY + 25);
    const rules = [
      '• Controller-Route Separation: Route files must only define routing paths and middleware associations; all operational request handling must reside in controller scripts.',
      '• Token Authentication: All client requests to private routes must inject the Bearer JWT access token in authorization headers. Token refreshes are triggered on access expiry.',
      '• Async-Await Pattern: All database operations must utilize async-await structures with enclosed try-catch exception parsing for optimal error reporting.',
      '• Component Decoupling: UI modules must remain stateless where possible, accepting callback props for actions to encourage reusability.'
    ];
    doc.fontSize(9.5).font('Helvetica').fillColor('#475569');
    rules.forEach(r => {
      doc.text(r, 50, doc.y, { width: 512, lineGap: 4 });
      doc.moveDown(0.5);
    });
    
    doc.addPage();
    drawSectionHeader(doc, '3. Development & Build Verification Flow', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The workflow below represents the automated code verification lifecycle, from initial coding in local sandbox to production-ready deployments.', 50, 100, { width: 512 });
    
    // Draw a workflow box
    const devY = 130;
    drawDiagramPanel(doc, 'Verification Lifecycle', devY, 180);
    
    const docY = devY + 25;
    doc.save();
    
    const steps = [
      { text: '1. Local Sandbox Coding', x: 60, color: '#f1f5f9' },
      { text: '2. Unit Checks / ESLint', x: 220, color: '#f1f5f9' },
      { text: '3. DB Seeding Test', x: 380, color: '#f1f5f9' },
      { text: '4. Production Build Check', x: 140, y: docY + 110, color: '#e0f2fe' },
      { text: '5. Commit & Push Remote', x: 300, y: docY + 110, color: '#dcfce7' }
    ];
    
    // Draw top row boxes
    steps.forEach((s, idx) => {
      const topRow = idx < 3;
      const bX = s.x;
      const bY = topRow ? docY + 20 : s.y;
      const col = topRow ? '#475569' : (idx === 3 ? '#0369a1' : '#15803d');
      doc.roundedRect(bX, bY, 110, 30, 4).fill(s.color);
      doc.strokeColor(col).lineWidth(1).roundedRect(bX, bY, 110, 30, 4).stroke();
      doc.fontSize(8).font('Helvetica-Bold').fillColor(col).text(s.text, bX, bY + 11, { width: 110, align: 'center' });
      
      // Connectors
      if (idx === 0) {
        doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(170, docY + 35).lineTo(220, docY + 35).stroke();
        doc.moveTo(215, docY + 32).lineTo(221, docY + 35).lineTo(215, docY + 38).fill('#94a3b8');
      } else if (idx === 1) {
        doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(330, docY + 35).lineTo(380, docY + 35).stroke();
        doc.moveTo(375, docY + 32).lineTo(381, docY + 35).lineTo(375, docY + 38).fill('#94a3b8');
      } else if (idx === 2) {
        // Line down to row 2
        doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(435, docY + 50).lineTo(435, docY + 90).lineTo(250, docY + 90).lineTo(250, docY + 110).stroke();
        doc.moveTo(247, docY + 105).lineTo(250, docY + 111).lineTo(253, docY + 105).fill('#94a3b8');
      } else if (idx === 3) {
        // Connect to final push
        doc.strokeColor('#94a3b8').lineWidth(1.5).moveTo(250, docY + 125).lineTo(300, docY + 125).stroke();
        doc.moveTo(295, docY + 122).lineTo(301, docY + 125).lineTo(295, docY + 128).fill('#94a3b8');
      }
    });
    
    doc.restore();
  });
}

// 6. Project Documentation (FSD) Document Builder
function buildFsdPDF() {
  const outputPath = 'MERN Phase Wise/Project Documentation/FSD Documentation Format.pdf';
  return buildDocument(outputPath, 'FUNCTIONAL SPECIFICATION DOCUMENT', 'Functional Specs & Manual', (doc) => {
    drawTitlePage(doc, 'Functional Specification Document (FSD)', 'System User Manual, Workflows & Interactive Flows');
    
    drawSectionHeader(doc, '1. Executive Functional Summary', 70);
    const p1 = 'MediConnect is engineered to serve three distinct system profiles: Patients, Doctors, and Platform Administrators. It provides a secure, clinic-agnostic layout for appointment booking. The system is designed to provide immediate scheduling confirmation, eliminate double-booking via real-time database validation, and process secure simulated transactions.';
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(p1, 50, 110, { width: 512, align: 'justify', lineGap: 3 });
    
    drawSectionHeader(doc, '2. Detailed UI Modules Specifications', doc.y + 15);
    const p2 = 'Each portal provides access to specific screens designed with premium dark-mode accent features, responsiveness, and clear indicators:';
    doc.text(p2, 50, doc.y, { width: 512, align: 'justify', lineGap: 3 });
    
    doc.moveDown();
    const specRows = [
      ['Dashboard', 'Patient Portal features', 'View active bookings in list cards with Doctor photo, name, fee, date/time, and appointment status.'],
      ['Search Grid', 'Patient search UI', 'Filter doctors by specialty directories (Dentist, Neurologist, General Medicine) or specific search queries.'],
      ['Checkout Modal', 'Payment checkout', 'A multi-mode panel showing Card entries, UPI scan simulation, Wallet points, and Cash on Appointment.'],
      ['Calendar Shift', 'Doctor Panel schedules', 'Displays the doctor\'s active appointments in a calendar view, supporting cancellation operations.'],
      ['Analytics Charts', 'Admin Console views', 'Render dynamic charts showing Specialty popularity, Monthly booking stats, and Patient registrations.']
    ];
    let nextY = drawTable(doc, doc.y + 5, ['UI Screen', 'Target Portal', 'Functional Features & Indicators'], specRows, [90, 110, 312]);
    
    doc.addPage();
    drawSectionHeader(doc, '3. End-to-End Booking Flowchart', 70);
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text('The flowchart below outlines the patient journey from searching for specialized medical experts to completing simulated booking checkout, resulting in dashboard updates.', 50, 100, { width: 512 });
    
    drawBookingFlowchart(doc, 130);
  });
}

// ----------------------------------------------------
// MAIN WRITING METHOD
// ----------------------------------------------------
function buildDocument(outputPath, title, author, contentFunc) {
  ensureDir(outputPath);
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);
  
  // Custom document styling
  setupDocEvents(doc, title);
  
  contentFunc(doc);
  
  // Write the page number footers
  writePageNumberFooters(doc, title);
  
  doc.end();
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`Successfully generated PDF: ${outputPath}`);
      resolve();
    });
    writeStream.on('error', (err) => {
      console.error(`Error writing PDF: ${outputPath}`, err);
      reject(err);
    });
  });
}

// Run all builders
async function run() {
  console.log("Starting PDF generation for MediConnect project...");
  try {
    await buildBrainstormingPDF();
    await buildRequirementPDF();
    await buildPlanningPDF();
    await buildDesignPDF();
    await buildDevelopmentPDF();
    await buildFsdPDF();
    console.log("All six PDFs generated successfully!");
  } catch (error) {
    console.error("Failed to generate PDFs", error);
    process.exit(1);
  }
}

run();
