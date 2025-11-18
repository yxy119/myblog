<template>
  <div class="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">✨ 我的博客</h1>
          <nav class="nav">
            <RouterLink class="nav-link" to="/">
              <span class="nav-icon">🏠</span> 首页
            </RouterLink>
            <RouterLink class="nav-link" to="/posts">
              <span class="nav-icon">📚</span> 文章
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>💝 &copy; {{ new Date().getFullYear() }} 个人博客 · Supabase + Netlify Demo</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

