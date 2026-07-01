import React, { useState } from 'react';
import { Package, Plus, Search, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';

const FinanceInventory = () => {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState([
        { id: 1, name: 'Arroz 5kg', category: 'Cereais', quantity: 10, unit: 'pacotes', minQuantity: 3 },
        { id: 2, name: 'Feijão Carioca 1kg', category: 'Cereais', quantity: 2, unit: 'pacotes', minQuantity: 5 },
        { id: 3, name: 'Óleo de Soja 900ml', category: 'Diversos', quantity: 15, unit: 'garrafas', minQuantity: 5 },
        { id: 4, name: 'Macarrão Espaguete', category: 'Massas', quantity: 8, unit: 'pacotes', minQuantity: 4 },
        { id: 5, name: 'Molho de Tomate', category: 'Diversos', quantity: 12, unit: 'sachês', minQuantity: 10 }
    ]);

    const handleAddQuantity = (id: number) => {
        const qty = parseInt(prompt('Quantidade para ADICIONAR:') || '0');
        if (qty > 0) {
            setItems(items.map(item => item.id === id ? { ...item, quantity: item.quantity + qty } : item));
        }
    };

    const handleRemoveQuantity = (id: number) => {
        const qty = parseInt(prompt('Quantidade para RETIRAR:') || '0');
        if (qty > 0) {
            setItems(items.map(item => {
                if (item.id === id) {
                    const newQty = Math.max(0, item.quantity - qty);
                    return { ...item, quantity: newQty };
                }
                return item;
            }));
        }
    };

    const handleAddNewItem = () => {
        const name = prompt('Nome do novo item:');
        if (name) {
            setItems([...items, { id: Date.now(), name, category: 'Geral', quantity: 0, unit: 'unidades', minQuantity: 0 }]);
        }
    };

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="finance-page p-4 md:p-10 pb-20 md:pb-20 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Package className="text-primary-color" size={32} /> Controle de Estoque
                    </h1>
                    <p className="text-white/60">Controle de entrada e saída de insumos (Cozinha).</p>
                </div>
            </header>

            <div className="glass-card-rh p-6 md:p-8 rounded-3xl mb-8 border border-white/10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar item..." 
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary-color transition-colors"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAddNewItem}
                        style={{ background: "var(--primary-color)", color: "black" }} 
                        className="border-none rounded-xl px-6 py-3 font-black text-sm cursor-pointer flex items-center gap-2 hover:opacity-90 w-full md:w-auto justify-center"
                    >
                        <Plus size={18} /> Novo Item
                    </button>
                </div>

                <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 text-xs text-white/50 uppercase tracking-widest">
                                <th className="p-4 font-bold">Item</th>
                                <th className="p-4 font-bold">Categoria</th>
                                <th className="p-4 font-bold text-center">Em Estoque</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => {
                                const isLowStock = item.quantity <= item.minQuantity;
                                return (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-base">{item.name}</div>
                                            <div className="text-xs text-white/40">Unidade de medida: {item.unit}</div>
                                        </td>
                                        <td className="p-4 text-white/60 font-medium">{item.category}</td>
                                        <td className="p-4 text-center">
                                            <div className="text-2xl font-black text-white">{item.quantity}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {isLowStock ? (
                                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 uppercase tracking-widest">Estoque Baixo</span>
                                            ) : (
                                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 uppercase tracking-widest">Normal</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleRemoveQuantity(item.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 border border-red-500/20 transition-all tooltip-trigger" title="Registrar Saída">
                                                    <ArrowDownRight size={18} />
                                                </button>
                                                <button onClick={() => handleAddQuantity(item.id)} className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 border border-green-500/20 transition-all tooltip-trigger" title="Registrar Entrada">
                                                    <ArrowUpRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40 font-medium">Nenhum item encontrado no estoque.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceInventory;
