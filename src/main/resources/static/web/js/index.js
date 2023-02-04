const { createApp } = Vue

createApp({
    data() {
        return {
            login: false
        }
    },
    created() {
        
    },
    methods: {
        toggleLogin() {
            this.login = !this.login
        }
    }
}).mount('#app')