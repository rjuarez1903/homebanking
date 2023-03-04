const { createApp } = Vue
const useVuelidate  = Vuelidate.useVuelidate
const required      = VuelidateValidators.required

createApp({
    data() {
        return {
            v$:           useVuelidate(),
            client:       {},
            cards:        [],
            creditCards:  [],
            debitCards:   [],
            cardType:     "",
            cardColor:    "",
            noMoreCards:  false,
            errorMessage: ""
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
        signOutUser(e) {
            e.preventDefault()
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
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
        createCard() {
            axios.post("/api/clients/current/cards", `color=${this.cardColor}&type=${this.cardType}`)
                .then(response => {
                    if (response.status === 201) {
                        Swal.fire({
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            icon: 'success',
                            title: `Card created!`,
                            background: "var(--secondary-color)",
                            color: "#FFFFFF",
                        })
                        setTimeout(() => location.replace("/web/cards.html"),2000)
                    }
                })
                .catch(error => {
                    this.noMoreCards  = true
                    this.errorMessage =  error.response.data
                })
        },
        submitForm(e) {
            e.preventDefault()
            this.v$.cardType.$touch();
            this.v$.cardColor.$touch();
            if (!this.v$.cardType.$invalid && !this.v$.cardColor.$invalid) {
                this.createCard()
            } else {
            }
        }
    }
}).mount('#app')