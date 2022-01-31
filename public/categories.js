document.addEventListener('DOMContentLoaded', init)

function init() {
    const output = document.getElementById("output")

    const buttons = {
        create: document.getElementById("create-button"),
        read: document.getElementById("read-button"),
        update: document.getElementById("update-button"),
        delete: document.getElementById("delete-button")
    }

    const forms = {
        create: document.getElementById("create-category"),
        read: document.getElementById("read-category"),
        update: document.getElementById("update-category"),
        delete: document.getElementById("delete-category")
    }

    const lists = {
        read: document.getElementById("read-category-list"),
        update: document.getElementById("update-category-list"),
        delete: document.getElementById("delete-category-list")
    }

    // Form submission handlers
    const handlers = {
        create(event, form) {
            event.preventDefault();
            const category = form.querySelector("#create-category-name").value

            // Make post request to create new category
            const resource = `/api/categories`
            const request = {
                method: 'post',
                body: JSON.stringify({
                    category
                }),
                "Content-Type": "application/json"
            }
            fetch(resource, request)
                .then(response => response.json())
                .then(data => {
                    output.innerHTML = data.message
                    getCategories()
                })
                .catch(error => console.error(error))
        },
        read(event, form) {
            event.preventDefault()
            const category = form.querySelector("#read-category-list").value

            // Make get request for given category, then output the phrases
            const resource = `/api/categories?category=${category}`
            fetch(resource)
                .then(response => response.json())
                .then(data => outputPhrases(data))
                .catch(error => console.error(error))
        },
        update(event, form) {
            event.preventDefault();

            // Form values
            const category = form.querySelector("#update-category-list").value
            const phrase = form.querySelector("#update-category-phrase").value
            const addInput = form.querySelector("#update-category-add")
            const deleteInput = form.querySelector("#update-category-delete")

            // Method for the body of put request
            let method
            if (addInput.checked) {
                method = 'add'
            }
            if (deleteInput.checked) {
                method = 'delete'
            }

            const resource = `/api/categories`
            const request = {
                method: 'put',
                body: JSON.stringify({
                    category,
                    phrase,
                    method
                })
            }

            fetch(resource, request)
                .then(response => response.json())
                .then(data => {
                    // If phrases get updated
                    if(data.phrases){
                        outputPhrases(data.phrases)
                    }
                    // Else if trying to add a phrase that already exists, or delete one that does not exist
                    else{
                        output.innerHTML = data.message
                    }
                })
                .catch(error => console.error(error))
        },
        delete(event, form) {
            event.preventDefault();
            const category = form.querySelector("#delete-category-list").value

            // Make delete request for given category
            const resource = `/api/categories`
            const request = {
                method: 'delete',
                body: JSON.stringify({
                    category
                }),
                "Content-Type": "application/json"
            }
            fetch(resource, request)
                .then(response => response.json())
                .then(data => {
                    output.innerHTML = data.message
                    getCategories()
                })
                .catch(error => console.error(error))
        }
    }

    // Add event listener for button click to show the corresponding form
    for (let method in buttons) {
        buttons[method].addEventListener('click', () => showForm(method))
    }

    function showForm(method) {
        // Hide all the forms first
        for (let formMethod in forms) {
            forms[formMethod].classList.add('form--hidden')
        }
        // Then show the given form
        forms[method].classList.remove('form--hidden')
    }

    // Add event listener for form submission to be sent to corresponding handler
    for (let method in forms) {
        forms[method].addEventListener('submit', (event) => handlers[method](event, forms[method]))
    }

    // Call api to fill the select inputs with categories
    function getCategories() {
        const resource = '/api/categories/all'

        fetch(resource)
            .then(response => response.json())
            .then(categories => {
                for (let method in lists) {
                    // Clear inputs first
                    lists[method].innerHTML = ''
                    categories.forEach(category => {
                        // Create an option element for each category and add it to the select input
                        const element = document.createElement("option")
                        element.setAttribute("value", category)
                        element.textContent = category

                        lists[method].appendChild(element)
                    })
                }
            })
            .catch(error => console.error(error))
    }

    // Create a <p> element for each phrase and append it to output element
    function outputPhrases(phrases) {
        // First clear the output
        output.innerHTML = ''

        phrases.forEach(paragraph => {
            const element = document.createElement("p")
            element.textContent = paragraph

            output.appendChild(element)
        })

        // window.scrollTo(0,0)
    }

    getCategories()
}