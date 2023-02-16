const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required

createApp({
    data() {
        return {
            v$:          useVuelidate(),
            client:      {},
            cards:       [],
            creditCards: [],
            debitCards:  [],
            cardType:    "",
            cardColor:   ""
        }
    },
    created() {
        this.loadData()
    },
    validations() {
        return {
            cardType:  { required },
            cardColor: { required }
        }
    },
    methods: {
        loadData() {
            axios("/api/clients/current")
                .then(response => {
                    this.client      = response.data
                    this.cards       = response.data.cards
                    this.creditCards = this.filterCards(this.cards, "CREDIT")
                    this.debitCards  = this.filterCards(this.cards, "DEBIT")
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
        signOutUser() {
            axios.post('/api/logout')
                .then(response => location.replace("/index.html"))
        },
        createCard() {
            axios.post("/api/clients/current/cards", `color=${this.cardColor}&type=${this.cardType}`)
                .then(response => {
                    location.replace("/web/cards.html")
                })
        },
        submitForm() {
            this.v$.cardType.$touch();
            this.v$.cardColor.$touch();
            if (!this.v$.cardType.$invalid && !this.v$.cardColor.$invalid) {
                console.log("Ok.")
                this.createCard()
            } else {
                console.log("Not ok.")
            }
        }
    }
}).mount('#app')