import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleSearch = async (newSearch = false) => {
    const q = searchText.trim();

    if (!q) {
      setError("Please enter a book title.");
      return;
    }

    if (newSearch) setPage(1);

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const currentPage = newSearch ? 1 : page;

      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(
          q
        )}&page=${currentPage}`
      );

      const data = await response.json();

      if (!data?.docs?.length) {
        setError("No books found.");
      } else {
        setBooks(data.docs.slice(0, 12));
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (book) => {
    setSelectedBook(book);
    setBookDetails(null);

    if (!book.key) return;

    setDetailsLoading(true);

    try {
      const response = await fetch(`https://openlibrary.org${book.key}.json`);

      const data = await response.json();
      setBookDetails(data);
    } catch (error) {
      console.log(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (searchText.trim()) {
      handleSearch();
    }
  }, [page]);

  return (
    <div className="container">
      <h1>📚 Book Finder</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter book title"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(true);
          }}
        />
        <button onClick={() => handleSearch(true)}>Search</button>
      </div>

      {loading && <p className="message">Loading books...</p>}
      {error && <p className="message error">{error}</p>}

      <div className="book-list">
        {books.map((book, index) => {
          const coverId = book.cover_i;

          const imageUrl = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "https://via.placeholder.com/150?text=No+Cover";

          return (
            <div
              key={book.key || index}
              className="book-card"
              onClick={() => fetchBookDetails(book)}
            >
              <img src={imageUrl} alt={book.title} />
              <h3>{book.title}</h3>
              <p>{book.author_name?.join(", ") || "Unknown Author"}</p>
            </div>
          );
        })}
      </div>

      {books.length > 0 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ⬅ Previous
          </button>

          <span>Page {page}</span>

          <button onClick={() => setPage(page + 1)}>Next ➡</button>
        </div>
      )}

      {selectedBook && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedBook.title}</h2>

            {detailsLoading && <p>Loading details...</p>}

            {/* Large Cover */}
            {selectedBook.cover_i && (
              <img
                className="modal-cover"
                src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`}
                alt={selectedBook.title}
              />
            )}

            {bookDetails?.description && (
              <p>
                <strong>Description:</strong>{" "}
                {typeof bookDetails.description === "string"
                  ? bookDetails.description
                  : bookDetails.description.value}
              </p>
            )}

            {bookDetails?.subjects && (
              <p>
                <strong>Subjects:</strong>{" "}
                {bookDetails.subjects.slice(0, 10).join(", ")}
              </p>
            )}

            <button
              className="close-btn"
              onClick={() => {
                setSelectedBook(null);
                setBookDetails(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
