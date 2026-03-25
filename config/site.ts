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
  title: 'Web Developer',
  tagline: 'Building resilient web applications that align with both business requirements and user expectations.',
  location: 'Manteno, Illinois',
  email: 'JjZettler@gmail.com',
  phone: '',             // kept private — stored in NUXT_PRIVATE_PHONE env var
  bio: 'With proficiency as a full stack developer in ColdFusion, Vue, and MySQL, I possess the capabilities to adeptly manage server-side logic, design dynamic interfaces, and efficiently handle databases. This diverse skill set equips me to develop resilient web applications that align with both business requirements and user expectations. I look forward to enhancing my expertise further by exploring new technologies and innovative problem-solving methodologies in the field of development.',
  avatarUrl: '',         // path to /public/ image or external URL
  resumePdfUrl: '',      // optional: external hosted PDF fallback
}

// ── Business / LLC ───────────────────────────────────────────────

export const business = {
  name: 'ILYTAT LLC',              // e.g. "Zettler Solutions LLC"
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
  { name: 'HTML',        category: 'Frontend', level: 85 },
  { name: 'CSS',         category: 'Frontend', level: 80 },
  { name: 'JavaScript',  category: 'Frontend', level: 80 },
  { name: 'Vue',         category: 'Frontend', level: 82 },
  { name: 'MySQL',       category: 'Backend',  level: 78 },
  { name: 'MSSQL',       category: 'Backend',  level: 72 },
  { name: 'ColdFusion',  category: 'Backend',  level: 75 },
  { name: 'CMS (Mura)',  category: 'Tools',    level: 70 },
  { name: 'FTP',         category: 'Tools',    level: 75 },
  { name: 'VDI',         category: 'Tools',    level: 68 },
]

// ── Experience ───────────────────────────────────────────────────

export const experience: ExperienceItem[] = [
  {
    company: 'Cleveland Steel Container Corporation',
    role: 'Machine Operator – DownStacker/Lithography',
    startDate: 'March 2024',
    location: 'Illinois',
    type: 'full-time',
    highlights: [
      'Oversaw material quality and ensured client expectations were consistently met',
      'Prioritized equipment upkeep to ensure smooth operation and a high standard of cleanliness',
      'Maintained a primary focus on workplace safety throughout all operations',
    ],
  },
  {
    company: 'Mind-Over-Data',
    role: 'Developer I',
    startDate: 'June 2022',
    endDate: 'July 2023',
    type: 'full-time',
    highlights: [
      'Utilized FileZilla and VDI interfaces for remote computing control',
      'Adapted code to fulfill client needs and managed ticketing systems',
      'Developed and maintained sites using the CMS Mura platform',
    ],
  },
  {
    company: 'Noodles and Company',
    role: 'Assistant General Manager',
    startDate: 'April 2019',
    endDate: 'October 2021',
    type: 'full-time',
    highlights: [
      'Collaborated with the General Manager to oversee daily restaurant operations',
      'Managed employee training, Excel spreadsheets, and daily financial records',
      'Engaged with guests to ensure a high standard of satisfaction',
    ],
  },
]

// ── Education ────────────────────────────────────────────────────

export const education: EducationItem[] = [
  {
    institution: 'Hillcrest High School',
    degree: 'General Studies',
    graduationYear: '2010',
    honors: 'Country Club Hills, Illinois',
  },
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
  showAbout:     true,
  showSkills:    true,
  showExperience: true,
  showProjects:  true,
  showBlog:      true,
  showContact:   true,
  showServices:  true,
  showInterview: false,  // AI-powered "Ask Me Anything" chat
  showReferences: true, // Shows "References available on request" note (actual data is private)

  // Nav
  siteUrl: 'https://ilytat.com',   // update when domain is live

  // Copyright
  copyrightYear: 2026,

  // Public theme (applied to all site visitors)
  // Options: 'midnight' | 'glass' | 'aero' | 'noir' | 'slate' | 'dawn' | 'dreamer' | 'yinyang'
  theme: 'midnight',
}
