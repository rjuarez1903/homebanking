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
        createAccount() {
            axios.post('/api/clients/current/accounts')
                .then(() => {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    })
                    Toast.fire({
                        icon: 'success',
                        title: `Account created!`,
                        background: "var(--secondary-color)",
                        color: "#FFFFFF",
                    })
                    this.loadData()})
        }
    }

}).mount('#app')