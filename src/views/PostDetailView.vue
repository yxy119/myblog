<template>
  <section class="detail-page">
    <button class="back-link" @click="goBack">
      ← 返回列表
    </button>

    <div v-if="loading" class="state-card">⏳ 正在加载文章...</div>
    <div v-else-if="error" class="state-card error">⚠️ {{ error }}</div>
    <ArticleDetail
      v-else
      :article="article"
      @back="goBack"
      @update-likes="syncLikes"
    />
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleDetail from '../components/ArticleDetail.vue'
import { fetchPostById, incrementPostViews } from '../api/postService'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(true)
const error = ref('')

let lastIncrementedId = null

const loadPost = async (id) => {
  if (!id) return
  loading.value = true
  error.value = ''
  try {
    article.value = await fetchPostById(id)
    if (article.value && lastIncrementedId !== id) {
      lastIncrementedId = id
      // 乐观更新阅读量
      article.value.views = (article.value.views || 0) + 1
      incrementPostViews(id).catch(() => {
        // 如果后端未配置 RPC，则回退到原始值
        if (article.value && article.value.id === id) {
          article.value.views = Math.max(0, (article.value.views || 1) - 1)
        }
      })
    }
  } catch (err) {
    error.value = err.message || '加载文章失败'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/posts')
}

const syncLikes = (articleId, likes) => {
  if (article.value && article.value.id === articleId) {
    article.value.likes = likes
  }
}

onMounted(() => loadPost(route.params.id))
watch(() => route.params.id, loadPost)
</script>

<style scoped>
.back-link {
  background: none;
  border: none;
  color: #6366F1;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
}

.state-card {
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  color: #4B5563;
}

.state-card.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
  color: #B91C1C;
}
</style>

