// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeControl = document.getElementById('volume');
const volumeIcon = document.getElementById('volumeIcon');
const cards = document.querySelectorAll('.card');
const albumCover = document.getElementById('albumCover');
const currentAlbum = document.getElementById('currentAlbum');
const currentArtist = document.getElementById('currentArtist');
const nowPlayingImg = document.getElementById('nowPlayingImg');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const loader = document.getElementById('loader');

// Player State
let currentSongIndex = 0;
let isPlaying = false;
const songs = Array.from(cards).map(card => ({
    title: card.querySelector('h2').textContent,
    artist: card.querySelector('p').textContent,
    cover: card.querySelector('img').src,
    audio: card.dataset.audio
}));

// Show loader with blocking overlay
function showLoader() {
    loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide loader and restore interactions
function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
    }, 500);
}

// Initialize Player
function initPlayer() {
    // Set up card click handlers
    cards.forEach((card, index) => {
        const playIcon = card.querySelector('i');
        
        // Click on play icon
        playIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            playSong(index);
        });
        
        // Click on card (but not play icon)
        card.addEventListener('click', () => {
            playSong(index);
        });
    });
    
    // Set up player controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    progressBar.addEventListener('input', setProgress);
    volumeControl.addEventListener('input', setVolume);
    volumeIcon.addEventListener('click', toggleMute);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => {
        setTimeout(nextSong, 500);
    });
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    
    // Initialize volume from localStorage or default
    const savedVolume = localStorage.getItem('volume');
    volumeControl.value = savedVolume !== null ? savedVolume : 80;
    setVolume();
    
    // Create aria-live element for accessibility
    const ariaLive = document.createElement('div');
    ariaLive.id = 'aria-live';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-9999px';
    document.body.appendChild(ariaLive);
}

// Play Song with loading state
function playSong(index) {
    showLoader(); // Show loader when changing songs
    
    // Update active card styling
    cards.forEach(card => card.classList.remove('active'));
    cards[index].classList.add('active');
    
    currentSongIndex = index;
    const song = songs[index];
    
    // Update UI immediately
    albumCover.src = song.cover;
    currentAlbum.textContent = song.title;
    currentArtist.textContent = song.artist;
    nowPlayingImg.src = song.cover;
    nowPlayingTitle.textContent = song.title;
    nowPlayingArtist.textContent = song.artist;
    
    // Set audio source and play
    audioPlayer.src = song.audio;
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayBtn();
            announce(`Now playing: ${song.title} by ${song.artist}`);
            hideLoader(); // Hide when playback starts
        })
        .catch(error => {
            console.error('Playback failed:', error);
            announce('Playback failed. Please try again.');
            hideLoader(); // Hide even if there's an error
        });
}

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);

// Hide initial loader when window loads
window.addEventListener('load', () => {
    hideLoader();
});