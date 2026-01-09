import { getCart } from '@/features/slices/cartSlice'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const UserCartItemsContent = () => {
  const dispatch = useDispatch()

  // Ensure state key matches your store configuration
  const { list: cart } = useSelector((state) => state.cart || { list: [] });

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  return (
    <div>
      <h2>Your Cart Items</h2>
      {cart.length > 0 ? (
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price} x {item.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  )
}

export default UserCartItemsContent
