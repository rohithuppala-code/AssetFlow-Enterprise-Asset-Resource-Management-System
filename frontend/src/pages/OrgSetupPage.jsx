import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDepartments, createDepartment, getCategories, createCategory, getUsers, updateUser } from '../api/dataApi';

const tabs = ['Departments', 'Asset Categories', 'Employee Directory'];

const OrgSetupPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const res = await getDepartments({ limit: 100 });
        setDepartments(res.data.data.departments);
      } else if (activeTab === 1) {
        const res = await getCategories({ limit: 100 });
        setCategories(res.data.data.categories);
      } else {
        const res = await getUsers({ limit: 100, search });
        setUsers(res.data.data.users);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab, search]);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDepartment(form);
      setShowForm(false);
      setForm({});
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCategory(form);
      setShowForm(false);
      setForm({});
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Organization Setup</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>Manage departments, categories, and employees</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => { setActiveTab(i); setShowForm(false); }}
            style={{ padding: '0.75rem 1.25rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: 'none', color: activeTab === i ? 'var(--color-primary)' : 'var(--text-secondary)', borderBottom: activeTab === i ? '2px solid var(--color-primary)' : '2px solid transparent', transition: 'all 0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</div>}

      {/* Department Tab */}
      {activeTab === 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Departments ({departments.length})</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Department</button>
          </div>
          {showForm && (
            <form onSubmit={handleCreateDept} className="card" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 1, minWidth: '200px' }} placeholder="Department Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" style={{ flex: 1, minWidth: '200px' }} placeholder="Description (optional)" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button type="submit" className="btn btn-primary btn-sm">Create</button>
            </form>
          )}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {departments.map((dept) => (
              <div key={dept._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{dept.name}</div>
                  {dept.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{dept.description}</div>}
                  {dept.head && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Head: {dept.head.name}</div>}
                </div>
                <span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{dept.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tab */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Asset Categories ({categories.length})</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Category</button>
          </div>
          {showForm && (
            <form onSubmit={handleCreateCategory} className="card" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 1, minWidth: '200px' }} placeholder="Category Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" style={{ flex: 1, minWidth: '200px' }} placeholder="Description (optional)" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button type="submit" className="btn btn-primary btn-sm">Create</button>
            </form>
          )}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {categories.map((cat) => (
              <div key={cat._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{cat.name}</div>
                  {cat.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{cat.description}</div>}
                  {cat.customFields?.length > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.customFields.length} custom field(s)</div>}
                </div>
                <span className={`badge ${cat.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{cat.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Tab */}
      {activeTab === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Employees ({users.length})</h2>
            <input className="input" style={{ maxWidth: '300px' }} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.department?.name || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-danger' : u.role === 'AssetManager' ? 'badge-info' : u.role === 'DepartmentHead' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{u.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {u.role !== 'Admin' && u._id !== user._id && (
                        <select className="input" style={{ maxWidth: '160px', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                          value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                          <option value="Employee">Employee</option>
                          <option value="DepartmentHead">Dept Head</option>
                          <option value="AssetManager">Asset Mgr</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSetupPage;
