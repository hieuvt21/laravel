<script setup>
defineProps({ title: String, desc: String });
</script>

<template>
    <section>
        <div class="page-head">
            <h1>{{ title }}</h1>
            <p v-if="desc">{{ desc }}</p>
        </div>
        <div class="card empty">
            <p>Trang này đang được xây dựng.</p>
        </div>
    </section>
</template>
