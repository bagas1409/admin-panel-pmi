import React, { useEffect, useState } from 'react';
import { wilayahService, Province, Regency, District, Village } from '@/api/wilayah';

interface LocationPickerProps {
    onChange: (locations: { city: string; subdistrict: string; village: string }) => void;
    // Optional values if we ever need to pass them down, though for creation it starts blank
}

export default function LocationPicker({ onChange }: LocationPickerProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [regencies, setRegencies] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingReg, setLoadingReg] = useState(false);
    const [loadingDist, setLoadingDist] = useState(false);
    const [loadingVill, setLoadingVill] = useState(false);

    const [selectedProv, setSelectedProv] = useState<{ id: string; name: string } | null>(null);
    const [selectedReg, setSelectedReg] = useState<{ id: string; name: string } | null>(null);
    const [selectedDist, setSelectedDist] = useState<{ id: string; name: string } | null>(null);
    const [selectedVill, setSelectedVill] = useState<{ id: string; name: string } | null>(null);

    // Initial load provinces
    useEffect(() => {
        let mounted = true;
        setLoadingProv(true);
        wilayahService.getProvinces().then((data) => {
            if (mounted) {
                setProvinces(data);
                setLoadingProv(false);
            }
        });
        return () => { mounted = false; };
    }, []);

    // Effect on Province change
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        
        setSelectedProv(id ? { id, name } : null);
        setSelectedReg(null);
        setSelectedDist(null);
        setSelectedVill(null);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);

        // Inform parent about reset
        onChange({ city: '', subdistrict: '', village: '' });

        if (id) {
            setLoadingReg(true);
            wilayahService.getRegencies(id).then(data => {
                setRegencies(data);
                setLoadingReg(false);
            });
        }
    };

    // Effect on Regency/City change
    const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        
        setSelectedReg(id ? { id, name } : null);
        setSelectedDist(null);
        setSelectedVill(null);
        setDistricts([]);
        setVillages([]);

        onChange({
            city: id ? name : '',
            subdistrict: '',
            village: ''
        });

        if (id) {
            setLoadingDist(true);
            wilayahService.getDistricts(id).then(data => {
                setDistricts(data);
                setLoadingDist(false);
            });
        }
    };

    // Effect on District/Kecamatan change
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        
        setSelectedDist(id ? { id, name } : null);
        setSelectedVill(null);
        setVillages([]);

        onChange({
            city: selectedReg?.name || '',
            subdistrict: id ? name : '',
            village: ''
        });

        if (id) {
            setLoadingVill(true);
            wilayahService.getVillages(id).then(data => {
                setVillages(data);
                setLoadingVill(false);
            });
        }
    };

    // Effect on Village/Kelurahan change
    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        
        setSelectedVill(id ? { id, name } : null);

        onChange({
            city: selectedReg?.name || '',
            subdistrict: selectedDist?.name || '',
            village: id ? name : ''
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                    Provinsi (Khusus Pencarian)
                </label>
                <select
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    value={selectedProv?.id || ''}
                    onChange={handleProvinceChange}
                >
                    <option value="">{loadingProv ? 'Memuat Provinsi...' : '-- Pilih Provinsi --'}</option>
                    {provinces.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">Kabupaten / Kota</label>
                    <select
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={selectedReg?.id || ''}
                        onChange={handleRegencyChange}
                        disabled={!selectedProv || regencies.length === 0}
                    >
                        <option value="">{loadingReg ? 'Memuat Kab/Kota...' : '-- Pilih Kab/Kota --'}</option>
                        {regencies.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">Kecamatan</label>
                    <select
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={selectedDist?.id || ''}
                        onChange={handleDistrictChange}
                        disabled={!selectedReg || districts.length === 0}
                    >
                        <option value="">{loadingDist ? 'Memuat Kecamatan...' : '-- Pilih Kecamatan --'}</option>
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">Kelurahan / Desa</label>
                <select
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={selectedVill?.id || ''}
                    onChange={handleVillageChange}
                    disabled={!selectedDist || villages.length === 0}
                >
                    <option value="">{loadingVill ? 'Memuat Kelurahan...' : '-- Pilih Kelurahan --'}</option>
                    {villages.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
