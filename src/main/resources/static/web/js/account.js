const { createApp } = Vue

createApp({
    data() {
        return {
            account:      {},
            transactions: []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            const urlParams = new URLSearchParams(window.location.search)
            const id =  urlParams.get('id')
            axios(`/api/accounts/${id}`)
                .then(response => this.account = response.data)
                .then(() => this.transactions = this.account.transactions)
                .then(() => this.sortByDate(this.transactions))
                .catch(error => console.log(error))
        },
        getDate(date) {
            return new Date(date).toLocaleString()
        },
        sortByDate(transactions) {
            transactions.sort((a,b) => new Date(b.date) - new Date(a.date))
        }
    }

}).mount('#app')