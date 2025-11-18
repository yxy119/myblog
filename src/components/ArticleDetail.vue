<template>
  <div class="article-detail" v-if="article">
    <button class="back-btn" @click="$emit('back')">
      <span class="back-icon">←</span> 返回列表
    </button>
    
    <article class="article">
      <div class="article-cover-header">
        <div class="cover-display">
          <span class="cover-emoji-large">{{ article.cover || '📄' }}</span>
        </div>
      </div>

      <div class="article-main">
        <div class="article-tags" v-if="article.tags">
          <span 
            v-for="tag in article.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>

        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <div class="meta-group">
              <span class="meta-icon">👤</span>
              <span class="author">{{ article.author }}</span>
            </div>
            <div class="meta-group">
              <span class="meta-icon">📅</span>
              <span class="date">{{ article.date }}</span>
            </div>
            <div class="meta-group">
              <span class="meta-icon">👁️</span>
              <span class="views">{{ article.views }}</span>
            </div>
          </div>
        </header>
        
        <div class="article-actions">
          <button 
            class="action-btn like-btn"
            :class="{ liked: isLiked }"
            @click="toggleLike"
          >
            <span class="action-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
            <span>{{ article.likes || 0 }}</span>
          </button>
          <button class="action-btn share-btn" @click="shareArticle">
            <span class="action-icon">🔗</span>
            <span>分享</span>
          </button>
        </div>
        
        <div class="article-content">
          <p v-for="(paragraph, index) in formattedContent" :key="index" class="paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </article>

    <CommentSection :article-id="article.id" />
  </div>
</template>

<script>
import CommentSection from './CommentSection.vue'

export default {
  name: 'ArticleDetail',
  components: {
    CommentSection
  },
  props: {
    article: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      likedArticles: new Set()
    }
  },
  computed: {
    formattedContent() {
      if (!this.article) return []
      return this.article.content.split('\n').filter(p => p.trim())
    },
    isLiked() {
      return this.article && this.likedArticles.has(this.article.id)
    }
  },
  mounted() {
    const saved = localStorage.getItem('likedArticles')
    if (saved) {
      this.likedArticles = new Set(JSON.parse(saved))
    }
  },
  methods: {
    toggleLike() {
      if (!this.article) return
      
      if (this.likedArticles.has(this.article.id)) {
        this.likedArticles.delete(this.article.id)
        this.article.likes = Math.max(0, (this.article.likes || 0) - 1)
      } else {
        this.likedArticles.add(this.article.id)
        this.article.likes = (this.article.likes || 0) + 1
      }
      localStorage.setItem('likedArticles', JSON.stringify(Array.from(this.likedArticles)))
      this.$emit('update-likes', this.article.id, this.article.likes)
    },
    shareArticle() {
      if (navigator.share) {
        navigator.share({
          title: this.article.title,
          text: this.article.content.substring(0, 100),
          url: window.location.href
        }).catch(() => {})
      } else {
        // 复制链接到剪贴板
        const url = window.location.href
        navigator.clipboard.writeText(url).then(() => {
          alert('链接已复制到剪贴板！')
        })
      }
    }
  }
}
</script>

<style scoped>
.article-detail {
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

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.back-btn:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
}

.back-icon {
  font-size: 1.2rem;
  transition: transform 0.3s;
}

.back-btn:hover .back-icon {
  transform: translateX(-4px);
}

.article {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.12);
  margin-bottom: 2rem;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.article-cover-header {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  padding: 3rem 2rem;
  text-align: center;
}

.cover-display {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.cover-emoji-large {
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.article-main {
  padding: 2.5rem;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

.article-header {
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.article-title {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  font-weight: bold;
}

.article-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.95rem;
  color: #6B7280;
}

.meta-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1.1rem;
}

.article-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: 2px solid rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  color: #4B5563;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.like-btn:hover {
  border-color: #EC4899;
  background: rgba(236, 72, 153, 0.1);
  color: #EC4899;
}

.like-btn.liked {
  background: rgba(236, 72, 153, 0.1);
  border-color: #EC4899;
  color: #EC4899;
}

.share-btn:hover {
  border-color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.action-icon {
  font-size: 1.2rem;
  transition: transform 0.3s;
}

.action-btn:hover .action-icon {
  transform: scale(1.2);
}

.article-content {
  line-height: 2;
  color: #374151;
  font-size: 1.1rem;
}

.paragraph {
  margin-bottom: 1.8rem;
  text-align: justify;
}

.paragraph:first-child {
  font-size: 1.2rem;
  color: #1F2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .article-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

