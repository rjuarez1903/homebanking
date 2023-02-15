const { createApp } = Vue

createApp({
    data() {
        return {
            regExMail:    /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)$/,
            json:         {},
            clients:      [],
            firstName:     '',
            lastName:     '',
            email:        '',
            clientDetail: {},
            firstNameEdit: '',
            lastNameEdit: '',
            emailEdit:    '',
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios.get('/rest/clients')
                .then(response => {

                    this.json    = response
                    this.clients = response.data._embedded.clients
                })
                .catch(error => console.log(error))
        },
        getClientId(client) {
            return client._links.client.href.split("/").slice(-1).toString()
        },
        addClient() {
            if ((this.firstName != '' && this.lastName != '') && (this.regExMail.test(this.email))) {
                this.postClient()
            }
        },
        postClient() {
            axios.post('/rest/clients', {
                firstName: this.firstName,
                lastName:  this.lastName,
                email:     this.email
            })
                .then(() => this.loadData()
                )
                .catch(error => console.log(error))
        },
        showClient(id) {
            this.clientDetail = this.clients.filter(client => this.getClientId(client) == id)[0]
            axios.get(`/rest/clients/${id}`)
                .then(response => {
                    this.firstNameEdit = response.data.firstName
                    this.lastNameEdit  = response.data.lastName
                    this.emailEdit     = response.data.email
                })
        },
        signOutUser() {
            axios.post('/api/logout')
                .then(response => console.log('Signed out'))
                .then(response => location.replace("/index.html"))
        }
        // editClient(id) {
        //     if ((this.firstNameEdit != '' && this.lastNameEdit != '') && (this.regExMail.test(this.emailEdit))) {
        //         axios.put(`/rest/clients/${id}`, {
        //             firstName: this.firstNameEdit,
        //             lastName:  this.lastNameEdit,
        //             email:     this.emailEdit,
        //         })
        //             .then(() => this.loadData())
        //             .catch(error => console.log(error))
        //     }
        // },
        // deleteClient(id) {
        //     axios.delete(`/rest/clients/${id}`)
        //         .then(() => this.loadData())
        //         .catch(error => console.log(error))
        // }
    }
}).mount('#app')