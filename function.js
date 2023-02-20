const searchInput = document.querySelector(".searchInput")
const searchButton = document.querySelector(".searchButton")

var searchValue = localStorage.getItem("searchTerm") || ""
searchInput.value = searchValue

searchButton.addEventListener("click", function() {
    localStorage.setItem("searchTerm", searchInput.value)
    window.open("searchPage.html", "_self")
})

function search(searchTerm) {
    localStorage.setItem("searchTerm", searchTerm)
    window.open("searchPage.html", "_self")
}