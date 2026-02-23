<template>
  <div>
    <NuxtRouteAnnouncer />
    <Toaster position="top-right" richColors />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner';
</script>

<style>
@import 'vue-sonner/style.css';
</style>
