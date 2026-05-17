import {
  User, Contact, Cake, Heart, Smile, Languages,
  MessageCircle, Mail, Phone, MapPin, Globe,
  Github, Linkedin, Twitter,
  Briefcase, Building2, GraduationCap, Award, Code,
  BookOpen, Music, Camera, Star, Flag,
  type LucideIcon,
} from 'lucide-react';

// curated 24 个常用图标。在 IconPicker 网格里展示给用户选。
// 顺序：身份 → 联系 → 社交 → 职业 → 兴趣
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  User, Contact, Cake, Heart, Smile, Languages,
  MessageCircle, Mail, Phone, MapPin, Globe,
  Github, Linkedin, Twitter,
  Briefcase, Building2, GraduationCap, Award, Code,
  BookOpen, Music, Camera, Star, Flag,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

export function getIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] || User;
}
