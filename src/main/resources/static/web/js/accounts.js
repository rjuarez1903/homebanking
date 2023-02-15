const { createApp } = Vue

createApp({
    data() {
        return {
            client: {},
            loans:  {}
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/current')
                .then(response => {
                    this.client = response.data
                    this.loans  = this.client.loans
                    this.sortById(this.client.accounts)
                    if (this.client.accounts.length === 0) {
                        this.createAccount()
                    }
                })
                .catch(error => console.log(error))
        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        getStringDate(date) {
            return new Date(date).toLocaleDateString()
        },
        sortById(accounts) {
            accounts.sort((a,b) => b.id - a.id)
        },
        signOutUser() {
            axios.post('/api/logout')
                .then(response => location.replace("/index.html"))
        },
        createAccount() {
            axios.post('/api/clients/current/accounts')
                .then(() => this.loadData())
        }
    }

}).mount('#app')