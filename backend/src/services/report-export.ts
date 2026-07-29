import type { Summary } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';

export function buildPdfBuffer(summary: Summary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(summary.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Date : ${summary.meetingDate.toISOString().slice(0, 10)}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12).text('Participants', { continued: false });
    doc.fontSize(10).text(summary.participantsText || '—');
    doc.moveDown(1);

    doc.fontSize(12).text('Résumé de la discussion', { continued: false });
    doc.fontSize(10).text(summary.discussionSummary || '—');
    doc.moveDown(1);

    doc.fontSize(12).text('Décisions clés', { continued: false });
    doc.fontSize(10).text(summary.keyDecisions || '—');
    doc.moveDown(1);

    doc.fontSize(12).text('Actions', { continued: false });
    doc.fontSize(10).text(summary.actionItems || '—');
    doc.moveDown(1);

    doc.fontSize(12).text('Responsables', { continued: false });
    doc.fontSize(10).text(summary.responsiblePersons || '—');
    doc.moveDown(1);

    doc.fontSize(12).text('Prochaines étapes', { continued: false });
    doc.fontSize(10).text(summary.nextSteps || '—');

    doc.end();
  });
}

export async function buildDocxBuffer(summary: Summary): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: summary.title, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: `Date : ${summary.meetingDate.toISOString().slice(0, 10)}`, size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Participants', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.participantsText || '—', size: 22 })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Résumé de la discussion', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.discussionSummary || '—', size: 22 })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Décisions clés', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.keyDecisions || '—', size: 22 })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Actions', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.actionItems || '—', size: 22 })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Responsables', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.responsiblePersons || '—', size: 22 })] }),
          new Paragraph({ text: '' }),
          new Paragraph({ children: [new TextRun({ text: 'Prochaines étapes', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: summary.nextSteps || '—', size: 22 })] }),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}
