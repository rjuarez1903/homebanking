const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required
const minLength     = VuelidateValidators.minLength
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
            emailInUse:           false
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
                        `email=${this.email}&password=${this.password}`,
                        {
                            headers: {
                                'content-type':'application/x-www-form-urlencoded'
                            }
                        })
                .then(() => {
                    if (this.email == "admin@admin.com") {
                        location.replace("/manager/manager.html")
                    } else {
                        location.replace("/web/accounts.html")
                    }

                })
                .catch(error => {
                    console.log(error.message)
                    this.invalidCredentials = true
                })
        },
        registerUser() {
            axios.post('/api/clients',
                        `firstName=${this.newClientFirstName}&lastName=${this.newClientLastName}&email=${this.newClientEmail}&password=${this.newClientPassword}`,
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
                .catch(error => {
                    console.log(error.response.data)
                    if (error.response.data == "Email already in use") {
                        this.emailInUse = true
                    }
                })
        },
        submitLoginForm(e) {
            e.preventDefault()
            this.v$.email.$touch();
            this.v$.password.$touch();
            if (!this.v$.email.$invalid && !this.v$.password.$invalid) {
                    this.logUser()
            }
        },
        submitSignUpForm(e) {
            e.preventDefault()
            this.v$.newClientFirstName.$touch();
            this.v$.newClientLastName.$touch();
            this.v$.newClientEmail.$touch();
            this.v$.newClientPassword.$touch();
            if (!this.v$.newClientFirstName.$invalid &&
                !this.v$.newClientLastName.$invalid &&
                !this.v$.newClientEmail.$invalid &&
                !this.v$.newClientPassword.$invalid) {
                this.registerUser()
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
            email:              { required, email },
            password:           { required },
            newClientFirstName: { required },
            newClientLastName:  { required },
            newClientEmail:     { required, email },
            newClientPassword:  { required, minLength: minLength(8) }
        }
    },
    mounted() {
        this.typingEffect()
    }
}).mount('#app')