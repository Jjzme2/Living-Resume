<template>
  <section v-if="store.siteSettings.showInterview" id="interview" class="section interview-section">
    <div class="interview-glow" aria-hidden="true" />

    <div class="container">
      <SectionHeading
        :label="content.label"
        :title="content.title"
        :accent="content.accent"
        :description="content.description"
      />

      <GlassCard class="chat-card reveal" padding="lg">
        <!-- Suggested questions — visible before first user message -->
        <Transition name="fade-out">
          <div v-if="!hasStarted" class="suggestions">
            <p class="suggestions-label">{{ content.suggestionsLabel }}</p>
            <div class="suggestions-grid">
              <button
                v-for="q in suggestedQuestions"
                :key="q"
                class="suggestion-chip"
                type="button"
                @click="sendSuggestion(q)"
              >
                {{ q }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Message list -->
        <div
          v-if="messages.length > 0 || isLoading"
          ref="messageContainer"
          class="messages"
        >
          <TransitionGroup name="msg" tag="div" class="messages-inner">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="message"
              :class="msg.role"
            >
              <div v-if="msg.role === 'assistant'" class="msg-avatar" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div class="msg-bubble">{{ msg.content }}</div>
            </div>
          </TransitionGroup>

          <!-- Typing indicator -->
          <div v-if="isLoading" class="message assistant typing-row">
            <div class="msg-avatar" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div class="msg-bubble typing-bubble">
              <span class="dot" /><span class="dot" /><span class="dot" />
            </div>
          </div>
        </div>

        <!-- Input row -->
        <form class="chat-input-row" @submit.prevent="sendMessage">
          <input
            v-model="input"
            class="chat-input"
            type="text"
            :placeholder="content.placeholder"
            :disabled="isLoading"
            autocomplete="off"
            maxlength="500"
            @keydown.enter.prevent="sendMessage"
          />
          <button
            type="submit"
            class="btn btn-primary chat-send-btn"
            :disabled="!input.trim() || isLoading"
            :aria-label="content.sendLabel"
          >
            <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span v-else class="send-spinner" aria-hidden="true" />
          </button>
        </form>

        <Transition name="fade">
          <p v-if="error" class="chat-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {{ error }}
          </p>
        </Transition>

        <p class="powered-by">{{ content.poweredBy }}</p>
      </GlassCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sectionContent } from '~/data/sectionContent'

const store = useSiteStore()
const content = sectionContent.interview

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const input = ref('')
const isLoading = ref(false)
const error = ref('')
const messageContainer = ref<HTMLElement | null>(null)

const hasStarted = computed(() => messages.value.length > 0)

const suggestedQuestions = [
  "What's your background as a developer?",
  'Tell me about a project you built.',
  'What kind of work are you looking for?',
  "What's your strongest technical skill?",
  'How would you describe your work style?',
  'What do you care about outside of work?',
]

async function send(userText: string) {
  const text = userText.trim()
  if (!text || isLoading.value) return

  error.value = ''
  messages.value.push({ role: 'user', content: text })
  isLoading.value = true
  await nextTick()
  scrollToBottom()

  try {
    const res = await $fetch<{ content: string }>('/api/chat', {
      method: 'POST',
      body: { messages: messages.value },
    })
    messages.value.push({ role: 'assistant', content: res.content })
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e?.data?.statusMessage ?? content.errorMessage
    // Remove the user message that failed so they can retry
    messages.value.pop()
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function sendMessage() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  send(text)
}

function sendSuggestion(q: string) {
  send(q)
}

function scrollToBottom() {
  const el = messageContainer.value
  if (el) el.scrollTop = el.scrollHeight
}
</script>

<style scoped>
.interview-section {
  position: relative;
  overflow: hidden;
}

.interview-glow {
  position: absolute;
  top: 10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(94, 234, 212, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

/* Chat card */
.chat-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

/* Suggestions */
.suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.suggestions-label {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  max-width: none;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.suggestion-chip {
  padding: 0.45em 1em;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: var(--r-xl);
  font-size: 0.82rem;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--t-base);
  font-family: inherit;
  line-height: 1.4;
  text-align: left;
}
.suggestion-chip:hover {
  color: var(--accent);
  border-color: rgba(94, 234, 212, 0.3);
  background: var(--accent-dim);
  transform: translateY(-1px);
}

/* Messages */
.messages {
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding-right: var(--sp-2);
  scroll-behavior: smooth;
}

.messages-inner {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.messages::-webkit-scrollbar {
  width: 4px;
}
.messages::-webkit-scrollbar-track {
  background: transparent;
}
.messages::-webkit-scrollbar-thumb {
  background: var(--border-sm);
  border-radius: 2px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  max-width: 82%;
}
.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.message.assistant {
  align-self: flex-start;
}

.msg-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-dim);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-bubble {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-lg);
  font-size: 0.9rem;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.message.user .msg-bubble {
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.2);
  color: var(--text-1);
  border-bottom-right-radius: var(--r-sm);
}
.message.assistant .msg-bubble {
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  color: var(--text-1);
  border-bottom-left-radius: var(--r-sm);
}

/* Typing indicator */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: var(--sp-3) var(--sp-5);
  min-width: 56px;
}
.dot {
  width: 6px;
  height: 6px;
  background: var(--text-3);
  border-radius: 50%;
  animation: bounce 1.2s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* Input row */
.chat-input-row {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
}

.chat-input {
  flex: 1;
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
.chat-input:focus {
  border-color: var(--accent);
}
.chat-input::placeholder {
  color: var(--text-3);
}
.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-send-btn {
  flex-shrink: 0;
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}
.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.chat-error {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.82rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4);
  max-width: none;
}

/* Powered-by */
.powered-by {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-3);
  text-align: right;
  max-width: none;
  margin: 0;
}

/* Transitions */
.fade-out-leave-active {
  transition: opacity var(--t-slow), max-height var(--t-slow);
  max-height: 200px;
  overflow: hidden;
}
.fade-out-leave-to {
  opacity: 0;
  max-height: 0;
}

.msg-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--t-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .message {
    max-width: 95%;
  }
  .suggestions-grid {
    gap: var(--sp-2);
  }
}
</style>
