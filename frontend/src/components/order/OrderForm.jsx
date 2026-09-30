import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import OrderItemForm from './OrderItemForm';
import ErrorMessage from '../common/ErrorMessage';
import customerService from '../../services/customerService';

const OrderForm = ({
  customers = [],
  products = [],
  initialCustomerId = '',
  onCustomerCreated,
  onSubmit,
  isSubmitting,
}) => {
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState('');

  // Customer search & quick add
  const [customerSearch, setCustomerSearch] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddError, setQuickAddError] = useState('');
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(selectedCustomerId)
  );

  useEffect(() => {
    if (initialCustomerId && customers.length > 0) {
      const found = customers.find(
        (c) => String(c.id) === String(initialCustomerId)
      );
      if (found) {
        setSelectedCustomerId(String(found.id));
        setShippingAddress(found.address || '');
        setShippingCity(found.city || '');
        setShippingState(found.state || '');
        setShippingPincode(found.pincode || '');
      }
    }
  }, [initialCustomerId, customers]);

  const handleSelectCustomer = (custId) => {
    setSelectedCustomerId(custId);
    const customer = customers.find((c) => String(c.id) === String(custId));
    if (customer) {
      setShippingAddress(customer.address || '');
      setShippingCity(customer.city || '');
      setShippingState(customer.state || '');
      setShippingPincode(customer.pincode || '');
    }
  };

  const handleQuickAddCustomer = async (e) => {
    e.preventDefault();
    setQuickAddError('');
    if (!quickAddForm.name || !quickAddForm.email) {
      setQuickAddError('Please provide both Customer Name and Email.');
      return;
    }
    try {
      setQuickAddLoading(true);
      const created = await customerService.createCustomer(quickAddForm);
      if (onCustomerCreated) {
        onCustomerCreated(created);
      }
      handleSelectCustomer(String(created.id));
      setShowQuickAddModal(false);
      setQuickAddForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      });
    } catch (err) {
      setQuickAddError(
        err.response?.data?.message || err.message || 'Failed to create customer.'
      );
    } finally {
      setQuickAddLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const handleAddItem = (item) => {
    setOrderItems((prev) => [...prev, item]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer for this order.');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one product item to the order.');
      return;
    }

    if (!shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      setError('Please complete the shipping destination address.');
      return;
    }

    const payload = {
      orderNumber: `ORD-${Date.now()}`,
      customer: { id: parseInt(selectedCustomerId, 10) },
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'PENDING',
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      orderItems: orderItems.map((item) => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Customer Order</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select an existing database customer or register a new client</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Customer Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] font-bold">1</span>
                <span>Select Customer from Database</span>
              </h4>
              {!selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Customer</span>
                </button>
              )}
            </div>

            {selectedCustomer ? (
              /* Selected Customer Profile Card */
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedCustomer.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Verified Database Client #{selectedCustomer.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedCustomer.email}</span>
                      </span>
                      {selectedCustomer.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedCustomer.phone}</span>
                        </span>
                      )}
                      {(selectedCustomer.city || selectedCustomer.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerId('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-650 rounded-xl border border-slate-200 dark:border-slate-600 transition cursor-pointer self-start sm:self-auto shadow-2xs"
                  title="Choose a different customer from database"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Change Customer</span>
                </button>
              </div>
            ) : (
              /* Customer Search & Select Box */
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Select Customer from Database <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Choose registered customer ({customers.length} available)...</option>
                      {filteredCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.email} {c.phone ? `(${c.phone})` : ''} {c.city ? `• ${c.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Quick Search Existing Customer
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search name, email, phone or city..."
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1 gap-2">
                  <span>
                    Showing {filteredCustomers.length} of {customers.length} registered customers in database
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(true)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Customer not in database? Register new customer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Shipping Address */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              2. Shipping Destination
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street address..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  placeholder="State"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                  placeholder="Pincode"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 3. Line Items */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              3. Order Line Items
            </h4>
            <OrderItemForm
              products={products}
              items={orderItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Summary Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Items: {orderItems.length}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status upon creation: PENDING</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || orderItems.length === 0}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Order...' : 'Submit Order'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Register New Customer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Save client to database & attach to this order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ErrorMessage message={quickAddError} onDismiss={() => setQuickAddError('')} />

            <form onSubmit={handleQuickAddCustomer} className="space-y-3.5 pt-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quickAddForm.name}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={quickAddForm.email}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={quickAddForm.phone}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, phone: e.target.value })}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={quickAddForm.city}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={quickAddForm.address}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, address: e.target.value })}
                  placeholder="Street and unit details..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={quickAddForm.state}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={quickAddForm.pincode}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, pincode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickAddLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-xs cursor-pointer"
                >
                  {quickAddLoading ? 'Saving to Database...' : 'Save & Select Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
