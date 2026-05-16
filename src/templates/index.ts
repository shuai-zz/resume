import { TemplateType } from '../types/resume';
import TemplateModern from './TemplateModern';
import TemplateClassic from './TemplateClassic';
import TemplateMinimal from './TemplateMinimal';

export const templates: Record<TemplateType, { component: React.FC<{ data: any }>; name: string }> = {
  modern: { component: TemplateModern, name: '现代风格' },
  classic: { component: TemplateClassic, name: '经典风格' },
  minimal: { component: TemplateMinimal, name: '极简风格' },
};
