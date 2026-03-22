/**
 * Persistent storage via Firebase Admin Firestore.
 * All existing callers (kvGet / kvSet / kvDel / getSiteData) work unchanged.
 */
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

let _db: import('firebase-admin/firestore').Firestore | null = null
let _initAttempted = false

async function getDb() {
  if (_db) return _db
  if (_initAttempted) return null   // don't retry after a failed attempt
  _initAttempted = true

  const config = useRuntimeConfig()
  const projectId   = config.firebaseProjectId   as string | undefined
  const clientEmail = config.firebaseClientEmail as string | undefined
  const rawKey      = config.firebasePrivateKey  as string | undefined
  // dotenv with double-quoted values converts \n → real newlines, but handle both forms
  const privateKey  = rawKey?.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[DB] Firebase credentials not configured — storage disabled.')
    return null
  }

  try {
    const { initializeApp, cert, getApps, getApp } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')

    const app = getApps().length
      ? getApp()
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })

    _db = getFirestore(app)
    console.info('[DB] Firebase connected — project:', projectId)
    return _db
  } catch (err) {
    console.error('[DB] Firebase init failed:', err)
    return null
  }
}

/** Map a KV key to a safe Firestore document ID. */
function toDocId(key: string): string {
  return key.replace(/:/g, '--').replace(/\//g, '__sl__')
}

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb()
    if (!db) return null
    const snap = await db.collection('kv').doc(toDocId(key)).get()
    if (!snap.exists) return null
    return (snap.data() as { v: T } | undefined)?.v ?? null
  } catch {
    return null
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDb()
    if (!db) return
    await db.collection('kv').doc(toDocId(key)).set({ v: value })
  } catch (err) {
    console.error('[DB] kvSet error for key', key, err)
  }
}

export async function kvDel(key: string): Promise<void> {
  try {
    const db = await getDb()
    if (!db) return
    await db.collection('kv').doc(toDocId(key)).delete()
  } catch (err) {
    console.error('[DB] kvDel error for key', key, err)
  }
}

/** Returns true if Firebase is configured and reachable. */
export async function isDbConnected(): Promise<boolean> {
  try {
    const db = await getDb()
    if (!db) return false
    await db.collection('kv').limit(1).get()
    return true
  } catch {
    return false
  }
}

export async function getSiteData() {
  const [
    kvPerson,
    kvBusiness,
    kvSocial,
    kvSkills,
    kvExperience,
    kvEducation,
    kvProjects,
    kvSettings,
  ] = await Promise.all([
    kvGet('site:person'),
    kvGet('site:business'),
    kvGet('site:social'),
    kvGet('site:skills'),
    kvGet('site:experience'),
    kvGet('site:education'),
    kvGet('site:projects'),
    kvGet('site:settings'),
  ])

  return {
    person:       kvPerson      ?? { ...person },
    business:     kvBusiness    ?? { ...business },
    social:       kvSocial      ?? { ...social },
    skills:       kvSkills      ?? [...skills],
    experience:   kvExperience  ?? [...experience],
    education:    kvEducation   ?? [...education],
    projects:     kvProjects    ?? [...projects],
    siteSettings: kvSettings    ?? { ...siteSettings },
  }
}
