// Navbar component functionality
export function initNavbar() {
  console.log('Navbar component initialized');
  
  // Add any navbar-specific functionality here
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  // Example: Handle mobile menu toggle if needed
  const mobileToggle = navbar.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-menu-open');
    });
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initNavbar);
}