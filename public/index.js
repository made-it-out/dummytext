document.addEventListener('DOMContentLoaded', init)

function init(){
    const categoriesList = document.getElementById("categories-list")
    // Needed
    // Call api to fill select input with categories
    const resource = '/api/categories/all'

    fetch(resource)
    .then(response => response.json())
    .then(categories => {
        categories.forEach(category => {
            // Create an option element for each category and add it to the select input
            const element = document.createElement("option")
            element.setAttribute("value", category)
            element.textContent = category

            categoriesList.appendChild(element)
        })
    })
    .catch(error => console.log(error))
    // Handle form submission to create paragraphs
}