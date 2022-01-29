document.addEventListener('DOMContentLoaded', init)

function init() {
    const categoriesList = document.getElementById("categories-list")
    const paragraphsNumber = document.getElementById("paragraphs-number")
    const output = document.getElementById("output")
    
    // Call api to fill select input with categories
    function getCategories() {
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
    }

    // Handle form submission to create paragraphs
    const form = document.getElementById("generate-text")
    form.addEventListener('submit', generateText)

    function generateText(event) {
        event.preventDefault();

        const category = categoriesList.value
        const paragraphs = paragraphsNumber.value

        const resource = `/api?category=${category}&paragraphs=${paragraphs}`

        fetch(resource)
        .then(response => response.json())
        .then(data => outputText(data.paragraphs))
        .catch(error => console.log(error))
    }

    // Create a <p> element for each paragraph and append it to output element
    function outputText(paragraphs){
        // First clear the output
        output.innerHTML = ''
        
        paragraphs.forEach(paragraph => {
            const element = document.createElement("p")
            element.textContent = paragraph

            output.appendChild(element)
        })

        window.scrollTo(0,0)
    }

    getCategories()
}