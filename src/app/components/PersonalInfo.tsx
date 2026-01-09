"use client";

import React from "react";
import { FormData } from "../../types/form";

interface PersonalInfoProps {
  formData: FormData;
  onUpdate: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function PersonalInfo({
  formData,
  onUpdate,
  errors,
}: PersonalInfoProps) {
  return (
    <fieldset className="form-group">
      <legend>Personal Information</legend>

      <div className="input-group">
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={(e) => onUpdate("name", e.target.value)}
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
          value={formData.suffix || ""}
          onChange={(e) => onUpdate("suffix", e.target.value)}
        />
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={(e) => onUpdate("email", e.target.value)}
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
            value={formData.phone || ""}
            onChange={(e) => onUpdate("phone", e.target.value)}
            required
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
      </div>
    </fieldset>
  );
}
