const { createApp } = Vue

createApp({
    data() {
        return {
            client: {}
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios('/api/clients/current')
                .then(response => this.client = response.data)
                .catch(error => console.log(error))
        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        getStringDate(date) {
            return new Date(date).toLocaleDateString()
        },
        signOutUser() {
            axios.post('/api/logout')
                .then(response => console.log('Signed out'))
                .then(response => location.replace("/index.html"))
        }
    }

}).mount('#app')