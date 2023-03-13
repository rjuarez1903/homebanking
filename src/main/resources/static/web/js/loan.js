const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minValue      = VuelidateValidators.minValue


createApp({
    data() {
        return {
            client:             {},
            admin:              false,
            accounts:           [],
            v$:                 useVuelidate(),
            loans:              [],
            loan:               "",
            loanId:             "",
            payments:           "",
            loanAmount:         "",
            destinationAccount: "",
            loanAppError:       false,
            errorMessage:       ""
        }
    },
    created() {
        this.loadData()
    },
    validations() {
        return {
            loanId:             { required },
            payments:           { required },
            loanAmount:         {
                required,
                minValue: minValue(1),
            },
            destinationAccount: { required }
        }
    },
    methods: {
        loadData() {
            axios('/api/clients/current')
                .then(response => {
                    this.client   = response.data
                    this.accounts = this.client.accounts
                    if (this.client.email === "admin@admin.com") {
                        this.admin = true
                    }
                })
                .catch(error => console.log(error))
            axios('/api/loans')
                .then(response => {
                    this.loans   = response.data.slice(0,-1)
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
            const currentLoan = this.loans.filter(loan => loan.id === this.loanId)
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
        showInterest() {
            const currentLoan = this.loans.filter(loan => loan.id === this.loanId)
            if (currentLoan.length > 0) {
                return currentLoan[0].interestPercentage * 100
            }
        },
        showBalance() {
            return this.accounts.filter(account => account.number === this.destinationAccount)[0].balance.toLocaleString('de-DE', { style: 'currency', currency: 'USD' })
        },
        applyForLoan() {
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
                            Swal.fire({
                                showConfirmButton: false,
                                timer:            2000,
                                timerProgressBar: true,
                                icon:             'success',
                                title:            `Loan approved!`,
                                background:       "var(--secondary-color)",
                                color:            "#FFFFFF",
                            })
                        }
                        setTimeout(() => location.replace("/web/accounts.html"),2000)
                    }
                )

                .catch((error) => {
                    console.log(error.response.data)
                    this.loanAppError = true
                    this.errorMessage = error.response.data
                    Swal.fire({
                        showConfirmButton: false,
                        timer:            2000,
                        timerProgressBar: true,
                        icon:             'error',
                        title:            `${error.response.data}`,
                        background:       "var(--secondary-color)",
                        color:            "#FFFFFF",
                    })
                })
        },
        resetPaymentValues() {
            this.payments = ""
        },
        submitForm() {
            const currentLoan = this.loans.filter(loan => loan.id === this.loanId)
            const htmlContent =
                `
                 <p>You will get: <span class="fw-bold fs-4">${(parseInt(this.loanAmount)).toLocaleString('de-DE', { style: 'currency', currency: 'USD' })}</span></p>
                 <p>You will pay: <span class="fw-bold fs-4">${(parseInt(this.loanAmount) + parseInt(this.loanAmount) * currentLoan[0].interestPercentage).toLocaleString('de-DE', { style: 'currency', currency: 'USD' })}</span></p>
                 <p>Payments: <span class="fw-bold fs-4">${this.payments}</span></p>
                 <p>Monthly payment: <span class="fw-bold fs-4">${(parseInt(this.loanAmount) / this.payments).toLocaleString('de-DE', { style: 'currency', currency: 'USD' })}</span></p>
                `
            Swal.fire({
                title:             'Are you sure?',
                text:              "You won't be able to revert this.",
                icon:              'warning',
                html:              htmlContent,
                showCancelButton:  true,
                confirmButtonColor: 'var(--primary-color)',
                cancelButtonColor: '#d33',
                confirmButtonText:  'Confirm',
                background:        "#1F2023",
                color:             "#FFFFFF"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.applyForLoan()
                } else {
                    Swal.fire({
                        showConfirmButton: false,
                        timer:            2000,
                        timerProgressBar: true,
                        icon:             'error',
                        title:            `Loan application cancelled.`,
                        background:       "var(--secondary-color)",
                        color:            "#FFFFFF",
                    })
                }
            })
        },
        validateForm(e) {
            e.preventDefault()
            this.v$.loanId.$touch();
            this.v$.payments.$touch();
            this.v$.loanAmount.$touch();
            this.v$.destinationAccount.$touch();
            if (!this.v$.loanId.$invalid
                && !this.v$.payments.$invalid
                && !this.v$.loanAmount.$invalid
                && !this.v$.destinationAccount.$invalid) {
                this.submitForm()
            }
        }
    }

}).mount('#app')