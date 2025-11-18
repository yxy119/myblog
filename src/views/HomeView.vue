<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-text">
            <p class="eyebrow">
              <span class="eyebrow-icon">🚀</span>
              Supabase × Netlify 实战
            </p>
            <h1 class="hero-title">
              <span class="title-line">记录灵感，</span>
              <span class="title-line gradient-text">分享思考</span>
            </h1>
            <p class="description">
              这里是一个由 Supabase 提供数据、Netlify 部署的现代化博客示例。
              实现从创作、存储到发布的一站式体验。
            </p>
            <div class="hero-actions">
              <button class="primary-btn" @click="goToPosts">
                <span class="btn-icon">📖</span>
                <span>立即开始阅读</span>
                <span class="btn-arrow">→</span>
              </button>
              <button class="secondary-btn" @click="scrollToGuide">
                <span class="btn-icon">🔍</span>
                <span>了解项目结构</span>
              </button>
            </div>
            <div class="hero-stats">
              <div
                v-for="stat in heroStats"
                :key="stat.label"
                class="stat-item"
              >
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
          <div class="hero-card">
          <div class="hero-card-header">
            <h3 class="card-title">✨ 技术栈</h3>
          </div>
          <div class="hero-card-content">
            <div class="tech-item">
              <span class="tech-icon">⚡</span>
              <div class="tech-info">
                <span class="tech-label">前端</span>
                <span class="tech-value">Vue + Vite</span>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🗄️</span>
              <div class="tech-info">
                <span class="tech-label">后端</span>
                <span class="tech-value">Supabase</span>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🌐</span>
              <div class="tech-info">
                <span class="tech-label">部署</span>
                <span class="tech-value">Netlify</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Articles Section -->
    <section class="featured" id="guide">
      <header class="section-header">
        <div class="header-content">
          <h2 class="section-title">
            <span class="title-icon">⭐</span>
            精选文章
          </h2>
          <p class="section-subtitle">从 Supabase 动态获取的最新内容</p>
        </div>
      </header>

      <div v-if="loading" class="state-card loading">
        <div class="loading-spinner"></div>
        <span>正在加载文章...</span>
      </div>
      <div v-else-if="error" class="state-card error">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
      <div v-else class="featured-grid">
        <article
          v-for="(post, index) in featuredPosts"
          :key="post.id"
          class="featured-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="goToPost(post.id)"
        >
          <div class="card-background"></div>
          <div class="card-cover">
            <span class="cover-emoji">{{ post.cover }}</span>
            <div class="cover-overlay"></div>
          </div>
          <div class="card-content">
            <div class="card-tags" v-if="post.tags && post.tags.length > 0">
              <span
                v-for="tag in post.tags.slice(0, 2)"
                :key="tag"
                class="card-tag"
              >
                {{ tag }}
              </span>
            </div>
            <h3 class="card-title">{{ post.title }}</h3>
            <p class="card-excerpt">{{ getExcerpt(post.content) }}</p>
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span>{{ post.author }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span>{{ post.date }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="read-more">阅读全文</span>
              <span class="read-arrow">→</span>
            </div>
          </div>
        </article>
        <div v-if="featuredPosts.length === 0" class="state-card empty">
          <span class="empty-icon">📝</span>
          <p>暂无文章，请先在 Supabase 中添加数据。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFeaturedPosts, fetchBlogStats } from '../api/postService'

const router = useRouter()
const featuredPosts = ref([])
const loading = ref(true)
const error = ref('')
const heroStats = ref([
  { label: '精选文章', value: '0' },
  { label: '技术标签', value: '0' },
  { label: '总阅读量', value: '0' }
])

const loadPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    featuredPosts.value = await fetchFeaturedPosts(3)
  } catch (err) {
    error.value = err.message || '加载文章失败'
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const stats = await fetchBlogStats()
    heroStats.value = [
      { 
        label: '精选文章', 
        value: stats.postCount > 0 ? `${stats.postCount}` : '0'
      },
      { 
        label: '技术标签', 
        value: stats.tagCount > 0 ? `${stats.tagCount}` : '0'
      },
      { 
        label: '总阅读量', 
        value: stats.totalViews > 0 
          ? stats.totalViews >= 1000 
            ? `${(stats.totalViews / 1000).toFixed(1)}k+` 
            : `${stats.totalViews}+`
          : '0'
      }
    ]
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

const getExcerpt = (content = '', length = 120) =>
  content.length > length ? `${content.slice(0, length)}...` : content

const goToPosts = () => {
  router.push('/posts')
}

const goToPost = (id) => {
  router.push(`/posts/${id}`)
}

const scrollToGuide = () => {
  const el = document.getElementById('guide')
  el?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  await Promise.all([loadPosts(), loadStats()])
})
</script>

<style scoped>
.home {
  position: relative;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  margin-bottom: 5rem;
  padding: 3rem 0;
  min-height: 500px;
  display: flex;
  align-items: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  border-radius: 32px;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 25px 80px rgba(99, 102, 241, 0.15);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  top: 50%;
  right: 20%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 3rem;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.hero-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeInUp 0.8s ease-out;
}

/* Hero Card */
.hero-card {
  flex-shrink: 0;
  width: 380px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: fadeInRight 0.8s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366F1;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50px;
  width: fit-content;
  animation: slideInLeft 0.8s ease-out 0.2s both;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.eyebrow-icon {
  font-size: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  color: #1F2937;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.title-line {
  display: block;
}

.gradient-text {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.description {
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.7;
  max-width: 600px;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.hero-stats {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-label {
  font-size: 0.9rem;
  color: #6B7280;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.primary-btn:hover::before {
  width: 300px;
  height: 300px;
}

.primary-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
}

.btn-arrow {
  transition: transform 0.3s;
}

.primary-btn:hover .btn-arrow {
  transform: translateX(5px);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6366F1;
  border: 2px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(10px);
}

.secondary-btn:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 1);
  border-color: #6366F1;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
}

.btn-icon {
  font-size: 1.1rem;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero-card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.card-title {
  font-size: 1.3rem;
  color: #1F2937;
  font-weight: 700;
  margin: 0;
}

.hero-card-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 16px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tech-item:hover {
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(5px);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.tech-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tech-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.tech-label {
  font-size: 0.85rem;
  color: #6B7280;
  font-weight: 500;
}

.tech-value {
  font-size: 1.1rem;
  color: #1F2937;
  font-weight: 700;
}

/* Featured Section */
.featured {
  margin-bottom: 4rem;
}

.section-header {
  margin-bottom: 3rem;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.section-title {
  font-size: 2.5rem;
  color: #1F2937;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.title-icon {
  font-size: 2rem;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.section-subtitle {
  color: #6B7280;
  font-size: 1.1rem;
  margin: 0;
}

.featured-grid {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.featured-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.1);
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.6s ease-out both;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  opacity: 0;
  transition: opacity 0.4s;
}

.featured-card:hover .card-background {
  opacity: 0.05;
}

.card-cover {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  overflow: hidden;
}

.cover-emoji {
  font-size: 5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: transform 0.4s;
  z-index: 2;
  position: relative;
}

.featured-card:hover .cover-emoji {
  transform: scale(1.2) rotate(10deg);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s;
}

.featured-card:hover .cover-overlay {
  opacity: 1;
}

.card-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  position: relative;
  z-index: 1;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-tag {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.25);
}

.card-title {
  font-size: 1.4rem;
  color: #1F2937;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s;
}

.featured-card:hover .card-title {
  color: #6366F1;
}

.card-excerpt {
  color: #6B7280;
  line-height: 1.7;
  flex: 1;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #9CA3AF;
  padding-top: 1rem;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
  color: #6366F1;
  font-weight: 600;
  font-size: 0.95rem;
}

.read-arrow {
  transition: transform 0.3s;
}

.featured-card:hover .read-arrow {
  transform: translateX(5px);
}

.featured-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 50px rgba(99, 102, 241, 0.2);
}

/* State Cards */
.state-card {
  padding: 3rem 2rem;
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  text-align: center;
  color: #4B5563;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
}

.state-card.loading {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.state-card.error {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
  border-color: rgba(248, 113, 113, 0.3);
  color: #B91C1C;
}

.error-icon {
  font-size: 2rem;
}

.state-card.empty {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 1200px) {
  .hero-content {
    gap: 2rem;
  }

  .hero-card {
    width: 340px;
  }

  .hero-inner {
    padding: 2.5rem;
  }
}

@media (max-width: 968px) {
  .hero {
    min-height: auto;
    padding: 2rem 0;
  }

  .hero-content {
    flex-direction: column;
    align-items: stretch;
    gap: 2rem;
  }

  .hero-inner {
    padding: 2rem;
  }

  .hero-text {
    width: 100%;
  }

  .hero-card {
    width: 100%;
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.8rem;
  }

  .featured-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 1.5rem 0;
    margin-bottom: 3rem;
  }

  .hero-content {
    gap: 1.5rem;
  }

  .hero-inner {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .hero-card {
    padding: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
  }

  .featured-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .card-content {
    padding: 1.5rem;
  }
}
</style>

