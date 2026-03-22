import { defineStore } from 'pinia'
import {
  person,
  business,
  social,
  skills,
  experience,
  education,
  projects,
  siteSettings,
} from '~/config/site'

export const useSiteStore = defineStore('site', {
  state: () => ({
    person: { ...person },
    business: { ...business },
    social: { ...social },
    skills: [...skills],
    experience: [...experience],
    education: [...education],
    projects: [...projects],
    siteSettings: { ...siteSettings },
  }),

  getters: {
    // Presence checks — used to conditionally render sections
    hasSkills:      (s) => s.skills.length > 0,
    hasExperience:  (s) => s.experience.length > 0,
    hasEducation:   (s) => s.education.length > 0,
    hasProjects:    (s) => s.projects.length > 0,
    hasFeatured:    (s) => s.projects.some((p) => p.featured),
    hasBio:         (s) => !!s.person.bio?.trim(),
    hasContact:     (s) => !!(s.person.email || s.person.phone),
    hasSocial:      (s) => Object.values(s.social).some(Boolean),
    hasBusiness:    (s) => !!s.business.name?.trim(),
    hasServices:    (s) => s.business.services.length > 0,

    // Derived
    skillsByCategory: (s) => {
      const map: Record<string, typeof s.skills> = {}
      for (const skill of s.skills) {
        if (!map[skill.category]) map[skill.category] = []
        map[skill.category].push(skill)
      }
      return map
    },

    featuredProjects: (s) => s.projects.filter((p) => p.featured),

    currentRole: (s) => {
      const current = s.experience.find((e) => !e.endDate)
      return current ?? s.experience[0] ?? null
    },

    socialLinks: (s) => {
      const links: { platform: string; url: string; label: string }[] = []

      if (s.social.github)
        links.push({ platform: 'github', url: `https://github.com/${s.social.github}`, label: 'GitHub' })
      if (s.social.linkedin)
        links.push({ platform: 'linkedin', url: `https://linkedin.com/in/${s.social.linkedin}`, label: 'LinkedIn' })
      if (s.social.twitter)
        links.push({ platform: 'twitter', url: `https://twitter.com/${s.social.twitter}`, label: 'Twitter' })
      if (s.social.instagram)
        links.push({ platform: 'instagram', url: `https://instagram.com/${s.social.instagram}`, label: 'Instagram' })
      if (s.social.youtube)
        links.push({ platform: 'youtube', url: `https://youtube.com/@${s.social.youtube}`, label: 'YouTube' })

      return links
    },
  },

  actions: {
    async refresh() {
      const data = await $fetch('/api/site-data').catch(() => null)
      if (data) {
        this.$patch(data as Parameters<typeof this.$patch>[0])
      }
    },
  },
})
