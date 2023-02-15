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
            const urlParams = new URLSearchParams(window.location.search)
            const id =  urlParams.get('id')
            axios('/api/clients/current')
                .then(response => this.client = response.data)
                .catch(error => console.log(error))
            axios(`/api/accounts/${id}`)
                .then(response => {
                    this.account = response.data
                    this.transactions = this.account.transactions
                    this.sortByDate(this.transactions)
                })
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
        },
        getTransactionIcon(transaction) {
            if (transaction === "CREDIT") {
                return "up text-green fw-bold"
            } else {
                return "down text-warning fw-bold"
            }
        }
    }

}).mount('#app')