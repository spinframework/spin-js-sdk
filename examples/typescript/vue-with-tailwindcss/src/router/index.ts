import { createWebHistory, createRouter, createMemoryHistory } from 'vue-router'

import index from '../pages/index.vue'

const routes = [
    { path: '/', component: index },
]

export function initRouter(server: boolean) {
    if (server) {
        return createRouter({
            history: createMemoryHistory(),
            routes,
        })
    }
    return createRouter({
        history: createWebHistory(),
        routes,
    })
}
