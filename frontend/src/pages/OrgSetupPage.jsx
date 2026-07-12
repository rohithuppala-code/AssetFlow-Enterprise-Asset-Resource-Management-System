import { useEffect, useState } from 'react';
import { Building2, FolderKanban, PlusCircle, UsersRound } from 'lucide-react';
import {
  createCategory,
  createDepartment,
  getCategories,
  getDepartments,
  getUsers,
  updateUser,
  createUser,
} from '../api/dataApi';
import { useAuth } from '../context/AuthContext';
import {
  EmptyState,
  LoadingState,
  PageHeader,
  SearchField,
  StatusPill,
  SurfaceCard,
} from '../components/ui';

const tabs = ['Departments', 'Asset Categories', 'Employee Directory'];

function OrgSetupPage() {
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
    } catch {
      setDepartments([]);
      setCategories([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeTab, search]);

  const handleCreateDepartment = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createDepartment(form);
      setShowForm(false);
      setForm({});
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createCategory(form);
      setShowForm(false);
      setForm({});
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role || 'Employee',
      });
      setShowForm(false);
      setForm({});
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin workspace"
        title="Organization setup and master data"
        description="Maintain departments, categories, and employee role assignments without leaving the operational frontend."
        actions={[
          <button key="form" className="button button-primary" onClick={() => setShowForm((value) => !value)}>
            <PlusCircle size={18} />
            <span>{showForm ? 'Close form' : 'Create record'}</span>
          </button>,
        ]}
      />

  <SurfaceCard title="Master data tabs" description="Switch between foundational ERP records." index={0}>
    <div className="page-stack">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab, index) => (
          <button key={tab} className={activeTab === index ? 'button button-primary button-sm' : 'button button-secondary button-sm'} onClick={() => { setActiveTab(index); setShowForm(false); }}>
            {tab}
          </button>
        ))}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {showForm && activeTab === 0 ? (
        <form onSubmit={handleCreateDepartment} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="field">
              <label>Department name</label>
              <input className="input" value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="field">
              <label>Description</label>
              <input className="input" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
          </div>
          <div><button type="submit" className="button button-primary">Create department</button></div>
        </form>
      ) : null}

  {
    showForm && activeTab === 1 ? (
      <form onSubmit={handleCreateCategory} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="field">
            <label>Category name</label>
            <input className="input" value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <input className="input" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
        </div>
        <div><button type="submit" className="button button-primary">Create category</button></div>
      </form>
    ) : null
  }

  {
    showForm && activeTab === 2 ? (
      <form onSubmit={handleCreateEmployee} style={{ display: 'grid', gap: '1rem', padding: '1.2rem', borderRadius: 22, background: 'rgba(8, 18, 34, 0.54)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="field">
            <label>Full name</label>
            <input className="input" placeholder="e.g. Amit Kumar" value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </div>
          <div className="field">
            <label>Work email</label>
            <input className="input" type="email" placeholder="e.g. amit@company.com" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="At least one uppercase and number" value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
          </div>
          <div className="field">
            <label>Starting role</label>
            <select className="select" value={form.role || 'Employee'} onChange={(event) => setForm({ ...form, role: event.target.value })} required>
              <option value="Employee">Employee (User)</option>
              <option value="AssetManager">Asset Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        <div><button type="submit" className="button button-primary">Add Employee</button></div>
      </form>
    ) : null
  }

  {
    activeTab === 0 ? (
      loading ? (
        <LoadingState label="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create the organizational structure that assets and employees will roll up into." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Description</th>
                <th>Head</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department._id}>
                  <td style={{ fontWeight: 800 }}>{department.name}</td>
                  <td>{department.description || '--'}</td>
                  <td>{department.head?.name || 'Unassigned'}</td>
                  <td><StatusPill>{department.status}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    ) : null
  }

  {
    activeTab === 1 ? (
      loading ? (
        <LoadingState label="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No categories yet" description="Create classification layers for electronics, furniture, vehicles, and other tracked assets." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Custom fields</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td style={{ fontWeight: 800 }}>{category.name}</td>
                  <td>{category.description || '--'}</td>
                  <td>{category.customFields?.length || 0}</td>
                  <td><StatusPill>{category.status}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    ) : null
  }

  {
    activeTab === 2 ? (
      <div className="page-stack">
        <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" style={{ maxWidth: 360 }} />
        {loading ? (
          <LoadingState label="Loading employee directory..." />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersRound} title="No users found" description="Employees and promoted roles will appear here once accounts exist." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Role assignment</th>
                </tr>
              </thead>
              <tbody>
                {users.map((directoryUser) => (
                  <tr key={directoryUser._id}>
                    <td style={{ fontWeight: 800 }}>{directoryUser.name}</td>
                    <td>{directoryUser.email}</td>
                    <td>{directoryUser.department?.name || '--'}</td>
                    <td><StatusPill>{directoryUser.role}</StatusPill></td>
                    <td><StatusPill>{directoryUser.status}</StatusPill></td>
                    <td>
                      {directoryUser.role !== 'Admin' && directoryUser._id !== user._id ? (
                        <select className="select" style={{ minWidth: 170 }} value={directoryUser.role} onChange={(event) => handleRoleChange(directoryUser._id, event.target.value)}>
                          <option value="Employee">Employee</option>
                          <option value="AssetManager">Asset manager</option>
                        </select>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ) : null
  }
        </div >
      </SurfaceCard >
    </div >
  );
}

export default OrgSetupPage;
