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
            axios('/api/clients/1')
                .then(response => {
                    this.client = response.data
                })
                .catch(error => console.log(error))
        }
    }

}).mount('#app')