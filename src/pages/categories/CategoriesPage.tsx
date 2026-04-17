import { useState, useEffect } from 'react';
import { Layers, Plus, Pencil, Trash, X, Upload } from 'lucide-react';
import { categoryService, Category } from '@/api/category';
import api from '@/api/axios';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [iconFile, setIconFile] = useState<File | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (parentId) formData.append('parentId', parentId);
        if (iconFile) formData.append('icon', iconFile);

        try {
            if (isEditing && currentId) {
                await categoryService.update(currentId, formData);
            } else {
                await categoryService.create(formData);
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            console.error("Failed to save category", error);
            alert("Gagal menyimpan kategori");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await categoryService.delete(id);
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Gagal menghapus kategori");
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setName('');
        setParentId('');
        setIconFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setIsEditing(true);
        setCurrentId(cat.id);
        setName(cat.name);
        setParentId(cat.parentId?.toString() || '');
        setIconFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentId(null);
    };

    const getParentName = (pid: number | null) => {
        if (!pid) return '-';
        return categories.find(c => c.id === pid)?.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">Categories</h1>
                    <p className="text-[var(--text-muted)]">Manage product categories</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Icon</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Slug</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Parent</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-[var(--text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-[var(--background)]/50">
                                    <td className="px-6 py-4">
                                        {cat.icon ? (
                                            <img
                                                src={cat.icon.startsWith('http') ? cat.icon : `${api.defaults.baseURL}${cat.icon}`}
                                                alt={cat.name}
                                                className="w-10 h-10 object-cover rounded-md bg-gray-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text)] font-medium">{cat.name}</td>
                                    <td className="px-6 py-4 text-[var(--text-muted)]">{cat.slug}</td>
                                    <td className="px-6 py-4 text-[var(--text-muted)]">{getParentName(cat.parentId)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(cat)}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[var(--text-muted)]">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-[var(--card-bg)] rounded-xl w-full max-w-md shadow-lg border border-[var(--border)]">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
                            <h2 className="text-xl font-bold text-[var(--text)]">
                                {isEditing ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={closeModal} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="e.g. Electronics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-1">Parent Category</label>
                                <select
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                >
                                    <option value="">None (Top Level)</option>
                                    {categories
                                        .filter(c => c.id !== currentId) // Prevent selecting self as parent
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-1">Icon</label>
                                <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer hover:bg-[var(--background)] transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
                                        <Upload className="w-6 h-6" />
                                        <span className="text-sm">
                                            {iconFile ? iconFile.name : "Click to upload icon"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--background)] rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:opacity-90"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
