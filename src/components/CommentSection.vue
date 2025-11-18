<template>
  <div class="comment-section">
    <h3 class="comment-title">
      <span class="title-icon">💬</span>
      评论 ({{ comments.length }})
    </h3>
    
    <div class="comment-form">
      <h4 class="form-title">
        <span class="form-icon">✍️</span>
        发表评论
      </h4>
      <div class="form-group">
        <div class="input-wrapper">
          <span class="input-icon">👤</span>
          <input 
            v-model="newComment.name"
            type="text" 
            placeholder="您的姓名"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-group">
        <div class="textarea-wrapper">
          <span class="textarea-icon">💭</span>
          <textarea 
            v-model="newComment.content"
            placeholder="写下您的评论..."
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>
      </div>
      <button @click="submitComment" class="submit-btn" :disabled="submitting">
        <span class="submit-icon">🚀</span>
        {{ submitting ? '提交中...' : '提交评论' }}
      </button>
    </div>

    <div v-if="loading" class="comment-state">
      ⏳ 正在加载评论...
    </div>
    <div v-else-if="error" class="comment-state error">
      ⚠️ {{ error }}
    </div>

    <div v-else class="comments-list">
      <transition-group name="comment" tag="div">
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-avatar">
            {{ getAvatar(comment.name) }}
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author">{{ comment.name }}</span>
              <span class="comment-date">{{ formatDate(comment.date) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </transition-group>
      
      <div v-if="comments.length === 0" class="no-comments">
        <span class="no-comments-icon">💭</span>
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCommentsByPost, submitComment } from '../api/postService'

export default {
  name: 'CommentSection',
  props: {
    articleId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      comments: [],
      newComment: {
        name: '',
        content: ''
      },
      loading: false,
      submitting: false,
      error: ''
    }
  },
  mounted() {
    this.loadComments()
  },
  watch: {
    articleId() {
      this.loadComments()
    }
  },
  methods: {
    async loadComments() {
      if (!this.articleId) return
      this.loading = true
      this.error = ''
      try {
        this.comments = await fetchCommentsByPost(this.articleId)
      } catch (err) {
        this.error = err.message || '加载评论失败'
      } finally {
        this.loading = false
      }
    },
    async submitComment() {
      if (!this.newComment.name.trim() || !this.newComment.content.trim()) {
        alert('请填写姓名和评论内容')
        return
      }

      this.submitting = true
      try {
        const created = await submitComment(this.articleId, {
          name: this.newComment.name.trim(),
          content: this.newComment.content.trim()
        })
        this.comments.unshift(created)
        this.newComment.name = ''
        this.newComment.content = ''
      } catch (err) {
        alert(err.message || '提交评论失败')
      } finally {
        this.submitting = false
      }
    },
    getAvatar(name) {
      if (!name) return '🙂'
      const avatars = ['😊', '😎', '🤓', '😄', '😃', '😁', '🙂', '😉']
      const index = name.charCodeAt(0) % avatars.length
      return avatars[index]
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes} 分钟前`
      if (hours < 24) return `${hours} 小时前`
      if (days < 7) return `${days} 天前`
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.comment-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.comment-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1F2937;
  border-bottom: 3px solid rgba(99, 102, 241, 0.1);
  padding-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.5rem;
}

.comment-form {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.form-title {
  margin-bottom: 1.5rem;
  color: #1F2937;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-icon {
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.input-wrapper,
.textarea-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon,
.textarea-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.95);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  width: 100%;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.45);
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.submit-icon {
  font-size: 1.2rem;
  transition: transform 0.3s;
}

.submit-btn:hover .submit-icon {
  transform: scale(1.2) rotate(15deg);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 16px;
  border-left: 4px solid #6366F1;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.08);
  transition: all 0.3s;
}

.comment-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
}

.comment-avatar {
  width: 50px;
  height: 50px;
  min-width: 50px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #1F2937;
  font-size: 1rem;
}

.comment-date {
  color: #6B7280;
  font-size: 0.85rem;
}

.comment-content {
  color: #374151;
  line-height: 1.7;
  font-size: 0.95rem;
}

.no-comments {
  text-align: center;
  padding: 3rem 2rem;
  color: #9CA3AF;
}

.no-comments-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.no-comments p {
  font-size: 1.1rem;
  font-style: italic;
}

/* 评论动画 */
.comment-enter-active,
.comment-leave-active {
  transition: all 0.4s ease;
}

.comment-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.comment-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.comment-move {
  transition: transform 0.4s ease;
}

.comment-state {
  padding: 1.5rem;
  text-align: center;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  color: #4B5563;
  margin-bottom: 1.5rem;
}

.comment-state.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
  color: #B91C1C;
}

@media (max-width: 768px) {
  .comment-section {
    padding: 1.5rem;
  }

  .comment-form {
    padding: 1.5rem;
  }

  .comment-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .comment-header {
    flex-direction: column;
    align-items: center;
  }
}
</style>

