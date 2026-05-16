import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { ResumeData, ResumeModule, ExperienceItem, EducationItem, ProjectItem, SkillItem, CustomItem } from '../types/resume';
import { MarkdownContent } from '../utils/markdown';

function ModuleSection({ module }: { module: ResumeModule }) {
  const renderItem = () => {
    switch (module.type) {
      case 'experience':
        return module.items.map((item) => {
          const exp = item as ExperienceItem;
          return (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-800">{exp.position}</h3>
                <span className="text-gray-500 text-xs">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-gray-700 italic mb-1">{exp.company}</p>
              <MarkdownContent text={exp.description} className="text-gray-700" />
            </div>
          );
        });

      case 'education':
        return module.items.map((item) => {
          const edu = item as EducationItem;
          return (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-800">{edu.school}</h3>
                <span className="text-gray-500 text-xs">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="text-gray-700">
                {edu.degree}，{edu.field}
                {edu.ranking && <span className="ml-2 text-xs text-amber-700 font-medium">[{edu.ranking}]</span>}
              </p>
              {edu.description && <div className="text-gray-600 text-xs mt-1"><MarkdownContent text={edu.description} /></div>}
            </div>
          );
        });

      case 'projects':
        return module.items.map((item) => {
          const proj = item as ProjectItem;
          return (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-800">{proj.name}</h3>
                <span className="text-gray-500 text-xs">{proj.startDate} – {proj.endDate}</span>
              </div>
              <p className="text-gray-700 italic text-xs mb-1">{proj.role}</p>
              <MarkdownContent text={proj.description} className="text-gray-700" />
            </div>
          );
        });

      case 'skills':
        return (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {module.items.map((item) => {
              const skill = item as SkillItem;
              return (
                <div key={item.id} className="flex justify-between text-gray-700">
                  <span>{skill.name}</span>
                  <span className="text-gray-500 text-xs">{skill.level}</span>
                </div>
              );
            })}
          </div>
        );

      case 'custom':
        return module.items.map((item) => {
          const custom = item as CustomItem;
          return (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-800">{custom.title}</h3>
                <span className="text-gray-500 text-xs">{custom.startDate} {custom.endDate && `– ${custom.endDate}`}</span>
              </div>
              {custom.subtitle && <p className="text-gray-700 italic text-xs mb-1">{custom.subtitle}</p>}
              <MarkdownContent text={custom.description} className="text-gray-700" />
            </div>
          );
        });

      default:
        return null;
    }
  };

  if (module.items.length === 0) return null;

  return (
    <div className="mb-5">
      <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1">{module.title}</h2>
      {renderItem()}
    </div>
  );
}

export default function TemplateClassic({ data }: { data: ResumeData }) {
  const { personalInfo, modules } = data;

  return (
    <div className="a4-page p-12 text-sm font-serif">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        {personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt="头像"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mx-auto mb-3"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
        <p className="text-base text-gray-700 mb-2 italic">{personalInfo.title}</p>
        <div className="flex justify-center flex-wrap gap-4 text-gray-600 text-xs">
          {personalInfo.email && (
            <span className="flex items-center gap-1"><Mail size={12} /> {personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1"><Phone size={12} /> {personalInfo.phone}</span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1"><MapPin size={12} /> {personalInfo.location}</span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1"><Globe size={12} /> {personalInfo.website}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-2 pb-1">个人简介</h2>
          <MarkdownContent text={personalInfo.summary} className="text-gray-700 leading-relaxed text-justify" />
        </div>
      )}

      {/* Modules */}
      {modules.map((module) => (
        <ModuleSection key={module.id} module={module} />
      ))}
    </div>
  );
}
