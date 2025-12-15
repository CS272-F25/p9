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
    
    // Initialize cuisines if on cuisines page
    loadCuisines();
    
    // Initialize planner if on planner page
    displayPlanner();
    loadPlannerForm();
    setupPlannerAutocomplete();
    
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
    
    // Set up planner form if on planner page
    const plannerForm = document.getElementById('planner-form');
    if (plannerForm) {
        plannerForm.addEventListener('submit', savePlanner);
    }
});

/**
 * Fetches all available cuisines from TheMealDB and creates filter buttons
 */
async function loadCuisines() {
    const buttonContainer = document.getElementById('cuisine-buttons');
    if (!buttonContainer) return; // Not on cuisines page
    
    try {
        // Fetch list of all areas/cuisines
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
        const data = await response.json();
        
        buttonContainer.innerHTML = '';
        
        data.meals.forEach(cuisine => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-success';
            btn.textContent = cuisine.strArea;
            btn.onclick = () => loadRecipesByCuisine(cuisine.strArea);
            buttonContainer.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading cuisines:', error);
        buttonContainer.innerHTML = '<p class="text-danger">Error loading cuisines. Please refresh.</p>';
    }
}

/**
 * Fetches and displays recipes for a specific cuisine
 * @param {string} cuisine - The cuisine/area name (e.g., "Italian", "Mexican")
 */
async function loadRecipesByCuisine(cuisine) {
    const resultsContainer = document.getElementById('cuisine-results');
    const heading = document.getElementById('cuisine-results-heading');
    
    heading.textContent = `${cuisine} Recipes`;
    resultsContainer.innerHTML = '<p class="text-center col-12">Loading...</p>';
    
    // Update active button state
    const buttons = document.querySelectorAll('#cuisine-buttons button');
    buttons.forEach(btn => {
        if (btn.textContent === cuisine) {
            btn.classList.remove('btn-outline-success');
            btn.classList.add('btn-success');
        } else {
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-success');
        }
    });
    
    try {
        // Fetch recipes filtered by area
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(cuisine)}`);
        const data = await response.json();
        
        resultsContainer.innerHTML = '';
        
        if (!data.meals) {
            resultsContainer.innerHTML = '<p class="text-center text-muted col-12">No recipes found for this cuisine.</p>';
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
                        <button class="btn btn-primary btn-sm me-1" onclick="viewRecipeDetails('${meal.idMeal}')">View Recipe</button>
                        <button class="btn btn-outline-success btn-sm" onclick="saveFavoriteById('${meal.idMeal}')">♥ Save</button>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recipes:', error);
        resultsContainer.innerHTML = '<p class="text-center text-danger col-12">Error loading recipes. Please try again.</p>';
    }
}

/**
 * Saves a recipe to favorites using just the meal ID
 * (Used when we only have ID from filter results, not full meal object)
 * @param {string} id - Meal ID
 */
async function saveFavoriteById(id) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        addToFavorites(meal);
    } catch (error) {
        console.error('Error saving favorite:', error);
        alert('Error saving to favorites. Please try again.');
    }
}

/**
 * Saves the meal plan form data to localStorage
 * @param {Event} e - Form submit event
 */
function savePlanner(e) {
    e.preventDefault();
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const plan = {};
    
    days.forEach(day => {
        const input = document.getElementById(day);
        if (input) {
            plan[day] = input.value.trim();
        }
    });
    
    localStorage.setItem('mealPlan', JSON.stringify(plan));
    alert('Meal plan saved!');
    displayPlanner();
}

/**
 * Clears the meal plan from localStorage and resets the form
 */
function clearPlanner() {
    localStorage.removeItem('mealPlan');
    const form = document.getElementById('planner-form');
    if (form) {
        form.reset();
    }
    displayPlanner();
    alert('Meal plan cleared!');
}

/**
 * Displays the saved meal plan on the page
 */
function displayPlanner() {
    const container = document.getElementById('saved-plan');
    const printSection = document.getElementById('print-section');
    if (!container) return; // Not on planner page
    
    const plan = JSON.parse(localStorage.getItem('mealPlan'));
    
    if (!plan || Object.values(plan).every(val => val === '')) {
        container.innerHTML = '<p class="text-center text-muted col-12">No meal plan saved yet.</p>';
        if (printSection) printSection.style.display = 'none';
        return;
    }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    container.innerHTML = '';
    
    days.forEach((day, index) => {
        if (plan[day]) {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3';
            col.innerHTML = `
                <div class="card p-3 h-100">
                    <h3 class="h6 fw-bold">${dayNames[index]}</h3>
                    <p class="mb-0">${plan[day]}</p>
                </div>
            `;
            container.appendChild(col);
        }
    });
    
    // Show print button if there's a plan
    if (printSection) printSection.style.display = 'block';
}

/**
 * Loads saved meal plan into the form inputs
 */
function loadPlannerForm() {
    const plan = JSON.parse(localStorage.getItem('mealPlan'));
    if (!plan) return;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const input = document.getElementById(day);
        if (input && plan[day]) {
            input.value = plan[day];
        }
    });
}

/** 
 * Debounce timer for autocomplete to avoid too many API calls
 */
let debounceTimer;

/**
 * Fetches meal suggestions from API based on input
 * @param {string} query - Search term
 * @param {string} day - Day of the week (used to target correct suggestions div)
 */
async function fetchMealSuggestions(query, day) {
    const suggestionsDiv = document.getElementById(`${day}-suggestions`);
    if (!suggestionsDiv) return;
    
    // Clear if query is too short
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        suggestionsDiv.innerHTML = '';
        
        if (!data.meals) {
            suggestionsDiv.classList.remove('show');
            return;
        }
        
        // Show up to 5 suggestions
        const meals = data.meals.slice(0, 5);
        
        meals.forEach(meal => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <span>${meal.strMeal}</span>
            `;
            item.onclick = () => selectMealSuggestion(day, meal.strMeal);
            suggestionsDiv.appendChild(item);
        });
        
        suggestionsDiv.classList.add('show');
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

/**
 * Handles selection of a meal from suggestions
 * @param {string} day - Day of the week
 * @param {string} mealName - Selected meal name
 */
function selectMealSuggestion(day, mealName) {
    const input = document.getElementById(day);
    const suggestionsDiv = document.getElementById(`${day}-suggestions`);
    
    if (input) {
        input.value = mealName;
    }
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
        suggestionsDiv.innerHTML = '';
    }
}

/**
 * Sets up autocomplete listeners for all planner inputs
 */
function setupPlannerAutocomplete() {
    const inputs = document.querySelectorAll('.planner-input');
    
    inputs.forEach(input => {
        const day = input.id;
        
        // Fetch suggestions on input with debounce
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchMealSuggestions(this.value.trim(), day);
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        input.addEventListener('blur', function() {
            // Small delay to allow click on suggestion
            setTimeout(() => {
                const suggestionsDiv = document.getElementById(`${day}-suggestions`);
                if (suggestionsDiv) {
                    suggestionsDiv.classList.remove('show');
                }
            }, 200);
        });
        
        // Show suggestions again on focus if there's input
        input.addEventListener('focus', function() {
            if (this.value.trim().length >= 2) {
                fetchMealSuggestions(this.value.trim(), day);
            }
        });
    });
}