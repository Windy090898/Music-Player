/**
 * Render song
 * Scroll top
 * Play/ Pause/ seek
 * CD rotation
 * Next /Prev
 * Random
 * Next / Repeat when end
 * Active song
 * Scroll active song into view
 * Play song when click
 * setStorage for repeat/random option
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

function start() {
    getPlaylist(renderPlaylist)
    handleEvent()
}
start()

function getPlaylist(callback) {
    fetchUrl()
        .then((response) => JSON.parse(response))
        .then(callback)
}

var songId = 0

function renderPlaylist(playlist) {
    let html = ''
    playlist.data.forEach((song, index) => {
        html += `<div class="song song-item-${index}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.artist.picture_xl}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.title}</h3>
                    <p class="author">${song.artist.name}</p>
                    </div>
                    <div class="option">
                    <i class="far fa-heart icon-unlike"></i>
                    <i class="fa-solid fa-heart icon-like"></i>
                    </div>
                </div>`
    })
    $('#playlist').innerHTML = html
    handleActiveSong(playlist)
}

function handleActiveSong(playlist) {
    playlist.data.forEach((song, index) => {
        var selectedSong = $('.song-item-' + index)
        if (index == songId) {
            selectedSong.classList.add('active')

            // Scroll song to view when active
            selectedSong.scrollIntoView({
                 behavior: "smooth",
                 block: "center", 
                 inline: "nearest" 
            })

            // Render now playing song
            $('.nowPlaying h2').innerHTML = `${song.title}`
            $('#audio').src = `${song.preview}`
            $('.cd-thumb').style.backgroundImage = `url('${song.artist.picture_xl}')`


        } else {
            selectedSong.classList.remove('active')
        }
    })
}

function handleEvent() {
    var cd = $('.cd')
    var cdWidth = cd.offsetWidth  
    var audio = $('#audio')
    var progress = $('.progress')
    var player = $('.player')
    var playlist = $('#playlist')
    
    // Scroll Top -> Hide & Opacity CD 
    document.onscroll = function() {
        var scrollTop = window.scrollY
        var newCdWidth = cdWidth - scrollTop
        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
        cd.style.opacity = newCdWidth / cdWidth
    }
    
    // Play/ Pause
    $('.btn-toggle-play').onclick = function() {
        togglePlay()
    }

    function togglePlay() {
        var player = $('.player')
        player.classList.toggle('playing')
        if (player.classList.contains('playing')) {
            audio.play()
        } else {
            audio.pause()
        }
    }

    // Rotote cd, when audio is paused -> cd stop at the position. When audio is playing -> cd rotote from the pause position
    const cdAnimate = cd.animate([
        { transform: 'rotate(360deg)' }
    ], {
        duration: 8000,
        iterations: Infinity
    })
    cdAnimate.pause()

    audio.onplay = function() {
        cdAnimate.play()
        player.classList.add('playing')
    }
    audio.onpause = function() {
        cdAnimate.pause()
        player.classList.remove('playing')
    }

    // Progress bar update when audio is playing
    audio.ontimeupdate = function () {
        var currentTime = audio.currentTime
        var duration = audio.duration
        var percent = currentTime / duration
        
        if (percent) {
            progress.value = percent * 100
        }
    }
    
    // Khi tua thi update current time
    progress.oninput = function() {
        audio.currentTime = progress.value / 100 * audio.duration
    }

    // Next
    $('.btn-next').onclick = function() {
        getPlaylist(playNextSong)
    }

    // Previous
    $('.btn-prev').onclick = function() {
        getPlaylist(playPreviousSong)
    }

    var randomBtn = $('.btn-random')
    // Random play
    randomBtn.onclick = function() {
        randomBtn.classList.toggle('active')
        disableBtn(randomBtn, repeatBtn) 
    }

    // When song is ended, play next song or play random
    audio.onended = function() {
        if (randomBtn.classList.contains('active')) {
            getPlaylist(playRandomSong)
        } else {
            getPlaylist(playNextSong)
        }
    }

    function playRandomSong (playlist) {
        songId = Math.floor(Math.random() * (playlist.data.length - 1))
        handleActiveSong(playlist)           
        audio.play()
    }

    function playNextSong(playlist) {
        ++songId
        if (songId >= playlist.data.length ) {
            songId = 0 
        }
        handleActiveSong(playlist)
        audio.play()
    }

    function playPreviousSong(playlist) {
        --songId
        if (songId >= 0) {
            handleActiveSong(playlist)
            audio.play()
        }
    }

    // Repeat
    var repeatBtn = $('.btn-repeat')
    repeatBtn.onclick = function() {
        repeatBtn.classList.toggle('active')
        if (repeatBtn.classList.contains('active')) {
            audio.loop = true
        } else {
            audio.loop = false
        }
        disableBtn(repeatBtn, randomBtn) 
    }
    
    // Keyboard events
    /*window.onkeydown = function(e) {
        if (e.code == "Space") {
            togglePlay()
            e.preventDefault()
        } else if (e.code == "ArrowLeft") {
            getPlaylist(playPreviousSong)
            e.preventDefault()
        } else if (e.code == "ArrowRight") {
            getPlaylist(playNextSong)
            e.preventDefault()
        }
    }*/
    
    // Play when click at song
    playlist.onclick = function(e) {
        var songNode = e.target.closest('.song')
        songId = songNode.dataset.index
        var toast = $('#toast')
        // handle like btn
        if ( e.target.closest('.option')) {
            var songItem = $(`.song-item-${songId} .option`)
            songItem.classList.toggle('active')
            toastMessage(songItem, toast)            
        } else {
            getPlaylist((playlist) => {
                handleActiveSong(playlist)
                audio.play()
            })
        }
        
    }
}

function disableBtn(activeBtn, disableBtn) {
    if (activeBtn.classList.contains('active')) {
        disableBtn.classList.add('disabled')
    } else {
        disableBtn.classList.remove('disabled')
    }
}


function toastMessage(item, toast) {
    if (item.classList.contains('active')) {
        toast.innerHTML = `
        <div class="toast-item like">
            <div class="toast__icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <div class="toast-item-text">
                <h4>Liked</h4>
                <p>Successfully add song to favorite</p>
            </div>
            <div class="toast__close">
                <i class="fa-solid fa-xmark"></i>
            </div>
            </div>
        `
    } else {
        toast.innerHTML = `<div class="toast-item unlike">
        <div class="toast__icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="toast-item-text">
          <h4>Unliked</h4>
          <p>Remove song from favorite song</p>
        </div>
        <div class="toast__close">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>`
    }
    
    var toastItem = $('.toast-item')

    var autoRemoveId = setTimeout(function() {
        toast.removeChild(toastItem)
    }, 3000)

    toast.onclick = function(e) {
        if (e.target.closest('.toast__close')) {
            toast.removeChild(toastItem)
            clearTimeout(autoRemoveId)
        }
    }

    
}
    

























