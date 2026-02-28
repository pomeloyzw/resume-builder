import { ResumeData, Experience, Education, Certification } from "@/types/resume";

/**
 * Heuristic parser: takes raw PDF text and maps it into a partial ResumeData
 * object. Works best with standard resume layouts but is resilient to various
 * formats.
 *
 * If the PDF contains embedded JSON resume data (from a previous export),
 * it parses that directly for perfect fidelity.
 */

// ─── JSON metadata detector ────────────────────────────────────────────────

const JSON_RESUME_PREFIX = /jsonresumedataX?:/i;

function tryExtractEmbeddedJson(text: string): Partial<ResumeData> | null {
  const match = text.match(JSON_RESUME_PREFIX);
  if (!match) return null;

  const prefixEnd = text.indexOf(match[0]) + match[0].length;
  const braceStart = text.indexOf("{", prefixEnd);
  if (braceStart === -1) return null;

  // Approach 1: String-aware brace counting (handles braces inside quoted strings)
  let braceEnd = findMatchingBrace(text, braceStart);
  if (braceEnd !== -1) {
    try {
      const jsonStr = text.substring(braceStart, braceEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object" && parsed.personalInfo) {
        return parsed as Partial<ResumeData>;
      }
    } catch { /* fall through */ }
  }

  // Approach 2: Try progressively from the last `}` backwards
  for (let i = text.length - 1; i > braceStart; i--) {
    if (text[i] === "}") {
      try {
        const jsonStr = text.substring(braceStart, i + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === "object" && parsed.personalInfo) {
          return parsed as Partial<ResumeData>;
        }
      } catch { /* try smaller substring */ }
    }
  }

  return null;
}

/**
 * Find the matching closing brace, properly skipping over JSON strings.
 */
function findMatchingBrace(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\/[^\s"'})\]]*)?)/g;
const linkedinRegex = /linkedin\.com\/in\/[^\s,)"'}\]]+/i;
const githubRegex = /github\.com\/[^\s,)"'}\]]+/i;

const SECTION_HEADERS = [
  { key: "summary", patterns: [/^(?:professional\s+)?summary$/i, /^(?:about\s+me|profile|objective)$/i] },
  { key: "experience", patterns: [/^(?:work\s+)?experience$/i, /^employment\s+history$/i, /^work\s+history$/i, /^professional\s+experience$/i] },
  { key: "education", patterns: [/^education$/i, /^academic$/i] },
  { key: "skills", patterns: [/^(?:technical\s+)?skills$/i, /^core\s+competencies$/i, /^competencies$/i] },
  { key: "certifications", patterns: [/^certifications?$/i, /^licenses?\s*(?:&|and)\s*certifications?$/i, /^certifications?\s*(?:&|and)\s*licenses?$/i] },
  { key: "languages", patterns: [/^languages?$/i] },
  { key: "hobbies", patterns: [/^hobbies$/i, /^interests$/i, /^hobbies\s*(?:&|and)\s*interests$/i] },
];

function identifySection(line: string): string | null {
  const trimmed = line.trim().replace(/[:\-–—]+$/, "").trim();
  for (const { key, patterns } of SECTION_HEADERS) {
    for (const pat of patterns) {
      if (pat.test(trimmed)) return key;
    }
  }
  return null;
}

// Date patterns commonly found on resumes
const datePatternStr =
  "(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})";
const dateRangeRegex = new RegExp(
  `(${datePatternStr})\\s*[-–—\\u2013\\u2014]\\s*(${datePatternStr}|[Pp]resent|[Cc]urrent)`,
  "i"
);
// Standalone date range on its own line (templates often render dates separately)
const standaloneDateRangeRegex = new RegExp(
  `^\\s*(${datePatternStr})\\s*[-–—\\u2013\\u2014]\\s*(${datePatternStr}|[Pp]resent|[Cc]urrent)\\s*$`,
  "i"
);

// ─── main parser ────────────────────────────────────────────────────────────

export function parsePdfText(text: string): Partial<ResumeData> {
  // ── Fast path: if the PDF contains embedded JSON resume data, use it directly ──
  const embedded = tryExtractEmbeddedJson(text);
  if (embedded) {
    // Ensure sectionOrder exists
    if (!embedded.sectionOrder) {
      embedded.sectionOrder = [
        { id: "personal", type: "personal" as const, title: "Personal Information", visible: true },
        { id: "summary", type: "summary" as const, title: "Professional Summary", visible: !!embedded.summary },
        { id: "experience", type: "experience" as const, title: "Work Experience", visible: (embedded.experience?.length ?? 0) > 0 },
        { id: "education", type: "education" as const, title: "Education", visible: (embedded.education?.length ?? 0) > 0 },
        { id: "skills", type: "skills" as const, title: "Skills", visible: (embedded.skills?.length ?? 0) > 0 },
        { id: "languages", type: "languages" as const, title: "Languages", visible: (embedded.languages?.length ?? 0) > 0 },
        { id: "certifications", type: "certifications" as const, title: "Certifications and Licenses", visible: (embedded.certifications?.length ?? 0) > 0 },
      ];
    }
    return embedded;
  }

  // ── Strip any JSON metadata blocks before heuristic parsing ──
  let cleanText = text.replace(/jsonresumedataX?:\s*\{[\s\S]*?\}(?:\s*$)?/gi, "").trim();
  if (!cleanText) cleanText = text; // fallback if stripping removed everything

  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // --- split text into sections ---
  const sections: Record<string, string[]> = {};
  let currentKey: string | null = null;
  const headerLines: string[] = []; // lines before any section header

  for (const line of lines) {
    const sectionKey = identifySection(line);
    if (sectionKey) {
      currentKey = sectionKey;
      if (!sections[currentKey]) sections[currentKey] = [];
    } else if (currentKey) {
      sections[currentKey].push(line);
    } else {
      headerLines.push(line);
    }
  }

  // --- personal info (from header lines and global patterns) ---
  const fullText = cleanText;
  const email = fullText.match(emailRegex)?.[0] ?? "";
  const phone = fullText.match(phoneRegex)?.[1]?.trim() ?? "";
  const linkedin = fullText.match(linkedinRegex)?.[0] ?? "";
  const github = fullText.match(githubRegex)?.[0] ?? "";

  // Find website URLs that are not linkedin/github
  let website = "";
  const urlMatches = [...fullText.matchAll(urlRegex)];
  for (const m of urlMatches) {
    const url = m[0].toLowerCase();
    if (!url.includes("linkedin.com") && !url.includes("github.com")) {
      website = m[0];
      break;
    }
  }

  // Name is typically the first non-contact line
  // Filter out header lines that are purely contact info or section-like
  const nonContactHeaders = headerLines.filter(
    (hl) =>
      !emailRegex.test(hl) &&
      !phoneRegex.test(hl) &&
      !linkedinRegex.test(hl) &&
      !githubRegex.test(hl) &&
      !/^https?:\/\//i.test(hl) &&
      !/^www\./i.test(hl) &&
      !/^LinkedIn:/i.test(hl) &&
      !/^GitHub:/i.test(hl)
  );

  const fullName = nonContactHeaders[0] ?? headerLines[0] ?? "";

  // Job title is typically the second non-contact line (if present)
  let jobTitle = "";
  if (nonContactHeaders.length > 1) {
    const candidate = nonContactHeaders[1];
    // Reject if it looks like a location (City, ST pattern) or a URL
    if (!/^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/.test(candidate)) {
      jobTitle = candidate;
    }
  }

  // Try to extract location from header lines
  let location = "";
  for (const hl of headerLines) {
    // Classic template: "• San Francisco, CA •" embedded in contact line
    // Modern template: standalone "San Francisco, CA" line
    const locMatch = hl.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/);
    if (locMatch) {
      location = locMatch[1];
      break;
    }
  }

  // Also check full text for location if not found in headers (some layouts
  // place it within the contact section that ends up in a section block)
  if (!location) {
    for (const line of lines.slice(0, 15)) {
      const locMatch = line.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/);
      if (locMatch && !identifySection(line)) {
        location = locMatch[1];
        break;
      }
    }
  }

  const personalInfo = {
    fullName,
    jobTitle,
    email,
    phone,
    location,
    website,
    github,
    linkedin,
  };

  // --- summary ---
  const summary = sections["summary"]?.join(" ") ?? "";

  // --- experience ---
  const experience: Experience[] = parseExperience(sections["experience"] ?? []);

  // --- education ---
  const education: Education[] = parseEducation(sections["education"] ?? []);

  // --- skills ---
  const skills: string[] = parseListSection(sections["skills"] ?? []);

  // --- languages ---
  const languages: string[] = parseListSection(sections["languages"] ?? []);

  // --- certifications ---
  const certifications: Certification[] = parseCertifications(sections["certifications"] ?? []);

  // --- hobbies ---
  const hobbies: string[] = parseListSection(sections["hobbies"] ?? []);

  // Build sectionOrder from what we found
  const sectionOrder = [
    { id: "personal", type: "personal" as const, title: "Personal Information", visible: true },
    { id: "summary", type: "summary" as const, title: "Professional Summary", visible: !!summary },
    { id: "experience", type: "experience" as const, title: "Work Experience", visible: experience.length > 0 },
    { id: "education", type: "education" as const, title: "Education", visible: education.length > 0 },
    { id: "skills", type: "skills" as const, title: "Skills", visible: skills.length > 0 },
    { id: "languages", type: "languages" as const, title: "Languages", visible: languages.length > 0 },
    { id: "certifications", type: "certifications" as const, title: "Certifications and Licenses", visible: certifications.length > 0 },
  ];

  return {
    personalInfo,
    summary,
    experience,
    education,
    skills,
    languages,
    certifications,
    hobbies,
    customSections: [],
    sectionOrder,
  };
}

// ─── sub-parsers ────────────────────────────────────────────────────────────

function parseExperience(lines: string[]): Experience[] {
  if (lines.length === 0) return [];

  const entries: Experience[] = [];
  let current: Partial<Experience> | null = null;
  const descLines: string[] = [];

  const flushCurrent = () => {
    if (current) {
      current.description = descLines.join("\n").trim();
      entries.push({
        id: `exp-${Date.now()}-${entries.length}`,
        company: current.company ?? "",
        position: current.position ?? "",
        startDate: current.startDate ?? "",
        endDate: current.endDate ?? "",
        description: current.description,
      });
      descLines.length = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRangeRegex);
    const standaloneDate = line.match(standaloneDateRangeRegex);

    if (dateMatch) {
      const startDate = dateMatch[1];
      const endDate = dateMatch[2];
      const remainder = line.replace(dateRangeRegex, "").replace(/[|•·,\-–—]+$/g, "").trim();

      if (standaloneDate) {
        // Date is on its own line — attach to current entry being built,
        // or look backwards for position/company context
        if (current && !current.startDate) {
          current.startDate = startDate;
          current.endDate = endDate;
        } else {
          // Start a new entry; the previous line(s) likely had position/company
          flushCurrent();
          current = { startDate, endDate };
        }
      } else {
        // Date embedded inline with other text
        flushCurrent();
        current = { startDate, endDate };

        if (remainder) {
          const parts = remainder.split(/\s*[|•·]\s*|\s+at\s+|\s*,\s+/).filter(Boolean);
          if (parts.length >= 2) {
            current.position = parts[0];
            current.company = parts[1];
          } else {
            current.position = parts[0];
          }
        }
      }
    } else if (current) {
      // If we haven't assigned company yet, this line might be company or position
      if (!current.company && !descLines.length) {
        if (!line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*") && line.length < 80) {
          if (!current.position) {
            current.position = line;
          } else {
            current.company = line;
          }
          continue;
        }
      }
      descLines.push(line.replace(/^[•\-*]\s*/, ""));
    } else {
      // Line before any date — could be a position or company
      // Check if the next line is a date range; if so, start building an entry
      const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
      const nextIsDate = nextLine?.match(dateRangeRegex);
      if (nextIsDate) {
        current = { position: line };
      } else {
        // Start a potential entry anyway
        current = { position: line };
      }
    }
  }
  flushCurrent();

  return entries;
}

function parseEducation(lines: string[]): Education[] {
  if (lines.length === 0) return [];

  const entries: Education[] = [];
  let current: Partial<Education> | null = null;

  const flushCurrent = () => {
    if (current) {
      entries.push({
        id: `edu-${Date.now()}-${entries.length}`,
        institution: current.institution ?? "",
        degree: current.degree ?? "",
        startDate: current.startDate ?? "",
        endDate: current.endDate ?? "",
      });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRangeRegex);
    const standaloneDate = line.match(standaloneDateRangeRegex);

    if (dateMatch) {
      const startDate = dateMatch[1];
      const endDate = dateMatch[2];
      const remainder = line.replace(dateRangeRegex, "").replace(/[|•·,\-–—]+$/g, "").trim();

      if (standaloneDate && current && !current.startDate) {
        // Date on its own line — attach to the current entry
        current.startDate = startDate;
        current.endDate = endDate;
      } else {
        flushCurrent();
        current = { startDate, endDate };
        if (remainder) {
          current.degree = remainder;
        }
      }
    } else if (current) {
      if (!current.degree) {
        current.degree = line;
      } else if (!current.institution) {
        current.institution = line;
      }
    } else {
      // Line before any date — likely degree or institution
      // In both templates, degree appears first then institution below
      current = { degree: line };
    }
  }
  flushCurrent();

  return entries;
}

function parseCertifications(lines: string[]): Certification[] {
  if (lines.length === 0) return [];

  const certs: Certification[] = [];

  for (const line of lines) {
    // Try to extract a year or date
    const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
    const remaining = yearMatch ? line.replace(yearMatch[0], "").trim() : line;

    // Try to split on common delimiters like " - ", " | ", " • "
    const parts = remaining.split(/\s*[-–—|•]\s*/).filter(Boolean);

    certs.push({
      id: `cert-${Date.now()}-${certs.length}`,
      name: parts[0]?.replace(/[,;]+$/, "").trim() ?? line,
      issuer: parts[1]?.replace(/[,;]+$/, "").trim() ?? "",
      date: yearMatch?.[0] ?? "",
    });
  }

  return certs;
}

function parseListSection(lines: string[]): string[] {
  // Skills/languages/hobbies can be comma-separated, bullet-separated, or one-per-line
  const joined = lines.join(" ");

  // First try splitting on common delimiters
  const items = joined
    .split(/[,;•|·]|\n/)
    .map((s) => s.replace(/^[\-*]\s*/, "").trim())
    .filter(Boolean);

  // If we only got one giant item, try splitting on double-space
  if (items.length === 1 && items[0].includes("  ")) {
    return items[0].split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
  }

  return items;
}
