import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
  const quantidade = {...sumAmount };
  quantidade[product.id] = product.amount;
  return quantidade;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const produtos = await api.get('/products')
      // eslint-disable-next-line array-callback-return
      produtos.data.map((shoe: { price: any | bigint; }) => {
        shoe.price = formatPrice(shoe.price)
      })

      setProducts(produtos.data)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((produto) => {
        return (
          <li key={produto.id}>
          <img src={`${produto.image}`} alt={`${produto.title}`}/>
          <strong>{produto.title}</strong>
          <span>{produto.price}</span>
          <button
            type="button"
            data-testid="add-product-button"
          onClick={() => handleAddProduct(produto.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[produto.id] || 0}
            </div>
  
            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
        )
      })}
     
    </ProductList>
  );
};

export default Home;
