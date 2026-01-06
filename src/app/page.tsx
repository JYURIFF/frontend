'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersonalInfo } from './components/PersonalInfo';
import { ProfessionalSummary } from './components/ProfessionalSummary';
import { WorkExperience } from './components/WorkExperience';
import { Education } from './components/Education';
import { FormData } from '../types/form';
import { validateField, validateForm } from '../utils/validation';
import { SkillsTags } from './components/SkillsTags';
// Removed: import { generateResumeHtml } from './components/Preview'; // Not used in submit anymore
import { db, debouncedSaveFormData } from '../utils/indexedDB';

export default function Home() {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const handleFormUpdate = (field: string, value: unknown) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));

    const fieldError = validateField(field, value);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    } else if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    const requiredFields = ['name', 'email', 'phone', 'summary', 'experience'];
    const filledRequiredFields = requiredFields.filter(f => {
      const v = (formData as Record<string, unknown>)[f];
      return v && String(v).trim() !== '' && !errors[f];
    });

    setProgress(Math.round((filledRequiredFields.length / requiredFields.length) * 100));
  };

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await db.loadFormData();
        if (savedData) setFormData(savedData);
      } catch (e) {
        console.error('Failed to load saved form data:', e);
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    debouncedSaveFormData(formData);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TEMP: Log data before API call
    console.log('✅ Form validation passed! Sending data:', JSON.stringify(formData, null, 2));

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const requiredFields = ['name', 'email', 'phone', 'summary', 'experience'];
      const validFields = requiredFields.filter(f => !formErrors[f]);
      setProgress(Math.round((validFields.length / requiredFields.length) * 100));

      const firstField = document.querySelector(`[name="${Object.keys(formErrors)[0]}"]`);
      if (firstField instanceof HTMLElement) firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsSubmitting(false);
      return;
    }

    try {
      // CHANGE THIS: Your API endpoint & any auth headers
      const response = await fetch('/api/generate-resume', {  // e.g., 'https://your-api.com/generate-pdf'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer your-token', // If needed
        },
        body: JSON.stringify(formData),  // Full form data (incl. photo base64, skills array)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = `${(formData.name || 'resume').replace(/\s+/g, '_')}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Optional: Clear local data after successful API call
      // await db.clearFormData();
      
      console.log('Resume downloaded via API!');
    } catch (err) {
      console.error('API call failed:', err);
      alert('Failed to create resume. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Header progress={progress} />
      <div className="main-content">
        <div className="form-section">
          <form id="resumeForm" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              <PersonalInfo formData={formData} onUpdate={handleFormUpdate} errors={errors} />
              <ProfessionalSummary formData={formData} onUpdate={handleFormUpdate} errors={errors} />
              <WorkExperience formData={formData} onUpdate={handleFormUpdate} errors={errors} />
              <Education formData={formData} onUpdate={handleFormUpdate} />
              <SkillsTags formData={formData} onUpdate={handleFormUpdate} />
              <div style={{ marginTop: 12 }}>
                <button 
                  type="submit" 
                  className="generate-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}