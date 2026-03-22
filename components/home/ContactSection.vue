<template>
  <section v-if="store.siteSettings.showContact" id="contact" class="section contact-section">
    <!-- Background accent glow -->
    <div class="contact-glow" aria-hidden="true" />

    <div class="container">
      <SectionHeading
        :label="sectionContent.contact.label"
        :title="sectionContent.contact.title"
        :accent="sectionContent.contact.accent"
        :description="sectionContent.contact.description"
      />

      <div class="contact-layout reveal">
        <!-- Contact card -->
        <GlassCard class="contact-card" padding="lg" glow>
          <div class="contact-items">
            <a
              v-if="store.person.email"
              :href="`mailto:${store.person.email}`"
              class="contact-item"
            >
              <div class="contact-icon">
                <SocialIcon platform="email" :size="20" />
              </div>
              <div>
                <p class="contact-item-label">Email</p>
                <p class="contact-item-value">{{ store.person.email }}</p>
              </div>
              <svg class="contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>

            <a
              v-if="store.person.phone"
              :href="`tel:${store.person.phone.replace(/\D/g,'')}`"
              class="contact-item"
            >
              <div class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.13 6.13l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2Z"/>
                </svg>
              </div>
              <div>
                <p class="contact-item-label">Phone</p>
                <p class="contact-item-value">{{ store.person.phone }}</p>
              </div>
              <svg class="contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          <!-- Social links in contact section -->
          <div v-if="store.hasSocial" class="contact-social">
            <p class="contact-social-label">{{ sectionContent.contact.socialLabel }}</p>
            <div class="social-row">
              <a
                v-for="link in store.socialLinks"
                :key="link.platform"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
              >
                <SocialIcon :platform="link.platform" :size="18" />
                <span>{{ link.label }}</span>
              </a>
            </div>
          </div>

          <!-- CTA if no direct contact info yet -->
          <div v-if="!store.hasContact && !store.hasSocial" class="no-contact">
            <p>{{ sectionContent.contact.noContactPlaceholder }}</p>
          </div>
        </GlassCard>

        <!-- Availability / hire me card -->
        <GlassCard class="hire-card" hoverable padding="lg">
          <div class="hire-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 class="hire-title">{{ sectionContent.contact.hireTitle }}</h3>
          <p class="hire-body">{{ sectionContent.contact.hireBody }}</p>
          <a
            v-if="store.person.email"
            :href="`mailto:${store.person.email}?subject=${encodeURIComponent(sectionContent.contact.emailSubject)}`"
            class="btn btn-primary"
            style="margin-top: var(--sp-4)"
          >
            {{ sectionContent.contact.ctaConversation }}
          </a>
          <NuxtLink
            v-else
            to="/resume"
            class="btn btn-primary"
            style="margin-top: var(--sp-4)"
          >
            {{ sectionContent.contact.ctaResume }}
          </NuxtLink>
        </GlassCard>
      </div>

      <!-- Contact Form Card — full-width below the two-column layout -->
      <GlassCard class="form-card reveal" padding="lg">
        <h3 class="form-card-title">Send a Message</h3>
        <p class="form-card-sub">Fill out the form below and I'll get back to you as soon as possible.</p>

        <Transition name="fade">
          <div v-if="formSuccess" class="form-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Message sent! I'll get back to you soon.
          </div>
        </Transition>

        <form v-if="!formSuccess" class="contact-form" @submit.prevent="submitForm">
          <!-- Honeypot -->
          <input
            v-model="honeypot"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
            style="display:none"
          />

          <div class="form-row">
            <div class="form-field">
              <label class="form-label" for="cf-name">Name <span class="req">*</span></label>
              <input
                id="cf-name"
                v-model="contactForm.name"
                type="text"
                class="form-input"
                placeholder="Your name"
                required
              />
            </div>
            <div class="form-field">
              <label class="form-label" for="cf-email">Email <span class="req">*</span></label>
              <input
                id="cf-email"
                v-model="contactForm.email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label" for="cf-subject">Subject <span class="opt">(optional)</span></label>
            <input
              id="cf-subject"
              v-model="contactForm.subject"
              type="text"
              class="form-input"
              placeholder="What's this about?"
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="cf-message">Message <span class="req">*</span></label>
            <textarea
              id="cf-message"
              v-model="contactForm.message"
              class="form-input form-textarea"
              placeholder="Tell me what's on your mind…"
              rows="5"
              required
            />
          </div>

          <div v-if="formError" class="form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ formError }}
          </div>

          <div class="form-submit-row">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="form-spinner" />
              {{ submitting ? 'Sending…' : 'Send Message' }}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'

const store = useSiteStore()

const honeypot = ref('')
const submitting = ref(false)
const formSuccess = ref(false)
const formError = ref('')

const contactForm = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

async function submitForm() {
  formError.value = ''
  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject || undefined,
        message: contactForm.message,
        honeypot: honeypot.value || undefined,
      },
    })
    formSuccess.value = true
    // Reset form
    Object.assign(contactForm, { name: '', email: '', subject: '', message: '' })
    honeypot.value = ''
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    formError.value = e?.data?.statusMessage ?? 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contact-section {
  position: relative;
  overflow: hidden;
}

.contact-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse at center bottom, rgba(129, 140, 248, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-6);
  align-items: start;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: var(--r-md);
  transition: all var(--t-base);
  text-decoration: none;
}
.contact-item:hover {
  background: var(--bg-surface-hv);
  border-color: var(--border-sm);
  opacity: 1;
  transform: translateX(4px);
}

.contact-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-dim);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.contact-item-label {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  max-width: none;
  margin-bottom: var(--sp-1);
}

.contact-item-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-1);
  max-width: none;
}

.contact-arrow {
  margin-left: auto;
  color: var(--text-3);
  transition: color var(--t-fast), transform var(--t-base);
  flex-shrink: 0;
}
.contact-item:hover .contact-arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.contact-social {
  margin-top: var(--sp-6);
  padding-top: var(--sp-6);
  border-top: 1px solid var(--border-xs);
}

.contact-social-label {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: var(--sp-3);
  max-width: none;
}

.social-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0.4em 0.9em;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  font-size: 0.82rem;
  color: var(--text-2);
  transition: all var(--t-base);
  text-decoration: none;
}
.social-btn:hover {
  color: var(--accent);
  border-color: rgba(94, 234, 212, 0.25);
  background: var(--accent-dim);
  opacity: 1;
  transform: translateY(-1px);
}

.no-contact {
  padding: var(--sp-8) 0;
  text-align: center;
}
.no-contact p {
  color: var(--text-3);
  font-style: italic;
  max-width: none;
  text-align: center;
}

/* Hire card */
.hire-card {
  display: flex;
  flex-direction: column;
}

.hire-icon {
  width: 52px;
  height: 52px;
  background: var(--accent-dim);
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-4);
}

.hire-title {
  font-size: 1.4rem;
  margin-bottom: var(--sp-3);
}

.hire-body {
  font-size: 0.95rem;
  line-height: 1.8;
}

/* Contact form card */
.form-card {
  margin-top: var(--sp-6);
}

.form-card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: var(--sp-2);
  font-family: var(--font-display);
}

.form-card-sub {
  font-size: 0.875rem;
  color: var(--text-3);
  margin-bottom: var(--sp-6);
  max-width: none;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.form-label {
  font-size: 0.78rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

.req {
  color: var(--accent);
}

.opt {
  color: var(--text-3);
  font-size: 0.68rem;
  text-transform: none;
  letter-spacing: 0;
}

.form-input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-md);
  color: var(--text-1);
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--t-fast);
}

.form-input:focus {
  border-color: var(--accent);
}

.form-input::placeholder {
  color: var(--text-3);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.82rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4);
}

.form-submit-row {
  display: flex;
  justify-content: flex-end;
}

.form-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-success {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-6);
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: var(--r-md);
  color: var(--accent);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: var(--sp-4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--t-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
