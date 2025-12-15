// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const headerControls = document.getElementById('header-controls');

    if (hamburgerMenu && headerControls) {
        hamburgerMenu.addEventListener('click', function() {
            hamburgerMenu.classList.toggle('active');
            headerControls.classList.toggle('active');
        });

        // Close menu when clicking on a nav link
        const navLinks = headerControls.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerMenu.classList.remove('active');
                headerControls.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!headerControls.contains(event.target) && 
                !hamburgerMenu.contains(event.target) &&
                headerControls.classList.contains('active')) {
                hamburgerMenu.classList.remove('active');
                headerControls.classList.remove('active');
            }
        });
    }
});
