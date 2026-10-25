import Papa from "papaparse";
import * as XLSX from "xlsx";
import Fuse from "fuse.js";

export const MAX_RECIPIENT_ROWS = 5000;

export interface ParsedRow {
  index: number;
  raw: Record<string, string>;
  name: string;
  email?: string;
  fields: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

export const COMMON_FIELD_ALIASES: Record<string, string[]> = {
  recipient_name: [
    "recipient_name",
    "name",
    "full_name",
    "student_name",
    "candidate_name",
    "participant_name",
    "participant",
    "recipient",
    "attendee",
  ],
  recipient_email: [
    "recipient_email",
    "email",
    "email_address",
    "mail",
    "contact_email",
    "student_email",
  ],
  title: [
    "title",
    "course",
    "course_name",
    "event",
    "event_name",
    "program",
    "program_name",
    "workshop",
    "topic",
  ],
  date: [
    "date",
    "issue_date",
    "completion_date",
    "event_date",
    "issued_on",
    "awarded_on",
  ],
  grade: [
    "grade",
    "score",
    "rank",
    "position",
    "marks",
    "percentage",
    "result",
    "division",
  ],
  signatory_name: [
    "signatory",
    "signatory_name",
    "signed_by",
    "instructor",
    "director",
    "dean",
    "president",
  ],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Automatically suggests matching file columns for each required/supported template field using Fuse.js.
 */
export function autoMatchColumns(
  templateFields: string[],
  fileHeaders: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  if (!fileHeaders.length || !templateFields.length) return mapping;

  const normalizedHeaders = fileHeaders.map((h) => ({
    original: h,
    clean: h.toLowerCase().trim().replace(/[^a-z0-9]/g, "_"),
  }));

  const fuse = new Fuse(normalizedHeaders, {
    keys: ["clean", "original"],
    threshold: 0.4,
  });

  for (const tField of templateFields) {
    const cleanTField = tField.toLowerCase().trim();
    const aliases = COMMON_FIELD_ALIASES[cleanTField] || [cleanTField];

    // 1. Direct exact or alias match first
    let matched = false;
    for (const alias of aliases) {
      const exactMatch = normalizedHeaders.find(
        (h) => h.clean === alias || h.clean.includes(alias)
      );
      if (exactMatch) {
        mapping[tField] = exactMatch.original;
        matched = true;
        break;
      }
    }

    // 2. Fuzzy search fallback if no exact alias matched
    if (!matched) {
      const results = fuse.search(cleanTField);
      if (results.length > 0 && results[0].item) {
        mapping[tField] = results[0].item.original;
      }
    }
  }

  return mapping;
}

/**
 * Parses raw CSV string or File into headers and sanitized rows.
 */
export function parseCSV(content: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: "greedy",
  });

  const headers = parsed.meta.fields || [];
  const rawRows = (parsed.data || []).slice(0, MAX_RECIPIENT_ROWS);
  const matched = autoMatchColumns(["recipient_name", "recipient_email"], headers);

  return sanitizeAndValidateRows(headers, rawRows, {
    recipient_name: matched.recipient_name || headers[0] || "recipient_name",
    recipient_email: matched.recipient_email || "",
  });
}

/**
 * Parses Excel (.xlsx, .xls) buffer into headers and sanitized rows.
 */
export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [], totalRows: 0, validCount: 0, invalidCount: 0 };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
    defval: "",
    raw: false,
  });

  if (!jsonData.length) {
    return { headers: [], rows: [], totalRows: 0, validCount: 0, invalidCount: 0 };
  }

  const headers = Object.keys(jsonData[0]);
  const rawRows = jsonData.slice(0, MAX_RECIPIENT_ROWS);
  const matched = autoMatchColumns(["recipient_name", "recipient_email"], headers);

  return sanitizeAndValidateRows(headers, rawRows, {
    recipient_name: matched.recipient_name || headers[0] || "recipient_name",
    recipient_email: matched.recipient_email || "",
  });
}

/**
 * Sanitizes and validates recipient rows against column mapping and basic business constraints.
 */
export function sanitizeAndValidateRows(
  headers: string[],
  rawRows: Record<string, string>[],
  columnMapping: Record<string, string>
): ParseResult {
  const rows: ParsedRow[] = [];
  const seenEmails = new Set<string>();

  const nameCol = columnMapping.recipient_name || columnMapping.name;
  const emailCol = columnMapping.recipient_email || columnMapping.email;

  rawRows.forEach((raw, idx) => {
    const errors: string[] = [];
    const nameVal = (nameCol ? raw[nameCol] : "")?.trim() || "";
    const emailVal = (emailCol ? raw[emailCol] : "")?.trim() || "";

    if (!nameVal) {
      errors.push("Missing recipient name");
    } else if (nameVal.length < 2) {
      errors.push("Name too short (minimum 2 characters)");
    } else if (nameVal.length > 100) {
      errors.push("Name too long (maximum 100 characters)");
    }

    if (emailVal) {
      if (!EMAIL_REGEX.test(emailVal)) {
        errors.push("Invalid email format");
      } else {
        const lowerEmail = emailVal.toLowerCase();
        if (seenEmails.has(lowerEmail)) {
          errors.push(`Duplicate email (${emailVal})`);
        } else {
          seenEmails.add(lowerEmail);
        }
      }
    }

    // Custom mapped fields
    const fields: Record<string, string> = {};
    for (const [tplKey, fileCol] of Object.entries(columnMapping)) {
      if (tplKey !== "recipient_name" && tplKey !== "recipient_email" && fileCol) {
        fields[tplKey] = (raw[fileCol] || "").trim();
      }
    }

    rows.push({
      index: idx + 1,
      raw,
      name: nameVal,
      email: emailVal || undefined,
      fields,
      isValid: errors.length === 0,
      errors,
    });
  });

  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return {
    headers,
    rows,
    totalRows: rows.length,
    validCount,
    invalidCount,
  };
}
