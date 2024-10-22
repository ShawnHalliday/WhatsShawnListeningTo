// public/script.js

async function fetchCurrentlyPlaying() {
    try {
      const response = await fetch('/currently-playing');
      if (response.ok) {
        const data = await response.json();
        if (data && data.is_playing) {
          displayTrack(data);
        } else {
          displayNoTrack();
        }
      } else {
        console.error('Failed to fetch currently playing track.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  function displayTrack(data) {
    const track = data.item;
    document.getElementById('album-art').src = track.album.images[0].url;
    document.getElementById('track-name').textContent = track.name;
    document.getElementById('artist-name').textContent = track.artists.map(artist => artist.name).join(', ');
  }
  
  function displayNoTrack() {
    document.getElementById('album-art').src = '';
    document.getElementById('track-name').textContent = 'No track currently playing';
    document.getElementById('artist-name').textContent = '';
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentlyPlaying();
    setInterval(fetchCurrentlyPlaying, 10000);
  });
  