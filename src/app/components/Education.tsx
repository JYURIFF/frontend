'use client';

import React from 'react';
import { FormData } from '../../types/form';

interface EducationProps {
  formData: FormData;
  onUpdate: (field: string, value: unknown) => void;
}

export function Education({ formData, onUpdate }: EducationProps) {
  const handleEducationChange = (level: string, value: string) => {
    onUpdate('education', {
      ...formData.education,
      [level]: value,
    });
  };

  return (
    <fieldset className="form-group">
      <legend>Educational Background</legend>
      
      <div id="educationContainer">
        <div className="education-item">
          <div className="education-header">
            <h4>Primary Education</h4>
          </div>
          <div className="education-content">
            <div className="input-group">
              <label htmlFor="primaryEducation">Institution & Details</label>
              <textarea
                id="primaryEducation"
                name="primaryEducation"
                rows={2}
                placeholder="School name, location, achievements..."
                value={formData.education?.primary || ''}
                onChange={(e) => handleEducationChange('primary', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="education-item">
          <div className="education-header">
            <h4>Secondary Education</h4>
          </div>
          <div className="education-content">
            <div className="input-group">
              <label htmlFor="secondaryEducation">Institution & Details</label>
              <textarea
                id="secondaryEducation"
                name="secondaryEducation"
                rows={2}
                placeholder="School name, location, achievements..."
                value={formData.education?.secondary || ''}
                onChange={(e) => handleEducationChange('secondary', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="education-item">
          <div className="education-header">
            <h4>Tertiary Education</h4>
          </div>
          <div className="education-content">
            <div className="input-group">
              <label htmlFor="tertiaryEducation">Institution & Details</label>
              <textarea
                id="tertiaryEducation"
                name="tertiaryEducation"
                rows={2}
                placeholder="University/College name, degree, field of study..."
                value={formData.education?.tertiary || ''}
                onChange={(e) => handleEducationChange('tertiary', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}