# Book CRUD (React + Django REST)

Simple CRUD demo: React frontend + Django REST backend for managing books.

## Tech stack
- Frontend: React + Vite ([client/app/package.json](client/app/package.json))
- Backend: Django + Django REST Framework + django-cors-headers ([server/djangoProject/djangoProject/settings.py](server/djangoProject/djangoProject/settings.py))
- DB: SQLite ([server/djangoProject/db.sqlite3](server/djangoProject/db.sqlite3))

## Quick start

Backend
```bash
cd server/djangoProject
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python [manage.py](http://_vscodecontentref_/0) migrate
python [manage.py](http://_vscodecontentref_/1) runserver

Great question — this is **exactly the right way** to learn.
I’ll explain this **from the big picture first**, then slowly zoom in.
No syntax first. No code first. **Logic first.**

```

# Logic of CRUD for beginners
# Building a Backend API from Absolute Scratch

## PART 0 — What Problem Are We Solving?

You are building a backend API. That means:

Other programs (browser, frontend, mobile app) send messages to your server. Your server reads them, talks to the database, and sends messages back.

These messages travel using HTTP.

---

## PART 1 — What is an HTTP Request? (VERY BASIC)

When a frontend sends something to your backend, it sends:

```
METHOD   URL            BODY
POST     /books/        {"title": "Harry Potter"}
```

Three key parts:

| Part   | What it means                              |
|--------|--------------------------------------------|
| METHOD | What action to do (GET, POST, PUT, DELETE) |
| URL    | Which resource we're talking about         |
| BODY   | The actual data (usually JSON text)        |

---

## PART 2 — What is JSON?

JSON is just text.

Example JSON (TEXT):
```json
{"title": "Harry Potter"}
```

Your computer cannot work directly with JSON text. Python needs this instead:
```python
{"title": "Harry Potter"}   # Python dictionary
```

📌 **Someone must convert JSON text → Python object**

That "someone" is Django REST Framework.

---

## PART 3 — What is Django REST Framework (DRF)?

DRF is a translator. It sits between:

```
Frontend (JSON text)
        ↓
DRF
        ↓
Django (Python objects, database)
```

Its job is to:
1. Read JSON text from the request
2. Turn it into Python objects
3. Validate data
4. Talk to Django models
5. Turn Python objects back into JSON text

---

## PART 4 — What is `@api_view`?

```python
@api_view(['GET'])
```

This means: "This function is an API endpoint, not a normal web page."

Without this:
- Django expects HTML
- You cannot use `request.data`
- You cannot return `Response()`

📌 Think of it as switching Django into **API mode**.

---

## PART 5 — What is `request`?

```python
def get_books(request):
```

`request` is a box full of information sent by the client. Inside it:

| Attribute        | What it contains                          |
|------------------|-------------------------------------------|
| `request.method` | "GET", "POST", etc.                       |
| `request.data`   | Python object converted from JSON         |
| `request.headers`| Metadata about the request                |

---

## 🔴 IMPORTANT: `request.data`

`request.data` is **already** a Python object.

Example: Client sends JSON text:
```json
{"title": "Book A"}
```

DRF converts it into:
```python
request.data == {"title": "Book A"}
```

So:
- ❌ **NOT** a JSON string
- ✅ **Python dict**

---

## PART 6 — What is a Model? (Book)

```python
class Book(models.Model):
    title = models.CharField(...)
```

A model represents a table in the database.

| Database | Django          |
|----------|-----------------|
| Row      | Model instance  |
| Table    | Model class     |

Example:

**Database:**
```
id | title
------------
1  | Book A
```

**Becomes in Python:**
```python
book = Book(id=1, title="Book A")
```

---

## PART 7 — What is a Serializer? (CORE IDEA)

This is the **MOST IMPORTANT** part.

A serializer is a translator between:

| Direction | From        | To          |
|-----------|-------------|-------------|
| Reading   | Model       | Python dict |
| Writing   | Python dict | Model       |

📌 **Serializer does NOT produce JSON text**

---

### Example serializer

```python
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
```

This tells DRF: "Here is how a Book should look when converted to/from data."

---

## PART 8 — GET Endpoint (Reading Data)

```python
books = Book.objects.all()
```

What you get:
```python
<QuerySet [Book, Book, Book]>
```

These are Python objects, **NOT** sendable over the internet.

---

```python
serializer = BookSerializer(books, many=True)
```

Meaning: "Convert **MANY** Book objects into data."

---

```python
serializer.data
```

Result:
```python
[
  {"id": 1, "title": "Book A"},
  {"id": 2, "title": "Book B"}
]
```

📌 This is:
- Python list
- Python dicts
- **Still NOT JSON text**

---

```python
return Response(serializer.data)
```

**What `Response()` does:**
Convert Python objects → JSON text → HTTP response

Now the client receives **real JSON**.

---

## PART 9 — POST Endpoint (Creating Data)

```python
data = request.data
```

Already Python:
```python
{"title": "New Book"}
```

---

```python
serializer = BookSerializer(data=data)
```

Meaning: "Check if this data can become a Book."

---

```python
serializer.is_valid()
```

Checks:
- Required fields
- Data types
- Rules

---

```python
serializer.save()
```

This:
1. Creates a Book object
2. Saves it to the database

---

```python
serializer.data
```

Now returns:
```python
{"id": 3, "title": "New Book"}
```

---

## PART 10 — PUT (Update Data)

```python
serializer = BookSerializer(book, data=data)
```

Meaning: "Update **THIS** existing book using **THIS** data."

Without `book`, DRF would create a new one.

---

## PART 11 — DELETE

```python
book.delete()
```

No serializer needed:
- Just remove the row from database

---

## PART 12 — The FULL Data Life Cycle (Memorize This)

```
JSON text (client)
↓
request.data (Python dict)
↓
Serializer (validation / conversion)
↓
Model instance (database)
↓
Serializer.data (Python dict)
↓
Response()
↓
JSON text (client)
```

---

## FINAL MENTAL RULES (IMPORTANT)

### Rule 1
**Serializer ≠ JSON**

Serializer ↔ Python objects

---

### Rule 2
**`Response()` creates JSON**

You never manually convert to JSON.

---

### Rule 3
**Models never leave the server**

Only Python dicts/lists go into `Response()`.

# About CRUD
# 🌍 BIG PICTURE (Before Any Code Exists)

You are building **one system**, not two separate things.

That system has **two roles**:

### 🧠 Backend (Django)

* Stores data (books)
* Decides **how data is created, read, updated, deleted**
* Talks in **JSON**
* Does **NOT** care about buttons or screens

### 👀 Frontend (React)

* Shows data to users
* Collects user actions (clicks, typing)
* Sends requests to backend
* Does **NOT** store data permanently

They **communicate through HTTP requests**.

---

# 🔁 THE CORE LOOP (This Is Everything)

Every modern web app follows this loop:

```
User → Frontend → Backend → Frontend → Screen
```

Or more clearly:

1. User does something
2. Frontend sends a request
3. Backend processes data
4. Backend sends data back
5. Frontend updates the UI

**Everything in your code exists to support this loop.**

---

# 🧩 WHAT IS CRUD (WHY WE NEED IT)

CRUD is just **how data lives**:

| Action | Meaning      | HTTP Method |
| ------ | ------------ | ----------- |
| Create | Add new data | POST        |
| Read   | Get data     | GET         |
| Update | Change data  | PUT         |
| Delete | Remove data  | DELETE      |

Your app manages **books**, so you need **all four**.

---

# 🧠 WHY FRONTEND DOES NOT DIRECTLY TOUCH DATABASE

Frontend:

* Runs in the browser
* Is insecure
* Cannot access database

Backend:

* Is protected
* Owns the database
* Enforces rules

So frontend must **ask** backend politely:

> “Please create a book”
>
> “Please give me books”

---

# 🔄 FULL DATA FLOW (IMPORTANT)

Let’s walk through the **entire life cycle** of your app.

---

## 🟢 STEP 1: Page Loads

User opens your website.

React starts running from top to bottom.

👉 **But there is NO data yet**

So first question:

> “Where do books come from?”

Answer:
👉 Backend

---

## 🟢 STEP 2: Frontend Asks Backend for Data (READ)

Frontend sends:

```
GET /api/books/
```

Backend:

* Reads database
* Converts records → JSON
* Sends JSON back

Frontend:

* Receives JSON
* Stores it in **state**
* Displays it on screen

This is why you need:

* `fetch`
* `useEffect`
* `useState`

**Without state, UI cannot change.**

---

## 🟢 STEP 3: Frontend Stores Data in State (WHY?)

Why not use a normal variable?

Because:

| Normal Variable  | State                    |
| ---------------- | ------------------------ |
| React ignores it | React watches it         |
| UI won’t update  | UI updates automatically |

So:

```
Backend → JSON → React state → Screen
```

This is the **one-way data flow**.

---

# 🟡 STEP 4: User Adds a Book (CREATE)

User types:

* Title
* Release year

Frontend collects input.

Frontend sends:

```
POST /api/books/create/
```

With JSON body:

```json
{
  "title": "Harry Potter",
  "release_year": 2001
}
```

Backend:

* Validates data
* Saves to database
* Returns new book as JSON

Frontend:

* Receives new book
* Adds it to existing state
* Screen updates instantly

**Backend never touches UI.**
**Frontend never touches database.**

---

# 🔵 STEP 5: User Updates a Book (UPDATE)

User wants to change title.

Frontend already knows:

* Book ID
* Release year

Frontend sends:

```
PUT /api/books/3
```

With JSON:

```json
{
  "title": "New Title",
  "release_year": 2001
}
```

Backend:

* Finds book by ID
* Updates it
* Sends updated book back

Frontend:

* Replaces only that book in state
* UI updates

**React does NOT refresh the page.**
It just changes state.

---

# 🔴 STEP 6: User Deletes a Book (DELETE)

Frontend sends:

```
DELETE /api/books/3
```

Backend:

* Deletes from database
* Sends response

Frontend:

* Removes book from state
* UI updates

---

# 🧠 WHY EVERYTHING IS DONE IN THIS ORDER

You asked:

> *“Why walk through from first line to the end?”*

Because React works like this:

1. Setup state
2. Load initial data
3. Wait for user actions
4. React to events
5. Update state
6. Re-render UI

**React is event-driven, not step-by-step like Python scripts.**

---

# 🧠 MENTAL MODEL (THIS IS GOLD)

Think like this:

```
Backend = Brain
Frontend = Face
State = Memory
Fetch = Messenger
```

* Brain stores knowledge
* Face shows expressions
* Messenger carries messages
* Memory keeps current information

---

# 🧩 WHY EACH TOOL EXISTS

| Tool         | Why it exists                    |
| ------------ | -------------------------------- |
| `useState`   | Store data that affects UI       |
| `useEffect`  | Run side-effects (fetching data) |
| `fetch`      | Talk to backend                  |
| JSON         | Shared language                  |
| HTTP methods | Meaningful actions               |

---

# 🎯 FINAL BIG PICTURE (One Sentence)

> **Your frontend never owns data — it requests, displays, and updates it through the backend using CRUD over HTTP, and React state is the bridge that turns backend data into UI.**

---
Below is a **beginner-friendly explanation** of the **syntax** and the **entire process** of your React code. I’ll ignore the comments inside your code and explain everything step by step in simple language.

---

## 1️⃣ Imports (Top of the file)

```js
import { useEffect, useState } from 'react'
import './App.css'
```

### What this means

* `useState` → lets your component **store and change data**
* `useEffect` → lets your component **run code at certain times**
* `App.css` → styling for this component

> React components are functions, and these hooks give them extra powers.

---

## 2️⃣ Component Function

```js
function App() {
```

* This defines a **React component**
* A component is a **function that returns UI (HTML-like JSX)**

React will render whatever this function returns.

---

## 3️⃣ State Variables (useState)

```js
const [books, setBooks] = useState([]);
const [title, setTitle] = useState("");
const [releaseYear, setReleaseYear] = useState(0);
const [newTitle, setNewTitle] = useState("");
```

### What is state?

State is **data that can change** and cause the UI to update.

### Explanation of each state

| State         | Purpose                               |
| ------------- | ------------------------------------- |
| `books`       | Stores the list of books from backend |
| `title`       | Stores title typed in input           |
| `releaseYear` | Stores release year typed in input    |
| `newTitle`    | Stores new title when updating a book |

`setSomething` is used to **update** the value.

---

## 4️⃣ useEffect (Runs when component loads)

```js
useEffect(() => {
  fetchBooks();
}, []);
```

### What this does

* Runs **once** when the page loads
* Calls `fetchBooks()` to load books from backend

`[]` means:

> “Run this only on first render”

---

## 5️⃣ Fetching Books from Backend (GET)

```js
const fetchBooks = async () => {
  const response = await fetch("http://127.0.0.1:8000/api/books/");
  const data = await response.json();
  setBooks(data);
};
```

### Step-by-step

1. `fetch()` sends a request to Django API
2. `await` waits for response
3. `response.json()` converts response to JavaScript object
4. `setBooks(data)` saves books into state
5. UI automatically updates

---

## 6️⃣ Adding a Book (POST)

```js
const addBook = async () => {
  const bookData = {
    title: title,
    release_year: releaseYear,
  };

  const response = await fetch("http://127.0.0.1:8000/api/books/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });

  const data = await response.json();
  setBooks((prev) => [...prev, data]);
};
```

### What happens

1. Create an object (`bookData`)
2. Send it to backend using `POST`
3. Backend saves the book
4. Backend returns the new book
5. React adds it to existing list
6. Page updates instantly

---

## 7️⃣ Updating Book Title (PUT)

```js
const updateTitle = async (pk, release_year) => {
  const bookData = {
    title: newTitle,
    release_year: release_year,
  };

  const response = await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });

  const data = await response.json();

  setBooks((prev) =>
    prev.map((book) =>
      book.id === pk ? data : book
    )
  );
};
```

### Explanation

* `pk` = book ID
* Sends updated data to backend
* Backend updates book
* Backend returns updated book
* React replaces only that book in state

---

## 8️⃣ Deleting a Book (DELETE)

```js
const deleteBook = async (pk) => {
  await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
    method: "DELETE",
  });

  setBooks((prev) =>
    prev.filter((book) => book.id !== pk)
  );
};
```

### What happens

1. Sends DELETE request
2. Backend removes book
3. React removes book from state
4. UI updates automatically

---

## 9️⃣ JSX (UI Rendering)

```js
return (
  <>
    <h1>Book website</h1>

    <div>
      <input type="text" onChange={(e) => setTitle(e.target.value)} />
      <input type="number" onChange={(e) => setReleaseYear(e.target.value)} />
      <button onClick={addBook}>Add Book</button>
    </div>

    {books.map((book) => (
      <div key={book.id}>
        <p>Title: {book.title}</p>
        <p>Release Year: {book.release_year}</p>

        <input
          type="text"
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <button onClick={() => updateTitle(book.id, book.release_year)}>
          Change Title
        </button>

        <button onClick={() => deleteBook(book.id)}>
          Delete
        </button>
      </div>
    ))}
  </>
);
```

### Key concepts

* `{}` → run JavaScript inside JSX
* `.map()` → loop through books
* `onClick` → runs function when clicked
* `onChange` → runs when input changes

---

## 🔟 Overall Flow (Big Picture)

1. Page loads
2. `useEffect` runs
3. Books are fetched from backend
4. Books stored in state
5. UI renders book list
6. User can:

   * Add a book
   * Update a book
   * Delete a book
7. Backend + frontend stay in sync

---

## 🧠 Simple Mental Model

> **React = UI based on state**
> When state changes → UI updates automatically


