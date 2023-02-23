const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minValue      = VuelidateValidators.minValue
const numeric       = VuelidateValidators.numeric
const decimal       = VuelidateValidators.decimal

createApp({
    data() {
        return {
            client:                      {},
            v$:                          useVuelidate(),
            loans:                       [],
            loan:                        "",
            loanId:                      "",
            payments:                    "",
            loanAmount:                  "",
            destinationAccount:          ""
            // accounts:                    [],
            // transferType:                "",
            // sourceAccount:               "",
            // ownDestinationAccount:       "",
            // externalDestinationAccount:  "",
            // amount:                      "",
            // description:                 "",
            // filteredAccounts:             [],
            // transferError:               false,
            // errorMessage:                ""
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
                })
                .catch(error => console.log(error))
            axios('/api/loans')
                .then(response => {
                    this.loans   = response.data
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
        getLoanPayments() {
            const currentLoan = this.loans.filter(loan => loan.id == this.loanId)
            if (currentLoan.length > 0) {
                return currentLoan[0].payments
            }
        },
        showMaxAmount() {
            const currentLoan = this.loans.filter(loan => loan.id === this.loanId)
            if (currentLoan.length > 0) {
                return currentLoan[0].maxAmount.toLocaleString('de-DE', { style: 'currency', currency: 'USD' })
            }
        },
        applyForLoan() {
            axios.post('/api/loans',{
                id:                       this.loanId,
                amount:                   this.loanAmount,
                payments:                 this.payments,
                destinationAccountNumber: this.destinationAccount
            })
                .then(response => console.log(response))
                .catch((error) => console.log(error.response.data))
        }
        // resetDestinationValues() {
        //     this.ownDestinationAccount      = ""
        //     this.externalDestinationAccount = ""
        // },
        // filterAccounts() {
        //     this.filteredAccounts = this.accounts.filter(account => account.number != this.sourceAccount)
        // },
        // submitForm(e) {
        //     e.preventDefault()
        //     this.v$.transferType.$touch();
        //     this.v$.sourceAccount.$touch();
        //     this.v$.amount.$touch();
        //     this.v$.description.$touch();
        //     if (this.transferType == "Own account") {
        //         this.v$.ownDestinationAccount.$touch();
        //     } else if (this.transferType == "External transfer") {
        //         this.v$.externalDestinationAccount.$touch();
        //     }
        //     if (!this.v$.transferType.$invalid
        //         && !this.v$.sourceAccount.$invalid
        //         && (!this.v$.ownDestinationAccount.$invalid || !this.v$.externalDestinationAccount.$invalid)
        //         && !this.v$.amount.$invalid
        //         && !this.v$.description.$invalid) {
        //         this.transfer()
        //     } else {
        //     }
        // }
    }

}).mount('#app')