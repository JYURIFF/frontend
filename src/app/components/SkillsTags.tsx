"use client";

import React, { useState } from 'react';
import { FormData } from '../../types/form';

interface SkillsTagsProps {
  formData: FormData;
  onUpdate: (field: string, value: unknown) => void;
}

export function SkillsTags({ formData, onUpdate }: SkillsTagsProps) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const val = input.trim();
    if (!val) return;
    const skills = Array.isArray(formData.skills) ? formData.skills : [];
    if (skills.includes(val)) {
      setInput('');
      return;
    }
    const newSkills = [...skills, val];
    onUpdate('skills', newSkills);
    setInput('');
  };

  const removeSkill = (s: string) => {
    const skills = Array.isArray(formData.skills) ? formData.skills : [];
    onUpdate('skills', skills.filter(k => k !== s));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <fieldset className="form-group">
      <legend>Skills</legend>
      <div className="input-group">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add a skill and press Enter"
          />
          <button type="button" onClick={addSkill} className = "add-btn">Add</button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(formData.skills || []).map((s) => (
            <span key={s} className="skill-tag" style={{ padding: '4px 8px', background: '#eef2ff', borderRadius: 6 }}>
              {s}
              <button type="button" onClick={() => removeSkill(s)} style={{ marginLeft: 8 }}>×</button>
            </span>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
