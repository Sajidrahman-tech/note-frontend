import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, X } from "lucide-react";

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const userId = "sajid123";

  const apiBase = process.env.REACT_APP_API_BASE;

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${apiBase}/${userId}`);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createNote = async () => {
    if (!title || !content) return;

    let imageBase64 = null;
    let imageName = null;

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        imageBase64 = reader.result.split(',')[1];
        imageName = imageFile.name;

        try {
          await axios.post(apiBase, { userId, title, content, imageBase64, imageName });
          resetForm();
          fetchNotes();
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      try {
        await axios.post(apiBase, { userId, title, content });
        resetForm();
        fetchNotes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateNote = async () => {
    try {
      await axios.put(`${apiBase}/${userId}/${editingNote.noteId}`, {
        title,
        content,
      });
      cancelEdit();
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${apiBase}/${userId}/${noteId}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    resetForm();
    setExpandedNoteId(null);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageFile(null);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen flex bg-neutral-900 text-white">
      {/* Sidebar */}
      <div className="w-60 p-6 bg-neutral-800 shadow-xl border-r border-neutral-700 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Keep Clone</h2>
        <nav className="flex flex-col gap-2">
          <button className="text-left hover:bg-neutral-700 p-2 rounded">Notes</button>
          <button className="text-left hover:bg-neutral-700 p-2 rounded">Reminders</button>
          <button className="text-left hover:bg-neutral-700 p-2 rounded">Archive</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto mb-6">
          <input
            className="w-full mb-2 p-3 rounded bg-neutral-700 text-white placeholder:text-neutral-400"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full mb-2 p-3 rounded bg-neutral-700 text-white placeholder:text-neutral-400"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="mb-3 block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {editingNote ? (
            <div className="flex gap-2">
              <button className="bg-blue-600 px-4 py-2 rounded" onClick={updateNote}>Update</button>
              <button className="bg-gray-500 px-4 py-2 rounded" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <button className="bg-green-600 px-4 py-2 rounded" onClick={createNote}>Create Note</button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.noteId}
              className={`p-4 rounded shadow-md bg-neutral-800 cursor-pointer transition-all duration-300 ${expandedNoteId === note.noteId ? "col-span-3 scale-105" : "hover:scale-[1.02]"}`}
              onClick={() => setExpandedNoteId(note.noteId)}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold break-words max-w-xs">{note.title}</h2>
                {expandedNoteId === note.noteId && (
                  <button onClick={(e) => { e.stopPropagation(); setExpandedNoteId(null); }}>
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap break-words">{note.content}</p>
              {note.imageUrl && (
               <img
               src={note.imageUrl}
               alt="Note"
               className="mt-3 w-full max-h-64 object-cover rounded-lg border border-neutral-700"
             />
              )}
              {expandedNoteId === note.noteId && (
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => startEdit(note)} className="text-blue-400"><Pencil size={16} /></button>
                  <button onClick={() => deleteNote(note.noteId)} className="text-red-400"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
