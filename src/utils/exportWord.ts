import {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Packer, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData, ResumeModule, ExperienceItem, EducationItem, ProjectItem, SummaryItem, CustomItem } from '../types/resume';
import { sortItemsByDateDesc } from './sortItems';
import { formatDateRange } from './dateRange';

function createSectionTitle(title: string): Paragraph {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    border: {
      bottom: {
        color: '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
  });
}

function renderModule(module: ResumeModule): Paragraph[] {
  const children: Paragraph[] = [];
  children.push(createSectionTitle(module.title));

  switch (module.type) {
    case 'experience':
      module.items.forEach((item) => {
        const exp = item as ExperienceItem;
        const range = formatDateRange(exp.startDate, exp.endDate);
        const headRuns: TextRun[] = [new TextRun({ text: exp.company, bold: true, size: 22 })];
        if (range) headRuns.push(new TextRun({ text: `  ${range}`, size: 20, color: '666666' }));
        children.push(
          new Paragraph({
            children: headRuns,
            spacing: { before: 100, after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: exp.position, italics: true, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: exp.description, size: 22 })],
            spacing: { after: 120 },
          })
        );
      });
      break;

    case 'education':
      module.items.forEach((item) => {
        const edu = item as EducationItem;
        const range = formatDateRange(edu.startDate, edu.endDate);
        const headRuns: TextRun[] = [new TextRun({ text: edu.school, bold: true, size: 22 })];
        if (range) headRuns.push(new TextRun({ text: `  ${range}`, size: 20, color: '666666' }));
        children.push(
          new Paragraph({
            children: headRuns,
            spacing: { before: 100, after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `${edu.degree} · ${edu.field}`, size: 22 })],
            spacing: { after: 60 },
          })
        );
        if (edu.description) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: edu.description, size: 22 })],
              spacing: { after: 120 },
            })
          );
        }
      });
      break;

    case 'projects':
      module.items.forEach((item) => {
        const proj = item as ProjectItem;
        const range = formatDateRange(proj.startDate, proj.endDate);
        const headRuns: TextRun[] = [new TextRun({ text: proj.name, bold: true, size: 22 })];
        if (range) headRuns.push(new TextRun({ text: `  ${range}`, size: 20, color: '666666' }));
        children.push(
          new Paragraph({
            children: headRuns,
            spacing: { before: 100, after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proj.role, italics: true, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 22 })],
            spacing: { after: 120 },
          })
        );
      });
      break;

    case 'summary':
      module.items.forEach((item) => {
        const sum = item as SummaryItem;
        if (!sum.content) return;
        // 按空行拆段，每段保留行内换行（Word 用 \n 不会自动换行，需要 break）
        sum.content.split(/\n\s*\n/).forEach((para) => {
          if (!para.trim()) return;
          const lines = para.split('\n');
          children.push(
            new Paragraph({
              children: lines.flatMap((line, i) => {
                const run = new TextRun({ text: line, size: 22, break: i === 0 ? undefined : 1 });
                return [run];
              }),
              spacing: { after: 120 },
            })
          );
        });
      });
      break;

    case 'custom':
      module.items.forEach((item) => {
        const custom = item as CustomItem;
        const range = formatDateRange(custom.startDate, custom.endDate);
        const headRuns: TextRun[] = [new TextRun({ text: custom.title, bold: true, size: 22 })];
        if (range) headRuns.push(new TextRun({ text: `  ${range}`, size: 20, color: '666666' }));
        children.push(
          new Paragraph({
            children: headRuns,
            spacing: { before: 100, after: 40 },
          })
        );
        if (custom.subtitle) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: custom.subtitle, italics: true, size: 22 })],
              spacing: { after: 60 },
            })
          );
        }
        children.push(
          new Paragraph({
            children: [new TextRun({ text: custom.description, size: 22 })],
            spacing: { after: 120 },
          })
        );
      });
      break;
  }

  return children;
}

export async function exportToWord(data: ResumeData, filename: string = '简历.docx') {
  const { personalInfo, modules } = data;

  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      text: personalInfo.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [new TextRun({ text: personalInfo.title, bold: true, size: 24 })],
      spacing: { after: 120 },
    })
  );

  // Contact info
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    ...(personalInfo.customFields ?? [])
      .filter((f) => f.value)
      .map((f) => (f.label ? `${f.label}: ${f.value}` : f.value)),
  ].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join('  |  '), size: 20, color: '666666' })],
        spacing: { after: 200 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
  }

  // Modules（应用排序：开启 sortByDateDesc 的模块 items 按 endDate desc → startDate desc）
  const displayModules = modules.map((module) =>
    module.sortByDateDesc ? { ...module, items: sortItemsByDateDesc(module.items, module.type) } : module
  );
  displayModules.forEach((module) => {
    if (module.items.length > 0) {
      children.push(...renderModule(module));
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
