import {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Packer, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData, ResumeModule, ModuleType, ExperienceItem, EducationItem, ProjectItem, SkillItem, CustomItem } from '../types/resume';

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
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.company, bold: true, size: 22 }),
              new TextRun({ text: `  ${exp.startDate} - ${exp.endDate}`, size: 20, color: '666666' }),
            ],
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
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school, bold: true, size: 22 }),
              new TextRun({ text: `  ${edu.startDate} - ${edu.endDate}`, size: 20, color: '666666' }),
            ],
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
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name, bold: true, size: 22 }),
              new TextRun({ text: `  ${proj.startDate} - ${proj.endDate}`, size: 20, color: '666666' }),
            ],
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

    case 'skills':
      module.items.forEach((item) => {
        const skill = item as SkillItem;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${skill.name}`, size: 22 }),
              skill.level ? new TextRun({ text: ` — ${skill.level}`, size: 22, color: '666666' }) : new TextRun(''),
            ],
            spacing: { after: 40 },
          })
        );
      });
      break;

    case 'custom':
      module.items.forEach((item) => {
        const custom = item as CustomItem;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: custom.title, bold: true, size: 22 }),
              new TextRun({
                text: `  ${custom.startDate} ${custom.endDate ? `- ${custom.endDate}` : ''}`,
                size: 20,
                color: '666666',
              }),
            ],
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

  // Summary
  if (personalInfo.summary) {
    children.push(
      createSectionTitle('个人简介'),
      new Paragraph({
        children: [new TextRun({ text: personalInfo.summary, size: 22 })],
        spacing: { after: 200 },
      })
    );
  }

  // Modules
  modules.forEach((module) => {
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
