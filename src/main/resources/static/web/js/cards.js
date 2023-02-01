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
                .catch(error => console.log(error))
        },
        formatCardNumber(number) {
            return number.match(/.{1,4}/g).join(" ")
            
        }, 
        getStringDate(date) {
            const year = new Date(date).getFullYear().toString().slice(2)
            let month = new Date(date).getMonth() + 1
            if (month < 10) {
                month = month.toString().padStart(2, '0');
            } else {
                month = month.toString()
            }
            return `${month}/${year}`
        }
    }
}).mount('#app')