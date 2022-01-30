// document.addEventListener('DOMContentLoaded', init)

function init() {
    const output = document.getElementById("output")

    // Handle form submission to create paragraphs
    const form = document.getElementById("generate-text")
    form.addEventListener('submit', generateText)

    function generateText(event) {
        event.preventDefault();

        const category = "tiktok"
        const paragraphs = 3

        const resource = `/api?category=${category}&paragraphs=${paragraphs}`

        fetch(resource)
        .then(response => response.json())
        .then(data => outputText(data))
        .catch(error => console.log(error))
    }

    // Create a <p> element for each paragraph and append it to output element
    function outputText(data){
        // First clear the output
        output.innerHTML = ''
        
        if(typeof(data) === 'object'){
            const openBrace = document.createElement('span')
            openBrace.classList.add("punctuation")
            
        }
        else{
            return
        }

        
        // paragraphs.forEach(paragraph => {
        //     const element = document.createElement("p")
        //     element.textContent = paragraph

        //     output.appendChild(element)
        // })

        // window.scrollTo(0,0)
    }

    getCategories()
}