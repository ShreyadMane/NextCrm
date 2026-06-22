import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, deleteProduct } from '../features/products/productsSlice';
import { useToast } from '../components/Toast';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector(s => s.products);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', productCode: '', category: '', unitPrice: 0, description: '', stockQuantity: 0, status: 'ACTIVE' });

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createProduct({...form, unitPrice: Number(form.unitPrice), stockQuantity: Number(form.stockQuantity)}));
    if (!res.error) {
      toast.success('Product created');
      setShowModal(false);
      setForm({ name: '', productCode: '', category: '', unitPrice: 0, description: '', stockQuantity: 0, status: 'ACTIVE' });
    } else toast.error('Failed to create product');
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Products & Services</h1><p className="page-subtitle">Manage your catalog</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Add Product</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? <div className="page-loading"><div className="spinner"></div></div> : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3 className="empty-state-title">No Products</h3></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Product Name</th><th>Code</th><th>Category</th><th>Unit Price</th><th>Stock</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.productCode || '-'}</td>
                  <td>{p.category || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{formatCurrency(p.unitPrice)}</td>
                  <td>{p.stockQuantity}</td>
                  <td><span className={`badge badge-${p.status === 'ACTIVE' ? 'green' : 'gray'}`}>{p.status}</span></td>
                  <td style={{ textAlign: 'right' }}><button className="btn-icon" onClick={() => {if(confirm('Delete product?')) dispatch(deleteProduct(p._id))}}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2 className="modal-title">Add Product</h2><button className="btn-icon" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name *</label><input placeholder="Enter Name" className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Product Code</label><input placeholder="Enter Product Code" className="form-input" value={form.productCode} onChange={e => setForm({...form, productCode: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Category</label><input placeholder="Enter Category" className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
                </div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Unit Price ($) *</label><input placeholder="Enter Unit Price" type="number" step="0.01" className="form-input" required value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Stock Quantity</label><input placeholder="Enter Stock Quantity" type="number" className="form-input" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea placeholder="Enter Description" className="form-input" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
