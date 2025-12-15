/**
 * Adds a single ingredient to the cart in localStorage
 * @param {string} ingredient - The ingredient to add
 */
function addToCart(ingredient) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(ingredient);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart: ' + ingredient);
}

/**
 * Adds multiple ingredients to cart at once
 * @param {Array} ingredients - Array of ingredient strings
 */
function addAllToCart(ingredients) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    ingredients.forEach(ing => cart.push(ing));
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added ' + ingredients.length + ' ingredients to cart!');
}

/**
 * Clears all items from the cart
 */
function clearCart() {
    localStorage.removeItem('cart');
    displayCart();
}

/**
 * Displays cart contents on the cart page
 */
function displayCart() {
    const cartList = document.querySelector('.ingredientscart');
    if (!cartList) return; // Not on cart page
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<li class="text-muted">Your cart is empty</li>';
        return;
    }
    
    cart.forEach((ingredient, index) => {
        const li = document.createElement('li');
        li.className = 'd-flex justify-content-between align-items-center mb-2';
        li.innerHTML = `
            <span>${ingredient}</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartList.appendChild(li);
    });
}

/**
 * Removes a single item from cart by index
 * @param {number} index - Index of item to remove
 */
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

/**
 * Saves a recipe to favorites in localStorage
 * @param {Object} meal - Meal object from API
 */
function addToFavorites(meal) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Check if already in favorites
    if (favorites.some(fav => fav.idMeal === meal.idMeal)) {
        alert('Already in favorites!');
        return;
    }
    
    favorites.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory || ''
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Added to favorites!');
}

/**
 * Removes a recipe from favorites
 * @param {string} id - Meal ID to remove
 */
function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.idMeal !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

/**
 * Displays all favorites on the favorites page
 */
function displayFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return; // Not on favorites page
    
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    container.innerHTML = '';
    
    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-center text-muted col-12">No favorites yet! Search for recipes and add some.</p>';
        return;
    }
    
    favorites.forEach(meal => {
        const card = document.createElement('article');
        card.className = 'col-12 col-sm-6 col-lg-4';
        card.innerHTML = `
            <div class="card h-100">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                <div class="card-body">
                    <h3 class="card-title h5">${meal.strMeal}</h3>
                    <p class="card-text text-muted">${meal.strCategory}</p>
                    <button class="btn btn-primary btn-sm me-1" onclick="viewRecipeDetails('${meal.idMeal}')">View Recipe</button>
                    <button class="btn btn-danger btn-sm" onclick="removeFromFavorites('${meal.idMeal}')">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Searches TheMealDB API for meals matching query
 * @param {string} query - Search term
 */
async function searchRecipes(query) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="text-center col-12">Searching...</p>';
    
    try {
        // Fetch from TheMealDB API
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        resultsContainer.innerHTML = '';
        
        if (!data.meals) {
            resultsContainer.innerHTML = '<p class="text-center text-muted col-12">No recipes found. Try a different search term!</p>';
            return;
        }
        
        // Display each meal as a card
        data.meals.forEach(meal => {
            const card = document.createElement('article');
            card.className = 'col-12 col-sm-6 col-lg-4';
            card.innerHTML = `
                <div class="card h-100">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h3 class="card-title h5">${meal.strMeal}</h3>
                        <p class="card-text text-muted">${meal.strCategory} - ${meal.strArea}</p>
                        <button class="btn btn-primary btn-sm me-1" onclick="viewRecipeDetails('${meal.idMeal}')">View Recipe</button>
                        <button class="btn btn-outline-success btn-sm" onclick='addToFavorites(${JSON.stringify(meal).replace(/'/g, "\\'")})'>♥ Save</button>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        resultsContainer.innerHTML = '<p class="text-center text-danger col-12">Error loading recipes. Please try again.</p>';
    }
}

/**
 * Fetches and displays detailed recipe info in modal
 * @param {string} id - Meal ID from API
 */
async function viewRecipeDetails(id) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '<p>Loading...</p>';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    modal.show();
    
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        
        // Extract ingredients (API has strIngredient1-20 and strMeasure1-20)
        let ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
            }
        }
        
        // Update modal title
        document.getElementById('recipeModalLabel').textContent = meal.strMeal;
        
        // Build modal content
        modalBody.innerHTML = `
            <img src="${meal.strMealThumb}" class="img-fluid rounded mb-3" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory} | <strong>Cuisine:</strong> ${meal.strArea}</p>
            
            <h3 class="h5">Ingredients</h3>
            <ul class="mb-3">
                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <button class="btn btn-success mb-3" onclick='addAllToCart(${JSON.stringify(ingredients)})'>Add All to Cart</button>
            
            <h3 class="h5">Instructions</h3>
            <p>${meal.strInstructions.replace(/\n/g, '<br>')}</p>
            
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" rel="noopener" class="btn btn-danger">Watch on YouTube</a>` : ''}
        `;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        modalBody.innerHTML = '<p class="text-danger">Error loading recipe details.</p>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart display if on cart page
    displayCart();
    
    // Initialize favorites display if on favorites page
    displayFavorites();
    
    // Set up search form if on recipe page
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                searchRecipes(query);
            }
        });
    }
});