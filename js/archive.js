// ==================== Audio Archive Data ====================
let audioDatabase = {
    sfw: [],
    nsfw: []
};

// Load data from JSON file
async function loadAudioDatabase() {
    try {
        const response = await fetch(`./data/audio-metadata.json?t=${Date.now()}`);
        audioDatabase = await response.json();
        loadAudios();
    } catch (error) {
        console.error('Error loading audio database:', error);
    }
}

// ==================== Audio Loading & Display ====================
function loadAudios() {
    const audioGrid = document.getElementById('audioGrid');
    const currentPage = window.location.pathname;
    const isNSFW = currentPage.includes('nsfw.html');
    const audios = isNSFW ? audioDatabase.nsfw : audioDatabase.sfw;

    audioGrid.innerHTML = '';

    audios.forEach(audio => {
        const audioCard = createAudioCard(audio);
        audioGrid.appendChild(audioCard);
    });
}

function createAudioCard(audio) {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.dataset.searchText = `${audio.title} ${audio.description} ${audio.tags.join(' ')}`.toLowerCase();
    card.dataset.category = audio.category;

    const tagsHtml = audio.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    // Build action buttons based on available links
    let actionButtonsHtml = '';
    if (audio.soundgasmUrl) {
        actionButtonsHtml += `<a href="${audio.soundgasmUrl}" target="_blank" class="action-btn">🔊 Soundgasm</a>`;
    }
    if (audio.youtubeUrl) {
        actionButtonsHtml += `<a href="${audio.youtubeUrl}" target="_blank" class="action-btn">▶️ YouTube</a>`;
    }

    card.innerHTML = `
        <div class="audio-title">${audio.title}</div>
        <div class="audio-description">${audio.description}</div>
        <div class="audio-meta">
            <span class="audio-duration"> ${audio.duration}</span>
        </div>
        <div class="audio-tags">${tagsHtml}</div>
        <div class="audio-actions">
            ${actionButtonsHtml}
        </div>
    `;

    return card;
}

// ==================== Search & Filter Logic ====================
function filterAudios() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const audioCards = document.querySelectorAll('.audio-card');
    let visibleCount = 0;

    audioCards.forEach(card => {
        const matchesSearch = card.dataset.searchText.includes(searchInput);
        const matchesCategory = !categoryFilter || card.dataset.category === categoryFilter;

        if (matchesSearch && matchesCategory) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show no results message if needed
    const noResults = document.getElementById('noResults');
    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

// ==================== Initialize on Page Load ====================
document.addEventListener('DOMContentLoaded', function() {
    // Only load audios if we're on a content page
    if (window.location.pathname.includes('sfw.html') || window.location.pathname.includes('nsfw.html')) {
        loadAudioDatabase();
    }
});
