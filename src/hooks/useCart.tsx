import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => void;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    const newCart = [...cart]
    const isInCart = newCart.find((produto) => produto.id === productId);

    try {
      const produtoApi = await api.get(`products/${productId}`)
      const haveStock = await api.get(`stock/${productId}`)
      const productAmount = isInCart ? isInCart.amount : 0;
      if (haveStock.data.amount < productAmount + 1) {
        return (
          toast.error('Quantidade solicitada fora de estoque')
        )
      } 
      if(isInCart === undefined) {
        produtoApi.data.amount = 1
        const addInCart = [...cart, produtoApi.data]
        setCart(addInCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(addInCart))
      } else {
        isInCart.amount = isInCart.amount + 1
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    const newCart = [...cart]
    const productExists = newCart.find((produto) => produto.id === productId)
    if (productExists === undefined) {
      toast.error('Erro na remoção do produto')
      return
    }
  
    try {
      const cartMinusShoe = newCart.filter((produto) => produto.id !== productId)
      setCart(cartMinusShoe)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartMinusShoe))
      
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if (amount <= 0 ) return;
    try {
      const productStock = await api.get(`stock/${productId}`)
      const stock = productStock.data.amount;
      const newCart = [...cart];
      const isInCart = newCart.find((produto) => produto.id === productId);
  
      if (stock < amount ) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (isInCart !== undefined) {
        isInCart.amount = amount;
  
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
