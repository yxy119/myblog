<template>
  <div class="article-list">
    <div class="page-header">
      <h2 class="page-title">📖 文章列表</h2>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索文章标题、内容或标签..."
          class="search-input"
          @input="handleSearch"
        />
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-search-btn"
          title="清除搜索"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="main-layout">
      <!-- 标签分类侧边栏 -->
      <TagSidebar
        :tags="tagList"
        :selected-tag="selectedTag"
        :total-count="articles.length"
        @tag-selected="handleTagSelected"
      />

      <!-- 文章列表区域 -->
      <div class="content-area">
        <div v-if="loading" class="state-card">
          <span>⏳ 正在加载文章...</span>
        </div>
        <div v-else-if="error" class="state-card error">
          <span>⚠️ {{ error }}</span>
        </div>
        <template v-else>
          <div v-if="searchQuery || selectedTag" class="search-info">
            <span class="info-text">
              <span v-if="searchQuery">🔍 搜索 "{{ searchQuery }}"</span>
              <span v-if="searchQuery && selectedTag"> · </span>
              <span v-if="selectedTag">🏷️ 标签 "{{ selectedTag }}"</span>
              <span class="result-count">找到 {{ filteredArticles.length }} 篇文章</span>
            </span>
          </div>
          <div class="articles" v-if="filteredArticles.length > 0">
      <article 
        v-for="article in filteredArticles" 
        :key="article.id"
        class="article-card"
      >
        <div class="article-cover" @click="$emit('view-article', article)">
          <span class="cover-emoji">{{ article.cover || '📄' }}</span>
        </div>
        <div class="article-body">
          <div class="article-tags">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
          <h3 class="article-title" @click="$emit('view-article', article)">
            {{ article.title }}
          </h3>
          <div class="article-meta">
            <span class="meta-item">
              <span class="meta-icon">👤</span>
              {{ article.author }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              {{ article.date }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">👁️</span>
              {{ article.views }}
            </span>
          </div>
          <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
          <div class="article-footer">
            <button 
              class="like-btn"
              :class="{ liked: isLiked(article.id) }"
              @click.stop="toggleLike(article)"
            >
              <span class="like-icon">{{ isLiked(article.id) ? '❤️' : '🤍' }}</span>
              <span>{{ article.likes || 0 }}</span>
            </button>
            <button 
              class="read-more"
              @click="$emit('view-article', article)"
            >
              阅读全文 →
            </button>
          </div>
        </div>
      </article>
        </div>

          <div v-else class="no-results">
            <p>🔍 没有找到相关文章</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import TagSidebar from './TagSidebar.vue'
import { fetchTagsWithCount, getTagsFromPosts } from '../api/postService'

export default {
  name: 'ArticleList',
  components: {
    TagSidebar
  },
  props: {
    articles: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchQuery: '',
      selectedTag: null,
      likedArticles: new Set(),
      tagList: [], // 从数据库获取的标签列表
      tagsLoading: true,
      tagsError: ''
    }
  },
  computed: {
    // 保留 allTags 以兼容其他地方可能的引用
    allTags() {
      return this.tagList.map(tag => tag.name)
    },
    filteredArticles() {
      let filtered = this.articles

      // 先按搜索关键词过滤
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase()
        filtered = filtered.filter(article => {
          const titleMatch = article.title && article.title.toLowerCase().includes(query)
          const contentMatch = article.content && article.content.toLowerCase().includes(query)
          const tagMatch = article.tags && article.tags.some(tag => 
            tag && tag.toLowerCase().includes(query)
          )
          return titleMatch || contentMatch || tagMatch
        })
      }

      // 再按标签过滤（如果选择了标签）
      if (this.selectedTag) {
        filtered = filtered.filter(article => 
          article.tags && article.tags.includes(this.selectedTag)
        )
      }

      return filtered
    }
  },
  async mounted() {
    // 从 localStorage 加载点赞状态
    const saved = localStorage.getItem('likedArticles')
    if (saved) {
      this.likedArticles = new Set(JSON.parse(saved))
    }
    // 从数据库获取标签列表
    await this.loadTags()
  },
  methods: {
    getExcerpt(content) {
      return content.length > 120 ? content.substring(0, 120) + '...' : content
    },
    isLiked(articleId) {
      return this.likedArticles.has(articleId)
    },
    toggleLike(article) {
      if (this.likedArticles.has(article.id)) {
        this.likedArticles.delete(article.id)
        article.likes = Math.max(0, (article.likes || 0) - 1)
      } else {
        this.likedArticles.add(article.id)
        article.likes = (article.likes || 0) + 1
      }
      localStorage.setItem('likedArticles', JSON.stringify(Array.from(this.likedArticles)))
      this.$emit('update-likes', article.id, article.likes)
    },
    getTagCount(tag) {
      return this.articles.filter(article => 
        article.tags && article.tags.includes(tag)
      ).length
    },
    handleTagSelected(tag) {
      this.selectedTag = tag
      // 滚动到顶部（可选）
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    handleSearch() {
      // 搜索时保持当前逻辑，确保响应式更新
      // 如果需要搜索时清除标签选择，可以取消下面的注释
      // if (this.searchQuery.trim()) {
      //   this.selectedTag = null
      // }
    },
    clearSearch() {
      this.searchQuery = ''
    },
    async loadTags() {
      this.tagsLoading = true
      this.tagsError = ''
      try {
        // 优先从数据库获取标签统计
        const tags = await fetchTagsWithCount()
        if (tags && tags.length > 0) {
          this.tagList = tags
        } else {
          // 如果数据库没有标签，从当前文章数据中提取
          this.tagList = getTagsFromPosts(this.articles)
        }
        console.log('加载的标签列表:', this.tagList)
      } catch (err) {
        console.error('获取标签失败，使用备用方案:', err)
        this.tagsError = err.message || '获取标签失败'
        // 备用方案：从文章数据中提取
        this.tagList = getTagsFromPosts(this.articles)
      } finally {
        this.tagsLoading = false
      }
    }
  },
  watch: {
    // 当文章数据更新时，如果没有从数据库获取到标签，则从文章数据中提取
    articles: {
      handler(newArticles) {
        if (this.tagList.length === 0 && newArticles.length > 0) {
          this.tagList = getTagsFromPosts(newArticles)
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.article-list {
  padding: 2rem 0;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.1);
  min-width: 250px;
  transition: all 0.3s;
}

.search-box:focus-within {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 1rem;
  padding: 0.25rem;
  background: transparent;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.clear-search-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  transform: scale(1.1);
}

.main-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* 侧边栏样式已移至 TagSidebar 组件 */

.content-area {
  flex: 1;
  min-width: 0;
}

.search-info {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.info-text {
  color: #1F2937;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-count {
  font-weight: 600;
  color: #6366F1;
  margin-left: 0.5rem;
}

.state-card {
  padding: 2rem;
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  color: #4B5563;
  text-align: center;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
}

.state-card.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
  color: #B91C1C;
}

.articles {
  display: grid;
  gap: 2rem;
}

.article-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.2);
}

.article-cover {
  width: 200px;
  min-width: 200px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.article-cover:hover {
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #6366F1 100%);
}

.cover-emoji {
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.article-body {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.25);
}

.article-title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1F2937;
  cursor: pointer;
  transition: color 0.3s;
  line-height: 1.3;
}

.article-title:hover {
  color: #6366F1;
}

.article-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #6B7280;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 1rem;
}

.article-excerpt {
  color: #4B5563;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  flex: 1;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.05);
  border: 2px solid rgba(99, 102, 241, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  color: #4B5563;
}

.like-btn:hover {
  border-color: #EC4899;
  background: rgba(236, 72, 153, 0.1);
  transform: scale(1.05);
}

.like-btn.liked {
  background: rgba(236, 72, 153, 0.1);
  border-color: #EC4899;
  color: #EC4899;
}

.like-icon {
  font-size: 1.1rem;
  transition: transform 0.3s;
}

.like-btn:hover .like-icon {
  transform: scale(1.2);
}

.read-more {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.read-more:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
  font-size: 1.2rem;
}

@media (max-width: 968px) {
  .main-layout {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    min-height: 150px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }
}
</style>

