import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, deleteProduct } from '../features/products/productsSlice';
import { useToast } from '../components/Toast';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector(s => s.products);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', productCode: '', category: 'OTHER', unitPrice: 0, description: '', stockQuantity: 0, status: 'ACTIVE' });

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createProduct({...form, productName: form.name, unitPrice: Number(form.unitPrice), stockQuantity: Number(form.stockQuantity)}));
    if (!res.error) {
      toast.success('Product created');
      setShowModal(false);
      setForm({ name: '', productCode: '', category: 'OTHER', unitPrice: 0, description: '', stockQuantity: 0, status: 'ACTIVE' });
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
                  <td style={{ fontWeight: 600 }}>{p.productName || p.name}</td>
                  <td>{p.productCode || '-'}</td>
                  <td>{p.category || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{formatCurrency(p.unitPrice)}</td>
                  <td>{p.stockQuantity}</td>
                  <td><span className={`badge badge-${p.status === 'ACTIVE' ? 'green' : 'gray'}`}>{p.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => {if(confirm('Delete product?')) dispatch(deleteProduct(p._id))}} title="Delete product">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">inventory_2</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Add Product</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Add a new item or service to your catalog.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)} title="Close">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>inventory_2</span>
                  Product Details
                </h3>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">label</span>
                    <input placeholder="Enter Name" className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Product Code *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">qr_code</span>
                      <input placeholder="Enter Product Code" className="form-input" required value={form.productCode} onChange={e => setForm({...form, productCode: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">category</span>
                      <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="SOFTWARE">Software</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="SERVICE">Service</option>
                        <option value="SUBSCRIPTION">Subscription</option>
                        <option value="CONSULTING">Consulting</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>payments</span>
                  Pricing & Stock
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Unit Price ($) *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">attach_money</span>
                      <input placeholder="Enter Unit Price" type="number" step="0.01" className="form-input" required value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">shelves</span>
                      <input placeholder="Enter Stock Quantity" type="number" className="form-input" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>info</span>
                  Status & Description
                </h3>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">toggle_on</span>
                    <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Description</label>
                  <textarea placeholder="Enter Description" className="form-input" rows="3" style={{ paddingLeft: 12 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>
                
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
