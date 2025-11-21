
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
    let cartList = document.querySelector('.ingredientscart');
    cartList.innerHTML = '';
    cart.forEach(item => {
        let li = document.createElement('li');
        li.textContent = item;
        cartList.appendChild(li);
    });
}
document.addEventListener('DOMContentLoaded', displayCart);