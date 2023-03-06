const { createApp } = Vue

createApp({
    data() {
        return {
            client:         {},
            activeAccounts: {},
            account:        {},
            transactions:   [],
            fromDate:       "",
            thruDate:       ""
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
                    this.client         = response.data
                    this.activeAccounts = this.client.accounts.filter(account => account.active == true)
                    this.sortById(this.activeAccounts)
                    this.getAccount(id)
                })
                .catch(error => console.log(error))

        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        getAccount(id) {
            axios(`/api/clients/current/accounts`)
                .then(response => {
                    this.account      = response.data.filter(account => account.id == id)[0]
                    this.transactions = this.account.transactions
                    this.sortByDate(this.transactions)
                })
                .catch(error => console.log(error))
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
                return "down text-danger fw-bold"
        },
        signOutUser(e) {
            e.preventDefault()
            const Toast = Swal.mixin({
                toast:            true,
                position:         'top-end',
                showConfirmButton: false,
                timer:            1000,
                timerProgressBar: true,
            })
            Toast.fire({
                icon:       'success',
                title:      `Logging out...`,
                background: "var(--secondary-color)",
                color:      "#FFFFFF",
            })
            setTimeout(() => {
                axios.post('/api/logout')
                    .then(() =>location.replace("/index.html"))
            }, 1000)
        },
    },
    components: { Datepicker: VueDatePicker }
}).mount('#app')