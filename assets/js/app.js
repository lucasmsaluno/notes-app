class Note {
    constructor() {
        this.id = Date.now()
        this.title = "Enter a Title..."
        this.body = "Enter a Body..."
        this.selected = false,
        this.updated = new Date().toISOString()
    }
}

class NoteStorage {
    static save(notes) {
        localStorage.setItem("notes", JSON.stringify(notes))
    }

    static load() {
        const saved = localStorage.getItem("notes")
        return saved ? JSON.parse(saved) : []
    }
}

class NotesApp {
    constructor() {
        this._notes = NoteStorage.load()
        this._selectedNoteId = null
        this._initEventListeners()
        this._renderNotesList()
        this._updatePreviewState()
    }

    _initEventListeners() {
        this.addNotesButton = document.querySelector(".add-note")
        this.notesList = document.querySelector(".notes-list")
        this.previewTitle = document.querySelector(".preview-title")
        this.previewBody = document.querySelector(".preview-body")
        this.toggleButton = document.querySelector(".toggle-sidebar")
        this.toggleButtonIcon = document.querySelector(".toggle-sidebar > .fa")
        this.sidebar = document.querySelector(".notes-sidebar")

        this.addNotesButton.addEventListener("click", () => this._addNote())
        this.notesList.addEventListener("click", (e) => this._noteEventHandlers(e))
        this.previewTitle.addEventListener("input", (e) => this._updateNoteField(e))
        this.previewBody.addEventListener("input", (e) => this._updateNoteField(e))
        this.toggleButton.addEventListener("click", () => this._toggleSidebar())
    }

    _toggleSidebar () {
        this.sidebar.classList.toggle("show")
        if (this.toggleButtonIcon.classList.contains("fa-angle-right")) {
            this.toggleButtonIcon.classList.replace("fa-angle-right", "fa-angle-left")
        } else {
            this.toggleButtonIcon.classList.replace("fa-angle-left", "fa-angle-right")
        }
    }

    _formatDate(dateInput) {
        const date = new Date(dateInput)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${day}/${month}/${year} - ${hours}:${minutes}`
    }

    _addNote() {
        const newNote = new Note()
        this._notes.push(newNote)
        NoteStorage.save(this._notes)
        this._renderNotesList()
    }

    _removeNote(id) {
        this._notes = this._notes.filter(note => note.id !== +id)
        
        if (this.selectedNoteId === +id) {
            this.selectedNoteId = null
        }

        NoteStorage.save(this._notes)
        this._updatePreviewState()
        this._renderNotesList()
    }

    _updateNoteField(e) {
        const field = e.target.classList.contains("preview-title") ? "title" : "body"
        const value = e.target.value

        this._notes = this._notes.map(note => {
            if (note.id === this.selectedNoteId) {
                return {
                    ...note,
                    [field]: value,
                    updated: new Date().toISOString()
                }
            }
            return note
        })

        NoteStorage.save(this._notes)
        this._renderNotesList()
    }

    _updatePreviewState() {
        const selectedNote = this._notes.find(note => note.id === this.selectedNoteId)

        if (selectedNote) {
            this.previewTitle.value = selectedNote.title
            this.previewBody.value = selectedNote.body
            this.previewTitle.disabled = false
            this.previewBody.disabled = false
        } else {
            this.previewTitle.value = ""
            this.previewBody.value = ""
            this.previewTitle.disabled = true
            this.previewBody.disabled = true
        }
    }

    _selectNote(id) {
        this.selectedNoteId = +id
        this._notes.forEach(note => note.selected = note.id === this.selectedNoteId)
        this._updatePreviewState()
        this._renderNotesList()
    }

    _renderNotesList() {
        this.notesList.innerHTML = ""

        this._notes.forEach(note => {
            const noteElement = document.createElement("div")
            noteElement.classList.add("note")
            noteElement.setAttribute("data-id", note.id)
            if (note.selected) noteElement.classList.add("note-activated")

            noteElement.innerHTML = `
                <div class="note-header">
                <div class="header-title" style="max-width: 100%;">${note.title}</div>
                <div class="header-updated">Updated: ${this._formatDate(note.updated)}</div>
                </div>
                <button class="remove-note">❌</button>
            `

            this.notesList.appendChild(noteElement)
        })
    }

    _noteEventHandlers(e) {
        if (e.target.classList.contains("remove-note")) {
            e.stopPropagation()
            this._removeNote(e.target.parentElement.dataset.id)
        } else {
            this._selectNote(e.target.closest(".note").dataset.id)
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new NotesApp()
})