export type PersonalInfo = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type CustomSectionItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
};

export type CustomSection = {
  id: string;
  title: string;
  items: CustomSectionItem[];
};

export type SectionConfig = {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'hobbies' | 'custom';
  title: string;
  visible: boolean;
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  certifications: Certification[];
  hobbies: string[];
  customSections: CustomSection[];
  sectionOrder: SectionConfig[];
};

export type TemplateType = 'classic' | 'modern';
