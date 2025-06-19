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

// Create loader overlay
const loaderOverlay = document.createElement('div');
loaderOverlay.className = 'loader-overlay';
document.body.appendChild(loaderOverlay);

// Player State
let currentSongIndex = 0;
let isPlaying = false;
const songs = Array.from(cards).map(card => ({
    title: card.querySelector('h2').textContent,
    artist: card.querySelector('p').textContent,
    cover: card.querySelector('img').src,
    audio: card.dataset.audio
}));

// Loader Functions
function showLoader() {
    loaderOverlay.style.display = 'block';
    loader.style.display = 'flex';
    setTimeout(() => {
        loaderOverlay.style.opacity = '1';
        loader.style.opacity = '1';
    }, 10);
}

function hideLoader() {
    loaderOverlay.style.opacity = '0';
    loader.style.opacity = '0';
    setTimeout(() => {
        loaderOverlay.style.display = 'none';
        loader.style.display = 'none';
    }, 500);
}

// Initialize Player
function initPlayer() {
    // Set up card click handlers
    cards.forEach((card, index) => {
        const playIcon = card.querySelector('i');
        
        playIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            playSong(index);
        });
        
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
    
    // Initialize volume
    const savedVolume = localStorage.getItem('volume');
    volumeControl.value = savedVolume !== null ? savedVolume : 80;
    setVolume();
    
    // Accessibility element
    const ariaLive = document.createElement('div');
    ariaLive.id = 'aria-live';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-9999px';
    document.body.appendChild(ariaLive);
}

// Play Song
function playSong(index) {
    showLoader();
    
    cards.forEach(card => card.classList.remove('active'));
    cards[index].classList.add('active');
    
    currentSongIndex = index;
    const song = songs[index];
    
    albumCover.src = song.cover;
    currentAlbum.textContent = song.title;
    currentArtist.textContent = song.artist;
    nowPlayingImg.src = song.cover;
    nowPlayingTitle.textContent = song.title;
    nowPlayingArtist.textContent = song.artist;
    
    audioPlayer.src = song.audio;
    
    const playAttempt = () => {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayBtn();
                announce(`Now playing: ${song.title} by ${song.artist}`);
                hideLoader();
            })
            .catch(error => {
                console.log('Play attempt failed, retrying...');
                setTimeout(playAttempt, 300);
            });
    };
    
    playAttempt();
}

// Toggle Play/Pause
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        announce('Playback paused');
    } else {
        audioPlayer.play()
            .then(() => {
                announce(`Resumed playback: ${songs[currentSongIndex].title}`);
            })
            .catch(error => {
                console.error('Playback failed:', error);
            });
    }
    isPlaying = !isPlaying;
    updatePlayBtn();
}

// Update Play Button
function updatePlayBtn() {
    const icon = isPlaying ? 'fa-pause' : 'fa-play';
    playBtn.classList.replace(isPlaying ? 'fa-play' : 'fa-pause', icon);
}

// Previous Song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

// Next Song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

// Update Progress Bar
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.value = progressPercent;
    currentTimeEl.textContent = formatTime(currentTime);
    progressBar.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${progressPercent}%, var(--primary-color) ${progressPercent}%, var(--primary-color) 100%)`;
}

// Set Progress
function setProgress() {
    const progress = progressBar.value;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (progress / 100) * duration;
}

// Update Duration
function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

// Format Time
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Set Volume
function setVolume() {
    const volume = volumeControl.value / 100;
    audioPlayer.volume = volume;
    volumeIcon.className = volume === 0 ? 'fa-solid fa-volume-mute' : 'fa-solid fa-volume-high';
    updateVolumeGradient();
    showVolumeFeedback();
    localStorage.setItem('volume', volumeControl.value);
}

// Toggle Mute
function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.volume = 0;
        volumeControl.value = 0;
    } else {
        audioPlayer.volume = 0.8;
        volumeControl.value = 80;
    }
    setVolume();
}

// Update Volume Gradient
function updateVolumeGradient() {
    const val = volumeControl.value;
    volumeControl.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${val}%, var(--primary-color) ${val}%, var(--primary-color) 100%)`;
}

// Show Volume Feedback
function showVolumeFeedback() {
    let feedback = document.querySelector('.volume-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'volume-feedback';
        document.body.appendChild(feedback);
    }
    feedback.textContent = `Volume: ${volumeControl.value}%`;
    feedback.style.opacity = '1';
    setTimeout(() => {
        feedback.style.opacity = '0';
    }, 1000);
}

// Accessibility Announcements
function announce(message) {
    const ariaLive = document.getElementById('aria-live');
    if (ariaLive) {
        ariaLive.textContent = message;
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }

    if (e.code === 'Space') {
        if (e.target === document.body) {
            e.preventDefault();
        }
        togglePlay();
    }
    
    if (e.code === 'ArrowRight') nextSong();
    if (e.code === 'ArrowLeft') prevSong();
    
    if (e.code === 'ArrowUp') {
        volumeControl.value = Math.min(parseInt(volumeControl.value) + 10, 100);
        setVolume();
    }
    if (e.code === 'ArrowDown') {
        volumeControl.value = Math.max(parseInt(volumeControl.value) - 10, 0);
        setVolume();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    setTimeout(hideLoader, 1000);
});