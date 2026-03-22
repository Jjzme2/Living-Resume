// ================================================================
//  SITE CONFIGURATION
//  Edit this file to update everything across the entire site.
//  All pages, the resume, and the blog pull from here.
// ================================================================

// ── Types ────────────────────────────────────────────────────────

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  youtube?: string
}

export interface Skill {
  name: string
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Tools' | 'Soft Skills' | string
  level?: number // 1–100 (optional visual indicator)
}

export interface ExperienceItem {
  company: string
  role: string
  startDate: string
  endDate?: string // omit for current position
  location?: string
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance'
  highlights: string[]
}

export interface EducationItem {
  institution: string
  degree: string
  field?: string
  graduationYear?: string
  honors?: string
}

export interface Project {
  title: string
  description: string
  tags: string[]
  url?: string
  repo?: string
  featured?: boolean
  image?: string
}

export interface Service {
  title: string
  description: string
  icon?: string
}

// ── Personal ─────────────────────────────────────────────────────

export const person = {
  name: 'Jj Zettler',
  fullName: 'John Zettler Jr',
  initials: 'JZ',
  title: 'Developer & Entrepreneur',
  tagline: '',           // e.g. "Building things people love."
  location: '',          // e.g. "Northeast Ohio"
  email: '',             // e.g. "jj@example.com"
  phone: '',             // e.g. "+1 (555) 000-0000"
  bio: '',               // 2–4 sentence personal statement for About section
  avatarUrl: '',         // path to /public/ image or external URL
  resumePdfUrl: '',      // optional: external hosted PDF fallback
}

// ── Business / LLC ───────────────────────────────────────────────

export const business = {
  name: '',              // e.g. "Zettler Solutions LLC"
  tagline: '',           // e.g. "Web solutions for small businesses."
  description: '',       // longer description
  url: '',               // business website if separate
  services: [] as Service[],
  // Example:
  // services: [
  //   { title: 'Web Development', description: 'Custom sites and apps built to perform.' },
  //   { title: 'Consulting', description: 'Technical guidance for your next project.' },
  // ],
}

// ── Social Links ─────────────────────────────────────────────────

export const social: SocialLinks = {
  github: '',            // username only, e.g. "jjzettler"
  linkedin: '',          // username only, e.g. "jjzettler"
  twitter: '',           // username only
  instagram: '',
  youtube: '',
}

// ── Skills ───────────────────────────────────────────────────────

export const skills: Skill[] = [
  // Examples — replace with your own:
  // { name: 'Nuxt / Vue',       category: 'Frontend',  level: 85 },
  // { name: 'TypeScript',       category: 'Frontend',  level: 78 },
  // { name: 'Node.js',          category: 'Backend',   level: 75 },
  // { name: 'Nitro',            category: 'Backend',   level: 72 },
  // { name: 'PostgreSQL',       category: 'Backend',   level: 65 },
  // { name: 'Pinia',            category: 'Frontend',  level: 82 },
  // { name: 'Git',              category: 'Tools',     level: 80 },
  // { name: 'Vercel / Deploy',  category: 'DevOps',    level: 70 },
]

// ── Experience ───────────────────────────────────────────────────

export const experience: ExperienceItem[] = [
  // Example:
  // {
  //   company: 'Company Name',
  //   role: 'Developer I',
  //   startDate: 'Jan 2022',
  //   endDate: 'Dec 2023',
  //   location: 'Remote',
  //   type: 'full-time',
  //   highlights: [
  //     'Built X resulting in Y improvement',
  //     'Led initiative to modernize Z',
  //   ],
  // },
]

// ── Education ────────────────────────────────────────────────────

export const education: EducationItem[] = [
  // Example:
  // {
  //   institution: 'University Name',
  //   degree: 'Associate of Applied Science',
  //   field: 'Information Technology',
  //   graduationYear: '2021',
  // },
]

// ── Projects ─────────────────────────────────────────────────────

export const projects: Project[] = [
  // Example:
  // {
  //   title: 'Project Name',
  //   description: 'What it does and why it matters.',
  //   tags: ['Nuxt', 'TypeScript', 'Pinia'],
  //   url: 'https://example.com',
  //   repo: 'https://github.com/jjzettler/project',
  //   featured: true,
  // },
]

// ── Site Settings ────────────────────────────────────────────────

export const siteSettings = {
  // Toggle entire sections
  showAbout:    true,
  showSkills:   true,
  showExperience: true,
  showProjects: true,
  showBlog:     true,
  showContact:  true,
  showServices: true,

  // Nav
  siteUrl: 'https://jjzettler.com',   // update when domain is live

  // Copyright
  copyrightYear: 2026,

  // Public theme (applied to all site visitors)
  // Options: 'midnight' | 'glass' | 'aero' | 'noir' | 'slate' | 'dawn' | 'dreamer' | 'yinyang'
  theme: 'midnight',
}
