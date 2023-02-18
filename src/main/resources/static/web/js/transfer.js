const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minValue      = VuelidateValidators.minValue
// const maxValue      = VuelidateValidators.maxValue

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
                minValue: minValue(1)
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
        signOutUser() {
            axios.post('/api/logout')
                .then(response => location.replace("/index.html"))
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
                        console.log(response.status)
                    }
                })
                .catch(error => {
                    this.transferError = true
                    this.errorMessage  = error.response.data
                })
        },
        submitForm(e) {
            e.preventDefault()
            console.log(this.transferType);
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