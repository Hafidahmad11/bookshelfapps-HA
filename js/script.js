document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  loadBooks();
});

const STORAGE_KEY = "BOOKSHELF_APPS";
const SAVED_EVENT = "saved-bookshelf";
let books = [];

function isStorageExist() {
  return typeof Storage !== "undefined";
}
let isSavingData = false;
function saveData() {
  if (!isSavingData) {
    isSavingData = true;
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
    isSavingData = false; 
  }
}
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  return data || [];
}
function createBook(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}
function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isComplete = document.getElementById("isComplete").checked;

  const isBookExist = books.some(
    (book) =>
      book.title === title && book.author === author && book.year === year
  );

  if (!isBookExist) {
    const newBook = createBook(+new Date(), title, author, year, isComplete);
    books.push(newBook);

    document.dispatchEvent(new Event("booksChanged"));
    document.dispatchEvent(new Event(SAVED_EVENT));

    saveData();
    renderBooks(books); // Hanya jika Anda benar-benar perlu memanggil renderBooks di sini
  } else {
    alert("Buku sudah ada dalam daftar.");
  }
}
function renderBooks(books) {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const incompleteBookCount = document.getElementById("incompleteBookCount");
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const completeBookCount = document.getElementById("completeBookCount");

  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  let incompleteCount = 0;
  let completeCount = 0;

  for (const book of books) {
    const newBook = makeBook(book);

    if (book.isComplete) {
      completeBookshelfList.appendChild(newBook);
      completeCount++;
    } else {
      incompleteBookshelfList.appendChild(newBook);
      incompleteCount++;
    }
  }
  incompleteBookCount.innerText = incompleteCount;
  completeBookCount.innerText = completeCount;
}
function loadBooks() {
  books = loadDataFromStorage();
  document.dispatchEvent(new Event("booksChanged"));
}
document.addEventListener("booksChanged", function () {
  renderBooks(books);
});
function makeBook(book) {
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book");
  bookContainer.dataset.id = book.id;

  const title = document.createElement("h3");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.innerText = `Penulis: ${book.author}`;

  const year = document.createElement("p");
  year.innerText = `Year: ${book.year}`;

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const moveButton = document.createElement("button");
  moveButton.innerText = book.isComplete
    ? "Belum Selesai Dibaca"
    : "Selesai Dibaca";
  moveButton.classList.add(
    book.isComplete ? "belum-selesai-dibaca" : "selesai-dibaca"
  );
  moveButton.addEventListener("click", function () {
    toggleBookStatus(book.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.classList.add("delete");
  deleteButton.addEventListener("click", function () {
    confirmDeleteBook(book.id);
  });

  const editButton = document.createElement("button");
  editButton.innerText = "Edit";
  editButton.classList.add("edit");
  editButton.addEventListener("click", function () {
    editBook(book.id);
  });

  actionContainer.appendChild(moveButton);
  actionContainer.appendChild(deleteButton);
  actionContainer.appendChild(editButton);

  bookContainer.appendChild(title);
  bookContainer.appendChild(author);
  bookContainer.appendChild(year);
  bookContainer.appendChild(actionContainer);

  return bookContainer;
}
function toggleBookStatus(id) {
  const bookIndex = findBookIndex(id);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    document.dispatchEvent(new Event("booksChanged"));
    saveData();
  }
}

function deleteBook(id) {
  const bookIndex = findBookIndex(id);

  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event("booksChanged"));
    saveData();
  }
}
function searchBooks() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const filteredBooks = books.filter((book) => {
    const titleLowerCase = book.title.toLowerCase();
    const authorLowerCase = book.author.toLowerCase();
    return (
      titleLowerCase.includes(searchTerm) ||
      authorLowerCase.includes(searchTerm)
    );
  });
  renderBooks(filteredBooks);
}
function editBook(id) {
  const bookIndex = findBookIndex(id);

  if (bookIndex !== -1) {
    const editedTitle = prompt("Edit judul buku:", books[bookIndex].title);
    const editedAuthor = prompt("Edit penulis buku:", books[bookIndex].author);
    const editedYear = prompt("Edit tahun terbit buku:", books[bookIndex].year);

    if (editedTitle && editedAuthor && editedYear) {
      books[bookIndex].title = editedTitle;
      books[bookIndex].author = editedAuthor;
      books[bookIndex].year = parseInt(editedYear);

      document.dispatchEvent(new Event("booksChanged"));
      saveData();
    }
  }
}
function findBookIndex(id) {
  return books.findIndex((book) => book.id === id);
}
function confirmDeleteBook(id) {
  const confirmation = confirm("Apakah kamu yakin ingin menghapus bukunya?");

  if (confirmation) {
    deleteBook(id);
  }
}
document.addEventListener(SAVED_EVENT, function () {
  const storageKey = STORAGE_KEY;
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = `Data berhasil disimpan!`;

    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.removeChild(toast);
    }, 3000);

    saveData();
  } else {
    const toast = document.createElement("div");
    toast.classList.add("toast", "error");
    toast.textContent = `Gagal menyimpan data!`;

    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.removeChild(toast);
    }, 3500);
  }
});
