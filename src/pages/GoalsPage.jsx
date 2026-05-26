import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getIncomeEntries, MARKETPLACE_SOURCES } from '../utils/incomeAPI';
import { getGoals, addGoal, deleteGoal, updateGoal, getGoalProgress } from '../utils/goalsAndMetrics';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppCard from '../components/AppCard';
import '../styles/GoalsPage.css';

const GoalsPage = () => {
  const { addToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    period: 'monthly',
    marketplace: 'all',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setGoals(getGoals());
    setEntries(await getIncomeEntries());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target) {
      addToast('Nama dan target harus diisi', 'error');
      return;
    }

    addGoal({
      name: formData.name,
      target: parseFloat(formData.target),
      period: formData.period,
      marketplace: formData.marketplace,
      note: formData.note,
    });

    setFormData({ name: '', target: '', period: 'monthly', marketplace: 'all', note: '' });
    setShowForm(false);
    loadData();
    addToast('Target berhasil ditambahkan', 'success');
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin hapus target ini?')) {
      deleteGoal(id);
      loadData();
      addToast('Target berhasil dihapus', 'success');
    }
  };

  const handleAchieved = (id, goal) => {
    updateGoal(id, { status: goal.status === 'completed' ? 'active' : 'completed' });
    loadData();
    addToast(goal.status === 'completed' ? 'Target diaktifkan kembali' : 'Selamat! Target tercapai! 🎉', 'success');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="goals-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>🎯 Target & Goals</h1>
          <p>Kelola target penjualan dan tracking pencapaiannya</p>
        </div>
        <AppButton
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          style={{ fontSize: '0.95em', padding: '10px 16px' }}
        >
          {showForm ? '× Tutup' : '+ Tambah Target'}
        </AppButton>
      </div>

      {/* Form */}
      {showForm && (
        <AppCard className="goals-form">
          <h3 style={{ marginTop: 0 }}>Tambah Target Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <AppInput
                label="Nama Target"
                placeholder="Contoh: Target Shopee Mei"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <AppInput
                label="Target Penjualan (Rp)"
                type="number"
                placeholder="Contoh: 50000000"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />

              <div className="form-group">
                <label>Periode</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="form-input"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Marketplace</label>
                <select
                  value={formData.marketplace}
                  onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                  className="form-input"
                >
                  <option value="all">Semua Channel</option>
                  {MARKETPLACE_SOURCES.map(source => (
                    <option key={source.code} value={source.code}>
                      {source.icon} {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Catatan</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Catatan opsional..."
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                style={{ fontSize: '0.95em', padding: '10px 16px' }}
              >
                Batal
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                style={{ fontSize: '0.95em', padding: '10px 16px' }}
              >
                💾 Simpan Target
              </AppButton>
            </div>
          </form>
        </AppCard>
      )}

      {/* Goals List */}
      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map(goal => {
            const progress = getGoalProgress(goal, entries);
            const marketplace = MARKETPLACE_SOURCES.find(s => s.code === goal.marketplace);
            const periodLabel = {
              daily: '📅 Harian',
              weekly: '📆 Mingguan',
              monthly: '📊 Bulanan'
            }[goal.period];

            return (
              <div key={goal.id} className={`goal-card ${goal.status}`}>
                <div className="goal-header">
                  <div>
                    <h3>{goal.name}</h3>
                    <div className="goal-meta">
                      <span className="badge period">{periodLabel}</span>
                      {goal.marketplace !== 'all' && marketplace && (
                        <span className="badge marketplace">
                          {marketplace.icon} {marketplace.name}
                        </span>
                      )}
                      {goal.note && <span className="badge note">📝 Ada catatan</span>}
                    </div>
                  </div>

                  <div className="goal-actions">
                    <button
                      className="btn-action btn-toggle"
                      onClick={() => handleAchieved(goal.id, goal)}
                      title={goal.status === 'completed' ? 'Ulangi' : 'Tandai tercapai'}
                    >
                      {goal.status === 'completed' ? '↻' : '✓'}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(goal.id)}
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-progress">
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-background">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progress.percentage}%`,
                          backgroundColor: progress.achieved ? '#10b981' : '#667eea'
                        }}
                      />
                    </div>
                    <span className="progress-percentage">{progress.percentage}%</span>
                  </div>

                  <div className="progress-details">
                    <div className="detail-item">
                      <span className="detail-label">Tercapai</span>
                      <span className="detail-value">{formatCurrency(progress.current)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Target</span>
                      <span className="detail-value">{formatCurrency(progress.target)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Sisa</span>
                      <span className="detail-value" style={{ color: progress.achieved ? '#10b981' : '#666' }}>
                        {progress.achieved ? '✓ Tercapai!' : formatCurrency(progress.remaining)}
                      </span>
                    </div>
                  </div>
                </div>

                {goal.note && (
                  <div className="goal-note">
                    <strong>Catatan:</strong> {goal.note}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '3em', marginBottom: '12px' }}>🎯</div>
            <h3>Belum ada target</h3>
            <p>Buat target penjualan untuk memotivasi tim dan tracking pencapaiannya</p>
            <AppButton
              onClick={() => setShowForm(true)}
              variant="primary"
              style={{ marginTop: '16px' }}
            >
              + Buat Target Pertama
            </AppButton>
          </div>
        )}
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="goals-summary">
          <h2>📊 Ringkasan Target</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Total Target</div>
              <div className="summary-value">
                {formatCurrency(goals.reduce((sum, g) => sum + g.target, 0))}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Target Tercapai</div>
              <div className="summary-value" style={{ color: '#10b981' }}>
                {goals.filter(g => {
                  const progress = getGoalProgress(g, entries);
                  return progress.achieved;
                }).length} dari {goals.length}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Pencapaian Rata-rata</div>
              <div className="summary-value">
                {Math.round(goals.reduce((sum, g) => sum + getGoalProgress(g, entries).percentage, 0) / goals.length)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
