// DOM Elements (add loader to your existing selections)
const loader = document.getElementById('loader');
const playbar = document.querySelector('.playbar'); // Add this

// Show loader (blocks page but not playbar)
function showLoader() {
    loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Make playbar clickable by bringing it above overlay
    if (playbar) playbar.style.zIndex = '10000'; // Higher than loader's 9999
}

// Hide loader
function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        if (playbar) playbar.style.zIndex = ''; // Reset z-index
    }, 500);
}

// In playSong() - Add slight delay for better UX
function playSong(index) {
    showLoader();
    
    // ... existing playSong code ...
    
    audioPlayer.play()
        .then(() => {
            // Add slight delay so loader doesn't disappear too quickly
            setTimeout(hideLoader, 300); 
        })
        .catch(error => {
            hideLoader();
            // ... error handling ...
        });
}