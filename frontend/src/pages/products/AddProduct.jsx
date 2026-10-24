import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/product/ProductForm';
import productService from '../../services/productService';
import Toast from '../../components/common/Toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleCreate = async (productData) => {
    try {
      setIsSubmitting(true);
      await productService.createProduct(productData);
      setToast({ message: 'Product created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to create product: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProductForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AddProduct;
