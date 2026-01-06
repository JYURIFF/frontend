'use client';

import React from 'react';
import { FormData } from '../../types/form';

interface WorkExperienceProps {
  formData: FormData;
  onUpdate: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function WorkExperience({ formData, onUpdate, errors }: WorkExperienceProps) {
  return (
    <fieldset className="form-group">
      <legend>Work Experience</legend>
      
      <div className="input-group">
        <label htmlFor="experience">Work Experience *</label>
        <textarea
          id="experience"
          name="experience"
          rows={6}
          required
          placeholder="List your work experience including job titles, companies, dates, and key responsibilities..."
          value={formData.experience || ''}
          onChange={(e) => onUpdate('experience', e.target.value)}
        />
        {errors.experience && (
          <div className="error-message">{errors.experience}</div>
        )}
      </div>
    </fieldset>
  );
}