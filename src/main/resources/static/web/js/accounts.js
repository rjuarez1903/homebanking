const { createApp } = Vue

createApp({
    data() {
        return {
            client:   {},
            accounts: [],
            loans:    {}
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
                    this.accounts =  this.client.accounts
                    this.loans    = this.client.loans
                    this.sortById(this.client.accounts)
                    // if (this.client.accounts.length === 0 && this.client.email != "admin@admin.com") {
                    //     this.createAccount()
                    // }
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
        getTotalBalance() {
            return this.accounts.reduce((accumulator, account) => {
                return accumulator + account.balance
            }, 0)
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
        // createAccount() {
        //     axios.post('/api/clients/current/accounts')
        //         .then(() => {
        //             const Toast = Swal.mixin({
        //                 toast: true,
        //                 position: 'top-end',
        //                 showConfirmButton: false,
        //                 timer: 3000,
        //                 timerProgressBar: true,
        //                 didOpen: (toast) => {
        //                     toast.addEventListener('mouseenter', Swal.stopTimer)
        //                     toast.addEventListener('mouseleave', Swal.resumeTimer)
        //                 }
        //             })
        //             Toast.fire({
        //                 icon: 'success',
        //                 title: `Account created!`,
        //                 background: "var(--secondary-color)",
        //                 color: "#FFFFFF",
        //             })
        //             this.loadData()})
        // },
        selectAccountType() {
            Swal.fire({
                title: 'Select your account type',
                input: 'select',
                inputOptions: {
                    CHECKING: 'Checking',
                    SAVINGS:  'Savings',
                },
                showCancelButton:   true,
                confirmButtonText:   'Create',
                confirmButtonColor:  'var(--primary-color)',
                cancelButtonColor:  '#d33',
                showLoaderOnConfirm: true,
                background:         "var(--secondary-color)",
                color:              "#FFFFFF",
                preConfirm: option => {
                    return axios.post('/api/clients/current/accounts', `type=${option}`)
                        .then(response => console.log(response))
                        .catch(error => Swal.showValidationMessage(error))
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then(result => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon:              'success',
                        title:             `Account created`,
                        background:        "var(--secondary-color)",
                        confirmButtonColor: 'var(--primary-color)',
                        color:             "#FFFFFF",
                    })
                }
            }).then(() => this.loadData())
        }
    }

}).mount('#app')