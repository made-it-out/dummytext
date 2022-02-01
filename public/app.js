document.addEventListener('DOMContentLoaded', init)

function init() {
    // Header
    const headerToggle = document.querySelector('.header__toggle')
    const navbar = document.querySelector('.navbar')

    headerToggle.addEventListener('click', toggleNavbar)
    headerToggle.addEventListener('keydown', (event) => {
        if(event.keyCode === 13 || event.keyCode === 32){
            toggleNavbar
        }
    })

    function toggleNavbar(){
        navbar.classList.toggle('navbar--shown')
    }

    // Feedback form
    const feedbackForm = document.getElementById("feedback")

    feedbackForm.addEventListener('submit', handleFeedbackForm)

    const submissionMessage = document.getElementById("submission-message");

    function handleFeedbackForm(event){
        event.preventDefault();

        const name = feedbackForm.querySelector("#name").value;
        const email = feedbackForm.querySelector("#email").value;
        const message = feedbackForm.querySelector("#message").value;

        const resource = "https://formsubmit.co/ajax/dummytextgenerator@gmail.com"
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                message
            })
        }
        fetch(resource,request)
        .then(response => response.json())
        .then(data => {
            data.success === "true" ? formSuccess() : formError()
        })
        .catch(error => console.error(error))
    }

    function formSuccess(){
        feedbackForm.querySelector("#name").value = ''
        feedbackForm.querySelector("#email").value = ''
        feedbackForm.querySelector("#message").value = ''

        submissionMessage.textContent = 'Thank you for your feedback.'
    }

    function formError(){
        submissionMessage.textContent = 'There was an error. Please try again later.'
    }
}