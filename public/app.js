document.addEventListener('DOMContentLoaded', init)
function init() {
    const loginForm = document.getElementById("login-form")

    loginForm.addEventListener('submit', onLoginSubmit)

    function onLoginSubmit(event) {
        event.preventDefault()

        const username = loginForm.querySelector('#username').value
        const password = loginForm.querySelector('#password').value

        // Send post request for token
        const tokenEndpoint = '/api/tokens'
        const tokenRequest = {
            method: 'post',
            body: JSON.stringify({ username, password }),
            headers: {
                "Content-Type": "application/json"
            }
        }

        fetch(tokenEndpoint, tokenRequest)
            .then(response => response.json())
            .then(data => {
                // Save the token in the cookies
                setSessionToken(data.id)

                // Redirect to /categories
                window.location.href = '/categories'
            })
            .catch(error => console.log(error))
    }

    function setSessionToken(tokenId) {
        document.cookie = `sessionToken=${tokenId}`
    }
}
