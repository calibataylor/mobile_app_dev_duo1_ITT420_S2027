export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  title: string;
  email: string;
  phone: string;
  office: string;
  photo?: string;
  bio?: string;
  specialization?: string;
  office_hours?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  description: string;
  prerequisites: string[];
  lecturer: string;
  semester: string;
  assessment_methods: string[];
  learning_outcomes: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  important: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  available: string;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  important: boolean;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
