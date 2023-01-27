const { createApp } = Vue

createApp({
    data() {
        return {
            client: {}
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/4')
                .then(response => {
                    this.client = response.data
                })
                .catch(error => console.log(error))
        }
    }

}).mount('#app')