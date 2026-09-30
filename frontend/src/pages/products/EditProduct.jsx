import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/product/ProductForm';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (productData) => {
    try {
      setIsSubmitting(true);
      await productService.updateProduct(id, productData);
      setToast({ message: 'Product updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to update product: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Fetching product details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProductForm initialData={product} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default EditProduct;
