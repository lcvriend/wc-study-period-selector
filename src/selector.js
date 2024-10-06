export class StudyPeriodSelector extends HTMLElement {
    static labels = {
        legend: "Periode",
        start: "maand vanaf",
        stop: "maand t/m",
        n: "aantal maanden",
        titles: {
            start: "Selecteer maand vanaf",
            stop: "Selecteer maand t/m",
            increment: "+1 maand",
            decrement: "-1 maand",
            reset: "Reset maanden",
            n: "Aantal ingeschreven maanden"
        }
    }

    static get observedAttributes() {
        return ["language"]
    }

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this._start = 0
        this._stop = 11
        this.render()
        this.setElems()
    }

    get language() {
        return this._language ?? "nl"
    }

    get months() {
        const translations = {
            "nl": [
                "september", "oktober", "november", "december",
                "januari", "februari", "maart", "april", "mei",
                "juni", "juli", "augustus"
            ],
            "en": [
                "September", "October", "November", "December",
                "January", "February", "March", "April", "May",
                "June", "July", "August"
            ]
        }
        return translations[this.language]
    }

    get start() {
        return this._start
    }

    set start(value) {
        this._start = value
        this.elems.start.value = this.start.toString()
        this.elems.labelStart.innerText = this.months[this.start]
        this.updateStopOptions()
    }

    get stop() {
        return this._stop
    }

    set stop(value) {
        this._stop = value
        this.elems.stop.value = this.stop.toString()
        this.elems.labelStop.innerText = this.months[this.stop]
        this.updateStartOptions()
    }

    get n() {
        return this._n
    }

    set n(value) {
        this._n = Math.min(Math.max(value, 1), 12)
        this.elems.n.value = this._n
        const detail = {
            n: this.n,
            start: this.start,
            stop: this.stop,
        }
        this.dispatchEvent(new CustomEvent("period-change", { detail: detail }))
    }

    connectedCallback() {
        this.n = 12
        this.start = 0
        this.stop = 11

        this.elems.start.addEventListener("change", this.handleMonthChange.bind(this))
        this.elems.stop.addEventListener("change", this.handleMonthChange.bind(this))
        this.elems.increment.addEventListener("click", this.handleIncrement.bind(this))
        this.elems.decrement.addEventListener("click", this.handleDecrement.bind(this))
        this.elems.reset.addEventListener("click", this.handleReset.bind(this))
        this.elems.n.addEventListener("change", this.handleNChange.bind(this))
        this.elems.labelStart.addEventListener("click", this.handleLabelClick.bind(this))
        this.elems.labelStop.addEventListener("click", this.handleLabelClick.bind(this))
    }

    setElems() {
        this.elems = {}
        const ids = [
            "start", "stop",
            "increment", "decrement", "reset", "n",
            "labelStart", "labelStop",
        ]
        for (const id of ids) {
            this.elems[id] = this.shadowRoot.getElementById(id)
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._language = newValue
        this.start = this.start
        this.stop = this.stop
    }

    render() {
        const template = `
            <style>
                *, *:before, *:after {
                    box-sizing: border-box;
                }
                :host {
                    display: block;
                }
                fieldset {
                    display: flex;
                    flex-direction: column;
                    gap: .5em;
                }
                fieldset > div {
                    display: grid;
                    grid-template-columns: 1fr 8em;
                    gap: .5em;
                }
                select {
                    height: 2em;
                }
                #buttons-and-labels {
                    display: flex;
                    flex-wrap: wrap;
                    gap: .5em;
                    div {
                        display: flex;
                        flex-wrap: wrap;
                    }
                    #labels {
                        margin-left: auto;
                        span {
                            font-variant: small-caps;
                            font-weight: bold;
                            user-select: none;
                            cursor: pointer;
                            &:hover {
                                text-decoration-line: underline;
                                text-decoration-style: dotted;
                            }
                        }
                    }
                }
                button {
                    width: 2em;
                    height: 2em;
                    padding: 0;
                    display: grid;
                    place-items: center;
                    &:hover {
                        cursor: pointer;
                    }
                    img {
                        width: .8em;
                        pointer-events: none;
                    }
                }
                label {
                    user-select: none;
                }
            </style>
            <fieldset>
                <legend>${StudyPeriodSelector.labels.legend}</legend>
                <div>
                    <select
                        name="start"
                        id="start"
                        autocomplete="off"
                        title="${StudyPeriodSelector.labels.titles.start}"
                    ></select>
                    <label for="start">${StudyPeriodSelector.labels.start}</label>
                </div>
                <div>
                    <select
                        name="stop"
                        id="stop"
                        autocomplete="off"
                        title="${StudyPeriodSelector.labels.titles.stop}"
                    ></select>
                    <label for="stop">${StudyPeriodSelector.labels.stop}</label>
                </div>
                <div>
                    <div id="buttons-and-labels">
                        <input
                            type="text"
                            id="n"
                            name="n"
                            value="12"
                            size="3"
                            autocomplete="off"
                            title="${StudyPeriodSelector.labels.titles.n}"
                        >
                        <div>
                            <button
                                id="increment"
                                title="${StudyPeriodSelector.labels.titles.increment}"
                            >
                                <img src="static/plus.svg">
                            </button>
                            <button
                                id="decrement"
                                title="${StudyPeriodSelector.labels.titles.decrement}"
                            >
                                <img src="static/minus.svg">
                            </button>
                            <button
                                id="reset"
                                title="${StudyPeriodSelector.labels.titles.reset}"
                            >
                                <img src="static/xmark.svg">
                            </button>
                        </div>
                        <div id="labels">Labels [<span id="labelStart"></span>-<span id="labelStop"></span>]</div>
                    </div>
                    <label for="n">${StudyPeriodSelector.labels.n}</label>
                </div>
            </fieldset>
        `
        this.shadowRoot.innerHTML = template
    }

    handleLabelClick(event) {
        const detail = {
            content: event.target.innerText
        }
        this.dispatchEvent(new CustomEvent("label-click", { detail: detail }))
    }

    handleReset() {
        this.start = 0
        this.stop = 11
        this.n = 12
    }

    handleIncrement() {
        this.n++
    }

    handleDecrement() {
        this.n--
    }

    handleNChange() {
        this.n = this.elems.n.value
    }

    handleMonthChange(event) {
        this[event.target.id] = parseInt(event.target.value)
        this.n = (this.stop - this.start) + 1
    }

    updateStartOptions() {
        this.elems.start.length = 0
        const months = this.months.slice(0, this.stop + 1)
        for (const [index, month] of months.entries()) {
            const option = document.createElement("option")
            option.value = index
            option.innerText = month
            this.elems.start.appendChild(option)
        }
        this.elems.start.value = this.start.toString()
    }

    updateStopOptions() {
        this.elems.stop.length = 0
        const months = this.months.slice(this.start, 12)
        for (const [index, month] of months.entries()) {
            const option = document.createElement("option")
            option.value = index + this.start
            option.innerText = month
            this.elems.stop.appendChild(option)
        }
        this.elems.stop.value = this.stop.toString()
    }
}


window.customElements.define('study-period-selector', StudyPeriodSelector)
