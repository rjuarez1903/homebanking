const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minValue      = VuelidateValidators.minValue
const numeric       = VuelidateValidators.numeric
const decimal       = VuelidateValidators.decimal

createApp({
    data() {
        return {
            v$:                          useVuelidate(),
            client:                      {},
            accounts:                    [],
            transferType:                "",
            sourceAccount:               "",
            ownDestinationAccount:       "",
            externalDestinationAccount:  "",
            amount:                      "",
            description:                 "",
            filteredAccounts:             [],
            transferError:               false,
            errorMessage:                ""
        }
    },
    created() {
        this.loadData()
    },
    validations() {
        return {
            transferType:  { required },
            sourceAccount: { required },
            ownDestinationAccount: { required },
            externalDestinationAccount: { required },
            amount: {
                required,
                minValue: minValue(1),
            },
            description: { required }
        }
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
        resetDestinationValues() {
            this.ownDestinationAccount      = ""
            this.externalDestinationAccount = ""
        },
        filterAccounts() {
            this.filteredAccounts = this.accounts.filter(account => account.number != this.sourceAccount)
        },
        showBalance() {
            return this.accounts.filter(account => account.number === this.sourceAccount)[0].balance.toLocaleString('de-DE', { style: 'currency', currency: 'USD' })
        },
        transfer() {
            axios.post("/api/transactions", `amount=${this.amount}&description=${this.description}&sourceAccountNumber=${this.sourceAccount}&destinationAccountNumber=${this.ownDestinationAccount || this.externalDestinationAccount}`)
                .then(response => {
                    if (response.status === 201) {
                        console.log(response.data)
                        this.transferError = false
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
                            title: `Transfer succeded!`,
                            background: "var(--secondary-color)",
                            color: "#FFFFFF",
                        })
                        this.loadData()
                    }
                })
                .catch(error => {
                    console.log(error.response.data)
                    this.transferError = true
                    this.errorMessage  = error.response.data
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
                        icon: 'error',
                        title: 'Transfer error!',
                        text: error.response.data,
                        background: "var(--secondary-color)",
                        color: "#FFFFFF",
                    })
                })
        },
        submitForm(e) {
            e.preventDefault()
            this.v$.transferType.$touch();
            this.v$.sourceAccount.$touch();
            this.v$.amount.$touch();
            this.v$.description.$touch();
            if (this.transferType == "Own account") {
                this.v$.ownDestinationAccount.$touch();
            } else if (this.transferType == "External transfer") {
                this.v$.externalDestinationAccount.$touch();
            }
            if (!this.v$.transferType.$invalid
                && !this.v$.sourceAccount.$invalid
                && (!this.v$.ownDestinationAccount.$invalid || !this.v$.externalDestinationAccount.$invalid)
                && !this.v$.amount.$invalid
                && !this.v$.description.$invalid) {
                this.transfer()
            } else {
            }
        }
    }

}).mount('#app')