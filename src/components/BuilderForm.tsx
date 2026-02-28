"use client";

import React, { useState } from "react";
import { useResume } from "@/lib/ResumeContext";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import TagInput from "./TagInput";
import RichTextEditor from "./RichTextEditor";
import { MonthYearPicker } from "./MonthYearPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const InputField = ({ label, value, onChange, placeholder = "", type = "text", as = "input", disabled = false }: any) => (
  <div className="flex flex-col gap-1.5 w-full flex-1">
    <Label>{label}</Label>
    {as === "textarea" ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-y"
      />
    ) : (
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    )}
  </div>
);

type SortableSectionProps = {
  id: string;
  title: string;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
  children: React.ReactNode;
};

function SortableSection({ id, title, isVisible, onToggleVisibility, activeSection, setActiveSection, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isActive = activeSection === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border text-black border-gray-200 rounded-xl overflow-hidden shadow-sm transition-opacity ${!isVisible ? 'opacity-60' : ''} ${isDragging ? 'shadow-xl ring-2 ring-blue-500 ring-opacity-50' : ''}`}
    >
      <div
        className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-gray-100 p-1 rounded-md text-gray-400 hover:text-gray-700 touch-none active:cursor-grabbing"
          >
            <GripVertical size={20} />
          </div>
          <Button
            variant="ghost"
            className="flex-1 justify-between px-2 py-1.5 h-auto text-lg font-semibold text-gray-800 hover:bg-transparent"
            onClick={() => setActiveSection(isActive ? "" : id)}
          >
            {title}
            {isActive ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(id);
          }}
          className="ml-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          title={isVisible ? "Hide section on resume" : "Show section on resume"}
        >
          {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </Button>
      </div>

      {isActive && (
        <div className="bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
}

function SortableItemWrapper({ id, children, onDelete }: { id: string, children: React.ReactNode, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white p-4 border border-gray-200 rounded-lg shadow-sm group flex gap-3 ${isDragging ? 'shadow-lg ring-2 ring-blue-500/50 z-50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <GripVertical size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        >
          <Trash2 size={16} />
        </Button>
        {children}
      </div>
    </div>
  );
}

export default function BuilderForm() {
  const {
    data, setData,
    addCustomSection, deleteCustomSection, updateCustomSectionTitle,
    addCustomSectionItem, updateCustomSectionItem, deleteCustomSectionItem
  } = useResume();
  const [activeSection, setActiveSection] = useState<string>("personal");

  const updatePersonalInfo = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSummary = (value: string) => {
    setData((prev) => ({ ...prev, summary: value }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const deleteExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          institution: "",
          degree: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const deleteEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addCertification = () => {
    setData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: `cert-${Date.now()}`,
          name: "",
          issuer: "",
          date: "",
        },
      ],
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const deleteCertification = (id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  const toggleSectionVisibility = (id: string) => {
    setData((prev) => ({
      ...prev,
      sectionOrder: prev.sectionOrder.map(section =>
        section.id === id ? { ...section, visible: !section.visible } : section
      )
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.sectionOrder.findIndex(s => s.id === active.id);
        const newIndex = prev.sectionOrder.findIndex(s => s.id === over.id);

        return {
          ...prev,
          sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
        };
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts to allow clicking inside
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndItems = (event: DragEndEvent, field: 'experience' | 'education' | 'certifications') => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev[field].findIndex((i: any) => i.id === active.id);
        const newIndex = prev[field].findIndex((i: any) => i.id === over.id);

        return {
          ...prev,
          [field]: arrayMove(prev[field] as any[], oldIndex, newIndex),
        };
      });
    }
  };

  const getSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" value={data.personalInfo.fullName} onChange={(v: string) => updatePersonalInfo("fullName", v)} />
            <InputField label="Job Title" value={data.personalInfo.jobTitle} onChange={(v: string) => updatePersonalInfo("jobTitle", v)} />
            <InputField label="Email" type="email" value={data.personalInfo.email} onChange={(v: string) => updatePersonalInfo("email", v)} />
            <InputField label="Phone" type="tel" value={data.personalInfo.phone} onChange={(v: string) => updatePersonalInfo("phone", v)} />
            <InputField label="Location" value={data.personalInfo.location} onChange={(v: string) => updatePersonalInfo("location", v)} />
            <InputField label="Website" value={data.personalInfo.website} onChange={(v: string) => updatePersonalInfo("website", v)} />
            <InputField label="GitHub" value={data.personalInfo.github} onChange={(v: string) => updatePersonalInfo("github", v)} />
            <InputField label="LinkedIn" value={data.personalInfo.linkedin} onChange={(v: string) => updatePersonalInfo("linkedin", v)} />
          </div>
        );
      case 'summary':
        return (
          <div className="p-4">
            <div className="flex flex-col gap-1 w-full flex-1">
              <Label>Summary</Label>
              <RichTextEditor content={data.summary || ""} onChange={updateSummary} placeholder="Write a brief summary of your professional background..." />
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="p-4 flex flex-col gap-6">
            <DndContext
              id="dnd-experience"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEndItems(e, 'experience')}
            >
              <SortableContext items={data.experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {data.experience.map((exp) => (
                  <SortableItemWrapper key={exp.id} id={exp.id} onDelete={() => deleteExperience(exp.id)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                      <InputField label="Company" value={exp.company} onChange={(v: string) => updateExperience(exp.id, "company", v)} />
                      <InputField label="Position" value={exp.position} onChange={(v: string) => updateExperience(exp.id, "position", v)} />
                      <div className="flex flex-col gap-1 w-full flex-1 justify-end">
                        <Label>Start Date</Label>
                        <MonthYearPicker value={exp.startDate} onChange={(v: string) => updateExperience(exp.id, "startDate", v)} />
                      </div>
                      <div className="flex flex-col gap-1 w-full flex-1 justify-end">
                        <div className="flex items-end justify-between w-full">
                          <Label>End Date</Label>
                          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer h-full pt-2">
                            <Checkbox
                              checked={exp.endDate?.toLowerCase() === "present" || exp.endDate?.toLowerCase() === "current"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateExperience(exp.id, "endDate", "Present");
                                } else {
                                  updateExperience(exp.id, "endDate", "");
                                }
                              }}
                              className="border-gray-300 rounded"
                            />
                            Present
                          </label>
                        </div>
                        <MonthYearPicker
                          value={exp.endDate?.toLowerCase() === "present" || exp.endDate?.toLowerCase() === "current" ? "" : exp.endDate}
                          disabled={exp.endDate?.toLowerCase() === "present" || exp.endDate?.toLowerCase() === "current"}
                          onChange={(e) => updateExperience(exp.id, "endDate", e)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full flex-1">
                      <Label>Description</Label>
                      <RichTextEditor content={exp.description || ""} onChange={(v: string) => updateExperience(exp.id, "description", v)} placeholder="Describe your responsibilities and achievements..." />
                    </div>
                  </SortableItemWrapper>
                ))}
              </SortableContext>
            </DndContext>
            <Button
              variant="outline"
              onClick={addExperience}
              className="w-full py-6 border-dashed border-2 hover:border-blue-500 hover:text-blue-500"
            >
              <Plus size={16} className="mr-2" /> Add Experience
            </Button>
          </div>
        );
      case 'education':
        return (
          <div className="p-4 flex flex-col gap-6">
            <DndContext
              id="dnd-education"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEndItems(e, 'education')}
            >
              <SortableContext items={data.education.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {data.education.map((edu) => (
                  <SortableItemWrapper key={edu.id} id={edu.id} onDelete={() => deleteEducation(edu.id)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                      <InputField label="Institution" value={edu.institution} onChange={(v: string) => updateEducation(edu.id, "institution", v)} />
                      <InputField label="Degree" value={edu.degree} onChange={(v: string) => updateEducation(edu.id, "degree", v)} />
                      <div className="flex flex-col gap-1 w-full flex-1">
                        <Label>Start Date</Label>
                        <MonthYearPicker value={edu.startDate} onChange={(v: string) => updateEducation(edu.id, "startDate", v)} />
                      </div>
                      <div className="flex flex-col gap-1 w-full flex-1">
                        <Label>End Date</Label>
                        <MonthYearPicker value={edu.endDate} onChange={(v: string) => updateEducation(edu.id, "endDate", v)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full flex-1 mt-4">
                      <Label>Description (Optional)</Label>
                      <RichTextEditor content={edu.description || ""} onChange={(v: string) => updateEducation(edu.id, "description", v)} placeholder="Describe your coursework, honors, or thesis..." />
                    </div>
                  </SortableItemWrapper>
                ))}
              </SortableContext>
            </DndContext>
            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full py-6 border-dashed border-2 hover:border-blue-500 hover:text-blue-500"
            >
              <Plus size={16} className="mr-2" /> Add Education
            </Button>
          </div>
        );
      case 'skills':
        return (
          <div className="p-4">
            <TagInput
              label="Professional Skills"
              tags={data.skills}
              onChange={(tags) => setData(prev => ({ ...prev, skills: tags }))}
              placeholder="e.g. React, Next.js, Node.js"
            />
          </div>
        );
      case 'languages':
        return (
          <div className="p-4">
            <TagInput
              label="Spoken/Written Languages"
              tags={data.languages}
              onChange={(tags) => setData(prev => ({ ...prev, languages: tags }))}
              placeholder="e.g. English (Native), Spanish"
            />
          </div>
        );
      case 'certifications':
        return (
          <div className="p-4 flex flex-col gap-6">
            <DndContext
              id="dnd-certifications"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEndItems(e, 'certifications')}
            >
              <SortableContext items={data.certifications.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {data.certifications.map((cert) => (
                  <SortableItemWrapper key={cert.id} id={cert.id} onDelete={() => deleteCertification(cert.id)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                      <InputField label="Name" value={cert.name} onChange={(v: string) => updateCertification(cert.id, "name", v)} />
                      <InputField label="Issuer" value={cert.issuer} onChange={(v: string) => updateCertification(cert.id, "issuer", v)} />
                      <div className="flex flex-col gap-1 w-full flex-1">
                        <Label>Date</Label>
                        <MonthYearPicker value={cert.date} onChange={(v: string) => updateCertification(cert.id, "date", v)} />
                      </div>
                    </div>
                  </SortableItemWrapper>
                ))}
              </SortableContext>
            </DndContext>
            <Button
              variant="outline"
              onClick={addCertification}
              className="w-full py-6 border-dashed border-2 hover:border-blue-500 hover:text-blue-500"
            >
              <Plus size={16} className="mr-2" /> Add Certification
            </Button>
          </div>
        );
      case 'hobbies':
        return (
          <div className="p-4">
            <TagInput
              label="Hobbies & Interests"
              tags={data.hobbies}
              onChange={(tags) => setData(prev => ({ ...prev, hobbies: tags }))}
              placeholder="e.g. Photography, Hiking"
            />
          </div>
        );
      default:
        // Handle custom sections dynamically
        const customSection = data.customSections.find(s => s.id === sectionId);
        if (customSection) {
          return (
            <div className="p-4 flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-2">
                <InputField
                  label="Section Title"
                  value={customSection.title}
                  onChange={(v: string) => updateCustomSectionTitle(customSection.id, v)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="mt-6 ml-2"
                  onClick={() => deleteCustomSection(customSection.id)}
                  title="Remove this custom section entirely"
                >
                  <Trash2 size={18} />
                </Button>
              </div>

              <DndContext
                id={`dnd-custom-${customSection.id}`}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (over && active.id !== over.id) {
                    setData((prev) => ({
                      ...prev,
                      customSections: prev.customSections.map(s => {
                        if (s.id !== customSection.id) return s;
                        const oldIndex = s.items.findIndex((i: any) => i.id === active.id);
                        const newIndex = s.items.findIndex((i: any) => i.id === over.id);
                        return {
                          ...s,
                          items: arrayMove(s.items, oldIndex, newIndex)
                        };
                      })
                    }));
                  }
                }}
              >
                <SortableContext items={customSection.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {customSection.items.map((item) => (
                    <SortableItemWrapper key={item.id} id={item.id} onDelete={() => deleteCustomSectionItem(customSection.id, item.id)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                        <InputField label="Item Title (e.g. Project Name)" value={item.title} onChange={(v: string) => updateCustomSectionItem(customSection.id, item.id, "title", v)} />
                        <InputField label="Subtitle (e.g. Role)" value={item.subtitle} onChange={(v: string) => updateCustomSectionItem(customSection.id, item.id, "subtitle", v)} />
                        <div className="flex flex-col gap-1 w-full flex-1">
                          <Label>Date</Label>
                          <MonthYearPicker value={item.date} onChange={(v: string) => updateCustomSectionItem(customSection.id, item.id, "date", v)} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 w-full flex-1">
                        <Label>Description</Label>
                        <RichTextEditor content={item.description || ""} onChange={(v: string) => updateCustomSectionItem(customSection.id, item.id, "description", v)} placeholder="Describe the details..." />
                      </div>
                    </SortableItemWrapper>
                  ))}
                </SortableContext>
              </DndContext>
              <Button
                variant="outline"
                onClick={() => addCustomSectionItem(customSection.id)}
                className="w-full py-6 border-dashed border-2 hover:border-blue-500 hover:text-blue-500"
              >
                <Plus size={16} className="mr-2" /> Add Item
              </Button>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <DndContext
        id="dnd-main"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={data.sectionOrder.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {data.sectionOrder.map((section) => (
            <SortableSection
              key={section.id}
              id={section.id}
              title={section.title}
              isVisible={section.visible}
              onToggleVisibility={toggleSectionVisibility}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            >
              {getSectionContent(section.id)}
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Custom Section Button */}
      <Button
        variant="outline"
        onClick={() => addCustomSection("New Custom Section")}
        className="w-full py-8 border-dashed border-2 border-blue-300 bg-blue-50/50 text-blue-600 hover:border-blue-500 hover:bg-blue-50 font-semibold cursor-pointer"
      >
        <Plus size={18} className="mr-2" /> Add Custom Section (Projects, Awards, etc.)
      </Button>
    </div>
  );
}
