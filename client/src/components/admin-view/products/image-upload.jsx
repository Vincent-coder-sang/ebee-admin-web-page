import { handleImageUpload } from '@/features/slices/productSlice';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';

const imageUpload = () => {
    const dispatch = useDispatch();

    const handleImageUploadCloudinary = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');
        formData.append('cloud_name', 'dtxqjxq1p');
    }
useEffect(() => {
    if (file) {
        dispatch(handleImageUpload(formData));
    }
}, [])

    
  return (
    <div>image upload</div>
  )
}

export default imageUpload