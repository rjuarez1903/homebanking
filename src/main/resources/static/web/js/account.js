const { createApp } = Vue

createApp({
    data() {
        return {
            client:       {},
            account:      {},
            transactions: []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/1')
                .then(response => this.client = response.data)
                .catch(error => console.log(error))
            const urlParams = new URLSearchParams(window.location.search)
            const id =  urlParams.get('id')
            axios(`/api/accounts/${id}`)
                .then(response => this.account = response.data)
                .then(() => this.transactions = this.account.transactions)
                .then(() => this.sortByDate(this.transactions))
                .catch(error => console.log(error))
        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        getDate(date) {
            return new Date(date).toLocaleString()
        },
        sortByDate(transactions) {
            transactions.sort((a,b) => new Date(b.date) - new Date(a.date))
        }
    }

}).mount('#app')