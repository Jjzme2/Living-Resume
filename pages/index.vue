<template>
  <div>
    <HeroSection />
    <QuotesSection />
    <AboutSection />
    <SkillsSection />
    <ExperienceSection />
    <ProjectsSection />
    <BlogPreview />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
useScrollReveal()

useHead({
  title: 'Jj Zettler — Developer & Entrepreneur',
  meta: [
    { name: 'description', content: 'Jj Zettler — Developer, entrepreneur, and builder. Explore my work, resume, and blog.' },
  ],
})
</script>
