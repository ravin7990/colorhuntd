document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const paletteContainer = document.querySelector('.palette-container');
    const categoriesContainer = document.querySelector('.categories');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    // State
    let palettes = [];
    let categories = [];
    let likedPalettes = JSON.parse(localStorage.getItem('likedPalettes')) || [];
    
    // Fetch palettes from JSON file
    fetch('palettes.json')
        .then(response => response.json())
        .then(data => {
            palettes = data.palettes;
            categories = ['all', ...new Set(data.palettes.flatMap(palette => palette.categories))];
            
            // Initialize the app
            renderCategories();
            renderPalettes(palettes);
        })
        .catch(error => console.error('Error loading palettes:', error));
    
    // Render categories
    function renderCategories() {
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            button.dataset.category = category;
            
            if (category === 'all') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => filterByCategory(category));
            categoriesContainer.appendChild(button);
        });
    }
    
    // Filter palettes by category
    function filterByCategory(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // Filter palettes
        if (category === 'all') {
            renderPalettes(palettes);
        } else {
            const filteredPalettes = palettes.filter(palette => 
                palette.categories.includes(category)
            );
            renderPalettes(filteredPalettes);
        }
    }
    
    // Render palettes
    function renderPalettes(palettesToRender) {
        paletteContainer.innerHTML = '';
        
        // Limit to 100 palettes
        const displayedPalettes = palettesToRender.slice(0, 100);
        
        displayedPalettes.forEach(palette => {
            const paletteCard = document.createElement('div');
            paletteCard.className = 'palette-card';
            
            // Create color swatches
            const colorsDiv = document.createElement('div');
            colorsDiv.className = 'palette-colors';
            
            palette.colors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'color';
                colorDiv.style.backgroundColor = color;
                colorDiv.dataset.color = color;
                colorsDiv.appendChild(colorDiv);
            });
            
            // Create palette info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'palette-info';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'palette-name';
            nameDiv.textContent = palette.name;
            
            const likeBtn = document.createElement('button');
            likeBtn.className = 'like-btn';
            likeBtn.innerHTML = '<i class="far fa-heart"></i>';
            
            // Check if palette is liked
            if (likedPalettes.includes(palette.id)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            
            // Like button event
            likeBtn.addEventListener('click', () => toggleLike(palette.id, likeBtn));
            
            // Copy color on click
            colorsDiv.querySelectorAll('.color').forEach(colorDiv => {
                colorDiv.addEventListener('click', () => {
                    const color = colorDiv.dataset.color;
                    navigator.clipboard.writeText(color).then(() => {
                        // Show copied feedback
                        const originalText = colorDiv.textContent;
                        colorDiv.textContent = 'Copied!';
                        setTimeout(() => {
                            colorDiv.textContent = originalText;
                        }, 1000);
                    });
                });
            });
            
            // Assemble the card
            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(likeBtn);
            
            paletteCard.appendChild(colorsDiv);
            paletteCard.appendChild(infoDiv);
            
            paletteContainer.appendChild(paletteCard);
        });
    }
    
    // Toggle like status
    function toggleLike(paletteId, button) {
        const index = likedPalettes.indexOf(paletteId);
        
        if (index === -1) {
            // Like the palette
            likedPalettes.push(paletteId);
            button.classList.add('liked');
            button.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            // Unlike the palette
            likedPalettes.splice(index, 1);
            button.classList.remove('liked');
            button.innerHTML = '<i class="far fa-heart"></i>';
        }
        
        // Save to localStorage
        localStorage.setItem('likedPalettes', JSON.stringify(likedPalettes));
    }
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
});