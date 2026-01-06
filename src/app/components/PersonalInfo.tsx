'use client';

import React, { useState, useRef } from 'react';
import { FormData } from '../../types/form';

interface PersonalInfoProps {
  formData: FormData;
  onUpdate: (field: string, value: string | File | null) => void;
  errors: Record<string, string>;
}

export function PersonalInfo({ formData, onUpdate, errors }: PersonalInfoProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperCanvasRef = useRef<HTMLCanvasElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setCropperVisible(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (!cropperCanvasRef.current || !originalImage) return;

    const canvas = cropperCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temp image to get dimensions
    const img = new Image();
    img.onload = () => {
      // Get smallest dimension for square crop
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      // Set canvas to square size
      canvas.width = size;
      canvas.height = size;

      // Draw cropped region
      ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

      // Resize if needed (max 800px)
      const maxSize = 800;
      if (size > maxSize) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = maxSize;
        scaledCanvas.height = maxSize;
        const scaledCtx = scaledCanvas.getContext('2d');
        if (scaledCtx) {
          scaledCtx.drawImage(canvas, 0, 0, maxSize, maxSize);
          const dataUrl = scaledCanvas.toDataURL('image/jpeg', 0.8);
          setPhotoPreview(dataUrl);
          onUpdate('photo', dataUrl);
        }
      } else {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(dataUrl);
        onUpdate('photo', dataUrl);
      }
      setCropperVisible(false);
      setOriginalImage(null);
    };
    img.src = originalImage;
  };

  const handleCancelCrop = () => {
    setCropperVisible(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <fieldset className="form-group">
      <legend>Personal Information</legend>
      
      <div className="input-group">
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={(e) => onUpdate('name', e.target.value)}
          required
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="input-group">
        <label htmlFor="suffix">Suffix</label>
        <input
          type="text"
          id="suffix"
          name="suffix"
          value={formData.suffix || ''}
          onChange={(e) => onUpdate('suffix', e.target.value)}
        />
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={(e) => onUpdate('email', e.target.value)}
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="input-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={(e) => onUpdate('phone', e.target.value)}
            required
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="photo">Profile Photo (will be cropped to square) *</label>
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          ref={fileInputRef}
        />
        <div className="file-info">Max size: 2MB. Formats: JPG, PNG, GIF</div>
        
        {cropperVisible && originalImage && (
          <div className="photo-cropper">
            <div className="cropper-overlay">
              <div className="cropper-content">
                <canvas 
                  ref={cropperCanvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    border: '1px solid #ccc'
                  }}
                />
                <div className="cropper-controls">
                  <button type="button" onClick={handleCrop} className="primary-btn">
                    Crop & Save
                  </button>
                  <button type="button" onClick={handleCancelCrop} className="secondary-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {photoPreview && !cropperVisible && (
          <div className="photo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={photoPreview} 
              alt="Profile preview"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}
            />
          </div>
        )}
      </div>
    </fieldset>
  );
}