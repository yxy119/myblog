import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const PostsView = () => import('../views/PostsView.vue')
const PostDetailView = () => import('../views/PostDetailView.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/posts', name: 'posts', component: PostsView },
    { path: '/posts/:id', name: 'post-detail', component: PostDetailView, props: true }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

