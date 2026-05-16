import { useResumeStore } from '../../stores/resumeStore';
import { templates } from '../../templates';

export default function ResumePreview() {
  const data = useResumeStore();
  const Template = templates[data.template].component;

  return (
    <div id="resume-preview-container" className="flex justify-center py-4">
      <div id="resume-preview">
        <Template data={data} />
      </div>
    </div>
  );
}
