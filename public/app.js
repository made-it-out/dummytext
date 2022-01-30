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
}