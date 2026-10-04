import { useState, useEffect } from 'react';
import { useAuth, User } from '../../../context/AuthContext';
import { apiClient, ApiError } from '../../../api/client';
import { Users, Plus, Edit2, Trash2, X, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../portal.css';

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'cliente',
    password: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(t('admin_users.loading_err', 'Error al cargar usuarios. Asegúrate de que el endpoint GET /api/users exista en tu backend.'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email,
        company: user.company || '',
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', company: '', role: 'cliente', password: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        // Editar
        await apiClient(`/users/${editingUser.id}`, {
          method: 'PUT',
          data: formData
        });
      } else {
        // Crear
        await apiClient('/users', {
          method: 'POST',
          data: formData
        });
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(t('admin_users.save_err', 'Error inesperado al guardar el usuario.'));
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert(t('admin_users.self_delete_err', 'No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada.'));
      return;
    }
    
    if (confirm(t('admin_users.confirm_delete', '¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible.'))) {
      try {
        await apiClient(`/users/${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (err) {
        alert(t('admin_users.delete_err', 'Hubo un error al intentar eliminar el usuario.'));
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="#10b981" />
            {t('admin_users.management', 'Gestión de Usuarios')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {t('admin_users.admin_desc', 'Administra los accesos y roles de la plataforma.')}
          </p>
        </div>
        
        <button className="btn-primary-sm" onClick={() => openModal()}>
          <Plus size={16} />
          {t('admin_users.new_user', 'Nuevo Usuario')}
        </button>
      </div>

      <div className="data-table-container">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{t('admin_users.loading', 'Cargando datos...')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin_users.name', 'Nombre')}</th>
                <th>{t('admin_users.email', 'Email')}</th>
                <th>{t('admin_users.company', 'Empresa')}</th>
                <th>{t('admin_users.role', 'Rol')}</th>
                <th>{t('admin_users.referral_code', 'Código Referido')}</th>
                <th style={{ textAlign: 'right' }}>{t('admin_users.actions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('admin_users.no_users', 'No se encontraron usuarios o el endpoint falló.')}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{u.company || '—'}</td>
                    <td>
                      <span className={`badge ${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {(u as any).referralCode ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem', color: '#334155' }}>
                            {(u as any).referralCode}
                          </code>
                          <button 
                            className="btn-icon" 
                            style={{ padding: '0.2rem' }}
                            onClick={() => handleCopyCode((u as any).referralCode)}
                            title={t('admin_users.copy_code', 'Copiar código')}
                          >
                            {copiedCode === (u as any).referralCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn-icon" onClick={() => openModal(u)} title={t('admin_users.edit_user', 'Editar usuario')}>
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon danger" 
                        onClick={() => handleDelete(u.id)} 
                        title={t('admin_users.delete_user', 'Eliminar usuario')}
                        disabled={u.id === currentUser?.id}
                        style={{ opacity: u.id === currentUser?.id ? 0.3 : 1, marginLeft: '0.5rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? t('admin_users.edit_user', 'Editar Usuario') : t('admin_users.create_user', 'Crear Nuevo Usuario')}</h3>
              <button className="btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}
              
              <form id="user-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{t('admin_users.full_name', 'Nombre Completo')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder={t('admin_users.name_ph', 'Ej. Juan Pérez')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('admin_users.email', 'Correo Electrónico')}</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder={t('admin_users.email_ph', 'juan@empresa.com')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin_users.company', 'Empresa')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder={t('admin_users.company_ph', 'Ej. Hormesis Inc.')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin_users.user_role', 'Rol de Usuario')}</label>
                  <select 
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="cliente">{t('admin_users.role_client', 'Cliente (Vista limitada)')}</option>
                    <option value="colaborador">{t('admin_users.role_colab', 'Colaborador (Vista operativa)')}</option>
                    <option value="admin">{t('admin_users.role_admin', 'Administrador (Acceso total)')}</option>
                  </select>
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>{t('admin_users.temp_pass', 'Contraseña Temporal')}</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={8}
                      placeholder={t('admin_users.pass_ph', 'Mínimo 8 caracteres')}
                    />
                  </div>
                )}
              </form>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeModal}>{t('admin_users.cancel', 'Cancelar')}</button>
              <button type="submit" form="user-form" className="btn-primary-sm">
                {editingUser ? t('admin_users.save_changes', 'Guardar Cambios') : t('admin_users.create_user', 'Crear Usuario')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
