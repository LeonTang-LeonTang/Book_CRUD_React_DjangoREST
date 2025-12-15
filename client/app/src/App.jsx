import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// 1. About frontend and backend communication
  // Frontend  --> Fectch --> Backend
  // (Object) ----------------> Json String ------->  (Object) 
// 2. About JSON.stringify() and response.json()
  // JSON.stringify() : turn object into json string
  // response.json() : turn json string into object

// 3.what response and response.json() are?
  // response really is: An HTTP Response object — not the actual data yet.

function App() {
  const [books, setBooks] =useState([]);
  const [title, setTitle] = useState("");
  const[releaseYear, setReleaseYear]=useState(0);

  const [newTitle, setNewTitle] =useState("");

  
  useEffect(()=>{
    fetchBooks();
  },[]);//If you leave it empty [], it means: "Run this only once when the component first loads."

  const fetchBooks = async () =>{
    try{
      //fetch is the browser’s built-in tool to make HTTP requests.
      //No fetch = no communication = no CRUD. Frontend CANNOT touch backend data directly.So every CRUD action must start with an HTTP request.That’s why CRUD always starts here:const response = await fetch(URL, options)

      // response is an HTTP response object. it is ✅ Metadata + raw body stream, ❌ NOT your book data,❌ NOT JSON yet
      const response =await fetch("http://127.0.0.1:8000/api/books/");//fetch(...): This is the browser's built-in tool to make HTTP requests. It sends a "GET" request to your Django URL.
      // console.log(`response: ${response}`)
      const data =await response.json();//convert that text into a JS object.response.json() takes raw JSON text and converts it into a real JavaScript object.”
      // console.log(`response.json: ${data}`)
      setBooks(data);
    } catch(err){
      console.log(err)
    }
  };
// Difference between the result response and response.json() 
// The Result of console.log(response)
  // Output of 'response' in Chrome Console:
      // Response {
      //     body: ReadableStream,       // <--- CRITICAL: Your data is hidden inside this "Stream"
      //     bodyUsed: false,
      //     headers: Headers {},        // Contains "Content-Type: application/json"
      //     ok: true,                   // This means Status is between 200-299 (Success)
      //     redirected: false,
      //     status: 201,                // The exact Status Code (201 = Created)
      //     statusText: "Created",
      //     type: "cors",
      //     url: "http://127.0.0.1:8000/api/books/create/"
      // }
  // The Result of response.json():
    // Output of 'data' in Chrome Console:
      // {
      //     id: 15,                     // <--- The Server generated this ID!
      //     title: "The Matrix",        // <--- The data you sent
      //     release_year: 1999          // <--- The data you sent
      // }
      
  //What does JSON.stringify REALLY do? It converts a JavaScript object INTO a JSON-formatted string
// e.g.
  //  const bookData = {
  //   title: "Harry Potter",
  //   release_year: 2001
  // };

  // JSON.stringify(bookData);

// result:
  // const bookData = {
  //   title: "Harry Potter",
  //   release_year: 2001
  // };

  // JSON.stringify(bookData);
  // Important
// 	•	Output type: string
// 	•	Content: JSON text
// 	•	Purpose: make JS data sendable

// 👉 It does NOT create an object
// 👉 It does NOT “turn into JSON object”
// 👉 It turns JS → string


   const addBook = async()=>{
      const bookData ={
        title: title,
        release_year: releaseYear,
      };
      try{
        //Fetch is not for getting things. It is for communicating between the browser(Frontend/React) and the database(Backend/Django).
        // fetch sounds liek DIALing THE PHONE (Start the connection)
        const response =await fetch("http://127.0.0.1:8000/api/books/create/", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(bookData),});

      const data =await response.json();//(response.json() is JavaScript Object. Extract the data)
      setBooks((prev)=>[...prev, data]);
      }
      catch(err){
        console.log(err);
      }
      
    };
      const updateTitle =async(pk, release_year) =>{
        const bookData ={
          title:newTitle,
          release_year: release_year,
      };
      try{
        const response =await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",  
        },
        body:JSON.stringify(bookData),});

        const data =await response.json();
        setBooks((prev)=>prev.map((book)=>{
        if (book.id ==pk){
          return data;
        } else{
          return book;
        }

      }));
      }
      catch(err){
        console.log(err);
      }
      };
      const deleteBook =async (pk) =>{
        try{
            const response =await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
            method:"DELETE",
          });
       
          setBooks((prev)=>prev.filter((book)=>(book.id !== pk)))

        } catch (err) {
          console.log(err);
        }
      }; // <-- close deleteBook
  return (
    <>
      <h1>Book website</h1>
      <div>
        <input type="text" placeholder='Book Title...' onChange ={(e) => setTitle(e.target.value)}/>
        <input type="number" placeholder='Release Year...'onChange ={(e) => setReleaseYear(e.target.value)} />
        <button onClick ={addBook}>Add Book</button>
      </div>
      {books.map((book)=> <div>
        <p>Title: {book.title} </p>
        <p>Release Year: {book.release_year}</p>
        <input type='text' placeholder ="New Title..." onChange ={(e) => setNewTitle(e.target.value)} />
        <button onClick ={()=>updateTitle(book.id, book.release_year)}> Change Title</button>
        <button onClick ={()=>deleteBook(book.id)}>Delete</button>
        </div>)}
    </>
  )
}

export default App
