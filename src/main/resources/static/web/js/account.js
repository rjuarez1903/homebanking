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
                .then(response => {
                    this.client = response.data
                    this.sortById(this.client.accounts)
                })
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
        sortById(accounts) {
            accounts.sort((a,b) => b.id - a.id)
        },
        getTransactionIcon(transaction) {
            if (transaction === "CREDIT") {
                return "up text-green fw-bold"
            }
                return "down text-warning fw-bold"
        },
        signOutUser(e) {
            e.preventDefault()
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
            })
            Toast.fire({
                icon: 'success',
                title: `Logging out...`,
                background: "var(--secondary-color)",
                color: "#FFFFFF",
            })
            setTimeout(() => {
                axios.post('/api/logout')
                    .then(() =>location.replace("/index.html"))
            }, 1000)
        },
    }

}).mount('#app')