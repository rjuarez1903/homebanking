const { createApp } = Vue

createApp({
    data() {
        return {
            login:              false,
            email:              "",
            password:           "",
            newClientFirstName: "",
            newClientLastName:  "",
            newClientEmail:     "",
            newClientPassword:  "",
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
                .then(response => console.log('Signed in'))
                .then(response => location.replace("/web/accounts.html"))
        },
        registerUser() {
            axios.post('/api/clients',
                        {
                            firstName: this.newClientFirstName,
                            lastName: this.newClientLastName,
                            email: this.newClientEmail,
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
                    console.log(this.newClientFirstName)
                    console.log(this.newClientLastName)
                    console.log(this.newClientEmail)
                    console.log(this.newClientPassword)
                })
                .then(() => {
                    this.email = this.newClientEmail
                    this.password = this.newClientPassword
                    this.logUser()
                })
        },
    }
}).mount('#app')