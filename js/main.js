// ==================== Navbar Active State ====================
function updateNavbarActive() {
    const currentPage = window.location.pathname;
    const navHome = document.getElementById('navHome');
    const navSfw = document.getElementById('navSfw');
    const navNsfw = document.getElementById('navNsfw');

    // Remove active from all
    if (navHome) navHome.classList.remove('active');
    if (navSfw) navSfw.classList.remove('active');
    if (navNsfw) navNsfw.classList.remove('active');

    // Add active to current page
    if (currentPage.includes('sfw.html')) {
        if (navSfw) navSfw.classList.add('active');
    } else if (currentPage.includes('nsfw.html')) {
        if (navNsfw) navNsfw.classList.add('active');
    } else {
        if (navHome) navHome.classList.add('active');
    }
}

// ==================== Age Gate Logic (Cookie-based) ====================
function goToNSFW() {
    // Always show age verification modal when clicking navbar link
    verifyAge();
}

function verifyAge() {
    document.getElementById('ageGateModal').classList.remove('hidden');
    // Set initial value to January 1, 2000
    document.getElementById('birthDate').value = '2000-01-01';
    // Remove max date restriction to allow any age
    document.getElementById('birthDate').removeAttribute('max');
}

function confirmAge() {
    const birthDate = document.getElementById('birthDate').value;
    
    if (!birthDate) {
        alert('Please enter your birth date');
        return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    if (age >= 18) {
        // Set age verification cookie (30 days expiration)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        
        const cookieValue = JSON.stringify({
            verified: true,
            timestamp: Date.now(),
            type: '18plus'
        });
        
        // Set cookie with 30-day expiration
        document.cookie = `ageVerification=${encodeURIComponent(cookieValue)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
        
        // Also store in localStorage for fallback
        localStorage.setItem('ageVerification', cookieValue);
        
        closeAgeGate();
        window.location.href = 'nsfw.html';
    } else {
        alert('You must be at least 18 years old to access this content.');
    }
}

function closeAgeGate() {
    document.getElementById('ageGateModal').classList.add('hidden');
}

// Helper function to get cookie value
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

// Check age verification on NSFW page load
function checkAgeVerification() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('nsfw.html')) {
        // Check cookie first, then localStorage
        let verification = getCookie('ageVerification');
        if (!verification) {
            verification = localStorage.getItem('ageVerification');
        }
        
        if (!verification) {
            alert('Age verification required. Redirecting...');
            window.location.href = 'index.html';
            return;
        }

        const data = JSON.parse(verification);
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Verification expires after 30 days
        if (now - data.timestamp > thirtyDaysMs) {
            // Clear expired verification
            document.cookie = 'ageVerification=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            localStorage.removeItem('ageVerification');
            alert('Age verification expired. Please verify again.');
            window.location.href = 'index.html';
        }
    }
}

// ==================== Close modals when clicking outside ==================== 
window.addEventListener('click', function(event) {
    const ageGateModal = document.getElementById('ageGateModal');
    
    if (event.target === ageGateModal) {
        closeAgeGate();
    }
});

// Check age verification on page load
document.addEventListener('DOMContentLoaded', checkAgeVerification);
document.addEventListener('DOMContentLoaded', updateNavbarActive);
