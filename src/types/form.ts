export interface FormData {
  name?: string;
  suffix?: string;
  email?: string;
  phone?: string;
  // Stored as a data URL (base64) for autosave/preview
  photo?: string | null;
  summary?: string;
  experience?: string;
  education?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    additional?: Array<{
      id: number;
      details: string;
    }>;
  };
  skills?: string[];
}