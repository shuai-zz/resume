import { useMemo } from 'react';
import { useResumeStore } from '../../stores/resumeStore';
import { templates } from '../../templates';
import { sortItemsByDateDesc } from '../../utils/sortItems';

export default function ResumePreview() {
  const data = useResumeStore();
  const Template = templates[data.template].component;

  const displayData = useMemo(
    () => ({
      ...data,
      modules: data.modules.map((m) =>
        m.sortByDateDesc ? { ...m, items: sortItemsByDateDesc(m.items, m.type) } : m
      ),
    }),
    [data]
  );

  return (
    <div id="resume-preview-container" className="flex justify-center py-4">
      <div id="resume-preview">
        <Template data={displayData} />
      </div>
    </div>
  );
}
