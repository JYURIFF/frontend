export interface FormData {
  name?: string;
  suffix?: string;
  email?: string;
  phone?: string;
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
