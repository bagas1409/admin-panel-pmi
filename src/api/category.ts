import api from './axios';

export interface Category {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    icon: string | null;
}

export const categoryService = {
    getAll: async () => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },
    create: async (formData: FormData) => {
        const response = await api.post<Category>('/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    update: async (id: number, formData: FormData) => {
        const response = await api.put<Category>(`/categories/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};
