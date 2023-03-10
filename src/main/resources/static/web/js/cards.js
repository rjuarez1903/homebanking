const { createApp } = Vue

createApp({
    data() {
        return {
            client:            {},
            cards:             [],
            creditCards:       [],
            debitCards:        [],
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
                    // this.creditCards = this.filterCards(this.cards, "CREDIT")
                    // this.debitCards  = this.filterCards(this.cards, "DEBIT")
                    this.activeCreditCards = this.cards.filter(card => card.active && card.type === "CREDIT")
                    this.activeDebitCards  = this.cards.filter(card => card.active && card.type === "DEBIT")
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
            return this.cards.filter(card => card.type === filter)
        },
        deleteCard(id) {
            axios.patch(`/api/clients/current/cards/${id}`)
                .then(response => {
                    console.log(response)
                    this.loadData()
                    Swal.fire({
                        icon:              'success',
                        title:             `Card deleted`,
                        background:        "var(--secondary-color)",
                        confirmButtonColor: 'var(--primary-color)',
                        color:             "#FFFFFF",
                    })
                })
                .catch(error => {
                    console.log(error)
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
        submit(id) {
            Swal.fire({
                title:             'Are you sure?',
                text:              "You won't be able to revert this.",
                icon:              'warning',
                showCancelButton:  true,
                confirmButtonColor: 'var(--primary-color)',
                cancelButtonColor: '#E41D66',
                confirmButtonText:  'Confirm',
                background:        "#1F2023",
                color:             "#FFFFFF"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteCard(id)
                } else {
                    Swal.fire({
                        showConfirmButton: false,
                        timer:            2000,
                        timerProgressBar: true,
                        icon:             'error',
                        title:            `No cards were deleted`,
                        background:       "var(--secondary-color)",
                        color:            "#FFFFFF",
                    })
                }
            })
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