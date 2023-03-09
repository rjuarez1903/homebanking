const { createApp } = Vue

createApp({
    data() {
        return {
            client:           {},
            accounts:         [],
            inactiveAccounts: [],
            loans:            {}
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/current')
                .then(response => {
                    this.client           = response.data
                    this.accounts         = this.client.accounts.filter(account => account.active == true)
                    this.inactiveAccounts = this.client.accounts.filter(account => account.active == false)
                    this.loans            = this.client.loans
                    this.sortById(this.accounts)
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
        createAccount(option) {
            axios.post('/api/clients/current/accounts', `type=${option}`)
                .then(response => {
                    console.log(response)
                    this.loadData()
                })
                .catch(error => Swal.showValidationMessage(error))
        },
        deleteAccount(id) {
            axios.patch(`/api/clients/current/accounts/${id}`)
                .then(response => {
                    console.log(response)
                    this.loadData()
                    Swal.fire({
                        icon:              'success',
                        title:             `Account deleted`,
                        background:        "var(--secondary-color)",
                        confirmButtonColor: 'var(--primary-color)',
                        color:             "#FFFFFF",
                    })
                })
                .catch(error => console.log(error))
        },
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
                cancelButtonColor:  '#E41D66',
                showLoaderOnConfirm: true,
                background:         "var(--secondary-color)",
                color:              "#FFFFFF",
                preConfirm: option => {
                    return this.createAccount(option)
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
        },
        submitForm(id) {
            Swal.fire({
                title:             'Are you sure?',
                text:              "You won't be able to revert this.",
                icon:              'warning',
                showCancelButton:  true,
                confirmButtonColor: 'var(--primary-color)',
                cancelButtonColor: '#E41D66',
                confirmButtonText:  'Confirm',
                background:        "#1F2023",
                color:             "#FFFFFF"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteAccount(id)
                } else {
                    Swal.fire({
                        showConfirmButton: false,
                        timer:            2000,
                        timerProgressBar: true,
                        icon:             'error',
                        title:            `No accounts were disabled`,
                        background:       "var(--secondary-color)",
                        color:            "#FFFFFF",
                    })
                }
            })
        }
    }

}).mount('#app')