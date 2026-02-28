"use client";

import React, { forwardRef } from "react";
import { ResumeData } from "@/types/resume";
import { Mail, MapPin, Phone, Globe, Github, Linkedin } from "lucide-react";

const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full max-w-[800px] mx-auto bg-white text-gray-800 flex min-h-[1056px] shadow-lg font-sans overflow-hidden print:shadow-none print:m-0"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* Left Column (Sidebar) */}
        <div className="w-[35%] bg-blue-900 text-white p-8 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <h2 className="text-blue-200 font-medium tracking-wide">
              {data.personalInfo.jobTitle}
            </h2>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4 text-sm mt-4 text-blue-100">
            {data.personalInfo.email && (
              <div className="flex items-center gap-3 break-all">
                <Mail size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-3 break-all">
                <Globe size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.website}</span>
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-3 break-all">
                <Linkedin size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.linkedin}</span>
              </div>
            )}
            {data.personalInfo.github && (
              <div className="flex items-center gap-3 break-all">
                <Github size={16} className="shrink-0 text-blue-300" />
                <span>{data.personalInfo.github}</span>
              </div>
            )}
          </div>

          {/* Sidebar Sections */}
          {data.sectionOrder
            .filter((s) => s.visible && ['skills', 'languages', 'hobbies'].includes(s.type))
            .map((section) => {
              if (section.type === 'skills' && data.skills && data.skills.length > 0) {
                return (
                  <div key={section.id} className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-blue-700 pb-2">{section.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-800/60 border border-blue-700 text-blue-50 text-xs px-3 py-1.5 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section.type === 'languages' && data.languages && data.languages.length > 0) {
                return (
                  <div key={section.id} className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-blue-700 pb-2">{section.title}</h3>
                    <div className="flex flex-col gap-2">
                      {data.languages.map((lang, index) => (
                        <span key={index} className="text-sm text-blue-100 font-medium tracking-wide">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section.type === 'hobbies' && data.hobbies && data.hobbies.length > 0) {
                return (
                  <div key={section.id} className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-blue-700 pb-2">{section.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-blue-100 leading-relaxed">
                        {data.hobbies.join(" • ")}
                      </span>
                    </div>
                  </div>
                );
              }

              return null;
            })}
        </div>

        {/* Right Column (Main Content) */}
        <div className="w-[65%] p-10 flex flex-col gap-10 bg-white">
          {data.sectionOrder
            .filter((s) => s.visible && ['summary', 'experience', 'education', 'certifications', 'custom'].includes(s.type))
            .map((section) => {
              if (section.type === 'summary' && data.summary) {
                return (
                  <section key={section.id}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-blue-600"></div>
                      {section.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                      {data.summary}
                    </p>
                  </section>
                );
              }

              if (section.type === 'experience' && data.experience.length > 0) {
                return (
                  <section key={section.id}>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-blue-600"></div>
                      {section.title}
                    </h3>
                    <div className="flex flex-col gap-8">
                      {data.experience.map((exp) => (
                        <div key={exp.id} className="relative pl-6 border-l-2 border-blue-100 pb-2">
                          <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                          <div className="flex flex-col mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{exp.position}</h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-semibold text-blue-600 text-sm">{exp.company}</span>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                {exp.startDate} – {exp.endDate}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === 'education' && data.education.length > 0) {
                return (
                  <section key={section.id}>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-blue-600"></div>
                      {section.title}
                    </h3>
                    <div className="flex flex-col gap-6">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="relative pl-6 border-l-2 border-gray-200 pb-2">
                          <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                          <h4 className="font-bold text-gray-800 text-base">{edu.degree}</h4>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mt-1 gap-1">
                            <span className="font-medium text-gray-600 text-sm">{edu.institution}</span>
                            <span className="text-xs font-medium text-gray-500">
                              {edu.startDate} – {edu.endDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === 'certifications' && data.certifications.length > 0) {
                return (
                  <section key={section.id}>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-blue-600"></div>
                      {section.title}
                    </h3>
                    <div className="flex flex-col gap-6">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="relative pl-6 border-l-2 border-green-200 pb-2">
                          <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                          <h4 className="font-bold text-gray-800 text-base">{cert.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mt-1 gap-1">
                            <span className="font-medium text-gray-600 text-sm">{cert.issuer}</span>
                            <span className="text-xs font-medium text-gray-500">
                              {cert.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === 'custom') {
                const customSection = data.customSections.find((s) => s.id === section.id);
                if (customSection && customSection.items.length > 0) {
                  return (
                    <section key={section.id}>
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-blue-600"></div>
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-6">
                        {customSection.items.map((item) => (
                          <div key={item.id} className="relative pl-6 border-l-2 border-gray-200 pb-2">
                            <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                            <div className="flex flex-col mb-2">
                              <h4 className="font-bold text-gray-800 text-base">{item.title}</h4>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mt-1 gap-1">
                                {item.subtitle && <span className="font-medium text-blue-600 text-sm">{item.subtitle}</span>}
                                {item.date && (
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }
              }

              return null;
            })}
        </div>
      </div>
    );
  }
);

ModernTemplate.displayName = "ModernTemplate";

export default ModernTemplate;
