import { useState, useEffect } from "react";
import "./index.css";

function Note({ title, content, onDelete, onEdit }) {
  return (
    <div className="note">
      <h3>{title}</h3>
      <p>{content}</p>
      <button onClick={onDelete}>Supprimer</button>
      <button onClick={onEdit}>Modifier</button>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [error, setError] = useState(null); // Pour gérer les erreurs

  // Fonction pour récupérer les notes du backend
  const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:3003/notes");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notes");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        throw new Error("Les données récupérées ne sont pas un tableau");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Récupérer les notes au démarrage
  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    if (title && content) {
      const note = { title, content };
      try {
        if (isEditing) {
          const updatedNotes = [...notes];
          const noteToEdit = notes[currentIndex];
          await fetch(`http://localhost:3003/notes/${noteToEdit.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
          });
          updatedNotes[currentIndex] = { ...noteToEdit, ...note };
          setNotes(updatedNotes);
          setIsEditing(false);
          setCurrentIndex(null);
        } else {
          const response = await fetch("http://localhost:3003/notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
          });
          if (!response.ok) {
            throw new Error("Erreur lors de l'ajout de la note");
          }
          const newNote = await response.json();
          setNotes([...notes, newNote]);
        }
        setTitle("");
        setContent("");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const deleteNote = async (index) => {
    const noteId = notes[index].id;
    try {
      await fetch(`http://localhost:3003/notes/${noteId}`, {
        method: "DELETE",
      });
      setNotes(notes.filter((_, i) => i !== index));
    } catch (err) {
      setError("Erreur lors de la suppression de la note");
    }
  };

  const editNote = (index) => {
    const note = notes[index];
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  return (
    <div>
      <h1>Application de prise de notes</h1>
      {error && <p className="error">{error}</p>}
      <div className="note-input">
        <label htmlFor="title">Titre de la note</label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Titre de la note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="content">Contenu de la note</label>
        <textarea
          id="content"
          name="content"
          placeholder="Contenu de la note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addNote}>
          {isEditing ? "Modifier la note" : "Ajouter la note"}
        </button>
      </div>

      <div className="notes-list">
        {notes.map((note, index) => (
          <Note
            key={note.id}
            title={note.title}
            content={note.content}
            onDelete={() => deleteNote(index)}
            onEdit={() => editNote(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
