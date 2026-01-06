'use client';

import React from 'react';
import { FormData } from '../../types/form';

interface ProfessionalSummaryProps {
  formData: FormData;
  onUpdate: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function ProfessionalSummary({ formData, onUpdate, errors }: ProfessionalSummaryProps) {
  const maxLength = 500;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      onUpdate('summary', value);
    }
  };

  return (
    <fieldset className="form-group">
      <legend>Professional Summary</legend>
      
      <div className="input-group">
        <label htmlFor="summary">Professional Summary *</label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          required
          placeholder="Brief overview of your professional background, key achievements, and career objectives..."
          value={formData.summary || ''}
          onChange={handleChange}
        />
        <div className="char-counter">
          <span>{formData.summary?.length || 0}</span>/{maxLength} characters
        </div>
        {errors.summary && (
          <div className="error-message">{errors.summary}</div>
        )}
      </div>
    </fieldset>
  );
}