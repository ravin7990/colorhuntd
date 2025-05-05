// Import the required Firebase functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB16LqIj__dPxaBMGiQ5ZGqYKSgth5WTFw",
  authDomain: "colorpallete-885d7.firebaseapp.com",
  databaseURL: "https://colorpallete-885d7-default-rtdb.firebaseio.com", // Add your database URL
  projectId: "colorpallete-885d7",
  storageBucket: "colorpallete-885d7.firebasestorage.app",
  messagingSenderId: "982391025659",
  appId: "1:982391025659:web:309812c145d2ad1abae55e",
  measurementId: "G-NHCTYVTCWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Load palettes
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('palettes.json');
    const data = await response.json();
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    
    for (const [category, palettes] of Object.entries(data.categories)) {
        const categorySection = document.createElement('section');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `
            <h2 class="category-title">${category}</h2>
            <div class="palettes-container"></div>
        `;
        
        const palettesContainer = categorySection.querySelector('.palettes-container');
        
        palettes.forEach((palette, index) => {
            const paletteId = `${category}-${index}`.replace(/\s+/g, '-');
            const paletteCard = createPaletteCard(palette, paletteId);
            palettesContainer.appendChild(paletteCard);
        });
        
        categoriesContainer.appendChild(categorySection);
    }
});

function createPaletteCard(palette, paletteId) {
    const card = document.createElement('div');
    card.className = 'palette-card';
    card.innerHTML = `
        <div class="colors-container">
            ${palette.colors.map(color => `
                <div class="color-box" style="background-color: ${color};" data-hex="${color}"></div>
            `).join('')}
        </div>
        <div class="palette-info">
            <h3>${palette.name}</h3>
            <button class="copy-all-btn">Copy All</button>
            <button class="like-btn">❤️ <span class="like-count">0</span></button>
        </div>
    `;
    
    // Like button functionality
    const likeCountRef = ref(database, `likes/${paletteId}`);
    const likeCountElement = card.querySelector('.like-count');
    
    onValue(likeCountRef, (snapshot) => {
        likeCountElement.textContent = snapshot.val() || 0;
    });
    
    card.querySelector('.like-btn').addEventListener('click', () => {
        runTransaction(likeCountRef, (currentLikes) => {
            return (currentLikes || 0) + 1;
        });
    });
    
    // Color click functionality
    card.querySelectorAll('.color-box').forEach(colorBox => {
        colorBox.addEventListener('click', () => {
            navigator.clipboard.writeText(colorBox.dataset.hex);
        });
    });
    
    // Copy all functionality
    card.querySelector('.copy-all-btn').addEventListener('click', () => {
        const colors = palette.colors.join(' ');
        navigator.clipboard.writeText(colors);
    });
    
    return card;
}