import { person } from './config/site'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

loadEnv({ path: resolve(__dirname, '.env.local') })

export default defineNuxtConfig({
  devtools: { enabled: true },

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,  // Register by filename only — no directory prefix needed
      },
    ],
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
  ],

  css: [
    '~/assets/css/main.css',
    '~/assets/css/themes.css',
    '~/assets/css/print.css',
  ],

  app: {
    head: {
      title: person.name,
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: `${person.name} — ${person.title}` },
        { name: 'theme-color', content: '#04060f' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: person.name },
        { property: 'og:description', content: person.title },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  runtimeConfig: {
    adminPassword:       process.env.NUXT_ADMIN_PASSWORD ?? '',
    jwtSecret:           process.env.NUXT_JWT_SECRET ?? '',
    firebaseProjectId:   process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID ?? '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    firebasePrivateKey:  process.env.FIREBASE_PRIVATE_KEY ?? '',
    // Private contact/reference data — never exposed to the client
    privatePhone:        process.env.NUXT_PRIVATE_PHONE ?? '',
    privateReferences:   process.env.NUXT_PRIVATE_REFERENCES ?? '[]',
  },

  nitro: {
    preset: 'vercel',
    externals: {
      external: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/firestore'],
    },
  },

  content: {
    highlight: {
      theme: 'github-dark',
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-11-01',
})
