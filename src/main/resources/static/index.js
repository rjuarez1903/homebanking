const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const email         = VuelidateValidators.email

createApp({
    data() {
        return {
            v$:                   useVuelidate(),
            login:                false,
            email:                "",
            password:             "",
            newClientFirstName:   "",
            newClientLastName:    "",
            newClientEmail:       "",
            newClientPassword:    "",
            invalidCredentials: false,
        }
    },
    created() {

    },
    methods: {
        toggleLogin() {
            this.login = !this.login
        },
        logUser() {
            axios.post('/api/login',
                {
                    email: this.email,
                    password: this.password
                },
                {
                    headers: {
                        'content-type':'application/x-www-form-urlencoded'
                    }
                })
                .then(() => location.replace("/web/accounts.html"))
                .catch(error => {
                    console.log(error.message)
                    this.invalidCredentials = true
                })
        },
        registerUser() {
            axios.post('/api/clients',
                        {
                            firstName: this.newClientFirstName,
                            lastName: this.newClientLastName,
                            email:    this.newClientEmail,
                            password: this.newClientPassword
                        },
                       {
                           headers:
                               {
                                   'content-type':'application/x-www-form-urlencoded'
                               }
                       })
                .then(response => console.log('Registered'))
                .then(() => {
                    this.email = this.newClientEmail
                    this.password = this.newClientPassword
                    this.logUser()
                })
        },
        submitForm(e) {
            e.preventDefault()
            this.v$.$validate()
            if (!this.v$.$error) {
                console.log('Yes!')
                this.logUser()
            } else {
                console.log('Nope')
            }
        },
    },
    validations() {
        return {
            email: { required, email },
            password: { required }
        }
    }
}).mount('#app')