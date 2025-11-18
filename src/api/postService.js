import { supabase } from '../supabase'

// 根据实际的数据库表结构选择字段
// tags 是通过 post_tags 关联表从 tags 表获取的，不在 posts 表中
const POST_COLUMNS = 'id,title,slug,content'
// comments 表的字段：id, post_id, author_name, author_email, content (需要添加)
// 注意：需要在 Supabase 的 comments 表中添加 content 字段（类型：text）
const COMMENT_COLUMNS =
  'id,post_id,author_name,author_email,content'

const normalizeId = (value) => {
  const num = Number(value)
  return Number.isNaN(num) ? value : num
}

// 从关联查询结果中提取标签名称
const extractTagsFromRelations = (post) => {
  if (!post.post_tags || !Array.isArray(post.post_tags)) {
    return []
  }
  return post.post_tags
    .map(pt => pt.tags?.name)
    .filter(Boolean)
}

const normalizePost = (post) => ({
  ...post,
  // 从 post_tags 关联数据中提取标签名称
  tags: extractTagsFromRelations(post),
  cover: post.cover || '📄',
  likes: post.likes ?? 0,
  views: post.views ?? 0,
  author: post.author || '匿名作者',
  date: post.created_at
    ? new Date(post.created_at).toLocaleDateString('zh-CN')
    : new Date().toLocaleDateString('zh-CN') // 如果没有创建时间，使用当前日期
})

export async function fetchPosts() {
  // 使用关联查询获取文章及其标签
  const { data, error } = await supabase
    .from('posts')
    .select(`${POST_COLUMNS},post_tags(tag_id,tags(id,name))`)

  if (error) {
    console.error('获取文章列表失败:', error)
    throw error
  }
  
  console.log('获取到的文章数据:', data)
  return (data ?? []).map(normalizePost)
}

export async function fetchFeaturedPosts(limit = 3) {
  // 使用关联查询获取文章及其标签
  const { data, error } = await supabase
    .from('posts')
    .select(`${POST_COLUMNS},post_tags(tag_id,tags(id,name))`)
    .limit(limit)

  if (error) {
    console.error('获取精选文章失败:', error)
    throw error
  }
  return (data ?? []).map(normalizePost)
}

export async function fetchPostById(id) {
  const postId = normalizeId(id)
  // 使用关联查询获取文章及其标签
  const { data, error } = await supabase
    .from('posts')
    .select(`${POST_COLUMNS},post_tags(tag_id,tags(id,name))`)
    .eq('id', postId)
    .single()

  if (error) throw error
  return normalizePost(data)
}

export async function fetchCommentsByPost(postId) {
  const id = normalizeId(postId)
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_COLUMNS)
    .eq('post_id', id)
  // 移除对不存在的 created_at 字段的排序

  if (error) {
    console.error('获取评论失败:', error)
    throw error
  }
  
  console.log('获取到的评论数据:', data)
  return (data ?? []).map(comment => ({
    ...comment,
    // 将数据库字段映射到组件使用的字段
    name: comment.author_name || '匿名用户',
    content: comment.content || '', // 评论内容
    date: comment.created_at
      ? new Date(comment.created_at).toLocaleString('zh-CN')
      : new Date().toLocaleString('zh-CN')
  }))
}

export async function submitComment(postId, { name, content }) {
  // 将组件使用的字段映射到数据库字段
  const payload = {
    post_id: normalizeId(postId),
    author_name: name,
    author_email: '', // 如果表单中没有邮箱字段，可以留空或设置为默认值
    content: content // 评论内容（需要在 Supabase 表中添加此字段）
  }

  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select(COMMENT_COLUMNS)
    .single()

  if (error) {
    console.error('提交评论失败:', error)
    throw error
  }

  return {
    ...data,
    // 将数据库字段映射回组件使用的字段
    name: data.author_name || name,
    content: data.content || content || '',
    date: data.created_at
      ? new Date(data.created_at).toLocaleString('zh-CN')
      : new Date().toLocaleString('zh-CN')
  }
}

export async function incrementPostViews(postId) {
  const { error } = await supabase.rpc('increment_views', {
    post_id: normalizeId(postId)
  })

  // 如果没有创建对应的 RPC，可忽略错误
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('increment_views 未配置，跳过视图统计')
  }
}

/**
 * 从标签关联表获取标签统计信息
 * 从 tags 和 post_tags 表获取标签及其文章数量
 */
export async function fetchTagsWithCount() {
  try {
    // 从 tags 表获取所有标签
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('id,name,slug')
    
    if (tagsError) {
      console.error('获取标签失败:', tagsError)
      throw tagsError
    }
    
    if (!tagsData || tagsData.length === 0) {
      return []
    }
    
    // 从 post_tags 关联表获取计数
    const { data: postTagsData, error: postTagsError } = await supabase
      .from('post_tags')
      .select('tag_id,post_id')
    
    if (postTagsError) {
      console.error('获取标签关联失败:', postTagsError)
      throw postTagsError
    }
    
    // 统计每个标签的文章数量
    const tagCounts = {}
    if (postTagsData) {
      postTagsData.forEach(pt => {
        tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
      })
    }
    
    return tagsData.map(tag => ({
      id: tag.id,
      name: tag.name || tag.slug || tag.id,
      count: tagCounts[tag.id] || 0
    })).sort((a, b) => {
      // 优先按数量降序，数量相同的按名称排序
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return a.name.localeCompare(b.name, 'zh-CN')
    })
  } catch (err) {
    console.error('获取标签统计失败:', err)
    throw err
  }
}

/**
 * 从文章数据中提取标签统计信息
 * 这是一个备用方案，当没有 tags 表时使用
 * 现在文章数据中的 tags 已经是数组格式
 */
export function getTagsFromPosts(posts) {
  const tagCounts = {}
  
  posts.forEach(post => {
    // tags 已经是数组格式（通过 extractTagsFromRelations 提取）
    const tags = Array.isArray(post.tags) ? post.tags : []
    tags.forEach(tag => {
      if (tag) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    })
  })
  
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count) // 按数量降序排序
}

/**
 * 获取博客统计数据
 */
export async function fetchBlogStats() {
  try {
    // 获取文章总数
    const { count: postCount, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
    
    if (postError) {
      console.error('获取文章总数失败:', postError)
      throw postError
    }
    
    // 获取标签总数（只统计有文章关联的标签）
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('id')
    
    let tagCount = 0
    if (!tagsError && tagsData) {
      // 检查哪些标签有文章关联
      const { data: postTagsData } = await supabase
        .from('post_tags')
        .select('tag_id')
      
      if (postTagsData) {
        const uniqueTagIds = new Set(postTagsData.map(pt => pt.tag_id))
        tagCount = uniqueTagIds.size
      }
    }
    
    // 计算总阅读量（如果 posts 表有 views 字段）
    let totalViews = 0
    const { data: postsData } = await supabase
      .from('posts')
      .select('views')
    
    if (postsData) {
      totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0)
    }
    
    return {
      postCount: postCount || 0,
      tagCount: tagCount || 0,
      totalViews: totalViews || 0
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    // 返回默认值
    return {
      postCount: 0,
      tagCount: 0,
      totalViews: 0
    }
  }
}

