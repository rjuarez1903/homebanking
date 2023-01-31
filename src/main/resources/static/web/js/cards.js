const { createApp } = Vue

createApp({
    data() {
        return {
            cards: []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios("/api/clients/1")
                .then(response => this.cards = response.data.cards)
                .then(() => console.log(this.cards))
                .catch(error => console.log(error))

        }
    }
}).mount('#app')