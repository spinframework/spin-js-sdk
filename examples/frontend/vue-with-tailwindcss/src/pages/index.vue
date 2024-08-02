<template>
    <div class="flex justify-center items-center h-screen">
        <button class="bg-blue-600 text-white p-2 rounded-lg" @click="increment">Count is: {{ count }}</button>
        <span v-if="count">
            Hello World from Vue SSR!
        </span>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

function increment() {
    count.value++
}

onMounted(() => {
    console.log(`The initial count is ${count.value}.`)
})
</script>
