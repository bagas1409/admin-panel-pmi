import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Plus, X, AlertCircle } from 'lucide-react'
import { getDCInventory, getDCStock, addDCInventory } from '@/api/distribution'

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
const PRODUCT_TYPES = [
  { code: 'WB',  label: 'Whole Blood',              color: '#DC2626', bg: '#FEF2F2' },
  { code: 'PRC', label: 'Packed Red Cells',         color: '#D97706', bg: '#FFFBEB' },
  { code: 'TC',  label: 'Thrombocyte Concentrate',  color: '#7C3AED', bg: '#FAF5FF' },
  { code: 'FFP', label: 'Fresh Frozen Plasma',      color: '#0891B2', bg: '#ECFEFF' },
] as const
type PT = typeof PRODUCT_TYPES[number]['code']
type BT = typeof BLOOD_TYPES[number]

const BT_COLORS: Record<BT, string> = { A: '#DC2626', B: '#2563EB', O: '#16A34A', AB: '#7C3AED' }

export default function DCInventoryPage() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<any[]>([])
  const [dcStocks, setDcStocks] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Build matrix: bloodType x productType → quantity
  const matrix: Record<string, Record<string, number>> = {}
  BLOOD_TYPES.forEach(bt => {
    matrix[bt] = {}
    PRODUCT_TYPES.forEach(pt => { matrix[bt][pt.code] = 0 })
  })
  inventory.forEach(i => { if (matrix[i.bloodType]) matrix[i.bloodType][i.productType] = i.quantity })

  // Modal tambah inventori
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ bloodType: 'A' as BT, productType: 'WB' as PT, quantity: 1, notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [inv, stockData] = await Promise.all([getDCInventory(), getDCStock()])
      setInventory(inv || [])
      const stockMap: Record<string, number> = {}
      stockData.stocks?.forEach((s: any) => { stockMap[s.bloodType] = s.quantity })
      setDcStocks(stockMap)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const isProcessed = form.productType !== 'WB'
  const availableWB = dcStocks[form.bloodType] || 0
  const canSave = form.quantity > 0 && (!isProcessed || availableWB >= form.quantity)

  const handleAdd = async () => {
    setSaving(true)
    try {
      await addDCInventory({ ...form, notes: form.notes || undefined })
      setShowAdd(false)
      setForm({ bloodType: 'A', productType: 'WB', quantity: 1, notes: '' })
      fetchAll()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Gagal menambah inventori')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/distribution-center')}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-purple-600" />
              Inventori Pengolahan – DC
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Matriks darah olahan WB · PRC · TC · FFP per golongan darah
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-sm hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Inventori
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Memuat inventori...</div>
      ) : (
        <>
          {/* Info stok mentah WB */}
          <div className="flex flex-wrap gap-2">
            {BLOOD_TYPES.map(bt => (
              <div key={bt} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-sm">
                <span className="font-black" style={{ color: BT_COLORS[bt] }}>{bt}</span>
                <span className="text-gray-500">WB mentah:</span>
                <span className="font-bold text-gray-700">{dcStocks[bt] || 0} Kt</span>
              </div>
            ))}
          </div>

          {/* Matriks Inventori */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Golongan Darah</th>
                  {PRODUCT_TYPES.map(pt => (
                    <th key={pt.code} className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: pt.color }}>
                      {pt.code}
                      <div className="text-[10px] font-normal normal-case text-gray-400">{pt.label.split(' ').slice(0, 2).join(' ')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {BLOOD_TYPES.map(bt => (
                  <tr key={bt} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="w-10 h-10 inline-flex items-center justify-center rounded-lg font-black text-sm"
                        style={{ backgroundColor: BT_COLORS[bt] + '15', color: BT_COLORS[bt] }}>
                        {bt}
                      </span>
                    </td>
                    {PRODUCT_TYPES.map(pt => {
                      const qty = matrix[bt][pt.code]
                      return (
                        <td key={pt.code} className="px-4 py-4 text-center">
                          <span className={`text-xl font-extrabold ${qty > 0 ? '' : 'text-gray-300'}`}
                            style={qty > 0 ? { color: pt.color } : {}}>
                            {qty}
                          </span>
                          <div className="text-[10px] text-gray-400 mt-0.5">kantong</div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                  <td className="px-6 py-3 text-xs uppercase text-gray-500 font-bold tracking-wider">TOTAL</td>
                  {PRODUCT_TYPES.map(pt => {
                    const total = BLOOD_TYPES.reduce((sum, bt) => sum + matrix[bt][pt.code], 0)
                    return (
                      <td key={pt.code} className="px-4 py-3 text-center font-black" style={{ color: pt.color }}>
                        {total} <span className="text-xs font-normal text-gray-400">Kt</span>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Tambah Inventori */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-purple-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                Tambah Inventori Pengolahan
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Golongan darah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Golongan Darah</label>
                <div className="flex gap-2">
                  {BLOOD_TYPES.map(bt => (
                    <button key={bt} onClick={() => setForm(f => ({ ...f, bloodType: bt }))}
                      className={`flex-1 py-2 rounded-xl border-2 font-black text-sm transition-all ${
                        form.bloodType === bt ? 'border-current' : 'border-gray-200 text-gray-400'
                      }`}
                      style={form.bloodType === bt ? { color: BT_COLORS[bt], backgroundColor: BT_COLORS[bt] + '10' } : {}}
                    >{bt}</button>
                  ))}
                </div>
              </div>

              {/* Tipe produk */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Produk</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_TYPES.map(pt => (
                    <button key={pt.code} onClick={() => setForm(f => ({ ...f, productType: pt.code as PT }))}
                      className={`py-2.5 px-3 rounded-xl border-2 font-bold text-sm text-left transition-all ${
                        form.productType === pt.code ? 'border-current' : 'border-gray-200 text-gray-400'
                      }`}
                      style={form.productType === pt.code ? { color: pt.color, backgroundColor: pt.bg, borderColor: pt.color } : {}}
                    >
                      <div className="font-black">{pt.code}</div>
                      <div className="text-[10px] font-normal mt-0.5 leading-tight opacity-80">{pt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info stok mentah jika produk olahan */}
              {isProcessed && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                  availableWB < form.quantity ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    Stok WB mentah {form.bloodType} tersedia: <strong>{availableWB} kantong</strong>.
                    {availableWB < form.quantity && <div className="font-bold mt-0.5">⚠️ Tidak cukup! Minta pengambilan dari UDD terlebih dahulu.</div>}
                    {form.productType !== 'WB' && availableWB >= form.quantity && (
                      <div className="mt-0.5">Penambahan ini akan mengurangi stok WB mentah sebesar <strong>{form.quantity} kantong</strong>.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Jumlah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Kantong</label>
                <input
                  type="number" min={1} value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none h-16"
                  placeholder="Keterangan batch / pengolahan..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleAdd} disabled={saving || !canSave}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-colors">
                  {saving ? 'Menyimpan...' : 'Simpan Inventori'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
