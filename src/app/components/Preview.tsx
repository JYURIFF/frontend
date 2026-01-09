"use client";

import React, { useRef, useMemo } from "react";
import { FormData } from "../../types/form";

interface PreviewProps {
  formData: FormData;
}

export function generateResumeHtml(formData: FormData) {
  const skills = (formData.skills || []).map((s) => `<li>${s}</li>`).join("");
  const education = formData.education || {};

  const educationList = [
    { level: "Primary Education", value: education.primary },
    { level: "Secondary Education", value: education.secondary },
    { level: "Tertiary Education", value: education.tertiary },
  ]
    .filter((e) => e.value)
    .map(
      (e) =>
        `<div class="education-item">
      <h4>${e.level}</h4>
      <div>${e.value}</div>
     </div>`
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${formData.name || "Resume"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            margin: 15mm;
            size: A4;
          }
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
          }
          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 6mm;
            padding-bottom: 4mm;
            border-bottom: 0.5mm solid #e5e7eb;
          }
          .header-content {
            flex: 1;
          }
          h1 {
            margin: 0 0 2mm 0;
            font-size: 28pt;
            font-weight: 700;
            color: #111827;
            line-height: 1.2;
          }
          .contact {
            font-size: 11pt;
            color: #4b5563;
          }

          .section {
            margin: 6mm 0;
          }
          .section:first-of-type {
            margin-top: 0;
          }
          h2 {
            font-size: 14pt;
            font-weight: 600;
            color: #2563eb;
            margin: 0 0 3mm 0;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            padding-bottom: 1mm;
            border-bottom: 0.25mm solid #e5e7eb;
          }
          p {
            margin: 0 0 3mm 0;
            font-size: 11pt;
            text-align: justify;
          }
          ul.skills {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2mm;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          ul.skills li {
            position: relative;
            padding-left: 4mm;
            font-size: 11pt;
          }
          ul.skills li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #2563eb;
          }
          .experience p {
            white-space: pre-line;
          }
          .education-item {
            margin-bottom: 3mm;
          }
          .education-item:last-child {
            margin-bottom: 0;
          }
          .education-item h4 {
            margin: 0 0 1mm 0;
            font-size: 11pt;
            font-weight: 600;
            color: #374151;
          }
          .education-item div {
            font-size: 11pt;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-content">
            <h1>${formData.name || ""}${
    formData.suffix ? `, ${formData.suffix}` : ""
  }</h1>
            <div class="contact">${formData.email || ""} • ${
    formData.phone || ""
  }</div>
          </div>
        </div>

        <div class="section">
          <h2>Professional Summary</h2>
          <p>${formData.summary || ""}</p>
        </div>

        <div class="section">
          <h2>Skills & Expertise</h2>
          <ul class="skills">${skills}</ul>
        </div>

        <div class="section experience">
          <h2>Work Experience</h2>
          <p>${(formData.experience || "").replace(/\n/g, "<br/>")}</p>
        </div>

        ${
          educationList
            ? `
          <div class="section">
            <h2>Education</h2>
            ${educationList}
          </div>
        `
            : ""
        }
      </body>
    </html>
  `;
}

export function Preview({ formData }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const srcDoc = useMemo(() => generateResumeHtml(formData), [formData]);

  return (
    <div className="form-group">
      <legend>Preview</legend>
      <div style={{ marginTop: 8, height: "calc(100vh - 220px)" }}>
        <iframe
          ref={iframeRef}
          title="resume-preview"
          srcDoc={srcDoc}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #e6e6e6",
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
}
