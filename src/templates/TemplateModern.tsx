import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, FolderGit2, FileText, Star } from 'lucide-react';
import { ResumeData, ResumeModule, ModuleType, ExperienceItem, EducationItem, ProjectItem, SummaryItem, CustomItem } from '../types/resume';
import { MarkdownContent } from '../utils/markdown';

const typeIcons: Record<ModuleType, any> = {
  experience: Briefcase,
  education: GraduationCap,
  projects: FolderGit2,
  summary: FileText,
  custom: Star,
};

function ModuleSection({ module }: { module: ResumeModule }) {
  const Icon = typeIcons[module.type] || Star;

  const renderItem = () => {
    switch (module.type) {
      case 'experience':
        return module.items.map((item) => {
          const exp = item as ExperienceItem;
          return (
            <div key={item.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800">{exp.company}</h3>
                <span className="text-gray-500 text-xs">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-blue-600 font-medium mb-1">{exp.position}</p>
              <MarkdownContent text={exp.description} className="text-gray-700" />
            </div>
          );
        });

      case 'education':
        return module.items.map((item) => {
          const edu = item as EducationItem;
          return (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800">{edu.school}</h3>
                <span className="text-gray-500 text-xs">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-gray-700">
                {edu.degree} · {edu.field}
                {edu.ranking && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">{edu.ranking}</span>}
              </p>
              {edu.description && <div className="text-gray-600 mt-1"><MarkdownContent text={edu.description} /></div>}
            </div>
          );
        });

      case 'projects':
        return module.items.map((item) => {
          const proj = item as ProjectItem;
          return (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800">{proj.name}</h3>
                <span className="text-gray-500 text-xs">{proj.startDate} - {proj.endDate}</span>
              </div>
              <p className="text-blue-600 text-xs mb-1">{proj.role}</p>
              <MarkdownContent text={proj.description} className="text-gray-700" />
            </div>
          );
        });

      case 'summary':
        return (
          <MarkdownContent
            text={(module.items[0] as SummaryItem | undefined)?.content || ''}
            className="text-gray-700 leading-relaxed"
          />
        );

      case 'custom':
        return module.items.map((item) => {
          const custom = item as CustomItem;
          return (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800">{custom.title}</h3>
                <span className="text-gray-500 text-xs">{custom.startDate} {custom.endDate && `- ${custom.endDate}`}</span>
              </div>
              {custom.subtitle && <p className="text-blue-600 text-xs mb-1">{custom.subtitle}</p>}
              <MarkdownContent text={custom.description} className="text-gray-700" />
            </div>
          );
        });

      default:
        return null;
    }
  };

  if (module.items.length === 0) return null;
  if (module.type === 'summary' && !(module.items[0] as SummaryItem)?.content?.trim()) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">{module.title}</h2>
      </div>
      {renderItem()}
    </div>
  );
}

export default function TemplateModern({ data }: { data: ResumeData }) {
  const { personalInfo, modules } = data;

  return (
    <div className="a4-page p-10 text-sm">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <div className="flex items-center gap-5">
          {personalInfo.avatar && (
            <img
              src={personalInfo.avatar}
              alt="头像"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
            <p className="text-xl text-blue-600 mb-3">{personalInfo.title}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-gray-600 mt-3">
          {personalInfo.email && (
            <span className="flex items-center gap-1"><Mail size={14} /> {personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1"><Phone size={14} /> {personalInfo.phone}</span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {personalInfo.location}</span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1"><Globe size={14} /> {personalInfo.website}</span>
          )}
        </div>
      </div>

      {/* Modules */}
      {modules.map((module) => (
        <ModuleSection key={module.id} module={module} />
      ))}
    </div>
  );
}
