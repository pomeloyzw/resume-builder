"use client";

import React, { forwardRef } from "react";
import { ResumeData } from "@/types/resume";
import { formatDateStr } from "@/lib/utils";

const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full max-w-[800px] mx-auto bg-white text-gray-900 p-10 min-h-[1056px] shadow-sm font-serif print:shadow-none print:p-8"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <style dangerouslySetInnerHTML={{ __html: "@page { margin: 12.7mm; }" }} />
        {/* Header */}
        <header className="text-center border-b-[3px] border-gray-800 pb-6 mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-900 mb-2">
            {data.personalInfo.fullName || "Your Name"}
          </h1>
          <h2 className="text-xl text-gray-700 italic tracking-wide mb-4">
            {data.personalInfo.jobTitle}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
            {data.personalInfo.website && <span>• {data.personalInfo.website}</span>}
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-2 text-sm text-gray-600">
            {data.personalInfo.linkedin && <span>LinkedIn: {data.personalInfo.linkedin}</span>}
            {data.personalInfo.github && <span>GitHub: {data.personalInfo.github}</span>}
          </div>
        </header>

        {/* Dynamic Sections */}
        {data.sectionOrder
          .filter((s) => s.visible)
          .map((section) => {
            if (section.type === 'summary' && data.summary) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                    {section.title}
                  </h3>
                  <div
                    className="text-gray-700 leading-relaxed text-sm tiptap-content"
                    dangerouslySetInnerHTML={{ __html: data.summary }}
                  />
                </section>
              );
            }

            if (section.type === 'experience' && data.experience.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-4">
                    {section.title}
                  </h3>
                  <div className="flex flex-col gap-6">
                    {data.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="flex-1 font-bold text-gray-900 text-base">
                            {exp.position}
                          </h4>
                          <span className="text-sm font-medium text-gray-600 italic">
                            {formatDateStr(exp.startDate)} – {formatDateStr(exp.endDate)}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-700 mb-2 text-sm">
                          {exp.company}
                        </div>
                        <div
                          className="text-sm text-gray-700 leading-relaxed tiptap-content"
                          dangerouslySetInnerHTML={{ __html: exp.description }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.type === 'education' && data.education.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-4">
                    {section.title}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {data.education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="flex-1 font-bold text-gray-900 text-base">
                            {edu.degree}
                          </h4>
                          <span className="text-sm font-medium text-gray-600 italic">
                            {formatDateStr(edu.startDate)} – {formatDateStr(edu.endDate)}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {edu.institution}
                        </div>
                        {edu.description && (
                          <div
                            className="text-sm text-gray-700 leading-relaxed mt-1 tiptap-content"
                            dangerouslySetInnerHTML={{ __html: edu.description }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.type === 'certifications' && data.certifications && data.certifications.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-4">
                    {section.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-gray-900 text-base">{cert.name}</span>
                          <span className="text-sm text-gray-700 ml-2">({cert.issuer})</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600 italic">
                          {formatDateStr(cert.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.type === 'skills' && data.skills && data.skills.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.skills.join(" • ")}
                  </p>
                </section>
              );
            }

            if (section.type === 'languages' && data.languages && data.languages.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.languages.join(" • ")}
                  </p>
                </section>
              );
            }

            if (section.type === 'hobbies' && data.hobbies && data.hobbies.length > 0) {
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {data.hobbies.join(" • ")}
                  </p>
                </section>
              );
            }

            if (section.type === 'custom') {
              const customSection = data.customSections.find((s) => s.id === section.id);
              if (customSection && customSection.items.length > 0) {
                return (
                  <section key={section.id} className="mb-6">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-4">
                      {section.title}
                    </h3>
                    <div className="flex flex-col gap-6">
                      {customSection.items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="flex-1 font-bold text-gray-900 text-base">
                              {item.title}
                            </h4>
                            {item.date && (
                              <span className="text-sm font-medium text-gray-600 italic">
                                {formatDateStr(item.date)}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="font-semibold text-gray-700 mb-2 text-sm">
                              {item.subtitle}
                            </div>
                          )}
                          {item.description && (
                            <div
                              className="text-sm text-gray-700 leading-relaxed mt-1 tiptap-content"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
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

        {/* Hidden JSON resume data for re-import fidelity */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
            color: "transparent",
            fontSize: "1px",
          }}
        >
          {`jsonresumedataX:${JSON.stringify(data)}`}
        </div>
      </div>
    );
  }
);

ClassicTemplate.displayName = "ClassicTemplate";

export default ClassicTemplate;
