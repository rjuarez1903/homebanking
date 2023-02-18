const { createApp } = Vue

createApp({
    data() {
        return {
            client:                      {},
            accounts:                    [],
            transferType:                "",
            sourceAccount:               "",
            ownDestinationAccount:       "",
            externalDestinationAccount:  "",
            amount:                      "",
            description:                 "",
            filteredAccounts:             []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/current')
                .then(response => {
                    this.client   = response.data
                    this.accounts = this.client.accounts
                })
                .catch(error => console.log(error))
        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        signOutUser() {
            axios.post('/api/logout')
                .then(response => location.replace("/index.html"))
        },
        transfer(e) {
            e.preventDefault()
            console.log(this.transferType)
            console.log(this.sourceAccount)
        },
        filterAccounts() {
            this.filteredAccounts = this.accounts.filter(account => account.number != this.sourceAccount)
        },
        showBalance() {
            return this.accounts.filter(account => account.number === this.sourceAccount)[0].balance.toLocaleString('de-DE', { style: 'currency', currency: 'USD' })
        },
        transfer(e) {
            e.preventDefault()
            axios.post("/api/transactions", `amount=1000.10&description=first transaction usign the API&sourceAccountNumber=VIN001&destinationAccountNumber=VIN002`)
        }

    }

}).mount('#app')