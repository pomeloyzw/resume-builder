"use client";

import React, { createContext, useContext, useState } from "react";
import { ResumeData, TemplateType } from "@/types/resume";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ResumeStore = {
  data: ResumeData;
  setData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  addCustomSection: (title: string) => void;
  deleteCustomSection: (id: string) => void;
  updateCustomSectionTitle: (id: string, title: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, field: string, value: string) => void;
  deleteCustomSectionItem: (sectionId: string, itemId: string) => void;
};

const defaultData: ResumeData = {
  personalInfo: {
    fullName: "Alex Johnson",
    jobTitle: "Senior Frontend Engineer",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    github: "github.com/alexj",
    linkedin: "linkedin.com/in/alexj",
  },
  summary: "Passionate and detail-oriented Frontend Engineer with over 5 years of experience building scalable web applications. Expertise in React, Next.js, and modern CSS frameworks. Adept at collaborating with cross-functional teams to deliver exceptional user experiences.",
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions",
      position: "Senior Frontend Engineer",
      startDate: "Jan 2021",
      endDate: "Present",
      description: "Led the development of a high-traffic e-commerce platform using Next.js and Tailwind CSS. Mentored junior developers and instituted comprehensive code review processes.",
    },
    {
      id: "exp-2",
      company: "Creative Web Agency",
      position: "Web Developer",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      description: "Developed and maintained 20+ custom high-performance websites for diverse clients. Improved site load times by 40% through code splitting and asset optimization.",
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "B.S. in Computer Science",
      startDate: "Sep 2014",
      endDate: "May 2018",
      description: "",
    }
  ],
  skills: [
    "JavaScript (ES6+)",
    "TypeScript",
    "React.js",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "GraphQL",
    "Git",
  ],
  languages: ["English (Native)", "Spanish (Conversational)"],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
    }
  ],
  customSections: [],
  sectionOrder: [
    { id: "personal", type: "personal", title: "Personal Information", visible: true },
    { id: "summary", type: "summary", title: "Professional Summary", visible: true },
    { id: "experience", type: "experience", title: "Work Experience", visible: true },
    { id: "education", type: "education", title: "Education", visible: true },
    { id: "skills", type: "skills", title: "Skills", visible: true },
    { id: "languages", type: "languages", title: "Languages", visible: true },
    { id: "certifications", type: "certifications", title: "Certifications and Licenses", visible: true },
  ],
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: defaultData,
      setData: (updater) => set((state) => ({
        data: typeof updater === 'function' ? updater(state.data) : updater
      })),
      template: 'modern',
      setTemplate: (template) => set({ template }),

      addCustomSection: (title) => {
        const newId = `custom-${Date.now()}`;
        set((state) => ({
          data: {
            ...state.data,
            customSections: [
              ...state.data.customSections,
              { id: newId, title, items: [] }
            ],
            sectionOrder: [
              ...state.data.sectionOrder,
              { id: newId, type: 'custom', title, visible: true }
            ]
          }
        }));
      },

      deleteCustomSection: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.filter(s => s.id !== id),
            sectionOrder: state.data.sectionOrder.filter(s => s.id !== id)
          }
        }));
      },

      updateCustomSectionTitle: (id, title) => {
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map(s =>
              s.id === id ? { ...s, title } : s
            ),
            sectionOrder: state.data.sectionOrder.map(s =>
              s.id === id ? { ...s, title } : s
            )
          }
        }));
      },

      addCustomSectionItem: (sectionId) => {
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map(s => {
              if (s.id !== sectionId) return s;
              return {
                ...s,
                items: [
                  ...s.items,
                  { id: `custom-item-${Date.now()}`, title: "", subtitle: "", date: "", description: "" }
                ]
              };
            })
          }
        }));
      },

      updateCustomSectionItem: (sectionId, itemId, field, value) => {
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map(s => {
              if (s.id !== sectionId) return s;
              return {
                ...s,
                items: s.items.map(item =>
                  item.id === itemId ? { ...item, [field]: value } : item
                )
              };
            })
          }
        }));
      },

      deleteCustomSectionItem: (sectionId, itemId) => {
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map(s => {
              if (s.id !== sectionId) return s;
              return {
                ...s,
                items: s.items.filter(item => item.id !== itemId)
              };
            })
          }
        }));
      }
    }),
    {
      name: 'resume-builder-storage', // key in localStorage
    }
  )
);

// Backward compatibility or drop-in replacement for old Context hook
export function useResume() {
  return useResumeStore();
}

// Dummy provider to prevent breaking changes in layout.tsx
export function ResumeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
