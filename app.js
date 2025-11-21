
function addToCart(ingredient) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(ingredient);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem('cart');
    displayCart();
}

function displayCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.ingredientscart');
    while (cartList.firstChild) {
        cartList.removeChild(cartList.firstChild);
    }
    cart.forEach(ingredient => {
        const li = document.createElement('li');
        li.innerText = ingredient;
        cartList.appendChild(li);
    });
}
document.addEventListener('DOMContentLoaded', displayCart);