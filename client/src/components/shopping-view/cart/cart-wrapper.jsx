import React from 'react'
import UserCartItemsContent from './cart-items-content'


const UserCartWrapper = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h1 className="text-xl font-bold mb-4">Shopping Cart</h1>
      <UserCartItemsContent />
    </div>
  )
}

export default UserCartWrapper
