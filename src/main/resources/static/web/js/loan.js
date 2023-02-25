const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minValue      = VuelidateValidators.minValue
const numeric       = VuelidateValidators.numeric
const decimal       = VuelidateValidators.decimal

createApp({
    data() {
        return {
            client:             {},
            v$:                 useVuelidate(),
            loans:              [],
            loan:               "",
            loanId:             "",
            payments:           "",
            loanAmount:         "",
            destinationAccount: ""
        }
    },
    created() {
        this.loadData()
    },
    validations() {
        return {
            loanId:             { required },
            payments:           { required },
            loanAmount:         { required },
            destinationAccount: { required }
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
            const Toast = Swal.mixin({
                toast:            true,
                position:         'top-end',
                showConfirmButton: false,
                timer:            2500,
                timerProgressBar: true,
            })
            axios.post('/api/loans',
                {
                    id:                       this.loanId,
                    amount:                   this.loanAmount,
                    payments:                 this.payments,
                    destinationAccountNumber: this.destinationAccount
                }
            )
                .then(response => {
                        console.log(response.data)
                        if (response.status == 201) {
                            Toast.fire({
                                icon:       'success',
                                title:      `Loan approved!`,
                                background: "var(--secondary-color)",
                                color:      "#FFFFFF",
                            })
                        }
                    }
                )
                .catch((error) => {
                    console.log(error.response.data)
                    Toast.fire({
                        icon:       'error',
                        title:      `${error.response.data}`,
                        background: "var(--secondary-color)",
                        color:      "#FFFFFF",
                    })
                })
        },
        submitForm() {
            const Toast = Swal.mixin({
                toast:            true,
                position:         'top-end',
                showConfirmButton: false,
                timer:            2500,
                timerProgressBar: true,
            })
            Swal.fire({
                title:             'Are you sure?',
                text:              "You won't be able to revert this.",
                icon:              'warning',
                showCancelButton:  true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText:  'Confiirm',
                background:        "#1F2023",
                color:             "#FFFFFF"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.applyForLoan()
                } else {
                    Toast.fire({
                        icon:       'error',
                        title:      `Loan application cancelled.`,
                        background: "var(--secondary-color)",
                        color:      "#FFFFFF",
                    })
                }
            })
        },
        // resetDestinationValues() {
        //     this.ownDestinationAccount      = ""
        //     this.externalDestinationAccount = ""
        // },
        // filterAccounts() {
        //     this.filteredAccounts = this.accounts.filter(account => account.number != this.sourceAccount)
        // },
        validateForm(e) {
            e.preventDefault()
            this.v$.loanId.$touch();
            this.v$.payments.$touch();
            this.v$.loanAmount.$touch();
            this.v$.destinationAccount.$touch();
            console.log(this.v$.loanId.$invalid)
            if (!this.v$.loanId.$invalid
                && !this.v$.payments.$invalid
                && !this.v$.loanAmount.$invalid
                && !this.v$.destinationAccount.$invalid) {
                this.submitForm()
            }
        }
    }

}).mount('#app')