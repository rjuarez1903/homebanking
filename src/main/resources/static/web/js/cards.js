const { createApp } = Vue

createApp({
    data() {
        return {
            client:      {},
            cards:       [],
            creditCards: [],
            debitCards:  [],
            activeCreditCards: [],
            activeDebitCards:  []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            axios("/api/clients/current")
                .then(response => {
                    this.client      = response.data
                    this.cards       = response.data.cards
                    this.creditCards = this.filterCards(this.cards, "CREDIT")
                    this.debitCards  = this.filterCards(this.cards, "DEBIT")
                    this.activeCreditCards = this.creditCards.filter(card => card.expired == false)
                    this.activeDebitCards  = this.debitCards.filter(card => card.expired == false)
                })
                .catch(error => console.log(error))
        },
        toggleMenu(e) {
            const menu = document.querySelector('aside')
            e.preventDefault()
            menu.classList.toggle('toggle-menu')
        },
        formatCardNumber(number) {
            return number.match(/.{1,4}/g)
        }, 
        getStringDate(date) {
            const year = new Date(date).getFullYear().toString().slice(2)
            let month  = new Date(date).getMonth() + 1
            if (month < 10) {
                month = month.toString().padStart(2, '0');
            } else {
                month = month.toString()
            }
            return `${month}/${year}`
        },
        filterCards(cards, filter) {
            return this.cards.filter(card => card.type == filter)
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
    }
}).mount('#app')