import { ResumeData, ResumeModule, ModuleType, ExperienceItem, EducationItem, ProjectItem, SummaryItem, CustomItem } from '../types/resume';
import { MarkdownContent } from '../utils/markdown';
import { formatDateRange } from '../utils/dateRange';

const leftTypes: ModuleType[] = ['experience', 'projects', 'custom'];
const rightTypes: ModuleType[] = ['education'];

function ModuleSection({ module }: { module: ResumeModule }) {
  const renderItem = () => {
    switch (module.type) {
      case 'experience':
        return module.items.map((item) => {
          const exp = item as ExperienceItem;
          const range = formatDateRange(exp.startDate, exp.endDate);
          const meta = [exp.position, range].filter(Boolean).join(' · ');
          return (
            <div key={item.id} className="mb-4">
              <h3 className="font-bold text-gray-800">{exp.company}</h3>
              {meta && <p className="text-gray-500 text-xs mb-1">{meta}</p>}
              <MarkdownContent text={exp.description} className="text-gray-600" />
            </div>
          );
        });

      case 'education':
        return module.items.map((item) => {
          const edu = item as EducationItem;
          const range = formatDateRange(edu.startDate, edu.endDate);
          return (
            <div key={item.id} className="mb-2">
              <h3 className="font-bold text-gray-800 text-sm">{edu.school}</h3>
              <p className="text-gray-500 text-xs">
                {edu.degree}
                {edu.ranking && <span className="ml-1 text-amber-600">· {edu.ranking}</span>}
              </p>
              {range && <p className="text-gray-400 text-xs">{range}</p>}
            </div>
          );
        });

      case 'projects':
        return module.items.map((item) => {
          const proj = item as ProjectItem;
          const range = formatDateRange(proj.startDate, proj.endDate);
          const meta = [proj.role, range].filter(Boolean).join(' · ');
          return (
            <div key={item.id} className="mb-3">
              <h3 className="font-bold text-gray-800">{proj.name}</h3>
              {meta && <p className="text-gray-500 text-xs mb-1">{meta}</p>}
              <MarkdownContent text={proj.description} className="text-gray-600" />
            </div>
          );
        });

      case 'summary':
        return (
          <MarkdownContent
            text={(module.items[0] as SummaryItem | undefined)?.content || ''}
            className="text-gray-600 leading-relaxed"
          />
        );

      case 'custom':
        return module.items.map((item) => {
          const custom = item as CustomItem;
          const range = formatDateRange(custom.startDate, custom.endDate);
          const meta = [custom.subtitle, range].filter(Boolean).join(' · ');
          return (
            <div key={item.id} className="mb-3">
              <h3 className="font-bold text-gray-800">{custom.title}</h3>
              {meta && <p className="text-gray-500 text-xs mb-1">{meta}</p>}
              <MarkdownContent text={custom.description} className="text-gray-600" />
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
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">{module.title}</h2>
      {renderItem()}
    </div>
  );
}

export default function TemplateMinimal({ data }: { data: ResumeData }) {
  const { personalInfo, modules } = data;

  const summaryModules = modules.filter(
    (m) => m.type === 'summary' && (m.items[0] as SummaryItem | undefined)?.content?.trim()
  );
  const leftModules = modules.filter((m) => leftTypes.includes(m.type) && m.items.length > 0);
  const rightModules = modules.filter((m) => rightTypes.includes(m.type) && m.items.length > 0);
  // 其他类型（非 summary / 非 left / 非 right）默认进左栏
  const otherModules = modules.filter(
    (m) =>
      m.type !== 'summary' &&
      !leftTypes.includes(m.type) &&
      !rightTypes.includes(m.type) &&
      m.items.length > 0
  );

  return (
    <div className="a4-page p-10 text-sm">
      {/* Header */}
      <div className="mb-8 flex items-center gap-5">
        {personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt="头像"
            className="w-16 h-16 rounded-md object-cover border border-gray-200 shrink-0"
          />
        )}
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight">{personalInfo.name}</h1>
          <p className="text-gray-500 text-sm mb-3">{personalInfo.title}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.customFields?.map((f) => {
            if (!f.value) return null;
            return (
              <span key={f.id}>
                {f.label && `${f.label}: `}{f.value}
              </span>
            );
          })}
          </div>
        </div>
      </div>

      {/* Summary (全宽顶部区) */}
      {summaryModules.map((module) => (
        <ModuleSection key={module.id} module={module} />
      ))}

      {/* Two Column Layout */}
      <div className="flex gap-8">
        {/* Left Column */}
        <div className="w-2/3">
          {leftModules.map((module) => (
            <ModuleSection key={module.id} module={module} />
          ))}
          {otherModules.map((module) => (
            <ModuleSection key={module.id} module={module} />
          ))}
        </div>

        {/* Right Column */}
        <div className="w-1/3">
          {rightModules.map((module) => (
            <ModuleSection key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
}
