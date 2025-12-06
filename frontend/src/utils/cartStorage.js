// 로컬 스토리지 장바구니 유틸리티

const CART_STORAGE_KEY = 'localCart';

// 로컬 스토리지에서 장바구니 가져오기
export function getLocalCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
}

// 로컬 스토리지에 장바구니 저장
export function saveLocalCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('로컬 스토리지 저장 오류:', error);
  }
}

// 로컬 스토리지 장바구니에 아이템 추가
export function addToLocalCart(product, size, quantity = 1, color = null) {
  const cart = getLocalCart();
  const itemKey = `${product.id}-${size}${color ? `-${color}` : ''}`;
  
  const existingItem = cart.find(item => item.key === itemKey);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // 선택한 색상에 맞는 이미지 찾기
    let selectedImage = product.images?.[0] || product.image;
    if (color && product.colorVariants) {
      const selectedVariant = product.colorVariants.find(v => v.name === color);
      if (selectedVariant) {
        selectedImage = selectedVariant.thumbnail || selectedVariant.images?.[0] || selectedImage;
      }
    }
    
    cart.push({
      key: itemKey,
      id: Date.now().toString(), // 임시 ID
      productId: product.id,
      productName: product.name || product.title,
      price: product.price,
      size,
      quantity,
      color,
      image: selectedImage,
    });
  }
  
  saveLocalCart(cart);
  return cart;
}

// 로컬 스토리지 장바구니에서 아이템 제거
export function removeFromLocalCart(itemId) {
  const cart = getLocalCart();
  const updatedCart = cart.filter(item => item.id !== itemId);
  saveLocalCart(updatedCart);
  return updatedCart;
}

// 로컬 스토리지 장바구니 아이템 수량 업데이트
export function updateLocalCartQuantity(itemId, quantity) {
  const cart = getLocalCart();
  const item = cart.find(item => item.id === itemId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromLocalCart(itemId);
    }
    item.quantity = quantity;
    saveLocalCart(cart);
  }
  
  return cart;
}

// 로컬 스토리지 장바구니 비우기
export function clearLocalCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
}

// 로컬 스토리지 장바구니 총 아이템 수
export function getLocalCartCount() {
  const cart = getLocalCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

