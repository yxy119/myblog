<template>
  <aside class="tag-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <span class="title-icon">🏷️</span>
        标签分类
      </h3>
      <div class="tag-search" v-if="showSearch">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标签..."
          class="search-input"
        />
      </div>
    </div>

    <div class="tags-container">
      <!-- 全部按钮 -->
      <button
        :class="['tag-item', 'tag-all', { active: selectedTag === null }]"
        @click="$emit('tag-selected', null)"
      >
        <span class="tag-icon">📚</span>
        <span class="tag-name">全部</span>
        <span class="tag-count">{{ totalCount }}</span>
      </button>

      <!-- 标签列表 -->
      <button
        v-for="(tag, index) in filteredTags"
        :key="tag.name"
        :class="['tag-item', { active: selectedTag === tag.name }, `tag-size-${getTagSize(tag.count)}`]"
        :style="getTagStyle(tag, index)"
        @click="$emit('tag-selected', tag.name)"
      >
        <span class="tag-icon">{{ getTagEmoji(tag.name) }}</span>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tag-count">{{ tag.count }}</span>
      </button>

      <div v-if="filteredTags.length === 0 && searchQuery" class="no-tags">
        <span>🔍 未找到标签</span>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'TagSidebar',
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    selectedTag: {
      type: String,
      default: null
    },
    totalCount: {
      type: Number,
      default: 0
    },
    showSearch: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    // 按数量排序，然后过滤搜索
    sortedTags() {
      return [...this.tags].sort((a, b) => b.count - a.count)
    },
    filteredTags() {
      if (!this.searchQuery.trim()) {
        return this.sortedTags
      }
      const query = this.searchQuery.toLowerCase()
      return this.sortedTags.filter(tag =>
        tag.name.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    clearSearch() {
      this.searchQuery = ''
    },
    // 根据文章数量获取标签大小等级
    getTagSize(count) {
      if (count === 0) return 'xs'
      if (count >= 10) return 'xl'
      if (count >= 5) return 'lg'
      if (count >= 3) return 'md'
      return 'sm'
    },
    // 获取标签的样式（随机角度、颜色等）
    getTagStyle(tag, index) {
      const maxCount = Math.max(...this.tags.map(t => t.count), 1)
      const sizeRatio = maxCount > 0 ? tag.count / maxCount : 0
      
      // 轻微随机旋转角度（-3度到3度）
      const rotation = (index % 7 - 3) * 0.8
      
      // 根据索引创建不同的颜色
      const colorIndex = index % 8
      
      return {
        '--rotation': `${rotation}deg`,
        '--color-index': colorIndex,
        '--size-ratio': sizeRatio || 0.2
      }
    },
    // 根据标签名称获取对应的 emoji
    getTagEmoji(name) {
      const emojiMap = {
        'Vue': '💚',
        'Vue.js': '💚',
        'React': '⚛️',
        'JavaScript': '🟨',
        'TypeScript': '🔷',
        'Python': '🐍',
        'Node.js': '🟢',
        'Docker': '🐳',
        'PostgreSQL': '🐘',
        '前端': '✨',
        '后端': '⚙️',
        '全栈': '🚀'
      }
      
      return emojiMap[name] || ['🏷️', '📌', '🔖', '✨', '⭐', '💫', '🌟', '🎯'][name.length % 8]
    }
  }
}
</script>

<style scoped>
.tag-sidebar {
  width: 280px;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.1);
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.tag-sidebar::-webkit-scrollbar {
  width: 6px;
}

.tag-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.tag-sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: 10px;
}

.tag-sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
}

.sidebar-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.sidebar-title {
  font-size: 1.3rem;
  color: #1F2937;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.title-icon {
  font-size: 1.5rem;
}

.tag-search {
  margin-top: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 2px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.95);
  outline: none;
}

.search-input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #9CA3AF;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.1rem;
  border: none;
  background: linear-gradient(135deg, var(--tag-bg-start, rgba(99, 102, 241, 0.08)) 0%, var(--tag-bg-end, rgba(139, 92, 246, 0.08)) 100%);
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: var(--tag-color, #4B5563);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  transform: rotate(var(--rotation, 0deg));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

/* 不同大小的标签 */
.tag-item.tag-size-xs {
  font-size: 0.8rem;
  padding: 0.6rem 0.9rem;
  opacity: 0.7;
}

.tag-item.tag-size-sm {
  font-size: 0.85rem;
  padding: 0.7rem 1rem;
}

.tag-item.tag-size-md {
  font-size: 0.95rem;
  padding: 0.8rem 1.15rem;
  font-weight: 600;
}

.tag-item.tag-size-lg {
  font-size: 1rem;
  padding: 0.9rem 1.25rem;
  font-weight: 600;
}

.tag-item.tag-size-xl {
  font-size: 1.1rem;
  padding: 1rem 1.4rem;
  font-weight: 700;
}

/* 全部按钮特殊样式 */
.tag-item.tag-all {
  --tag-bg-start: rgba(99, 102, 241, 0.15);
  --tag-bg-end: rgba(139, 92, 246, 0.15);
  --tag-color: #6366F1;
  --rotation: 0deg;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
  border: 2px solid rgba(99, 102, 241, 0.2);
  transform: rotate(0deg) !important;
}

.tag-item.tag-all:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateX(6px) translateY(-2px) scale(1.05) !important;
}

.tag-item.tag-all.active {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border-color: transparent;
  transform: translateX(6px) scale(1.08) !important;
}

/* 根据索引应用不同的颜色方案 */
.tag-item:not(.tag-all):nth-child(8n+1) {
  --tag-bg-start: rgba(99, 102, 241, 0.1);
  --tag-bg-end: rgba(139, 92, 246, 0.1);
  --tag-color: #6366F1;
}

.tag-item:not(.tag-all):nth-child(8n+2) {
  --tag-bg-start: rgba(236, 72, 153, 0.1);
  --tag-bg-end: rgba(251, 113, 133, 0.1);
  --tag-color: #EC4899;
}

.tag-item:not(.tag-all):nth-child(8n+3) {
  --tag-bg-start: rgba(59, 130, 246, 0.1);
  --tag-bg-end: rgba(96, 165, 250, 0.1);
  --tag-color: #3B82F6;
}

.tag-item:not(.tag-all):nth-child(8n+4) {
  --tag-bg-start: rgba(16, 185, 129, 0.1);
  --tag-bg-end: rgba(52, 211, 153, 0.1);
  --tag-color: #10B981;
}

.tag-item:not(.tag-all):nth-child(8n+5) {
  --tag-bg-start: rgba(245, 158, 11, 0.1);
  --tag-bg-end: rgba(251, 191, 36, 0.1);
  --tag-color: #F59E0B;
}

.tag-item:not(.tag-all):nth-child(8n+6) {
  --tag-bg-start: rgba(168, 85, 247, 0.1);
  --tag-bg-end: rgba(192, 132, 252, 0.1);
  --tag-color: #A855F7;
}

.tag-item:not(.tag-all):nth-child(8n+7) {
  --tag-bg-start: rgba(239, 68, 68, 0.1);
  --tag-bg-end: rgba(248, 113, 113, 0.1);
  --tag-color: #EF4444;
}

.tag-item:not(.tag-all):nth-child(8n+8) {
  --tag-bg-start: rgba(14, 165, 233, 0.1);
  --tag-bg-end: rgba(56, 189, 248, 0.1);
  --tag-color: #0EA5E9;
}

.tag-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--tag-bg-start, rgba(99, 102, 241, 0.15)) 0%, var(--tag-bg-end, rgba(139, 92, 246, 0.15)) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  border-radius: 16px;
}

.tag-item::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: translateY(-50%);
  transition: left 0.6s ease;
  z-index: 1;
}

.tag-item:hover::before {
  opacity: 1;
}

.tag-item:hover::after {
  left: 100%;
}

.tag-item:hover {
  transform: rotate(var(--rotation, 0deg)) translateX(6px) translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, var(--tag-bg-start, rgba(99, 102, 241, 0.2)) 0%, var(--tag-bg-end, rgba(139, 92, 246, 0.2)) 100%);
}

.tag-item.active {
  background: linear-gradient(135deg, var(--tag-bg-start, #6366F1) 0%, var(--tag-bg-end, #8B5CF6) 100%);
  color: white;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  transform: rotate(var(--rotation, 0deg)) translateX(6px) scale(1.08);
  font-weight: 700;
}

.tag-item.active::before,
.tag-item.active::after {
  display: none;
}

.tag-item.active .tag-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-weight: 700;
}

.tag-icon {
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.tag-item:hover .tag-icon {
  transform: scale(1.2) rotate(10deg);
}

.tag-item.active .tag-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transform: scale(1.25);
}

.tag-name {
  flex: 1;
  position: relative;
  z-index: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 0.3s ease;
}

.tag-item:hover .tag-name {
  transform: translateX(2px);
}

.tag-count {
  margin-left: auto;
  font-size: 0.75rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.45rem;
  border-radius: 10px;
  font-weight: 600;
  min-width: 1.8rem;
  text-align: center;
  transition: all 0.3s ease;
  color: inherit;
}

.tag-item:hover .tag-count {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.tag-item.active .tag-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  opacity: 1;
}

.no-tags {
  text-align: center;
  padding: 2rem 1rem;
  color: #9CA3AF;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .tag-sidebar {
    width: 100%;
    min-width: unset;
    position: static;
    max-height: none;
    margin-bottom: 2rem;
  }

  .tags-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .tag-item {
    justify-content: center;
    text-align: center;
  }

  .tag-item:hover,
  .tag-item.active {
    transform: translateY(-2px);
  }
}

@media (max-width: 640px) {
  .tag-sidebar {
    padding: 1rem;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .tag-item {
    padding: 0.7rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>

