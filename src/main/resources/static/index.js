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
            invalidCredentials:   false,
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
                    email:    this.email,
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
                .then(() => {
                    this.email    = this.newClientEmail
                    this.password = this.newClientPassword
                    this.logUser()
                })
        },
        submitLoginForm(e) {
            e.preventDefault()
            this.v$.$validate()
            if (!this.v$.$error) {
                this.logUser()
            }
        },
        typingEffect() {
            document.addEventListener("DOMContentLoaded", function () {
                new TypeIt("#typed", {
                    loop:       true,
                    speed:      300,
                    startDelay: 900,
                })
                    .type("life")
                    .pause(1000)
                    .delete()
                    .type("finances")
                    .pause(1000)
                    .delete()
                    .type("business")
                    .pause(1000)
                    .delete()
                    .go();
            });
        }
    },
    validations() {
        return {
            email: { required, email },
            password: { required }
        }
    },
    mounted() {
        this.typingEffect()
    }
}).mount('#app')