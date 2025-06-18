const range = document.getElementById('progress');

range.addEventListener('input', () => {
  const val = (range.value - range.min) / (range.max - range.min) * 100;
  range.style.background = `linear-gradient(to right, #00e199 0%, #00e199 ${val}%, #ddd ${val}%, #ddd 100%)`;
});
const volume = document.getElementById('volume');

function updateVolumeGradient() {
  const val = (volume.value - volume.min) / (volume.max - volume.min) * 100;
  volume.style.background = `linear-gradient(to right, #00e199 0%, #00e199 ${val}%, #ddd ${val}%, #ddd 100%)`;
}

volume.addEventListener('input', updateVolumeGradient);

updateVolumeGradient();
function toggleMute() {
    if (volume.value > 0) {
        volume.value = 0;
    } else {
        volume.value = 100;
    }

    volume.classList.add('expanded');
    updateVolumeGradient();

    setTimeout(() => {
        volume.classList.remove('expanded');
    }, 1000);
}
