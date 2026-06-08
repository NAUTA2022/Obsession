import { useState, useEffect, useCallback } from 'react';
import { icons } from '../config/icons';
import { Button, CardProducts } from '../components/ui';
import { productsServiceExtended, Product as ApiProduct } from '../services/api/products.service';
import { touchAppService, type TouchAppProduct } from '../services/api/touchapp.service';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/products/ProductForm';
import ProductDetailDrawer from '../components/products/ProductDetailDrawer';
import { useAuthStore } from '../store/auth';

export const ProductsPage = () => {
    const [activeTab, setActiveTab] = useState('Todos');
    const username = useAuthStore((s) => s.user?.username ?? '');
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [touchAppProducts, setTouchAppProducts] = useState<TouchAppProduct[]>([]);
    const [touchAppError, setTouchAppError] = useState<'expired' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
    const [drawerProduct, setDrawerProduct] = useState<ApiProduct | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await productsServiceExtended.getMyProducts();
            if (response.success && response.data) {
                setProducts(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar productos');
        } finally {
            setIsLoading(false);
        }

        try {
            const tpProducts = await touchAppService.getTouchAppProducts();
            setTouchAppProducts(tpProducts);
        } catch (err: any) {
            if (err?.response?.status === 401 || err?.status === 401) {
                setTouchAppError('expired');
            }
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filteredProducts = () => {
        const allProducts = [...products, ...touchAppProducts];
        switch (activeTab) {
            case 'Servicios': return allProducts.filter(p => p.type === 'service');
            case 'Productos':  return allProducts.filter(p => p.type === 'single' || p.type === 'package');
            default:           return allProducts;
        }
    };

    const handleAddProduct = () => { setSelectedProduct(null); setIsModalOpen(true); };

    const handleEditProduct = (product: ApiProduct) => {
        setDrawerProduct(null);
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCardClick = (productId: string) => {
        const product = products.find(p => p.id === productId)
            ?? (touchAppProducts.find(p => p.id === productId) as unknown as ApiProduct);
        if (product) setDrawerProduct(product);
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6850E8]/20 border-t-[#6850E8] mx-auto mb-4" />
                    <p className="text-sm text-gray-400 dark:text-white/30">Cargando productos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center py-24 text-red-500 text-sm">{error}</div>;
    }

    return (
        <div className="w-full flex flex-col gap-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
                    <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">
                        {filteredProducts().length} producto{filteredProducts().length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={handleAddProduct}
                    className="bg-[#6850E8] hover:bg-[#5940d8] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center text-sm font-semibold transition-colors shadow-sm shadow-[#6850E8]/20"
                >
                    <icons.plus className="h-4 w-4" />
                    <span>Añadir producto</span>
                </Button>
            </div>

            {touchAppError === 'expired' && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-200 dark:border-amber-500/20 p-3.5 text-sm text-amber-700 dark:text-amber-400">
                    Tu vinculación con TouchApp expiró. Ve a tu <a href="/perfil" className="underline font-medium">perfil</a> para vincular de nuevo.
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] w-fit">
                {['Todos', 'Servicios', 'Productos'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab
                                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {products.length === 0 && touchAppProducts.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#111118]">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                        <icons.shoppingBasket className="w-7 h-7 text-gray-300 dark:text-white/20" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-white/40 mb-1">Sin productos aún</p>
                    <p className="text-xs text-gray-400 dark:text-white/25 mb-5">Crea tu primer producto para empezar a vender.</p>
                    <Button
                        onClick={handleAddProduct}
                        className="bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold px-5 py-2 rounded-xl inline-flex items-center gap-2 transition-colors"
                    >
                        <icons.plus className="h-4 w-4" />
                        Crear producto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredProducts().map((product) => (
                        <CardProducts
                            key={product.id}
                            productImage={product.thumbnailUrl}
                            title={product.title}
                            description={product.description}
                            price={product.price}
                            type={product.type === 'service' ? 'Servicio' : product.type === 'package' ? 'Paquete' : 'Producto'}
                            photoCount={(product as ApiProduct).photoCount}
                            videoCount={(product as ApiProduct).videoCount}
                            onEdit={product.source === 'touchapp' ? undefined : () => handleEditProduct(product as ApiProduct)}
                            badge={product.source === 'touchapp' ? 'Touch' : undefined}
                            productLink={`${window.location.origin}/p/${username}/product/${product.id}`}
                            onClick={() => handleCardClick(product.id)}
                        />
                    ))}
                </div>
            )}

            {/* Edit modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}>
                <ProductForm
                    product={selectedProduct || undefined}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setIsModalOpen(false); setSelectedProduct(null); }}
                />
            </Modal>

            {/* Detail drawer */}
            <ProductDetailDrawer
                product={drawerProduct}
                username={username}
                onClose={() => setDrawerProduct(null)}
                onEdit={drawerProduct?.source === 'touchapp' ? undefined : handleEditProduct}
            />
        </div>
    );
};

export default ProductsPage;
