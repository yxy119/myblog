<template>
  <section class="posts-page">
    <header class="section-header">
      <div>
        <h2>全部文章</h2>
        <p>来自 Supabase 的实时内容</p>
      </div>
      <button class="refresh-btn" @click="loadPosts" :disabled="loading">
        🔄 刷新
      </button>
    </header>

    <ArticleList
      :articles="posts"
      :loading="loading"
      :error="error"
      @view-article="goToPost"
      @update-likes="syncLikes"
    />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticleList from '../components/ArticleList.vue'
import { fetchPosts } from '../api/postService'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const error = ref('')

const loadPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    posts.value = await fetchPosts()
  } catch (err) {
    error.value = err.message || '加载文章失败'
  } finally {
    loading.value = false
  }
}

const goToPost = (post) => {
  router.push(`/posts/${post.id}`)
}

const syncLikes = (articleId, likes) => {
  const target = posts.value.find(post => post.id === articleId)
  if (target) target.likes = likes
}

onMounted(loadPosts)
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 2rem;
  color: #1F2937;
}

.section-header p {
  color: #6B7280;
}

.refresh-btn {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

